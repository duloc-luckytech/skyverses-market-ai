import express from "express";
import { authenticate } from "./auth";
import { buyItem } from "../services/marketplace/buy-item";
import { commentItem } from "../services/marketplace/comment-item";
import { getItemDetails, getListItems } from "../services/marketplace/marketplace-item";
import { reportItem } from "../services/marketplace/report-item";
import { createPrompt, editPrompt, deletePrompt, usePrompt } from "../services/marketplace/dashboard/prompt";
import { getDashboard } from "../services/marketplace/dashboard/get-dashboard";
import { getPurchasedPrompts } from "../services/marketplace/dashboard/get-list-prompt";
import { reviewPrompt, getPendingReviewItems } from "../services/marketplace/admin/review-prompt";
import { getReportedItems, updateReportStatus } from "../services/marketplace/admin/report-case";

const router = express.Router();

/**
 * @swagger
 * /marketplace/items:
 *   get:
 *     summary: Lấy danh sách items trên marketplace
 *     tags: [Marketplace]
 *     description: Trả về danh sách prompts có thể lọc theo type, tag, platform và sắp xếp theo trending/newest/top_sales
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số item mỗi trang
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Lọc theo loại (Video Prompt / Image Prompt / Style Prompt)
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Lọc theo tag
 *       - in: query
 *         name: platform
 *         schema:
 *           type: string
 *         description: Lọc theo platform (TikTok / Instagram / YouTube)
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [trending, newest, top_sales]
 *         description: Sắp xếp theo trending (viewer), newest (createdAt), top_sales (buyer)
 *     responses:
 *       200:
 *         description: Danh sách items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 */
router.get("/items", getListItems);

/**
 * @swagger
 * /marketplace/items/{id}:
 *   get:
 *     summary: Xem chi tiết 1 item
 *     tags: [Marketplace]
 *     description: Hiển thị thông tin chi tiết, reviews, và prompt (chỉ hiện nếu đã mua)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của item
 *     responses:
 *       200:
 *         description: Thông tin chi tiết item
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     imageUrl:
 *                       type: string
 *                     previewUrl:
 *                       type: string
 *                     description:
 *                       type: string
 *                     price:
 *                       type: number
 *                     rating:
 *                       type: number
 *                     viewer:
 *                       type: number
 *                     buyer:
 *                       type: number
 *                     prompt:
 *                       type: string
 *                       description: Sẽ bị che nếu chưa mua
 *                     isPurchased:
 *                       type: boolean
 *                     comments:
 *                       type: array
 */
router.get("/items/:id", authenticate, getItemDetails);

/**
 * @swagger
 * /marketplace/buy:
 *   post:
 *     summary: Mua 1 item
 *     tags: [Marketplace]
 *     description: Mua item bằng credit của user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - itemId
 *             properties:
 *               itemId:
 *                 type: string
 *                 description: ID của item cần mua
 *     responses:
 *       200:
 *         description: Mua thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                 userCredits:
 *                   type: number
 *       400:
 *         description: Không đủ credit hoặc đã mua rồi
 */
router.post("/buy", authenticate, buyItem);

/**
 * @swagger
 * /marketplace/use-prompt:
 *   post:
 *     summary: Sử dụng prompt đã mua để tạo video
 *     tags: [Marketplace]
 *     description: Tạo video từ prompt đã mua với các giá trị metadata tùy chỉnh
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - itemId
 *               - metadata
 *             properties:
 *               itemId:
 *                 type: string
 *               metadata:
 *                 type: object
 *                 description: Key-value pair cho các biến trong prompt
 *     responses:
 *       200:
 *         description: Tạo job thành công
 *       400:
 *         description: Thiếu thông tin hoặc metadata không hợp lệ
 *       403:
 *         description: Chưa mua prompt này
 */
router.post("/use-prompt", authenticate, usePrompt);

/**
 * @swagger
 * /marketplace/comment:
 *   post:
 *     summary: Comment và đánh giá item đã mua
 *     tags: [Marketplace]
 *     description: User chỉ có thể comment 1 lần cho mỗi item đã mua
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - itemId
 *               - star
 *               - comment
 *             properties:
 *               itemId:
 *                 type: string
 *               star:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment thành công
 *       400:
 *         description: Đã comment rồi hoặc chưa mua item
 *       403:
 *         description: Chưa mua item này
 */
router.post("/comment", authenticate, commentItem);

/**
 * @swagger
 * /marketplace/dashboard:
 *   get:
 *     summary: Dashboard của creator
 *     tags: [Marketplace Dashboard]
 *     description: Hiển thị thống kê items đã đăng, số lượt xem, bán, thu nhập và biểu đồ doanh thu 30 ngày
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thông tin dashboard
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalViews:
 *                           type: number
 *                         totalSales:
 *                           type: number
 *                         totalIncome:
 *                           type: number
 *                     chart:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                           income:
 *                             type: number
 *                     items:
 *                       type: array
 */
router.get("/dashboard", authenticate, getDashboard);

/**
 * @swagger
 * /marketplace/dashboard/my-purchases:
 *   get:
 *     summary: Danh sách prompts đã mua
 *     tags: [Marketplace Dashboard]
 *     description: Trả về danh sách các prompt user đã mua
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Danh sách items đã mua
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                 pagination:
 *                   type: object
 */
router.get("/dashboard/my-purchases", authenticate, getPurchasedPrompts);

/**
 * @swagger
 * /marketplace/dashboard/create:
 *   post:
 *     summary: Tạo item mới để bán
 *     tags: [Marketplace Dashboard]
 *     description: Creator đăng bán prompt lên marketplace
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - imageUrl
 *               - type
 *               - prompt
 *             properties:
 *               imageUrl:
 *                 type: string
 *               previewUrl:
 *                 type: string
 *               description:
 *                 type: string
 *               metadata:
 *                 type: object
 *               price:
 *                 type: number
 *               prompt:
 *                 type: string
 *               type:
 *                 type: string
 *               tag:
 *                 type: array
 *                 items:
 *                   type: string
 *               platform:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo item thành công
 *       400:
 *         description: Thiếu thông tin bắt buộc
 */
router.post("/dashboard/create", authenticate, createPrompt);

/**
 * @swagger
 * /marketplace/dashboard/edit/{id}:
 *   put:
 *     summary: Chỉnh sửa item đã đăng
 *     tags: [Marketplace Dashboard]
 *     description: Creator chỉnh sửa hoặc ẩn/xóa item của mình
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của item cần chỉnh sửa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               imageUrl:
 *                 type: string
 *               previewUrl:
 *                 type: string
 *               description:
 *                 type: string
 *               metadata:
 *                 type: object
 *               price:
 *                 type: number
 *               prompt:
 *                 type: string
 *               type:
 *                 type: string
 *               tag:
 *                 type: array
 *                 items:
 *                   type: string
 *               platform:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 description: Dùng để ẩn/hiện item
 *     responses:
 *       200:
 *         description: Chỉnh sửa thành công
 *       403:
 *         description: Không có quyền chỉnh sửa item này
 *       404:
 *         description: Không tìm thấy item
 */
router.put("/dashboard/edit/:id", authenticate, editPrompt);

/**
 * @swagger
 * /marketplace/dashboard/delete/{id}:
 *   delete:
 *     summary: Xóa item đã đăng
 *     tags: [Marketplace Dashboard]
 *     description: Creator xóa item của mình khỏi marketplace
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của item cần xóa
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       403:
 *         description: Không có quyền xóa item này
 *       404:
 *         description: Không tìm thấy item
 */
router.delete("/dashboard/delete/:id", authenticate, deletePrompt);

/**
 * @swagger
 * /marketplace/report:
 *   post:
 *     summary: Report một item vi phạm
 *     tags: [Marketplace]
 *     description: User report item vi phạm hoặc spam
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - itemId
 *               - reason
 *             properties:
 *               itemId:
 *                 type: string
 *                 description: ID của item bị report
 *               reason:
 *                 type: string
 *                 description: Lý do report
 *               description:
 *                 type: string
 *                 description: Mô tả chi tiết (optional)
 *     responses:
 *       201:
 *         description: Report thành công
 *       400:
 *         description: Đã report item này rồi
 *       404:
 *         description: Không tìm thấy item
 */
router.post("/report", authenticate, reportItem);

/**
 * @swagger
 * /marketplace/admin/pending-reviews:
 *   get:
 *     summary: Admin - Lấy danh sách items chờ review
 *     tags: [Marketplace Admin]
 *     description: Admin xem các prompt đang chờ được duyệt
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Danh sách items pending
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                 pagination:
 *                   type: object
 *       403:
 *         description: Không có quyền truy cập
 */
router.get("/admin/pending-reviews", authenticate, getPendingReviewItems);

/**
 * @swagger
 * /marketplace/admin/review/{id}:
 *   put:
 *     summary: Admin - Review và duyệt/từ chối prompt
 *     tags: [Marketplace Admin]
 *     description: Admin approve hoặc deny prompt đang pending
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của item cần review
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [public, denied]
 *                 description: Duyệt (public) hoặc từ chối (denied)
 *               rejectionReason:
 *                 type: string
 *                 description: Lý do từ chối (bắt buộc nếu status = denied)
 *     responses:
 *       200:
 *         description: Review thành công
 *       400:
 *         description: Item không ở trạng thái pending
 *       403:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy item
 */
router.put("/admin/review/:id", authenticate, reviewPrompt);

/**
 * @swagger
 * /marketplace/admin/reports:
 *   get:
 *     summary: Admin - Lấy danh sách items bị report
 *     tags: [Marketplace Admin]
 *     description: Admin xem các item bị user report
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, resolved, rejected, all]
 *           default: pending
 *         description: Lọc theo trạng thái report
 *     responses:
 *       200:
 *         description: Danh sách reports
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       reporterId:
 *                         type: object
 *                         description: Thông tin user report
 *                       itemId:
 *                         type: object
 *                         description: Thông tin item bị report
 *                       reason:
 *                         type: string
 *                       description:
 *                         type: string
 *                       status:
 *                         type: string
 *                 pagination:
 *                   type: object
 *       403:
 *         description: Không có quyền truy cập
 */
router.get("/admin/reports", authenticate, getReportedItems);

/**
 * @swagger
 * /marketplace/admin/reports/{id}:
 *   put:
 *     summary: Admin - Cập nhật trạng thái report
 *     tags: [Marketplace Admin]
 *     description: Admin xử lý report (resolved/rejected)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của report
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [resolved, rejected, pending]
 *                 description: Trạng thái mới của report
 *               adminNote:
 *                 type: string
 *                 description: Ghi chú của admin (optional)
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       403:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy report
 */
router.put("/admin/reports/:id", authenticate, updateReportStatus);

export default router;
