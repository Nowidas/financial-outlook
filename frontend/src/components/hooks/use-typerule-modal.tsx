import { create } from "zustand";

interface useTypeRulModalInterface {
    ruleId: string;
    isOpen: boolean;
    onOpen: (ruleId: string) => void;
    onClose: () => void;
};

export const useTypeRuleModal = create<useTypeRulModalInterface>((set) => ({
    ruleId: '',
    isOpen: false,
    onOpen: (ruleId) => set({ ruleId: ruleId, isOpen: true }),
    onClose: () => set({ isOpen: false, ruleId: '' }),
}))