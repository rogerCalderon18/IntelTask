import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { UserButton } from "./UserButton"; // Importa el UserButton

const Layout = ({ children }) => {
  const [toggleCollapse, setToggleCollapse] = useState(false);

  return (
    <div className="h-screen flex w-full overflow-hidden">

      <Sidebar
        toggleCollapse={toggleCollapse}
        setToggleCollapse={setToggleCollapse}
      />

      <Header
        toggleCollapse={toggleCollapse}
        setToggleCollapse={setToggleCollapse}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 p-4 mt-16 overflow-auto">
          {children}
        </div>
      </div>
      
    </div>
  );
};

export default Layout;
