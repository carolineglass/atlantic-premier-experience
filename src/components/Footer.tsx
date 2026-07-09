import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="mt-24 border-t border-gray-100 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 font-display text-xl font-bold">
              Atlantic
              <span className="inline-block h-2.5 w-2.5 rotate-45 rounded-[3px] bg-pitch-500" />
            </div>
            <p className="mt-4 text-sm text-ink-muted">
              [PLACEHOLDER: One-line company description — who you are and what
              you guarantee.]
            </p>
          </div>

          <div>
            <h3 className="font-display font-bold">Explore</h3>
            <ul className="mt-4 space-y-2 text-sm text-ink-soft">
              <li>
                <Link to="/fixtures" className="hover:text-ink">
                  All fixtures
                </Link>
              </li>
              <li>
                <Link to="/teams" className="hover:text-ink">
                  Browse by team
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display font-bold">Support</h3>
            <ul className="mt-4 space-y-2 text-sm text-ink-soft">
              <li>[PLACEHOLDER: FAQ link]</li>
              <li>[PLACEHOLDER: Contact email]</li>
              <li>[PLACEHOLDER: Phone / hours]</li>
            </ul>
          </div>

          <div>
            <h3 className="font-display font-bold">Legal</h3>
            <ul className="mt-4 space-y-2 text-sm text-ink-soft">
              <li>[PLACEHOLDER: Terms &amp; conditions]</li>
              <li>[PLACEHOLDER: Privacy policy]</li>
              <li>[PLACEHOLDER: Company registration details]</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-200 pt-8 text-sm text-ink-muted">
          <p>
            © {new Date().getFullYear()} Atlantic Premier Experience.
            [PLACEHOLDER: Rights / independent-reseller disclosure statement.]
          </p>
        </div>
      </div>
    </footer>
  );
}
