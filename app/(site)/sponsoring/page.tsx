import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  Check,
  GraduationCap,
  HeartHandshake,
  Mail,
  MapPin,
  Megaphone,
  Phone,
  Share2,
  ShieldCheck,
  Shirt,
  Smartphone,
  Tag,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import {
  getAdActions,
  getClubInfo,
  getSiteSettings,
  getSponsorshipPlans,
} from "@/lib/data";
import {
  localizeAdAction,
  localizeSponsorshipPlan,
  resolveSponsorshipContact,
  resolveSponsorshipText,
} from "@/lib/sponsorship-content";
import { formatEuro } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Sponsor werden",
  description:
    "Sponsoring-Dossier: Kooperationspakete, Werbeaktionen und Sichtbarkeitsoptionen für Unternehmen.",
};

const IMPACT = [
  { icon: Users, label: "Engagierte Familien und Nachwuchsmannschaften" },
  { icon: Trophy, label: "Wöchentliche Präsenz in Meisterschaftswettbewerben" },
  { icon: MapPin, label: "Sportanlagen mit hoher Sichtbarkeit" },
  {
    icon: Smartphone,
    label: "Digitale Reichweite über unsere Social-Media-Kanäle",
  },
];

const WHY = [
  "Mehr Markenbekanntheit.",
  "Direkter Kontakt zu Hunderten von Familien.",
  "Präsenz bei sportlichen Veranstaltungen während der gesamten Saison.",
  "Verbindung mit positiven Werten und sozialer Verantwortung.",
  "Individuell gestaltete Werbeaktionen.",
  "Digitale Verstärkung über unsere Social-Media-Kanäle.",
];

const VISIBILITY = [
  {
    icon: Shirt,
    image: "/sponsoring/kit.jpg",
    title: "Ausrüstung",
    items: [
      "Hauptsponsoring auf der Brust.",
      "Sponsoring auf den Ärmeln.",
      "Weitere Platzierungen möglich.",
    ],
  },
  {
    icon: Megaphone,
    image: "/sponsoring/field.jpg",
    title: "Sportanlagen",
    items: [
      "Werbebanner am Spielfeld.",
      "Präsenz bei vom Verein organisierten Veranstaltungen.",
    ],
  },
  {
    icon: Share2,
    image: "/sponsoring/social.jpg",
    title: "Social Media",
    items: [
      "Gesponserte Beiträge.",
      "Gemeinsame Stories.",
      "Gemeinsame Gewinnspiele.",
      "Werbevideos.",
      "Direkte Links und hervorgehobene Erwähnungen.",
    ],
  },
];

const VALUES = [
  {
    icon: HeartHandshake,
    title: "Engagement",
    text: "Wir arbeiten jeden Tag daran, das bestmögliche sportliche und pädagogische Erlebnis zu bieten.",
  },
  {
    icon: ShieldCheck,
    title: "Respekt",
    text: "Wir fördern Respekt gegenüber Mitspielerinnen, Mitspielern, Gegnern, Trainerinnen und Schiedsrichtern.",
  },
  {
    icon: Target,
    title: "Leistungsbereitschaft",
    text: "Wir verstehen Einsatz und Fleiß als Weg zu jedem Ziel.",
  },
  {
    icon: GraduationCap,
    title: "Bildung",
    text: "Fußball ist unser Mittel, Menschen zu fördern und zu begleiten.",
  },
];

const MISSION_VALUES = [
  "Einsatz und Engagement",
  "Teamarbeit",
  "Respekt gegenüber Mitspielern, Gegnern und Schiedsrichtern",
  "Disziplin und Verantwortung",
  "Bescheidenheit und persönliche Weiterentwicklung",
];

export default async function PatrocinioPage() {
  const [plans, actions, settings, club] = await Promise.all([
    getSponsorshipPlans(),
    getAdActions(),
    getSiteSettings(),
    getClubInfo(),
  ]);

  const localizedPlans = plans.map(localizeSponsorshipPlan);
  const localizedActions = actions.map(localizeAdAction);
  const contact = resolveSponsorshipContact(settings, club);

  return (
    <div>
      {/* Hero */}
      <section className="section-dark relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/10 -skew-x-12 origin-top-right" />
        <div className="relative max-w-[1280px] mx-auto px-4 md:px-8 py-20">
          {/* eslint-disable-next-line @next/next/no-img-element */}

          <p className="text-sm font-semibold uppercase tracking-widest text-on-dark-muted mb-3">
            Sponsoring-Dossier
          </p>
          <h1 className="font-display text-5xl md:text-[72px] uppercase leading-[0.95] tracking-wide text-on-dark">
            Sponsor des
            <br />
            <span className="text-primary">{club.name}</span>
          </h1>
          <p className="text-on-dark-muted text-lg mt-5 max-w-xl">
            Spielerinnen und Spieler fördern, Menschen begleiten. Verbinden
            Sie Ihre Marke mit einem sportlichen und sozialen Projekt in
            Strasshof und Umgebung.
          </p>
          <a
            href="/kontakt?betreff=Sponsoring"
            className="inline-flex items-center gap-2 bg-primary hover:brightness-90 text-primary-foreground font-semibold uppercase tracking-wide px-7 py-3.5 rounded-lg transition-all text-sm mt-8"
          >
            Ich möchte kooperieren <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* Who we are + mission */}
      <section className="max-w-6xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <h2 className="font-display text-3xl font-bold uppercase tracking-tight text-foreground mb-4">
            {resolveSponsorshipText(settings, "sponsorship_intro_title")}
          </h2>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
            {resolveSponsorshipText(settings, "sponsorship_intro_body")}
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/sponsoring/team.jpg"
            alt={`Mannschaft ${club.name}`}
            className="mt-6 w-full rounded-2xl border border-border object-cover"
          />
        </div>
        <div>
          <h2 className="font-display text-3xl font-bold uppercase tracking-tight text-foreground mb-4">
            Unsere Mission
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-5">
            {resolveSponsorshipText(settings, "sponsorship_mission_body")}
          </p>
          <ul className="space-y-2">
            {MISSION_VALUES.map((v) => (
              <li
                key={v}
                className="flex items-center gap-2 text-sm font-medium text-foreground"
              >
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </span>
                {v}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Impact */}
      <section className="bg-muted/40 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="font-display text-3xl font-bold uppercase tracking-tight text-foreground mb-8">
            Ein Projekt mit Wirkung
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {IMPACT.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="bg-card rounded-2xl border border-border p-6"
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {item.label}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/sponsoring/kids-bags.jpg"
              alt={`Spielerinnen und Spieler des ${club.shortName}`}
              className="w-full h-full min-h-56 rounded-3xl object-cover"
            />
            <div className="bg-primary rounded-3xl p-8 md:p-10">
              <h3 className="font-display text-2xl font-extrabold uppercase text-white mb-5">
                Warum {club.shortName} sponsern?
              </h3>
              <div className="grid grid-cols-1 gap-y-3">
                {WHY.map((w) => (
                  <div
                    key={w}
                    className="flex items-start gap-2 text-white/90 text-sm"
                  >
                    <Check className="w-4 h-4 mt-0.5 shrink-0" />
                    {w}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visibility options */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="font-display text-3xl font-bold uppercase tracking-tight text-foreground mb-8">
          Sichtbarkeitsoptionen
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {VISIBILITY.map((v) => {
            const Icon = v.icon;
            return (
              <div
                key={v.title}
                className="bg-card rounded-2xl border border-border overflow-hidden"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={v.image}
                  alt={v.title}
                  className="w-full h-40 object-cover"
                />
                <div className="p-6 -mt-9 relative">
                  <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center mb-4 ring-4 ring-card">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-display text-xl font-bold uppercase tracking-tight text-foreground mb-3">
                    {v.title}
                  </h3>
                  <ul className="space-y-1.5">
                    {v.items.map((i) => (
                      <li
                        key={i}
                        className="text-sm text-muted-foreground flex items-start gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                        {i}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Collaboration plans */}
      {localizedPlans.length > 0 && (
        <section className="bg-muted/40 py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="font-display text-3xl font-bold uppercase tracking-tight text-foreground mb-8">
              Kooperationspakete
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {localizedPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`rounded-2xl border p-6 ${
                    plan.highlighted
                      ? "border-primary bg-card shadow-lg ring-1 ring-primary/20 md:-mt-2"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-2xl font-extrabold uppercase tracking-tight text-foreground">
                      {plan.name}
                    </h3>
                    {plan.highlighted && (
                      <span className="text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-primary text-white inline-flex items-center gap-1">
                        <Award className="w-3 h-3" /> Top
                      </span>
                    )}
                  </div>
                  <p className="mt-3">
                    <span className="font-display text-4xl font-extrabold text-primary">
                      {formatEuro(plan.price)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {" "}
                      /{plan.period}
                    </span>
                  </p>
                  <ul className="mt-5 space-y-2.5">
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2 text-sm text-foreground"
                      >
                        <Check className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Individual ad actions */}
      {localizedActions.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="font-display text-3xl font-bold uppercase tracking-tight text-foreground mb-2">
            Einzelne Werbeaktionen
          </h2>
          <p className="text-muted-foreground text-sm mb-8">
            Möglichkeit, individuelle Aktionen nach den Zielen jedes
            Unternehmens zu gestalten.
          </p>
          <div className="bg-card rounded-2xl border border-border divide-y divide-border">
            {localizedActions.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between gap-4 px-5 py-4"
              >
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Tag className="w-4 h-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {a.name}
                    </p>
                    {a.note && (
                      <p className="text-xs text-muted-foreground">{a.note}</p>
                    )}
                  </div>
                </div>
                <span className="font-display text-xl font-bold text-foreground whitespace-nowrap">
                  {formatEuro(a.price)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Values */}
      <section className="bg-muted/40 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="font-display text-3xl font-bold uppercase tracking-tight text-foreground mb-8">
            Unsere Werte
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map((v) => {
              const Icon = v.icon;
              return (
                <div
                  key={v.title}
                  className="bg-card rounded-2xl border border-border p-6 text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 mx-auto">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">
                    {v.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {v.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="kontakt" className="max-w-6xl mx-auto px-4 py-16">
        <div className="section-dark relative overflow-hidden rounded-3xl p-8 md:p-12 flex flex-col md:flex-row md:items-center gap-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/sponsoring/crest-white.png"
            alt=""
            aria-hidden
            className="hidden md:block absolute -right-6 -bottom-8 w-56 h-56 object-contain opacity-10 pointer-events-none"
          />
          <div className="relative flex-1">
            <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight text-on-dark mb-3">
              Sprechen wir darüber
            </h2>
            <p className="text-on-dark-muted leading-relaxed max-w-md">
              Jedes Unternehmen ist anders — und jedes Sponsoring auch. Wir
              entwickeln Angebote, die auf die Ziele jedes Partners
              zugeschnitten sind, um den größtmöglichen Nutzen zu erzielen.
            </p>
          </div>
          <div className="relative md:w-72 shrink-0 space-y-3">
            {contact.name && (
              <div>
                <p className="font-display text-xl font-bold uppercase text-on-dark">
                  {contact.name}
                </p>
                {contact.role && (
                  <p className="text-sm text-on-dark-muted">{contact.role}</p>
                )}
              </div>
            )}
            {contact.phone && (
              <a
                href={`tel:${contact.phone.replace(/\s+/g, "")}`}
                className="flex items-center gap-3 text-sm text-on-dark/80 hover:text-on-dark transition-colors"
              >
                <span className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </span>
                {contact.phone}
              </a>
            )}
            {contact.email && (
              <a
                href={`mailto:${contact.email}`}
                className="flex items-center gap-3 text-sm text-on-dark/80 hover:text-on-dark transition-colors"
              >
                <span className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </span>
                {contact.email}
              </a>
            )}
            <Link
              href="/kontakt?betreff=Sponsoring"
              className="inline-flex items-center gap-2 bg-primary hover:brightness-90 text-primary-foreground font-bold uppercase tracking-wide px-5 py-2.5 rounded-lg transition-all text-sm mt-2"
            >
              Schreiben Sie uns <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
