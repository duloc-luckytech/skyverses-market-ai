import { MarketplaceItem, MarketplacePurchase } from "../../../models/MarketplaceModel";
import { init as initTextToVideo } from "../../textToVideo/init";

const validateMetadataAndPrompt = (metadata: any[], prompt: string) => {
    if (!Array.isArray(metadata)) {
        return { valid: false, message: "Metadata phải là một mảng" };
    }
    const placeholders = prompt.match(/\$\{([^}]+)\}/g)?.map(p => p.slice(2, -1)) || [];

    const definedKeys = metadata.map((m: any) => m.value);

    const missingKeys = placeholders.filter(key => !definedKeys.includes(key));

    if (missingKeys.length > 0) {
        return {
            valid: false,
            message: `Các biến sau trong prompt chưa được định nghĩa trong metadata: ${missingKeys.join(", ")}`
        };
    }

    const uniqueKeys = new Set(definedKeys);
    if (uniqueKeys.size !== definedKeys.length) {
        return { valid: false, message: "Metadata chứa các key trùng lặp" };
    }

    return { valid: true };
};

export const createPrompt = async (req: any, res: any) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Chưa được xác thực" });
        }

        const {
            imageUrl,
            previewUrl,
            description,
            metadata,
            price,
            prompt,
            type,
            tag,
            platform
        } = req.body;

        if (!imageUrl || !type || !prompt) {
            return res.status(400).json({
                success: false,
                message: "imageUrl, type và prompt là bắt buộc"
            });
        }

        if (type !== "text-to-video") {
            return res.status(400).json({
                success: false,
                message: "Type không hợp lệ, các type hợp lệ hiện tại: 'text-to-video'"
            });
        }

        if (metadata) {
            const validation = validateMetadataAndPrompt(metadata, prompt);
            if (!validation.valid) {
                return res.status(400).json({ success: false, message: validation.message });
            }
        }

        const newItem = await MarketplaceItem.create({
            imageUrl,
            previewUrl: previewUrl || "",
            description: description || "",
            metadata: metadata || [],
            price: price || 0,
            prompt,
            type,
            tag: tag || [],
            platform: platform || "",
            creatorId: userId,
            status: "pending"
        });

        return res.status(201).json({
            success: true,
            message: "Tạo mục thành công và đang chờ admin duyệt",
            data: newItem
        });

    } catch (error) {
        console.error("Error in createPrompt:", error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
    }
};

export const editPrompt = async (req: any, res: any) => {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Chưa được xác thực" });
        }

        if (!id) {
            return res.status(400).json({ success: false, message: "Yêu cầu ID mục" });
        }

        const item = await MarketplaceItem.findById(id);

        if (!item) {
            return res.status(404).json({ success: false, message: "Không tìm thấy mục" });
        }

        if (item.creatorId.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Bạn không có quyền chỉnh sửa mục này"
            });
        }

        const {
            imageUrl,
            previewUrl,
            description,
            metadata,
            price,
            prompt,
            type,
            tag,
            platform,
            status
        } = req.body;

        const updateData: any = {};

        if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
        if (previewUrl !== undefined) updateData.previewUrl = previewUrl;
        if (description !== undefined) updateData.description = description;
        if (price !== undefined) updateData.price = price;
        if (type !== undefined) updateData.type = type;
        if (tag !== undefined) updateData.tag = tag;
        if (platform !== undefined) updateData.platform = platform;
        if (status !== undefined) {
            if (!["public", "private"].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Trạng thái chỉ có thể là 'public' hoặc 'private'"
                });
            }
            updateData.status = status;
        }

        const newMetadata = metadata !== undefined ? metadata : item.metadata;
        const newPrompt = prompt !== undefined ? prompt : item.prompt;

        if (metadata !== undefined || prompt !== undefined) {
            const validation = validateMetadataAndPrompt(newMetadata, newPrompt);
            if (!validation.valid) {
                return res.status(400).json({ success: false, message: validation.message });
            }
            updateData.metadata = newMetadata;
            updateData.prompt = newPrompt;
        }

        const updatedItem = await MarketplaceItem.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Cập nhật mục thành công",
            data: updatedItem
        });

    } catch (error) {
        console.error("Error in editPrompt:", error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
    }
};

export const deletePrompt = async (req: any, res: any) => {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Chưa được xác thực" });
        }

        if (!id) {
            return res.status(400).json({ success: false, message: "Yêu cầu ID mục" });
        }

        const item = await MarketplaceItem.findById(id);

        if (!item) {
            return res.status(404).json({ success: false, message: "Không tìm thấy mục" });
        }

        if (item.creatorId.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Bạn không có quyền xóa mục này"
            });
        }

        const updatedItem = await MarketplaceItem.findByIdAndUpdate(
            id,
            { status: "delete" },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Xóa mục thành công",
            data: updatedItem
        });

    } catch (error) {
        console.error("Error in deletePrompt:", error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
    }
};

export const usePrompt = async (req: any, res: any) => {
    try {
        const userId = req.user?.userId;
        const { itemId, metadata: userMetadata } = req.body;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Chưa được xác thực" });
        }

        if (!itemId) {
            return res.status(400).json({ success: false, message: "Yêu cầu ID mục" });
        }

        const item = await MarketplaceItem.findById(itemId);

        if (!item) {
            return res.status(404).json({ success: false, message: "Không tìm thấy mục" });
        }

        const isCreator = item.creatorId.toString() === userId.toString();
        let isPurchased = false;
        if (!isCreator) {
            const purchase = await MarketplacePurchase.findOne({ userId, itemId });
            isPurchased = !!purchase;
        }

        if (!isCreator && !isPurchased) {
            return res.status(403).json({ success: false, message: "Bạn chưa mua prompt này" });
        }

        let finalPrompt = item.prompt;
        const itemMetadata = item.metadata || [];

        for (const meta of itemMetadata) {
            const key = meta.value;
            const userValue = userMetadata?.[key];

            if (!userValue) {
                return res.status(400).json({
                    success: false,
                    message: `Thiếu giá trị cho trường: ${meta.title || key}`
                });
            }

            finalPrompt = finalPrompt.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), userValue);
        }
        const result = await initTextToVideo(
            finalPrompt,
            8,
            {},
            userId,
            'wan',
            "relaxed",
            "wan",
            "",
            1,
            false,
            "marketplace",
            `Marketplace Job - ${item._id}`
        );

        return res.status(200).json({
            success: true,
            message: "Đã tạo job video thành công",
            data: result
        });

    } catch (error) {
        console.error("Error in usePrompt:", error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
    }
};
