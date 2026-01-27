
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
  widgets_values: any[];
  inputs?: any[];
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
        if (reset) {
          setTemplates(result.data);
          setTotalCount(result.total || 0);
        } else {
          setTemplates(prev => [...prev, ...result.data]);
        }
        setHasMore(templates.length + result.data.length < (result.total || 0));
      }
    } catch (error) {
      console.error("Failed to fetch templates:", error);
    } finally {
      setLoadingTemplates(false);
      setIsFetchingMore(false);
    }
  }, [templates.length]);

  useEffect(() => { fetchTemplates(1, true); }, []);

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
      return result.success ? result.data : null;
    } catch (error) {
      return null;
    }
  };

  const saveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('runninghub_api_key', key);
  };

  const updateConfigValue = (nodeId: string, widgetIndex: number, value: any) => {
    setWorkflowConfig(prev => prev.map(node => {
      if (node.id === nodeId) {
        const newWidgets = [...node.widgets_values];
        newWidgets[widgetIndex] = value;
        return { ...node, widgets_values: newWidgets };
      }
      return node;
    }));
  };

  const handleGenerate = async () => {
    if (isGenerating) return;
    if (!apiKey) {
      setStatusText('Lỗi: Thiếu API Key');
      return;
    }
    
    setIsGenerating(true);
    setStatusText('Đang gửi tác vụ...');
    
    try {
      // Chuyển đổi cấu hình nodes hiện tại sang định dạng RunningHub OpenAPI
      const nodeInfoList = workflowConfig.map(node => ({
        nodeId: node.id,
        fieldName: 'widgets_values',
        fieldValue: node.widgets_values
      }));

      const response = await fetch(`${CONFIG.BASE_URL}/task/openapi/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey,
          workflowId,
          nodeInfoList,
          addMetadata: true
        })
      });

      const result = await response.json();

      if (result.code === 0 && result.data?.taskId) {
        setStatusText(`Đã tạo: ${result.data.taskId}`);
        // Cập nhật lại thông tin user sau khi trừ credit (nếu hệ thống có hiển thị)
        refreshUserInfo();
      } else {
        setStatusText(`Lỗi: ${result.msg || 'Không thể tạo tác vụ'}`);
      }
    } catch (error: any) {
      setStatusText(`Lỗi kết nối: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImport = async (input: File | string) => {
    setIsUploadingJson(true);
    setStatusText('Đang phân tích...');
    try {
      let rawJson = typeof input === 'string' ? input : await input.text();
      const workflowData = JSON.parse(rawJson);
      const data = workflowData.data || workflowData;
      
      let nodes: WorkflowNode[] = [];
      
      // Hỗ trợ format Array (Workflow)
      if (data.nodes && Array.isArray(data.nodes)) {
        nodes = data.nodes.map((n: any) => ({
          id: String(n.id),
          title: n.title || n.type,
          classType: n.type,
          widgets_values: n.widgets_values || []
        }));
      } 
      // Hỗ trợ format Object (API Prompt)
      else {
        Object.keys(data).forEach(key => {
          const node = data[key];
          if (node.inputs) {
            nodes.push({
              id: key,
              title: node._meta?.title || node.class_type,
              classType: node.class_type,
              widgets_values: Object.values(node.inputs).filter(v => !Array.isArray(v))
            });
          }
        });
      }
      
      setWorkflowConfig(nodes.filter(n => n.widgets_values.length > 0));
      setStatusText('Đã nạp kịch bản');
      return true;
    } catch (error) {
      setStatusText('Lỗi phân tích JSON');
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
    templates, loadingTemplates, hasMore, isFetchingMore, loadMoreTemplates, totalCount, page
  };
};
