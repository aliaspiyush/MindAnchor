"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Anchor, LogOut, LayoutDashboard, BookHeart, MessageSquareText, BarChart3, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "./Button";
import { useEffect, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/journal", label: "Journal", icon: BookHeart },
    { href: "/companion", label: "AI Companion", icon: MessageSquareText },
    { href: "/insights", label: "Insights", icon: BarChart3 },
  ];

  // Don't render navbar on auth pages or onboarding
  if (pathname.startsWith("/auth") || pathname.startsWith("/onboarding")) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-background">
            <Anchor size={18} strokeWidth={2.5} />
          </div>
          <span className="font-serif text-2xl tracking-tight text-text-primary">MindAnchor</span>
        </Link>

        {isAuthenticated ? (
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-1 bg-surface-elevated/50 p-1 rounded-lg border border-border">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      isActive ? "bg-white/[0.08] text-primary" : "text-text-muted hover:text-text-primary hover:bg-white/[0.04]"
                    }`}
                  >
                    <Icon size={16} />
                    {link.label}
                  </Link>
                );
              })}
            </div>
            
            <div className="flex items-center gap-2">
              <Link href="/settings">
                <Button variant="ghost" size="sm" className="w-10 px-0">
                  <Settings size={18} />
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="w-10 px-0 text-text-muted hover:text-danger">
                <LogOut size={18} />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">Log In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
