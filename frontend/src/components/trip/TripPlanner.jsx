import { useState } from 'react';
import PropTypes from 'prop-types';
import Loader from '../common/Loader';

/**
 * Trip planning form that collects routing and logistics preferences.
 */
export default function TripPlanner({ loading, onSubmit }) {
  const [form, setForm] = useState({
    destinations: '',
    duration: 2,
    transportMode: 'car',
    groupMembers: 2
  });

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      ...form,
      destinations: form.destinations
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)
    });
  };

  return (
    <section className="panel p-5">
      <div className="mb-5">
        <h2 className="font-heading text-2xl text-white">Trip Inputs</h2>
        <p className="mt-2 text-sm text-slate-400">
          Enter destinations, duration, and transport so the backend can generate a route and alerts.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <textarea
          className="field min-h-[120px] resize-none"
          name="destinations"
          placeholder="Enter destinations separated by commas"
          value={form.destinations}
          onChange={handleChange}
          required
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <input
            className="field"
            min="1"
            name="duration"
            type="number"
            value={form.duration}
            onChange={handleChange}
            required
          />
          <select className="field" name="transportMode" value={form.transportMode} onChange={handleChange}>
            <option value="car">Car</option>
            <option value="bike">Bike</option>
            <option value="bus">Bus</option>
            <option value="walk">Walk</option>
          </select>
          <input
            className="field"
            min="1"
            name="groupMembers"
            type="number"
            value={form.groupMembers}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? <Loader label="Planning route..." size="sm" /> : 'Generate Trip Plan'}
        </button>
      </form>
    </section>
  );
}

TripPlanner.propTypes = {
  loading: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired
};

TripPlanner.defaultProps = {
  loading: false
};
