# API decisions

Researched October 24, 2026. MemeMuse uses GIPHY's browser API. Its official [Search](https://developers.giphy.com/docs/api/endpoint/search/) and [Trending](https://developers.giphy.com/docs/api/endpoint/trending/) documentation says these calls are client-side and require an API key. [GIPHY's quickstart](https://developers.giphy.com/docs/api/quick-start-guide/) says beta keys are limited to 100 requests/hour and requires visible "Powered by GIPHY" attribution.

`VITE_GIPHY_API_KEY` is public in this static application; use an approved web key, never a secret. The Download control opens GIPHY's `images.original.url` rendition in a new tab. Visitors save it through their browser's native image-saving action. Categories are maintained local queries that use the real search endpoint.
