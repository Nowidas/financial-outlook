import React from "react";
import { Navbar } from "../global/MainMenuGlobalComponent";

// Pass the child props
export default function Layout({ children }) {
    return (
        <div className="grow">
            <Navbar />
            <div className="flex flex-wrap items-top justify-left m-4 gap-2">
                {/* display the child prop */}

                {children}
            </div>
        </div>
    );
}