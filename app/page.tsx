import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LeafIcon } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-green-400 to-green-600">
      <div className="text-center">
        <LeafIcon className="w-24 h-24 mx-auto mb-4 text-white" />
        <h1 className="text-4xl font-bold text-white mb-4">Vítejte v HydroLeaf</h1>
        <p className="text-xl text-white mb-8">Chytrý monitorovací systém pro hydroponii</p>
        <div className="space-x-4">
          <Button asChild>
            <Link href="/login">Přihlásit se</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/register">Registrovat se</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}