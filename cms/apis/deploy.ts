
import { API_BASE_URL, getHeaders } from './config';

export interface DeployLog {
  _id: string;
  source: 'github' | 'gitlab' | 'manual';
  branch: string;
  commitId: string;
  commitMessage: string;
  status: 'SUCCESS' | 'FAILED' | 'RUNNING';
  stdout?: string;
  stderr?: string;
  errorMessage?: string;
  durationMs?: number;
  triggeredBy: string;
  createdAt: string;
  updatedAt: string;
}

export const deployApi = {
  /**
   * Fetch all system deployment logs
   * GET /deploy/logs
   */
  getLogs: async (params?: { page?: number; limit?: number }): Promise<{ success: boolean; data: DeployLog[] }> => {
    try {
      const query = new URLSearchParams(params as any).toString();
      const response = await fetch(`${API_BASE_URL}/deploy/logs?${query}`, {
        headers: getHeaders()
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Deploy Logs Fetch Error:", error);
      return { success: false, data: [] };
    }
  }
};
