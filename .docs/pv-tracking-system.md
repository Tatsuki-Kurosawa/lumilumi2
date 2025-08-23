# PV数管理システム 詳細仕様書

## 概要
このドキュメントでは、漫画・イラスト投稿プラットフォームにおけるPV数（ページビュー数）管理システムの詳細仕様について説明します。

## 1. システム概要

### 1.1 目的
- 作品の閲覧数を正確に記録
- 公平で正確なランキングシステムの実現
- ユーザー行動の分析と統計情報の提供

### 1.2 基本方針
- **正確性**: 重複アクセスを適切に処理
- **公平性**: 匿名ユーザーも含めた包括的な記録
- **効率性**: 大量データの効率的な処理
- **プライバシー**: 個人情報の最小化

## 2. データベース設計

### 2.1 page_views テーブル

```sql
CREATE TABLE page_views (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    viewed_at TIMESTAMPTZ DEFAULT NOW(),
    is_unique BOOLEAN DEFAULT TRUE
);
```

#### カラム詳細
- **id**: 一意のPV記録ID
- **post_id**: 閲覧された投稿のID
- **viewer_id**: 閲覧者のユーザーID（匿名ユーザーはNULL）
- **ip_address**: 閲覧者のIPアドレス
- **user_agent**: ブラウザ情報
- **viewed_at**: 閲覧日時
- **is_unique**: 重複アクセスフラグ

### 2.2 インデックス戦略

```sql
-- 基本的な検索用インデックス
CREATE INDEX idx_page_views_post_id ON page_views(post_id);
CREATE INDEX idx_page_views_viewed_at ON page_views(viewed_at DESC);

-- 複合検索用インデックス
CREATE INDEX idx_page_views_post_viewed ON page_views(post_id, viewed_at);
CREATE INDEX idx_page_views_unique ON page_views(post_id, viewer_id, viewed_at);

-- IPアドレス検索用インデックス
CREATE INDEX idx_page_views_ip_address ON page_views(ip_address);
```

## 3. 重複アクセス処理

### 3.1 重複判定ルール

#### 同一ユーザーからの重複
- **24時間ルール**: 同一ユーザーが同じ投稿を24時間以内に再訪問した場合
- **処理**: `is_unique = false` に設定

#### 同一IPアドレスからの重複
- **1分ルール**: 同一IPアドレスから1分以内に同じ投稿にアクセスした場合
- **目的**: ボットアクセスやリフレッシュ攻撃の防止

### 3.2 重複防止トリガー

```sql
CREATE OR REPLACE FUNCTION prevent_duplicate_page_views()
RETURNS TRIGGER AS $$
BEGIN
    -- 同一ユーザーの24時間以内重複チェック
    IF EXISTS (
        SELECT 1 FROM page_views 
        WHERE post_id = NEW.post_id 
        AND viewer_id = NEW.viewer_id 
        AND viewer_id IS NOT NULL
        AND viewed_at > NEW.viewed_at - INTERVAL '24 hours'
        AND id != NEW.id
    ) THEN
        NEW.is_unique := FALSE;
    END IF;
    
    -- 同一IPの1分以内重複チェック
    IF EXISTS (
        SELECT 1 FROM page_views 
        WHERE post_id = NEW.post_id 
        AND ip_address = NEW.ip_address
        AND viewed_at > NEW.viewed_at - INTERVAL '1 minute'
        AND id != NEW.id
    ) THEN
        NEW.is_unique := FALSE;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## 4. PV数集計関数

### 4.1 基本PV数取得

```sql
CREATE OR REPLACE FUNCTION get_page_view_count(post_id_param BIGINT)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM page_views
        WHERE post_id = post_id_param
        AND is_unique = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 4.2 期間別PV数取得

```sql
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
```

## 5. ランキング計算システム

### 5.1 スコア計算式

```
総合スコア = (PV数 × 0.1 + いいね数 × 1.0) × 時間減衰係数
```

#### 各要素の重み
- **PV数**: 0.1倍（閲覧は軽い関心）
- **いいね数**: 1.0倍（積極的な評価）
- **時間減衰**: 新しい投稿ほど高スコア

### 5.2 時間減衰係数

```sql
time_decay_factor := GREATEST(1.0 - (経過日数 × 0.02), 0.1)
```

#### 計算例
- 投稿当日: 1.0
- 投稿から10日後: 0.8
- 投稿から30日後: 0.4
- 投稿から45日後: 0.1（最小値）

### 5.3 実装例

```sql
CREATE OR REPLACE FUNCTION calculate_post_score_v2(post_id_param BIGINT)
RETURNS INTEGER AS $$
DECLARE
    like_count INTEGER;
    pv_count INTEGER;
    days_since_creation INTEGER;
    time_decay_factor DECIMAL(10,3);
BEGIN
    -- いいね数とPV数を取得
    SELECT get_like_count(post_id_param), get_page_view_count(post_id_param)
    INTO like_count, pv_count;
    
    -- 経過日数を計算
    SELECT EXTRACT(DAY FROM NOW() - created_at)::INTEGER
    INTO days_since_creation
    FROM posts
    WHERE id = post_id_param;
    
    -- 時間減衰係数を計算
    time_decay_factor := GREATEST(1.0 - (COALESCE(days_since_creation, 0) * 0.02), 0.1);
    
    -- 総合スコアを計算
    RETURN (
        (COALESCE(pv_count, 0) * 0.1 + COALESCE(like_count, 0) * 1.0) * 
        time_decay_factor
    )::INTEGER;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 6. フロントエンド実装

### 6.1 PV数記録のタイミング

#### 記録タイミング
- ページ読み込み完了時
- ユーザーがページに一定時間滞在した時（例：30秒以上）

#### 記録データ
```typescript
interface PageViewData {
  post_id: number;
  viewer_id?: string; // ログインユーザーの場合
  ip_address?: string; // サーバーサイドで取得
  user_agent: string;
}
```

### 6.2 重複防止の実装

#### クライアントサイド
```typescript
// ローカルストレージで重複チェック
const checkDuplicateView = (postId: number): boolean => {
  const key = `viewed_${postId}`;
  const lastViewed = localStorage.getItem(key);
  const now = Date.now();
  
  if (lastViewed && (now - parseInt(lastViewed)) < 24 * 60 * 60 * 1000) {
    return true; // 24時間以内に閲覧済み
  }
  
  localStorage.setItem(key, now.toString());
  return false;
};
```

#### サーバーサイド
```typescript
// API Routeでの重複チェック
export async function POST(req: Request) {
  const { post_id, viewer_id, user_agent } = await req.json();
  const ip_address = getClientIP(req);
  
  // 重複チェック
  const isDuplicate = await checkDuplicateView(post_id, viewer_id, ip_address);
  
  if (!isDuplicate) {
    await recordPageView({
      post_id,
      viewer_id,
      ip_address,
      user_agent
    });
  }
}
```

## 7. パフォーマンス最適化

### 7.1 データアーカイブ

#### アーカイブ戦略
- **3ヶ月以上前のデータ**: 月次集計テーブルに移行
- **1年以上前のデータ**: 年次集計テーブルに移行
- **詳細データ**: 圧縮して長期保存

#### アーカイブテーブル例
```sql
CREATE TABLE page_views_monthly (
    year_month DATE PRIMARY KEY,
    post_id BIGINT,
    total_views INTEGER,
    unique_views INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 7.2 キャッシュ戦略

#### Redisキャッシュ
```typescript
// PV数のキャッシュ
const getCachedPageViewCount = async (postId: number): Promise<number> => {
  const cacheKey = `pv_count_${postId}`;
  let count = await redis.get(cacheKey);
  
  if (!count) {
    count = await getPageViewCount(postId);
    await redis.setex(cacheKey, 300, count); // 5分間キャッシュ
  }
  
  return parseInt(count);
};
```

## 8. セキュリティ対策

### 8.1 ボット対策

#### User-Agent判定
```typescript
const isBot = (userAgent: string): boolean => {
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i
  ];
  
  return botPatterns.some(pattern => pattern.test(userAgent));
};
```

#### レート制限
```typescript
// IPアドレスベースのレート制限
const rateLimit = new Map<string, { count: number; resetTime: number }>();

const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const limit = rateLimit.get(ip);
  
  if (!limit || now > limit.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + 60000 }); // 1分間
    return true;
  }
  
  if (limit.count >= 100) { // 1分間に100回まで
    return false;
  }
  
  limit.count++;
  return true;
};
```

### 8.2 プライバシー保護

#### データ最小化
- IPアドレスの部分マスキング
- 個人を特定できる情報の除外
- データ保持期間の制限

#### 匿名化処理
```typescript
const anonymizeIP = (ip: string): string => {
  // IPv4の場合、最後のオクテットをマスク
  if (ip.includes('.')) {
    return ip.replace(/\.\d+$/, '.*');
  }
  // IPv6の場合、最後の64ビットをマスク
  return ip.replace(/:[^:]*$/, ':****');
};
```

## 9. 監視とメンテナンス

### 9.1 パフォーマンス監視

#### クエリパフォーマンス
```sql
-- スロークエリの特定
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements
WHERE mean_time > 1000 -- 1秒以上かかるクエリ
ORDER BY mean_time DESC;
```

#### テーブルサイズ監視
```sql
-- テーブルサイズの確認
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### 9.2 データクリーンアップ

#### 定期的なクリーンアップ
```sql
-- 古いPVデータの削除（1年以上前）
DELETE FROM page_views 
WHERE viewed_at < NOW() - INTERVAL '1 year';

-- 重複フラグがfalseのデータの削除（3ヶ月以上前）
DELETE FROM page_views 
WHERE is_unique = false 
AND viewed_at < NOW() - INTERVAL '3 months';
```

## 10. 今後の拡張性

### 10.1 高度な分析機能
- **ユーザー行動分析**: 閲覧パターンの分析
- **コンテンツ分析**: 人気タグやジャンルの特定
- **時間帯分析**: アクティブ時間の特定

### 10.2 リアルタイム機能
- **ライブカウンター**: リアルタイムPV数表示
- **トレンド分析**: 急上昇作品の検出
- **通知機能**: 人気作品の更新通知

### 10.3 機械学習連携
- **推薦システム**: PV数とユーザー行動に基づく作品推薦
- **異常検知**: 不正アクセスの自動検出
- **予測分析**: 将来の人気度予測
