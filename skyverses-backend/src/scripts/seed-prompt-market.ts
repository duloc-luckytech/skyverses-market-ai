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
 * SEED USERS — 10 fake sellers, type: "seed"
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
 * SEED PROMPT SETS — 50 items across 7 categories
 * ═══════════════════════════════════════════════════ */
type Cat = "coding" | "writing" | "marketing" | "design" | "business" | "education" | "other";

interface SeedPrompt {
  title: string;
  category: Cat;
  tags: string[];
  priceSKT: number;
  isFree?: boolean;
  featured?: boolean;
  sellerIdx: number; // index into SEED_USERS
  description: string;
  previewText: string;
  coverImage: string;
  prompts: Array<{
    title: string;
    content: string;
    description: string;
    variables?: Array<{ name: string; description: string; defaultValue: string }>;
  }>;
}

const PROMPTS: SeedPrompt[] = [
  // ═══════════════ CODING (8) ═══════════════
  {
    title: "React Component Generator Pro",
    category: "coding",
    tags: ["react", "typescript", "components", "frontend"],
    priceSKT: 50,
    featured: true,
    sellerIdx: 2,
    description: "Generate production-ready React components with TypeScript, proper hooks, error handling, and accessibility. Perfect for speeding up frontend development.",
    previewText: "You are an expert React developer. Generate a {{componentType}} component...",
    coverImage: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80",
    prompts: [
      {
        title: "Functional Component with Hooks",
        content: "You are a senior React TypeScript developer. Create a production-ready functional component named {{componentName}} that implements {{feature}}.\n\nRequirements:\n- Use TypeScript with proper interface definitions\n- Include useState, useEffect, useCallback hooks as needed\n- Add proper error boundaries and loading states\n- Follow accessibility best practices (ARIA labels, keyboard navigation)\n- Use CSS modules or Tailwind CSS for styling\n- Include JSDoc comments for complex logic\n- Export the component as default\n\nThe component should handle these edge cases:\n1. Empty/null data gracefully\n2. Loading states with skeleton UI\n3. Error states with retry functionality\n\nReturn ONLY the code with brief inline comments.",
        description: "Creates a full React functional component with hooks and TypeScript",
        variables: [
          { name: "componentName", description: "Name of the component", defaultValue: "DataTable" },
          { name: "feature", description: "Main feature/functionality", defaultValue: "sortable data table with pagination" },
        ],
      },
      {
        title: "Custom Hook Generator",
        content: "Create a custom React hook named {{hookName}} that {{purpose}}.\n\nRequirements:\n- TypeScript with generic types where appropriate\n- Proper cleanup in useEffect (return cleanup function)\n- Memoization with useMemo/useCallback for expensive operations\n- Handle race conditions for async operations\n- Include abort controller for fetch-based hooks\n- Return a typed tuple or object\n- Add comprehensive JSDoc documentation\n\nInclude a usage example in comments at the bottom.",
        description: "Generates reusable custom hooks with proper TypeScript types",
        variables: [
          { name: "hookName", description: "Hook name (use prefix)", defaultValue: "useDebounce" },
          { name: "purpose", description: "What the hook does", defaultValue: "debounces a value with configurable delay" },
        ],
      },
      {
        title: "API Service Layer",
        content: "Create a TypeScript API service module for {{domain}} that handles CRUD operations.\n\nStructure:\n- Base API client with interceptors (auth token, error handling)\n- Type-safe request/response interfaces\n- Proper error classes (NetworkError, ValidationError, AuthError)\n- Retry logic with exponential backoff\n- Request cancellation support\n- Response caching with TTL\n\nEndpoints to generate:\n{{endpoints}}\n\nReturn the complete module with all types and the service object.",
        description: "Creates a complete API service layer with error handling",
        variables: [
          { name: "domain", description: "API domain/resource", defaultValue: "users" },
          { name: "endpoints", description: "List of endpoints", defaultValue: "GET /users, GET /users/:id, POST /users, PUT /users/:id, DELETE /users/:id" },
        ],
      },
    ],
  },
  {
    title: "Python Data Pipeline Builder",
    category: "coding",
    tags: ["python", "data", "pipeline", "etl"],
    priceSKT: 80,
    sellerIdx: 6,
    description: "Build robust data pipelines with Python. Includes ETL patterns, data validation, error handling, and logging. Supports pandas, polars, and PySpark.",
    previewText: "Design a data pipeline that extracts data from {{source}}...",
    coverImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80",
    prompts: [
      {
        title: "ETL Pipeline Template",
        content: "Design a production-grade ETL pipeline in Python that:\n\n1. **Extract** data from {{source}}\n2. **Transform** with these rules:\n   - Clean null/missing values (strategy: {{nullStrategy}})\n   - Normalize column names to snake_case\n   - Apply data type conversions\n   - Add computed columns: {{computedColumns}}\n   - Validate against schema\n3. **Load** into {{destination}}\n\nRequirements:\n- Use {{library}} for data manipulation\n- Implement retry logic with exponential backoff\n- Add structured logging (JSON format)\n- Include data quality checks at each stage\n- Handle schema evolution gracefully\n- Write idempotent operations\n- Include monitoring hooks (row counts, timing, errors)\n\nReturn complete Python code with type hints and docstrings.",
        description: "Complete ETL pipeline with validation and monitoring",
        variables: [
          { name: "source", description: "Data source", defaultValue: "PostgreSQL database" },
          { name: "nullStrategy", description: "How to handle nulls", defaultValue: "fill with column median for numeric, 'unknown' for string" },
          { name: "computedColumns", description: "Columns to compute", defaultValue: "age_group, revenue_bucket, churn_risk_score" },
          { name: "destination", description: "Where to load data", defaultValue: "BigQuery" },
          { name: "library", description: "Data library", defaultValue: "pandas" },
        ],
      },
      {
        title: "Data Validation Framework",
        content: "Create a data validation framework in Python using {{library}} that validates a {{dataType}} dataset.\n\nValidation rules:\n{{rules}}\n\nThe framework should:\n- Return detailed validation reports (pass/fail per rule, failing rows)\n- Support custom validation functions\n- Generate data quality scores (0-100)\n- Export reports as JSON and HTML\n- Be composable (chain validators)\n\nInclude example usage with sample data.",
        description: "Reusable data validation with quality scoring",
        variables: [
          { name: "library", description: "Validation library", defaultValue: "pydantic + great_expectations" },
          { name: "dataType", description: "Type of dataset", defaultValue: "customer transactions" },
          { name: "rules", description: "Validation rules", defaultValue: "no nulls in id/email, amount > 0, valid date format, email regex, unique transaction_id" },
        ],
      },
    ],
  },
  {
    title: "SQL Query Optimizer & Generator",
    category: "coding",
    tags: ["sql", "database", "optimization", "queries"],
    priceSKT: 35,
    sellerIdx: 2,
    description: "Generate optimized SQL queries for complex business requirements. Supports PostgreSQL, MySQL, and BigQuery syntax with performance analysis.",
    previewText: "You are a database expert. Write an optimized SQL query for {{database}}...",
    coverImage: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&q=80",
    prompts: [
      {
        title: "Complex Analytics Query",
        content: "Write an optimized {{dialect}} query for the following business requirement:\n\n{{requirement}}\n\nAvailable tables and their key columns:\n{{schema}}\n\nOptimization requirements:\n- Use CTEs for readability\n- Add appropriate indexes (suggest CREATE INDEX statements)\n- Use window functions where beneficial\n- Avoid N+1 patterns, prefer JOINs or subqueries\n- Include EXPLAIN ANALYZE commentary\n- Handle NULL values properly\n- Add query execution time estimates\n\nReturn the query with comments explaining each section.",
        description: "Generates optimized analytics queries with index suggestions",
        variables: [
          { name: "dialect", description: "SQL dialect", defaultValue: "PostgreSQL" },
          { name: "requirement", description: "Business requirement", defaultValue: "Monthly revenue by product category with YoY growth rate and running total" },
          { name: "schema", description: "Table schema", defaultValue: "orders(id, user_id, product_id, amount, created_at), products(id, name, category_id), categories(id, name)" },
        ],
      },
      {
        title: "Database Migration Script",
        content: "Generate a safe database migration script in {{dialect}} that {{migration}}.\n\nSafety requirements:\n- Wrap in transaction\n- Add rollback script\n- Handle existing data (backfill strategy)\n- Zero-downtime deployment (no table locks)\n- Verify data integrity post-migration\n- Include pre/post migration checks\n\nReturn both UP and DOWN migration scripts.",
        description: "Safe migration scripts with rollback support",
        variables: [
          { name: "dialect", description: "SQL dialect", defaultValue: "PostgreSQL" },
          { name: "migration", description: "What to migrate", defaultValue: "split users table into users + user_profiles, move address fields" },
        ],
      },
    ],
  },
  {
    title: "API Design & Documentation Kit",
    category: "coding",
    tags: ["api", "rest", "openapi", "documentation"],
    priceSKT: 45,
    sellerIdx: 2,
    description: "Design RESTful APIs with OpenAPI specs, authentication flows, rate limiting, and comprehensive documentation. Includes Postman collection generation.",
    previewText: "Design a REST API for {{domain}} following best practices...",
    coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
    prompts: [
      {
        title: "REST API Design",
        content: "Design a comprehensive REST API for {{domain}}.\n\nResources: {{resources}}\n\nFor each resource, generate:\n1. Endpoint list (method, path, description)\n2. Request/response schemas (JSON)\n3. Authentication requirements\n4. Rate limiting rules\n5. Pagination strategy (cursor vs offset)\n6. Error response format (RFC 7807)\n7. Versioning strategy\n\nAdditional requirements:\n- HATEOAS links where appropriate\n- Bulk operation endpoints\n- Search/filter/sort query parameters\n- Webhook event definitions\n\nOutput as OpenAPI 3.1 YAML spec.",
        description: "Complete REST API design with OpenAPI spec",
        variables: [
          { name: "domain", description: "API domain", defaultValue: "E-commerce marketplace" },
          { name: "resources", description: "API resources", defaultValue: "products, orders, users, reviews, categories" },
        ],
      },
    ],
  },
  {
    title: "Next.js Full-Stack App Scaffold",
    category: "coding",
    tags: ["nextjs", "fullstack", "typescript", "prisma"],
    priceSKT: 120,
    featured: true,
    sellerIdx: 2,
    description: "Complete Next.js 14+ app scaffolding with App Router, server actions, Prisma ORM, authentication, and deployment configs. From zero to production.",
    previewText: "You are a Next.js expert. Scaffold a production app for {{appType}}...",
    coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
    prompts: [
      {
        title: "App Router Page Structure",
        content: "Generate a Next.js 14 App Router page structure for a {{appType}} application.\n\nPages needed:\n{{pages}}\n\nFor each page generate:\n- page.tsx with proper metadata export\n- loading.tsx skeleton\n- error.tsx boundary\n- layout.tsx if needed (shared UI)\n- Server vs Client component decision with reasoning\n\nInclude:\n- Parallel routes where beneficial\n- Intercepting routes for modals\n- Route groups for organization\n- Dynamic segments with generateStaticParams\n- Middleware for auth protection\n\nReturn the file tree and code for each file.",
        description: "Next.js App Router architecture with all patterns",
        variables: [
          { name: "appType", description: "Type of application", defaultValue: "SaaS dashboard" },
          { name: "pages", description: "Pages to generate", defaultValue: "dashboard, settings, billing, team, analytics, profile" },
        ],
      },
      {
        title: "Prisma Schema & Server Actions",
        content: "Generate a Prisma schema and Next.js server actions for {{domain}}.\n\nEntities: {{entities}}\n\nPrisma schema should include:\n- Proper relations (1:1, 1:N, N:N)\n- Indexes for common queries\n- Enums where appropriate\n- Soft delete pattern\n- Audit fields (createdAt, updatedAt, createdBy)\n\nServer actions should include:\n- CRUD operations with Zod validation\n- Optimistic updates pattern\n- Revalidation strategy\n- Error handling with typed responses\n- Transaction support for multi-model operations\n\nReturn schema.prisma and actions/*.ts files.",
        description: "Prisma models + type-safe server actions",
        variables: [
          { name: "domain", description: "Application domain", defaultValue: "project management" },
          { name: "entities", description: "Data entities", defaultValue: "Project, Task, User, Comment, Label, Sprint" },
        ],
      },
      {
        title: "Authentication & Authorization Setup",
        content: "Set up authentication and authorization for a Next.js app using {{authProvider}}.\n\nRequirements:\n- Social login: {{socialProviders}}\n- Email/password with email verification\n- Role-based access control (roles: {{roles}})\n- Session management (JWT or database sessions)\n- Middleware-based route protection\n- API route protection\n- CSRF protection\n- Rate limiting on auth endpoints\n\nGenerate:\n1. Auth configuration\n2. Sign-in/sign-up pages\n3. Middleware\n4. Auth utility hooks\n5. Protected API route example\n6. Role-based component wrapper",
        description: "Complete auth setup with RBAC",
        variables: [
          { name: "authProvider", description: "Auth library", defaultValue: "NextAuth.js v5" },
          { name: "socialProviders", description: "Social login providers", defaultValue: "Google, GitHub, Discord" },
          { name: "roles", description: "User roles", defaultValue: "admin, editor, viewer" },
        ],
      },
    ],
  },
  {
    title: "Docker & CI/CD Pipeline Templates",
    category: "coding",
    tags: ["docker", "cicd", "devops", "github-actions"],
    priceSKT: 60,
    sellerIdx: 2,
    description: "Production-ready Docker configs and CI/CD pipelines for web apps. Multi-stage builds, caching strategies, and automated deployment workflows.",
    previewText: "Create a multi-stage Dockerfile for {{framework}}...",
    coverImage: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&q=80",
    prompts: [
      {
        title: "Multi-Stage Dockerfile",
        content: "Create a production-optimized multi-stage Dockerfile for a {{framework}} application.\n\nRequirements:\n- Multi-stage build (builder → runner)\n- Minimal final image (alpine or distroless)\n- Layer caching optimization\n- Non-root user\n- Health check endpoint\n- Environment variable handling\n- Build arguments for configuration\n- .dockerignore file\n- Security scanning compatible\n\nAlso generate:\n- docker-compose.yml for local dev (with {{services}})\n- docker-compose.prod.yml for production\n\nInclude comments explaining each decision.",
        description: "Optimized Docker setup with compose files",
        variables: [
          { name: "framework", description: "Application framework", defaultValue: "Node.js + Next.js" },
          { name: "services", description: "Supporting services", defaultValue: "PostgreSQL, Redis, MinIO" },
        ],
      },
      {
        title: "GitHub Actions CI/CD",
        content: "Create a comprehensive GitHub Actions CI/CD pipeline for a {{stack}} project.\n\nPipeline stages:\n1. **Lint & Type Check** — eslint, tsc, prettier\n2. **Test** — unit tests, integration tests (with {{testDb}})\n3. **Build** — Docker image, tag with git SHA\n4. **Security** — dependency audit, SAST scan\n5. **Deploy Staging** — auto on PR merge to develop\n6. **Deploy Production** — manual approval on main\n\nFeatures:\n- Caching (node_modules, Docker layers, test results)\n- Parallel job execution\n- Slack notifications on failure\n- Environment-specific secrets\n- Rollback workflow\n- Database migration step\n\nReturn .github/workflows/ YAML files.",
        description: "Complete CI/CD pipeline with staging and production",
        variables: [
          { name: "stack", description: "Tech stack", defaultValue: "Next.js + PostgreSQL + Docker" },
          { name: "testDb", description: "Test database", defaultValue: "PostgreSQL in Docker service container" },
        ],
      },
    ],
  },
  {
    title: "LangChain AI Agent Builder",
    category: "coding",
    tags: ["langchain", "ai", "agents", "llm", "python"],
    priceSKT: 100,
    featured: true,
    sellerIdx: 6,
    description: "Build sophisticated AI agents with LangChain. Includes RAG pipelines, tool-using agents, multi-agent systems, and memory management patterns.",
    previewText: "Build a LangChain agent that {{agentGoal}} with tools...",
    coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    prompts: [
      {
        title: "RAG Pipeline with Vector Store",
        content: "Build a production RAG (Retrieval-Augmented Generation) pipeline using LangChain.\n\nData source: {{dataSource}}\nVector store: {{vectorStore}}\nLLM: {{llm}}\n\nPipeline steps:\n1. Document loading and chunking (strategy: {{chunkStrategy}})\n2. Embedding generation\n3. Vector store indexing with metadata\n4. Retrieval with hybrid search (dense + sparse)\n5. Context-aware prompt construction\n6. Answer generation with source citations\n\nAdvanced features:\n- Query rewriting for better retrieval\n- Re-ranking retrieved documents\n- Conversation memory (last 5 turns)\n- Streaming responses\n- Evaluation metrics (faithfulness, relevance)\n\nReturn complete Python code with all imports.",
        description: "Complete RAG pipeline with hybrid search and evaluation",
        variables: [
          { name: "dataSource", description: "Source documents", defaultValue: "PDF technical documentation" },
          { name: "vectorStore", description: "Vector database", defaultValue: "ChromaDB" },
          { name: "llm", description: "Language model", defaultValue: "Claude 3.5 Sonnet" },
          { name: "chunkStrategy", description: "Chunking strategy", defaultValue: "recursive with 1000 chars, 200 overlap" },
        ],
      },
      {
        title: "Multi-Tool Agent",
        content: "Create a LangChain agent with multiple tools for {{useCase}}.\n\nTools to implement:\n{{tools}}\n\nAgent architecture:\n- ReAct pattern (Reasoning + Acting)\n- Tool selection with proper descriptions\n- Error recovery (retry failed tool calls)\n- Output parsing with structured format\n- Conversation memory\n- Token usage tracking\n- Streaming intermediate steps\n\nSafety features:\n- Input sanitization\n- Tool call rate limiting\n- Maximum iteration limit\n- Human-in-the-loop for sensitive actions\n\nReturn agent code with example conversation.",
        description: "Multi-tool agent with safety and error handling",
        variables: [
          { name: "useCase", description: "Agent use case", defaultValue: "research assistant" },
          { name: "tools", description: "Available tools", defaultValue: "web_search, calculator, code_interpreter, file_reader, database_query" },
        ],
      },
    ],
  },
  {
    title: "TypeScript Utility Functions Collection",
    category: "coding",
    tags: ["typescript", "utilities", "helpers", "functional"],
    priceSKT: 25,
    sellerIdx: 2,
    description: "Battle-tested TypeScript utility functions for common operations: deep clone, debounce, retry, type guards, date formatting, and more.",
    previewText: "Generate a TypeScript utility function for {{operation}}...",
    coverImage: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80",
    prompts: [
      {
        title: "Type-Safe Utility Generator",
        content: "Generate a type-safe TypeScript utility function for: {{operation}}\n\nRequirements:\n- Full generic types (no `any`)\n- Overloaded signatures if applicable\n- Edge case handling\n- JSDoc with @example tags\n- Unit test cases (vitest/jest syntax)\n- Tree-shakeable (named export)\n- Zero dependencies\n- Handles null/undefined gracefully\n\nReturn the function, its types, and test file.",
        description: "Generates utility functions with tests",
        variables: [
          { name: "operation", description: "What the utility does", defaultValue: "deep merge objects with array concat strategy" },
        ],
      },
    ],
  },

  // ═══════════════ WRITING (7) ═══════════════
  {
    title: "Blog Post Writing System",
    category: "writing",
    tags: ["blog", "seo", "content", "articles"],
    priceSKT: 40,
    featured: true,
    sellerIdx: 5,
    description: "Complete blog post creation system. From outline to polished article with SEO optimization, meta descriptions, and social media snippets.",
    previewText: "Write a comprehensive blog post about {{topic}} targeting {{audience}}...",
    coverImage: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80",
    prompts: [
      {
        title: "SEO-Optimized Article",
        content: "Write a comprehensive, SEO-optimized blog post.\n\nTopic: {{topic}}\nTarget audience: {{audience}}\nTarget keyword: {{keyword}}\nWord count: {{wordCount}}\nTone: {{tone}}\n\nStructure:\n1. Hook opening (question, stat, or story)\n2. Table of contents\n3. Main sections with H2/H3 headings\n4. Practical examples and actionable tips\n5. FAQ section (3-5 questions)\n6. Strong conclusion with CTA\n\nSEO requirements:\n- Keyword in title, first paragraph, H2s\n- LSI keywords naturally integrated\n- Internal link suggestions [placeholder]\n- Meta description (155 chars)\n- Social media snippet (Twitter + LinkedIn)\n- Alt text suggestions for images\n\nFormatting: Use bullet points, numbered lists, bold for emphasis, blockquotes for key insights.",
        description: "Full blog post with SEO optimization and social snippets",
        variables: [
          { name: "topic", description: "Blog post topic", defaultValue: "How to Build Your First AI Application in 2025" },
          { name: "audience", description: "Target readers", defaultValue: "developers with 1-3 years experience" },
          { name: "keyword", description: "Target SEO keyword", defaultValue: "build AI application" },
          { name: "wordCount", description: "Target word count", defaultValue: "2000" },
          { name: "tone", description: "Writing tone", defaultValue: "professional yet approachable" },
        ],
      },
      {
        title: "Content Outline Generator",
        content: "Create a detailed content outline for a blog post about {{topic}}.\n\nGenerate:\n1. 5 title options (with power words and numbers)\n2. Target keyword + 10 LSI keywords\n3. Detailed outline with:\n   - H2 sections (5-7)\n   - H3 subsections (2-3 per H2)\n   - Key points under each section\n   - Data/stat placeholders to research\n   - Internal link opportunities\n4. Estimated word count per section\n5. Content angle that differentiates from top 5 SERP results\n6. Featured snippet opportunity (paragraph, list, or table)\n\nOutput as structured markdown.",
        description: "Detailed article outline with SEO strategy",
        variables: [
          { name: "topic", description: "Content topic", defaultValue: "Remote Work Productivity Tools" },
        ],
      },
    ],
  },
  {
    title: "Email Copy Templates",
    category: "writing",
    tags: ["email", "copywriting", "marketing", "conversion"],
    priceSKT: 35,
    sellerIdx: 5,
    description: "High-converting email templates for every stage of the customer journey. Welcome sequences, nurture campaigns, re-engagement, and transactional emails.",
    previewText: "Write a {{emailType}} email for {{brand}} targeting {{segment}}...",
    coverImage: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=800&q=80",
    prompts: [
      {
        title: "Welcome Email Sequence",
        content: "Create a {{sequenceLength}}-email welcome sequence for {{brand}}.\n\nBrand context: {{brandDescription}}\nTarget segment: {{segment}}\nMain CTA: {{cta}}\n\nFor each email generate:\n- Subject line (+ A/B variant)\n- Preview text\n- Email body (HTML-friendly formatting)\n- CTA button text\n- Send timing (days after signup)\n- Goal/purpose of this email\n\nEmail sequence flow:\n1. Welcome + brand story\n2. Value delivery (free resource/tip)\n3. Social proof (testimonials/case study)\n4. Product education\n5. Soft CTA / trial offer\n\nTone: {{tone}}\nKeep each email under 200 words. Mobile-friendly formatting.",
        description: "Complete welcome email sequence with A/B variants",
        variables: [
          { name: "sequenceLength", description: "Number of emails", defaultValue: "5" },
          { name: "brand", description: "Brand name", defaultValue: "Skyverses" },
          { name: "brandDescription", description: "What the brand does", defaultValue: "AI-powered creative tools for designers and marketers" },
          { name: "segment", description: "Target audience", defaultValue: "new free trial users" },
          { name: "cta", description: "Main call-to-action", defaultValue: "upgrade to Pro plan" },
          { name: "tone", description: "Email tone", defaultValue: "friendly, helpful, not pushy" },
        ],
      },
    ],
  },
  {
    title: "Creative Fiction Writing Toolkit",
    category: "writing",
    tags: ["fiction", "creative", "storytelling", "characters"],
    priceSKT: 55,
    sellerIdx: 5,
    description: "Craft compelling fiction with prompts for character development, world-building, dialogue, plot structure, and scene writing. For novelists and screenwriters.",
    previewText: "Create a character profile for {{characterRole}} in a {{genre}} story...",
    coverImage: "https://images.unsplash.com/photo-1519791883288-dc8bd696e667?w=800&q=80",
    prompts: [
      {
        title: "Deep Character Profile",
        content: "Create an in-depth character profile for a {{genre}} story.\n\nCharacter role: {{characterRole}}\nSetting: {{setting}}\n\nGenerate:\n**Identity**\n- Name (meaningful/symbolic), age, appearance (3 distinctive features)\n- Voice pattern (speech mannerisms, vocabulary level, accent)\n\n**Psychology**\n- Core desire vs. core fear\n- Moral alignment and ethical boundaries\n- Defense mechanisms\n- Attachment style\n- MBTI/Enneagram (for consistency)\n\n**Background**\n- Formative event (before story)\n- Secret they keep\n- Relationship web (3 key people)\n- Skills and fatal flaw\n\n**Arc**\n- Lie they believe at start\n- Truth they must learn\n- Catalyst for change\n- What they sacrifice\n\nWrite in narrative prose, not bullet points. Make this character feel real.",
        description: "Multi-dimensional character development with arc",
        variables: [
          { name: "genre", description: "Story genre", defaultValue: "sci-fi thriller" },
          { name: "characterRole", description: "Character's role", defaultValue: "reluctant protagonist, former military pilot" },
          { name: "setting", description: "Story setting", defaultValue: "Mars colony in 2180" },
        ],
      },
      {
        title: "Scene Writing with Tension",
        content: "Write a pivotal scene for a {{genre}} story.\n\nScene context: {{context}}\nPOV character: {{povCharacter}}\nEmotional arc of scene: {{emotionalArc}}\n\nRequirements:\n- Open in media res (mid-action)\n- Sensory details (sight, sound, smell — not just visual)\n- Subtext in dialogue (characters mean more than they say)\n- Rising tension with a turn/reversal\n- End on a hook that propels forward\n- Show don't tell for emotions\n- Vary sentence length for pacing (short = tension, long = reflection)\n\nLength: ~1000 words. Literary quality.",
        description: "Write a tense, cinematic scene with subtext",
        variables: [
          { name: "genre", description: "Genre", defaultValue: "psychological thriller" },
          { name: "context", description: "What's happening", defaultValue: "Two former friends confront each other at a dinner party, each holding a secret about the other" },
          { name: "povCharacter", description: "POV character", defaultValue: "Elena, the host, who knows her guest is lying" },
          { name: "emotionalArc", description: "Emotional journey", defaultValue: "controlled calm → suspicion → controlled fury → cold revelation" },
        ],
      },
    ],
  },
  {
    title: "Technical Documentation Writer",
    category: "writing",
    tags: ["documentation", "technical", "api-docs", "guides"],
    priceSKT: 45,
    sellerIdx: 2,
    description: "Create clear, structured technical documentation. API references, getting started guides, architecture docs, and troubleshooting guides.",
    previewText: "Write technical documentation for {{product}} covering {{scope}}...",
    coverImage: "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=800&q=80",
    prompts: [
      {
        title: "Getting Started Guide",
        content: "Write a comprehensive Getting Started guide for {{product}}.\n\nProduct description: {{description}}\nTarget user: {{targetUser}}\nPrerequisites: {{prerequisites}}\n\nStructure:\n1. **Overview** — What it does, why use it (30 words)\n2. **Prerequisites** — What you need before starting\n3. **Installation** — Step-by-step with code blocks\n4. **Quick Start** — Minimal working example (< 5 min)\n5. **Core Concepts** — 3-4 key concepts explained simply\n6. **First Project** — Build something real (15 min tutorial)\n7. **Next Steps** — Links to advanced topics\n8. **Troubleshooting** — Top 5 common issues\n\nStyle:\n- Code blocks with syntax highlighting\n- Callout boxes (tip, warning, note)\n- Progressive disclosure (simple first, complex later)\n- Every code example must be copy-pasteable and runnable",
        description: "Complete getting started guide with tutorial",
        variables: [
          { name: "product", description: "Product/tool name", defaultValue: "Skyverses API" },
          { name: "description", description: "What it does", defaultValue: "AI image and video generation API" },
          { name: "targetUser", description: "Who reads this", defaultValue: "developers integrating AI generation into their apps" },
          { name: "prerequisites", description: "Required knowledge/tools", defaultValue: "Node.js 18+, basic REST API knowledge" },
        ],
      },
    ],
  },
  {
    title: "Social Media Content Calendar",
    category: "writing",
    tags: ["social-media", "content-calendar", "captions", "hashtags"],
    priceSKT: 30,
    sellerIdx: 1,
    description: "Generate a month of social media content across platforms. Includes captions, hashtags, posting times, and content pillars strategy.",
    previewText: "Create a 30-day content calendar for {{brand}} on {{platforms}}...",
    coverImage: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80",
    prompts: [
      {
        title: "30-Day Content Calendar",
        content: "Generate a 30-day social media content calendar for {{brand}}.\n\nBrand: {{brandDescription}}\nPlatforms: {{platforms}}\nContent pillars: {{pillars}}\n\nFor each day generate:\n- Platform\n- Content type (carousel, reel, story, thread, single post)\n- Caption (platform-optimized length)\n- Hashtags (mix of broad, niche, branded)\n- Best posting time\n- Visual direction (what the image/video should show)\n- CTA\n- Content pillar it belongs to\n\nRules:\n- Mix content types (don't repeat same type 2 days in row)\n- 80/20 rule: 80% value, 20% promotional\n- Include trending format adaptations\n- Platform-specific optimization (Instagram ≠ LinkedIn ≠ Twitter)\n\nOutput as a table.",
        description: "Complete 30-day multi-platform content calendar",
        variables: [
          { name: "brand", description: "Brand name", defaultValue: "Skyverses" },
          { name: "brandDescription", description: "Brand description", defaultValue: "AI creative platform for image/video generation" },
          { name: "platforms", description: "Social platforms", defaultValue: "Instagram, Twitter/X, LinkedIn" },
          { name: "pillars", description: "Content pillars", defaultValue: "AI tutorials, behind-the-scenes, user showcases, industry news, product tips" },
        ],
      },
    ],
  },
  {
    title: "Resume & Cover Letter Pro",
    category: "writing",
    tags: ["resume", "cover-letter", "career", "job-search"],
    priceSKT: 0,
    isFree: true,
    sellerIdx: 8,
    description: "Craft ATS-friendly resumes and compelling cover letters tailored to specific job descriptions. Free to help job seekers succeed.",
    previewText: "Write a tailored resume for {{position}} at {{company}}...",
    coverImage: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80",
    prompts: [
      {
        title: "ATS-Optimized Resume",
        content: "Rewrite/create a resume optimized for ATS (Applicant Tracking Systems).\n\nTarget position: {{position}}\nCompany: {{company}}\nCandidate background: {{background}}\n\nRequirements:\n- Extract keywords from the job description\n- Quantify achievements (numbers, %, $)\n- Use action verbs (led, built, reduced, increased)\n- ATS-friendly formatting (no tables, columns, graphics)\n- Sections: Summary, Experience, Skills, Education\n- Each bullet: Action Verb + Task + Result (ATR formula)\n- Skills section matching job requirements\n- 1-2 pages maximum\n\nAlso generate:\n- 5 keywords to ensure are included\n- ATS compatibility score estimate\n- Suggested improvements",
        description: "ATS-optimized resume with keyword matching",
        variables: [
          { name: "position", description: "Target job title", defaultValue: "Senior Frontend Developer" },
          { name: "company", description: "Target company", defaultValue: "a fast-growing SaaS startup" },
          { name: "background", description: "Candidate background", defaultValue: "5 years React/TypeScript, led team of 4, shipped 3 major products, CS degree" },
        ],
      },
    ],
  },
  {
    title: "YouTube Script & Hook Generator",
    category: "writing",
    tags: ["youtube", "video-script", "hooks", "thumbnails"],
    priceSKT: 50,
    sellerIdx: 9,
    description: "Write engaging YouTube scripts with attention-grabbing hooks, retention strategies, and thumbnail concepts. Optimized for watch time and engagement.",
    previewText: "Write a YouTube script for a {{duration}}-minute video about {{topic}}...",
    coverImage: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800&q=80",
    prompts: [
      {
        title: "Full YouTube Script",
        content: "Write a complete YouTube script for a {{duration}}-minute video.\n\nTopic: {{topic}}\nChannel niche: {{niche}}\nTarget viewer: {{viewer}}\n\nScript structure:\n1. **Hook** (0-30s) — Open loop, bold claim, or pattern interrupt\n2. **Context** (30s-1m) — Why viewer should care (stakes)\n3. **Main Content** — {{sections}} sections with retention hooks between each\n4. **Climax** — The most valuable insight/reveal\n5. **CTA** — Subscribe + next video teaser\n\nInclude:\n- [B-ROLL] markers for visual cuts\n- [GRAPHIC] markers for on-screen text\n- Retention hooks every 2-3 minutes (questions, teasers, pattern breaks)\n- Estimated timestamp for each section\n- 3 thumbnail concepts (text + visual description)\n- Title options (5) with CTR optimization\n- Description with timestamps and keywords\n- Tags (20)\n\nTone: {{tone}}",
        description: "Complete YouTube script with retention optimization",
        variables: [
          { name: "duration", description: "Video length (minutes)", defaultValue: "10" },
          { name: "topic", description: "Video topic", defaultValue: "5 AI Tools That Will Replace Your Entire Design Team" },
          { name: "niche", description: "Channel niche", defaultValue: "tech/productivity" },
          { name: "viewer", description: "Target viewer", defaultValue: "entrepreneurs and small business owners, 25-40" },
          { name: "sections", description: "Number of main sections", defaultValue: "5" },
          { name: "tone", description: "Script tone", defaultValue: "energetic, informative, slightly provocative" },
        ],
      },
    ],
  },

  // ═══════════════ MARKETING (7) ═══════════════
  {
    title: "Landing Page Copy Framework",
    category: "marketing",
    tags: ["landing-page", "copywriting", "conversion", "saas"],
    priceSKT: 65,
    featured: true,
    sellerIdx: 1,
    description: "High-converting landing page copy using proven frameworks (PAS, AIDA, StoryBrand). For SaaS, e-commerce, and service businesses.",
    previewText: "Write landing page copy for {{product}} using the {{framework}} framework...",
    coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    prompts: [
      {
        title: "SaaS Landing Page (PAS Framework)",
        content: "Write complete landing page copy for {{product}} using the PAS (Problem-Agitation-Solution) framework.\n\nProduct: {{productDescription}}\nTarget customer: {{target}}\nMain competitor: {{competitor}}\nKey differentiator: {{differentiator}}\n\nSections to generate:\n1. **Hero** — Headline (benefit-driven, <10 words), subhead, CTA\n2. **Problem** — 3 pain points with emotional language\n3. **Agitation** — What happens if they don't solve it (cost of inaction)\n4. **Solution** — Product introduction with 3 key features\n5. **Social Proof** — 3 testimonial templates + logos bar\n6. **How It Works** — 3-step process\n7. **Features** — 6 features with benefit-focused copy\n8. **Pricing** — 3-tier comparison (starter/pro/enterprise)\n9. **FAQ** — 6 objection-handling questions\n10. **Final CTA** — Urgency/scarcity + risk reversal\n\nInclude micro-copy for buttons, form fields, and trust badges.",
        description: "Complete SaaS landing page with PAS framework",
        variables: [
          { name: "product", description: "Product name", defaultValue: "Skyverses" },
          { name: "productDescription", description: "What it does", defaultValue: "AI platform for generating images, videos, and creative content" },
          { name: "target", description: "Target customer", defaultValue: "digital marketers and content creators at SMBs" },
          { name: "competitor", description: "Main competitor", defaultValue: "Canva AI" },
          { name: "differentiator", description: "What makes it different", defaultValue: "professional-grade output quality with enterprise workflow tools" },
        ],
      },
    ],
  },
  {
    title: "Facebook & Instagram Ads Pack",
    category: "marketing",
    tags: ["facebook-ads", "instagram", "paid-social", "creatives"],
    priceSKT: 45,
    sellerIdx: 1,
    description: "Generate scroll-stopping ad creatives for Facebook and Instagram. Primary text, headlines, descriptions, and creative briefs for multiple ad formats.",
    previewText: "Create {{adCount}} Facebook ad variations for {{product}}...",
    coverImage: "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=800&q=80",
    prompts: [
      {
        title: "Ad Copy Variations",
        content: "Generate {{adCount}} Facebook/Instagram ad variations for {{product}}.\n\nProduct: {{productDescription}}\nOffer: {{offer}}\nTarget audience: {{audience}}\nCampaign objective: {{objective}}\n\nFor each variation generate:\n- **Primary text** (3 lengths: short/medium/long)\n- **Headline** (under 40 chars)\n- **Description** (under 30 chars)\n- **CTA button** choice\n- **Creative brief** (what the image/video should show)\n- **Hook type** (question, statistic, testimonial, before/after, curiosity gap)\n\nAngle mix:\n- 2x Benefit-focused\n- 2x Pain-point focused\n- 1x Social proof / testimonial style\n- 1x Urgency / FOMO\n\nAll copy must comply with Meta ad policies (no exaggerated claims, no \"you\" in certain contexts).",
        description: "Multiple ad variations with creative briefs",
        variables: [
          { name: "adCount", description: "Number of variations", defaultValue: "6" },
          { name: "product", description: "Product name", defaultValue: "Skyverses Pro" },
          { name: "productDescription", description: "What it does", defaultValue: "AI creative suite for professional image and video generation" },
          { name: "offer", description: "Current offer", defaultValue: "14-day free trial, no credit card required" },
          { name: "audience", description: "Target audience", defaultValue: "freelance designers aged 25-40 who use Canva or Figma" },
          { name: "objective", description: "Campaign goal", defaultValue: "trial signups" },
        ],
      },
    ],
  },
  {
    title: "Product Launch Campaign Planner",
    category: "marketing",
    tags: ["product-launch", "campaign", "go-to-market", "strategy"],
    priceSKT: 90,
    sellerIdx: 4,
    description: "Plan a complete product launch from pre-launch teasers to post-launch analysis. Includes timeline, channel strategy, messaging, and KPIs.",
    previewText: "Plan a product launch campaign for {{product}} launching on {{date}}...",
    coverImage: "https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=800&q=80",
    prompts: [
      {
        title: "Launch Campaign Blueprint",
        content: "Create a complete product launch campaign plan.\n\nProduct: {{product}}\nLaunch date: {{launchDate}}\nBudget: {{budget}}\nTarget market: {{market}}\n\nGenerate:\n\n**Pre-Launch (4 weeks before)**\n- Teaser content calendar\n- Waitlist/early access strategy\n- Influencer/partner outreach list template\n- Beta user recruitment plan\n\n**Launch Week**\n- Day-by-day activity calendar\n- Press release template\n- Product Hunt launch checklist\n- Social media storm plan (hour-by-hour for launch day)\n- Email blast sequence (3 emails)\n\n**Post-Launch (2 weeks after)**\n- User onboarding optimization\n- Feedback collection plan\n- Content repurposing schedule\n- Paid ad scaling criteria\n\n**Metrics & KPIs**\n- Awareness: impressions, reach, mentions\n- Acquisition: signups, trials, demo requests\n- Activation: onboarding completion, first value moment\n- Revenue: MRR, conversion rate, ARPU\n\nOutput as a timeline with owners and deliverables.",
        description: "End-to-end launch campaign with timeline and KPIs",
        variables: [
          { name: "product", description: "Product name", defaultValue: "Skyverses 2.0" },
          { name: "launchDate", description: "Launch date", defaultValue: "July 15, 2026" },
          { name: "budget", description: "Marketing budget", defaultValue: "$5,000" },
          { name: "market", description: "Target market", defaultValue: "solopreneurs and small creative agencies in US/EU" },
        ],
      },
    ],
  },
  {
    title: "SEO Content Strategy System",
    category: "marketing",
    tags: ["seo", "content-strategy", "keywords", "topical-authority"],
    priceSKT: 70,
    sellerIdx: 1,
    description: "Build topical authority with strategic content planning. Keyword research frameworks, content clusters, and SERP analysis prompts.",
    previewText: "Build a content strategy for {{domain}} targeting {{niche}}...",
    coverImage: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&q=80",
    prompts: [
      {
        title: "Topical Authority Map",
        content: "Create a topical authority content map for {{domain}}.\n\nNiche: {{niche}}\nCurrent DA: {{domainAuthority}}\n\nGenerate:\n1. **Pillar pages** (3-5 broad topics, 3000+ words each)\n2. **Cluster articles** (5-8 per pillar, 1500-2000 words)\n3. **Supporting content** (FAQ pages, glossary, tools)\n4. **Internal linking strategy** (how pages connect)\n\nFor each content piece:\n- Target keyword + search volume estimate\n- Search intent (informational/commercial/navigational/transactional)\n- Content type (guide, comparison, tutorial, list, case study)\n- Difficulty estimate (easy/medium/hard)\n- Priority (1-3, based on traffic potential ÷ difficulty)\n\nAlso include:\n- Content gap analysis framework\n- Publishing cadence recommendation\n- Quick win opportunities (low difficulty, decent volume)\n\nOutput as a structured table grouped by pillar.",
        description: "Complete topical authority map with priorities",
        variables: [
          { name: "domain", description: "Website", defaultValue: "skyverses.com" },
          { name: "niche", description: "Content niche", defaultValue: "AI image and video generation" },
          { name: "domainAuthority", description: "Domain authority", defaultValue: "25" },
        ],
      },
    ],
  },
  {
    title: "Email Marketing Automation Flows",
    category: "marketing",
    tags: ["email", "automation", "drip-campaigns", "lifecycle"],
    priceSKT: 55,
    sellerIdx: 1,
    description: "Design automated email flows for the entire customer lifecycle. Onboarding, activation, retention, win-back, and upsell sequences with trigger logic.",
    previewText: "Design an email automation flow for {{triggerEvent}}...",
    coverImage: "https://images.unsplash.com/photo-1563986768609-322da13575f2?w=800&q=80",
    prompts: [
      {
        title: "Lifecycle Email Automation",
        content: "Design a complete email automation system for {{product}}.\n\nGenerate flows for each lifecycle stage:\n\n**1. Onboarding (Days 0-7)**\nTrigger: {{onboardingTrigger}}\n- Welcome → Feature intro → Quick win → Social proof → First CTA\n\n**2. Activation (Days 7-30)**\nTrigger: user hasn't completed {{activationMilestone}}\n- Nudge → Tutorial → Case study → Offer help\n\n**3. Retention (Monthly)**\nTrigger: active user\n- Usage recap → Tips → New features → Community\n\n**4. Win-back (Day 30-60)**\nTrigger: no login for 14+ days\n- We miss you → What's new → Special offer → Last chance\n\n**5. Upsell (Behavior-based)**\nTrigger: {{upsellTrigger}}\n- Feature teaser → ROI calculator → Testimonial → Limited offer\n\nFor each email: subject line, preview text, body outline, CTA, send timing, exit conditions.\nInclude flow diagram (text-based) showing branch logic.",
        description: "Complete lifecycle email automation with triggers",
        variables: [
          { name: "product", description: "Product", defaultValue: "Skyverses" },
          { name: "onboardingTrigger", description: "Onboarding trigger", defaultValue: "new account creation" },
          { name: "activationMilestone", description: "Activation goal", defaultValue: "generated first image" },
          { name: "upsellTrigger", description: "Upsell trigger", defaultValue: "hit free tier limit (50 images/month)" },
        ],
      },
    ],
  },
  {
    title: "Google Ads Campaign Builder",
    category: "marketing",
    tags: ["google-ads", "ppc", "sem", "search-ads"],
    priceSKT: 40,
    sellerIdx: 1,
    description: "Generate Google Ads campaigns with keyword groups, ad copy variations, negative keywords, and bidding strategy recommendations.",
    previewText: "Build a Google Ads campaign for {{product}} targeting {{keywords}}...",
    coverImage: "https://images.unsplash.com/photo-1553835973-dec43bfddbeb?w=800&q=80",
    prompts: [
      {
        title: "Search Campaign Structure",
        content: "Build a Google Search Ads campaign for {{product}}.\n\nProduct: {{productDescription}}\nMonthly budget: {{budget}}\nTarget geography: {{geo}}\nConversion goal: {{goal}}\n\nGenerate:\n1. **Campaign structure** (campaigns → ad groups → keywords)\n2. **Keyword groups** (5-8 ad groups, 10-15 keywords each)\n   - Include match types (exact, phrase, broad)\n   - Estimated CPC range\n3. **Ad copy** (3 responsive search ads per ad group)\n   - 15 headlines (30 char max)\n   - 4 descriptions (90 char max)\n   - Pin strategy for top headlines\n4. **Negative keywords** (30+ negatives to prevent waste)\n5. **Extensions** — sitelinks, callouts, structured snippets\n6. **Bidding strategy** recommendation with reasoning\n7. **Landing page requirements** per ad group\n\nOrganize by funnel stage: top (awareness), middle (consideration), bottom (conversion).",
        description: "Complete Google Ads campaign with keywords and ad copy",
        variables: [
          { name: "product", description: "Product", defaultValue: "Skyverses AI" },
          { name: "productDescription", description: "Description", defaultValue: "AI-powered image and video generation platform" },
          { name: "budget", description: "Monthly budget", defaultValue: "$2,000" },
          { name: "geo", description: "Target location", defaultValue: "United States, Canada, UK" },
          { name: "goal", description: "Conversion goal", defaultValue: "free trial signups" },
        ],
      },
    ],
  },
  {
    title: "Competitor Analysis Framework",
    category: "marketing",
    tags: ["competitor-analysis", "market-research", "strategy", "swot"],
    priceSKT: 0,
    isFree: true,
    sellerIdx: 4,
    description: "Systematic competitor analysis with SWOT, positioning maps, and actionable insights. Free framework to help you understand your market.",
    previewText: "Analyze {{competitor}} as a competitor to {{yourProduct}}...",
    coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    prompts: [
      {
        title: "Deep Competitor Analysis",
        content: "Perform a comprehensive competitor analysis.\n\nYour product: {{yourProduct}} — {{yourDescription}}\nCompetitor: {{competitor}}\n\nAnalysis sections:\n\n1. **Overview** — What they do, founding year, funding, team size\n2. **Product** — Features comparison matrix (vs yours)\n3. **Pricing** — Plans, pricing model, free tier\n4. **SWOT Analysis** — Strengths, Weaknesses, Opportunities, Threats\n5. **Go-to-Market** — Channels, messaging, positioning\n6. **Content & SEO** — Top content, keyword overlap, backlink sources\n7. **Social Proof** — Reviews (G2, Capterra), social following, community\n8. **Tech Stack** — Technologies used (BuiltWith analysis)\n9. **Vulnerabilities** — Where they're weakest\n10. **Action Items** — 5 specific things you can do to compete\n\nBe specific and actionable. Use data-driven language.",
        description: "Comprehensive competitor analysis with action items",
        variables: [
          { name: "yourProduct", description: "Your product", defaultValue: "Skyverses" },
          { name: "yourDescription", description: "Your product description", defaultValue: "AI creative platform for image/video generation" },
          { name: "competitor", description: "Competitor to analyze", defaultValue: "Midjourney" },
        ],
      },
    ],
  },

  // ═══════════════ DESIGN (7) ═══════════════
  {
    title: "UI/UX Design System Prompts",
    category: "design",
    tags: ["ui-design", "design-system", "components", "figma"],
    priceSKT: 75,
    featured: true,
    sellerIdx: 3,
    description: "Generate comprehensive design system specifications. Color palettes, typography scales, component specs, spacing systems, and accessibility guidelines.",
    previewText: "Design a complete design system for {{brand}} with {{style}} aesthetic...",
    coverImage: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",
    prompts: [
      {
        title: "Design System Foundation",
        content: "Create a comprehensive design system specification for {{brand}}.\n\nBrand personality: {{personality}}\nIndustry: {{industry}}\nPrimary platform: {{platform}}\n\nGenerate specifications for:\n\n**1. Color System**\n- Primary, secondary, accent colors (hex + HSL)\n- Semantic colors (success, warning, error, info)\n- Neutral scale (50-950)\n- Dark mode variants\n- Color contrast ratios (WCAG AA/AAA)\n\n**2. Typography**\n- Font families (heading, body, mono)\n- Type scale (px + rem, ratios)\n- Line heights and letter spacing\n- Font weights usage guide\n\n**3. Spacing & Layout**\n- Spacing scale (4px base)\n- Grid system (columns, gutters, margins)\n- Breakpoints (mobile, tablet, desktop, wide)\n- Container widths\n\n**4. Component Specs** (for 10 core components)\n- Button, Input, Card, Modal, Badge, Avatar, Toast, Dropdown, Tab, Table\n- States: default, hover, active, focus, disabled, error\n- Sizes: sm, md, lg\n- Variants per component\n\n**5. Accessibility**\n- Focus indicators\n- Color blind safe palette\n- Minimum touch targets\n- Screen reader guidelines\n\nOutput as structured spec document.",
        description: "Complete design system spec with tokens and components",
        variables: [
          { name: "brand", description: "Brand name", defaultValue: "Skyverses" },
          { name: "personality", description: "Brand personality", defaultValue: "futuristic, creative, professional yet playful" },
          { name: "industry", description: "Industry", defaultValue: "AI/SaaS" },
          { name: "platform", description: "Primary platform", defaultValue: "web application (responsive)" },
        ],
      },
    ],
  },
  {
    title: "AI Image Prompt Mastery",
    category: "design",
    tags: ["midjourney", "dalle", "stable-diffusion", "image-prompts"],
    priceSKT: 55,
    featured: true,
    sellerIdx: 7,
    description: "Master AI image generation with structured prompts for Midjourney, DALL-E, and Stable Diffusion. Includes style references, composition guides, and parameter optimization.",
    previewText: "Generate a {{style}} image of {{subject}} with cinematic lighting...",
    coverImage: "https://images.unsplash.com/photo-1633412802994-5c058f151b66?w=800&q=80",
    prompts: [
      {
        title: "Cinematic Scene Generator",
        content: "Generate a detailed AI image prompt for a cinematic scene.\n\nSubject: {{subject}}\nMood: {{mood}}\nStyle reference: {{styleRef}}\n\nPrompt structure:\n[Subject description] + [Environment/setting] + [Lighting] + [Camera angle/lens] + [Color palette] + [Style modifiers] + [Technical parameters]\n\nGenerate 5 prompt variations:\n1. **Photorealistic** — hyperrealistic, 8K, shot on Sony A7IV\n2. **Cinematic** — anamorphic lens, film grain, Kodak Portra\n3. **Concept Art** — digital painting, artstation trending\n4. **Anime/Manga** — Studio Ghibli/Makoto Shinkai style\n5. **Dark & Moody** — chiaroscuro, noir, dramatic shadows\n\nFor each variation include:\n- Full prompt text (copy-paste ready)\n- Negative prompt\n- Recommended model (Midjourney v6 / SDXL / DALL-E 3)\n- Recommended parameters (--ar, --style, --chaos, CFG scale)\n\nAlso include 3 composition tips specific to this scene.",
        description: "5 style variations with parameters for any scene",
        variables: [
          { name: "subject", description: "Main subject", defaultValue: "a lone astronaut standing on a cliff overlooking an alien ocean" },
          { name: "mood", description: "Desired mood", defaultValue: "awe-inspiring, solitary, hopeful" },
          { name: "styleRef", description: "Style reference", defaultValue: "Blade Runner 2049 meets Interstellar" },
        ],
      },
      {
        title: "Product Photography Prompt",
        content: "Create AI image prompts for product photography.\n\nProduct: {{product}}\nBrand style: {{brandStyle}}\nUse case: {{useCase}}\n\nGenerate 6 product shot prompts:\n1. **Hero shot** — clean white/gradient background, dramatic lighting\n2. **Lifestyle** — product in use, natural environment\n3. **Flat lay** — overhead, arranged with complementary props\n4. **Detail/macro** — close-up texture and material quality\n5. **Environmental** — product in context (desk, studio, outdoor)\n6. **Social media** — Instagram-ready, trending aesthetic\n\nFor each include:\n- Full prompt text\n- Lighting setup (key, fill, rim, background)\n- Color palette suggestion\n- Aspect ratio recommendation\n- Post-processing style notes",
        description: "6 product photography styles with lighting specs",
        variables: [
          { name: "product", description: "Product to photograph", defaultValue: "premium wireless headphones, matte black" },
          { name: "brandStyle", description: "Brand aesthetic", defaultValue: "minimalist, premium, Apple-like" },
          { name: "useCase", description: "Where photos will be used", defaultValue: "e-commerce product page and Instagram ads" },
        ],
      },
    ],
  },
  {
    title: "Logo & Brand Identity Concepts",
    category: "design",
    tags: ["logo", "branding", "identity", "brand-guide"],
    priceSKT: 60,
    sellerIdx: 7,
    description: "Generate logo concepts and brand identity guidelines. Includes logomark ideas, color psychology, typography pairing, and brand usage rules.",
    previewText: "Design a logo concept for {{brand}} that conveys {{values}}...",
    coverImage: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&q=80",
    prompts: [
      {
        title: "Logo Concept & Brand Identity",
        content: "Generate logo concepts and brand identity guidelines for {{brand}}.\n\nBrand description: {{description}}\nCore values: {{values}}\nTarget audience: {{audience}}\nCompetitor logos to differentiate from: {{competitors}}\n\nGenerate:\n\n**Logo Concepts (5 directions)**\nFor each:\n- Concept name and rationale\n- Visual description (shapes, symbols, letterforms)\n- AI image prompt to generate it\n- Color recommendation with psychology reasoning\n- How it looks at small sizes (favicon, app icon)\n\n**Brand Identity**\n- Primary + secondary color palette (5 colors with hex)\n- Typography pairing (heading + body + accent)\n- Photography style guide\n- Iconography style\n- Tone of voice (3 adjectives + examples)\n- Do's and Don'ts (5 each)\n\n**Applications**\n- Business card layout\n- Social media avatar specs\n- Email signature\n- Presentation template direction",
        description: "5 logo concepts with complete brand identity",
        variables: [
          { name: "brand", description: "Brand name", defaultValue: "Skyverses" },
          { name: "description", description: "What the brand does", defaultValue: "AI creative platform for generating images, videos, and digital content" },
          { name: "values", description: "Core values", defaultValue: "innovation, creativity, accessibility, professional quality" },
          { name: "audience", description: "Target audience", defaultValue: "creative professionals, marketers, and content creators" },
          { name: "competitors", description: "Competitors", defaultValue: "Canva (playful), Adobe (corporate), Midjourney (artistic)" },
        ],
      },
    ],
  },
  {
    title: "Mobile App UI Wireframe Specs",
    category: "design",
    tags: ["mobile", "wireframe", "app-design", "ios", "android"],
    priceSKT: 50,
    sellerIdx: 3,
    description: "Generate detailed mobile app wireframe specifications. Screen flows, component layouts, navigation patterns, and interaction descriptions.",
    previewText: "Design wireframe specs for a {{appType}} mobile app with {{screens}} screens...",
    coverImage: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80",
    prompts: [
      {
        title: "Mobile App Screen Specs",
        content: "Generate detailed wireframe specifications for a {{appType}} mobile app.\n\nApp purpose: {{purpose}}\nPlatform: {{platform}}\nKey screens: {{screens}}\n\nFor each screen generate:\n1. **Layout description** (zones: header, body, footer, FAB)\n2. **Components list** with sizes and positions\n3. **Content hierarchy** (what's most important)\n4. **Interaction notes** (tap, swipe, long press, pull-to-refresh)\n5. **Navigation** (how to get here, where you can go)\n6. **States** (empty, loading, error, populated, first-time)\n7. **Accessibility notes** (VoiceOver labels, touch target sizes)\n\nAlso include:\n- Navigation pattern (tab bar, drawer, stack)\n- Gesture map\n- Animation/transition descriptions\n- Platform-specific guidelines (iOS HIG / Material Design)\n\nOutput as structured spec, ready for designer handoff.",
        description: "Detailed wireframe specs for mobile app screens",
        variables: [
          { name: "appType", description: "App type", defaultValue: "social fitness" },
          { name: "purpose", description: "App purpose", defaultValue: "track workouts, share progress, join challenges with friends" },
          { name: "platform", description: "Platform", defaultValue: "iOS and Android (cross-platform)" },
          { name: "screens", description: "Key screens", defaultValue: "Home feed, Workout tracker, Profile, Challenges, Social feed, Settings" },
        ],
      },
    ],
  },
  {
    title: "AI Video Prompt Templates",
    category: "design",
    tags: ["video-prompts", "sora", "runway", "ai-video"],
    priceSKT: 85,
    sellerIdx: 9,
    description: "Structured prompts for AI video generation (Sora, Runway, Kling). Camera movements, scene descriptions, and cinematic techniques for stunning AI videos.",
    previewText: "Generate a cinematic AI video prompt: {{scene}} with {{cameraMove}}...",
    coverImage: "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&q=80",
    prompts: [
      {
        title: "Cinematic Video Scene",
        content: "Create an AI video generation prompt for a cinematic scene.\n\nScene: {{scene}}\nDuration: {{duration}} seconds\nAspect ratio: {{aspectRatio}}\n\nPrompt formula: [Camera movement] + [Subject action] + [Environment] + [Lighting] + [Atmosphere] + [Style]\n\nGenerate 4 variations:\n\n1. **Epic wide shot** — Crane/drone movement, establishing shot\n   Prompt: ...\n   Camera: ...\n   Lighting: ...\n\n2. **Intimate close-up** — Slow push-in, shallow depth of field\n   Prompt: ...\n   Camera: ...\n   Lighting: ...\n\n3. **Dynamic tracking** — Following subject, Steadicam feel\n   Prompt: ...\n   Camera: ...\n   Lighting: ...\n\n4. **Artistic/abstract** — Unconventional angle, experimental\n   Prompt: ...\n   Camera: ...\n   Lighting: ...\n\nFor each include:\n- Full prompt text (optimized for {{model}})\n- Negative prompt\n- Recommended settings (CFG, steps, motion intensity)\n- Transition suggestion to next shot\n- Reference film/director for style",
        description: "4 cinematic video prompt variations with camera directions",
        variables: [
          { name: "scene", description: "Scene description", defaultValue: "a woman walking through a neon-lit Tokyo alley at night in the rain" },
          { name: "duration", description: "Duration in seconds", defaultValue: "5" },
          { name: "aspectRatio", description: "Aspect ratio", defaultValue: "16:9" },
          { name: "model", description: "AI video model", defaultValue: "Runway Gen-3 Alpha" },
        ],
      },
      {
        title: "Product Demo Video Prompt",
        content: "Create an AI video prompt for a product demo/advertisement.\n\nProduct: {{product}}\nStyle: {{style}}\nMessage: {{message}}\n\nGenerate a 3-shot sequence:\n\n**Shot 1: The Hook (2s)**\n- Attention-grabbing opener\n- Prompt: ...\n- Camera: ...\n\n**Shot 2: The Demo (3s)**\n- Product in action, hero moment\n- Prompt: ...\n- Camera: ...\n\n**Shot 3: The Close (2s)**\n- Logo/tagline reveal, call to action\n- Prompt: ...\n- Camera: ...\n\nFor each shot:\n- Full generation prompt\n- Transition from previous shot\n- Color grading direction\n- Sound design suggestion\n\nAlso include:\n- Storyboard text description\n- Music/soundtrack mood recommendation\n- Thumbnail frame selection",
        description: "3-shot product video sequence with storyboard",
        variables: [
          { name: "product", description: "Product", defaultValue: "sleek wireless earbuds" },
          { name: "style", description: "Visual style", defaultValue: "Apple-style minimal, white background with dramatic lighting" },
          { name: "message", description: "Key message", defaultValue: "Sound without boundaries" },
        ],
      },
    ],
  },
  {
    title: "Web Layout Patterns Collection",
    category: "design",
    tags: ["web-design", "layouts", "css", "responsive"],
    priceSKT: 35,
    sellerIdx: 3,
    description: "Generate responsive web layout specifications with CSS/Tailwind code. Hero sections, pricing tables, feature grids, testimonials, and more.",
    previewText: "Design a {{layoutType}} section for a {{siteType}} website...",
    coverImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
    prompts: [
      {
        title: "Section Layout Generator",
        content: "Generate a responsive web section layout for a {{siteType}} website.\n\nSection type: {{layoutType}}\nDesign style: {{style}}\nFramework: {{framework}}\n\nGenerate:\n1. **Layout specification** — grid/flex structure, spacing, alignment\n2. **Responsive behavior** — mobile, tablet, desktop breakpoints\n3. **Code** — HTML + {{framework}} classes\n4. **Content placeholders** — realistic dummy content\n5. **Animation suggestions** — entrance, hover, scroll-triggered\n6. **Dark mode variant** — color adjustments\n\nDesign principles:\n- Visual hierarchy (F-pattern or Z-pattern)\n- Whitespace ratio (at least 40%)\n- Consistent spacing using 8px grid\n- Accessible color contrast\n- Touch-friendly targets on mobile\n\nReturn production-ready code.",
        description: "Responsive section layouts with code",
        variables: [
          { name: "siteType", description: "Website type", defaultValue: "SaaS landing page" },
          { name: "layoutType", description: "Section type", defaultValue: "pricing table with 3 tiers, toggle monthly/annual" },
          { name: "style", description: "Design style", defaultValue: "dark theme, glass morphism, purple accent" },
          { name: "framework", description: "CSS framework", defaultValue: "Tailwind CSS" },
        ],
      },
    ],
  },
  {
    title: "Presentation Slide Design Guide",
    category: "design",
    tags: ["presentation", "slides", "pitch-deck", "keynote"],
    priceSKT: 30,
    sellerIdx: 7,
    description: "Create visually stunning presentation slides with layout specs, content structure, and visual direction for each slide type.",
    previewText: "Design a {{slideType}} slide for a {{presentationType}} presentation...",
    coverImage: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80",
    prompts: [
      {
        title: "Pitch Deck Slide Layouts",
        content: "Design a {{slideCount}}-slide pitch deck for {{company}}.\n\nCompany: {{companyDescription}}\nAudience: {{audience}}\nGoal: {{goal}}\n\nFor each slide generate:\n1. **Slide title** and purpose\n2. **Layout** (text/image split, full visual, data-heavy, etc.)\n3. **Content** — exact text, bullets, numbers\n4. **Visual direction** — what image/graphic to use\n5. **Speaker notes** — what to say (30 seconds per slide)\n6. **Design tips** — colors, fonts, emphasis\n\nSlide sequence:\n1. Title / Hook\n2. Problem\n3. Solution\n4. Demo / Product\n5. Market Size\n6. Business Model\n7. Traction / Metrics\n8. Team\n9. Ask / CTA\n10. Contact\n\nDesign principles: one idea per slide, maximum 6 words in headlines, visual > text.",
        description: "Complete pitch deck with content and visual direction",
        variables: [
          { name: "slideCount", description: "Number of slides", defaultValue: "10" },
          { name: "company", description: "Company name", defaultValue: "Skyverses" },
          { name: "companyDescription", description: "What it does", defaultValue: "AI creative platform for professional image and video generation" },
          { name: "audience", description: "Presentation audience", defaultValue: "seed-stage VCs" },
          { name: "goal", description: "Presentation goal", defaultValue: "raise $2M seed round" },
        ],
      },
    ],
  },

  // ═══════════════ BUSINESS (7) ═══════════════
  {
    title: "Business Plan Generator",
    category: "business",
    tags: ["business-plan", "startup", "strategy", "financial"],
    priceSKT: 100,
    featured: true,
    sellerIdx: 4,
    description: "Generate comprehensive business plans with market analysis, financial projections, and go-to-market strategy. Investor-ready format.",
    previewText: "Create a business plan for {{business}} in the {{industry}} industry...",
    coverImage: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
    prompts: [
      {
        title: "Full Business Plan",
        content: "Generate a comprehensive business plan for {{business}}.\n\nIndustry: {{industry}}\nBusiness model: {{model}}\nTarget market: {{market}}\nFunding stage: {{stage}}\n\nSections:\n\n1. **Executive Summary** (1 page)\n2. **Problem & Solution** — validate with market data\n3. **Market Analysis** — TAM/SAM/SOM, trends, growth rate\n4. **Competitive Landscape** — positioning matrix, moat\n5. **Product/Service** — features, roadmap, tech stack\n6. **Business Model** — revenue streams, unit economics\n7. **Go-to-Market Strategy** — channels, partnerships, timeline\n8. **Operations Plan** — team, tools, processes\n9. **Financial Projections** (3 years)\n   - Revenue forecast (conservative/base/optimistic)\n   - Cost structure (fixed vs variable)\n   - Break-even analysis\n   - Key metrics: CAC, LTV, LTV/CAC ratio, payback period\n10. **Funding Ask** — amount, use of funds, milestones\n11. **Risk Analysis** — top 5 risks with mitigation strategies\n\nFormat: professional, data-driven, investor-ready.",
        description: "Investor-ready business plan with financials",
        variables: [
          { name: "business", description: "Business name", defaultValue: "Skyverses" },
          { name: "industry", description: "Industry", defaultValue: "AI/Creative Technology" },
          { name: "model", description: "Business model", defaultValue: "freemium SaaS with credit-based usage" },
          { name: "market", description: "Target market", defaultValue: "content creators, marketers, and small creative agencies globally" },
          { name: "stage", description: "Funding stage", defaultValue: "pre-seed / bootstrapped" },
        ],
      },
    ],
  },
  {
    title: "OKR & KPI Framework Builder",
    category: "business",
    tags: ["okr", "kpi", "goals", "metrics", "performance"],
    priceSKT: 45,
    sellerIdx: 4,
    description: "Build OKR frameworks and KPI dashboards for any team. Includes objective setting, key results, scoring, and review templates.",
    previewText: "Create OKRs for the {{team}} team for {{quarter}}...",
    coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    prompts: [
      {
        title: "Quarterly OKR Framework",
        content: "Create a quarterly OKR (Objectives & Key Results) framework for {{team}}.\n\nCompany context: {{context}}\nQuarter: {{quarter}}\nTeam size: {{teamSize}}\nTop priority: {{priority}}\n\nGenerate:\n\n**Company-level OKRs** (2-3 objectives, 3-4 KRs each)\n\n**Team-level OKRs** (3-4 objectives aligned to company OKRs)\nFor each objective:\n- Objective statement (inspiring, qualitative)\n- 3-4 Key Results (measurable, with specific targets)\n- Initiatives/projects to achieve each KR\n- Owner for each KR\n- Scoring criteria (0.0-1.0 scale)\n- Leading indicators to track weekly\n\n**Supporting elements:**\n- Weekly check-in template\n- Monthly review agenda\n- End-of-quarter retrospective format\n- Common OKR anti-patterns to avoid\n- How to cascade OKRs to individual contributors\n\nMake KRs SMART: Specific, Measurable, Achievable, Relevant, Time-bound.",
        description: "Complete OKR framework with review templates",
        variables: [
          { name: "team", description: "Team name", defaultValue: "Product Engineering" },
          { name: "context", description: "Company context", defaultValue: "Series A SaaS, 30 employees, rapid growth phase" },
          { name: "quarter", description: "Quarter", defaultValue: "Q3 2026" },
          { name: "teamSize", description: "Team size", defaultValue: "8 engineers + 1 PM + 1 designer" },
          { name: "priority", description: "Top priority", defaultValue: "reduce churn from 8% to 4% monthly" },
        ],
      },
    ],
  },
  {
    title: "Customer Interview & Research Kit",
    category: "business",
    tags: ["user-research", "interviews", "customer-discovery", "surveys"],
    priceSKT: 35,
    sellerIdx: 4,
    description: "Structured templates for customer interviews, surveys, and user research. Includes question frameworks, analysis methods, and insight synthesis.",
    previewText: "Design a customer interview guide for understanding {{topic}}...",
    coverImage: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80",
    prompts: [
      {
        title: "Customer Interview Guide",
        content: "Create a comprehensive customer interview guide for {{topic}}.\n\nProduct: {{product}}\nInterview goal: {{goal}}\nTarget interviewee: {{persona}}\n\nGenerate:\n\n**Pre-Interview**\n- Screening criteria (who to talk to)\n- Scheduling email template\n- Preparation checklist\n\n**Interview Script (45 min)**\n1. **Warm-up** (5 min) — Build rapport, context setting\n2. **Current Behavior** (10 min) — How they do things today\n3. **Pain Points** (10 min) — What's frustrating, what fails\n4. **Ideal Solution** (10 min) — What would perfect look like\n5. **Reaction to Concept** (5 min) — Show prototype/mockup\n6. **Wrap-up** (5 min) — Referrals, follow-up permission\n\n**Question Types:**\n- 5 open-ended discovery questions\n- 3 \"tell me about a time when...\" stories\n- 3 ranking/prioritization exercises\n- 2 \"magic wand\" hypotheticals\n\n**Post-Interview**\n- Synthesis template (key quotes, insights, surprises)\n- Affinity mapping guide\n- Insight → Action framework\n\nRules: No leading questions, no \"would you use X?\", focus on past behavior not future predictions.",
        description: "Complete interview guide with analysis framework",
        variables: [
          { name: "topic", description: "Research topic", defaultValue: "content creation workflow pain points" },
          { name: "product", description: "Product", defaultValue: "Skyverses AI" },
          { name: "goal", description: "Interview goal", defaultValue: "understand why users churn after first month" },
          { name: "persona", description: "Target persona", defaultValue: "freelance content creators who tried AI tools and stopped using them" },
        ],
      },
    ],
  },
  {
    title: "Financial Model Templates",
    category: "business",
    tags: ["financial-model", "spreadsheet", "saas-metrics", "forecasting"],
    priceSKT: 80,
    sellerIdx: 4,
    description: "Build financial models for SaaS businesses. MRR forecasting, cohort analysis, unit economics, and investor-ready financial statements.",
    previewText: "Build a SaaS financial model for {{company}} with {{mrr}} current MRR...",
    coverImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
    prompts: [
      {
        title: "SaaS Financial Model",
        content: "Build a SaaS financial model for {{company}}.\n\nCurrent metrics:\n- MRR: {{mrr}}\n- Customers: {{customers}}\n- Monthly churn: {{churn}}\n- CAC: {{cac}}\n- ARPU: {{arpu}}\n\nGenerate:\n\n**Revenue Model (24-month projection)**\n- New MRR (from growth rate assumptions)\n- Expansion MRR (upsells, plan upgrades)\n- Churned MRR\n- Net New MRR\n- ARR trajectory\n\n**Unit Economics**\n- LTV calculation (with methodology)\n- LTV/CAC ratio\n- Payback period (months)\n- Gross margin per customer\n\n**Cost Structure**\n- COGS (hosting, API costs, support)\n- S&M (by channel)\n- R&D (team costs)\n- G&A\n- Burn rate and runway\n\n**Key Outputs**\n- Monthly P&L summary (24 months)\n- Cash flow projection\n- Break-even month\n- Funding needs analysis\n\nFormat as spreadsheet-ready formulas with row/column references.\nInclude sensitivity analysis for churn rate and growth rate.",
        description: "24-month SaaS financial model with formulas",
        variables: [
          { name: "company", description: "Company", defaultValue: "Skyverses" },
          { name: "mrr", description: "Current MRR", defaultValue: "$5,000" },
          { name: "customers", description: "Current customers", defaultValue: "200" },
          { name: "churn", description: "Monthly churn rate", defaultValue: "6%" },
          { name: "cac", description: "Customer acquisition cost", defaultValue: "$30" },
          { name: "arpu", description: "Average revenue per user", defaultValue: "$25" },
        ],
      },
    ],
  },
  {
    title: "Meeting Agenda & Minutes System",
    category: "business",
    tags: ["meetings", "agenda", "minutes", "productivity"],
    priceSKT: 0,
    isFree: true,
    sellerIdx: 8,
    description: "Templates for running effective meetings. Agendas, minutes, action items, and follow-up workflows. Free for better meetings everywhere.",
    previewText: "Create a {{meetingType}} meeting agenda for {{topic}}...",
    coverImage: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",
    prompts: [
      {
        title: "Meeting Agenda Generator",
        content: "Create a structured meeting agenda for a {{meetingType}} meeting.\n\nTopic: {{topic}}\nDuration: {{duration}} minutes\nAttendees: {{attendees}}\nGoal: {{goal}}\n\nGenerate:\n\n**Pre-Meeting**\n- Required pre-reading (with links placeholders)\n- Questions to come prepared with\n\n**Agenda**\nFor each item:\n- Time allocation\n- Topic and description\n- Owner/presenter\n- Type: decision, discussion, FYI, brainstorm\n- Expected outcome\n\n**Meeting Rules**\n- Parking lot for off-topic items\n- Decision-making method (consent, consensus, command)\n\n**Post-Meeting Template**\n- Key decisions made\n- Action items (who, what, by when)\n- Open questions\n- Next meeting date/agenda preview\n\nTimebox strictly — no agenda item should exceed 15 minutes.",
        description: "Structured meeting agenda with follow-up template",
        variables: [
          { name: "meetingType", description: "Meeting type", defaultValue: "sprint planning" },
          { name: "topic", description: "Meeting topic", defaultValue: "Q3 product roadmap prioritization" },
          { name: "duration", description: "Duration (minutes)", defaultValue: "60" },
          { name: "attendees", description: "Who's attending", defaultValue: "PM, 3 engineers, designer, QA lead" },
          { name: "goal", description: "Meeting goal", defaultValue: "agree on top 5 features for next sprint" },
        ],
      },
    ],
  },
  {
    title: "Startup Pitch Script Builder",
    category: "business",
    tags: ["pitch", "startup", "elevator-pitch", "investor"],
    priceSKT: 40,
    sellerIdx: 4,
    description: "Craft compelling pitch scripts for different contexts: 30-second elevator pitch, 3-minute demo day, and 15-minute investor meeting.",
    previewText: "Write a {{pitchType}} pitch for {{startup}} targeting {{audience}}...",
    coverImage: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&q=80",
    prompts: [
      {
        title: "Multi-Format Pitch Scripts",
        content: "Write pitch scripts for {{startup}} in 3 formats.\n\nStartup: {{description}}\nTraction: {{traction}}\nAsk: {{ask}}\n\n**Format 1: Elevator Pitch (30 seconds)**\nFormula: For [target customer] who [pain point], [product] is a [category] that [key benefit]. Unlike [competitor], we [differentiator].\n\n**Format 2: Demo Day Pitch (3 minutes)**\nStructure: Hook → Problem → Solution → Demo moment → Market → Traction → Team → Ask\nInclude audience engagement moment.\n\n**Format 3: Investor Meeting (15 minutes)**\nStructure:\n- Story hook (1 min)\n- Problem deep-dive with data (2 min)\n- Solution + demo (3 min)\n- Market sizing (2 min)\n- Business model + unit economics (2 min)\n- Traction + growth (2 min)\n- Team + unfair advantage (1 min)\n- Ask + use of funds (1 min)\n- Q&A prep: top 10 investor questions with answers\n\nFor each format include:\n- Word-for-word script\n- Delivery notes (pause, emphasis, gesture)\n- Common mistakes to avoid",
        description: "3 pitch formats: elevator, demo day, investor meeting",
        variables: [
          { name: "startup", description: "Startup name", defaultValue: "Skyverses" },
          { name: "description", description: "What it does", defaultValue: "AI platform that lets anyone create professional images and videos in minutes, not hours" },
          { name: "traction", description: "Current traction", defaultValue: "5,000 users, $5K MRR, 40% MoM growth, 200K images generated" },
          { name: "ask", description: "Funding ask", defaultValue: "$500K pre-seed to hire 2 engineers and scale to 50K users" },
        ],
      },
    ],
  },
  {
    title: "SOPs & Process Documentation",
    category: "business",
    tags: ["sop", "processes", "operations", "documentation"],
    priceSKT: 30,
    sellerIdx: 8,
    description: "Create clear Standard Operating Procedures for any business process. Step-by-step guides with decision trees, checklists, and ownership assignment.",
    previewText: "Write an SOP for {{process}} in the {{department}} department...",
    coverImage: "https://images.unsplash.com/photo-1586282391129-76a6df230234?w=800&q=80",
    prompts: [
      {
        title: "Standard Operating Procedure",
        content: "Create a comprehensive SOP for {{process}}.\n\nDepartment: {{department}}\nFrequency: {{frequency}}\nOwner role: {{owner}}\n\nSOP sections:\n\n1. **Purpose** — Why this process exists\n2. **Scope** — What's included/excluded\n3. **Prerequisites** — Required access, tools, knowledge\n4. **Step-by-Step Procedure**\n   - Numbered steps with screenshots placeholders\n   - Decision points as if/then branches\n   - Time estimate per step\n   - Common errors and how to fix them\n5. **Quality Checklist** — Verification steps\n6. **Escalation Path** — When and who to escalate to\n7. **Metrics** — How to measure process success\n8. **Revision History** — Version tracking template\n\nFormat: Clear, unambiguous language. A new hire should be able to follow this on day one.\nInclude: flowchart description (text-based) of the process.",
        description: "Complete SOP with decision trees and checklists",
        variables: [
          { name: "process", description: "Process name", defaultValue: "customer refund processing" },
          { name: "department", description: "Department", defaultValue: "Customer Support" },
          { name: "frequency", description: "How often", defaultValue: "as needed, ~20 per week" },
          { name: "owner", description: "Process owner", defaultValue: "Support Team Lead" },
        ],
      },
    ],
  },

  // ═══════════════ EDUCATION (7) ═══════════════
  {
    title: "Course Curriculum Designer",
    category: "education",
    tags: ["curriculum", "course-design", "e-learning", "lesson-plans"],
    priceSKT: 60,
    featured: true,
    sellerIdx: 8,
    description: "Design complete online courses with learning objectives, lesson plans, assessments, and engagement strategies. For educators and course creators.",
    previewText: "Design a {{duration}}-week course on {{subject}} for {{level}} learners...",
    coverImage: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80",
    prompts: [
      {
        title: "Online Course Blueprint",
        content: "Design a complete online course curriculum.\n\nSubject: {{subject}}\nTarget learner: {{learner}}\nDuration: {{duration}} weeks\nFormat: {{format}}\n\nGenerate:\n\n**Course Overview**\n- Course title (compelling, SEO-friendly)\n- Tagline (under 15 words)\n- Learning outcomes (5-7, using Bloom's taxonomy verbs)\n- Prerequisites\n- Who this is for / not for\n\n**Module Breakdown** (1 module per week)\nFor each module:\n- Module title and learning objectives\n- Video lessons (titles + duration + key points)\n- Reading materials / resources\n- Hands-on exercise / project\n- Quiz (5 questions with answers)\n- Discussion prompt\n\n**Capstone Project**\n- Project description\n- Rubric with scoring criteria\n- Peer review guidelines\n\n**Engagement Strategy**\n- Gamification elements\n- Community building activities\n- Email drip for each week (prevent dropout)\n- Completion certificate criteria\n\nDesign for self-paced learning with optional live sessions.",
        description: "Complete course curriculum with assessments",
        variables: [
          { name: "subject", description: "Course subject", defaultValue: "AI Prompt Engineering for Creative Professionals" },
          { name: "learner", description: "Target learner", defaultValue: "designers and marketers with no AI experience" },
          { name: "duration", description: "Duration in weeks", defaultValue: "6" },
          { name: "format", description: "Course format", defaultValue: "pre-recorded video + weekly live Q&A" },
        ],
      },
    ],
  },
  {
    title: "Study Guide & Flashcard Generator",
    category: "education",
    tags: ["study-guide", "flashcards", "exam-prep", "learning"],
    priceSKT: 0,
    isFree: true,
    sellerIdx: 8,
    description: "Transform any topic into effective study materials. Summaries, flashcards, practice questions, and spaced repetition schedules. Free for students.",
    previewText: "Create study materials for {{topic}} at {{level}} level...",
    coverImage: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80",
    prompts: [
      {
        title: "Comprehensive Study Guide",
        content: "Create a comprehensive study guide for {{topic}}.\n\nSubject area: {{subject}}\nLevel: {{level}}\nExam/goal: {{exam}}\n\nGenerate:\n\n**1. Topic Summary** (500 words)\n- Key concepts explained simply\n- Visual analogy for each difficult concept\n- Common misconceptions to avoid\n\n**2. Flashcards** (20 cards)\nFormat: Front (question) → Back (answer + explanation)\n- Mix of: definitions, applications, comparisons\n- Include mnemonics where helpful\n\n**3. Practice Questions** (15 questions)\n- 5 multiple choice (with explanations for wrong answers)\n- 5 short answer\n- 5 application/scenario-based\n- Answer key with detailed solutions\n\n**4. Concept Map**\n- Text-based diagram showing relationships between concepts\n- Prerequisite knowledge chain\n\n**5. Study Schedule**\n- Spaced repetition plan (1, 3, 7, 14, 30 days)\n- Active recall techniques specific to this topic\n- Pomodoro session breakdown\n\n**6. Quick Reference Sheet** (1-page cheat sheet)\n- Formulas, key terms, critical dates/facts",
        description: "Complete study materials with flashcards and practice",
        variables: [
          { name: "topic", description: "Study topic", defaultValue: "Machine Learning Fundamentals" },
          { name: "subject", description: "Subject area", defaultValue: "Computer Science" },
          { name: "level", description: "Learning level", defaultValue: "undergraduate / beginner" },
          { name: "exam", description: "Exam or goal", defaultValue: "midterm exam covering supervised learning, neural networks, and evaluation metrics" },
        ],
      },
    ],
  },
  {
    title: "Workshop Facilitation Toolkit",
    category: "education",
    tags: ["workshop", "facilitation", "training", "activities"],
    priceSKT: 40,
    sellerIdx: 8,
    description: "Design and facilitate engaging workshops. Includes ice-breakers, activities, time management, and participant engagement strategies.",
    previewText: "Design a {{duration}}-hour workshop on {{topic}} for {{groupSize}} people...",
    coverImage: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80",
    prompts: [
      {
        title: "Workshop Design",
        content: "Design a complete workshop on {{topic}}.\n\nDuration: {{duration}} hours\nGroup size: {{groupSize}} people\nFormat: {{format}}\nLearning goals: {{goals}}\n\nGenerate:\n\n**Preparation**\n- Materials needed (physical + digital)\n- Room/space setup diagram (text)\n- Pre-workshop survey (3 questions)\n- Participant pre-work (optional)\n\n**Workshop Flow**\n\nFor each activity block:\n- Time allocation\n- Activity name and type (lecture, discussion, hands-on, breakout)\n- Facilitator instructions (what to say/do)\n- Participant instructions\n- Materials needed\n- Energy level (high/medium/low)\n- Debrief questions\n\nInclude:\n- 2 ice-breaker options\n- 2 energizer activities (for post-lunch slump)\n- Breakout group activities with clear prompts\n- Gallery walk / showcase activity\n\n**Post-Workshop**\n- Feedback form (5 questions)\n- Follow-up email template\n- Resource list for continued learning\n- 30-day challenge to apply learnings\n\nPacing: alternate between high and low energy. Never lecture for more than 15 minutes.",
        description: "Complete workshop design with facilitation guide",
        variables: [
          { name: "topic", description: "Workshop topic", defaultValue: "Design Thinking for Product Teams" },
          { name: "duration", description: "Duration (hours)", defaultValue: "4" },
          { name: "groupSize", description: "Group size", defaultValue: "20" },
          { name: "format", description: "Format", defaultValue: "in-person with some digital tools" },
          { name: "goals", description: "Learning goals", defaultValue: "understand design thinking phases, practice empathy mapping, create actionable prototypes" },
        ],
      },
    ],
  },
  {
    title: "Coding Tutorial Creator",
    category: "education",
    tags: ["coding-tutorial", "programming", "beginner", "step-by-step"],
    priceSKT: 45,
    sellerIdx: 2,
    description: "Create clear, beginner-friendly coding tutorials with step-by-step explanations, code examples, challenges, and common pitfall warnings.",
    previewText: "Create a coding tutorial for {{topic}} using {{language}}...",
    coverImage: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80",
    prompts: [
      {
        title: "Step-by-Step Coding Tutorial",
        content: "Create a beginner-friendly coding tutorial.\n\nTopic: {{topic}}\nLanguage: {{language}}\nPrerequisites: {{prerequisites}}\nEstimated time: {{time}}\n\nTutorial structure:\n\n**1. Introduction** (What we're building + screenshot/demo description)\n\n**2. Setup** (Environment, dependencies, starter code)\n\n**3. Step-by-Step Guide**\nFor each step:\n- What we're doing and WHY (not just how)\n- Code snippet with syntax highlighting\n- Line-by-line explanation of new concepts\n- \"Try it yourself\" checkpoint\n- Common mistake warning (⚠️)\n- Expected output/result\n\n**4. Challenges** (3 levels)\n- 🟢 Easy: modify one thing\n- 🟡 Medium: add a feature\n- 🔴 Hard: refactor or optimize\n- Solutions (hidden/expandable)\n\n**5. Key Takeaways** (5 bullet points)\n\n**6. Next Steps** (what to learn next)\n\nStyle: conversational, encouraging, celebrate progress. Use analogies for abstract concepts. Never assume knowledge not listed in prerequisites.",
        description: "Beginner-friendly tutorial with challenges",
        variables: [
          { name: "topic", description: "Tutorial topic", defaultValue: "Building a REST API from scratch" },
          { name: "language", description: "Programming language", defaultValue: "TypeScript with Express.js" },
          { name: "prerequisites", description: "What learner should know", defaultValue: "basic JavaScript, what HTTP is, how to use terminal" },
          { name: "time", description: "Estimated completion time", defaultValue: "2 hours" },
        ],
      },
    ],
  },
  {
    title: "Language Learning Conversation Practice",
    category: "education",
    tags: ["language-learning", "conversation", "roleplay", "vocabulary"],
    priceSKT: 25,
    sellerIdx: 8,
    description: "Practice conversations in any language with AI. Role-play scenarios, vocabulary builders, grammar exercises, and pronunciation guides.",
    previewText: "Practice {{language}} conversation in a {{scenario}} scenario...",
    coverImage: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&q=80",
    prompts: [
      {
        title: "Conversation Role-Play",
        content: "Create a conversation practice session in {{language}}.\n\nLearner level: {{level}}\nScenario: {{scenario}}\nFocus skill: {{focus}}\n\nGenerate:\n\n**Vocabulary Warm-up** (10 key words/phrases for this scenario)\n- Word in target language\n- Pronunciation guide (phonetic)\n- English meaning\n- Example sentence\n\n**Conversation Script** (Model dialogue)\n- 10-12 exchanges between two speakers\n- Natural, colloquial language (not textbook-stiff)\n- Cultural notes where relevant [in brackets]\n- Grammar points highlighted in **bold**\n\n**Interactive Practice**\n- 5 fill-in-the-blank exercises from the dialogue\n- 3 \"How would you say...?\" challenges\n- 1 free-response prompt for AI conversation practice\n\n**Grammar Spotlight**\n- 1 grammar pattern from the dialogue, explained simply\n- 5 practice sentences using this pattern\n- Common errors native speakers of English make\n\n**Cultural Tip**\n- One cultural insight related to this scenario",
        description: "Conversation practice with vocabulary and grammar",
        variables: [
          { name: "language", description: "Target language", defaultValue: "Japanese" },
          { name: "level", description: "Learner level", defaultValue: "intermediate (N3)" },
          { name: "scenario", description: "Conversation scenario", defaultValue: "ordering food at a restaurant and asking for recommendations" },
          { name: "focus", description: "Skill focus", defaultValue: "polite request forms and food vocabulary" },
        ],
      },
    ],
  },
  {
    title: "Exam Question Bank Builder",
    category: "education",
    tags: ["exam", "assessment", "questions", "rubric"],
    priceSKT: 35,
    sellerIdx: 8,
    description: "Generate exam questions at various difficulty levels with answer keys, rubrics, and Bloom's taxonomy alignment. For teachers and professors.",
    previewText: "Create exam questions for {{subject}} covering {{topics}}...",
    coverImage: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=800&q=80",
    prompts: [
      {
        title: "Exam Question Bank",
        content: "Create an exam question bank for {{subject}}.\n\nTopics covered: {{topics}}\nStudent level: {{level}}\nExam duration: {{duration}} minutes\n\nGenerate {{questionCount}} questions distributed as:\n\n**Section A: Multiple Choice ({{mcCount}} questions, 1 point each)**\n- 4 options, 1 correct\n- Include plausible distractors\n- Mark correct answer\n- Brief explanation for each answer\n\n**Section B: Short Answer ({{saCount}} questions, 3 points each)**\n- Clear, unambiguous wording\n- Expected answer length indication\n- Marking rubric (what earns 1/2/3 points)\n\n**Section C: Essay/Problem-Solving ({{essayCount}} questions, 10 points each)**\n- Open-ended but focused\n- Detailed rubric with criteria\n- Model answer outline\n\nBloom's Taxonomy distribution:\n- Remember/Understand: 30%\n- Apply/Analyze: 40%\n- Evaluate/Create: 30%\n\nInclude total marks and suggested time per section.\nTag each question with topic and difficulty (easy/medium/hard).",
        description: "Complete exam with rubrics and Bloom's taxonomy alignment",
        variables: [
          { name: "subject", description: "Subject", defaultValue: "Introduction to Computer Science" },
          { name: "topics", description: "Topics covered", defaultValue: "data structures, algorithms, OOP, databases, networking basics" },
          { name: "level", description: "Student level", defaultValue: "first-year university" },
          { name: "duration", description: "Exam duration (minutes)", defaultValue: "120" },
          { name: "questionCount", description: "Total questions", defaultValue: "30" },
          { name: "mcCount", description: "Multiple choice count", defaultValue: "15" },
          { name: "saCount", description: "Short answer count", defaultValue: "10" },
          { name: "essayCount", description: "Essay count", defaultValue: "5" },
        ],
      },
    ],
  },
  {
    title: "Lesson Plan Generator for K-12",
    category: "education",
    tags: ["lesson-plan", "k12", "teaching", "classroom"],
    priceSKT: 20,
    sellerIdx: 8,
    description: "Generate detailed lesson plans aligned to standards. Includes warm-ups, activities, differentiation strategies, and assessment methods.",
    previewText: "Create a lesson plan for {{grade}} {{subject}} on {{topic}}...",
    coverImage: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
    prompts: [
      {
        title: "K-12 Lesson Plan",
        content: "Create a detailed lesson plan for a K-12 classroom.\n\nGrade: {{grade}}\nSubject: {{subject}}\nTopic: {{topic}}\nDuration: {{duration}} minutes\nClass size: {{classSize}} students\n\n**Lesson Plan:**\n\n1. **Standards Alignment** — relevant standards\n2. **Learning Objectives** (SWBAT format) — 3 objectives\n3. **Materials** — everything needed\n4. **Warm-Up** (5-10 min) — engage prior knowledge\n5. **Direct Instruction** (10-15 min) — mini-lesson\n6. **Guided Practice** (10-15 min) — we do together\n7. **Independent Practice** (10-15 min) — students do\n8. **Closure** (5 min) — exit ticket / reflection\n\n**Differentiation:**\n- Struggling learners: scaffolds and supports\n- Advanced learners: extension activities\n- ELL students: language supports\n\n**Assessment:**\n- Formative: how to check understanding during lesson\n- Summative: end-of-unit connection\n\n**Homework/Extension** (optional)\n\nInclude: 2 alternative activities for different learning styles (visual, kinesthetic).",
        description: "Standards-aligned lesson plan with differentiation",
        variables: [
          { name: "grade", description: "Grade level", defaultValue: "7th grade" },
          { name: "subject", description: "Subject", defaultValue: "Science" },
          { name: "topic", description: "Lesson topic", defaultValue: "Introduction to the Scientific Method" },
          { name: "duration", description: "Class period (minutes)", defaultValue: "50" },
          { name: "classSize", description: "Number of students", defaultValue: "28" },
        ],
      },
    ],
  },

  // ═══════════════ OTHER (7) ═══════════════
  {
    title: "Personal Productivity System",
    category: "other",
    tags: ["productivity", "gtd", "time-management", "habits"],
    priceSKT: 30,
    sellerIdx: 0,
    description: "Build a personalized productivity system. Daily routines, weekly reviews, goal tracking, and habit stacking frameworks.",
    previewText: "Design a productivity system for a {{role}} who struggles with {{challenge}}...",
    coverImage: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&q=80",
    prompts: [
      {
        title: "Custom Productivity Framework",
        content: "Design a personalized productivity system.\n\nRole: {{role}}\nMain challenge: {{challenge}}\nWork style: {{workStyle}}\nTools available: {{tools}}\n\nGenerate:\n\n**Daily System**\n- Morning routine (30 min max)\n- Time-blocking template\n- Energy management (align task difficulty with energy levels)\n- End-of-day shutdown ritual\n\n**Weekly System**\n- Weekly planning session (Sunday, 30 min)\n- Weekly review template (Friday, 15 min)\n- Batch processing schedule\n\n**Project Management**\n- Task capture workflow (inbox → process → organize → do)\n- Priority matrix (urgent/important)\n- Project breakdown method\n- \"Stuck\" protocol (what to do when blocked)\n\n**Habit System**\n- 3 keystone habits to build\n- Habit stacking sequences\n- Tracking method\n- Recovery protocol for broken streaks\n\n**Digital Organization**\n- File naming convention\n- Note-taking system (Zettelkasten-inspired)\n- Email processing rules\n- Notification management\n\nPersonalize everything to their specific role and challenge. No generic advice.",
        description: "Personalized productivity system with daily/weekly routines",
        variables: [
          { name: "role", description: "Your role", defaultValue: "freelance developer juggling 3-4 client projects" },
          { name: "challenge", description: "Main challenge", defaultValue: "context switching between projects and losing deep work time" },
          { name: "workStyle", description: "Work style", defaultValue: "remote, flexible hours, tends to work late" },
          { name: "tools", description: "Tools used", defaultValue: "Notion, VS Code, Slack, Google Calendar" },
        ],
      },
    ],
  },
  {
    title: "Travel Planning Assistant",
    category: "other",
    tags: ["travel", "itinerary", "trip-planning", "budget"],
    priceSKT: 0,
    isFree: true,
    sellerIdx: 0,
    description: "Plan trips with detailed itineraries, budget breakdowns, packing lists, and local tips. Free because everyone deserves great travel planning.",
    previewText: "Plan a {{duration}}-day trip to {{destination}} for {{travelers}}...",
    coverImage: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80",
    prompts: [
      {
        title: "Complete Trip Itinerary",
        content: "Plan a detailed trip itinerary.\n\nDestination: {{destination}}\nDuration: {{duration}} days\nTravelers: {{travelers}}\nBudget: {{budget}}\nTravel style: {{style}}\nInterests: {{interests}}\n\nGenerate:\n\n**Day-by-Day Itinerary**\nFor each day:\n- Morning / Afternoon / Evening activities\n- Specific place names and neighborhoods\n- Travel time between locations\n- Meal recommendations (with price range)\n- Backup rainy-day alternative\n\n**Budget Breakdown**\n- Accommodation (per night)\n- Food (per day)\n- Transportation\n- Activities/entrances\n- Shopping/souvenirs\n- Emergency fund (10%)\n- Total estimated cost\n\n**Practical Info**\n- Best neighborhoods to stay\n- Local transportation guide\n- Essential phrases in local language (10)\n- Tipping customs\n- Safety tips\n- SIM card / WiFi advice\n\n**Packing List** (weather-appropriate)\n\n**Hidden Gems** — 5 off-the-beaten-path spots locals love",
        description: "Day-by-day itinerary with budget and local tips",
        variables: [
          { name: "destination", description: "Where", defaultValue: "Tokyo, Japan" },
          { name: "duration", description: "How many days", defaultValue: "7" },
          { name: "travelers", description: "Who", defaultValue: "couple, both late 20s" },
          { name: "budget", description: "Total budget", defaultValue: "$3,000 (excluding flights)" },
          { name: "style", description: "Travel style", defaultValue: "mix of culture, food, and some nightlife" },
          { name: "interests", description: "Interests", defaultValue: "anime, street food, temples, photography, vintage shopping" },
        ],
      },
    ],
  },
  {
    title: "Health & Fitness Plan Creator",
    category: "other",
    tags: ["fitness", "workout", "nutrition", "health"],
    priceSKT: 35,
    sellerIdx: 0,
    description: "Generate personalized workout plans and nutrition guides. Includes exercise selection, progressive overload, meal prep, and supplement recommendations.",
    previewText: "Create a {{duration}}-week fitness plan for {{goal}} with {{equipment}}...",
    coverImage: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
    prompts: [
      {
        title: "Workout & Nutrition Plan",
        content: "Create a personalized fitness and nutrition plan.\n\nGoal: {{goal}}\nCurrent level: {{level}}\nAvailable equipment: {{equipment}}\nDays per week: {{daysPerWeek}}\nDietary restrictions: {{dietary}}\n\n**Workout Plan ({{duration}} weeks)**\n\nFor each training day:\n- Workout name and focus (push/pull/legs, upper/lower, etc.)\n- Warm-up routine (5 min)\n- Exercises: name, sets × reps, rest period, tempo\n- RPE (Rate of Perceived Exertion) target\n- Progressive overload strategy (week to week)\n- Cool-down and stretching (5 min)\n\n**Nutrition Guide**\n- Daily calorie target (with calculation method)\n- Macro split (protein/carbs/fats in grams)\n- Sample meal plan (3 meals + 2 snacks)\n- Pre/post workout nutrition\n- Hydration target\n- Supplement recommendations (evidence-based only)\n\n**Tracking**\n- Weekly measurements to track\n- Progress photo schedule\n- When to deload\n- When to adjust calories\n\n⚠️ Disclaimer: This is general guidance, not medical advice. Consult a healthcare provider before starting.",
        description: "Complete workout + nutrition plan with progression",
        variables: [
          { name: "goal", description: "Fitness goal", defaultValue: "build lean muscle while losing body fat (body recomp)" },
          { name: "level", description: "Current fitness level", defaultValue: "intermediate (1 year lifting experience)" },
          { name: "equipment", description: "Available equipment", defaultValue: "full gym (barbells, dumbbells, cables, machines)" },
          { name: "daysPerWeek", description: "Training days per week", defaultValue: "4" },
          { name: "dietary", description: "Dietary restrictions", defaultValue: "none, prefer whole foods" },
          { name: "duration", description: "Program duration (weeks)", defaultValue: "8" },
        ],
      },
    ],
  },
  {
    title: "AI Chatbot Personality Designer",
    category: "other",
    tags: ["chatbot", "ai-personality", "system-prompt", "character"],
    priceSKT: 70,
    sellerIdx: 0,
    description: "Design AI chatbot personalities with system prompts, conversation flows, edge case handling, and brand voice consistency guidelines.",
    previewText: "Design an AI chatbot personality for {{brand}} that {{purpose}}...",
    coverImage: "https://images.unsplash.com/photo-1531746790095-e5888a3cc49d?w=800&q=80",
    prompts: [
      {
        title: "AI Chatbot System Prompt",
        content: "Design a complete AI chatbot personality and system prompt.\n\nBrand: {{brand}}\nPurpose: {{purpose}}\nTarget users: {{users}}\nTone: {{tone}}\n\nGenerate:\n\n**System Prompt** (production-ready)\n- Role definition\n- Knowledge boundaries (what it knows/doesn't)\n- Conversation style rules\n- Response length guidelines\n- Formatting preferences\n- Edge case handling\n\n**Personality Profile**\n- Name and avatar description\n- 5 personality traits with examples\n- Communication style (formal ↔ casual scale)\n- Humor style (or lack thereof)\n- How it handles: complaints, confusion, off-topic, abuse\n\n**Conversation Flows**\n- Greeting (first-time vs returning user)\n- Handoff to human (trigger conditions + script)\n- Fallback responses (3 variations of \"I don't know\")\n- Goodbye/session end\n\n**Safety Rails**\n- Topics to refuse (with redirect script)\n- PII handling rules\n- Hallucination prevention instructions\n- Bias mitigation guidelines\n\n**Testing Scenarios** (10 edge cases to test with expected responses)",
        description: "Production-ready chatbot personality with safety rails",
        variables: [
          { name: "brand", description: "Brand name", defaultValue: "Skyverses" },
          { name: "purpose", description: "Chatbot purpose", defaultValue: "customer support for AI creative platform — help with account, billing, and basic how-to" },
          { name: "users", description: "Target users", defaultValue: "creative professionals, varying tech skill levels" },
          { name: "tone", description: "Desired tone", defaultValue: "helpful and knowledgeable, slightly playful, never condescending" },
        ],
      },
    ],
  },
  {
    title: "Notion Template System Builder",
    category: "other",
    tags: ["notion", "templates", "workspace", "organization"],
    priceSKT: 25,
    sellerIdx: 0,
    description: "Design Notion workspace systems for personal and team productivity. Database schemas, views, automations, and dashboard layouts.",
    previewText: "Design a Notion system for {{useCase}} with databases and views...",
    coverImage: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80",
    prompts: [
      {
        title: "Notion Workspace System",
        content: "Design a complete Notion workspace system for {{useCase}}.\n\nUser: {{user}}\nCurrent pain point: {{painPoint}}\n\nGenerate:\n\n**Database Architecture**\nFor each database:\n- Name and purpose\n- Properties (name, type, options)\n- Relations to other databases\n- Key formulas\n- Default views (table, board, calendar, gallery, timeline)\n- Filters and sorts for each view\n\n**Pages Structure**\n- Dashboard page layout (linked databases, callouts, metrics)\n- Template pages (for recurring items)\n- Quick-add buttons\n\n**Automations**\n- Recurring tasks (what triggers, what creates)\n- Status change automations\n- Notification rules\n\n**Workflows**\n- Step-by-step: how to use daily\n- Weekly review process\n- Monthly cleanup routine\n\n**Templates to Create**\n- Meeting notes template\n- Project template\n- Weekly review template\n\nDesign for minimal friction — the system should take <2 min daily to maintain.\nInclude setup instructions (step-by-step).",
        description: "Complete Notion workspace with databases and workflows",
        variables: [
          { name: "useCase", description: "What it's for", defaultValue: "freelancer project management + CRM" },
          { name: "user", description: "Who uses it", defaultValue: "solo freelance developer managing 5-8 active clients" },
          { name: "painPoint", description: "Current problem", defaultValue: "losing track of client communications, deadlines, and invoicing" },
        ],
      },
    ],
  },
  {
    title: "Newsletter Writing Framework",
    category: "other",
    tags: ["newsletter", "email", "content", "audience-building"],
    priceSKT: 30,
    sellerIdx: 5,
    description: "Write engaging newsletters that people actually read. Includes hook formulas, content structures, growth strategies, and monetization paths.",
    previewText: "Write a {{niche}} newsletter issue about {{topic}} for {{subscribers}} subscribers...",
    coverImage: "https://images.unsplash.com/photo-1579275542618-a1dfed5f54ba?w=800&q=80",
    prompts: [
      {
        title: "Newsletter Issue Writer",
        content: "Write a complete newsletter issue.\n\nNewsletter: {{newsletterName}}\nNiche: {{niche}}\nTopic: {{topic}}\nSubscriber count: {{subscribers}}\nSend day: {{sendDay}}\n\nStructure:\n\n1. **Subject line** (3 options: curiosity, benefit, news)\n2. **Preview text** (40-90 chars)\n3. **Opening hook** (2-3 sentences, make them keep reading)\n4. **Main content** ({{format}})\n   - Key insight or story\n   - Supporting evidence/examples\n   - Actionable takeaway\n5. **Quick hits** (3-5 bite-sized items: links, tools, tips)\n6. **CTA** (reply prompt, share, or product mention)\n7. **Sign-off** (personal, on-brand)\n\nTone: {{tone}}\nLength: 500-800 words (5 min read)\n\nAlso generate:\n- Twitter/X thread version (7 tweets)\n- LinkedIn post version\n- Growth tactic for this issue (how to get shares)\n- A/B test idea for next issue",
        description: "Complete newsletter issue with social repurposing",
        variables: [
          { name: "newsletterName", description: "Newsletter name", defaultValue: "The AI Creator" },
          { name: "niche", description: "Newsletter niche", defaultValue: "AI tools for creative professionals" },
          { name: "topic", description: "This issue's topic", defaultValue: "5 AI video tools that just launched this week" },
          { name: "subscribers", description: "Subscriber count", defaultValue: "2,500" },
          { name: "sendDay", description: "Send day", defaultValue: "Tuesday" },
          { name: "format", description: "Content format", defaultValue: "curated list with mini-reviews" },
          { name: "tone", description: "Writing tone", defaultValue: "knowledgeable insider, conversational, opinionated" },
        ],
      },
    ],
  },
  {
    title: "Mental Models & Decision Frameworks",
    category: "other",
    tags: ["mental-models", "decision-making", "critical-thinking", "strategy"],
    priceSKT: 40,
    sellerIdx: 0,
    description: "Apply powerful mental models to any decision. First principles, inversion, second-order thinking, and more — with practical examples.",
    previewText: "Apply {{mentalModel}} thinking to the decision: {{decision}}...",
    coverImage: "https://images.unsplash.com/photo-1456428746267-a1756408f782?w=800&q=80",
    prompts: [
      {
        title: "Decision Analysis with Mental Models",
        content: "Analyze a decision using multiple mental models.\n\nDecision: {{decision}}\nContext: {{context}}\nStakes: {{stakes}}\n\nApply these mental models:\n\n**1. First Principles Thinking**\n- Break down assumptions\n- What's fundamentally true?\n- Rebuild from scratch\n\n**2. Inversion**\n- How could this fail spectacularly?\n- What would guarantee the worst outcome?\n- Now avoid those things\n\n**3. Second-Order Thinking**\n- First-order effects (obvious, immediate)\n- Second-order effects (6-12 months)\n- Third-order effects (1-3 years)\n\n**4. Opportunity Cost**\n- What are you NOT doing by choosing this?\n- What's the next best alternative?\n\n**5. Reversibility Test**\n- Is this a one-way or two-way door?\n- Can you undo it? At what cost?\n\n**6. Pre-Mortem**\n- Imagine it's 1 year later and this was a disaster\n- What went wrong? (Write the post-mortem now)\n\n**Synthesis**\n- Recommendation with confidence level (low/medium/high)\n- Key assumptions that could change the answer\n- Information you'd need to increase confidence\n- Decision deadline (when does waiting cost more than deciding?)",
        description: "Multi-framework decision analysis with synthesis",
        variables: [
          { name: "decision", description: "Decision to analyze", defaultValue: "Should we pivot from B2C to B2B for our AI platform?" },
          { name: "context", description: "Relevant context", defaultValue: "6 months in, 5K free users, $5K MRR, 18 months runway, B2B prospects asking for enterprise features" },
          { name: "stakes", description: "What's at stake", defaultValue: "company direction, team morale, investor expectations, 18 months of runway" },
        ],
      },
    ],
  },
];

/* ═══════════════════════════════════════════════════
 * SEED REVIEWS — sample reviews for popular items
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
    const s = slug(p.title) + "-" + code();
    promptSets.push({
      sellerId: seller._id,
      slug: s,
      title: { en: p.title, vi: "", ko: "", ja: "" },
      description: { en: p.description, vi: "", ko: "", ja: "" },
      category: p.category,
      tags: p.tags,
      coverImage: p.coverImage,
      priceSKT: p.priceSKT,
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
      purchaseCount: rand(5, 200),
      promptCount: p.prompts.length,
      totalEarned: 0,
      sortOrder: 0,
      averageRating: 0,
      reviewCount: 0,
      viewCount: rand(50, 5000),
      wishlistCount: rand(0, 50),
      models: pick([
        ["gpt-4", "claude-3"],
        ["gpt-4", "gemini-pro"],
        ["claude-3", "gpt-4", "gemini-pro"],
        ["midjourney", "dall-e-3"],
        ["gpt-4"],
        ["claude-3", "gemini-pro"],
        ["gpt-4", "claude-3", "gemini-pro", "llama-3"],
      ]),
      examples: [
        {
          input: p.prompts[0]?.description || "Sample input for this prompt",
          output: `Generated output using ${p.title} — high-quality results tailored to your needs.`,
        },
        {
          input: "Another example scenario",
          output: "The prompt produces consistent, professional results across different use cases.",
        },
      ],
    });
  }

  const createdPromptSets = await PromptSet.insertMany(promptSets);
  console.log(`📦 Created ${createdPromptSets.length} prompt sets`);

  // ── Create reviews for some prompt sets ──
  let reviewCount = 0;
  for (const ps of createdPromptSets) {
    // ~60% chance of having reviews
    if (Math.random() > 0.6) continue;

    const numReviews = rand(2, 6);
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

    // Update averageRating on PromptSet
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await PromptSet.updateOne(
      { _id: ps._id },
      { averageRating: Math.round(avg * 10) / 10, reviewCount: reviews.length }
    );
  }
  console.log(`⭐ Created ${reviewCount} reviews`);

  // ── Update totalEarned based on purchaseCount ──
  for (const ps of createdPromptSets) {
    const doc = await PromptSet.findById(ps._id);
    if (doc && !doc.isFree) {
      doc.totalEarned = doc.purchaseCount * doc.priceSKT * 0.9; // 90% after platform fee
      await doc.save();
    }
  }

  console.log("\n✅ Seed complete!");
  console.log(`   ${createdUsers.length} users (type: seed)`);
  console.log(`   ${createdPromptSets.length} prompt sets`);
  console.log(`   ${reviewCount} reviews`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
