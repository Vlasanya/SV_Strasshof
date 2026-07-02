/** Required ÖFB attribution for embedded federation data. */
export function OefbAttribution({ className = "" }: { className?: string }) {
  return (
    <p className={`text-xs text-on-dark-muted ${className}`.trim()}>
      Daten ©{" "}
      <a
        href="https://www.fussballoesterreich.at"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-primary"
      >
        fussballoesterreich.at
      </a>
      {" · "}
      <a
        href="https://vereine.oefb.at"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-primary"
      >
        vereine.oefb.at
      </a>
    </p>
  );
}
