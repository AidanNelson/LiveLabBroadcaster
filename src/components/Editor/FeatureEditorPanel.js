"use client";

import Typography from "@/components/Typography";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * Shared chrome for side-panel stream/sketch editors (padding, title, optional divider).
 * Matches admin ProductionEditor: Label + fields in space-y-2 blocks.
 */
export function FeatureEditorHeader({
  title,
  titleIcon,
  children,
  className,
  withBottomBorder = true,
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 px-4 py-4 sm:px-6",
        withBottomBorder && "border-b border-[var(--ui-grey)]",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2 text-[var(--text-primary-color)]">
        {titleIcon}
        <Typography variant="heading" className="min-w-0">
          {title}
        </Typography>
      </div>
      {children}
    </div>
  );
}

export function FeatureEditorNameField({ label = "Name", children }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
