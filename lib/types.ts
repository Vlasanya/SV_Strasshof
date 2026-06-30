// Domain types for the Strasshof site (app schema).

export interface Team {
  id: number;
  slug: string;
  name: string;
  category: string | null;
  photo_url: string | null;
  coach_name: string | null;
  description: string | null;
  oefb_url: string | null;
  sort_order: number;
  hidden: boolean;
}

export interface NewsArticle {
  id: number;
  slug: string;
  title: string;
  category: string | null;
  excerpt: string | null;
  body: string | null;
  cover_image: string | null;
  images: string[] | null;
  published: boolean;
  published_at: string | null;
  instagram_posted: boolean;
  created_at: string;
}

export interface Sponsor {
  id: number;
  name: string;
  tier: string | null;
  type: string | null;
  logo_url: string | null;
  website: string | null;
  active: boolean;
  sort_order: number | null;
}

export interface MerchItem {
  id: number;
  name: string;
  category: string | null;
  price: number;
  image_url: string | null;
  sizes: string[] | null;
  in_stock: boolean;
  sort_order: number;
}

export interface SponsorshipPlan {
  id: number;
  name: string;
  price: number;
  period: string;
  features: string[];
  highlighted: boolean;
  sort_order: number | null;
}

export interface AdAction {
  id: number;
  name: string;
  note: string | null;
  price: number;
  sort_order: number | null;
}

export type SiteSettings = Record<string, string>;
