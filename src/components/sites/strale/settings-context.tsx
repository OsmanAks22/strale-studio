"use client";

import { createContext, useContext } from "react";
import type { StoreSettings } from "./site-config";

const SettingsContext = createContext<StoreSettings | null>(null);

/** Root layout passes the current store settings down to client components. */
export function SettingsProvider({ settings, children }: { settings: StoreSettings; children: React.ReactNode }) {
  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const settings = useContext(SettingsContext);
  if (!settings) throw new Error("useSettings outside SettingsProvider");
  return settings;
}
