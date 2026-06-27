import { Link } from 'react-router-dom';

function FooterIcon({ children }) {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-teal-200 ring-1 ring-white/10">
      {children}
    </span>
  );
}

function MailIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M4 6h16v12H4z" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M12 21s7-5.4 7-12A7 7 0 0 0 5 9c0 6.6 7 12 7 12Z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

const quickLinks = [
  { label: 'Home', to: '/' },
  { label: 'Heritage Places', to: '/nearby' },
  { label: 'Trip Planner', to: '/trip-planner' },
  { label: 'AI Guide', to: '/', action: 'tourvision:open-chat' },
  { label: 'Feedback', to: '/#feedback' },
  { label: 'Contact', to: '#contact' }
];

const features = [
  'AI Guide',
  'Nearby Recommendations',
  'Budget Planner',
  'Historical Information'
];

export default function Footer() {
  const handleAction = (event, item) => {
    if (!item.action) {
      return;
    }

    event.preventDefault();
    window.dispatchEvent(new CustomEvent(item.action));
  };

  return (
    <footer id="contact" className="mt-auto bg-slate-950 text-white">
      <div className="container py-12 sm:py-14">
        <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-[1.25fr_0.85fr_0.85fr_1fr]">
          <div>
            <Link to="/" className="inline-flex items-center gap-3 transition duration-200 hover:-translate-y-0.5">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 via-cyan-500 to-indigo-500 text-sm font-black text-white shadow-lg shadow-teal-500/25">
                AI
              </span>
              <span className="max-w-64 font-heading text-lg font-black leading-tight">
                AI Powered Cultural & Historical Explorer
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-300">
              Discover India's heritage through AI-powered guides, smart trip planning, and cultural exploration.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.16em] text-teal-200">Quick Links</h2>
            <nav className="mt-5 grid gap-2">
              {quickLinks.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={(event) => handleAction(event, item)}
                  className="w-fit text-sm font-bold text-slate-300 transition duration-200 hover:-translate-y-0.5 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.16em] text-teal-200">Features</h2>
            <ul className="mt-5 grid gap-2 text-sm font-bold text-slate-300">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-300" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.16em] text-teal-200">Contact</h2>
            <div className="mt-5 grid gap-4 text-sm font-bold text-slate-300">
              <a className="flex items-center gap-3 transition duration-200 hover:text-white" href="mailto:support@heritageexplorer.com">
                <FooterIcon><MailIcon /></FooterIcon>
                support@heritageexplorer.com
              </a>
              <a className="flex items-center gap-3 transition duration-200 hover:text-white" href="tel:+910000000000">
                <FooterIcon><PhoneIcon /></FooterIcon>
                +91 XXXXX XXXXX
              </a>
              <div className="flex items-center gap-3">
                <FooterIcon><LocationIcon /></FooterIcon>
                Maharashtra, India
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-5 text-center text-xs font-bold text-slate-400">
        &copy; 2026 AI Powered Cultural & Historical Explorer. All Rights Reserved.
      </div>
    </footer>
  );
}
