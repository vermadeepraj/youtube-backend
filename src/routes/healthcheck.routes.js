import express from "express";
import { healthCheck } from "../controllers/healthcheck.controller";

const router = express.Router();

// Route for health check
router.get("/health", healthCheck);

export default router;
