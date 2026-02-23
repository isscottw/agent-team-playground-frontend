"use client";

import { Settings, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiKeyModal } from "@/components/settings/ApiKeyModal";
import { HistoryModal } from "@/components/history/HistoryModal";
import { useState } from "react";
import { useOptionalTeam } from "@/contexts/TeamContext";

export function TopBar() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const team = useOptionalTeam();

  const handleLogoClick = () => {
    if (team) {
      team.setMode("design");
    }
  };

  return (
    <>
      <header className="h-12 border-b border-mid/15 bg-surface/80 backdrop-blur-sm flex items-center justify-between px-5">
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-2 text-fg font-medium text-sm tracking-tight hover:opacity-70 transition-opacity cursor-pointer"
        >
          <span className="text-base">◆</span>
          <span>Agent Team</span>
        </button>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setHistoryOpen(true)}>
            <History className="h-4 w-4 text-mid" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)}>
            <Settings className="h-4 w-4 text-mid" />
          </Button>
        </div>
      </header>

      <HistoryModal open={historyOpen} onOpenChange={setHistoryOpen} />
      <ApiKeyModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
