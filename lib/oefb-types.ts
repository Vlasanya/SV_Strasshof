/** Parsed squad payload from vereine.oefb.at (SG.container.appPreloads, type KADER). */
export interface OefbKaderPlayer {
  spielerName: string;
  spielerFotoUrl?: string;
  spielerFotoId?: string;
  spielerProfilUrl?: string;
  position?: string;
  rueckenNummer?: string;
  einsaetze?: number;
  tore?: number;
  kartenRot?: number;
  kartenGelbRot?: number;
  kartenGelb?: number;
  blueCards?: boolean;
}

export interface OefbSpielerStatistik {
  kategorie?: string;
  bezeichnung?: string;
  spiele?: number;
  tore?: number;
  gelbe?: number;
  gelbrote?: number;
  rote?: number;
}

/** Club history entry on oefb.at player profiles. */
export interface OefbSpielerVerein {
  verein: string;
  vereinId?: string;
  ab?: number;
  logo?: string;
  url?: string;
  landCode?: string;
}

/** Detailed player profile from oefb.at (appPreloads on Profile/Spieler). */
export interface OefbSpielerProfile {
  profileUrl: string;
  vorname: string;
  nachname: string;
  rueckennummer?: string;
  position?: string;
  nationalitaet?: string;
  geburtsdatum?: number;
  verein?: string;
  vereinUrl?: string;
  vereinLogo?: string;
  vereine?: OefbSpielerVerein[];
  foto?: string;
  photoUrl?: string;
  nachwuchs?: boolean;
  blueCards?: boolean;
  statistiken?: OefbSpielerStatistik[];
}

export interface OefbKaderData {
  bezeichnung: string;
  detailUrl?: string;
  kader: OefbKaderPlayer[];
  type: "KADER";
}

/** Team entry from ÖFB season squad navigation (pictureId = team photo on ÖFB). */
export interface OefbMannschaft {
  pictureId: string | null;
  bezeichnung: string;
  url: string;
}

export interface OefbMannschaftenCatalog {
  mannschaften: OefbMannschaft[];
  imagePrefix: string;
  clubLogoId?: string | null;
  saison?: string;
}

/** Parsed fixtures payload (type SPIELPLAN_MANNSCHAFT). */
export interface OefbSpiel {
  datum: number;
  abgeschlossen: boolean;
  abgesagt: boolean;
  live: boolean;
  art: string;
  spielUrl?: string;
  heimName: string;
  heimTore: string;
  gastName: string;
  gastTore: string;
  bewerbBezeichnung?: string;
  spielort?: string;
  heimLogo?: string;
  gastLogo?: string;
  highlight?: boolean;
}

export interface OefbSpielplanData {
  bezeichnung: string;
  detailUrl?: string;
  spiele: OefbSpiel[];
  type: "SPIELPLAN_MANNSCHAFT";
}
