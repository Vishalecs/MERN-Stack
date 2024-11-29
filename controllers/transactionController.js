const axios = require('axios');
const Transaction = require('../models/Transaction');

// Initialize the database with seed data
exports.initializeDatabase = async (req, res) => {
    try {
        const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
        await Transaction.deleteMany(); // Clear existing data
        await Transaction.insertMany(response.data); // Seed database
        res.status(200).send('Database initialized successfully!');
    } catch (error) {
        res.status(500).json({ message: 'Error initializing database', error });
    }
};

// List transactions with search and pagination
exports.listTransactions = async (req, res) => {
    const { page = 1, perPage = 10, search = '', month } = req.query;
    const regex = new RegExp(search, 'i');
    const monthFilter = month ? { $expr: { $eq: [{ $month: '$dateOfSale' }, new Date(`1 ${month} 2000`).getMonth() + 1] } } : {};

    try {
        const transactions = await Transaction.find({
            $and: [
                { $or: [{ title: regex }, { description: regex }, { price: regex }] },
                monthFilter,
            ],
        })
            .skip((page - 1) * perPage)
            .limit(parseInt(perPage));
        const totalCount = await Transaction.countDocuments(monthFilter);

        res.status(200).json({ transactions, totalCount });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transactions', error });
    }
};

// Statistics API
exports.getStatistics = async (req, res) => {
    const { month } = req.query;
    const monthFilter = month ? { $expr: { $eq: [{ $month: '$dateOfSale' }, new Date(`1 ${month} 2000`).getMonth() + 1] } } : {};

    try {
        const totalSales = await Transaction.aggregate([
            { $match: monthFilter },
            { $group: { _id: null, totalAmount: { $sum: '$price' }, soldCount: { $sum: { $cond: ['$sold', 1, 0] } } } },
        ]);
        const notSoldCount = await Transaction.countDocuments({ ...monthFilter, sold: false });

        res.status(200).json({
            totalAmount: totalSales[0]?.totalAmount || 0,
            soldItems: totalSales[0]?.soldCount || 0,
            notSoldItems: notSoldCount,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching statistics', error });
    }
};

// Bar chart API
exports.getBarChart = async (req, res) => {
    const { month } = req.query;
    const monthFilter = month ? { $expr: { $eq: [{ $month: '$dateOfSale' }, new Date(`1 ${month} 2000`).getMonth() + 1] } } : {};

    try {
        const priceRanges = await Transaction.aggregate([
            { $match: monthFilter },
            {
                $bucket: {
                    groupBy: '$price',
                    boundaries: [0, 101, 201, 301, 401, 501, 601, 701, 801, 901, Infinity],
                    default: '901+',
                    output: { count: { $sum: 1 } },
                },
            },
        ]);

        res.status(200).json(priceRanges);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bar chart data', error });
    }
};

// Pie chart API
exports.getPieChart = async (req, res) => {
    const { month } = req.query;
    const monthFilter = month ? { $expr: { $eq: [{ $month: '$dateOfSale' }, new Date(`1 ${month} 2000`).getMonth() + 1] } } : {};

    try {
        const categoryData = await Transaction.aggregate([
            { $match: monthFilter },
            { $group: { _id: '$category', count: { $sum: 1 } } },
        ]);

        res.status(200).json(categoryData);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching pie chart data', error });
    }
};
