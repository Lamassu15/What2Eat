import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../hooks/useAuth";
import { NavLink, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import logo from "../assets/What2Eat.webp";

// ✅ Fixat: Zod schema
const loginSchema = z.object({
  email: z
    .string()
    .nonempty("Email is required")
    .email("Invalid email address"),
  password: z
    .string()
    .nonempty("Password is required")
    .min(8, "Password must be at least 8 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const { login, isLoggingIn, loginError } = useAuth();
  const navigate = useNavigate();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      // login() tar hand om API-anrop + uppdatering av user i AuthContext
      await login(data);
      navigate("/chat");
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <section className="w-full flex items-center justify-center">
      <section className="w-full max-w-sm md:max-w-3xl">
        <Card className="overflow-hidden p-0">
          <CardContent className="grid p-0 md:grid-cols-2">
            <Form {...form}>
              <form
                className="p-6 md:p-8"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                {loginError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {loginError.message ??
                        "Login failed. Please check your credentials and try again."}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex flex-col gap-6">
                  <div className="flex flex-col items-center text-center">
                    <h1 className="text-2xl font-bold">Welcome back</h1>
                    <p className="text-muted-foreground text-balance">
                      Login to your What2Eat account
                    </p>
                  </div>

                  {/* Email field */}
                  <div className="grid gap-3">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="email">Email</FormLabel>
                          <FormControl>
                            <Input
                              id="email"
                              type="email"
                              placeholder="alexander@example.com"
                              disabled={isLoggingIn}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Password field */}
                  <div className="grid gap-3">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="password">Password</FormLabel>
                          <FormControl>
                            <Input
                              id="password"
                              type="password"
                              placeholder="••••••••"
                              disabled={isLoggingIn}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Submit button */}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoggingIn}
                  >
                    {isLoggingIn && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Login
                  </Button>

                  <div className="text-center text-sm">
                    Don&apos;t have an account?{" "}
                    <NavLink to="/register" className="underline">
                      Sign up here
                    </NavLink>
                  </div>
                </div>
              </form>
            </Form>

            {/* Right side image */}
            <div className="bg-muted relative hidden md:block">
              <img
                src={logo}
                alt="What2Eat logo"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          </CardContent>
        </Card>
      </section>
    </section>
  );
};

export default Login;
