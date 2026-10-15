export type FontKey = "sans" | "sans-bold" | "serif" | "serif-bold" | "script";
export type Align = "left" | "center" | "right";

export const FONT_OPTIONS: { value: FontKey; label: string }[] = [
  { value: "sans", label: "Sans (Inter)" },
  { value: "sans-bold", label: "Sans tebal" },
  { value: "serif", label: "Serif (Playfair)" },
  { value: "serif-bold", label: "Serif tebal" },
  { value: "script", label: "Tulisan tangan" },
];

type Common = {
  id?: string;
  /** tampilkan hanya jika source ini menghasilkan teks (mis. penandatangan ke-2) */
  showIf?: string;
};

export type TextItem = Common & {
  type: "text";
  x: number;
  y: number; // baseline
  size: number;
  font: FontKey;
  color: string;
  align: Align;
  text?: string;
  /** sumber data dinamis: event:* | slot:* | field:<id>; kalau kosong pakai `text` */
  source?: string;
  prefix?: string;
  maxWidth?: number;
  upper?: boolean;
  spacing?: number;
  opacity?: number;
  /** derajat searah jarum jam, berputar pada titik (x, y) */
  rotate?: number;
};
export type RectItem = Common & {
  type: "rect";
  x: number;
  y: number;
  w: number;
  h: number;
  fill?: string;
  stroke?: string;
  sw?: number;
  opacity?: number;
};
export type LineItem = Common & { type: "line"; x1: number; y1: number; x2: number; y2: number; stroke: string; sw?: number; opacity?: number };
export type CircleItem = Common & { type: "circle"; cx: number; cy: number; r: number; fill?: string; stroke?: string; sw?: number; opacity?: number };
/** Jalur SVG (M L C Q A Z). Dipakai untuk ilustrasi: kelopak, daun, gelombang, bola, dsb. */
export type PathItem = Common & { type: "path"; d: string; fill?: string; stroke?: string; sw?: number; opacity?: number; cap?: "round" | "butt" };
export type PolygonItem = Common & { type: "polygon"; points: [number, number][]; fill: string; opacity?: number };
export type QrItem = Common & { type: "qr"; x: number; y: number; size: number; color: string; url?: string };

/** gambar (mis. tanda tangan); `src` = kunci gambar yang diberikan ke renderer */
export type ImageItem = Common & { type: "image"; x: number; y: number; w: number; h: number; src: string; /** posisi gambar di dalam kotak bila proporsinya berbeda; bawaan tengah */ valign?: "bottom" | "middle" };

export type Item = ImageItem | TextItem | RectItem | LineItem | CircleItem | PolygonItem | PathItem | QrItem;

/** Koordinat dalam "unit desain"; renderer menskalakan ke ukuran halaman. Titik (0,0) kiri-atas. */
export type Layout = {
  width: number;
  height: number;
  bg?: string;
  items: Item[];
};

export type CertTemplate = {
  id: string;
  name: string;
  tier: "free" | "pro";
  layout: Layout;
};
