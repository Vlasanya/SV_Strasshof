export type PrintMode = "none" | "initials";

export type CartLineItem = {
  lineKey: string;
  merchId: number;
  name: string;
  imageUrl: string | null;
  price: number;
  size: string;
  quantity: number;
  printMode: PrintMode;
  /** Set when printMode is "initials" — only these letters on the garment. */
  printInitials: string | null;
};

export type CartState = {
  items: CartLineItem[];
  updatedAt: string;
};
