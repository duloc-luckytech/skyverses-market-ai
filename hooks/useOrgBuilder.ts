import { useState, useCallback } from 'react';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface OrgNode {
  id: string;
  label: string;        // position label e.g. "CEO", "Marketing Lead"
  agentId: string | null;
  parentId: string | null;
  x: number;
  y: number;
}

export interface OrgConfig {
  orgName: string;
  orgDescription: string;
  nodes: OrgNode[];
  updatedAt: string;
}

// ─── Storage ───────────────────────────────────────────────────────────────────

const ORG_KEY = 'skyverses_org_config_v1';

function defaultConfig(): OrgConfig {
  return {
    orgName: 'My Organization',
    orgDescription: '',
    nodes: [
      {
        id: 'node-ceo',
        label: 'CEO',
        agentId: 'default-ceo',
        parentId: null,
        x: 340,
        y: 40,
      },
      {
        id: 'node-marketing',
        label: 'Marketing',
        agentId: 'default-marketing',
        parentId: 'node-ceo',
        x: 80,
        y: 200,
      },
      {
        id: 'node-devops',
        label: 'Engineering',
        agentId: 'default-devops',
        parentId: 'node-ceo',
        x: 280,
        y: 200,
      },
      {
        id: 'node-sales',
        label: 'Sales',
        agentId: 'default-sales',
        parentId: 'node-ceo',
        x: 480,
        y: 200,
      },
      {
        id: 'node-hr',
        label: 'People',
        agentId: 'default-hr',
        parentId: 'node-ceo',
        x: 680,
        y: 200,
      },
    ],
    updatedAt: new Date().toISOString(),
  };
}

function load(): OrgConfig {
  try {
    const raw = localStorage.getItem(ORG_KEY);
    if (!raw) return defaultConfig();
    return JSON.parse(raw) as OrgConfig;
  } catch {
    return defaultConfig();
  }
}

function save(cfg: OrgConfig) {
  try {
    localStorage.setItem(ORG_KEY, JSON.stringify(cfg));
  } catch { /* ignore */ }
}

// ─── Auto-layout (top-down tree) ───────────────────────────────────────────────

export function autoLayout(nodes: OrgNode[]): OrgNode[] {
  if (nodes.length === 0) return nodes;
  const LEVEL_H = 160;
  const NODE_W  = 160;
  const START_Y = 40;
  const CANVAS_W = 860;

  // Build tree map
  const children: Record<string, string[]> = {};
  nodes.forEach(n => {
    children[n.id] = [];
  });
  nodes.forEach(n => {
    if (n.parentId && children[n.parentId]) {
      children[n.parentId].push(n.id);
    }
  });

  const root = nodes.find(n => !n.parentId);
  if (!root) return nodes;

  // BFS to assign levels
  const levelMap: Record<string, number> = { [root.id]: 0 };
  const queue = [root.id];
  while (queue.length) {
    const cur = queue.shift()!;
    for (const child of children[cur] || []) {
      levelMap[child] = (levelMap[cur] ?? 0) + 1;
      queue.push(child);
    }
  }

  // Group by level
  const byLevel: Record<number, string[]> = {};
  nodes.forEach(n => {
    const lv = levelMap[n.id] ?? 0;
    if (!byLevel[lv]) byLevel[lv] = [];
    byLevel[lv].push(n.id);
  });

  const result = nodes.map(n => ({ ...n }));
  Object.entries(byLevel).forEach(([lv, ids]) => {
    const count = ids.length;
    const totalW = count * NODE_W + (count - 1) * 20;
    const startX = Math.max(20, (CANVAS_W - totalW) / 2);
    ids.forEach((id, i) => {
      const node = result.find(n => n.id === id)!;
      node.x = startX + i * (NODE_W + 20);
      node.y = START_Y + Number(lv) * LEVEL_H;
    });
  });

  return result;
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

let _nodeCounter = 0;

export function useOrgBuilder() {
  const [config, setConfig] = useState<OrgConfig>(load);

  const persist = useCallback((next: OrgConfig | ((prev: OrgConfig) => OrgConfig)) => {
    setConfig(prev => {
      const result = typeof next === 'function' ? next(prev) : next;
      save(result);
      return result;
    });
  }, []);

  const updateMeta = useCallback((patch: Partial<Pick<OrgConfig, 'orgName' | 'orgDescription'>>) => {
    persist(prev => ({ ...prev, ...patch, updatedAt: new Date().toISOString() }));
  }, [persist]);

  const addNode = useCallback((parentId: string | null) => {
    const newId = `node-${Date.now()}-${_nodeCounter++}`;
    const parent = config.nodes.find(n => n.id === parentId);
    const newNode: OrgNode = {
      id: newId,
      label: 'New Role',
      agentId: null,
      parentId,
      x: parent ? parent.x + 20 : 340,
      y: parent ? parent.y + 160 : 40,
    };
    persist(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
      updatedAt: new Date().toISOString(),
    }));
    return newId;
  }, [config.nodes, persist]);

  const removeNode = useCallback((id: string) => {
    // Remove node and all descendants
    const toRemove = new Set<string>();
    const queue = [id];
    while (queue.length) {
      const cur = queue.shift()!;
      toRemove.add(cur);
      config.nodes
        .filter(n => n.parentId === cur)
        .forEach(n => queue.push(n.id));
    }
    persist(prev => ({
      ...prev,
      nodes: prev.nodes.filter(n => !toRemove.has(n.id)),
      updatedAt: new Date().toISOString(),
    }));
  }, [config.nodes, persist]);

  const updateNode = useCallback((id: string, patch: Partial<OrgNode>) => {
    persist(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => n.id === id ? { ...n, ...patch } : n),
      updatedAt: new Date().toISOString(),
    }));
  }, [persist]);

  const moveNode = useCallback((id: string, x: number, y: number) => {
    setConfig(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => n.id === id ? { ...n, x, y } : n),
    }));
  }, []);

  const commitMove = useCallback((id: string, x: number, y: number) => {
    persist(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => n.id === id ? { ...n, x, y } : n),
      updatedAt: new Date().toISOString(),
    }));
  }, [persist]);

  const applyAutoLayout = useCallback(() => {
    const laid = autoLayout(config.nodes);
    persist(prev => ({ ...prev, nodes: laid, updatedAt: new Date().toISOString() }));
  }, [config.nodes, persist]);

  const resetOrg = useCallback(() => {
    persist(defaultConfig());
  }, [persist]);

  return {
    config,
    updateMeta,
    addNode,
    removeNode,
    updateNode,
    moveNode,
    commitMove,
    applyAutoLayout,
    resetOrg,
  };
}
