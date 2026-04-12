import { useState, useCallback } from 'react';
import { Slide } from './useSlideStudio';
import { Language } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SlideProjectData {
  id: string;
  name: string;
  slides: Slide[];
  deckTopic: string;
  deckStyle: string;
  deckLanguage: Language;
  slideCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface SlideProjectMeta {
  id: string;
  name: string;
  slideCount: number;
  deckTopic: string;
  updatedAt: number;
  createdAt: number;
}

// ─── Storage keys ─────────────────────────────────────────────────────────────

const PROJECTS_LIST_KEY  = 'skyverses_slide_projects';        // string[] of ids
const ACTIVE_PROJECT_KEY = 'skyverses_slide_active_project';  // string (id)
const LEGACY_KEY         = 'skyverses_AI-SLIDE-CREATOR_vault'; // old single-vault key

const projectKey = (id: string) => `skyverses_slide_project_${id}`;

// ─── Low-level helpers ────────────────────────────────────────────────────────

const genId = () => `slide_proj_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

const readProjectIds = (): string[] => {
  try {
    const raw = localStorage.getItem(PROJECTS_LIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const writeProjectIds = (ids: string[]) => {
  try { localStorage.setItem(PROJECTS_LIST_KEY, JSON.stringify(ids)); } catch { /* quota */ }
};

const readProject = (id: string): SlideProjectData | null => {
  try {
    const raw = localStorage.getItem(projectKey(id));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

const writeProject = (data: SlideProjectData) => {
  try { localStorage.setItem(projectKey(data.id), JSON.stringify(data)); } catch { /* quota */ }
};

const deleteProjectFromStorage = (id: string) => {
  try { localStorage.removeItem(projectKey(id)); } catch { /* noop */ }
};

const defaultProject = (name = 'Slide mới'): SlideProjectData => ({
  id: genId(),
  name,
  slides: [],
  deckTopic: '',
  deckStyle: 'corporate',
  deckLanguage: 'vi',
  slideCount: 6,
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

/** Migrate legacy single-vault data → first project entry */
const migrateLegacy = (): SlideProjectData | null => {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return null;
    const old = JSON.parse(raw);
    if (!old?.slides?.length && !old?.deckTopic) return null;
    const migrated: SlideProjectData = {
      id: genId(),
      name: old.deckTopic ? `${old.deckTopic.slice(0, 30)}` : 'Slide đã lưu',
      slides: old.slides ?? [],
      deckTopic: old.deckTopic ?? '',
      deckStyle: old.deckStyle ?? 'corporate',
      deckLanguage: old.deckLanguage ?? 'vi',
      slideCount: old.slideCount ?? 6,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    localStorage.removeItem(LEGACY_KEY);
    return migrated;
  } catch { return null; }
};

/** Build meta list from stored ids */
const buildMeta = (ids: string[]): SlideProjectMeta[] =>
  ids
    .map((id) => {
      const p = readProject(id);
      if (!p) return null;
      return {
        id: p.id,
        name: p.name,
        slideCount: p.slides?.length ?? 0,
        deckTopic: p.deckTopic,
        updatedAt: p.updatedAt,
        createdAt: p.createdAt,
      } satisfies SlideProjectMeta;
    })
    .filter(Boolean) as SlideProjectMeta[];

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useSlideProjectManager = () => {
  const [projectIds, setProjectIds] = useState<string[]>(() => {
    let ids = readProjectIds();

    if (ids.length === 0) {
      // Try migrate legacy single-vault
      const migrated = migrateLegacy();
      if (migrated) {
        ids = [migrated.id];
        writeProject(migrated);
        writeProjectIds(ids);
        localStorage.setItem(ACTIVE_PROJECT_KEY, migrated.id);
      } else {
        // Brand-new installation — create empty first project
        const fresh = defaultProject();
        ids = [fresh.id];
        writeProject(fresh);
        writeProjectIds(ids);
        localStorage.setItem(ACTIVE_PROJECT_KEY, fresh.id);
      }
    }

    return ids;
  });

  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    const saved = localStorage.getItem(ACTIVE_PROJECT_KEY);
    const ids = readProjectIds();
    if (saved && ids.includes(saved)) return saved;
    return ids[0] ?? '';
  });

  const [projects, setProjects] = useState<SlideProjectMeta[]>(() => buildMeta(readProjectIds()));

  const refreshMeta = useCallback((ids: string[]) => {
    setProjects(buildMeta(ids));
  }, []);

  // ── Create ────────────────────────────────────────────────────────────────
  const createProject = useCallback(
    (name = 'Slide mới'): SlideProjectData => {
      const p = defaultProject(name);
      writeProject(p);
      const ids = [...readProjectIds(), p.id];
      writeProjectIds(ids);
      setProjectIds(ids);
      setActiveProjectId(p.id);
      localStorage.setItem(ACTIVE_PROJECT_KEY, p.id);
      refreshMeta(ids);
      return p;
    },
    [refreshMeta],
  );

  // ── Load ──────────────────────────────────────────────────────────────────
  const loadProject = useCallback((id: string): SlideProjectData => {
    return readProject(id) ?? defaultProject();
  }, []);

  // ── Switch ────────────────────────────────────────────────────────────────
  const switchProject = useCallback(
    (id: string): SlideProjectData => {
      const ids = readProjectIds();
      if (!ids.includes(id)) return readProject(activeProjectId) ?? defaultProject();
      setActiveProjectId(id);
      localStorage.setItem(ACTIVE_PROJECT_KEY, id);
      return readProject(id) ?? defaultProject();
    },
    [activeProjectId],
  );

  // ── Save ──────────────────────────────────────────────────────────────────
  const saveCurrentProject = useCallback(
    (data: Partial<SlideProjectData> & { id?: string }) => {
      const id = data.id ?? activeProjectId;
      const existing = readProject(id) ?? defaultProject();
      const updated: SlideProjectData = {
        ...existing,
        ...data,
        id,
        updatedAt: Date.now(),
      };
      writeProject(updated);
      setProjects((prev) =>
        prev.map((m) =>
          m.id === id
            ? {
                ...m,
                slideCount: updated.slides?.length ?? 0,
                deckTopic: updated.deckTopic,
                updatedAt: updated.updatedAt,
                name: updated.name,
              }
            : m,
        ),
      );
    },
    [activeProjectId],
  );

  // ── Rename ────────────────────────────────────────────────────────────────
  const renameProject = useCallback((id: string, name: string) => {
    const p = readProject(id);
    if (!p) return;
    writeProject({ ...p, name, updatedAt: Date.now() });
    setProjects((prev) => prev.map((m) => (m.id === id ? { ...m, name } : m)));
  }, []);

  // ── Duplicate ─────────────────────────────────────────────────────────────
  const duplicateProject = useCallback(
    (id: string): string => {
      const source = readProject(id);
      if (!source) return activeProjectId;
      const copy: SlideProjectData = {
        ...source,
        id: genId(),
        name: `${source.name} (bản sao)`,
        // Reset bgJobId/bgStatus on cloned slides to avoid stale states
        slides: source.slides.map((s) => ({ ...s, bgJobId: null, bgStatus: s.bgImageUrl ? 'done' : 'idle' })),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      writeProject(copy);
      const ids = [...readProjectIds(), copy.id];
      writeProjectIds(ids);
      setProjectIds(ids);
      setActiveProjectId(copy.id);
      localStorage.setItem(ACTIVE_PROJECT_KEY, copy.id);
      refreshMeta(ids);
      return copy.id;
    },
    [activeProjectId, refreshMeta],
  );

  // ── Delete ────────────────────────────────────────────────────────────────
  const deleteProject = useCallback(
    (id: string): string => {
      const ids = readProjectIds();
      if (ids.length <= 1) return activeProjectId; // Never delete last

      deleteProjectFromStorage(id);
      const newIds = ids.filter((i) => i !== id);
      writeProjectIds(newIds);
      setProjectIds(newIds);
      refreshMeta(newIds);

      let nextActiveId = activeProjectId;
      if (activeProjectId === id) {
        nextActiveId = newIds[0];
        setActiveProjectId(nextActiveId);
        localStorage.setItem(ACTIVE_PROJECT_KEY, nextActiveId);
      }
      return nextActiveId;
    },
    [activeProjectId, refreshMeta],
  );

  return {
    projects,
    projectIds,
    activeProjectId,
    createProject,
    loadProject,
    switchProject,
    saveCurrentProject,
    renameProject,
    duplicateProject,
    deleteProject,
  };
};
