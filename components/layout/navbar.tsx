"use client";

import { useEffect, useState } from "react";
import { Bell, Search, User as UserIcon, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import Sidebar from "./sidebar";

export default function Navbar() {
  const [name, setName] = useState("");

  useEffect(() => {
    const name = localStorage.getItem("next_name");
    setName(name ?? "");
  }, []);

  return (
    <div className="h-16 border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Mobile Menu Button */}
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl hover:bg-accent"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetTitle className="sr-only">เมนูนำทาง</SheetTitle>
              <Sidebar />
            </SheetContent>
          </Sheet>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md ml-4 lg:ml-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="ค้นหา..."
              className="pl-10 h-10 rounded-xl border-input/50 bg-background/60 backdrop-blur-sm focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2 lg:gap-4">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl hover:bg-accent"
          >
            <Bell className="w-5 h-5" />
          </Button>

          {/* User Profile */}
          <div className="flex items-center gap-2 lg:gap-3 px-2 lg:px-3 py-2 rounded-xl bg-accent/50">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-foreground">
                {name}
              </p>
              <p className="text-xs text-muted-foreground">Back Office</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
