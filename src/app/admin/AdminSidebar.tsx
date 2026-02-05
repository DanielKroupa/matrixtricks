"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconType } from "react-icons";
import { MdAdminPanelSettings, MdDataset } from "react-icons/md";
import { IoMdSettings } from "react-icons/io";
import { RiMoneyDollarCircleFill } from "react-icons/ri";
import { IoBrush } from "react-icons/io5";
import { FaShoppingCart } from "react-icons/fa";

type MenuItem = {
  id: string;
  href: string;
  label: string;
  Icon: IconType;
};

const menuItems: MenuItem[] = [
  {
    id: "profile",
    href: "/admin",
    label: "User profile settings",
    Icon: IoMdSettings,
  },
  {
    id: "posts",
    href: "/admin/posts",
    label: "Posts",
    Icon: MdAdminPanelSettings,
  },
  {
    id: "moderation",
    href: "/admin/moderation",
    label: "Moderation",
    Icon: MdAdminPanelSettings,
  },

  { id: "rubrics", href: "/admin/rubrics", label: "Rubrics", Icon: MdDataset },
  {
    id: "monetization",
    href: "/admin/monetization",
    label: "Monetization",
    Icon: RiMoneyDollarCircleFill,
  },
  { id: "graphic", href: "/admin/graphics", label: "Graphic", Icon: IoBrush },
  { id: "eshop", href: "/admin/eshop", label: "E-shop", Icon: FaShoppingCart },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="min-h-175 w-1/6 space-y-1.5 rounded-bl-md bg-neutral-200 p-1.5 dark:bg-neutral-700">
      {menuItems.slice(0, 6).map((item) => {
        const isActive =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname?.startsWith(item.href);
        const itemClass =
          "flex py-2.5 px-3 gap-2 rounded items-center md:justify-start justify-center font-medium transition " +
          (isActive
            ? "dark:bg-cyan-900 bg-cyan-800 text-white"
            : "dark:bg-neutral-600 bg-neutral-300 dark:text-white/90 text-neutral-800 dark:hover:bg-neutral-500 hover:bg-neutral-400");
        return (
          <Link href={item.href} className={itemClass} key={item.id}>
            <item.Icon size={20} />
            <span className="hidden md:block">{item.label}</span>
          </Link>
        );
      })}
      <hr className="m-4 rounded-full border-2 text-neutral-300 dark:text-neutral-600" />
      <Link
        href={menuItems[6].href}
        className={
          "flex cursor-pointer items-center gap-2 rounded px-3 py-2.5 font-medium transition" +
          (pathname?.startsWith(menuItems[6].href)
            ? "bg-cyan-800 text-white dark:bg-cyan-900"
            : "bg-neutral-300 text-neutral-800 hover:bg-neutral-400 dark:bg-neutral-600 dark:text-white/90")
        }
      >
        <FaShoppingCart size={20} />
        <label htmlFor="" className="hidden cursor-pointer md:block">
          {" "}
          {menuItems[6].label}
        </label>
      </Link>
    </div>
  );
}
