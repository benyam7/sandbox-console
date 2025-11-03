import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/dashboard';
import ApiKeys from './pages/api-keys';
import Usage from './pages/usage';
import Docs from './pages/docs';
import SignIn from './pages/sign-in';
import MainLayout from './components/layout/main-layout';
import ProtectedRoute from './components/auth/protected-route';
import { AuthProvider } from './contexts/auth-context';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={
                        <ProtectedRoute>
                            <MainLayout />
                        </ProtectedRoute>
                    }>
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="api-keys" element={<ApiKeys />} />
                        <Route path="usage" element={<Usage />} />
                        <Route path="docs" element={<Docs />} />
                    </Route>

                    <Route path="sign-in" element={<SignIn />} />
                    <Route
                        path="*"
                        element={
                            <div className="text-center text-2xl font-bold flex items-center justify-center h-screen">
                                404 Not Found
                            </div>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
