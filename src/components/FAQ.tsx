import { useState } from 'react';

const FAQ_ITEMS = [
  {
    question: '[PLACEHOLDER: Are my tickets guaranteed?]',
    answer: '[PLACEHOLDER: Answer matching your real guarantee terms.]',
  },
  {
    question: '[PLACEHOLDER: When will I receive my tickets?]',
    answer: '[PLACEHOLDER: Delivery timeline answer.]',
  },
  {
    question: '[PLACEHOLDER: Can I sit together with my group?]',
    answer: '[PLACEHOLDER: Seating-together policy.]',
  },
  {
    question: '[PLACEHOLDER: What happens if a match is postponed?]',
    answer: '[PLACEHOLDER: Postponement/cancellation policy.]',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
        Questions, answered
      </h2>

      <div className="mt-10 divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-white">
        {FAQ_ITEMS.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={item.question}>
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                aria-expanded={isOpen}
              >
                <span className="font-display font-bold">{item.question}</span>
                <span
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 transition-transform ${
                    isOpen ? 'rotate-45' : ''
                  }`}
                  aria-hidden="true"
                >
                  +
                </span>
              </button>
              {isOpen && (
                <p className="px-6 pb-5 text-sm text-ink-muted">
                  {item.answer}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
