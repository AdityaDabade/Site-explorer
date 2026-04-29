const TRUST_ITEMS = [
  { icon: '✓', label: 'Free Cancellation' },
  { icon: '📍', label: '500+ Destinations' },
  { icon: '★', label: '4.9/5 Rating' },
  { icon: '🤖', label: 'AI-Powered Guides' },
];

/**
 * TrustBar — horizontal strip of trust signals shown below the hero.
 */
export default function TrustBar() {
  return (
    <div className="trust-bar">
      {TRUST_ITEMS.map(({ icon, label }) => (
        <div key={label} className="trust-item">
          <span className="trust-item-icon">{icon}</span>
          {label}
        </div>
      ))}
    </div>
  );
}
