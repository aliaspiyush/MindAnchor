"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Anchor } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // handleLogin removed since Google OAuth is the only method

  const handleGoogleLogin = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    } catch (err) {
      setError("Failed to initialize Google login.");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <Image src="/logo.png" alt="MindAnchor Logo" width={64} height={64} className="mx-auto rounded-xl shadow-sm object-cover" />
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
            variant="default" 
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
