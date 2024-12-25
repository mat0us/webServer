import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-green-400 to-green-600">
      <div className="text-center">
        <Logo
          size={96}
          className="mx-auto mb-4 text-white filter brightness-0 invert"
        />
        <h1 className="text-4xl font-bold text-white mb-4">
          Vítejte v HydroLeaf
        </h1>
        <p className="text-xl text-white/90 mb-8">
          Chytrý monitorovací systém pro hydroponii
        </p>
        <div className="space-x-4">
          <Button
            asChild
            variant="outline"
            className="border-white/60 text-green-600 hover:bg-white/20 border-2"
          >
            <Link href="/login" prefetch>
              Přihlásit se
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="border-white/60 text-green-600 hover:bg-white/20 border-2"
          >
            <Link href="/register" prefetch>
              Registrovat se
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
