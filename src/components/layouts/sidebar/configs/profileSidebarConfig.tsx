"use client";

import {
    ArrowLeftIcon,
    BellIcon,
    GearIcon,
    PaletteIcon,
    ShieldIcon,
    UserIcon
} from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import type { SidebarConfig } from "../types";

export function useProfileSidebarConfig(): SidebarConfig {
  const pathname = usePathname();

  return {
    sections: [
      {
        id: "navigation",
        title: "Navigation",
        items: [
          {
            id: "back",
            label: "Back to Boards",
            icon: ArrowLeftIcon,
            href: "/board",
          }
        ],
      },
      {
        id: "profile-settings",
        title: "Profile Settings",
        items: [
          {
            id: "profile",
            label: "Profile",
            icon: UserIcon,
            href: "/profile",
            active: pathname === "/profile",
          },
          {
            id: "security",
            label: "Security",
            icon: ShieldIcon,
            href: "/profile/security",
            active: pathname === "/profile/security",
            // disabled: true,
          },
          {
            id: "preferences",
            label: "Preferences",
            icon: GearIcon,
            href: "/profile/preferences",
            active: pathname === "/profile/preferences",
            // disabled: true,
          },
          {
            id: "notifications",
            label: "Notifications",
            icon: BellIcon,
            href: "/profile/notifications",
            active: pathname === "/profile/notifications",
            // disabled: true,
          },
          {
            id: "appearance",
            label: "Appearance",
            icon: PaletteIcon,
            href: "/profile/appearance",
            active: pathname === "/profile/appearance",
            // disabled: true,
          },
        ],
      },
    ],
    account: {
      showAccountInfo: true,
    },
  };
}
