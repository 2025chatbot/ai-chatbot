import express from 'express';
import qnaRoutes from './qna.route.js';
import companyRoutes from './company.route.js';

const router = express.Router();

router.use('/', qnaRoutes);
router.use('/', companyRoutes);

export default router;
