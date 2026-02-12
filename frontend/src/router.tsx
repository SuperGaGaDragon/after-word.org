import { Navigate, Route, Routes } from 'react-router-dom';
import { Header } from './components/header';
import { AboutPage } from './modules/about/AboutPage';
import { AccountPage } from './modules/account/AccountPage';
import { ProtectedRoute, PublicOnlyRoute } from './modules/auth/components/AuthGuards';
import { LoginPage } from './modules/auth/LoginPage';
import { SignupPage } from './modules/auth/SignupPage';
import { HomePage } from './modules/home/HomePage';
import { WhyPage } from './modules/why/WhyPage';
import { WorkDetailPage } from './modules/works/WorkDetailPage';
import { WorksPage } from './modules/works/WorksPage';

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
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/works" element={<WorksPage />} />
          <Route path="/works/:workId" element={<WorkDetailPage />} />
          <Route path="/account" element={<AccountPage />} />
        </Route>
        <Route path="/why" element={<WhyPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<Navigate to="/auth/login" replace />} />
      </Routes>
    </>
  );
}
