import { Home, Bot } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavUser } from "../NavUser";
import { NavLink } from "react-router";
import RecipesSidebar from "../RecipesSidebar";

// Menu items.
const links = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  // {
  //   title: "Dashboard",
  //   url: "/dashboard",
  //   icon: LayoutDashboard,
  // },
  {
    title: "Chat",
    url: "/chat",
    icon: Bot,
  },
];

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarGroupLabel>Navigation</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {links.map((link) => (
              <SidebarMenuItem key={link.title}>
                <SidebarMenuButton asChild>
                  <NavLink to={link.url} className="font-medium tracking-wide">
                    <link.icon />
                    <span className="">{link.title}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <RecipesSidebar />
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
