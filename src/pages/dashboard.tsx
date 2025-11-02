import ProtectedRoute from '@/components/auth/protected-route';

const Dashboard = () => {
    return (
        <ProtectedRoute>
            <div>
                <h2>Dashboard!</h2>
            </div>
        </ProtectedRoute>
    );
};

export default Dashboard;
