import ProtectedRoute from '@/components/auth/protected-route';

const Docs = () => {
    return (
        <ProtectedRoute>
            <div>
                <h2>Docs!</h2>
            </div>
        </ProtectedRoute>
    );
};

export default Docs;
