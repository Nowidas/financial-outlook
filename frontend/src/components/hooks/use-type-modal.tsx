import { create } from "zustand";

interface useTypeModalInterface {
    typeId: string;
    isOpen: boolean;
    onOpen: (typeId: string) => void;
    onClose: () => void;
};

export const useTypeModal = create<useTypeModalInterface>((set) => ({
    typeId: '',
    isOpen: false,
    onOpen: (typeId) => set({ typeId: typeId, isOpen: true }),
    onClose: () => set({ isOpen: false, typeId: '' }),
}))