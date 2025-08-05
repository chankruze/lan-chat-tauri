import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/utils/cn";

interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export const Drawer = ({ open, onOpenChange, children }: DrawerProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    if (open) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onOpenChange]);

  if (typeof window === "undefined") return null;
  const drawerRoot = document.getElementById("drawer-root") || document.body;

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-50 transition-opacity duration-300",
        open
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none",
      )}
    >
      <div
        ref={overlayRef}
        onClick={(e) => {
          if (e.target === overlayRef.current) onOpenChange(false);
        }}
        className={cn(
          "absolute inset-0 bg-black/40 transition-opacity duration-300",
        )}
      />
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-white rounded-t-lg shadow-lg transition-transform duration-300",
          open ? "translate-y-0" : "translate-y-full",
        )}
      >
        <div className="p-4">{children}</div>
      </div>
    </div>,
    drawerRoot,
  );
};
