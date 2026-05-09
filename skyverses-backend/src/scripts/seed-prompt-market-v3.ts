import "dotenv/config";
import mongoose from "mongoose";
import * as crypto from "crypto";
import User from "../models/UserModel";
import PromptSet from "../models/PromptSet.model";
import PromptReview from "../models/PromptReview.model";
import PromptWishlist from "../models/PromptWishlist.model";
import SellerFollower from "../models/SellerFollower.model";

/* ─── helpers ─── */
const slugify = (t: string) =>
  t.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "d")
    .replace(/[^a-zA-Z0-9\s]/g, " ").replace(/\s+/g, "-").trim().toLowerCase();

const code = () => crypto.randomBytes(4).toString("hex");
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

/* ═══════════════════════════════════════════════════
 * SEED USERS — 12 diverse creators
 * ═══════════════════════════════════════════════════ */
const SEED_USERS = [
  { name: "Alex Chen", email: "alex.chen.seed@skyverses.io", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alexv3", specialty: "AI Prompt Engineering", bio: "Senior AI engineer with 8+ years building intelligent systems. Specializing in GPT-4, Claude, and Midjourney prompts.", verified: true, socialLinks: { website: "https://alexchen.dev", twitter: "alexchen_ai", github: "alexchendev" } },
  { name: "Sarah Kim", email: "sarah.kim.seed@skyverses.io", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarahv3", specialty: "Content Marketing", bio: "Marketing strategist helping brands scale with AI-driven content. Former content lead at HubSpot.", verified: true, socialLinks: { website: "https://sarahkim.co", twitter: "sarahkim_mkt" } },
  { name: "Marcus Rivera", email: "marcus.r.seed@skyverses.io", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=marcusv3", specialty: "Full-Stack Development", bio: "Full-stack dev & open-source contributor. Building AI-powered developer tools.", verified: true, socialLinks: { github: "marcusrivera" } },
  { name: "Yuki Tanaka", email: "yuki.t.seed@skyverses.io", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=yukiv3", specialty: "UI/UX Design", bio: "Design lead creating beautiful AI-assisted design workflows. Figma & Midjourney expert.", verified: true, socialLinks: { website: "https://yukidesign.jp", twitter: "yuki_uxai" } },
  { name: "David Nguyen", email: "david.ng.seed@skyverses.io", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=davidv3", specialty: "Business Strategy", bio: "Business consultant using AI to automate workflows and boost productivity for startups.", verified: false, socialLinks: { website: "https://davidnguyen.biz" } },
  { name: "Emma Watson", email: "emma.w.seed@skyverses.io", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emmav3", specialty: "Creative Writing", bio: "Published author & AI writing coach. Helping writers unlock creativity with smart prompts.", verified: true, socialLinks: { twitter: "emmawrites_ai" } },
  { name: "Raj Patel", email: "raj.p.seed@skyverses.io", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=rajv3", specialty: "Data Science & ML", bio: "ML engineer & data scientist. Building prompts for data analysis, visualization, and research.", verified: false, socialLinks: { github: "rajpatel-ds" } },
  { name: "Luna Park", email: "luna.p.seed@skyverses.io", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=lunav3", specialty: "Visual Design & AI Art", bio: "Digital artist & Midjourney power user. Creating stunning visuals with AI-assisted workflows.", verified: true, socialLinks: { website: "https://lunapark.art", twitter: "luna_aiart" } },
  { name: "James Mitchell", email: "james.m.seed@skyverses.io", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jamesv3", specialty: "Education & Training", bio: "EdTech innovator using AI to create personalized learning experiences. Former professor at MIT.", verified: false, socialLinks: { website: "https://jamesmitchell.edu" } },
  { name: "Mia Zhang", email: "mia.z.seed@skyverses.io", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=miav3", specialty: "Video & Motion Design", bio: "Video producer & AI filmmaker. Crafting cinematic prompts for Sora, Runway, and Pika.", verified: true, socialLinks: { twitter: "miazhang_video", website: "https://miazhang.studio" } },
  { name: "Carlos Mendez", email: "carlos.m.seed@skyverses.io", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=carlosv3", specialty: "Growth Hacking & Ads", bio: "Performance marketer scaling startups with AI ad copy, landing pages, and conversion funnels.", verified: true, socialLinks: { twitter: "carlos_growth", website: "https://carlosmendez.io" } },
  { name: "Aisha Obi", email: "aisha.o.seed@skyverses.io", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=aishav3", specialty: "Product Management", bio: "Senior PM at a Fortune 500. Using AI to streamline PRDs, user stories, and roadmaps.", verified: false, socialLinks: { website: "https://aishaobi.com" } },
];

/* ═══════════════════════════════════════════════════
 * 50 PROMPT SETS — 7 categories
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

  /* ═══════════════════════════════════════════════════
   * CODING — 9 sets
   * ═══════════════════════════════════════════════════ */

  // #1 React Component Library
  {
    title: { en: "React + Tailwind Component Library", vi: "Thư viện Component React + Tailwind" },
    category: "coding",
    tags: ["react", "tailwind", "ui", "components", "typescript"],
    priceSKT: 75,
    featured: true,
    sellerIdx: 2,
    description: {
      en: "Generate production-ready React + Tailwind CSS components with TypeScript. Includes accessible forms, data tables, modals, cards, and navigation. Each component follows atomic design principles.",
      vi: "Tạo component React + Tailwind CSS sẵn sàng production với TypeScript. Bao gồm form accessible, bảng dữ liệu, modal, card, navigation."
    },
    previewText: "You are a senior React developer. Generate a {{componentType}} component with full TypeScript types...",
    coverImage: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80",
    models: ["gpt-4", "claude-4", "gemini-2"],
    prompts: [
      {
        title: "Accessible Form Component",
        content: "Create a fully accessible React form component using Tailwind CSS.\n\nComponent: {{componentName}}\nFields: {{fields}}\n\nRequirements:\n- TypeScript with strict prop interfaces\n- Tailwind CSS only (no inline styles)\n- Full ARIA labels and keyboard navigation\n- Client-side validation with error messages\n- Loading state with disabled inputs during submit\n- Dark mode support\n- Responsive (mobile-first)\n- useForm custom hook for state management\n\nReturn the component, hook, and usage example.",
        description: "Creates accessible, validated form components with Tailwind",
        variables: [
          { name: "componentName", description: "Name of the form component", defaultValue: "ContactForm" },
          { name: "fields", description: "Form fields to include", defaultValue: "name (text), email (email), message (textarea), category (select)" },
        ],
      },
      {
        title: "Data Table with Sort/Filter/Paginate",
        content: "Build a data table component in React + Tailwind.\n\nFeatures:\n- Column sorting (asc/desc) with visual indicators\n- Multi-column filtering\n- Client-side pagination with configurable page sizes\n- Row selection with bulk actions\n- Responsive: card view below {{breakpoint}}\n- Empty state and loading skeleton\n\nData type: {{dataType}}\nColumns: {{columns}}",
        description: "Full-featured data table with responsive card view",
        variables: [
          { name: "dataType", description: "Data type", defaultValue: "User" },
          { name: "columns", description: "Table columns", defaultValue: "avatar, name, email, role, status, joinDate" },
          { name: "breakpoint", description: "Responsive breakpoint", defaultValue: "768px" },
        ],
      },
      {
        title: "Modal & Drawer System",
        content: "Create a reusable modal and drawer system for React + Tailwind.\n\nFeatures:\n- Modal sizes: sm, md, lg, xl, full\n- Drawer sliding from: left, right, top, bottom\n- Portal rendering\n- Focus trap & ESC key\n- Click outside to dismiss\n- Smooth enter/exit animations\n- Body scroll lock\n\nReturn: Modal, Drawer, ModalProvider, useModal hook.",
        description: "Complete modal/drawer system with animations and accessibility",
      },
    ],
    examples: [
      { input: "Generate a ContactForm with name, email, message fields", output: "A responsive, accessible contact form with validation, loading states, and dark mode. Includes useContactForm hook.", image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80" },
      { input: "Build a User data table with sort and filter", output: "Full data table with sortable columns, search filter, pagination, CSV export. Card layout on mobile.", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80" },
    ],
  },

  // #2 Full-Stack API Kit
  {
    title: { en: "Full-Stack API Architecture Kit", vi: "Bộ kiến trúc API Full-Stack" },
    category: "coding",
    tags: ["api", "nodejs", "express", "prisma", "architecture"],
    priceSKT: 90,
    sellerIdx: 0,
    description: {
      en: "Design scalable REST/GraphQL APIs with Node.js. Covers authentication, rate limiting, caching, error handling, Prisma schema design, and testing strategies.",
      vi: "Thiết kế API REST/GraphQL với Node.js. Bao gồm xác thực, rate limiting, caching, xử lý lỗi, thiết kế schema Prisma."
    },
    previewText: "Design a scalable API for {{domain}} with auth, caching, and error handling...",
    coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
    models: ["gpt-4", "claude-4"],
    prompts: [
      {
        title: "REST API with Auth & Rate Limiting",
        content: "Design a production REST API for {{domain}} using Node.js + Express + Prisma.\n\nResources: {{resources}}\n\nGenerate:\n1. Prisma schema with proper relations\n2. Express routes with JWT auth, role-based authorization, rate limiting, Zod validation, Redis caching\n3. Error handling with custom error classes\n4. Cursor-based pagination\n5. API versioning\n\nReturn folder structure and all files.",
        description: "Complete REST API with auth, rate limiting, caching",
        variables: [
          { name: "domain", description: "API domain", defaultValue: "E-commerce marketplace" },
          { name: "resources", description: "API resources", defaultValue: "products, orders, users, reviews, categories" },
        ],
      },
      {
        title: "Database Migration Strategy",
        content: "Create a migration and seeding strategy for {{database}} using Prisma.\n\nEntities: {{entities}}\n\nGenerate:\n1. Initial migration schema\n2. Seed script with realistic fake data\n3. Zero-downtime migration for {{newFeature}}\n4. Rollback procedures\n5. Performance indexes",
        description: "Database migration strategy with seeds and rollback",
        variables: [
          { name: "database", description: "Database type", defaultValue: "PostgreSQL" },
          { name: "entities", description: "Data entities", defaultValue: "User, Product, Order, Review, Category" },
          { name: "newFeature", description: "New feature", defaultValue: "multi-currency support" },
        ],
      },
    ],
    examples: [
      { input: "Design API for e-commerce with products, orders, users", output: "Complete Express + Prisma API with JWT auth, Redis caching, rate limiting, Zod validation, and structured error handling.", image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80" },
    ],
  },

  // #3 Python AI/ML Pipeline
  {
    title: { en: "Python AI/ML Pipeline Templates", vi: "Template Pipeline AI/ML Python" },
    category: "coding",
    tags: ["python", "machine-learning", "ai", "data-science", "pipeline"],
    priceSKT: 110,
    featured: true,
    sellerIdx: 6,
    description: {
      en: "Build production ML pipelines with Python. Data preprocessing, model training, evaluation, and deployment. Supports scikit-learn, PyTorch, TensorFlow, and LangChain.",
      vi: "Xây dựng pipeline ML production với Python. Tiền xử lý dữ liệu, training, đánh giá, và triển khai model."
    },
    previewText: "Build an end-to-end ML pipeline for {{task}} using {{framework}}...",
    coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    models: ["gpt-4", "claude-4", "gemini-2"],
    prompts: [
      {
        title: "End-to-End ML Pipeline",
        content: "Build a production ML pipeline for {{task}}.\n\nDataset: {{dataset}}\nFramework: {{framework}}\n\nStages: Data Loading & EDA → Preprocessing → Model Training (Optuna tuning) → Evaluation (SHAP) → FastAPI deployment.\n\nReturn complete Python code with type hints.",
        description: "Complete ML pipeline from data to deployment",
        variables: [
          { name: "task", description: "ML task", defaultValue: "customer churn prediction" },
          { name: "dataset", description: "Dataset", defaultValue: "100K rows, 25 features" },
          { name: "framework", description: "ML framework", defaultValue: "scikit-learn + XGBoost" },
        ],
      },
      {
        title: "LangChain RAG System",
        content: "Build a production RAG system using LangChain.\n\nUse case: {{useCase}}\nLLM: {{llm}}\n\nArchitecture: Document ingestion → Smart chunking → Embedding + {{vectorDB}} → Hybrid retrieval → Re-ranking → Streaming response with citations.\n\nReturn all Python files.",
        description: "Production RAG with hybrid retrieval",
        variables: [
          { name: "useCase", description: "Use case", defaultValue: "internal knowledge base Q&A" },
          { name: "llm", description: "LLM", defaultValue: "Claude 4 Sonnet" },
          { name: "vectorDB", description: "Vector DB", defaultValue: "Pinecone" },
        ],
      },
    ],
    examples: [
      { input: "Build churn prediction pipeline with scikit-learn", output: "Full pipeline with EDA, preprocessing, XGBoost tuning via Optuna, SHAP explanations, and FastAPI endpoint.", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80" },
    ],
  },

  // #4 Next.js SaaS Starter
  {
    title: { en: "Next.js 15 SaaS Starter Prompts", vi: "Bộ prompt Next.js 15 SaaS Starter" },
    category: "coding",
    tags: ["nextjs", "saas", "stripe", "auth", "typescript"],
    priceSKT: 120,
    featured: true,
    sellerIdx: 2,
    description: {
      en: "Build a complete SaaS application with Next.js 15 App Router. Authentication, Stripe billing, dashboard, admin panel, email templates, and deployment configs included.",
      vi: "Xây dựng ứng dụng SaaS hoàn chỉnh với Next.js 15 App Router. Auth, Stripe billing, dashboard, admin panel, email templates."
    },
    previewText: "Build a SaaS {{feature}} with Next.js 15 App Router, Stripe, and {{auth}}...",
    coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    models: ["gpt-4", "claude-4"],
    prompts: [
      {
        title: "Auth + Multi-tenant Setup",
        content: "Create a Next.js 15 multi-tenant auth system.\n\nProvider: {{auth}}\nDatabase: {{database}}\n\nFeatures:\n- Email/password + OAuth (Google, GitHub)\n- Organization/team management\n- Role-based access (owner, admin, member)\n- Invitation flow with email\n- Session management\n- Middleware for route protection\n\nReturn all files with App Router conventions.",
        description: "Multi-tenant auth with org management",
        variables: [
          { name: "auth", description: "Auth provider", defaultValue: "NextAuth v5" },
          { name: "database", description: "Database", defaultValue: "PostgreSQL + Prisma" },
        ],
      },
      {
        title: "Stripe Subscription Billing",
        content: "Implement Stripe subscription billing for a Next.js SaaS.\n\nPlans: {{plans}}\n\nFeatures:\n- Pricing page with plan comparison\n- Checkout session creation\n- Webhook handler (subscription events)\n- Customer portal link\n- Usage-based metering\n- Trial periods\n- Proration handling\n- Invoice history page",
        description: "Complete Stripe billing integration",
        variables: [
          { name: "plans", description: "Pricing plans", defaultValue: "Free, Pro ($19/mo), Team ($49/mo), Enterprise (custom)" },
        ],
      },
    ],
    examples: [
      { input: "Build multi-tenant auth with NextAuth v5", output: "Complete auth system with org/team management, role-based access, email invitations, and protected API routes.", image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&q=80" },
    ],
  },

  // #5 Mobile App (React Native)
  {
    title: { en: "React Native Mobile App Prompts", vi: "Bộ prompt ứng dụng React Native" },
    category: "coding",
    tags: ["react-native", "mobile", "expo", "ios", "android"],
    priceSKT: 65,
    sellerIdx: 2,
    description: {
      en: "Accelerate React Native development with prompts for navigation, state management, animations, and platform-specific UI. Works with Expo and bare RN.",
      vi: "Tăng tốc phát triển React Native với prompt cho navigation, state management, animation, và UI đa nền tảng."
    },
    previewText: "Build a React Native {{screenType}} screen with {{feature}} using Expo...",
    coverImage: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80",
    models: ["gpt-4", "claude-4"],
    prompts: [
      {
        title: "Screen with Navigation & Animations",
        content: "Create a React Native screen: {{screenName}}\n\nFeatures:\n- {{feature}}\n- React Navigation integration\n- Reanimated 3 animations\n- Platform-specific styling\n- Pull-to-refresh, skeleton loading\n\nUse Expo SDK {{sdkVersion}}, TypeScript, NativeWind.",
        description: "Full screen with navigation and animations",
        variables: [
          { name: "screenName", description: "Screen name", defaultValue: "ProductDetail" },
          { name: "feature", description: "Main feature", defaultValue: "image carousel with parallax header" },
          { name: "sdkVersion", description: "SDK version", defaultValue: "52" },
        ],
      },
    ],
    examples: [
      { input: "Build ProductDetail screen with image carousel", output: "Animated product screen with parallax header, swipeable carousel, haptic feedback, and skeleton loading.", image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80" },
    ],
  },

  // #6 DevOps & Cloud
  {
    title: { en: "DevOps & Cloud Infrastructure Prompts", vi: "Bộ prompt DevOps & Cloud" },
    category: "coding",
    tags: ["devops", "aws", "terraform", "docker", "kubernetes"],
    priceSKT: 85,
    sellerIdx: 0,
    description: {
      en: "IaC templates and CI/CD pipelines for AWS, GCP, Azure. Terraform modules, K8s manifests, Docker configs, and Grafana/Prometheus monitoring.",
      vi: "Template IaC và CI/CD pipeline cho AWS, GCP, Azure. Terraform modules, K8s manifests, Docker configs."
    },
    previewText: "Create a Terraform module for {{infrastructure}} on {{cloud}}...",
    coverImage: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&q=80",
    models: ["gpt-4", "claude-4"],
    prompts: [
      {
        title: "Terraform Module for Production",
        content: "Create a Terraform module for {{infrastructure}} on {{cloud}}.\n\nRequirements:\n- Modular structure\n- Remote state\n- Security: least privilege IAM, encryption\n- High availability: multi-AZ, auto-scaling\n- Monitoring: CloudWatch alarms\n- Environments: dev, staging, prod\n\nReturn all .tf files.",
        description: "Production Terraform with multi-env and HA",
        variables: [
          { name: "infrastructure", description: "Infrastructure", defaultValue: "EKS cluster with RDS PostgreSQL" },
          { name: "cloud", description: "Cloud provider", defaultValue: "AWS" },
        ],
      },
    ],
    examples: [
      { input: "Terraform for EKS + RDS on AWS", output: "Modular Terraform with multi-AZ EKS, RDS with read replicas, ALB, and CloudWatch monitoring.", image: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&q=80" },
    ],
  },

  // #7 CLI Tool Generator
  {
    title: { en: "CLI Tool Generator (Node/Go/Rust)", vi: "Bộ tạo CLI Tool (Node/Go/Rust)" },
    category: "coding",
    tags: ["cli", "nodejs", "golang", "rust", "terminal"],
    priceSKT: 55,
    sellerIdx: 0,
    description: {
      en: "Generate professional CLI tools with argument parsing, colored output, interactive prompts, progress bars, config files, and plugin systems. Supports Node.js, Go, and Rust.",
      vi: "Tạo CLI tool chuyên nghiệp với argument parsing, colored output, interactive prompts, progress bars, config files."
    },
    previewText: "Build a CLI tool called {{name}} that {{purpose}} using {{language}}...",
    coverImage: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&q=80",
    models: ["gpt-4", "claude-4"],
    prompts: [
      {
        title: "Full CLI with Subcommands",
        content: "Build a CLI tool: {{name}}\nPurpose: {{purpose}}\nLanguage: {{language}}\n\nFeatures:\n- Subcommands with help text\n- Interactive prompts for missing args\n- Colored output with spinners\n- Config file (~/.{{name}}rc)\n- JSON/table output formats\n- --verbose and --quiet flags\n- Auto-update check\n- Shell completions (bash/zsh/fish)",
        description: "Professional CLI with subcommands and interactive prompts",
        variables: [
          { name: "name", description: "CLI name", defaultValue: "deploy" },
          { name: "purpose", description: "Purpose", defaultValue: "manages multi-environment deployments" },
          { name: "language", description: "Language", defaultValue: "Node.js (Commander.js)" },
        ],
      },
    ],
    examples: [
      { input: "Build a 'deploy' CLI in Node.js for managing deployments", output: "Full CLI with init, deploy, rollback, status subcommands, interactive env selection, and colored progress output.", image: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&q=80" },
    ],
  },

  // #8 Testing & QA Prompts
  {
    title: { en: "Testing & QA Automation Suite", vi: "Bộ prompt Testing & QA Automation" },
    category: "coding",
    tags: ["testing", "jest", "playwright", "cypress", "qa"],
    priceSKT: 60,
    sellerIdx: 6,
    description: {
      en: "Comprehensive testing prompts for unit, integration, and E2E tests. Covers Jest, Playwright, Cypress, and API testing with realistic test data generation.",
      vi: "Bộ prompt testing toàn diện cho unit, integration, và E2E tests. Bao gồm Jest, Playwright, Cypress, và API testing."
    },
    previewText: "Write comprehensive tests for {{component}} using {{framework}}...",
    coverImage: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80",
    models: ["gpt-4", "claude-4"],
    prompts: [
      {
        title: "Unit + Integration Tests",
        content: "Write tests for {{component}} using {{framework}}.\n\nCover:\n- Happy path scenarios\n- Edge cases (empty, null, boundary values)\n- Error handling paths\n- Async operations\n- Mock external dependencies\n- Snapshot tests for UI\n- Test data factories\n- Coverage target: {{coverage}}%",
        description: "Comprehensive unit and integration tests",
        variables: [
          { name: "component", description: "Component/module to test", defaultValue: "UserAuthService" },
          { name: "framework", description: "Test framework", defaultValue: "Jest + React Testing Library" },
          { name: "coverage", description: "Coverage target", defaultValue: "90" },
        ],
      },
      {
        title: "E2E Test Suite with Playwright",
        content: "Create E2E tests for {{flow}} using Playwright.\n\nTest scenarios:\n- Complete user journey\n- Form validation feedback\n- Navigation and routing\n- Responsive behavior (mobile/tablet/desktop)\n- API interception with mock data\n- Visual regression screenshots\n- Performance metrics capture\n- Accessibility audit (axe-core)",
        description: "E2E tests with visual regression and a11y",
        variables: [
          { name: "flow", description: "User flow to test", defaultValue: "checkout process (cart → shipping → payment → confirmation)" },
        ],
      },
    ],
    examples: [
      { input: "Write tests for UserAuthService with Jest", output: "50+ test cases covering login, registration, password reset, token refresh, session management, and error handling.", image: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80" },
    ],
  },

  // #9 SQL & Database Mastery
  {
    title: { en: "SQL & Database Query Mastery", vi: "Bộ prompt SQL & Database nâng cao" },
    category: "coding",
    tags: ["sql", "postgresql", "database", "optimization", "queries"],
    priceSKT: 50,
    sellerIdx: 6,
    description: {
      en: "Master complex SQL queries, optimization, indexing strategies, and database design patterns. PostgreSQL, MySQL, and MongoDB covered with real-world scenarios.",
      vi: "Thành thạo SQL queries phức tạp, tối ưu hóa, indexing, và database design patterns. PostgreSQL, MySQL, MongoDB."
    },
    previewText: "Write an optimized SQL query to {{task}} with proper indexing...",
    coverImage: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&q=80",
    models: ["gpt-4", "claude-4", "gemini"],
    prompts: [
      {
        title: "Complex Query Optimization",
        content: "Write and optimize a SQL query for: {{task}}\n\nDatabase: {{database}}\nTables: {{tables}}\nExpected data volume: {{volume}}\n\nProvide:\n1. Initial query\n2. EXPLAIN ANALYZE output interpretation\n3. Optimized version with indexes\n4. Materialized view if beneficial\n5. Partitioning strategy if needed\n6. Performance comparison",
        description: "Query writing with optimization and indexing",
        variables: [
          { name: "task", description: "Query task", defaultValue: "monthly revenue report with YoY comparison by product category" },
          { name: "database", description: "Database", defaultValue: "PostgreSQL 16" },
          { name: "tables", description: "Tables", defaultValue: "orders, order_items, products, categories, customers" },
          { name: "volume", description: "Data volume", defaultValue: "50M orders, 200M order_items" },
        ],
      },
    ],
    examples: [
      { input: "Revenue report with YoY comparison on 50M rows", output: "Optimized query with window functions, partial indexes, materialized view, and monthly partitioning. 200ms → 15ms.", image: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&q=80" },
    ],
  },

  /* ═══════════════════════════════════════════════════
   * WRITING — 8 sets
   * ═══════════════════════════════════════════════════ */

  // #10 Blog & SEO Engine
  {
    title: { en: "Blog & SEO Content Engine", vi: "Công cụ tạo Blog & SEO Content" },
    category: "writing",
    tags: ["blog", "seo", "content-marketing", "copywriting"],
    priceSKT: 45,
    featured: true,
    sellerIdx: 1,
    description: {
      en: "Complete content creation system for blogs and SEO. Keyword research outlines, full articles with meta descriptions, internal linking, and social media snippets.",
      vi: "Hệ thống tạo nội dung hoàn chỉnh cho blog và SEO. Outline keyword, bài viết đầy đủ với meta description, internal linking."
    },
    previewText: "Write an SEO-optimized article about {{topic}} targeting {{keyword}}...",
    coverImage: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80",
    models: ["gpt-4", "claude-4", "gemini-2"],
    prompts: [
      {
        title: "SEO Article with Social Repurposing",
        content: "Write a {{wordCount}}-word SEO article.\n\nTopic: {{topic}}\nKeyword: {{keyword}}\nAudience: {{audience}}\nTone: {{tone}}\n\nStructure: Hook opening → TL;DR → H2/H3 content → Examples → FAQ (5 questions) → CTA\n\nSEO: Keyword density 1-2%, meta title (60 chars), meta description (155 chars), image alt texts, internal link anchors\n\nAlso generate: Twitter thread (5 tweets) + LinkedIn post + Newsletter teaser",
        description: "Full SEO article with social media repurposing",
        variables: [
          { name: "topic", description: "Topic", defaultValue: "How to Use AI for Product Photography in 2025" },
          { name: "keyword", description: "Primary keyword", defaultValue: "AI product photography" },
          { name: "audience", description: "Target audience", defaultValue: "e-commerce store owners" },
          { name: "wordCount", description: "Word count", defaultValue: "2500" },
          { name: "tone", description: "Tone", defaultValue: "authoritative but conversational" },
        ],
      },
    ],
    examples: [
      { input: "SEO article about AI product photography for e-commerce owners", output: "2500-word article with H2/H3 structure, 5 FAQ questions, meta tags, 5-tweet thread, LinkedIn post, and newsletter teaser.", image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80" },
    ],
  },

  // #11 Storytelling & Fiction
  {
    title: { en: "Fiction & Storytelling Masterclass", vi: "Bộ prompt Sáng tác & Kể chuyện" },
    category: "writing",
    tags: ["fiction", "storytelling", "creative-writing", "novel", "screenplay"],
    priceSKT: 55,
    sellerIdx: 5,
    description: {
      en: "Craft compelling stories, novels, and screenplays with AI. Character development, plot structure, dialogue, world-building, and scene-by-scene outlines.",
      vi: "Sáng tác truyện, tiểu thuyết, kịch bản hấp dẫn với AI. Phát triển nhân vật, cấu trúc cốt truyện, hội thoại, xây dựng thế giới."
    },
    previewText: "Write a {{genre}} story about {{premise}} with {{characters}} characters...",
    coverImage: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&q=80",
    models: ["gpt-4", "claude-4", "gemini-2"],
    prompts: [
      {
        title: "Character Deep-Dive",
        content: "Create a detailed character profile for a {{genre}} story.\n\nName: {{name}}\nRole: {{role}}\n\nGenerate:\n- Backstory (500 words)\n- Personality traits (Big Five model)\n- Motivations, fears, fatal flaw\n- Voice/dialogue style with 5 sample lines\n- Character arc outline (beginning → crisis → transformation)\n- Relationships with other characters\n- Visual description for illustration",
        description: "Deep character development with arc and voice",
        variables: [
          { name: "genre", description: "Genre", defaultValue: "sci-fi thriller" },
          { name: "name", description: "Character name", defaultValue: "Dr. Maya Reyes" },
          { name: "role", description: "Role", defaultValue: "protagonist — a quantum physicist who discovers time loops" },
        ],
      },
      {
        title: "Plot Structure Generator",
        content: "Build a complete plot structure for a {{genre}} {{format}}.\n\nPremise: {{premise}}\nLength: {{length}}\n\nUse the {{structure}} framework.\n\nGenerate:\n- Logline (25 words)\n- Synopsis (500 words)\n- Beat sheet with chapter/scene breakdown\n- Subplot threads\n- Thematic through-line\n- Twist/revelation planning\n- Climax sequence detail",
        description: "Full plot structure with beat sheet",
        variables: [
          { name: "genre", description: "Genre", defaultValue: "dystopian sci-fi" },
          { name: "format", description: "Format", defaultValue: "novel (80K words)" },
          { name: "premise", description: "Premise", defaultValue: "In 2089, memories can be traded as currency" },
          { name: "structure", description: "Story structure", defaultValue: "Save the Cat" },
          { name: "length", description: "Target length", defaultValue: "80,000 words / 25 chapters" },
        ],
      },
    ],
    examples: [
      { input: "Create Dr. Maya Reyes for a sci-fi thriller", output: "Full character profile with backstory, Big Five personality, 5 dialogue samples, character arc from discovery to sacrifice.", image: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&q=80" },
    ],
  },

  // #12 Email Copy Templates
  {
    title: { en: "High-Converting Email Copy Templates", vi: "Template Email Copy tỷ lệ mở cao" },
    category: "writing",
    tags: ["email", "copywriting", "newsletter", "drip-campaign", "conversion"],
    priceSKT: 40,
    sellerIdx: 1,
    description: {
      en: "Email sequences that convert: welcome series, abandoned cart, product launch, re-engagement, and newsletter templates. A/B test variants included.",
      vi: "Chuỗi email chuyển đổi cao: welcome series, abandoned cart, product launch, re-engagement, newsletter templates."
    },
    previewText: "Write a {{sequenceType}} email sequence for {{product}} targeting {{audience}}...",
    coverImage: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=800&q=80",
    models: ["gpt-4", "claude-4", "gemini"],
    prompts: [
      {
        title: "Email Drip Campaign (7-Day)",
        content: "Create a 7-day email drip campaign.\n\nProduct: {{product}}\nGoal: {{goal}}\nAudience: {{audience}}\n\nFor each email:\n- Subject line (A/B variants)\n- Preview text\n- Body copy (150-300 words)\n- CTA button text + link placeholder\n- Send timing (day + time)\n- Segment condition\n\nTone: {{tone}}\nInclude unsubscribe and compliance notes.",
        description: "7-day drip campaign with A/B variants",
        variables: [
          { name: "product", description: "Product", defaultValue: "AI-powered design tool SaaS" },
          { name: "goal", description: "Campaign goal", defaultValue: "convert free trial to paid plan" },
          { name: "audience", description: "Audience", defaultValue: "designers and marketers who signed up for free trial" },
          { name: "tone", description: "Tone", defaultValue: "friendly, helpful, slightly urgent" },
        ],
      },
    ],
    examples: [
      { input: "7-day drip to convert SaaS free trial users", output: "7 emails with A/B subject lines, progressive value demonstration, social proof, urgency, and final-day discount offer.", image: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=800&q=80" },
    ],
  },

  // #13 Resume & Cover Letter
  {
    title: { en: "Resume & Cover Letter AI Writer", vi: "AI Viết Resume & Cover Letter" },
    category: "writing",
    tags: ["resume", "cover-letter", "job-search", "career", "linkedin"],
    priceSKT: 35,
    sellerIdx: 5,
    description: {
      en: "Craft ATS-optimized resumes and tailored cover letters. Includes LinkedIn profile optimization, interview prep answers, and salary negotiation scripts.",
      vi: "Tạo resume tối ưu ATS và cover letter phù hợp từng vị trí. Bao gồm tối ưu LinkedIn, chuẩn bị phỏng vấn, và kịch bản thương lượng lương."
    },
    previewText: "Write a resume for {{role}} at {{company}} highlighting {{skills}}...",
    coverImage: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80",
    models: ["gpt-4", "claude-4"],
    prompts: [
      {
        title: "ATS-Optimized Resume",
        content: "Create an ATS-optimized resume.\n\nTarget role: {{role}}\nCompany: {{company}}\nExperience: {{experience}}\nSkills: {{skills}}\n\nFormat:\n- Professional summary (3 lines, keyword-rich)\n- Experience (STAR format bullets, quantified achievements)\n- Skills section (matched to job description)\n- Education\n- Certifications\n\nOptimize for ATS keywords from this job description: {{jobDescription}}",
        description: "ATS-optimized resume with quantified achievements",
        variables: [
          { name: "role", description: "Target role", defaultValue: "Senior Frontend Engineer" },
          { name: "company", description: "Target company", defaultValue: "Stripe" },
          { name: "experience", description: "Years of experience", defaultValue: "6 years in React/TypeScript" },
          { name: "skills", description: "Key skills", defaultValue: "React, TypeScript, Next.js, GraphQL, Design Systems" },
          { name: "jobDescription", description: "Job posting text", defaultValue: "[paste job description here]" },
        ],
      },
    ],
    examples: [
      { input: "Resume for Senior Frontend Engineer at Stripe", output: "Clean, ATS-optimized resume with keyword-matched summary, STAR-format bullets, and quantified impact metrics.", image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80" },
    ],
  },

  // #14 Technical Documentation
  {
    title: { en: "Technical Documentation Generator", vi: "Bộ tạo tài liệu kỹ thuật" },
    category: "writing",
    tags: ["documentation", "api-docs", "technical-writing", "readme", "guides"],
    priceSKT: 50,
    sellerIdx: 0,
    description: {
      en: "Generate comprehensive technical documentation: API references, developer guides, README files, architecture decision records, and runbooks.",
      vi: "Tạo tài liệu kỹ thuật toàn diện: API reference, developer guide, README, architecture decision records, runbooks."
    },
    previewText: "Write technical documentation for {{project}} covering {{topics}}...",
    coverImage: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80",
    models: ["gpt-4", "claude-4"],
    prompts: [
      {
        title: "API Reference Documentation",
        content: "Write API reference documentation for {{api}}.\n\nEndpoints: {{endpoints}}\n\nFor each endpoint:\n- Method + URL\n- Description\n- Auth requirements\n- Request parameters (query, path, body) with types\n- Response schema with examples (success + error)\n- Rate limits\n- Code examples (cURL, JavaScript, Python)\n\nAlso include: Authentication guide, error codes table, pagination guide, changelog.",
        description: "Complete API reference with code examples",
        variables: [
          { name: "api", description: "API name", defaultValue: "Payment Processing API" },
          { name: "endpoints", description: "Key endpoints", defaultValue: "POST /charges, GET /charges/:id, POST /refunds, GET /balance, POST /webhooks" },
        ],
      },
    ],
    examples: [
      { input: "API docs for Payment Processing with 5 endpoints", output: "Full API reference with auth guide, request/response schemas, error codes, cURL/JS/Python examples, and changelog.", image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80" },
    ],
  },

  // #15 Academic Writing
  {
    title: { en: "Academic Writing & Research Assistant", vi: "Trợ lý viết học thuật & nghiên cứu" },
    category: "writing",
    tags: ["academic", "research", "thesis", "papers", "citations"],
    priceSKT: 60,
    sellerIdx: 8,
    description: {
      en: "Academic writing prompts for research papers, thesis chapters, literature reviews, abstracts, and grant proposals. APA/MLA/Chicago formatting included.",
      vi: "Prompt viết học thuật cho bài nghiên cứu, luận văn, tổng quan tài liệu, abstract, và đề xuất tài trợ."
    },
    previewText: "Write a {{documentType}} about {{topic}} in {{field}}...",
    coverImage: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80",
    models: ["gpt-4", "claude-4", "gemini-2"],
    prompts: [
      {
        title: "Literature Review Generator",
        content: "Write a literature review for {{topic}} in {{field}}.\n\nScope: {{scope}}\nFormat: {{format}}\n\nStructure:\n- Introduction (research question + scope)\n- Thematic sections (group by subtopic)\n- Critical analysis (gaps, contradictions, trends)\n- Synthesis and theoretical framework\n- Future research directions\n- Reference list (20+ sources, properly formatted)\n\nTone: formal academic, third person",
        description: "Structured literature review with critical analysis",
        variables: [
          { name: "topic", description: "Research topic", defaultValue: "impact of generative AI on creative industries" },
          { name: "field", description: "Academic field", defaultValue: "digital media studies" },
          { name: "scope", description: "Time scope", defaultValue: "2020-2025" },
          { name: "format", description: "Citation format", defaultValue: "APA 7th edition" },
        ],
      },
    ],
    examples: [
      { input: "Literature review on generative AI impact on creative industries", output: "8,000-word review with 5 thematic sections, critical gap analysis, theoretical framework, and 25 APA-formatted references.", image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80" },
    ],
  },

  // #16 Copywriting Formulas
  {
    title: { en: "Copywriting Power Formulas", vi: "Công thức Copywriting hiệu quả" },
    category: "writing",
    tags: ["copywriting", "sales", "landing-page", "headlines", "conversion"],
    priceSKT: 0,
    isFree: true,
    sellerIdx: 10,
    description: {
      en: "Proven copywriting formulas: AIDA, PAS, BAB, 4P, and more. Generate headlines, sales pages, product descriptions, and CTAs that convert.",
      vi: "Công thức copywriting đã chứng minh: AIDA, PAS, BAB, 4P. Tạo headline, sales page, mô tả sản phẩm, và CTA chuyển đổi cao."
    },
    previewText: "Write {{copyType}} for {{product}} using the {{formula}} framework...",
    coverImage: "https://images.unsplash.com/photo-1542435503-956c469947f6?w=800&q=80",
    models: ["gpt-4", "claude-4", "gemini", "llama"],
    prompts: [
      {
        title: "Landing Page Copy (AIDA)",
        content: "Write landing page copy using the AIDA formula.\n\nProduct: {{product}}\nAudience: {{audience}}\nUSP: {{usp}}\n\nGenerate:\n- Hero headline (5 variants)\n- Subheadline\n- Problem section (Attention)\n- Features → Benefits (Interest)\n- Social proof section (Desire)\n- CTA section with button text (Action)\n- FAQ (5 questions)\n- Urgency element",
        description: "AIDA landing page with 5 headline variants",
        variables: [
          { name: "product", description: "Product", defaultValue: "AI-powered email marketing tool" },
          { name: "audience", description: "Audience", defaultValue: "small business owners" },
          { name: "usp", description: "Unique selling point", defaultValue: "writes and sends personalized emails 10x faster" },
        ],
      },
    ],
    examples: [
      { input: "Landing page for AI email tool targeting small businesses", output: "Complete AIDA landing page with 5 headline variants, benefit-driven features, testimonial placeholders, and urgency CTA.", image: "https://images.unsplash.com/photo-1542435503-956c469947f6?w=800&q=80" },
    ],
  },

  // #17 Podcast Script Writer
  {
    title: { en: "Podcast & YouTube Script Writer", vi: "Bộ viết kịch bản Podcast & YouTube" },
    category: "writing",
    tags: ["podcast", "youtube", "script", "video-content", "storytelling"],
    priceSKT: 45,
    sellerIdx: 9,
    description: {
      en: "Professional scripts for podcasts and YouTube videos. Includes intros, segment transitions, interview questions, show notes, and timestamps.",
      vi: "Kịch bản chuyên nghiệp cho podcast và video YouTube. Bao gồm intro, transitions, câu hỏi phỏng vấn, show notes."
    },
    previewText: "Write a {{duration}}-minute {{format}} script about {{topic}}...",
    coverImage: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&q=80",
    models: ["gpt-4", "claude-4"],
    prompts: [
      {
        title: "YouTube Video Script",
        content: "Write a {{duration}}-minute YouTube video script.\n\nTopic: {{topic}}\nChannel niche: {{niche}}\nStyle: {{style}}\n\nStructure:\n- Hook (first 30 seconds — pattern interrupt)\n- Intro + channel branding\n- Main content (3-5 segments with transitions)\n- B-roll suggestions for each segment\n- On-screen text/graphic callouts\n- Engagement prompts (subscribe, comment)\n- Outro with CTA\n\nAlso generate: Title (5 variants), description (SEO), tags, thumbnail concept",
        description: "YouTube script with B-roll notes and SEO metadata",
        variables: [
          { name: "topic", description: "Video topic", defaultValue: "5 AI Tools That Replace Entire Design Teams" },
          { name: "duration", description: "Video length", defaultValue: "12" },
          { name: "niche", description: "Channel niche", defaultValue: "tech reviews & AI tools" },
          { name: "style", description: "Presentation style", defaultValue: "fast-paced, visual, MKBHD-inspired" },
        ],
      },
    ],
    examples: [
      { input: "12-min YouTube script about AI design tools", output: "Full script with hook, 5 tool segments, B-roll notes, on-screen callouts, 5 title variants, SEO description, and thumbnail concept.", image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&q=80" },
    ],
  },

  /* ═══════════════════════════════════════════════════
   * MARKETING — 8 sets
   * ═══════════════════════════════════════════════════ */

  // #18 Social Media Content Calendar
  {
    title: { en: "30-Day Social Media Content Calendar", vi: "Lịch nội dung MXH 30 ngày" },
    category: "marketing",
    tags: ["social-media", "content-calendar", "instagram", "tiktok", "linkedin"],
    priceSKT: 55,
    featured: true,
    sellerIdx: 1,
    description: {
      en: "Complete 30-day content calendar for Instagram, TikTok, LinkedIn, and Twitter/X. Includes post copy, hashtags, visual direction, and optimal posting times.",
      vi: "Lịch nội dung 30 ngày cho Instagram, TikTok, LinkedIn, và Twitter/X. Bao gồm copy bài đăng, hashtag, hướng dẫn visual."
    },
    previewText: "Create a 30-day social media calendar for {{brand}} in the {{industry}} industry...",
    coverImage: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&q=80",
    models: ["gpt-4", "claude-4", "gemini"],
    prompts: [
      {
        title: "30-Day Multi-Platform Calendar",
        content: "Create a 30-day social media content calendar.\n\nBrand: {{brand}}\nIndustry: {{industry}}\nGoal: {{goal}}\nPlatforms: {{platforms}}\n\nFor each day generate:\n- Platform\n- Content type (reel, carousel, story, post, thread)\n- Caption/copy (platform-optimized)\n- Hashtags (15-20 per post)\n- Visual direction (describe the image/video)\n- Best posting time\n- Content pillar (educate/entertain/inspire/sell)\n\nInclude: 4 viral-worthy hooks, 2 collab post ideas, 2 user-generated content prompts.",
        description: "30-day calendar with copy, visuals, and hashtags",
        variables: [
          { name: "brand", description: "Brand name", defaultValue: "FreshBrew Coffee" },
          { name: "industry", description: "Industry", defaultValue: "specialty coffee / F&B" },
          { name: "goal", description: "Primary goal", defaultValue: "grow to 10K followers and drive online orders" },
          { name: "platforms", description: "Platforms", defaultValue: "Instagram, TikTok, LinkedIn" },
        ],
      },
    ],
    examples: [
      { input: "30-day calendar for FreshBrew Coffee on Instagram & TikTok", output: "30 posts with platform-specific copy, hashtag sets, visual direction, posting times, and 4 viral hook concepts.", image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&q=80" },
    ],
  },

  // #19 Facebook & Google Ads
  {
    title: { en: "Facebook & Google Ads Copy Bundle", vi: "Bộ quảng cáo Facebook & Google Ads" },
    category: "marketing",
    tags: ["facebook-ads", "google-ads", "ppc", "conversion", "ad-copy"],
    priceSKT: 70,
    sellerIdx: 10,
    description: {
      en: "High-converting ad copy for Facebook, Instagram, and Google Ads. Includes headlines, descriptions, audience targeting suggestions, and A/B test variants.",
      vi: "Quảng cáo chuyển đổi cao cho Facebook, Instagram, và Google Ads. Bao gồm headline, mô tả, gợi ý nhắm mục tiêu, và biến thể A/B."
    },
    previewText: "Write {{adType}} ads for {{product}} targeting {{audience}} with budget {{budget}}...",
    coverImage: "https://images.unsplash.com/photo-1563986768609-322da13575f2?w=800&q=80",
    models: ["gpt-4", "claude-4"],
    prompts: [
      {
        title: "Facebook/Instagram Ad Set",
        content: "Create a Facebook/Instagram ad campaign.\n\nProduct: {{product}}\nAudience: {{audience}}\nBudget: {{budget}}/month\nGoal: {{goal}}\n\nGenerate for each funnel stage (TOFU/MOFU/BOFU):\n- 3 ad copy variants (short, medium, long)\n- 5 headline options\n- Primary text + description\n- CTA button recommendation\n- Visual direction (image/video/carousel)\n- Audience targeting (interests, behaviors, lookalikes)\n- Placement recommendations\n\nInclude A/B testing plan and KPI benchmarks.",
        description: "Full-funnel Facebook ads with targeting",
        variables: [
          { name: "product", description: "Product", defaultValue: "online fitness coaching program ($97/month)" },
          { name: "audience", description: "Target audience", defaultValue: "women 25-45 interested in home workouts" },
          { name: "budget", description: "Monthly budget", defaultValue: "$2,000" },
          { name: "goal", description: "Campaign goal", defaultValue: "lead generation (free trial signups)" },
        ],
      },
    ],
    examples: [
      { input: "Facebook ads for fitness coaching targeting women 25-45", output: "9 ad variants across TOFU/MOFU/BOFU, audience targeting specs, A/B plan, and KPI benchmarks for $2K budget.", image: "https://images.unsplash.com/photo-1563986768609-322da13575f2?w=800&q=80" },
    ],
  },

  // #20 Product Launch Playbook
  {
    title: { en: "Product Launch Marketing Playbook", vi: "Playbook Marketing ra mắt sản phẩm" },
    category: "marketing",
    tags: ["product-launch", "go-to-market", "strategy", "campaign", "startup"],
    priceSKT: 95,
    sellerIdx: 10,
    description: {
      en: "Complete product launch strategy: pre-launch buzz, launch day execution, post-launch optimization. Email sequences, PR pitches, influencer outreach, and KPI tracking.",
      vi: "Chiến lược ra mắt sản phẩm hoàn chỉnh: pre-launch, launch day, post-launch. Email, PR, influencer outreach, KPI."
    },
    previewText: "Create a product launch plan for {{product}} launching on {{date}}...",
    coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    models: ["gpt-4", "claude-4"],
    prompts: [
      {
        title: "60-Day Launch Plan",
        content: "Create a 60-day product launch plan.\n\nProduct: {{product}}\nLaunch date: {{date}}\nBudget: {{budget}}\nTarget: {{target}}\n\nPhases:\n1. Pre-launch (Day -30 to -1): Waitlist, teaser content, beta invites, PR prep\n2. Launch week (Day 0-7): Announcement, Product Hunt, press release, email blast\n3. Post-launch (Day 8-30): Optimization, testimonials, retargeting, partnerships\n\nFor each phase: tasks, channels, copy samples, KPIs.\n\nAlso generate: Press release template, influencer outreach email, Product Hunt listing copy.",
        description: "60-day launch plan with templates and KPIs",
        variables: [
          { name: "product", description: "Product", defaultValue: "AI writing assistant Chrome extension" },
          { name: "date", description: "Launch date", defaultValue: "2025-07-15" },
          { name: "budget", description: "Marketing budget", defaultValue: "$5,000" },
          { name: "target", description: "Launch target", defaultValue: "1,000 users in first month" },
        ],
      },
    ],
    examples: [
      { input: "60-day launch for AI Chrome extension with $5K budget", output: "Detailed launch timeline with pre-launch waitlist strategy, Product Hunt playbook, press release, influencer emails, and KPI dashboard.", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80" },
    ],
  },

  // #21 Brand Voice & Messaging
  {
    title: { en: "Brand Voice & Messaging Framework", vi: "Framework Giọng điệu & Thông điệp thương hiệu" },
    category: "marketing",
    tags: ["branding", "brand-voice", "messaging", "tone", "guidelines"],
    priceSKT: 50,
    sellerIdx: 1,
    description: {
      en: "Define your brand voice, messaging hierarchy, taglines, and tone guidelines. Includes do/don't examples, competitor positioning, and multi-channel voice adaptation.",
      vi: "Xác định giọng điệu thương hiệu, hệ thống thông điệp, tagline, và hướng dẫn tone. Bao gồm ví dụ do/don't, định vị cạnh tranh."
    },
    previewText: "Define the brand voice for {{brand}} in the {{industry}} space...",
    coverImage: "https://images.unsplash.com/photo-1493421419110-74f4e85ba126?w=800&q=80",
    models: ["gpt-4", "claude-4"],
    prompts: [
      {
        title: "Complete Brand Voice Guide",
        content: "Create a brand voice and messaging guide.\n\nBrand: {{brand}}\nIndustry: {{industry}}\nAudience: {{audience}}\nValues: {{values}}\nCompetitors: {{competitors}}\n\nGenerate:\n1. Brand personality (5 adjectives with definitions)\n2. Voice attributes (3 dimensions with spectrum)\n3. Tone matrix (formal←→casual, serious←→playful, etc.)\n4. Messaging hierarchy (tagline → value props → proof points)\n5. Do/Don't examples for each channel (website, email, social, support)\n6. 10 tagline options\n7. Elevator pitch (30 seconds)\n8. Boilerplate paragraph",
        description: "Full brand voice guide with channel-specific examples",
        variables: [
          { name: "brand", description: "Brand", defaultValue: "NovaPay" },
          { name: "industry", description: "Industry", defaultValue: "fintech / digital payments" },
          { name: "audience", description: "Audience", defaultValue: "Gen Z and millennials" },
          { name: "values", description: "Core values", defaultValue: "simplicity, transparency, security, innovation" },
          { name: "competitors", description: "Competitors", defaultValue: "Stripe, Square, Venmo" },
        ],
      },
    ],
    examples: [
      { input: "Brand voice for NovaPay fintech targeting Gen Z", output: "Complete voice guide with 5 personality traits, tone matrix, 10 taglines, channel-specific do/don't, and elevator pitch.", image: "https://images.unsplash.com/photo-1493421419110-74f4e85ba126?w=800&q=80" },
    ],
  },

  // #22 Influencer Outreach
  {
    title: { en: "Influencer Marketing Outreach Kit", vi: "Bộ công cụ Influencer Marketing" },
    category: "marketing",
    tags: ["influencer", "outreach", "collaboration", "ugc", "partnership"],
    priceSKT: 40,
    sellerIdx: 10,
    description: {
      en: "Templates for influencer outreach, collaboration proposals, contract terms, content briefs, and performance tracking. Works for micro to macro influencers.",
      vi: "Template liên hệ influencer, đề xuất hợp tác, điều khoản hợp đồng, content brief, và theo dõi hiệu suất."
    },
    previewText: "Create an influencer outreach campaign for {{brand}} targeting {{niche}} creators...",
    coverImage: "https://images.unsplash.com/photo-1557838923-2985c318be48?w=800&q=80",
    models: ["gpt-4", "claude-4"],
    prompts: [
      {
        title: "Influencer Campaign Kit",
        content: "Create an influencer marketing campaign.\n\nBrand: {{brand}}\nProduct: {{product}}\nBudget: {{budget}}\nTarget niche: {{niche}}\n\nGenerate:\n1. Influencer criteria (followers, engagement rate, content style)\n2. Outreach DM templates (3 variants: casual, professional, mutual benefit)\n3. Outreach email (introduction + proposal)\n4. Content brief (deliverables, key messages, dos/don'ts, timeline)\n5. Collaboration tiers (gifted, paid, ambassador)\n6. Contract terms template\n7. Performance metrics and tracking sheet\n8. Follow-up sequence (3 touchpoints)",
        description: "Complete influencer campaign with outreach templates",
        variables: [
          { name: "brand", description: "Brand", defaultValue: "GlowSkin Beauty" },
          { name: "product", description: "Product", defaultValue: "new vitamin C serum ($45)" },
          { name: "budget", description: "Budget", defaultValue: "$3,000 for 10 creators" },
          { name: "niche", description: "Niche", defaultValue: "skincare & beauty micro-influencers (5K-50K followers)" },
        ],
      },
    ],
    examples: [
      { input: "Influencer campaign for GlowSkin vitamin C serum, $3K budget", output: "10-creator campaign with DM templates, email outreach, content brief, 3-tier pricing, contract template, and tracking metrics.", image: "https://images.unsplash.com/photo-1557838923-2985c318be48?w=800&q=80" },
    ],
  },

  // #23 SEO Audit & Strategy
  {
    title: { en: "SEO Audit & Strategy Generator", vi: "Bộ kiểm tra & chiến lược SEO" },
    category: "marketing",
    tags: ["seo", "audit", "keywords", "backlinks", "technical-seo"],
    priceSKT: 65,
    sellerIdx: 1,
    description: {
      en: "Comprehensive SEO audit framework: technical SEO checklist, keyword research methodology, content gap analysis, backlink strategy, and monthly reporting templates.",
      vi: "Framework kiểm tra SEO toàn diện: checklist SEO kỹ thuật, phương pháp nghiên cứu keyword, phân tích gap nội dung, chiến lược backlink."
    },
    previewText: "Perform an SEO audit for {{website}} in the {{industry}} niche...",
    coverImage: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&q=80",
    models: ["gpt-4", "claude-4"],
    prompts: [
      {
        title: "Full SEO Audit Report",
        content: "Generate an SEO audit report for {{website}}.\n\nIndustry: {{industry}}\nCompetitors: {{competitors}}\n\nSections:\n1. Technical SEO (Core Web Vitals, crawlability, indexation, schema markup, mobile, HTTPS)\n2. On-Page SEO (title tags, meta descriptions, heading structure, internal linking, content quality)\n3. Keyword Analysis (current rankings, opportunities, difficulty assessment, search intent mapping)\n4. Content Audit (thin content, duplicate, cannibalization, freshness)\n5. Backlink Profile (authority score, toxic links, competitor comparison, acquisition strategy)\n6. Local SEO (if applicable)\n7. Action Plan (prioritized: quick wins → medium effort → long-term)\n\nFormat as a professional report with scores.",
        description: "Complete SEO audit with prioritized action plan",
        variables: [
          { name: "website", description: "Website URL", defaultValue: "example-saas.com" },
          { name: "industry", description: "Industry", defaultValue: "project management software" },
          { name: "competitors", description: "Main competitors", defaultValue: "Asana, Monday, ClickUp" },
        ],
      },
    ],
    examples: [
      { input: "SEO audit for SaaS project management tool vs Asana, Monday", output: "Professional audit report with scores, keyword opportunities, content gaps, backlink comparison, and 30-item prioritized action plan.", image: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&q=80" },
    ],
  },

  // #24 Email Marketing Automation
  {
    title: { en: "Email Marketing Automation Flows", vi: "Luồng tự động Email Marketing" },
    category: "marketing",
    tags: ["email-automation", "mailchimp", "klaviyo", "flows", "lifecycle"],
    priceSKT: 55,
    sellerIdx: 1,
    description: {
      en: "Pre-built email automation flows: welcome, onboarding, abandoned cart, win-back, upsell, and anniversary. Ready to import into Klaviyo, Mailchimp, or any ESP.",
      vi: "Luồng email tự động sẵn: welcome, onboarding, abandoned cart, win-back, upsell. Sẵn sàng import vào Klaviyo, Mailchimp."
    },
    previewText: "Design an email automation flow for {{trigger}} targeting {{segment}}...",
    coverImage: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800&q=80",
    models: ["gpt-4", "claude-4"],
    prompts: [
      {
        title: "Lifecycle Email Flows (6 Flows)",
        content: "Design 6 lifecycle email automation flows.\n\nBusiness: {{business}}\nESP: {{esp}}\n\nFlows to create:\n1. Welcome Series (5 emails, 14 days)\n2. Onboarding (7 emails, 21 days)\n3. Abandoned Cart (3 emails, 3 days)\n4. Win-Back (4 emails, 90 days inactive)\n5. Upsell/Cross-sell (3 emails after purchase)\n6. Anniversary/Birthday (2 emails)\n\nFor each email: trigger condition, delay, subject line (A/B), body copy, CTA, segment filters, exit conditions.",
        description: "6 complete email automation flows",
        variables: [
          { name: "business", description: "Business type", defaultValue: "DTC skincare brand" },
          { name: "esp", description: "Email platform", defaultValue: "Klaviyo" },
        ],
      },
    ],
    examples: [
      { input: "6 lifecycle flows for DTC skincare brand on Klaviyo", output: "24 emails across 6 flows with trigger conditions, delays, A/B subjects, body copy, CTAs, and exit conditions.", image: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800&q=80" },
    ],
  },

  // #25 Conversion Rate Optimization
  {
    title: { en: "CRO & A/B Testing Playbook", vi: "Playbook CRO & A/B Testing" },
    category: "marketing",
    tags: ["cro", "ab-testing", "conversion", "ux", "optimization"],
    priceSKT: 0,
    isFree: true,
    sellerIdx: 10,
    description: {
      en: "Conversion rate optimization framework: hypothesis generation, A/B test design, landing page audits, and CTA optimization. Data-driven approach with statistical rigor.",
      vi: "Framework tối ưu tỷ lệ chuyển đổi: tạo giả thuyết, thiết kế A/B test, kiểm tra landing page, tối ưu CTA."
    },
    previewText: "Analyze {{page}} for conversion optimization opportunities...",
    coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    models: ["gpt-4", "claude-4", "gemini"],
    prompts: [
      {
        title: "Landing Page CRO Audit",
        content: "Perform a CRO audit on a landing page.\n\nPage: {{page}}\nCurrent conversion rate: {{rate}}\nTraffic: {{traffic}}/month\nGoal: {{goal}}\n\nAnalyze:\n1. Above-the-fold effectiveness\n2. Value proposition clarity\n3. Social proof placement\n4. CTA design and copy\n5. Form friction analysis\n6. Mobile experience\n7. Page speed impact\n8. Trust signals\n\nFor each issue: severity (high/med/low), hypothesis, proposed change, expected impact, A/B test design.\n\nPrioritize using ICE framework (Impact × Confidence × Ease).",
        description: "CRO audit with ICE-prioritized test plan",
        variables: [
          { name: "page", description: "Page type", defaultValue: "SaaS free trial signup page" },
          { name: "rate", description: "Current conversion rate", defaultValue: "2.3%" },
          { name: "traffic", description: "Monthly traffic", defaultValue: "15,000 visitors" },
          { name: "goal", description: "Target conversion rate", defaultValue: "4.5%" },
        ],
      },
    ],
    examples: [
      { input: "CRO audit for SaaS signup page with 2.3% conversion rate", output: "12 optimization opportunities with ICE scores, A/B test designs, expected lift calculations, and implementation timeline.", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80" },
    ],
  },

  /* ═══════════════════════════════════════════════════
   * DESIGN — 8 sets
   * ═══════════════════════════════════════════════════ */

  // #26 Midjourney Mastery
  {
    title: { en: "Midjourney V7 Prompt Mastery", vi: "Thành thạo Prompt Midjourney V7" },
    category: "design",
    tags: ["midjourney", "ai-art", "image-generation", "prompt-engineering", "digital-art"],
    priceSKT: 80,
    featured: true,
    sellerIdx: 7,
    description: {
      en: "Master Midjourney V7 with 50+ optimized prompt templates. Covers photorealism, concept art, product mockups, character design, architecture, and abstract art with detailed parameter guides.",
      vi: "Thành thạo Midjourney V7 với 50+ template prompt tối ưu. Bao gồm photorealism, concept art, product mockup, character design, kiến trúc."
    },
    previewText: "Create a Midjourney prompt for {{style}} {{subject}} with {{mood}} lighting...",
    coverImage: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=800&q=80",
    models: ["midjourney"],
    prompts: [
      {
        title: "Photorealistic Product Shot",
        content: "Generate a Midjourney prompt for a photorealistic product shot.\n\nProduct: {{product}}\nStyle: {{style}}\nBackground: {{background}}\nLighting: {{lighting}}\n\nPrompt formula:\n[subject description], [material/texture details], [lighting setup], [camera angle], [background], [mood/atmosphere], [technical parameters]\n\nGenerate 5 prompt variants with different angles and moods.\nInclude: --ar, --v, --s, --q parameters\nAlso: negative prompts, seed recommendations, multi-prompt technique.",
        description: "5 photorealistic product shot prompts with parameters",
        variables: [
          { name: "product", description: "Product", defaultValue: "premium wireless headphones" },
          { name: "style", description: "Photography style", defaultValue: "Apple-style minimalist" },
          { name: "background", description: "Background", defaultValue: "gradient studio backdrop" },
          { name: "lighting", description: "Lighting", defaultValue: "soft rim light with gradient fill" },
        ],
      },
      {
        title: "Fantasy Character Design",
        content: "Create Midjourney prompts for fantasy character design.\n\nCharacter: {{character}}\nSetting: {{setting}}\nArt style: {{artStyle}}\n\nGenerate:\n- Full body concept (front/back)\n- Portrait close-up\n- Action pose\n- Turnaround sheet\n- Armor/clothing detail\n\n5 prompts total with style modifiers, lighting, and composition instructions.",
        description: "Fantasy character design with multiple views",
        variables: [
          { name: "character", description: "Character", defaultValue: "elven ranger with enchanted bow" },
          { name: "setting", description: "Setting", defaultValue: "ancient mystical forest" },
          { name: "artStyle", description: "Art style", defaultValue: "Witcher 3 concept art meets Studio Ghibli" },
        ],
      },
    ],
    examples: [
      { input: "Product shot of premium headphones, Apple-style", output: "5 Midjourney prompts with different angles (hero, 45°, flat lay, macro, lifestyle), parameters --ar 1:1 --v 7 --s 250.", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80" },
      { input: "Fantasy elven ranger character design", output: "5 prompts for full body, portrait, action pose, turnaround sheet, and armor detail. Witcher 3 × Ghibli hybrid style.", image: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=800&q=80" },
    ],
  },

  // #27 DALL-E & Flux Prompts
  {
    title: { en: "DALL·E 3 & Flux Pro Prompt Pack", vi: "Bộ prompt DALL·E 3 & Flux Pro" },
    category: "design",
    tags: ["dall-e", "flux", "image-generation", "ai-art", "illustration"],
    priceSKT: 60,
    sellerIdx: 7,
    description: {
      en: "Optimized prompts for DALL·E 3 and Flux Pro. Covers illustrations, marketing visuals, icon sets, infographics, and social media graphics with style consistency.",
      vi: "Prompt tối ưu cho DALL·E 3 và Flux Pro. Bao gồm illustration, visual marketing, icon set, infographic, social media graphics."
    },
    previewText: "Generate a {{style}} illustration of {{subject}} for {{purpose}}...",
    coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
    models: ["dall-e-3", "flux"],
    prompts: [
      {
        title: "Brand Illustration Set",
        content: "Create consistent brand illustrations.\n\nBrand: {{brand}}\nStyle: {{style}}\nColor palette: {{colors}}\nUse case: {{useCase}}\n\nGenerate 8 prompt variants for:\n1. Hero illustration (landing page)\n2. Feature icons (4 icons)\n3. Empty state illustration\n4. Error/404 page\n5. Onboarding screens (3 steps)\n\nAll must maintain consistent style, color palette, and character design.\nInclude style anchors for consistency.",
        description: "Consistent brand illustration set with 8 prompts",
        variables: [
          { name: "brand", description: "Brand", defaultValue: "productivity SaaS app" },
          { name: "style", description: "Illustration style", defaultValue: "flat design with soft gradients, Notion-inspired" },
          { name: "colors", description: "Color palette", defaultValue: "#6366F1 (primary), #F59E0B (accent), #F3F4F6 (bg)" },
          { name: "useCase", description: "Use case", defaultValue: "web app UI illustrations" },
        ],
      },
    ],
    examples: [
      { input: "Brand illustrations for productivity SaaS, Notion-style", output: "8 consistent DALL·E/Flux prompts for hero, icons, empty states, and onboarding with maintained style anchors.", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80" },
    ],
  },

  // #28 UI/UX Design System
  {
    title: { en: "UI/UX Design System Prompts", vi: "Bộ prompt Design System UI/UX" },
    category: "design",
    tags: ["ui-design", "ux", "design-system", "figma", "components"],
    priceSKT: 70,
    sellerIdx: 3,
    description: {
      en: "Build a complete design system with AI: color palettes, typography scales, spacing systems, component specifications, and Figma variable suggestions.",
      vi: "Xây dựng design system hoàn chỉnh với AI: bảng màu, typography, spacing, component specs, và gợi ý Figma variables."
    },
    previewText: "Design a {{type}} design system for {{product}} with {{brand}} aesthetics...",
    coverImage: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",
    models: ["gpt-4", "claude-4"],
    prompts: [
      {
        title: "Design System Foundation",
        content: "Create a design system foundation for {{product}}.\n\nBrand personality: {{personality}}\nPlatform: {{platform}}\n\nGenerate:\n1. Color system (primary, secondary, neutral, semantic, surface tokens)\n2. Typography scale (font families, sizes, weights, line heights)\n3. Spacing system (4px/8px grid)\n4. Border radius tokens\n5. Shadow/elevation system\n6. Breakpoints\n7. Animation/motion tokens\n8. Icon style guidelines\n9. Component inventory (40+ components listed with states)\n10. Naming conventions\n\nOutput as design tokens (JSON) + documentation.",
        description: "Complete design system tokens and documentation",
        variables: [
          { name: "product", description: "Product", defaultValue: "fintech mobile banking app" },
          { name: "personality", description: "Brand personality", defaultValue: "trustworthy, modern, accessible" },
          { name: "platform", description: "Platform", defaultValue: "iOS + Android + Web" },
        ],
      },
    ],
    examples: [
      { input: "Design system for fintech mobile banking app", output: "Complete token set with 12 color scales, type scale, 8px grid spacing, elevation system, and 45 component inventory.", image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80" },
    ],
  },

  // #29 Logo & Brand Identity
  {
    title: { en: "Logo & Brand Identity Generator", vi: "Bộ tạo Logo & Nhận diện thương hiệu" },
    category: "design",
    tags: ["logo", "branding", "identity", "visual-identity", "brand-design"],
    priceSKT: 55,
    sellerIdx: 7,
    description: {
      en: "Generate logo concepts, brand color palettes, typography pairings, and visual identity guidelines with AI. Includes mood boards and brand application mockups.",
      vi: "Tạo concept logo, bảng màu thương hiệu, cặp font chữ, và hướng dẫn nhận diện thương hiệu với AI."
    },
    previewText: "Design a logo concept for {{brand}} in the {{industry}} industry...",
    coverImage: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&q=80",
    models: ["midjourney", "dall-e-3", "flux"],
    prompts: [
      {
        title: "Logo Concept Brief",
        content: "Generate logo concepts for {{brand}}.\n\nIndustry: {{industry}}\nStyle: {{style}}\nValues: {{values}}\n\nCreate 5 distinct concept directions:\n1. Wordmark (typography-focused)\n2. Symbol/icon + wordmark\n3. Monogram/lettermark\n4. Abstract mark\n5. Mascot/character (if appropriate)\n\nFor each: description, color suggestion, font pairing, Midjourney/DALL-E prompt, usage notes.\n\nAlso: Brand color palette (primary, secondary, accent, neutrals with hex codes), typography pairing (heading + body).",
        description: "5 logo concepts with color palettes and font pairings",
        variables: [
          { name: "brand", description: "Brand name", defaultValue: "Verdant" },
          { name: "industry", description: "Industry", defaultValue: "sustainable fashion" },
          { name: "style", description: "Design style", defaultValue: "modern, organic, premium" },
          { name: "values", description: "Brand values", defaultValue: "sustainability, craftsmanship, timelessness" },
        ],
      },
    ],
    examples: [
      { input: "Logo concepts for Verdant sustainable fashion brand", output: "5 logo directions with detailed descriptions, hex color palettes, Google Fonts pairings, and Midjourney prompts for each concept.", image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&q=80" },
    ],
  },

  // #30 Stable Diffusion Workflows
  {
    title: { en: "Stable Diffusion XL Workflow Pack", vi: "Bộ Workflow Stable Diffusion XL" },
    category: "design",
    tags: ["stable-diffusion", "comfyui", "controlnet", "ai-art", "workflow"],
    priceSKT: 85,
    sellerIdx: 7,
    description: {
      en: "Advanced Stable Diffusion XL prompts with ControlNet, LoRA, and ComfyUI workflow descriptions. Covers inpainting, outpainting, style transfer, and batch consistency.",
      vi: "Prompt Stable Diffusion XL nâng cao với ControlNet, LoRA, và mô tả workflow ComfyUI. Bao gồm inpainting, outpainting, style transfer."
    },
    previewText: "Create a Stable Diffusion workflow for {{task}} using {{technique}}...",
    coverImage: "https://images.unsplash.com/photo-1634017839464-5c339afa60f0?w=800&q=80",
    models: ["stable-diffusion", "flux"],
    prompts: [
      {
        title: "Product Photography Pipeline",
        content: "Create a Stable Diffusion pipeline for product photography.\n\nProduct: {{product}}\nScene: {{scene}}\n\nWorkflow steps:\n1. Base generation (prompt, negative prompt, sampler, steps, CFG)\n2. ControlNet pose (if applicable)\n3. Inpainting for refinement\n4. Upscale (4x with detail enhancement)\n5. Color correction prompt\n\nProvide: positive prompt, negative prompt, recommended checkpoint, LoRA suggestions, ComfyUI node setup description.",
        description: "End-to-end product photography pipeline",
        variables: [
          { name: "product", description: "Product", defaultValue: "artisan ceramic coffee mug" },
          { name: "scene", description: "Scene", defaultValue: "rustic kitchen countertop, morning light" },
        ],
      },
    ],
    examples: [
      { input: "Product photography pipeline for ceramic coffee mug", output: "Complete SD pipeline with base prompt, ControlNet depth, inpainting steps, 4x upscale settings, and ComfyUI node layout.", image: "https://images.unsplash.com/photo-1634017839464-5c339afa60f0?w=800&q=80" },
    ],
  },

  // #31 Social Media Graphics
  {
    title: { en: "Social Media Graphics Prompt Kit", vi: "Bộ prompt Đồ họa Social Media" },
    category: "design",
    tags: ["social-media", "graphics", "instagram", "templates", "canva"],
    priceSKT: 35,
    sellerIdx: 3,
    description: {
      en: "AI prompts for creating scroll-stopping social media graphics. Instagram posts, stories, carousels, TikTok thumbnails, YouTube banners, and LinkedIn headers.",
      vi: "Prompt AI tạo đồ họa social media. Instagram post, story, carousel, TikTok thumbnail, YouTube banner, LinkedIn header."
    },
    previewText: "Design a {{platform}} {{format}} graphic for {{purpose}}...",
    coverImage: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&q=80",
    models: ["midjourney", "dall-e-3", "flux"],
    prompts: [
      {
        title: "Instagram Carousel Template",
        content: "Create prompts for a {{slides}}-slide Instagram carousel.\n\nTopic: {{topic}}\nBrand colors: {{colors}}\nStyle: {{style}}\n\nFor each slide:\n- Visual description (AI image prompt)\n- Text overlay content\n- Layout description\n- Color treatment\n\nFirst slide: hook/attention grabber\nLast slide: CTA with follow/save prompt\nConsistent style across all slides.",
        description: "Instagram carousel with consistent visual style",
        variables: [
          { name: "topic", description: "Carousel topic", defaultValue: "5 Morning Habits of Successful CEOs" },
          { name: "slides", description: "Number of slides", defaultValue: "7" },
          { name: "colors", description: "Brand colors", defaultValue: "#1a1a2e, #e94560, #f5f5f5" },
          { name: "style", description: "Visual style", defaultValue: "dark modern, bold typography, gradient accents" },
        ],
      },
    ],
    examples: [
      { input: "7-slide carousel about CEO morning habits, dark modern style", output: "7 slide prompts with hook opener, consistent dark gradient style, bold text overlays, and CTA closer with save prompt.", image: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&q=80" },
    ],
  },

  // #32 Presentation Design
  {
    title: { en: "Presentation & Pitch Deck Design", vi: "Thiết kế Presentation & Pitch Deck" },
    category: "design",
    tags: ["presentation", "pitch-deck", "slides", "keynote", "powerpoint"],
    priceSKT: 45,
    sellerIdx: 3,
    description: {
      en: "Design stunning presentations and pitch decks with AI. Slide layouts, visual hierarchy, data visualization, speaker notes, and consistent design language.",
      vi: "Thiết kế presentation và pitch deck đẹp với AI. Layout slide, visual hierarchy, data visualization, speaker notes."
    },
    previewText: "Design a {{slides}}-slide {{type}} presentation about {{topic}}...",
    coverImage: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80",
    models: ["gpt-4", "claude-4"],
    prompts: [
      {
        title: "Investor Pitch Deck (15 Slides)",
        content: "Design a 15-slide investor pitch deck.\n\nCompany: {{company}}\nIndustry: {{industry}}\nStage: {{stage}}\nAsk: {{ask}}\n\nSlide structure:\n1. Title + tagline\n2. Problem\n3. Solution\n4. Market size (TAM/SAM/SOM)\n5. Product demo\n6. Business model\n7. Traction\n8. Competition\n9. Competitive advantage\n10. Go-to-market\n11. Team\n12. Financials\n13. Roadmap\n14. The Ask\n15. Contact\n\nFor each slide: headline, key points, visual suggestion, data visualization type, speaker notes (30 seconds).",
        description: "15-slide pitch deck with speaker notes",
        variables: [
          { name: "company", description: "Company", defaultValue: "TaskFlow AI" },
          { name: "industry", description: "Industry", defaultValue: "AI-powered project management" },
          { name: "stage", description: "Funding stage", defaultValue: "Series A" },
          { name: "ask", description: "Funding ask", defaultValue: "$5M at $25M valuation" },
        ],
      },
    ],
    examples: [
      { input: "Pitch deck for TaskFlow AI Series A, $5M ask", output: "15 slides with headlines, data points, chart types, visual direction, and 30-second speaker notes per slide.", image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80" },
    ],
  },

  // #33 3D & Architecture Visualization
  {
    title: { en: "3D & Architecture Visualization Prompts", vi: "Bộ prompt 3D & Kiến trúc" },
    category: "design",
    tags: ["3d", "architecture", "visualization", "interior-design", "rendering"],
    priceSKT: 75,
    sellerIdx: 7,
    description: {
      en: "AI prompts for architectural visualization, interior design renders, and 3D product mockups. Covers Midjourney, Stable Diffusion, and DALL-E with photorealistic results.",
      vi: "Prompt AI cho visualization kiến trúc, render thiết kế nội thất, và mockup sản phẩm 3D. Bao gồm Midjourney, SD, và DALL-E."
    },
    previewText: "Create a photorealistic render of {{space}} in {{style}} style...",
    coverImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    models: ["midjourney", "stable-diffusion", "dall-e-3"],
    prompts: [
      {
        title: "Interior Design Render",
        content: "Generate photorealistic interior design renders.\n\nSpace: {{space}}\nStyle: {{style}}\nBudget feel: {{budget}}\nLighting: {{lighting}}\n\nCreate 5 prompt variants:\n1. Wide-angle overview\n2. Detail vignette (furniture arrangement)\n3. Material/texture close-up\n4. Natural daylight version\n5. Evening/ambient lighting version\n\nEach prompt includes: camera specs (lens, height), material descriptions, prop styling, color temperature.",
        description: "5 interior design renders with varied angles and lighting",
        variables: [
          { name: "space", description: "Space type", defaultValue: "modern penthouse living room" },
          { name: "style", description: "Design style", defaultValue: "Japandi (Japanese + Scandinavian)" },
          { name: "budget", description: "Budget tier", defaultValue: "luxury ($500K+)" },
          { name: "lighting", description: "Lighting mood", defaultValue: "warm golden hour through floor-to-ceiling windows" },
        ],
      },
    ],
    examples: [
      { input: "Japandi penthouse living room, luxury, golden hour", output: "5 MJ prompts: wide-angle, detail vignette, material close-up, daylight, and evening ambient. Camera specs and material notes included.", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80" },
    ],
  },

  /* ═══════════════════════════════════════════════════
   * BUSINESS — 7 sets
   * ═══════════════════════════════════════════════════ */

  // #34 Business Plan Generator
  {
    title: { en: "Business Plan & Financial Model", vi: "Kế hoạch kinh doanh & Mô hình tài chính" },
    category: "business",
    tags: ["business-plan", "financial-model", "startup", "investor", "strategy"],
    priceSKT: 100,
    featured: true,
    sellerIdx: 4,
    description: {
      en: "Generate comprehensive business plans with financial projections, market analysis, competitive landscape, and operational strategy. Investor-ready format.",
      vi: "Tạo kế hoạch kinh doanh toàn diện với dự báo tài chính, phân tích thị trường, cạnh tranh, và chiến lược vận hành."
    },
    previewText: "Create a business plan for {{business}} targeting {{market}}...",
    coverImage: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
    models: ["gpt-4", "claude-4"],
    prompts: [
      {
        title: "Full Business Plan (30 Pages)",
        content: "Create a comprehensive business plan.\n\nBusiness: {{business}}\nMarket: {{market}}\nStage: {{stage}}\nFunding: {{funding}}\n\nSections:\n1. Executive Summary (1 page)\n2. Company Description\n3. Market Analysis (TAM/SAM/SOM, trends, target segments)\n4. Competitive Analysis (5 competitors, SWOT, positioning)\n5. Products/Services\n6. Marketing & Sales Strategy\n7. Operations Plan\n8. Management Team\n9. Financial Projections (3-year P&L, cash flow, break-even)\n10. Funding Requirements & Use of Funds\n11. Risk Analysis & Mitigation\n12. Appendix (key assumptions)\n\nFormat for investor presentation.",
        description: "30-page business plan with financial projections",
        variables: [
          { name: "business", description: "Business", defaultValue: "AI-powered personal finance app" },
          { name: "market", description: "Target market", defaultValue: "US millennials (25-40) with $50K-$150K income" },
          { name: "stage", description: "Stage", defaultValue: "pre-seed, MVP ready" },
          { name: "funding", description: "Funding target", defaultValue: "$500K pre-seed round" },
        ],
      },
    ],
    examples: [
      { input: "Business plan for AI finance app targeting US millennials", output: "30-page plan with TAM/SAM/SOM analysis, 5-competitor SWOT, 3-year financials, unit economics, and investor-ready formatting.", image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80" },
    ],
  },

  // #35 Product Management
  {
    title: { en: "Product Management AI Toolkit", vi: "Bộ công cụ AI Product Management" },
    category: "business",
    tags: ["product-management", "prd", "user-stories", "roadmap", "agile"],
    priceSKT: 75,
    sellerIdx: 11,
    description: {
      en: "AI-powered product management: PRDs, user stories, sprint planning, feature prioritization (RICE), roadmaps, and stakeholder update templates.",
      vi: "Quản lý sản phẩm AI: PRD, user stories, sprint planning, ưu tiên tính năng (RICE), roadmap, template cập nhật stakeholder."
    },
    previewText: "Write a PRD for {{feature}} in {{product}}...",
    coverImage: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&q=80",
    models: ["gpt-4", "claude-4"],
    prompts: [
      {
        title: "Product Requirements Document",
        content: "Write a PRD for a new feature.\n\nProduct: {{product}}\nFeature: {{feature}}\nGoal: {{goal}}\n\nSections:\n1. Problem Statement & Opportunity\n2. Goals & Success Metrics (OKRs)\n3. User Personas & Use Cases\n4. Requirements (must-have, should-have, nice-to-have)\n5. User Stories with acceptance criteria\n6. UX Wireframe descriptions\n7. Technical Considerations\n8. Dependencies & Risks\n9. Timeline & Milestones\n10. Launch Checklist\n\nFormat for engineering handoff.",
        description: "Complete PRD with user stories and acceptance criteria",
        variables: [
          { name: "product", description: "Product", defaultValue: "team collaboration platform" },
          { name: "feature", description: "Feature", defaultValue: "real-time collaborative whiteboard" },
          { name: "goal", description: "Business goal", defaultValue: "increase daily active usage by 30%" },
        ],
      },
    ],
    examples: [
      { input: "PRD for collaborative whiteboard in team platform", output: "Complete PRD with 3 personas, 12 user stories with acceptance criteria, wireframe descriptions, RICE scores, and launch checklist.", image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&q=80" },
    ],
  },

  // #36 Sales Playbook
  {
    title: { en: "B2B Sales Playbook & Scripts", vi: "Playbook & Scripts Bán hàng B2B" },
    category: "business",
    tags: ["sales", "b2b", "cold-outreach", "scripts", "objection-handling"],
    priceSKT: 65,
    sellerIdx: 4,
    description: {
      en: "B2B sales playbook: cold email sequences, call scripts, discovery questions, objection handling, proposal templates, and follow-up frameworks.",
      vi: "Playbook bán hàng B2B: chuỗi email cold, kịch bản gọi điện, câu hỏi discovery, xử lý phản đối, template đề xuất."
    },
    previewText: "Create a B2B sales playbook for {{product}} selling to {{buyer}}...",
    coverImage: "https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=800&q=80",
    models: ["gpt-4", "claude-4"],
    prompts: [
      {
        title: "Cold Outreach Sequence",
        content: "Create a B2B cold outreach sequence.\n\nProduct: {{product}}\nTarget buyer: {{buyer}}\nPrice point: {{price}}\nValue prop: {{value}}\n\nGenerate:\n1. LinkedIn connection request (3 variants)\n2. Cold email sequence (5 emails over 21 days)\n3. Cold call script with talk track\n4. Discovery call questions (15 questions, SPIN framework)\n5. Objection handling (10 common objections with responses)\n6. Follow-up after demo (3 emails)\n7. Proposal email template\n\nTone: professional, consultative, not pushy.",
        description: "Complete cold outreach with SPIN discovery and objection handling",
        variables: [
          { name: "product", description: "Product", defaultValue: "AI customer support automation platform" },
          { name: "buyer", description: "Target buyer", defaultValue: "VP of Customer Success at SaaS companies (100-1000 employees)" },
          { name: "price", description: "Price point", defaultValue: "$2,000-$10,000/month" },
          { name: "value", description: "Value prop", defaultValue: "reduce support tickets by 40% and response time by 80%" },
        ],
      },
    ],
    examples: [
      { input: "Cold outreach for AI support platform targeting VP CS", output: "5-email sequence, LinkedIn messages, cold call script, 15 SPIN questions, 10 objection rebuttals, and follow-up templates.", image: "https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=800&q=80" },
    ],
  },

  // #37 Consulting Frameworks
  {
    title: { en: "Consulting Framework Templates", vi: "Template Framework Tư vấn" },
    category: "business",
    tags: ["consulting", "strategy", "frameworks", "analysis", "mckinsey"],
    priceSKT: 80,
    sellerIdx: 4,
    description: {
      en: "Professional consulting frameworks: Porter's Five Forces, McKinsey 7S, Blue Ocean Strategy, BCG Matrix, Value Chain Analysis, and PESTEL with AI-powered analysis.",
      vi: "Framework tư vấn chuyên nghiệp: Porter's Five Forces, McKinsey 7S, Blue Ocean Strategy, BCG Matrix, Value Chain Analysis, PESTEL."
    },
    previewText: "Apply the {{framework}} framework to analyze {{company}} in {{industry}}...",
    coverImage: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",
    models: ["gpt-4", "claude-4"],
    prompts: [
      {
        title: "Strategic Analysis (Multi-Framework)",
        content: "Conduct a strategic analysis of {{company}} in {{industry}}.\n\nApply these frameworks:\n1. SWOT Analysis (detailed, with strategic implications)\n2. Porter's Five Forces (with threat level ratings)\n3. Value Chain Analysis (identify competitive advantages)\n4. PESTEL Analysis (macro environment scan)\n5. Competitive Positioning Map\n\nFor each:\n- Framework application with data-driven insights\n- Key findings (3-5 bullet points)\n- Strategic recommendations\n\nConclude with: Top 5 strategic priorities, implementation roadmap, risk assessment.",
        description: "Multi-framework strategic analysis with recommendations",
        variables: [
          { name: "company", description: "Company", defaultValue: "Spotify" },
          { name: "industry", description: "Industry", defaultValue: "music streaming / audio entertainment" },
        ],
      },
    ],
    examples: [
      { input: "Strategic analysis of Spotify in music streaming", output: "5-framework analysis with SWOT, Porter's (threat ratings), value chain, PESTEL, positioning map, and 5 prioritized recommendations.", image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80" },
    ],
  },

  // #38 Meeting & Communication
  {
    title: { en: "Professional Meeting & Communication Kit", vi: "Bộ công cụ Họp & Giao tiếp chuyên nghiệp" },
    category: "business",
    tags: ["meetings", "communication", "agenda", "minutes", "stakeholder"],
    priceSKT: 30,
    sellerIdx: 11,
    description: {
      en: "Templates for meeting agendas, minutes, status reports, stakeholder updates, executive summaries, and team retrospectives. Save hours on business communication.",
      vi: "Template cho agenda họp, biên bản, báo cáo tiến độ, cập nhật stakeholder, tóm tắt cho lãnh đạo, và retrospective nhóm."
    },
    previewText: "Create a {{documentType}} for {{purpose}}...",
    coverImage: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80",
    models: ["gpt-4", "claude-4", "gemini", "llama"],
    prompts: [
      {
        title: "Executive Status Report",
        content: "Create an executive status report.\n\nProject: {{project}}\nPeriod: {{period}}\nAudience: {{audience}}\n\nSections:\n- Executive Summary (3 sentences, traffic light status)\n- Key Accomplishments (bullet points with impact)\n- Metrics Dashboard (table format)\n- Risks & Issues (severity, owner, mitigation)\n- Upcoming Milestones (next 2 weeks)\n- Resource Needs / Decisions Required\n- Budget Status (planned vs actual)\n\nTone: concise, data-driven, action-oriented. Max 2 pages.",
        description: "Executive status report with traffic light system",
        variables: [
          { name: "project", description: "Project", defaultValue: "Platform Migration to AWS" },
          { name: "period", description: "Reporting period", defaultValue: "Sprint 14 (May 1-14, 2025)" },
          { name: "audience", description: "Audience", defaultValue: "CTO and VP Engineering" },
        ],
      },
    ],
    examples: [
      { input: "Status report for AWS migration, Sprint 14", output: "2-page executive report with green/amber/red status, 5 accomplishments, metrics table, 3 risks with mitigation, and 4 upcoming milestones.", image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80" },
    ],
  },

  // #39 Legal Document Templates
  {
    title: { en: "Legal Document Templates for Startups", vi: "Template tài liệu pháp lý cho Startup" },
    category: "business",
    tags: ["legal", "contracts", "terms-of-service", "privacy-policy", "startup"],
    priceSKT: 70,
    sellerIdx: 4,
    description: {
      en: "Essential legal document templates: Terms of Service, Privacy Policy, NDA, freelancer contracts, SaaS agreements, and GDPR compliance checklists. Not legal advice — consult a lawyer.",
      vi: "Template tài liệu pháp lý thiết yếu: ToS, Privacy Policy, NDA, hợp đồng freelancer, SaaS agreement, GDPR. Không phải tư vấn pháp lý."
    },
    previewText: "Generate a {{documentType}} for {{business}} operating in {{jurisdiction}}...",
    coverImage: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80",
    models: ["gpt-4", "claude-4"],
    prompts: [
      {
        title: "SaaS Terms of Service",
        content: "Draft a Terms of Service for a SaaS product.\n\nProduct: {{product}}\nBusiness: {{business}}\nJurisdiction: {{jurisdiction}}\n\nCover:\n1. Acceptance of terms\n2. Service description and scope\n3. User accounts and responsibilities\n4. Subscription and billing\n5. Intellectual property\n6. Data handling (link to privacy policy)\n7. Acceptable use policy\n8. Limitation of liability\n9. Indemnification\n10. Termination\n11. Dispute resolution\n12. Changes to terms\n\nDisclaimer: This is a template. Have a lawyer review before use.\n\nPlain English, not legalese. User-friendly formatting.",
        description: "SaaS ToS template in plain English",
        variables: [
          { name: "product", description: "Product", defaultValue: "cloud-based project management tool" },
          { name: "business", description: "Business name", defaultValue: "TaskFlow Inc." },
          { name: "jurisdiction", description: "Legal jurisdiction", defaultValue: "Delaware, USA" },
        ],
      },
    ],
    examples: [
      { input: "Terms of Service for TaskFlow project management SaaS", output: "12-section ToS in plain English covering accounts, billing, IP, liability, and dispute resolution. Delaware jurisdiction.", image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80" },
    ],
  },

  // #40 Financial Analysis
  {
    title: { en: "Financial Analysis & Modeling Prompts", vi: "Bộ prompt Phân tích & Mô hình Tài chính" },
    category: "business",
    tags: ["finance", "financial-modeling", "excel", "valuation", "forecasting"],
    priceSKT: 90,
    sellerIdx: 6,
    description: {
      en: "Financial modeling prompts: DCF valuation, revenue forecasting, unit economics, cap table modeling, and financial statement analysis with Excel/Sheets formulas.",
      vi: "Prompt mô hình tài chính: định giá DCF, dự báo doanh thu, unit economics, cap table, phân tích báo cáo tài chính."
    },
    previewText: "Build a {{modelType}} financial model for {{business}}...",
    coverImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
    models: ["gpt-4", "claude-4"],
    prompts: [
      {
        title: "SaaS Financial Model",
        content: "Build a 3-year SaaS financial model.\n\nCompany: {{company}}\nCurrent ARR: {{arr}}\nGrowth rate: {{growth}}\n\nGenerate:\n1. Revenue model (MRR breakdown, churn, expansion)\n2. Unit economics (CAC, LTV, LTV:CAC ratio, payback period)\n3. P&L forecast (revenue, COGS, gross margin, opex, EBITDA)\n4. Cash flow statement\n5. Headcount plan\n6. Key metrics dashboard (Rule of 40, Magic Number, NDR)\n7. Scenario analysis (base, bull, bear)\n8. Excel/Sheets formulas for each calculation\n\nFormat as a model walkthrough with formulas.",
        description: "3-year SaaS financial model with scenarios",
        variables: [
          { name: "company", description: "Company", defaultValue: "B2B SaaS analytics platform" },
          { name: "arr", description: "Current ARR", defaultValue: "$2M" },
          { name: "growth", description: "Annual growth rate", defaultValue: "100% YoY" },
        ],
      },
    ],
    examples: [
      { input: "3-year SaaS model for $2M ARR analytics platform", output: "Full financial model with MRR waterfall, unit economics, 3-year P&L, cash flow, headcount plan, and 3 scenarios with Excel formulas.", image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80" },
    ],
  },

  /* ═══════════════════════════════════════════════════
   * EDUCATION — 6 sets
   * ═══════════════════════════════════════════════════ */

  // #41 Course Creator
  {
    title: { en: "Online Course Creator Toolkit", vi: "Bộ công cụ tạo khóa học Online" },
    category: "education",
    tags: ["course-creation", "e-learning", "curriculum", "udemy", "teachable"],
    priceSKT: 65,
    featured: true,
    sellerIdx: 8,
    description: {
      en: "Create complete online courses with AI: curriculum design, lesson scripts, quizzes, assignments, student engagement strategies, and marketing copy for Udemy/Teachable.",
      vi: "Tạo khóa học online hoàn chỉnh với AI: thiết kế chương trình, kịch bản bài giảng, quiz, bài tập, chiến lược engagement."
    },
    previewText: "Design an online course about {{topic}} for {{audience}} with {{duration}} hours of content...",
    coverImage: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&q=80",
    models: ["gpt-4", "claude-4", "gemini"],
    prompts: [
      {
        title: "Full Course Curriculum",
        content: "Design a complete online course.\n\nTopic: {{topic}}\nAudience: {{audience}}\nLevel: {{level}}\nDuration: {{duration}} hours\n\nGenerate:\n1. Course title and subtitle (SEO optimized)\n2. Learning outcomes (5-7, Bloom's taxonomy)\n3. Module breakdown (6-10 modules)\n4. Lesson plan per module (3-5 lessons each)\n5. For each lesson: title, duration, format (video/text/exercise), key points, script outline\n6. Quizzes per module (5 questions, varied types)\n7. Final project brief\n8. Resource list\n9. Course description for marketplace listing\n10. Promotional email sequence (3 emails)",
        description: "Complete course curriculum with lesson plans and quizzes",
        variables: [
          { name: "topic", description: "Course topic", defaultValue: "Prompt Engineering Masterclass" },
          { name: "audience", description: "Target audience", defaultValue: "marketers and content creators with no coding background" },
          { name: "level", description: "Difficulty level", defaultValue: "beginner to intermediate" },
          { name: "duration", description: "Total duration", defaultValue: "8" },
        ],
      },
    ],
    examples: [
      { input: "Prompt Engineering course for marketers, 8 hours", output: "8-module curriculum with 32 lessons, 40 quiz questions, final project, marketplace listing copy, and promotional emails.", image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&q=80" },
    ],
  },

  // #42 Study Guide Generator
  {
    title: { en: "AI Study Guide & Flashcard Generator", vi: "Bộ tạo Study Guide & Flashcard AI" },
    category: "education",
    tags: ["study-guide", "flashcards", "exam-prep", "learning", "memorization"],
    priceSKT: 0,
    isFree: true,
    sellerIdx: 8,
    description: {
      en: "Generate study guides, flashcard sets, practice questions, and spaced repetition schedules for any subject. Perfect for exam prep and self-study.",
      vi: "Tạo study guide, flashcard, câu hỏi luyện tập, và lịch ôn tập spaced repetition cho mọi môn. Hoàn hảo cho ôn thi."
    },
    previewText: "Create a study guide for {{subject}} covering {{topics}}...",
    coverImage: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80",
    models: ["gpt-4", "claude-4", "gemini", "llama"],
    prompts: [
      {
        title: "Comprehensive Study Package",
        content: "Create a study package for {{subject}}.\n\nTopics: {{topics}}\nExam type: {{examType}}\nStudy time: {{studyTime}}\n\nGenerate:\n1. Topic summary (1 page per topic, key concepts highlighted)\n2. Flashcard set (30 cards, question → answer format)\n3. Practice questions (20 questions: 10 multiple choice, 5 short answer, 5 essay)\n4. Mnemonics and memory aids\n5. Concept maps (text description of relationships)\n6. Study schedule (spaced repetition over {{studyTime}})\n7. Common mistakes to avoid\n8. Quick reference cheat sheet (1 page)",
        description: "Complete study package with flashcards and practice questions",
        variables: [
          { name: "subject", description: "Subject", defaultValue: "Computer Science - Data Structures & Algorithms" },
          { name: "topics", description: "Topics to cover", defaultValue: "arrays, linked lists, trees, graphs, sorting, dynamic programming, Big O" },
          { name: "examType", description: "Exam type", defaultValue: "university final exam" },
          { name: "studyTime", description: "Study time available", defaultValue: "2 weeks" },
        ],
      },
    ],
    examples: [
      { input: "Study package for DS&A final exam, 2 weeks prep", output: "7-topic summaries, 30 flashcards, 20 practice questions, mnemonics, concept maps, 14-day spaced repetition schedule, and cheat sheet.", image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80" },
    ],
  },

  // #43 Language Learning
  {
    title: { en: "Language Learning Prompt System", vi: "Hệ thống prompt Học ngôn ngữ" },
    category: "education",
    tags: ["language-learning", "conversation", "grammar", "vocabulary", "immersion"],
    priceSKT: 40,
    sellerIdx: 8,
    description: {
      en: "Learn any language with AI: conversation practice, grammar drills, vocabulary building, cultural context, and immersive scenario roleplay.",
      vi: "Học ngôn ngữ với AI: luyện hội thoại, bài tập ngữ pháp, xây dựng từ vựng, bối cảnh văn hóa, và roleplay immersive."
    },
    previewText: "Create a {{language}} learning session focused on {{skill}} at {{level}} level...",
    coverImage: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&q=80",
    models: ["gpt-4", "claude-4", "gemini"],
    prompts: [
      {
        title: "Immersive Conversation Practice",
        content: "Create a conversation practice session.\n\nLanguage: {{language}}\nLevel: {{level}}\nScenario: {{scenario}}\n\nGenerate:\n1. Vocabulary list (15 words/phrases for the scenario with pronunciation guide)\n2. Grammar focus (1-2 patterns used in context)\n3. Roleplay script (10 exchange dialogue with corrections)\n4. Cultural notes (3 etiquette tips)\n5. Practice exercises (fill-in-blank, translation, response writing)\n6. Listening comprehension questions\n7. Homework: write a 100-word paragraph using new vocabulary",
        description: "Immersive conversation with vocabulary and cultural notes",
        variables: [
          { name: "language", description: "Target language", defaultValue: "Japanese" },
          { name: "level", description: "Proficiency level", defaultValue: "intermediate (N3)" },
          { name: "scenario", description: "Conversation scenario", defaultValue: "ordering at an izakaya and asking about menu recommendations" },
        ],
      },
    ],
    examples: [
      { input: "Japanese N3 conversation practice at an izakaya", output: "15 vocabulary items, polite speech patterns, 10-exchange roleplay, 3 cultural tips, exercises, and writing homework.", image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&q=80" },
    ],
  },

  // #44 Lesson Plan Generator
  {
    title: { en: "Teacher's AI Lesson Plan Generator", vi: "Bộ tạo Giáo án AI cho Giáo viên" },
    category: "education",
    tags: ["lesson-plan", "teaching", "k12", "curriculum", "pedagogy"],
    priceSKT: 45,
    sellerIdx: 8,
    description: {
      en: "Generate standards-aligned lesson plans for K-12 and higher education. Includes differentiated activities, assessments, rubrics, and parent communication templates.",
      vi: "Tạo giáo án theo chuẩn cho K-12 và đại học. Bao gồm hoạt động phân hóa, đánh giá, rubric, và template giao tiếp phụ huynh."
    },
    previewText: "Create a lesson plan for {{subject}} grade {{grade}} on {{topic}}...",
    coverImage: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
    models: ["gpt-4", "claude-4"],
    prompts: [
      {
        title: "Standards-Aligned Lesson Plan",
        content: "Create a detailed lesson plan.\n\nSubject: {{subject}}\nGrade: {{grade}}\nTopic: {{topic}}\nDuration: {{duration}} minutes\nStandards: {{standards}}\n\nGenerate:\n1. Learning objectives (Bloom's taxonomy verbs)\n2. Prior knowledge check (5 questions)\n3. Warm-up activity (5 min)\n4. Direct instruction outline\n5. Guided practice activity\n6. Independent practice with differentiation (3 tiers: below, on, above grade level)\n7. Assessment (formative + summative options)\n8. Rubric (4-point scale)\n9. Materials list\n10. Homework extension\n11. Accommodation notes (ELL, IEP)",
        description: "Differentiated lesson plan with assessments and rubrics",
        variables: [
          { name: "subject", description: "Subject", defaultValue: "Mathematics" },
          { name: "grade", description: "Grade level", defaultValue: "7th grade" },
          { name: "topic", description: "Topic", defaultValue: "introduction to linear equations" },
          { name: "duration", description: "Class duration", defaultValue: "50" },
          { name: "standards", description: "Standards", defaultValue: "Common Core 7.EE.1, 7.EE.4a" },
        ],
      },
    ],
    examples: [
      { input: "7th grade math lesson on linear equations, 50 minutes", output: "Complete lesson plan with objectives, warm-up, 3-tier differentiated activities, formative assessment, 4-point rubric, and ELL accommodations.", image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80" },
    ],
  },

  // #45 Research Paper Assistant
  {
    title: { en: "Research Methodology Assistant", vi: "Trợ lý Phương pháp Nghiên cứu" },
    category: "education",
    tags: ["research", "methodology", "thesis", "data-analysis", "academic"],
    priceSKT: 55,
    sellerIdx: 8,
    description: {
      en: "Research methodology guidance: study design, sampling strategies, data collection instruments, statistical analysis plans, and results interpretation.",
      vi: "Hướng dẫn phương pháp nghiên cứu: thiết kế nghiên cứu, chiến lược lấy mẫu, công cụ thu thập dữ liệu, kế hoạch phân tích thống kê."
    },
    previewText: "Design a research methodology for studying {{topic}} using {{approach}}...",
    coverImage: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80",
    models: ["gpt-4", "claude-4"],
    prompts: [
      {
        title: "Research Design & Methodology",
        content: "Design a research methodology.\n\nResearch question: {{question}}\nField: {{field}}\nApproach: {{approach}}\n\nGenerate:\n1. Research design (explain and justify)\n2. Hypothesis / propositions\n3. Population and sampling (method, size calculation, criteria)\n4. Data collection (instruments, procedure, timeline)\n5. Variables (independent, dependent, control)\n6. Data analysis plan (statistical tests, software)\n7. Validity and reliability measures\n8. Ethical considerations (IRB points)\n9. Limitations and delimitations\n10. Timeline (Gantt chart description)\n\nFormat for thesis chapter 3.",
        description: "Complete research methodology chapter",
        variables: [
          { name: "question", description: "Research question", defaultValue: "How does AI-assisted learning affect student engagement in online courses?" },
          { name: "field", description: "Field", defaultValue: "educational technology" },
          { name: "approach", description: "Research approach", defaultValue: "mixed methods (quantitative + qualitative)" },
        ],
      },
    ],
    examples: [
      { input: "Research methodology for AI learning impact study, mixed methods", output: "Complete methodology chapter with quasi-experimental design, 200-student sample, survey + interview instruments, ANOVA + thematic analysis, and IRB considerations.", image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80" },
    ],
  },

  // #46 Workshop Facilitator
  {
    title: { en: "Workshop & Training Facilitator Kit", vi: "Bộ công cụ Tổ chức Workshop" },
    category: "education",
    tags: ["workshop", "training", "facilitation", "team-building", "interactive"],
    priceSKT: 50,
    sellerIdx: 8,
    description: {
      en: "Design and facilitate engaging workshops: icebreakers, group activities, discussion frameworks, feedback collection, and post-workshop action plans.",
      vi: "Thiết kế và tổ chức workshop hấp dẫn: icebreaker, hoạt động nhóm, framework thảo luận, thu thập feedback."
    },
    previewText: "Design a {{duration}}-hour workshop on {{topic}} for {{audience}}...",
    coverImage: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",
    models: ["gpt-4", "claude-4"],
    prompts: [
      {
        title: "Half-Day Workshop Design",
        content: "Design a {{duration}}-hour workshop.\n\nTopic: {{topic}}\nAudience: {{audience}}\nGroup size: {{groupSize}}\nFormat: {{format}}\n\nGenerate:\n1. Workshop overview and objectives\n2. Pre-workshop preparation (participants + facilitator)\n3. Detailed agenda with timing\n4. Icebreaker activity (10 min)\n5. Core activities (3-4, mix of individual/group)\n6. Discussion prompts for each activity\n7. Break schedule\n8. Wrap-up and reflection exercise\n9. Feedback survey (10 questions)\n10. Follow-up email template\n11. Materials/supplies checklist\n12. Facilitator tips and contingency plans",
        description: "Complete workshop design with activities and materials",
        variables: [
          { name: "topic", description: "Workshop topic", defaultValue: "Design Thinking for Product Teams" },
          { name: "audience", description: "Audience", defaultValue: "product managers and engineers (mixed levels)" },
          { name: "duration", description: "Duration (hours)", defaultValue: "4" },
          { name: "groupSize", description: "Group size", defaultValue: "20-30 people" },
          { name: "format", description: "Format", defaultValue: "in-person with Miro for digital collaboration" },
        ],
      },
    ],
    examples: [
      { input: "4-hour Design Thinking workshop for 25 product/eng team members", output: "Detailed agenda with empathy mapping, ideation, prototyping activities, Miro templates, facilitator tips, and follow-up plan.", image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80" },
    ],
  },

  /* ═══════════════════════════════════════════════════
   * OTHER — 4 sets
   * ═══════════════════════════════════════════════════ */

  // #47 AI Chatbot Personalities
  {
    title: { en: "AI Chatbot Personality Designer", vi: "Thiết kế tính cách AI Chatbot" },
    category: "other",
    tags: ["chatbot", "ai-persona", "system-prompt", "character", "roleplay"],
    priceSKT: 55,
    sellerIdx: 0,
    description: {
      en: "Design unique AI chatbot personalities with detailed system prompts. Covers customer support bots, virtual assistants, educational tutors, and creative companions.",
      vi: "Thiết kế tính cách AI chatbot độc đáo với system prompt chi tiết. Bao gồm bot hỗ trợ khách hàng, trợ lý ảo, gia sư, và bạn sáng tạo."
    },
    previewText: "Design an AI chatbot personality for {{useCase}} with {{personality}} traits...",
    coverImage: "https://images.unsplash.com/photo-1531746790095-e5d2aaf7c6de?w=800&q=80",
    models: ["gpt-4", "claude-4", "gemini", "llama", "mistral"],
    prompts: [
      {
        title: "Custom AI Persona System Prompt",
        content: "Design a complete AI chatbot persona.\n\nUse case: {{useCase}}\nPersonality: {{personality}}\nTone: {{tone}}\nAudience: {{audience}}\n\nGenerate:\n1. System prompt (detailed, 500+ words)\n   - Role and identity\n   - Personality traits and quirks\n   - Communication style and vocabulary\n   - Knowledge boundaries\n   - Response format guidelines\n   - Error handling behavior\n   - Escalation triggers\n2. Sample conversations (5 scenarios)\n3. Edge case handling (3 scenarios)\n4. Do's and Don'ts list\n5. Personality consistency checklist",
        description: "Complete AI persona with system prompt and sample conversations",
        variables: [
          { name: "useCase", description: "Use case", defaultValue: "e-commerce customer support for a luxury fashion brand" },
          { name: "personality", description: "Personality", defaultValue: "warm, knowledgeable, slightly formal, fashion-savvy" },
          { name: "tone", description: "Tone", defaultValue: "sophisticated but approachable" },
          { name: "audience", description: "Audience", defaultValue: "affluent shoppers aged 25-55" },
        ],
      },
    ],
    examples: [
      { input: "Luxury fashion support bot, warm and sophisticated tone", output: "500-word system prompt, 5 conversation scenarios (order tracking, size guide, returns, styling advice, complaint), and edge case handling.", image: "https://images.unsplash.com/photo-1531746790095-e5d2aaf7c6de?w=800&q=80" },
    ],
  },

  // #48 Automation & No-Code
  {
    title: { en: "Automation & No-Code Workflow Builder", vi: "Bộ xây dựng Automation & No-Code" },
    category: "other",
    tags: ["automation", "no-code", "zapier", "make", "n8n", "workflow"],
    priceSKT: 45,
    sellerIdx: 0,
    description: {
      en: "Design automation workflows for Zapier, Make (Integromat), and n8n. Covers CRM automations, data sync, notification systems, and multi-step business processes.",
      vi: "Thiết kế workflow tự động cho Zapier, Make (Integromat), và n8n. Bao gồm CRM automation, đồng bộ dữ liệu, hệ thống thông báo."
    },
    previewText: "Design a {{platform}} automation for {{process}} connecting {{tools}}...",
    coverImage: "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=800&q=80",
    models: ["gpt-4", "claude-4"],
    prompts: [
      {
        title: "Business Process Automation",
        content: "Design an automation workflow.\n\nProcess: {{process}}\nPlatform: {{platform}}\nTools: {{tools}}\n\nGenerate:\n1. Process map (current state vs automated)\n2. Trigger event and conditions\n3. Step-by-step workflow (each action detailed)\n4. Data mapping between tools\n5. Error handling and retry logic\n6. Notification/alert setup\n7. Testing checklist\n8. Estimated time savings\n\nInclude: setup instructions, common pitfalls, and maintenance schedule.",
        description: "End-to-end business process automation design",
        variables: [
          { name: "process", description: "Business process", defaultValue: "new customer onboarding (form → CRM → welcome email → Slack → task assignment)" },
          { name: "platform", description: "Automation platform", defaultValue: "Zapier" },
          { name: "tools", description: "Tools to connect", defaultValue: "Typeform, HubSpot, Gmail, Slack, Asana" },
        ],
      },
    ],
    examples: [
      { input: "Customer onboarding automation connecting Typeform→HubSpot→Gmail→Slack→Asana", output: "5-step Zapier workflow with trigger conditions, data mapping, error handling, Slack notifications, and 8-hour/week time savings estimate.", image: "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=800&q=80" },
    ],
  },

  // #49 Personal Productivity
  {
    title: { en: "Personal Productivity & Life OS Prompts", vi: "Bộ prompt Năng suất & Life OS" },
    category: "other",
    tags: ["productivity", "notion", "obsidian", "life-os", "habits", "planning"],
    priceSKT: 0,
    isFree: true,
    sellerIdx: 11,
    description: {
      en: "Build your personal operating system with AI: weekly reviews, goal setting, habit tracking, decision frameworks, and Notion/Obsidian template designs.",
      vi: "Xây dựng hệ thống cá nhân với AI: review tuần, đặt mục tiêu, theo dõi thói quen, framework quyết định, template Notion/Obsidian."
    },
    previewText: "Design a {{system}} for managing {{area}} in {{tool}}...",
    coverImage: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&q=80",
    models: ["gpt-4", "claude-4", "gemini", "llama"],
    prompts: [
      {
        title: "Weekly Review & Planning System",
        content: "Design a weekly review and planning system.\n\nTool: {{tool}}\nLifestyle: {{lifestyle}}\nGoals: {{goals}}\n\nGenerate:\n1. Weekly review template (30-min checklist)\n   - Wins and learnings\n   - Goal progress check\n   - Energy audit (what drained/energized)\n   - Relationship check-in\n   - Financial snapshot\n2. Weekly planning template\n   - Top 3 priorities\n   - Time blocks (focus, admin, creative, rest)\n   - Meal/exercise planning\n   - Social commitments\n3. Monthly review template\n4. Quarterly goal-setting framework (OKRs lite)\n5. Daily journaling prompts (5 questions)\n\nMake it sustainable — 30 min/week max.",
        description: "Weekly review, monthly review, and daily journaling system",
        variables: [
          { name: "tool", description: "Productivity tool", defaultValue: "Notion" },
          { name: "lifestyle", description: "Lifestyle", defaultValue: "busy professional with side projects" },
          { name: "goals", description: "Current goals", defaultValue: "health, career growth, learning, financial independence" },
        ],
      },
    ],
    examples: [
      { input: "Weekly review system in Notion for busy professional", output: "Complete Notion template with weekly review checklist, planning page, monthly review, quarterly OKRs, and 5 daily journaling prompts.", image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&q=80" },
    ],
  },

  // #50 AI Video & Sora Prompts
  {
    title: { en: "AI Video Generation Prompt Pack (Sora/Runway)", vi: "Bộ prompt tạo Video AI (Sora/Runway)" },
    category: "other",
    tags: ["video", "sora", "runway", "pika", "ai-video", "motion"],
    priceSKT: 95,
    featured: true,
    sellerIdx: 9,
    description: {
      en: "Professional AI video generation prompts for Sora, Runway Gen-3, and Pika. Covers cinematic shots, product demos, social media clips, music videos, and animated explainers.",
      vi: "Prompt tạo video AI chuyên nghiệp cho Sora, Runway Gen-3, và Pika. Bao gồm cinematic shots, product demo, social media clips, music video."
    },
    previewText: "Create a {{style}} video prompt for {{subject}} using {{platform}}...",
    coverImage: "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&q=80",
    models: ["other"],
    prompts: [
      {
        title: "Cinematic Video Prompt",
        content: "Generate AI video prompts for cinematic content.\n\nSubject: {{subject}}\nStyle: {{style}}\nPlatform: {{platform}}\nDuration: {{duration}} seconds\n\nCreate 5 video prompt variants:\n1. Establishing shot (wide, atmospheric)\n2. Character/product hero shot (medium)\n3. Detail/macro shot (close-up)\n4. Dynamic movement shot (tracking/drone)\n5. Emotional close (slow motion)\n\nFor each:\n- Detailed scene description\n- Camera movement (pan, dolly, crane, static)\n- Lighting (direction, quality, color temp)\n- Mood/atmosphere\n- Color grading reference\n- Sound design suggestion\n- Platform-specific parameters",
        description: "5 cinematic video prompts with camera and lighting direction",
        variables: [
          { name: "subject", description: "Subject", defaultValue: "luxury watch product showcase" },
          { name: "style", description: "Visual style", defaultValue: "high-end commercial, Rolex/Omega aesthetic" },
          { name: "platform", description: "AI video platform", defaultValue: "Sora" },
          { name: "duration", description: "Duration per clip", defaultValue: "10" },
        ],
      },
      {
        title: "Social Media Video Pack",
        content: "Generate video prompts for social media content.\n\nBrand: {{brand}}\nProduct: {{product}}\nPlatform: {{socialPlatform}}\n\nCreate video prompts for:\n1. Product reveal (unboxing style)\n2. Before/after transformation\n3. Tutorial/how-to (3 steps)\n4. Testimonial/reaction style\n5. Trending format adaptation\n\nEach prompt: scene description, aspect ratio, text overlay timing, music mood, CTA end card.",
        description: "5 social media video prompts with format specs",
        variables: [
          { name: "brand", description: "Brand", defaultValue: "skincare brand" },
          { name: "product", description: "Product", defaultValue: "anti-aging serum" },
          { name: "socialPlatform", description: "Social platform", defaultValue: "TikTok + Instagram Reels" },
        ],
      },
    ],
    examples: [
      { input: "Luxury watch product showcase, Sora, cinematic style", output: "5 video prompts: establishing cityscape, hero macro on dial, detail on movement, tracking shot on wrist, slow-mo reveal. Full camera/lighting specs.", image: "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&q=80" },
      { input: "TikTok video prompts for skincare brand", output: "5 social video concepts: unboxing ASMR, before/after 30-day, 3-step routine, reaction duet, trending format. Each with aspect ratio and music mood.", image: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800&q=80" },
    ],
  },
];

/* ═══════════════════════════════════════════════════
 * REVIEW TEMPLATES
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
  { rating: 5, comment: "Professional grade prompts. Can tell these were made by someone who actually uses AI daily." },
  { rating: 4, comment: "Great value for the price. The examples are really helpful." },
  { rating: 5, comment: "Finally, prompts that actually deliver on the preview. No bait and switch here." },
  { rating: 3, comment: "Decent prompts but some are very similar to what's available free online." },
  { rating: 5, comment: "The free ones are just as good as paid — seller clearly cares about community." },
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
    const s = slugify(p.title.en) + "-" + code();
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
      purchaseCount: rand(10, 500),
      promptCount: p.prompts.length,
      totalEarned: 0,
      sortOrder: 0,
      averageRating: 0,
      reviewCount: 0,
      viewCount: rand(100, 10000),
      wishlistCount: rand(5, 120),
      models: p.models,
      examples: p.examples,
    });
  }

  const createdPromptSets = await PromptSet.insertMany(promptSets);
  console.log(`📦 Created ${createdPromptSets.length} prompt sets`);

  // ── Create reviews ──
  let reviewCount = 0;
  for (const ps of createdPromptSets) {
    // 75% chance of having reviews
    if (Math.random() > 0.75) continue;

    const numReviews = rand(3, 8);
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
    const numWishlisters = rand(0, 5);
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
    const numFollowers = rand(1, 6);
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

  console.log("\n✅ Seed v3 complete!");
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
