import { BrowserRouter, Routes, Route, Outlet, Link } from 'react-router-dom';
import Dashboard from './pages/dashboard';
import ApiKeys from './pages/api-keys';
import Usage from './pages/usage';
import Docs from './pages/docs';
import SignIn from './pages/sign-in';

const Layout = () => (
    <div>
        <header style={{ padding: '1rem', background: '#f0f0f0' }}>
            <h1>Sandbox Console</h1>
            <nav>
                <Link to="/dashboard">Dashboard</Link> |{' '}
                <Link to="/api-keys">API Keys</Link> |{' '}
                <Link to="/usage">Usage</Link> | <Link to="/docs">Docs</Link> |{' '}
                <Link to="/sign-in">Sign In</Link>
            </nav>
        </header>
        <main style={{ padding: '1rem' }}>
            <Outlet />
        </main>
    </div>
);

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="api-keys" element={<ApiKeys />} />
                    <Route path="usage" element={<Usage />} />
                    <Route path="docs" element={<Docs />} />
                    <Route path="sign-in" element={<SignIn />} />
                    <Route path="*" element={<div>404 Not Found</div>} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
