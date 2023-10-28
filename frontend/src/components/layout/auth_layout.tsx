import React from "react";

// Pass the child props
export default function Layout({ children }) {
    return (
        <div className="grow">
            <div className="flex items-center justify-center h-full">
                {/* display the child prop */}
                {children}
            </div>
        </div>
    );
}