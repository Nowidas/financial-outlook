import { create } from "zustand";

interface useAgreementsModalInterface {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
};

export const useAgreementsModal = create<useAgreementsModalInterface>((set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
}))