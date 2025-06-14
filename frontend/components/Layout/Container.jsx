import React from "react";

const Container = ({ children, className = "" }) => {
    return (
        <div className={`mx-auto w-full h-full px-4 max-w-7xl ${className}`}>
            {children}
        </div>
    );
};

export default Container;