/* RIP mirror service worker — due-line push notifications only.
   Payloads are a generic count; no course content ever rides a push. */
"use strict";

self.addEventListener("install", function () { self.skipWaiting(); });
self.addEventListener("activate", function (e) {
  e.waitUntil(self.clients.claim());
});

self.addEventListener("push", function (e) {
  var data = { title: "RIP", body: "Lines are due on the ladder." };
  try { data = e.data.json(); } catch (err) {}
  e.waitUntil(self.registration.showNotification(data.title || "RIP", {
    body: data.body || "Lines are due on the ladder.",
    icon: undefined,
    badge: undefined,
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
