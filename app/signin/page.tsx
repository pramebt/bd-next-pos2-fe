"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { TOKEN_KEY } from "@/lib/config";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingBag, User, Lock, Eye, EyeOff } from "lucide-react";
import { signInSchema } from "@/lib/validations/auth";
import type { SignInResponse} from "@/types/api";
import { AxiosError } from "axios";

export default function SignInPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const signin = async () => {
    try {
      const payload = {
        username,
        password,
      };

      const res = await axiosInstance.post<SignInResponse>(
        `/api/user/signIn`,
        payload
      );

      if (res.data.token !== undefined) {
        localStorage.setItem(TOKEN_KEY, res.data.token);
        localStorage.setItem("next_name", res.data.name);
        localStorage.setItem("next_user_id", res.data.id.toString());
        localStorage.setItem("next_user_level", res.data.level || "user");
        
        // Show success toast before navigation
        toast.success("ลงชื่อเข้าใช้สำเร็จ", {
          description: "กำลังเข้าสู่ระบบ...",
        });
        
        // Small delay to show toast, then navigate
        setTimeout(() => {
          router.push("/backoffice");
        }, 300);
      }
    } catch (error) {
      const e = error as AxiosError<{ message?: string }>;
      if (e.response?.status === 401) {
        toast.error("ตรวจ username", {
          description: "username หรือ password ไม่ถูกต้อง",
        });
      } else {
        toast.error("เกิดข้อผิดพลาด", {
          description: e.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ",
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

  return (
    <div className="w-full max-w-md mx-auto px-4 relative">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-3xl">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-foreground">กำลังเข้าสู่ระบบ...</p>
          </div>
        </div>
      )}
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
