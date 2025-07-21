// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  details?: string[];
}

// API Request Types
export interface CreateBookmarkRequest {
  title: string;
  url: string;
  description?: string;
  folderId: string;
}

export interface UpdateBookmarkRequest {
  title?: string;
  url?: string;
  description?: string;
}

export interface CreateFolderRequest {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateFolderRequest {
  name?: string;
  description?: string;
  color?: string;
} 