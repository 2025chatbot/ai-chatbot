import express from 'express';
import {
    getNoInfoQuestions,
    submitNoInfoAnswers,
    deleteNoInfoQuestion
} from '../controllers/noinfo.controller.js';

const router = express.Router();

router.get('/noinfo/:company', getNoInfoQuestions);

router.post('/noinfo/:company', submitNoInfoAnswers);

router.delete('/noinfo/:company', deleteNoInfoQuestion);

export default router;
