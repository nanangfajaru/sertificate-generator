"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { CSS_FONT } from "@/lib/certificate/fonts";
import { qrMatrix } from "@/lib/certificate/qr";
import type { Item, Layout, QrItem, TextItem } from "@/lib/certificate/types";

type Props = {
  layout: Layout;
  /** gambar latar (desain sendiri) */
  backgroundUrl?: string | null;
  className?: string;
  /** mode editor */
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  onMove?: (id: string, x: number, y: number) => void;
};

function FitText({ item, interactive, selected }: { item: TextItem; interactive: boolean; selected: boolean }) {
  const ref = useRef<SVGTextElement>(null);
  const [scale, setScale] = useState(1);
  const f = CSS_FONT[item.font];
  const text = item.text ?? "";

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !item.maxWidth) return setScale(1);
    const measure = () => {
      el.style.fontSize = `${item.size}px`;
      const len = el.getComputedTextLength();
      setScale(len > item.maxWidth! ? item.maxWidth! / len : 1);
    };
    measure();
    document.fonts?.ready.then(measure);
  }, [text, item.size, item.font, item.maxWidth, item.spacing]);

  return (
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
    >
      {text}
    </text>
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

function Shape({ item }: { item: Exclude<Item, TextItem | QrItem> }) {
  switch (item.type) {
    case "rect":
      return <rect x={item.x} y={item.y} width={item.w} height={item.h} fill={item.fill ?? "none"} stroke={item.stroke} strokeWidth={item.sw} opacity={item.opacity} />;
    case "line":
      return <line x1={item.x1} y1={item.y1} x2={item.x2} y2={item.y2} stroke={item.stroke} strokeWidth={item.sw ?? 1} opacity={item.opacity} />;
    case "circle":
      return <circle cx={item.cx} cy={item.cy} r={item.r} fill={item.fill ?? "none"} stroke={item.stroke} strokeWidth={item.sw} opacity={item.opacity} />;
    case "polygon":
      return <polygon points={item.points.map((p) => p.join(",")).join(" ")} fill={item.fill} opacity={item.opacity} />;
  }
}

export default function CertificateSvg({ layout, backgroundUrl, className, selectedId, onSelect, onMove }: Props) {
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
        if (item.type === "text") return wrap(<FitText item={item} interactive={interactive} selected={selectedId === id} />, item.x, item.y);
        if (item.type === "qr")
          return wrap(
            <>
              <rect x={item.x - 2} y={item.y - 2} width={item.size + 4} height={item.size + 4} fill="#fff" stroke={selectedId === id ? "#2563eb" : "none"} strokeWidth={1} />
              <Qr item={item} />
            </>,
            item.x,
            item.y,
          );
        return <Shape key={id} item={item} />;
      })}
    </svg>
  );
}
