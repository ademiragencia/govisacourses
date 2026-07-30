import { create } from "zustand";

type QualifyStore = {
  open: boolean;
  openForm: () => void;
  closeForm: () => void;
};

export const useQualifyStore = create<QualifyStore>((set) => ({
  open: false,
  openForm: () => set({ open: true }),
  closeForm: () => set({ open: false }),
}));
