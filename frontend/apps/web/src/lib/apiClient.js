// Debug: print Vite API URL (will be `undefined` if not exposed to Vite)
// eslint-disable-next-line no-console
console.log(import.meta.env.VITE_API_URL);

const apiClient = {
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
    token: localStorage.getItem('authToken'),

    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('authToken', token);
        } else {
            localStorage.removeItem('authToken');
        }
    },

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };
        if (this.token) {
            headers.Authorization = `Bearer ${this.token}`;
        }
        return headers;
    },

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const response = await fetch(url, {
            ...options,
            headers: {
                ...this.getHeaders(),
                ...options.headers,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw error;
        }

        return response.json();
    },

    async signup(email, password, username) {
        const data = await this.request('/auth/signup', {
            method: 'POST',
            body: JSON.stringify({ email, password, username }),
        });
        if (data.token) {
            this.setToken(data.token);
        }
        return data;
    },

    async login(email, password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        if (data.token) {
            this.setToken(data.token);
        }
        return data;
    },

    async logout() {
        this.setToken(null);
        return this.request('/auth/logout', {
            method: 'POST',
        });
    },

    async getCurrentUser() {
        return this.request('/auth/me', {
            method: 'GET',
        });
    },

    // Content/TMDB API methods
    async getTrendingShows() {
        return this.request('/content/trending', {
            method: 'GET',
        });
    },

    async getPopularShows(page = 1) {
        return this.request(`/content/popular?page=${page}`, {
            method: 'GET',
        });
    },

    async getTopRatedShows(page = 1) {
        return this.request(`/content/top-rated?page=${page}`, {
            method: 'GET',
        });
    },

    async getShowDetails(showId) {
        return this.request(`/content/${showId}`, {
            method: 'GET',
        });
    },

    async searchShows(query, page = 1) {
        return this.request(`/content/search?query=${encodeURIComponent(query)}&page=${page}`, {
            method: 'GET',
        });
    },

    async getShowRecommendations(showId, page = 1) {
        return this.request(`/content/${showId}/recommendations?page=${page}`, {
            method: 'GET',
        });
    },

    async getWatchlistItem(dramaId) {
        return this.request(`/library/me/watchlist/${dramaId}`, {
            method: 'GET',
        });
    },

    async getWatchlist() {
        return this.request('/library/me/watchlist', {
            method: 'GET',
        });
    },

    async addWatchlistItem(dramaId) {
        return this.request('/library/me/watchlist', {
            method: 'POST',
            body: JSON.stringify({ dramaId }),
        });
    },

    async removeWatchlistItem(dramaId) {
        return this.request(`/library/me/watchlist/${dramaId}`, {
            method: 'DELETE',
        });
    },

    async saveWatchHistoryItem(payload) {
        return this.request('/library/me/watch-history', {
            method: 'PUT',
            body: JSON.stringify(payload),
        });
    },

    async getWatchHistoryItem(episodeId) {
        return this.request(`/library/me/watch-history/${episodeId}`, {
            method: 'GET',
        });
    },

    async getWatchHistory() {
        return this.request('/library/me/watch-history', {
            method: 'GET',
        });
    },

    async markWatchHistoryCompleted(episodeId) {
        return this.request(`/library/me/watch-history/${episodeId}/completed`, {
            method: 'PATCH',
        });
    },
};

export default apiClient;
