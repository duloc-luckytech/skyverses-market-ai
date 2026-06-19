export type AppGameShowcaseType = 'app' | 'game' | 'ai';

export type AppGameShowcaseMetricIcon =
  | 'Activity'
  | 'BrainCircuit'
  | 'Clock3'
  | 'Gamepad2'
  | 'LineChart'
  | 'Map'
  | 'MessageSquareText'
  | 'Rocket'
  | 'ShieldCheck'
  | 'Sparkles';

export type AppGameShowcasePlatform =
  | 'iOS'
  | 'Android'
  | 'Web'
  | 'PWA'
  | 'Desktop'
  | 'Tablet'
  | 'Console';

export interface AppGameShowcaseFeature {
  title: string;
  description: string;
}

export interface AppGameShowcaseDeliverable {
  title: string;
  detail: string;
}

export interface AppGameShowcaseChecklistItem {
  label: string;
  completed: boolean;
}

export interface AppGameShowcaseItem {
  id: string;
  title: string;
  type: AppGameShowcaseType;
  category: string;
  industry: string;
  badge: string;
  metric: string;
  metricIcon: AppGameShowcaseMetricIcon;
  buildTime: string;
  costSaving: string;
  platforms: readonly AppGameShowcasePlatform[];
  tags: readonly string[];
  subtitle: string;
  description: string;
  audience: string;
  heroImage: string;
  galleryImages: readonly string[];
  features: readonly AppGameShowcaseFeature[];
  deliverables: readonly AppGameShowcaseDeliverable[];
  checklist: readonly AppGameShowcaseChecklistItem[];
}

export type AppGameShowcaseListItem = Pick<
  AppGameShowcaseItem,
  | 'id'
  | 'title'
  | 'type'
  | 'category'
  | 'industry'
  | 'badge'
  | 'metric'
  | 'metricIcon'
  | 'buildTime'
  | 'costSaving'
  | 'platforms'
  | 'tags'
  | 'subtitle'
  | 'heroImage'
>;

export type AppGameShowcaseDetail = AppGameShowcaseItem;

const getShowcaseImages = (id: string): Pick<AppGameShowcaseItem, 'heroImage' | 'galleryImages'> => ({
  heroImage: `/assets/showcase/app-game/${id}-cover.png`,
  galleryImages: [
    `/assets/showcase/app-game/${id}-showcase.png`,
    `/assets/showcase/app-game/${id}-screen.png`,
  ],
});

export const APP_GAME_SHOWCASE_ITEMS = [
  {
    id: 'chefmate-kitchen',
    title: 'ChefMate Kitchen OS',
    type: 'app',
    category: 'Mobile operations app',
    industry: 'Food service',
    badge: 'Kitchen-ready MVP',
    metric: '32% faster prep handoff',
    metricIcon: 'Clock3',
    buildTime: '5-7 weeks',
    costSaving: 'Save 2 coordinator shifts per week',
    platforms: ['iOS', 'Android', 'Tablet'],
    tags: ['Kitchen display', 'Inventory', 'Shift notes', 'QR ordering'],
    subtitle: 'A pocket command center for small restaurants that need cleaner handoffs.',
    description:
      'ChefMate combines prep boards, low-stock alerts, supplier notes, and table QR requests in one mobile workflow so owners can run lunch rush without a wall of spreadsheets.',
    audience: 'Independent restaurants, cloud kitchens, cafe chains, and franchise operators.',
    ...getShowcaseImages('chefmate-kitchen'),
    features: [
      {
        title: 'Live prep board',
        description: 'Stations see order batches, modifiers, timers, and allergy flags without switching tools.',
      },
      {
        title: 'Smart stock warnings',
        description: 'Ingredient usage rolls up from orders and warns managers before critical items run out.',
      },
      {
        title: 'Shift memory',
        description: 'Closing notes, waste logs, and supplier issues are summarized for the next team.',
      },
    ],
    deliverables: [
      { title: 'Mobile app prototype', detail: 'Owner, cashier, and kitchen station flows.' },
      { title: 'Admin dashboard', detail: 'Menu, stock, staff roles, and supplier settings.' },
      { title: 'Launch kit', detail: 'QR templates, seed menu, and store onboarding checklist.' },
    ],
    checklist: [
      { label: 'Role-based station views', completed: true },
      { label: 'Inventory threshold rules', completed: true },
      { label: 'POS integration discovery', completed: false },
    ],
  },
  {
    id: 'aurora-run',
    title: 'Aurora Run',
    type: 'game',
    category: 'Mobile endless runner',
    industry: 'Casual games',
    badge: 'Playable vertical slice',
    metric: '90-second core loop',
    metricIcon: 'Gamepad2',
    buildTime: '4-6 weeks',
    costSaving: 'Prototype before full art spend',
    platforms: ['iOS', 'Android', 'Web'],
    tags: ['Runner', 'Cosmetics', 'Daily quests', 'One-thumb'],
    subtitle: 'A northern-lights runner built around rhythm, dodges, and collectible sky trails.',
    description:
      'Aurora Run turns a simple lane runner into a collectible live-ops concept with short sessions, cosmetic trails, obstacle patterns, and daily challenge boards for retention testing.',
    audience: 'Casual game studios, brand campaigns, and publishers testing lightweight mobile IP.',
    ...getShowcaseImages('aurora-run'),
    features: [
      {
        title: 'Rhythm lane system',
        description: 'Obstacle waves land on a music grid so movement feels readable and satisfying.',
      },
      {
        title: 'Trail cosmetics',
        description: 'Players unlock aurora ribbons, comet dust, and seasonal sky effects.',
      },
      {
        title: 'Daily challenge seed',
        description: 'A deterministic run seed supports leaderboards without heavy backend logic.',
      },
    ],
    deliverables: [
      { title: 'Game design slice', detail: 'Core loop, controls, scoring, and progression draft.' },
      { title: 'Playable web build plan', detail: 'Mobile-first mechanics ready for Unity or Phaser.' },
      { title: 'Asset brief', detail: 'Character, obstacle, and environment prompts for production.' },
    ],
    checklist: [
      { label: 'Core loop documented', completed: true },
      { label: 'Monetization test points', completed: true },
      { label: 'Multiplayer race mode', completed: false },
    ],
  },
  {
    id: 'carebridge-home',
    title: 'CareBridge Home',
    type: 'app',
    category: 'Care coordination app',
    industry: 'Healthcare services',
    badge: 'Family-care workflow',
    metric: '18 fewer missed tasks monthly',
    metricIcon: 'ShieldCheck',
    buildTime: '6-8 weeks',
    costSaving: 'Reduce manual check-in calls',
    platforms: ['iOS', 'Android', 'Web'],
    tags: ['Care plan', 'Medication', 'Family updates', 'Appointments'],
    subtitle: 'A shared care timeline for families, nurses, and home-care coordinators.',
    description:
      'CareBridge Home gives non-clinical teams a secure way to coordinate visits, medications, incident notes, and family updates without sending sensitive care details through chat threads.',
    audience: 'Home-care agencies, elder-care teams, family offices, and private nurse networks.',
    ...getShowcaseImages('carebridge-home'),
    features: [
      {
        title: 'Care timeline',
        description: 'Visits, notes, medication reminders, and appointment prep stay in one chronological view.',
      },
      {
        title: 'Family digest',
        description: 'Approved relatives receive clear summaries instead of raw operational chatter.',
      },
      {
        title: 'Incident capture',
        description: 'Staff can log vitals, photos, severity, and follow-up tasks from the field.',
      },
    ],
    deliverables: [
      { title: 'Secure app flows', detail: 'Caregiver, coordinator, and family member experiences.' },
      { title: 'Data model map', detail: 'Residents, visits, tasks, notes, and consent boundaries.' },
      { title: 'Compliance notes', detail: 'Privacy assumptions and audit-log requirements for review.' },
    ],
    checklist: [
      { label: 'Permission matrix drafted', completed: true },
      { label: 'Care task templates', completed: true },
      { label: 'Clinical system integration', completed: false },
    ],
  },
  {
    id: 'forgequest-tactics',
    title: 'ForgeQuest Tactics',
    type: 'game',
    category: 'Turn-based strategy RPG',
    industry: 'Midcore games',
    badge: 'Systems-first concept',
    metric: '12 hero archetypes',
    metricIcon: 'Map',
    buildTime: '8-10 weeks',
    costSaving: 'Validate combat depth pre-production',
    platforms: ['Web', 'Desktop', 'Tablet'],
    tags: ['Tactics', 'Crafting', 'Guilds', 'PvE seasons'],
    subtitle: 'A grid tactics prototype where every weapon recipe changes team strategy.',
    description:
      'ForgeQuest Tactics explores a midcore combat loop with craftable weapons, terrain combos, hero synergies, and seasonal PvE maps before committing to expensive content production.',
    audience: 'Indie studios, publishers, and Web3-adjacent teams that need a real game loop first.',
    ...getShowcaseImages('forgequest-tactics'),
    features: [
      {
        title: 'Recipe-driven builds',
        description: 'Weapon recipes modify attack shapes, cooldowns, and elemental reactions.',
      },
      {
        title: 'Readable grid combat',
        description: 'Threat previews, terrain bonuses, and turn order keep battles tactical without clutter.',
      },
      {
        title: 'Guild season model',
        description: 'Async map clears and crafting goals create progression without forcing real-time play.',
      },
    ],
    deliverables: [
      { title: 'Combat spec', detail: 'Units, stats, terrain, equipment, and encounter rules.' },
      { title: 'Prototype backlog', detail: 'Milestones for battle, inventory, map, and season systems.' },
      { title: 'Content matrix', detail: 'Hero archetypes, enemy roles, and starter recipes.' },
    ],
    checklist: [
      { label: 'Combat math baseline', completed: true },
      { label: 'Starter hero roster', completed: true },
      { label: 'Economy balance simulation', completed: false },
    ],
  },
  {
    id: 'legal-lens-ai',
    title: 'Legal Lens AI',
    type: 'ai',
    category: 'Document intelligence',
    industry: 'Legal operations',
    badge: 'Clause review assistant',
    metric: '64% faster first pass',
    metricIcon: 'BrainCircuit',
    buildTime: '4-5 weeks',
    costSaving: 'Cut routine review hours',
    platforms: ['Web', 'Desktop'],
    tags: ['Contract review', 'Risk flags', 'Summaries', 'Knowledge base'],
    subtitle: 'An AI workspace for turning long agreements into risk-aware review briefs.',
    description:
      'Legal Lens AI ingests contracts, extracts key clauses, compares them against playbooks, and creates reviewer-ready summaries with traceable citations for legal and procurement teams.',
    audience: 'In-house legal teams, procurement departments, contract managers, and startup counsel.',
    ...getShowcaseImages('legal-lens-ai'),
    features: [
      {
        title: 'Clause radar',
        description: 'Finds unusual terms, missing protections, renewal traps, and negotiation hotspots.',
      },
      {
        title: 'Playbook comparison',
        description: 'Maps extracted language against company policy so reviewers see why a risk matters.',
      },
      {
        title: 'Citation-first answers',
        description: 'Every summary point links back to the source section for human verification.',
      },
    ],
    deliverables: [
      { title: 'AI review flow', detail: 'Upload, extraction, risk scoring, and reviewer notes.' },
      { title: 'Prompt policy pack', detail: 'Clause taxonomy, risk language, and escalation templates.' },
      { title: 'Admin controls', detail: 'Playbook settings, document types, and retention rules.' },
    ],
    checklist: [
      { label: 'Clause taxonomy defined', completed: true },
      { label: 'Human review gates', completed: true },
      { label: 'Jurisdiction-specific advice', completed: false },
    ],
  },
  {
    id: 'fieldpulse-crm',
    title: 'FieldPulse CRM',
    type: 'app',
    category: 'Field sales app',
    industry: 'B2B sales',
    badge: 'Sales route accelerator',
    metric: '21% more visits per week',
    metricIcon: 'LineChart',
    buildTime: '5-6 weeks',
    costSaving: 'Replace spreadsheet route planning',
    platforms: ['iOS', 'Android', 'PWA'],
    tags: ['CRM', 'Routes', 'Visit notes', 'Offline mode'],
    subtitle: 'A mobile CRM for reps who sell from streets, showrooms, and trade counters.',
    description:
      'FieldPulse CRM focuses on the daily reality of field sales: route planning, offline account notes, follow-up tasks, voice summaries, and fast reporting after every customer visit.',
    audience: 'Distribution teams, B2B wholesalers, medical reps, and regional sales managers.',
    ...getShowcaseImages('fieldpulse-crm'),
    features: [
      {
        title: 'Route-first accounts',
        description: 'Customers are grouped by territory, priority, distance, and visit cadence.',
      },
      {
        title: 'Voice-to-note recap',
        description: 'Reps dictate after meetings and receive structured notes plus next actions.',
      },
      {
        title: 'Offline visit kit',
        description: 'Account history, product sheets, and forms remain usable when reception is weak.',
      },
    ],
    deliverables: [
      { title: 'Mobile CRM flows', detail: 'Territory map, account detail, visit recap, and task queue.' },
      { title: 'Manager dashboard', detail: 'Coverage, pipeline hygiene, and overdue visit reporting.' },
      { title: 'Integration brief', detail: 'CRM import/export assumptions and sync conflict rules.' },
    ],
    checklist: [
      { label: 'Offline data scope', completed: true },
      { label: 'Voice recap structure', completed: true },
      { label: 'ERP pricing sync', completed: false },
    ],
  },
  {
    id: 'pixel-pet-academy',
    title: 'Pixel Pet Academy',
    type: 'game',
    category: 'Cozy learning game',
    industry: 'Edutainment',
    badge: 'Kid-safe game loop',
    metric: '7-day habit journey',
    metricIcon: 'Sparkles',
    buildTime: '6-8 weeks',
    costSaving: 'Test learning loop before curriculum build',
    platforms: ['iOS', 'Android', 'Tablet', 'Web'],
    tags: ['Pets', 'Learning', 'Rewards', 'Parent view'],
    subtitle: 'A cozy pet-care game that turns short lessons into visible creature growth.',
    description:
      'Pixel Pet Academy pairs bite-size math, language, or science challenges with pet care, room decoration, and parent-visible progress so learning feels like tending a tiny world.',
    audience: 'Edtech founders, children-focused publishers, after-school centers, and family brands.',
    ...getShowcaseImages('pixel-pet-academy'),
    features: [
      {
        title: 'Lesson-to-care loop',
        description: 'Correct answers feed, groom, train, or decorate the pet environment.',
      },
      {
        title: 'Parent progress view',
        description: 'Adults see streaks, skill areas, and suggested practice without exposing social features.',
      },
      {
        title: 'Safe customization',
        description: 'Cosmetics and room items are earned through play with no open chat dependency.',
      },
    ],
    deliverables: [
      { title: 'Game economy draft', detail: 'Rewards, pet moods, lessons, and room progression.' },
      { title: 'Learning UX map', detail: 'Question flow, hints, feedback, and parent summary screens.' },
      { title: 'Safety checklist', detail: 'Privacy, ads, social limits, and content moderation boundaries.' },
    ],
    checklist: [
      { label: 'Core learning loop', completed: true },
      { label: 'Parent controls', completed: true },
      { label: 'Licensed curriculum content', completed: false },
    ],
  },
  {
    id: 'studio-pitch-ai',
    title: 'Studio Pitch AI',
    type: 'ai',
    category: 'Creative sales assistant',
    industry: 'Agencies and studios',
    badge: 'Pitch deck generator',
    metric: '3-hour pitch draft',
    metricIcon: 'Rocket',
    buildTime: '3-5 weeks',
    costSaving: 'Reduce unpaid pitch prep',
    platforms: ['Web', 'Desktop'],
    tags: ['Brief parser', 'Deck outline', 'Moodboards', 'Proposal copy'],
    subtitle: 'An AI brief room that turns messy client notes into pitch-ready structure.',
    description:
      'Studio Pitch AI helps creative teams convert meeting notes, RFPs, and reference links into strategic angles, deck outlines, moodboard prompts, scopes, and proposal copy.',
    audience: 'Brand studios, video agencies, creative freelancers, and internal marketing teams.',
    ...getShowcaseImages('studio-pitch-ai'),
    features: [
      {
        title: 'Brief distillation',
        description: 'Extracts goals, constraints, audience signals, deliverables, and hidden risks.',
      },
      {
        title: 'Concept routes',
        description: 'Generates distinct strategic directions with tone, visual language, and proof points.',
      },
      {
        title: 'Scope builder',
        description: 'Turns a selected route into phases, deliverables, assumptions, and budget notes.',
      },
    ],
    deliverables: [
      { title: 'AI workflow prototype', detail: 'Brief input, concept route, and proposal generation.' },
      { title: 'Prompt library', detail: 'Strategy, moodboard, treatment, and scope prompt templates.' },
      { title: 'Export model', detail: 'Deck outline, markdown proposal, and asset-generation briefs.' },
    ],
    checklist: [
      { label: 'Brief parser fields', completed: true },
      { label: 'Proposal export format', completed: true },
      { label: 'Brand voice training set', completed: false },
    ],
  },
  {
    id: 'metro-tycoon-mini',
    title: 'Metro Tycoon Mini',
    type: 'game',
    category: 'Management sim',
    industry: 'Simulation games',
    badge: 'Economy prototype',
    metric: '15-minute city loop',
    metricIcon: 'Activity',
    buildTime: '7-9 weeks',
    costSaving: 'Balance economy before art scale-up',
    platforms: ['Web', 'Desktop', 'Tablet'],
    tags: ['Tycoon', 'Transit', 'Economy', 'City growth'],
    subtitle: 'A compact transit sim about routes, crowds, upgrades, and daily city pressure.',
    description:
      'Metro Tycoon Mini compresses city transit management into readable decisions: add routes, tune schedules, upgrade stations, respond to events, and keep riders moving during peak hours.',
    audience: 'Simulation publishers, civic education teams, and studios testing management mechanics.',
    ...getShowcaseImages('metro-tycoon-mini'),
    features: [
      {
        title: 'Demand heatmap',
        description: 'Neighborhoods generate rider pressure by time of day, event, and station capacity.',
      },
      {
        title: 'Route economics',
        description: 'Players balance ticket revenue, train frequency, delays, and maintenance costs.',
      },
      {
        title: 'City event cards',
        description: 'Rain, concerts, breakdowns, and holidays create tactical disruptions.',
      },
    ],
    deliverables: [
      { title: 'Economy model', detail: 'Demand, revenue, capacity, delays, and upgrade pacing.' },
      { title: 'Prototype UX', detail: 'Map controls, station panels, route editor, and event feed.' },
      { title: 'Balancing sheet', detail: 'Starting values and tuning ranges for playtests.' },
    ],
    checklist: [
      { label: 'Demand model drafted', completed: true },
      { label: 'Station upgrade ladder', completed: true },
      { label: 'Scenario editor', completed: false },
    ],
  },
  {
    id: 'travelnest-planner',
    title: 'TravelNest Planner',
    type: 'app',
    category: 'Group travel app',
    industry: 'Travel and hospitality',
    badge: 'Trip collaboration MVP',
    metric: '40% fewer planning chats',
    metricIcon: 'MessageSquareText',
    buildTime: '5-7 weeks',
    costSaving: 'Automate itinerary coordination',
    platforms: ['iOS', 'Android', 'Web', 'PWA'],
    tags: ['Itinerary', 'Group voting', 'Budget split', 'AI planning'],
    subtitle: 'A shared trip board for friends, families, and boutique travel advisors.',
    description:
      'TravelNest Planner keeps group trips organized with collaborative itineraries, preference voting, budget splits, booking notes, and AI-generated day plans that adapt to real constraints.',
    audience: 'Travel startups, boutique agencies, community hosts, and group-trip organizers.',
    ...getShowcaseImages('travelnest-planner'),
    features: [
      {
        title: 'Collaborative itinerary',
        description: 'Travelers vote on activities, lock decisions, and see timing conflicts before booking.',
      },
      {
        title: 'Budget clarity',
        description: 'Shared costs, deposits, and personal expenses are separated by traveler.',
      },
      {
        title: 'Adaptive day plans',
        description: 'AI suggests realistic routes based on pace, distance, weather, and group interests.',
      },
    ],
    deliverables: [
      { title: 'Trip workspace design', detail: 'Planner, voting, budget, and traveler preference flows.' },
      { title: 'AI itinerary brief', detail: 'Prompt inputs, constraints, output structure, and edit rules.' },
      { title: 'Partner-ready model', detail: 'Hotel, tour, and booking-link integration assumptions.' },
    ],
    checklist: [
      { label: 'Group voting logic', completed: true },
      { label: 'Budget split rules', completed: true },
      { label: 'Live booking inventory', completed: false },
    ],
  },
] satisfies readonly AppGameShowcaseItem[];

export const APP_GAME_SHOWCASE_LIST: readonly AppGameShowcaseListItem[] = APP_GAME_SHOWCASE_ITEMS;

export const getAppGameShowcaseById = (id: string): AppGameShowcaseDetail | undefined =>
  APP_GAME_SHOWCASE_ITEMS.find((item) => item.id === id);
