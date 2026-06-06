import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Play, Info } from 'lucide-react';
import HorizontalScroll from '@/components/HorizontalScroll.jsx';
import DramaCard from '@/components/DramaCard.jsx';
import { Skeleton } from '@/components/ui/skeleton';

const getPrimaryCountry = (item = {}) => item.country || item.countries?.[0] || "Unknown";

const HomePage = () => {
	const [sections, setSections] = useState({
		hero: null,
		trending: [],
		popular: [],
		newThisWeek: [],
		bingeWorthy: [],
		awardWinners: [],
		hiddenGems: [],
		korean: [],
		turkish: [],
		indian: [],
		japanese: [],
		emotional: [],
		revenge: [],
		thriller: []
	});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const trendingRes = await apiClient.request("/content/trending");
				const res = await apiClient.request("/content");

				const items = (res.items || []).map(item => ({
					id: item.id,
					title: item.title,
					posterUrl: item.thumbnail,   // 🔥 FIX IMAGE
					genres: item.genre || [],
					rating: item.rating,
					views: item.views,
					viewsLast24h: item.viewsLast24h,
					description: item.description,
					year: item.releaseYear,
					createdAt: item.createdAt,
					country: getPrimaryCountry(item)
				}));

				setSections({
					hero: items[0],

					trending: (trendingRes.items || []).map(item => ({
						id: item.id,
						title: item.title,
						posterUrl: item.thumbnail,
						genres: item.genre || [],
						rating: item.rating,
						description: item.description,
						year: item.releaseYear,
						country: getPrimaryCountry(item)
					})),
					popular: [...items]
						.sort((a, b) => {

							const aViews =
								Number(a.views || 0) +
								Number(a.viewsLast24h || 0);

							const bViews =
								Number(b.views || 0) +
								Number(b.viewsLast24h || 0);

							// If platform has views/users
							if (aViews > 0 || bViews > 0) {

								const aScore =
									(Number(a.views || 0) * 2) +
									(Number(a.viewsLast24h || 0) * 3) +
									(Number(a.rating || 0) * 15);

								const bScore =
									(Number(b.views || 0) * 2) +
									(Number(b.viewsLast24h || 0) * 3) +
									(Number(b.rating || 0) * 15);

								return bScore - aScore;
							}

							// No users/views yet
							return Number(b.rating || 0) - Number(a.rating || 0);

						})
						.slice(0, 10),
					newThisWeek: [...items]
						.sort((a, b) =>
							new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
						)
						.slice(0, 10),

					korean: items.filter(i => i.country === "South Korea"),
					turkish: items.filter(i => i.country === "Turkey"),
					indian: items.filter(i => i.country === "India"),
					japanese: items.filter(i => i.country === "Japan"),

					emotional: items.filter(i => i.genres?.includes("Drama")),
					revenge: items.filter(i => i.genres?.includes("Action")),
					thriller: items.filter(i => i.genres?.includes("Thriller")),

					bingeWorthy: items.slice(5, 15),
					awardWinners: items.slice(15, 25),
					hiddenGems: items.slice(20, 30)
				});

			} catch (error) {
				console.error("Error:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);;

	const renderSection = (title, items, viewAllLink) => {
		if (!items || items.length === 0) return null;
		return (
			<HorizontalScroll title={title} viewAllLink={viewAllLink}>
				{items.map(drama => (
					<DramaCard key={drama.id} drama={drama} layout="home" />
				))}
			</HorizontalScroll>
		);
	};

	if (loading) {
		return (
			<div className="min-h-screen pb-20 space-y-12">
				<Skeleton className="w-full h-[70vh]" />
				<div className="container mx-auto px-4 space-y-8">
					<Skeleton className="h-8 w-48" />
					<div className="flex gap-4 overflow-hidden">
						{[...Array(5)].map((_, i) => (
							<Skeleton key={i} className="w-[200px] h-[300px] rounded-xl shrink-0" />
						))}
					</div>
				</div>
			</div>
		);
	}

	const { hero } = sections;

	return (
		<div className="min-h-screen pb-20 bg-background">
			{/* Hero Section */}
			{hero && (
				<section className="relative h-[68vh] min-h-[520px] w-full flex items-center overflow-hidden">
					<div className="absolute inset-0 z-0">
						<img
							src={hero.posterUrl || "https://images.unsplash.com/photo-1533129398111-a3673a9647a0?q=80&w=2070&auto=format&fit=crop"}
							alt={hero.title}
							className="w-full h-full object-cover object-top"
						/>
						<div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
						<div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
					</div>

					<div className="relative z-10 mt-20 pl-2 md:pl-4 lg:pl-6 xl:pl-8 pr-4 md:pr-8">
						<div className="max-w-2xl space-y-6">
							{hero.genres && hero.genres.length > 0 && (
								<div className="flex flex-wrap gap-2">
									{hero.genres.slice(0, 3).map(genre => (
										<span
											key={genre}
											className="px-2.5 py-1 rounded-md text-xs font-bold tracking-wider uppercase text-white"
											style={{ backgroundColor: `hsl(var(--genre-${genre.toLowerCase()}) / 0.8)` }}
										>
											{genre}
										</span>
									))}
								</div>
							)}

							<h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-balance drop-shadow-lg">
								{hero.title}
							</h1>

							<div className="flex items-center gap-4 text-sm font-medium text-gray-300">
								{hero.year && <span>{hero.year}</span>}
								{hero.rating && (
									<span className="flex items-center gap-1 text-primary">
										<Star className="w-4 h-4 fill-primary" /> {hero.rating}
									</span>
								)}
								{hero.numberOfSeasons && <span>{hero.numberOfSeasons} Seasons</span>}
								{hero.country && <span className="px-2 py-0.5 border border-gray-500 rounded text-xs">{hero.country}</span>}
							</div>

							<p className="text-lg text-gray-300 max-w-[60ch] line-clamp-3 drop-shadow-md leading-relaxed">
								{hero.description}
							</p>

							<div className="flex flex-wrap gap-4 pt-1 md:pt-3">
								<Button
									asChild
									className="
										gap-2
										text-sm
										md:text-base
										px-6
										md:px-8
										h-12
										md:h-14
										rounded-full
										shadow-lg
										shadow-primary/20
										hover:scale-105
										transition-transform
									"
								>
									<Link to={`/watch/${hero.id}`}>
										<Play className="w-5 h-5 fill-current" /> Play
									</Link>
								</Button>
								<Button
									variant="secondary"
									asChild
									className="
										gap-2
										text-sm
										md:text-base
										px-6
										md:px-8
										h-12
										md:h-14
										rounded-full
										bg-white/20
										hover:bg-white/30
										backdrop-blur-md
										border-none
										text-white
									"
								>
									<Link to={`/drama/${hero.id}`}>
										<Info className="w-5 h-5" /> More Info
									</Link>
								</Button>
							</div>
						</div>
					</div>
				</section>
			)}

			{/* Categories */}
			<div className="space-y-4 relative z-20 -mt-6">
				{renderSection("Trending Now", sections.trending)}
				{renderSection("Audience Favorites", sections.popular)}
				{renderSection("New This Week", sections.newThisWeek)}

				{/* Regional Sections */}
				<div className="py-4 bg-secondary/30">
					{renderSection("Korean Masterpieces", sections.korean, "/search?q=&country=South%20Korea")}
					{renderSection("Turkish Epics", sections.turkish, "/search?q=&country=Turkey")}
					{renderSection("Indian Blockbusters", sections.indian, "/search?q=&country=India")}
					{renderSection("Japanese Hits", sections.japanese, "/search?q=&country=Japan")}
				</div>

				{/* Curated Collections */}
				{renderSection("Binge-Worthy Series", sections.bingeWorthy)}
				{renderSection("Award Winners", sections.awardWinners)}
				{renderSection("Hidden Gems", sections.hiddenGems)}

				{/* Mood Based */}
				<div className="py-4 bg-gradient-to-b from-transparent to-secondary/20">
					{renderSection("Emotional Rollercoasters", sections.emotional)}
					{renderSection("Sweet Revenge", sections.revenge)}
					{renderSection("Edge of Your Seat Thrillers", sections.thriller)}
				</div>
			</div>
		</div>
	);
};

// Need Star icon for hero
import { Star } from 'lucide-react';

export default HomePage;