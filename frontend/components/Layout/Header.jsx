import React, { useState, useRef, useEffect } from "react";
import { UserButton } from "./UserButton";
import { FiMenu } from "react-icons/fi";
import Link from "next/link";

const Header = ({ toggleCollapse, setToggleCollapse }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-14 bg-sky-300 flex items-center justify-between px-4 z-50 mb-2 shadow-sm transition-all duration-300">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setToggleCollapse(!toggleCollapse)}
          className="text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center"
        >
          <FiMenu className="w-6 h-6 text-white" />
        </button>
        <Link href="/" className="flex items-center">
          <span className="text-xl font-bold text-white ml-3">IntelTaskPJ</span>
        </Link>
      </div>
      <div className="absolute -top-1 right-0 z-50 hidden md:block">
        <UserButton />
      </div>
    </div>
  );
};

export default Header;