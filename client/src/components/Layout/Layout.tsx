import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Layout/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import ModeToggle from "../mode-toggle";
import { NavLink, Outlet } from "react-router";

const Layout = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <SidebarProvider defaultOpen={true}>
        <div className="flex max-h-screen w-full">
          <AppSidebar />
          <SidebarInset className="flex-1 flex flex-col min-h-0">
            {/* Header */}
            <header className="sticky top-0 z-40 flex h-16 items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="flex items-center gap-4 px-4 w-full">
                <SidebarTrigger className="h-8 w-8" />
                <NavLink to="/" className="heading-4 logo-gradient">
                  What2Eat
                </NavLink>
                <div className="ml-auto flex items-center">
                  <ModeToggle />
                </div>
              </div>
            </header>

            {/* Content */}
            <div className="flex-1 flex w-full min-h-0 p-4">
              <Outlet />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
};

export default Layout;
