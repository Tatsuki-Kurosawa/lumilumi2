// 漫画・イラスト投稿プラットフォーム 型定義

// ユーザー関連
export interface User {
  id: string;
  username: string;
  display_name: string;
  university: string;
  status: 'student' | 'ob' | 'og';
  avatar_url?: string;
  bio?: string;
  is_creator: boolean;
  created_at: string;
}

export interface CreatorProfile {
  id: number;
  user_id: string;
  is_accepting_requests: boolean;
  critique_price?: number;
  commission_price?: number;
  specialties: string[];
  portfolio_description?: string;
  experience_years?: number;
  created_at: string;
}

export interface University {
  id: number;
  name: string;
  display_order: number;
}

// 投稿関連
export interface Post {
  id: number;
  author_id: string;
  type: 'manga' | 'illustration';
  title: string;
  thumbnail_url: string;
  is_r18: boolean;
  created_at: string;
}

export interface PostImage {
  id: number;
  post_id: number;
  image_url: string;
  display_order: number;
}

export interface PostWithDetails extends Post {
  author: User;
  images: PostImage[];
  tags: Tag[];
  like_count: number;
  view_count: number;
}

// タグ関連
export interface Tag {
  id: number;
  name: string;
}

// いいね・フォロー関連
export interface Like {
  user_id: string;
  post_id: number;
  created_at: string;
}

export interface Follow {
  follower_id: string;
  following_id: string;
  created_at: string;
}

// 依頼関連
export interface Request {
  id: number;
  client_id: string;
  creator_id: string;
  request_type: 'critique' | 'commission';
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  title: string;
  body: string;
  price: number;
  deadline_delivery?: string;
  delivered_image_url?: string;
  client_visibility: 'public' | 'private';
  creator_visibility: 'public' | 'private';
  created_at: string;
  updated_at: string;
}

export interface RequestImage {
  id: number;
  request_id: number;
  image_url: string;
  display_order: number;
}

export interface RequestWithDetails extends Request {
  client: User;
  creator: User;
  images: RequestImage[];
}

// ページビュー関連
export interface PageView {
  id: number;
  post_id: number;
  viewer_id?: string;
  ip_address?: string;
  user_agent?: string;
  viewed_at: string;
  is_unique: boolean;
}

// 年齢確認関連
export interface AgeVerification {
  id: number;
  user_id: string;
  verified_at: string;
  ip_address?: string;
}

// ランキング関連
export interface RankingItem {
  post_id: number;
  title: string;
  author_name: string;
  university: string;
  total_score: number;
  view_count: number;
  like_count: number;
}

// 検索・フィルター関連
export interface SearchFilters {
  tags?: string[];
  university?: string;
  status?: 'student' | 'ob' | 'og';
  is_r18?: boolean;
  type?: 'manga' | 'illustration';
  price_min?: number;
  price_max?: number;
  specialties?: string[];
}

export interface CreatorSearchFilters {
  university?: string;
  specialties?: string[];
  price_min?: number;
  price_max?: number;
  is_accepting_requests?: boolean;
}

// フォーム関連
export interface PostFormData {
  title: string;
  type: 'manga' | 'illustration';
  images: File[];
  thumbnail: File;
  tags: string[];
  is_r18: boolean;
}

export interface RequestFormData {
  title: string;
  request_type: 'critique' | 'commission';
  body: string;
  price: number;
  deadline_delivery?: string;
  images: File[];
  client_visibility: 'public' | 'private';
  creator_visibility: 'public' | 'private';
}

export interface CreatorProfileFormData {
  is_accepting_requests: boolean;
  critique_price?: number;
  commission_price?: number;
  specialties: string[];
  portfolio_description?: string;
  experience_years?: number;
}

// API レスポンス関連
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

// 認証関連
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  username: string;
  display_name: string;
  university: string;
  status: 'student' | 'ob' | 'og';
}

// UI 関連
export interface ModalState {
  isOpen: boolean;
  type: 'login' | 'register' | 'request' | 'creator-profile' | null;
  data?: any;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

// 定数
export const POST_TYPES = ['manga', 'illustration'] as const;
export const USER_STATUSES = ['student', 'ob', 'og'] as const;
export const REQUEST_TYPES = ['critique', 'commission'] as const;
export const REQUEST_STATUSES = ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'] as const;
export const VISIBILITY_OPTIONS = ['public', 'private'] as const;

export const MAX_IMAGES_PER_POST = 50;
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png'];

export const RESPONSIVE_BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1025,
} as const;
