"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { getDatabase, ref, set } from 'firebase/database'; // Import pro Realtime Database
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LeafIcon, ArrowLeftIcon } from 'lucide-react'; // Přidáno ArrowLeftIcon
import Link from 'next/link'; // Import pro Link

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Uložení dat do Realtime Database
      const db = getDatabase(); // Získání instance databáze
      await set(ref(db, 'users/' + user.uid), {
        name,
        email,
        createdAt: new Date().toISOString(), // Zápis v ISO formátu
        lastLogin: new Date().toISOString()
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('Chyba při registraci:', error);
      setError('Chyba při registraci. Zkuste to prosím znovu.');
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
          <CardTitle className="text-2xl text-center">Registrace</CardTitle>
          <CardDescription className="text-center">
            Vytvořte si nový účet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleRegister}>
            <div className="space-y-2">
              <Label htmlFor="name">Jméno</Label>
              <Input
                id="name"
                type="text"
                placeholder="Vaše jméno"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
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
              Registrovat se
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
