import ProtectedRoute from '@/components/auth/protected-route';

const Usage = () => {
    return (
        <ProtectedRoute>
            <div>
                <h2>Usage!</h2>
            </div>
        </ProtectedRoute>
    );
};

export default Usage;
