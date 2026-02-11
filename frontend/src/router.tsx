import { Navigate, Route, Routes } from 'react-router-dom';
import { AboutPage } from './modules/about/AboutPage';
import { WhyPage } from './modules/why/WhyPage';
import { WorkDetailPage } from './modules/works/WorkDetailPage';
import { WorksPage } from './modules/works/WorksPage';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/works" element={<WorksPage />} />
      <Route path="/works/:workId" element={<WorkDetailPage />} />
      <Route path="/why" element={<WhyPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="*" element={<Navigate to="/works" replace />} />
    </Routes>
  );
}
