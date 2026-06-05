import express from "express";
import { importSeries, importMovie, addEpisodesFromLinks } from "../controllers/tmdbController.js";

const router = express.Router();

router.post("/import/series", importSeries);
router.post("/import/movie", importMovie);
router.post("/episodes/:id", addEpisodesFromLinks);

export default router;
