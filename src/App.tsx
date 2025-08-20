import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import MangaPage from './pages/MangaPage';
import IllustrationsPage from './pages/IllustrationsPage';
import RankingPage from './pages/RankingPage';
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
  const [activeContentType, setActiveContentType] = useState<'manga' | 'illustration'>('manga');
  const [activeSection, setActiveSection] = useState<'home' | 'requests' | 'ranking'>('home');

  const renderMainContent = () => {
    if (activeContentType === 'manga') {
      switch (activeSection) {
        case 'home':
          return <MangaPage />;
        case 'requests':
          return <DirectRequestsPage contentType="manga" />;
        case 'ranking':
          return <RankingPage contentType="manga" />;
        default:
          return <MangaPage />;
      }
    } else {
      switch (activeSection) {
        case 'home':
          return <IllustrationsPage />;
        case 'requests':
          return <DirectRequestsPage contentType="illustration" />;
        case 'ranking':
          return <RankingPage contentType="illustration" />;
        default:
          return <IllustrationsPage />;
      }
    }
  };

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header 
            onLoginClick={() => setShowLoginModal(true)}
            activeContentType={activeContentType}
            onContentTypeChange={setActiveContentType}
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />
          <main className="pt-24">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/main" element={renderMainContent()} />
              <Route path="/main" element={renderMainContent()} />
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