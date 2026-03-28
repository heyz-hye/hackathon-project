type PageHeaderProps = {
  backgroundWord: string;
  title: string;
  subtitle?: string;
};

export default function PageHeader({
  backgroundWord,
  title,
  subtitle,
}: PageHeaderProps) {
  return (
    <header className="relative overflow-hidden border-b border-[rgba(192,57,43,0.3)] px-4 py-12 sm:py-16">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[rgba(192,57,43,0.12)] via-transparent to-transparent"
        aria-hidden
      />
      <p
        className="pointer-events-none absolute -left-2 top-1/2 -translate-y-1/2 select-none font-sans text-[4.5rem] font-bold uppercase leading-none tracking-tighter text-[rgba(192,57,43,0.08)] sm:text-[7rem] md:text-[9rem] lg:text-[11rem]"
        aria-hidden
      >
        {backgroundWord}
      </p>
      <div className="relative z-10 mx-auto max-w-6xl">
        <h1 className="font-sans text-3xl font-bold tracking-tight text-[#F5F5F5] sm:text-4xl md:text-5xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-3 max-w-2xl text-base text-[#A89090] sm:text-lg">
            {subtitle}
          </p>
        ) : null}
      </div>
    </header>
  );
}
