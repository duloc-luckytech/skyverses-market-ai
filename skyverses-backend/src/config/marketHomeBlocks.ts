export type HomeBlockKey =
  | "top_trending"
  | "featured"
  | "new"
  | "3d"
  | "events"
  | "image"
  | "video"
  | "tools"
  | "audio"
  | "prompt"
  | "workflow"
  | "developer"
  | "enterprise";

export interface HomeBlockConfig {
  key: HomeBlockKey;

  title: {
    en: string;
    vi?: string;
    ko?: string;
    ja?: string;
  };

  subtitle?: {
    en: string;
    vi?: string;
    ko?: string;
    ja?: string;
  };

  limit?: number;
  order?: number;
  icon?: string;
}
export const HOME_BLOCKS_CONFIG: HomeBlockConfig[] = [
  {
    key: "top_trending",
    title: {
      en: "Top Trending",
      vi: "Xu hướng nổi bật",
    },
    subtitle: {
      en: "Most popular AI tools this week",
      vi: "Công cụ AI được dùng nhiều nhất tuần này",
    },
    limit: 8,
    order: 1,
  },

  {
    key: "featured",
    title: {
      en: "Featured Tools",
      vi: "Công cụ nổi bật",
    },
    subtitle: {
      en: "Hand-picked tools by Skyverses",
      vi: "Được chọn lọc bởi Skyverses",
    },
    limit: 6,
    order: 2,
  },

  {
    key: "new",
    title: {
      en: "New Arrivals",
      vi: "Sản phẩm mới",
    },
    subtitle: {
      en: "Recently launched AI tools",
      vi: "Công cụ AI vừa ra mắt",
    },
    limit: 6,
    order: 3,
  },

  {
    key: "image",
    title: {
      en: "Image Tools",
      vi: "Công cụ hình ảnh",
    },
    subtitle: {
      en: "Create, edit and enhance images with AI",
      vi: "Tạo, chỉnh sửa và nâng cấp hình ảnh bằng AI",
    },
    limit: 8,
    order: 4,
  },

  {
    key: "video",
    title: {
      en: "Video Tools",
      vi: "Công cụ video",
    },
    subtitle: {
      en: "Generate and edit videos with AI",
      vi: "Tạo và chỉnh sửa video bằng AI",
    },
    limit: 8,
    order: 5,
  },

  {
    key: "workflow",
    title: {
      en: "Workflow Automation",
      vi: "Tự động hoá Workflow",
    },
    subtitle: {
      en: "End-to-end AI pipelines for production",
      vi: "Chuỗi xử lý AI hoàn chỉnh cho production",
    },
    limit: 6,
    order: 6,
  },


  {
    key: "audio",
    title: {
      en: "Audio Tools",
      vi: "Công cụ âm thanh",
    },
    subtitle: {
      en: "Voice, music and sound powered by AI",
      vi: "Giọng nói, âm nhạc và âm thanh với AI",
    },
    limit: 8,
    order: 7,
  },

  {
    key: "prompt",
    title: {
      en: "Prompt Tools",
      vi: "Công cụ Prompt",
    },
    subtitle: {
      en: "Build and manage powerful AI prompts",
      vi: "Xây dựng và quản lý prompt AI chuyên nghiệp",
    },
    limit: 8,
    order: 8,
  },

  {
    key: "developer",
    title: {
      en: "For Developers",
      vi: "Dành cho lập trình viên",
    },
    subtitle: {
      en: "APIs and SDKs to integrate AI into your apps",
      vi: "API & SDK tích hợp AI vào ứng dụng",
    },
    limit: 6,
    order: 9,
  },

  {
    key: "enterprise",
    title: {
      en: "Enterprise Solutions",
      vi: "Giải pháp doanh nghiệp",
    },
    subtitle: {
      en: "Custom AI systems for large-scale teams",
      vi: "Hệ thống AI tuỳ chỉnh cho doanh nghiệp",
    },
    limit: 4,
    order: 10,
  },
  {
    key: "3d",
    title: {
      en: "3D & Spatial Tools",
      vi: "Công cụ 3D & Không gian",
    },
    subtitle: {
      en: "3D models, avatars and spatial AI creation",
      vi: "Tạo mô hình 3D, avatar và không gian bằng AI",
    },
    limit: 8,
    order: 11,
  },
  {
    key: "events",
    title: {
      en: "Seasonal & Holiday",
      vi: "Sự kiện & Dịp lễ",
    },
    subtitle: {
      en: "AI tools and templates for holidays, celebrations and special moments",
      vi: "Công cụ và template AI cho lễ hội, sinh nhật và dịp đặc biệt",
    },
    limit: 6,
    order: 12,
  },
  {
    key: "tools",
    title: {
      en: "Utility Tools",
      vi: "Công cụ tiện ích",
    },
    subtitle: {
      en: "Small AI tools that boost productivity",
      vi: "Những tiện ích AI nhỏ giúp tăng hiệu suất làm việc",
    },
    limit: 8,
    order: 13,
    icon: "🛠️",
  },
];
