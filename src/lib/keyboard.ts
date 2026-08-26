export interface KeyDef {
  k: string;
  s?: string;
  label?: string;
  cls?: "wide" | "xwide" | "space";
  bump?: boolean;
}

export const KB_ROWS: KeyDef[][] = [
  [
    { k: "`", s: "~" }, { k: "1", s: "!" }, { k: "2", s: "@" }, { k: "3", s: "#" },
    { k: "4", s: "$" }, { k: "5", s: "%" }, { k: "6", s: "^" }, { k: "7", s: "&" },
    { k: "8", s: "*" }, { k: "9", s: "(" }, { k: "0", s: ")" }, { k: "-", s: "_" },
    { k: "=", s: "+" }, { k: "Backspace", label: "back", cls: "wide" },
  ],
  [
    { k: "Tab", label: "tab", cls: "wide" }, { k: "q" }, { k: "w" }, { k: "e" },
    { k: "r" }, { k: "t" }, { k: "y" }, { k: "u" }, { k: "i" }, { k: "o" },
    { k: "p" }, { k: "[", s: "{" }, { k: "]", s: "}" }, { k: "\\", s: "|" },
  ],
  [
    { k: "Caps", label: "caps", cls: "wide" }, { k: "a" }, { k: "s" }, { k: "d" },
    { k: "f", bump: true }, { k: "g" }, { k: "h" }, { k: "j", bump: true },
    { k: "k" }, { k: "l" }, { k: ";", s: ":" }, { k: "'", s: '"' },
    { k: "Enter", label: "enter", cls: "xwide" },
  ],
  [
    { k: "ShiftL", label: "shift", cls: "xwide" }, { k: "z" }, { k: "x" }, { k: "c" },
    { k: "v" }, { k: "b" }, { k: "n" }, { k: "m" }, { k: ",", s: "<" },
    { k: ".", s: ">" }, { k: "/", s: "?" }, { k: "ShiftR", label: "shift", cls: "xwide" },
  ],
  [{ k: " ", label: "space", cls: "space" }],
];

export type Finger = "pinky" | "ring" | "mid" | "index" | "thumb";

export const FINGERS: Record<string, Finger> = {
  "`": "pinky", "1": "pinky", "2": "ring", "3": "mid", "4": "index", "5": "index",
  "6": "index", "7": "index", "8": "mid", "9": "ring", "0": "pinky", "-": "pinky", "=": "pinky",
  q: "pinky", w: "ring", e: "mid", r: "index", t: "index",
  y: "index", u: "index", i: "mid", o: "ring", p: "pinky", "[": "pinky", "]": "pinky", "\\": "pinky",
  a: "pinky", s: "ring", d: "mid", f: "index", g: "index",
  h: "index", j: "index", k: "mid", l: "ring", ";": "pinky", "'": "pinky",
  z: "pinky", x: "ring", c: "mid", v: "index", b: "index",
  n: "index", m: "index", ",": "mid", ".": "ring", "/": "pinky",
  " ": "thumb", Tab: "pinky", Caps: "pinky", ShiftL: "pinky", ShiftR: "pinky",
  Enter: "pinky", Backspace: "pinky",
};

const LEFT_KEYS = "`12345qwertasdfgzxcvb";

export const SHIFT_MAP: Record<string, string> = {};
for (const row of KB_ROWS) for (const K of row) if (K.s) SHIFT_MAP[K.s] = K.k;

/** For a target character, which key to press and which shift (if any). */
export function keysForChar(ch: string): { base: string; shift: "ShiftL" | "ShiftR" | null } {
  let base = ch;
  let needShift = false;
  if (/[A-Z]/.test(ch)) {
    base = ch.toLowerCase();
    needShift = true;
  } else if (SHIFT_MAP[ch]) {
    base = SHIFT_MAP[ch];
    needShift = true;
  }
  const shift = needShift ? (LEFT_KEYS.includes(base) ? "ShiftR" : "ShiftL") : null;
  return { base, shift };
}
