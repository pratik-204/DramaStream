import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '@/lib/apiClient';
import DramaCard from '@/components/DramaCard.jsx';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '@/components/ui/sheet';

const COUNTRIES = ['South Korea', 'Japan', 'China', 'Thailand', 'India', 'USA', 'Taiwan', 'Philippines',"France"];
const GENRES = [
	'Romance', 'Thriller', 'Emotional', 'Revenge', 'Drama',
	'Comedy', 'Action', 'Mystery', 'Fantasy', 'Suspense', 'Historical' ,'Family', 'Sci-Fi', 'Horror', 'Crime', 'Adventure', 'Slice of Life',
	'Supernatural', 'War', 'Sports', 'Music', 'School', 'Medical', 'Legal', 'Political', 'Psychological',
	'Zombie', 'Vampire'
];

const SearchPage = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const initialQuery = searchParams.get('q') || '';

	const [query, setQuery] = useState(initialQuery);
	const [selectedType, setSelectedType] = useState('all');
	const [selectedCountries, setSelectedCountries] = useState([]);
	const [selectedGenres, setSelectedGenres] = useState([]);

	const [dramas, setDramas] = useState([]);
	const [loading, setLoading] = useState(true);
	const [totalItems, setTotalItems] = useState(0);

	const getTrendingScore = (item) => Number(item.viewsLast24h || item.views || 0);
	const isNewContent = (item) => {
		if (!item.createdAt) return false;
		const createdAt = new Date(item.createdAt).getTime();
		if (Number.isNaN(createdAt)) return false;
		const thirtyDays = 30 * 24 * 60 * 60 * 1000;
		return Date.now() - createdAt <= thirtyDays;
	};

	const fetchResults = async () => {
		setLoading(true);
		try {
			let url = query
				? `/content/search?q=${encodeURIComponent(query)}`
				: `/content?limit=1000`;

			const res = await apiClient.request(url);

			const items = res.items || [];

			const mapped = items.map(item => ({
				id: item.id,
				title: item.title,
				type: item.type,
				posterUrl: item.thumbnail,
				genres: item.genre || [],
				countries: item.countries || [],
				country: item.country || item.countries?.[0] || '',
				rating: item.rating,
				description: item.description,
				createdAt: item.createdAt,
				views: item.views,
				viewsLast24h: item.viewsLast24h,
			}));

			const hasTrendingViews = mapped.some(
				item =>
					Number(item.views || 0) > 0 ||
					Number(item.viewsLast24h || 0) > 0
			);

			const trendingIds = new Set(
				[...mapped]
					.sort((a, b) => {

						if (hasTrendingViews) {
							return (
								(Number(b.viewsLast24h || 0) * 2) +
								Number(b.views || 0) +
								(Number(b.rating || 0) * 10)
							) - (
								(Number(a.viewsLast24h || 0) * 2) +
								Number(a.views || 0) +
								(Number(a.rating || 0) * 10)
							);
						}

						return Number(b.rating || 0) - Number(a.rating || 0);
					})
					.slice(0, 20)
					.map((item) => item.id)
			);

			const newIds = new Set(
				[...mapped]
					.filter(item => item.createdAt)
					.sort(
						(a, b) =>
							new Date(b.createdAt || 0) -
							new Date(a.createdAt || 0)
					)
					.slice(0, 20)
					.map((item) => item.id)
			);

			const filtered = mapped.filter(item => {
				const matchesType =
					selectedType === 'all'
					|| (selectedType === 'anime' && item.type === 'anime')
					|| (selectedType === 'movies' && item.type === 'movie')
					|| (selectedType === 'series' && item.type === 'series')
					|| (selectedType === 'trending' && trendingIds.has(item.id))
					|| (selectedType === 'new' && newIds.has(item.id));
				const matchesCountry = selectedCountries.length === 0
					|| selectedCountries.some(selectedCountry => item.countries?.includes(selectedCountry));
				const matchesGenre = selectedGenres.length === 0
					|| selectedGenres.some(selectedGenre => item.genres?.includes(selectedGenre));
				return matchesType && matchesCountry && matchesGenre;
			});

			setDramas(filtered);
			setTotalItems(filtered.length);

		} catch (error) {
			console.error('Search error:', error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		const delay = setTimeout(() => {
			fetchResults();
			if (query) {
				setSearchParams({ q: query });
			} else {
				setSearchParams({});
			}
		}, 400);

		return () => clearTimeout(delay);
	}, [query, selectedType, selectedCountries, selectedGenres]);

	const toggleCountry = (country) => {
		setSelectedCountries(prev =>
			prev.includes(country)
				? prev.filter(c => c !== country)
				: [...prev, country]
		);
	};

	const toggleGenre = (genre) => {
		setSelectedGenres(prev =>
			prev.includes(genre)
				? prev.filter(g => g !== genre)
				: [genre]
		);
	};

	const clearFilters = () => {
		setSelectedType('all');
		setSelectedCountries([]);
		setSelectedGenres([]);
		setQuery('');
	};

	const FilterContent = () => (
		<div className="space-y-8">

			{/* TYPE */}
			<div>
				<h3 className="text-sm font-semibold uppercase mb-4">Content</h3>
				<div className="flex flex-wrap gap-2">
					{[
						{ label: 'All', value: 'all' },
						{ label: 'Anime', value: 'anime' },
						{ label: 'Movies', value: 'movies' },
						{ label: 'Series', value: 'series' },
						{ label: 'Trending', value: 'trending' },
						{ label: 'New', value: 'new' },
					].map((type) => (
						<button
							key={type.value}
							onClick={() => setSelectedType(type.value)}
							className={`px-3 py-1.5 rounded-full text-sm ${selectedType === type.value
								? 'bg-primary text-white'
								: 'bg-secondary'
								}`}
						>
							{type.label}
						</button>
					))}
				</div>
			</div>

			{/* COUNTRIES */}
			<div>
				<h3 className="text-sm font-semibold uppercase mb-4">Countries</h3>
				<div className="flex flex-wrap gap-2">
					{COUNTRIES.map(country => (
						<button
							key={country}
							onClick={() => toggleCountry(country)}
							className={`px-3 py-1.5 rounded-full text-sm ${selectedCountries.includes(country)
								? 'bg-primary text-white'
								: 'bg-secondary'
								}`}
						>
							{country}
						</button>
					))}
				</div>
			</div>

			{/* GENRES */}
			<div>
				<h3 className="text-sm font-semibold uppercase mb-4">Genres</h3>
				<div className="flex flex-wrap gap-2">
					{GENRES.map(genre => (
						<button
							key={genre}
							onClick={() => toggleGenre(genre)}
							className={`px-3 py-1.5 rounded-full text-sm ${selectedGenres.includes(genre)
								? 'bg-red-500 text-white'
								: 'bg-secondary'
								}`}
						>
							{genre}
						</button>
					))}
				</div>
			</div>

			{(query || selectedType !== 'all' || selectedCountries.length || selectedGenres.length) && (
				<Button onClick={clearFilters} className="w-full">
					<X className="mr-2 h-4 w-4" /> Clear Filters
				</Button>
			)}
		</div>
	);

	return (
		<div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
			<div className="mx-auto max-w-screen-2xl px-4 py-8">

				<div className="flex flex-col md:flex-row gap-6 xl:gap-10">

				{/* SIDEBAR */}
					<aside className="hidden md:block w-56 xl:w-60 space-y-6 shrink-0">

					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
						<Input
							placeholder="Search dramas..."
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							className="pl-9"
						/>
					</div>

					<FilterContent />

				</aside>

					{/* MAIN */}
					<main className="flex-1 min-w-0">

					{/* MOBILE */}
					<div className="md:hidden flex gap-2 mb-6">
						<Input
							placeholder="Search..."
							value={query}
							onChange={(e) => setQuery(e.target.value)}
						/>

						<Sheet>
							<SheetTrigger asChild>
								<Button size="icon">
									<SlidersHorizontal />
								</Button>
							</SheetTrigger>

							<SheetContent>
								<SheetHeader>
									<SheetTitle>Filters</SheetTitle>
								</SheetHeader>
								<FilterContent />
							</SheetContent>
						</Sheet>
					</div>

					{/* HEADER */}
					<div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
						<div>
							<p className="text-xs uppercase tracking-[0.35em] text-red-400/80 mb-2">Search</p>
							<h1 className="text-3xl md:text-4xl font-black tracking-tight">
								{query ? `Results for "${query}"` : 'Browse Dramas'}
							</h1>
						</div>
						<span className="text-sm text-zinc-400">
							{loading ? 'Searching...' : `${totalItems} titles`}
						</span>
					</div>

					{/* RESULTS */}
					{loading ? (
						<div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory">
							{[...Array(10)].map((_, i) => (
								<div key={i} className="min-w-[180px] md:min-w-[220px] snap-start">
									<Skeleton className="aspect-[2/3] rounded-xl bg-white/10" />
								</div>
							))}
						</div>
					) : dramas.length > 0 ? (
						<div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-6">
			
							{dramas.map((drama) => (
								<div key={drama.id} className="min-w-0">
									<DramaCard drama={drama} />
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-20 text-zinc-400 border border-dashed border-white/10 rounded-2xl bg-white/5">
							No dramas found
						</div>
					)}

					</main>
				</div>
			</div>
		</div>
	);
};

export default SearchPage;