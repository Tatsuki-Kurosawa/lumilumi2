
// スペース作りました

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import SupabaseTest from './components/SupabaseTest';
import EmailConfirmationPage from './pages/EmailConfirmationPage';
import ProfileSetupPage from './pages/ProfileSetupPage';
import SearchResultsPage from './pages/SearchResultsPage';

import AuthModals from './components/AuthModals';
import { SupabaseAuthProvider, useSupabaseAuth } from './contexts/SupabaseAuthContext';

// 認証が必要なページのラッパーコンポーネント
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useSupabaseAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function AppContent() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const { user, profile, loading } = useSupabaseAuth();

  // ログイン状態の変更を監視
  useEffect(() => {
    console.log('✅ ユーザー:', user);
    console.log('✅ ユーザーのプロフィール:', profile);
    console.log('✅ ユーザーのローディング:', loading);

    if (user && !loading) {
      console.log('✅ ユーザーがログインしました:', user.email);
      
      // プロフィールが不完全な場合の処理
      if (profile && (!profile.username || !profile.university)) {
        console.log('⚠️ プロフィールが不完全です。プロフィール設定ページにリダイレクトします。');
        // プロフィール設定ページに自動リダイレクトは ProfileSetupPage 内で処理
      }
    }
  }, [user, profile, loading]);

  // 認証状態の初期化中はローディング画面を表示（これは、useEffectの中ではなく、AppContentの中で行う必要がある）
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  const handleCloseAuthModals = () => {
    setShowSignUpModal(false);
    setShowLoginModal(false);
  };

  const handleLoginClick = () => {
    setShowSignUpModal(false);
    setShowLoginModal(true);
  };

  const handleSignUpClick = () => {
    setShowSignUpModal(true);
    setShowLoginModal(false);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header onLoginClick={handleLoginClick} onSignUpClick={handleSignUpClick} />
        <main className="pt-16">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchResultsPage />} />
            <Route path="/works" element={<WorksPage />} />
            <Route path="/manga" element={<MangaPage />} />
            <Route path="/illustrations" element={<IllustrationsPage />} />
            <Route path="/manga-ranking" element={<MangaRankingPage />} />
            <Route path="/illustration-ranking" element={<IllustrationRankingPage />} />
            <Route path="/contests" element={<ContestsPage />} />
            <Route path="/contests/:id" element={<ContestDetailPage />} />
            <Route path="/direct-requests" element={<DirectRequestsPage />} />
            <Route path="/my-page" element={<ProtectedRoute><MyPage /></ProtectedRoute>} />
            <Route path="/r18" element={<R18Page />} />
            <Route path="/upload" element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
            <Route path="/works/:id" element={<WorkDetailPage />} />
            <Route path="/user/:id" element={<UserProfilePage />} />
            <Route path="/supabase-test" element={<SupabaseTest />} />
            <Route path="/email-confirmation" element={<EmailConfirmationPage />} />
            <Route path="/profile-setup" element={<ProtectedRoute><ProfileSetupPage /></ProtectedRoute>} />
          </Routes>
        </main>
        <AuthModals 
          showLogin={showLoginModal}
          showSignUp={showSignUpModal}
          onClose={handleCloseAuthModals}
        />
      </div>
    </Router>
  );
}

function App() {
  return (
    <SupabaseAuthProvider>
      <AppContent />
    </SupabaseAuthProvider>
  );
}

export default App;