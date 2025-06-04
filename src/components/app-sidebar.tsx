import * as React from "react";
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import { Button } from "@/components/ui/button";
import { MessageSquareText, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import logo from "@/assets/logo_horizontal.png";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Blocked Sites",
      id: "blocked-sites",
      icon: IconDashboard,
    },
    {
      title: "Blocked Words",
      id: "blocked-words",
      icon: IconListDetails,
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a
                href="#"
                className="w-[120px] h-[56px] text-left flex justify-start"
              >
                <img
                  src={logo}
                  alt="Blockie"
                  className="h-full object-contain"
                />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavDocuments items={data.documents} /> */}
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div
            className={cn(
              "relative overflow-hidden rounded-lg border p-4 shadow-sm transition-all duration-300",
              "bg-gradient-to-br from-primary/5 to-primary/10",
              "border-primary/20 hover:border-primary/30",
              "hover:shadow-md hover:shadow-primary/5"
            )}
          >
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/10"></div>
            <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/5"></div>

            <div className="relative z-10">
              <div className="mb-2 flex items-center gap-2">
                <MessageSquareText className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  We'd love your feedback!
                </span>
              </div>
              <p className="mb-3 text-xs text-muted-foreground">
                Help us improve your experience with our extension
              </p>
              <Button
                onClick={() =>
                  window.open("https://forms.gle/nG2Uuyw23CCsxmjLA", "_blank")
                }
                size="sm"
                variant="outline"
                className={cn(
                  "group relative overflow-hidden border-primary/20 bg-background/80 text-xs font-medium",
                  "hover:bg-primary/5 hover:text-foreground",
                  "transition-all duration-300"
                )}
              >
                <Sparkles className="mr-1.5 h-3.5 w-3.5 group-hover:scale-110 group-hover:text-primary transition-transform" />
                Share Feedback
              </Button>
            </div>
          </div>
        </motion.div>
      </SidebarFooter>
    </Sidebar>
  );
}
