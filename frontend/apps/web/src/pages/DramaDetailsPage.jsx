import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Play, Plus, Check, Star, Calendar, Globe, Layers } from 'lucide-react';
import { toast } from 'sonner';
import DramaCard from '@/components/DramaCard.jsx';
import HorizontalScroll from '@/components/HorizontalScroll.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';

const getPrimaryCountry = (item = {}) => item.country || item.countries?.[0] || 'Unknown';

const getYouTubeEmbedUrl = (url) => {
	if (!url) return '';

	try {
		const parsed = new URL(url);

		if (parsed.hostname.includes('youtube.com')) {
			const videoId = parsed.searchParams.get('v');
			return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
		}

		if (parsed.hostname.includes('youtu.be')) {
			const videoId = parsed.pathname.replace('/', '');
			return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
		}

		return '';
	} catch {
		return '';
	}
};

const sortEpisodes = (episodes = []) => {
	return [...episodes].sort(
		(a, b) => Number(a?.episodeNumber || 0) - Number(b?.episodeNumber || 0)
	);
};

const DramaDetailsPage = () => {
	const { id } = useParams();
	const { isAuthenticated, currentUser } = useAuth() || {};

	const [drama, setDrama] = useState(null);
	const [relatedDramas, setRelatedDramas] = useState([]);
	const [episodes, setEpisodes] = useState([]);
	const [selectedSeason, setSelectedSeason] = useState(1);
	const [loading, setLoading] = useState(true);
	const [watchlistRecord, setWatchlistRecord] = useState(null);
	const [watchlistLoading, setWatchlistLoading] = useState(false);
	const [showAllEpisodes, setShowAllEpisodes] = useState(false);

	const firstEpisodeNumber = episodes.length > 0 ? Number(episodes[0]?.episodeNumber) || 1 : 1;
	const watchNowHref = `/watch/${id}?season=${selectedSeason}&ep=${firstEpisodeNumber}`;
	const visibleEpisodes = showAllEpisodes ? episodes : episodes.slice(0, 9);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			setDrama(null);
			setEpisodes([]);
			setRelatedDramas([]);
			setWatchlistRecord(null);
			setSelectedSeason(1);
			try {
				const res = await apiClient.request(`/content/${id}`);
				const item = res.item;

				const mappedDrama = {
					id: item.id,
					title: item.title,
					posterUrl: item.thumbnail,
					genres: item.genre?.length ? item.genre : ['Drama'],
					rating: item.rating,
					description: item.description,
					year: item.releaseYear,
					country: getPrimaryCountry(item),
					numberOfSeasons: item.seasons?.length || 1,
					seasons: item.seasons || [],
					trailerUrl: item.trailerUrl || '',
					isTrending: true,
					isPopular: true,
				};

				const seasons = (item.seasons || []).slice().sort((a, b) => Number(a?.seasonNumber || 0) - Number(b?.seasonNumber || 0));
				const currentSeason =
					seasons.find((s) => s.seasonNumber === selectedSeason) || seasons[0];
				setEpisodes(sortEpisodes(currentSeason?.episodes || []));
				setDrama(mappedDrama);


				if (isAuthenticated && currentUser) {
					try {
						const watchlistRes = await apiClient.getWatchlistItem(id);
						setWatchlistRecord(watchlistRes.item);
					} catch (watchlistError) {
						if (watchlistError?.message !== 'Watchlist item not found') {
							console.error(watchlistError);
						} else {
							setWatchlistRecord(null);
						}
					}
				}

				const similarRes = await apiClient.request(`/content/similar/${id}`);

				const related = (similarRes.items || []).map((entry) => ({
					id: entry.id,
					title: entry.title,
					posterUrl: entry.thumbnail,
					genres: entry.genre || [],
					rating: entry.rating,
				}));

				setRelatedDramas(related);
			} catch (err) {
				console.error(err);
				toast.error('Failed to load drama');
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [id, isAuthenticated, currentUser]);

	useEffect(() => {
		const seasons = (drama?.seasons || []).slice().sort((a, b) => Number(a?.seasonNumber || 0) - Number(b?.seasonNumber || 0));
		const currentSeason = seasons.find((s) => s.seasonNumber === selectedSeason) || seasons[0];
		setEpisodes(sortEpisodes(currentSeason?.episodes || []));
		setShowAllEpisodes(false);
	}, [selectedSeason, drama]);

	const toggleWatchlist = async () => {
		if (!isAuthenticated) {
			toast.error('Please login to add to watchlist');
			return;
		}

		setWatchlistLoading(true);
		try {
			if (watchlistRecord) {
				await apiClient.removeWatchlistItem(id);
				setWatchlistRecord(null);
				toast.success('Removed from watchlist');
			} else {
				const response = await apiClient.addWatchlistItem(id);
				setWatchlistRecord(response.item);
				toast.success('Added to watchlist');
			}
		} catch (error) {
			console.error(error);
			toast.error('Failed to update watchlist');
		} finally {
			setWatchlistLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="container mx-auto px-4 py-12">
				<Skeleton className="w-full h-[70vh]" />
			</div>
		);
	}

	if (!drama) {
		return (
			<div className="text-center py-20">
				<h2 className="text-2xl">Drama not found</h2>
			</div>
		);
	}

	const youtubeEmbedUrl = getYouTubeEmbedUrl(drama?.trailerUrl);

	return (
		<div className="min-h-screen pb-20 bg-background text-white">
			<div className="absolute top-0 left-0 w-full h-[70vh] opacity-10">
				<img
					src={drama.posterUrl}
					alt=""
					className="w-full h-full object-cover blur-3xl scale-110"
				/>
			</div>

			<div className="container mx-auto px-4 pt-20 relative z-10">
				<div className="flex flex-col md:flex-row gap-10">
					<img
						src={drama.posterUrl || 'https://via.placeholder.com/300x450'}
						alt={drama.title}
						className="w-48 md:w-60 rounded-xl shadow-xl mx-auto md:mx-0"
					/>

					<div className="space-y-6">
						<div className="flex gap-2">
							{drama.isTrending && <span className="bg-red-500 px-2 py-1 text-xs rounded">TRENDING</span>}
							{drama.isPopular && <span className="bg-blue-500 px-2 py-1 text-xs rounded">POPULAR</span>}
						</div>

						<h1 className="text-3xl md:text-5xl font-bold">{drama.title}</h1>

						<div className="flex gap-4 text-gray-300 items-center flex-wrap">
							<span className="flex items-center gap-1">
								<Star size={16} /> {drama.rating}
							</span>
							<span className="flex items-center gap-1">
								<Calendar size={16} /> {drama.year}
							</span>
							<span className="flex items-center gap-1">
								<Globe size={16} /> {drama.country}
							</span>
							<span className="flex items-center gap-1">
								<Layers size={16} /> {drama.numberOfSeasons} Season
							</span>
						</div>

						<div className="flex gap-2 flex-wrap">
							{drama.genres.map((genre) => (
								<span key={genre} className="bg-gray-700 px-3 py-1 rounded text-sm">
									{genre}
								</span>
							))}
						</div>

						<div className="flex gap-4 flex-wrap">
							<Button asChild className="bg-red-500 hover:bg-red-600">
								<Link to={watchNowHref}>
									<Play className="mr-2" /> Watch Now
								</Link>
							</Button>
							<Button
								variant={watchlistRecord ? 'secondary' : 'outline'}
								className={watchlistRecord ? 'bg-white/10 hover:bg-white/20 border-transparent' : 'hover:bg-white/5'}
								onClick={toggleWatchlist}
								disabled={watchlistLoading}
							>
								{watchlistRecord ? (
									<><Check className="mr-2" /> In Watchlist</>
								) : (
									<><Plus className="mr-2" /> Add to Watchlist</>
								)}
							</Button>
						</div>

						<div>
							<p className="text-foreground/80 text-lg leading-relaxed">
								{drama.description}
							</p>
						</div>
					</div>
				</div>

				{drama.trailerUrl ? (
					<div className="mt-6 w-[600px] max-w-full aspect-video mx-auto rounded-xl overflow-hidden bg-muted border border-white/10 shadow-2xl">
						{youtubeEmbedUrl ? (
							<iframe
								src={youtubeEmbedUrl}
								title={`${drama.title} trailer`}
								className="w-full h-full"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
								allowFullScreen
							/>
						) : (
							<video src={drama.trailerUrl} controls className="w-full h-full" />
						)}
					</div>
				) : (
					<div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-muted/40 border border-white/10 px-3 py-1.5 text-sm text-gray-400">
						<Play className="w-4 h-4" />
						Trailer not available
					</div>
				)}

				<div className="mt-16">
					<h2 className="text-2xl mb-4">Episodes</h2>
					{(drama?.seasons?.length || 0) > 1 && (
						<div className="mb-6">
							<div
								className="
									flex
									gap-3
									overflow-x-auto
									scrollbar-hide
									pb-2
									md:flex-wrap
									md:overflow-visible
								"
							>
								{drama.seasons.map((s) => (
									<button
										key={s.seasonNumber}
										onClick={() => setSelectedSeason(s.seasonNumber)}
										className={`
											min-w-[110px]
											flex-shrink-0
											px-4
											py-2
											rounded-xl
											font-medium
											transition-all
											duration-200
											border
											${selectedSeason === s.seasonNumber
												? "bg-red-500 border-red-500 text-white"
												: "bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-200"
											}
										`}
									>
										Season {s.seasonNumber}
									</button>
								))}
							</div>
						</div>
					)}
					{episodes.length === 0 ? (
						<div className="p-6 border border-dashed text-center text-gray-400 rounded-xl">
							No episodes available
						</div>
					) : (
						<ul className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 transition-all duration-500">
							{visibleEpisodes.map((ep, idx) => (
								<li
									key={ep.id || ep.url || idx}
									className="
										flex
										items-center
										gap-3
										p-3
										bg-[#111]
										rounded-xl
										border
										border-white/10
										hover:bg-[#1a1a1a]
										transition-all
										duration-200
									"
								>
									<img
										src={ep.thumbnail || drama.posterUrl}
										alt=""
										className="
											w-20
											h-12
											object-cover
											rounded-md
											flex-shrink-0
										"
									/>

									<div className="flex-1 min-w-0">
										<div className="text-sm font-semibold truncate">
											Episode {ep.episodeNumber || idx + 1}
											{ep.title ? ` - ${ep.title}` : ''}
										</div>

										<div className="text-xs text-gray-400">
											{ep.duration || ''}
										</div>
									</div>

									<Link
										to={`/watch/${id}?season=${selectedSeason}&ep=${ep.episodeNumber || idx + 1}`}
										className="
											text-xs
											bg-red-500
											hover:bg-red-600
											px-3
											py-1.5
											rounded-md
											flex-shrink-0
											transition-colors
										"
									>
										Watch
									</Link>
								</li>
							))}
							{episodes.length > 9 && (
								<div className="col-span-full mt-10 w-full">
									<button
										onClick={() => setShowAllEpisodes(!showAllEpisodes)}
										className="
											group
											w-full
											flex
											items-center
											justify-center
											text-white/80
											hover:text-white
											transition-all
											duration-300
										"
									>
										<div className="flex-1 h-px bg-white/10 group-hover:bg-white/20 transition-all duration-300"></div>

										<div
											className="
												px-8
												py-2
												text-sm
												font-bold
												italic
												tracking-wide
												text-center
												transition-all
												duration-300
												group-hover:scale-105
												whitespace-nowrap
											"
										>
											{showAllEpisodes ? "Less Episodes" : "More Episodes"}
										</div>

										<div className="flex-1 h-px bg-white/10 group-hover:bg-white/20 transition-all duration-300"></div>
									</button>
								</div>
							)}
						</ul>
					)}
				</div>

				{relatedDramas.length > 0 && (
					<div className="mt-16">
						<HorizontalScroll title="More Like This">
							{relatedDramas.map((related) => (
								<DramaCard key={related.id} drama={related} layout="home" />
							))}
						</HorizontalScroll>
					</div>
				)}
			</div>
		</div>
	);
};

export default DramaDetailsPage;
