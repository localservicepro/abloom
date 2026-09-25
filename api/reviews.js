/**
 * Live Google reviews for the homepage and about page.
 *
 * Calls the Google Places API (New) server side so the API key never reaches
 * the browser, and caches hard at the CDN so the page stays fast and the
 * Google bill stays near zero.
 *
 * Required environment variables (set them in Vercel > Project > Settings >
 * Environment Variables):
 *   GOOGLE_PLACES_API_KEY  a Places API (New) key, restricted to this project
 *   GOOGLE_PLACE_ID        the Place ID for Abloom Tree Care
 *
 * Until both are set this returns 200 with { configured: false } and the page
 * keeps showing the reviews written into the HTML, so nothing breaks.
 *
 * Note on what Google gives us: the Places API returns at most five reviews
 * and you cannot choose which. The rating and total count are always the real,
 * unfiltered Google figures. The quote cards are limited to 4 and 5 star
 * reviews with text, which is an ordinary testimonial choice. To show
 * everything Google returns instead, drop the rating filter in pickReviews().
 */

const PLACES_ENDPOINT = 'https://places.googleapis.com/v1/places/';
const FIELD_MASK = 'rating,userRatingCount,googleMapsUri,reviews';
const MIN_STARS = 4;
const MAX_REVIEWS = 5;

function pickReviews(reviews) {
  return (reviews || [])
    .filter(function (r) {
      const text = r && r.text && r.text.text;
      return r && r.rating >= MIN_STARS && text && text.trim().length > 0;
    })
    .slice(0, MAX_REVIEWS)
    .map(function (r) {
      const author = r.authorAttribution || {};
      return {
        rating: r.rating,
        text: r.text.text.trim(),
        author: author.displayName || 'Google reviewer',
        authorUri: author.uri || null,
        when: r.relativePublishTimeDescription || '',
        publishTime: r.publishTime || null
      };
    });
}

module.exports = async function handler(req, res) {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!key || !placeId) {
    res.setHeader('Cache-Control', 'public, s-maxage=300');
    return res.status(200).json({ configured: false });
  }

  try {
    const upstream = await fetch(PLACES_ENDPOINT + encodeURIComponent(placeId) + '?languageCode=en', {
      headers: { 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': FIELD_MASK }
    });

    if (!upstream.ok) {
      // Never surface Google's error body: it can echo the key back.
      res.setHeader('Cache-Control', 'public, s-maxage=120');
      return res.status(200).json({ configured: true, ok: false, status: upstream.status });
    }

    const place = await upstream.json();

    // Fresh for 6 hours, then served stale for a day while it refreshes.
    // Roughly 120 calls a month.
    res.setHeader('Cache-Control', 'public, s-maxage=21600, stale-while-revalidate=86400');
    return res.status(200).json({
      configured: true,
      ok: true,
      rating: typeof place.rating === 'number' ? place.rating : null,
      total: typeof place.userRatingCount === 'number' ? place.userRatingCount : null,
      mapsUri: place.googleMapsUri || null,
      reviews: pickReviews(place.reviews)
    });
  } catch (err) {
    res.setHeader('Cache-Control', 'public, s-maxage=120');
    return res.status(200).json({ configured: true, ok: false });
  }
};
