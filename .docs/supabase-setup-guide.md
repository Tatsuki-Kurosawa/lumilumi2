# Supabase セットアップガイド

## 概要
このガイドでは、漫画・イラスト投稿プラットフォームでSupabaseを使用するためのセットアップ手順を説明します。

## 1. Supabaseプロジェクトの作成

### 1.1 プロジェクト作成
1. [Supabase](https://supabase.com/) にアクセス
2. GitHubアカウントでログイン
3. 「New Project」をクリック
4. 組織を選択（または新規作成）
5. プロジェクト名を入力（例: `lumilumi2`）
6. データベースパスワードを設定（安全なパスワードを使用）
7. リージョンを選択（日本ユーザー向けなら `Asia Pacific (Tokyo)` を推奨）

### 1.2 初期設定
- プロジェクト作成完了まで待機（約2-3分）
- プロジェクトダッシュボードが表示されたら準備完了

## 2. データベーススキーマの適用

### 2.1 SQLエディタでの実行
1. 左サイドバーの「SQL Editor」をクリック
2. 「New query」をクリック
3. `.docs/supabase-schema.sql` の内容をコピー＆ペースト
4. 「Run」ボタンをクリックして実行

### 2.2 実行結果の確認
- 各テーブルが正常に作成されているか確認
- エラーが発生した場合は、エラーメッセージを確認して修正

### 2.3 新機能の確認
- `page_views`テーブルが正常に作成されているか確認
- 新しい関数（`get_page_view_count`, `calculate_post_score_v2`）が作成されているか確認
- 新しいビュー（`post_summary_v2`, `weekly_ranking_v2`）が作成されているか確認

## 3. 認証設定

### 3.1 認証プロバイダーの設定
1. 左サイドバーの「Authentication」→「Providers」をクリック
2. 以下の設定を行う：

#### Email認証
- `Enable email confirmations`: 有効化
- `Enable email change confirmations`: 有効化
- `Secure email change`: 有効化

#### Google認証（推奨）
- `Enable Google OAuth`: 有効化
- Google Cloud ConsoleでOAuth 2.0クライアントIDを取得
- Client IDとClient Secretを入力

#### SNS認証（必要に応じて）
- Twitter、GitHub等の認証も設定可能

### 3.2 メール設定
1. 「Authentication」→「Settings」をクリック
2. SMTP設定を構成：
   - Host: 使用するSMTPサーバー
   - Port: 587（TLS）または465（SSL）
   - User: SMTPユーザー名
   - Pass: SMTPパスワード
   - Sender name: プラットフォーム名
   - Sender email: 送信元メールアドレス

## 4. ストレージ設定

### 4.1 バケットの作成
1. 左サイドバーの「Storage」をクリック
2. 「New bucket」をクリック
3. 以下のバケットを作成：

#### avatars バケット
- 名前: `avatars`
- Public bucket: 有効化
- File size limit: 5MB
- Allowed MIME types: `image/*`

#### posts バケット
- 名前: `posts`
- Public bucket: 有効化
- File size limit: 10MB
- Allowed MIME types: `image/*`

#### thumbnails バケット
- 名前: `thumbnails`
- Public bucket: 有効化
- File size limit: 2MB
- Allowed MIME types: `image/*`

### 4.2 ストレージポリシーの設定
各バケットに適切なRLSポリシーを設定：

```sql
-- avatars バケットのポリシー
CREATE POLICY "avatars_read_policy" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatars_insert_policy" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "avatars_update_policy" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "avatars_delete_policy" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- posts バケットのポリシー
CREATE POLICY "posts_read_policy" ON storage.objects
    FOR SELECT USING (bucket_id = 'posts');

CREATE POLICY "posts_insert_policy" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'posts' 
        AND auth.uid() IS NOT NULL
    );

CREATE POLICY "posts_delete_policy" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'posts' 
        AND auth.uid() IS NOT NULL
    );

-- thumbnails バケットのポリシー
CREATE POLICY "thumbnails_read_policy" ON storage.objects
    FOR SELECT USING (bucket_id = 'thumbnails');

CREATE POLICY "thumbnails_insert_policy" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'thumbnails' 
        AND auth.uid() IS NOT NULL
    );

CREATE POLICY "thumbnails_delete_policy" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'thumbnails' 
        AND auth.uid() IS NOT NULL
    );
```

## 5. 環境変数の設定

### 5.1 プロジェクト設定の取得
1. 左サイドバーの「Settings」→「API」をクリック
2. 以下の情報をコピー：
   - Project URL
   - anon public key
   - service_role key（注意：本番環境では使用しない）

### 5.2 環境変数ファイルの作成
プロジェクトルートに `.env.local` ファイルを作成：

```env
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Supabase Service Role Key (サーバーサイドのみ)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# その他の環境変数
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

## 6. セキュリティ設定

### 6.1 RLSの確認
- すべてのテーブルでRLSが有効化されているか確認
- ポリシーが正しく設定されているか確認

### 6.2 データベース接続の制限
1. 「Settings」→「Database」をクリック
2. 「Connection pooling」で接続数を制限
3. 「Connection string」で接続文字列を確認

## 7. テストデータの投入

### 7.1 サンプルデータの作成
開発・テスト用のサンプルデータを作成：

```sql
-- サンプル大学データ
INSERT INTO profiles (id, username, display_name, university, status, bio) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'test_user1', '太郎', '東京大学', 'student', 'イラストを描くのが好きです'),
('550e8400-e29b-41d4-a716-446655440002', 'test_user2', '花子', '京都大学', 'ob', '漫画制作をしています');

-- サンプルタグデータ
INSERT INTO tags (name) VALUES
('オリジナル'),
('風景'),
('キャラクター'),
('ファンタジー'),
('日常');

-- サンプル投稿データ
INSERT INTO posts (author_id, type, title, thumbnail_url, is_r18) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'illustration', '春の風景', 'https://example.com/thumbnail1.jpg', false),
('550e8400-e29b-41d4-a716-446655440002', 'manga', '日常の一コマ', 'https://example.com/thumbnail2.jpg', false);

-- サンプルPVデータ（テスト用）
INSERT INTO page_views (post_id, viewer_id, ip_address, user_agent, is_unique) VALUES
(1, '550e8400-e29b-41d4-a716-446655440001', '192.168.1.1', 'Mozilla/5.0', true),
(1, '550e8400-e29b-41d4-a716-446655440002', '192.168.1.2', 'Mozilla/5.0', true),
(2, '550e8400-e29b-41d4-a716-446655440001', '192.168.1.1', 'Mozilla/5.0', true);
```

### 7.2 PV数機能のテスト
新しいPV数機能が正常に動作するかテスト：

```sql
-- PV数取得のテスト
SELECT get_page_view_count(1) as pv_count_1;
SELECT get_page_view_count(2) as pv_count_2;

-- 期間別PV数取得のテスト
SELECT get_page_view_count_by_period(1, 7) as weekly_pv_1;

-- 新しいスコア計算のテスト
SELECT calculate_post_score_v2(1) as new_score_1;
SELECT calculate_post_score_v2(2) as new_score_2;

-- 新しいビューのテスト
SELECT * FROM post_summary_v2 LIMIT 5;
SELECT * FROM weekly_ranking_v2 LIMIT 10;
```

## 8. 監視とメンテナンス

### 8.1 ログの確認
- 「Logs」でデータベースアクセスログを確認
- エラーや異常なアクセスパターンを監視

### 8.2 パフォーマンス監視
- 「Database」→「Reports」でクエリパフォーマンスを確認
- スロークエリの特定と最適化

### 8.3 バックアップ
- 定期的なデータベースバックアップの設定
- 重要なデータのエクスポート

## 9. トラブルシューティング

### 9.1 よくある問題
- RLSポリシーが正しく動作しない
- ストレージのアップロードが失敗する
- 認証が正常に動作しない

### 9.2 解決方法
- SQLエディタでポリシーの確認
- ブラウザの開発者ツールでエラーログの確認
- Supabaseのドキュメントとコミュニティフォーラムの参照

## 10. 次のステップ

### 10.1 フロントエンド開発
- Next.jsプロジェクトでのSupabaseクライアント設定
- 認証フローの実装
- データベース操作の実装
- PV数トラッキング機能の実装
- ランキング表示機能の実装

### 10.2 PV数管理の実装
- フロントエンドでのPV数記録
- 重複アクセスの防止処理
- 匿名ユーザーのPV数記録
- ボットアクセスの除外処理

### 10.3 本番環境への移行
- 本番用Supabaseプロジェクトの作成
- データの移行
- ドメインとSSL証明書の設定

### 10.4 スケーリング
- パフォーマンスの最適化
- CDNの設定
- 負荷分散の検討
- PV数データの効率的な処理
- 定期的なデータアーカイブ化
