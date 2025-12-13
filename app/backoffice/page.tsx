"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, ShoppingBag, Utensils, Users } from "lucide-react";

export default function BackOfficePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/signin");
    }
  }, [router]);

  const quickActions = [
    {
      title: "Dashboard",
      description: "ดูภาพรวมระบบ",
      icon: LayoutDashboard,
      href: "/backoffice/dashboard",
      color: "bg-blue-500",
    },
    {
      title: "ขาย POS",
      description: "จัดการการขาย",
      icon: ShoppingBag,
      href: "/backoffice/sale",
      color: "bg-green-500",
    },
    {
      title: "จัดการอาหาร",
      description: "เพิ่ม แก้ไข อาหาร",
      icon: Utensils,
      href: "/backoffice/food",
      color: "bg-orange-500",
    },
    {
      title: "จัดการผู้ใช้",
      description: "จัดการผู้ใช้งานระบบ",
      icon: Users,
      href: "/backoffice/user",
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">ยินดีต้อนรับ</h1>
        <p className="text-muted-foreground mt-1">
          เลือกเมนูที่ต้องการใช้งาน
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Card
              key={action.href}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
              onClick={() => router.push(action.href)}
            >
              <CardHeader>
                <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mb-2`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg">{action.title}</CardTitle>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* Welcome Card */}
      <Card>
        <CardHeader>
          <CardTitle>ระบบ POS</CardTitle>
          <CardDescription>
            ระบบจัดการขายและรายงานสำหรับร้านค้า
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            เริ่มต้นใช้งานโดยเลือกเมนูจากแถบด้านซ้าย หรือคลิกที่ Quick Actions ด้านบน
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
