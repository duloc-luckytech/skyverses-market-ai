
import { useState, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { productSubmissionApi } from '../apis/product-submission';

// ═══ FORM DATA TYPES ═══
export interface ProductSubmission {
  // Step 1: Product Info
  productName: string;
  productSlug: string;
  category: string;
  complexity: string;
  shortDescription: string;
  fullDescription: string;
  demoType: string;
  tags: string;
  
  // Step 2: Media & Pricing
  thumbnailUrl: string;
  galleryUrls: string;
  demoUrl: string;
  priceCredits: string;
  isFree: boolean;
  platforms: string[];
  
  // Step 3: Technical
  aiModels: string;
  features: string;
  apiEndpoint: string;
  documentation: string;
  
  // Step 4: Creator Info (auto-filled from auth)
  creatorName: string;
  creatorEmail: string;
  creatorStudio: string;
  creatorWebsite: string;
  creatorTelegram: string;
  additionalNotes: string;
}

export const PRODUCT_CATEGORIES = [
  { value: 'video', label: 'Video AI' },
  { value: 'image', label: 'Hình ảnh AI' },
  { value: 'audio', label: 'Giọng nói AI' },
  { value: 'music', label: 'Nhạc AI' },
  { value: 'automation', label: 'Tự động hóa' },
  { value: '3d', label: '3D & Game' },
  { value: 'agent', label: 'AI Agent' },
  { value: 'other', label: 'Khác' },
];

export const COMPLEXITY_LEVELS = [
  { value: 'Standard', label: 'Standard', desc: 'Dễ sử dụng, phù hợp đại chúng' },
  { value: 'Advanced', label: 'Advanced', desc: 'Nhiều tùy chỉnh, cho Pro user' },
  { value: 'Enterprise', label: 'Enterprise', desc: 'Custom workflow, cần hỗ trợ' },
];

export const DEMO_TYPES = [
  { value: 'text', label: 'Text / Chat' },
  { value: 'image', label: 'Image Generation' },
  { value: 'video', label: 'Video Generation' },
  { value: 'automation', label: 'Automation / Pipeline' },
];

export const PLATFORM_OPTIONS = [
  { value: 'web', label: 'Web App' },
  { value: 'ios', label: 'iOS' },
  { value: 'android', label: 'Android' },
  { value: 'extension', label: 'Browser Extension' },
  { value: 'api', label: 'API Only' },
];

export const SUBMISSION_STEPS = [
  { id: 1, title: 'Thông tin sản phẩm', desc: 'Tên, mô tả, danh mục' },
  { id: 2, title: 'Media & Giá', desc: 'Hình ảnh, demo, pricing' },
  { id: 3, title: 'Kỹ thuật', desc: 'AI models, features, API' },
  { id: 4, title: 'Xác nhận & Gửi', desc: 'Kiểm tra và submit' },
];

const INITIAL_FORM: ProductSubmission = {
  productName: '',
  productSlug: '',
  category: '',
  complexity: 'Standard',
  shortDescription: '',
  fullDescription: '',
  demoType: '',
  tags: '',
  thumbnailUrl: '',
  galleryUrls: '',
  demoUrl: '',
  priceCredits: '',
  isFree: false,
  platforms: ['web'],
  aiModels: '',
  features: '',
  apiEndpoint: '',
  documentation: '',
  creatorName: '',
  creatorEmail: '',
  creatorStudio: '',
  creatorWebsite: '',
  creatorTelegram: '',
  additionalNotes: '',
};

export const useAppsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState<ProductSubmission>(() => ({
    ...INITIAL_FORM,
    creatorName: user?.name || '',
    creatorEmail: user?.email || '',
  }));

  const updateField = useCallback(<K extends keyof ProductSubmission>(
    field: K,
    value: ProductSubmission[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const togglePlatform = useCallback((platform: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform],
    }));
  }, []);

  // Auto-generate slug from product name
  const autoSlug = useCallback((name: string) => {
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    setFormData(prev => ({ ...prev, productName: name, productSlug: slug }));
  }, []);

  // Validate current step
  const isStepValid = useMemo(() => {
    switch (currentStep) {
      case 1:
        return !!(formData.productName && formData.category && formData.shortDescription && formData.demoType);
      case 2:
        return !!(formData.thumbnailUrl);
      case 3:
        return !!(formData.features);
      case 4:
        return !!(formData.creatorName && formData.creatorEmail);
      default:
        return false;
    }
  }, [currentStep, formData]);

  const nextStep = useCallback(() => {
    if (currentStep < 4) setCurrentStep(prev => prev + 1);
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  }, [currentStep]);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= 4) setCurrentStep(step);
  }, []);

  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await productSubmissionApi.submit(formData);

      if (res.success) {
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 5000);
      } else {
        setSubmitError(res.message || 'Gửi thất bại. Vui lòng thử lại.');
      }
    } catch (err) {
      setSubmitError('Lỗi kết nối. Vui lòng kiểm tra mạng và thử lại.');
    }

    setIsSubmitting(false);
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData({
      ...INITIAL_FORM,
      creatorName: user?.name || '',
      creatorEmail: user?.email || '',
    });
    setCurrentStep(1);
    setIsSuccess(false);
  }, [user]);

  // Completion percentage
  const completionPercent = useMemo(() => {
    const fields = [
      formData.productName, formData.category, formData.shortDescription,
      formData.demoType, formData.thumbnailUrl, formData.features,
      formData.creatorName, formData.creatorEmail,
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  }, [formData]);

  return {
    currentStep,
    setCurrentStep,
    formData,
    updateField,
    togglePlatform,
    autoSlug,
    isStepValid,
    nextStep,
    prevStep,
    goToStep,
    handleSubmit,
    resetForm,
    isSubmitting,
    isSuccess,
    submitError,
    isAuthenticated,
    user,
    completionPercent,
  };
};
