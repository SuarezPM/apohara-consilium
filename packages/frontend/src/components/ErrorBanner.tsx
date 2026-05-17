import { AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
  /** "destructive" (default, red) for hard errors; "info" (lime) for soft warnings
   *  like "Demo mode unavailable — please paste your Gemini key". */
  variant?: "destructive" | "info";
}

export function ErrorBanner({ message, onDismiss, variant = "destructive" }: ErrorBannerProps) {
  const isInfo = variant === "info";
  const Icon = isInfo ? Info : AlertCircle;
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-md border px-4 py-3 text-sm",
        isInfo
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-destructive/50 bg-destructive/10 text-destructive",
      )}
    >
      <Icon className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
      <p className="flex-1 leading-relaxed">{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss error"
          className={cn(
            "shrink-0 rounded p-0.5 focus-visible:outline-none focus-visible:ring-2",
            isInfo
              ? "hover:bg-primary/20 focus-visible:ring-primary"
              : "hover:bg-destructive/20 focus-visible:ring-destructive",
          )}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
