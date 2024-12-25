"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/Logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeftIcon } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Kontrola, zda uživatel není již přihlášen
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        router.push("/dashboard");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (error) {
      console.error("Chyba při přihlášení:", error);
      setError("Nesprávné přihlašovací údaje");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-green-400 to-green-600">
      <Card className="w-[350px] relative">
        <Link
          href="/"
          className="absolute top-4 left-4 flex items-center text-foreground hover:text-gray-200"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </Link>
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Logo size={48} className="text-green-500" />
          </div>
          <CardTitle className="text-2xl text-center">Přihlášení</CardTitle>
          <CardDescription className="text-center">
            Zadejte své přihlašovací údaje
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleLogin}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="vas@email.cz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Heslo</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button className="w-full mt-4" type="submit" disabled={loading}>
              {loading ? "Přihlašování..." : "Přihlásit se"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center">
          <Link
            href="/forgot-password"
            className="text-sm text-blue-500 hover:underline"
          >
            Zapomněli jste heslo?
          </Link>
          <Link
            href="/register"
            className="text-sm text-blue-500 hover:underline mt-2"
          >
            Nemáte účet? Registrujte se
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
