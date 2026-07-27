import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

import Challenges from './pages/Challenges';
import CreateChallenge from './pages/CreateChallenge';
import ChallengeDetail from './pages/ChallengeDetail';
import Friends from './pages/Friends';
import ReviewDashboard from './pages/ReviewDashboard';
import AccountabilityDashboard from './pages/AccountabilityDashboard';
import ExamDashboard from './pages/exam/ExamDashboard';
import ExamSetup from './pages/exam/ExamSetup';
import ExamPlanner from './pages/exam/ExamPlanner';
import ExamAnalytics from './pages/exam/ExamAnalytics';
import FocusMode from './pages/exam/FocusMode';
import GymDashboard from './pages/GymDashboard';
import DevDashboard from './pages/DevDashboard';
import AnalyticsDashboard from './pages/AnalyticsDashboard';

import CalendarDashboard from './pages/CalendarDashboard';
import KnowledgeDashboard from './pages/KnowledgeDashboard';
import AICoachDashboard from './pages/AICoachDashboard';
import NotificationsDashboard from './pages/NotificationsDashboard';
import GoalWorkspace from './pages/GoalWorkspace';
import PartnerDashboard from './pages/PartnerDashboard';

import CommandPalette from './components/navigation/CommandPalette';
import AppShell from './components/navigation/AppShell';
import ExamShield from './components/navigation/ExamShield';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center animate-pulse">
          <span className="text-primary font-bold">L</span>
        </div>
        <p className="text-text-secondary text-sm">Loading...</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  
  return <AppShell>{children}</AppShell>;
};

function AppRoutes() {
  const { user, loading } = useContext(AuthContext);
  const [isCmdOpen, setIsCmdOpen] = React.useState(false);

  // Global keyboard shortcut for command palette
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCmdOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 rounded-lg bg-primary/20 animate-pulse" />
    </div>
  );

  return (
    <>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/challenges" element={<ProtectedRoute><Challenges /></ProtectedRoute>} />
        <Route path="/challenges/new" element={<ProtectedRoute><CreateChallenge /></ProtectedRoute>} />
        <Route path="/challenges/:id" element={<ProtectedRoute><ChallengeDetail /></ProtectedRoute>} />
        <Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
        <Route path="/friends/:friendId" element={<ProtectedRoute><PartnerDashboard /></ProtectedRoute>} />
        <Route path="/accountability" element={<ProtectedRoute><AccountabilityDashboard /></ProtectedRoute>} />
        <Route path="/reviews" element={<ProtectedRoute><ReviewDashboard /></ProtectedRoute>} />
        <Route path="/exams" element={<ProtectedRoute>{user?.is_in_exam_mode ? <ExamDashboard /> : <ExamSetup />}</ProtectedRoute>} />
        <Route path="/exams/planner" element={<ProtectedRoute><ExamPlanner /></ProtectedRoute>} />
        <Route path="/exams/analytics" element={<ProtectedRoute><ExamAnalytics /></ProtectedRoute>} />
        <Route path="/exams/focus" element={<ProtectedRoute><FocusMode /></ProtectedRoute>} />
        <Route path="/gym" element={<ProtectedRoute><GymDashboard /></ProtectedRoute>} />
        <Route path="/dev" element={<ProtectedRoute><DevDashboard /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><AnalyticsDashboard /></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute><CalendarDashboard /></ProtectedRoute>} />
        <Route path="/knowledge" element={<ProtectedRoute><KnowledgeDashboard /></ProtectedRoute>} />
        <Route path="/ai-coach" element={<ProtectedRoute><AICoachDashboard /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsDashboard /></ProtectedRoute>} />
        <Route path="/goals/workspace/:goalId" element={<ProtectedRoute><GoalWorkspace /></ProtectedRoute>} />
      </Routes>
      {user && (
        <CommandPalette isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} />
      )}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ExamShield>
          <AppRoutes />
        </ExamShield>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
