import { useMemo } from "react";

interface LedgerEntry {
  verdict: "verified" | "risky" | "blocked";
  ts: number;
}

interface Props {
  entries: LedgerEntry[];
}

interface Bucket {
  label: string;
  verified: number;
  risky: number;
  blocked: number;
}

const BUCKET_MINUTES = 5;
const W = 560;
const H = 96;
const PAD_L = 28;
const PAD_R = 8;
const PAD_T = 8;
const PAD_B = 20;
const CHART_W = W - PAD_L - PAD_R;
const CHART_H = H - PAD_T - PAD_B;

function bucketEntries(entries: LedgerEntry[]): Bucket[] {
  if (entries.length === 0) return [];

  // entries are newest-first — reverse for chronological order
  const sorted = [...entries].reverse();
  const bucketMs = BUCKET_MINUTES * 60 * 1000;

  const firstTs = sorted[0].ts * 1000;
  const lastTs = sorted[sorted.length - 1].ts * 1000;

  // build bucket starts
  const starts: number[] = [];
  let t = firstTs - (firstTs % bucketMs);
  while (t <= lastTs) {
    starts.push(t);
    t += bucketMs;
  }
  if (starts.length === 0) starts.push(firstTs - (firstTs % bucketMs));

  const map = new Map<number, Bucket>();
  for (const start of starts) {
    const d = new Date(start);
    const label = `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
    map.set(start, { label, verified: 0, risky: 0, blocked: 0 });
  }

  for (const e of sorted) {
    const ms = e.ts * 1000;
    const bucketStart = ms - (ms % bucketMs);
    const b = map.get(bucketStart);
    if (b) b[e.verdict]++;
  }

  return [...map.values()];
}

function toPoints(buckets: Bucket[], key: "verified" | "risky" | "blocked", maxY: number): string {
  if (buckets.length < 2) return "";
  const xStep = CHART_W / (buckets.length - 1);
  return buckets
    .map((b, i) => {
      const x = PAD_L + i * xStep;
      const y = PAD_T + CHART_H - (maxY > 0 ? (b[key] / maxY) * CHART_H : 0);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function VerdictTrendChart({ entries }: Props) {
  const buckets = useMemo(() => bucketEntries(entries), [entries]);

  if (buckets.length < 2) {
    return (
      <p className="text-muted-foreground font-mono text-sm">
        {entries.length === 0
          ? "No recent verifications — trend chart will appear once data arrives."
          : "Not enough data points for trend (need ≥2 time buckets)."}
      </p>
    );
  }

  const maxY = Math.max(
    ...buckets.map((b) => Math.max(b.verified, b.risky, b.blocked)),
    1,
  );

  const verifiedPts = toPoints(buckets, "verified", maxY);
  const riskyPts = toPoints(buckets, "risky", maxY);
  const blockedPts = toPoints(buckets, "blocked", maxY);

  // y-axis labels: 0 and maxY
  const yTop = PAD_T;
  const yBot = PAD_T + CHART_H;

  // x-axis: show first, middle, last label
  const xLabels: { label: string; x: number }[] = [];
  const xStep = CHART_W / (buckets.length - 1);
  const midIdx = Math.floor((buckets.length - 1) / 2);
  for (const idx of [0, midIdx, buckets.length - 1]) {
    if (xLabels.find((l) => l.x === PAD_L + idx * xStep)) continue;
    xLabels.push({ label: buckets[idx].label, x: PAD_L + idx * xStep });
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      aria-label="Verdict trend over time"
      className="max-w-full"
    >
      {/* grid lines */}
      {[0, 0.5, 1].map((frac) => {
        const y = PAD_T + CHART_H * (1 - frac);
        return (
          <line
            key={frac}
            x1={PAD_L}
            x2={PAD_L + CHART_W}
            y1={y}
            y2={y}
            stroke="currentColor"
            strokeOpacity={0.1}
            strokeWidth={1}
          />
        );
      })}

      {/* y-axis labels */}
      <text x={PAD_L - 4} y={yTop + 4} textAnchor="end" fontSize={9} fill="currentColor" fillOpacity={0.5}>
        {maxY}
      </text>
      <text x={PAD_L - 4} y={yBot} textAnchor="end" fontSize={9} fill="currentColor" fillOpacity={0.5}>
        0
      </text>

      {/* x-axis labels */}
      {xLabels.map(({ label, x }) => (
        <text key={label} x={x} y={H - 4} textAnchor="middle" fontSize={9} fill="currentColor" fillOpacity={0.5}>
          {label}
        </text>
      ))}

      {/* lines */}
      <polyline points={verifiedPts} fill="none" stroke="#22c55e" strokeWidth={2} strokeLinejoin="round" />
      <polyline points={riskyPts} fill="none" stroke="#ca8a04" strokeWidth={2} strokeLinejoin="round" />
      <polyline points={blockedPts} fill="none" stroke="#ef4444" strokeWidth={2} strokeLinejoin="round" />
    </svg>
  );
}
