import "dotenv/config";
import mongoose from "mongoose";
import crypto from "crypto";
import User from "../models/UserModel";
import PromptSet from "../models/PromptSet.model";
import PromptReview from "../models/PromptReview.model";
import PromptWishlist from "../models/PromptWishlist.model";
import SellerFollower from "../models/SellerFollower.model";

/* ─── helpers ─── */
const slug = (t: string) =>
  t.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "d")
    .replace(/[^a-zA-Z0-9\s]/g, " ").replace(/\s+/g, "-").trim().toLowerCase();

const code = () => crypto.randomBytes(4).toString("hex");
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

/* ═══════════════════════════════════════════════════
 * SEED USERS — 10 diverse creators
 * ═══════════════════════════════════════════════════ */
const SEED_USERS = [
  { name: "Alex Chen", email: "alex.chen.seed@skyverses.io", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex", specialty: "AI Prompt Engineering", bio: "Senior AI engineer with 8+ years building intelligent systems. Specializing in crafting high-performance prompts for GPT-4, Claude, and Midjourney.", verified: true, socialLinks: { website: "https://alexchen.dev", twitter: "alexchen_ai", github: "alexchendev" } },
  { name: "Sarah Kim", email: "sarah.kim.seed@skyverses.io", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah", specialty: "Content Marketing", bio: "Marketing strategist helping brands scale with AI-driven content. Former content lead at HubSpot.", verified: true, socialLinks: { website: "https://sarahkim.co", twitter: "sarahkim_mkt" } },
  { name: "Marcus Rivera", email: "marcus.r.seed@skyverses.io", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=marcus", specialty: "Full-Stack Development", bio: "Full-stack dev & open-source contributor. Building AI-powered developer tools.", verified: false, socialLinks: { github: "marcusrivera" } },
  { name: "Yuki Tanaka", email: "yuki.t.seed@skyverses.io", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=yuki", specialty: "UI/UX Design", bio: "Design lead creating beautiful AI-assisted design workflows. Figma & Midjourney expert.", verified: true, socialLinks: { website: "https://yukidesign.jp", twitter: "yuki_uxai" } },
  { name: "David Nguyen", email: "david.ng.seed@skyverses.io", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=david", specialty: "Business Strategy", bio: "Business consultant using AI to automate workflows and boost productivity for startups.", verified: false, socialLinks: { website: "https://davidnguyen.biz" } },
  { name: "Emma Watson", email: "emma.w.seed@skyverses.io", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emma", specialty: "Creative Writing", bio: "Published author & AI writing coach. Helping writers unlock creativity with smart prompts.", verified: true, socialLinks: { twitter: "emmawrites_ai" } },
  { name: "Raj Patel", email: "raj.p.seed@skyverses.io", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=raj", specialty: "Data Science", bio: "ML engineer & data scientist. Building prompts for data analysis, visualization, and research.", verified: false, socialLinks: { github: "rajpatel-ds" } },
  { name: "Luna Park", email: "luna.p.seed@skyverses.io", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=luna", specialty: "Graphic Design", bio: "Digital artist & Midjourney power user. Creating stunning visuals with AI-assisted workflows.", verified: true, socialLinks: { website: "https://lunapark.art", twitter: "luna_aiart" } },
  { name: "James Mitchell", email: "james.m.seed@skyverses.io", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=james", specialty: "Education & Training", bio: "EdTech innovator using AI to create personalized learning experiences. Former professor at MIT.", verified: false, socialLinks: { website: "https://jamesmitchell.edu" } },
  { name: "Mia Zhang", email: "mia.z.seed@skyverses.io", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mia", specialty: "Video Production", bio: "Video producer & AI filmmaker. Crafting cinematic prompts for Sora, Runway, and Pika.", verified: true, socialLinks: { twitter: "miazhang_video", website: "https://miazhang.studio" } },
];

/* ═══════════════════════════════════════════════════
 * 30 PROMPT SETS — diverse categories & fields
 * ═══════════════════════════════════════════════════ */
type Cat = "coding" | "writing" | "marketing" | "design" | "business" | "education" | "other";

interface SeedPrompt {
  title: { en: string; vi: string };
  category: Cat;
  tags: string[];
  priceSKT: number;
  isFree?: boolean;
  featured?: boolean;
  sellerIdx: number;
  description: { en: string; vi: string };
  previewText: string;
  coverImage: string;
  models: string[];
  prompts: Array<{
    title: string;
    content: string;
    description: string;
    variables?: Array<{ name: string; description: string; defaultValue: string }>;
  }>;
  examples: Array<{ input: string; output: string; image?: string }>;
}

const PROMPTS: SeedPrompt[] = [
  // ═══════════════ CODING (5) ═══════════════
  {
    title: { en: "React + Tailwind Component Library", vi: "Thư viện Component React + Tailwind" },
    category: "coding",
    tags: ["react", "tailwind", "ui", "components", "typescript"],
    priceSKT: 75,
    featured: true,
    sellerIdx: 2,
    description: {
      en: "Generate production-ready React + Tailwind CSS components with TypeScript. Includes accessible forms, data tables, modals, cards, navigation, and more. Each component follows atomic design principles with proper prop interfaces.",
      vi: "Tạo component React + Tailwind CSS sẵn sàng production với TypeScript. Bao gồm form accessible, bảng dữ liệu, modal, card, navigation. Mỗi component tuân theo nguyên tắc atomic design."
    },
    previewText: "You are a senior React developer specializing in Tailwind CSS. Generate a {{componentType}} component with full TypeScript types...",
    coverImage: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80",
    models: ["gpt-4", "claude-4", "gemini-2"],
    prompts: [
      {
        title: "Accessible Form Component",
        content: "Create a fully accessible React form component using Tailwind CSS.\n\nComponent: {{componentName}}\nFields: {{fields}}\n\nRequirements:\n- TypeScript with strict prop interfaces\n- Tailwind CSS only (no inline styles)\n- Full ARIA labels and keyboard navigation\n- Client-side validation with error messages\n- Loading state with disabled inputs during submit\n- Dark mode support (dark: variants)\n- Responsive (mobile-first)\n- useForm custom hook for state management\n- Animated error/success states with CSS transitions\n\nReturn the component, hook, and usage example.",
        description: "Creates accessible, validated form components with Tailwind",
        variables: [
          { name: "componentName", description: "Name of the form component", defaultValue: "ContactForm" },
          { name: "fields", description: "Form fields to include", defaultValue: "name (text), email (email), phone (tel), message (textarea), category (select), subscribe (checkbox)" },
        ],
      },
      {
        title: "Data Table with Sort/Filter/Paginate",
        content: "Build a fully-featured data table component in React + Tailwind.\n\nFeatures:\n- Column sorting (asc/desc/none) with visual indicators\n- Multi-column filtering with type-aware inputs\n- Client-side pagination with configurable page sizes\n- Row selection with bulk actions toolbar\n- Responsive: horizontal scroll on mobile, card view below {{breakpoint}}\n- Column resizing and reordering\n- Sticky header on scroll\n- Empty state and loading skeleton\n- Export to CSV button\n\nData type: {{dataType}}\nColumns: {{columns}}\n\nReturn component, types, and demo with sample data.",
        description: "Full-featured data table with responsive card view",
        variables: [
          { name: "dataType", description: "Type of data to display", defaultValue: "User" },
          { name: "columns", description: "Table columns", defaultValue: "avatar, name, email, role, status, joinDate, lastActive" },
          { name: "breakpoint", description: "Responsive breakpoint", defaultValue: "768px" },
        ],
      },
      {
        title: "Modal & Drawer System",
        content: "Create a reusable modal and drawer system for React + Tailwind.\n\nFeatures:\n- Modal component with sizes: sm, md, lg, xl, full\n- Drawer component sliding from: left, right, top, bottom\n- Shared portal rendering (React Portal)\n- Focus trap inside modal/drawer\n- ESC key to close\n- Click outside to dismiss (configurable)\n- Smooth enter/exit animations\n- Nested modals support (stacking)\n- Body scroll lock when open\n- Accessible: role=\"dialog\", aria-modal, aria-labelledby\n\nReturn: Modal, Drawer, ModalProvider, useModal hook.",
        description: "Complete modal/drawer system with animations and accessibility",
      },
    ],
    examples: [
      { input: "Generate a ContactForm with name, email, message fields", output: "A responsive, accessible contact form with validation, loading states, and dark mode support. Includes useContactForm hook for state management.", image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80" },
      { input: "Build a User data table with sort and filter", output: "Full data table with sortable columns, search filter, pagination, and CSV export. Switches to card layout on mobile.", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80" },
    ],
  },
  {
    title: { en: "Full-Stack API Architecture Kit", vi: "Bộ công cụ kiến trúc API Full-Stack" },
    category: "coding",
    tags: ["api", "nodejs", "express", "prisma", "architecture"],
    priceSKT: 90,
    sellerIdx: 0,
    description: {
      en: "Design and implement scalable REST/GraphQL APIs with Node.js. Covers authentication, rate limiting, caching, error handling, database schema design with Prisma, and comprehensive testing strategies.",
      vi: "Thiết kế và triển khai API REST/GraphQL với Node.js. Bao gồm xác thực, rate limiting, caching, xử lý lỗi, thiết kế schema database với Prisma, và chiến lược testing."
    },
    previewText: "Design a scalable API for {{domain}} with proper error handling, auth, and caching...",
    coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
    models: ["gpt-4", "claude-4"],
    prompts: [
      {
        title: "REST API with Auth & Rate Limiting",
        content: "Design a production REST API for {{domain}} using Node.js + Express + Prisma.\n\nResources: {{resources}}\n\nGenerate:\n1. Prisma schema with proper relations and indexes\n2. Express routes with middleware chain:\n   - JWT authentication (access + refresh tokens)\n   - Role-based authorization middleware\n   - Rate limiting (sliding window, per-user)\n   - Request validation (Zod schemas)\n   - Response caching (Redis, configurable TTL)\n3. Error handling:\n   - Custom error classes (AppError, ValidationError, AuthError)\n   - Global error handler with structured JSON responses\n   - Request ID tracking for debugging\n4. Pagination: cursor-based for lists, offset for search\n5. API versioning strategy (URL prefix)\n\nReturn folder structure and all files.",
        description: "Complete REST API with auth, rate limiting, caching, and error handling",
        variables: [
          { name: "domain", description: "API domain", defaultValue: "E-commerce marketplace" },
          { name: "resources", description: "API resources", defaultValue: "products, orders, users, reviews, categories, carts" },
        ],
      },
      {
        title: "Database Migration & Seed Strategy",
        content: "Create a database migration and seeding strategy for {{database}} using Prisma.\n\nEntities: {{entities}}\nRelationships: {{relationships}}\n\nGenerate:\n1. Initial migration schema\n2. Seed script with realistic fake data (Faker.js)\n3. Migration for adding {{newFeature}} (with zero-downtime strategy)\n4. Rollback procedures\n5. Data validation scripts\n6. Performance indexes analysis\n\nInclude a README explaining the migration workflow.",
        description: "Database migration strategy with seeds and rollback",
        variables: [
          { name: "database", description: "Database type", defaultValue: "PostgreSQL" },
          { name: "entities", description: "Data entities", defaultValue: "User, Product, Order, OrderItem, Review, Category" },
          { name: "relationships", description: "Entity relationships", defaultValue: "User hasMany Orders, Order hasMany OrderItems, Product hasMany Reviews, Category hasMany Products" },
          { name: "newFeature", description: "New feature to migrate", defaultValue: "multi-currency support with exchange rates table" },
        ],
      },
    ],
    examples: [
      { input: "Design API for e-commerce with products, orders, users", output: "Complete Express + Prisma API with JWT auth, Redis caching, rate limiting, Zod validation, cursor pagination, and structured error handling.", image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80" },
    ],
  },
  {
    title: { en: "Python AI/ML Pipeline Templates", vi: "Template Pipeline AI/ML bằng Python" },
    category: "coding",
    tags: ["python", "machine-learning", "ai", "data-science", "pipeline"],
    priceSKT: 110,
    featured: true,
    sellerIdx: 6,
    description: {
      en: "Build production ML pipelines with Python. From data preprocessing to model training, evaluation, and deployment. Supports scikit-learn, PyTorch, TensorFlow, and LangChain for LLM applications.",
      vi: "Xây dựng pipeline ML production với Python. Từ tiền xử lý dữ liệu đến training, đánh giá, và triển khai model. Hỗ trợ scikit-learn, PyTorch, TensorFlow, và LangChain."
    },
    previewText: "Build an end-to-end ML pipeline for {{task}} using {{framework}}...",
    coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    models: ["gpt-4", "claude-4", "gemini-2"],
    prompts: [
      {
        title: "End-to-End ML Pipeline",
        content: "Build a production ML pipeline for {{task}}.\n\nDataset: {{dataset}}\nFramework: {{framework}}\n\nPipeline stages:\n1. **Data Loading & EDA**\n   - Load from {{source}}\n   - Automated EDA report (distributions, correlations, missing values)\n   - Data quality score\n\n2. **Preprocessing**\n   - Handle missing values (strategy per column type)\n   - Feature encoding (one-hot, label, target encoding)\n   - Feature scaling (standard/minmax based on distribution)\n   - Feature selection (mutual information, variance threshold)\n   - Train/val/test split with stratification\n\n3. **Model Training**\n   - Baseline model + 3 candidates\n   - Hyperparameter tuning (Optuna)\n   - Cross-validation (5-fold)\n   - Early stopping\n\n4. **Evaluation**\n   - Metrics: {{metrics}}\n   - Confusion matrix / ROC-AUC visualization\n   - Feature importance (SHAP values)\n   - Error analysis on worst predictions\n\n5. **Deployment**\n   - Model serialization (joblib/ONNX)\n   - FastAPI inference endpoint\n   - Input validation with Pydantic\n   - Model monitoring hooks\n\nReturn complete Python code with type hints.",
        description: "Complete ML pipeline from data to deployment",
        variables: [
          { name: "task", description: "ML task", defaultValue: "customer churn prediction" },
          { name: "dataset", description: "Dataset description", defaultValue: "100K rows, 25 features (demographics, usage, billing)" },
          { name: "framework", description: "ML framework", defaultValue: "scikit-learn + XGBoost" },
          { name: "source", description: "Data source", defaultValue: "PostgreSQL" },
          { name: "metrics", description: "Evaluation metrics", defaultValue: "accuracy, precision, recall, F1, AUC-ROC" },
        ],
      },
      {
        title: "LangChain RAG System",
        content: "Build a production RAG system using LangChain.\n\nUse case: {{useCase}}\nData: {{dataSource}}\nLLM: {{llm}}\n\nArchitecture:\n1. Document ingestion (PDF, Markdown, HTML)\n2. Smart chunking (recursive, semantic boundaries)\n3. Embedding + vector store ({{vectorDB}})\n4. Hybrid retrieval (dense + BM25 sparse)\n5. Re-ranking with cross-encoder\n6. Context-aware prompt with conversation memory\n7. Streaming response with source citations\n8. Evaluation suite (faithfulness, relevance, coherence)\n\nReturn all Python files with proper project structure.",
        description: "Production RAG with hybrid retrieval and evaluation",
        variables: [
          { name: "useCase", description: "RAG use case", defaultValue: "internal knowledge base Q&A" },
          { name: "dataSource", description: "Documents to index", defaultValue: "company wiki (500+ Markdown files)" },
          { name: "llm", description: "Language model", defaultValue: "Claude 4 Sonnet" },
          { name: "vectorDB", description: "Vector database", defaultValue: "Pinecone" },
        ],
      },
    ],
    examples: [
      { input: "Build churn prediction pipeline with scikit-learn", output: "Full pipeline with EDA, preprocessing, XGBoost tuning via Optuna, SHAP explanations, and FastAPI deployment endpoint.", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80" },
      { input: "Create RAG for company wiki with Claude", output: "LangChain RAG with PDF/Markdown ingestion, Pinecone vector store, hybrid retrieval, and streaming responses with citations.", image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80" },
    ],
  },
  {
    title: { en: "Mobile App Development Prompts (React Native)", vi: "Bộ prompt phát triển ứng dụng di động (React Native)" },
    category: "coding",
    tags: ["react-native", "mobile", "ios", "android", "expo"],
    priceSKT: 65,
    sellerIdx: 2,
    description: {
      en: "Accelerate React Native development with prompts for navigation, state management, native modules, animations, and platform-specific UI. Works with Expo and bare RN projects.",
      vi: "Tăng tốc phát triển React Native với prompt cho navigation, state management, native modules, animation, và UI theo từng nền tảng. Hoạt động với cả Expo và bare RN."
    },
    previewText: "Build a React Native {{screenType}} screen with {{feature}} using Expo...",
    coverImage: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80",
    models: ["gpt-4", "claude-4"],
    prompts: [
      {
        title: "Screen with Navigation & Animations",
        content: "Create a React Native screen: {{screenName}}\n\nFeatures:\n- {{feature}}\n- React Navigation integration (stack/tab as needed)\n- Reanimated 3 animations for transitions\n- Gesture Handler for swipe actions\n- Platform-specific styling (iOS blur, Android elevation)\n- Safe area handling\n- Pull-to-refresh\n- Skeleton loading state\n- Error boundary with retry\n\nUse: Expo SDK {{sdkVersion}}, TypeScript, NativeWind (Tailwind for RN)\n\nReturn the screen, navigation config, and types.",
        description: "Full screen with navigation, animations, and platform UI",
        variables: [
          { name: "screenName", description: "Screen name", defaultValue: "ProductDetail" },
          { name: "feature", description: "Main feature", defaultValue: "image carousel with parallax header, add to cart with haptic feedback" },
          { name: "sdkVersion", description: "Expo SDK version", defaultValue: "52" },
        ],
      },
      {
        title: "Offline-First Data Layer",
        content: "Create an offline-first data layer for a React Native app.\n\nEntities: {{entities}}\nSync strategy: {{syncStrategy}}\n\nImplement:\n1. Local storage with WatermelonDB/SQLite\n2. Background sync queue (retry with backoff)\n3. Conflict resolution ({{conflictStrategy}})\n4. Optimistic UI updates\n5. Network status detection\n6. Sync progress indicator\n7. Data migration between app versions\n\nReturn all files with TypeScript.",
        description: "Offline-first architecture with sync and conflict resolution",
        variables: [
          { name: "entities", description: "Data entities", defaultValue: "Task, Project, Comment, Attachment" },
          { name: "syncStrategy", description: "How to sync", defaultValue: "background periodic + on-reconnect" },
          { name: "conflictStrategy", description: "Conflict resolution", defaultValue: "last-write-wins with manual merge for edits" },
        ],
      },
    ],
    examples: [
      { input: "Build ProductDetail screen with image carousel", output: "Animated product screen with parallax header, swipeable image carousel, haptic cart button, and skeleton loading.", image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80" },
    ],
  },
  {
    title: { en: "DevOps & Cloud Infrastructure Prompts", vi: "Bộ prompt DevOps & Hạ tầng Cloud" },
    category: "coding",
    tags: ["devops", "aws", "terraform", "docker", "kubernetes", "cicd"],
    priceSKT: 85,
    sellerIdx: 0,
    description: {
      en: "Infrastructure-as-code templates and CI/CD pipelines for AWS, GCP, and Azure. Includes Terraform modules, Kubernetes manifests, Docker configs, and monitoring setups with Grafana/Prometheus.",
      vi: "Template infrastructure-as-code và CI/CD pipeline cho AWS, GCP, Azure. Bao gồm Terraform modules, Kubernetes manifests, Docker configs, và monitoring với Grafana/Prometheus."
    },
    previewText: "Create a Terraform module for {{infrastructure}} on {{cloud}}...",
    coverImage: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&q=80",
    models: ["gpt-4", "claude-4"],
    prompts: [
      {
        title: "Terraform Module for Production",
        content: "Create a Terraform module for {{infrastructure}} on {{cloud}}.\n\nRequirements:\n- Modular structure (modules/, environments/)\n- Remote state (S3 + DynamoDB lock)\n- Variables with validation and descriptions\n- Outputs for cross-module references\n- Tags strategy (environment, team, cost-center)\n- Security: least privilege IAM, encryption at rest/transit\n- High availability: multi-AZ, auto-scaling\n- Cost optimization: spot instances where applicable\n- Monitoring: CloudWatch alarms / GCP alerts\n\nEnvironments: dev, staging, prod (with tfvars)\n\nReturn all .tf files with comments.",
        description: "Production Terraform with multi-env, security, HA",
        variables: [
          { name: "infrastructure", description: "What to provision", defaultValue: "EKS cluster with RDS PostgreSQL, ElastiCache Redis, ALB" },
          { name: "cloud", description: "Cloud provider", defaultValue: "AWS" },
        ],
      },
      {
        title: "Kubernetes Deployment Manifests",
        content: "Create Kubernetes manifests for deploying {{application}} to production.\n\nGenerate:\n1. Deployment with:\n   - Resource limits/requests\n   - Liveness/readiness probes\n   - Rolling update strategy\n   - Pod disruption budget\n   - Affinity/anti-affinity rules\n2. Service (ClusterIP + LoadBalancer)\n3. Ingress with TLS (cert-manager)\n4. HPA (CPU + custom metrics)\n5. ConfigMap + Secrets (sealed-secrets)\n6. NetworkPolicy\n7. ServiceAccount with IRSA/Workload Identity\n8. Kustomize overlays (dev/staging/prod)\n\nReturn YAML manifests with comments.",
        description: "Complete K8s manifests with Kustomize overlays",
        variables: [
          { name: "application", description: "Application type", defaultValue: "Node.js microservice with Redis dependency" },
        ],
      },
    ],
    examples: [
      { input: "Terraform for EKS + RDS on AWS", output: "Modular Terraform with remote state, multi-AZ EKS, RDS with read replicas, ElastiCache, ALB, and CloudWatch monitoring.", image: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&q=80" },
    ],
  },

  // ═══════════════ WRITING (5) ═══════════════
  {
    title: { en: "Blog & SEO Content Engine", vi: "Công cụ tạo nội dung Blog & SEO" },
    category: "writing",
    tags: ["blog", "seo", "content-marketing", "articles", "copywriting"],
    priceSKT: 45,
    featured: true,
    sellerIdx: 1,
    description: {
      en: "Complete content creation system for blogs and SEO. From keyword research outlines to full articles with meta descriptions, internal linking strategy, and social media snippets. Proven to increase organic traffic.",
      vi: "Hệ thống tạo nội dung hoàn chỉnh cho blog và SEO. Từ outline nghiên cứu keyword đến bài viết đầy đủ với meta description, chiến lược internal linking, và social media snippets."
    },
    previewText: "Write an SEO-optimized article about {{topic}} targeting {{keyword}} for {{audience}}...",
    coverImage: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80",
    models: ["gpt-4", "claude-4", "gemini-2"],
    prompts: [
      {
        title: "SEO Article with Internal Linking",
        content: "Write a {{wordCount}}-word SEO article.\n\nTopic: {{topic}}\nPrimary keyword: {{keyword}}\nSecondary keywords: {{secondaryKeywords}}\nTarget audience: {{audience}}\nTone: {{tone}}\n\nStructure:\n1. Hook opening (question, surprising stat, or micro-story)\n2. Quick summary box (TL;DR for scanners)\n3. Main content with H2/H3 hierarchy\n4. Practical examples with code/screenshots where relevant\n5. Expert quotes or data citations\n6. FAQ section (5 questions, schema markup ready)\n7. Conclusion with clear CTA\n\nSEO checklist:\n- Keyword density 1-2%\n- LSI keywords naturally woven in\n- Meta title (60 chars) + meta description (155 chars)\n- Open Graph title + description\n- Image alt text suggestions (3-5 images)\n- Internal link anchors (suggest 4-6)\n- External authority links (2-3)\n\nAlso generate:\n- Twitter thread (5 tweets)\n- LinkedIn post (150 words)\n- Newsletter teaser (3 sentences)",
        description: "Full SEO article with social media repurposing",
        variables: [
          { name: "topic", description: "Article topic", defaultValue: "How to Use AI for Product Photography in 2025" },
          { name: "keyword", description: "Primary keyword", defaultValue: "AI product photography" },
          { name: "secondaryKeywords", description: "Secondary keywords", defaultValue: "AI photo editing, product image generation, e-commerce photography" },
          { name: "audience", description: "Target readers", defaultValue: "e-commerce store owners and marketers" },
          { name: "wordCount", description: "Target length", defaultValue: "2500" },
          { name: "tone", description: "Writing tone", defaultValue: "authoritative but conversational" },
        ],
      },
      {
        title: "Content Calendar Generator",
        content: "Create a {{duration}} content calendar for {{brand}}.\n\nNiche: {{niche}}\nGoal: {{goal}}\nPublishing frequency: {{frequency}}\n\nFor each content piece generate:\n- Title (with keyword target)\n- Content type (pillar, cluster, news, opinion, tutorial)\n- Target keyword + search intent\n- Brief outline (5 bullet points)\n- Estimated word count\n- Internal links to other pieces in the calendar\n- Social distribution plan\n- Publish date\n\nAlso include:\n- Content cluster map (pillar pages + supporting articles)\n- Seasonal/trending topic opportunities\n- Competitor gap analysis approach\n- KPIs to track for each piece",
        description: "Strategic content calendar with topic clustering",
        variables: [
          { name: "duration", description: "Calendar period", defaultValue: "3-month" },
          { name: "brand", description: "Brand name", defaultValue: "TechStartup AI" },
          { name: "niche", description: "Content niche", defaultValue: "AI tools for small businesses" },
          { name: "goal", description: "Content goal", defaultValue: "increase organic traffic 3x and generate 500 leads/month" },
          { name: "frequency", description: "Publishing frequency", defaultValue: "3 articles per week" },
        ],
      },
    ],
    examples: [
      { input: "Write SEO article about AI product photography", output: "2500-word article with H2/H3 structure, FAQ schema, meta tags, 5-tweet thread, LinkedIn post, and newsletter teaser.", image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80" },
      { input: "3-month content calendar for AI tools blog", output: "36 articles organized in 4 content clusters with keyword targets, outlines, and cross-linking strategy.", image: "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800&q=80" },
    ],
  },
  {
    title: { en: "Fiction & Storytelling Masterclass Prompts", vi: "Bộ prompt viết truyện & kể chuyện nâng cao" },
    category: "writing",
    tags: ["fiction", "storytelling", "creative-writing", "novel", "screenplay"],
    priceSKT: 60,
    sellerIdx: 5,
    description: {
      en: "Craft compelling stories with AI-assisted prompts for character development, world-building, plot architecture, dialogue, and scene writing. For novelists, screenwriters, and game narrative designers.",
      vi: "Sáng tạo câu chuyện hấp dẫn với prompt AI cho phát triển nhân vật, xây dựng thế giới, kiến trúc cốt truyện, đối thoại, và viết cảnh. Dành cho tiểu thuyết gia, biên kịch, và nhà thiết kế narrative game."
    },
    previewText: "Create a deep character profile for {{characterRole}} in a {{genre}} story set in {{setting}}...",
    coverImage: "https://images.unsplash.com/photo-1519791883288-dc8bd696e667?w=800&q=80",
    models: ["gpt-4", "claude-4", "gemini-2"],
    prompts: [
      {
        title: "Three-Dimensional Character Builder",
        content: "Create a three-dimensional character for a {{genre}} story.\n\nRole: {{characterRole}}\nSetting: {{setting}}\n\n**Layer 1 — Surface**\nName (symbolic meaning), age, appearance (3 distinctive features someone would remember), voice pattern (speech rhythm, vocabulary, accent, catchphrase), body language default, fashion/style signature.\n\n**Layer 2 — Psychology**\nCore desire vs. core fear (in direct tension), moral code (what they'd die for, what they'd kill for), defense mechanism under stress, attachment style, one trait they think is a strength but is actually a weakness.\n\n**Layer 3 — History**\nThe wound (formative event that shaped their worldview), the lie they believe because of the wound, a secret they keep from everyone, 3 key relationships (ally, enemy, complicated).\n\n**Layer 4 — Arc**\nWhere they start emotionally → what forces change → what they sacrifice → where they end. The moment of truth: what choice defines who they become?\n\nWrite as narrative prose. Make this person feel unforgettable.",
        description: "Multi-layered character creation with psychological depth",
        variables: [
          { name: "genre", description: "Story genre", defaultValue: "dystopian sci-fi" },
          { name: "characterRole", description: "Character role", defaultValue: "a rebel leader who secretly doubts the cause" },
          { name: "setting", description: "Story setting", defaultValue: "a corporate-owned Mars colony in 2187" },
        ],
      },
      {
        title: "World-Building Document",
        content: "Build a detailed world for a {{genre}} story.\n\n**Core Concept:** {{concept}}\n**Scale:** {{scale}}\n\nGenerate:\n\n1. **Rules of the World** — What's different from our reality? (magic system / technology / social structure). What are the hard limits? What's the cost of power?\n\n2. **Geography & Environment** — 3 distinct regions with climate, resources, and how environment shapes culture.\n\n3. **Power Structures** — Who rules? How is power gained/lost? What tensions exist between factions?\n\n4. **Culture & Daily Life** — Food, music, religion, taboos, rites of passage. What does a normal Tuesday look like for different social classes?\n\n5. **History** — 3 pivotal events that shaped the current world. What do people argue about from the past?\n\n6. **Conflicts** — 3 brewing conflicts at different scales (personal, community, world).\n\n7. **Sensory Palette** — What does this world smell like, sound like, feel like? Give writers specific details to anchor scenes.\n\nWrite as an immersive guide, not a dry encyclopedia.",
        description: "Comprehensive world-building with culture and conflict",
        variables: [
          { name: "genre", description: "Genre", defaultValue: "dark fantasy" },
          { name: "concept", description: "World concept", defaultValue: "A world where memories can be extracted, traded, and implanted — and the rich live thousands of years of curated experience while the poor sell theirs to survive" },
          { name: "scale", description: "World scale", defaultValue: "single continent with 5 nations" },
        ],
      },
      {
        title: "Scene Writing with Cinematic Tension",
        content: "Write a pivotal scene for a {{genre}} story.\n\nContext: {{context}}\nPOV: {{pov}}\nEmotional trajectory: {{arc}}\n\nRules:\n- Open in media res\n- Engage 3+ senses (not just visual)\n- Dialogue must carry subtext — characters mean more than they say\n- Vary sentence length: short = tension, long = reflection\n- Include one surprising sensory detail\n- Build to a turn/reversal the reader doesn't see coming\n- End on a line that echoes in the reader's mind\n- Show emotions through physical action, not adjectives\n\nLength: ~1200 words. Literary quality. No clichés.",
        description: "Cinematic scene with tension, subtext, and sensory detail",
        variables: [
          { name: "genre", description: "Genre", defaultValue: "psychological thriller" },
          { name: "context", description: "Scene context", defaultValue: "Two former partners meet at a funeral, each believing the other betrayed them. Neither knows they were both manipulated by the deceased." },
          { name: "pov", description: "Point of view", defaultValue: "First person, the one who arrived late" },
          { name: "arc", description: "Emotional trajectory", defaultValue: "controlled composure → cracks of doubt → devastating realization" },
        ],
      },
    ],
    examples: [
      { input: "Create a rebel leader character for Mars colony dystopia", output: "4-layer character with psychological depth, formative wound, complex relationships, and a devastating choice that defines their arc.", image: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=800&q=80" },
      { input: "Build a dark fantasy world with memory trading", output: "Immersive world document with magic system rules, 5 nations, power structures, daily life details, and 3 brewing conflicts.", image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80" },
    ],
  },
  {
    title: { en: "Professional Email & Business Writing", vi: "Viết email & văn bản kinh doanh chuyên nghiệp" },
    category: "writing",
    tags: ["email", "business-writing", "professional", "communication"],
    priceSKT: 30,
    sellerIdx: 4,
    description: {
      en: "Write professional emails, proposals, reports, and business documents with the right tone and structure. From cold outreach to executive summaries, board presentations to client updates.",
      vi: "Viết email, đề xuất, báo cáo, và văn bản kinh doanh chuyên nghiệp với giọng điệu và cấu trúc phù hợp. Từ cold outreach đến tóm tắt điều hành."
    },
    previewText: "Write a {{emailType}} email to {{recipient}} about {{subject}}...",
    coverImage: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=800&q=80",
    models: ["gpt-4", "claude-4", "gemini-2", "llama"],
    prompts: [
      {
        title: "Cold Outreach Email Sequence",
        content: "Create a {{sequenceLength}}-email cold outreach sequence.\n\nProduct/Service: {{product}}\nTarget persona: {{persona}}\nValue prop: {{valueProp}}\nGoal: {{goal}}\n\nFor each email:\n- Subject line (+ A/B variant, under 50 chars)\n- Preview text (40 chars)\n- Body (under 100 words — respect their time)\n- CTA (one clear action)\n- Send timing (days from first touch)\n- Follow-up trigger (reply/no-reply/open)\n\nRules:\n- No \"just following up\" — each email adds new value\n- Personalization tokens: {{firstName}}, {{company}}, {{recentEvent}}\n- Tone: peer-to-peer, not salesy\n- Include 1 social proof element per email\n- Final email: graceful breakup that leaves door open",
        description: "High-converting cold email sequence with A/B variants",
        variables: [
          { name: "sequenceLength", description: "Number of emails", defaultValue: "5" },
          { name: "product", description: "What you're selling", defaultValue: "AI-powered analytics platform for SaaS companies" },
          { name: "persona", description: "Target person", defaultValue: "VP of Growth at B2B SaaS, 50-200 employees" },
          { name: "valueProp", description: "Key value", defaultValue: "reduce churn 30% by predicting at-risk accounts 60 days early" },
          { name: "goal", description: "Desired outcome", defaultValue: "book a 15-min demo call" },
        ],
      },
      {
        title: "Executive Summary / Board Report",
        content: "Write an executive summary for {{reportType}}.\n\nCompany: {{company}}\nPeriod: {{period}}\nKey data: {{data}}\nAudience: {{audience}}\n\nStructure:\n1. **Bottom Line Up Front** (1 sentence — the one thing they must know)\n2. **Key Metrics Dashboard** (5-7 KPIs with trend arrows)\n3. **Wins** (3 bullet points with quantified impact)\n4. **Challenges** (2-3, with mitigation status)\n5. **Strategic Decisions Needed** (1-2, with options and recommendation)\n6. **90-Day Outlook** (where we're headed)\n\nRules:\n- Under 1 page\n- No jargon — a new board member should understand it\n- Every claim backed by a number\n- Bold the most important number in each section",
        description: "Concise executive summary for leadership/board",
        variables: [
          { name: "reportType", description: "Report type", defaultValue: "Q2 2025 quarterly business review" },
          { name: "company", description: "Company name", defaultValue: "TechStart AI" },
          { name: "period", description: "Reporting period", defaultValue: "Q2 2025 (Apr-Jun)" },
          { name: "data", description: "Key data points", defaultValue: "Revenue $2.1M (+35% QoQ), ARR $8.4M, churn 3.2%, 450 customers, NPS 62, burn rate $400K/mo" },
          { name: "audience", description: "Who will read this", defaultValue: "Board of directors and investors" },
        ],
      },
    ],
    examples: [
      { input: "5-email cold outreach for AI analytics platform", output: "Progressive sequence: curiosity hook → case study → mutual connection → direct value → graceful breakup. Each under 100 words.", image: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=800&q=80" },
    ],
  },
  {
    title: { en: "Technical Documentation Generator", vi: "Công cụ tạo tài liệu kỹ thuật" },
    category: "writing",
    tags: ["documentation", "technical-writing", "api-docs", "readme"],
    priceSKT: 40,
    sellerIdx: 0,
    description: {
      en: "Generate clear, developer-friendly technical documentation. API references, README files, architecture docs, onboarding guides, and runbooks. Write docs that developers actually read.",
      vi: "Tạo tài liệu kỹ thuật rõ ràng, thân thiện với developer. API reference, README, tài liệu kiến trúc, hướng dẫn onboarding, và runbooks."
    },
    previewText: "Write technical documentation for {{project}} targeting {{audience}}...",
    coverImage: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&q=80",
    models: ["gpt-4", "claude-4"],
    prompts: [
      {
        title: "API Reference Documentation",
        content: "Generate API documentation for {{apiName}}.\n\nEndpoints: {{endpoints}}\nAuth method: {{auth}}\n\nFor each endpoint:\n- Method + Path + Description\n- Authentication requirements\n- Request headers, query params, body (with types)\n- Response schema (success + error cases)\n- Rate limiting info\n- Code examples in: cURL, JavaScript (fetch), Python (requests)\n- Common errors and troubleshooting\n\nAlso include:\n- Authentication guide (getting API key, OAuth flow)\n- Pagination guide\n- Webhooks documentation\n- SDK quickstart (Node.js)\n- Changelog section template\n\nFormat: Markdown compatible with Mintlify/GitBook.",
        description: "Complete API docs with code examples in 3 languages",
        variables: [
          { name: "apiName", description: "API name", defaultValue: "Skyverses Image Generation API" },
          { name: "endpoints", description: "API endpoints", defaultValue: "POST /generate, GET /jobs/:id, GET /gallery, POST /upscale, DELETE /jobs/:id" },
          { name: "auth", description: "Auth method", defaultValue: "Bearer token (API key)" },
        ],
      },
      {
        title: "Architecture Decision Record (ADR)",
        content: "Write an Architecture Decision Record for {{decision}}.\n\nContext: {{context}}\n\nADR Format:\n## Status\n{{status}}\n\n## Context\nWhat is the issue? Why does a decision need to be made? What forces are at play?\n\n## Decision\nWhat is the change being proposed/adopted?\n\n## Alternatives Considered\n| Option | Pros | Cons | Effort |\n{{alternatives}}\n\n## Consequences\n- What becomes easier?\n- What becomes harder?\n- What new constraints are introduced?\n- Migration path from current state\n\n## Metrics\nHow will we know this was the right decision? (Measurable criteria)\n\n## References\nRelated ADRs, RFCs, or documentation links.",
        description: "Structured ADR with alternatives analysis",
        variables: [
          { name: "decision", description: "Decision being made", defaultValue: "Migrate from REST to GraphQL for the client-facing API" },
          { name: "context", description: "Background context", defaultValue: "Mobile clients making 8-12 REST calls per screen, over-fetching causing 3G performance issues, team has GraphQL experience" },
          { name: "status", description: "ADR status", defaultValue: "Proposed" },
          { name: "alternatives", description: "Options considered", defaultValue: "1. GraphQL (Apollo), 2. REST with BFF pattern, 3. tRPC, 4. Do nothing + optimize existing REST" },
        ],
      },
    ],
    examples: [
      { input: "API docs for image generation service", output: "Complete reference with auth guide, endpoint docs, code samples in cURL/JS/Python, error handling, and webhook docs.", image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80" },
    ],
  },
  {
    title: { en: "Social Media Content Factory", vi: "Nhà máy nội dung mạng xã hội" },
    category: "writing",
    tags: ["social-media", "twitter", "linkedin", "instagram", "threads"],
    priceSKT: 35,
    sellerIdx: 1,
    description: {
      en: "Create engaging social media content at scale. Includes Twitter/X threads, LinkedIn thought leadership, Instagram captions, TikTok scripts, and cross-platform repurposing strategies.",
      vi: "Tạo nội dung mạng xã hội hấp dẫn ở quy mô lớn. Bao gồm Twitter/X threads, LinkedIn thought leadership, Instagram captions, TikTok scripts, và chiến lược tái sử dụng nội dung."
    },
    previewText: "Create a {{platform}} content piece about {{topic}} for {{audience}}...",
    coverImage: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80",
    models: ["gpt-4", "claude-4", "gemini-2"],
    prompts: [
      {
        title: "Viral Thread Generator",
        content: "Create a {{platform}} thread about {{topic}}.\n\nAudience: {{audience}}\nGoal: {{goal}}\nTone: {{tone}}\n\nThread structure ({{length}} posts):\n1. **Hook** — Pattern interrupt. Question, bold claim, or counterintuitive take. Must stop the scroll.\n2-{{innerPosts}}. **Value posts** — Each teaches one thing. Use frameworks: How-to, Myth vs Reality, Before/After, Numbered tips.\n{{length}}. **CTA** — Retweet ask + follow value promise.\n\nRules:\n- Each post stands alone (algorithm shows individual tweets)\n- Use line breaks for readability\n- Include 1-2 relevant emojis per post (not excessive)\n- Add visual placeholders [IMAGE: description] where helpful\n- No hashtag spam (max 2, in last post only)\n- Include engagement hooks (polls, \"reply with your...\")",
        description: "High-engagement thread with scroll-stopping hooks",
        variables: [
          { name: "platform", description: "Social platform", defaultValue: "Twitter/X" },
          { name: "topic", description: "Thread topic", defaultValue: "10 AI tools that replaced $50K/year of SaaS for our startup" },
          { name: "audience", description: "Target audience", defaultValue: "startup founders and indie hackers" },
          { name: "goal", description: "Thread goal", defaultValue: "build authority + drive profile visits" },
          { name: "tone", description: "Voice tone", defaultValue: "experienced founder sharing real results, not guru vibes" },
          { name: "length", description: "Number of posts", defaultValue: "12" },
          { name: "innerPosts", description: "Number of value posts", defaultValue: "10" },
        ],
      },
    ],
    examples: [
      { input: "12-tweet thread about AI tools for startups", output: "Thread with scroll-stopping hook, 10 value posts each featuring an AI tool with specific results, and a CTA with engagement prompt.", image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80" },
    ],
  },

  // ═══════════════ MARKETING (4) ═══════════════
  {
    title: { en: "Landing Page Copy Framework", vi: "Framework viết Landing Page" },
    category: "marketing",
    tags: ["landing-page", "conversion", "copywriting", "saas"],
    priceSKT: 70,
    featured: true,
    sellerIdx: 1,
    description: {
      en: "High-converting landing page copy using proven frameworks (PAS, AIDA, StoryBrand). Includes hero sections, feature blocks, testimonial layouts, pricing tables, and FAQ sections. A/B test variants included.",
      vi: "Copy landing page chuyển đổi cao sử dụng framework đã chứng minh (PAS, AIDA, StoryBrand). Bao gồm hero sections, feature blocks, testimonials, bảng giá, và FAQ."
    },
    previewText: "Write landing page copy for {{product}} targeting {{audience}} using the {{framework}} framework...",
    coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    models: ["gpt-4", "claude-4", "gemini-2"],
    prompts: [
      {
        title: "Full Landing Page Copy",
        content: "Write complete landing page copy for {{product}}.\n\nTarget audience: {{audience}}\nMain pain point: {{pain}}\nKey differentiator: {{differentiator}}\nFramework: {{framework}}\n\nSections to generate:\n\n1. **Hero**\n   - Headline (under 10 words, benefit-driven)\n   - Subheadline (one sentence, specificity)\n   - Primary CTA button text\n   - Social proof line (\"Trusted by X companies\" etc.)\n   - A/B variant headline\n\n2. **Problem Section**\n   - 3 pain points the audience feels daily\n   - Emotional language (frustration, wasted time, missed opportunities)\n\n3. **Solution Section**\n   - How the product solves each pain point\n   - Before/after comparison\n\n4. **Features → Benefits** (4-6 features)\n   - Feature name\n   - One-line benefit (what it means for them)\n   - Supporting detail\n\n5. **Social Proof**\n   - 3 testimonial templates with attribution\n   - Logo bar text\n   - Key metric callouts\n\n6. **Pricing** (if applicable)\n   - 3-tier naming and positioning\n   - Feature comparison\n   - Recommended tier highlight\n\n7. **FAQ** (5 objection-handling questions)\n\n8. **Final CTA**\n   - Urgency/scarcity element\n   - Risk reversal (guarantee)\n   - Button text + supporting text",
        description: "Complete landing page with hero, features, social proof, pricing, FAQ",
        variables: [
          { name: "product", description: "Product name + type", defaultValue: "Skyverses — AI-powered creative platform for designers" },
          { name: "audience", description: "Target audience", defaultValue: "freelance designers and small creative agencies" },
          { name: "pain", description: "Main pain point", defaultValue: "spending 80% of time on repetitive design tasks instead of creative work" },
          { name: "differentiator", description: "Unique selling point", defaultValue: "AI that learns your brand style and generates on-brand assets in seconds" },
          { name: "framework", description: "Copy framework", defaultValue: "PAS (Problem-Agitate-Solution)" },
        ],
      },
    ],
    examples: [
      { input: "Landing page for AI design platform using PAS framework", output: "Complete copy with benefit-driven hero, emotional problem section, 6 feature-benefit blocks, 3 testimonials, 3-tier pricing, 5 FAQ, and urgency CTA.", image: "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800&q=80" },
    ],
  },
  {
    title: { en: "Performance Marketing Ad Copy Bundle", vi: "Bộ copy quảng cáo Performance Marketing" },
    category: "marketing",
    tags: ["ads", "facebook-ads", "google-ads", "performance-marketing", "conversion"],
    priceSKT: 55,
    sellerIdx: 1,
    description: {
      en: "Create high-performing ad copy for Facebook, Google, LinkedIn, and TikTok. Includes multiple variations for A/B testing, audience-specific messaging, and retargeting sequences.",
      vi: "Tạo copy quảng cáo hiệu suất cao cho Facebook, Google, LinkedIn, và TikTok. Bao gồm nhiều biến thể A/B testing, messaging theo audience, và retargeting sequences."
    },
    previewText: "Create {{platform}} ad copy for {{product}} targeting {{audience}}...",
    coverImage: "https://images.unsplash.com/photo-1563986768609-322da13575f2?w=800&q=80",
    models: ["gpt-4", "claude-4"],
    prompts: [
      {
        title: "Facebook/Instagram Ad Set",
        content: "Create a Facebook/Instagram ad set for {{product}}.\n\nTarget audience: {{audience}}\nCampaign objective: {{objective}}\nBudget level: {{budget}}\n\nGenerate {{variants}} ad variants:\n\nFor each variant:\n- Primary text (125 chars for feed, 90 for stories)\n- Headline (40 chars)\n- Description (30 chars)\n- CTA button selection\n- Creative direction [IMAGE/VIDEO description]\n- Hook type (question/stat/testimonial/fear/curiosity)\n\nAlso generate:\n- Retargeting ad (for website visitors)\n- Lookalike ad (for cold audiences)\n- Dynamic creative elements (3 headlines × 3 descriptions × 3 images)\n\nInclude audience targeting suggestions and budget allocation.",
        description: "Complete Facebook/Instagram ad set with retargeting",
        variables: [
          { name: "product", description: "Product/service", defaultValue: "Skyverses Pro subscription — unlimited AI generations" },
          { name: "audience", description: "Target audience", defaultValue: "25-45 year old designers and content creators" },
          { name: "objective", description: "Campaign goal", defaultValue: "conversions (free trial signup)" },
          { name: "budget", description: "Daily budget", defaultValue: "$50-100/day" },
          { name: "variants", description: "Number of variants", defaultValue: "5" },
        ],
      },
      {
        title: "Google Ads Search Campaign",
        content: "Create a Google Ads search campaign for {{product}}.\n\nKeyword themes: {{keywords}}\nTarget location: {{location}}\nMonthly budget: {{budget}}\n\nGenerate:\n1. **Ad Groups** (3-5 themed groups)\n   - Keywords per group (exact, phrase, broad match)\n   - Negative keywords\n\n2. **Responsive Search Ads** per group:\n   - 15 headlines (30 chars each)\n   - 4 descriptions (90 chars each)\n   - Pin positions for best performers\n\n3. **Extensions:**\n   - Sitelink extensions (4)\n   - Callout extensions (4)\n   - Structured snippets\n   - Call extension\n\n4. **Bidding strategy** recommendation\n5. **Landing page** optimization suggestions\n6. **Quality Score** improvement tips",
        description: "Complete Google Ads campaign structure with RSAs",
        variables: [
          { name: "product", description: "Product/service", defaultValue: "AI image generator for e-commerce" },
          { name: "keywords", description: "Keyword themes", defaultValue: "AI product photos, automated image generation, e-commerce photography AI" },
          { name: "location", description: "Target location", defaultValue: "US, UK, Canada, Australia" },
          { name: "budget", description: "Monthly budget", defaultValue: "$3,000" },
        ],
      },
    ],
    examples: [
      { input: "Facebook ads for AI creative tool with $100/day budget", output: "5 ad variants with different hooks, retargeting ad for website visitors, lookalike cold ad, and dynamic creative matrix.", image: "https://images.unsplash.com/photo-1563986768609-322da13575f2?w=800&q=80" },
    ],
  },
  {
    title: { en: "Product Launch Campaign Kit", vi: "Bộ công cụ chiến dịch ra mắt sản phẩm" },
    category: "marketing",
    tags: ["product-launch", "go-to-market", "campaign", "launch-strategy"],
    priceSKT: 95,
    sellerIdx: 4,
    description: {
      en: "Complete product launch campaign playbook. Pre-launch buzz, launch day execution, post-launch nurture. Includes email sequences, social media plan, PR outreach, and influencer strategy.",
      vi: "Playbook chiến dịch ra mắt sản phẩm hoàn chỉnh. Pre-launch buzz, execution ngày ra mắt, post-launch nurture. Bao gồm email sequences, social media plan, PR outreach, và influencer strategy."
    },
    previewText: "Create a product launch campaign for {{product}} with {{timeline}} timeline...",
    coverImage: "https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=800&q=80",
    models: ["gpt-4", "claude-4"],
    prompts: [
      {
        title: "Launch Campaign Blueprint",
        content: "Create a complete product launch campaign for {{product}}.\n\nLaunch date: {{launchDate}}\nBudget: {{budget}}\nTarget market: {{market}}\nGoal: {{goal}}\n\n**Phase 1: Pre-Launch ({{prelaunchWeeks}} weeks before)**\n- Teaser campaign (social, email)\n- Waitlist / early access setup\n- Beta testing program\n- Content seeding (blog posts, guest articles)\n- Influencer outreach list (10 targets with pitch)\n- PR media kit and press release\n\n**Phase 2: Launch Week**\n- Day-by-day execution timeline\n- Launch email sequence (3 emails)\n- Social media storm (platform-specific content)\n- Community engagement plan (Reddit, HN, PH)\n- Live demo / webinar script\n- Launch day monitoring dashboard\n\n**Phase 3: Post-Launch (2 weeks after)**\n- Customer onboarding drip\n- User feedback collection\n- Case study fast-track\n- Retargeting campaigns\n- Analytics review template\n\nInclude templates for each deliverable.",
        description: "End-to-end launch playbook with execution timeline",
        variables: [
          { name: "product", description: "Product to launch", defaultValue: "AI Video Generator 2.0 — text-to-video with 4K output" },
          { name: "launchDate", description: "Target launch date", defaultValue: "June 15, 2025" },
          { name: "budget", description: "Launch budget", defaultValue: "$10,000" },
          { name: "market", description: "Target market", defaultValue: "content creators, marketers, and small video production studios" },
          { name: "goal", description: "Launch goal", defaultValue: "1000 signups in first week, 100 paying customers in first month" },
          { name: "prelaunchWeeks", description: "Pre-launch period", defaultValue: "4" },
        ],
      },
    ],
    examples: [
      { input: "Launch campaign for AI Video Generator with $10K budget", output: "12-week playbook: 4 weeks pre-launch buzz, launch week hour-by-hour timeline, 2 weeks post-launch nurture, with all templates.", image: "https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=800&q=80" },
    ],
  },
  {
    title: { en: "Brand Strategy & Voice Guide", vi: "Chiến lược thương hiệu & Hướng dẫn giọng điệu" },
    category: "marketing",
    tags: ["branding", "brand-voice", "messaging", "identity", "positioning"],
    priceSKT: 50,
    sellerIdx: 1,
    description: {
      en: "Define your brand's personality, voice, messaging hierarchy, and visual language guidelines. Create a living document that keeps all content consistent across channels and team members.",
      vi: "Xác định tính cách thương hiệu, giọng điệu, hệ thống messaging, và hướng dẫn ngôn ngữ hình ảnh. Tạo tài liệu sống giúp nội dung nhất quán trên mọi kênh."
    },
    previewText: "Create a brand voice guide for {{brand}} in the {{industry}} space...",
    coverImage: "https://images.unsplash.com/photo-1553835973-dec43bfddbeb?w=800&q=80",
    models: ["gpt-4", "claude-4", "gemini-2"],
    prompts: [
      {
        title: "Brand Voice & Messaging Framework",
        content: "Create a brand voice and messaging framework for {{brand}}.\n\nIndustry: {{industry}}\nTarget audience: {{audience}}\nCompetitors: {{competitors}}\nBrand values: {{values}}\n\nGenerate:\n\n1. **Brand Personality** (pick 5 traits on a spectrum)\n   - e.g., Formal ←→ Casual, Serious ←→ Playful\n   - \"We are X, but never Y\" statements\n\n2. **Voice Attributes** (4 pillars)\n   - Each with: Definition, Do's, Don'ts, Example sentence\n\n3. **Messaging Hierarchy**\n   - Brand promise (one sentence)\n   - Elevator pitch (30 seconds)\n   - Value propositions (3, ordered)\n   - Key messages per audience segment\n\n4. **Tone Modulation Guide**\n   - How voice changes across: website, email, social, support, crisis\n   - Before/after examples for each context\n\n5. **Vocabulary Guide**\n   - Words we use vs. words we avoid\n   - Product terminology glossary\n   - Competitor terms we don't use\n\n6. **Writing Samples**\n   - Homepage hero\n   - Error message\n   - Success notification\n   - Support response\n   - Tweet\n\nMake this practical enough for a new team member to write on-brand content from day one.",
        description: "Complete brand voice system with tone modulation",
        variables: [
          { name: "brand", description: "Brand name", defaultValue: "Skyverses" },
          { name: "industry", description: "Industry", defaultValue: "AI-powered creative tools" },
          { name: "audience", description: "Target audience", defaultValue: "designers, content creators, and marketing teams" },
          { name: "competitors", description: "Key competitors", defaultValue: "Canva, Midjourney, Runway" },
          { name: "values", description: "Brand values", defaultValue: "creativity empowerment, accessibility, innovation, quality craftsmanship" },
        ],
      },
    ],
    examples: [
      { input: "Brand voice guide for AI creative platform", output: "Complete framework: 5 personality traits, 4 voice pillars with examples, messaging hierarchy, tone modulation for 5 channels, vocabulary guide, and 5 writing samples.", image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80" },
    ],
  },

  // ═══════════════ DESIGN (5) ═══════════════
  {
    title: { en: "Midjourney Prompt Mastery Collection", vi: "Bộ sưu tập prompt Midjourney nâng cao" },
    category: "design",
    tags: ["midjourney", "ai-art", "image-generation", "visual-design", "prompts"],
    priceSKT: 80,
    featured: true,
    sellerIdx: 7,
    description: {
      en: "Master Midjourney with expertly crafted prompts for photorealistic products, brand assets, UI mockups, character design, and architectural visualization. Each prompt includes style parameters and negative prompts.",
      vi: "Làm chủ Midjourney với prompt chuyên nghiệp cho sản phẩm photorealistic, brand assets, UI mockups, character design, và kiến trúc. Mỗi prompt bao gồm style parameters và negative prompts."
    },
    previewText: "Generate a photorealistic {{style}} image of {{subject}} with cinematic lighting...",
    coverImage: "https://images.unsplash.com/photo-1633412802994-5c058f151b66?w=800&q=80",
    models: ["midjourney", "dall-e-3", "stable-diffusion", "flux"],
    prompts: [
      {
        title: "Photorealistic Product Shot",
        content: "Create a photorealistic product shot prompt for Midjourney.\n\nProduct: {{product}}\nStyle: {{style}}\nMood: {{mood}}\n\nPrompt template:\n\"{{product}}, {{style}} photography, {{mood}} lighting, shot on Phase One IQ4 150MP, 80mm lens, f/2.8, editorial magazine quality, {{background}}, ray-traced reflections, volumetric lighting, 8K resolution --ar {{aspectRatio}} --v 6.1 --style raw --s {{stylize}}\"\n\nGenerate 5 variations:\n1. Hero shot (front-facing, dramatic lighting)\n2. Lifestyle shot (in-context, environmental)\n3. Detail macro (texture, material close-up)\n4. Flat lay (top-down arrangement)\n5. Motion shot (action, dynamic angle)\n\nFor each: full prompt, negative prompt, recommended parameters (--ar, --s, --c).",
        description: "5 product photography prompt variants with parameters",
        variables: [
          { name: "product", description: "Product to photograph", defaultValue: "luxury matte black wireless headphones" },
          { name: "style", description: "Photography style", defaultValue: "editorial minimalist" },
          { name: "mood", description: "Mood/atmosphere", defaultValue: "moody, sophisticated, warm amber tones" },
          { name: "background", description: "Background setting", defaultValue: "concrete surface with soft shadow" },
          { name: "aspectRatio", description: "Aspect ratio", defaultValue: "3:4" },
          { name: "stylize", description: "Stylize value", defaultValue: "750" },
        ],
      },
      {
        title: "Brand Visual Identity Generator",
        content: "Create Midjourney prompts for a complete brand visual identity.\n\nBrand: {{brand}}\nIndustry: {{industry}}\nAesthetic: {{aesthetic}}\nColor palette: {{colors}}\n\nGenerate prompts for:\n1. **Logo concept** — abstract mark, geometric, clean\n2. **App icon** — rounded square, gradient, depth\n3. **Hero image** — website banner, atmospheric\n4. **Team/about photo style** — consistent look for portraits\n5. **Social media template** — Instagram post style\n6. **Packaging mockup** — product box/bag design\n7. **Business card** — front and back\n8. **Icon set style** — 4 sample icons matching brand\n\nEach prompt includes:\n- Full Midjourney prompt with parameters\n- Style consistency notes\n- Color guidance\n- What to avoid (negative prompt)\n\nInclude a \"style bible\" paragraph for maintaining consistency.",
        description: "Complete visual identity prompt set for brand consistency",
        variables: [
          { name: "brand", description: "Brand name", defaultValue: "NovaTech" },
          { name: "industry", description: "Industry", defaultValue: "AI-powered health tech" },
          { name: "aesthetic", description: "Visual aesthetic", defaultValue: "clean, futuristic, warm, human-centered" },
          { name: "colors", description: "Color palette", defaultValue: "deep teal #0D7377, warm coral #FF6B6B, cream white #FFF5E4, charcoal #2D3436" },
        ],
      },
      {
        title: "Character Design Sheet",
        content: "Create Midjourney prompts for a character design sheet.\n\nCharacter: {{character}}\nStyle: {{artStyle}}\nPurpose: {{purpose}}\n\nGenerate prompts for:\n1. **Turnaround sheet** — front, 3/4, side, back views on white bg\n2. **Expression sheet** — 6 key emotions (happy, angry, sad, surprised, neutral, determined)\n3. **Costume variations** — 3 outfit changes\n4. **Action poses** — 4 dynamic poses relevant to character\n5. **Scale reference** — character next to common objects\n6. **Color palette** — character-specific swatches\n\nEach prompt:\n- Character description consistency block (copy-paste across all)\n- Style-specific parameters (--niji for anime, --v6 for realistic)\n- Sheet layout instructions\n- Background: clean white/light gray\n\nInclude consistency tips for maintaining same character across all sheets.",
        description: "Full character design sheet with turnaround and expressions",
        variables: [
          { name: "character", description: "Character description", defaultValue: "young female cyborg detective, short silver hair, one glowing blue cybernetic eye, leather trench coat" },
          { name: "artStyle", description: "Art style", defaultValue: "semi-realistic anime (similar to Ghost in the Shell)" },
          { name: "purpose", description: "What this is for", defaultValue: "game character concept for an indie cyberpunk RPG" },
        ],
      },
    ],
    examples: [
      { input: "Product shots for luxury headphones", output: "5 Midjourney prompts: hero, lifestyle, macro, flat lay, motion — each with full parameters, negative prompts, and recommended settings." },
      { input: "Character design sheet for cyborg detective", output: "6-sheet prompt set: turnaround, expressions, costumes, action poses, scale ref, and color palette with consistency guide." },
    ],
  },
  {
    title: { en: "UI/UX Design System Prompts", vi: "Bộ prompt thiết kế UI/UX Design System" },
    category: "design",
    tags: ["ui-design", "ux", "design-system", "figma", "prototyping"],
    priceSKT: 65,
    sellerIdx: 3,
    description: {
      en: "Build complete design systems with AI. Includes component specifications, design tokens, accessibility guidelines, responsive patterns, and user flow documentation.",
      vi: "Xây dựng design system hoàn chỉnh với AI. Bao gồm component specs, design tokens, hướng dẫn accessibility, responsive patterns, và tài liệu user flow."
    },
    previewText: "Create a design system specification for {{product}} with {{style}} aesthetic...",
    coverImage: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",
    models: ["gpt-4", "claude-4", "gemini-2"],
    prompts: [
      {
        title: "Design Token System",
        content: "Create a comprehensive design token system for {{product}}.\n\nBrand color: {{primaryColor}}\nStyle: {{style}}\nPlatforms: {{platforms}}\n\nGenerate:\n\n**Color Tokens**\n- Primary (50-950 scale)\n- Secondary, Accent\n- Semantic: success, warning, error, info\n- Surface: background, card, elevated\n- Text: primary, secondary, disabled, inverse\n- Border: default, strong, subtle\n- Dark mode variants for all\n\n**Typography Tokens**\n- Font families: heading, body, mono\n- Scale: xs through 4xl (size, lineHeight, letterSpacing, weight)\n- Semantic: display, title, body, caption, label, code\n\n**Spacing Tokens**\n- Base unit: {{baseUnit}}\n- Scale: 0.5x through 16x\n- Semantic: padding-tight, padding-default, padding-loose, gap-inline, gap-stack\n\n**Other Tokens**\n- Border radius (none, sm, md, lg, full)\n- Shadows (sm, md, lg, xl + focus ring)\n- Motion (duration, easing curves)\n- Breakpoints\n- Z-index scale\n\nOutput as: JSON, CSS custom properties, and Tailwind config.",
        description: "Complete token system with light/dark mode in multiple formats",
        variables: [
          { name: "product", description: "Product name", defaultValue: "Skyverses Platform" },
          { name: "primaryColor", description: "Brand primary color", defaultValue: "#7036F0 (purple)" },
          { name: "style", description: "Design aesthetic", defaultValue: "modern, clean, slightly warm, professional" },
          { name: "platforms", description: "Target platforms", defaultValue: "web (React), iOS, Android" },
          { name: "baseUnit", description: "Spacing base unit", defaultValue: "4px" },
        ],
      },
      {
        title: "User Flow Documentation",
        content: "Document a complete user flow for {{feature}}.\n\nUser persona: {{persona}}\nEntry point: {{entryPoint}}\n\nFor each step:\n1. **Screen name** and purpose\n2. **User goal** at this step\n3. **Key UI elements** and their states\n4. **User actions** (primary + secondary paths)\n5. **System responses** (loading, success, error states)\n6. **Edge cases** (empty states, errors, offline)\n7. **Accessibility notes**\n8. **Transition** to next screen (animation direction)\n\nAlso include:\n- Happy path flow diagram (ASCII art)\n- Error recovery paths\n- Drop-off risk points with mitigation\n- Analytics events to track\n- Micro-copy for each state",
        description: "Detailed user flow with edge cases and analytics",
        variables: [
          { name: "feature", description: "Feature to document", defaultValue: "first-time user onboarding and first AI image generation" },
          { name: "persona", description: "User persona", defaultValue: "Sarah, 28, freelance designer, first time using AI image tools" },
          { name: "entryPoint", description: "Where user enters flow", defaultValue: "landing page CTA → signup → onboarding" },
        ],
      },
    ],
    examples: [
      { input: "Design tokens for purple-branded platform", output: "Complete token system with 950-scale colors, typography scale, spacing system, shadows, motion — output as JSON + CSS + Tailwind config." },
    ],
  },
  {
    title: { en: "AI Video & Motion Design Prompts", vi: "Bộ prompt Video & Motion Design AI" },
    category: "design",
    tags: ["video", "motion-design", "sora", "runway", "animation"],
    priceSKT: 75,
    sellerIdx: 9,
    description: {
      en: "Create cinematic AI videos and motion graphics with prompts for Sora, Runway Gen-3, Pika, and Kling. Product videos, brand animations, social content, and storytelling sequences.",
      vi: "Tạo video AI điện ảnh và motion graphics với prompt cho Sora, Runway Gen-3, Pika, và Kling. Video sản phẩm, brand animations, nội dung social, và chuỗi storytelling."
    },
    previewText: "Create a {{style}} video prompt for {{subject}} with cinematic camera movement...",
    coverImage: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&q=80",
    models: ["other"],
    prompts: [
      {
        title: "Product Reveal Video",
        content: "Create an AI video prompt for a cinematic product reveal.\n\nProduct: {{product}}\nDuration: {{duration}} seconds\nStyle: {{style}}\nPlatform: {{platform}}\n\nVideo structure:\n1. **Opening** (0-{{beat1}}s) — Mystery/anticipation shot. Product hidden in shadow or blur. Dramatic lighting builds.\n2. **Reveal** ({{beat1}}-{{beat2}}s) — Product emerges. Smooth camera orbit. Material/texture close-ups.\n3. **Features** ({{beat2}}-{{beat3}}s) — Quick cuts showcasing key details. Macro shots. Light catching surfaces.\n4. **Hero Shot** ({{beat3}}-{{duration}}s) — Final beauty shot. Product in context. Logo/tagline fade in.\n\nFor each segment generate:\n- Full text-to-video prompt (detailed scene description)\n- Camera movement (orbit, dolly, crane, track)\n- Lighting description (direction, color temperature, quality)\n- Speed/mood (slow-mo, real-time, time-lapse)\n- Transition type to next segment\n\nInclude 3 style variants: minimal, luxury, energetic.",
        description: "Cinematic product reveal with 4-beat structure",
        variables: [
          { name: "product", description: "Product to showcase", defaultValue: "sleek wireless earbuds in matte black case" },
          { name: "duration", description: "Total duration", defaultValue: "15" },
          { name: "style", description: "Visual style", defaultValue: "Apple-style minimal, dark background, precise lighting" },
          { name: "platform", description: "AI video tool", defaultValue: "Runway Gen-3 Alpha" },
          { name: "beat1", description: "End of opening", defaultValue: "4" },
          { name: "beat2", description: "End of reveal", defaultValue: "8" },
          { name: "beat3", description: "End of features", defaultValue: "12" },
        ],
      },
      {
        title: "Social Media Video Templates",
        content: "Create AI video prompts for social media content.\n\nBrand: {{brand}}\nPlatform: {{socialPlatform}}\nContent type: {{contentType}}\n\nGenerate {{count}} video prompts:\n\nFor each:\n- Full prompt text (scene, motion, lighting, camera)\n- Aspect ratio and duration\n- Text overlay placement suggestions\n- Music/sound design direction\n- Hook (first 1-2 seconds to stop scrolling)\n- Recommended AI tool (Runway/Pika/Kling/Sora)\n\nFormats:\n- Stories/Reels (9:16, 5-15s)\n- Feed post (1:1 or 4:5, 10-30s)\n- Header/banner (16:9, loop, 3-5s)\n\nInclude a batch production workflow for creating a week of content.",
        description: "Social media video templates with production workflow",
        variables: [
          { name: "brand", description: "Brand name", defaultValue: "Skyverses" },
          { name: "socialPlatform", description: "Social platform", defaultValue: "Instagram + TikTok" },
          { name: "contentType", description: "Content types", defaultValue: "product showcase, behind-the-scenes AI, tutorial teaser, testimonial visual" },
          { name: "count", description: "Number of prompts", defaultValue: "8" },
        ],
      },
    ],
    examples: [
      { input: "Product reveal for wireless earbuds, Apple style", output: "4-beat cinematic sequence with mystery opener, smooth reveal orbit, macro feature cuts, and hero beauty shot. 3 style variants included." },
    ],
  },
  {
    title: { en: "Architecture & Interior Visualization Prompts", vi: "Bộ prompt Kiến trúc & Nội thất AI" },
    category: "design",
    tags: ["architecture", "interior-design", "3d-rendering", "visualization"],
    priceSKT: 70,
    sellerIdx: 7,
    description: {
      en: "Generate photorealistic architectural and interior design visualizations. Includes exterior renders, interior spaces, landscape design, and renovation before/after transformations.",
      vi: "Tạo hình ảnh kiến trúc và nội thất photorealistic. Bao gồm render ngoại thất, không gian nội thất, thiết kế cảnh quan, và biến đổi trước/sau cải tạo."
    },
    previewText: "Generate a photorealistic rendering of {{spaceType}} with {{style}} design...",
    coverImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    models: ["midjourney", "dall-e-3", "stable-diffusion", "flux"],
    prompts: [
      {
        title: "Exterior Architecture Rendering",
        content: "Create a photorealistic exterior architecture rendering prompt.\n\nBuilding type: {{buildingType}}\nArchitectural style: {{style}}\nLocation/climate: {{location}}\nTime of day: {{timeOfDay}}\n\nPrompt structure:\n\"{{buildingType}}, {{style}} architecture, located in {{location}}, {{timeOfDay}} natural lighting, shot from {{angle}}, professional architectural photography, Dezeen magazine quality, {{materials}}, {{landscaping}}, {{atmosphere}}, ultra-detailed 8K rendering, V-Ray quality, --ar 16:9 --v 6.1 --style raw --s 500\"\n\nGenerate 4 viewpoints:\n1. **Street level** — human perspective, eye-level\n2. **Aerial/drone** — 45° angle, showing context\n3. **Detail shot** — facade material, texture, joinery\n4. **Twilight magic hour** — warm interior glow, blue sky\n\nEach with full prompt and recommended parameters.",
        description: "4-viewpoint architectural rendering prompt set",
        variables: [
          { name: "buildingType", description: "Type of building", defaultValue: "modern minimalist family residence, 3 stories" },
          { name: "style", description: "Architectural style", defaultValue: "Japanese-Scandinavian fusion, clean lines, natural materials" },
          { name: "location", description: "Location and climate", defaultValue: "coastal hillside in Southern California" },
          { name: "timeOfDay", description: "Time of day", defaultValue: "golden hour, late afternoon" },
          { name: "materials", description: "Materials", defaultValue: "exposed concrete, warm cedar wood cladding, floor-to-ceiling glass" },
          { name: "landscaping", description: "Landscaping", defaultValue: "native drought-resistant garden, olive trees, gravel pathways" },
          { name: "angle", description: "Camera angle", defaultValue: "3/4 front view showing entrance and garden" },
          { name: "atmosphere", description: "Atmosphere details", defaultValue: "warm golden light, long shadows, calm Pacific ocean in background" },
        ],
      },
      {
        title: "Interior Space Design",
        content: "Create interior design visualization prompts for {{roomType}}.\n\nStyle: {{style}}\nColor palette: {{colors}}\nBudget feel: {{budget}}\n\nGenerate prompts for:\n1. **Overview shot** — full room from corner, wide angle\n2. **Vignette** — styled corner/nook detail\n3. **Material board** — textures, fabrics, finishes close-up\n4. **Before/After** — same angle, transformation comparison\n\nEach prompt includes:\n- Furniture and decor placement\n- Lighting design (natural + artificial)\n- Material specifications\n- Art/accessories styling\n- Camera angle and lens suggestion\n- Mood and atmosphere\n\nAlso include:\n- Shopping list of key furniture pieces (generic descriptions)\n- Color code specifications\n- Lighting plan (fixture types and placement)",
        description: "Interior visualization with shopping list and lighting plan",
        variables: [
          { name: "roomType", description: "Room type", defaultValue: "open-plan living room + kitchen, 45 sqm" },
          { name: "style", description: "Interior style", defaultValue: "warm modern japandi with organic textures" },
          { name: "colors", description: "Color palette", defaultValue: "warm white, oatmeal, charcoal, sage green, walnut wood" },
          { name: "budget", description: "Budget feeling", defaultValue: "mid-to-high end, quality over quantity" },
        ],
      },
    ],
    examples: [
      { input: "Modern coastal residence exterior renders", output: "4 viewpoints: street level, aerial, material detail, and twilight magic hour. Japanese-Scandinavian style with concrete and cedar." },
    ],
  },
  {
    title: { en: "Logo & Brand Identity AI Design", vi: "Thiết kế Logo & Nhận diện thương hiệu AI" },
    category: "design",
    tags: ["logo", "branding", "identity", "graphic-design", "visual-identity"],
    priceSKT: 55,
    sellerIdx: 7,
    description: {
      en: "Design professional logos and brand identities using AI tools. Includes logo concepts, color systems, typography pairings, business card designs, and brand guidelines document.",
      vi: "Thiết kế logo và nhận diện thương hiệu chuyên nghiệp bằng công cụ AI. Bao gồm concept logo, hệ thống màu sắc, typography pairings, thiết kế name card, và tài liệu brand guidelines."
    },
    previewText: "Design a {{style}} logo for {{brandName}} in the {{industry}} industry...",
    coverImage: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&q=80",
    models: ["midjourney", "dall-e-3", "flux"],
    prompts: [
      {
        title: "Logo Concept Exploration",
        content: "Generate logo design prompts for {{brandName}}.\n\nIndustry: {{industry}}\nBrand personality: {{personality}}\nStyle preference: {{style}}\nMust avoid: {{avoid}}\n\nGenerate 6 logo concept directions:\n\n1. **Wordmark** — typography-focused, custom lettering\n2. **Lettermark** — initials, monogram\n3. **Abstract mark** — geometric, symbolic\n4. **Pictorial mark** — recognizable icon/symbol\n5. **Combination mark** — icon + wordmark\n6. **Emblem** — badge/seal style\n\nFor each concept:\n- Midjourney prompt (clean white background, vector style)\n- Design rationale (why this works for the brand)\n- Color application (primary + monochrome)\n- Scalability notes (works at 16px favicon?)\n- Where it works best (digital, print, merch)\n\nInclude typography pairing suggestion for each.",
        description: "6 logo directions with rationale and typography pairings",
        variables: [
          { name: "brandName", description: "Brand name", defaultValue: "Luminary" },
          { name: "industry", description: "Industry", defaultValue: "premium wellness & meditation app" },
          { name: "personality", description: "Brand personality", defaultValue: "calm, premium, warm, trustworthy, modern" },
          { name: "style", description: "Design style", defaultValue: "minimal, clean lines, subtle warmth" },
          { name: "avoid", description: "What to avoid", defaultValue: "generic lotus flowers, overused meditation symbols, cold/clinical feel" },
        ],
      },
    ],
    examples: [
      { input: "Logo concepts for wellness app 'Luminary'", output: "6 distinct logo directions: wordmark, lettermark, abstract, pictorial, combination, emblem — each with AI prompt, rationale, color application, and font pairing." },
    ],
  },

  // ═══════════════ BUSINESS (4) ═══════════════
  {
    title: { en: "Startup Business Plan Generator", vi: "Công cụ tạo Business Plan cho Startup" },
    category: "business",
    tags: ["startup", "business-plan", "fundraising", "strategy", "pitch"],
    priceSKT: 100,
    featured: true,
    sellerIdx: 4,
    description: {
      en: "Generate comprehensive business plans for startups and new ventures. Includes market analysis, financial projections, competitive landscape, go-to-market strategy, and investor pitch deck outline.",
      vi: "Tạo business plan toàn diện cho startup và dự án mới. Bao gồm phân tích thị trường, dự báo tài chính, bối cảnh cạnh tranh, chiến lược go-to-market, và outline pitch deck cho nhà đầu tư."
    },
    previewText: "Create a business plan for {{startup}} in the {{market}} market with {{funding}} target...",
    coverImage: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=80",
    models: ["gpt-4", "claude-4"],
    prompts: [
      {
        title: "Full Business Plan",
        content: "Create a comprehensive business plan for {{startup}}.\n\nProduct/Service: {{product}}\nTarget market: {{market}}\nBusiness model: {{model}}\nFunding goal: {{funding}}\nTeam size: {{teamSize}}\n\nSections:\n\n1. **Executive Summary** (1 page)\n   - Problem, solution, market size, traction, ask\n\n2. **Problem & Solution**\n   - Pain points (with data/quotes)\n   - Current alternatives and their gaps\n   - Your solution and unique approach\n   - Moat / defensibility\n\n3. **Market Analysis**\n   - TAM / SAM / SOM with calculations\n   - Market trends driving opportunity\n   - Customer segments (3 with personas)\n   - Buyer journey map\n\n4. **Competitive Landscape**\n   - 2x2 positioning matrix\n   - Feature comparison table\n   - Sustainable competitive advantages\n\n5. **Business Model & Unit Economics**\n   - Revenue streams\n   - Pricing strategy with justification\n   - CAC, LTV, payback period\n   - Margin analysis\n\n6. **Go-to-Market Strategy**\n   - Launch sequence (0-6, 6-12, 12-24 months)\n   - Channel strategy\n   - Partnership opportunities\n\n7. **Financial Projections** (3-year)\n   - Revenue forecast (monthly Y1, quarterly Y2-3)\n   - Cost structure\n   - Break-even analysis\n   - Key assumptions\n\n8. **Team & Hiring Plan**\n   - Current team strengths\n   - Key hires needed (with timeline)\n\n9. **Funding Ask**\n   - Amount and use of funds\n   - Milestones the funding enables\n   - Expected runway\n\nMake projections realistic, not hockey-stick fantasies.",
        description: "9-section business plan with financials and unit economics",
        variables: [
          { name: "startup", description: "Startup name", defaultValue: "Skyverses" },
          { name: "product", description: "Product/service", defaultValue: "AI-powered creative platform with image, video, and 3D generation" },
          { name: "market", description: "Target market", defaultValue: "creative professionals and small businesses" },
          { name: "model", description: "Business model", defaultValue: "freemium SaaS with credit-based usage + enterprise licensing" },
          { name: "funding", description: "Funding goal", defaultValue: "$2M seed round" },
          { name: "teamSize", description: "Current team", defaultValue: "5 people (2 engineers, 1 designer, 1 marketing, 1 founder/CEO)" },
        ],
      },
      {
        title: "Investor Pitch Deck Outline",
        content: "Create a pitch deck outline for {{startup}} raising {{amount}}.\n\nStage: {{stage}}\nTraction: {{traction}}\n\nSlide-by-slide:\n1. **Cover** — Name, tagline, logo\n2. **Problem** — Pain point, who suffers, how much it costs\n3. **Solution** — Demo/screenshot, aha moment\n4. **Market Size** — TAM→SAM→SOM funnel\n5. **Product** — Key features, screenshots, architecture\n6. **Traction** — Growth chart, key metrics, logos\n7. **Business Model** — How you make money, unit economics\n8. **Competition** — 2x2 matrix, why you win\n9. **Go-to-Market** — Channels, partnerships, flywheel\n10. **Team** — Photos, relevant experience, advisors\n11. **Financials** — 3-year projections, key assumptions\n12. **Ask** — Amount, use of funds, milestones\n13. **Appendix** — Detailed financials, technical architecture\n\nFor each slide:\n- Key message (one sentence)\n- Visual suggestion\n- Speaker notes (what to say, 30 seconds)\n- Data/proof points to include\n- Common investor questions to prepare for",
        description: "13-slide pitch deck with speaker notes and Q&A prep",
        variables: [
          { name: "startup", description: "Startup name", defaultValue: "Skyverses" },
          { name: "amount", description: "Raise amount", defaultValue: "$2M" },
          { name: "stage", description: "Company stage", defaultValue: "pre-seed / seed" },
          { name: "traction", description: "Current traction", defaultValue: "10K users, 500 paying, $15K MRR, 40% MoM growth" },
        ],
      },
    ],
    examples: [
      { input: "Business plan for AI creative platform raising $2M seed", output: "9-section plan with realistic TAM/SAM/SOM, unit economics (CAC/LTV), 3-year financial model, and hire plan." },
    ],
  },
  {
    title: { en: "OKR & Strategic Planning Framework", vi: "Framework OKR & Lập kế hoạch chiến lược" },
    category: "business",
    tags: ["okr", "strategy", "planning", "management", "kpi"],
    priceSKT: 45,
    sellerIdx: 4,
    description: {
      en: "Set effective OKRs, build strategic plans, and track execution. Includes company-level to individual OKRs, quarterly review templates, and strategy-to-execution alignment frameworks.",
      vi: "Thiết lập OKR hiệu quả, xây dựng kế hoạch chiến lược, và theo dõi thực thi. Bao gồm OKR từ cấp công ty đến cá nhân, template review quý, và framework liên kết chiến lược-thực thi."
    },
    previewText: "Create OKRs for {{team}} aligned to the company goal of {{companyGoal}}...",
    coverImage: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
    models: ["gpt-4", "claude-4", "gemini-2"],
    prompts: [
      {
        title: "Quarterly OKR Planning",
        content: "Create quarterly OKRs for {{team}} at {{company}}.\n\nCompany mission: {{mission}}\nCompany-level objective this quarter: {{companyGoal}}\nTeam size: {{teamSize}}\nCurrent challenges: {{challenges}}\n\nGenerate:\n\n**Team OKRs** (3-4 objectives, 3-5 key results each)\n- Each objective: ambitious but achievable, qualitative\n- Each key result: specific, measurable, time-bound\n- Confidence level (1-10) for each KR\n- Leading vs lagging indicators\n- Owner for each KR\n\n**Alignment Map**\n- How each team OKR connects to company OKR\n- Dependencies on other teams\n- Risks to flag\n\n**Individual OKRs** (template for team members)\n- 2-3 objectives derived from team OKRs\n- Personal development objective\n\n**Tracking Cadence**\n- Weekly check-in template\n- Monthly review template\n- Quarter-end scoring guide (0.0-1.0)\n\n**Anti-patterns to Avoid**\n- Common mistakes for this type of team",
        description: "Full OKR cascade with tracking and review templates",
        variables: [
          { name: "team", description: "Team name", defaultValue: "Product Engineering" },
          { name: "company", description: "Company name", defaultValue: "Skyverses" },
          { name: "mission", description: "Company mission", defaultValue: "Democratize AI-powered creative tools for everyone" },
          { name: "companyGoal", description: "Company Q3 objective", defaultValue: "Achieve product-market fit with 1000 paying users and <5% monthly churn" },
          { name: "teamSize", description: "Team size", defaultValue: "8 engineers + 2 designers" },
          { name: "challenges", description: "Current challenges", defaultValue: "technical debt slowing feature velocity, onboarding drop-off at 60%, mobile experience is weak" },
        ],
      },
    ],
    examples: [
      { input: "Q3 OKRs for engineering team of 10", output: "4 team objectives with measurable KRs, individual OKR templates, weekly/monthly review cadence, and anti-pattern warnings." },
    ],
  },
  {
    title: { en: "Customer Research & Interview Toolkit", vi: "Bộ công cụ nghiên cứu & phỏng vấn khách hàng" },
    category: "business",
    tags: ["customer-research", "user-interviews", "product-management", "insights"],
    priceSKT: 40,
    sellerIdx: 3,
    description: {
      en: "Run effective customer research with AI-assisted interview scripts, survey design, insight synthesis, and persona creation. Based on Jobs-to-be-Done and design thinking frameworks.",
      vi: "Thực hiện nghiên cứu khách hàng hiệu quả với script phỏng vấn hỗ trợ AI, thiết kế khảo sát, tổng hợp insight, và tạo persona. Dựa trên framework Jobs-to-be-Done và Design Thinking."
    },
    previewText: "Create a customer interview script for {{product}} focusing on {{researchGoal}}...",
    coverImage: "https://images.unsplash.com/photo-1553028826-f4804a6dba3b?w=800&q=80",
    models: ["gpt-4", "claude-4"],
    prompts: [
      {
        title: "Customer Interview Script (JTBD)",
        content: "Create a Jobs-to-be-Done interview script for {{product}}.\n\nResearch goal: {{researchGoal}}\nTarget interviewee: {{interviewee}}\nDuration: {{duration}} minutes\n\nScript sections:\n\n1. **Warm-up** (3 min)\n   - Rapport building\n   - Context setting\n   - Permission to record\n\n2. **Current Situation** (10 min)\n   - \"Walk me through the last time you...\"\n   - Timeline reconstruction\n   - Emotional markers\n\n3. **First Thought** (8 min)\n   - What triggered the search for a solution?\n   - What was the \"push\" from old way?\n   - What was the \"pull\" toward new way?\n\n4. **Evaluation** (8 min)\n   - What alternatives did you consider?\n   - What almost stopped you from switching?\n   - Anxieties and habits (forces against change)\n\n5. **Outcome** (5 min)\n   - What does success look like?\n   - Desired progress in their life/work\n   - Unmet needs\n\n6. **Wrap-up** (3 min)\n   - \"If you had a magic wand...\"\n   - Referral ask\n\nFor each section:\n- Primary questions\n- Follow-up probes (\"Tell me more about...\")\n- Things to listen for (signals)\n- Red flags (leading questions to avoid)\n\nAlso include:\n- Pre-interview prep checklist\n- Post-interview synthesis template\n- Pattern-finding framework for 5+ interviews",
        description: "JTBD interview with follow-up probes and synthesis template",
        variables: [
          { name: "product", description: "Product being researched", defaultValue: "AI image generation platform" },
          { name: "researchGoal", description: "What you want to learn", defaultValue: "why designers switch from manual design to AI tools, and what makes them stay or churn" },
          { name: "interviewee", description: "Who you're interviewing", defaultValue: "freelance graphic designers who adopted AI tools in the last 6 months" },
          { name: "duration", description: "Interview length", defaultValue: "40" },
        ],
      },
    ],
    examples: [
      { input: "JTBD interview for AI design tool adoption", output: "40-minute script with 6 sections, follow-up probes for each question, listening signals, and post-interview synthesis template." },
    ],
  },
  {
    title: { en: "Financial Modeling & Analysis Prompts", vi: "Bộ prompt Mô hình tài chính & Phân tích" },
    category: "business",
    tags: ["finance", "modeling", "analysis", "forecasting", "saas-metrics"],
    priceSKT: 85,
    sellerIdx: 6,
    description: {
      en: "Build financial models, analyze SaaS metrics, create revenue forecasts, and evaluate investment opportunities. Includes unit economics, cohort analysis, and scenario planning templates.",
      vi: "Xây dựng mô hình tài chính, phân tích SaaS metrics, tạo dự báo doanh thu, và đánh giá cơ hội đầu tư. Bao gồm unit economics, phân tích cohort, và template scenario planning."
    },
    previewText: "Build a financial model for {{businessType}} with {{revenue}} annual revenue...",
    coverImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
    models: ["gpt-4", "claude-4"],
    prompts: [
      {
        title: "SaaS Financial Model",
        content: "Build a SaaS financial model for {{company}}.\n\nCurrent state:\n- MRR: {{mrr}}\n- Customers: {{customers}}\n- Growth rate: {{growth}}\n- Avg deal size: {{dealSize}}\n\nModel requirements:\n\n1. **Revenue Model**\n   - New MRR (by channel: organic, paid, sales)\n   - Expansion MRR (upsells, seat expansion)\n   - Churned MRR (by cohort vintage)\n   - Net MRR and ARR projections (24 months)\n\n2. **Unit Economics**\n   - CAC by channel\n   - LTV (by plan tier)\n   - LTV:CAC ratio\n   - Payback period\n   - Magic number\n\n3. **Cohort Analysis Framework**\n   - Monthly retention curves\n   - Revenue retention (net dollar retention)\n   - Cohort LTV comparison\n\n4. **Cost Structure**\n   - COGS (hosting, API costs, support)\n   - Gross margin analysis\n   - OpEx by department\n   - Headcount plan tied to revenue milestones\n\n5. **Scenario Analysis**\n   - Base case, optimistic (+30%), pessimistic (-30%)\n   - Sensitivity analysis (churn rate, growth rate, ARPU)\n   - Runway calculation per scenario\n\n6. **Key Metrics Dashboard**\n   - Monthly reporting template\n   - Board-ready metrics summary\n\nOutput as structured tables and formulas (Google Sheets compatible).",
        description: "Complete SaaS financial model with cohort analysis",
        variables: [
          { name: "company", description: "Company name", defaultValue: "Skyverses" },
          { name: "mrr", description: "Current MRR", defaultValue: "$15,000" },
          { name: "customers", description: "Paying customers", defaultValue: "500" },
          { name: "growth", description: "Monthly growth rate", defaultValue: "15% MoM" },
          { name: "dealSize", description: "Average deal size", defaultValue: "$30/month" },
        ],
      },
    ],
    examples: [
      { input: "SaaS model for $15K MRR, 500 customers, 15% growth", output: "24-month financial model with revenue projections, unit economics, cohort analysis, 3 scenarios, and board-ready dashboard." },
    ],
  },

  // ═══════════════ EDUCATION (4) ═══════════════
  {
    title: { en: "Course Curriculum Designer", vi: "Công cụ thiết kế chương trình khóa học" },
    category: "education",
    tags: ["course-design", "curriculum", "e-learning", "teaching", "instructional-design"],
    priceSKT: 50,
    featured: true,
    sellerIdx: 8,
    description: {
      en: "Design engaging online courses with AI. Create learning objectives, module structures, assessments, practical projects, and completion certificates. Based on Bloom's Taxonomy and active learning principles.",
      vi: "Thiết kế khóa học online hấp dẫn với AI. Tạo mục tiêu học tập, cấu trúc module, đánh giá, dự án thực hành, và chứng chỉ hoàn thành. Dựa trên Bloom's Taxonomy và nguyên tắc active learning."
    },
    previewText: "Design a {{duration}} course on {{topic}} for {{audience}}...",
    coverImage: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&q=80",
    models: ["gpt-4", "claude-4", "gemini-2"],
    prompts: [
      {
        title: "Full Course Curriculum",
        content: "Design a complete course curriculum for {{topic}}.\n\nTarget students: {{audience}}\nSkill level: {{level}}\nDuration: {{duration}}\nFormat: {{format}}\n\nGenerate:\n\n**Course Overview**\n- Title, subtitle, description (marketing-ready)\n- 5 learning outcomes (Bloom's Taxonomy verbs)\n- Prerequisites\n- Who this is for / who this is NOT for\n\n**Module Breakdown** ({{modules}} modules)\nFor each module:\n- Title and learning objective\n- Topics covered (3-5)\n- Lesson type: lecture, demo, hands-on, discussion\n- Time allocation\n- Key concept to remember (one sentence)\n- Practice exercise\n- Quick quiz (3 questions)\n\n**Capstone Project**\n- Description and requirements\n- Rubric (4 criteria, 4 levels each)\n- Example project\n- Peer review guide\n\n**Supplementary Materials**\n- Recommended reading list (5 resources)\n- Tool/software requirements\n- Community discussion prompts (per module)\n- Certificate criteria\n\nDesign for engagement: variety of formats, real-world relevance, progressive complexity.",
        description: "Full curriculum with modules, assessments, and capstone project",
        variables: [
          { name: "topic", description: "Course topic", defaultValue: "Building AI Applications with Python — From Zero to Production" },
          { name: "audience", description: "Target students", defaultValue: "software developers with Python basics who want to build AI-powered products" },
          { name: "level", description: "Difficulty level", defaultValue: "intermediate" },
          { name: "duration", description: "Course duration", defaultValue: "8 weeks (4 hours/week)" },
          { name: "format", description: "Delivery format", defaultValue: "self-paced online with weekly live Q&A" },
          { name: "modules", description: "Number of modules", defaultValue: "8" },
        ],
      },
    ],
    examples: [
      { input: "8-week AI applications course for developers", output: "8-module curriculum with progressive exercises, hands-on labs, capstone project with rubric, and supplementary resources." },
    ],
  },
  {
    title: { en: "Interactive Learning Activity Generator", vi: "Công cụ tạo hoạt động học tập tương tác" },
    category: "education",
    tags: ["interactive-learning", "gamification", "exercises", "quizzes", "assessment"],
    priceSKT: 35,
    sellerIdx: 8,
    description: {
      en: "Create engaging, interactive learning activities. Quizzes, case studies, simulations, role-play scenarios, and gamified challenges. Perfect for instructors, L&D professionals, and course creators.",
      vi: "Tạo hoạt động học tập tương tác, hấp dẫn. Quiz, case study, mô phỏng, kịch bản đóng vai, và thử thách gamified. Hoàn hảo cho giảng viên, L&D, và nhà tạo khóa học."
    },
    previewText: "Create {{activityType}} learning activities for {{subject}} targeting {{level}} students...",
    coverImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
    models: ["gpt-4", "claude-4"],
    prompts: [
      {
        title: "Case Study with Discussion Guide",
        content: "Create a teaching case study for {{subject}}.\n\nLearning objective: {{objective}}\nStudent level: {{level}}\nDuration: {{duration}} minutes\n\nCase study structure:\n\n1. **Scenario** (500-800 words)\n   - Real-world situation (fictionalized)\n   - Key characters with roles and motivations\n   - Data/evidence to analyze\n   - A dilemma with no obvious right answer\n\n2. **Background Information**\n   - Industry context\n   - Relevant data (tables, charts description)\n   - Timeline of events\n\n3. **Discussion Questions** (5-7)\n   - Progressive difficulty (recall → analysis → evaluation → creation)\n   - For each: expected student responses, follow-up probes\n   - One question that deliberately challenges assumptions\n\n4. **Instructor Guide**\n   - Key teaching points\n   - Common student misconceptions\n   - How to facilitate productive disagreement\n   - Debrief framework\n   - Connection to theory/framework\n\n5. **Extension Activities**\n   - Individual reflection prompt\n   - Group project based on case\n   - Real-world research assignment",
        description: "Teaching case study with instructor guide and discussion",
        variables: [
          { name: "subject", description: "Subject area", defaultValue: "AI Ethics & Responsible Technology" },
          { name: "objective", description: "Learning objective", defaultValue: "evaluate ethical trade-offs in AI deployment and propose responsible solutions" },
          { name: "level", description: "Student level", defaultValue: "university undergraduate (3rd-4th year) or bootcamp" },
          { name: "duration", description: "Activity duration", defaultValue: "60" },
        ],
      },
      {
        title: "Gamified Challenge Series",
        content: "Create a gamified learning challenge series for {{subject}}.\n\nLearner level: {{level}}\nTotal challenges: {{count}}\nPlatform: {{platform}}\n\nFor each challenge:\n1. **Challenge name** (creative, memorable)\n2. **Difficulty** (bronze/silver/gold/diamond)\n3. **Setup** — Context and scenario\n4. **Task** — What the learner must do\n5. **Constraints** — Rules that make it harder/interesting\n6. **Hints** (3 levels: nudge → guidance → solution path)\n7. **Success criteria** — How to evaluate completion\n8. **XP/Points** — Reward value\n9. **Bonus objective** — Optional extra credit challenge\n10. **Learning connection** — What concept this reinforces\n\nAlso include:\n- Leaderboard design\n- Badge/achievement system (5 badges)\n- Progress path visualization\n- Difficulty curve graph",
        description: "Gamified challenges with XP system and badges",
        variables: [
          { name: "subject", description: "Subject", defaultValue: "JavaScript & Web Development" },
          { name: "level", description: "Learner level", defaultValue: "beginner to intermediate" },
          { name: "count", description: "Number of challenges", defaultValue: "10" },
          { name: "platform", description: "Delivery platform", defaultValue: "web-based interactive (CodePen style)" },
        ],
      },
    ],
    examples: [
      { input: "AI ethics case study for university students", output: "800-word realistic scenario with ethical dilemma, data to analyze, 7 discussion questions, instructor guide, and extension activities." },
    ],
  },
  {
    title: { en: "Language Learning Prompt Pack", vi: "Bộ prompt học ngôn ngữ" },
    category: "education",
    tags: ["language-learning", "esl", "vocabulary", "grammar", "conversation"],
    priceSKT: 30,
    isFree: false,
    sellerIdx: 8,
    description: {
      en: "Learn any language with AI-powered conversation practice, vocabulary building, grammar exercises, and cultural immersion. Supports beginner to advanced levels with personalized difficulty adjustment.",
      vi: "Học bất kỳ ngôn ngữ nào với luyện hội thoại AI, xây dựng từ vựng, bài tập ngữ pháp, và immersion văn hóa. Hỗ trợ từ beginner đến advanced với điều chỉnh độ khó cá nhân."
    },
    previewText: "Practice {{targetLanguage}} conversation at {{level}} level about {{topic}}...",
    coverImage: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&q=80",
    models: ["gpt-4", "claude-4", "gemini-2"],
    prompts: [
      {
        title: "Immersive Conversation Practice",
        content: "You are a {{targetLanguage}} conversation partner.\n\nMy level: {{level}}\nTopic: {{topic}}\nMy native language: {{nativeLanguage}}\n\nRules:\n1. Speak ONLY in {{targetLanguage}}\n2. Adjust vocabulary to my level\n3. If I make a mistake, gently correct it with the right form + brief explanation in {{nativeLanguage}}\n4. After every 3 exchanges, teach me one:\n   - New vocabulary word (with example sentence)\n   - Cultural note relevant to our conversation\n   - Common expression/idiom\n5. Use varied question types (open, yes/no, would-you-rather)\n6. Introduce progressive difficulty — start simple, gradually use more complex grammar\n7. If I'm stuck, offer 2-3 response options to choose from\n8. End each session with:\n   - 5 new words learned (with pronunciation guide)\n   - Grammar points practiced\n   - Homework: one thing to practice before next session\n\nStart the conversation naturally, as if we just met at a café.",
        description: "Adaptive conversation practice with corrections and vocabulary",
        variables: [
          { name: "targetLanguage", description: "Language to practice", defaultValue: "Japanese" },
          { name: "level", description: "Current level", defaultValue: "intermediate (JLPT N3)" },
          { name: "topic", description: "Conversation topic", defaultValue: "discussing weekend plans and hobbies" },
          { name: "nativeLanguage", description: "Your native language", defaultValue: "English" },
        ],
      },
      {
        title: "Vocabulary Builder with Spaced Repetition",
        content: "Create a vocabulary learning set for {{targetLanguage}}.\n\nTheme: {{theme}}\nLevel: {{level}}\nWords: {{count}}\n\nFor each word generate:\n1. Word in target language (+ romanization if applicable)\n2. Part of speech\n3. Definition in {{nativeLanguage}}\n4. Example sentence (level-appropriate)\n5. Mnemonic device (memory trick)\n6. Common collocations (2-3 word pairs)\n7. Register note (formal/casual/written/spoken)\n8. Confusable word (common mix-up)\n\nOrganize into 3 difficulty tiers:\n- Tier 1: Essential (learn first)\n- Tier 2: Important (learn next)\n- Tier 3: Advanced (stretch goal)\n\nInclude:\n- Spaced repetition schedule (day 1, 3, 7, 14, 30)\n- Quick quiz (10 questions mixing formats)\n- Sentence construction exercise using 5+ words from the list",
        description: "Structured vocab set with mnemonics and spaced repetition",
        variables: [
          { name: "targetLanguage", description: "Target language", defaultValue: "Korean" },
          { name: "theme", description: "Vocabulary theme", defaultValue: "technology and workplace" },
          { name: "level", description: "Difficulty level", defaultValue: "intermediate" },
          { name: "count", description: "Number of words", defaultValue: "30" },
          { name: "nativeLanguage", description: "Explanation language", defaultValue: "English" },
        ],
      },
    ],
    examples: [
      { input: "Japanese conversation practice at N3 level", output: "Adaptive conversation with gentle corrections, new vocabulary every 3 exchanges, cultural notes, and session summary with homework." },
    ],
  },
  {
    title: { en: "Research Paper & Academic Writing Assistant", vi: "Trợ lý viết bài nghiên cứu & học thuật" },
    category: "education",
    tags: ["academic", "research", "thesis", "literature-review", "scientific-writing"],
    priceSKT: 55,
    sellerIdx: 8,
    description: {
      en: "Write and structure academic papers, literature reviews, thesis chapters, and research proposals. Follows APA/IEEE/Chicago style guides with proper citation formatting and argumentation.",
      vi: "Viết và cấu trúc bài báo học thuật, literature review, chương luận văn, và đề xuất nghiên cứu. Tuân theo hướng dẫn APA/IEEE/Chicago với trích dẫn và lập luận chuẩn."
    },
    previewText: "Write a {{documentType}} on {{topic}} following {{style}} guidelines...",
    coverImage: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80",
    models: ["gpt-4", "claude-4"],
    prompts: [
      {
        title: "Literature Review Structure",
        content: "Write a structured literature review on {{topic}}.\n\nScope: {{scope}}\nStyle guide: {{style}}\nTarget length: {{length}} words\n\nStructure:\n\n1. **Introduction** (10%)\n   - Research question and significance\n   - Scope and boundaries\n   - Organization strategy (thematic/chronological/methodological)\n\n2. **Theoretical Framework** (15%)\n   - Key theories and models\n   - How they relate to your research\n\n3. **Thematic Analysis** (60%)\n   - Theme 1: [generated based on topic]\n   - Theme 2: [generated based on topic]\n   - Theme 3: [generated based on topic]\n   - For each theme:\n     - Synthesize (don't just summarize) key findings\n     - Compare/contrast different authors' positions\n     - Identify agreements, contradictions, gaps\n     - Use transition sentences connecting themes\n\n4. **Discussion** (10%)\n   - Research gaps identified\n   - Methodological limitations in existing literature\n   - Emerging trends\n\n5. **Conclusion** (5%)\n   - Summary of key findings\n   - Justification for your proposed research\n   - Future directions\n\nCitation format: {{style}} (generate placeholder citations as [Author, Year])\n\nAcademic writing rules:\n- Hedging language (\"suggests\", \"may indicate\")\n- No first person\n- Critical analysis, not summary\n- Synthesis across sources, not source-by-source review",
        description: "Structured literature review with synthesis and critical analysis",
        variables: [
          { name: "topic", description: "Research topic", defaultValue: "Impact of generative AI on creative industries and workforce transformation" },
          { name: "scope", description: "Review scope", defaultValue: "2020-2025, focusing on design, writing, and video production industries" },
          { name: "style", description: "Citation style", defaultValue: "APA 7th edition" },
          { name: "length", description: "Target length", defaultValue: "5000" },
        ],
      },
      {
        title: "Research Proposal Template",
        content: "Write a research proposal for {{topic}}.\n\nDegree level: {{degree}}\nField: {{field}}\nMethodology preference: {{methodology}}\n\nSections:\n\n1. **Title Page** — Title, author, institution, date\n\n2. **Abstract** (250 words)\n   - Background, gap, objective, method, expected contribution\n\n3. **Introduction** (1000 words)\n   - Context and background\n   - Problem statement (specific, focused)\n   - Research questions (1 main + 2-3 sub-questions)\n   - Significance and contribution\n\n4. **Literature Review** (1500 words)\n   - Key concepts and definitions\n   - Previous research summary\n   - Research gap identification\n   - Conceptual framework diagram description\n\n5. **Methodology** (1500 words)\n   - Research design and justification\n   - Data collection methods\n   - Sampling strategy\n   - Analysis approach\n   - Ethical considerations\n   - Limitations and mitigation\n\n6. **Timeline** — Gantt chart description (monthly for {{duration}})\n\n7. **Budget** (if applicable)\n\n8. **References** — 15-20 placeholder citations\n\nWrite in formal academic register. Be specific about methodology choices.",
        description: "Complete research proposal with methodology and timeline",
        variables: [
          { name: "topic", description: "Research topic", defaultValue: "User trust and adoption patterns in AI-generated content detection tools" },
          { name: "degree", description: "Degree level", defaultValue: "Master's thesis" },
          { name: "field", description: "Academic field", defaultValue: "Human-Computer Interaction / Information Science" },
          { name: "methodology", description: "Methodology", defaultValue: "mixed methods (survey + semi-structured interviews)" },
          { name: "duration", description: "Research duration", defaultValue: "12 months" },
        ],
      },
    ],
    examples: [
      { input: "Literature review on AI impact in creative industries", output: "5000-word thematic review synthesizing research on design, writing, and video production. APA 7th format with gap analysis and future directions." },
    ],
  },

  // ═══════════════ OTHER (3) ═══════════════
  {
    title: { en: "Personal Productivity & Life Design System", vi: "Hệ thống năng suất cá nhân & thiết kế cuộc sống" },
    category: "other",
    tags: ["productivity", "life-design", "habits", "journaling", "goal-setting"],
    priceSKT: 25,
    sellerIdx: 4,
    description: {
      en: "Design your ideal life system with AI. Goal setting with accountability, habit tracking, weekly reviews, journaling prompts, and decision frameworks. Based on GTD, Atomic Habits, and Ikigai principles.",
      vi: "Thiết kế hệ thống cuộc sống lý tưởng với AI. Thiết lập mục tiêu, theo dõi thói quen, review tuần, prompt journaling, và framework ra quyết định. Dựa trên GTD, Atomic Habits, và Ikigai."
    },
    previewText: "Create a personal productivity system for {{persona}} focusing on {{goals}}...",
    coverImage: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&q=80",
    models: ["gpt-4", "claude-4", "gemini-2", "llama"],
    prompts: [
      {
        title: "Annual Goal Setting & Life Design",
        content: "Help me design my goals and systems for the year.\n\nAbout me: {{aboutMe}}\nCurrent situation: {{situation}}\nAreas to improve: {{areas}}\n\n**Step 1: Life Audit**\nRate each area 1-10 and identify the gap:\n- Career/Work, Finance, Health, Relationships, Learning, Fun/Adventure, Environment, Purpose\n\n**Step 2: Vision Setting**\n- 1-year vision (vivid, sensory description of ideal day)\n- 3-year north star\n- Anti-vision (what I definitely don't want)\n\n**Step 3: Goal Architecture**\nFor each area that scored <7:\n- One transformative goal (outcome-based)\n- Lead measure (the habit that drives it)\n- Lag measure (how you know it worked)\n- Identity statement (\"I am a person who...\")\n- Minimum viable habit (2-minute version)\n\n**Step 4: System Design**\n- Morning routine (30 min)\n- Evening shutdown ritual (15 min)\n- Weekly review template (30 min)\n- Monthly reflection questions\n- Quarterly adjustment protocol\n\n**Step 5: Accountability**\n- Progress tracking method\n- Obstacle pre-mortem (what could derail each goal?)\n- If-then contingency plans\n- Support system design",
        description: "Complete annual goal-setting with habits and review system",
        variables: [
          { name: "aboutMe", description: "Brief about yourself", defaultValue: "28-year-old software engineer, recently promoted to tech lead" },
          { name: "situation", description: "Current situation", defaultValue: "work is going well but health and personal projects are neglected, feeling burned out" },
          { name: "areas", description: "Focus areas", defaultValue: "health & fitness, side project (AI startup), deeper relationships, financial planning" },
        ],
      },
      {
        title: "Decision Making Framework",
        content: "Help me make a decision using multiple mental models.\n\nDecision: {{decision}}\nContext: {{context}}\nStakes: {{stakes}}\nDeadline: {{deadline}}\n\nApply these frameworks:\n\n1. **First Principles** — What's fundamentally true? Strip away assumptions.\n2. **Inversion** — How could this go catastrophically wrong?\n3. **10/10/10 Rule** — How will I feel in 10 minutes, 10 months, 10 years?\n4. **Opportunity Cost** — What am I giving up?\n5. **Reversibility Test** — One-way door or two-way door?\n6. **Regret Minimization** — At 80, which choice would I regret NOT taking?\n\n**Synthesis:**\n- Clear recommendation with confidence level (1-10)\n- Key assumption that could change the answer\n- What information would make this a no-brainer?\n- Decision journal entry template",
        description: "Multi-framework decision analysis with clear recommendation",
        variables: [
          { name: "decision", description: "Decision to make", defaultValue: "Should I leave my tech lead role to go full-time on my AI startup?" },
          { name: "context", description: "Relevant context", defaultValue: "Stable $150K salary, good team. Startup has 200 beta users, $2K MRR, growing 20% month. Have 12 months savings." },
          { name: "stakes", description: "What's at stake", defaultValue: "financial security, career momentum, startup timing, personal fulfillment" },
          { name: "deadline", description: "When to decide by", defaultValue: "end of this month" },
        ],
      },
    ],
    examples: [
      { input: "Annual goal setting for burned-out tech lead", output: "Life audit with 8 areas, vision setting, 4 transformative goals with habits, daily/weekly/monthly systems, and obstacle pre-mortem." },
    ],
  },
  {
    title: { en: "AI Art Style & Aesthetic Prompt Library", vi: "Thư viện prompt phong cách & thẩm mỹ AI Art" },
    category: "other",
    tags: ["ai-art", "aesthetics", "style-guide", "creative", "inspiration"],
    priceSKT: 40,
    sellerIdx: 7,
    description: {
      en: "A curated library of aesthetic styles and artistic movements translated into AI image generation prompts. From Renaissance chiaroscuro to cyberpunk neon, each style includes history, key visual elements, and ready-to-use prompts.",
      vi: "Thư viện phong cách thẩm mỹ và trường phái nghệ thuật được chuyển thành prompt tạo hình AI. Từ chiaroscuro Phục Hưng đến cyberpunk neon, mỗi style bao gồm lịch sử, yếu tố hình ảnh, và prompt sẵn dùng."
    },
    previewText: "Generate AI art in the style of {{aestheticStyle}} featuring {{subject}}...",
    coverImage: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=800&q=80",
    models: ["midjourney", "dall-e-3", "stable-diffusion", "flux"],
    prompts: [
      {
        title: "Art Movement Style Transfer",
        content: "Generate an image in the {{aestheticStyle}} style.\n\nSubject: {{subject}}\n\nFirst, provide:\n- Brief history of this movement (3 sentences)\n- Key visual characteristics (5 elements)\n- Famous artists who defined this style\n- Color palette (hex codes)\n- Lighting signature\n\nThen generate 3 prompt variants:\n\n**Faithful** — Pure style recreation\n\"{{subject}}, in the style of {{aestheticStyle}}, [5 specific visual elements], [lighting], [medium], [composition], masterwork quality --ar {{ratio}} --v 6.1 --s 750\"\n\n**Modern Fusion** — Style mixed with contemporary elements\n\"{{subject}}, {{aestheticStyle}} meets modern digital art, [blend elements], [unexpected color], [contemporary composition] --ar {{ratio}} --v 6.1 --s 500\"\n\n**Abstract Interpretation** — Distilled essence of the movement\n\"Abstract interpretation of {{subject}}, inspired by the philosophy of {{aestheticStyle}}, [emotional quality], [texture], [movement] --ar {{ratio}} --v 6.1 --s 1000\"\n\nFor each: full prompt, negative prompt, and style-specific parameters.",
        description: "3 style variants from faithful to abstract interpretation",
        variables: [
          { name: "aestheticStyle", description: "Art movement or aesthetic", defaultValue: "Art Deco" },
          { name: "subject", description: "Image subject", defaultValue: "a jazz musician performing in a grand theater" },
          { name: "ratio", description: "Aspect ratio", defaultValue: "2:3" },
        ],
      },
      {
        title: "Aesthetic Mood Board Generator",
        content: "Create a complete aesthetic mood board prompt set for {{aesthetic}}.\n\nApplication: {{application}}\n\nGenerate 8 prompts covering:\n1. **Color palette swatch** — 5 colors as paint strokes on canvas\n2. **Typography specimen** — letters/words in the aesthetic's style\n3. **Texture study** — close-up material/surface details\n4. **Pattern design** — seamless repeating pattern\n5. **Environmental shot** — space/room in this aesthetic\n6. **Object still life** — 5 objects that define this aesthetic\n7. **Portrait** — person embodying this aesthetic\n8. **Abstract composition** — pure form/color/emotion\n\nFor each:\n- Full AI generation prompt\n- Why this image represents the aesthetic\n- How to use it in {{application}}\n\nInclude a \"style recipe\" paragraph that captures the essence in a reusable prompt fragment.",
        description: "8-image mood board set with style recipe",
        variables: [
          { name: "aesthetic", description: "Aesthetic or style", defaultValue: "Wabi-Sabi (Japanese imperfect beauty)" },
          { name: "application", description: "What this is for", defaultValue: "ceramic brand identity and packaging design" },
        ],
      },
    ],
    examples: [
      { input: "Art Deco style prompts for jazz musician subject", output: "3 prompt variants (faithful, modern fusion, abstract) with full parameters, negative prompts, and art history context." },
    ],
  },
  {
    title: { en: "Health & Wellness AI Coach Prompts", vi: "Bộ prompt AI Coach Sức khỏe & Wellness" },
    category: "other",
    tags: ["health", "fitness", "nutrition", "mental-health", "wellness"],
    priceSKT: 20,
    isFree: false,
    sellerIdx: 4,
    description: {
      en: "AI-powered health and wellness coaching prompts. Workout programming, meal planning, mindfulness exercises, sleep optimization, and stress management. Personalized to your goals and constraints.",
      vi: "Prompt coaching sức khỏe và wellness với AI. Lập chương trình tập luyện, kế hoạch bữa ăn, bài tập mindfulness, tối ưu giấc ngủ, và quản lý stress. Cá nhân hóa theo mục tiêu."
    },
    previewText: "Create a personalized {{planType}} plan for {{persona}}...",
    coverImage: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80",
    models: ["gpt-4", "claude-4", "gemini-2", "llama"],
    prompts: [
      {
        title: "Workout Program Designer",
        content: "Create a {{duration}}-week workout program.\n\nGoal: {{goal}}\nExperience: {{experience}}\nEquipment: {{equipment}}\nDays per week: {{frequency}}\nSession length: {{sessionLength}} minutes\nLimitations: {{limitations}}\n\nGenerate:\n1. **Program overview** — Split, progression scheme, deload weeks\n2. **Weekly schedule** — Which days, which focus\n3. **Each workout day:**\n   - Warm-up (5 min, specific to today's focus)\n   - Main exercises (sets × reps, rest periods, RPE/RIR)\n   - Accessory work\n   - Cool-down / mobility\n4. **Progressive overload plan** — How to increase difficulty weekly\n5. **Deload protocol** — Every 4th week\n6. **Substitution guide** — Alternatives for each main exercise\n7. **Tracking template** — What to log\n\nIMPORTANT: Include disclaimer that this is AI-generated and not medical advice. Recommend consulting a fitness professional.",
        description: "Structured workout program with progression and alternatives",
        variables: [
          { name: "duration", description: "Program length in weeks", defaultValue: "8" },
          { name: "goal", description: "Fitness goal", defaultValue: "build muscle and improve overall fitness" },
          { name: "experience", description: "Training experience", defaultValue: "intermediate (1-2 years consistent training)" },
          { name: "equipment", description: "Available equipment", defaultValue: "full gym (barbell, dumbbells, cables, machines)" },
          { name: "frequency", description: "Training frequency", defaultValue: "4" },
          { name: "sessionLength", description: "Session duration", defaultValue: "60" },
          { name: "limitations", description: "Any limitations", defaultValue: "mild lower back sensitivity, avoid heavy deadlifts" },
        ],
      },
      {
        title: "Mindfulness & Stress Management",
        content: "Create a personalized mindfulness practice for {{persona}}.\n\nStress source: {{stressSource}}\nExperience with meditation: {{experience}}\nAvailable time: {{timePerDay}} minutes per day\n\nGenerate:\n\n**Daily Practice Menu** (pick 1-2 per day):\n1. Morning intention setting ({{morningTime}} min)\n2. Breathing technique for acute stress (2 min)\n3. Body scan meditation (guided script)\n4. Walking meditation instructions\n5. Evening reflection journaling prompts (5 prompts)\n6. Sleep preparation sequence\n\n**Weekly Deep Practices:**\n- Gratitude exercise\n- Values clarification\n- Worry time protocol (scheduled worrying)\n- Self-compassion meditation\n\n**Emergency Toolkit:**\n- 60-second panic reset\n- Grounding technique (5-4-3-2-1 senses)\n- Cognitive reframe steps\n\nWrite guided meditations as actual scripts to follow (not descriptions). Use calm, present-tense language.\n\nDisclaimer: AI-generated wellness content, not a substitute for professional mental health care.",
        description: "Complete mindfulness toolkit with guided meditation scripts",
        variables: [
          { name: "persona", description: "Who this is for", defaultValue: "a tech professional experiencing work burnout" },
          { name: "stressSource", description: "Primary stress source", defaultValue: "deadline pressure, constant meetings, imposter syndrome" },
          { name: "experience", description: "Meditation experience", defaultValue: "beginner (tried a few guided apps)" },
          { name: "timePerDay", description: "Available daily time", defaultValue: "15" },
          { name: "morningTime", description: "Morning practice time", defaultValue: "5" },
        ],
      },
    ],
    examples: [
      { input: "8-week muscle building program, 4 days/week", output: "Push/Pull/Legs/Upper split with progressive overload, deload weeks, exercise substitutions, and tracking template." },
    ],
  },
];

/* ═══════════════════════════════════════════════════
 * SEED REVIEWS — varied review templates
 * ═══════════════════════════════════════════════════ */
const REVIEW_TEMPLATES = [
  { rating: 5, comment: "Incredibly well-structured prompts. Saved me hours of work. Worth every SKT!" },
  { rating: 5, comment: "The variables make these so flexible. I use them daily now." },
  { rating: 4, comment: "Great quality overall. A few prompts could use more examples, but solid value." },
  { rating: 5, comment: "Best prompt set I've purchased. The output quality is consistently high." },
  { rating: 4, comment: "Very useful for my workflow. Would love to see more variations in future updates." },
  { rating: 5, comment: "These prompts are production-ready. No tweaking needed. Highly recommend." },
  { rating: 3, comment: "Good starting point but I had to customize quite a bit for my use case." },
  { rating: 5, comment: "The attention to detail is impressive. Variables are thoughtfully designed." },
  { rating: 4, comment: "Solid collection. The preview accurately represents the quality." },
  { rating: 5, comment: "Exactly what I needed. Clear, well-organized, and effective." },
  { rating: 5, comment: "Tuyệt vời! Prompt rất chi tiết và dễ sử dụng. Highly recommended." },
  { rating: 4, comment: "Good prompts for the price. The multi-language support is a nice touch." },
  { rating: 5, comment: "I've bought 5 prompt sets on this marketplace — this is by far the best one." },
  { rating: 4, comment: "Quality prompts with smart variable design. Minor formatting issues in a couple." },
  { rating: 5, comment: "This changed my entire workflow. Generating content 10x faster now." },
];

/* ═══════════════════════════════════════════════════
 * MAIN SEED FUNCTION
 * ═══════════════════════════════════════════════════ */
async function seed() {
  await mongoose.connect(process.env.MONGO_URI!);
  console.log("🔌 Connected to MongoDB");

  // ── Clean previous seed data ──
  const oldSeedUsers = await User.find({ type: "seed" }).select("_id");
  const oldIds = oldSeedUsers.map((u) => u._id);
  if (oldIds.length) {
    const oldPromptSets = await PromptSet.find({ sellerId: { $in: oldIds } }).select("_id");
    const oldPsIds = oldPromptSets.map((p) => p._id);
    await Promise.all([
      PromptReview.deleteMany({ promptSetId: { $in: oldPsIds } }),
      PromptWishlist.deleteMany({ promptSetId: { $in: oldPsIds } }),
      SellerFollower.deleteMany({ $or: [{ sellerId: { $in: oldIds } }, { followerId: { $in: oldIds } }] }),
    ]);
    await PromptSet.deleteMany({ sellerId: { $in: oldIds } });
  }
  await User.deleteMany({ type: "seed" });
  console.log("🧹 Cleaned previous seed data");

  // ── Create seed users ──
  const createdUsers = await User.insertMany(
    SEED_USERS.map((u) => ({
      email: u.email,
      name: u.name,
      firstName: u.name.split(" ")[0],
      lastName: u.name.split(" ").slice(1).join(" "),
      avatar: u.avatar,
      specialty: u.specialty,
      bio: u.bio,
      verified: u.verified,
      socialLinks: u.socialLinks || {},
      type: "seed" as const,
      role: "user" as const,
      inviteCode: `SEED-${code()}`,
      skyTokenBalance: rand(500, 5000),
      creditBalance: rand(100, 1000),
      experienceYears: rand(2, 10),
    }))
  );
  console.log(`👤 Created ${createdUsers.length} seed users`);

  // ── Create prompt sets ──
  const promptSets = [];
  for (const p of PROMPTS) {
    const seller = createdUsers[p.sellerIdx];
    const s = slug(p.title.en) + "-" + code();
    promptSets.push({
      sellerId: seller._id,
      slug: s,
      title: { en: p.title.en, vi: p.title.vi, ko: "", ja: "" },
      description: { en: p.description.en, vi: p.description.vi, ko: "", ja: "" },
      category: p.category,
      tags: p.tags,
      coverImage: p.coverImage,
      priceSKT: p.isFree ? 0 : p.priceSKT,
      isFree: p.isFree || false,
      featured: p.featured || false,
      previewText: p.previewText,
      prompts: p.prompts.map((pr) => ({
        title: pr.title,
        content: pr.content,
        description: pr.description,
        variables: pr.variables || [],
      })),
      status: "active",
      isActive: true,
      purchaseCount: rand(10, 350),
      promptCount: p.prompts.length,
      totalEarned: 0,
      sortOrder: 0,
      averageRating: 0,
      reviewCount: 0,
      viewCount: rand(100, 8000),
      wishlistCount: rand(5, 80),
      models: p.models,
      examples: p.examples,
    });
  }

  const createdPromptSets = await PromptSet.insertMany(promptSets);
  console.log(`📦 Created ${createdPromptSets.length} prompt sets`);

  // ── Create reviews ──
  let reviewCount = 0;
  for (const ps of createdPromptSets) {
    // 70% chance of having reviews
    if (Math.random() > 0.7) continue;

    const numReviews = rand(3, 7);
    const reviewers = createdUsers
      .filter((u) => String(u._id) !== String(ps.sellerId))
      .sort(() => Math.random() - 0.5)
      .slice(0, numReviews);

    const reviews = reviewers.map((reviewer) => {
      const template = pick(REVIEW_TEMPLATES);
      return {
        buyerId: reviewer._id,
        promptSetId: ps._id,
        rating: template.rating,
        comment: template.comment,
      };
    });

    await PromptReview.insertMany(reviews);
    reviewCount += reviews.length;

    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await PromptSet.updateOne(
      { _id: ps._id },
      { averageRating: Math.round(avg * 10) / 10, reviewCount: reviews.length }
    );
  }
  console.log(`⭐ Created ${reviewCount} reviews`);

  // ── Create wishlists ──
  let wishlistCount = 0;
  for (const ps of createdPromptSets) {
    const numWishlisters = rand(0, 4);
    const wishlisters = createdUsers
      .filter((u) => String(u._id) !== String(ps.sellerId))
      .sort(() => Math.random() - 0.5)
      .slice(0, numWishlisters);

    if (wishlisters.length) {
      await PromptWishlist.insertMany(
        wishlisters.map((w) => ({ userId: w._id, promptSetId: ps._id }))
      );
      wishlistCount += wishlisters.length;
    }
  }
  console.log(`💝 Created ${wishlistCount} wishlist entries`);

  // ── Create seller followers ──
  let followerCount = 0;
  for (const seller of createdUsers) {
    const numFollowers = rand(0, 5);
    const followers = createdUsers
      .filter((u) => String(u._id) !== String(seller._id))
      .sort(() => Math.random() - 0.5)
      .slice(0, numFollowers);

    if (followers.length) {
      await SellerFollower.insertMany(
        followers.map((f) => ({ sellerId: seller._id, followerId: f._id }))
      );
      followerCount += followers.length;
    }
  }
  console.log(`👥 Created ${followerCount} follower relationships`);

  // ── Update totalEarned ──
  for (const ps of createdPromptSets) {
    const doc = await PromptSet.findById(ps._id);
    if (doc && !doc.isFree) {
      doc.totalEarned = doc.purchaseCount * doc.priceSKT * 0.9;
      await doc.save();
    }
  }

  // ── Summary ──
  const catCounts: Record<string, number> = {};
  for (const p of PROMPTS) {
    catCounts[p.category] = (catCounts[p.category] || 0) + 1;
  }

  console.log("\n✅ Seed v2 complete!");
  console.log(`   ${createdUsers.length} users (type: seed)`);
  console.log(`   ${createdPromptSets.length} prompt sets`);
  console.log(`   Categories: ${Object.entries(catCounts).map(([k, v]) => `${k}(${v})`).join(", ")}`);
  console.log(`   ${reviewCount} reviews`);
  console.log(`   ${wishlistCount} wishlist entries`);
  console.log(`   ${followerCount} follower relationships`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
