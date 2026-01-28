
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

  // Các hằng số layout để tối ưu hóa không gian hiển thị
  const LAYOUT_SCALE = 1.25; // Dãn cách các node ra 25% so với nguyên bản
  const GROUP_PADDING_TOP = 100; // Khoảng cách từ đỉnh Group đến node đầu tiên (chừa chỗ cho tiêu đề)
  const GROUP_PADDING_LEFT = 50; // Khoảng cách đệm bên trái
  const GROUP_PADDING_RIGHT = 50; // Khoảng cách đệm bên phải
  const GROUP_PADDING_BOTTOM = 50; // Khoảng cách đệm bên dưới

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
              widgets: (node.data.widgets as any[])?.map((w: any) => 
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

        // 1. Phân tích danh sách Group trước
        const parsedGroups: any[] = [];
        if (targetData.groups && Array.isArray(targetData.groups)) {
          targetData.groups.forEach((group: any) => {
            const [gx, gy, gw, gh] = group.bounding;
            const groupId = `group_${group.id}`;
            
            // Lưu thông tin thô để tính toán node con sau này
            parsedGroups.push({ id: groupId, x: gx, y: gy, w: gw, h: gh });
            
            newNodes.push({
              id: groupId,
              type: 'groupNode',
              // Vị trí Group cũng được scale để giữ khoảng cách giữa các Group
              position: { x: gx * LAYOUT_SCALE, y: gy * LAYOUT_SCALE },
              style: { 
                // Mở rộng kích thước Group để chứa padding
                width: (gw * LAYOUT_SCALE) + GROUP_PADDING_LEFT + GROUP_PADDING_RIGHT, 
                height: (gh * LAYOUT_SCALE) + GROUP_PADDING_TOP + GROUP_PADDING_BOTTOM,
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

        // 2. Phân tích Nodes và xử lý Parenting (Phân cấp)
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

            let parentId: string | undefined = undefined;
            let finalPosition = { x: rawX * LAYOUT_SCALE, y: rawY * LAYOUT_SCALE };

            // Tìm group chứa node này
            for (const group of parsedGroups) {
              if (rawX >= group.x && rawX <= group.x + group.w &&
                  rawY >= group.y && rawY <= group.y + group.h) {
                parentId = group.id;
                
                // Tọa độ tương đối: (Toạ độ node - Toạ độ group) * scale + offset padding
                finalPosition = {
                  x: (rawX - group.x) * LAYOUT_SCALE + GROUP_PADDING_LEFT,
                  y: (rawY - group.y) * LAYOUT_SCALE + GROUP_PADDING_TOP
                };
                break;
              }
            }

            const allInputs = nodeData.inputs || [];
            const connectionInputs = allInputs.filter((i: any) => !i.widget);
            const widgetMetadata = allInputs.filter((i: any) => i.widget);
            
            const widgets: { label: string, value: any }[] = [];
            if (nodeData.widgets_values && Array.isArray(nodeData.widgets_values)) {
               nodeData.widgets_values.forEach((val: any, idx: number) => {
                  const label = widgetMetadata[idx]?.widget?.name || widgetMetadata[idx]?.name || nodeData.widgets?.[idx]?.name || `param_${idx}`;
                  widgets.push({ label, value: val });
               });
            }

            newNodes.push({
              id,
              type: 'custom',
              position: finalPosition,
              parentId: parentId,
              // Ràng buộc node không được kéo ra khỏi Group
              extent: parentId ? 'parent' : undefined,
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

          // 3. Phân tích Edges (Liên kết)
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
