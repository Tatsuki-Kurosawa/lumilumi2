-- universitiesテーブルにINSERTポリシーを追加するSQL
-- 実行方法: SupabaseダッシュボードのSQL Editorで実行するか、Supabase CLIで実行

-- 注意: 既に同じ名前のポリシーが存在する場合は、先に削除してください
DROP POLICY IF EXISTS "universities_insert_policy" ON universities;

-- 認証済みユーザーが新しい大学名を追加できるようにする
CREATE POLICY "universities_insert_policy" ON universities
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- 確認用クエリ（実行後、ポリシーが作成されたことを確認）
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE tablename = 'universities';

