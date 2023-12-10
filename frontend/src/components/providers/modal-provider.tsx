import { useEffect, useState } from "react";

import { AgreementsModal } from "../modals/aggrements-modal";
import { TypeModal } from "../modals/type-modal";
import { TypeRuleModal } from "../modals/typerule-modal";
import { TransactionNote } from "../modals/transations-note-modal";
import axiosSesion from "../helpers/sesioninterceptor";

export const ModalProvider = () => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null;
    }

    return (
        <>
            <AgreementsModal />
            <TypeModal />
            <TypeRuleModal />
            <TransactionNote />
        </>
    )
}