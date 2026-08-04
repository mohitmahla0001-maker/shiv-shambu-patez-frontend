const CACHE_NAME = "patez-cache-v2";

const CORE_ASSETS = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js"
];

self.addEventListener("fetch", (event) => {

    if (event.request.method !== "GET" || event.request.url.includes("/api/")) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                });
                return response;
            })
            .catch(() => caches.match(event.request))
    );

});