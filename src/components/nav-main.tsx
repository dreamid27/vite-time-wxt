import { IconCirclePlusFilled, IconMail, type Icon } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useNavigationStore, type Page } from "@/store/navigation-store";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    id: string;
    icon?: Icon;
  }[];
}) {
  const { currentPage, setPage } = useNavigationStore();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                tooltip={item.title}
                onClick={() => setPage(item.id as Page)}
                data-active={currentPage === item.id}
                className="data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
              >
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
