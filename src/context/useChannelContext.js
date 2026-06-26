import { useContext } from "react";
import { ChannelContext } from "./channel-context";

export function useChannelContext() {
  const ctx = useContext(ChannelContext);
  if (!ctx) throw new Error("useChannelContext must be used within ChannelProvider");
  return ctx;
}
