import React, { useState, useEffect } from 'react';
import { AlertTriangle, Eye, EyeOff } from 'lucide-react';
import WorkCard from '../components/WorkCard';
import { PostsService } from '../lib/postsService';

const R18Page: React.FC = () => {
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(true);
  const [r18MangaWorks, setR18MangaWorks] = useState<any[]>([]);
  const [r18IllustrationWorks, setR18IllustrationWorks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAgeConfirmation = (confirmed: boolean) => {
    if (confirmed) {
      setAgeConfirmed(true);
      setShowConfirmation(false);
    } else {
      // 18歳未満の場合は前のページに戻る
      window.history.back();
    }
  };

  // R18作品を取得
  useEffect(() => {
    if (ageConfirmed && !showConfirmation) {
      fetchR18Works();
    }
  }, [ageConfirmed, showConfirmation]);

  const fetchR18Works = async () => {
    setLoading(true);
    try {
      // 漫画とイラストを並列で取得
      const [mangaResult, illustrationResult] = await Promise.all([
        PostsService.getR18PostsByType('manga', 100, 0),
        PostsService.getR18PostsByType('illustration', 100, 0)
      ]);

      if (mangaResult.error) {
        console.error('R18マンガ取得エラー:', mangaResult.error);
        setR18MangaWorks([]);
      } else {
        const formattedMangaWorks = (mangaResult.posts || []).map((post: any) => 
          PostsService.formatPostForWorkCard(post)
        );
        setR18MangaWorks(formattedMangaWorks);
      }

      if (illustrationResult.error) {
        console.error('R18イラスト取得エラー:', illustrationResult.error);
        setR18IllustrationWorks([]);
      } else {
        const formattedIllustrationWorks = (illustrationResult.posts || []).map((post: any) => 
          PostsService.formatPostForWorkCard(post)
        );
        setR18IllustrationWorks(formattedIllustrationWorks);
      }
    } catch (error) {
      console.error('R18作品取得中にエラーが発生:', error);
      setR18MangaWorks([]);
      setR18IllustrationWorks([]);
    } finally {
      setLoading(false);
    }
  };

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">年齢確認</h1>
          
          <div className="text-left bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700 mb-3">
              このページには18歳以上の方のみアクセスできるコンテンツが含まれています。
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 18歳未満の方はアクセスできません</li>
              <li>• 成人向けコンテンツが含まれます</li>
              <li>• 適切な環境でご利用ください</li>
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleAgeConfirmation(true)}
              className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              18歳以上です
            </button>
            <button
              onClick={() => handleAgeConfirmation(false)}
              className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              18歳未満です
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-6">
            このサイトを利用することで、利用規約に同意したものとみなされます。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 警告ヘッダー */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
          <div>
            <h2 className="text-lg font-semibold text-red-800">R-18コンテンツ</h2>
            <p className="text-sm text-red-700">
              このページには18歳以上の方向けのコンテンツが含まれています。適切な環境でご利用ください。
            </p>
          </div>
          <button
            onClick={() => setShowConfirmation(true)}
            className="ml-auto p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
          >
            <EyeOff className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* ページヘッダー */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">R-18作品</h1>
        <p className="text-gray-600">
          18歳以上の方向けの創作作品を掲載しています。
        </p>
      </div>

      {/* 作品一覧 */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
              <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="flex space-x-2">
                <div className="h-3 w-12 bg-gray-200 rounded"></div>
                <div className="h-3 w-16 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* マンガセクション */}
          {r18MangaWorks.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">マンガ</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {r18MangaWorks.map((work) => (
                  <div key={work.id} className="relative">
                    {/* ぼかしオーバーレイ */}
                    <div className="absolute inset-0 bg-black bg-opacity-20 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center group hover:bg-opacity-10 hover:backdrop-blur-none transition-all duration-200 cursor-pointer">
                      <div className="text-white text-center group-hover:opacity-0 transition-opacity">
                        <Eye className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm font-medium">クリックして表示</p>
                      </div>
                    </div>
                    <WorkCard work={work} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* イラストセクション */}
          {r18IllustrationWorks.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">イラスト</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {r18IllustrationWorks.map((work) => (
                  <div key={work.id} className="relative">
                    {/* ぼかしオーバーレイ */}
                    <div className="absolute inset-0 bg-black bg-opacity-20 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center group hover:bg-opacity-10 hover:backdrop-blur-none transition-all duration-200 cursor-pointer">
                      <div className="text-white text-center group-hover:opacity-0 transition-opacity">
                        <Eye className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm font-medium">クリックして表示</p>
                      </div>
                    </div>
                    <WorkCard work={work} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 空の状態 */}
          {!loading && r18MangaWorks.length === 0 && r18IllustrationWorks.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">R-18作品がありません</h3>
              <p className="text-gray-600">現在、R-18作品は投稿されていません。</p>
            </div>
          )}
        </>
      )}

      {/* フッター注意書き */}
      <div className="mt-12 text-center text-sm text-gray-500">
        <p>このページのコンテンツは18歳以上の方向けです。</p>
        <p>不適切なコンテンツを発見した場合は、運営までご報告ください。</p>
      </div>
    </div>
  );
};

export default R18Page;