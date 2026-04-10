import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CollectionPage from './pages/CollectionPage';
import AddQuotePage from './pages/AddQuotePage';
import NavBar from './components/NavBar';

const API_URL = import.meta.env.VITE_API_URL;

// Wraps any page that requires login.
// If the user is not authenticated, redirects to the login page.
function ProtectedRoute({ user, loading, children }) {
  if (loading) return null; // wait before deciding to redirect
  if (!user) return <Navigate to="/" replace />;
  return children;
}

// Renders the nav bar only on pages where the user is logged in
function Layout({ user, children }) {
  const location = useLocation();
  const showNav = location.pathname !== '/';
  return (
    <>
      {showNav && <NavBar user={user} />}
      {children}
    </>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load, ask the backend who is currently logged in
  useEffect(() => {
    fetch(`${API_URL}/auth/me`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <BrowserRouter>
      <Layout user={user}>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute user={user} loading={loading}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/collection"
            element={
              <ProtectedRoute user={user} loading={loading}>
                <CollectionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add"
            element={
              <ProtectedRoute user={user} loading={loading}>
                <AddQuotePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
