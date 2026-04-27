
import { API_BASE_URL, getHeaders } from './config';

/* ══════════════════════════════════════════
 *  Types
 * ══════════════════════════════════════════ */
export interface TaskItem {
  _id: string;
  _collection: 'image' | 'videoV2' | 'video' | 'editImage';
  status: string;
  type: string;
  provider: string;
  model: string;
  prompt: string;
  user: { _id: string; email: string; name: string } | null;
  creditsUsed: number;
  error: string | null;
  owner: string | null;
  progress: { percent: number; step?: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskStats {
  total: number;
  byStatus: Record<string, number>;
  byCollection: Record<string, Record<string, number>>;
}

export interface TaskListParams {
  status?: string;
  collection?: string;
  provider?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TaskListResponse {
  success: boolean;
  data: TaskItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/* ══════════════════════════════════════════
 *  API
 * ══════════════════════════════════════════ */
export const tasksApi = {
  /**
   * GET /admin-tasks/stats
   */
  getStats: async (): Promise<{ success: boolean } & TaskStats> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin-tasks/stats`, {
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Tasks Stats Error:', error);
      return { success: false, total: 0, byStatus: {}, byCollection: {} };
    }
  },

  /**
   * GET /admin-tasks
   */
  getTasks: async (params: TaskListParams = {}): Promise<TaskListResponse> => {
    try {
      const query = new URLSearchParams();
      if (params.status) query.append('status', params.status);
      if (params.collection) query.append('collection', params.collection);
      if (params.provider) query.append('provider', params.provider);
      if (params.search) query.append('search', params.search);
      if (params.page) query.append('page', params.page.toString());
      if (params.limit) query.append('limit', params.limit.toString());
      if (params.sortBy) query.append('sortBy', params.sortBy);
      if (params.sortOrder) query.append('sortOrder', params.sortOrder);

      const response = await fetch(`${API_BASE_URL}/admin-tasks?${query.toString()}`, {
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Tasks List Error:', error);
      return { success: false, data: [], pagination: { page: 1, limit: 50, total: 0, totalPages: 0 } };
    }
  },

  /**
   * DELETE /admin-tasks/clear
   */
  clearTasks: async (params: { status: string; collection?: string; olderThanHours?: number }): Promise<{ success: boolean; totalDeleted: number; details: Record<string, number> }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin-tasks/clear`, {
        method: 'DELETE',
        headers: getHeaders(),
        body: JSON.stringify(params),
      });
      return await response.json();
    } catch (error) {
      console.error('Tasks Clear Error:', error);
      return { success: false, totalDeleted: 0, details: {} };
    }
  },

  /**
   * DELETE /admin-tasks/:collection/:id
   */
  deleteTask: async (collection: string, id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin-tasks/${collection}/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Task Delete Error:', error);
      return { success: false, message: 'Connection failed' };
    }
  },
};
