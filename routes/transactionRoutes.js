const express = require('express');
const {
    initializeDatabase,
    listTransactions,
    getStatistics,
    getBarChart,
    getPieChart,
} = require('../controllers/transactionController');

const router = express.Router();

router.get('/initialize-database', initializeDatabase);
router.get('/list', listTransactions);
router.get('/statistics', getStatistics);
router.get('/bar-chart', getBarChart);
router.get('/pie-chart', getPieChart);

module.exports = router;
