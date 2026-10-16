"use client";

import { useState } from "react";
import type { CertContext } from "@/lib/certificate/sources";
import type { DesignDTO } from "@/lib/designs";
import DesignsPanel from "../programs/[id]/design/DesignsPanel";

export default function LibraryClient(p: { userId: string; isPro: boolean; designs: DesignDTO[]; sample: CertContext }) {
  const [designs, setDesigns] = useState(p.designs);
  return (
    <DesignsPanel
      logoUrl={null}
      programId={null}
      userId={p.userId}
      isPro={p.isPro}
      designs={designs}
      activeId={null}
      sample={p.sample}
      fields={[]}
      onDesignsChange={setDesigns}
      onActiveChange={() => {}}
    />
  );
}
