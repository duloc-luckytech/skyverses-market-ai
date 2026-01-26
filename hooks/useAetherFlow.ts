
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL, getHeaders } from '../apis/config';

export interface GeneratedResult {
  id: string;
  url: string;
  timestamp: string;
  workflowId: string;
}

export interface WorkflowNode {
  id: string;
  title: string;
  classType: string;
  inputs: Record<string, any>;
}

export interface WorkflowTemplate {
  _id: string;
  templateId: string;
  name: string;
  desc: string;
  covers: { url: string; thumbnailUri: string }[];
  owner: { name: string; avatar: string };
  statistics: { useCount: number; likeCount: number };
  tags: { name: string }[];
  config?: string; 
}

const CONFIG = {
  BASE_URL: 'https://www.runninghub.ai',
  DEFAULT_WORKFLOW_ID: '1845005868273160193',
  DEFAULT_API_KEY: 'aa6dd04cb596415697e7f4337a737ddb',
  POLL_INTERVAL: 3000,
  MAX_POLL_ATTEMPTS: 120,
  PAGE_SIZE: 12
};

export const useAetherFlow = () => {
  const { refreshUserInfo } = useAuth();
  const [workflowId, setWorkflowId] = useState(CONFIG.DEFAULT_WORKFLOW_ID);
  const [workflowConfig, setWorkflowConfig] = useState<WorkflowNode[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploadingJson, setIsUploadingJson] = useState(false);
  const [statusText, setStatusText] = useState('Hệ thống sẵn sàng');
  const [results, setResults] = useState<GeneratedResult[]>([]);
  const [generationTime, setGenerationTime] = useState(0);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('runninghub_api_key') || CONFIG.DEFAULT_API_KEY);
  const [showApiKey, setShowApiKey] = useState(false);
  
  // Library Pagination State
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const fetchTemplates = useCallback(async (pageNum: number, reset: boolean = false) => {
    if (pageNum === 1) setLoadingTemplates(true);
    else setIsFetchingMore(true);

    try {
      const response = await fetch(`${API_BASE_URL}/runninghub/templates?limit=${CONFIG.PAGE_SIZE}&page=${pageNum}`, {
        headers: getHeaders()
      });
      const result = await response.json();
      
      if (result.success && result.data) {
        const newTemplates = result.data;
        if (reset) {
          setTemplates(newTemplates);
          setTotalCount(result.total || 0);
        } else {
          setTemplates(prev => [...prev, ...newTemplates]);
        }
        
        const currentCount = reset ? newTemplates.length : templates.length + newTemplates.length;
        const total = result.total || 0;
        setHasMore(currentCount < total);
      } else {
        if (reset) setTemplates([]);
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to fetch runninghub templates:", error);
      if (reset) setTemplates([]);
    } finally {
      setLoadingTemplates(false);
      setIsFetchingMore(false);
    }
  }, [templates.length]);

  useEffect(() => {
    fetchTemplates(1, true);
  }, []);

  const loadMoreTemplates = useCallback(() => {
    if (isFetchingMore || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchTemplates(nextPage);
  }, [page, isFetchingMore, hasMore, fetchTemplates]);

  const fetchWorkflowDetail = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/runninghub/workflow/${id}`, {
        headers: getHeaders()
      });
      const result = await response.json();
      if (result.success && result.data) return result.data;
      return null;
    } catch (error) {
      console.error("Failed to fetch workflow detail:", error);
      return null;
    }
  };

  const saveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('runninghub_api_key', key);
  };

  const updateConfigValue = (nodeId: string, inputKey: string, value: any) => {
    setWorkflowConfig(prev => prev.map(node => {
      if (node.id === nodeId) {
        return { ...node, inputs: { ...node.inputs, [inputKey]: value } };
      }
      return node;
    }));
  };

  const handleGenerate = async () => {
    if (isGenerating) return;
    try {
      setIsGenerating(true);
      setStatusText('Đang khởi tạo...');
      // Generation logic placeholder
      await new Promise(r => setTimeout(r, 2000));
      setStatusText('Hoàn tất');
      refreshUserInfo();
    } catch (error: any) {
      setStatusText(`Lỗi: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImport = async (input: File | string) => {
    setIsUploadingJson(true);
    setStatusText('Đang phân tích kịch bản...');
    try {
      let rawJson = typeof input === 'string' ? input : await input.text();
      const workflowResponse = JSON.parse(rawJson);
      
      // Look for the workflow data in either 'data' field or root
      const targetData = workflowResponse.data || workflowResponse;
      
      const nodes: WorkflowNode[] = [];
      
      // If it's a ComfyUI Web JSON (list of nodes)
      if (targetData.nodes && Array.isArray(targetData.nodes)) {
        targetData.nodes.forEach((node: any) => {
          const inputs: Record<string, any> = {};
          
          // Widgets often contain the configurable values
          if (node.widgets_values && Array.isArray(node.widgets_values)) {
             node.widgets_values.forEach((v: any, i: number) => {
               inputs[`widget_${i}`] = v;
             });
          }

          nodes.push({
            id: String(node.id),
            title: node.title || node.type,
            classType: node.type,
            inputs: inputs
          });
        });
      } 
      // If it's an API JSON (dictionary of nodes)
      else {
        Object.keys(targetData).forEach(key => {
          const node = targetData[key];
          if (node.inputs) {
            nodes.push({
              id: key,
              title: node._meta?.title || node.class_type,
              classType: node.class_type,
              inputs: node.inputs
            });
          }
        });
      }
      
      setWorkflowConfig(nodes);
      setStatusText('Nhập kịch bản thành công');
      return true;
    } catch (error: any) {
      setStatusText(`Lỗi: ${error.message}`);
      throw error;
    } finally {
      setIsUploadingJson(false);
    }
  };

  return {
    workflowId, setWorkflowId, workflowConfig, updateConfigValue,
    isGenerating, isUploadingJson, statusText, results, setResults,
    generationTime, apiKey, saveApiKey, showApiKey, setShowApiKey,
    handleGenerate, handleImport, fetchWorkflowDetail,
    templates, loadingTemplates, hasMore, isFetchingMore, loadMoreTemplates, totalCount,
    page
  };
};
