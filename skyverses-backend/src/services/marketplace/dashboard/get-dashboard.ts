import moment from "moment";
import { MarketplaceItem, MarketplacePurchase } from "../../../models/MarketplaceModel";

export const getDashboard = async (req: any, res: any) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Chưa được xác thực" });
        }

        const items = await MarketplaceItem.find({ creatorId: userId }).sort({ createdAt: -1 });

        let totalViews = 0;
        let totalSales = 0;
        let totalIncome = 0;

        const itemIds = items.map(item => item._id);

        items.forEach(item => {
            totalViews += item.viewer;
            totalSales += item.buyer;
            totalIncome += item.income;
        });

        const thirtyDaysAgo = moment().subtract(30, 'days').toDate();

        const purchases = await MarketplacePurchase.find({
            itemId: { $in: itemIds },
            createdAt: { $gte: thirtyDaysAgo }
        });

        const chartData: { [key: string]: number } = {};

        for (let i = 0; i < 30; i++) {
            const date = moment().subtract(i, 'days').format('YYYY-MM-DD');
            chartData[date] = 0;
        }

        purchases.forEach(purchase => {
            const date = moment(purchase.createdAt).format('YYYY-MM-DD');
            if (chartData[date] !== undefined) {
                chartData[date] += purchase.price;
            }
        });

        const chart = Object.keys(chartData).map(date => ({
            date,
            income: chartData[date]
        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return res.status(200).json({
            success: true,
            data: {
                stats: {
                    totalViews,
                    totalSales,
                    totalIncome
                },
                chart,
                items
            }
        });

    } catch (error) {
        console.error("Error in getDashboard:", error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
    }
};
