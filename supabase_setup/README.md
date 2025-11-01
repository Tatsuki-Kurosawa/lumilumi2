# Supabase 集計関数のセットアップ手順

このドキュメントでは、PV数といいね数の期間別集計機能をSupabaseにセットアップする手順を説明します。

## 📋 概要

以下の期間で集計を行います：
- **daily**: 過去24時間
- **weekly**: 過去7日間
- **monthly**: 当月（JST 00:00から）
- **total**: 全期間

集計は1時間ごとに自動実行されます（毎時0分）。

## 🛠️ セットアップ手順

### 1. 必要なテーブルの確認

以下のテーブルが存在することを確認してください：

- `page_views`: PV記録テーブル
- `post_view_counts`: PV数集計テーブル（`post_id`, `daily_views`, `weekly_views`, `monthly_views`, `total_views`, `last_updated`）
- `likes`: いいね記録テーブル
- `post_like_counts`: いいね数集計テーブル（`post_id`, `daily_likes`, `weekly_likes`, `monthly_likes`, `total_likes`, `last_updated`）

### 2. pg_cron拡張機能の有効化

1. Supabaseダッシュボードにログイン
2. プロジェクトを選択
3. 左メニューから「Database」→「Extensions」を選択
4. 「pg_cron」を検索して有効化（Enable）をクリック

### 3. SQL関数の作成

1. Supabaseダッシュボードで「SQL Editor」を開く
2. `aggregate_views_and_likes.sql`の内容をコピー＆ペースト
3. 「Run」をクリックして実行

または、Supabase CLIを使用する場合：

```bash
supabase db execute --file supabase_setup/aggregate_views_and_likes.sql
```

### 4. スケジュールの確認

SQL Editorで以下のクエリを実行して、スケジュールが正しく設定されているか確認：

```sql
SELECT * FROM cron.job WHERE jobname = 'aggregate-views-likes-hourly';
```

結果として、1件のレコードが返れば正常です。

### 5. 手動実行（テスト）

集計関数が正しく動作するかテストする場合：

```sql
-- PV数だけ集計
SELECT aggregate_page_views();

-- いいね数だけ集計
SELECT aggregate_likes();

-- 両方集計
SELECT aggregate_views_and_likes();
```

実行後、`post_view_counts`と`post_like_counts`テーブルを確認して、値が正しく更新されているか確認してください。

## 📊 集計タイミング

- **自動実行**: 毎時0分（例：1:00, 2:00, 3:00...）
- **集計期間の基準時刻**: JST（日本標準時）

## 🔧 トラブルシューティング

### スケジュールが実行されない

1. pg_cronが有効になっているか確認
2. スケジュールが正しく登録されているか確認：
   ```sql
   SELECT * FROM cron.job;
   ```
3. cronのログを確認：
   ```sql
   SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
   ```

### 集計値が0になる

1. `page_views`と`likes`テーブルにデータが存在するか確認
2. `is_unique`フィールドが正しく設定されているか確認（PVの場合）
3. `created_at`フィールドのタイムゾーンが正しいか確認

### タイムゾーンが合わない

集計関数内で`AT TIME ZONE 'Asia/Tokyo'`を使用しているため、Supabaseのタイムゾーン設定に関係なくJSTで計算されます。問題がある場合は、関数内のタイムゾーン処理を確認してください。

## 📝 注意事項

- 初回実行時は、過去の全データが集計対象になります
- 大量のデータがある場合、初回実行に時間がかかる可能性があります
- 集計関数は冪等性（何度実行しても同じ結果になる）を保証しています
- `last_updated`フィールドで最後の更新時刻を追跡できます

## 🔄 スケジュールの削除（必要に応じて）

```sql
SELECT cron.unschedule('aggregate-views-likes-hourly');
```

