"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { CSS_FONT } from "@/lib/certificate/fonts";
import { qrMatrix } from "@/lib/certificate/qr";
import type { Item, Layout, QrItem, TextItem } from "@/lib/certificate/types";

export type Highlight = { color: string; n: string };

type Props = {
  layout: Layout;
  /** tandai teks tertentu (mis. kolom yang dipetakan dari formulir) dengan kotak berwarna + nomor */
  highlight?: (item: TextItem | QrItem) => Highlight | null;
  /** gambar latar (desain sendiri) */
  backgroundUrl?: string | null;
  /** URL gambar untuk item bertipe image, berdasarkan `src` */
  images?: Record<string, string>;
  /** tampilkan tulisan "LOGO" pada posisi logo bila belum ada gambar (hanya untuk pratinjau di dalam aplikasi) */
  logoPlaceholder?: boolean;
  className?: string;
  /** mode editor */
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  onMove?: (id: string, x: number, y: number) => void;
};

function FitText({ item, interactive, selected, hl }: { item: TextItem; interactive: boolean; selected: boolean; hl?: Highlight | null }) {
  const ref = useRef<SVGTextElement>(null);
  const [scale, setScale] = useState(1);
  const [box, setBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const f = CSS_FONT[item.font];
  const text = item.text ?? "";
  const hasHl = !!hl;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      let k = 1;
      if (item.maxWidth) {
        el.style.fontSize = `${item.size}px`;
        const len = el.getComputedTextLength();
        k = len > item.maxWidth ? item.maxWidth / len : 1;
        setScale(k);
        el.style.fontSize = `${item.size * k}px`;
      }
      if (hasHl) {
        const b = el.getBBox();
        setBox((o) => (o && o.x === b.x && o.y === b.y && o.width === b.width && o.height === b.height ? o : { x: b.x, y: b.y, width: b.width, height: b.height }));
      }
    };
    measure();
    document.fonts?.ready.then(measure);
  }, [text, item.size, item.font, item.maxWidth, item.spacing, item.align, item.x, item.y, hasHl]);

  return (
    <>
      {hl && box && (
        <g pointerEvents="none">
          <rect x={box.x - 6} y={box.y - 3} width={box.width + 12} height={box.height + 6} rx={4} fill={hl.color} fillOpacity={0.14} stroke={hl.color} strokeWidth={1.4} strokeDasharray="5 3" />
          <circle cx={box.x - 6} cy={box.y - 3} r={13} fill={hl.color} />
          <text x={box.x - 6} y={box.y - 3 + 5} textAnchor="middle" fontSize={15} fontWeight={700} fill="#fff" style={{ fontFamily: "CertInter, sans-serif" }}>{hl.n}</text>
        </g>
      )}
      <text
        ref={ref}
        x={item.x}
        y={item.y}
        fontSize={item.size * scale}
        fill={item.color}
        fillOpacity={item.opacity}
        textAnchor={item.align === "left" ? "start" : item.align === "right" ? "end" : "middle"}
        style={{
          fontFamily: f.family,
          fontWeight: f.weight,
          letterSpacing: item.spacing ? `${item.spacing}px` : undefined,
          cursor: interactive ? "move" : undefined,
          userSelect: "none",
        }}
        stroke={selected ? "#2563eb" : "none"}
        strokeWidth={selected ? 0.4 : 0}
        transform={item.rotate ? `rotate(${item.rotate} ${item.x} ${item.y})` : undefined}
      >
        {text}
      </text>
    </>
  );
}

function Qr({ item }: { item: QrItem }) {
  const m = useMemo(() => qrMatrix(item.url ?? "https://example.com"), [item.url]);
  const n = m.length;
  const c = item.size / n;
  let d = "";
  m.forEach((row, y) =>
    row.forEach((on, x) => {
      if (on) d += `M${(item.x + x * c).toFixed(2)} ${(item.y + y * c).toFixed(2)}h${c.toFixed(2)}v${c.toFixed(2)}h-${c.toFixed(2)}z`;
    }),
  );
  return <path d={d} fill={item.color} />;
}

function Shape({ item, images }: { item: Exclude<Item, TextItem | QrItem>; images?: Record<string, string> }) {
  switch (item.type) {
    case "image":
      return images?.[item.src] ? <image href={images[item.src]} x={item.x} y={item.y} width={item.w} height={item.h} preserveAspectRatio={item.valign === "bottom" ? "xMidYMax meet" : "xMidYMid meet"} /> : null;
    case "rect":
      return <rect x={item.x} y={item.y} width={item.w} height={item.h} fill={item.fill ?? "none"} stroke={item.stroke} strokeWidth={item.sw} opacity={item.opacity} />;
    case "line":
      return <line x1={item.x1} y1={item.y1} x2={item.x2} y2={item.y2} stroke={item.stroke} strokeWidth={item.sw ?? 1} opacity={item.opacity} />;
    case "circle":
      return <circle cx={item.cx} cy={item.cy} r={item.r} fill={item.fill ?? "none"} stroke={item.stroke} strokeWidth={item.sw} opacity={item.opacity} />;
    case "path":
      return <path d={item.d} fill={item.fill ?? "none"} stroke={item.stroke} strokeWidth={item.sw} opacity={item.opacity} strokeLinecap={item.cap} strokeLinejoin="round" />;
    case "polygon":
      return <polygon points={item.points.map((p) => p.join(",")).join(" ")} fill={item.fill} opacity={item.opacity} />;
  }
}

export default function CertificateSvg({ layout, highlight, backgroundUrl, images, logoPlaceholder, className, selectedId, onSelect, onMove }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null);
  const interactive = !!onMove;

  const toLocal = (e: React.PointerEvent) => {
    const svg = svgRef.current!;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM()!.inverse());
    return { x: p.x, y: p.y };
  };

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      className={className}
      style={{ touchAction: interactive ? "none" : undefined }}
      onPointerDown={() => onSelect?.(null)}
      onPointerMove={(e) => {
        if (!drag.current || !onMove) return;
        const p = toLocal(e);
        onMove(drag.current.id, Math.round(p.x - drag.current.dx), Math.round(p.y - drag.current.dy));
      }}
      onPointerUp={() => (drag.current = null)}
      onPointerLeave={() => (drag.current = null)}
    >
      <rect width={layout.width} height={layout.height} fill={layout.bg ?? "#fff"} />
      {backgroundUrl && <image href={backgroundUrl} x={0} y={0} width={layout.width} height={layout.height} preserveAspectRatio="none" />}
      {layout.items.map((item, i) => {
        const id = item.id ?? String(i);
        const wrap = (child: React.ReactNode, x: number, y: number) =>
          interactive ? (
            <g
              key={id}
              onPointerDown={(e) => {
                e.stopPropagation();
                onSelect?.(id);
                const p = toLocal(e);
                drag.current = { id, dx: p.x - x, dy: p.y - y };
                (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
              }}
            >
              {child}
            </g>
          ) : (
            <g key={id}>{child}</g>
          );
        if (item.type === "text") return wrap(<FitText item={item} interactive={interactive} selected={selectedId === id} hl={highlight?.(item) ?? null} />, item.x, item.y);
        if (item.type === "image") {
          const url = images?.[item.src];
          const sel = selectedId === id;
          const isLogo = item.src === "logo";
          // Tanda tangan yang belum diunggah tidak diberi penanda di pratinjau biasa (hanya di editor).
          if (!url && !interactive && (!logoPlaceholder || !isLogo)) return null;
          return wrap(
            <>
              {url ? (
                <image href={url} x={item.x} y={item.y} width={item.w} height={item.h} preserveAspectRatio={item.valign === "bottom" ? "xMidYMax meet" : "xMidYMid meet"} />
              ) : !interactive ? (
                <text x={item.x + item.w / 2} y={item.y + item.h / 2 + item.h * 0.16} textAnchor="middle" fontSize={Math.max(14, item.h * 0.48)} fontWeight={700} letterSpacing={item.h * 0.12} fill="#94a3b8" style={{ fontFamily: "CertInter, sans-serif" }}>LOGO</text>
              ) : (
                <g>
                  <rect x={item.x} y={item.y} width={item.w} height={item.h} fill="#eef2ff" stroke="#6366f1" strokeDasharray="6 4" strokeWidth={1.5} rx={6} />
                  <text x={item.x + item.w / 2} y={item.y + item.h / 2 + 5} textAnchor="middle" fontSize={Math.max(12, item.h * 0.25)} fill="#4f46e5" style={{ fontFamily: "CertInter, sans-serif" }}>{isLogo ? "Logo penyelenggara" : `Tanda tangan ${item.src === "sig2" ? 2 : 1}`}</text>
                </g>
              )}
              {interactive && <rect x={item.x} y={item.y} width={item.w} height={item.h} fill="transparent" stroke={sel ? "#2563eb" : "none"} strokeWidth={1.5} />}
            </>,
            item.x,
            item.y,
          );
        }
        if (item.type === "qr") {
          const hl = highlight?.(item);
          return wrap(
            <>
              <rect x={item.x - 2} y={item.y - 2} width={item.size + 4} height={item.size + 4} fill="#fff" stroke={hl ? hl.color : selectedId === id ? "#2563eb" : "none"} strokeWidth={hl ? 2 : 1} strokeDasharray={hl ? "5 3" : undefined} />
              <Qr item={item} />
              {hl && (
                <g pointerEvents="none">
                  <circle cx={item.x - 2} cy={item.y - 2} r={13} fill={hl.color} />
                  <text x={item.x - 2} y={item.y + 3} textAnchor="middle" fontSize={15} fontWeight={700} fill="#fff" style={{ fontFamily: "CertInter, sans-serif" }}>{hl.n}</text>
                </g>
              )}
            </>,
            item.x,
            item.y,
          );
        }
        return <Shape key={id} item={item} images={images} />;
      })}
    </svg>
  );
}
