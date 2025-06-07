"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// 導覽列項目
const navItems = [
  { href: "/dashboard/users", label: "用戶管理" },
  { href: "/dashboard/concerts", label: "演唱會管理" },
  { href: "/dashboard/orders", label: "訂單管理" },
];

export default function Navbar() {
  const pathname = usePathname();
  return (
    <nav className="w-full bg-white border-b shadow-sm">
      <ul className="flex gap-6 px-8 h-14 items-center">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`font-medium hover:text-primary transition ${
                pathname.startsWith(item.href) ? "text-primary underline" : "text-muted-foreground"
              }`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
} 