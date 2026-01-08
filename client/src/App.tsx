import { BrowserRouter, Routes, Route } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./context/AuthProvider";
import Layout from "@/components/Layout/Layout";
import CenteredLayout from "@/components/Layout/CenteredLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Account from "./pages/Account";
import Recipe from "./pages/Recipe";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { Toaster } from "./components/ui/sonner";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" />
      <AuthProvider>
        <TooltipProvider>
          <BrowserRouter>
            <Routes>
              {/* ✅ DefaultLayout för appen */}
              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/recipes/:id" element={<Recipe />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/account" element={<Account />} />
                  <Route path="chat" element={<Chat />} />
                </Route>
              </Route>

              {/* ✅ CenteredLayout för auth-sidor */}
              <Route element={<CenteredLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
