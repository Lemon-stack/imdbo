import { cn } from "@/lib/utils";

interface SiteContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: "narrow" | "default" | "wide";
}

const sizeClasses = {
  narrow: "max-w-2xl",
  default: "max-w-6xl",
  wide: "max-w-7xl",
};

export function SiteContainer({
  children,
  className,
  size = "default",
}: SiteContainerProps) {
  return (
    <div className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", sizeClasses[size], className)}>
      {children}
    </div>
  );
}