"use client";

import { LucideIcons } from "lucide-react";

export interface SidebarItem {
  title: string;
  href: string;
  icon: keyof typeof LucideIcons;
  isActive?: boolean;
}

const sidebarItems: SidebarItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: "LayoutDashboard",
    isActive: true,
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: "BarChart3",
  },
  {
    title: "Users",
    href: "/dashboard/users",
    icon: "Users",
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: "Settings",
  },
];

export default function Sidebar() {
  return (
    <aside className="flex h-screen flex-col w-64 bg-white border-r border-gray-200">
      <div className="flex h-16 items-center justify-center border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">MyApp</h2>
      </div>
      <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
        {sidebarItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
              item.isActive
                ? "bg-primary/10 text-primary"
                : "hover:bg-gray-50 text-gray-700 hover:text-gray-900"
            }`}
          >
            {/* Icon would go here - using placeholder */}
            <span className="flex h-8 w-8 items-center justify-center bg-gray-200 rounded-full">
              {item.icon}
            </span>
            <span className="ml-3">{item.title}</span>
          </a>
        ))}
      </nav>
    </aside>
  );
}