-- =====================================================
-- PV数といいね数の期間別集計関数
-- =====================================================
-- 集計期間：
-- - daily: 過去24時間
-- - weekly: 過去7日間
-- - monthly: 当月（JST 00:00から）
-- 
-- 実行頻度：1時間ごとに自動実行（pg_cronで設定）
-- =====================================================

-- タイムゾーン設定（JST = UTC+9）
SET timezone = 'Asia/Tokyo';

-- =====================================================
-- PV数の集計関数
-- =====================================================

-- post_view_countsテーブルを更新する関数
CREATE OR REPLACE FUNCTION aggregate_page_views()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_now timestamp with time zone;
  v_24h_ago timestamp with time zone;
  v_7d_ago timestamp with time zone;
  v_month_start timestamp with time zone;
BEGIN
  -- 現在時刻（JST）
  v_now := NOW() AT TIME ZONE 'Asia/Tokyo';
  
  -- 過去24時間
  v_24h_ago := v_now - INTERVAL '24 hours';
  
  -- 過去7日間
  v_7d_ago := v_now - INTERVAL '7 days';
  
  -- 当月の開始時刻（JST 00:00）
  v_month_start := date_trunc('month', v_now) AT TIME ZONE 'Asia/Tokyo';
  
  -- post_view_countsテーブルをupsertで更新
  INSERT INTO post_view_counts (
    post_id,
    daily_views,
    weekly_views,
    monthly_views,
    total_views,
    last_updated
  )
  SELECT 
    pv.post_id,
    -- 過去24時間のPV数（is_unique=trueのみ）
    COUNT(*) FILTER (WHERE pv.viewed_at >= v_24h_ago AND pv.is_unique = true) as daily_views,
    -- 過去7日間のPV数（is_unique=trueのみ）
    COUNT(*) FILTER (WHERE pv.viewed_at >= v_7d_ago AND pv.is_unique = true) as weekly_views,
    -- 当月のPV数（is_unique=trueのみ）
    COUNT(*) FILTER (WHERE pv.viewed_at >= v_month_start AND pv.is_unique = true) as monthly_views,
    -- 全期間のPV数（is_unique=trueのみ）
    COUNT(*) FILTER (WHERE pv.is_unique = true) as total_views,
    v_now as last_updated
  FROM page_views pv
  GROUP BY pv.post_id
  ON CONFLICT (post_id) 
  DO UPDATE SET
    daily_views = EXCLUDED.daily_views,
    weekly_views = EXCLUDED.weekly_views,
    monthly_views = EXCLUDED.monthly_views,
    total_views = EXCLUDED.total_views,
    last_updated = EXCLUDED.last_updated;
END;
$$;

-- =====================================================
-- いいね数の集計関数（post_like_countsテーブル用）
-- =====================================================

CREATE OR REPLACE FUNCTION aggregate_likes()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_now timestamp with time zone;
  v_24h_ago timestamp with time zone;
  v_7d_ago timestamp with time zone;
  v_month_start timestamp with time zone;
BEGIN
  -- 現在時刻（JST）
  v_now := NOW() AT TIME ZONE 'Asia/Tokyo';
  
  -- 過去24時間
  v_24h_ago := v_now - INTERVAL '24 hours';
  
  -- 過去7日間
  v_7d_ago := v_now - INTERVAL '7 days';
  
  -- 当月の開始時刻（JST 00:00）
  v_month_start := date_trunc('month', v_now) AT TIME ZONE 'Asia/Tokyo';
  
  -- likesテーブルから集計（countフィールドの合計を使用）
  INSERT INTO post_like_counts (
    post_id,
    daily_likes,
    weekly_likes,
    monthly_likes,
    total_likes,
    last_updated
  )
  SELECT 
    l.post_id,
    -- 過去24時間のいいね数（countの合計）
    COALESCE(SUM(l.count) FILTER (WHERE l.created_at >= v_24h_ago), 0) as daily_likes,
    -- 過去7日間のいいね数（countの合計）
    COALESCE(SUM(l.count) FILTER (WHERE l.created_at >= v_7d_ago), 0) as weekly_likes,
    -- 当月のいいね数（countの合計）
    COALESCE(SUM(l.count) FILTER (WHERE l.created_at >= v_month_start), 0) as monthly_likes,
    -- 全期間のいいね数（countの合計）
    COALESCE(SUM(l.count), 0) as total_likes,
    v_now as last_updated
  FROM likes l
  GROUP BY l.post_id
  ON CONFLICT (post_id) 
  DO UPDATE SET
    daily_likes = EXCLUDED.daily_likes,
    weekly_likes = EXCLUDED.weekly_likes,
    monthly_likes = EXCLUDED.monthly_likes,
    total_likes = EXCLUDED.total_likes,
    last_updated = EXCLUDED.last_updated;
END;
$$;

-- =====================================================
-- ユーザープロフィールの総いいね数・総閲覧数を集計する関数
-- =====================================================

CREATE OR REPLACE FUNCTION aggregate_profile_totals()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- profilesテーブルのtotal_like_countsとtotal_view_countsを更新
  -- likesテーブルのcountカラムの合計を使用
  UPDATE profiles p
  SET 
    total_like_counts = COALESCE((
      SELECT SUM(l.count)
      FROM likes l
      INNER JOIN posts pt ON l.post_id = pt.id
      WHERE pt.author_id = p.id
    ), 0),
    total_view_counts = COALESCE((
      SELECT SUM(pvc.total_views)
      FROM post_view_counts pvc
      INNER JOIN posts pt ON pvc.post_id = pt.id
      WHERE pt.author_id = p.id
    ), 0)
  WHERE EXISTS (
    SELECT 1 FROM posts WHERE author_id = p.id
  );
END;
$$;

-- =====================================================
-- 統合集計関数（PV数といいね数を同時に集計）
-- =====================================================

CREATE OR REPLACE FUNCTION aggregate_views_and_likes()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- PV数を集計
  PERFORM aggregate_page_views();
  
  -- いいね数を集計
  PERFORM aggregate_likes();
  
  -- ユーザープロフィールの総いいね数・総閲覧数を集計
  PERFORM aggregate_profile_totals();
END;
$$;

-- =====================================================
-- pg_cronで1時間ごとに実行するスケジュール設定
-- =====================================================

-- 注意：pg_cron拡張機能が有効になっている必要があります
-- SupabaseダッシュボードのDatabase > Extensions で有効化してください

-- 1時間ごとに実行（毎時0分）
SELECT cron.schedule(
  'aggregate-views-likes-hourly',
  '0 * * * *',  -- cron形式：毎時0分
  $$SELECT aggregate_views_and_likes();$$
);

-- スケジュール確認
SELECT * FROM cron.job WHERE jobname = 'aggregate-views-likes-hourly';

-- =====================================================
-- 手動実行（テスト用）
-- =====================================================

-- PV数だけ集計
-- SELECT aggregate_page_views();

-- いいね数だけ集計
-- SELECT aggregate_likes();

-- プロフィールの総いいね数・総閲覧数だけ集計
-- SELECT aggregate_profile_totals();

-- 両方集計
-- SELECT aggregate_views_and_likes();

