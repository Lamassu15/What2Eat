import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/hooks/useAuth";

export const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  // Show a loading spinner while the auth state is being initialized.
  if (loading) {
    return <div>Loading...</div>;
  }

  // If the user is authenticated, render the child component.
  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
};
