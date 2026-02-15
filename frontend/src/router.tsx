import { Navigate, Route, Routes } from 'react-router-dom';
import { Header } from './components/header';
import { AboutPage } from './modules/about/AboutPage';
import { AccountPage } from './modules/account/AccountPage';
import { ProtectedRoute, PublicOnlyRoute } from './modules/auth/components/AuthGuards';
import { LoginPage } from './modules/auth/LoginPage';
import { SignupPage } from './modules/auth/SignupPage';
import { HomePage } from './modules/home/HomePage';
import { WorkDetailPage } from './modules/works/WorkDetailPage';
import { WorkspacePage } from './modules/works/WorkspacePage';

export function AppRouter() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/auth" element={<Navigate to="/auth/login" replace />} />
        <Route element={<PublicOnlyRoute />}>
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/signup" element={<SignupPage />} />
        </Route>
        {/* Public routes */}
        <Route path="/home" element={<HomePage />} />
        <Route path="/workspace" element={<WorkspacePage />} />
        <Route path="/works/:workId" element={<WorkDetailPage />} />
        <Route path="/about" element={<AboutPage />} />
        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/account" element={<AccountPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </>
  );
}
