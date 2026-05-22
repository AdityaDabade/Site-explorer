import { useMemo } from 'react';
import PropTypes from 'prop-types';

/**
 * Cost Prediction component for Trip Planner
 * Calculates and displays travel, entry, and food costs
 */
export default function CostPrediction({ travelers = 1, destinations = [], places = [] }) {
  const costBreakdown = useMemo(() => {
    if (!travelers || destinations.length === 0) {
      return null;
    }

    // Travel Cost: distance (km) × ₹10
    // Estimate: ~100 km per destination
    const estimatedDistance = destinations.length * 100;
    const travelCost = estimatedDistance * 10;

    // Entry Cost: sum of place.entry_fee × travelers
    const entryFeesPerPerson = places.reduce((sum, place) => {
      const fee = place?.entry_fee || place?.price || 0;
      return sum + fee;
    }, 0);
    const entryCost = entryFeesPerPerson * travelers;

    // Food Cost: ₹300 × travelers × number of places
    const foodCostPerPersonPerPlace = 300;
    const foodCost = foodCostPerPersonPerPlace * travelers * destinations.length;

    const total = travelCost + entryCost + foodCost;
    const perPerson = travelers > 0 ? Math.round(total / travelers) : 0;

    return {
      travelCost: Math.round(travelCost),
      entryCost: Math.round(entryCost),
      foodCost: Math.round(foodCost),
      total: Math.round(total),
      perPerson
    };
  }, [travelers, destinations, places]);

  const hasData = travelers > 0 && destinations.length > 0;

  return (
    <div className="card card-bordered p-6">
      <h3 className="font-heading text-lg font-bold text-[var(--c-text-primary)]">
        💰 Trip Cost Breakdown
      </h3>

      {!hasData ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-[var(--r-lg)] bg-[var(--c-surface-inset)] py-8 px-4">
          <p className="text-sm text-[var(--c-text-secondary)]">
            Select places to estimate cost
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {/* Cost Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-[var(--r-md)] bg-[var(--c-surface-inset)] px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="text-lg">🚗</span>
                <span className="text-sm font-medium text-[var(--c-text-secondary)]">Travel</span>
              </div>
              <span className="font-semibold text-[var(--c-text-primary)]">
                ₹{costBreakdown.travelCost.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-[var(--r-md)] bg-[var(--c-surface-inset)] px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="text-lg">🎫</span>
                <span className="text-sm font-medium text-[var(--c-text-secondary)]">Entry Fees</span>
              </div>
              <span className="font-semibold text-[var(--c-text-primary)]">
                ₹{costBreakdown.entryCost.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-[var(--r-md)] bg-[var(--c-surface-inset)] px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="text-lg">🍽️</span>
                <span className="text-sm font-medium text-[var(--c-text-secondary)]">Food & Meals</span>
              </div>
              <span className="font-semibold text-[var(--c-text-primary)]">
                ₹{costBreakdown.foodCost.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="divider my-2" />

          {/* Total Section */}
          <div className="space-y-3 rounded-[var(--r-lg)] bg-gradient-to-r from-[var(--c-primary-light)] to-white p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-[0.05em] text-[var(--c-text-secondary)]">
                Total Trip Cost
              </span>
              <span className="text-2xl font-bold text-[var(--c-primary)]">
                ₹{costBreakdown.total.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-[var(--c-primary)]/20 pt-3">
              <span className="text-xs font-medium uppercase tracking-[0.05em] text-[var(--c-text-secondary)]">
                Per Person
              </span>
              <span className="text-xl font-bold text-[var(--c-primary)]">
                ₹{costBreakdown.perPerson.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Info Note */}
          <p className="text-xs text-[var(--c-text-tertiary)]">
            💡 Estimates based on: ₹10/km travel, place entry fees, ₹300/person/place for meals
          </p>
        </div>
      )}
    </div>
  );
}

CostPrediction.propTypes = {
  travelers: PropTypes.number,
  destinations: PropTypes.arrayOf(PropTypes.string),
  places: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    entry_fee: PropTypes.number,
    price: PropTypes.number
  }))
};

CostPrediction.defaultProps = {
  travelers: 1,
  destinations: [],
  places: []
};
