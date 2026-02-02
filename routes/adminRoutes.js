const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/', adminController.getDashboard);
router.post('/approve/:id', adminController.approveApplication);
router.get('/scan/:id', adminController.scanCertificate);

router.post('/add-event', adminController.createEvent); 
router.delete('/delete-event/:id', adminController.deleteEvent);

module.exports = router;