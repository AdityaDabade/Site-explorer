/**
 * AppDownloadCTA — dark banner promoting the mobile app with a phone mockup.
 */
export default function AppDownloadCTA() {
  return (
    <section className="section">
      <div className="container">
        <div className="overflow-hidden rounded-[32px] bg-[var(--c-text-primary)] px-6 py-10 text-white md:px-10">
          <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            {/* Copy */}
            <div>
              <span className="badge badge-amber">App Download</span>
              <h2 className="mt-4 text-white">Take TourVision with you everywhere</h2>
              <p className="mt-4 max-w-[520px] text-white/75">
                Save places, start AI tours instantly, scan QR codes on the go, and plan
                entire journeys right from your phone.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button type="button" className="btn-ghost">
                  App Store
                </button>
                <button type="button" className="btn-ghost">
                  Google Play
                </button>
              </div>
            </div>

            {/* Phone mockup */}
            <div className="mx-auto w-full max-w-[360px] rounded-[32px] border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
              <div className="mx-auto w-full max-w-[250px] rounded-[28px] bg-white p-4 text-[var(--c-text-primary)] shadow-[var(--shadow-modal)]">
                <div className="rounded-[20px] bg-[var(--c-bg)] p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">TourVision</span>
                    <span className="badge badge-orange">Live</span>
                  </div>
                  <div className="mt-4 rounded-[18px] bg-[var(--c-teal-light)] p-4">
                    <p className="text-sm font-semibold">Explore Nearby</p>
                    <p className="mt-1 text-xs text-[var(--c-text-secondary)]">
                      AR tours · audio guides · saved trips
                    </p>
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-[16px] bg-white p-3 shadow-[var(--shadow-card)]">
                      <p className="text-sm font-semibold">Amber Fort</p>
                      <p className="text-xs text-[var(--c-text-secondary)]">
                        AR Ready · 2.1 km away
                      </p>
                    </div>
                    <div className="rounded-[16px] bg-white p-3 shadow-[var(--shadow-card)]">
                      <p className="text-sm font-semibold">Today&apos;s plan</p>
                      <p className="text-xs text-[var(--c-text-secondary)]">
                        3 places · Rs 1,240 total
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
