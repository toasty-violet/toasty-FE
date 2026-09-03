import { create } from "zustand";
import type { User } from "@/types/user";

interface UserState {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
}

//유저 정보(role, nickname)를 관리한다
export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
