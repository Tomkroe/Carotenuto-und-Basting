"use client";

import { useParams } from "next/navigation";
import { Panel } from "@/components/Panel";
import { KontaktDetailContent } from "@/components/KontaktDetailContent";

export default function KontaktPanelPage() {
  const params = useParams<{ id: string }>();

  return (
    <Panel>
      <KontaktDetailContent kontaktId={params.id} />
    </Panel>
  );
}
