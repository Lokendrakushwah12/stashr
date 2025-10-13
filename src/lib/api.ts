import type {
  AddCollaboratorRequest,
  ApiResponse,
  Board,
  BoardCard,
  BoardCollaboration,
  BoardTimelineEntry,
  Bookmark,
  CreateBoardCardRequest,
  CreateBoardRequest,
  CreateBookmarkRequest,
  CreateFolderRequest,
  CreateTimelineEntryRequest,
  Folder,
  UpdateBoardCardRequest,
  UpdateBoardRequest,
  UpdateBookmarkRequest,
  UpdateFolderRequest
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

    const data = (await response.json()) as unknown;

    if (!response.ok) {
      const errorData = data as { error?: string; details?: string[] };
      return {
        error: errorData.error ?? 'An error occurred',
        details: errorData.details,
      };
    }

    return { data: data as T };
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

// Board API functions
export const boardApi = {
  // Get all boards
  async getAll(queryString?: string): Promise<ApiResponse<{ boards: Board[] }>> {
    const url = queryString ? `/boards?${queryString}` : '/boards';
    return apiRequest<{ boards: Board[] }>(url);
  },

  // Get a specific board with cards
  async getById(id: string): Promise<ApiResponse<{ board: Board }>> {
    return apiRequest<{ board: Board }>(`/boards/${id}`);
  },

  // Create a new board
  async create(request: CreateBoardRequest): Promise<ApiResponse<{ board: Board }>> {
    return apiRequest<{ board: Board }>('/boards', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  // Update a board
  async update(id: string, request: UpdateBoardRequest): Promise<ApiResponse<{ board: Board }>> {
    return apiRequest<{ board: Board }>(`/boards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  },

  // Delete a board
  async delete(id: string): Promise<ApiResponse<{ message: string }>> {
    return apiRequest<{ message: string }>(`/boards/${id}`, {
      method: 'DELETE',
    });
  },

  // Get cards for a board
  async getCards(boardId: string): Promise<ApiResponse<{ cards: BoardCard[] }>> {
    return apiRequest<{ cards: BoardCard[] }>(`/boards/${boardId}/cards`);
  },

  // Create a new board card
  async createCard(request: CreateBoardCardRequest): Promise<ApiResponse<{ card: BoardCard }>> {
    return apiRequest<{ card: BoardCard }>(`/boards/${request.boardId}/cards`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  // Update a board card
  async updateCard(id: string, request: UpdateBoardCardRequest): Promise<ApiResponse<{ card: BoardCard }>> {
    return apiRequest<{ card: BoardCard }>(`/board-cards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  },

  // Delete a board card
  async deleteCard(id: string): Promise<ApiResponse<{ message: string }>> {
    return apiRequest<{ message: string }>(`/board-cards/${id}`, {
      method: 'DELETE',
    });
  },

  // Get collaborators for a board
  async getCollaborators(boardId: string): Promise<ApiResponse<{ collaborations: BoardCollaboration[] }>> {
    return apiRequest<{ collaborations: BoardCollaboration[] }>(`/boards/${boardId}/collaborators`);
  },

  // Add a collaborator to a board
  async addCollaborator(boardId: string, request: AddCollaboratorRequest): Promise<ApiResponse<{ collaboration: BoardCollaboration }>> {
    return apiRequest<{ collaboration: BoardCollaboration }>(`/boards/${boardId}/collaborators`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  // Update a collaborator's role
  async updateCollaboratorRole(boardId: string, collaboratorId: string, role: 'editor' | 'viewer'): Promise<ApiResponse<{ collaboration: BoardCollaboration }>> {
    return apiRequest<{ collaboration: BoardCollaboration }>(`/boards/${boardId}/collaborators/${collaboratorId}`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  },

  // Remove a collaborator
  async removeCollaborator(boardId: string, collaboratorId: string): Promise<ApiResponse<{ message: string }>> {
    return apiRequest<{ message: string }>(`/boards/${boardId}/collaborators/${collaboratorId}`, {
      method: 'DELETE',
    });
  },

  // Get timeline entries for a board
  async getTimeline(boardId: string): Promise<ApiResponse<{ entries: BoardTimelineEntry[] }>> {
    return apiRequest<{ entries: BoardTimelineEntry[] }>(`/boards/${boardId}/timeline`);
  },

  // Create a timeline entry
  async createTimelineEntry(boardId: string, request: CreateTimelineEntryRequest): Promise<ApiResponse<{ entry: BoardTimelineEntry }>> {
    return apiRequest<{ entry: BoardTimelineEntry }>(`/boards/${boardId}/timeline`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  // Update a timeline entry
  async updateTimelineEntry(entryId: string, content: string): Promise<ApiResponse<{ entry: BoardTimelineEntry }>> {
    return apiRequest<{ entry: BoardTimelineEntry }>(`/boards/timeline/${entryId}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  },

  // Delete a timeline entry
  async deleteTimelineEntry(entryId: string): Promise<ApiResponse<{ message: string }>> {
    return apiRequest<{ message: string }>(`/boards/timeline/${entryId}`, {
      method: 'DELETE',
    });
  },
};

// Export all API functions
export const api = {
  bookmarks: bookmarkApi,
  folders: folderApi,
  boards: boardApi,
};

export default api; 