import { Github, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "#try", label: "Try it" },
  { href: "#how", label: "How it works" },
  { href: "/dashboard", label: "Dashboard", route: true },
  { href: "#compare", label: "Compare" },
  { href: "#why", label: "Why" },
];

const REPO_URL = "https://github.com/SuarezPM/apohara-probant";

export function Navbar() {
  return (
    <header
      className="sticky top-0 z-50 h-14 border-b border-border/40 backdrop-blur-md bg-background/80"
      role="banner"
    >
      <div className="container max-w-6xl h-full flex items-center justify-between gap-4">
        <a href="#top" className="flex items-center gap-3 group">
          <img
            src="/logo.svg"
            alt=""
            width={32}
            height={32}
            className="h-8 w-8"
            aria-hidden="true"
          />
          <span className="font-pixel-sans text-sm tracking-wide text-foreground group-hover:text-primary transition-colors">
            APOHARA
          </span>
          <Badge variant="outline" className="hidden sm:inline-flex font-mono text-[10px]">
            PROBANT
          </Badge>
        </a>

        <nav aria-label="Primary" className="hidden md:flex items-center gap-1">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={[
                "px-3 py-2 text-sm transition-colors rounded-md",
                item.route
                  ? "text-primary hover:text-primary/80 font-mono font-semibold border border-primary/30 hover:border-primary/60"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 text-xs font-mono text-muted-foreground hover:text-foreground border border-border/40 rounded-md hover:border-primary/40 transition-colors"
            aria-label="GitHub repository"
          >
            <Github className="h-3.5 w-3.5" />
            <span>SuarezPM/apohara-probant</span>
          </a>
          <Button asChild size="sm" variant="default" className="font-pixel-sans text-[11px] tracking-wider">
            <a href="#try">
              <Sparkles className="h-3.5 w-3.5" />
              Verify
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
