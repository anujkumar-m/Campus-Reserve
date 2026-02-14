const express = require('express');
const {
    getResources,
    getResource,
    createResource,
    updateResource,
    deleteResource,
} = require('../controllers/resourceController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();

router.use(protect); // All routes require authentication

router
    .route('/')
    .get(getResources)
    .post(authorize('infra_admin', 'it_admin', 'department'), createResource);

router
    .route('/:id')
    .get(getResource)
    .put(authorize('infra_admin', 'it_admin', 'department'), updateResource)
    .delete(authorize('infra_admin', 'it_admin'), deleteResource);

module.exports = router;
