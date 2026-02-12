import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/AppShell'
import FeedbackPage from './pages/FeedbackPage'
import OverviewPage from './pages/OverviewPage'
import VersionsPage from './pages/VersionsPage'
import WorkbenchPage from './pages/WorkbenchPage'

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/workbench" element={<WorkbenchPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/versions" element={<VersionsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  )
}
