import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as SecureStore from "expo-secure-store";

export type NewsDefaultMode = "overview" | "collections";

export interface LandingPreferences {
  showViewModeToggle: boolean;
  showSearch: boolean;
  showCategoryChips: boolean;
  defaultNewsMode: NewsDefaultMode;
  tabPreferences: {
    news: boolean;
    insights: boolean;
    company: boolean;
    calendar: boolean;
  };
}

interface PreferencesContextType {
  landing: LandingPreferences;
  setLanding: (next: Partial<LandingPreferences>) => void;
  loaded: boolean;
}

const STORAGE_KEY = "app_landing_preferences_v1";

const DEFAULT_LANDING: LandingPreferences = {
  showViewModeToggle: true,
  showSearch: true,
  showCategoryChips: true,
  defaultNewsMode: "overview",
  tabPreferences: {
    news: true,
    insights: false,
    company: true,
    calendar: true,
  },
};

const PreferencesContext = createContext<PreferencesContextType>({
  landing: DEFAULT_LANDING,
  setLanding: () => { },
  loaded: false,
});

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [landing, setLandingState] = useState<LandingPreferences>(DEFAULT_LANDING);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        try {
          const parsed = JSON.parse(raw) as Partial<LandingPreferences>;
          setLandingState((prev) => ({ ...prev, ...parsed }));
        } catch {
          // Ignore invalid persisted values.
        }
      })
      .finally(() => setLoaded(true));
  }, []);

  const setLanding = (next: Partial<LandingPreferences>) => {
    setLandingState((prev) => {
      const merged = { ...prev, ...next };
      SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(merged));
      return merged;
    });
  };

  const value = useMemo(
    () => ({ landing, setLanding, loaded }),
    [landing, loaded]
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export const usePreferences = () => useContext(PreferencesContext);
