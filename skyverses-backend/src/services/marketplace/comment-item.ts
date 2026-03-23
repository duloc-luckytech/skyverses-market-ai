import { MarketplaceItemComment, MarketplacePurchase } from "../../models/MarketplaceModel";

export const commentItem = async (req: any, res: any) => {
    try {
        const { itemId, star, comment } = req.body;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Chưa được xác thực" });
        }

        if (!itemId || star === undefined || !comment) {
            return res.status(400).json({
                success: false,
                message: "itemId, star và comment là bắt buộc"
            });
        }

        const purchase = await MarketplacePurchase.findOne({ userId, itemId });
        if (!purchase) {
            return res.status(403).json({
                success: false,
                message: "Bạn phải mua mục này trước khi bình luận"
            });
        }

        const existingComment = await MarketplaceItemComment.findOne({ userId, itemId });
        if (existingComment) {
            return res.status(400).json({
                success: false,
                message: "Bạn đã bình luận về mục này rồi"
            });
        }

        const newComment = await MarketplaceItemComment.create({
            userId,
            itemId,
            star,
            comment
        });

        return res.status(200).json({
            success: true,
            message: "Thêm bình luận thành công",
            data: newComment
        });

    } catch (error) {
        console.error("Error in commentItem:", error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
    }
};
