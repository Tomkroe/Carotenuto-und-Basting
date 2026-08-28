"use client";

import { useParams } from "next/navigation";
import { Panel } from "@/components/Panel";
import { VorgangDetailContent } from "@/components/VorgangDetailContent";

export default function VorgangPanelPage() {
  const params = useParams<{ id: string }>();

  return (
    <Panel>
      <VorgangDetailContent vorgangId={params.id} />
    </Panel>
  );
}
