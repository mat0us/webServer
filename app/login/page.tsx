"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { LeafIcon, ArrowLeftIcon } from 'lucide-react'; // Přidáno ArrowLeftIcon

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (error) {
      setError('Nesprávné přihlašovací údaje');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-green-400 to-green-600">
      <Card className="w-[350px] relative"> {/* Přidán relative pro pozici šipky */}
        <Link href="/" className="absolute top-4 left-4 flex items-center text-foreground hover:text-gray-200"> {/* Link pro navigaci zpět */}
          <ArrowLeftIcon className="w-6 h-6" /> {/* Šipka zpět */}
        </Link>
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <LeafIcon className="w-12 h-12 text-green-500" />
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
            <Button className="w-full mt-4" type="submit">
              Přihlásit se
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center">
          <Link href="/forgot-password" className="text-sm text-blue-500 hover:underline">
            Zapomněli jste heslo?
          </Link>
          <Link href="/register" className="text-sm text-blue-500 hover:underline mt-2">
            Nemáte účet? Registrujte se
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
