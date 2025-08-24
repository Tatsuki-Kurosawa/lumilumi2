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
| is_creator | boolean | 作家として依頼受付するかどうか |
| created_at | timestamptz | 作成日時 |

**ポイント**: 
- idはSupabaseの認証ユーザーが作成された際に自動で生成されるidと同期
- display_nameは"太郎@大学名og"のように、フロントエンド側でdisplay_name, university, statusを組み合わせて表示

### 2. creator_profiles テーブル (作家プロフィール) 🎨
作家として依頼を受けるユーザーの詳細情報を格納します。

| カラム名 | データ型 | 説明 |
| :--- | :--- | :--- |
| id | bigint | 主キー🔑。自動採番 |
| user_id | uuid | 外部キー🔗。profiles.idを参照 |
| is_accepting_requests | boolean | 依頼受付可否 |
| critique_price | integer | 添削依頼の料金 |
| commission_price | integer | 制作依頼の料金 |
| specialties | text[] | 得意ジャンル・タグの配列 |
| portfolio_description | text | ポートフォリオの説明 |
| experience_years | integer | 経験年数 |
| created_at | timestamptz | 作成日時 |

### 3. posts テーブル (投稿作品) 🖼️
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

### 4. post_images テーブル (投稿画像) 📚
1つの投稿に複数枚の画像を紐付けるための中間テーブルです。

| カラム名 | データ型 | 説明 |
| :--- | :--- | :--- |
| id | bigint | 主キー🔑。自動採番 |
| post_id | bigint | 外部キー🔗。どの投稿に属するか (posts.idを参照) |
| image_url | text | 画像ファイルのURL。Supabase Storageと連携 |
| display_order | integer | 画像の表示順序 (1, 2, 3...) |

### 5. tags テーブル & post_tags テーブル (タグ) 🏷️
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

### 6. likes テーブル (いいね) ❤️
誰がどの投稿に「いいね」したかを記録します。

| カラム名 | データ型 | 説明 |
| :--- | :--- | :--- |
| user_id | uuid | 複合主キー🔑, 外部キー🔗 (profiles.idを参照) |
| post_id | bigint | 複合主キー🔑, 外部キー🔗 (posts.idを参照) |
| created_at | timestamptz | いいねした日時 |

### 7. follows テーブル (フォロー) 👋
ユーザー間のフォロー関係を記録します。

| カラム名 | データ型 | 説明 |
| :--- | :--- | :--- |
| follower_id | uuid | 複合主キー🔑, 外部キー🔗。フォローする側 (profiles.idを参照) |
| following_id | uuid | 複合主キー🔑, 外部キー🔗。フォローされる側 (profiles.idを参照) |
| created_at | timestamptz | フォローした日時 |

### 8. requests テーブル (依頼) 🤝
Skebを参考にした依頼機能を管理します。

| カラム名 | データ型 | 説明 |
| :--- | :--- | :--- |
| id | bigint | 主キー🔑。自動採番 |
| client_id | uuid | 外部キー🔗。依頼者 (profiles.idを参照) |
| creator_id | uuid | 外部キー🔗。受注者 (profiles.idを参照) |
| request_type | text | 依頼種別 (critique: 添削, commission: 制作) |
| status | text | 依頼状況 (pending: 待機中, accepted: 受諾, in_progress: 制作中, completed: 完了, cancelled: キャンセル) |
| title | text | 依頼タイトル |
| body | text | 依頼内容の詳細 |
| price | integer | 依頼金額 |
| deadline_delivery | timestamptz | 納品期限 |
| delivered_image_url | text | 納品された作品のURL |
| client_visibility | text | 依頼の可視性 (public: 公開, private: 非公開) |
| creator_visibility | text | 完成作品の可視性 (public: 公開, private: 非公開) |
| created_at | timestamptz | 依頼日時 |
| updated_at | timestamptz | 更新日時 |

### 9. request_images テーブル (依頼画像) 🖼️
依頼時に添付される参考画像を管理します。

| カラム名 | データ型 | 説明 |
| :--- | :--- | :--- |
| id | bigint | 主キー🔑。自動採番 |
| request_id | bigint | 外部キー🔗。requests.idを参照 |
| image_url | text | 画像ファイルのURL |
| display_order | integer | 表示順序 |

### 10. page_views テーブル (ページビュー) 👁️
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

### 11. universities テーブル (大学一覧) 🏫
大学名のプルダウン選択用のマスターテーブルです。

| カラム名 | データ型 | 説明 |
| :--- | :--- | :--- |
| id | bigint | 主キー🔑。自動採番 |
| name | text | 大学名 |
| display_order | integer | 表示順序 |

### 12. age_verifications テーブル (年齢確認) 🔞
R-18コンテンツアクセス時の年齢確認記録を管理します。

| カラム名 | データ型 | 説明 |
| :--- | :--- | :--- |
| id | bigint | 主キー🔑。自動採番 |
| user_id | uuid | 外部キー🔗。profiles.idを参照 |
| verified_at | timestamptz | 年齢確認日時 |
| ip_address | inet | 確認時のIPアドレス |

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

### 週間ランキングの実装
- **集計期間**: 1週間（7日間）
- **更新頻度**: 週1回の定期更新
- **対象作品**: 新着作品も含む全作品が平等に対象
- **評価指標**: PV数 + いいね数

Supabaseのデータベース関数 (Function) やビュー (View) を作成し、定期的に（例: 1週間に1回）likesテーブルとpage_viewsテーブルを集計してランキングを生成するのが最適な方法です。

## 依頼機能の詳細設計

### 依頼フロー
1. **作家検索・選定**: 大学名、タグ、料金範囲での絞り込み
2. **依頼内容入力・送信**: タイトル、内容、料金、期限の設定
3. **作家による受諾/辞退**: 依頼の受諾または辞退
4. **制作・納品**: 作品制作と納品
5. **完了・評価**: 依頼完了と評価

### 作家検索機能
- **大学名での絞り込み**: `profiles.university`と`universities.name`で検索
- **タグでの絞り込み**: `creator_profiles.specialties`の配列検索
- **料金範囲での絞り込み**: `creator_profiles.critique_price`、`commission_price`での範囲検索
- **ユーザー名での検索**: `profiles.username`、`profiles.display_name`での部分一致検索

## Supabase特有のポイント (重要)

### Row Level Security (RLS)
必ず有効にしてください。

**例1**: profilesテーブルは、自分自身のidと一致する行しか更新できない
**例2**: postsテーブルの作成は、author_idが自分自身のidである場合のみ許可する
**例3**: requestsテーブルは、依頼者または受注者のみが参照・更新可能

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
- 特に作家検索で使用される`creator_profiles.specialties`のGINインデックス

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
- 決済履歴のためのpaymentsテーブル
- 売上管理のためのearningsテーブル
