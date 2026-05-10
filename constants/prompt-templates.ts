/* ─── Prompt Templates (creative scenarios) ─── */

export interface PromptTemplate {
  key: string;
  label: string;
  description: string;
  icon: string;
  category: string;
  tags: string[];
  prompts: {
    title: string;
    content: string;
    description: string;
    variables: { name: string; description: string; defaultValue: string }[];
  }[];
}

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    key: 'photo_album',
    label: 'Photo Album Script',
    description: 'Structured prompts for creating themed photo album shoots with scenes, moods, and styling.',
    icon: '📸',
    category: 'design',
    tags: ['photography', 'album', 'creative', 'image-generation'],
    prompts: [
      {
        title: 'Album Concept & Theme',
        content: 'Create a detailed concept for a {{album_type}} photo album.\n\nTheme: {{theme}}\nMood: {{mood}}\nColor palette: {{color_palette}}\nTarget audience: {{audience}}\n\nProvide:\n1. Album title suggestion\n2. Overall narrative arc\n3. 5-8 scene descriptions with specific visual directions\n4. Styling notes (fashion, props, location)',
        description: 'Define the overall concept, theme, and visual direction for the album',
        variables: [
          { name: 'album_type', description: 'Type of album (wedding, portrait, fashion, travel, etc.)', defaultValue: 'fashion editorial' },
          { name: 'theme', description: 'Main theme or concept', defaultValue: 'Urban Dreams' },
          { name: 'mood', description: 'Emotional tone', defaultValue: 'moody, cinematic' },
          { name: 'color_palette', description: 'Dominant colors', defaultValue: 'deep teal, warm amber, soft cream' },
          { name: 'audience', description: 'Who is this for', defaultValue: 'social media, portfolio' },
        ],
      },
      {
        title: 'Scene-by-Scene Shot List',
        content: 'Generate a detailed shot list for scene {{scene_number}} of the album.\n\nScene title: {{scene_title}}\nLocation: {{location}}\nTime of day: {{time_of_day}}\nSubject: {{subject}}\n\nFor each shot, specify:\n- Camera angle & composition\n- Lighting description\n- Subject pose/action\n- Background details\n- Post-processing style\n\nGenerate {{shot_count}} unique shots.',
        description: 'Detailed shot-by-shot breakdown for each scene',
        variables: [
          { name: 'scene_number', description: 'Scene number', defaultValue: '1' },
          { name: 'scene_title', description: 'Name of this scene', defaultValue: 'Golden Hour Rooftop' },
          { name: 'location', description: 'Shooting location', defaultValue: 'urban rooftop with city skyline' },
          { name: 'time_of_day', description: 'Time and lighting', defaultValue: 'golden hour, sunset' },
          { name: 'subject', description: 'Subject description', defaultValue: 'female model, casual luxury style' },
          { name: 'shot_count', description: 'Number of shots', defaultValue: '6' },
        ],
      },
      {
        title: 'AI Image Generation Prompt',
        content: '{{style}} photograph of {{subject_description}}, {{scene_setting}}, {{lighting}}, {{composition}}, {{mood_adjectives}}, {{technical_specs}}',
        description: 'Ready-to-use prompt for AI image generators (Midjourney, DALL-E, Flux)',
        variables: [
          { name: 'style', description: 'Photography style', defaultValue: 'editorial fashion' },
          { name: 'subject_description', description: 'Subject details', defaultValue: 'young woman in flowing silk dress' },
          { name: 'scene_setting', description: 'Background/scene', defaultValue: 'standing on a misty bridge at dawn' },
          { name: 'lighting', description: 'Light setup', defaultValue: 'soft natural backlight, lens flare' },
          { name: 'composition', description: 'Framing', defaultValue: 'medium shot, rule of thirds, shallow depth of field' },
          { name: 'mood_adjectives', description: 'Mood keywords', defaultValue: 'ethereal, dreamlike, serene' },
          { name: 'technical_specs', description: 'Camera settings feel', defaultValue: '85mm f/1.4, film grain, Fujifilm colors' },
        ],
      },
    ],
  },
  {
    key: 'short_film',
    label: 'Short Film Script',
    description: 'Complete prompt set for short film production: concept, screenplay, shot list, and storyboard.',
    icon: '🎬',
    category: 'writing',
    tags: ['film', 'screenplay', 'video', 'short-film', 'storyboard'],
    prompts: [
      {
        title: 'Film Concept & Logline',
        content: 'Develop a concept for a {{duration}}-minute short film.\n\nGenre: {{genre}}\nTheme: {{theme}}\nSetting: {{setting}}\nTone: {{tone}}\n\nProvide:\n1. Logline (1-2 sentences)\n2. Synopsis (150 words)\n3. Character breakdown (name, role, brief arc)\n4. Key visual motifs\n5. Intended mood/atmosphere',
        description: 'High-level concept and logline for the short film',
        variables: [
          { name: 'duration', description: 'Film length in minutes', defaultValue: '5' },
          { name: 'genre', description: 'Film genre', defaultValue: 'sci-fi drama' },
          { name: 'theme', description: 'Central theme', defaultValue: 'the cost of memory' },
          { name: 'setting', description: 'Where/when', defaultValue: 'near-future Tokyo apartment' },
          { name: 'tone', description: 'Emotional tone', defaultValue: 'melancholic, intimate' },
        ],
      },
      {
        title: 'Scene Screenplay',
        content: 'Write scene {{scene_number}} of the short film in standard screenplay format.\n\nScene location: {{location}}\nTime: {{time}}\nCharacters present: {{characters}}\nScene objective: {{objective}}\nEmotional beat: {{emotional_beat}}\n\nInclude:\n- Scene heading (INT/EXT)\n- Action lines with visual detail\n- Dialogue (if any)\n- Transitions\n- Camera direction suggestions in parentheticals',
        description: 'Full screenplay for individual scenes',
        variables: [
          { name: 'scene_number', description: 'Scene number', defaultValue: '1' },
          { name: 'location', description: 'Scene location', defaultValue: 'INT. SMALL APARTMENT - NIGHT' },
          { name: 'time', description: 'Time of day', defaultValue: 'late night, 2 AM' },
          { name: 'characters', description: 'Characters in scene', defaultValue: 'YUKI (28), alone' },
          { name: 'objective', description: 'What happens in this scene', defaultValue: 'Yuki discovers a forgotten voice recording' },
          { name: 'emotional_beat', description: 'How should the audience feel', defaultValue: 'curiosity turning to nostalgia' },
        ],
      },
      {
        title: 'Shot List & Storyboard Directions',
        content: 'Create a detailed shot list for scene {{scene_number}}.\n\nFor each shot:\n- Shot number & type (wide/medium/close-up/extreme CU)\n- Camera movement (static/pan/tilt/dolly/handheld)\n- Duration estimate\n- Action/dialogue covered\n- Lighting notes\n- Sound design notes\n- Visual reference description for storyboard artist\n\nScene description: {{scene_description}}\nMood: {{mood}}\nPacing: {{pacing}}',
        description: 'Technical shot list with storyboard directions',
        variables: [
          { name: 'scene_number', description: 'Scene number', defaultValue: '1' },
          { name: 'scene_description', description: 'What happens', defaultValue: 'Character enters dark room, finds old device' },
          { name: 'mood', description: 'Visual mood', defaultValue: 'dark, intimate, blue-tinted' },
          { name: 'pacing', description: 'Scene pacing', defaultValue: 'slow, contemplative' },
        ],
      },
      {
        title: 'AI Video Generation Prompt',
        content: '{{shot_type}} shot, {{camera_movement}}, {{subject_action}}, {{environment}}, {{lighting_style}}, {{color_grade}}, {{atmosphere}}, cinematic, {{aspect_ratio}}',
        description: 'Ready-to-use prompt for AI video generators (Kling, Seedance, Runway)',
        variables: [
          { name: 'shot_type', description: 'Shot framing', defaultValue: 'close-up' },
          { name: 'camera_movement', description: 'Camera motion', defaultValue: 'slow dolly in' },
          { name: 'subject_action', description: 'What the subject does', defaultValue: 'woman slowly opens her eyes, tears on cheek' },
          { name: 'environment', description: 'Setting', defaultValue: 'dimly lit apartment, rain on window' },
          { name: 'lighting_style', description: 'Light', defaultValue: 'single practical light source, warm tungsten' },
          { name: 'color_grade', description: 'Color treatment', defaultValue: 'desaturated teal and orange' },
          { name: 'atmosphere', description: 'Mood keywords', defaultValue: 'melancholic, quiet, raw emotion' },
          { name: 'aspect_ratio', description: 'Aspect ratio', defaultValue: '16:9 cinematic' },
        ],
      },
    ],
  },
  {
    key: 'feature_film',
    label: 'Feature Film / Series Script',
    description: 'Comprehensive prompt pack for long-form film or series: structure, acts, characters, world-building.',
    icon: '🎥',
    category: 'writing',
    tags: ['film', 'screenplay', 'series', 'feature', 'long-form', 'world-building'],
    prompts: [
      {
        title: 'Story Bible & World-Building',
        content: 'Create a story bible for a {{format}} titled "{{working_title}}".\n\nGenre: {{genre}}\nSetting: {{setting}}\nTime period: {{time_period}}\nCore conflict: {{core_conflict}}\n\nInclude:\n1. World rules & logic\n2. Social/political structure\n3. Key locations (5+) with descriptions\n4. Technology/magic system (if applicable)\n5. Cultural details\n6. Visual aesthetic & reference films\n7. Thematic pillars (3-4 themes)',
        description: 'Comprehensive world-building document for the story universe',
        variables: [
          { name: 'format', description: 'Film or series', defaultValue: 'limited series (6 episodes)' },
          { name: 'working_title', description: 'Project name', defaultValue: 'The Last Signal' },
          { name: 'genre', description: 'Genre', defaultValue: 'sci-fi thriller' },
          { name: 'setting', description: 'Primary setting', defaultValue: 'a colony ship drifting between solar systems' },
          { name: 'time_period', description: 'When', defaultValue: '2340 AD' },
          { name: 'core_conflict', description: 'Central conflict', defaultValue: 'a mysterious signal forces the crew to choose between mission and survival' },
        ],
      },
      {
        title: 'Character Deep-Dive',
        content: 'Create a detailed character profile for {{character_name}}.\n\nRole: {{role}}\nAge: {{age}}\nOccupation: {{occupation}}\n\nProvide:\n1. Physical description (casting notes)\n2. Backstory (formative events)\n3. Personality (strengths, flaws, quirks)\n4. Character arc across the story\n5. Key relationships\n6. Internal vs external conflict\n7. Signature dialogue style\n8. Visual motifs associated with character',
        description: 'In-depth character development profile',
        variables: [
          { name: 'character_name', description: 'Character name', defaultValue: 'Captain Nara Osei' },
          { name: 'role', description: 'Story role', defaultValue: 'protagonist' },
          { name: 'age', description: 'Age', defaultValue: '42' },
          { name: 'occupation', description: 'What they do', defaultValue: 'ship commander, former military engineer' },
        ],
      },
      {
        title: 'Act/Episode Structure',
        content: 'Outline {{structure_type}} for "{{working_title}}".\n\nTotal runtime: {{runtime}}\nAct/Episode: {{act_number}}\nTitle: {{act_title}}\n\nBreak down into:\n1. Opening hook\n2. Key plot points (5-7)\n3. Character moments\n4. Subplot threads\n5. Climax/cliffhanger\n6. Emotional arc (beginning → end of act)\n7. Foreshadowing elements\n8. Estimated page count per beat',
        description: 'Structural breakdown by act or episode',
        variables: [
          { name: 'structure_type', description: 'Structure format', defaultValue: 'episode outline' },
          { name: 'working_title', description: 'Project name', defaultValue: 'The Last Signal' },
          { name: 'runtime', description: 'Total runtime', defaultValue: '45 min per episode' },
          { name: 'act_number', description: 'Which act/episode', defaultValue: 'Episode 1 (Pilot)' },
          { name: 'act_title', description: 'Act/episode title', defaultValue: 'First Contact' },
        ],
      },
      {
        title: 'Scene Screenplay (Cinematic)',
        content: 'Write a cinematic screenplay scene.\n\nScene: {{scene_heading}}\nCharacters: {{characters}}\nPurpose: {{scene_purpose}}\nSubtext: {{subtext}}\nVisual tone: {{visual_tone}}\n\nWrite in professional screenplay format with:\n- Evocative action lines\n- Layered dialogue with subtext\n- Camera suggestions where impactful\n- Sound design cues\n- Transition to next scene',
        description: 'Professional-grade screenplay scene writing',
        variables: [
          { name: 'scene_heading', description: 'Scene heading', defaultValue: 'INT. BRIDGE - SHIP - NIGHT CYCLE' },
          { name: 'characters', description: 'Characters present', defaultValue: 'NARA, CHIEF ENGINEER MALIK' },
          { name: 'scene_purpose', description: 'Why this scene exists', defaultValue: 'Nara must convince Malik to divert course despite the risk' },
          { name: 'subtext', description: 'What is unspoken', defaultValue: 'Nara knows something she has not told Malik' },
          { name: 'visual_tone', description: 'Visual style', defaultValue: 'low light, screens casting blue glow, tension in stillness' },
        ],
      },
      {
        title: 'VFX & Production Design Brief',
        content: 'Create a VFX/production design brief for {{sequence_name}}.\n\nDescription: {{sequence_description}}\nBudget tier: {{budget}}\n\nInclude:\n1. Key VFX shots breakdown\n2. Practical vs digital split\n3. Reference images/films description\n4. Color palette & lighting design\n5. Sound design direction\n6. Music/score notes\n7. AI-generated concept art prompts (3-5 prompts ready for Midjourney/DALL-E)',
        description: 'Technical production brief with AI art direction prompts',
        variables: [
          { name: 'sequence_name', description: 'Sequence/scene name', defaultValue: 'The Signal Arrival' },
          { name: 'sequence_description', description: 'What happens', defaultValue: 'The ship receives the alien signal, crew gathers on bridge as screens light up with unknown patterns' },
          { name: 'budget', description: 'Budget level', defaultValue: 'mid-range indie' },
        ],
      },
    ],
  },
  {
    key: 'marketing_campaign',
    label: 'Marketing Campaign',
    description: 'End-to-end marketing campaign prompts: strategy, ad copy, social media, email sequences.',
    icon: '📢',
    category: 'marketing',
    tags: ['marketing', 'ads', 'social-media', 'copywriting', 'email'],
    prompts: [
      {
        title: 'Campaign Strategy & Brief',
        content: 'Create a comprehensive marketing campaign brief.\n\nProduct/Service: {{product}}\nTarget Audience: {{audience}}\nCampaign Goal: {{goal}}\nBudget Tier: {{budget}}\nDuration: {{duration}}\n\nProvide:\n1. Campaign name & tagline\n2. Key messaging pillars (3-4)\n3. Channel strategy (social, email, paid ads, content)\n4. Content calendar outline\n5. KPI targets\n6. Competitive positioning',
        description: 'Define campaign objectives, audience, and channel strategy',
        variables: [
          { name: 'product', description: 'Product or service name', defaultValue: 'SaaS productivity tool' },
          { name: 'audience', description: 'Target demographic', defaultValue: 'remote workers, 25-40, tech-savvy' },
          { name: 'goal', description: 'Primary campaign goal', defaultValue: 'drive 1000 free trial signups' },
          { name: 'budget', description: 'Budget level', defaultValue: 'mid-range ($5K-15K)' },
          { name: 'duration', description: 'Campaign length', defaultValue: '4 weeks' },
        ],
      },
      {
        title: 'Ad Copy Generator',
        content: 'Write {{ad_count}} ad variations for {{platform}}.\n\nProduct: {{product}}\nUSP: {{usp}}\nTone: {{tone}}\nCTA: {{cta}}\n\nFor each ad provide:\n- Headline ({{headline_limit}} chars max)\n- Body copy ({{body_limit}} chars max)\n- Call-to-action button text\n- Suggested visual direction',
        description: 'Generate platform-specific ad copy variations',
        variables: [
          { name: 'ad_count', description: 'Number of variations', defaultValue: '5' },
          { name: 'platform', description: 'Ad platform', defaultValue: 'Facebook/Instagram' },
          { name: 'product', description: 'Product name', defaultValue: 'TaskFlow Pro' },
          { name: 'usp', description: 'Unique selling proposition', defaultValue: 'AI-powered task prioritization that saves 2 hours daily' },
          { name: 'tone', description: 'Brand voice', defaultValue: 'professional yet friendly' },
          { name: 'cta', description: 'Desired action', defaultValue: 'Start Free Trial' },
          { name: 'headline_limit', description: 'Headline character limit', defaultValue: '40' },
          { name: 'body_limit', description: 'Body character limit', defaultValue: '125' },
        ],
      },
      {
        title: 'Email Sequence',
        content: 'Write email {{email_number}} of a {{sequence_length}}-email {{sequence_type}} sequence.\n\nBrand: {{brand}}\nRecipient stage: {{stage}}\nEmail goal: {{email_goal}}\nTone: {{tone}}\n\nInclude:\n- Subject line (+ 2 A/B variants)\n- Preview text\n- Email body (HTML-friendly structure)\n- CTA button text\n- P.S. line\n- Optimal send time suggestion',
        description: 'Automated email sequence for nurture, onboarding, or sales',
        variables: [
          { name: 'email_number', description: 'Email position in sequence', defaultValue: '1' },
          { name: 'sequence_length', description: 'Total emails', defaultValue: '5' },
          { name: 'sequence_type', description: 'Sequence type', defaultValue: 'onboarding' },
          { name: 'brand', description: 'Brand name', defaultValue: 'TaskFlow' },
          { name: 'stage', description: 'Customer journey stage', defaultValue: 'just signed up for free trial' },
          { name: 'email_goal', description: 'Goal of this email', defaultValue: 'get user to complete profile setup' },
          { name: 'tone', description: 'Email tone', defaultValue: 'helpful, concise, action-oriented' },
        ],
      },
      {
        title: 'Social Media Content Calendar',
        content: 'Create {{post_count}} social media posts for {{platform}} over {{timeframe}}.\n\nBrand: {{brand}}\nTheme: {{theme}}\nContent pillars: {{pillars}}\n\nFor each post:\n- Post type (carousel, reel, story, static)\n- Caption with hashtags\n- Visual description / AI image prompt\n- Best posting time\n- Engagement hook',
        description: 'Ready-to-schedule social media content batch',
        variables: [
          { name: 'post_count', description: 'Number of posts', defaultValue: '10' },
          { name: 'platform', description: 'Social platform', defaultValue: 'Instagram' },
          { name: 'timeframe', description: 'Time period', defaultValue: '2 weeks' },
          { name: 'brand', description: 'Brand name', defaultValue: 'TaskFlow' },
          { name: 'theme', description: 'Content theme', defaultValue: 'productivity tips for remote teams' },
          { name: 'pillars', description: 'Content categories', defaultValue: 'tips, testimonials, behind-the-scenes, product features' },
        ],
      },
    ],
  },
  {
    key: 'coding_assistant',
    label: 'Coding Assistant',
    description: 'Developer productivity prompts: code generation, review, refactoring, documentation, and testing.',
    icon: '💻',
    category: 'coding',
    tags: ['coding', 'development', 'programming', 'refactoring', 'testing'],
    prompts: [
      {
        title: 'Feature Implementation',
        content: 'Implement a {{feature_type}} feature in {{language}}/{{framework}}.\n\nFeature: {{feature_description}}\nExisting code context: {{context}}\nConstraints: {{constraints}}\n\nProvide:\n1. Architecture approach\n2. File structure changes\n3. Complete implementation code\n4. TypeScript types/interfaces\n5. Error handling\n6. Usage example',
        description: 'Generate production-ready feature code with architecture',
        variables: [
          { name: 'feature_type', description: 'Type of feature', defaultValue: 'CRUD API endpoint' },
          { name: 'language', description: 'Programming language', defaultValue: 'TypeScript' },
          { name: 'framework', description: 'Framework', defaultValue: 'Next.js 14 (App Router)' },
          { name: 'feature_description', description: 'What to build', defaultValue: 'user bookmark system with folders' },
          { name: 'context', description: 'Existing codebase context', defaultValue: 'Prisma ORM, PostgreSQL, NextAuth for auth' },
          { name: 'constraints', description: 'Technical constraints', defaultValue: 'must support pagination, soft delete, and bulk operations' },
        ],
      },
      {
        title: 'Code Review & Refactor',
        content: 'Review and refactor the following {{language}} code.\n\nCode:\n```\n{{code}}\n```\n\nFocus areas: {{focus}}\nPerformance target: {{performance}}\n\nProvide:\n1. Issues found (severity: critical/warning/info)\n2. Security vulnerabilities\n3. Performance bottlenecks\n4. Refactored code with explanations\n5. Before/after comparison',
        description: 'Code review with actionable refactoring suggestions',
        variables: [
          { name: 'language', description: 'Language', defaultValue: 'TypeScript' },
          { name: 'code', description: 'Code to review', defaultValue: '// paste code here' },
          { name: 'focus', description: 'Review focus', defaultValue: 'performance, readability, SOLID principles' },
          { name: 'performance', description: 'Performance goals', defaultValue: 'reduce bundle size, optimize re-renders' },
        ],
      },
      {
        title: 'Test Suite Generator',
        content: 'Generate a comprehensive test suite for {{component_type}}.\n\nCode/Component: {{code_description}}\nTesting framework: {{test_framework}}\nCoverage target: {{coverage}}\n\nInclude:\n1. Unit tests for all public methods\n2. Edge cases and boundary values\n3. Error/exception scenarios\n4. Mock setup for dependencies\n5. Integration test for happy path\n6. Test data factories',
        description: 'Generate unit and integration tests with full coverage',
        variables: [
          { name: 'component_type', description: 'What to test', defaultValue: 'React component' },
          { name: 'code_description', description: 'Component/module description', defaultValue: 'UserProfile component with edit mode, avatar upload, and form validation' },
          { name: 'test_framework', description: 'Testing framework', defaultValue: 'Vitest + React Testing Library' },
          { name: 'coverage', description: 'Coverage goal', defaultValue: '90%+ line coverage' },
        ],
      },
      {
        title: 'API Documentation',
        content: 'Generate API documentation for {{api_type}}.\n\nEndpoint: {{endpoint}}\nMethod: {{method}}\nAuthentication: {{auth}}\n\nDocument:\n1. Endpoint description\n2. Request headers, params, query, body (with types)\n3. Response schema (success + error cases)\n4. Example requests (cURL, JavaScript fetch)\n5. Rate limits & pagination\n6. Error codes table',
        description: 'Generate OpenAPI-style documentation for endpoints',
        variables: [
          { name: 'api_type', description: 'API style', defaultValue: 'REST' },
          { name: 'endpoint', description: 'Endpoint path', defaultValue: '/api/v1/users/:id/bookmarks' },
          { name: 'method', description: 'HTTP method', defaultValue: 'GET' },
          { name: 'auth', description: 'Auth method', defaultValue: 'Bearer token (JWT)' },
        ],
      },
    ],
  },
  {
    key: 'seo_content',
    label: 'SEO Content Pack',
    description: 'Search-optimized content creation: keyword research, blog posts, meta tags, and content clusters.',
    icon: '🔍',
    category: 'marketing',
    tags: ['seo', 'content', 'blog', 'keywords', 'copywriting'],
    prompts: [
      {
        title: 'Keyword Research & Strategy',
        content: 'Conduct keyword research for {{niche}}.\n\nPrimary topic: {{topic}}\nTarget audience: {{audience}}\nCompetitor URLs: {{competitors}}\nContent goal: {{goal}}\n\nProvide:\n1. Primary keyword (with estimated search volume)\n2. 10-15 secondary/LSI keywords\n3. 5 long-tail keyword opportunities\n4. Keyword difficulty assessment\n5. Search intent classification for each\n6. Content gap opportunities\n7. Recommended content cluster structure',
        description: 'Keyword strategy with search intent mapping',
        variables: [
          { name: 'niche', description: 'Industry/niche', defaultValue: 'AI tools for creators' },
          { name: 'topic', description: 'Main topic', defaultValue: 'AI image generation for marketing' },
          { name: 'audience', description: 'Target reader', defaultValue: 'digital marketers, small business owners' },
          { name: 'competitors', description: 'Competitor sites', defaultValue: 'competitor1.com, competitor2.com' },
          { name: 'goal', description: 'Content objective', defaultValue: 'rank top 5 for primary keyword within 6 months' },
        ],
      },
      {
        title: 'SEO Blog Post',
        content: 'Write a {{word_count}}-word SEO-optimized blog post.\n\nPrimary keyword: {{keyword}}\nSecondary keywords: {{secondary_keywords}}\nSearch intent: {{intent}}\nTarget audience: {{audience}}\nTone: {{tone}}\n\nStructure:\n- H1 title (include primary keyword, power word, number if applicable)\n- Meta description (155 chars)\n- Introduction with hook\n- {{section_count}} H2 sections with H3 subsections\n- Key takeaways / TL;DR\n- FAQ section (3-5 questions)\n- Internal linking suggestions\n- CTA at the end',
        description: 'Full-length SEO blog post with proper heading structure',
        variables: [
          { name: 'word_count', description: 'Target word count', defaultValue: '2000' },
          { name: 'keyword', description: 'Primary keyword', defaultValue: 'AI image generator for marketing' },
          { name: 'secondary_keywords', description: 'LSI keywords', defaultValue: 'AI marketing visuals, automated image creation, brand image AI' },
          { name: 'intent', description: 'Search intent', defaultValue: 'informational + commercial' },
          { name: 'audience', description: 'Target reader', defaultValue: 'marketing managers exploring AI tools' },
          { name: 'tone', description: 'Writing tone', defaultValue: 'authoritative yet accessible' },
          { name: 'section_count', description: 'Number of main sections', defaultValue: '5' },
        ],
      },
      {
        title: 'Meta Tags & Schema Markup',
        content: 'Generate SEO meta tags and structured data for {{page_type}}.\n\nPage URL: {{url}}\nPrimary keyword: {{keyword}}\nPage content summary: {{summary}}\nBrand: {{brand}}\n\nProvide:\n1. Title tag (60 chars max)\n2. Meta description (155 chars max)\n3. Open Graph tags (title, description, image alt)\n4. Twitter Card tags\n5. JSON-LD structured data ({{schema_type}})\n6. Canonical URL recommendation\n7. Hreflang tags if multilingual',
        description: 'Complete meta tag set with structured data markup',
        variables: [
          { name: 'page_type', description: 'Type of page', defaultValue: 'product landing page' },
          { name: 'url', description: 'Page URL', defaultValue: '/products/ai-image-generator' },
          { name: 'keyword', description: 'Target keyword', defaultValue: 'AI image generator' },
          { name: 'summary', description: 'Page content summary', defaultValue: 'AI-powered image generation tool for marketers and designers' },
          { name: 'brand', description: 'Brand name', defaultValue: 'Skyverses' },
          { name: 'schema_type', description: 'Schema.org type', defaultValue: 'SoftwareApplication' },
        ],
      },
    ],
  },
  {
    key: 'education_course',
    label: 'Education & Course Design',
    description: 'Course creation prompts: curriculum design, lesson plans, quizzes, and learning materials.',
    icon: '📚',
    category: 'education',
    tags: ['education', 'course', 'curriculum', 'lesson-plan', 'e-learning'],
    prompts: [
      {
        title: 'Course Curriculum Design',
        content: 'Design a curriculum for a {{course_type}} course.\n\nCourse title: {{title}}\nSubject: {{subject}}\nTarget learner: {{learner}}\nDuration: {{duration}}\nLevel: {{level}}\n\nProvide:\n1. Course description & learning outcomes (5-7)\n2. Prerequisites\n3. Module breakdown ({{module_count}} modules)\n4. For each module: title, objectives, topics, estimated time\n5. Assessment strategy\n6. Resources & tools needed\n7. Certification criteria',
        description: 'Full course structure with modules and learning outcomes',
        variables: [
          { name: 'course_type', description: 'Course format', defaultValue: 'online self-paced' },
          { name: 'title', description: 'Course name', defaultValue: 'AI for Creative Professionals' },
          { name: 'subject', description: 'Main subject', defaultValue: 'using AI tools for image, video, and content creation' },
          { name: 'learner', description: 'Target student', defaultValue: 'designers and content creators with no AI experience' },
          { name: 'duration', description: 'Total duration', defaultValue: '8 weeks, 3-4 hours/week' },
          { name: 'level', description: 'Difficulty level', defaultValue: 'beginner to intermediate' },
          { name: 'module_count', description: 'Number of modules', defaultValue: '8' },
        ],
      },
      {
        title: 'Lesson Plan',
        content: 'Create a detailed lesson plan for Module {{module_number}}: {{module_title}}.\n\nCourse: {{course_title}}\nLesson duration: {{duration}}\nLearning objectives: {{objectives}}\n\nInclude:\n1. Lesson outline with time allocation\n2. Opening hook / engagement activity\n3. Core content (theory + examples)\n4. Hands-on exercise / workshop activity\n5. Discussion questions\n6. Key takeaways summary\n7. Homework / practice assignment\n8. Additional resources',
        description: 'Detailed lesson plan with activities and exercises',
        variables: [
          { name: 'module_number', description: 'Module number', defaultValue: '3' },
          { name: 'module_title', description: 'Module name', defaultValue: 'Prompt Engineering Fundamentals' },
          { name: 'course_title', description: 'Course name', defaultValue: 'AI for Creative Professionals' },
          { name: 'duration', description: 'Lesson length', defaultValue: '90 minutes' },
          { name: 'objectives', description: 'Learning objectives', defaultValue: 'write effective prompts, understand prompt structure, iterate for better results' },
        ],
      },
      {
        title: 'Quiz & Assessment Generator',
        content: 'Create a {{assessment_type}} for {{topic}}.\n\nDifficulty: {{difficulty}}\nQuestion count: {{question_count}}\nTarget skills: {{skills}}\n\nProvide:\n1. {{question_count}} questions with:\n   - Question text\n   - Answer options (for MCQ) or rubric (for open-ended)\n   - Correct answer with explanation\n   - Bloom\'s taxonomy level\n   - Mapped learning objective\n2. Grading criteria\n3. Time estimate',
        description: 'Generate quizzes, exams, or assessments with answer keys',
        variables: [
          { name: 'assessment_type', description: 'Type', defaultValue: 'module quiz (mixed format)' },
          { name: 'topic', description: 'Topic covered', defaultValue: 'Prompt Engineering Fundamentals' },
          { name: 'difficulty', description: 'Difficulty level', defaultValue: 'intermediate' },
          { name: 'question_count', description: 'Number of questions', defaultValue: '10' },
          { name: 'skills', description: 'Skills to assess', defaultValue: 'prompt structure, variable usage, iterative refinement' },
        ],
      },
      {
        title: 'Learning Material & Handout',
        content: 'Create a {{material_type}} for {{topic}}.\n\nAudience: {{audience}}\nFormat: {{format}}\nLength: {{length}}\n\nInclude:\n1. Clear explanations with analogies\n2. Visual diagram descriptions (for designer to create)\n3. Step-by-step tutorials\n4. Real-world examples ({{example_count}})\n5. Common mistakes / pitfalls\n6. Quick reference cheat sheet\n7. Practice exercises',
        description: 'Educational handouts, cheat sheets, and reference materials',
        variables: [
          { name: 'material_type', description: 'Type of material', defaultValue: 'reference guide + cheat sheet' },
          { name: 'topic', description: 'Topic', defaultValue: 'AI Image Generation Prompt Syntax' },
          { name: 'audience', description: 'Target audience', defaultValue: 'beginner designers learning AI tools' },
          { name: 'format', description: 'Output format', defaultValue: 'printable PDF-friendly' },
          { name: 'length', description: 'Content length', defaultValue: '3-5 pages' },
          { name: 'example_count', description: 'Number of examples', defaultValue: '5' },
        ],
      },
    ],
  },
];
