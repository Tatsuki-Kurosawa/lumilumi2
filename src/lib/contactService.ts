import { supabase } from './supabaseClient';

// お問い合わせデータの型定義
export interface ContactFormData {
  name: string;
  email: string;
  category: 'general' | 'technical' | 'account' | 'content' | 'report' | 'other';
  subject: string;
  message: string;
}

export interface Contact extends ContactFormData {
  id: number;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  user_id?: string | null;
  created_at: string;
  updated_at: string;
}

// お問い合わせサービス
export class ContactService {
  /**
   * お問い合わせを送信（データベースに保存）
   * @param formData お問い合わせフォームのデータ
   * @param userId ログインユーザーのID（オプション）
   * @returns 保存されたお問い合わせデータとエラー情報
   */
  static async submitContact(
    formData: ContactFormData,
    userId?: string | null
  ): Promise<{ contact: Contact | null; error: string | null }> {
    try {
      // データベースに保存
      const { data, error } = await supabase
        .from('contacts')
        .insert({
          name: formData.name.trim(),
          email: formData.email.trim(),
          category: formData.category,
          subject: formData.subject.trim(),
          message: formData.message.trim(),
          user_id: userId || null,
        })
        .select()
        .single();

      if (error) {
        console.error('お問い合わせ送信エラー:', error);
        return {
          contact: null,
          error: error.message || 'お問い合わせの送信に失敗しました',
        };
      }

      return {
        contact: data as Contact,
        error: null,
      };
    } catch (error) {
      console.error('お問い合わせ送信中にエラーが発生:', error);
      return {
        contact: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * ユーザーのお問い合わせ履歴を取得
   * @param userId ユーザーID
   * @param limit 取得件数（デフォルト: 20）
   * @param offset オフセット（デフォルト: 0）
   * @returns お問い合わせリストとエラー情報
   */
  static async getUserContacts(
    userId: string,
    limit = 20,
    offset = 0
  ): Promise<{ contacts: Contact[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('お問い合わせ履歴取得エラー:', error);
        return {
          contacts: [],
          error: error.message || 'お問い合わせ履歴の取得に失敗しました',
        };
      }

      return {
        contacts: (data || []) as Contact[],
        error: null,
      };
    } catch (error) {
      console.error('お問い合わせ履歴取得中にエラーが発生:', error);
      return {
        contacts: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * お問い合わせのステータスを更新（管理者用）
   * @param contactId お問い合わせID
   * @param status 新しいステータス
   * @returns 更新されたお問い合わせデータとエラー情報
   */
  static async updateContactStatus(
    contactId: number,
    status: 'pending' | 'in_progress' | 'resolved' | 'closed'
  ): Promise<{ contact: Contact | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .update({ status })
        .eq('id', contactId)
        .select()
        .single();

      if (error) {
        console.error('お問い合わせステータス更新エラー:', error);
        return {
          contact: null,
          error: error.message || 'ステータスの更新に失敗しました',
        };
      }

      return {
        contact: data as Contact,
        error: null,
      };
    } catch (error) {
      console.error('お問い合わせステータス更新中にエラーが発生:', error);
      return {
        contact: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

