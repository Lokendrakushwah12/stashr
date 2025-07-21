// API Client for Stashr - Centralized API calling functions

import type { 
  ApiResponse, 
  CreateBookmarkRequest, 
  UpdateBookmarkRequest, 
  CreateFolderRequest, 
  UpdateFolderRequest,
  Bookmark,
  Folder
} from '@/types';

// Base API configuration
const API_BASE = '/api';

// Helper function for making API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: data.error || 'An error occurred',
        details: data.details,
      };
    }

    return { data };
  } catch (error) {
    console.error('API request failed:', error);
    return {
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

// Bookmark API functions
export const bookmarkApi = {
  // Create a new bookmark
  async create(request: CreateBookmarkRequest): Promise<ApiResponse<{ bookmark: Bookmark }>> {
    return apiRequest<{ bookmark: Bookmark }>('/bookmarks', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  // Update a bookmark
  async update(id: string, request: UpdateBookmarkRequest): Promise<ApiResponse<{ bookmark: Bookmark }>> {
    return apiRequest<{ bookmark: Bookmark }>(`/bookmarks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  },

  // Delete a bookmark
  async delete(id: string): Promise<ApiResponse<{ message: string }>> {
    return apiRequest<{ message: string }>(`/bookmarks/${id}`, {
      method: 'DELETE',
    });
  },
};

// Folder API functions
export const folderApi = {
  // Get all folders with bookmarks
  async getAll(): Promise<ApiResponse<{ folders: Folder[] }>> {
    return apiRequest<{ folders: Folder[] }>('/folders');
  },

  // Get a specific folder with bookmarks
  async getById(id: string): Promise<ApiResponse<{ folder: Folder }>> {
    return apiRequest<{ folder: Folder }>(`/folders/${id}`);
  },

  // Create a new folder
  async create(request: CreateFolderRequest): Promise<ApiResponse<{ folder: Folder }>> {
    return apiRequest<{ folder: Folder }>('/folders', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  // Update a folder
  async update(id: string, request: UpdateFolderRequest): Promise<ApiResponse<{ folder: Folder }>> {
    return apiRequest<{ folder: Folder }>(`/folders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  },

  // Delete a folder
  async delete(id: string): Promise<ApiResponse<{ message: string }>> {
    return apiRequest<{ message: string }>(`/folders/${id}`, {
      method: 'DELETE',
    });
  },
};

// Export all API functions
export const api = {
  bookmarks: bookmarkApi,
  folders: folderApi,
};

export default api; 