import express from 'express';
import { createCompany, getCompanyList } from '../controllers/company.controller.js';

const router = express.Router();

router.post('/company', createCompany);
router.get('/companies', getCompanyList);

export default router;
