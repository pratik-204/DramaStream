import express from "express";
import {
	getContentById,
	getContentList,
	getFeaturedContent,
	getTop10ByType,
	getTrendingContent,
	getSimilarContent,
	searchContent,
	updateContentTrailer,
	addEpisode,
	updateEpisode,
	migrateAllContent,
	deleteEpisode,
	deleteContent,
	createContent,
	updateContent,
} from "../controllers/contentController.js";
import { validateBody } from '../middleware/validate.js';
import { createContentSchema, updateContentSchema, updateTrailerSchema, addEpisodeSchema, updateEpisodeSchema } from '../schemas/contentSchemas.js';

const router = express.Router();

router.get("/featured", getFeaturedContent);
router.get("/trending", getTrendingContent);
router.get("/top10", getTop10ByType);
router.get("/search", searchContent);
router.get("/", getContentList);
router.patch("/:id/trailer", validateBody(updateTrailerSchema), updateContentTrailer);
router.get("/similar/:id", getSimilarContent);
router.get("/:id", getContentById);
router.post("/", validateBody(createContentSchema), createContent);
router.put("/:id", validateBody(updateContentSchema), updateContent);
router.patch("/:id/episodes", validateBody(addEpisodeSchema), addEpisode);
router.patch("/:id/episode", validateBody(updateEpisodeSchema), updateEpisode);
router.post("/migrate-all", migrateAllContent);
router.delete("/:id/seasons/:seasonNumber/episodes/:episodeNumber", deleteEpisode);
router.delete("/:id", deleteContent);
export default router;
