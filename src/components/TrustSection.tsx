const STEPS = [
  {
    title: 'Find your match',
    body: '[PLACEHOLDER: How browsing works — every fixture, live availability.]',
  },
  {
    title: 'Pick your seats',
    body: '[PLACEHOLDER: How ticket categories and live pricing work.]',
  },
  {
    title: 'Enjoy the game',
    body: '[PLACEHOLDER: Delivery promise — how and when tickets arrive.]',
  },
];

const GUARANTEES = [
  {
    title: '[PLACEHOLDER: Guarantee headline]',
    body: '[PLACEHOLDER: e.g. 100% order guarantee wording — must match your real terms.]',
  },
  {
    title: '[PLACEHOLDER: Secure delivery]',
    body: '[PLACEHOLDER: Delivery/e-ticket claim.]',
  },
  {
    title: '[PLACEHOLDER: Support promise]',
    body: '[PLACEHOLDER: Support availability claim.]',
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
            className="rounded-2xl border border-gray-200 bg-white p-6"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-pitch-50 font-display font-bold text-pitch-700">
              {i + 1}
            </span>
            <h3 className="mt-4 font-display text-lg font-bold">
              {step.title}
            </h3>
            <p className="mt-2 text-sm text-ink-muted">{step.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 rounded-3xl bg-ink p-8 sm:grid-cols-3 sm:p-10">
        {GUARANTEES.map((item) => (
          <div key={item.title}>
            <h3 className="font-display font-bold text-white">{item.title}</h3>
            <p className="mt-2 text-sm text-gray-400">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
