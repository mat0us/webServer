"use client"

import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LeafIcon, ArrowLeft } from 'lucide-react'; // Přidána ikona šipky
import { useRouter } from 'next/navigation';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter(); // Inicializace routeru

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Pokyny k obnovení hesla byly odeslány na váš email.');
      setError('');
    } catch (error) {
      setError('Chyba při odesílání emailu pro obnovení hesla.');
      setMessage('');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-green-400 to-green-600">
      <Card className="w-[350px]">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => router.push('/login')} className="flex items-center">
              <ArrowLeft className="w-6 h-6 text-green-500 mr-2" /> {/* Šipka zpět */}
              Zpět na přihlášení
            </button>
          </div>
          <div className="flex items-center justify-center mb-4">
            <LeafIcon className="w-12 h-12 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-center">Obnovení hesla</CardTitle>
          <CardDescription className="text-center">
            Zadejte svůj email pro obnovení hesla
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleResetPassword}>
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
            {message && <p className="text-green-500 text-sm">{message}</p>}
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button className="w-full mt-4" type="submit">
              Obnovit heslo
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
