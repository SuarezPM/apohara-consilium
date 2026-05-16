import { useState } from "react";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export interface ApiKeyInputProps {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
}

export function ApiKeyInput({ value, onChange, disabled }: ApiKeyInputProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="space-y-2">
      <Label htmlFor="api-key" className="flex items-center gap-2">
        <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
        Your Gemini API key
        <span className="text-xs font-normal text-muted-foreground">
          (BYOK — never stored)
        </span>
      </Label>
      <div className="flex gap-2">
        <Input
          id="api-key"
          type={revealed ? "text" : "password"}
          autoComplete="off"
          spellCheck={false}
          placeholder="AIzaSy..."
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={revealed ? "Hide API key" : "Show API key"}
          onClick={() => setRevealed((prev) => !prev)}
          disabled={disabled}
        >
          {revealed ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Your key is forwarded only to Google's Gemini endpoint via the Apohara
        Inti backend. It is never persisted in logs, audit blobs, or telemetry.
      </p>
    </div>
  );
}
