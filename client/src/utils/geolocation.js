/**
 * Reliable browser location for MapPicker.
 * Desktop Windows often times out with enableHighAccuracy — we try fast modes first,
 * then watchPosition, then approximate IP geolocation.
 */

function getCurrentPositionAsync(options) {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }),
      (err) => reject(err),
      options
    );
  });
}

function watchPositionOnce(options, maxWaitMs) {
  return new Promise((resolve, reject) => {
    let watchId = null;
    let done = false;

    const finish = (fn) => (value) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      if (watchId != null) navigator.geolocation.clearWatch(watchId);
      fn(value);
    };

    const timer = setTimeout(() => {
      finish(reject)({ code: 3, message: "watch timeout" });
    }, maxWaitMs);

    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        finish(resolve)({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      (err) => finish(reject)(err),
      options
    );
  });
}

function fetchWithTimeout(url, ms = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer));
}

async function fetchIpApproximateLocation() {
  const controllers = [
    async () => {
      const res = await fetchWithTimeout("https://ipapi.co/json/");
      if (!res.ok) throw new Error("ipapi");
      const data = await res.json();
      if (Number.isFinite(data.latitude) && Number.isFinite(data.longitude)) {
        return { lat: data.latitude, lng: data.longitude, approximate: true, source: "ip" };
      }
      throw new Error("no coords");
    },
    async () => {
      const res = await fetchWithTimeout("http://ip-api.com/json/?fields=lat,lon,status");
      if (!res.ok) throw new Error("ip-api");
      const data = await res.json();
      if (data.status === "success" && Number.isFinite(data.lat) && Number.isFinite(data.lon)) {
        return { lat: data.lat, lng: data.lon, approximate: true, source: "ip" };
      }
      throw new Error("no coords");
    },
  ];

  let lastErr;
  for (const tryFetch of controllers) {
    try {
      return await tryFetch();
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

/**
 * @returns {Promise<{ lat: number, lng: number, approximate?: boolean }>}
 */
export async function getUserLocation() {
  if (!navigator.geolocation) {
    return fetchIpApproximateLocation();
  }

  if (navigator.permissions?.query) {
    try {
      const perm = await navigator.permissions.query({ name: "geolocation" });
      if (perm.state === "denied") {
        const err = new Error("denied");
        err.code = 1;
        throw err;
      }
    } catch {
      /* Permissions API unsupported — continue */
    }
  }

  const attempts = [
    () =>
      getCurrentPositionAsync({
        enableHighAccuracy: false,
        timeout: 20000,
        maximumAge: 600000,
      }),
    () =>
      watchPositionOnce(
        { enableHighAccuracy: false, maximumAge: 600000, timeout: 20000 },
        22000
      ),
    () =>
      getCurrentPositionAsync({
        enableHighAccuracy: true,
        timeout: 35000,
        maximumAge: 0,
      }),
    () => fetchIpApproximateLocation(),
  ];

  let lastError;
  for (const attempt of attempts) {
    try {
      return await attempt();
    } catch (e) {
      lastError = e;
    }
  }

  throw lastError || { code: 2, message: "unavailable" };
}

export function geolocationErrorMessage(err, usedApproximate) {
  if (usedApproximate) {
    return null;
  }
  const code = err?.code;
  const messages = {
    1: "Location blocked. Allow location for localhost in browser settings, or tap the map to pin manually.",
    2: "Could not find your position. Tap the map to set your pin.",
    3: "GPS timed out. Tap the map to set your pin — that always works.",
  };
  return messages[code] || "Could not get your location. Tap the map to drop a pin.";
}
