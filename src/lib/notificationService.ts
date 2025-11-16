import { supabase } from './supabaseClient';
import { Notification, NotificationWithDetails } from '../types';

export class NotificationService {
  // 通知を作成
  static async createNotification(
    userId: string,
    type: 'like' | 'follow',
    actorId: string,
    postId?: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // 自分自身への通知は作成しない
      if (userId === actorId) {
        return { success: true };
      }

      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type,
          actor_id: actorId,
          post_id: postId,
        });

      if (error) {
        console.error('通知作成エラー:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('通知作成中にエラーが発生:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // ユーザーの通知を取得
  static async getNotifications(
    userId: string,
    limit = 20,
    offset = 0
  ): Promise<{ notifications: NotificationWithDetails[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          actor:profiles!notifications_actor_id_fkey(
            id,
            username,
            display_name,
            university,
            avatar_url
          ),
          post:posts(
            id,
            title,
            thumbnail_url
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('通知取得エラー:', error);
        return { notifications: [], error: error.message };
      }

      const notifications: NotificationWithDetails[] = (data || []).map((notification: any) => ({
        id: notification.id,
        user_id: notification.user_id,
        type: notification.type,
        actor_id: notification.actor_id,
        post_id: notification.post_id,
        is_read: notification.is_read,
        created_at: notification.created_at,
        actor: notification.actor,
        post: notification.post,
      }));

      return { notifications };
    } catch (error) {
      console.error('通知取得中にエラーが発生:', error);
      return {
        notifications: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 未読通知数を取得
  static async getUnreadCount(userId: string): Promise<{ count: number; error?: string }> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error('未読通知数取得エラー:', error);
        return { count: 0, error: error.message };
      }

      return { count: count || 0 };
    } catch (error) {
      console.error('未読通知数取得中にエラーが発生:', error);
      return {
        count: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 通知を既読にする
  static async markAsRead(notificationId: number): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('通知既読化エラー:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('通知既読化中にエラーが発生:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // すべての通知を既読にする
  static async markAllAsRead(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error('全通知既読化エラー:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('全通知既読化中にエラーが発生:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 通知を削除
  static async deleteNotification(notificationId: number): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('通知削除エラー:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('通知削除中にエラーが発生:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
