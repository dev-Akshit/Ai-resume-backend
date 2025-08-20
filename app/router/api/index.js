import { Router } from "express";
import requestApi from './request.js';

let router = Router();
router.use('/requests', requestApi);

export default router;