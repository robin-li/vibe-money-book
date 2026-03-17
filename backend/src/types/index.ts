export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data?: T;
  errors?: Array<{ field: string; reason: string }>;
  timestamp: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}
