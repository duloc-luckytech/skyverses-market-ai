import { MarketplacePurchase } from "../../../models/MarketplaceModel";

export const getPurchasedPrompts = async (req: any, res: any) => {
    try {
        const userId = req.user?.userId;
        const { page = 1, limit = 10 } = req.query;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Chưa được xác thực" });
        }

        const skip = (Number(page) - 1) * Number(limit);

        const purchases = await MarketplacePurchase.find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .populate("itemId");

        const total = await MarketplacePurchase.countDocuments({ userId });

        const items = purchases.map((purchase: any) => {
            if (!purchase.itemId) return null;

            return {
                ...purchase.itemId.toObject(),
                purchasedAt: purchase.createdAt
            };
        }).filter(item => item !== null);

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
        console.error("Error in getPurchasedPrompts:", error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
    }
};
