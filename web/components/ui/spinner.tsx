import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12"
};

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <Loader2 
      className={cn(
        "animate-spin text-primary",
        sizeClasses[size],
        className
      )} 
    />
  );
}

// Full page loading spinner
export function FullPageSpinner({ className }: { className?: string }) {
  return (
    <div className={cn(
      "flex h-screen w-full items-center justify-center",
      className
    )}>
      <Spinner size="xl" />
    </div>
  );
}

// Inline loading spinner
export function InlineSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center p-4", className)}>
      <Spinner size="md" />
    </div>
  );
}

// Button loading spinner
export function ButtonSpinner({ className }: { className?: string }) {
  return <Spinner size="sm" className={className} />;
}
