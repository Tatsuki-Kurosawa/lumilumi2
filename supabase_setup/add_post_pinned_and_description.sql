-- postsテーブルにis_pinnedとdescriptionカラムを追加するSQL
-- 実行方法: SupabaseダッシュボードのSQL Editorで実行するか、Supabase CLIで実行

-- 1. descriptionカラムを追加（既に存在する場合はスキップ）
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'description'
    ) THEN
        ALTER TABLE posts ADD COLUMN description TEXT;
    END IF;
END $$;

-- 2. is_pinnedカラムを追加（既に存在する場合はスキップ）
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'is_pinned'
    ) THEN
        ALTER TABLE posts ADD COLUMN is_pinned BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 3. is_pinnedカラムにインデックスを追加（パフォーマンス向上のため）
CREATE INDEX IF NOT EXISTS idx_posts_is_pinned ON posts(is_pinned) WHERE is_pinned = true;
CREATE INDEX IF NOT EXISTS idx_posts_author_id_is_pinned ON posts(author_id, is_pinned) WHERE is_pinned = true;

-- 確認用クエリ（実行後、カラムが追加されたことを確認）
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'posts'
-- ORDER BY ordinal_position;

