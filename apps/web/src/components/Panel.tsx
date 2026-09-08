"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Maximize2, Minimize2, X } from "lucide-react";

export function Panel({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [maximized, setMaximized] = useState(false);

  function close() {
    router.back();
  }

  return (
    <div className="fixed inset-0 z-50">
      {!maximized && <div className="absolute inset-0 bg-black/40" onClick={close} />}
      <div
        className={`absolute inset-y-0 right-0 flex w-full flex-col overflow-y-auto border-l border-border bg-bg shadow-2xl transition-[max-width] ${
          maximized ? "max-w-full" : "max-w-2xl"
        }`}
      >
        <div className="absolute right-4 top-4 flex items-center gap-3">
          <button
            onClick={() => setMaximized((v) => !v)}
            className="text-text-muted transition hover:text-text"
            aria-label={maximized ? "Verkleinern" : "Maximieren"}
          >
            {maximized ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          <button onClick={close} className="text-text-muted transition hover:text-text" aria-label="Schließen">
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-10">{children}</div>
      </div>
    </div>
  );
}
