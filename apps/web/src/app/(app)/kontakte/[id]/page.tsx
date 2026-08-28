"use client";

import { useParams } from "next/navigation";
import { KontaktDetailContent } from "@/components/KontaktDetailContent";

export default function KontaktDetailPage() {
  const params = useParams<{ id: string }>();

  return (
    <section className="mx-auto max-w-3xl px-6 py-10">
      <KontaktDetailContent kontaktId={params.id} />
    </section>
  );
}
