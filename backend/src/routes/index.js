import express from "express";

import authRoutes from "./auth.js";
import contentRoutes from "./content.js";
import libraryRoutes from "./library.js";
import tmdbRoutes from "./tmdbRoutes.js";
import healthRoutes from "./health-check.js";

const router = express.Router();

// ✅ register all routes
router.use("/auth", authRoutes);
router.use("/content", contentRoutes);
// keep backward compatibility for clients hitting /api/content
router.use("/api/content", contentRoutes);
router.use("/library", libraryRoutes);
router.use("/tmdb", tmdbRoutes);   // 🔥 THIS LINE IS THE KEY FIX
router.use("/health", healthRoutes);

export default router;