"use client";

import Link from "next/link";
import { Settings, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiKeyModal } from "@/components/settings/ApiKeyModal";
import { useState } from "react";

export function TopBar() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <header className="h-12 border-b border-mid/15 bg-surface/80 backdrop-blur-sm flex items-center justify-between px-5">
        <Link href="/team" className="flex items-center gap-2 text-fg font-medium text-sm tracking-tight">
          <span className="text-base">◆</span>
          <span>Agent Team</span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/history"
            className="inline-flex items-center justify-center h-9 w-9 bg-transparent text-fg hover:bg-fg/5 transition-colors"
          >
            <History className="h-4 w-4 text-mid" />
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)}>
            <Settings className="h-4 w-4 text-mid" />
          </Button>
        </div>
      </header>

      <ApiKeyModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
