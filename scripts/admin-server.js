import express from 'express';
import cors from 'cors';
import fs from 'fs';
const fsp = fs.promises;
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create public/uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();
// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for base64 image uploads

// --- Auth Configuration ---
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '2young2simple';

// Middleware to verify password
const verifyPassword = (req, res, next) => {
    const pwd = req.headers['x-admin-password'];
    if (pwd !== ADMIN_PASSWORD) {
        console.warn(`[Auth] Blocked unauthorized attempt.`);
        return res.status(401).json({ error: 'Unauthorized: Invalid Password' });
    }
    next();
};

// Robust Fetch with Timeout (To prevent hanging on broken APIs)
async function fetchSafe(url, options = {}) {
    const { timeout = 6000 } = options;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timer);
        return response;
    } catch (error) {
        clearTimeout(timer);
        return null; // Return null instead of throwing - prevents cascade failures
    }
}

// Path to our single source of truth for content
const CONTENT_FILE_PATH = path.join(__dirname, '../src/data/content.json');

app.get('/api/content', verifyPassword, async (req, res) => {
    try {
        const fileContent = await fsp.readFile(CONTENT_FILE_PATH, 'utf-8');
        res.json(JSON.parse(fileContent));
    } catch (error) {
        console.error('Error reading content:', error);
        res.status(500).json({ error: 'Failed to read content file' });
    }
});

app.post('/api/content', verifyPassword, async (req, res) => {
    try {
        const newContent = req.body;
        if (!newContent.projectsData || !newContent.writingsData || !newContent.curationsData || !newContent.footerData) {
            return res.status(400).json({ error: 'Invalid content format.' });
        }
        await fsp.writeFile(CONTENT_FILE_PATH, JSON.stringify(newContent, null, 2), 'utf-8');
        res.json({ success: true, message: 'Content updated successfully via Admin OS.' });
    } catch (error) {
        console.error('Error writing content:', error);
        res.status(500).json({ error: 'Failed to write content file' });
    }
});

// ============================================================================
// META SCRAPER SYSTEM - Multi-Source Aggregator
// Sources: Google Books, OpenLibrary, iTunes, Deezer, Last.fm, MusicBrainz,
//          TheAudioDB, Discogs, TVMaze, Jikan (MyAnimeList)
// ============================================================================
const LASTFM_API_KEY = '4cb074e4b8ec4ee9ad3eb37d6f7eb240'; // Public demo key
const TMDB_API_KEY = '2dca580c2a14b55200e784d157207b4d'; // Free public TMDB key
const OMDB_API_KEY = '4a3b711b'; // Free OMDb key

app.get('/api/search', verifyPassword, async (req, res) => {
    const { q, type } = req.query;
    if (!q) return res.status(400).json({ error: 'Query is required' });

    console.log(`[Scraper] Searching [${type}]: ${q}`);
    const results = [];

    try {
        // ==================== BOOKS ====================
        if (type === 'Book' || !type) {
            const isChinese = /[\u4e00-\u9fff]/.test(q);

            // --- 1. Douban Frodo API (Native Chinese Books - Highest Priority) ---
            const doubanPromise = (async () => {
                try {
                    const r = await fetchSafe(`https://frodo.douban.com/api/v2/search/subjects?q=${encodeURIComponent(q)}&type=book&count=8&apikey=054022eaeae0b00e0fc068c0c0a2102a`, {
                        headers: {
                            'User-Agent': 'MicroMessenger/7.0.22.1840(0x27001636) Process/appbrand0 WeChat/ext/127 NetType/WIFI Language/zh_CN',
                            'Referer': 'https://servicewechat.com/wx2f9b06c1de1ccfca/91/page-frame.html'
                        },
                        timeout: 8000
                    });

                    console.log(`[Douban Debug] Status for "${q}":`, r ? r.status : 'fetchSafe returned null');

                    if (r?.ok) {
                        const d = await r.json();
                        console.log(`[Douban Debug] Data subjects length:`, d.subjects?.items?.length);
                        d.subjects?.items?.forEach(reqItem => {
                            const item = reqItem.target;
                            if (item && item.title && (item.pic?.normal || item.cover_url)) {
                                results.push({
                                    source: 'Douban', type: 'Book',
                                    title: item.title,
                                    author: item.card_subtitle ? item.card_subtitle.split(' / ')[0] : (item.author_name || 'Unknown'),
                                    image: (item.pic?.normal || item.cover_url || '').replace('http:', 'https:'),
                                    description: item.card_subtitle || ''
                                });
                            }
                        });
                    }
                } catch (e) { console.error('Douban Error:', e.message); }
            })();

            // --- 2. Google Books API (with extended timeout) ---
            const googleBooksPromise = (async () => {
                try {
                    // Longer timeout for Google Books (often slow in China, but not fully blocked)
                    const r = await fetchSafe(
                        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=5&printType=all`,
                        { timeout: 12000 }
                    );
                    if (r?.ok) {
                        const d = await r.json();
                        d.items?.forEach(item => {
                            const v = item.volumeInfo;
                            if (v.title) {
                                // Accept books even without thumbnail - use placeholder
                                const img = v.imageLinks?.thumbnail?.replace('http:', 'https:')
                                    || v.imageLinks?.smallThumbnail?.replace('http:', 'https:')
                                    || '';
                                if (img) {
                                    results.push({
                                        source: 'Google Books', type: 'Book',
                                        title: v.title,
                                        author: v.authors ? v.authors.join(', ') : 'Unknown',
                                        image: img,
                                        description: v.description?.slice(0, 300) || ''
                                    });
                                }
                            }
                        });
                    }
                } catch (e) { console.error(`Google Books Error:`, e.message); }
            })();

            // --- OpenLibrary API ---
            const openLibPromise = (async () => {
                try {
                    const r = await fetchSafe(`https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=8`, { timeout: 10000 });
                    if (r?.ok) {
                        const d = await r.json();
                        d.docs?.forEach(doc => {
                            if (doc.title && doc.cover_i) {
                                results.push({
                                    source: 'OpenLibrary', type: 'Book',
                                    title: doc.title,
                                    author: doc.author_name ? doc.author_name.join(', ') : 'Unknown',
                                    image: `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`,
                                    description: (typeof doc.first_sentence === 'object' ? doc.first_sentence[0] : doc.first_sentence) || ''
                                });
                            }
                        });
                    }
                } catch (e) { console.error('OpenLibrary Error:', e.message); }
            })();

            // --- Gutendex API (classic books) ---
            const gutendexPromise = (async () => {
                try {
                    const r = await fetchSafe(`https://gutendex.com/books/?search=${encodeURIComponent(q)}`);
                    if (r?.ok) {
                        const d = await r.json();
                        d.results?.slice(0, 5).forEach(book => {
                            const coverImg = book.formats?.['image/jpeg'] || '';
                            if (book.title && coverImg) {
                                results.push({
                                    source: 'Gutenberg', type: 'Book',
                                    title: book.title,
                                    author: book.authors?.map(a => a.name).join(', ') || 'Unknown',
                                    image: coverImg,
                                    description: `Downloads: ${book.download_count || 0}`
                                });
                            }
                        });
                    }
                } catch (e) { console.error('Gutendex Error:', e.message); }
            })();

            // --- ISBN Search via OpenLibrary ---
            const isbnPromise = (async () => {
                if (/^\d{10,13}$/.test(q.trim())) {
                    try {
                        const r = await fetchSafe(`https://openlibrary.org/isbn/${q.trim()}.json`);
                        if (r?.ok) {
                            const book = await r.json();
                            const coverId = book.covers?.[0];
                            if (book.title && coverId) {
                                results.push({
                                    source: 'OpenLibrary ISBN', type: 'Book',
                                    title: book.title,
                                    author: 'See details',
                                    image: `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`,
                                    description: book.description?.value || book.description || ''
                                });
                            }
                        }
                    } catch (e) { /* ISBN lookup failed */ }
                }
            })();

            // Run ALL book searches in parallel for speed
            await Promise.allSettled([doubanPromise, googleBooksPromise, openLibPromise, gutendexPromise, isbnPromise]);

            console.log(`[Scraper] Book search for "${q}": ${results.length} results after parallel fetch`);
        }

        // ==================== MUSIC ====================
        if (type === 'Music' || !type) {

            // [CORE] NetEase Cloud Music API (THE #1 Chinese music source!)
            try {
                // Use the public NetEase API endpoint for search
                const neteaseRes = await fetchSafe(`https://music.163.com/api/search/get/web?s=${encodeURIComponent(q)}&type=1&offset=0&total=true&limit=10`, {
                    headers: {
                        'Referer': 'https://music.163.com',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });
                if (neteaseRes?.ok) {
                    const nd = await neteaseRes.json();
                    if (nd.result?.songs) {
                        for (const song of nd.result.songs.slice(0, 8)) {
                            const albumId = song.album?.id;
                            let coverImg = '';
                            if (song.album?.picUrl) {
                                coverImg = song.album.picUrl;
                            } else if (albumId) {
                                // Fetch album detail for cover art
                                try {
                                    const albumRes = await fetchSafe(`https://music.163.com/api/album/${albumId}`, {
                                        headers: { 'Referer': 'https://music.163.com' }
                                    });
                                    if (albumRes?.ok) {
                                        const albumD = await albumRes.json();
                                        coverImg = albumD.album?.picUrl || '';
                                    }
                                } catch (e) { /* skip */ }
                            }
                            if (song.name && coverImg) {
                                results.push({
                                    source: 'NetEase', type: 'Music',
                                    title: song.name,
                                    author: song.artists?.map(a => a.name).join(', ') || 'Unknown',
                                    image: coverImg,
                                    description: `Album: ${song.album?.name || 'N/A'}`
                                });
                            }
                        }
                    }
                }
            } catch (e) { console.error('NetEase Error:', e.message); }

            // 3. iTunes Search API (CN fallback to Global)
            try {
                let r = await fetchSafe(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&limit=10&country=CN&lang=zh_cn`);
                if (!r?.ok) {
                    r = await fetchSafe(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&limit=10&country=US`);
                }
                if (r?.ok) {
                    const d = await r.json();
                    d.results?.forEach(item => {
                        if (item.kind === 'song' && (item.trackName || item.collectionName)) {
                            const art = item.artworkUrl100?.replace('100x100bb', '600x600bb') || '';
                            results.push({
                                source: 'iTunes', type: 'Music',
                                title: item.trackName || item.collectionName,
                                author: item.artistName || 'Unknown',
                                image: art,
                                description: item.collectionName ? `Album: ${item.collectionName}` : ''
                            });
                        }
                    });
                }
            } catch (e) { console.error('iTunes Error:', e.message); }

            // 4. Deezer API
            try {
                const r = await fetchSafe(`https://api.deezer.com/search?q=${encodeURIComponent(q)}&limit=10`);
                if (r?.ok) {
                    const d = await r.json();
                    d.data?.forEach(item => {
                        if (item.title && item.artist?.name && item.album?.cover_xl) {
                            results.push({
                                source: 'Deezer', type: 'Music',
                                title: item.title,
                                author: item.artist.name,
                                image: item.album.cover_xl,
                                description: `Album: ${item.album.title}`
                            });
                        }
                    });
                }
            } catch (e) { console.error('Deezer Error:', e.message); }

            // 5. Last.fm API (good Chinese metadata)
            try {
                const r = await fetchSafe(`https://ws.audioscrobbler.com/2.0/?method=track.search&track=${encodeURIComponent(q)}&api_key=${LASTFM_API_KEY}&format=json&limit=8`);
                if (r?.ok) {
                    const d = await r.json();
                    const tracks = d?.results?.trackmatches?.track;
                    if (tracks) {
                        for (const track of tracks) {
                            let image = '';
                            // Try track.getInfo for album art
                            try {
                                const infoR = await fetchSafe(`https://ws.audioscrobbler.com/2.0/?method=track.getInfo&artist=${encodeURIComponent(track.artist)}&track=${encodeURIComponent(track.name)}&api_key=${LASTFM_API_KEY}&format=json`, { timeout: 3000 });
                                if (infoR?.ok) {
                                    const info = await infoR.json();
                                    const imgs = info?.track?.album?.image;
                                    if (imgs) {
                                        const xl = imgs.find(i => i.size === 'extralarge') || imgs.find(i => i.size === 'large');
                                        if (xl?.['#text']) image = xl['#text'];
                                    }
                                }
                            } catch (e) { /* skip */ }
                            // Even without image, still add if we have basic info (user can customize later)
                            results.push({
                                source: 'Last.fm', type: 'Music',
                                title: track.name,
                                author: track.artist || 'Unknown',
                                image: image || '', // May be empty for niche artists
                                description: `Listeners: ${track.listeners || 'N/A'}`
                            });
                        }
                    }
                }
            } catch (e) { console.error('Last.fm Error:', e.message); }

            // 6. TheAudioDB
            try {
                const r = await fetchSafe(`https://theaudiodb.com/api/v1/json/2/searchtrack.php?s=&t=${encodeURIComponent(q)}`);
                if (r?.ok) {
                    const d = await r.json();
                    d.track?.slice(0, 5).forEach(t => {
                        if (t.strTrack && t.strTrackThumb) {
                            results.push({
                                source: 'AudioDB', type: 'Music',
                                title: t.strTrack,
                                author: t.strArtist || 'Unknown',
                                image: t.strTrackThumb,
                                description: t.strDescriptionEN?.slice(0, 200) || `Album: ${t.strAlbum || 'N/A'}`
                            });
                        }
                    });
                }
            } catch (e) { console.error('AudioDB Error:', e.message); }

            // 7. MusicBrainz (verified covers only)
            try {
                const r = await fetchSafe(`https://musicbrainz.org/ws/2/release/?query=${encodeURIComponent(q)}&limit=5&fmt=json`, {
                    headers: { 'User-Agent': 'OrganicEditorial/1.0 (admin@example.com)' }
                });
                if (r?.ok) {
                    const d = await r.json();
                    if (d.releases) {
                        for (const rel of d.releases.slice(0, 3)) {
                            if (!rel.title) continue;
                            try {
                                const coverCheck = await fetchSafe(`https://coverartarchive.org/release/${rel.id}`, { timeout: 3000 });
                                if (coverCheck?.ok) {
                                    const coverData = await coverCheck.json();
                                    const frontImg = coverData.images?.find(i => i.front);
                                    if (frontImg?.thumbnails?.['500'] || frontImg?.image) {
                                        results.push({
                                            source: 'MusicBrainz', type: 'Music',
                                            title: rel.title,
                                            author: rel['artist-credit']?.[0]?.name || 'Unknown',
                                            image: frontImg.thumbnails?.['500'] || frontImg.image,
                                            description: `Released: ${rel.date || 'Unknown'}`
                                        });
                                    }
                                }
                            } catch (e) { /* no cover */ }
                        }
                    }
                }
            } catch (e) { console.error('MusicBrainz Error:', e.message); }

            // 8. Discogs API
            try {
                const r = await fetchSafe(`https://api.discogs.com/database/search?q=${encodeURIComponent(q)}&type=release&per_page=5`, {
                    headers: { 'User-Agent': 'OrganicEditorial/1.0' }
                });
                if (r?.ok) {
                    const d = await r.json();
                    d.results?.forEach(item => {
                        if (item.title && item.cover_image && !item.cover_image.includes('spacer.gif')) {
                            const parts = item.title.split(' - ');
                            results.push({
                                source: 'Discogs', type: 'Music',
                                title: parts.length > 1 ? parts[1].trim() : item.title,
                                author: parts.length > 1 ? parts[0].trim() : 'Unknown',
                                image: item.cover_image,
                                description: `Format: ${item.format?.join(', ') || 'Unknown'} | Year: ${item.year || 'N/A'}`
                            });
                        }
                    });
                }
            } catch (e) { console.error('Discogs Error:', e.message); }
        }

        // ==================== MOVIES ====================
        if (type === 'Movie' || !type) {

            // [CORE] TMDB - The Movie Database (Best for Chinese movies!)
            try {
                const tmdbRes = await fetchSafe(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(q)}&language=zh-CN&include_adult=false`);
                if (tmdbRes?.ok) {
                    const td = await tmdbRes.json();
                    td.results?.slice(0, 8).forEach(movie => {
                        if (movie.title && movie.poster_path) {
                            results.push({
                                source: 'TMDB', type: 'Movie',
                                title: movie.title,
                                author: movie.release_date ? `Released: ${movie.release_date}` : 'Unknown',
                                image: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
                                description: movie.overview || ''
                            });
                        }
                    });
                }
            } catch (e) { console.error('TMDB Error:', e.message); }

            // TMDB TV Shows (for series)
            try {
                const tmdbTvRes = await fetchSafe(`https://api.themoviedb.org/3/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(q)}&language=zh-CN`);
                if (tmdbTvRes?.ok) {
                    const tvd = await tmdbTvRes.json();
                    tvd.results?.slice(0, 5).forEach(show => {
                        if (show.name && show.poster_path) {
                            results.push({
                                source: 'TMDB', type: 'Movie',
                                title: show.name,
                                author: show.first_air_date ? `First Aired: ${show.first_air_date}` : 'Unknown',
                                image: `https://image.tmdb.org/t/p/w500${show.poster_path}`,
                                description: show.overview || ''
                            });
                        }
                    });
                }
            } catch (e) { console.error('TMDB TV Error:', e.message); }

            // OMDb API (Open Movie Database)
            try {
                const omdbRes = await fetchSafe(`https://www.omdbapi.com/?s=${encodeURIComponent(q)}&apikey=${OMDB_API_KEY}&type=movie`);
                if (omdbRes?.ok) {
                    const od = await omdbRes.json();
                    if (od.Search) {
                        od.Search.slice(0, 5).forEach(movie => {
                            if (movie.Title && movie.Poster && movie.Poster !== 'N/A') {
                                results.push({
                                    source: 'OMDb', type: 'Movie',
                                    title: movie.Title,
                                    author: `Year: ${movie.Year || 'N/A'}`,
                                    image: movie.Poster,
                                    description: `IMDb ID: ${movie.imdbID || 'N/A'}`
                                });
                            }
                        });
                    }
                }
            } catch (e) { console.error('OMDb Error:', e.message); }

            // iTunes for Movies
            try {
                let r = await fetchSafe(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=movie&limit=10&country=CN&lang=zh_cn`);
                if (!r?.ok) {
                    r = await fetchSafe(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=movie&limit=10&country=US`);
                }
                if (r?.ok) {
                    const d = await r.json();
                    d.results?.forEach(item => {
                        if (item.kind === 'feature-movie' && item.trackName) {
                            const art = item.artworkUrl100?.replace('100x100bb', '600x600bb') || '';
                            results.push({
                                source: 'iTunes', type: 'Movie',
                                title: item.trackName,
                                author: item.artistName || 'Unknown',
                                image: art,
                                description: item.longDescription || item.shortDescription || ''
                            });
                        }
                    });
                }
            } catch (e) { console.error('iTunes Movie Error:', e.message); }

            // TVMaze API (Global TV shows)
            try {
                const r = await fetchSafe(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(q)}`);
                if (r?.ok) {
                    const d = await r.json();
                    d.slice(0, 5).forEach(item => {
                        const show = item.show;
                        if (show.name && show.image?.original) {
                            results.push({
                                source: 'TVMaze', type: 'Movie',
                                title: show.name,
                                author: 'Network: ' + (show.network?.name || 'Unknown'),
                                image: show.image.original.replace('http:', 'https:'),
                                description: show.summary ? show.summary.replace(/<[^>]+>/g, '') : ''
                            });
                        }
                    });
                }
            } catch (e) { console.error('TVMaze Error:', e.message); }

            // Jikan API (Anime/Manga)
            try {
                const r = await fetchSafe(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&limit=3&sfw=true`);
                if (r?.ok) {
                    const d = await r.json();
                    d.data?.forEach(anime => {
                        if (anime.title && anime.images?.webp?.large_image_url) {
                            results.push({
                                source: 'MyAnimeList', type: 'Movie',
                                title: anime.title,
                                author: 'Studio: ' + (anime.studios?.[0]?.name || 'Unknown'),
                                image: anime.images.webp.large_image_url,
                                description: anime.synopsis || ''
                            });
                        }
                    });
                }
            } catch (e) { console.error('Jikan Error:', e.message); }
        }

        // ==================== DEDUPLICATION ====================
        const validResults = results.filter(r => r.image && r.title);
        const uniqueMap = new Map();
        validResults.forEach(item => {
            const key = `${item.title.toLowerCase().trim()}|${item.author.toLowerCase().trim()}`;
            if (!uniqueMap.has(key)) {
                uniqueMap.set(key, item);
            } else {
                const existing = uniqueMap.get(key);
                if (item.description.length > existing.description.length) {
                    uniqueMap.set(key, item);
                }
            }
        });

        const finalResults = Array.from(uniqueMap.values()).slice(0, 20);
        console.log(`[Scraper] Found ${finalResults.length} unique results from ${results.length} raw hits.`);
        res.json({ results: finalResults });

    } catch (globalError) {
        console.error('Scraper global error:', globalError);
        res.status(500).json({ error: 'Search scraping failed' });
    }
});

// --- Local Image Upload Endpoint ---
app.post('/api/upload', verifyPassword, async (req, res) => {
    try {
        const { imageBase64 } = req.body;
        if (!imageBase64) return res.status(400).json({ error: 'No image data provided' });

        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        let ext = 'jpg';
        const typeMatch = imageBase64.match(/^data:image\/(\w+);base64,/);
        if (typeMatch && typeMatch[1]) ext = typeMatch[1];

        const safeName = Date.now() + '-' + Math.round(Math.random() * 1E9) + '.' + ext;
        const filePath = path.join(uploadsDir, safeName);

        await fsp.writeFile(filePath, base64Data, 'base64');

        res.json({ url: `uploads/${safeName}` });
    } catch (e) {
        console.error("Upload Error:", e);
        res.status(500).json({ error: 'Image upload failed' });
    }
});

// --- Image Proxy Endpoint (to bypass hotlink protection) ---
app.get('/api/proxy-image', async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).send('URL is required');

    try {
        const response = await fetch(url, {
            headers: {
                'Referer': 'https://www.douban.com/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!response.ok) {
            console.error(`[Proxy] Failed to fetch: ${url} (Status: ${response.status})`);
            return res.status(response.status).send('Failed to fetch image');
        }

        const buffer = await response.arrayBuffer();
        const contentType = response.headers.get('Content-Type') || 'image/jpeg';

        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
        res.send(Buffer.from(buffer));
    } catch (error) {
        console.error('[Proxy] Error:', error.message);
        res.status(500).send('Proxy error');
    }
});

const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Admin OS] Server running at http://localhost:${PORT}`);
    console.log(`[Admin OS] Managing: ${CONTENT_FILE_PATH}`);
});
