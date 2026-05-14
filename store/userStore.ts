import { create } from "zustand";

interface UserStore {
    idAdmin: boolean;
    setIsAdmin: (value: boolean) => void;
}

export const useUserStore = create<UserStore>((set) => ({
    idAdmin: false,
    setIsAdmin: (value: boolean) => set({ idAdmin: value }),
}));