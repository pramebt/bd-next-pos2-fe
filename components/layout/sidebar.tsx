"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { TOKEN_KEY } from "@/lib/config";
import {
  LayoutDashboard,
  ShoppingBag,
  Utensils,
  Package,
  Users,
  FileText,
  BarChart3,
  Calendar,
  Building2,
  ChefHat,
  LogOut,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

const menuItems = [
  {
    title: "Dashboard",
    href: "/backoffice/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "ขาย POS",
    href: "/backoffice/sale",
    icon: ShoppingBag,
  },
  {
    title: "จัดการอาหาร",
    href: "/backoffice/food",
    icon: Utensils,
  },
  {
    title: "ประเภทอาหาร",
    href: "/backoffice/food-type",
    icon: ChefHat,
  },
  {
    title: "ขนาดอาหาร",
    href: "/backoffice/food-size",
    icon: Package,
  },
  {
    title: "รสชาติ",
    href: "/backoffice/taste",
    icon: ChefHat,
  },
  {
    title: "จัดการผู้ใช้",
    href: "/backoffice/user",
    icon: Users,
  },
  {
    title: "ข้อมูลองค์กร",
    href: "/backoffice/organization",
    icon: Building2,
  },
];

const reportItems = [
  {
    title: "รายงานบิลขาย",
    href: "/backoffice/report-bill-sale",
    icon: FileText,
  },
  {
    title: "รายงานยอดขายรายวัน",
    href: "/backoffice/report-sum-sale-per-day",
    icon: Calendar,
  },
  {
    title: "รายงานยอดขายรายเดือน",
    href: "/backoffice/report-sum-sale-per-month",
    icon: BarChart3,
  },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [userLevel, setUserLevel] = useState<string>("user");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // Get user level from localStorage
    const level = localStorage.getItem("next_user_level") || "user";
    setUserLevel(level);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Simulate logout delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem("user");
      localStorage.removeItem("next_name");
      localStorage.removeItem("next_user_id");
      localStorage.removeItem("next_user_level");
      
      toast.success("ออกจากระบบสำเร็จ");
      router.push("/signin");
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการออกจากระบบ");
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Filter menu items based on user level
  const getFilteredMenuItems = () => {
    if (userLevel === "admin") {
      return menuItems;
    } else {
      // User can only see POS
      return menuItems.filter(item => item.href === "/backoffice/sale");
    }
  };

  const getFilteredReportItems = () => {
    if (userLevel === "admin") {
      return reportItems;
    } else {
      // User cannot see reports
      return [];
    }
  };

  const isActive = (href: string) => {
    // Exact match
    if (pathname === href) {
      return true;
    }

    return pathname.startsWith(href + "/");
  };

  return (
    <div className="flex flex-col h-full bg-card border-r border-border">
      {/* Logo/Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <ShoppingBag className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-foreground">POS System</h1>
            <p className="text-xs text-muted-foreground">Back Office</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        <div className="space-y-1">
          <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            เมนูหลัก
          </p>
          {getFilteredMenuItems().map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </div>

        {getFilteredReportItems().length > 0 && (
          <div className="space-y-1 mt-6">
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              รายงาน
            </p>
            {getFilteredReportItems().map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-border">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoggingOut ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>กำลังออกจากระบบ...</span>
            </>
          ) : (
            <>
              <LogOut className="w-5 h-5" />
              <span>ออกจากระบบ</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
