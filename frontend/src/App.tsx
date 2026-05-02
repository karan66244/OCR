import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import ResultPage from './pages/ResultPage';
import HistoryPage from './pages/HistoryPage';
import TableExtractPage from './pages/TableExtractPage';

function App() {
  const { initialize, initialized, user } = useAuthStore();

  useEffect(() => {
    console.log('Initializing auth store...');
    initialize();
  }, [initialize]);

  console.log('App render state:', { initialized, user });

  if (!initialized) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
        <Route path="/auth" element={user ? <Navigate to="/dashboard" /> : <AuthPage />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/auth" />} />
        <Route path="/table-extract" element={user ? <TableExtractPage /> : <Navigate to="/auth" />} />
        <Route path="/history" element={user ? <HistoryPage /> : <Navigate to="/auth" />} />
        {/* Result page doesn't require authentication - API handles authorization */}
        <Route path="/result/:id" element={<ResultPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
