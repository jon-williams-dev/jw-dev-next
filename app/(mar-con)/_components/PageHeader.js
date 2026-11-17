export function PageHeader({ title, lead }) {
  return (
    <section className="bg-gradient-to-b from-brand-50 to-white">
      <div className="container-page py-14 md:py-20">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{title}</h1>
        {lead && <p className="mt-4 max-w-2xl text-lg text-slate">{lead}</p>}
      </div>
    </section>
  );
}
