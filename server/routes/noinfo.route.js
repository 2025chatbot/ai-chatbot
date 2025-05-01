import express from 'express';
import {
    getNoInfoQuestions,
    submitNoInfoAnswers
} from '../controllers/noinfo.controller.js';

const router = express.Router();

// GET: /noinfo/:company
router.get('/noinfo/:company', getNoInfoQuestions);

// POST: /noinfo/:company
router.post('/noinfo/:company', submitNoInfoAnswers);

export default router;
