import { AttackerCard } from "./AttackerCard";
import { ATTACKER_VENDORS } from "@/lib/vendors";
import type { AttackerResult } from "@/lib/types";

export interface AttackerGridProps {
  results?: AttackerResult[];
}

export function AttackerGrid({ results }: AttackerGridProps) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
      role="list"
      aria-label="9 cross-vendor adversarial attackers"
    >
      {ATTACKER_VENDORS.map((vendor, idx) => (
        <div role="listitem" key={vendor.model}>
          <AttackerCard vendor={vendor} result={results?.[idx]} />
        </div>
      ))}
    </div>
  );
}
