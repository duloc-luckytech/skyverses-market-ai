import { MarketplaceItem, MarketplacePurchase } from "../../models/MarketplaceModel";
import User from "../../models/UserModel";
import TransactionHistory from "../../models/TransactionHistoryModel";

export const buyItem = async (req: any, res: any) => {
    try {
        const { itemId } = req.body;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Chưa được xác thực" });
        }

        if (!itemId) {
            return res.status(400).json({ success: false, message: "Yêu cầu itemId" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
        }

        const item = await MarketplaceItem.findById(itemId);
        if (!item) {
            return res.status(404).json({ success: false, message: "Không tìm thấy mục" });
        }

        if (user.credit < item.price) {
            return res.status(400).json({ success: false, message: "Không đủ credit để mua mục này" });
        }

        const existingPurchase = await MarketplacePurchase.findOne({ userId, itemId });
        if (existingPurchase) {
            return res.status(400).json({ success: false, message: "Bạn đã mua mục này rồi" });
        }

        const balanceBefore = user.credit;
        user.credit -= item.price;
        const balanceAfter = user.credit;
        await user.save();

        const purchase = await MarketplacePurchase.create({
            userId,
            itemId,
            price: item.price
        });

        await TransactionHistory.create({
            userId,
            itemId,
            type: "purchase",
            amount: item.price,
            description: `Purchased item: ${item.type}`,
            balanceBefore,
            balanceAfter
        });

        await MarketplaceItem.findByIdAndUpdate(itemId, {
            $inc: {
                buyer: 1,
                income: item.price
            }
        });

        return res.status(200).json({
            success: true,
            message: "Mua mục thành công",
            data: purchase,
            userCredits: user.credit
        });

    } catch (error) {
        console.error("Error in buyItem:", error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
    }
};
