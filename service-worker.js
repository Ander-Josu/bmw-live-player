
const CACHE_NAME = "bmw-live-player-v3";

const ARCHIVOS = [
    "./",
    "./index.html",
    "./manifest.json",
    "./icons/icon-192.png",
    "./icons/icon-512.png"
];

// Guardar archivos al instalar el Service Worker
self.addEventListener("install", (evento) => {
    evento.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ARCHIVOS))
            .then(() => self.skipWaiting())
    );
});

// Limpiar versiones antiguas de la caché
self.addEventListener("activate", (evento) => {
    evento.waitUntil(
        caches.keys().then(async (nombres) => {
            await Promise.all(
                nombres
                    .filter((nombre) =>
                        nombre.startsWith("bmw-live-player-") &&
                        nombre !== CACHE_NAME
                    )
                    .map((nombre) => caches.delete(nombre))
            );

            await self.clients.claim();
        })
    );
});

// Servir archivos, incluso sin conexión
self.addEventListener("fetch", (evento) => {
    if (evento.request.method !== "GET") {
        return;
    }

    if (evento.request.mode === "navigate") {
        evento.respondWith(
            fetch(evento.request)
                .catch(() => caches.match("./index.html"))
        );
        return;
    }

    evento.respondWith(
        caches.match(evento.request)
            .then((respuesta) =>
                respuesta || fetch(evento.request)
            )
    );
});
