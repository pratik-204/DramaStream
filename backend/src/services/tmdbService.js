import axios from "axios";

const BASE_URL = "https://api.themoviedb.org/3";
const REQUEST_TIMEOUT_MS = 15000;
const MAX_RETRIES = 2;
const DEFAULT_MOVIE_PAGES = 5;
const DEFAULT_SERIES_PAGES = 3;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getRequestConfig = () => {
    const apiKey = process.env.TMDB_API_KEY;

    if (!apiKey) {
        throw new Error("TMDB_API_KEY is not configured");
    }

    return { params: { api_key: apiKey } };
};

const getPageCount = (envName, defaultValue) => {
    const parsed = Number.parseInt(process.env[envName] || "", 10);

    if (Number.isFinite(parsed) && parsed > 0) {
        return parsed;
    }

    return defaultValue;
};

const shouldRetry = (error) => {
    const status = error?.response?.status;
    const code = error?.code;

    return (
        status === 429 ||
        (typeof status === "number" && status >= 500) ||
        code === "ECONNRESET" ||
        code === "ETIMEDOUT" ||
        code === "ECONNABORTED"
    );
};

const tmdbGet = async (path, params = {}, options = {}) => {
    const { tolerateFailure = false } = options;
    let lastError;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            const baseConfig = getRequestConfig();
            return await axios.get(`${BASE_URL}${path}`, {
                ...baseConfig,
                timeout: REQUEST_TIMEOUT_MS,
                params: {
                    ...baseConfig.params,
                    ...params
                }
            });
        } catch (error) {
            lastError = error;

            if (attempt < MAX_RETRIES && shouldRetry(error)) {
                await wait((attempt + 1) * 500);
                continue;
            }

            if (tolerateFailure) {
                return null;
            }

            throw error;
        }
    }

    if (tolerateFailure) {
        return null;
    }

    throw lastError;
};

export const fetchPopularMovies = async () => {
    const totalPages = getPageCount("TMDB_MOVIE_PAGES", DEFAULT_MOVIE_PAGES);

    const requests = Array.from({ length: totalPages }, (_, i) =>
        tmdbGet("/movie/popular", { page: i + 1 }, { tolerateFailure: true })
    );

    const responses = await Promise.all(requests);

    return responses.flatMap((res) =>
        Array.isArray(res?.data?.results) ? res.data.results : []
    );
};

export const fetchPopularSeries = async () => {
    const totalPages = getPageCount("TMDB_SERIES_PAGES", DEFAULT_SERIES_PAGES);
    const allSeries = [];

    for (let page = 1; page <= totalPages; page++) {
        const res = await tmdbGet("/tv/popular", { page }, { tolerateFailure: true });
        const series = Array.isArray(res?.data?.results) ? res.data.results : [];
        allSeries.push(...series);
    }

    return allSeries;
};

export const fetchTrailerUrl = async (type, tmdbId) => {
    const mediaPath = type === "series" ? "tv" : "movie";
    const res = await tmdbGet(`/${mediaPath}/${tmdbId}/videos`, {}, { tolerateFailure: true });
    const videos = Array.isArray(res?.data?.results) ? res.data.results : [];

    const preferred =
        videos.find((v) => v.site === "YouTube" && v.type === "Trailer" && v.official) ||
        videos.find((v) => v.site === "YouTube" && v.type === "Trailer") ||
        videos.find((v) => v.site === "YouTube");

    if (!preferred?.key) {
        return "";
    }

    return `https://www.youtube.com/watch?v=${preferred.key}`;
};