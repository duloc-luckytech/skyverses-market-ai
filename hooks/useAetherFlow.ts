
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

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
  id: string;
  name: string;
  description: string;
  iconType: 'Cinematic' | 'Anime' | 'Product' | 'Portrait' | 'Default';
  config?: string; // Chứa raw JSON
  imageUrl?: string;
  category?: string;
}

// Kịch bản JSON mẫu theo yêu cầu người dùng
export const Z_IMAGE_TURBO_JSON = JSON.stringify({
  "1": { "inputs": { "unet_name": "z_image_turbo_bf16.safetensors", "weight_dtype": "default" }, "class_type": "UNETLoader", "_meta": { "title": "Load Diffusion Model" } },
  "2": { "inputs": { "clip_name": "qwen_3_4b.safetensors", "type": "qwen_image", "device": "default" }, "class_type": "CLIPLoader", "_meta": { "title": "Load CLIP" } },
  "3": { "inputs": { "vae_name": "ae.safetensors" }, "class_type": "VAELoader", "_meta": { "title": "Load VAE" } },
  "4": { "inputs": { "seed": 171978082215149, "steps": 6, "cfg": 1, "sampler_name": "euler", "scheduler": "simple", "denoise": 1, "model": [ "1", 0 ], "positive": [ "5", 0 ], "negative": [ "6", 0 ], "latent_image": [ "7", 0 ] }, "class_type": "KSampler", "_meta": { "title": "KSampler" } },
  "5": { "inputs": { "text": "girl asian lay in the bed, no cloth ", "clip": [ "2", 0 ] }, "class_type": "CLIPTextEncode", "_meta": { "title": "CLIP Text Encode (Prompt)" } },
  "6": { "inputs": { "conditioning": [ "5", 0 ] }, "class_type": "ConditioningZeroOut", "_meta": { "title": "ConditioningZeroOut" } },
  "7": { "inputs": { "width": 2048, "height": 2048, "batch_size": 1 }, "class_type": "EmptyLatentImage", "_meta": { "title": "Empty Latent Image" } },
  "8": { "inputs": { "samples": [ "4", 0 ], "vae": [ "3", 0 ] }, "class_type": "VAEDecode", "_meta": { "title": "VAE Decode" } },
  "10": { "inputs": { "filename_prefix": "ComfyUI", "images": [ "8", 0 ] }, "class_type": "SaveImage", "_meta": { "title": "Save Image" } }
});

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: '2013456755698700290',
    name: 'Basic Text-to-Image',
    description: 'Quy trình tạo ảnh từ văn bản cơ bản sử dụng mô hình SDXL Turbo.',
    iconType: 'Portrait',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800',
    config: Z_IMAGE_TURBO_JSON
  },
  {
    id: '2013456755698700291',
    name: 'Basic Image Generation',
    description: 'Tối ưu hóa khả năng tổng hợp hình ảnh chân thực với độ chi tiết cao.',
    iconType: 'Portrait',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
    config: Z_IMAGE_TURBO_JSON
  },
  {
    id: '2013456755698700292',
    name: 'Text-to-Image LoRA',
    description: 'Sử dụng các lớp LoRA chuyên biệt để tạo nhân vật nhất quán.',
    iconType: 'Anime',
    imageUrl: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=800',
    config: Z_IMAGE_TURBO_JSON,
    category: 'LoRA'
  },
  {
    id: '2013456755698700293',
    name: 'Realistic Human Synthesis',
    description: 'Quy trình tạo chân dung người thật với độ phân giải 4K siêu sắc nét.',
    iconType: 'Portrait',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800',
    config: Z_IMAGE_TURBO_JSON
  },
  {
    id: '2013456755698700294',
    name: 'Cinematic World Build',
    description: 'Kiến tạo bối cảnh không gian rộng lớn chuẩn điện ảnh.',
    iconType: 'Cinematic',
    imageUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=800',
    config: Z_IMAGE_TURBO_JSON
  },
  {
    id: '2013456755698700295',
    name: 'Product Ad Workflow',
    description: 'Tự động hóa việc tạo ảnh quảng cáo sản phẩm chuyên nghiệp.',
    iconType: 'Product',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
    config: Z_IMAGE_TURBO_JSON
  }
];

const CONFIG = {
  BASE_URL: 'https://www.runninghub.ai',
  DEFAULT_WORKFLOW_ID: '2013456755698700290',
  DEFAULT_API_KEY: 'aa6dd04cb596415697e7f4337a737ddb',
  POLL_INTERVAL: 3000,
  MAX_POLL_ATTEMPTS: 120
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

  const saveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('runninghub_api_key', key);
  };

  const getApiKey = () => localStorage.getItem('runninghub_api_key') || apiKey;

  async function uploadFile(file: File) {
    const currentApiKey = getApiKey();
    if (!currentApiKey) throw new Error('API Key RunningHub chưa được thiết lập');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('apiKey', currentApiKey);

    const response = await fetch(`${CONFIG.BASE_URL}/task/openapi/upload`, {
        method: 'POST',
        body: formData
    });

    const result = await response.json();
    if (result.code !== 0) throw new Error(result.msg || 'Upload thất bại');
    return result.data;
  }

  const createTask = async (wid: string) => {
    const currentApiKey = getApiKey();
    if (!currentApiKey) throw new Error('Vui lòng cấu hình API Key');

    const nodeInfoList: Array<{nodeId: string, fieldName: string, fieldValue: string}> = [];
    
    workflowConfig.forEach(node => {
      Object.entries(node.inputs).forEach(([key, val]) => {
        if (!Array.isArray(val)) {
          nodeInfoList.push({
            nodeId: node.id,
            fieldName: key,
            fieldValue: String(val)
          });
        }
      });
    });

    const response = await fetch(`${CONFIG.BASE_URL}/task/openapi/create`, {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: currentApiKey,
        workflowId: wid,
        nodeInfoList: nodeInfoList,
        addMetadata: true
      })
    });

    const result = await response.json();
    if (result.code !== 0) throw new Error(result.msg || 'Khởi tạo tác vụ thất bại');
    return result.data;
  };

  const pollForCompletion = async (taskId: string) => {
    const currentApiKey = getApiKey();
    let attempts = 0;
    while (attempts < CONFIG.MAX_POLL_ATTEMPTS) {
      const response = await fetch(`${CONFIG.BASE_URL}/task/openapi/outputs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: currentApiKey, taskId })
      });
      const result = await response.json();
      if (result.code === 0 && result.data && result.data.length > 0) return result.data;
      if (result.code !== 0 && result.code !== 804) throw new Error(result.msg || 'Tác vụ lỗi');
      attempts++;
      setStatusText(`Đang xử lý... (${attempts * 3}s)`);
      await new Promise(r => setTimeout(r, CONFIG.POLL_INTERVAL));
    }
    throw new Error('Tác vụ quá thời gian');
  };

  const handleGenerate = async () => {
    if (isGenerating) return;
    try {
      setIsGenerating(true);
      setStatusText('Đang khởi tạo...');
      const startTime = Date.now();
      const taskData = await createTask(workflowId);
      const outputs = await pollForCompletion(taskData.taskId);
      
      const newResults: GeneratedResult[] = outputs.map((out: any, idx: number) => ({
        id: `${taskData.taskId}-${idx}`,
        url: out.fileUrl,
        timestamp: new Date().toLocaleTimeString(),
        workflowId: workflowId
      }));

      setResults(prev => [...newResults, ...prev]);
      setGenerationTime(Math.round((Date.now() - startTime) / 1000));
      setStatusText('Hoàn tất');
      refreshUserInfo();
    } catch (error: any) {
      setStatusText(`Lỗi: ${error.message}`);
      throw error;
    } finally {
      setIsGenerating(false);
      setTimeout(() => setStatusText('Hệ thống sẵn sàng'), 3000);
    }
  };

  const handleImport = async (input: File | string) => {
    setIsUploadingJson(true);
    setStatusText('Đang phân tích kịch bản...');
    try {
      let rawJson = '';
      let isFile = false;
      
      if (typeof input === 'string') {
        rawJson = input;
      } else {
        rawJson = await input.text();
        isFile = true;
      }

      const workflowData = JSON.parse(rawJson);
      const nodes: WorkflowNode[] = [];
      
      Object.keys(workflowData).forEach(key => {
        const node = workflowData[key];
        if (node.inputs) {
          nodes.push({
            id: key,
            title: node._meta?.title || node.class_type,
            classType: node.class_type,
            inputs: node.inputs
          });
        }
      });
      setWorkflowConfig(nodes);

      if (isFile) {
        const data = await uploadFile(input as File);
        if (data && data.workflowId) {
          setWorkflowId(data.workflowId);
        }
      }

      setStatusText('Nhập kịch bản thành công');
      return true;
    } catch (error: any) {
      setStatusText(`Lỗi: ${error.message}`);
      throw error;
    } finally {
      setIsUploadingJson(false);
    }
  };

  const updateConfigValue = (nodeId: string, inputKey: string, value: any) => {
    setWorkflowConfig(prev => prev.map(node => {
      if (node.id === nodeId) {
        return { ...node, inputs: { ...node.inputs, [inputKey]: value } };
      }
      return node;
    }));
  };

  return {
    workflowId, setWorkflowId, workflowConfig, updateConfigValue,
    isGenerating, isUploadingJson, statusText, results, setResults,
    generationTime, apiKey, saveApiKey, showApiKey, setShowApiKey,
    handleGenerate, handleImport
  };
};
