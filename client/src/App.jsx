import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CollectionPage from './pages/CollectionPage';
import AddQuotePage from './pages/AddQuotePage';
import AdminPage from './pages/AdminPage';
import DiscoverPage from './pages/DiscoverPage';
import NavBar, { BottomTabBar } from './components/NavBar';
import { ShareModal } from './components/ShareModal';
import { SettingsModal } from './components/SettingsModal';
import { FeedbackButton } from './components/FeedbackButton';
import { FeedbackModal } from './components/FeedbackModal';
import { useStreak } from './hooks/useStreak';
import { useTheme } from './hooks/useTheme';

const API_URL = import.meta.env.VITE_API_URL;

function ProtectedRoute({ user, loading, adminOnly, children }) {
  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;
  if (adminOnly && !user.isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}

function Layout({ user, streak, weekDays, onSettings, onLogout, onFeedback, children }) {
  const location = useLocation();
  const showNav = location.pathname !== '/';
  return (
    <>
      {showNav && <NavBar user={user} streak={streak} weekDays={weekDays} onSettings={onSettings} onLogout={onLogout} />}
      {children}
      {showNav && <BottomTabBar />}
      {showNav && user && <FeedbackButton onClick={onFeedback} />}
    </>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shareQuote, setShareQuote] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const { streak, weekDays } = useStreak(user);
  const { theme, setTheme } = useTheme(user);
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

  const handleLogout = async () => {
    await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
    setUser(null);
  };

  return (
    <BrowserRouter>
      <Layout user={user} streak={streak} weekDays={weekDays} onSettings={() => setSettingsOpen(true)} onLogout={handleLogout} onFeedback={() => setFeedbackOpen(true)}>
        <Routes>
          <Route path="/" element={(!loading && user) ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
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
          <Route
            path="/discover"
            element={
              <ProtectedRoute user={user} loading={loading}>
                <DiscoverPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute user={user} loading={loading} adminOnly>
                <AdminPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Layout>
      {shareQuote && (
        <ShareModal quote={shareQuote} onClose={() => setShareQuote(null)} />
      )}
      {settingsOpen && (
        <SettingsModal theme={theme} setTheme={setTheme} onClose={() => setSettingsOpen(false)} />
      )}
      {feedbackOpen && (
        <FeedbackModal user={user} onClose={() => setFeedbackOpen(false)} />
      )}
    </BrowserRouter>
  );
}

export default App;
