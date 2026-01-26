import { useCallback, useEffect } from 'react';
import {
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  MarkerType,
} from '@xyflow/react';
import { WorkflowTemplate } from './useAetherFlow';

export const useWorkflowEditor = (template: WorkflowTemplate | null) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge({
      ...params,
      animated: true,
      style: { stroke: '#0090ff', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#0090ff' }
    }, eds)),
    [setEdges]
  );

  const updateNodeValue = useCallback((nodeId: string, key: string, value: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          if (key === 'label') {
            return { ...node, data: { ...node.data, label: value } };
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
        inputs: { "seed": Math.floor(Math.random() * 1000000000000), "steps": 20 },
        headerColor: type === 'Group' ? 'bg-amber-900' : 'bg-slate-800',
        outputs: ['IMAGE'],
        onUpdate: (key: string, val: any) => updateNodeValue(id, key, val)
      },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes, updateNodeValue]);

  useEffect(() => {
    if (template && template.config) {
      try {
        let workflow: any = typeof template.config === 'string' 
          ? JSON.parse(template.config) 
          : template.config;

        // CRITICAL: Support the { success: true, data: { nodes: [], links: [] } } structure
        const targetData = workflow.data || workflow;

        const newNodes: Node[] = [];
        const newEdges: Edge[] = [];

        // CASE 1: COMFYUI WEB FORMAT (Detected by 'nodes' as an array)
        if (targetData.nodes && Array.isArray(targetData.nodes)) {
          targetData.nodes.forEach((nodeData: any) => {
            const id = String(nodeData.id);
            const classType = nodeData.type;
            
            let headerColor = 'bg-slate-800';
            if (classType?.includes('Load')) headerColor = 'bg-slate-700';
            if (classType?.includes('Sampler')) headerColor = 'bg-indigo-900';
            if (classType?.includes('Save')) headerColor = 'bg-emerald-900';
            if (classType?.includes('Text')) headerColor = 'bg-purple-900';
            if (classType === 'PrimitiveNode') headerColor = 'bg-amber-700';

            // ComfyUI uses 'pos' as [x, y]
            const position = { 
              x: Array.isArray(nodeData.pos) ? nodeData.pos[0] : (nodeData.x || 0), 
              y: Array.isArray(nodeData.pos) ? nodeData.pos[1] : (nodeData.y || 0) 
            };

            const inputs: Record<string, any> = {};
            
            // Map connected slots to names if possible
            if (nodeData.inputs && Array.isArray(nodeData.inputs)) {
              nodeData.inputs.forEach((input: any, idx: number) => {
                inputs[input.name || `in_${idx}`] = ['LINK', input.link]; 
              });
            }

            // Map widget values (actual data values like seed, steps)
            if (nodeData.widgets_values && Array.isArray(nodeData.widgets_values)) {
               nodeData.widgets_values.forEach((val: any, idx: number) => {
                  inputs[`widget_${idx}`] = val;
               });
            }

            newNodes.push({
              id,
              type: 'custom',
              position,
              data: { 
                label: nodeData.title || nodeData.type || 'Node',
                id,
                inputs: inputs,
                classType,
                headerColor,
                outputs: nodeData.outputs?.map((o: any) => o.name) || ['IMAGE'],
                onUpdate: (key: string, val: any) => updateNodeValue(id, key, val)
              },
            });
          });

          // Parse Links in format [link_id, from_id, from_out_index, to_id, to_in_index, type]
          if (targetData.links && Array.isArray(targetData.links)) {
            targetData.links.forEach((link: any) => {
              const [linkId, fromId, fromOut, toId, toIn] = link;
              
              // Target node data for handle matching
              const targetNodeData = targetData.nodes.find((n: any) => n.id === toId);
              let targetHandle = String(toIn);
              
              // If target node has inputs, the index usually maps to the input slot name
              if (targetNodeData?.inputs?.[toIn]) {
                targetHandle = targetNodeData.inputs[toIn].name;
              }

              newEdges.push({
                id: `e-${linkId}`,
                source: String(fromId),
                target: String(toId),
                sourceHandle: String(fromOut),
                targetHandle: targetHandle,
                animated: true,
                style: { stroke: '#0090ff', strokeWidth: 2 },
                markerEnd: { type: MarkerType.ArrowClosed, color: '#0090ff' }
              });
            });
          }
        } 
        // CASE 2: API FORMAT (Dictionary based / Prompt format)
        else {
          Object.keys(targetData).forEach((id, index) => {
            const nodeData = targetData[id];
            if (!nodeData?.class_type) return;

            newNodes.push({
              id,
              type: 'custom',
              position: { x: (index % 4) * 400, y: Math.floor(index / 4) * 450 },
              data: { 
                label: nodeData._meta?.title || nodeData.class_type,
                id,
                inputs: nodeData.inputs || {},
                classType: nodeData.class_type,
                headerColor: 'bg-slate-800',
                outputs: ['OUT'],
                // Fix: updateConfigValue was not defined, changing to updateNodeValue
                onUpdate: (key: string, val: any) => updateNodeValue(id, key, val)
              },
            });

            if (nodeData.inputs) {
              Object.entries(nodeData.inputs).forEach(([inputName, val]) => {
                if (Array.isArray(val) && val.length === 2) {
                  newEdges.push({
                    id: `e-${id}-${inputName}`,
                    source: String(val[0]),
                    target: id,
                    sourceHandle: String(val[1]),
                    targetHandle: inputName,
                    animated: true,
                    style: { stroke: '#0090ff', strokeWidth: 2 },
                    markerEnd: { type: MarkerType.ArrowClosed, color: '#0090ff' }
                  });
                }
              });
            }
          });
        }

        setNodes(newNodes);
        setEdges(newEdges);
      } catch (e) {
        console.error("Workflow parsing error", e);
      }
    }
  }, [template?.config, setNodes, setEdges, updateNodeValue]);

  return {
    nodes, edges, onNodesChange, onEdgesChange,
    onConnect, addNode, toggleNodeVisibility: (id: string) => setNodes(nds => nds.map(n => n.id === id ? {...n, hidden: !n.hidden} : n))
  };
};