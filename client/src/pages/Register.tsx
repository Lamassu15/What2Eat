import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import RegisterForm from "@/components/RegisterForm";
import { NavLink } from "react-router";

const Register = () => {
  return (
    <div className="w-full flex items-center justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">
            Create Account
          </CardTitle>
          <CardDescription>
            Fill in the form below to get started.
            <div>
              have an account?{" "}
              <NavLink
                to="/login"
                className="text-primary underline-offset-2 hover:underline"
              >
                Log in
              </NavLink>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
