import { z } from "zod";

const num = (min: number, max: number) => z.number().finite().min(min).max(max);
const source = z.string().regex(/^(event:[a-z0-9_]+|field:[0-9a-f-]{36}|slot:[a-z]+)$/);
const color = z.string().regex(/^#[0-9a-fA-F]{6}$/);

const text = z.object({
  type: z.literal("text"),
  id: z.string().max(40),
  x: num(-200, 3000),
  y: num(-200, 3000),
  size: num(6, 200),
  font: z.enum(["sans", "sans-bold", "serif", "serif-bold", "script"]),
  color,
  align: z.enum(["left", "center", "right"]),
  source: source.optional(),
  text: z.string().max(200).optional(),
  maxWidth: num(20, 3000).optional(),
  upper: z.boolean().optional(),
  spacing: num(0, 30).optional(),
  prefix: z.string().max(40).optional(),
});

const qr = z.object({
  type: z.literal("qr"),
  id: z.string().max(40),
  x: num(-200, 3000),
  y: num(-200, 3000),
  size: num(20, 400),
  color,
});

const image = z.object({
  type: z.literal("image"),
  id: z.string().max(40),
  x: num(-200, 3000),
  y: num(-200, 3000),
  w: num(10, 1500),
  h: num(10, 1500),
  src: z.enum(["logo", "sig1", "sig2"]),
  valign: z.enum(["bottom", "middle"]).optional(),
});

export const customLayoutSchema = z.object({
  width: z.literal(1000),
  height: num(300, 3000),
  items: z.array(z.discriminatedUnion("type", [text, qr, image])).max(40),
});
