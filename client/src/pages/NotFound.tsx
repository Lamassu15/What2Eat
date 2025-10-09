import { Link } from "react-router";
import { Button } from "../components/ui/button";

function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <div className="text-center bg-card rounded-lg shadow-lg p-8 max-w-md w-full border border-border">
        <h1 className="text-6xl font-extrabold text-primary mb-2">404</h1>
        <p className="text-xl font-semibold mb-2 text-foreground">
          Page Not Found
        </p>
        <p className="mb-6 text-muted-foreground">
          Page you are looking for does not exist or has been moved.
        </p>
        <Link to="/">
          <Button className="w-full">Return to home page</Button>
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
