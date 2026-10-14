"use client";

import { useTransition } from "react";
import { setVoucherActive } from "./actions";

export default function ToggleButton({ id, active }: { id: string; active: boolean }) {
  const [pending, start] = useTransition();
  return (
    <button className="btn btn-sm" disabled={pending} onClick={() => start(() => setVoucherActive(id, !active))}>
      {active ? "Nonaktifkan" : "Aktifkan"}
    </button>
  );
}
