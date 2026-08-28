"use client";

import { useParams } from "next/navigation";
import { VorgangDetailContent } from "@/components/VorgangDetailContent";

export default function VorgangDetailPage() {
  const params = useParams<{ id: string }>();

  return (
    <section className="mx-auto max-w-3xl px-6 py-10">
      <VorgangDetailContent vorgangId={params.id} />
    </section>
  );
}
