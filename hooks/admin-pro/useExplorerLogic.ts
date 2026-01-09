
import { useState, useEffect, useMemo } from 'react';
import { ExplorerItem } from '../../components/ExplorerDetailModal';
import { explorerApi } from '../../apis/explorer';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { LOGIN_SLIDER_IMAGES } from '../../data';

// Full list of mock data aligned with the Explorer and Login pages
const MOCK_EXPLORER_ITEMS: any[] = [
  {
    id: 'e1',
    type: 'cinematic',
    url: LOGIN_SLIDER_IMAGES[0],
    title: 'Cyber Ronin Ritual',
    modelKey: 'gemini-3-pro-image-preview',
    engine: 'google',
    author: 'Neo Architect',
    authorHandle: 'neo_arc_2025',
    likes: 242,
    prompt: 'A hyper-realistic cinematic shot of two Formula 1 cars colliding at high speed...',
    tags: ['Cyberpunk', 'Cinematic', 'Lighting'],
    categories: ['Action'],
    specs: { seed: '8429103', cfg: 7.5, steps: 50 }
  },
  {
    id: 'e2',
    type: 'character',
    url: LOGIN_SLIDER_IMAGES[1],
    title: 'Chromatic Mirror Spheres',
    modelKey: 'gemini-2.5-flash-image',
    engine: 'google',
    author: 'Voxel Queen',
    authorHandle: 'voxel_q',
    likes: 185,
    prompt: 'Surrealist composition of floating chrome spheres reflecting a digital forest...',
    tags: ['Abstract', 'Reflection', '3D'],
    categories: ['Art'],
    specs: { seed: '120042', cfg: 8.0, steps: 35 }
  },
  {
    id: 'e3',
    type: 'text_video',
    url: LOGIN_SLIDER_IMAGES[2],
    title: 'Velocity Fracture',
    modelKey: 'veo-3.1-generate-preview',
    engine: 'veo',
    author: 'Motion Master',
    authorHandle: 'motion_m',
    likes: 512,
    prompt: 'High-speed action sequence of a futuristic vehicle breaking through a crystalline barrier...',
    tags: ['Action', 'Dynamics', 'High-Speed'],
    categories: ['Motion'],
    specs: { seed: '992013', cfg: 9.0, steps: 60 }
  },
  {
    id: 'e4',
    type: 'gameplay',
    url: LOGIN_SLIDER_IMAGES[3],
    title: 'Obsidian Skyline',
    modelKey: 'gemini-3-pro-image-preview',
    engine: 'google',
    author: 'Level Designer',
    authorHandle: 'level_dev',
    likes: 92,
    prompt: 'First-person view of a dark obsidian city skyline at night...',
    tags: ['Architecture', 'Noir', 'City'],
    categories: ['Gaming'],
    specs: { seed: '445201', cfg: 6.5, steps: 40 }
  },
  {
    id: 'e5',
    type: 'character',
    url: LOGIN_SLIDER_IMAGES[4],
    title: 'Celestial Guard',
    modelKey: 'gemini-3-pro-image-preview',
    engine: 'google',
    author: 'Star Carver',
    authorHandle: 'star_carver',
    likes: 310,
    prompt: 'A divine celestial knight standing amidst stardust...',
    tags: ['Sci-Fi', 'Armor', 'Celestial'],
    categories: ['Character'],
    specs: { seed: '772109', cfg: 7.0, steps: 45 }
  },
  {
    id: 'e6',
    type: 'cinematic',
    url: LOGIN_SLIDER_IMAGES[5],
    title: 'Veridian Oasis',
    modelKey: 'gemini-2.5-flash-image',
    engine: 'google',
    author: 'Nature Synth',
    authorHandle: 'nature_synth',
    likes: 425,
    prompt: 'Hyper-detailed view of an indoor tropical oasis inside a brutalist concrete structure...',
    tags: ['Interior', 'Nature', 'Lighting'],
    categories: ['Architecture'],
    specs: { seed: '552108', cfg: 8.5, steps: 48 }
  },
  {
    id: 'e7',
    type: 'image_video',
    url: LOGIN_SLIDER_IMAGES[6],
    title: 'Neon Drift Sequence',
    modelKey: 'veo-3.1-generate-preview',
    engine: 'veo',
    author: 'Drive AI',
    authorHandle: 'drive_ai',
    likes: 670,
    prompt: 'Cinematic car chase through a rain-slicked Tokyo-style neon city at night...',
    tags: ['Automotive', 'Neon', 'Night'],
    categories: ['Motion'],
    specs: { seed: '334910', cfg: 9.0, steps: 60 }
  },
  {
    id: 'e8',
    type: 'gameplay',
    url: LOGIN_SLIDER_IMAGES[7],
    title: 'The Great Gate',
    modelKey: 'gemini-3-pro-image-preview',
    engine: 'google',
    author: 'World Builder',
    authorHandle: 'builder_x',
    likes: 120,
    prompt: 'Massive stone gates carved into a red canyon wall...',
    tags: ['Environment', 'Adventure', 'Stone'],
    categories: ['Gaming'],
    specs: { seed: '221093', cfg: 7.5, steps: 42 }
  },
  {
    id: 'e9',
    type: 'text_video',
    url: LOGIN_SLIDER_IMAGES[8],
    title: 'Cyberpunk Awakening',
    modelKey: 'veo-3.1-generate-preview',
    engine: 'veo',
    author: 'Neo Architect',
    authorHandle: 'neo_arc_2025',
    likes: 89,
    prompt: 'Close up of a cybernetic eye opening and focusing...',
    tags: ['Cybernetic', 'Detail', 'Focus'],
    categories: ['Motion'],
    specs: { seed: '998421', cfg: 8.0, steps: 55 }
  },
  {
    id: 'e10',
    type: 'character',
    url: LOGIN_SLIDER_IMAGES[9],
    title: 'Shadow Dancer',
    modelKey: 'gemini-2.5-flash-image',
    engine: 'google',
    author: 'Voxel Queen',
    authorHandle: 'voxel_q',
    likes: 532,
    prompt: 'Motion capture silhouette of a contemporary dancer leaving light trails of digital ink...',
    tags: ['Dance', 'Minimal', 'Ink'],
    categories: ['Character'],
    specs: { seed: '112048', cfg: 7.0, steps: 50 }
  }
];

export const useExplorerLogic = () => {
  const [items, setItems] = useState<ExplorerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showLocal, setShowLocal] = useState(false);
  
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isActioning, setIsActioning] = useState<string | null>(null);

  const { showToast } = useToast();
  const { user } = useAuth();

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await explorerApi.getItems();
      if (res.success && Array.isArray(res.data)) {
        setItems(res.data);
      } else {
        showToast('Không thể giải mã dữ liệu từ Registry', 'error');
      }
    } catch (error) {
      showToast('Lỗi kết nối Registry', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const filteredItems = useMemo(() => {
    const baseList = showLocal ? MOCK_EXPLORER_ITEMS : items;
    return baseList.filter(item => {
      const titleMatch = (item.title || '').toLowerCase().includes(search.toLowerCase());
      const authorMatch = (
        (item.authorName || item.authorHandle || item.author || '') as string
      ).toLowerCase().includes(search.toLowerCase());
      const matchesSearch = !search || titleMatch || authorMatch;
      const matchesFilter = filter === 'all' || item.type === filter;
      return matchesSearch && matchesFilter;
    });
  }, [items, search, filter, showLocal]);

  const isSynced = (title: string) => {
    return items.some(i => i.title.toLowerCase() === title.toLowerCase());
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("CẢNH BÁO: Xóa vĩnh viễn tác phẩm này khỏi showcase?")) return;
    
    setIsActioning(id);
    try {
      const res = await explorerApi.deleteItem(id);
      if (res.success) {
        setItems(prev => prev.filter(i => (i._id || i.id) !== id));
        showToast('Đã xóa tác phẩm thành công', 'success');
      } else {
        showToast(res.message || 'Lỗi khi xóa tác phẩm', 'error');
      }
    } catch (error) {
      showToast('Yêu cầu PURGE thất bại', 'error');
    } finally {
      setIsActioning(null);
    }
  };

  const handleApprove = async (id: string) => {
    setIsActioning(id);
    try {
      const res = await explorerApi.approveItem(id);
      if (res.success) {
        showToast('Đã phê duyệt tác phẩm', 'success');
        fetchItems(); 
      } else {
        showToast(res.message || 'Lỗi khi phê duyệt', 'error');
      }
    } catch (error) {
      showToast('Lỗi kết nối hệ thống', 'error');
    } finally {
      setIsActioning(null);
    }
  };

  const handleReject = async (id: string) => {
    setIsActioning(id);
    try {
      const res = await explorerApi.rejectItem(id);
      if (res.success) {
        showToast('Đã từ chối tác phẩm', 'info');
        fetchItems();
      } else {
        showToast(res.message || 'Lỗi khi từ chối', 'error');
      }
    } catch (error) {
      showToast('Lỗi kết nối hệ thống', 'error');
    } finally {
      setIsActioning(null);
    }
  };

  const handleSyncLocal = async (localItem: any) => {
    if (!user?._id) {
      showToast('Vui lòng đăng nhập để đồng bộ', 'warning');
      return;
    }

    setIsActioning(localItem.title);
    try {
      // Map local type to ExplorerMediaType
      let mappedType = "image";
      const lt = localItem.type.toLowerCase();
      if (lt.includes('video') || lt === 'cinematic' || lt === 'gameplay') {
        mappedType = 'video';
      } else if (lt === 'prompt') {
        mappedType = 'prompt';
      } else if (lt === 'game_asset') {
        mappedType = 'game_asset';
      }

      // Prepare payload matching ExplorerMediaAttrs
      const payload = {
        title: localItem.title,
        description: localItem.prompt, // Using prompt as description for local sync
        type: mappedType,
        thumbnailUrl: localItem.url,
        mediaUrl: localItem.url,
        tags: localItem.tags || [],
        categories: localItem.categories || [],
        author: user._id, // Required ObjectId
        authorName: localItem.author || user.name,
        engine: localItem.engine || 'google',
        modelKey: localItem.modelKey || localItem.model || 'unknown',
        resolution: '1080p',
        seed: localItem.specs?.seed ? Number(localItem.specs.seed) : 0,
        meta: localItem.specs || {},
        status: 'approved',
        likes: localItem.likes || 0,
        views: Math.floor(Math.random() * 1000) // Random views for variety
      };

      const res = await explorerApi.createItem(payload);
      if (res.success) {
        showToast(`Đồng bộ "${localItem.title}" thành công`, 'success');
        fetchItems();
      } else {
        showToast(res.message || 'Lỗi đồng bộ', 'error');
      }
    } catch (e) {
      showToast('Lỗi kết nối đồng bộ', 'error');
    } finally {
      setIsActioning(null);
    }
  };

  const handleSave = async () => {
    if (!editingItem?.title || !editingItem?.type || !editingItem?.thumbnailUrl || !editingItem?.mediaUrl) {
      showToast('Thiếu các trường bắt buộc', 'warning');
      return;
    }

    if (!user?._id) {
      showToast('Vui lòng đăng nhập', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      const id = editingItem._id || editingItem.id;
      const payload = {
        ...editingItem,
        author: user._id, // Ensure author ID is present for new items
        seed: editingItem.seed ? Number(editingItem.seed) : undefined,
        tags: Array.isArray(editingItem.tags) ? editingItem.tags : (editingItem.tags || '').split(',').map((t: string) => t.trim()).filter(Boolean),
        categories: Array.isArray(editingItem.categories) ? editingItem.categories : (editingItem.categories || '').split(',').map((c: string) => c.trim()).filter(Boolean),
      };

      let res;
      if (id && id !== 'NEW') res = await explorerApi.updateItem(id, payload);
      else res = await explorerApi.createItem(payload);

      if (res.success) {
        showToast('Đồng bộ dữ liệu thành công', 'success');
        fetchItems();
        setEditingItem(null);
      } else {
        showToast(res.message || 'Lỗi đồng bộ', 'error');
      }
    } catch (error) {
      showToast('Lỗi hệ thống', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const initNewItem = () => {
    setEditingItem({
      title: '',
      description: '',
      type: 'video',
      thumbnailUrl: '',
      mediaUrl: '',
      tags: '',
      categories: '',
      authorName: user?.name || 'Skyverses Team',
      author: user?._id || '',
      engine: 'veo',
      modelKey: 'veo_3_1',
      resolution: '1080p',
      seed: 0,
      meta: {}
    });
  };

  return {
    items,
    loading,
    search,
    setSearch,
    filter,
    setFilter,
    showLocal,
    setShowLocal,
    editingItem,
    setEditingItem,
    isSaving,
    isActioning,
    filteredItems,
    fetchItems,
    handleDelete,
    handleApprove,
    handleReject,
    handleSave,
    handleSyncLocal,
    initNewItem,
    isSynced
  };
};
