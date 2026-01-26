import { useCallback, useEffect } from 'react';
import {
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
} from '@xyflow/react';
import { WorkflowTemplate } from './useAetherFlow';

export const useWorkflowEditor = (template: WorkflowTemplate | null) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const toggleNodeVisibility = useCallback((nodeId: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return { ...node, hidden: !node.hidden };
        }
        return node;
      })
    );
  }, [setNodes]);

  const addNode = useCallback((type: string, position: { x: number, y: number }) => {
    const id = `node_${Date.now()}`;
    const newNode: Node = {
      id,
      type: 'custom',
      position,
      data: { 
        label: `New ${type}`,
        id,
        inputs: {
          "seed": Math.floor(Math.random() * 1000000000000),
          "steps": 20,
          "cfg": 8.0,
          "sampler": "euler"
        },
        headerColor: type === 'Group' ? 'bg-amber-900' : 'bg-slate-800',
        outputs: ['OUTPUT'],
        onUpdate: (key: string, val: any) => updateNodeValue(id, key, val)
      },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

  const updateNodeValue = useCallback((nodeId: string, key: string, value: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          if (key === 'label') {
            return {
              ...node,
              data: {
                ...node.data,
                label: value,
              },
            };
          }
          return {
            ...node,
            data: {
              ...node.data,
              inputs: {
                ...(node.data.inputs as any),
                [key]: value,
              },
            },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  useEffect(() => {
    if (template && template.config) {
      try {
        const config = JSON.parse(template.config);
        const newNodes: Node[] = [];
        const newEdges: Edge[] = [];

        Object.entries(config).forEach(([id, nodeData]: [string, any], index) => {
          const classType = nodeData.class_type;
          const x = (index % 3) * 450;
          const y = Math.floor(index / 3) * 500;

          let headerColor = 'bg-slate-800';
          if (classType.includes('Loader')) headerColor = 'bg-slate-700';
          if (classType.includes('Sampler')) headerColor = 'bg-indigo-900';
          if (classType.includes('Encode')) headerColor = 'bg-emerald-900';
          if (classType.includes('Save')) headerColor = 'bg-slate-900';

          const outputs = [];
          if (classType === 'UNETLoader') outputs.push('MODEL');
          if (classType === 'CLIPLoader') outputs.push('CLIP');
          if (classType === 'VAELoader') outputs.push('VAE');
          if (classType === 'EmptyLatentImage') outputs.push('LATENT');
          if (classType === 'KSampler') outputs.push('LATENT');
          if (classType === 'VAEDecode') outputs.push('IMAGE');

          newNodes.push({
            id,
            type: 'custom',
            position: { x, y },
            data: { 
              label: nodeData._meta?.title || classType,
              id,
              inputs: nodeData.inputs,
              headerColor,
              outputs,
              onUpdate: (key: string, val: any) => updateNodeValue(id, key, val)
            },
          });

          Object.entries(nodeData.inputs).forEach(([key, value]) => {
            if (Array.isArray(value) && value.length === 2 && typeof value[0] === 'string') {
              newEdges.push({
                id: `e-${value[0]}-${id}`,
                source: value[0],
                target: id,
                animated: true,
                style: { stroke: '#0090ff' }
              });
            }
          });
        });

        setNodes(newNodes);
        setEdges(newEdges);
      } catch (e) {
        console.error("Failed to parse workflow visual config", e);
      }
    }
  }, [template, setNodes, setEdges, updateNodeValue]);

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    toggleNodeVisibility,
    updateNodeValue
  };
};