import { useEffect, useState } from "react";

import { AgreementsModal } from "../modals/aggrements-modal";

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
        </>
    )
}