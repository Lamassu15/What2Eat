import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { Spinner } from "@/components/ui/spinner";

export const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  // Show a loading spinner while the auth state is being initialized.
  if (loading) {
    return (
      <div className="flex items-center justify-center w-full">
        <Spinner className="size-8 text-accent" />
      </div>
    );
  }

  // If the user is authenticated, render the child component.
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};
