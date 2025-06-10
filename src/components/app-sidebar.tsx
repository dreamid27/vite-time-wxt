import * as React from 'react';
import {
  IconCamera,
  IconDashboard,
  IconFileAi,
  IconFileDescription,
  IconHelp,
  IconListDetails,
  IconSearch,
  IconSettings,
} from '@tabler/icons-react';

import { NavMain } from '@/components/nav-main';
import { Button } from '@/components/ui/button';
import { MessageSquareText, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import logo from '@/assets/logo_horizontal.png';

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navMain: [
    {
      title: 'Blocked Sites',
      id: 'blocked-sites',
      icon: IconDashboard,
    },
    {
      title: 'Blocked Words',
      id: 'blocked-words',
      icon: IconListDetails,
    },
    {
      title: 'Settings',
      id: 'settings',
      icon: IconSettings,
    },
  ],
  navClouds: [
    {
      title: 'Capture',
      icon: IconCamera,
      isActive: true,
      url: '#',
      items: [
        {
          title: 'Active Proposals',
          url: '#',
        },
        {
          title: 'Archived',
          url: '#',
        },
      ],
    },
    {
      title: 'Proposal',
      icon: IconFileDescription,
      url: '#',
      items: [
        {
          title: 'Active Proposals',
          url: '#',
        },
        {
          title: 'Archived',
          url: '#',
        },
      ],
    },
    {
      title: 'Prompts',
      icon: IconFileAi,
      url: '#',
      items: [
        {
          title: 'Active Proposals',
          url: '#',
        },
        {
          title: 'Archived',
          url: '#',
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: 'Settings',
      url: '#',
      icon: IconSettings,
    },
    {
      title: 'Get Help',
      url: '#',
      icon: IconHelp,
    },
    {
      title: 'Search',
      url: '#',
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
      <SidebarFooter className="space-y-3">
        {/* Feedback Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div
            className={cn(
              'relative overflow-hidden rounded-lg border p-4 shadow-sm transition-all duration-300',
              'bg-gradient-to-br from-primary/5 to-primary/10',
              'border-primary/20 hover:border-primary/30',
              'hover:shadow-md hover:shadow-primary/5'
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
                  window.open('https://forms.gle/nG2Uuyw23CCsxmjLA', '_blank')
                }
                size="sm"
                variant="outline"
                className={cn(
                  'group relative overflow-hidden border-primary/20 bg-background/80 text-xs font-medium',
                  'hover:bg-primary/5 hover:text-foreground',
                  'transition-all duration-300'
                )}
              >
                <Sparkles className="mr-1.5 h-3.5 w-3.5 group-hover:scale-110 group-hover:text-primary transition-transform" />
                Share Feedback
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Website Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="group"
        >
          <a
            href="https://blockiee.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'flex items-center gap-3 rounded-lg border p-3 text-sm transition-all duration-300',
              'border-border/50 bg-background/80 hover:bg-accent/50',
              'hover:shadow-sm hover:shadow-primary/5'
            )}
          >
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-primary text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">
                Blockie Website
              </p>
              <p className="text-xs text-muted-foreground truncate">
                Visit our website
              </p>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5 text-muted-foreground opacity-0 -translate-x-1 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-200"
            >
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </a>
        </motion.div>
      </SidebarFooter>
    </Sidebar>
  );
}
