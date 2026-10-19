# PWA install and offline behavior

## Included

- Web app manifest with standalone display mode and app icons.
- Production-only service-worker registration.
- Cached application shell and same-origin built assets.
- Network-first navigation with cached HTML fallback; cache-first static assets.
- Cache versioning and cleanup for older Wallet Card Studio caches.

## Limitations

- Offline support applies to the application shell and assets previously cached by the browser. First use requires a successful online load.
- Card data remains in browser localStorage. Service-worker caching does not sync, back up, or encrypt card data.
- Firebase share functions and other cross-origin requests are not cached.
- Browser install prompts and SVG icon handling vary by browser. Verify target browsers and consider PNG icon exports if an app store or browser requires raster icons.

## Manual release checks

1. Build and serve the production output over HTTPS (localhost is permitted for development).
2. Confirm the manifest loads and the browser offers installation / Add to Home Screen.
3. Install and launch in standalone mode on Android and a supported desktop browser.
4. Load the app online once, create a sample card, then enable airplane mode and reload.
5. Confirm the cached interface opens and previously saved local cards remain available.
6. Confirm the UI does not claim cloud sync or public sharing works offline.
7. Deploy a new build and confirm the service worker refreshes without leaving a broken screen.
8. Test private browsing and browsers with service workers disabled; the app must still work online.
