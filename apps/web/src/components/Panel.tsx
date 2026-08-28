"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";

export function Panel({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  function close() {
    router.back();
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={close} />
      <div className="absolute inset-y-0 right-0 flex w-full max-w-2xl flex-col overflow-y-auto border-l border-border bg-bg shadow-2xl">
        <button
          onClick={close}
          className="absolute right-4 top-4 text-text-muted transition hover:text-text"
          aria-label="Schließen"
        >
          <X size={20} />
        </button>
        <div className="px-6 py-10">{children}</div>
      </div>
    </div>
  );
}
