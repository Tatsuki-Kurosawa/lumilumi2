# 漫画・イラスト投稿プラットフォーム データベース設計書

## 概要
このドキュメントは、Supabaseを使用した漫画・イラスト投稿プラットフォームのデータベース設計について説明します。

## データベース設計の基本方針
- **正規化**: データの重複をなくし、整合性を保つためにテーブルを適切に分割
- **命名規則**: テーブル名は複数形のsnake_case、カラム名は単数形のsnake_caseに統一
- **Supabase連携**: Supabaseの認証機能やストレージとの連携を前提として設計
- **セキュリティ**: Row Level Security (RLS) を必ず有効化

## テーブル設計

### 1. profiles テーブル (ユーザープロフィール) 🧑‍🎨
Supabaseの認証（auth.users）テーブルとは別に、公開用のプロフィール情報を格納します。

| カラム名 | データ型 | 説明 |
| :--- | :--- | :--- |
| id | uuid | 主キー🔑。auth.users.idと連携するユーザー固有ID |
| username | text | 一意。@以降を含まないユニークなID名 (例: taro_yamada) |
| display_name | text | 画面に表示される名前 (例: 太郎) |
| university | text | 所属大学名 |
| status | text | ユーザー区分 (student, ob, og のいずれか) |
| avatar_url | text | プロフィール画像のURL。Supabase Storageと連携 |
| bio | text | 自己紹介文 |
| created_at | timestamptz | 作成日時 |

**ポイント**: 
- idはSupabaseの認証ユーザーが作成された際に自動で生成されるidと同期
- display_nameは"太郎@大学名og"のように、フロントエンド側でdisplay_name, university, statusを組み合わせて表示

### 2. posts テーブル (投稿作品) 🖼️
ユーザーが投稿する漫画やイラストの基本情報を格納します。

| カラム名 | データ型 | 説明 |
| :--- | :--- | :--- |
| id | bigint | 主キー🔑。自動採番される投稿ID |
| author_id | uuid | 外部キー🔗。投稿者ID (profiles.idを参照) |
| type | text | 作品種別 (manga, illustration のいずれか) |
| title | text | 作品タイトル |
| thumbnail_url | text | サムネイル画像のURL |
| is_r18 | boolean | R-18フラグ。デフォルトはfalse |
| created_at | timestamptz | 投稿日時 |

### 3. post_images テーブル (投稿画像) 📚
1つの投稿に複数枚の画像を紐付けるための中間テーブルです。

| カラム名 | データ型 | 説明 |
| :--- | :--- | :--- |
| id | bigint | 主キー🔑。自動採番 |
| post_id | bigint | 外部キー🔗。どの投稿に属するか (posts.idを参照) |
| image_url | text | 画像ファイルのURL。Supabase Storageと連携 |
| display_order | integer | 画像の表示順序 (1, 2, 3...) |

### 4. tags テーブル & post_tags テーブル (タグ) 🏷️
投稿とタグの多対多の関係を管理します。

**tags テーブル**
| カラム名 | データ型 | 説明 |
| :--- | :--- | :--- |
| id | bigint | 主キー🔑。自動採番 |
| name | text | 一意。タグ名 (例: オリジナル, 風景) |

**post_tags テーブル (中間テーブル)**
| カラム名 | データ型 | 説明 |
| :--- | :--- | :--- |
| post_id | bigint | 複合主キー🔑, 外部キー🔗 (posts.idを参照) |
| tag_id | bigint | 複合主キー🔑, 外部キー🔗 (tags.idを参照) |

### 5. likes テーブル (いいね) ❤️
誰がどの投稿に「いいね」したかを記録します。

| カラム名 | データ型 | 説明 |
| :--- | :--- | :--- |
| user_id | uuid | 複合主キー🔑, 外部キー🔗 (profiles.idを参照) |
| post_id | bigint | 複合主キー🔑, 外部キー🔗 (posts.idを参照) |
| created_at | timestamptz | いいねした日時 |

### 6. follows テーブル (フォロー) 👋
ユーザー間のフォロー関係を記録します。

| カラム名 | データ型 | 説明 |
| :--- | :--- | :--- |
| follower_id | uuid | 複合主キー🔑, 外部キー🔗。フォローする側 (profiles.idを参照) |
| following_id | uuid | 複合主キー🔑, 外部キー🔗。フォローされる側 (profiles.idを参照) |
| created_at | timestamptz | フォローした日時 |

### 7. requests テーブル (依頼) 🤝
Skebを参考にした依頼機能を管理します。

| カラム名 | データ型 | 説明 |
| :--- | :--- | :--- |
| id | bigint | 主キー🔑。自動採番 |
| client_id | uuid | 外部キー🔗。依頼者 (profiles.idを参照) |
| creator_id | uuid | 外部キー🔗。受注者 (profiles.idを参照) |
| request_type | text | 依頼種別 (critique, commissionなど) |
| status | text | 依頼状況 (pending, accepted, completedなど) |
| body | text | 依頼内容の詳細 |
| price | integer | 依頼金額 |
| deadline_delivery | timestamptz | 納品期限 |
| delivered_image_url | text | 納品された作品のURL |
| created_at | timestamptz | 依頼日時 |

### 8. page_views テーブル (ページビュー) 👁️
作品の閲覧数（PV数）を記録し、ランキング計算に使用します。

| カラム名 | データ型 | 説明 |
| :--- | :--- | :--- |
| id | bigint | 主キー🔑。自動採番 |
| post_id | bigint | 外部キー🔗。閲覧された投稿 (posts.idを参照) |
| viewer_id | uuid | 外部キー🔗。閲覧者ID (profiles.idを参照、匿名ユーザーはNULL) |
| ip_address | inet | 閲覧者のIPアドレス（重複カウント防止用） |
| user_agent | text | ユーザーエージェント（ボット判定用） |
| viewed_at | timestamptz | 閲覧日時 |
| is_unique | boolean | 重複アクセスフラグ（同一ユーザーからの重複はfalse） |

## ランキングについて
ランキングはテーブルとして持つべきではありません。ランキングは「PV数」や「いいね数」から集計して作られる結果です。

### PV数管理の重要性
- **正確性**: 単純な「いいね数」だけでは公平なランキングが困難
- **時間性**: 新しい投稿と古い投稿の公平な比較が必要
- **重複防止**: 同一ユーザーからの重複アクセスを適切に処理

### ランキング計算の仕組み
1. **PV数**: `page_views`テーブルから重複を除いたユニーク閲覧数を集計
2. **いいね数**: `likes`テーブルからいいね数を集計
3. **時間減衰**: 投稿からの経過日数に基づく重み付け
4. **総合スコア**: (PV数 × 0.1 + いいね数 × 1.0) × 時間減衰係数

Supabaseのデータベース関数 (Function) やビュー (View) を作成し、定期的に（例: 1週間に1回）likesテーブルとpage_viewsテーブルを集計してランキングを生成するのが最適な方法です。

## Supabase特有のポイント (重要)

### Row Level Security (RLS)
必ず有効にしてください。

**例1**: profilesテーブルは、自分自身のidと一致する行しか更新できない
**例2**: postsテーブルの作成は、author_idが自分自身のidである場合のみ許可する

### Storage
画像ファイルはSupabase Storageにアップロードし、そのURLを各テーブルの..._urlカラムに保存します。RLSと連携させて、権限のあるユーザーのみがアップロードできるように設定します。

## 制約とインデックス

### 制約
- 外部キー制約: 適切な参照整合性を保つ
- CHECK制約: statusフィールドの値チェック
- UNIQUE制約: username, タグ名の重複防止

### インデックス
- 検索頻度の高いカラムにインデックスを作成
- 複合インデックス: よく使用される検索条件の組み合わせ

## マイグレーション戦略
1. 開発環境でのテーブル作成
2. テストデータでの動作確認
3. 本番環境への段階的デプロイ
4. データ移行（必要に応じて）

## 今後の拡張性
- 通知機能のためのnotificationsテーブル
- モデレーション機能のためのreportsテーブル
- 統計情報のためのanalyticsテーブル
- API使用量制限のためのrate_limitsテーブル
- PV数分析のためのpage_views_analyticsテーブル
- ユーザー行動分析のためのuser_behaviorテーブル
