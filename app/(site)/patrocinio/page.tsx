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
import { formatEuro } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Hazte patrocinador",
  description:
    "Dossier de patrocinio: planes de colaboración, acciones publicitarias y opciones de visibilidad para empresas.",
};

const IMPACT = [
  { icon: Users, label: "Más de 300 familias vinculadas al club" },
  { icon: Trophy, label: "Presencia semanal en competiciones federadas" },
  { icon: MapPin, label: "Instalaciones deportivas con gran visibilidad" },
  {
    icon: Smartphone,
    label: "Alcance digital a través de nuestras redes sociales",
  },
];

const WHY = [
  "Incremento de visibilidad de marca.",
  "Impacto directo sobre cientos de familias.",
  "Presencia en eventos deportivos durante toda la temporada.",
  "Asociación con valores positivos y responsabilidad social.",
  "Acciones promocionales personalizadas.",
  "Amplificación digital a través de nuestras redes sociales.",
];

const VISIBILITY = [
  {
    icon: Shirt,
    image: "/patrocinio/kit.jpg",
    title: "Equipaciones",
    items: [
      "Patrocinio principal en el pecho.",
      "Patrocinio en mangas.",
      "Otras ubicaciones disponibles.",
    ],
  },
  {
    icon: Megaphone,
    image: "/patrocinio/field.jpg",
    title: "Instalaciones deportivas",
    items: [
      "Vallas publicitarias en el campo.",
      "Presencia en eventos organizados por el club.",
    ],
  },
  {
    icon: Share2,
    image: "/patrocinio/social.jpg",
    title: "Redes sociales",
    items: [
      "Publicaciones patrocinadas.",
      "Stories compartidas.",
      "Sorteos conjuntos.",
      "Vídeos promocionales.",
      "Enlaces directos y menciones destacadas.",
    ],
  },
];

const VALUES = [
  {
    icon: HeartHandshake,
    title: "Compromiso",
    text: "Trabajamos cada día para ofrecer la mejor experiencia deportiva y educativa.",
  },
  {
    icon: ShieldCheck,
    title: "Respeto",
    text: "Promovemos el respeto hacia compañeros, rivales, entrenadores y árbitros.",
  },
  {
    icon: Target,
    title: "Superación",
    text: "Entendemos el esfuerzo como el camino para alcanzar cualquier objetivo.",
  },
  {
    icon: GraduationCap,
    title: "Formación",
    text: "El fútbol es nuestra herramienta para educar y formar personas.",
  },
];

const MISSION_VALUES = [
  "Esfuerzo y compromiso",
  "Trabajo en equipo",
  "Respeto a compañeros, rivales y árbitros",
  "Disciplina y responsabilidad",
  "Humildad y superación personal",
];

export default async function PatrocinioPage() {
  const [plans, actions, settings, club] = await Promise.all([
    getSponsorshipPlans(),
    getAdActions(),
    getSiteSettings(),
    getClubInfo(),
  ]);

  const s = (key: string, fallback = "") => settings[key] || fallback;
  const contactName = s("sponsorship_contact_name");
  const contactRole = s("sponsorship_contact_role");
  const contactPhone = s("sponsorship_contact_phone");
  const contactEmail = s("sponsorship_contact_email", club.email ?? "");

  return (
    <div>
      {/* Hero */}
      <section className="section-dark relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/10 -skew-x-12 origin-top-right" />
        <div className="relative max-w-[1280px] mx-auto px-4 md:px-8 py-20">
          {/* eslint-disable-next-line @next/next/no-img-element */}

          <p className="text-sm font-semibold uppercase tracking-widest text-on-dark-muted mb-3">
            Dossier de patrocinio
          </p>
          <h1 className="font-display text-5xl md:text-[72px] uppercase leading-[0.95] tracking-wide text-on-dark">
            Patrocina al
            <br />
            <span className="text-primary">{club.name}</span>
          </h1>
          <p className="text-on-dark-muted text-lg mt-5 max-w-xl">
            Formando jugadores, construyendo personas. Une tu marca a un
            proyecto deportivo y social con más de 45 años de historia.
          </p>
          <a
            href="/kontakt"
            className="inline-flex items-center gap-2 bg-primary hover:brightness-90 text-primary-foreground font-semibold uppercase tracking-wide px-7 py-3.5 rounded-lg transition-all text-sm mt-8"
          >
            Quiero colaborar <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* Who we are + mission */}
      <section className="max-w-6xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <h2 className="font-display text-3xl font-bold uppercase tracking-tight text-foreground mb-4">
            {s("sponsorship_intro_title", "¿Quiénes somos?")}
          </h2>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
            {s(
              "sponsorship_intro_body",
              "Un club de fútbol base con una gran comunidad de familias.",
            )}
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/patrocinio/team.jpg"
            alt={`Plantilla ${club.name}`}
            className="mt-6 w-full rounded-2xl border border-border object-cover"
          />
        </div>
        <div>
          <h2 className="font-display text-3xl font-bold uppercase tracking-tight text-foreground mb-4">
            Nuestra misión
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-5">
            {s(
              "sponsorship_mission_body",
              "Entendemos el fútbol como una herramienta educativa.",
            )}
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
            Un proyecto con impacto
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
              src="/patrocinio/kids-bags.jpg"
              alt={`Jugadores del ${club.shortName}`}
              className="w-full h-full min-h-56 rounded-3xl object-cover"
            />
            <div className="bg-primary rounded-3xl p-8 md:p-10">
              <h3 className="font-display text-2xl font-extrabold uppercase text-white mb-5">
                ¿Por qué patrocinar al {club.shortName}?
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
          Opciones de visibilidad
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
      {plans.length > 0 && (
        <section className="bg-muted/40 py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="font-display text-3xl font-bold uppercase tracking-tight text-foreground mb-8">
              Planes de colaboración
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {plans.map((plan) => (
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
      {actions.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="font-display text-3xl font-bold uppercase tracking-tight text-foreground mb-2">
            Acciones publicitarias individuales
          </h2>
          <p className="text-muted-foreground text-sm mb-8">
            Posibilidad de desarrollar acciones personalizadas adaptadas a los
            objetivos de cada empresa.
          </p>
          <div className="bg-card rounded-2xl border border-border divide-y divide-border">
            {actions.map((a) => (
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
            Nuestros valores
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

      {/* Contact / Hablemos */}
      <section id="hablemos" className="max-w-6xl mx-auto px-4 py-16">
        <div className="section-dark relative overflow-hidden rounded-3xl p-8 md:p-12 flex flex-col md:flex-row md:items-center gap-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/patrocinio/crest-white.png"
            alt=""
            aria-hidden
            className="hidden md:block absolute -right-6 -bottom-8 w-56 h-56 object-contain opacity-10 pointer-events-none"
          />
          <div className="relative flex-1">
            <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight text-on-dark mb-3">
              Hablemos
            </h2>
            <p className="text-on-dark-muted leading-relaxed max-w-md">
              Cada empresa es diferente y cada patrocinio también. Diseñamos
              propuestas adaptadas a los objetivos de cada colaborador para
              garantizar el máximo retorno de la inversión.
            </p>
          </div>
          <div className="relative md:w-72 shrink-0 space-y-3">
            {contactName && (
              <div>
                <p className="font-display text-xl font-bold uppercase text-on-dark">{contactName}</p>
                {contactRole && (
                  <p className="text-sm text-on-dark-muted">{contactRole}</p>
                )}
              </div>
            )}
            {contactPhone && (
              <a
                href={`tel:${contactPhone.replace(/\s+/g, "")}`}
                className="flex items-center gap-3 text-sm text-on-dark/80 hover:text-on-dark transition-colors"
              >
                <span className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </span>
                {contactPhone}
              </a>
            )}
            {contactEmail && (
              <a
                href={`mailto:${contactEmail}`}
                className="flex items-center gap-3 text-sm text-on-dark/80 hover:text-on-dark transition-colors"
              >
                <span className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </span>
                {contactEmail}
              </a>
            )}
            <Link
              href="/kontakt"
              className="inline-flex items-center gap-2 bg-primary hover:brightness-90 text-primary-foreground font-bold uppercase tracking-wide px-5 py-2.5 rounded-lg transition-all text-sm mt-2"
            >
              Escríbenos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
