-- contactsテーブルを作成するSQL
-- 実行方法: SupabaseダッシュボードのSQL Editorで実行するか、Supabase CLIで実行

-- 1. contactsテーブルを作成
CREATE TABLE IF NOT EXISTS contacts (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('general', 'technical', 'account', 'content', 'report', 'other')),
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- ログインユーザーの場合のみ設定
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. インデックスを追加（パフォーマンス向上のため）
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_category ON contacts(category);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id) WHERE user_id IS NOT NULL;

-- 3. updated_atを自動更新するトリガー関数を作成
CREATE OR REPLACE FUNCTION update_contacts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. updated_at自動更新トリガーを作成
DROP TRIGGER IF EXISTS trigger_update_contacts_updated_at ON contacts;
CREATE TRIGGER trigger_update_contacts_updated_at
    BEFORE UPDATE ON contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_contacts_updated_at();

-- 5. Row Level Security (RLS) を有効化
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- 6. RLSポリシーを作成
-- 全ユーザーがお問い合わせを送信できる（INSERT）
CREATE POLICY "Anyone can submit contact form"
    ON contacts
    FOR INSERT
    TO authenticated, anon
    WITH CHECK (true);

-- 認証済みユーザーは自分のお問い合わせのみ閲覧可能（SELECT）
CREATE POLICY "Users can view their own contacts"
    ON contacts
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- 管理者はすべてのお問い合わせを閲覧可能（SELECT）
-- 注意: 管理者の判定方法はプロジェクトに応じて調整してください
-- 例: profilesテーブルにis_adminカラムがある場合
-- CREATE POLICY "Admins can view all contacts"
--     ON contacts
--     FOR SELECT
--     TO authenticated
--     USING (
--         EXISTS (
--             SELECT 1 FROM profiles
--             WHERE profiles.id = auth.uid()
--             AND profiles.is_admin = true
--         )
--     );

-- 確認用クエリ（実行後、テーブルが作成されたことを確認）
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'contacts'
-- ORDER BY ordinal_position;

