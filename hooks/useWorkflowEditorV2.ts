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

export const useWorkflowEditorV2 = (template: WorkflowTemplate | null) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Hệ số dãn cách cho quy trình nâng cao
  const SCALE_X = 1.6;
  const SCALE_Y = 2.4;

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

  useEffect(() => {
    if (template && template.config) {
      try {
        let workflow: any = typeof template.config === 'string' 
          ? JSON.parse(template.config) 
          : template.config;

        const targetData = workflow.data || workflow;

        const newNodes: Node[] = [];
        const newEdges: Edge[] = [];

        if (targetData.nodes && Array.isArray(targetData.nodes)) {
          targetData.nodes.forEach((nodeData: any) => {
            const id = String(nodeData.id);
            const classType = nodeData.type;
            
            let headerColor = 'bg-slate-800';
            if (classType === 'PrimitiveNode') headerColor = 'bg-indigo-600';
            if (classType?.includes('Sampler')) headerColor = 'bg-purple-900';
            if (classType?.includes('Load')) headerColor = 'bg-slate-700';

            const rawX = Array.isArray(nodeData.pos) ? nodeData.pos[0] : (nodeData.x || 0);
            const rawY = Array.isArray(nodeData.pos) ? nodeData.pos[1] : (nodeData.y || 0);

            const position = { 
              x: rawX * SCALE_X, 
              y: rawY * SCALE_Y 
            };

            const inputs: Record<string, any> = {};
            
            if (nodeData.inputs && Array.isArray(nodeData.inputs)) {
              nodeData.inputs.forEach((input: any) => {
                inputs[input.name] = ['LINK', input.link]; 
              });
            }

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
                outputs: nodeData.outputs?.map((o: any) => o.name) || ['OUT'],
                onUpdate: (key: string, val: any) => updateNodeValue(id, key, val)
              },
            });
          });

          if (targetData.links && Array.isArray(targetData.links)) {
            targetData.links.forEach((link: any) => {
              const [linkId, fromId, fromOut, toId, toIn] = link;
              const targetNode = targetData.nodes.find((n: any) => n.id === toId);
              const targetHandle = targetNode?.inputs?.[toIn]?.name || String(toIn);

              newEdges.push({
                id: `e-${linkId}`,
                source: String(fromId),
                target: String(toId),
                sourceHandle: String(fromOut),
                targetHandle: targetHandle,
                animated: true,
                style: { stroke: '#6366f1', strokeWidth: 2 },
                markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' }
              });
            });
          }
        }

        setNodes(newNodes);
        setEdges(newEdges);
      } catch (e) {
        console.error("V2 Workflow parsing error", e);
      }
    }
  }, [template?.config, setNodes, setEdges, updateNodeValue]);

  return {
    nodes, edges, onNodesChange, onEdgesChange,
    onConnect, toggleNodeVisibility: (id: string) => setNodes(nds => nds.map(n => n.id === id ? {...n, hidden: !n.hidden} : n))
  };
};