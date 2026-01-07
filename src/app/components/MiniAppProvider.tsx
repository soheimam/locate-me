"use client";

import { sdk } from "@farcaster/miniapp-sdk";
import { useEffect } from "react";

export default function MiniAppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const setReady = async () => {
      console.log("[MiniAppProvider] Calling sdk.actions.ready()");
      await sdk.actions.ready();
      console.log("[MiniAppProvider] sdk.actions.ready() called successfully");
    };
    setReady();
  }, []);

  return <>{children}</>;
}
