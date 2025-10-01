import React from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

export const ToggleButton = React.forwardRef(({
  isActive = false,
  children,
  className,
  variant = "default",
  size = "sm",
  ...props
}, ref) => {
  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "h-8 px-2",
        isActive && "ring-2 ring-ring",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
});

ToggleButton.displayName = "ToggleButton";
