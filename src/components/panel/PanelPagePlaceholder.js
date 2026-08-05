export default function PanelPagePlaceholder({
  eyebrow,
  title,
  description,
}) {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--accent-color)]">
          {eyebrow}
        </p>

        <h1 className="mt-1 text-3xl font-black tracking-tight text-[var(--foreground)]">
          {title}
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--gray-color)]">
          {description}
        </p>
      </header>

      <section className="rounded-[2rem] border border-[var(--half-gray)] bg-[var(--background)] p-6 sm:p-8">
        <div className="flex min-h-64 flex-col items-center justify-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--light-accent)] text-2xl font-black text-[var(--accent-color)]">
            P
          </div>

          <h2 className="mt-4 text-xl font-black">
            Sección preparada
          </h2>

          <p className="mt-2 max-w-md text-sm leading-6 text-[var(--gray-color)]">
            Aquí agregaremos la lógica y la información de esta sección.
          </p>
        </div>
      </section>
    </div>
  );
}