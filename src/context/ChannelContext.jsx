import { useEffect, useMemo, useState } from "react";
import { useChannels } from "../lib/hooks";
import { ChannelContext } from "./channel-context";

const STORAGE_KEY = "yt_ai_active_channel_id";

export function ChannelProvider({ children }) {
  const { channels, loading, error, refresh } = useChannels();

  // The user's last explicit choice (if any). This is the only piece
  // of state we actually own — everything else (whether that choice
  // is still valid, what the effective active channel is) is derived
  // during render rather than mirrored into another state variable +
  // effect, which avoids an extra render pass and the "setState
  // synchronously in an effect" footgun entirely.
  const [manualChannelId, setManualChannelId] = useState(
    () => localStorage.getItem(STORAGE_KEY) || null
  );

  const activeChannelId = useMemo(() => {
    if (loading) return manualChannelId;
    if (channels.length === 0) return null;
    const stillExists = channels.some((c) => c.id === manualChannelId);
    return stillExists ? manualChannelId : channels[0].id;
  }, [channels, loading, manualChannelId]);

  const activeChannel = useMemo(
    () => channels.find((c) => c.id === activeChannelId) || null,
    [channels, activeChannelId]
  );

  // Persist the *effective* choice (including auto-fallback) so a
  // reload lands back on the same channel.
  useEffect(() => {
    if (activeChannelId) {
      localStorage.setItem(STORAGE_KEY, activeChannelId);
    }
  }, [activeChannelId]);

  return (
    <ChannelContext.Provider
      value={{
        channels,
        activeChannel,
        activeChannelId,
        setActiveChannelId: setManualChannelId,
        loading,
        error,
        refresh,
      }}
    >
      {children}
    </ChannelContext.Provider>
  );
}
