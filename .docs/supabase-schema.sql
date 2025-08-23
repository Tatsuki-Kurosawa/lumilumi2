-- 漫画・イラスト投稿プラットフォーム データベーススキーマ
-- Supabase用のSQLスクリプト

-- 1. profiles テーブル (ユーザープロフィール)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    university TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('student', 'ob', 'og')),
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. posts テーブル (投稿作品)
CREATE TABLE posts (
    id BIGSERIAL PRIMARY KEY,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('manga', 'illustration')),
    title TEXT NOT NULL,
    thumbnail_url TEXT NOT NULL,
    is_r18 BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. post_images テーブル (投稿画像)
CREATE TABLE post_images (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 1
);

-- 4. tags テーブル (タグ)
CREATE TABLE tags (
    id BIGSERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

-- 5. post_tags テーブル (投稿とタグの中間テーブル)
CREATE TABLE post_tags (
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    tag_id BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

-- 6. likes テーブル (いいね)
CREATE TABLE likes (
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, post_id)
);

-- 7. follows テーブル (フォロー)
CREATE TABLE follows (
    follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (follower_id, following_id),
    CHECK (follower_id != following_id) -- 自分自身をフォローできない
);

-- 8. requests テーブル (依頼)
CREATE TABLE requests (
    id BIGSERIAL PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    request_type TEXT NOT NULL CHECK (request_type IN ('critique', 'commission', 'other')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')),
    body TEXT NOT NULL,
    price INTEGER NOT NULL CHECK (price >= 0),
    deadline_delivery TIMESTAMPTZ,
    delivered_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (client_id != creator_id) -- 自分自身に依頼できない
);

-- 9. page_views テーブル (ページビュー)
CREATE TABLE page_views (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- 匿名ユーザーも記録
    ip_address INET, -- 重複カウント防止用
    user_agent TEXT, -- ボット判定用
    viewed_at TIMESTAMPTZ DEFAULT NOW(),
    is_unique BOOLEAN DEFAULT TRUE -- 同一ユーザーからの重複アクセス判定
);

-- インデックスの作成
-- 検索パフォーマンス向上のため

-- profiles テーブルのインデックス
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_university ON profiles(university);
CREATE INDEX idx_profiles_status ON profiles(status);

-- posts テーブルのインデックス
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_type ON posts(type);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_is_r18 ON posts(is_r18);
CREATE INDEX idx_posts_author_type ON posts(author_id, type);

-- post_images テーブルのインデックス
CREATE INDEX idx_post_images_post_id ON post_images(post_id);
CREATE INDEX idx_post_images_display_order ON post_images(post_id, display_order);

-- tags テーブルのインデックス
CREATE INDEX idx_tags_name ON tags(name);

-- post_tags テーブルのインデックス
CREATE INDEX idx_post_tags_post_id ON post_tags(post_id);
CREATE INDEX idx_post_tags_tag_id ON post_tags(tag_id);

-- likes テーブルのインデックス
CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_likes_created_at ON likes(created_at DESC);

-- follows テーブルのインデックス
CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_follows_following_id ON follows(following_id);
CREATE INDEX idx_follows_created_at ON follows(created_at DESC);

-- requests テーブルのインデックス
CREATE INDEX idx_requests_client_id ON requests(client_id);
CREATE INDEX idx_requests_creator_id ON requests(creator_id);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_created_at ON requests(created_at DESC);

-- page_views テーブルのインデックス
CREATE INDEX idx_page_views_post_id ON page_views(post_id);
CREATE INDEX idx_page_views_viewed_at ON page_views(viewed_at DESC);
CREATE INDEX idx_page_views_post_viewed ON page_views(post_id, viewed_at);
CREATE INDEX idx_page_views_unique ON page_views(post_id, viewer_id, viewed_at);
CREATE INDEX idx_page_views_ip_address ON page_views(ip_address);

-- Row Level Security (RLS) の有効化
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- RLS ポリシーの作成

-- profiles テーブルのポリシー
-- 全ユーザーが読み取り可能
CREATE POLICY "profiles_read_policy" ON profiles
    FOR SELECT USING (true);

-- 自分のプロフィールのみ更新可能
CREATE POLICY "profiles_update_policy" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- 自分のプロフィールのみ削除可能
CREATE POLICY "profiles_delete_policy" ON profiles
    FOR DELETE USING (auth.uid() = id);

-- posts テーブルのポリシー
-- 全ユーザーが読み取り可能
CREATE POLICY "posts_read_policy" ON posts
    FOR SELECT USING (true);

-- 認証済みユーザーのみ投稿可能
CREATE POLICY "posts_insert_policy" ON posts
    FOR INSERT WITH CHECK (auth.uid() = author_id);

-- 自分の投稿のみ更新可能
CREATE POLICY "posts_update_policy" ON posts
    FOR UPDATE USING (auth.uid() = author_id);

-- 自分の投稿のみ削除可能
CREATE POLICY "posts_delete_policy" ON posts
    FOR DELETE USING (auth.uid() = author_id);

-- post_images テーブルのポリシー
-- 全ユーザーが読み取り可能
CREATE POLICY "post_images_read_policy" ON post_images
    FOR SELECT USING (true);

-- 投稿者のみ画像追加可能
CREATE POLICY "post_images_insert_policy" ON post_images
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM posts 
            WHERE posts.id = post_images.post_id 
            AND posts.author_id = auth.uid()
        )
    );

-- 投稿者のみ画像更新・削除可能
CREATE POLICY "post_images_update_policy" ON post_images
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM posts 
            WHERE posts.id = post_images.post_id 
            AND posts.author_id = auth.uid()
        )
    );

CREATE POLICY "post_images_delete_policy" ON post_images
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM posts 
            WHERE posts.id = post_images.post_id 
            AND posts.author_id = auth.uid()
        )
    );

-- tags テーブルのポリシー
-- 全ユーザーが読み取り可能
CREATE POLICY "tags_read_policy" ON tags
    FOR SELECT USING (true);

-- 認証済みユーザーのみタグ作成可能
CREATE POLICY "tags_insert_policy" ON tags
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- post_tags テーブルのポリシー
-- 全ユーザーが読み取り可能
CREATE POLICY "post_tags_read_policy" ON post_tags
    FOR SELECT USING (true);

-- 投稿者のみタグ追加・削除可能
CREATE POLICY "post_tags_insert_policy" ON post_tags
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM posts 
            WHERE posts.id = post_tags.post_id 
            AND posts.author_id = auth.uid()
        )
    );

CREATE POLICY "post_tags_delete_policy" ON post_tags
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM posts 
            WHERE posts.id = post_tags.post_id 
            AND posts.author_id = auth.uid()
        )
    );

-- likes テーブルのポリシー
-- 全ユーザーが読み取り可能
CREATE POLICY "likes_read_policy" ON likes
    FOR SELECT USING (true);

-- 認証済みユーザーのみいいね可能
CREATE POLICY "likes_insert_policy" ON likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 自分のいいねのみ削除可能
CREATE POLICY "likes_delete_policy" ON likes
    FOR DELETE USING (auth.uid() = user_id);

-- follows テーブルのポリシー
-- 全ユーザーが読み取り可能
CREATE POLICY "follows_read_policy" ON follows
    FOR SELECT USING (true);

-- 認証済みユーザーのみフォロー可能
CREATE POLICY "follows_insert_policy" ON follows
    FOR INSERT WITH CHECK (auth.uid() = follower_id);

-- 自分のフォロー関係のみ削除可能
CREATE POLICY "follows_delete_policy" ON follows
    FOR DELETE USING (auth.uid() = follower_id);

-- requests テーブルのポリシー
-- 依頼者と受注者のみ読み取り可能
CREATE POLICY "requests_read_policy" ON requests
    FOR SELECT USING (
        auth.uid() = client_id OR auth.uid() = client_id
    );

-- 認証済みユーザーのみ依頼作成可能
CREATE POLICY "requests_insert_policy" ON requests
    FOR INSERT WITH CHECK (auth.uid() = client_id);

-- 依頼者と受注者のみ更新可能
CREATE POLICY "requests_update_policy" ON requests
    FOR UPDATE USING (
        auth.uid() = client_id OR auth.uid() = creator_id
    );

-- 依頼者と受注者のみ削除可能
CREATE POLICY "requests_delete_policy" ON requests
    FOR DELETE USING (
        auth.uid() = client_id OR auth.uid() = creator_id
    );

-- page_views テーブルのポリシー
-- 全ユーザーが読み取り可能
CREATE POLICY "page_views_read_policy" ON page_views
    FOR SELECT USING (true);

-- 全ユーザーがPV記録可能（匿名ユーザーも含む）
CREATE POLICY "page_views_insert_policy" ON page_views
    FOR INSERT WITH CHECK (true);

-- 関数の作成

-- ユーザー作成時にプロフィールを自動作成する関数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, display_name, university, status)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || NEW.id),
        COALESCE(NEW.raw_user_meta_data->>'display_name', 'ユーザー'),
        COALESCE(NEW.raw_user_meta_data->>'university', '未設定'),
        COALESCE(NEW.raw_user_meta_data->>'status', 'student')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- トリガーの作成
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- いいね数を取得する関数
CREATE OR REPLACE FUNCTION get_like_count(post_id_param BIGINT)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM likes
        WHERE post_id = post_id_param
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 投稿の総PV数を取得する関数
CREATE OR REPLACE FUNCTION get_page_view_count(post_id_param BIGINT)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM page_views
        WHERE post_id = post_id_param
        AND is_unique = TRUE -- 重複を除いたユニークPV数
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 期間別PV数を取得する関数
CREATE OR REPLACE FUNCTION get_page_view_count_by_period(
    post_id_param BIGINT, 
    days_param INTEGER
)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM page_views
        WHERE post_id = post_id_param
        AND viewed_at >= NOW() - INTERVAL '1 day' * days_param
        AND is_unique = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 投稿の総合スコアを計算する関数（ランキング用）
CREATE OR REPLACE FUNCTION calculate_post_score(post_id_param BIGINT)
RETURNS INTEGER AS $$
DECLARE
    like_count INTEGER;
    days_since_creation INTEGER;
BEGIN
    -- いいね数を取得
    SELECT get_like_count(post_id_param) INTO like_count;
    
    -- 投稿からの経過日数を計算
    SELECT EXTRACT(DAY FROM NOW() - created_at)::INTEGER
    INTO days_since_creation
    FROM posts
    WHERE id = post_id_param;
    
    -- スコア計算（いいね数 - 経過日数 * 0.1）
    -- 新しい投稿ほど高スコア、いいねが多いほど高スコア
    RETURN GREATEST(like_count - COALESCE(days_since_creation, 0) * 0.1, 0)::INTEGER;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 投稿の総合スコアを計算する関数（PV数 + いいね数）
CREATE OR REPLACE FUNCTION calculate_post_score_v2(post_id_param BIGINT)
RETURNS INTEGER AS $$
DECLARE
    like_count INTEGER;
    pv_count INTEGER;
    days_since_creation INTEGER;
    time_decay_factor DECIMAL(10,3);
BEGIN
    -- いいね数を取得
    SELECT get_like_count(post_id_param) INTO like_count;
    
    -- PV数を取得
    SELECT get_page_view_count(post_id_param) INTO pv_count;
    
    -- 投稿からの経過日数を計算
    SELECT EXTRACT(DAY FROM NOW() - created_at)::INTEGER
    INTO days_since_creation
    FROM posts
    WHERE id = post_id_param;
    
    -- 時間減衰係数（新しい投稿ほど高スコア）
    time_decay_factor := GREATEST(1.0 - (COALESCE(days_since_creation, 0) * 0.02), 0.1);
    
    -- スコア計算（PV数 * 0.1 + いいね数 * 1.0）* 時間減衰係数
    RETURN (
        (COALESCE(pv_count, 0) * 0.1 + COALESCE(like_count, 0) * 1.0) * 
        time_decay_factor
    )::INTEGER;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ビューの作成

-- 投稿一覧用のビュー（いいね数、画像数、タグを含む）
CREATE VIEW post_summary AS
SELECT 
    p.id,
    p.author_id,
    p.type,
    p.title,
    p.thumbnail_url,
    p.is_r18,
    p.created_at,
    pr.display_name,
    pr.username,
    pr.university,
    pr.status,
    get_like_count(p.id) as like_count,
    calculate_post_score(p.id) as score,
    (
        SELECT COUNT(*)::INTEGER
        FROM post_images pi
        WHERE pi.post_id = p.id
    ) as image_count,
    (
        SELECT ARRAY_AGG(t.name)
        FROM post_tags pt
        JOIN tags t ON pt.tag_id = t.id
        WHERE pt.post_id = p.id
    ) as tags
FROM posts p
JOIN profiles pr ON p.author_id = pr.id;

-- 投稿サマリービューの更新版（PV数 + いいね数）
CREATE VIEW post_summary_v2 AS
SELECT 
    p.id,
    p.author_id,
    p.type,
    p.title,
    p.thumbnail_url,
    p.is_r18,
    p.created_at,
    pr.display_name,
    pr.username,
    pr.university,
    pr.status,
    get_like_count(p.id) as like_count,
    get_page_view_count(p.id) as total_pv_count,
    get_page_view_count_by_period(p.id, 7) as weekly_pv_count,
    calculate_post_score_v2(p.id) as score,
    (
        SELECT COUNT(*)::INTEGER
        FROM post_images pi
        WHERE pi.post_id = p.id
    ) as image_count,
    (
        SELECT ARRAY_AGG(t.name)
        FROM post_tags pt
        JOIN tags t ON pt.tag_id = t.id
        WHERE pt.post_id = p.id
    ) as tags
FROM posts p
JOIN profiles pr ON p.author_id = pr.id;

-- 週間ランキング用のビュー
CREATE VIEW weekly_ranking AS
SELECT 
    ps.*,
    ROW_NUMBER() OVER (ORDER BY ps.score DESC) as rank
FROM post_summary ps
WHERE ps.created_at >= NOW() - INTERVAL '7 days'
ORDER BY ps.score DESC;

-- 週間ランキング用のビュー（PV数 + いいね数）
CREATE VIEW weekly_ranking_v2 AS
SELECT 
    ps.*,
    ROW_NUMBER() OVER (ORDER BY ps.score DESC) as rank
FROM post_summary_v2 ps
WHERE ps.created_at >= NOW() - INTERVAL '7 days'
ORDER BY ps.score DESC;

-- コメント
COMMENT ON TABLE profiles IS 'ユーザープロフィール情報';
COMMENT ON TABLE posts IS '投稿作品の基本情報';
COMMENT ON TABLE post_images IS '投稿に紐づく画像ファイル';
COMMENT ON TABLE tags IS '作品のタグ情報';
COMMENT ON TABLE post_tags IS '投稿とタグの中間テーブル';
COMMENT ON TABLE likes IS 'ユーザーのいいね情報';
COMMENT ON TABLE follows IS 'ユーザー間のフォロー関係';
COMMENT ON TABLE requests IS '作品依頼情報';
COMMENT ON TABLE page_views IS '作品のページビュー情報';

COMMENT ON FUNCTION get_like_count IS '指定された投稿のいいね数を取得';
COMMENT ON FUNCTION get_page_view_count IS '指定された投稿の総PV数を取得';
COMMENT ON FUNCTION get_page_view_count_by_period IS '指定された投稿の期間別PV数を取得';
COMMENT ON FUNCTION calculate_post_score IS '投稿の総合スコアを計算（ランキング用）';
COMMENT ON FUNCTION calculate_post_score_v2 IS '投稿の総合スコアを計算（PV数 + いいね数）';
COMMENT ON VIEW post_summary IS '投稿一覧表示用のサマリービュー';
COMMENT ON VIEW post_summary_v2 IS '投稿一覧表示用のサマリービュー（PV数 + いいね数）';
COMMENT ON VIEW weekly_ranking IS '週間ランキング用のビュー';
COMMENT ON VIEW weekly_ranking_v2 IS '週間ランキング用のビュー（PV数 + いいね数）';
