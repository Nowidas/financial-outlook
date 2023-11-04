import React from "react";
import { Navbar } from "../global/MainMenuGlobalComponent";

// Pass the child props
export default function Layout({ children }) {
    return (
        <div className="grow">
            <Navbar />
            <div className="flex items-top justify-left space-x-2 m-4">
                {/* display the child prop */}

                {children}
            </div>
        </div>
    );
}