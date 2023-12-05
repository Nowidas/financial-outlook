import { useEffect, useState } from "react";

import { AgreementsModal } from "../modals/aggrements-modal";
import { TypeModal } from "../modals/type-modal";
import { TypeRuleModal } from "../modals/typerule-modal";
import axiosSesion from "../helpers/sesioninterceptor";

export const ModalProvider = () => {
    const [isMounted, setIsMounted] = useState(false);
    const [allIcon, setAllIcon] = useState([]);

    useEffect(() => {
        const fetchAllIcon = async () => {
            try {
                const response = await axiosSesion.get('http://127.0.0.1:8000/claudinary/');
                console.log(response);
                setAllIcon(response.data.data); // Assuming the icons are available in the response data
            } catch (error) {
                console.error("Error fetching icons", error);
                setAllIcon([]);
            }
        };

        fetchAllIcon();
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null;
    }

    return (
        <>
            <AgreementsModal />
            <TypeModal allIcon={allIcon} />
            <TypeRuleModal />
        </>
    )
}