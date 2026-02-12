import { Navigate, Route, Routes } from 'react-router-dom';
import { AboutPage } from './modules/about/AboutPage';
import { ProtectedRoute, PublicOnlyRoute } from './modules/auth/components/AuthGuards';
import { LoginPage } from './modules/auth/LoginPage';
import { SignupPage } from './modules/auth/SignupPage';
import { WhyPage } from './modules/why/WhyPage';
import { WorkDetailPage } from './modules/works/WorkDetailPage';
import { WorksPage } from './modules/works/WorksPage';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/auth" element={<Navigate to="/auth/login" replace />} />
      <Route element={<PublicOnlyRoute />}>
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/signup" element={<SignupPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="/works" element={<WorksPage />} />
        <Route path="/works/:workId" element={<WorkDetailPage />} />
      </Route>
      <Route path="/why" element={<WhyPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="*" element={<Navigate to="/auth/login" replace />} />
    </Routes>
  );
}
