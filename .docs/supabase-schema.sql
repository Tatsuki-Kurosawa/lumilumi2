-- 漫画・イラスト投稿プラットフォーム データベーススキーマ
-- Supabase用のSQLスクリプト

-- 1. universities テーブル (大学一覧)
CREATE TABLE universities (
    id BIGSERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0
);

-- 2. profiles テーブル (ユーザープロフィール)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    university TEXT NOT NULL REFERENCES universities(name),
    status TEXT NOT NULL CHECK (status IN ('student', 'ob', 'og')),
    avatar_url TEXT,
    bio TEXT,
    is_creator BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. creator_profiles テーブル (作家プロフィール)
CREATE TABLE creator_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    is_accepting_requests BOOLEAN DEFAULT FALSE,
    critique_price INTEGER CHECK (critique_price >= 0),
    commission_price INTEGER CHECK (commission_price >= 0),
    specialties TEXT[] DEFAULT '{}',
    portfolio_description TEXT,
    experience_years INTEGER CHECK (experience_years >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. posts テーブル (投稿作品)
CREATE TABLE posts (
    id BIGSERIAL PRIMARY KEY,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('manga', 'illustration')),
    title TEXT NOT NULL,
    thumbnail_url TEXT NOT NULL,
    is_r18 BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. post_images テーブル (投稿画像)
CREATE TABLE post_images (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 1
);

-- 6. tags テーブル (タグ)
CREATE TABLE tags (
    id BIGSERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

-- 7. post_tags テーブル (投稿とタグの中間テーブル)
CREATE TABLE post_tags (
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    tag_id BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

-- 8. likes テーブル (いいね)
CREATE TABLE likes (
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, post_id)
);

-- 9. follows テーブル (フォロー)
CREATE TABLE follows (
    follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (follower_id, following_id),
    CHECK (follower_id != following_id) -- 自分自身をフォローできない
);

-- 10. requests テーブル (依頼)
CREATE TABLE requests (
    id BIGSERIAL PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    request_type TEXT NOT NULL CHECK (request_type IN ('critique', 'commission')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    price INTEGER NOT NULL CHECK (price >= 0),
    deadline_delivery TIMESTAMPTZ,
    delivered_image_url TEXT,
    client_visibility TEXT NOT NULL DEFAULT 'public' CHECK (client_visibility IN ('public', 'private')),
    creator_visibility TEXT NOT NULL DEFAULT 'public' CHECK (creator_visibility IN ('public', 'private')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (client_id != creator_id) -- 自分自身に依頼できない
);

-- 11. request_images テーブル (依頼画像)
CREATE TABLE request_images (
    id BIGSERIAL PRIMARY KEY,
    request_id BIGINT NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 1
);

-- 12. page_views テーブル (ページビュー) - 最適化版
CREATE TABLE page_views (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- 匿名ユーザーも記録
    viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. age_verifications テーブル (年齢確認)
CREATE TABLE age_verifications (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    verified_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET
);

-- Phase 1 最適化: 集計テーブルの追加

-- 14. post_view_counts テーブル (投稿閲覧数集計)
CREATE TABLE post_view_counts (
    post_id BIGINT PRIMARY KEY REFERENCES posts(id) ON DELETE CASCADE,
    daily_views JSONB DEFAULT '{}', -- 日別閲覧数: {"2024-01-01": 15, "2024-01-02": 23}
    weekly_views JSONB DEFAULT '{}', -- 週別閲覧数: {"2024-W01": 156, "2024-W02": 189}
    monthly_views JSONB DEFAULT '{}', -- 月別閲覧数: {"2024-01": 1200, "2024-02": 1350}
    total_views INTEGER DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 15. post_like_counts テーブル (投稿いいね数集計)
CREATE TABLE post_like_counts (
    post_id BIGINT PRIMARY KEY REFERENCES posts(id) ON DELETE CASCADE,
    daily_likes JSONB DEFAULT '{}', -- 日別いいね数: {"2024-01-01": 5, "2024-01-02": 8}
    weekly_likes JSONB DEFAULT '{}', -- 週別いいね数: {"2024-W01": 45, "2024-W02": 52}
    monthly_likes JSONB DEFAULT '{}', -- 月別いいね数: {"2024-01": 180, "2024-02": 210}
    total_likes INTEGER DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- インデックスの作成
-- 検索パフォーマンス向上のため

-- universities テーブルのインデックス
CREATE INDEX idx_universities_name ON universities(name);
CREATE INDEX idx_universities_display_order ON universities(display_order);

-- profiles テーブルのインデックス
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_university ON profiles(university);
CREATE INDEX idx_profiles_status ON profiles(status);
CREATE INDEX idx_profiles_is_creator ON profiles(is_creator);

-- creator_profiles テーブルのインデックス
CREATE INDEX idx_creator_profiles_user_id ON creator_profiles(user_id);
CREATE INDEX idx_creator_profiles_is_accepting_requests ON creator_profiles(is_accepting_requests);
CREATE INDEX idx_creator_profiles_critique_price ON creator_profiles(critique_price);
CREATE INDEX idx_creator_profiles_commission_price ON creator_profiles(commission_price);
CREATE INDEX idx_creator_profiles_specialties ON creator_profiles USING GIN(specialties);

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
CREATE INDEX idx_requests_request_type ON requests(request_type);
CREATE INDEX idx_requests_created_at ON requests(created_at DESC);

-- request_images テーブルのインデックス
CREATE INDEX idx_request_images_request_id ON request_images(request_id);
CREATE INDEX idx_request_images_display_order ON request_images(request_id, display_order);

-- page_views テーブルのインデックス（最適化版）
CREATE INDEX idx_page_views_post_id ON page_views(post_id);
CREATE INDEX idx_page_views_viewed_at ON page_views(viewed_at DESC);
CREATE INDEX idx_page_views_post_viewed ON page_views(post_id, viewed_at);

-- age_verifications テーブルのインデックス
CREATE INDEX idx_age_verifications_user_id ON age_verifications(user_id);
CREATE INDEX idx_age_verifications_verified_at ON age_verifications(verified_at);

-- 集計テーブルのインデックス
CREATE INDEX idx_post_view_counts_total_views ON post_view_counts(total_views DESC);
CREATE INDEX idx_post_like_counts_total_likes ON post_like_counts(total_likes DESC);
CREATE INDEX idx_post_view_counts_daily_views ON post_view_counts USING GIN(daily_views);
CREATE INDEX idx_post_view_counts_weekly_views ON post_view_counts USING GIN(weekly_views);
CREATE INDEX idx_post_view_counts_monthly_views ON post_view_counts USING GIN(monthly_views);
CREATE INDEX idx_post_like_counts_daily_likes ON post_like_counts USING GIN(daily_likes);
CREATE INDEX idx_post_like_counts_weekly_likes ON post_like_counts USING GIN(weekly_likes);
CREATE INDEX idx_post_like_counts_monthly_likes ON post_like_counts USING GIN(monthly_likes);

-- Row Level Security (RLS) の有効化
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE age_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_view_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_like_counts ENABLE ROW LEVEL SECURITY;

-- RLS ポリシーの作成

-- universities テーブルのポリシー
-- 全ユーザーが読み取り可能
CREATE POLICY "universities_read_policy" ON universities
    FOR SELECT USING (true);

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

-- creator_profiles テーブルのポリシー
-- 全ユーザーが読み取り可能
CREATE POLICY "creator_profiles_read_policy" ON creator_profiles
    FOR SELECT USING (true);

-- 自分の作家プロフィールのみ更新可能
CREATE POLICY "creator_profiles_update_policy" ON creator_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- 自分の作家プロフィールのみ削除可能
CREATE POLICY "creator_profiles_delete_policy" ON creator_profiles
    FOR DELETE USING (auth.uid() = user_id);

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
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- post_tags テーブルのポリシー
-- 全ユーザーが読み取り可能
CREATE POLICY "post_tags_read_policy" ON post_tags
    FOR SELECT USING (true);

-- 投稿者のみタグ追加可能
CREATE POLICY "post_tags_insert_policy" ON post_tags
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM posts 
            WHERE posts.id = post_tags.post_id 
            AND posts.author_id = auth.uid()
        )
    );

-- 投稿者のみタグ削除可能
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
-- 依頼者または受注者のみ読み取り可能
CREATE POLICY "requests_read_policy" ON requests
    FOR SELECT USING (auth.uid() = client_id OR auth.uid() = creator_id);

-- 認証済みユーザーのみ依頼作成可能
CREATE POLICY "requests_insert_policy" ON requests
    FOR INSERT WITH CHECK (auth.uid() = client_id);

-- 依頼者または受注者のみ更新可能
CREATE POLICY "requests_update_policy" ON requests
    FOR UPDATE USING (auth.uid() = client_id OR auth.uid() = creator_id);

-- 依頼者または受注者のみ削除可能
CREATE POLICY "requests_delete_policy" ON requests
    FOR DELETE USING (auth.uid() = client_id OR auth.uid() = creator_id);

-- request_images テーブルのポリシー
-- 依頼者または受注者のみ読み取り可能
CREATE POLICY "request_images_read_policy" ON request_images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM requests 
            WHERE requests.id = request_images.request_id 
            AND (requests.client_id = auth.uid() OR requests.creator_id = auth.uid())
        )
    );

-- 依頼者のみ画像追加可能
CREATE POLICY "request_images_insert_policy" ON request_images
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM requests 
            WHERE requests.id = request_images.request_id 
            AND requests.client_id = auth.uid()
        )
    );

-- 依頼者または受注者のみ画像更新・削除可能
CREATE POLICY "request_images_update_policy" ON request_images
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM requests 
            WHERE requests.id = request_images.request_id 
            AND (requests.client_id = auth.uid() OR requests.creator_id = auth.uid())
        )
    );

CREATE POLICY "request_images_delete_policy" ON request_images
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM requests 
            WHERE requests.id = request_images.request_id 
            AND (requests.client_id = auth.uid() OR requests.creator_id = auth.uid())
        )
    );

-- page_views テーブルのポリシー
-- 全ユーザーが読み取り可能
CREATE POLICY "page_views_read_policy" ON page_views
    FOR SELECT USING (true);

-- 認証済みユーザーのみPV記録可能
CREATE POLICY "page_views_insert_policy" ON page_views
    FOR INSERT WITH CHECK (true);

-- age_verifications テーブルのポリシー
-- 自分の年齢確認記録のみ読み取り可能
CREATE POLICY "age_verifications_read_policy" ON age_verifications
    FOR SELECT USING (auth.uid() = user_id);

-- 認証済みユーザーのみ年齢確認記録作成可能
CREATE POLICY "age_verifications_insert_policy" ON age_verifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 自分の年齢確認記録のみ削除可能
CREATE POLICY "age_verifications_delete_policy" ON age_verifications
    FOR DELETE USING (auth.uid() = user_id);

-- 集計テーブルのポリシー
-- 全ユーザーが読み取り可能
CREATE POLICY "post_view_counts_read_policy" ON post_view_counts
    FOR SELECT USING (true);

CREATE POLICY "post_like_counts_read_policy" ON post_like_counts
    FOR SELECT USING (true);

-- トリガー関数の作成
-- updated_at フィールドの自動更新用

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- requests テーブルにトリガーを設定
CREATE TRIGGER update_requests_updated_at 
    BEFORE UPDATE ON requests 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Phase 1 最適化: 集計更新とデータクリーンアップ関数

-- 閲覧数集計更新関数
CREATE OR REPLACE FUNCTION update_view_counts()
RETURNS void AS $$
BEGIN
    -- 日別閲覧数の更新
    INSERT INTO post_view_counts (post_id, daily_views, total_views)
    SELECT 
        post_id,
        jsonb_object_agg(
            TO_CHAR(viewed_at, 'YYYY-MM-DD'),
            COUNT(*)
        ) as daily_views,
        COUNT(*) as total_views
    FROM page_views 
    WHERE viewed_at >= NOW() - INTERVAL '30 days'
    GROUP BY post_id
    ON CONFLICT (post_id) DO UPDATE SET
        daily_views = EXCLUDED.daily_views,
        total_views = EXCLUDED.total_views,
        last_updated = NOW();
    
    -- 週別閲覧数の更新
    UPDATE post_view_counts SET
        weekly_views = (
            SELECT jsonb_object_agg(
                TO_CHAR(viewed_at, 'IYYY-"W"IW'),
                COUNT(*)
            )
            FROM page_views 
            WHERE post_id = post_view_counts.post_id
            AND viewed_at >= NOW() - INTERVAL '12 weeks'
            GROUP BY TO_CHAR(viewed_at, 'IYYY-"W"IW')
        ),
        last_updated = NOW()
    WHERE post_id IN (
        SELECT DISTINCT post_id FROM page_views 
        WHERE viewed_at >= NOW() - INTERVAL '12 weeks'
    );
    
    -- 月別閲覧数の更新
    UPDATE post_view_counts SET
        monthly_views = (
            SELECT jsonb_object_agg(
                TO_CHAR(viewed_at, 'YYYY-MM'),
                COUNT(*)
            )
            FROM page_views 
            WHERE post_id = post_view_counts.post_id
            AND viewed_at >= NOW() - INTERVAL '12 months'
            GROUP BY TO_CHAR(viewed_at, 'YYYY-MM')
        ),
        last_updated = NOW()
    WHERE post_id IN (
        SELECT DISTINCT post_id FROM page_views 
        WHERE viewed_at >= NOW() - INTERVAL '12 months'
    );
END;
$$ LANGUAGE plpgsql;

-- いいね数集計更新関数
CREATE OR REPLACE FUNCTION update_like_counts()
RETURNS void AS $$
BEGIN
    -- 日別いいね数の更新
    INSERT INTO post_like_counts (post_id, daily_likes, total_likes)
    SELECT 
        post_id,
        jsonb_object_agg(
            TO_CHAR(created_at, 'YYYY-MM-DD'),
            COUNT(*)
        ) as daily_likes,
        COUNT(*) as total_likes
    FROM likes 
    WHERE created_at >= NOW() - INTERVAL '90 days'
    GROUP BY post_id
    ON CONFLICT (post_id) DO UPDATE SET
        daily_likes = EXCLUDED.daily_likes,
        total_likes = EXCLUDED.total_likes,
        last_updated = NOW();
    
    -- 週別いいね数の更新
    UPDATE post_like_counts SET
        weekly_likes = (
            SELECT jsonb_object_agg(
                TO_CHAR(created_at, 'IYYY-"W"IW'),
                COUNT(*)
            )
            FROM likes 
            WHERE post_id = post_like_counts.post_id
            AND created_at >= NOW() - INTERVAL '12 weeks'
            GROUP BY TO_CHAR(created_at, 'IYYY-"W"IW')
        ),
        last_updated = NOW()
    WHERE post_id IN (
        SELECT DISTINCT post_id FROM likes 
        WHERE created_at >= NOW() - INTERVAL '12 weeks'
    );
    
    -- 月別いいね数の更新
    UPDATE post_like_counts SET
        monthly_likes = (
            SELECT jsonb_object_agg(
                TO_CHAR(created_at, 'YYYY-MM'),
                COUNT(*)
            )
            FROM likes 
            WHERE post_id = post_like_counts.post_id
            AND created_at >= NOW() - INTERVAL '12 months'
            GROUP BY TO_CHAR(created_at, 'YYYY-MM')
        ),
        last_updated = NOW()
    WHERE post_id IN (
        SELECT DISTINCT post_id FROM likes 
        WHERE created_at >= NOW() - INTERVAL '12 months'
    );
END;
$$ LANGUAGE plpgsql;

-- 古いpage_viewsデータの自動削除関数
CREATE OR REPLACE FUNCTION cleanup_old_page_views()
RETURNS void AS $$
BEGIN
    -- 30日以上古いpage_viewsを削除
    DELETE FROM page_views 
    WHERE viewed_at < NOW() - INTERVAL '30 days';
    
    -- 集計テーブルを更新
    PERFORM update_view_counts();
END;
$$ LANGUAGE plpgsql;

-- 古いlikesデータの自動削除関数
CREATE OR REPLACE FUNCTION cleanup_old_likes()
RETURNS void AS $$
BEGIN
    -- 90日以上古いlikesを削除（ランキング計算に影響なし）
    DELETE FROM likes 
    WHERE created_at < NOW() - INTERVAL '90 days';
    
    -- 集計テーブルを更新
    PERFORM update_like_counts();
END;
$$ LANGUAGE plpgsql;

-- トリガー関数: 新しいpage_view追加時の自動集計更新
CREATE OR REPLACE FUNCTION page_views_update_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- 該当投稿の閲覧数を即座に更新
    INSERT INTO post_view_counts (post_id, daily_views, total_views)
    VALUES (
        NEW.post_id,
        jsonb_build_object(
            TO_CHAR(NEW.viewed_at, 'YYYY-MM-DD'),
            1
        ),
        1
    )
    ON CONFLICT (post_id) DO UPDATE SET
        daily_views = post_view_counts.daily_views || 
            jsonb_build_object(
                TO_CHAR(NEW.viewed_at, 'YYYY-MM-DD'),
                COALESCE(
                    (post_view_counts.daily_views->>TO_CHAR(NEW.viewed_at, 'YYYY-MM-DD'))::integer,
                    0
                ) + 1
            ),
        total_views = post_view_counts.total_views + 1,
        last_updated = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガー関数: 新しいlike追加時の自動集計更新
CREATE OR REPLACE FUNCTION likes_update_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- 該当投稿のいいね数を即座に更新
    INSERT INTO post_like_counts (post_id, daily_likes, total_likes)
    VALUES (
        NEW.post_id,
        jsonb_build_object(
            TO_CHAR(NEW.created_at, 'YYYY-MM-DD'),
            1
        ),
        1
    )
    ON CONFLICT (post_id) DO UPDATE SET
        daily_likes = post_like_counts.daily_likes || 
            jsonb_build_object(
                TO_CHAR(NEW.created_at, 'YYYY-MM-DD'),
                COALESCE(
                    (post_like_counts.daily_likes->>TO_CHAR(NEW.created_at, 'YYYY-MM-DD'))::integer,
                    0
                ) + 1
            ),
        total_likes = post_like_counts.total_likes + 1,
        last_updated = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガーの設定
CREATE TRIGGER page_views_update_trigger
    AFTER INSERT ON page_views
    FOR EACH ROW
    EXECUTE FUNCTION page_views_update_trigger();

CREATE TRIGGER likes_update_trigger
    AFTER INSERT ON likes
    FOR EACH ROW
    EXECUTE FUNCTION likes_update_trigger();

-- サンプルデータの挿入

-- 大学データ
INSERT INTO universities (name, display_order) VALUES
('東京大学', 1),
('京都大学', 2),
('大阪大学', 3),
('名古屋大学', 4),
('東北大学', 5),
('九州大学', 6),
('北海道大学', 7),
('早稲田大学', 8),
('慶應義塾大学', 9),
('上智大学', 10);

-- サンプルタグ
INSERT INTO tags (name) VALUES
('オリジナル'),
('風景'),
('人物'),
('動物'),
('ファンタジー'),
('SF'),
('日常'),
('アクション'),
('恋愛'),
('コメディ');

-- データベース関数の作成
-- 週間ランキング計算用（最適化版）

CREATE OR REPLACE FUNCTION calculate_weekly_ranking()
RETURNS TABLE (
    post_id BIGINT,
    title TEXT,
    author_name TEXT,
    university TEXT,
    total_score NUMERIC,
    view_count BIGINT,
    like_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.title,
        pr.display_name,
        pr.university,
        -- 集計テーブルから直接取得（高速化）
        (COALESCE(pvc.total_views, 0) * 0.1 + COALESCE(plc.total_likes, 0) * 1.0) * 
        GREATEST(0.1, 1.0 - EXTRACT(EPOCH FROM (NOW() - p.created_at)) / (7 * 24 * 3600)) as total_score,
        COALESCE(pvc.total_views, 0) as view_count,
        COALESCE(plc.total_likes, 0) as like_count
    FROM posts p
    JOIN profiles pr ON p.author_id = pr.id
    LEFT JOIN post_view_counts pvc ON p.id = pvc.post_id
    LEFT JOIN post_like_counts plc ON p.id = plc.post_id
    WHERE p.created_at >= NOW() - INTERVAL '30 days'
    ORDER BY total_score DESC
    LIMIT 100;
END;
$$ LANGUAGE plpgsql;

-- 定期実行のための関数（Supabase Edge Functionsで実装推奨）
-- 毎日午前2時に古いデータをクリーンアップ
CREATE OR REPLACE FUNCTION scheduled_cleanup()
RETURNS void AS $$
BEGIN
    -- 古いpage_viewsを削除
    PERFORM cleanup_old_page_views();
    
    -- 古いlikesを削除
    PERFORM cleanup_old_likes();
    
    -- 集計テーブルの更新
    PERFORM update_view_counts();
    PERFORM update_like_counts();
END;
$$ LANGUAGE plpgsql;
