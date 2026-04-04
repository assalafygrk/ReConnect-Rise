import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';

// Lazy load all pages
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ContributionsPage = lazy(() => import('./pages/ContributionsPage'));
const MembersPage = lazy(() => import('./pages/MembersPage'));
const MemberProfilePage = lazy(() => import('./pages/MemberProfilePage'));
const DisbursementsPage = lazy(() => import('./pages/DisbursementsPage'));
const LoansPage = lazy(() => import('./pages/LoansPage'));
const RequestsPage = lazy(() => import('./pages/RequestsPage'));
const VotesPage = lazy(() => import('./pages/VotesPage'));
const MeetingsPage = lazy(() => import('./pages/MeetingsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const WalletPage = lazy(() => import('./pages/WalletPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const DocumentaryPage = lazy(() => import('./pages/DocumentaryPage'));
const AdviceRoomPage = lazy(() => import('./pages/AdviceRoomPage'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <svg className="animate-spin h-8 w-8" viewBox="0 0 24 24" fill="none" style={{ color: '#E8820C' }}>
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
    </div>
  );
}

function PageGuard({ children, id }) {
  const { isPageEnabled } = useAuth();
  if (!isPageEnabled(id)) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                fontFamily: "'DM Sans', sans-serif",
                borderRadius: '12px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
              },
              success: { iconTheme: { primary: '#15803D', secondary: '#fff' } },
              error: { iconTheme: { primary: '#B91C1C', secondary: '#fff' } },
            }}
          />

          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Protected — inside layout */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/contributions" element={
                  <PageGuard id="contributions">
                    <ContributionsPage />
                  </PageGuard>
                } />
                <Route path="/members" element={
                  <PageGuard id="members">
                    <MembersPage />
                  </PageGuard>
                } />
                <Route path="/members/:id" element={
                  <PageGuard id="members">
                    <MemberProfilePage />
                  </PageGuard>
                } />
                <Route path="/disbursements" element={
                  <PageGuard id="disbursements">
                    <DisbursementsPage />
                  </PageGuard>
                } />
                <Route path="/wallet" element={
                  <PageGuard id="wallet">
                    <WalletPage />
                  </PageGuard>
                } />

                {/* Treasurer + Leader only */}
                <Route path="/loans" element={
                  <ProtectedRoute roles={['treasurer', 'group_leader', 'official_member']}>
                    <PageGuard id="loans">
                      <LoansPage />
                    </PageGuard>
                  </ProtectedRoute>
                } />

                <Route path="/requests" element={
                  <PageGuard id="requests">
                    <RequestsPage />
                  </PageGuard>
                } />
                <Route path="/votes" element={
                  <PageGuard id="votes">
                    <VotesPage />
                  </PageGuard>
                } />
                <Route path="/meetings" element={
                  <PageGuard id="meetings">
                    <MeetingsPage />
                  </PageGuard>
                } />
                <Route path="/chat" element={
                  <PageGuard id="chat">
                    <ChatPage />
                  </PageGuard>
                } />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/documentary" element={
                  <PageGuard id="documentary">
                    <DocumentaryPage />
                  </PageGuard>
                } />
                <Route path="/advice" element={
                  <PageGuard id="advice">
                    <AdviceRoomPage />
                  </PageGuard>
                } />

                {/* Admin, Treasurer, Leader */}
                <Route path="/settings" element={
                  <ProtectedRoute roles={['admin', 'treasurer', 'group_leader']}>
                    <PageGuard id="settings">
                      <SettingsPage />
                    </PageGuard>
                  </ProtectedRoute>
                } />
              </Route>

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
