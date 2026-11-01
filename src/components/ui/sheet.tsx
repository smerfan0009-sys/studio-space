"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Sheet = DialogPrimitive.Root;

const SheetTrigger = DialogPrimitive.Trigger;

const SheetClose = DialogPrimitive.Close;

const SheetPortal = DialogPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName;

const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { [key: string]: any }
>(({ className, children, ...props }: any, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-50 gap-4 bg-[#faf8f5] p-6 shadow-2xl transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
        "inset-y-0 right-0 h-full w-full sm:w-[420px] sm:rounded-3xl sm:border sm:border-border/50 sm:bg-white/95 sm:backdrop-blur-xl",
        className
      )}
      {...props}
    >
      <div className="flex flex-col h-full overflow-y-auto">
        <div className="flex items-center justify-between mb-6 shrink-0">
          <span className="font-heading text-2xl font-bold tracking-tight text-foreground">Menu</span>
          <SheetClose asChild>
            <button aria-label="Close" className="rounded-full h-10 w-10 flex items-center justify-center hover:bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-ring">
              <X className="h-5 w-5 text-foreground" />
            </button>
          </SheetClose>
        </div>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </DialogPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = DialogPrimitive.Content.displayName;

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />;
const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6", className)} {...props} />;
const SheetTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => <h2 className={cn("font-heading text-lg font-semibold tracking-tight", className)} {...props} />;
const SheetDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => <p className={cn("text-sm text-muted-foreground", className)} {...props} />;

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetOverlay, SheetHeader, SheetFooter, SheetTitle, SheetDescription };
