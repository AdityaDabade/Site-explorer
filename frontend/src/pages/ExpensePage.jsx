import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

const CATEGORY_COLORS = ['#E8470A', '#0A7B83', '#FFC500', '#7C3AED', '#3B82F6'];

const INITIAL_EXPENSES = [
  { id: 1, date: '2026-04-18', title: 'Fort entry tickets', category: 'Tickets', payer: 'Aditi', amount: 1250 },
  { id: 2, date: '2026-04-18', title: 'Taxi to old city', category: 'Transport', payer: 'Rohan', amount: 680 },
  { id: 3, date: '2026-04-17', title: 'Dinner by the lake', category: 'Food', payer: 'Aditi', amount: 2140 }
];

function groupByDate(expenses) {
  return expenses.reduce((accumulator, expense) => {
    accumulator[expense.date] = accumulator[expense.date] || [];
    accumulator[expense.date].push(expense);
    return accumulator;
  }, {});
}

/**
 * Fintech-inspired trip expense page with bottom-sheet creation flow and charts.
 */
export default function ExpensePage() {
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);
  const [budget, setBudget] = useState(12000);
  const [groupSize, setGroupSize] = useState(3);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [chartTab, setChartTab] = useState('By Category');
  const [form, setForm] = useState({
    title: '',
    category: 'Transport',
    payer: 'You',
    amount: '',
    date: new Date().toISOString().slice(0, 10)
  });

  const summary = useMemo(() => {
    const spent = expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    const remaining = budget - spent;
    const yourShare = groupSize > 0 ? spent / groupSize : spent;
    return { spent, remaining, yourShare, progress: budget > 0 ? Math.min((spent / budget) * 100, 100) : 0 };
  }, [budget, expenses, groupSize]);

  const groupedExpenses = useMemo(() => groupByDate(expenses), [expenses]);

  const chartData = useMemo(() => {
    if (chartTab === 'By Day') {
      return Object.entries(groupedExpenses).map(([date, items]) => ({
        label: date,
        value: items.reduce((sum, item) => sum + Number(item.amount || 0), 0)
      }));
    }

    if (chartTab === 'By Person') {
      const byPayer = expenses.reduce((accumulator, expense) => {
        accumulator[expense.payer] = (accumulator[expense.payer] || 0) + Number(expense.amount || 0);
        return accumulator;
      }, {});

      return Object.entries(byPayer).map(([label, value]) => ({ label, value }));
    }

    const byCategory = expenses.reduce((accumulator, expense) => {
      accumulator[expense.category] = (accumulator[expense.category] || 0) + Number(expense.amount || 0);
      return accumulator;
    }, {});

    return Object.entries(byCategory).map(([label, value]) => ({ label, value }));
  }, [chartTab, expenses, groupedExpenses]);

  const progressColor =
    summary.progress < 65 ? 'var(--c-success)' : summary.progress < 90 ? 'var(--c-warning)' : 'var(--c-error)';

  const handleAddExpense = (event) => {
    event.preventDefault();
    setExpenses((current) => [
      {
        ...form,
        id: Date.now(),
        amount: Number(form.amount || 0)
      },
      ...current
    ]);
    setSheetOpen(false);
    setForm({
      title: '',
      category: 'Transport',
      payer: 'You',
      amount: '',
      date: new Date().toISOString().slice(0, 10)
    });
  };

  return (
    <div className="section-sm">
      <div className="container space-y-8">
        <section className="card card-bordered p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="section-eyebrow">Budget Tracker</div>
              <h1 className="section-title">Track your trip like a clean fintech app</h1>
              <p className="section-sub">Monitor total budget, shared spend, and remaining room in real time.</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="input-wrap">
                <span className="input-label">Budget</span>
                <input className="input" type="number" value={budget} onChange={(event) => setBudget(Number(event.target.value) || 0)} />
              </label>
              <label className="input-wrap">
                <span className="input-label">Group size</span>
                <input className="input" type="number" value={groupSize} onChange={(event) => setGroupSize(Number(event.target.value) || 1)} />
              </label>
            </div>
          </div>

          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-[var(--c-text-secondary)]">Trip budget vs spent</span>
              <span className="font-semibold">₹{summary.spent.toFixed(0)} / ₹{budget.toFixed(0)}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-[var(--c-surface-inset)]">
              <div className="h-full rounded-full transition-all" style={{ width: `${summary.progress}%`, background: progressColor }} />
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Total', value: `₹${summary.spent.toFixed(0)}`, tone: 'text-[var(--c-primary)]', trend: '↑ 12% this week' },
            { label: 'Your Share', value: `₹${summary.yourShare.toFixed(0)}`, tone: 'text-[var(--c-teal)]', trend: 'On track' },
            { label: 'Remaining', value: `₹${summary.remaining.toFixed(0)}`, tone: summary.remaining < 0 ? 'text-[var(--c-error)]' : 'text-[var(--c-success)]', trend: summary.remaining < 0 ? 'Over budget' : 'Room left' }
          ].map((card) => (
            <article key={card.label} className="card card-bordered p-5">
              <p className="text-sm text-[var(--c-text-secondary)]">{card.label}</p>
              <p className={`mt-2 text-3xl font-heading font-extrabold ${card.tone}`}>{card.value}</p>
              <p className="mt-3 text-sm text-[var(--c-text-secondary)]">{card.trend}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="card card-bordered p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--c-text-secondary)]">Ledger</p>
                <h2 className="mt-2">Expense list</h2>
              </div>
              <span className="badge badge-neutral">{expenses.length} entries</span>
            </div>

            <div className="space-y-8">
              {Object.entries(groupedExpenses).map(([date, items]) => (
                <div key={date}>
                  <div className="mb-3 flex items-center gap-3">
                    <span className="badge badge-dark">{date}</span>
                    <div className="h-px flex-1 bg-[var(--c-border)]" />
                  </div>

                  <div className="space-y-3">
                    {items.map((expense) => (
                      <article key={expense.id} className="card card-bordered p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--c-primary-light)] text-lg">
                              {expense.category === 'Food' ? '🍜' : expense.category === 'Transport' ? '🚕' : expense.category === 'Tickets' ? '🎟️' : '🧾'}
                            </div>
                            <div>
                              <p className="font-semibold">{expense.title}</p>
                              <p className="text-sm text-[var(--c-text-secondary)]">{expense.category} · paid by {expense.payer}</p>
                              <p className="mt-1 text-sm text-[var(--c-text-secondary)]">₹{(expense.amount / groupSize).toFixed(0)} per person</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">₹{Number(expense.amount).toFixed(0)}</p>
                            <button
                              type="button"
                              className="mt-2 text-sm font-semibold text-[var(--c-error)]"
                              onClick={() => setExpenses((current) => current.filter((item) => item.id !== expense.id))}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <section className="card card-bordered p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2>Charts</h2>
                <div className="flex rounded-full bg-[var(--c-surface-inset)] p-1">
                  {['By Category', 'By Day', 'By Person'].map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setChartTab(tab)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold ${chartTab === tab ? 'bg-white shadow-[var(--shadow-card)]' : 'text-[var(--c-text-secondary)]'}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chartData} dataKey="value" nameKey="label" outerRadius={86}>
                        {chartData.map((entry, index) => (
                          <Cell key={entry.label} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <XAxis dataKey="label" stroke="#717171" />
                      <YAxis stroke="#717171" />
                      <Tooltip />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={entry.label} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>
          </div>
        </section>

        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="fixed bottom-24 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--c-primary)] text-2xl text-white shadow-[var(--shadow-fab)] transition hover:translate-y-[-2px] lg:bottom-8"
          aria-label="Add expense"
        >
          +
        </button>
      </div>

      {sheetOpen ? (
        <div className="bottom-sheet-overlay">
          <div className="bottom-sheet">
            <div className="bottom-sheet-handle" />
            <div className="mx-auto max-w-xl">
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--c-text-secondary)]">New Expense</p>
                <h2 className="mt-2">Add an expense</h2>
              </div>

              <form className="space-y-4" onSubmit={handleAddExpense}>
                <label className="input-wrap">
                  <span className="input-label">Title</span>
                  <input className="input" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} required />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="input-wrap">
                    <span className="input-label">Category</span>
                    <select className="input" value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}>
                      <option>Transport</option>
                      <option>Food</option>
                      <option>Tickets</option>
                      <option>Stay</option>
                      <option>Shopping</option>
                    </select>
                  </label>

                  <label className="input-wrap">
                    <span className="input-label">Payer</span>
                    <input className="input" value={form.payer} onChange={(event) => setForm((current) => ({ ...current, payer: event.target.value }))} />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="input-wrap">
                    <span className="input-label">Amount</span>
                    <input className="input" type="number" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} required />
                  </label>

                  <label className="input-wrap">
                    <span className="input-label">Date</span>
                    <input className="input" type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} />
                  </label>
                </div>

                <div className="flex items-center justify-between gap-3 pt-3">
                  <button type="button" className="btn-outline" onClick={() => setSheetOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Save Expense
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
