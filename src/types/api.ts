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

export interface CreateBoardRequest {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateBoardRequest {
  name?: string;
  description?: string;
  content?: string;
  color?: string;
  linkedFolderId?: string | null;
}

export interface CreateBoardCardRequest {
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  linkedFolderId?: string;
  boardId: string;
}

export interface UpdateBoardCardRequest {
  title?: string;
  description?: string;
  status?: 'todo' | 'in-progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  linkedFolderId?: string;
}

export interface AddCollaboratorRequest {
  email: string;
  role: 'editor' | 'viewer';
}

export interface BoardCollaboration {
  _id: string;
  boardId: string;
  userId: string;
  userEmail: string;
  userName?: string;
  userImage?: string;
  role: 'owner' | 'editor' | 'viewer';
  invitedBy: string;
  status: 'pending' | 'accepted' | 'declined';
  invitedAt: string;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BoardTimelineEntry {
  _id: string;
  boardId: string;
  userId: string;
  userEmail: string;
  userName: string;
  userImage?: string;
  userRole: 'owner' | 'editor' | 'viewer';
  content: string;
  action: 'created' | 'updated' | 'commented';
  previousContent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTimelineEntryRequest {
  content: string;
  action?: 'created' | 'updated' | 'commented';
} 