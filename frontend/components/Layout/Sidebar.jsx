import classNames from "classnames";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { LogoutIcon } from "../icons";
import { useSession, signOut } from "next-auth/react";
import { useCallback } from "react";
import { menuItems } from "../../data/menuitems";

const Sidebar = ({ toggleCollapse, setToggleCollapse }) => {
  const [expandedItems, setExpandedItems] = useState([]);
  const router = useRouter();
  const { data: session } = useSession();

  const handleLogout = useCallback(async () => {
    await signOut({ redirect: true });
    window.location.href = "/"
  }, []);


  const handleExpand = (id) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const checkSubItemsActive = (subItems) => {
    return subItems.some((item) => {
      if (item.subItems) {
        return checkSubItemsActive(item.subItems);
      }

      if (item.link.includes("[estado]")) {
        const dynamicLink = item.link.replace("[estado]", router.query.estado || "");
        return router.asPath === dynamicLink;
      }

      return router.asPath === item.link;
    });
  };

  const getNavItemClasses = (menu) => {
    const isActive =
      (menu.subItems && checkSubItemsActive(menu.subItems)) ||
      (!menu.subItems && router.pathname.startsWith(menu.link));
    return classNames(
      "flex items-center cursor-pointer hover:bg-gray-100 rounded w-full overflow-hidden whitespace-nowrap mb-1",
      {
        "bg-blue-100": isActive,
      }
    );
  };

  const renderSubItems = (items, level = 1, parentId = "") => {
    return (
      <ul
        className={classNames(
          "ml-8 list-disc",
          {
            "text-gray-700": level === 2,
            "text-gray-600": level === 1,
          }
        )}
      >
        {items.map((item, index) => {
          const itemId = `${parentId}-${index}`;
          const hasSubItems = item.subItems && item.subItems.length > 0;

          return (
            <li key={index} className="py-1">
              {hasSubItems ? (
                <>
                  <div
                    className="flex items-center cursor-pointer justify-between"
                    onClick={() => handleExpand(itemId)}
                  >
                    <span
                      className={classNames(
                        "font-medium",
                        {
                          "text-sm": level === 1,
                          "text-xs": level === 2,
                        },
                        {
                          "text-blue-700 font-bold": level === 1 && checkSubItemsActive(item.subItems),
                          "text-blue-600 font-bold": level === 2 && checkSubItemsActive(item.subItems),
                        }
                      )}
                    >
                      {item.label}
                    </span>
                    {expandedItems.includes(itemId) ? (
                      <FiChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <FiChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                  {expandedItems.includes(itemId) && renderSubItems(item.subItems, level + 1, itemId)}
                </>
              ) : (
                <Link
                  href={item.link}
                  className={classNames(
                    "block font-medium",
                    {
                      "text-sm": level === 1,
                      "text-xs": level === 2,
                    },
                    {
                      "text-blue-700 font-bold": level === 1 && router.asPath === item.link,
                      "text-blue-600 font-bold": level === 2 && router.asPath === item.link,
                    }
                  )}
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div
      className={classNames(
        "h-screen pt-16 pb-4 bg-white flex flex-col justify-between transition-all duration-300 shadow-lg z-50",
        {
          "w-60 px-4": !toggleCollapse,
          "w-20 px-2": toggleCollapse,
          "fixed left-0 md:relative": true,
          "-translate-x-full md:translate-x-0": toggleCollapse && typeof window !== 'undefined' && window.innerWidth < 768
        }
      )}
    >
      <div className="flex flex-col h-full overflow-y-auto scrollbar-hide">

        <div className="flex flex-col items-start mt-4">
          {menuItems.map(({ id, icon: Icon, subItems, link, ...menu }) => {
            const hasSubItems = subItems && subItems.length > 0;

            return (
              <div key={id} className="w-full">
                <div
                  className={classNames(
                    getNavItemClasses({ subItems, link }),
                    "flex py-3 px-3 items-center justify-between"
                  )}
                  onClick={() => {
                    if (!hasSubItems && link) {
                      router.push(link);
                    } else {
                      handleExpand(id);
                    }
                  }}
                >
                  <div className="flex items-center">
                    <div className="w-6 h-6 flex items-center justify-center">
                      <Icon className={`w-6 h-6 text-gray-500 ${toggleCollapse ? "ml-1" : "w-6 h-6"}`} />
                    </div>
                    {!toggleCollapse && (
                      <span className="ml-3 text-sm font-medium text-gray-700">
                        {menu.label}
                      </span>
                    )}
                  </div>
                  {!toggleCollapse && hasSubItems && (
                    expandedItems.includes(id) ? (
                      <FiChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <FiChevronDown className="w-4 h-4 text-gray-500" />
                    )
                  )}
                </div>
                {!toggleCollapse && expandedItems.includes(id) && hasSubItems && (
                  renderSubItems(subItems, 1, id.toString())
                )}
              </div>
            );
          })}
        </div>

        <div
          className={classNames(
            "flex items-center px-3 py-3 cursor-pointer hover:bg-gray-100 rounded mt-auto mb-4",
            {
              "justify-center": toggleCollapse,
              "justify-start": !toggleCollapse,
            }
          )}
          onClick={() => {
            console.log("Cerrar sesión");
          }}
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <LogoutIcon className="w-5 h-5 text-red-500" />
          </div>
          {!toggleCollapse && (
            <span className="ml-3 text-sm font-medium text-red-500" onClick={handleLogout}>Cerrar sesión</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;