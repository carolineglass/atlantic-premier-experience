const STEPS = [
  {
    title: 'Find your match',
    body: '[PLACEHOLDER: How browsing works — every fixture, live availability.]',
    card: 'border-sky-100 bg-sky-50',
    bubble: 'bg-sky-500 text-white',
  },
  {
    title: 'Pick your seats',
    body: '[PLACEHOLDER: How ticket categories and live pricing work.]',
    card: 'border-ocean-100 bg-ocean-50',
    bubble: 'bg-ocean-500 text-white',
  },
  {
    title: 'Enjoy the game',
    body: '[PLACEHOLDER: Delivery promise — how and when tickets arrive.]',
    card: 'border-tangerine-100 bg-tangerine-50',
    bubble: 'bg-tangerine-500 text-white',
  },
];

const GUARANTEES = [
  {
    title: '[PLACEHOLDER: Guarantee headline]',
    body: '[PLACEHOLDER: e.g. 100% order guarantee wording — must match your real terms.]',
    accent: 'text-ocean-400',
  },
  {
    title: '[PLACEHOLDER: Secure delivery]',
    body: '[PLACEHOLDER: Delivery/e-ticket claim.]',
    accent: 'text-sky-400',
  },
  {
    title: '[PLACEHOLDER: Support promise]',
    body: '[PLACEHOLDER: Support availability claim.]',
    accent: 'text-gold-400',
  },
];

export function TrustSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
        How it works
      </h2>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <div
            key={step.title}
            className={`rounded-2xl border p-6 ${step.card}`}
          >
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-full font-display font-bold ${step.bubble}`}
            >
              {i + 1}
            </span>
            <h3 className="mt-4 font-display text-lg font-bold">
              {step.title}
            </h3>
            <p className="mt-2 text-sm text-ink-soft">{step.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 rounded-3xl bg-navy p-8 sm:grid-cols-3 sm:p-10">
        {GUARANTEES.map((item) => (
          <div key={item.title}>
            <h3 className={`font-display font-bold ${item.accent}`}>
              {item.title}
            </h3>
            <p className="mt-2 text-sm text-gray-400">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
