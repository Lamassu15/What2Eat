import { ThemeProvider } from "@/components/theme-provider";
import { Outlet } from "react-router";

const CenteredLayout = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="flex min-h-screen w-full items-center justify-center p-4">
        <Outlet />
      </div>
    </ThemeProvider>
  );
};

export default CenteredLayout;
