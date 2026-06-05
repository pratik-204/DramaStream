import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import apiClient from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, CheckCircle, ChevronLeft, ChevronRight, ListVideo } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext.jsx';

const buildEmbedUrl = (url) => {
	if (!url) return null;
	try {
		const parsed = new URL(url);
		if (parsed.hostname.includes('youtube.com') || parsed.hostname.includes('youtu.be')) {
			const videoId = parsed.searchParams.get('v') || parsed.pathname.replace('/', '');
			return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
		}
		return url;
	} catch {
		return url;
	}
};

const VideoPlayerPage = () => {
	const { id } = useParams();
	const location = useLocation();
	const query = new URLSearchParams(location.search);
	const navigate = useNavigate();
	const { isAuthenticated, currentUser } = useAuth() || {};
	const seasonNumber = Number(query.get('season')) || 1;

	const [content, setContent] = useState(null);
	const [loading, setLoading] = useState(true);
	const [episode, setEpisode] = useState(null);
	const [episodes, setEpisodes] = useState([]);
	const [historyRecord, setHistoryRecord] = useState(null);
	const [servers, setServers] = useState([]);
	const [selectedServer, setSelectedServer] = useState(null);

	const selectEpisode = (episodeNumber, seasonNum = seasonNumber) => {
		navigate(`/watch/${id}?season=${seasonNum}&ep=${episodeNumber}`);
	};

	useEffect(() => {
		const fetchContent = async () => {
			try {
				const res = await apiClient.request(`/content/${id}`);
				const itm = res.item;
				setContent(itm);

				const seasons = (itm.seasons || []).slice().sort((a, b) => Number(a?.seasonNumber || 0) - Number(b?.seasonNumber || 0));
				const currentSeason =
					seasons.find((s) => s.seasonNumber === seasonNumber) || seasons[0];
				const eps = [...(currentSeason?.episodes || [])].sort(
					(a, b) => Number(a?.episodeNumber || 0) - Number(b?.episodeNumber || 0)
				);
				setEpisodes(eps);

				const epNum = Number(query.get('ep')) || null;
				let chosen = null;
				if (epNum) chosen = eps.find((e) => Number(e.episodeNumber) === epNum) || null;
				if (!chosen && eps.length) chosen = eps[0];

				if (chosen) {
					const epServers = chosen.servers?.length
						? chosen.servers
						: [{ name: 'Default', url: chosen.videoUrl }];

					setServers(epServers);
					setSelectedServer(epServers[0] || null);

					const normalized = {
						episodeNumber: Number(chosen.episodeNumber || chosen.ep || 1),
						title: chosen.title || '',
						duration: chosen.duration || '',
						description: chosen.description || '',
						embeddedPlayerUrl: buildEmbedUrl(epServers[0]?.url),
					};
					setEpisode(normalized);

					if (isAuthenticated && currentUser) {
						const episodeId = `${id}:${normalized.episodeNumber}`;
						try {
							const historyResponse = await apiClient.saveWatchHistoryItem({
								dramaId: id,
								episodeId,
								episodeNumber: normalized.episodeNumber,
								episodeTitle: normalized.title,
							});
							setHistoryRecord(historyResponse.item);
						} catch (historyError) {
							console.error('Failed to save watch history', historyError);
						}
					}
				}
			} catch (err) {
				console.error('Failed to load episode', err);
				toast.error('Failed to fetch content');
			} finally {
				setLoading(false);
			}
		};

		fetchContent();
	}, [id, isAuthenticated, currentUser, location.search]);

	const markCompleted = async () => {
		if (!historyRecord) return;
		try {
			const response = await apiClient.markWatchHistoryCompleted(historyRecord.episodeId);
			setHistoryRecord(response.item);
			toast.success('Marked as completed');
		} catch (error) {
			console.error(error);
			toast.error('Failed to update status');
		}
	};

	if (loading) {
		return (
			<div className="container mx-auto px-4 py-8 space-y-4">
				<Skeleton className="w-full aspect-video rounded-xl" />
				<Skeleton className="h-8 w-1/3" />
				<Skeleton className="h-4 w-2/3" />
			</div>
		);
	}

	if (!episode) {
		return (
			<div className="container mx-auto px-4 py-20 text-center">
				<h2 className="text-2xl font-bold">Episode not found</h2>
				<Button onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-black">
			<div className="container mx-auto px-4 py-4">
				<Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 text-white hover:bg-white/10">
					<ArrowLeft className="w-4 h-4 mr-2" /> Back
				</Button>

				<div className="grid gap-6 lg:grid-cols-[1fr_320px]">
					<div>
						{servers.length > 1 && (
							<div className="flex gap-2 mb-3">
								{servers.map((srv, idx) => (
									<button
										key={idx}
										onClick={() => {
											setSelectedServer(srv);
											setEpisode((prev) => ({
												...prev,
												embeddedPlayerUrl: buildEmbedUrl(srv.url),
											}));
										}}
										className={`px-3 py-1 rounded ${
											selectedServer?.url === srv.url
												? 'bg-red-500'
												: 'bg-zinc-700'
										}`}
									>
										{srv.name}
									</button>
								))}
							</div>
						)}

						<div className="aspect-video w-full bg-zinc-900 rounded-xl overflow-hidden shadow-2xl mb-4">
								{selectedServer ? (
								
								<iframe
										src={selectedServer ? buildEmbedUrl(selectedServer.url) : null}
									className="w-full h-full border-0"
									allowFullScreen
									allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
								/>
							) : (
								<div className="w-full h-full flex items-center justify-center text-zinc-500">No video source available</div>
							)}
						</div>

						<div className="flex items-center justify-between gap-3 text-white mb-6">
							<Button
								variant="outline"
								onClick={() => {
									const currentIndex = episodes.findIndex((ep) => Number(ep.episodeNumber) === Number(episode.episodeNumber));
									if (currentIndex > 0) {
										selectEpisode(Number(episodes[currentIndex - 1].episodeNumber) || currentIndex, seasonNumber);
									}
								}}
								disabled={episodes.findIndex((ep) => Number(ep.episodeNumber) === Number(episode.episodeNumber)) <= 0}
								className="gap-2"
							>
								<ChevronLeft className="w-4 h-4" /> Previous
							</Button>

							<div className="text-sm text-zinc-400 flex items-center gap-2">
								<ListVideo className="w-4 h-4" />
								{episodes.length} episode{episodes.length === 1 ? '' : 's'} available
							</div>

							<Button
								variant="outline"
								onClick={() => {
									const currentIndex = episodes.findIndex((ep) => Number(ep.episodeNumber) === Number(episode.episodeNumber));
									if (currentIndex >= 0 && currentIndex < episodes.length - 1) {
										selectEpisode(Number(episodes[currentIndex + 1].episodeNumber) || currentIndex + 2, seasonNumber);
									}
								}}
								disabled={episodes.findIndex((ep) => Number(ep.episodeNumber) === Number(episode.episodeNumber)) >= episodes.length - 1}
								className="gap-2"
							>
								Next <ChevronRight className="w-4 h-4" />
							</Button>
						</div>
					</div>

					<aside className="lg:sticky lg:top-6 self-start">
						<div className="rounded-xl border border-white/10 bg-zinc-950/90 p-4">
							<div className="flex items-center justify-between mb-4">
								<h2 className="text-lg font-semibold text-white">Episodes</h2>
								<span className="text-xs text-zinc-400">{episodes.length}</span>
							</div>

							{episodes.length === 0 ? (
								<div className="text-sm text-zinc-400 rounded-lg border border-dashed border-white/10 p-4 text-center">
									No additional episodes available
								</div>
							) : (
								<div className="max-h-[70vh] overflow-auto space-y-2 pr-1">
									{episodes.map((ep) => {
										const epNumber = Number(ep.episodeNumber || 1);
										const active = epNumber === Number(episode.episodeNumber);
										return (
											<button
												key={ep.id || ep.url || epNumber}
												onClick={() => selectEpisode(epNumber)}
												className={`w-full text-left rounded-lg border px-3 py-3 transition-colors ${active ? 'border-red-500 bg-red-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
											>
												<div className="flex items-center justify-between gap-3">
													<div>
														<div className="text-sm font-semibold text-white">Episode {epNumber}</div>
														{ep.title && <div className="text-xs text-zinc-400 line-clamp-1">{ep.title}</div>}
													</div>
													{ep.duration && <span className="text-[11px] text-zinc-400">{ep.duration} mins</span>}
												</div>
											</button>
										);
									})}
								</div>
							)}
						</div>
					</aside>
				</div>

				<div className="max-w-4xl mx-auto text-white space-y-4">
					<div className="flex items-start justify-between gap-4">
						<div>
							<h1 className="text-2xl md:text-3xl font-bold">Episode {episode.episodeNumber}: {episode.title}</h1>
							{episode.duration && <p className="text-zinc-400 mt-1">{episode.duration} mins</p>}
						</div>
						{isAuthenticated && (
							<Button
								variant={historyRecord?.completed ? "secondary" : "outline"}
								onClick={markCompleted}
								disabled={historyRecord?.completed}
								className="shrink-0"
							>
								<CheckCircle className="w-4 h-4 mr-2" />
								{historyRecord?.completed ? 'Completed' : 'Mark Completed'}
							</Button>
						)}
					</div>

					{episode.description && <p className="text-zinc-300 leading-relaxed">{episode.description}</p>}
				</div>

				{content?.episodes?.length > 1 && (
					<div className="mt-10 border-t border-white/10 pt-6">
						<div className="flex items-end justify-between gap-4 mb-4">
							<div>
								<h2 className="text-xl font-semibold text-white">More Episodes</h2>
								<p className="text-sm text-zinc-400">Switch between episodes without leaving the player.</p>
							</div>
							<div className="text-xs text-zinc-500 uppercase tracking-wider">
								{episodes.length} total
							</div>
						</div>

						<div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
							{episodes.map((ep) => {
								const epNumber = Number(ep.episodeNumber || 1);
								const active = epNumber === Number(episode.episodeNumber);
								return (
									<button
										key={ep.id || ep.url || epNumber}
										onClick={() => selectEpisode(epNumber)}
										className={`min-w-[240px] snap-start rounded-2xl border p-4 text-left transition-all ${active ? 'border-red-500 bg-red-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
									>
										<div className="aspect-video rounded-xl overflow-hidden bg-zinc-900 mb-3 border border-white/5">
											{ep.thumbnail ? (
												<img src={ep.thumbnail} alt={ep.title || `Episode ${epNumber}`} className="w-full h-full object-cover" />
											) : (
												<div className="w-full h-full flex items-center justify-center text-zinc-500 text-sm">Episode {epNumber}</div>
											)}
										</div>
										<div className="flex items-start justify-between gap-3">
											<div>
												<div className="text-xs text-zinc-400">Episode {epNumber}</div>
												<div className="text-sm font-semibold text-white line-clamp-1">{ep.title || `Episode ${epNumber}`}</div>
											</div>
											{ep.duration && <span className="text-[11px] text-zinc-400 shrink-0">{ep.duration}m</span>}
										</div>
									</button>
								);
							})}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default VideoPlayerPage;
