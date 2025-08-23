import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import WorksPage from './pages/WorksPage';
import MangaPage from './pages/MangaPage';
import IllustrationsPage from './pages/IllustrationsPage';
import MangaRankingPage from './pages/MangaRankingPage';
import IllustrationRankingPage from './pages/IllustrationRankingPage';
import ContestsPage from './pages/ContestsPage';
import ContestDetailPage from './pages/ContestDetailPage';
import DirectRequestsPage from './pages/DirectRequestsPage';
import MyPage from './pages/MyPage';
import R18Page from './pages/R18Page';
import UploadPage from './pages/UploadPage';
import WorkDetailPage from './pages/WorkDetailPage';
import UserProfilePage from './pages/UserProfilePage';
import LoginModal from './components/LoginModal';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header onLoginClick={() => setShowLoginModal(true)} />
          <main className="pt-32">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/manga" element={<MangaPage />} />
              <Route path="/illustrations" element={<IllustrationsPage />} />
              <Route path="/manga-ranking" element={<MangaRankingPage />} />
              <Route path="/illustration-ranking" element={<IllustrationRankingPage />} />
              <Route path="/direct-requests" element={<DirectRequestsPage />} />
              <Route path="/works" element={<WorksPage />} />
              <Route path="/works/:id" element={<WorkDetailPage />} />
              <Route path="/contests" element={<ContestsPage />} />
              <Route path="/contests/:id" element={<ContestDetailPage />} />
              <Route path="/mypage" element={<MyPage />} />
              <Route path="/r18" element={<R18Page />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/user/:id" element={<UserProfilePage />} />
            </Routes>
          </main>
          {showLoginModal && (
            <LoginModal onClose={() => setShowLoginModal(false)} />
          )}
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;