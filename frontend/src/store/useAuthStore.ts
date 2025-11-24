
import { useStore } from "zustand";
import { authStore, type IAuthState } from "./authStore";

export const useAuthStore = <T>(selector: (state: IAuthState) => T) =>
  useStore(authStore, selector);
