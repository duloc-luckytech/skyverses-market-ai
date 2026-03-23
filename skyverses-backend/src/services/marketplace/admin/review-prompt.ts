import { MarketplaceItem } from "../../../models/MarketplaceModel";
import { hasAccess } from "../../../utils/roleHelpers";

export const reviewPrompt = async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const { role } = req.user;
        const { status, rejectionReason } = req.body;

        if (!hasAccess(role, ["admin", "master", "sub"])) {
            return res.status(403).json({
                success: false,
                message: "Bạn không có quyền truy cập tính năng này.",
            });
        }

        if (!id) {
            return res.status(400).json({ success: false, message: "Yêu cầu ID mục" });
        }

        if (!status || !["public", "denied"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Trạng thái phải là 'public' hoặc 'denied'"
            });
        }

        const item = await MarketplaceItem.findById(id);

        if (!item) {
            return res.status(404).json({ success: false, message: "Không tìm thấy mục" });
        }

        if (item.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: "Chỉ có thể duyệt các mục đang chờ"
            });
        }

        const updateData: any = { status };

        if (status === "denied" && rejectionReason) {
            updateData.metadata = {
                ...item.metadata,
                rejectionReason
            };
        }

        const updatedItem = await MarketplaceItem.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: `${status === "public" ? "Phê duyệt" : "Từ chối"} mục thành công`,
            data: updatedItem
        });

    } catch (error) {
        console.error("Error in reviewPrompt:", error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
    }
};

export const getPendingReviewItems = async (req: any, res: any) => {
    try {
        const { role } = req.user;
        const { page = 1, limit = 10 } = req.query;

        if (!hasAccess(role, ["admin", "master", "sub"])) {
            return res.status(403).json({
                success: false,
                message: "Bạn không có quyền truy cập tính năng này.",
            });
        }

        const skip = (Number(page) - 1) * Number(limit);

        const items = await MarketplaceItem.find({ status: "pending" })
            .populate("creatorId", "firstName lastName email avatar")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await MarketplaceItem.countDocuments({ status: "pending" });

        return res.status(200).json({
            success: true,
            data: items,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit)),
            },
        });

    } catch (error) {
        console.error("Error in getPendingReviewItems:", error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
    }
};

