"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Anchor } from "lucide-react";

function LoginContent() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError) setError(urlError);
  }, [searchParams]);

  // handleLogin removed since Google OAuth is the only method

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Failed to initialize Google login.");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-primary">
            <Anchor size={24} strokeWidth={2.5} />
          </div>
          <CardTitle className="text-3xl">Welcome back</CardTitle>
          <p className="text-sm text-text-muted">Enter your details to sign in to your account</p>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="rounded-md bg-danger/10 p-3 mb-4 text-sm text-danger border border-danger/20">
              {error}
            </div>
          )}

          <Button 
            variant="primary" 
            className="w-full py-6 text-base" 
            onClick={handleGoogleLogin}
            type="button"
          >
            Continue with Google
          </Button>

          <div className="mt-6 text-center text-sm text-text-muted">
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center p-4">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
