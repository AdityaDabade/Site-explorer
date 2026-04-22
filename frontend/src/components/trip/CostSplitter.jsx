import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Local cost splitter used alongside trip planning flows.
 */
export default function CostSplitter({ groupSize }) {
  const [expense, setExpense] = useState({
    title: '',
    amount: '',
    category: 'transport'
  });
  const [expenses, setExpenses] = useState([]);

  const totals = useMemo(() => {
    const total = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    return {
      total,
      perPerson: groupSize > 0 ? total / groupSize : total
    };
  }, [expenses, groupSize]);

  const handleSubmit = (event) => {
    event.preventDefault();

    setExpenses((current) => [
      ...current,
      {
        ...expense,
        id: Date.now()
      }
    ]);
    setExpense({
      title: '',
      amount: '',
      category: 'transport'
    });
  };

  return (
    <section className="panel p-5">
      <div className="mb-5">
        <h2 className="font-heading text-2xl text-white">Cost Splitter</h2>
        <p className="mt-2 text-sm text-slate-400">Track shared trip costs and split them equally across the group.</p>
      </div>

      <form className="grid gap-4 sm:grid-cols-[1fr_120px_150px_auto]" onSubmit={handleSubmit}>
        <input
          className="field"
          placeholder="Expense title"
          value={expense.title}
          onChange={(event) => setExpense((current) => ({ ...current, title: event.target.value }))}
          required
        />
        <input
          className="field"
          min="0"
          placeholder="Amount"
          type="number"
          value={expense.amount}
          onChange={(event) => setExpense((current) => ({ ...current, amount: event.target.value }))}
          required
        />
        <select
          className="field"
          value={expense.category}
          onChange={(event) => setExpense((current) => ({ ...current, category: event.target.value }))}
        >
          <option value="transport">Transport</option>
          <option value="food">Food</option>
          <option value="stay">Stay</option>
          <option value="tickets">Tickets</option>
        </select>
        <button type="submit" className="btn-primary">
          Add
        </button>
      </form>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-[12px] border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-slate-400">Total expenses</p>
          <p className="mt-2 font-heading text-3xl text-white">₹{totals.total.toFixed(2)}</p>
        </div>
        <div className="rounded-[12px] border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-slate-400">Equal split ({groupSize} people)</p>
          <p className="mt-2 font-heading text-3xl text-white">₹{totals.perPerson.toFixed(2)}</p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {expenses.length ? (
          expenses.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-[12px] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              <div>
                <p className="font-semibold text-white">{item.title}</p>
                <p className="text-slate-400">{item.category}</p>
              </div>
              <p className="font-semibold text-amber-200">₹{Number(item.amount).toFixed(2)}</p>
            </div>
          ))
        ) : (
          <div className="rounded-[12px] border border-dashed border-white/15 bg-slate-900/60 p-4 text-sm text-slate-400">
            Add expenses to see the equal split.
          </div>
        )}
      </div>
    </section>
  );
}

CostSplitter.propTypes = {
  groupSize: PropTypes.number
};

CostSplitter.defaultProps = {
  groupSize: 1
};
