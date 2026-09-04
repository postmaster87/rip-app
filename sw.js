/* RIP mirror service worker.
   - due-line push notifications (payloads are a generic count; no course
     content ever rides a push)
   - a network-passthrough fetch handler so Chrome treats the mirror as an
     installable PWA (home-screen icon; iOS needs A2HS for push anyway).
     Nothing is cached here: the encrypted blob is always fetched fresh. */
"use strict";

self.addEventListener("install", function () { self.skipWaiting(); });
self.addEventListener("activate", function (e) {
  e.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(fetch(e.request));
});

self.addEventListener("push", function (e) {
  var data = { title: "RIP", body: "Lines are due on the ladder." };
  try { data = e.data.json(); } catch (err) {}
  e.waitUntil(self.registration.showNotification(data.title || "RIP", {
    body: data.body || "Lines are due on the ladder.",
    icon: "icons/icon-192.png",
    badge: "icons/badge-96.png",
    tag: "rip-due",           // one due-notice at a time, never a pile
    renotify: false
  }));
});

self.addEventListener("notificationclick", function (e) {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: "window" }).then(function (cs) {
    for (var i = 0; i < cs.length; i++) {
      if (cs[i].url.indexOf("/rip-app") >= 0) return cs[i].focus();
    }
    return self.clients.openWindow("/rip-app/");
  }));
});
