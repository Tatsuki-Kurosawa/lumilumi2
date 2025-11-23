import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Send } from 'lucide-react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { ContactService, ContactFormData } from '../lib/contactService';

const ContactPage: React.FC = () => {
  const { user } = useSupabaseAuth();
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    category: 'general',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // エラーメッセージをクリア
    if (submitStatus === 'error') {
      setSubmitStatus('idle');
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      // お問い合わせを送信
      const { contact, error } = await ContactService.submitContact(
        formData,
        user?.id || null
      );

      if (error || !contact) {
        setSubmitStatus('error');
        setErrorMessage(error || 'お問い合わせの送信に失敗しました');
        setIsSubmitting(false);
        return;
      }

      // 成功
      setSubmitStatus('success');
      
      // フォームをリセット
      setFormData({
        name: '',
        email: '',
        category: 'general',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error('お問い合わせ送信中にエラーが発生:', error);
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : '予期しないエラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center mb-6">
            <Mail className="h-8 w-8 text-cyan-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">お問い合わせ</h1>
          </div>

          <p className="text-gray-600 mb-8">
            イラストーク大学に関するご質問、ご意見、不具合報告などがございましたら、
            以下のフォームよりお問い合わせください。
          </p>

          {submitStatus === 'success' && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800">
                お問い合わせを受け付けました。内容を確認の上、3営業日以内にご返信いたします。
              </p>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">
                {errorMessage || '送信に失敗しました。しばらく時間をおいて再度お試しください。'}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                お名前 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="山田太郎"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="example@email.com"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                お問い合わせ種別 <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="general">一般的な質問</option>
                <option value="technical">技術的な問題・不具合</option>
                <option value="account">アカウント関連</option>
                <option value="content">コンテンツ・投稿関連</option>
                <option value="report">規約違反の報告</option>
                <option value="other">その他</option>
              </select>
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                件名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="お問い合わせの件名を入力してください"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                お問い合わせ内容 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                placeholder="お問い合わせ内容をできるだけ詳しくご記入ください"
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-600">
                ※ご入力いただいた個人情報は、お問い合わせへの回答のみに使用し、
                <Link to="/privacy" className="text-cyan-600 hover:underline">プライバシーポリシー</Link>
                に基づき適切に管理いたします。
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-cyan-600 text-white py-3 px-6 rounded-md hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  送信中...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  送信する
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">よくある質問をご確認ください</h3>
              <p className="text-sm text-gray-600 mb-2">
                お問い合わせの前に、
                <Link to="/help" className="text-cyan-600 hover:underline">ヘルプページ</Link>
                で解決方法が見つかるかもしれません。
              </p>
            </div>
          </div>

          <div className="mt-6">
            <Link
              to="/"
              className="text-cyan-600 hover:text-cyan-700 font-medium"
            >
              ← ホームに戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
