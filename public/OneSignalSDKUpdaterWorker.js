async function setJyousenjiAppBadge() {
  if (!("setAppBadge" in navigator)) {
    return;
  }
  try {
    await navigator.setAppBadge(1);
  } catch {
    // Badging is optional. Notification display must not depend on it.
  }
}

async function clearJyousenjiAppBadge() {
  if (!("clearAppBadge" in navigator)) {
    return;
  }
  try {
    await navigator.clearAppBadge();
  } catch {
    // Badging is optional. Ignore unsupported or denied states.
  }
}

self.addEventListener("push", (event) => {
  event.waitUntil(setJyousenjiAppBadge());
});

self.addEventListener("notificationclick", (event) => {
  event.waitUntil(clearJyousenjiAppBadge());
});

importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");
