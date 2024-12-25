import Image from "next/image";

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className, size = 40 }: LogoProps) {
  return (
    <Image
      src="/icons/logo.svg"
      alt="HydroLeaf Logo"
      width={size}
      height={size}
      className={className}
      priority
    />
  );
}
