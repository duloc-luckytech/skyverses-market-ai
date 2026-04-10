import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Zap, ChevronRight } from 'lucide-react';

export interface StoryboardTemplate {
  id: string;
  category: string;
  emoji: string;
  title: string;
  description: string;
  script: string;
  duration: number; // giây
  scenes: number;
}

const CATEGORIES = ['Tất cả', 'Kinh doanh', 'Bất động sản', 'TikTok / Reels', 'Phim ngắn', 'Giáo dục'];

export const STORYBOARD_TEMPLATES: StoryboardTemplate[] = [
  // ── KINH DOANH ──────────────────────────────────────────────────────────────
  {
    id: 'tpl-product-launch',
    category: 'Kinh doanh',
    emoji: '🚀',
    title: 'Ra mắt sản phẩm mới',
    description: 'Video quảng cáo chuyên nghiệp giới thiệu sản phẩm, highlight tính năng và kêu gọi mua hàng.',
    script: `Cảnh 1: Màn hình tối dần, một chiếc hộp sang trọng xuất hiện giữa ánh sáng spotlight. Âm nhạc crescendo.
Cảnh 2: Bàn tay mở hộp từ từ, lộ ra sản phẩm sáng bóng — đường nét tinh tế, thiết kế hiện đại.
Cảnh 3: Cận cảnh các chi tiết nổi bật: chất liệu cao cấp, logo nổi, màu sắc sang trọng.
Cảnh 4: Người dùng thực tế sử dụng sản phẩm với nụ cười hài lòng, cuộc sống thay đổi tích cực.
Cảnh 5: Logo thương hiệu xuất hiện cùng tagline và CTA "Mua ngay — Ưu đãi có hạn".`,
    duration: 30,
    scenes: 5,
  },
  {
    id: 'tpl-brand-story',
    category: 'Kinh doanh',
    emoji: '💼',
    title: 'Câu chuyện thương hiệu',
    description: 'Kể câu chuyện hành trình xây dựng thương hiệu, truyền cảm hứng và tạo kết nối cảm xúc.',
    script: `Cảnh 1: Flashback — một garage nhỏ, người sáng lập trẻ tuổi đang làm việc muộn dưới ánh đèn vàng.
Cảnh 2: Những thất bại, đêm thức khuya, nghi ngờ bản thân — nhưng vẫn không từ bỏ.
Cảnh 3: Khoảnh khắc đột phá — sản phẩm đầu tiên hoàn thiện, ánh mắt rực sáng niềm tin.
Cảnh 4: Đội ngũ lớn dần, văn phòng hiện đại, khách hàng ngày càng nhiều trên khắp Việt Nam.
Cảnh 5: Hôm nay — hàng triệu người tin dùng, hành trình vẫn đang tiếp tục cùng bạn.`,
    duration: 45,
    scenes: 5,
  },
  {
    id: 'tpl-restaurant',
    category: 'Kinh doanh',
    emoji: '🍜',
    title: 'Quảng cáo nhà hàng',
    description: 'Video hấp dẫn giới thiệu ẩm thực, không gian và trải nghiệm nhà hàng.',
    script: `Cảnh 1: Cận cảnh tô phở bốc khói nghi ngút, nước dùng trong vắt màu vàng óng, thịt bò tái hồng đẹp mắt.
Cảnh 2: Bếp trưởng tự tay chế biến, ngọn lửa cao bùng, đôi tay thuần thục tung chảo.
Cảnh 3: Không gian nhà hàng ấm cúng — đèn vàng dịu, bàn gỗ, hoa tươi, tiếng cười vui vẻ.
Cảnh 4: Gia đình quây quần bên mâm cơm đầy ắp, khoảnh khắc đoàn tụ hạnh phúc.
Cảnh 5: Logo nhà hàng, địa chỉ và số điện thoại đặt bàn nổi trên nền ấm áp.`,
    duration: 30,
    scenes: 5,
  },
  // ── BẤT ĐỘNG SẢN ────────────────────────────────────────────────────────────
  {
    id: 'tpl-luxury-apartment',
    category: 'Bất động sản',
    emoji: '🏙️',
    title: 'Căn hộ cao cấp',
    description: 'Giới thiệu căn hộ luxury với góc quay cinematic, nhấn mạnh không gian sống đẳng cấp.',
    script: `Cảnh 1: Flycam lướt qua toà tháp kính sáng bóng lúc hoàng hôn, thành phố lung linh phía dưới.
Cảnh 2: Cửa căn hộ mở — phòng khách rộng rãi, trần cao, cửa sổ panorama nhìn ra toàn cảnh thành phố.
Cảnh 3: Bếp hiện đại với đảo bếp marble trắng, thiết bị cao cấp, ánh sáng tự nhiên tràn ngập.
Cảnh 4: Phòng ngủ master sang trọng — giường king, view biển, ban công riêng tư.
Cảnh 5: Tiện ích đẳng cấp: hồ bơi vô cực tầng thượng, gym, spa — cuộc sống resort ngay tại nhà.
Cảnh 6: Gia chủ hài lòng nhìn ra ban công, cà phê sáng trên nền thành phố thức giấc.`,
    duration: 60,
    scenes: 6,
  },
  {
    id: 'tpl-villa',
    category: 'Bất động sản',
    emoji: '🌿',
    title: 'Biệt thự nghỉ dưỡng',
    description: 'Video giới thiệu biệt thự hòa mình vào thiên nhiên, cuộc sống xanh và thư thái.',
    script: `Cảnh 1: Drone bay qua khu biệt thự xanh mướt, cây xanh bao phủ, không gian yên tĩnh thoát khỏi ồn ào đô thị.
Cảnh 2: Cổng gỗ mở ra con đường đá cuội uốn lượn dẫn vào căn biệt thự mái ngói truyền thống.
Cảnh 3: Phòng khách mở, kết nối seamless với vườn — gió thổi rèm trắng nhẹ nhàng, hoa đua nở.
Cảnh 4: Hồ bơi ngoài trời ôm lấy khu vườn nhiệt đới, ánh sáng vàng chiều lọc qua tán lá.
Cảnh 5: Gia đình vui vẻ trong vườn, trẻ em chạy nhảy, cha mẹ ngồi đọc sách — cuộc sống lý tưởng.`,
    duration: 45,
    scenes: 5,
  },
  // ── TIKTOK / REELS ───────────────────────────────────────────────────────────
  {
    id: 'tpl-tiktok-hook',
    category: 'TikTok / Reels',
    emoji: '🎯',
    title: 'Hook viral TikTok',
    description: '3 giây đầu gây tò mò, giữ người xem đến hết video với cấu trúc hook-story-reveal.',
    script: `Cảnh 1 (3 giây): Text lớn trên màn hình "Bạn đang làm điều này sai rồi..." — nền đen, font trắng bắt mắt.
Cảnh 2 (5 giây): Tình huống quen thuộc mà ai cũng mắc phải — thể hiện bằng hình ảnh relatable.
Cảnh 3 (8 giây): "Nhưng nếu bạn làm thế này..." — reveal giải pháp đơn giản bất ngờ.
Cảnh 4 (4 giây): Kết quả trước/sau ấn tượng — transformation rõ rệt.
Cảnh 5 (3 giây): CTA "Follow để không bỏ lỡ thêm tips như thế này!" — năng lượng cao, nhạc beat drop.`,
    duration: 23,
    scenes: 5,
  },
  {
    id: 'tpl-tiktok-tutorial',
    category: 'TikTok / Reels',
    emoji: '✨',
    title: 'Tutorial nhanh 60 giây',
    description: 'Video hướng dẫn step-by-step ngắn gọn, dễ hiểu, tỷ lệ xem lại cao.',
    script: `Cảnh 1: "Cách làm [X] chỉ trong 3 bước — ai cũng làm được!" Text overlay nhanh, nhạc sôi động.
Cảnh 2 - Bước 1: Cận cảnh tay thực hiện bước đầu tiên, chú thích rõ ràng bằng text.
Cảnh 3 - Bước 2: Tiếp tục step 2, tempo nhanh, cắt ghép gọn ghẽ giữ nhịp.
Cảnh 4 - Bước 3: Bước cuối cùng — khoảnh khắc hoàn thiện đẹp mắt, đáng share.
Cảnh 5: Kết quả cuối cùng đẹp lung linh, nhạc crescendo, "Lưu lại để dùng sau nhé!"`,
    duration: 30,
    scenes: 5,
  },
  // ── PHIM NGẮN ────────────────────────────────────────────────────────────────
  {
    id: 'tpl-short-film-drama',
    category: 'Phim ngắn',
    emoji: '🎬',
    title: 'Phim ngắn tâm lý',
    description: 'Câu chuyện xúc động khai thác cảm xúc sâu sắc, có mở-thân-đóng rõ ràng.',
    script: `Cảnh 1: Mưa rơi trên con phố vắng. Một người đứng nhìn căn nhà cũ từ phía bên kia đường. Flashback bắt đầu.
Cảnh 2: Ký ức tuổi thơ — căn nhà đó từng rộn ràng tiếng cười, mùi bánh bà nấu, ánh đèn vàng ấm áp.
Cảnh 3: Biến cố chia ly — cửa đóng lại, va li kéo trên sân, giọt nước mắt không dám nhìn lại.
Cảnh 4: Hiện tại — cánh cửa kẽo kẹt mở ra, người thân già hơn nhưng đôi mắt vẫn nhận ra ngay.
Cảnh 5: Vòng tay ôm chặt — không cần lời nói. Mưa tạnh dần, ánh nắng chiều len lỏi qua mây.`,
    duration: 90,
    scenes: 5,
  },
  // ── GIÁO DỤC ────────────────────────────────────────────────────────────────
  {
    id: 'tpl-explainer',
    category: 'Giáo dục',
    emoji: '📚',
    title: 'Video giải thích khái niệm',
    description: 'Trình bày khái niệm phức tạp theo cách đơn giản, dễ hiểu với visual minh họa.',
    script: `Cảnh 1: Câu hỏi khai mở trên màn hình: "Tại sao [chủ đề] lại quan trọng?" — hình ảnh gây tò mò.
Cảnh 2: Vấn đề hiện tại — minh họa bằng ví dụ thực tế gần gũi người xem.
Cảnh 3: Giải thích nguyên lý cốt lõi — animation đơn giản, màu sắc tương phản rõ ràng.
Cảnh 4: Ví dụ áp dụng thực tế — scenario cụ thể người xem có thể relate ngay.
Cảnh 5: Tóm tắt 3 điểm chính — layout clean, dễ nhớ, kèm CTA học thêm.`,
    duration: 60,
    scenes: 5,
  },
];

interface TemplatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (script: string) => void;
}

export const TemplatePickerModal: React.FC<TemplatePickerModalProps> = ({
  isOpen, onClose, onSelect,
}) => {
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [search, setSearch] = useState('');

  const filtered = STORYBOARD_TEMPLATES.filter(t => {
    const matchCat = activeCategory === 'Tất cả' || t.category === activeCategory;
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleSelect = (tpl: StoryboardTemplate) => {
    onSelect(tpl.script);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[800] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={e => e.stopPropagation()}
            className="w-full sm:max-w-2xl bg-white dark:bg-[#0e0e12] rounded-t-3xl sm:rounded-2xl border border-black/[0.06] dark:border-white/[0.06] shadow-2xl flex flex-col overflow-hidden max-h-[90dvh]"
          >
            {/* Header */}
            <div className="px-5 pt-5 pb-4 border-b border-black/[0.06] dark:border-white/[0.06] shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Chọn mẫu kịch bản</h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Chọn một mẫu phù hợp, AI sẽ điền sẵn kịch bản cho bạn
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Tìm mẫu..."
                  className="w-full pl-8 pr-4 py-2 text-sm bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] rounded-xl outline-none focus:border-brand-blue/50 transition-colors text-slate-900 dark:text-white placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Category tabs */}
            <div className="px-5 py-2.5 border-b border-black/[0.06] dark:border-white/[0.06] shrink-0 flex gap-1.5 overflow-x-auto no-scrollbar">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                    activeCategory === cat
                      ? 'bg-brand-blue text-white'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.05]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Template list */}
            <div className="flex-grow overflow-y-auto no-scrollbar p-4 space-y-2">
              {filtered.length === 0 && (
                <p className="text-center text-sm text-slate-400 dark:text-slate-500 py-8">
                  Không tìm thấy mẫu phù hợp
                </p>
              )}
              {filtered.map((tpl, i) => (
                <motion.button
                  key={tpl.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => handleSelect(tpl)}
                  className="w-full text-left flex items-center gap-4 p-4 rounded-xl border border-black/[0.06] dark:border-white/[0.06] bg-black/[0.01] dark:bg-white/[0.02] hover:border-brand-blue/40 hover:bg-brand-blue/[0.03] dark:hover:bg-brand-blue/[0.06] transition-all group"
                >
                  <span className="text-2xl shrink-0">{tpl.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{tpl.title}</span>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-black/[0.04] dark:bg-white/[0.06] px-2 py-0.5 rounded-full">{tpl.category}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{tpl.description}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">⏱ {tpl.duration}s</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">🎬 {tpl.scenes} cảnh</span>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-slate-300 dark:text-slate-600 group-hover:text-brand-blue transition-colors shrink-0" />
                </motion.button>
              ))}
            </div>

            {/* Footer hint */}
            <div className="px-5 py-3 border-t border-black/[0.06] dark:border-white/[0.06] shrink-0">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <Zap size={10} className="text-brand-blue" />
                Sau khi chọn mẫu, bạn có thể chỉnh sửa kịch bản tùy ý trước khi tạo storyboard
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
