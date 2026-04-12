import { useState, useCallback, useEffect } from 'react';
import { Scene, ReferenceAsset } from './useStoryboardStudio';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ProjectData {
  id: string;
  name: string;
  script: string;
  scenes: Scene[];
  assets: ReferenceAsset[];
  settings: Record<string, any>;
  totalDuration: number;
  sceneDuration: number;
  createdAt: number;
  updatedAt: number;
}

export interface ProjectMeta {
  id: string;
  name: string;
  sceneCount: number;
  updatedAt: number;
  createdAt: number;
}

// ─── Storage keys ─────────────────────────────────────────────────────────────
const PROJECTS_LIST_KEY   = 'skyverses_storyboard_projects';     // string[] of ids
const ACTIVE_PROJECT_KEY  = 'skyverses_storyboard_active_project'; // string (id)
const LEGACY_PROJECT_KEY  = 'skyverses_storyboard_project';       // old single-project key

const projectKey = (id: string) => `skyverses_storyboard_project_${id}`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const genId = () => `proj_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

const readProjectIds = (): string[] => {
  try {
    const raw = localStorage.getItem(PROJECTS_LIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const writeProjectIds = (ids: string[]) => {
  try { localStorage.setItem(PROJECTS_LIST_KEY, JSON.stringify(ids)); } catch { /* quota */ }
};

const readProject = (id: string): ProjectData | null => {
  try {
    const raw = localStorage.getItem(projectKey(id));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

const writeProject = (data: ProjectData) => {
  try { localStorage.setItem(projectKey(data.id), JSON.stringify(data)); } catch { /* quota */ }
};

const deleteProjectFromStorage = (id: string) => {
  try { localStorage.removeItem(projectKey(id)); } catch { /* noop */ }
};

const defaultProject = (name = 'Kịch bản 1'): ProjectData => ({
  id: genId(),
  name,
  script: '',
  scenes: [],
  assets: [],
  settings: {},
  totalDuration: 64,
  sceneDuration: 8,
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

/** Migrate legacy single-project data → first project entry */
const migrateLegacy = (): ProjectData | null => {
  try {
    const raw = localStorage.getItem(LEGACY_PROJECT_KEY);
    if (!raw) return null;
    const old = JSON.parse(raw);
    const migrated: ProjectData = {
      id: genId(),
      name: old.projectName || 'Kịch bản 1',
      script: old.script || '',
      scenes: old.scenes || [],
      assets: old.assets || [],
      settings: {},
      totalDuration: old.totalDuration || 64,
      sceneDuration: old.sceneDuration || 8,
      createdAt: old.updatedAt || Date.now(),
      updatedAt: old.updatedAt || Date.now(),
    };
    localStorage.removeItem(LEGACY_PROJECT_KEY);
    return migrated;
  } catch { return null; }
};

/** Build meta list from stored ids */
const buildMeta = (ids: string[]): ProjectMeta[] =>
  ids
    .map((id) => {
      const p = readProject(id);
      if (!p) return null;
      return {
        id: p.id,
        name: p.name,
        sceneCount: p.scenes?.length ?? 0,
        updatedAt: p.updatedAt,
        createdAt: p.createdAt,
      } satisfies ProjectMeta;
    })
    .filter(Boolean) as ProjectMeta[];

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useProjectManager = () => {
  /** Initial boot — migrate + ensure at least one project exists */
  const [projectIds, setProjectIds] = useState<string[]>(() => {
    let ids = readProjectIds();

    if (ids.length === 0) {
      // Try migrate legacy
      const migrated = migrateLegacy();
      if (migrated) {
        ids = [migrated.id];
        writeProject(migrated);
        writeProjectIds(ids);
        localStorage.setItem(ACTIVE_PROJECT_KEY, migrated.id);
      } else {
        // Brand-new installation
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

  // Derived meta list (recomputed whenever ids change)
  const [projects, setProjects] = useState<ProjectMeta[]>(() => buildMeta(readProjectIds()));

  // Keep meta in sync after any mutation
  const refreshMeta = useCallback((ids: string[]) => {
    setProjects(buildMeta(ids));
  }, []);

  // ── Create ────────────────────────────────────────────────────────────────
  const createProject = useCallback(
    (name = 'Kịch bản mới'): ProjectData => {
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
  const loadProject = useCallback((id: string): ProjectData => {
    return readProject(id) ?? defaultProject();
  }, []);

  // ── Switch ────────────────────────────────────────────────────────────────
  const switchProject = useCallback(
    (id: string): ProjectData => {
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
    (data: Partial<ProjectData> & { id?: string }) => {
      const id = data.id ?? activeProjectId;
      const existing = readProject(id) ?? defaultProject();
      const updated: ProjectData = {
        ...existing,
        ...data,
        id,
        updatedAt: Date.now(),
      };
      writeProject(updated);
      // Update meta scene count in-place
      setProjects((prev) =>
        prev.map((m) =>
          m.id === id
            ? { ...m, sceneCount: updated.scenes?.length ?? 0, updatedAt: updated.updatedAt }
            : m,
        ),
      );
    },
    [activeProjectId],
  );

  // ── Rename ────────────────────────────────────────────────────────────────
  const renameProject = useCallback(
    (id: string, name: string) => {
      const p = readProject(id);
      if (!p) return;
      writeProject({ ...p, name, updatedAt: Date.now() });
      setProjects((prev) => prev.map((m) => (m.id === id ? { ...m, name } : m)));
    },
    [],
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
    deleteProject,
  };
};
