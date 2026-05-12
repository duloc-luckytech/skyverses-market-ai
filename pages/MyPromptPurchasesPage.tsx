import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Bell,
  BookOpen,
  Box,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clipboard,
  Download,
  ExternalLink,
  FileJson,
  FileText,
  ImageIcon,
  Info,
  Loader2,
  Package,
  Play,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Square,
  Star,
  X,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { promptMarketApi } from "../apis/prompt-market";
import { imagesApi } from "../apis/images";
import { videosApi } from "../apis/videos";
import { pollJobOnce } from "../hooks/useJobPoller";

interface PromptVariable {
  name: string;
  description: string;
  defaultValue: string;
}

interface PromptItem {
  title: string;
  content: string;
  description: string;
  variables: PromptVariable[];
}

interface LocalizedString {
  en: string;
  vi?: string;
  ko?: string;
  ja?: string;
}

interface PromptExample {
  promptTitle?: string;
  input: string;
  style?: string;
  output: string;
  image?: string;
  video?: string;
}

interface PromptSet {
  _id: string;
  slug?: string;
  title: LocalizedString;
  description: LocalizedString;
  category: string;
  prompts: PromptItem[];
  coverImage?: string;
  tags?: string[];
  models?: string[];
  examples?: PromptExample[];
  sellerId: { _id: string; name: string; avatar?: string } | string;
}

interface PromptPurchase {
  _id: string;
  buyerId: string;
  sellerId: string;
  promptSetId: PromptSet | string;
  pricePaid: number;
  sellerReceived: number;
  platformFee: number;
  createdAt: string;
}

interface PurchaseDetail {
  purchase: PromptPurchase;
  promptSet: PromptSet;
}

interface GeneratedImage {
  role: string;
  url: string;
  jobId: string;
}

interface PipelineLog {
  id: string;
  label: string;
  detail: string;
  time: string;
  status: "done" | "active" | "error";
}

const referenceLabels = ["#1 startImage", "#2 product angle", "#3 campaign moodboard", "#4 packaging/brand"];
const generatedRoles = ["Cover", "Concept Board", "Poster", "Detail"];
const easeOutExpo = [0.22, 1, 0.36, 1] as const;
const pageVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.35, ease: easeOutExpo, staggerChildren: 0.07 } },
};
const panelVariants = {
  hidden: { opacity: 0, y: 22, scale: 0.985 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: easeOutExpo } },
};

function localizedText(field: LocalizedString | undefined, language: string): string {
  if (!field) return "";
  return field[language as keyof LocalizedString] || field.en || "";
}

function formatDateTime(iso: string, language: string): string {
  return new Date(iso).toLocaleString(language === "vi" ? "vi-VN" : "en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getPopulatedSet(purchase: PromptPurchase): PromptSet | null {
  if (purchase.promptSetId && typeof purchase.promptSetId === "object" && "_id" in purchase.promptSetId) {
    return purchase.promptSetId;
  }
  return null;
}

function getSellerName(promptSet: PromptSet): string {
  return typeof promptSet.sellerId === "string" ? "Skyverses Official" : promptSet.sellerId.name || "Skyverses Official";
}

function applyPromptVariables(content: string, variables: Record<string, string>): string {
  return Object.entries(variables).reduce((next, [name, value]) => {
    if (!value.trim()) return next;
    return next.replace(new RegExp(`{{\\s*${name}\\s*}}`, "g"), value.trim());
  }, content);
}

function collectVariables(prompts: PromptItem[]): PromptVariable[] {
  const byName = new Map<string, PromptVariable>();
  prompts.forEach((prompt) => {
    prompt.variables?.forEach((variable) => {
      if (!byName.has(variable.name)) byName.set(variable.name, variable);
    });
  });
  return Array.from(byName.values());
}

function slugifyText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase() || "prompt-kit";
}

function downloadTextFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function nowTime(): string {
  return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function linePreview(text: string): string[] {
  return text.split(/\n|(?<=\.)\s+/).filter(Boolean).slice(0, 12);
}

function modelLabel(model: string): string {
  const labels: Record<string, string> = {
    midjourney: "Midjourney v6.1",
    ideogram: "Ideogram 2.0",
    runway: "Runway Gen-3",
    flux: "FLUX",
    veo: "Veo 3.1",
    "google_image_gen_4_5": "Imagen 4.5",
  };
  return labels[model] || model;
}

function MiniButton({
  children,
  onClick,
  variant = "ghost",
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "gold" | "ghost" | "danger";
  disabled?: boolean;
}) {
  const cls =
    variant === "gold"
      ? "bg-[#C9A84C] text-black hover:bg-[#dbbe66] border-[#C9A84C]"
      : variant === "danger"
        ? "bg-white/[0.03] text-white/45 border-white/12 hover:text-red-200 hover:border-red-400/40"
        : "bg-black/20 text-[#E8C766] border-[#C9A84C]/35 hover:bg-[#C9A84C]/10";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? undefined : { y: -1, scale: 1.015 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-45 ${cls}`}
    >
      {children}
    </motion.button>
  );
}

function PromptKitWorkspace({
  detail,
  language,
  onSelectPurchase,
  purchases,
}: {
  detail: PurchaseDetail;
  language: string;
  onSelectPurchase: (purchaseId: string) => void;
  purchases: PromptPurchase[];
}) {
  const vi = language === "vi";
  const cancelGenerationRef = useRef(false);
  const { promptSet, purchase } = detail;
  const title = localizedText(promptSet.title, language);
  const description = localizedText(promptSet.description, language);
  const variables = useMemo(() => collectVariables(promptSet.prompts ?? []), [promptSet.prompts]);
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(variables.map((variable) => [variable.name, variable.defaultValue || ""]))
  );
  const [referenceImages, setReferenceImages] = useState<string[]>(() =>
    [
      promptSet.coverImage || "",
      ...(promptSet.examples ?? []).map((example) => example.image || "").filter(Boolean),
      "",
      "",
      "",
      "",
    ].slice(0, 4)
  );
  const [activeTab, setActiveTab] = useState<"raw" | "customized" | "export">("customized");
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState("");
  const [generationError, setGenerationError] = useState("");
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [generatedVideo, setGeneratedVideo] = useState("");
  const [videoJobId, setVideoJobId] = useState("");
  const [logs, setLogs] = useState<PipelineLog[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setValues(Object.fromEntries(variables.map((variable) => [variable.name, variable.defaultValue || ""])));
    setReferenceImages([
      promptSet.coverImage || "",
      ...(promptSet.examples ?? []).map((example) => example.image || "").filter(Boolean),
      "",
      "",
      "",
      "",
    ].slice(0, 4));
    setActiveTab("customized");
    setGeneratedImages([]);
    setGeneratedVideo("");
    setVideoJobId("");
    setLogs([]);
    setProgress(0);
    setGenerationError("");
    setGenerationStep("");
  }, [promptSet._id, promptSet.coverImage, promptSet.examples, variables]);

  const customizedPrompts = useMemo(
    () =>
      (promptSet.prompts ?? []).map((prompt) => ({
        ...prompt,
        content: applyPromptVariables(prompt.content, values),
      })),
    [promptSet.prompts, values]
  );
  const filledReferenceImages = referenceImages.map((url) => url.trim()).filter(Boolean);
  const exportSlug = slugifyText(title);
  const rawPrompt = promptSet.prompts?.[0]?.content || "";
  const customizedPrompt = customizedPrompts[0]?.content || "";
  const previewText =
    activeTab === "raw"
      ? rawPrompt
      : activeTab === "export"
        ? JSON.stringify({ schema: "skyverses.prompt-kit.v1", title, values, referenceImages: filledReferenceImages }, null, 2)
        : customizedPrompt;

  const kitExport = useMemo(
    () => ({
      schema: "skyverses.prompt-kit.v1",
      exportedAt: new Date().toISOString(),
      title,
      description,
      category: promptSet.category,
      tags: promptSet.tags ?? [],
      models: promptSet.models ?? [],
      customization: {
        variables: values,
        referenceImages: filledReferenceImages,
        videoRule: "Use referenceImages[0] as startImage and pass all referenceImages as image-to-video references.",
      },
      assets: {
        coverImage: promptSet.coverImage || null,
        examples: promptSet.examples ?? [],
        generatedImages,
        generatedVideo: generatedVideo || null,
      },
      prompts: customizedPrompts,
    }),
    [customizedPrompts, description, filledReferenceImages, generatedImages, generatedVideo, promptSet, title, values]
  );

  const markdown = useMemo(
    () =>
      [
        `# ${title}`,
        "",
        description,
        "",
        "## Custom Variables",
        "",
        ...Object.entries(values).map(([name, value]) => `- ${name}: ${value}`),
        "",
        "## Reference Images",
        "",
        ...filledReferenceImages.map((url, index) => `${index + 1}. ${url}`),
        "",
        "## Customized Prompts",
        "",
        ...customizedPrompts.flatMap((prompt, index) => [
          `### ${index + 1}. ${prompt.title}`,
          "",
          prompt.description,
          "",
          "```text",
          prompt.content,
          "```",
          "",
        ]),
      ].join("\n"),
    [customizedPrompts, description, filledReferenceImages, title, values]
  );

  const addLog = useCallback((label: string, detailText: string, status: PipelineLog["status"] = "done") => {
    setLogs((current) => [
      {
        id: `${Date.now()}-${Math.random()}`,
        label,
        detail: detailText,
        time: nowTime(),
        status,
      },
      ...current,
    ]);
  }, []);

  const handleCopyKit = useCallback(async () => {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }, [markdown]);

  const stopGeneration = useCallback(() => {
    cancelGenerationRef.current = true;
    setIsGenerating(false);
    setGenerationStep(vi ? "Đã dừng generation local." : "Local generation stopped.");
    addLog("Stopped", vi ? "Đã dừng poll ở trình duyệt" : "Browser polling stopped", "active");
  }, [addLog, vi]);

  const runGeneration = useCallback(
    async (imagesOnly = false) => {
      cancelGenerationRef.current = false;
      setIsGenerating(true);
      setGenerationError("");
      setGeneratedImages([]);
      setGeneratedVideo("");
      setVideoJobId("");
      setLogs([]);
      setProgress(7);
      addLog("Prepare prompts", vi ? "Prompt đã được thay biến" : "Customized prompt values prepared");

      try {
        const imagePrompts = customizedPrompts
          .filter((prompt) => !/video|storyboard/i.test(prompt.title))
          .filter((prompt) => !/batch generator/i.test(prompt.title))
          .slice(0, 4);
        const videoPrompt =
          customizedPrompts.find((prompt) => /video|storyboard/i.test(prompt.title)) ||
          customizedPrompts[customizedPrompts.length - 1];
        const seedReferences = filledReferenceImages.slice(0, 4);
        const nextImages: GeneratedImage[] = [];

        for (let index = 0; index < imagePrompts.length; index += 1) {
          const prompt = imagePrompts[index];
          setGenerationStep(`${vi ? "Đang tạo ảnh" : "Generating image"} ${index + 1}/${imagePrompts.length}: ${generatedRoles[index]}`);
          setProgress(18 + index * 12);
          const res = await imagesApi.createJob({
            type: seedReferences.length ? "image_to_image" : "text_to_image",
            input: {
              prompt: prompt.content,
              images: seedReferences,
            },
            config: {
              width: 1280,
              height: 720,
              aspectRatio: "16:9",
              seed: 0,
              style: "cinematic",
            },
            engine: {
              provider: "gommo",
              model: "google_image_gen_4_5",
            },
            enginePayload: {
              prompt: prompt.content,
              privacy: "PRIVATE",
              projectId: "default",
            },
          });

          if (!res.success || !res.data.jobId) {
            throw new Error(res.message || (vi ? "Không tạo được image job" : "Image job creation failed"));
          }

          let imageUrl = "";
          let imageError = "";
          await pollJobOnce({
            jobId: res.data.jobId,
            isCancelledRef: cancelGenerationRef,
            apiType: "image",
            intervalMs: 5000,
            maxDurationMs: 240000,
            onDone: (result) => {
              imageUrl = result.images?.[0] ?? "";
            },
            onError: (message) => {
              imageError = message;
            },
          });
          if (cancelGenerationRef.current) return;
          if (imageError) throw new Error(imageError);
          if (!imageUrl) throw new Error(vi ? "Image job không trả URL" : "Image job returned no URL");

          const generated = { role: generatedRoles[index] || `Image ${index + 1}`, url: imageUrl, jobId: res.data.jobId };
          nextImages.push(generated);
          setGeneratedImages([...nextImages]);
          addLog(`Image ${index + 1} (${generated.role})`, vi ? "Generation complete" : "Generation complete");
        }

        setProgress(imagesOnly ? 100 : 70);
        if (imagesOnly) {
          setGenerationStep(vi ? "Đã tạo lại ảnh." : "Images regenerated.");
          return;
        }

        const videoReferences = (nextImages.length ? nextImages.map((image) => image.url) : seedReferences).slice(0, 4);
        if (videoPrompt && videoReferences.length) {
          setGenerationStep(vi ? "Đang tạo video từ ảnh generated..." : "Generating video from generated images...");
          addLog("Video generation", vi ? "Đã đưa vào pipeline" : "Queued in pipeline", "active");
          const res = await videosApi.createJob({
            type: "image-to-video",
            input: { images: videoReferences },
            config: { duration: 8, aspectRatio: "16:9", resolution: "720p" },
            engine: {
              provider: "gommo",
              model: "veo_3_1",
            },
            enginePayload: {
              prompt: videoPrompt.content,
              privacy: "PRIVATE",
              translateToEn: true,
              projectId: "default",
              mode: "relaxed",
            },
          });

          if (!res.success || !res.data.jobId) {
            throw new Error(res.message || (vi ? "Không tạo được video job" : "Video job creation failed"));
          }

          setVideoJobId(res.data.jobId);
          setProgress(82);
          let videoUrl = "";
          let videoError = "";
          await pollJobOnce({
            jobId: res.data.jobId,
            isCancelledRef: cancelGenerationRef,
            apiType: "video",
            intervalMs: 7000,
            maxDurationMs: 420000,
            onTick: ({ elapsedMs }) => setProgress(Math.min(96, 82 + Math.round(elapsedMs / 25000))),
            onDone: (result) => {
              videoUrl = result.videoUrl ?? "";
            },
            onError: (message) => {
              videoError = message;
            },
          });
          if (cancelGenerationRef.current) return;
          if (videoError) throw new Error(videoError);
          if (!videoUrl) throw new Error(vi ? "Video job không trả URL" : "Video job returned no URL");
          setGeneratedVideo(videoUrl);
          addLog("Video generation", vi ? "Video complete" : "Video complete");
        }

        setProgress(100);
        setGenerationStep(vi ? "Hoàn tất flow AI." : "AI generation flow complete.");
        addLog("Export kit", vi ? "Kit đã sẵn sàng export" : "Kit ready to export");
      } catch (error) {
        setGenerationError(error instanceof Error ? error.message : (vi ? "Tạo AI thất bại" : "AI generation failed"));
        addLog("Pipeline error", error instanceof Error ? error.message : "Unknown error", "error");
      } finally {
        setIsGenerating(false);
      }
    },
    [addLog, customizedPrompts, filledReferenceImages, vi]
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <header className="sticky top-0 z-30 border-b border-[#C9A84C]/15 bg-black/85 backdrop-blur-xl">
        <div className="flex h-[62px] items-center justify-between px-4 lg:px-6">
          <div className="flex min-w-0 items-center gap-4">
            <Link to="/prompt-market" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#C9A84C]/60 text-[#C9A84C]">
                <Box className="h-5 w-5" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold uppercase tracking-[0.36em] text-white">Skyverses</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.42em] text-[#C9A84C]">Prompt Market</p>
              </div>
            </Link>
            <ChevronRight className="h-4 w-4 text-white/25" />
            <Link to="/prompt-market/my-purchases" className="hidden truncate text-sm text-white/55 hover:text-white md:block">
              My Purchased Prompts
            </Link>
            <ChevronRight className="hidden h-4 w-4 text-white/25 md:block" />
            <span className="truncate text-sm text-white/80">{title}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden h-9 items-center gap-2 rounded-lg border border-[#C9A84C]/25 px-3 text-sm font-semibold text-[#E8C766] sm:flex">
              <Star className="h-4 w-4" />
              {purchase.pricePaid.toLocaleString()} SKT
            </div>
            <button className="hidden h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white/65 md:flex">
              <CircleHelp className="h-4 w-4" />
            </button>
            <button className="hidden h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white/65 md:flex">
              <Bell className="h-4 w-4" />
            </button>
            <div className="hidden items-center gap-2 rounded-lg border border-[#C9A84C]/25 px-2 py-1.5 lg:flex">
              <div className="h-7 w-7 rounded-full bg-[linear-gradient(135deg,#d7ba67,#5c4520)]" />
              <span className="text-sm text-white/80">Alex Mercer</span>
              <ChevronDown className="h-4 w-4 text-[#C9A84C]" />
            </div>
          </div>
        </div>
      </header>

      <motion.main
        variants={pageVariants}
        initial="hidden"
        animate="show"
        className="grid min-h-[calc(100vh-62px)] grid-cols-1 lg:grid-cols-[360px_1fr]"
      >
        <motion.aside variants={panelVariants} className="border-r border-[#C9A84C]/15 bg-[#090a0a] p-4 lg:p-5">
          <Link to="/prompt-market/my-purchases" className="mb-5 inline-flex items-center gap-2 text-sm text-white/65 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to My Purchased Prompts
          </Link>

          {purchases.length > 1 && (
            <select
              value={purchase._id}
              onChange={(event) => onSelectPurchase(event.target.value)}
              className="mb-4 w-full rounded-lg border border-[#C9A84C]/25 bg-black/40 px-3 py-2 text-sm text-white outline-none"
            >
              {purchases.map((item) => {
                const itemSet = getPopulatedSet(item);
                return (
                  <option key={item._id} value={item._id}>
                    {itemSet ? localizedText(itemSet.title, language) : item._id}
                  </option>
                );
              })}
            </select>
          )}

          <div className="overflow-hidden rounded-lg border border-[#C9A84C]/45 bg-black/35">
            <div className="relative aspect-[1.45] overflow-hidden">
              {promptSet.coverImage ? (
                <img src={promptSet.coverImage} alt={title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-white/[0.04]">
                  <Package className="h-12 w-12 text-[#C9A84C]/50" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <p className="max-w-[220px] text-3xl font-black uppercase leading-[0.92] tracking-tight text-[#E8C766]">
                  {title.split(" ").slice(0, 3).join(" ")}
                </p>
              </div>
            </div>
            <div className="space-y-4 p-4">
              <div>
                <h2 className="text-xl font-semibold">{title}</h2>
                <span className="mt-2 inline-flex rounded-md border border-[#C9A84C]/45 px-2 py-1 text-xs text-[#E8C766]">
                  {promptSet.category}
                </span>
                <p className="mt-3 text-sm leading-relaxed text-white/58">{description}</p>
              </div>

              <div className="space-y-2 text-sm">
                {[
                  ["Price Paid", `${purchase.pricePaid.toLocaleString()} SKT`],
                  ["Purchased On", formatDateTime(purchase.createdAt, language)],
                  ["Order ID", purchase._id.slice(-12).toUpperCase()],
                  ["Seller", getSellerName(promptSet)],
                  ["License", "Commercial Use"],
                  ["Category", promptSet.category],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-4 text-white/55">
                    <span className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-white/55" />
                      {label}
                    </span>
                    <span className="text-right text-white/78">{value}</span>
                  </div>
                ))}
              </div>

              <div>
                <p className="mb-2 text-sm text-white/70">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {(promptSet.tags ?? []).slice(0, 5).map((tag) => (
                    <span key={tag} className="rounded-md border border-[#C9A84C]/22 bg-white/[0.03] px-2 py-1 text-xs text-white/58">
                      {tag}
                    </span>
                  ))}
                  {(promptSet.tags?.length ?? 0) > 5 && (
                    <span className="rounded-md border border-[#C9A84C]/22 bg-white/[0.03] px-2 py-1 text-xs text-white/58">
                      +{(promptSet.tags?.length ?? 0) - 5}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm text-white/70">Recommended Models</p>
                <div className="grid grid-cols-4 gap-2">
                  {(promptSet.models ?? ["midjourney", "ideogram", "runway", "flux"]).slice(0, 4).map((model) => (
                    <div key={model} className="rounded-lg border border-white/10 bg-white/[0.03] p-2 text-center">
                      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-md border border-[#C9A84C]/25 bg-black/45 text-[#C9A84C]">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <p className="text-[11px] leading-tight text-white/65">{modelLabel(model)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-[#C9A84C]/35 bg-black/30 p-4 text-center">
            <p className="text-sm font-medium text-white">Need help customizing?</p>
            <p className="mt-1 text-xs text-white/42">Read the documentation or contact support.</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <MiniButton>
                <BookOpen className="h-4 w-4" />
                View Docs
              </MiniButton>
              <MiniButton>
                <CircleHelp className="h-4 w-4" />
                Support
              </MiniButton>
            </div>
          </div>
        </motion.aside>

        <motion.section variants={panelVariants} className="bg-[linear-gradient(rgba(201,168,76,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(201,168,76,0.035)_1px,transparent_1px)] bg-[size:56px_56px] p-4 lg:p-5">
          <div className="mx-auto max-w-[1500px] space-y-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h1 className="flex items-center gap-2 text-2xl font-semibold text-[#E8C766]">
                  <Sparkles className="h-6 w-6" />
                  Customize and Export Kit
                </h1>
                <p className="mt-1 text-sm text-white/45">Replace variables, add brand references, and generate a custom prompt kit ready to export.</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-2 rounded-md border border-green-500/25 bg-green-500/10 px-3 py-1 text-xs text-green-300">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Purchased
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-md border border-green-500/25 bg-green-500/10 px-3 py-1 text-xs text-green-300">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Commercial Use
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-md border border-blue-400/25 bg-blue-500/10 px-3 py-1 text-xs text-blue-300">
                    <ImageIcon className="h-3.5 w-3.5" />
                    Image-to-Video Ready
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <MiniButton variant="gold" onClick={() => runGeneration(false)} disabled={isGenerating}>
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Generate with AI
                </MiniButton>
                <MiniButton variant="danger" onClick={stopGeneration} disabled={!isGenerating}>
                  <Square className="h-3.5 w-3.5" />
                  Stop
                </MiniButton>
                <MiniButton onClick={handleCopyKit}>
                  {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                  Copy kit
                </MiniButton>
                <MiniButton onClick={() => downloadTextFile(`${exportSlug}.md`, markdown, "text/markdown;charset=utf-8")}>
                  <FileText className="h-4 w-4" />
                  Export Markdown
                </MiniButton>
                <MiniButton onClick={() => downloadTextFile(`${exportSlug}.json`, JSON.stringify(kitExport, null, 2), "application/json;charset=utf-8")}>
                  <FileJson className="h-4 w-4" />
                  Export JSON
                </MiniButton>
              </div>
            </div>

            <motion.div variants={pageVariants} className="grid gap-3 xl:grid-cols-[1fr_1.08fr_1.2fr]">
              <motion.div variants={panelVariants} className="rounded-lg border border-[#C9A84C]/40 bg-black/45 p-4">
                <div className="mb-3 flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#C9A84C] text-sm text-[#E8C766]">1</span>
                  <div>
                    <h3 className="text-base font-medium">Fields to replace</h3>
                    <p className="text-xs text-white/42">Update the variables to match your brand and campaign.</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {variables.map((variable) => (
                    <label key={variable.name} className="block">
                      <span className="mb-1 block text-xs text-white/65">{variable.name}</span>
                      <textarea
                        value={values[variable.name] ?? ""}
                        onChange={(event) => setValues((current) => ({ ...current, [variable.name]: event.target.value }))}
                        rows={2}
                        className="w-full resize-none rounded-md border border-white/15 bg-[#0a0b0b] px-3 py-2 text-sm leading-relaxed text-white/82 outline-none transition focus:border-[#C9A84C]/75"
                      />
                    </label>
                  ))}
                </div>
              </motion.div>

              <motion.div variants={panelVariants} className="rounded-lg border border-[#C9A84C]/40 bg-black/45 p-4">
                <div className="mb-3 flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#C9A84C] text-sm text-[#E8C766]">2</span>
                  <div>
                    <h3 className="text-base font-medium">Brand / Product Reference Images</h3>
                    <p className="text-xs text-white/42">Add image URLs of your product, brand, or moodboard.</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[0, 1, 2, 3].map((index) => (
                    <div key={index} className="grid grid-cols-[30px_74px_1fr] items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-md border border-[#C9A84C]/50 text-sm text-[#E8C766]">{index + 1}</span>
                      <div className="h-16 overflow-hidden rounded-md border border-white/12 bg-white/[0.04]">
                        {referenceImages[index] ? (
                          <img src={referenceImages[index]} alt={referenceLabels[index]} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-white/25" />
                          </div>
                        )}
                      </div>
                      <label className="min-w-0">
                        <span className="mb-1 block text-sm text-[#E8C766]">{referenceLabels[index]}</span>
                        <div className="flex items-center rounded-md border border-white/12 bg-[#0a0b0b]">
                          <input
                            value={referenceImages[index] ?? ""}
                            onChange={(event) => {
                              const next = [...referenceImages];
                              next[index] = event.target.value;
                              setReferenceImages(next);
                            }}
                            className="min-w-0 flex-1 bg-transparent px-3 py-2 text-xs text-white/70 outline-none"
                            placeholder="https://cdn.example.com/brand/product-01.jpg"
                          />
                          <ExternalLink className="mr-2 h-4 w-4 text-white/35" />
                          <button
                            type="button"
                            onClick={() => {
                              const next = [...referenceImages];
                              next[index] = "";
                              setReferenceImages(next);
                            }}
                            className="mr-2 text-white/35 hover:text-white"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex gap-2 rounded-lg border border-[#C9A84C]/35 bg-[#C9A84C]/10 p-3 text-sm leading-relaxed text-[#E8C766]">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" />
                  Video uses image #1 as startImage and all images as references to ensure product, color, and visual consistency.
                </div>
              </motion.div>

              <motion.div variants={panelVariants} className="rounded-lg border border-[#C9A84C]/40 bg-black/45 p-4">
                <div className="mb-3 flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#C9A84C] text-sm text-[#E8C766]">3</span>
                  <div>
                    <h3 className="text-base font-medium">Customized Prompt Preview</h3>
                    <p className="text-xs text-white/42">Review the customized prompt that will be used in the pipeline.</p>
                  </div>
                </div>
                <div className="mb-3 ml-auto grid max-w-[330px] grid-cols-3 rounded-md border border-white/12 bg-white/[0.03] p-1 text-xs">
                  {[
                    ["raw", "Raw Prompt"],
                    ["customized", "Customized"],
                    ["export", "Export"],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setActiveTab(value as "raw" | "customized" | "export")}
                      className={`rounded px-3 py-2 transition ${activeTab === value ? "border border-[#C9A84C] text-[#E8C766]" : "text-white/50 hover:text-white"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="h-[350px] overflow-hidden rounded-lg border border-white/12 bg-[#080909]">
                  <div className="grid h-full grid-cols-[46px_1fr] overflow-auto font-mono text-sm leading-7">
                    <div className="border-r border-white/10 bg-white/[0.03] py-3 text-right text-white/35">
                      {linePreview(previewText).map((_, index) => (
                        <div key={index} className="px-3">{index + 1}</div>
                      ))}
                    </div>
                    <pre className="whitespace-pre-wrap p-3 text-[#D6B94C]">{linePreview(previewText).join("\n")}</pre>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div variants={panelVariants} className="rounded-lg border border-[#C9A84C]/45 bg-black/45 p-4">
              <div className="mb-5 flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#C9A84C] text-sm text-[#E8C766]">4</span>
                <div>
                  <h3 className="text-base font-medium">Generate with AI Pipeline</h3>
                  <p className="text-xs text-white/42">Follow the pipeline to generate images and a video using your customized prompts.</p>
                </div>
              </div>

              <div className="mb-4">
                <div className="grid gap-4 md:grid-cols-5">
                  {[
                    ["Prepare prompts", "Complete", progress >= 7],
                    ["Generate 4 images", generatedImages.length >= 4 ? "Complete" : `${generatedImages.length}/4`, generatedImages.length > 0],
                    ["Use generated images as video references", `${Math.min(progress, 100)}%`, progress >= 70],
                    ["Generate video", generatedVideo ? "Complete" : videoJobId ? "Pending" : "Pending", Boolean(videoJobId || generatedVideo)],
                    ["Export kit", progress >= 100 ? "Ready" : "Pending", progress >= 100],
                  ].map((step, index) => {
                    const [label, sub, active] = step as [string, string, boolean];
                    return (
                      <div key={label} className="flex items-center gap-3">
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${active ? "border-[#C9A84C] text-[#E8C766]" : "border-white/25 text-white/45"}`}>
                          {active && index < 2 ? <Check className="h-4 w-4" /> : index + 1}
                        </span>
                        <div className="min-w-0">
                          <p className={`truncate text-xs ${active ? "text-[#E8C766]" : "text-white/55"}`}>{label}</p>
                          <p className="text-[11px] text-white/35">{sub}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/12">
                  <div className="h-full rounded-full bg-[#C9A84C] transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
                </div>
              </div>

              {generationError && (
                <div className="mb-4 rounded-lg border border-red-400/35 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  {generationError}
                </div>
              )}

              <div className="grid gap-3 xl:grid-cols-[1.25fr_1fr_0.75fr]">
                <div className="rounded-lg border border-white/12 bg-[#080909] p-3">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm text-white/78">Generated Images ({generatedImages.length})</p>
                    <MiniButton onClick={() => runGeneration(true)} disabled={isGenerating}>
                      <RefreshCw className="h-4 w-4" />
                      Regenerate Images
                    </MiniButton>
                  </div>
                  <motion.div variants={pageVariants} className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                    {[0, 1, 2, 3].map((index) => {
                      const item = generatedImages[index];
                      return (
                        <motion.div
                          key={generatedRoles[index]}
                          variants={panelVariants}
                          whileHover={{ y: -3, borderColor: "rgba(201,168,76,0.45)" }}
                          className="overflow-hidden rounded-lg border border-white/12 bg-white/[0.03]"
                        >
                          <div className="relative aspect-[4/3] bg-black/35">
                            {item ? (
                              <img src={item.url} alt={item.role} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <ImageIcon className="h-6 w-6 text-white/22" />
                              </div>
                            )}
                            <span className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-md border border-[#C9A84C]/50 bg-black/70 text-sm text-[#E8C766]">
                              {index + 1}
                            </span>
                          </div>
                          <p className="px-3 py-2 text-sm text-white/72">{generatedRoles[index]}</p>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </div>

                <div className="rounded-lg border border-white/12 bg-[#080909] p-3">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm text-white/78">Video Preview</p>
                    <span className="rounded-md border border-[#C9A84C]/35 bg-[#C9A84C]/10 px-2 py-1 text-[11px] text-[#E8C766]">
                      {generatedVideo ? "complete" : videoJobId ? "image-to-video pending" : "waiting"}
                    </span>
                  </div>
                  <div className="relative aspect-video overflow-hidden rounded-lg border border-white/12 bg-black">
                    {generatedVideo ? (
                      <video src={generatedVideo} controls className="h-full w-full object-cover" />
                    ) : generatedImages[0] ? (
                      <>
                        <img src={generatedImages[0].url} alt="Video reference" className="h-full w-full object-cover opacity-60" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/45 bg-black/45">
                            {isGenerating ? <Loader2 className="h-7 w-7 animate-spin" /> : <Play className="h-7 w-7" />}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm text-white/35">
                        Generate images first
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-white/35">
                    <span>Job ID: {videoJobId ? videoJobId.slice(-12) : "not queued"}</span>
                    <span>Format: MP4 · 720p · 8s</span>
                  </div>
                </div>

                <div className="rounded-lg border border-white/12 bg-[#080909] p-3">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm text-white/78">Results & Logs</p>
                    <button type="button" onClick={() => setLogs([])} className="rounded-md border border-[#C9A84C]/25 px-2 py-1 text-[11px] text-[#E8C766]">
                      Clear
                    </button>
                  </div>
                  <div className="max-h-[260px] space-y-2 overflow-auto">
                    {logs.length === 0 && <p className="text-sm text-white/35">No pipeline logs yet.</p>}
                    {logs.map((log) => (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex gap-3 border-b border-white/8 pb-2 last:border-0"
                      >
                        <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                          log.status === "error" ? "border-red-400 text-red-300" : log.status === "active" ? "border-[#C9A84C] text-[#E8C766]" : "border-green-400 text-green-300"
                        }`}>
                          {log.status === "active" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <p className="truncate text-xs text-white/72">{log.label}</p>
                            <span className="text-[10px] text-white/35">{log.time}</span>
                          </div>
                          <p className="text-[11px] text-white/38">{log.detail}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {generationStep && <p className="mt-3 text-xs text-[#E8C766]/80">{generationStep}</p>}
            </motion.div>
          </div>
        </motion.section>
      </motion.main>
    </div>
  );
}

export default function MyPromptPurchasesPage() {
  const { t, lang } = useLanguage();
  const { isAuthenticated, login } = useAuth();
  const [purchases, setPurchases] = useState<PromptPurchase[]>([]);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState("");
  const [detail, setDetail] = useState<PurchaseDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const selectedPurchase = purchases.find((purchase) => purchase._id === selectedPurchaseId);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    const loadPurchases = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await promptMarketApi.getMyPurchases(1, 50);
        if (cancelled) return;
        setPurchases(res.data);
        if (res.data[0]) setSelectedPurchaseId(res.data[0]._id);
      } catch {
        if (!cancelled) setError("Failed to load purchases.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadPurchases();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!selectedPurchaseId) return;
    let cancelled = false;
    const loadDetail = async () => {
      setDetailLoading(true);
      setError("");
      try {
        const res = await promptMarketApi.getMyPurchaseDetail(selectedPurchaseId);
        if (!cancelled) setDetail(res.data);
      } catch {
        if (!cancelled) setError("Failed to load prompt kit detail.");
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    };
    loadDetail();
    return () => {
      cancelled = true;
    };
  }, [selectedPurchaseId]);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] px-4">
        <div className="w-full max-w-sm rounded-lg border border-[#C9A84C]/25 bg-black/50 p-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg border border-[#C9A84C]/35 text-[#C9A84C]">
            <ShoppingBag className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-xl font-semibold text-white">{t("myPurchases.authTitle") || "Sign in to view your purchases"}</h1>
          <p className="mt-2 text-sm text-white/45">
            {t("myPurchases.authDesc") || "You need to be logged in to customize purchased prompt kits."}
          </p>
          <button onClick={login} className="mt-5 w-full rounded-lg bg-[#C9A84C] py-2.5 text-sm font-semibold text-black">
            {t("common.login") || "Log In"}
          </button>
        </div>
      </div>
    );
  }

  if (loading || detailLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] text-white/45">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-[#C9A84C]" />
          Loading purchased prompt kit...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] px-4">
        <div className="max-w-md rounded-lg border border-red-400/25 bg-red-500/10 p-5 text-center text-red-100">
          {error}
        </div>
      </div>
    );
  }

  if (!purchases.length) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] px-4">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="max-w-sm text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]">
            <Package className="h-8 w-8 text-white/25" />
          </div>
          <h1 className="mt-5 text-xl font-semibold text-white">{t("myPurchases.empty") || "No purchases yet"}</h1>
          <p className="mt-2 text-sm text-white/42">
            {t("myPurchases.emptyDesc") || "When you buy a prompt kit, it will appear here for customization and export."}
          </p>
          <Link to="/prompt-market" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#C9A84C] px-5 py-2.5 text-sm font-semibold text-black">
            <ShoppingBag className="h-4 w-4" />
            Browse Marketplace
          </Link>
        </motion.div>
      </div>
    );
  }

  if (!detail || !selectedPurchase) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] text-white/45">
        Select a purchased prompt kit.
      </div>
    );
  }

  return (
    <PromptKitWorkspace
      detail={detail}
      language={lang}
      purchases={purchases}
      onSelectPurchase={setSelectedPurchaseId}
    />
  );
}
