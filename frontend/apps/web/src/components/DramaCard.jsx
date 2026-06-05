import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Play } from 'lucide-react';

const DramaCard = ({ drama, layout = 'grid' }) => {
    if (!drama) return null;

    const seasonEpisodes = drama.seasons?.[0]?.episodes || [];

    const firstEpisodeNumber =
        drama.episodes?.length > 0
            ? Number(drama.episodes[0]?.episodeNumber) || 1
            : Number(seasonEpisodes[0]?.episodeNumber) || 1;

    const hasEpisodes =
        drama.episodes?.length > 0 ||
        seasonEpisodes.length > 0;

    const watchHref = hasEpisodes
        ? `/watch/${drama.id}?ep=${firstEpisodeNumber}`
        : `/drama/${drama.id}`;

    const [isLandscapePoster, setIsLandscapePoster] = useState(false);

    const handlePosterLoad = (event) => {
        const { naturalWidth, naturalHeight } = event.target;
        setIsLandscapePoster(naturalWidth > naturalHeight);
    };

    const containerClassName = layout === 'home'
        ? 'group relative flex-none w-[150px] sm:w-[180px] md:w-[220px] snap-start flex flex-col'
        : 'group relative w-full max-w-[240px] flex flex-col';

    return (
        <div className={containerClassName}>
            <Link to={`/drama/${drama.id}`} className="block">
                <div className="relative aspect-[2/3] min-h-[260px] overflow-hidden rounded-xl bg-card shadow-lg transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-xl group-hover:shadow-primary/10">
                    {drama.posterUrl ? (
                        <img
                            src={drama.posterUrl}
                            alt={drama.title}
                            className="absolute inset-0 min-w-full min-h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            style={{
                                objectPosition: 'center center',
                                transformOrigin: 'center center',
                                transform: isLandscapePoster ? 'scale(1.18)' : 'scale(1)',
                            }}
                            onLoad={handlePosterLoad}
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                            <span className="text-muted-foreground text-sm">No Image</span>
                        </div>
                    )}

                    <div className="absolute top-2 left-2 right-2 flex justify-between items-start z-10">
                        {drama.country && (
                            <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                                {drama.country}
                            </span>
                        )}
                        {drama.rating && (
                            <div className="bg-black/60 backdrop-blur-md text-white text-xs font-medium px-2 py-1 rounded-md flex items-center gap-1">
                                <Star className="w-3 h-3 fill-primary text-primary" />
                                {drama.rating}
                            </div>
                        )}
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground mb-3 shadow-lg shadow-primary/30">
                                <Play className="w-5 h-5 ml-1" />
                            </div>
                            {drama.description && (
                                <p className="text-xs text-gray-300 line-clamp-3 mb-2 leading-relaxed">
                                    {drama.description}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </Link>

            <div className="mt-3 space-y-1.5 flex flex-col flex-1 min-h-0">
                <h3 className="font-semibold text-base leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                    <Link to={`/drama/${drama.id}`}>{drama.title}</Link>
                </h3>

                {drama.genres && drama.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {drama.genres.slice(0, 3).map(genre => (
                            <span
                                key={genre}
                                className="text-[10px] font-medium px-1.5 py-0.5 rounded-sm text-white/90"
                                style={{ backgroundColor: `hsl(var(--genre-${genre.toLowerCase()}) / 0.3)` }}
                            >
                                {genre}
                            </span>
                        ))}
                        {drama.genres.length > 3 && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-sm bg-muted text-muted-foreground">
                                +{drama.genres.length - 3}
                            </span>
                        )}
                    </div>
                )}

                <div className="mt-auto">
                    <Link
                        to={watchHref}
                        className="inline-flex items-center justify-center rounded-md bg-red-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-600"
                    >
                        Watch
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default DramaCard;