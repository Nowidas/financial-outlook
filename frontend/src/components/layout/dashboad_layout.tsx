import React from "react";
import { Navbar } from "../global/MainMenuGlobalComponent";
import { ModalProvider } from "../providers/modal-provider";

// Pass the child props
export default function Layout({ children }) {
    return (
        <div className="grow">
            <ModalProvider />
            <Navbar />
            <div className="flex flex-wrap items-top justify-left m-4 gap-2">
                {/* display the child prop */}

                {children}
            </div>
        </div>
    );
}