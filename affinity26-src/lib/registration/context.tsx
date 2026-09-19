"use client";

/**
 * React wiring for the registration wizard: a context + hook over the
 * pure reducer in ./state.ts, with localStorage hydration/persistence
 * from ./storage.ts. Wrap the /register route tree with
 * <RegistrationProvider> (see app/register/layout.tsx) and read/dispatch
 * via useRegistration() from any step component.
 */
import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";
import type { RegistrationState } from "@/types/registration";
import { INITIAL_REGISTRATION_STATE } from "@/types/registration";
import { registrationReducer, type RegistrationAction } from "./state";
import { loadRegistrationState, saveRegistrationState } from "./storage";

interface RegistrationContextValue {
  state: RegistrationState;
  dispatch: Dispatch<RegistrationAction>;
}

const RegistrationContext = createContext<RegistrationContextValue | undefined>(undefined);

export function RegistrationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(registrationReducer, INITIAL_REGISTRATION_STATE);

  // Hydrate once on mount — client-only, since localStorage doesn't exist during SSR.
  useEffect(() => {
    const saved = loadRegistrationState();
    if (saved) {
      dispatch({ type: "HYDRATE", state: saved });
    }
  }, []);

  // Persist on every change.
  useEffect(() => {
    saveRegistrationState(state);
  }, [state]);

  return (
    <RegistrationContext.Provider value={{ state, dispatch }}>
      {children}
    </RegistrationContext.Provider>
  );
}

export function useRegistration(): RegistrationContextValue {
  const context = useContext(RegistrationContext);
  if (!context) {
    throw new Error("useRegistration must be used within a <RegistrationProvider>");
  }
  return context;
}
