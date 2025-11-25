import { toast } from "react-toastify";
import { createStore } from "zustand";
import { axiosInstance } from "../lib/axios";

export interface IChathUser {
  _id: string;
  fullName: string;
  email: string;
  profilePic?: string;
  createdAt: string;
}

export interface IChatState {
  users: IChathUser[] | null;
  message: [] | null;
  isMessagesLoading: boolean;
  isUsersLoading: boolean;
  selectedUser: IChathUser | null;

  getUsers: () => Promise<void>;
  getMessages: (userId: number) => Promise<void>;
  setSelectedUser: (selectedUser: IChathUser) => Promise<void>;
}

export const chatStore = createStore<IChatState>((set) => ({
  users: null,
  message: null,
  selectedUser: null,
  isMessagesLoading: false,
  isUsersLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log("errorrrrrrrrr", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ message: res.data });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  //   todo: optimize this one later
  setSelectedUser: async (selectedUser) => set({ selectedUser }),
}));
