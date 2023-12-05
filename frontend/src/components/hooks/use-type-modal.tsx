import { create } from "zustand";

interface typeInterface {
    id: string;
    type: string;
    icon_url: string;
}

interface useTypeModalInterface {
    typeId: typeInterface;
    isOpen: boolean;
    onOpen: (typeId: typeInterface) => void;
    onClose: () => void;
};

export const useTypeModal = create<useTypeModalInterface>((set) => ({
    typeId: { id: '', type: '', icon_url: '' },
    isOpen: false,
    onOpen: (typeId) => set({ typeId: { id: typeId.id, type: typeId.type, icon_url: typeId.icon_url }, isOpen: true }),
    onClose: () => set({ isOpen: false, typeId: { id: '', type: '', icon_url: '' } }),
}))