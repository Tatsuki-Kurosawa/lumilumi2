import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Heart, UserPlus, Check } from 'lucide-react';
import { NotificationService } from '../lib/notificationService';
import { NotificationWithDetails } from '../types';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';

const NotificationDropdown: React.FC = () => {
  const { user } = useSupabaseAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationWithDetails[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 通知を取得
  const fetchNotifications = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { notifications: data } = await NotificationService.getNotifications(user.id, 10);
      setNotifications(data);

      const { count } = await NotificationService.getUnreadCount(user.id);
      setUnreadCount(count);
    } catch (error) {
      console.error('通知取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // 30秒ごとに通知を更新
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // ドロップダウンの外側をクリックしたら閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      fetchNotifications();
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    await NotificationService.markAsRead(notificationId);
    fetchNotifications();
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    await NotificationService.markAllAsRead(user.id);
    fetchNotifications();
  };

  const getNotificationText = (notification: NotificationWithDetails) => {
    if (notification.type === 'like') {
      return `${notification.actor.display_name}さんがあなたの作品「${notification.post?.title}」にいいねしました`;
    } else if (notification.type === 'follow') {
      return `${notification.actor.display_name}さんがあなたをフォローしました`;
    }
    return '';
  };

  const getNotificationIcon = (type: string) => {
    if (type === 'like') {
      return <Heart className="h-5 w-5 text-red-500" fill="currentColor" />;
    } else if (type === 'follow') {
      return <UserPlus className="h-5 w-5 text-blue-500" />;
    }
    return null;
  };

  const getNotificationLink = (notification: NotificationWithDetails) => {
    if (notification.type === 'like' && notification.post_id) {
      return `/works/${notification.post_id}`;
    } else if (notification.type === 'follow') {
      return `/user/${notification.actor.username}`;
    }
    return '#';
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return 'たった今';
    if (diff < 3600) return `${Math.floor(diff / 60)}分前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}時間前`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}日前`;
    return date.toLocaleDateString('ja-JP');
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 通知アイコン */}
      <button
        onClick={handleToggle}
        className="relative p-2 text-gray-700 hover:text-cyan-600 transition-colors"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* ドロップダウンメニュー */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">通知</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-cyan-600 hover:text-cyan-700 flex items-center"
              >
                <Check className="h-4 w-4 mr-1" />
                すべて既読
              </button>
            )}
          </div>

          {loading ? (
            <div className="p-4 text-center text-gray-500">読み込み中...</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">通知はありません</p>
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <Link
                  key={notification.id}
                  to={getNotificationLink(notification)}
                  onClick={() => {
                    if (!notification.is_read) {
                      handleMarkAsRead(notification.id);
                    }
                    setIsOpen(false);
                  }}
                  className={`block p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    !notification.is_read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        {getNotificationText(notification)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTime(notification.created_at)}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
