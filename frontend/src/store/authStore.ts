import { createStore } from "zustand/vanilla";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import type { TSignUpFormData } from "../pages/SignUpPage";

export interface IAuthUser {
  _id: string;
  fullName: string;
  email: string;
  profilePic?: string;
}

export interface IAuthState {
  authUser: IAuthUser | null;
  isSigningUp: boolean;
  isLoggingIn: boolean;
  isUpdatingProfile: boolean;
  isCheckingAuth: boolean;

  checkAuth: () => Promise<void>;
  signup: (data: TSignUpFormData) => Promise<void>;
  connectSocket: () => void;
}
export const authStore = createStore<IAuthState>((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      console.log(res.data, "check data");
      set({ authUser: res.data });
    } catch (error) {
      console.log("Error in checkAuth", error);
    } finally {
      set({ isCheckingAuth: false });
    }
  },
  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
      console.log(res, "check the res", res.data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log(error, "check error");
      toast.error(error?.response?.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },
  connectSocket: () => {
    // Placeholder: implement socket initialization here when socket utility is available
  },
}));
