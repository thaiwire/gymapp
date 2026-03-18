"use client";

import { logoutUser } from "@/actions/users";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { UserState, useUserStore } from "@/store/users-store";
import {
  BookOpen,
  Database,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  UserCircle,
  Users,
  WalletCards,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";

type MenuItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

const userMenuItems: MenuItem[] = [
  { label: "Template", href: "/user/template", icon: BookOpen },
  { label: "Resume Data", href: "/user/resume-data", icon: Database },
  { label: "Document Trans", href: "/user/doctrans", icon: Database },
  { label: "Profile", href: "/user/profile", icon: UserCircle },
  { label: "Settings", href: "/user/settings", icon: Settings },
];

const adminMenuItems: MenuItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  
  { label: "Subscriptions", href: "/admin/subscriptions", icon: WalletCards },
  { label: "Document Groups", href: "/admin/docgroup", icon: Database },
  { label: "Departments", href: "/admin/departments", icon: Database },
  { label: "Profile", href: "/admin/profile", icon: UserCircle },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

function PrivateHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser }: UserState = useUserStore();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const menuItems = useMemo(
    () => (user?.role === "admin" ? adminMenuItems : userMenuItems),
    [user?.role]
  );

  const handleMenuNavigate = (href: string) => {
    setIsSheetOpen(false);
    router.push(href);
  };

  const handleLogout = async () => {
    const result = await logoutUser();

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    setUser(null);
    setIsSheetOpen(false);
    toast.success(result.message);
    router.replace("/login");
  };

  return (
    <div className="bg-primary px-5 py-5 flex justify-between">
      <h1 className="text-2xl font-bold text-white">Resume Builder (TWP)</h1>

      <div className="flex items-center gap-5">
        <h1 className="text-sm text-white font-medium">
          {user?.name} {user?.role === "admin" ? "(Admin)" : "(User)"}
        </h1>

        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button
              size="icon-sm"
              variant="ghost"
              className="text-white hover:bg-white/20 hover:text-white"
            >
              <Menu size={18} />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>

          <SheetContent side="right" className="w-[320px] sm:max-w-[320px] p-0">
            <div className="h-full flex flex-col gap-4 p-5">
              <SheetHeader className="p-0 pr-8">
                <SheetTitle>Menu</SheetTitle>
                <p className="text-sm text-muted-foreground">
                  {user?.role === "admin" ? "Admin" : "User"} navigation
                </p>
              </SheetHeader>

              <div className="flex flex-col gap-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href || pathname.startsWith(`${item.href}/`);

                  return (
                    <Button
                      key={item.label}
                      variant="ghost"
                      className={`w-full justify-start h-10 border transition-colors ${
                        isActive
                          ? "bg-primary/10 border-primary/30 text-primary hover:bg-primary/15"
                          : "border-transparent hover:bg-muted"
                      }`}
                      onClick={() => handleMenuNavigate(item.href)}
                    >
                      <Icon
                        className={`mr-2 h-4 w-4 ${
                          isActive ? "text-primary" : "text-foreground"
                        }`}
                      />
                      {item.label}
                    </Button>
                  );
                })}
              </div>

              <div className="mt-6 border-t pt-4 border-border">
                <Button
                  variant="destructive"
                  className="mt-auto w-full"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}

export default PrivateHeader;