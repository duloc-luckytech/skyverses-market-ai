// scripts/initMetaPromptTemplates.ts
import MetaPromptTemplate from "../models/MetaPromptTemplate";

export async function initMetaPromptTemplates() {
  /* ============================================================
     20 LĨNH VỰC VIDEO — FULL DATA WITH styles / tones / pacings
  ============================================================ */
  const categories = [
    {
      name: "Điện ảnh",
      role: "Bạn là chuyên gia làm phim điện ảnh và chuyên gia AI Video.",
      rules: [
        "Phân rã ý tưởng thành kịch bản điện ảnh ngắn.",
        "Giữ đúng bối cảnh cinematic, không thêm nhân vật mới.",
        "Chỉ trả về JSON, không thêm văn bản ngoài JSON.",
        "Mỗi scene chỉ 1 shot duy nhất.",
        "Camera phải ngắn gọn, 6–8 từ, tiếng Việt.",
        "Description dùng tiếng Việt cảm xúc, giàu hình ảnh.",
        "Prompt phải dùng tiếng Anh cinematic, có ánh sáng, chất liệu, atmosphere.",
        "Không được thêm bối cảnh ngoài ý tưởng gốc.",
        "Duration luôn = 8.",
      ],
      styles: ["cinematic", "atmospheric", "dark contrast", "soft haze", "dramatic"],
      tones: ["nghiêm túc", "căng thẳng", "ấm áp", "lắng đọng"],
      pacings: ["chậm", "vừa", "tăng cao trào"],
    },

    {
      name: "Vlog du lịch",
      role: "Bạn là chuyên gia sản xuất Vlog du lịch và chuyên gia AI Video.",
      rules: [
        "Giữ đúng tinh thần travel vlog: nhẹ nhàng, đời thực, khám phá.",
        "Không thêm địa điểm ngoài ý tưởng gốc.",
        "Camera ưu tiên pan, tilt, drone, tracking.",
        "Description mô tả không khí địa điểm bằng tiếng Việt.",
        "Prompt tiếng Anh nhấn mạnh ánh sáng tự nhiên.",
      ],
      styles: ["natural light", "travel", "adventure", "lifestyle"],
      tones: ["tươi sáng", "ấm áp", "phấn khởi"],
      pacings: ["nhẹ nhàng", "ổn định", "nhanh"],
    },

    {
      name: "Quảng cáo sản phẩm",
      role: "Bạn là chuyên gia tạo video quảng cáo sản phẩm (commercial).",
      rules: [
        "Lấy sản phẩm làm trung tâm, không thêm sản phẩm khác.",
        "Không thay đổi chất liệu sản phẩm.",
        "Camera ưu tiên close-up, slow-motion, product showcase.",
        "Prompt studio lighting, glossy reflections.",
      ],
      styles: ["studio", "clean", "premium", "sleek"],
      tones: ["sang trọng", "tối giản", "cao cấp"],
      pacings: ["chậm", "nhấn mạnh điểm chính", "vừa"],
    },

    {
      name: "Review sản phẩm",
      role: "Bạn là chuyên gia video review sản phẩm và AI Video.",
      rules: [
        "Giữ đúng sản phẩm gốc.",
        "Tone thực tế, gần gũi.",
        "Camera handheld / pov.",
      ],
      styles: ["realistic", "handheld", "casual"],
      tones: ["trung tính", "thân thiện"],
      pacings: ["vừa", "ổn định"],
    },

    {
      name: "Fashion Lookbook",
      role: "Bạn là chuyên gia làm video thời trang & lookbook.",
      rules: [
        "Tập trung vào trang phục & chất liệu.",
        "Camera dolly, portrait, runway.",
      ],
      styles: ["editorial", "fashion glossy", "urban chic"],
      tones: ["sang trọng", "lôi cuốn", "lạnh"],
      pacings: ["chậm", "vừa"],
    },

    {
      name: "Nấu ăn / Cooking",
      role: "Bạn là chuyên gia video nấu ăn và food content.",
      rules: [
        "Không thay đổi món ăn.",
        "Camera overhead / close-up food.",
      ],
      styles: ["warm kitchen", "food macro", "authentic"],
      tones: ["ấm áp", "ngon miệng"],
      pacings: ["vừa", "chậm"],
    },

    {
      name: "Real Estate / Bất động sản",
      role: "Bạn là chuyên gia video bất động sản và AI Video.",
      rules: [
        "Không thay đổi kiến trúc.",
        "Camera wide sweeping shot.",
      ],
      styles: ["clean architectural", "minimal modern"],
      tones: ["trong trẻo", "chuyên nghiệp"],
      pacings: ["chậm", "ổn định"],
    },

    {
      name: "Animation 2D",
      role: "Bạn là chuyên gia dựng hoạt hình 2D.",
      rules: ["Tone vẽ tay, hoạt hình 2D rõ ràng."],
      styles: ["hand-drawn", "anime", "cartoon"],
      tones: ["dễ thương", "hài hước"],
      pacings: ["vừa", "nhanh"],
    },

    {
      name: "Animation 3D",
      role: "Bạn là chuyên gia diễn hoạt 3D.",
      rules: ["Tone 3D realistic hoặc stylized."],
      styles: ["CGI realistic", "Pixar-like", "Stylized 3D"],
      tones: ["kỳ ảo", "hấp dẫn"],
      pacings: ["vừa", "nhanh"],
    },

    {
      name: "Horror / Kinh dị",
      role: "Bạn là chuyên gia phim kinh dị.",
      rules: ["Không thêm quái vật ngoài idea."],
      styles: ["dark horror", "grainy", "chiaroscuro"],
      tones: ["rùng rợn", "căng thẳng"],
      pacings: ["chậm", "cao trào"],
    },

    {
      name: "Romance / Tình cảm",
      role: "Bạn là chuyên gia romance.",
      rules: ["Tone ấm áp, dreamy."],
      styles: ["dreamy", "soft glow", "romantic"],
      tones: ["ngọt ngào", "ấm"],
      pacings: ["chậm", "vừa"],
    },

    {
      name: "Action / Hành động",
      role: "Bạn là chuyên gia hành động.",
      rules: ["Camera dynamic."],
      styles: ["high contrast", "kinetic", "gritty"],
      tones: ["mạnh mẽ", "kịch tính"],
      pacings: ["nhanh", "siêu nhanh"],
    },

    {
      name: "Gaming Highlight",
      role: "Bạn là chuyên gia dựng highlight game.",
      rules: ["Không thay đổi nhân vật game."],
      styles: ["neon", "glitch", "fps highlight"],
      tones: ["năng lượng", "kịch tính"],
      pacings: ["nhanh"],
    },

    {
      name: "Fitness / Gym",
      role: "Bạn là chuyên gia fitness.",
      rules: [],
      styles: ["muscle contrast", "gym gritty", "dramatic sport"],
      tones: ["mạnh mẽ", "quyết tâm"],
      pacings: ["nhanh", "vừa"],
    },

    {
      name: "Beauty / Makeup",
      role: "Bạn là chuyên gia beauty.",
      rules: [],
      styles: ["glossy", "beauty editorial", "soft glam"],
      tones: ["nữ tính", "tinh tế"],
      pacings: ["chậm"],
    },

    {
      name: "Tech Product",
      role: "Bạn là chuyên gia video công nghệ.",
      rules: [],
      styles: ["futuristic", "clean tech", "dark neon"],
      tones: ["hiện đại", "tối giản"],
      pacings: ["vừa"],
    },

    {
      name: "Event / Sự kiện",
      role: "Bạn là chuyên gia dựng event recap.",
      rules: [],
      styles: ["festival", "concert", "documentary"],
      tones: ["sôi động", "hào hứng"],
      pacings: ["nhanh"],
    },

    {
      name: "Music Visualizer",
      role: "Bạn là chuyên gia visualizer.",
      rules: [],
      styles: ["neon abstract", "audio spectrum", "psychedelic"],
      tones: ["mạnh mẽ", "điện tử"],
      pacings: ["nhịp nhàng", "nhanh"],
    },

    {
      name: "Ô tô / Cars Cinematic",
      role: "Bạn là chuyên quay xe cinematic.",
      rules: [],
      styles: ["automotive glossy", "rolling shot", "night ride"],
      tones: ["mạnh mẽ", "đắt tiền"],
      pacings: ["nhanh", "vừa"],
    },

    {
      name: "Education / Giải thích kiến thức",
      role: "Bạn là chuyên gia video giáo dục.",
      rules: [],
      styles: ["clean infographic", "whiteboard", "flat graphic"],
      tones: ["rõ ràng", "dễ hiểu"],
      pacings: ["vừa"],
    },
  ];

  /* ============================================================
     FORMAT CHUNG CHO TẤT CẢ
  ============================================================ */
  const outputFormat = `
{
  "title": "",
  "summary": "",
  "scenes": [
    {
      "sceneIndex": 1,
      "name": "",
      "description": "",
      "shot": {
        "id": "1",
        "camera": "",
        "prompt": "",
        "duration": 8
      }
    }
  ]
}
`.trim();

  /* ============================================================
     CLEAR & INSERT
  ============================================================ */
  console.log("🧹 Xóa toàn bộ MetaPromptTemplate...");
  await MetaPromptTemplate.deleteMany({});

  let index = 0;

  for (const item of categories) {
    const doc = await MetaPromptTemplate.create({
      ...item,
      outputFormat,
      isActive:true
    });

    console.log("✅ Created:", doc.name);
    index++;
  }

  console.log("🎉 Seed 20 templates hoàn tất!");
}