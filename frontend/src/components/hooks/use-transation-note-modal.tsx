import { create } from "zustand";

interface transactionNoteInterface {
    id: string;
    note: string;
}

interface useTransactionNoteInterface {
    transaction: transactionNoteInterface;
    isOpen: boolean;
    onOpen: (transaction: transactionNoteInterface) => void;
    onClose: () => void;
};

export const useTransactionNote = create<useTransactionNoteInterface>((set) => ({
    transaction: { id: '', note: '' },
    isOpen: false,
    onOpen: (transaction) => set({ transaction: { id: transaction.id, note: transaction.note }, isOpen: true }),
    onClose: () => set({ isOpen: false, transaction: { id: '', note: '' } }),
}))