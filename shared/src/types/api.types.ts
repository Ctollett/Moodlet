export type ApiError = {
  error: string;
  message: string;
  details?: Array<{ field: string; message: string }>;
};

export type ApiResponse<T> = {
  data: T;
};

export type PaginationParams = {
  page: number;
  limit: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
};
