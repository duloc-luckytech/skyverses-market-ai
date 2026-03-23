import { MarketplaceItem, MarketplaceItemReport } from "../../models/MarketplaceModel";

export const reportItem = async (req: any, res: any) => {
    try {
        const userId = req.user?.userId;
        const { itemId, reason, description } = req.body;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Chưa được xác thực" });
        }

        if (!itemId || !reason) {
            return res.status(400).json({
                success: false,
                message: "ID mục và lý do là bắt buộc"
            });
        }

        const item = await MarketplaceItem.findById(itemId);
        if (!item) {
            return res.status(404).json({ success: false, message: "Không tìm thấy mục" });
        }

        const existingReport = await MarketplaceItemReport.findOne({
            reporterId: userId,
            itemId,
            status: "pending"
        });

        if (existingReport) {
            return res.status(400).json({
                success: false,
                message: "Bạn đã báo cáo mục này rồi"
            });
        }

        const report = new MarketplaceItemReport({
            reporterId: userId,
            itemId,
            reason,
            description: description || "",
            status: "pending"
        });

        await report.save();

        return res.status(201).json({
            success: true,
            message: "Gửi báo cáo thành công",
            data: report
        });

    } catch (error) {
        console.error("Error in reportItem:", error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
    }
};
