import CryptoJS from 'crypto-js';
import {
    APIKeySchema,
    EncryptedAPIKeySchema,
    CreateKeyInputSchema,
    KeyOperationInputSchema,
    UserIdInputSchema,
    type APIKey,
    type EncryptedAPIKey,
    type CreateKeyInput,
    type KeyOperationInput,
} from './schemas';

const API_KEYS_STORAGE_KEY = 'zama_api_keys';
const ENCRYPTION_SECRET = import.meta.env.VITE_ENCRYPTION_SECRET || '';

// Derive a user-specific encryption key
function deriveEncryptionKey(userId: string): string {
    return CryptoJS.SHA256(`${ENCRYPTION_SECRET}_${userId}`).toString();
}

// Ecrypt using AES
function encryptKey(plainText: string, userId: string): string {
    try {
        const key = deriveEncryptionKey(userId);
        const encrypted = CryptoJS.AES.encrypt(plainText, key).toString();
        return encrypted;
    } catch (error) {
        console.error('Encryption failed:', error);
        throw new Error('Failed to encrypt API key');
    }
}

// Decrypt using AES
function decryptKey(encryptedText: string, userId: string): string {
    try {
        const key = deriveEncryptionKey(userId);
        const decrypted = CryptoJS.AES.decrypt(encryptedText, key);
        const plainText = decrypted.toString(CryptoJS.enc.Utf8);

        if (!plainText) {
            throw new Error('Decryption resulted in empty string');
        }

        return plainText;
    } catch (error) {
        console.error('Decryption failed:', error);
        throw new Error('Failed to decrypt API key');
    }
}

// Mask API key for display
function maskAPIKey(key: string): string {
    if (key.length <= 8) return '****';
    return `${key.slice(0, 4)}${'*'.repeat(key.length - 8)}${key.slice(-4)}`;
}

// Generate a unique, cryptographically random API key
function generateAPIKey(): string {
    const randomPart = CryptoJS.lib.WordArray.random(16).toString();
    return `zk_${randomPart}`;
}

// Service for managing API keys with encryption and type safety
export const APIKeyService = {
    // Get all encrypted keys from storage and validates them
    _getEncryptedKeys(): EncryptedAPIKey[] {
        if (typeof window === 'undefined') return [];

        const stored = localStorage.getItem(API_KEYS_STORAGE_KEY);
        if (!stored) return [];

        try {
            const parsed = JSON.parse(stored);
            if (!Array.isArray(parsed)) {
                console.error('Invalid storage format: not an array');
                return [];
            }

            // Validate each key against schema
            return parsed
                .map((item) => {
                    try {
                        return EncryptedAPIKeySchema.parse(item);
                    } catch (error) {
                        console.error(
                            'Invalid encrypted key in storage:',
                            error
                        );
                        return null;
                    }
                })
                .filter((item): item is EncryptedAPIKey => item !== null);
        } catch (error) {
            console.error('Failed to parse encrypted keys:', error);
            return [];
        }
    },

    // Save encrypted keys to storage
    _saveEncryptedKeys(keys: EncryptedAPIKey[]): void {
        if (typeof window === 'undefined') return;

        try {
            // Validate all keys before saving
            const validatedKeys = keys.map((key) =>
                EncryptedAPIKeySchema.parse(key)
            );
            localStorage.setItem(
                API_KEYS_STORAGE_KEY,
                JSON.stringify(validatedKeys)
            );
        } catch (error) {
            console.error('Failed to save encrypted keys:', error);
            throw new Error('Failed to save API keys');
        }
    },

    // Get all API keys for a user (decrypted)
    getAllKeys(userId: string): APIKey[] {
        // Validate input
        const validated = UserIdInputSchema.parse({ userId });

        const encryptedKeys = this._getEncryptedKeys();
        const userKeys = encryptedKeys.filter(
            (k) => k.userId === validated.userId
        );

        const decryptedKeys: APIKey[] = [];

        for (const encKey of userKeys) {
            try {
                const decryptedKey: APIKey = {
                    id: encKey.id,
                    name: encKey.name,
                    key: decryptKey(encKey.encryptedKey, validated.userId),
                    maskedKey: encKey.maskedKey,
                    status: encKey.status,
                    createdAt: new Date(encKey.createdAt),
                    lastUsedAt: encKey.lastUsedAt
                        ? new Date(encKey.lastUsedAt)
                        : null,
                    userId: encKey.userId,
                };

                // Validate decrypted key
                const validatedKey = APIKeySchema.parse(decryptedKey);
                decryptedKeys.push(validatedKey);
            } catch (error) {
                console.error(`Failed to decrypt key ${encKey.id}:`, error);
                // Skip invalid keys instead of failing completely
            }
        }

        return decryptedKeys;
    },

    // Create a new API key
    createKey(input: CreateKeyInput): APIKey {
        // Validate input
        const validated = CreateKeyInputSchema.parse(input);

        const newKey = generateAPIKey();
        const maskedKey = maskAPIKey(newKey);

        const apiKey: APIKey = {
            id: `key_${Date.now()}_${Math.random()
                .toString(36)
                .substring(2, 9)}`,
            name: validated.name,
            key: newKey,
            maskedKey,
            status: 'active',
            createdAt: new Date(),
            lastUsedAt: null,
            userId: validated.userId,
        };

        // Validate the created key
        const validatedKey = APIKeySchema.parse(apiKey);

        // Store encrypted
        if (typeof window !== 'undefined') {
            const existingEncrypted = this._getEncryptedKeys();

            const newEncryptedKey: EncryptedAPIKey = {
                id: validatedKey.id,
                name: validatedKey.name,
                encryptedKey: encryptKey(newKey, validated.userId),
                maskedKey: validatedKey.maskedKey,
                status: validatedKey.status,
                createdAt: validatedKey.createdAt.toISOString(),
                lastUsedAt: null,
                userId: validatedKey.userId,
            };

            // Validate encrypted key before saving
            const validatedEncryptedKey =
                EncryptedAPIKeySchema.parse(newEncryptedKey);

            existingEncrypted.push(validatedEncryptedKey);
            this._saveEncryptedKeys(existingEncrypted);
        }

        return validatedKey;
    },

    // Revoke an API key (marks as revoked)
    revokeKey(input: KeyOperationInput): void {
        if (typeof window === 'undefined') return;

        // Validate input
        const validated = KeyOperationInputSchema.parse(input);

        const keys = this._getEncryptedKeys();
        const updatedKeys = keys.map((k) =>
            k.id === validated.keyId && k.userId === validated.userId
                ? { ...k, status: 'revoked' as const }
                : k
        );

        this._saveEncryptedKeys(updatedKeys);
    },

    // Regenerate an API key (revokes old, creates new with same name)
    regenerateKey(input: KeyOperationInput): APIKey {
        // Validate input
        const validated = KeyOperationInputSchema.parse(input);

        const currentKeys = this.getAllKeys(validated.userId);
        const keyToRegenerate = currentKeys.find(
            (k) => k.id === validated.keyId
        );

        if (!keyToRegenerate) {
            throw new Error('API key not found');
        }

        // Revoke old key
        this.revokeKey(validated);

        // Create new key with same name
        return this.createKey({
            name: keyToRegenerate.name,
            userId: validated.userId,
        });
    },

    // Permanently delete an API key
    deleteKey(input: KeyOperationInput): void {
        if (typeof window === 'undefined') return;

        // Validate input
        const validated = KeyOperationInputSchema.parse(input);

        const keys = this._getEncryptedKeys();
        const filteredKeys = keys.filter(
            (k) => !(k.id === validated.keyId && k.userId === validated.userId)
        );

        this._saveEncryptedKeys(filteredKeys);
    },
};
