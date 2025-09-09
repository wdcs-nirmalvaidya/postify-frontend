"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Settings, Search } from "lucide-react";
import { useEffect, useState } from "react";

const Sidebar = () => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsAuthenticated(!!localStorage.getItem("token"));
  }, []);

  const navItems = [
    { name: "Home", href: "/feedpage", icon: <Home size={20} /> },
  ];

  if (mounted && isAuthenticated) {
    navItems.push(
      { name: "Explore", href: "/Explore", icon: <Search size={20} /> },
      { name: "Settings", href: "/settings", icon: <Settings size={20} /> },
    );
  }

  if (!mounted) {
    return (
      <aside className="h-screen w-64 bg-white border-r fixed top-0 left-0 shadow-sm z-40">
        <div className="h-16 flex items-center justify-center border-b">
          <h1 className="text-2xl font-bold">Postify</h1>
        </div>
      </aside>
    );
  }

  return (
    <aside className="h-screen w-64 bg-white border-r fixed top-0 left-0 shadow-sm z-40">
      <div className="h-16 flex items-center justify-center border-b">
        <h1 className="text-2xl font-bold">Postify</h1>
      </div>

      <nav className="flex flex-col p-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition ${
              pathname === item.href ? "bg-gray-100 font-semibold" : ""
            }`}
          >
            <span className="mr-3">{item.icon}</span>
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
