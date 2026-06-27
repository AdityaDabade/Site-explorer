const FOOTER_LINKS = {
  Discover: ['Trending places', 'Collections', 'Audio guides', 'Nearby guides'],
  Company: ['About', 'Careers', 'Partners', 'Press'],
  Support: ['Help Center', 'Accessibility', 'Cancellation options', 'Contact us'],
};

/**
 * Footer — site-wide footer with brand copy, nav links, and legal bar.
 */
export default function Footer() {
  return (
    <footer className="bg-[#1A1A1A] py-14 text-white">
      <div className="container">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <p className="font-heading text-2xl font-extrabold">TourVision</p>
            <p className="mt-4 max-w-[260px] text-white/65">
              Travel with AI-powered stories, audio guides, and smart planning from
              discovery to arrival.
            </p>
          </div>

          {/* Nav columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, items]) => (
            <div key={heading}>
              <p className="font-heading text-lg font-bold">{heading}</p>
              <ul className="mt-4 space-y-3 text-white/65">
                {items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-white/55 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <span>© 2026 TourVision</span>
            <span>Instagram</span>
            <span>X</span>
            <span>YouTube</span>
          </div>
          <div className="flex items-center gap-4">
            <span>English (IN)</span>
            <span>Rs INR</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
