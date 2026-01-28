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
    id: "moderation",
    href: "/admin/moderation",
    label: "Moderation",
    Icon: MdAdminPanelSettings,
  },
  {
    id: "posts",
    href: "/admin/posts",
    label: "Posts",
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
    <div className="bg-neutral-700 w-1/6 p-1.5 space-y-1.5">
      {menuItems.slice(0, 6).map((item) => {
        const isActive =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname?.startsWith(item.href);
        const itemClass =
          "flex py-2.5 px-3 gap-2 rounded items-center font-medium transition " +
          (isActive
            ? "bg-cyan-900 text-white"
            : "bg-neutral-600 text-white/90 hover:bg-neutral-500");
        return (
          <Link href={item.href} className={itemClass} key={item.id}>
            <item.Icon size={20} />
            {item.label}
          </Link>
        );
      })}
      <hr className="text-neutral-600 border-2 rounded-full m-4" />
      <Link
        href={menuItems[6].href}
        className={
          "flex py-2.5 px-3 gap-2 rounded items-center font-medium transition " +
          (pathname?.startsWith(menuItems[6].href)
            ? "bg-cyan-900 text-white"
            : "bg-neutral-600 text-white/90 hover:bg-neutral-500")
        }
      >
        {menuItems[6].label}
      </Link>
    </div>
  );
}
