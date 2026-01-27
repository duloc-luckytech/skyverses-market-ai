
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

  const SCALE_X = 1.6;
  const SCALE_Y = 2.4;

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge({
      ...params,
      animated: true,
      style: { stroke: '#6366f1', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' }
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
              widgets: node.data.widgets?.map((w: any) => 
                w.label === key ? { ...w, value } : w
              ),
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

        // 1. Parse Groups
        if (targetData.groups && Array.isArray(targetData.groups)) {
          targetData.groups.forEach((group: any) => {
            const [gx, gy, gw, gh] = group.bounding;
            newNodes.push({
              id: `group_${group.id}`,
              type: 'groupNode',
              position: { x: gx * SCALE_X, y: gy * SCALE_Y },
              style: { 
                width: gw * SCALE_X, 
                height: gh * SCALE_Y,
                zIndex: -1 
              },
              data: { 
                label: group.title || 'Vùng quy trình',
                color: group.color || '#3f789e',
                fontSize: group.font_size || 24
              },
              selectable: true,
              draggable: true,
            });
          });
        }

        // 2. Parse Nodes
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

            const position = { x: rawX * SCALE_X, y: rawY * SCALE_Y };

            // Phân loại Inputs: Link (kết nối) và Widget (thông số)
            const allInputs = nodeData.inputs || [];
            const connectionInputs = allInputs.filter((i: any) => !i.widget);
            const widgetMetadata = allInputs.filter((i: any) => i.widget);
            
            const widgets: { label: string, value: any }[] = [];
            
            // Mapping widgets_values dựa trên metadata từ mảng inputs (theo thứ tự)
            if (nodeData.widgets_values && Array.isArray(nodeData.widgets_values)) {
               nodeData.widgets_values.forEach((val: any, idx: number) => {
                  // Lấy nhãn từ inputs[].widget.name, nếu không có thì fallback
                  const label = widgetMetadata[idx]?.widget?.name || widgetMetadata[idx]?.name || nodeData.widgets?.[idx]?.name || `param_${idx}`;
                  widgets.push({ label, value: val });
               });
            }

            newNodes.push({
              id,
              type: 'custom',
              position,
              data: { 
                label: nodeData.title || nodeData.type || 'Node',
                id,
                classType,
                headerColor,
                inputs: connectionInputs,
                outputs: nodeData.outputs?.map((o: any) => o.name) || ['OUT'],
                widgets: widgets,
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
