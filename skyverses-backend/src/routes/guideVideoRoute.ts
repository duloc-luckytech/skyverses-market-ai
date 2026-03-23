import express from "express";
import GuideVideo from "../models/GuideVideoModel";

const router = express.Router();

/**
 * 🧭 GET /guide-videos
 * → Lấy danh sách video hướng dẫn (active)
 */
router.get("/", async (req, res) => {
  try {
    const videos:any = await GuideVideo.find({ isActive: true }).sort({ order: 1 });
    res.json({
      success: true,
      data: videos.map((v:any) => ({
        _id: v._id,
        title: v.title,
        youtubeId: v.youtubeId,
        category: v.category,
        description: v.description,
        thumbUrl: v.thumbUrl,
        embedUrl: v.embedUrl,
      })),
    });
  } catch (err) {
    console.error("❌ Lỗi khi lấy guide videos:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * ➕ POST /guide-videos
 * → Tạo video hướng dẫn mới
 */
router.post("/", async (req, res) => {
  try {
    const { title, youtubeId, category, description, order } = req.body;

    if (!title || !youtubeId)
      return res.status(400).json({ success: false, message: "Thiếu dữ liệu" });

    const video = await GuideVideo.create({
      title,
      youtubeId,
      category,
      description,
      order,
    });

    res.json({ success: true, data: video });
  } catch (err) {
    console.error("❌ Lỗi khi tạo video hướng dẫn:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * ✏️ PUT /guide-videos/:id
 * → Cập nhật video hướng dẫn
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    const updated = await GuideVideo.findByIdAndUpdate(id, update, {
      new: true,
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("❌ Lỗi khi cập nhật guide video:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * 🗑 DELETE /guide-videos/:id
 * → Xóa video
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await GuideVideo.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Lỗi khi xóa guide video:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;