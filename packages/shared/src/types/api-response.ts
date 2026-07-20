export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalElements: number;
  isLast: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
