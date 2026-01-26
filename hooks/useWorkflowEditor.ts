
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
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

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
  }, [setNodes, updateNodeValue]);

  useEffect(() => {
    if (template && template.config) {
      try {
        // FIX: Xử lý cả string JSON và Object trực tiếp
        let workflow: any;
        if (typeof template.config === 'string') {
          workflow = JSON.parse(template.config);
        } else {
          workflow = template.config;
        }

        // Trường hợp data API trả về lồng nhau: { success: true, data: { ...workflow } }
        if (workflow.data && !workflow.nodes) {
          workflow = workflow.data;
        }

        const newNodes: Node[] = [];
        const newEdges: Edge[] = [];

        // --- HỖ TRỢ FORMAT: COMFYUI WEB (Dữ liệu bạn cung cấp) ---
        if (workflow.nodes && Array.isArray(workflow.nodes)) {
          workflow.nodes.forEach((nodeData: any) => {
            const id = String(nodeData.id);
            const classType = nodeData.type;
            
            let headerColor = 'bg-slate-800';
            if (classType.includes('Loader')) headerColor = 'bg-slate-700';
            if (classType.includes('Sampler')) headerColor = 'bg-indigo-900';
            if (classType.includes('Encode')) headerColor = 'bg-emerald-900';
            if (classType.includes('Save')) headerColor = 'bg-slate-900';

            // ComfyUI Web Format: pos là mảng [x, y]
            const position = { 
              x: Array.isArray(nodeData.pos) ? nodeData.pos[0] : 0, 
              y: Array.isArray(nodeData.pos) ? nodeData.pos[1] : 0 
            };

            const outputs = nodeData.outputs?.map((o: any) => o.name) || [];

            // Chuyển đổi inputs thành dạng key-value
            const inputs: Record<string, any> = {};
            if (nodeData.widgets_values) {
              // Map widget values nếu có (ComfyUI thường lưu vào đây)
              inputs["_widgets"] = nodeData.widgets_values;
            }
            
            if (nodeData.inputs) {
              nodeData.inputs.forEach((input: any) => {
                inputs[input.name] = input.link ? `Link_${input.link}` : (input.value || "");
              });
            }

            newNodes.push({
              id,
              type: 'custom',
              position,
              data: { 
                label: nodeData.title || nodeData.type,
                id,
                inputs,
                headerColor,
                outputs,
                onUpdate: (key: string, val: any) => updateNodeValue(id, key, val)
              },
            });
          });

          // Xử lý kết nối từ mảng 'links'
          if (workflow.links && Array.isArray(workflow.links)) {
            workflow.links.forEach((link: any) => {
              // Comfy link format: [link_id, from_id, from_out_index, to_id, to_in_index, type]
              const [linkId, fromId, fromOut, toId, toIn] = link;
              newEdges.push({
                id: `e-${linkId}`,
                source: String(fromId),
                target: String(toId),
                sourceHandle: String(fromOut),
                targetHandle: String(toIn),
                animated: true,
                style: { stroke: '#0090ff', strokeWidth: 2 }
              });
            });
          }
        } 
        // --- HỖ TRỢ FORMAT: COMFYUI API (Object keys) ---
        else {
          Object.entries(workflow).forEach(([id, nodeData]: [string, any], index) => {
            const classType = nodeData.class_type;
            const x = (index % 4) * 400;
            const y = Math.floor(index / 4) * 500;

            let headerColor = 'bg-slate-800';
            if (classType.includes('Loader')) headerColor = 'bg-slate-700';
            if (classType.includes('Sampler')) headerColor = 'bg-indigo-900';
            if (classType.includes('Encode')) headerColor = 'bg-emerald-900';
            if (classType.includes('Save')) headerColor = 'bg-slate-900';

            newNodes.push({
              id,
              type: 'custom',
              position: { x, y },
              data: { 
                label: nodeData._meta?.title || classType,
                id,
                inputs: nodeData.inputs,
                headerColor,
                outputs: ['OUTPUT'],
                onUpdate: (key: string, val: any) => updateNodeValue(id, key, val)
              },
            });

            // Map connections in API format
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
        }

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
