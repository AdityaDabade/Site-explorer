import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import ExpenseChart from './ExpenseChart';

/**
 * Expense input and summary surface used on the main expense page.
 */
export default function ExpenseTracker({ groupSize }) {
  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: 'transport'
  });
  const [expenses, setExpenses] = useState([]);

  const totals = useMemo(() => {
    const total = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const chartData = expenses.reduce((accumulator, item) => {
      const existing = accumulator.find((entry) => entry.category === item.category);

      if (existing) {
        existing.amount += Number(item.amount || 0);
      } else {
        accumulator.push({
          category: item.category,
          amount: Number(item.amount || 0)
        });
      }

      return accumulator;
    }, []);

    return {
      total,
      perPerson: groupSize > 0 ? total / groupSize : total,
      chartData
    };
  }, [expenses, groupSize]);

  const handleSubmit = (event) => {
    event.preventDefault();

    setExpenses((current) => [
      ...current,
      {
        ...form,
        id: Date.now()
      }
    ]);
    setForm({
      title: '',
      amount: '',
      category: 'transport'
    });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <section className="panel p-5">
        <div className="mb-5">
          <h2 className="font-heading text-2xl text-white">Add Expense</h2>
          <p className="mt-2 text-sm text-slate-400">Tag every expense so the dashboard can break it down clearly.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            className="field"
            placeholder="Expense title"
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            required
          />
          <input
            className="field"
            min="0"
            placeholder="Amount"
            type="number"
            value={form.amount}
            onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
            required
          />
          <select
            className="field"
            value={form.category}
            onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
          >
            <option value="transport">Transport</option>
            <option value="food">Food</option>
            <option value="stay">Stay</option>
            <option value="tickets">Tickets</option>
            <option value="shopping">Shopping</option>
          </select>
          <button type="submit" className="btn-primary w-full">
            Add Expense
          </button>
        </form>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[12px] border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-slate-400">Total</p>
            <p className="mt-2 font-heading text-3xl text-white">₹{totals.total.toFixed(2)}</p>
          </div>
          <div className="rounded-[12px] border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-slate-400">Per person</p>
            <p className="mt-2 font-heading text-3xl text-white">₹{totals.perPerson.toFixed(2)}</p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {expenses.length ? (
            expenses.map((expense) => (
              <div key={expense.id} className="rounded-[12px] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-white">{expense.title}</p>
                  <span className="text-amber-200">₹{Number(expense.amount).toFixed(2)}</span>
                </div>
                <p className="mt-1 text-slate-400">{expense.category}</p>
              </div>
            ))
          ) : (
            <div className="rounded-[12px] border border-dashed border-white/15 bg-slate-900/60 p-4 text-sm text-slate-400">
              Your expenses will appear here after you add the first one.
            </div>
          )}
        </div>
      </section>

      <ExpenseChart data={totals.chartData} />
    </div>
  );
}

ExpenseTracker.propTypes = {
  groupSize: PropTypes.number
};

ExpenseTracker.defaultProps = {
  groupSize: 1
};
