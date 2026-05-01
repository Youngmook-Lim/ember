import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CollectionPage from './pages/CollectionPage';
import AddQuotePage from './pages/AddQuotePage';
import NavBar, { BottomTabBar } from './components/NavBar';
import { ShareModal } from './components/ShareModal';
import { SettingsModal } from './components/SettingsModal';
import { useStreak } from './hooks/useStreak';

const API_URL = import.meta.env.VITE_API_URL;

function ProtectedRoute({ user, loading, children }) {
  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;
  return children;
}

function Layout({ user, streak, weekDays, onSettings, children }) {
  const location = useLocation();
  const showNav = location.pathname !== '/';
  return (
    <>
      {showNav && <NavBar user={user} streak={streak} weekDays={weekDays} onSettings={onSettings} />}
      {children}
      {showNav && <BottomTabBar />}
    </>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shareQuote, setShareQuote] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { streak, weekDays } = useStreak(user);
  const { t } = useTranslation();

  useEffect(() => {
    document.title = t('common.appTitle');
  }, [t]);

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
      <Layout user={user} streak={streak} weekDays={weekDays} onSettings={() => setSettingsOpen(true)}>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute user={user} loading={loading}>
                <DashboardPage streak={streak} weekDays={weekDays} onShare={setShareQuote} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/collection"
            element={
              <ProtectedRoute user={user} loading={loading}>
                <CollectionPage onShare={setShareQuote} />
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
      {shareQuote && (
        <ShareModal quote={shareQuote} onClose={() => setShareQuote(null)} />
      )}
      {settingsOpen && (
        <SettingsModal onClose={() => setSettingsOpen(false)} />
      )}
    </BrowserRouter>
  );
}

export default App;
