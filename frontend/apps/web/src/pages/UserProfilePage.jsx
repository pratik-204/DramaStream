import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2, Play } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/lib/apiClient';

const UserProfilePage = () => {
	const { currentUser } = useAuth();
	const [watchlist, setWatchlist] = useState([]);
	const [history, setHistory] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchUserData = async () => {
			if (!currentUser) return;

			try {
				const [watchlistRes, historyRes] = await Promise.all([
					apiClient.getWatchlist(),
					apiClient.getWatchHistory()
				]);

				setWatchlist(watchlistRes.items || []);
				setHistory(historyRes.items || []);
			} catch (error) {
				console.error('Error fetching user data:', error);
				toast.error('Failed to load profile data');
			} finally {
				setLoading(false);
			}
		};

		fetchUserData();
	}, [currentUser]);

	const removeFromWatchlist = async (dramaId) => {
		try {
			await apiClient.removeWatchlistItem(dramaId);
			setWatchlist(watchlist.filter(item => (item.drama?.id || item.dramaId) !== dramaId));
			toast.success('Removed from watchlist');
		} catch (error) {
			toast.error('Failed to remove item');
		}
	};

	if (!currentUser) return null;

	return (
		<div className="container mx-auto px-4 py-8 max-w-5xl">
			<div className="flex items-center gap-6 mb-10">
				<div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold">
					{currentUser.username ? currentUser.username.charAt(0).toUpperCase() : currentUser.email.charAt(0).toUpperCase()}
				</div>
				<div>
					<h1 className="text-3xl font-bold">{currentUser.username || 'User'}</h1>
					<p className="text-muted-foreground">{currentUser.email}</p>
				</div>
			</div>

			<Tabs defaultValue="history" className="w-full">
				<TabsList className="mb-6">
					<TabsTrigger value="history">Watch History</TabsTrigger>
					<TabsTrigger value="watchlist">My Watchlist</TabsTrigger>
				</TabsList>

				<TabsContent value="history" className="space-y-4">
					{loading ? (
						<div className="space-y-4">
							{[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
						</div>
					) : history.length > 0 ? (
						<div className="grid gap-4">
							{history.map((item) => {
								const drama = item.drama || item.dramaId;
								const posterUrl = drama?.posterUrl || drama?.thumbnail;
								if (!drama) return null;

								return (
									<Card key={item.id} className="overflow-hidden">
										<div className="flex flex-col sm:flex-row">
											<div className="w-full sm:w-48 h-32 shrink-0 bg-muted">
												{posterUrl && (
													<img src={posterUrl} alt={drama.title} className="w-full h-full object-cover" />
												)}
											</div>
											<div className="p-4 flex-1 flex flex-col justify-between">
												<div>
													<h3 className="font-semibold text-lg line-clamp-1">{drama.title}</h3>
													<p className="text-sm text-muted-foreground">
														Episode {item.episodeNumber}{item.episodeTitle ? `: ${item.episodeTitle}` : ''}
													</p>
													{item.completed && (
														<span className="inline-block mt-2 text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded">
															Completed
														</span>
													)}
												</div>
												<div className="mt-4 sm:mt-0 flex justify-end">
													<Button size="sm" asChild>
														<Link to={`/watch/${drama.id}?ep=${item.episodeNumber || 1}&season=1`}>
															<Play className="w-4 h-4 mr-2" /> Resume
														</Link>
													</Button>
												</div>
											</div>
										</div>
									</Card>
								);
							})}
						</div>
					) : (
						<div className="text-center py-12 border rounded-xl bg-card/50">
							<p className="text-muted-foreground">No watch history yet.</p>
						</div>
					)}
				</TabsContent>

				<TabsContent value="watchlist" className="space-y-4">
					{loading ? (
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							{[1, 2, 3, 4].map(i => <Skeleton key={i} className="aspect-[2/3] rounded-xl" />)}
						</div>
					) : watchlist.length > 0 ? (
						<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
							{watchlist.map((item) => {
								const drama = item.drama || item.dramaId;
								const posterUrl = drama?.posterUrl || drama?.thumbnail;
								if (!drama) return null;

								return (
									<div key={item.id} className="group relative">
										<Link to={`/drama/${drama.id}`}>
											<div className="aspect-[2/3] rounded-xl overflow-hidden bg-muted mb-2">
												{posterUrl && (
													<img src={posterUrl} alt={drama.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
												)}
											</div>
											<h3 className="font-medium line-clamp-1">{drama.title}</h3>
										</Link>
										<Button
											variant="destructive"
											size="icon"
											className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
											onClick={(e) => {
												e.preventDefault();
													removeFromWatchlist(drama.id);
											}}
										>
											<Trash2 className="w-4 h-4" />
										</Button>
									</div>
								);
							})}
						</div>
					) : (
						<div className="text-center py-12 border rounded-xl bg-card/50">
							<p className="text-muted-foreground">Your watchlist is empty.</p>
							<Button variant="link" asChild className="mt-2">
								<Link to="/">Discover Dramas</Link>
							</Button>
						</div>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
};

export default UserProfilePage;
