"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingBag, User, Lock, Eye, EyeOff } from "lucide-react";
import { signInSchema } from "@/lib/validations/auth";

export default function SignInPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    const checkToken = async () => {
      try {
        const tokenKey = process.env.NEXT_PUBLIC_TOKEN_KEY || "token";
        const token = localStorage.getItem(tokenKey);
        
        // If no token, skip check
        if (!token) {
          setIsCheckingToken(false);
          return;
        }

        // Verify token by calling a protected endpoint
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        await axiosInstance.get(`${apiUrl}/api/user/get-users`);
        
        // Token is valid, redirect to dashboard
        router.push("/backoffice");
      } catch (error: any) {
        // Token is invalid or expired, clear it and show signin page
        const tokenKey = process.env.NEXT_PUBLIC_TOKEN_KEY || "token";
        localStorage.removeItem(tokenKey);
        localStorage.removeItem('next_name');
        localStorage.removeItem('next_user_id');
        localStorage.removeItem('next_user_level');
        setIsCheckingToken(false);
      }
    };

    checkToken();
  }, [router]);

  const signin = async () => {
    try {
      const payload = {
        username,
        password,
      };

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const tokenKey = process.env.NEXT_PUBLIC_TOKEN_KEY || "token";

      const res = await axios.post(
        `${apiUrl}/api/user/signIn`,
        payload
      );

      if (res.data.token !== undefined) {
        localStorage.setItem(tokenKey, res.data.token);
        localStorage.setItem("next_name", res.data.name);
        localStorage.setItem("next_user_id", res.data.id);
        localStorage.setItem("next_user_level", res.data.level || "user");
        router.push("/backoffice");
      }
      toast.success("ลงชื่อเข้าใช้สำเร็จ", {
        description: "ลงชื่อเข้าใช้สำเร็จ",
      });
    } catch (e: any) {
      if (e.response?.status === 401) {
        toast.error("ตรวจ username", {
          description: "username ไม่ถูกต้อง",
        });
      } else {
        toast.error("error", {
          description: e.message,
        });
      }
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const result = signInSchema.safeParse({ username, password });
    if (!result.success) {
      const firstError = result.error.issues[0];
      toast.warning("กรุณากรอกข้อมูล", {
        description: firstError.message,
      });
      return;
    }
    
    setIsLoading(true);
    signin().finally(() => setIsLoading(false));
  };

  // Show loading while checking token
  if (isCheckingToken) {
    return (
      <div className="w-full max-w-md mx-auto px-4">
        <div className="backdrop-blur-2xl bg-card/90 border border-border rounded-3xl shadow-2xl shadow-black/10 dark:shadow-black/50 p-10 space-y-8">
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">กำลังตรวจสอบการเข้าสู่ระบบ...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto px-4">
      <div className="backdrop-blur-2xl bg-card/90 border border-border rounded-3xl shadow-2xl shadow-black/10 dark:shadow-black/50 p-10 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary border border-border shadow-lg">
            <ShoppingBag className="w-8 h-8 text-primary-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Welcome Back
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in to access your POS system
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Field */}
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium text-foreground px-1">
              Username
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/70 group-focus-within:text-primary transition-colors duration-200 z-10">
                <User className="w-5 h-5" />
              </div>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="h-14 pl-12 pr-4 rounded-2xl border border-input/50 bg-background/60 backdrop-blur-md shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/10 focus:bg-background/80 transition-all duration-200 text-base placeholder:text-muted-foreground/50 hover:border-primary/30 hover:bg-background/70"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-foreground px-1">
              Password
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/70 group-focus-within:text-primary transition-colors duration-200 z-10">
                <Lock className="w-5 h-5" />
              </div>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="h-14 pl-12 pr-12 rounded-2xl border border-input/50 bg-background/60 backdrop-blur-md shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/10 focus:bg-background/80 transition-all duration-200 text-base placeholder:text-muted-foreground/50 hover:border-primary/30 hover:bg-background/70"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-lg p-1.5 z-10"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="text-center pt-2">
          <p className="text-xs text-muted-foreground">
            Secure login with encrypted connection
          </p>
        </div>
      </div>
    </div>
  );
}
