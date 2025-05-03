import express from 'express';
import qnaRoutes from './qna.route.js';
import companyRoutes from './company.route.js';
import noinfoRoutes from './noinfo.route.js';


const router = express.Router();

router.use('/', qnaRoutes);
router.use('/', companyRoutes);
router.use('/', noinfoRoutes);

export default router;
