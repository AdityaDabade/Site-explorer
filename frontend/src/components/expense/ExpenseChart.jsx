import PropTypes from 'prop-types';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

const CHART_COLORS = ['#60A5FA', '#38BDF8', '#F5A623', '#7DD3FC', '#A78BFA', '#F87171'];

/**
 * Recharts visualizations for expense distribution.
 */
export default function ExpenseChart({ data }) {
  if (!data.length) {
    return (
      <div className="rounded-[12px] border border-dashed border-white/15 bg-slate-900/60 p-4 text-sm text-slate-400">
        Add expenses to populate the charts.
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="panel-strong p-4">
        <h3 className="mb-3 font-heading text-xl text-white">Category Split</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="amount" nameKey="category" outerRadius={90} label>
                {data.map((entry, index) => (
                  <Cell key={entry.category} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel-strong p-4">
        <h3 className="mb-3 font-heading text-xl text-white">Amount by Category</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="category" stroke="#cbd5e1" />
              <YAxis stroke="#cbd5e1" />
              <Tooltip />
              <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={entry.category} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

ExpenseChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      amount: PropTypes.number.isRequired,
      category: PropTypes.string.isRequired
    })
  )
};

ExpenseChart.defaultProps = {
  data: []
};
