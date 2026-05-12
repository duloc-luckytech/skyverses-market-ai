import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Cpu,
  FileJson,
  FileText,
  ImageIcon,
  Info,
  Loader2,
  Package,
  Play,
  Save,
  Send,
  ShieldCheck,
  Sparkles,
  Tag,
  Upload,
  Video,
  Wand2,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { promptMarketApi } from "../apis/prompt-market";
import type { AIModel, PromptItem } from "../types";

type Category = "coding" | "writing" | "marketing" | "design" | "business" | "education" | "other";
type SellerCategory =
  | "Visual"
  | "Business"
  | "Marketing"
  | "Design"
  | "Food"
  | "Fashion"
  | "Product"
  | "Interior"
  | "Film"
  | "Anime";

interface CustomField {
  key: string;
  label: string;
  description: string;
  value: string;
  required: boolean;
}

interface PreviewAsset {
  key: string;
  label: string;
  role: string;
  url: string;
  type: "image" | "video";
}

interface SellerForm {
  kitName: string;
  category: SellerCategory;
  targetBuyer: string;
  buyerOutcome: string;
  mainResult: string;
  tags: string;
  visualStyle: string;
  materialSystem: string;
  layoutFormat: string;
  motionDirection: string;
  priceSKT: number;
  isFree: boolean;
  coverImage: string;
  fields: CustomField[];
  assets: PreviewAsset[];
  models: AIModel[];
}

const sellerCategories: SellerCategory[] = [
  "Visual",
  "Business",
  "Marketing",
  "Design",
  "Food",
  "Fashion",
  "Product",
  "Interior",
  "Film",
  "Anime",
];

const categoryMap: Record<SellerCategory, Category> = {
  Visual: "design",
  Business: "business",
  Marketing: "marketing",
  Design: "design",
  Food: "marketing",
  Fashion: "design",
  Product: "marketing",
  Interior: "design",
  Film: "design",
  Anime: "design",
};

const defaultFields: CustomField[] = [
  {
    key: "project_brief",
    label: "Brand / Product",
    description: "The product, campaign, service, or brand the buyer wants to customize.",
    value: "launch a luxury coffee brand with premium packaging, cafe posters, social ads, and cinematic beverage visuals",
    required: true,
  },
  {
    key: "audience",
    label: "Audience",
    description: "Who the final images, copy, or videos are for.",
    value: "coffee roasters, cafe owners, beverage marketers, and lifestyle content teams",
    required: true,
  },
  {
    key: "visual_language",
    label: "Visual Style",
    description: "The creative direction, references, and overall look.",
    value: "warm editorial cafe photography, premium tactile packaging, clean commercial layout, soft cinematic steam",
    required: true,
  },
  {
    key: "material_system",
    label: "Materials / Ingredients",
    description: "Textures, surfaces, props, ingredients, or sensory details.",
    value: "kraft paper bags, ceramic cups, espresso crema, roasted beans, wood counter, gold foil label, morning steam",
    required: true,
  },
  {
    key: "layout_system",
    label: "Layout / Format",
    description: "How the output should be structured across boards, posters, and thumbnails.",
    value: "hero packshot center, roast cards, cafe lifestyle strip, menu CTA block, social crop-safe composition",
    required: true,
  },
  {
    key: "motion_system",
    label: "Motion Direction",
    description: "Camera moves and action plan for the video demo.",
    value: "espresso pours, steam rises, beans tumble, label catches light, final cup-and-bag hero frame",
    required: true,
  },
];

const defaultAssets: PreviewAsset[] = [
  { key: "cover", label: "Cover Image", role: "cover", url: "", type: "image" },
  { key: "concept", label: "Concept Board", role: "technical-board", url: "", type: "image" },
  { key: "poster", label: "Poster", role: "poster", url: "", type: "image" },
  { key: "detail", label: "Example Detail", role: "example", url: "", type: "image" },
  { key: "thumbnail", label: "Thumbnail", role: "thumbnail", url: "", type: "image" },
  { key: "video", label: "Video Demo", role: "video-demo", url: "", type: "video" },
];

const modelOptions: Array<{ value: AIModel; label: string }> = [
  { value: "midjourney", label: "Midjourney" },
  { value: "flux", label: "Flux" },
  { value: "GPT Image", label: "GPT Image" },
  { value: "Imagen 4", label: "Imagen 4" },
  { value: "Veo 3.1", label: "Veo 3.1" },
  { value: "Runway Gen-4", label: "Runway" },
  { value: "Ideogram 3.0", label: "Ideogram" },
  { value: "other", label: "Other" },
];

const inputClass =
  "w-full rounded-lg border border-white/12 bg-[#090a0a] px-3 py-2.5 text-sm text-white/85 outline-none transition focus:border-[#C9A84C]/70";
const textareaClass =
  "w-full resize-none rounded-lg border border-white/12 bg-[#090a0a] px-3 py-2.5 text-sm leading-relaxed text-white/85 outline-none transition focus:border-[#C9A84C]/70";
const easeOutExpo = [0.22, 1, 0.36, 1] as const;
const pageVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.35, ease: easeOutExpo, staggerChildren: 0.07 } },
};
const panelVariants = {
  hidden: { opacity: 0, y: 22, scale: 0.985 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: easeOutExpo } },
};

function slugifyText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase() || "prompt-kit";
}

function splitTags(value: string): string[] {
  return value.split(",").map((tag) => tag.trim()).filter(Boolean);
}

function buildPromptModules(form: SellerForm): PromptItem[] {
  const heroSubject = `{{project_brief}} for {{audience}}`;
  const sharedVariables = form.fields.map((field) => ({
    name: field.key,
    description: field.description,
    defaultValue: field.value,
  }));

  return [
    {
      title: "01. Research + Concept Board",
      description: "Turns a buyer brief into a premium reference board with hero output, material notes, palette, details, and variants.",
      content:
        `Create a complete research and concept board for {{project_brief}}. Central hero: ${heroSubject}, rendered in {{visual_language}}. ` +
        `Include inspiration references, material swatches, palette chips, close-up texture crops, technical notes, camera/lens direction, and production constraints. ` +
        `Use {{material_system}} as the sensory foundation. Layout must follow {{layout_system}} with readable hierarchy and polished spacing.`,
      variables: sharedVariables,
    },
    {
      title: "02. Technical Notes",
      description: "Creates a practical annotation sheet so buyers can keep image and video outputs consistent.",
      content:
        `Create a technical annotation sheet for {{project_brief}}. Show one polished final output plus supporting detail views. ` +
        `Add callouts for composition, materials, lighting direction, color palette, framing, and output limitations. ` +
        `The sheet must make future images and videos consistent with {{visual_language}}, {{material_system}}, and {{layout_system}}.`,
      variables: sharedVariables,
    },
    {
      title: "03. Campaign Poster",
      description: "Builds a commercial poster/ad layout with hero visual, proof points, CTA, and platform crop guides.",
      content:
        `Design a finished campaign poster for {{project_brief}}. Hero area: ${heroSubject} with tactile details, believable lighting, and a strong silhouette. ` +
        `Add headline-safe space, subheadline zone, badge module, feature icon row, proof-point area, CTA block, and brand placeholder. ` +
        `Include crop guides for 1:1, 4:5, 9:16, and 16:9. Keep the layout premium and readable.`,
      variables: sharedVariables,
    },
    {
      title: "04. Asset Batch Generator",
      description: "Expands one seller kit into reusable image/video generation prompts.",
      content:
        `Convert {{project_brief}} into a production-ready asset batch. Return exactly: cover image prompt, concept board prompt, poster prompt, example detail prompt, thumbnail-safe prompt, and three short video prompt options. ` +
        `For every image prompt include subject, environment, composition, material, lighting, palette, typography-safe zone, aspect ratio, and quality constraints. ` +
        `For every video prompt include shot type, camera movement, one main action, continuity rule, sensory detail, duration, transition cue, and final frame.`,
      variables: sharedVariables,
    },
    {
      title: "05. Final Image Production Prompt",
      description: "Produces the main high-quality image prompt after the concept board is approved.",
      content:
        `Generate the final production image for {{project_brief}}. Audience: {{audience}}. Visual language: {{visual_language}}. Materials and sensory detail: {{material_system}}. ` +
        `Composition: clear foreground, midground, and background; preserve one clean typography-safe zone; include controlled micro-details. ` +
        `The result should look like the flagship image from a complete commercial creative kit.`,
      variables: sharedVariables,
    },
    {
      title: "06. Cinematic Video Storyboard",
      description: "Turns generated item images into an image-to-video storyboard with timed beats and motion notes.",
      content:
        `Build an 8-second cinematic image-to-video storyboard for {{project_brief}}. Use {{motion_system}}. ` +
        `Use the generated cover, concept board, poster, and detail image as visual references for product identity, color, materials, lighting, and composition continuity. ` +
        `Create 10 timed panels with camera angle, lens/framing, motion arrow, subject action, environmental reaction, transition, and sound design note. ` +
        `Final line must be a single clean video prompt ready for image-to-video generation.`,
      variables: sharedVariables,
    },
  ];
}

function buildExamples(form: SellerForm) {
  const images = form.assets.filter((asset) => asset.type === "image" && asset.url.trim());
  const video = form.assets.find((asset) => asset.type === "video" && asset.url.trim())?.url.trim();
  return [
    {
      promptTitle: "Research + Concept Board",
      input: form.buyerOutcome,
      style: form.visualStyle,
      output: `${form.mainResult} for ${form.targetBuyer}.`,
      image: images[1]?.url || images[0]?.url,
      video,
    },
    {
      promptTitle: "Campaign Poster",
      input: form.mainResult,
      style: form.layoutFormat,
      output: "A ready-to-use campaign poster, product hero, and platform-safe layout system.",
      image: images[2]?.url || images[0]?.url,
    },
    {
      promptTitle: "Cinematic Video Storyboard",
      input: form.motionDirection,
      style: form.visualStyle,
      output: "An image-to-video storyboard that uses generated item images as references.",
      image: images[3]?.url || images[0]?.url,
      video,
    },
  ].filter((example) => example.input || example.output || example.image || example.video);
}

function Stepper({ activeScore }: { activeScore: number }) {
  const steps = ["Product idea", "Buyer outcome", "Brand references", "Prompt modules", "Preview assets", "Pricing & publish"];
  return (
    <div className="rounded-lg border border-[#C9A84C]/25 bg-black/35 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-white">Build progress</p>
        <span className="text-xs text-[#E8C766]">{activeScore}%</span>
      </div>
      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-[#C9A84C]" style={{ width: `${activeScore}%` }} />
      </div>
      <div className="space-y-3">
        {steps.map((step, index) => {
          const done = activeScore >= (index + 1) * 15;
          return (
            <div key={step} className="flex items-center gap-3">
              <span className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs ${
                done ? "border-[#C9A84C] text-[#E8C766]" : "border-white/15 text-white/35"
              }`}>
                {done ? <Check className="h-3.5 w-3.5" /> : index + 1}
              </span>
              <span className={done ? "text-sm text-white/82" : "text-sm text-white/42"}>{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Panel({
  index,
  title,
  subtitle,
  children,
}: {
  index: number;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      variants={panelVariants}
      whileHover={{ borderColor: "rgba(201,168,76,0.55)", y: -2 }}
      transition={{ duration: 0.25 }}
      className="rounded-lg border border-[#C9A84C]/35 bg-black/45 p-4"
    >
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#C9A84C] text-sm text-[#E8C766]">{index}</span>
        <div>
          <h2 className="text-base font-medium text-white">{title}</h2>
          <p className="text-xs text-white/42">{subtitle}</p>
        </div>
      </div>
      {children}
    </motion.section>
  );
}

export default function PromptCreatePage() {
  const { t } = useLanguage();
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<SellerForm>({
    kitName: "Luxury Coffee Brand Launch Kit",
    category: "Product",
    targetBuyer: "coffee roasters, cafe owners, beverage marketers, and lifestyle content teams",
    buyerOutcome: "premium packaging visuals, cafe posters, roast profile cards, social ads, and cinematic beverage video prompts",
    mainResult: "a full launch-ready coffee brand visual system",
    tags: "coffee, product, branding, poster, social, video",
    visualStyle: "warm editorial cafe photography, premium tactile packaging, clean commercial layout, soft cinematic steam",
    materialSystem: "kraft paper bags, ceramic cups, espresso crema, roasted beans, wood counter, gold foil label, morning steam",
    layoutFormat: "hero packshot center, roast cards, cafe lifestyle strip, menu CTA block, social crop-safe composition",
    motionDirection: "espresso pours, steam rises, beans tumble, label catches light, final cup-and-bag hero frame",
    priceSKT: 170,
    isFree: false,
    coverImage: "",
    fields: defaultFields,
    assets: defaultAssets,
    models: ["midjourney", "flux", "Veo 3.1"],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const promptModules = useMemo(() => buildPromptModules(form), [form]);
  const examples = useMemo(() => buildExamples(form), [form]);
  const tags = splitTags(form.tags);
  const score = useMemo(() => {
    let points = 0;
    if (form.kitName.trim()) points += 15;
    if (form.targetBuyer.trim() && form.buyerOutcome.trim()) points += 20;
    if (form.fields.every((field) => !field.required || field.value.trim())) points += 20;
    if (form.assets.some((asset) => asset.url.trim())) points += 15;
    if (promptModules.length === 6) points += 15;
    if (form.priceSKT > 0 || form.isFree) points += 15;
    return Math.min(points, 100);
  }, [form, promptModules.length]);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] px-4">
        <div className="w-full max-w-sm rounded-lg border border-[#C9A84C]/25 bg-black/50 p-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg border border-[#C9A84C]/35 text-[#C9A84C]">
            <Package className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-xl font-semibold text-white">{t("promptCreate.loginRequired") || "Login required"}</h1>
          <p className="mt-2 text-sm text-white/45">You need to be logged in to create a prompt kit.</p>
          <button onClick={login} className="mt-5 w-full rounded-lg bg-[#C9A84C] py-2.5 text-sm font-semibold text-black">
            {t("common.login") || "Log In"}
          </button>
        </div>
      </div>
    );
  }

  const setField = <K extends keyof SellerForm>(key: K, value: SellerForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const updateCustomField = (key: string, patch: Partial<CustomField>) => {
    setForm((current) => ({
      ...current,
      fields: current.fields.map((field) => (field.key === key ? { ...field, ...patch } : field)),
    }));
  };

  const updateAsset = (key: string, url: string) => {
    setForm((current) => ({
      ...current,
      assets: current.assets.map((asset) => (asset.key === key ? { ...asset, url } : asset)),
      coverImage: key === "cover" ? url : current.coverImage,
    }));
  };

  const toggleModel = (model: AIModel) => {
    setForm((current) => ({
      ...current,
      models: current.models.includes(model)
        ? current.models.filter((item) => item !== model)
        : [...current.models, model],
    }));
  };

  const handleSubmit = async (draft = false) => {
    setError("");
    if (!form.kitName.trim()) {
      setError("Kit name is required.");
      return;
    }
    if (!form.targetBuyer.trim() || !form.buyerOutcome.trim()) {
      setError("Target buyer and buyer outcome are required.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: { en: form.kitName.trim() },
        description: {
          en: `A ${form.category.toLowerCase()} prompt kit for ${form.targetBuyer}. Helps buyers create ${form.buyerOutcome}.`,
        },
        category: categoryMap[form.category],
        tags,
        coverImage: form.coverImage.trim() || form.assets.find((asset) => asset.url.trim())?.url,
        priceSKT: form.isFree ? 0 : form.priceSKT,
        isFree: form.isFree,
        previewText: `${form.mainResult}: ${form.buyerOutcome}`,
        prompts: promptModules,
        models: form.models,
        examples,
      };
      const res = await promptMarketApi.create(payload);
      if (res.success) {
        navigate(draft ? "/prompt-market/sell" : "/prompt-market/sell");
      } else {
        setError(res.message || "Failed to create prompt kit.");
      }
    } catch {
      setError("Failed to create prompt kit.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <header className="sticky top-0 z-30 border-b border-[#C9A84C]/15 bg-black/85 backdrop-blur-xl">
        <div className="flex h-[62px] items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <Link to="/prompt-market/sell" className="flex items-center gap-2 text-white/60 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Seller Dashboard
            </Link>
            <ChevronRight className="h-4 w-4 text-white/25" />
            <span className="text-sm text-white/80">Create Prompt Kit</span>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={loading}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#C9A84C]/35 px-4 text-sm text-[#E8C766] hover:bg-[#C9A84C]/10 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={loading}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#C9A84C] px-4 text-sm font-semibold text-black hover:bg-[#dbbe66] disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Publish Kit
            </button>
          </div>
        </div>
      </header>

      <motion.main
        variants={pageVariants}
        initial="hidden"
        animate="show"
        className="grid min-h-[calc(100vh-62px)] grid-cols-1 lg:grid-cols-[300px_1fr]"
      >
        <motion.aside variants={panelVariants} className="border-r border-[#C9A84C]/15 bg-[#090a0a] p-5">
          <Stepper activeScore={score} />
          <div className="mt-5 rounded-lg border border-[#C9A84C]/25 bg-black/35 p-4">
            <p className="mb-3 text-sm font-semibold text-white">Validation checklist</p>
            {[
              ["Product name", Boolean(form.kitName.trim())],
              ["Buyer outcome", Boolean(form.buyerOutcome.trim())],
              ["6 prompt modules", promptModules.length === 6],
              ["Buyer custom fields", form.fields.length >= 6],
              ["Image-to-video ready", true],
              ["Pricing set", form.isFree || form.priceSKT > 0],
            ].map(([label, ok]) => (
              <div key={String(label)} className="mb-2 flex items-center gap-2 text-sm">
                <CheckCircle2 className={`h-4 w-4 ${ok ? "text-green-400" : "text-white/25"}`} />
                <span className={ok ? "text-white/72" : "text-white/35"}>{label}</span>
              </div>
            ))}
          </div>
        </motion.aside>

        <motion.section variants={panelVariants} className="bg-[linear-gradient(rgba(201,168,76,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(201,168,76,0.035)_1px,transparent_1px)] bg-[size:56px_56px] p-4 lg:p-6">
          <div className="mx-auto max-w-[1500px] space-y-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h1 className="flex items-center gap-2 text-2xl font-semibold text-[#E8C766]">
                  <Sparkles className="h-6 w-6" />
                  Create Prompt Kit to Sell
                </h1>
                <p className="mt-1 text-sm text-white/48">
                  Describe the kit like a product. Skyverses will package it into the blueprint standard automatically.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-2 rounded-md border border-[#C9A84C]/35 bg-[#C9A84C]/10 px-3 py-1 text-xs text-[#E8C766]">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Blueprint Standard
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-md border border-blue-400/25 bg-blue-500/10 px-3 py-1 text-xs text-blue-300">
                    <Video className="h-3.5 w-3.5" />
                    Image-to-Video Ready
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-md border border-green-500/25 bg-green-500/10 px-3 py-1 text-xs text-green-300">
                    <Wand2 className="h-3.5 w-3.5" />
                    Buyer Customizable
                  </span>
                </div>
              </div>
              {error && <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>}
            </div>

            <motion.div variants={pageVariants} className="grid gap-4 xl:grid-cols-[1fr_1.05fr_1.05fr]">
              <Panel index={1} title="What are you selling?" subtitle="Keep this buyer-facing. No blueprint jargon needed.">
                <div className="space-y-3">
                  <label className="block">
                    <span className="mb-1 block text-xs text-white/62">Kit name</span>
                    <input className={inputClass} value={form.kitName} onChange={(event) => setField("kitName", event.target.value)} />
                  </label>
                  <div>
                    <span className="mb-2 block text-xs text-white/62">Category</span>
                    <div className="flex flex-wrap gap-2">
                      {sellerCategories.map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => setField("category", category)}
                          className={`rounded-lg border px-3 py-1.5 text-xs transition ${
                            form.category === category
                              ? "border-[#C9A84C] bg-[#C9A84C]/15 text-[#E8C766]"
                              : "border-white/12 bg-white/[0.03] text-white/45 hover:text-white"
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                  <label className="block">
                    <span className="mb-1 block text-xs text-white/62">Target buyer</span>
                    <textarea rows={2} className={textareaClass} value={form.targetBuyer} onChange={(event) => setField("targetBuyer", event.target.value)} />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs text-white/62">Main result buyer gets</span>
                    <textarea rows={3} className={textareaClass} value={form.buyerOutcome} onChange={(event) => setField("buyerOutcome", event.target.value)} />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs text-white/62">Tags</span>
                    <input className={inputClass} value={form.tags} onChange={(event) => setField("tags", event.target.value)} />
                  </label>
                </div>
              </Panel>

              <Panel index={2} title="Buyer customization fields" subtitle="These become friendly variables for the buyer after purchase.">
                <div className="space-y-3">
                  {form.fields.map((field) => (
                    <div key={field.key} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-white">{field.label}</p>
                          <p className="text-[11px] text-white/35">{field.description}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => updateCustomField(field.key, { required: !field.required })}
                          className={`rounded-md border px-2 py-1 text-[11px] ${
                            field.required ? "border-[#C9A84C]/45 text-[#E8C766]" : "border-white/15 text-white/35"
                          }`}
                        >
                          Required
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        className={textareaClass}
                        value={field.value}
                        onChange={(event) => updateCustomField(field.key, { value: event.target.value })}
                      />
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel index={3} title="Reference media for sales preview" subtitle="Add samples for the marketplace listing. Video should be based on same-pack images.">
                <div className="grid grid-cols-2 gap-3">
                  {form.assets.map((asset) => (
                    <div key={asset.key} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm text-white/78">{asset.label}</span>
                        {asset.type === "video" ? <Play className="h-4 w-4 text-[#C9A84C]" /> : <ImageIcon className="h-4 w-4 text-[#C9A84C]" />}
                      </div>
                      <div className="mb-2 flex aspect-video items-center justify-center overflow-hidden rounded-md border border-white/10 bg-black/35">
                        {asset.url && asset.type === "image" ? (
                          <img src={asset.url} alt={asset.label} className="h-full w-full object-cover" />
                        ) : asset.url && asset.type === "video" ? (
                          <Video className="h-8 w-8 text-[#C9A84C]/65" />
                        ) : (
                          <Upload className="h-6 w-6 text-white/22" />
                        )}
                      </div>
                      <input
                        className="w-full rounded-md border border-white/10 bg-black/35 px-2 py-2 text-xs text-white/70 outline-none focus:border-[#C9A84C]/60"
                        value={asset.url}
                        onChange={(event) => updateAsset(asset.key, event.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex gap-2 rounded-lg border border-[#C9A84C]/35 bg-[#C9A84C]/10 p-3 text-xs leading-relaxed text-[#E8C766]">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" />
                  Video demo will use generated item images as references, matching buyer download flow.
                </div>
              </Panel>
            </motion.div>

            <motion.div variants={pageVariants} className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <motion.section variants={panelVariants} className="rounded-lg border border-[#C9A84C]/40 bg-black/45 p-4">
                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-base font-medium text-white">Pack Builder Preview</h2>
                    <p className="text-xs text-white/42">Skyverses maps your seller-friendly form into the prompt kit blueprint.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-[#C9A84C]/35 px-3 py-2 text-xs text-[#E8C766]">
                      <Sparkles className="h-4 w-4" />
                      Generate Preview Assets
                    </button>
                    <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-[#C9A84C]/35 px-3 py-2 text-xs text-[#E8C766]">
                      <CheckCircle2 className="h-4 w-4" />
                      Validate Blueprint
                    </button>
                  </div>
                </div>

                <motion.div variants={pageVariants} className="grid gap-3 md:grid-cols-3">
                  {promptModules.map((prompt) => (
                    <motion.div
                      key={prompt.title}
                      variants={panelVariants}
                      whileHover={{ y: -3, borderColor: "rgba(201,168,76,0.45)" }}
                      className="rounded-lg border border-white/10 bg-white/[0.03] p-3"
                    >
                      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md border border-[#C9A84C]/35 text-[#E8C766]">
                        <FileText className="h-4 w-4" />
                      </div>
                      <p className="text-sm font-medium text-white">{prompt.title.replace(/^\d+\.\s*/, "")}</p>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/38">{prompt.description}</p>
                    </motion.div>
                  ))}
                </motion.div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {[
                    ["Buyer examples", "3 guided examples with images/videos"],
                    ["Export formats", "Markdown and JSON"],
                    ["License", "Commercial use, resale protected"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg border border-[#C9A84C]/20 bg-[#C9A84C]/[0.04] p-3">
                      <p className="text-xs uppercase tracking-widest text-[#E8C766]/75">{label}</p>
                      <p className="mt-1 text-sm text-white/70">{value}</p>
                    </div>
                  ))}
                </div>
              </motion.section>

              <motion.section variants={panelVariants} className="rounded-lg border border-[#C9A84C]/40 bg-black/45 p-4">
                <h2 className="mb-4 text-base font-medium text-white">Marketplace Listing Preview</h2>
                <div className="overflow-hidden rounded-lg border border-[#C9A84C]/45 bg-[#090a0a]">
                  <div className="relative aspect-video bg-white/[0.04]">
                    {form.coverImage ? (
                      <img src={form.coverImage} alt={form.kitName} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-10 w-10 text-[#C9A84C]/45" />
                      </div>
                    )}
                    <div className="absolute left-3 top-3 rounded-md bg-[#C9A84C] px-2 py-1 text-xs font-semibold text-black">Top Rated</div>
                  </div>
                  <div className="p-4">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{form.kitName}</h3>
                        <p className="text-sm text-white/45">{form.category}</p>
                      </div>
                      <span className="text-sm font-semibold text-[#E8C766]">★ 4.9</span>
                    </div>
                    <p className="line-clamp-3 text-sm leading-relaxed text-white/55">{form.buyerOutcome}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {tags.slice(0, 4).map((tag) => (
                        <span key={tag} className="rounded-md border border-white/10 px-2 py-1 text-xs text-white/45">{tag}</span>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm text-[#E8C766]">
                        <CircleDollarSign className="mr-1 inline h-4 w-4" />
                        {form.isFree ? "Free" : `${form.priceSKT.toLocaleString()} SKT`}
                      </span>
                      <span className="rounded-lg border border-[#C9A84C]/35 px-3 py-2 text-sm text-[#E8C766]">Preview</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.03] p-3">
                  <div className="mb-2 flex items-center gap-2 text-sm text-white/72">
                    <Tag className="h-4 w-4 text-[#C9A84C]" />
                    Compatible models
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {modelOptions.map((model) => (
                      <button
                        key={model.value}
                        type="button"
                        onClick={() => toggleModel(model.value)}
                        className={`rounded-md border px-2 py-1 text-xs ${
                          form.models.includes(model.value)
                            ? "border-[#C9A84C]/55 bg-[#C9A84C]/12 text-[#E8C766]"
                            : "border-white/10 text-white/38 hover:text-white"
                        }`}
                      >
                        <Cpu className="mr-1 inline h-3 w-3" />
                        {model.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.03] p-3">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm text-white/72">Pricing</span>
                    <button
                      type="button"
                      onClick={() => setField("isFree", !form.isFree)}
                      className={`rounded-md border px-2 py-1 text-xs ${form.isFree ? "border-green-400/45 text-green-300" : "border-[#C9A84C]/45 text-[#E8C766]"}`}
                    >
                      {form.isFree ? "Free" : "Paid"}
                    </button>
                  </div>
                  {!form.isFree && (
                    <input
                      type="number"
                      min={1}
                      className={inputClass}
                      value={form.priceSKT}
                      onChange={(event) => setField("priceSKT", Math.max(1, Number(event.target.value)))}
                    />
                  )}
                  <p className="mt-2 text-xs text-white/35">Platform fee: 10%. Seller receives {Math.round((form.isFree ? 0 : form.priceSKT) * 0.9)} SKT per sale.</p>
                </div>
              </motion.section>
            </motion.div>
          </div>
        </motion.section>
      </motion.main>
    </div>
  );
}
