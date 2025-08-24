# LumiLumi2 開発ガイドライン

## 概要

このドキュメントは、LumiLumi2プロジェクトの開発におけるコーディング規約、開発フロー、ベストプラクティスについて説明します。

## 技術スタック

### フロントエンド
- **React 18**: 最新のReact機能を活用
- **TypeScript**: 厳密な型定義による安全性の確保
- **Vite**: 高速な開発環境とビルド
- **Tailwind CSS**: ユーティリティファーストのCSSフレームワーク

### バックエンド・データベース
- **Supabase**: バックエンドサービス（認証、データベース、ストレージ）
- **PostgreSQL**: リレーショナルデータベース
- **Row Level Security (RLS)**: セキュリティの確保

### 状態管理
- **Zustand**: 軽量な状態管理ライブラリ
- **React Context**: グローバル状態の管理

## コーディング規約

### TypeScript

#### 型定義
- `any`型の使用は禁止
- インターフェースとタイプエイリアスを適切に使い分け
- ジェネリクスを活用して再利用可能なコードを作成
- 厳密な型チェックを有効化

```typescript
// 良い例
interface User {
  id: string;
  name: string;
  email: string;
}

// 悪い例
const user: any = { id: 1, name: 'John' };
```

#### 命名規則
- 変数・関数: `camelCase`
- 定数: `UPPER_SNAKE_CASE`
- インターフェース・タイプ: `PascalCase`
- ファイル名: `PascalCase.tsx`

### React

#### コンポーネント設計
- 関数コンポーネントとフックを使用
- クラスコンポーネントは使用しない
- 単一責任の原則に従う
- 再利用可能なコンポーネントを作成

```typescript
// 良い例
const UserProfile: React.FC<UserProfileProps> = ({ user, onEdit }) => {
  return (
    <div className="user-profile">
      <h2>{user.display_name}</h2>
      <button onClick={onEdit}>編集</button>
    </div>
  );
};

// 悪い例
class UserProfile extends React.Component {
  // クラスコンポーネントは使用しない
}
```

#### フックの使用
- カスタムフックを作成してロジックを分離
- メモ化（React.memo, useMemo, useCallback）を適切に使用
- 依存配列を正確に設定

```typescript
// 良い例
const useUserData = (userId: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser(userId).then(setUser).finally(() => setLoading(false));
  }, [userId]);

  return { user, loading };
};
```

### スタイリング

#### Tailwind CSS
- Tailwind CSSクラスを優先使用
- カスタムCSSは最小限に
- レスポンシブデザインを意識
- モバイルファーストのアプローチ

```typescript
// 良い例
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
  <div className="bg-white rounded-lg shadow-md p-4">
    {/* コンテンツ */}
  </div>
</div>

// 悪い例
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
  {/* インラインスタイルは避ける */}
</div>
```

## ファイル構成

```
src/
├── components/          # 再利用可能なコンポーネント
│   ├── ui/             # 基本UIコンポーネント（Button, Input等）
│   ├── forms/          # フォーム関連コンポーネント
│   ├── layout/         # レイアウトコンポーネント（Header, Footer等）
│   └── features/       # 機能別コンポーネント（PostCard, UserProfile等）
├── pages/              # ページコンポーネント
├── hooks/              # カスタムフック
├── contexts/           # React Context
├── types/              # 型定義
├── utils/              # ユーティリティ関数
├── services/           # API呼び出し
├── constants/          # 定数
└── assets/             # 静的ファイル（画像、アイコン等）
```

## コンポーネント設計原則

### 1. 単一責任の原則
各コンポーネントは1つの責任のみを持つべきです。

```typescript
// 良い例：投稿カードコンポーネント
const PostCard: React.FC<PostCardProps> = ({ post, onLike, onShare }) => {
  return (
    <div className="post-card">
      <PostImage image={post.thumbnail_url} />
      <PostInfo post={post} />
      <PostActions onLike={onLike} onShare={onShare} />
    </div>
  );
};

// 悪い例：複数の責任を持つコンポーネント
const PostCard = ({ post }) => {
  // 画像表示、投稿情報、アクション、コメント、ユーザー情報など
  // 全てを1つのコンポーネントで処理
};
```

### 2. 再利用性
汎用的で再利用可能なコンポーネントを作成します。

```typescript
// 良い例：汎用的なボタンコンポーネント
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger';
  size: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ variant, size, children, onClick, disabled }) => {
  const baseClasses = "font-medium rounded-lg transition-colors";
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-700"
  };
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg"
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
```

### 3. プロップスの設計
適切なプロップスの設計により、コンポーネントの柔軟性を高めます。

```typescript
// 良い例：適切なプロップス設計
interface PostCardProps {
  post: Post;
  showAuthor?: boolean;
  showTags?: boolean;
  onLike?: (postId: number) => void;
  onShare?: (postId: number) => void;
  className?: string;
}

// 悪い例：過度に具体的なプロップス
interface PostCardProps {
  postTitle: string;
  postAuthor: string;
  postImage: string;
  postTags: string[];
  // 個別のプロパティを直接受け取る
}
```

## 状態管理

### Zustand
軽量な状態管理ライブラリとしてZustandを使用します。

```typescript
// 認証状態の管理
interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const user = await authService.login(credentials);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  logout: () => set({ user: null, isAuthenticated: false }),
  setUser: (user) => set({ user, isAuthenticated: true }),
}));
```

### React Context
グローバルな状態やテーマ設定にはReact Contextを使用します。

```typescript
// テーマコンテキスト
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

## エラーハンドリング

### エラーバウンダリー
アプリケーション全体のエラーをキャッチするエラーバウンダリーを実装します。

```typescript
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // エラー監視サービスへの送信
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>エラーが発生しました</h2>
          <button onClick={() => window.location.reload()}>
            ページを再読み込み
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### API呼び出しのエラーハンドリング
API呼び出し時のエラーを適切に処理します。

```typescript
const useApiCall = <T>(apiFunction: () => Promise<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFunction();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, execute };
};
```

## パフォーマンス最適化

### メモ化
不要な再レンダリングを防ぐためにメモ化を適切に使用します。

```typescript
// React.memoによるコンポーネントのメモ化
const PostCard = React.memo<PostCardProps>(({ post, onLike, onShare }) => {
  return (
    <div className="post-card">
      {/* コンポーネントの内容 */}
    </div>
  );
});

// useMemoによる値のメモ化
const filteredPosts = useMemo(() => {
  return posts.filter(post => {
    if (searchTerm) {
      return post.title.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });
}, [posts, searchTerm]);

// useCallbackによる関数のメモ化
const handleLike = useCallback((postId: number) => {
  onLike(postId);
}, [onLike]);
```

### 遅延読み込み
大きなコンポーネントやページは遅延読み込みします。

```typescript
// ページの遅延読み込み
const HomePage = lazy(() => import('./pages/HomePage'));
const UploadPage = lazy(() => import('./pages/UploadPage'));

// 画像の遅延読み込み
const LazyImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <img
      src={src}
      alt={alt}
      className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      onLoad={() => setIsLoaded(true)}
      loading="lazy"
    />
  );
};
```

## テスト

### テストの種類
- **ユニットテスト**: 個別の関数やコンポーネントのテスト
- **統合テスト**: 複数のコンポーネントの連携テスト
- **E2Eテスト**: ユーザー操作の流れのテスト

### テストの実装例
```typescript
// コンポーネントのテスト
import { render, screen, fireEvent } from '@testing-library/react';
import { PostCard } from './PostCard';

describe('PostCard', () => {
  const mockPost = {
    id: 1,
    title: 'テスト投稿',
    author: { name: 'テストユーザー' },
    thumbnail_url: 'test.jpg'
  };

  it('投稿のタイトルと作者名を表示する', () => {
    render(<PostCard post={mockPost} />);
    
    expect(screen.getByText('テスト投稿')).toBeInTheDocument();
    expect(screen.getByText('テストユーザー')).toBeInTheDocument();
  });

  it('いいねボタンクリック時にコールバックが呼ばれる', () => {
    const mockOnLike = jest.fn();
    render(<PostCard post={mockPost} onLike={mockOnLike} />);
    
    fireEvent.click(screen.getByRole('button', { name: /いいね/i }));
    expect(mockOnLike).toHaveBeenCalledWith(1);
  });
});
```

## セキュリティ

### 入力値の検証
ユーザー入力は適切に検証・サニタイズします。

```typescript
// ファイルアップロードの検証
const validateFile = (file: File): string | null => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/png'];

  if (file.size > maxSize) {
    return 'ファイルサイズは10MB以下にしてください';
  }

  if (!allowedTypes.includes(file.type)) {
    return 'JPEGまたはPNG形式のファイルのみアップロード可能です';
  }

  return null;
};
```

### XSS対策
ユーザー入力の表示時は適切にエスケープします。

```typescript
// 危険な例
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// 安全な例
<div>{userInput}</div>
```

## アクセシビリティ

### セマンティックHTML
適切なHTML要素を使用してセマンティックな構造を作成します。

```typescript
// 良い例
<article className="post-card">
  <header>
    <h2>{post.title}</h2>
    <p>by {post.author.name}</p>
  </header>
  <main>
    <img src={post.image} alt={post.title} />
  </main>
  <footer>
    <button aria-label="いいね">❤️ {post.likes}</button>
  </footer>
</article>

// 悪い例
<div className="post-card">
  <div className="title">{post.title}</div>
  <div className="author">by {post.author.name}</div>
  <div className="image">
    <img src={post.image} />
  </div>
  <div className="actions">
    <div className="like-button">❤️ {post.likes}</div>
  </div>
</div>
```

### ARIA属性
必要に応じてARIA属性を追加してアクセシビリティを向上させます。

```typescript
// ローディング状態の表示
<button 
  disabled={loading} 
  aria-busy={loading}
  aria-live="polite"
>
  {loading ? '送信中...' : '送信'}
</button>

// エラーメッセージの表示
<div 
  role="alert" 
  aria-live="assertive"
  className="error-message"
>
  {error}
</div>
```

## レスポンシブデザイン

### ブレイクポイント
定義されたブレイクポイントに従ってレスポンシブデザインを実装します。

```typescript
// 定数
export const RESPONSIVE_BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1025,
} as const;

// カスタムフック
const useResponsive = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < RESPONSIVE_BREAKPOINTS.mobile);
      setIsTablet(width >= RESPONSIVE_BREAKPOINTS.mobile && width < RESPONSIVE_BREAKPOINTS.tablet);
      setIsDesktop(width >= RESPONSIVE_BREAKPOINTS.desktop);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { isMobile, isTablet, isDesktop };
};
```

### モバイル最適化
タッチ操作やモバイルデバイスに最適化されたUI/UXを提供します。

```typescript
// タッチ操作の最適化
const useTouchGesture = (onSwipeLeft?: () => void, onSwipeRight?: () => void) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    }
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
    }
  };

  return { onTouchStart, onTouchMove, onTouchEnd };
};
```

## 開発フロー

### 1. 機能開発
1. 要件の理解と設計
2. 型定義の作成
3. コンポーネントの実装
4. テストの作成
5. コードレビュー

### 2. ブランチ戦略
- `main`: 本番環境用のブランチ
- `develop`: 開発用のブランチ
- `feature/*`: 新機能開発用のブランチ
- `hotfix/*`: 緊急修正用のブランチ

### 3. コミットメッセージ
```
feat: 新機能の追加
fix: バグ修正
docs: ドキュメント更新
style: コードスタイルの調整
refactor: リファクタリング
test: テストの追加・修正
chore: その他の変更
```

### 4. プルリクエスト
1. フィーチャーブランチの作成
2. 機能の実装
3. テストの実行
4. プルリクエストの作成
5. コードレビュー
6. マージ

## デバッグ・ログ

### 開発環境でのログ
開発環境では適切なログ出力を行います。

```typescript
const logger = {
  debug: (message: string, ...args: any[]) => {
    if (import.meta.env.DEV) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  },
  info: (message: string, ...args: any[]) => {
    console.log(`[INFO] ${message}`, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  },
  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${message}`, ...args);
  }
};
```

### エラー監視
本番環境でのエラーを監視・収集します。

```typescript
// エラーハンドリング
window.addEventListener('error', (event) => {
  // エラー監視サービスへの送信
  errorReportingService.captureError(event.error);
});

// 未処理のPromise拒否
window.addEventListener('unhandledrejection', (event) => {
  errorReportingService.captureError(event.reason);
});
```

## パフォーマンス監視

### パフォーマンスメトリクス
重要なパフォーマンス指標を監視します。

```typescript
const usePerformanceMonitoring = () => {
  useEffect(() => {
    // Core Web Vitalsの監視
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            console.log('LCP:', entry.startTime);
          }
        }
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }
  }, []);
};
```

## まとめ

このガイドラインに従うことで、保守性が高く、パフォーマンスの良いアプリケーションを開発できます。常に最新のベストプラクティスを学び、チーム内で共有していきましょう。

### 参考資料
- [React公式ドキュメント](https://react.dev/)
- [TypeScript公式ドキュメント](https://www.typescriptlang.org/)
- [Tailwind CSS公式ドキュメント](https://tailwindcss.com/)
- [Supabase公式ドキュメント](https://supabase.com/docs)
