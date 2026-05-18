import { Code2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface CodeInputProps {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
}

export function CodeInput({ value, onChange, disabled }: CodeInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="code-input" className="flex items-center gap-2">
        <Code2 className="h-3.5 w-3.5 text-muted-foreground" />
        Code, diff, or task
      </Label>
      <Textarea
        id="code-input"
        rows={12}
        placeholder="Paste a GitHub PR URL, code diff, or natural-language task description..."
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="font-mono text-sm"
      />
      <p className="text-xs text-muted-foreground">
        Submissions are passed to Gemini for analysis and to 12 attacker models
        for adversarial review. Memory isolation (INV-15) is enforced by
        Apohara ContextForge between every plane.
      </p>
    </div>
  );
}
