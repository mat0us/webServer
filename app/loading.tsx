import { Logo } from "@/components/ui/Logo";

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-green-400 to-green-600">
      <div className="animate-pulse-scale">
        <Logo size={96} className="text-white filter brightness-0 invert" />
      </div>
    </div>
  );
}
