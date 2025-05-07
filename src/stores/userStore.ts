// store/userStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type User = {
  name: string;
  designation: string;
  company_name: string;
  contact_number: string;
  email: string;
  profile_image?: string;
  age?: number | string;
  id?: number;
  role?: string;
  

  // loginData?: {
  //   time_in: string;
  //   time_in_image: string;
  //   time_out: string;
  //   time_out_image: string;
  // };
} | null;

interface UserState {
  user: User;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: "user-storage",
    }
  )
);
