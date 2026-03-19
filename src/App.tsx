import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { DocPage } from './pages/DocPage';

export default function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          {/* Home redirects to introduction */}
          <Route path="/" element={<DocPage />} />
          <Route path="/:docId" element={<DocPage />} />
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}
