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
  /** Paste embed HTML from ÖFB Vereinswidgets (Spielplan Mannschaft). */
  oefb_widget_spiele: string | null;
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
  instagram_post_id: string | null;
  instagram_error: string | null;
  instagram_hashtags: string | null;
  created_at: string;
}

export interface Sponsor {
  id: number;
  name: string;
  tier: string | null;
  type: string | null;
  logo_url: string | null;
  website: string | null;
  maps_url: string | null;
  active: boolean;
  sort_order: number | null;
}

export interface JoinInquiry {
  id: number;
  birth_year: number;
  team_id: number | null;
  team_name: string;
  child_name: string | null;
  contact_name: string;
  email: string;
  phone: string | null;
  message: string | null;
  handled: boolean;
  created_at: string;
}

export interface MerchItem {
  id: number;
  name: string;
  category: string | null;
  description: string | null;
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

export type ClubEventType =
  | "training"
  | "match"
  | "gathering"
  | "meeting"
  | "tournament"
  | "other";

export interface ClubEvent {
  id: number;
  title: string;
  event_type: ClubEventType;
  team_id: number | null;
  description: string | null;
  location: string | null;
  field: string | null;
  starts_at: string;
  ends_at: string | null;
  all_day: boolean;
  published: boolean;
  external_url: string | null;
  external_widget: string | null;
  created_at: string;
  updated_at: string;
  /** Populated when selected with team join */
  team?: Pick<Team, "name" | "slug"> | null;
}
