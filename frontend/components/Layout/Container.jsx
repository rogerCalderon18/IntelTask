import React from "react";

const Container = ({ children, className = "" }) => {
    return (
        <div className={`mx-auto w-full h-full px-4 py-5 max-w-7xl ${className} z-10`}>
            {children}
        </div>
    );
};

export default Container;