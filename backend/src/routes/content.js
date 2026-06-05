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
	deleteContent
} from "../controllers/contentController.js";
import { createContent, updateContent } from "../controllers/contentController.js";

const router = express.Router();

router.get("/featured", getFeaturedContent);
router.get("/trending", getTrendingContent);
router.get("/top10", getTop10ByType);
router.get("/search", searchContent);
router.get("/", getContentList);
router.patch("/:id/trailer", updateContentTrailer);
router.get("/similar/:id", getSimilarContent);
router.get("/:id", getContentById);
router.post("/", createContent);
router.put("/:id", updateContent);
router.patch("/:id/episodes", addEpisode);
router.patch("/:id/episode", updateEpisode);
router.post("/migrate-all", migrateAllContent);
router.delete("/:id/seasons/:seasonNumber/episodes/:episodeNumber", deleteEpisode);
router.delete("/:id", deleteContent);
export default router;
