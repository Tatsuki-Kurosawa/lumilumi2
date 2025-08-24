# LumiLumi2 - 学生向け漫画・イラスト投稿プラットフォーム

## プロジェクト概要

LumiLumi2は、学生を中心とした創作者が自分の描いた漫画やイラストを自由に投稿・共有できる会員制プラットフォームです。

### 主な機能

- **投稿機能**: 漫画・イラストの投稿（最大50枚、10MB/枚）
- **タグ機能**: 自由作成可能なタグによる作品分類
- **ランキング機能**: PV数といいね数に基づく週間ランキング
- **依頼機能**: 作家への添削・制作依頼（skeb準拠）
- **フォロー機能**: ユーザー間のフォロー関係
- **R-18対応**: 年齢確認による適切なコンテンツ管理
- **レスポンシブ対応**: PC・スマートフォン・タブレット対応

### ターゲットユーザー

- 趣味で漫画・イラストを描く学生
- 18歳以上の現役学生、OB/OG
- 作家として活動したい学生

## 技術スタック

- **フロントエンド**: React 18 + TypeScript
- **ビルドツール**: Vite
- **スタイリング**: Tailwind CSS
- **状態管理**: Zustand + React Context
- **ルーティング**: React Router
- **データベース**: Supabase (PostgreSQL)
- **認証**: Supabase Auth
- **ストレージ**: Supabase Storage

## セットアップ

### 前提条件

- Node.js 18.0.0以上
- npm または yarn
- Supabaseアカウント

### インストール

1. リポジトリのクローン
```bash
git clone <repository-url>
cd lumilumi2
```

2. 依存関係のインストール
```bash
npm install
```

3. 環境変数の設定
`.env.local`ファイルを作成し、Supabaseの設定を追加：
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. 開発サーバーの起動
```bash
npm run dev
```

### ビルド

```bash
npm run build
```

### 型チェック

```bash
npm run type-check
```

## プロジェクト構造

```
src/
├── components/          # 再利用可能なコンポーネント
│   ├── ui/             # 基本UIコンポーネント
│   ├── forms/          # フォーム関連コンポーネント
│   └── layout/         # レイアウトコンポーネント
├── pages/              # ページコンポーネント
├── hooks/              # カスタムフック
├── contexts/           # React Context
├── types/              # 型定義
├── utils/              # ユーティリティ関数
├── services/           # API呼び出し
└── constants/          # 定数
```

## データベース設計

詳細なデータベース設計については、`.docs/database-design.md`を参照してください。

### 主要テーブル

- `profiles`: ユーザープロフィール
- `posts`: 投稿作品
- `creator_profiles`: 作家プロフィール
- `requests`: 依頼情報
- `tags`: タグ
- `likes`: いいね
- `follows`: フォロー関係
- `page_views`: ページビュー

## 開発ガイドライン

### コーディング規約

- TypeScriptの厳密な型定義
- 関数コンポーネントとフックの使用
- Tailwind CSSによるスタイリング
- レスポンシブデザインの実装

### コミットメッセージ

```
feat: 新機能の追加
fix: バグ修正
docs: ドキュメント更新
style: コードスタイルの調整
refactor: リファクタリング
test: テストの追加・修正
```

## デプロイ

### Supabase

1. Supabaseプロジェクトの作成
2. データベーススキーマの適用（`.docs/supabase-schema.sql`）
3. 環境変数の設定

### Vercel/Netlify

1. リポジトリの連携
2. 環境変数の設定
3. ビルドコマンド: `npm run build`

## ライセンス

MIT License

## コントリビューション

1. このリポジトリをフォーク
2. フィーチャーブランチの作成
3. 変更のコミット
4. プルリクエストの作成

## サポート

質問や問題がある場合は、Issueを作成してください。

## 更新履歴

- v1.0.0: 初期リリース
  - 基本的な投稿・閲覧機能
  - ユーザー認証
  - タグ・ランキング機能
  - 依頼機能
  - R-18コンテンツ対応
