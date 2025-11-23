# お問い合わせ機能のセットアップ手順

このドキュメントでは、お問い合わせ機能を有効にするためのSupabase側の設定手順を説明します。

## 前提条件

- Supabaseプロジェクトが作成済みであること
- Supabaseダッシュボードにアクセスできること

## セットアップ手順

### 1. SQL Editorでテーブルを作成

1. Supabaseダッシュボードにログイン
2. 左側のメニューから「**SQL Editor**」を選択
3. 「**New query**」をクリック
4. `supabase_setup/create_contacts_table.sql` の内容をコピー＆ペースト
5. 「**Run**」ボタンをクリックして実行

### 2. 実行結果の確認

SQLが正常に実行されると、以下のメッセージが表示されます：
```
Success. No rows returned
```

### 3. テーブルの確認

1. 左側のメニューから「**Table Editor**」を選択
2. `contacts` テーブルが作成されていることを確認
3. 以下のカラムが存在することを確認：
   - `id` (bigint, primary key)
   - `name` (text)
   - `email` (text)
   - `category` (text)
   - `subject` (text)
   - `message` (text)
   - `status` (text, default: 'pending')
   - `user_id` (uuid, nullable)
   - `created_at` (timestamptz)
   - `updated_at` (timestamptz)

### 4. Row Level Security (RLS) の確認

1. 「**Table Editor**」で `contacts` テーブルを選択
2. 「**Policies**」タブを確認
3. 以下のポリシーが作成されていることを確認：
   - `Anyone can submit contact form` (INSERT)
   - `Users can view their own contacts` (SELECT)

### 5. 動作確認

1. アプリケーションの `/contact` ページにアクセス
2. お問い合わせフォームに必要事項を入力
3. 「送信する」ボタンをクリック
4. Supabaseの「**Table Editor**」で `contacts` テーブルを確認し、データが保存されていることを確認

## トラブルシューティング

### エラー: "relation 'contacts' already exists"

テーブルが既に存在する場合のエラーです。以下のいずれかの方法で対処してください：

1. **既存のテーブルを削除する場合**（注意：データが削除されます）
   ```sql
   DROP TABLE IF EXISTS contacts CASCADE;
   ```
   その後、`create_contacts_table.sql` を再実行

2. **既存のテーブルを保持する場合**
   - SQLスクリプトの `CREATE TABLE IF NOT EXISTS` により、既存のテーブルはそのまま保持されます
   - ただし、カラムが不足している場合は手動で追加する必要があります

### エラー: "permission denied for table contacts"

RLSポリシーが正しく設定されていない可能性があります。以下を確認してください：

1. RLSが有効になっているか確認
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE tablename = 'contacts';
   ```
   `rowsecurity` が `true` であることを確認

2. ポリシーが正しく作成されているか確認
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'contacts';
   ```

### お問い合わせが保存されない

1. ブラウザの開発者ツール（F12）でコンソールエラーを確認
2. Supabaseの「**Logs**」でエラーログを確認
3. ネットワークタブでAPIリクエストのステータスコードを確認

## 管理者機能（オプション）

管理者がすべてのお問い合わせを閲覧できるようにするには、以下の手順を実行してください：

### 1. profilesテーブルにis_adminカラムを追加（まだない場合）

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
```

### 2. 管理者ポリシーを追加

`create_contacts_table.sql` のコメントアウトされている部分を有効化し、実行：

```sql
CREATE POLICY "Admins can view all contacts"
    ON contacts
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );
```

### 3. 管理者ユーザーを設定

```sql
UPDATE profiles 
SET is_admin = true 
WHERE username = '管理者のユーザー名';
```

## 参考情報

- [Supabase公式ドキュメント - Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase公式ドキュメント - SQL Editor](https://supabase.com/docs/guides/database/tables)

