"use client";

import { createContext, useContext } from "react";
type HomeState = "signed-out" | "onboarding" | "wedding";
const HomeSessionContext = createContext<HomeState>("signed-out");
export function HomeSession({ initialState, children }: { initialState: HomeState; children: React.ReactNode }) { return <HomeSessionContext.Provider value={initialState}>{children}</HomeSessionContext.Provider>; }
export const useHomeSession = () => useContext(HomeSessionContext);
