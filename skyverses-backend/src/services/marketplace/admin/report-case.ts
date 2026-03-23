import { MarketplaceItemReport, MarketplaceItem } from "../../../models/MarketplaceModel";
import { hasAccess } from "../../../utils/roleHelpers";

export const getReportedItems = async (req: any, res: any) => {
    try {
        const { role } = req.user;
        const { page = 1, limit = 10, status = "pending" } = req.query;

        if (!hasAccess(role, ["admin", "master", "sub"])) {
            return res.status(403).json({
                success: false,
                message: "Bạn không có quyền truy cập tính năng này.",
            });
        }

        const skip = (Number(page) - 1) * Number(limit);

        const filter: any = {};
        if (status && status !== "all") {
            filter.status = status;
        }

        const reports = await MarketplaceItemReport.find(filter)
            .populate("reporterId", "firstName lastName email avatar")
            .populate("itemId")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await MarketplaceItemReport.countDocuments(filter);

        return res.status(200).json({
            success: true,
            data: reports,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit)),
            },
        });

    } catch (error) {
        console.error("Error in getReportedItems:", error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
    }
};

export const updateReportStatus = async (req: any, res: any) => {
    try {
        const { role } = req.user;
        const { id } = req.params;
        const { status, adminNote } = req.body;

        if (!hasAccess(role, ["admin", "master", "sub"])) {
            return res.status(403).json({
                success: false,
                message: "Bạn không có quyền truy cập tính năng này.",
            });
        }

        if (!id) {
            return res.status(400).json({ success: false, message: "Yêu cầu ID báo cáo" });
        }

        if (!status || !["resolved", "rejected", "pending"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Trạng thái phải là 'resolved', 'rejected', hoặc 'pending'"
            });
        }

        const report = await MarketplaceItemReport.findById(id);

        if (!report) {
            return res.status(404).json({ success: false, message: "Không tìm thấy báo cáo" });
        }

        const updateData: any = { status };

        if (adminNote) {
            updateData.description = `${report.description}\n\nAdmin Note: ${adminNote}`;
        }

        const updatedReport = await MarketplaceItemReport.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).populate("reporterId", "firstName lastName email avatar")
            .populate("itemId");

        if (status === "resolved" && report.itemId) {
            await MarketplaceItem.findByIdAndUpdate(
                report.itemId,
                { status: "denied" }
            );
        }

        return res.status(200).json({
            success: true,
            message: "Cập nhật trạng thái báo cáo thành công",
            data: updatedReport
        });

    } catch (error) {
        console.error("Error in updateReportStatus:", error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
    }
};
