import React, { useMemo, useState } from 'react';
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  Position,
  ReactFlow,
  ReactFlowProvider,
  type Edge,
  type Node,
  type NodeProps,
  type NodeTypes,
} from '@xyflow/react';
import { motion } from 'framer-motion';
import {
  Check,
  Copy,
  Cpu,
  FileText,
  ImageIcon,
  Lock,
  PlayCircle,
  Sparkles,
  Video,
  Workflow,
  X,
} from 'lucide-react';
import type { PromptSet } from '../../types';

export type WorkflowPreviewTone = 'gold' | 'blue' | 'violet' | 'emerald' | 'rose';

export interface WorkflowPreviewStep {
  id: string;
  title: string;
  subtitle: string;
  tone: WorkflowPreviewTone;
  icon: 'start' | 'prompt' | 'model' | 'image' | 'video' | 'review' | 'lock';
  details: string[];
  media?: {
    type: 'image' | 'video';
    url: string;
    poster?: string;
  };
  meta?: string;
  locked?: boolean;
  x: number;
  y: number;
}

export interface WorkflowPreviewDefinition {
  title: string;
  subtitle: string;
  steps: WorkflowPreviewStep[];
  edges: Array<{ id: string; source: string; target: string; label?: string }>;
}

interface WorkflowNodeData extends Record<string, unknown> {
  step: WorkflowPreviewStep;
}

type WorkflowNode = Node<WorkflowNodeData, 'workflowPreview'>;

interface WorkflowPreviewModalProps {
  open: boolean;
  onClose: () => void;
  workflow: WorkflowPreviewDefinition;
}

const TONE_CLASS: Record<WorkflowPreviewTone, { border: string; bg: string; text: string; dot: string }> = {
  gold: {
    border: 'border-[#C9A84C]/35',
    bg: 'from-[#C9A84C]/18 to-[#C9A84C]/5',
    text: 'text-[#C9A84C]',
    dot: '#C9A84C',
  },
  blue: {
    border: 'border-sky-400/30',
    bg: 'from-sky-500/18 to-sky-500/5',
    text: 'text-sky-300',
    dot: '#38bdf8',
  },
  violet: {
    border: 'border-violet-400/30',
    bg: 'from-violet-500/18 to-violet-500/5',
    text: 'text-violet-300',
    dot: '#a78bfa',
  },
  emerald: {
    border: 'border-emerald-400/30',
    bg: 'from-emerald-500/18 to-emerald-500/5',
    text: 'text-emerald-300',
    dot: '#34d399',
  },
  rose: {
    border: 'border-rose-400/30',
    bg: 'from-rose-500/18 to-rose-500/5',
    text: 'text-rose-300',
    dot: '#fb7185',
  },
};

const iconFor = (icon: WorkflowPreviewStep['icon']) => {
  switch (icon) {
    case 'start':
      return <PlayCircle className="w-4 h-4" />;
    case 'prompt':
      return <FileText className="w-4 h-4" />;
    case 'model':
      return <Cpu className="w-4 h-4" />;
    case 'image':
      return <ImageIcon className="w-4 h-4" />;
    case 'video':
      return <Video className="w-4 h-4" />;
    case 'lock':
      return <Lock className="w-4 h-4" />;
    default:
      return <Sparkles className="w-4 h-4" />;
  }
};

const WorkflowPreviewNode: React.FC<NodeProps<WorkflowNode>> = ({ data }) => {
  const step = data.step;
  const tone = TONE_CLASS[step.tone];

  return (
    <div className={`w-[292px] overflow-hidden rounded-2xl border ${tone.border} bg-[#101015]/95 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl`}>
      <Handle
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !border-2 !border-[#101015]"
        style={{ background: tone.dot }}
      />
      <div className={`bg-gradient-to-br ${tone.bg} border-b border-white/[0.06] px-4 py-3`}>
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${tone.border} bg-black/25 ${tone.text}`}>
            {iconFor(step.icon)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{step.title}</p>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/45">{step.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2 p-4">
        {step.media && (
          <div className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-black/40">
            {step.media.type === 'video' ? (
              <>
                <video
                  src={step.media.url}
                  poster={step.media.poster}
                  muted
                  loop
                  playsInline
                  autoPlay
                  className="h-32 w-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur">
                    <PlayCircle className="h-5 w-5" />
                  </span>
                </div>
              </>
            ) : (
              <img src={step.media.url} alt="" className="h-32 w-full object-cover" loading="lazy" />
            )}
            <div className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white/75 backdrop-blur">
              {step.media.type}
            </div>
          </div>
        )}
        {step.meta && (
          <p className={`rounded-lg border ${tone.border} bg-white/[0.025] px-3 py-2 text-[10px] font-bold uppercase tracking-widest ${tone.text}`}>
            {step.meta}
          </p>
        )}
        {step.details.slice(0, step.media ? 5 : 6).map((detail) => (
          <div key={detail} className="flex items-start gap-2 rounded-xl border border-white/[0.04] bg-white/[0.025] px-3 py-2">
            <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${tone.text}`} style={{ background: tone.dot }} />
            <p className="line-clamp-3 text-[11px] leading-relaxed text-white/48">{detail}</p>
          </div>
        ))}
        {step.locked && (
          <div className="flex items-center gap-2 rounded-xl border border-[#C9A84C]/15 bg-[#C9A84C]/10 px-3 py-2 text-[11px] font-semibold text-[#C9A84C]">
            <Lock className="h-3.5 w-3.5" />
            Unlock after purchase
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !border-2 !border-[#101015]"
        style={{ background: tone.dot }}
      />
    </div>
  );
};

const nodeTypes = {
  workflowPreview: WorkflowPreviewNode,
} satisfies NodeTypes;

const toNodes = (steps: WorkflowPreviewStep[]): WorkflowNode[] =>
  steps.map((step) => ({
    id: step.id,
    type: 'workflowPreview',
    position: { x: step.x, y: step.y },
    data: { step },
    draggable: false,
    selectable: false,
  }));

const toEdges = (edges: WorkflowPreviewDefinition['edges']): Edge[] =>
  edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label,
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed, color: '#C9A84C' },
    style: { stroke: '#C9A84C', strokeWidth: 2 },
    labelStyle: { fill: '#C9A84C', fontSize: 11, fontWeight: 700 },
    labelBgStyle: { fill: '#101015', fillOpacity: 0.9 },
  }));

export const buildPromptWorkflowPreview = (
  promptSet: PromptSet,
  title: string,
  canViewFullPrompt: boolean
): WorkflowPreviewDefinition => {
  const examples = promptSet.examples ?? [];
  const imageCount = examples.filter((example) => example.image).length + (promptSet.coverImage ? 1 : 0);
  const videoCount = examples.filter((example) => example.video).length;
  const modelLabels = (promptSet.models ?? []).slice(0, 6);
  const promptTitles = promptSet.prompts.slice(0, 6).map((prompt) => prompt.title).filter(Boolean);
  const mediaSteps: WorkflowPreviewStep[] = [];
  const mediaEdges: WorkflowPreviewDefinition['edges'] = [];
  const reviewSources: string[] = [];

  if (promptSet.coverImage) {
    mediaSteps.push({
      id: 'cover-output',
      title: '4. Cover output',
      subtitle: 'Main marketplace cover and first quality target.',
      tone: 'emerald',
      icon: 'image',
      media: { type: 'image', url: promptSet.coverImage },
      meta: 'Hero cover',
      details: [
        'Use this as the visual north star for composition and detail density.',
        canViewFullPrompt ? 'Compare generated variants against the cover before exporting.' : 'Exact generation recipe unlocks after purchase.',
      ],
      locked: !canViewFullPrompt,
      x: 1040,
      y: -120,
    });
    mediaEdges.push({ id: 'models-cover-output', source: 'models', target: 'cover-output', label: 'cover' });
    reviewSources.push('cover-output');
  }

  examples.forEach((example, index) => {
    const rowY = index * 285;
    const imageId = `example-${index + 1}-image`;
    const videoId = `example-${index + 1}-video`;
    const exampleTitle = example.promptTitle || `Output ${index + 1}`;

    if (example.image) {
      mediaSteps.push({
        id: imageId,
        title: `${index + 5}. ${exampleTitle}`,
        subtitle: 'Generated image board / poster / detail output.',
        tone: 'emerald',
        icon: 'image',
        media: { type: 'image', url: example.image },
        meta: 'Image node',
        details: canViewFullPrompt
          ? [
              example.input || 'Input brief from this prompt module',
              example.style || 'Style and model direction',
              example.output || 'Expected image result',
            ]
          : [
              'Image output is visible as public proof.',
              'Input, style recipe, and exact output spec are locked.',
            ],
        locked: !canViewFullPrompt,
        x: 1040,
        y: rowY,
      });
      mediaEdges.push({ id: `models-${imageId}`, source: 'models', target: imageId, label: `image ${index + 1}` });
      reviewSources.push(imageId);
    }

    if (example.video) {
      mediaSteps.push({
        id: videoId,
        title: `${index + 5}. ${exampleTitle} · Video`,
        subtitle: 'Motion pass using the image direction as continuity reference.',
        tone: 'blue',
        icon: 'video',
        media: { type: 'video', url: example.video, poster: example.image || promptSet.coverImage },
        meta: 'Video node',
        details: canViewFullPrompt
          ? [
              example.input || 'Video input derived from the prompt module',
              example.style || 'Camera, timing, and motion style',
              example.output || 'Expected video result',
            ]
          : [
              'Video demo is visible as public proof.',
              'Camera prompt, timing, and motion notes are locked.',
            ],
        locked: !canViewFullPrompt,
        x: 1390,
        y: rowY,
      });
      mediaEdges.push({
        id: example.image ? `${imageId}-${videoId}` : `models-${videoId}`,
        source: example.image ? imageId : 'models',
        target: videoId,
        label: 'animate',
      });
      reviewSources.push(videoId);
    }
  });

  const steps: WorkflowPreviewStep[] = [
    {
      id: 'brief',
      title: '1. Input brief',
      subtitle: 'Define the project, subject, audience, and output goal.',
      tone: 'gold',
      icon: 'start',
      details: canViewFullPrompt
        ? [
            promptSet.previewText || title,
            `${promptSet.prompts.length} prompt modules included`,
            `${imageCount} image references and ${videoCount} video references`,
          ]
        : [
            'Safe public overview only',
            `${imageCount} image references and ${videoCount} video references`,
            'Exact brief fields are protected for paid packs',
          ],
      locked: !canViewFullPrompt,
      x: 0,
      y: 160,
    },
    {
      id: 'blueprint',
      title: '2. Prompt blueprint',
      subtitle: 'Use modular prompts, variables, and production notes.',
      tone: canViewFullPrompt ? 'blue' : 'rose',
      icon: canViewFullPrompt ? 'prompt' : 'lock',
      details: canViewFullPrompt && promptTitles.length
        ? promptTitles
        : [
            `${promptSet.prompts.length} reusable prompt modules`,
            'Prompt text, variables, style recipe, and notes unlock after purchase',
          ],
      locked: !canViewFullPrompt,
      x: 340,
      y: 160,
    },
    {
      id: 'models',
      title: '3. Model routing',
      subtitle: 'Pick the best model for board, image, or video output.',
      tone: 'violet',
      icon: 'model',
      details: modelLabels.length ? modelLabels : ['Nano Banana Pro', 'GPT Image', 'Veo 3.1'],
      x: 680,
      y: 160,
    },
    ...mediaSteps,
    {
      id: 'review',
      title: 'Final. Review & export',
      subtitle: 'Iterate variables and ship the strongest output set.',
      tone: 'gold',
      icon: 'review',
      details: [
        'Compare every output node against the showcase quality target.',
        'Adjust one variable at a time, then export the strongest image/video set.',
        canViewFullPrompt ? 'Use copy buttons in the prompt blueprint below the hero.' : 'Purchase unlocks the exact blueprint used by this workflow.',
      ],
      locked: !canViewFullPrompt,
      x: 1760,
      y: Math.max(120, ((Math.max(mediaSteps.length, 2) - 1) * 140)),
    },
  ];

  return {
    title: `${title} workflow`,
    subtitle: 'A full node map for turning this prompt pack into image boards, posters, video demos, and export-ready variants.',
    steps,
    edges: [
      { id: 'brief-blueprint', source: 'brief', target: 'blueprint', label: 'fill variables' },
      { id: 'blueprint-models', source: 'blueprint', target: 'models', label: 'route' },
      ...mediaEdges,
      ...reviewSources.map((source) => ({
        id: `${source}-review`,
        source,
        target: 'review',
        label: 'review',
      })),
    ],
  };
};

const WorkflowCanvas: React.FC<{ workflow: WorkflowPreviewDefinition }> = ({ workflow }) => {
  const nodes = useMemo(() => toNodes(workflow.steps), [workflow.steps]);
  const edges = useMemo(() => toEdges(workflow.edges), [workflow.edges]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      colorMode="dark"
      fitView
      fitViewOptions={{ padding: 0.22, minZoom: 0.45 }}
      minZoom={0.25}
      maxZoom={1.3}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      proOptions={{ hideAttribution: true }}
    >
      <Background variant={BackgroundVariant.Dots} color="rgba(255,255,255,0.08)" gap={24} size={1.4} />
      <Controls
        position="bottom-left"
        showInteractive={false}
        className="!border !border-white/[0.08] !bg-[#101015]/90 [&>button]:!border-white/[0.06] [&>button]:!bg-transparent [&>button]:!text-white/55"
      />
      <MiniMap
        position="bottom-right"
        pannable
        zoomable
        maskColor="rgba(0,0,0,0.65)"
        className="!rounded-xl !border !border-white/[0.08] !bg-[#101015]/90"
        nodeColor={(node) => TONE_CLASS[(node.data as WorkflowNodeData).step.tone].dot}
      />
    </ReactFlow>
  );
};

const WorkflowPreviewModal: React.FC<WorkflowPreviewModalProps> = ({ open, onClose, workflow }) => {
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const handleCopy = () => {
    const summary = workflow.steps
      .map((step, index) => `${index + 1}. ${step.title}: ${step.subtitle}`)
      .join('\n');
    navigator.clipboard.writeText(`${workflow.title}\n${workflow.subtitle}\n\n${summary}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-3 sm:p-6">
      <motion.button
        aria-label="Close workflow preview"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/85 backdrop-blur-2xl"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative flex h-[86vh] w-full max-w-[1500px] flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#08080c] shadow-[0_40px_120px_rgba(0,0,0,0.55)]"
      >
        <div className="flex flex-col gap-4 border-b border-white/[0.06] bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[#C9A84C]">
              <Workflow className="h-4 w-4" />
              <p className="text-[11px] font-bold uppercase tracking-[0.22em]">Workflow Nodes</p>
            </div>
            <h3 className="mt-2 truncate text-xl font-semibold text-white">{workflow.title}</h3>
            <p className="mt-1 max-w-2xl text-sm text-white/42">{workflow.subtitle}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] px-3 py-2 text-sm font-medium text-white/55 transition hover:border-[#C9A84C]/30 hover:text-[#C9A84C]"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied' : 'Copy map'}
            </button>
            <button
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] text-white/45 transition hover:border-white/15 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1">
          <ReactFlowProvider>
            <WorkflowCanvas workflow={workflow} />
          </ReactFlowProvider>
        </div>
      </motion.div>
    </div>
  );
};

export default WorkflowPreviewModal;
