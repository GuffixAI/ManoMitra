import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: "none" | "sm" | "md" | "lg";
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  full: "max-w-full"
};

const paddingClasses = {
  none: "",
  sm: "px-4 py-2",
  md: "px-6 py-4",
  lg: "px-8 py-6"
};

export function ResponsiveContainer({ 
  children, 
  className, 
  maxWidth = "full",
  padding = "md"
}: ResponsiveContainerProps) {
  return (
    <div className={cn(
      "w-full mx-auto",
      maxWidthClasses[maxWidth],
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
}

// Mobile-first responsive grid
export function ResponsiveGrid({ 
  children, 
  className,
  cols = { sm: 1, md: 2, lg: 3, xl: 4 }
}: {
  children: ReactNode;
  className?: string;
  cols?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}) {
  const gridCols = [
    `grid-cols-${cols.sm || 1}`,
    `md:grid-cols-${cols.md || 2}`,
    `lg:grid-cols-${cols.lg || 3}`,
    `xl:grid-cols-${cols.xl || 4}`
  ].join(" ");

  return (
    <div className={cn(
      "grid gap-4",
      gridCols,
      className
    )}>
      {children}
    </div>
  );
}

// Responsive text sizes
export function ResponsiveText({ 
  children, 
  className,
  size = "base"
}: {
  children: ReactNode;
  className?: string;
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl";
}) {
  const textSizes = {
    xs: "text-xs",
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
    "3xl": "text-3xl"
  };

  return (
    <div className={cn(
      textSizes[size],
      "leading-relaxed",
      className
    )}>
      {children}
    </div>
  );
}

// Responsive spacing
export function ResponsiveSpacing({ 
  children, 
  className,
  spacing = "md"
}: {
  children: ReactNode;
  className?: string;
  spacing?: "none" | "sm" | "md" | "lg" | "xl";
}) {
  const spacingClasses = {
    none: "",
    sm: "space-y-2",
    md: "space-y-4",
    lg: "space-y-6",
    xl: "space-y-8"
  };

  return (
    <div className={cn(
      spacingClasses[spacing],
      className
    )}>
      {children}
    </div>
  );
}
