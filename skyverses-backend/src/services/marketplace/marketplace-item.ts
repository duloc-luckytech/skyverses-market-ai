import { MarketplaceItem, MarketplaceItemComment, MarketplacePurchase } from "../../models/MarketplaceModel";

export const getItemDetails = async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;

        const item = await MarketplaceItem.findById(id);

        if (!item) {
            return res.status(404).json({ success: false, message: "Không tìm thấy mục" });
        }

        const isCreator = userId && item.creatorId.toString() === userId.toString();

        let isPurchased = false;
        if (userId) {
            const purchase = await MarketplacePurchase.findOne({ userId, itemId: id });
            if (purchase) {
                isPurchased = true;
            }
        }

        if (item.status === "private" && !isPurchased && !isCreator) {
            return res.status(403).json({
                success: false,
                message: "Mục này là riêng tư. Bạn cần mua để xem chi tiết."
            });
        }

        const comments = await MarketplaceItemComment.find({ itemId: id })
            .populate("userId", "firstName lastName avatar")
            .sort({ createdAt: -1 });

        const { prompt, buyer, income, ...itemData } = item.toObject();

        const responseData: any = {
            ...itemData,
            isPurchased,
            comments,
        };

        if (isCreator) {
            responseData.buyer = buyer;
            responseData.income = income;
        }

        return res.status(200).json({
            success: true,
            data: responseData,
        });

    } catch (error) {
        console.error("Error in getDetails:", error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
    }
};

export const getListItems = async (req: any, res: any) => {
    try {
        const { page = 1, limit = 10, type, tag, platform, sort } = req.query;

        const query: any = { status: "public" };

        if (type) {
            query.type = type;
        }

        if (tag) {
            query.tag = { $in: [tag] };
        }

        if (platform) {
            query.platform = platform;
        }

        let sortOption: any = {};

        switch (sort) {
            case "trending":
                sortOption = { viewer: -1 };
                break;
            case "newest":
                sortOption = { createdAt: -1 };
                break;
            case "top_sales":
                sortOption = { buyer: -1 };
                break;
            default:
                sortOption = { createdAt: -1 };
                break;
        }

        const skip = (Number(page) - 1) * Number(limit);

        const prompts = await MarketplaceItem.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(Number(limit))
            .select("-prompt -buyer -income");

        const total = await MarketplaceItem.countDocuments(query);

        return res.status(200).json({
            success: true,
            data: prompts,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error) {
        console.error("Error in getListPrompt:", error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
    }
};
