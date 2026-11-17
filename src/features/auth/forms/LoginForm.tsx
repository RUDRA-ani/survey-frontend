
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";

import { loginAdmin } from "@/services/auth.service";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LoginFormValues = {
  email: string;
  password: string;
  rememberMe: boolean;
};

export default function LoginForm() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, setValue, watch } =
    useForm<LoginFormValues>({
      defaultValues: {
        email: "",
        password: "",
        rememberMe: false,
      },
    });

  const rememberMe = watch("rememberMe");

const submit = async (values: LoginFormValues) => {
  try {
    setIsLoading(true);

    const response = await loginAdmin({
      email: values.email.trim(),
      password: values.password,
    });

    if (!response.success) {
      toast.error(response.message || "Unable to login.");
      return;
    }

    // Store basic admin information.
    localStorage.setItem(
      "adminUser",
      JSON.stringify(response.data.user)
    );

    toast.success("Login successful");

    navigate("/", { replace: true });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      toast.error(
        error.response?.data?.message ||
          "Unable to login. Please try again."
      );
    } else {
      toast.error("Something went wrong. Please try again.");
    }
  } finally {
    setIsLoading(false);
  }
};

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl font-bold sm:text-2xl">
          Login
        </CardTitle>

        <CardDescription className="text-sm sm:text-base">
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(submit)}>
        <CardContent className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>

            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              disabled={isLoading}
              {...register("email", {
                required: "Email is required",
              })}
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="password">Password</Label>

        
            </div>

            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                className="pr-10"
                disabled={isLoading}
                {...register("password", {
                  required: "Password is required",
                })}
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="rememberMe"
              checked={rememberMe}
              disabled={isLoading}
              onCheckedChange={(checked) =>
                setValue("rememberMe", Boolean(checked))
              }
            />

            <Label
              htmlFor="rememberMe"
              className="text-sm font-medium"
            >
              Remember me
            </Label>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
