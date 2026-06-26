import { useCallback, useEffect, useState } from "react";
import api from "../lib/api";

export function useChannels() {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/api/channels");
      setChannels(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get("/api/channels");
        if (!cancelled) setChannels(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { channels, loading, error, refresh };
}

export function useVideos(channelId) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!channelId) {
      setVideos([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/api/videos", { params: { channel_id: channelId } });
      setVideos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [channelId]);

  // Effect owns its own fetch on channelId change, guarding against a
  // slow earlier request resolving after a newer channelId has already
  // superseded it (e.g. rapidly switching channels). The "no channel"
  // case is handled as a fetch that resolves to an empty list rather
  // than an early imperative setState, so every code path through this
  // effect goes through the same async function.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        if (!channelId) {
          if (!cancelled) setVideos([]);
          return;
        }
        const { data } = await api.get("/api/videos", { params: { channel_id: channelId } });
        if (!cancelled) setVideos(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [channelId]);

  return { videos, loading, error, refresh };
}

const ACTIVE_STATUSES = new Set([
  "uploaded",
  "transcribing",
  "transcribed",
  "generating_content",
]);

/**
 * Polls a single video's status while it's mid-pipeline, and stops
 * automatically once it reaches a terminal/actionable state. Avoids
 * hammering the API once there's nothing left to wait for.
 *
 * Implemented as a single self-scheduling effect keyed on videoId, so
 * there's no ref-during-render and no stale-closure risk: every run of
 * the effect captures its own `cancelled` flag and the cleanup from a
 * previous videoId fully tears down that run's timer before the next
 * one starts.
 */
export function useVideoPolling(videoId, { intervalMs = 4000 } = {}) {
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(Boolean(videoId));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!videoId) return;

    let cancelled = false;
    let timer;

    async function tick() {
      try {
        const { data } = await api.get(`/api/videos/${videoId}`);
        if (cancelled) return;
        setVideo(data);
        setLoading(false);
        if (data && ACTIVE_STATUSES.has(data.status)) {
          timer = setTimeout(tick, intervalMs);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      }
    }

    // This reset is intentionally synchronous: it depends on the
    // previous render's state (clearing a *stale* error/loading value)
    // in response to videoId changing, which isn't derivable from
    // props alone — a legitimate effect responsibility, not a missed
    // "compute during render" opportunity.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);
    tick();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [videoId, intervalMs]);

  // When there's no videoId, "no video, not loading" is fully derived
  // rather than written via setState in the effect above.
  if (!videoId) {
    return { video: null, loading: false, error: null };
  }

  return { video, loading, error };
}
