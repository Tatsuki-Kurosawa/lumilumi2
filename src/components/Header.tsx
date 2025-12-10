import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, User, Menu, X, PenSquare } from 'lucide-react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import NotificationDropdown from './NotificationDropdown';

interface HeaderProps {
  onLoginClick: () => void;
  onSignUpClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLoginClick, onSignUpClick }) => {
  const { user, profile, loading, signOut } = useSupabaseAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isActive = (path: string) => location.pathname === path;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };


  return (
    <header className="fixed top-0 left-0 right-0 bg-primary-500 shadow-soft z-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between h-20">
          {/* ロゴ */}
          <Link to="/" className="flex items-center space-x-3">
            <img
              src="/mangaumaretaro.jpg"
              alt="イラストーク大学 Logo"
              className="w-10 h-10 rounded-lg object-cover shadow-soft"
            />
            <span className="text-xl font-bold text-white hidden sm:block">イラストーク大学</span>
          </Link>

          {/* 検索バー */}
          <div className="flex-1 max-w-lg mx-6 hidden md:block">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="作品やユーザーを検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-5 py-3 bg-white border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400 shadow-soft text-text-primary placeholder:text-text-tertiary"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-tertiary" />
            </form>
          </div>

          {/* ナビゲーション */}
          <nav className="hidden lg:flex items-center space-x-2 xl:space-x-3">
            <Link
              to="/manga"
              className={`px-3 xl:px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                isActive('/manga')
                  ? 'text-white bg-white/20 shadow-soft'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              マンガ
            </Link>
            <Link
              to="/illustrations"
              className={`px-3 xl:px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                isActive('/illustrations')
                  ? 'text-white bg-white/20 shadow-soft'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              イラスト
            </Link>
            <Link
              to="/works"
              className={`px-3 xl:px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive('/works')
                  ? 'text-white bg-white/20 shadow-soft'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="hidden xl:inline whitespace-nowrap">作品一覧</span>
              <span className="xl:hidden whitespace-nowrap">作品</span>
            </Link>
            <span
              className="px-3 xl:px-4 py-2.5 rounded-lg text-sm font-medium text-white/50 cursor-not-allowed whitespace-nowrap"
              title="近日公開予定"
            >
              コンテスト
            </span>
            <Link
              to="/r18"
              className={`px-3 xl:px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                isActive('/r18')
                  ? 'text-white bg-white/20 shadow-soft'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              R-18
            </Link>
            <Link
              to="/about"
              className={`px-3 xl:px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                isActive('/about')
                  ? 'text-white bg-white/20 shadow-soft'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              About
            </Link>
          </nav>

          {/* 右側のボタン群 */}
          <div className="flex items-center space-x-2 lg:space-x-3">
            {/* ハンバーガーメニューボタン */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2.5 text-white hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* ユーザーメニュー */}
            {loading ? (
              <div className="hidden lg:flex items-center space-x-2 xl:space-x-3">
                {/* ローディング中のスケルトン */}
                <div className="w-24 xl:w-28 h-11 bg-white/20 rounded-lg animate-pulse"></div>
                <div className="w-20 xl:w-24 h-11 bg-white/20 rounded-lg animate-pulse"></div>
              </div>
            ) : user && profile ? (
              <div className="hidden lg:flex items-center space-x-2 xl:space-x-3">
                <Link
                  to="/upload"
                  className="flex items-center space-x-1.5 xl:space-x-2 px-3 xl:px-5 py-2.5 bg-accent-400 text-text-primary rounded-lg hover:bg-accent-500 transition-all font-semibold shadow-medium hover:shadow-card whitespace-nowrap flex-shrink-0"
                >
                  <PenSquare className="h-5 w-5 flex-shrink-0" />
                  <span className="hidden xl:inline">投稿する</span>
                  <span className="xl:hidden">投稿</span>
                </Link>
                <NotificationDropdown />
                <Link
                  to="/my-page"
                  className="flex items-center space-x-1.5 xl:space-x-2 px-3 xl:px-4 py-2.5 text-white hover:bg-white/10 rounded-lg transition-all whitespace-nowrap flex-shrink-0 min-w-0"
                >
                  <User className="h-5 w-5 flex-shrink-0" />
                  <span className="hidden xl:block font-medium truncate max-w-[120px]">{profile.display_name}</span>
                  <span className="xl:hidden font-medium truncate max-w-[80px]">{profile.display_name}</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="px-3 xl:px-4 py-2.5 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all text-sm font-medium flex-shrink-0 leading-tight min-w-[60px]"
                >
                  <span className="hidden xl:inline whitespace-nowrap">ログアウト</span>
                  <span className="xl:hidden inline-block text-center">
                    <span className="block">ログ</span>
                    <span className="block">アウト</span>
                  </span>
                </button>
              </div>
            ) : (
              <div className="hidden lg:flex items-center space-x-2 xl:space-x-3">
                <button
                  onClick={onLoginClick}
                  className="flex items-center space-x-1.5 xl:space-x-2 px-3 xl:px-5 py-2.5 bg-accent-400 text-text-primary rounded-lg hover:bg-accent-500 transition-all font-semibold shadow-medium hover:shadow-card whitespace-nowrap flex-shrink-0"
                >
                  <PenSquare className="h-5 w-5 flex-shrink-0" />
                  <span className="hidden xl:inline">投稿する</span>
                  <span className="xl:hidden">投稿</span>
                </button>
                <button
                  onClick={onLoginClick}
                  className="px-3 xl:px-5 py-2.5 text-white border border-white/30 rounded-lg hover:bg-white/10 transition-all font-medium whitespace-nowrap flex-shrink-0"
                >
                  ログイン
                </button>
                {onSignUpClick && (
                  <button
                    onClick={onSignUpClick}
                    className="px-3 xl:px-5 py-2.5 bg-white text-primary-500 rounded-lg hover:bg-white/90 transition-all font-semibold shadow-soft flex-shrink-0 leading-tight min-w-[60px]"
                  >
                    <span className="hidden xl:inline whitespace-nowrap">新規登録</span>
                    <span className="xl:hidden inline-block text-center">
                      <span className="block">新規</span>
                      <span className="block">登録</span>
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* モバイルメニュー */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-white/20 py-6">
            <div className="flex flex-col space-y-2">
              {user && profile ? (
                <Link
                  to="/upload"
                  className="flex items-center justify-center space-x-2 mx-3 px-5 py-3.5 bg-accent-400 text-text-primary rounded-lg hover:bg-accent-500 transition-all font-semibold shadow-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <PenSquare className="h-5 w-5" />
                  <span>投稿する</span>
                </Link>
              ) : (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onLoginClick();
                  }}
                  className="flex items-center justify-center space-x-2 mx-3 px-5 py-3.5 bg-accent-400 text-text-primary rounded-lg hover:bg-accent-500 transition-all font-semibold shadow-medium"
                >
                  <PenSquare className="h-5 w-5" />
                  <span>投稿する</span>
                </button>
              )}
              <Link
                to="/manga"
                className="px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                マンガ
              </Link>
              <Link
                to="/illustrations"
                className="px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                イラスト
              </Link>
              <Link
                to="/works"
                className="px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                作品一覧
              </Link>
              <span
                className="px-4 py-3 text-white/50 cursor-not-allowed rounded-lg"
                title="近日公開予定"
              >
                コンテスト
              </span>
              <Link
                to="/r18"
                className="px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                R-18
              </Link>
              <Link
                to="/about"
                className="px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>

            </div>
            {/* モバイル検索 */}
            <div className="mt-6 px-3">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="作品やユーザーを検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-5 py-3 bg-white border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400 shadow-soft text-text-primary placeholder:text-text-tertiary"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-tertiary" />
              </form>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;