import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminLogin } from '../api/authApi';
import { extractData, extractMessage } from '../api/responseUtils';
import Loader from '../components/common/Loader';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login, user } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  if (isAuthenticated && user?.role === 'admin') {
    return <Navigate replace to="/admin/dashboard" />;
  }

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await adminLogin(form);
      login(extractData(response));
      toast.success('Admin access granted.');
      navigate(location.state?.from?.pathname || '/admin/dashboard', { replace: true });
    } catch (error) {
      toast.error(extractMessage(error, 'Admin credentials are invalid.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-white">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-white/10 bg-white shadow-2xl lg:grid-cols-[1fr_420px]">
        <section className="hidden bg-[linear-gradient(135deg,#0f766e,#1d4ed8_55%,#7c3aed)] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-100">TourVision Admin</p>
            <h1 className="mt-4 max-w-xl text-5xl font-extrabold leading-tight">
              Manage tourism operations from one command center.
            </h1>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm font-bold">
            {['Places', 'Trips', 'AI Guide', 'Analytics'].map((item) => (
              <span key={item} className="rounded-lg border border-white/20 bg-white/10 px-4 py-3">
                {item}
              </span>
            ))}
          </div>
        </section>

        <section className="bg-white p-6 text-slate-950 sm:p-8">
          <div className="mb-8">
            <span className="badge badge-teal">Admin Login</span>
            <h2 className="mt-4 text-3xl font-extrabold">Sign in</h2>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              Admin email and password are required for dashboard access.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="input-wrap">
              <span className="input-label">Admin Email</span>
              <input
                className="field"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </label>
            <label className="input-wrap">
              <span className="input-label">Password</span>
              <input
                className="field"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </label>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? <Loader label="Checking admin..." size="sm" /> : 'Open Admin Dashboard'}
            </button>
          </form>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm font-semibold text-slate-500">
            <Link className="text-teal-700 hover:text-teal-900" to="/login">
              User login
            </Link>
            <Link className="hover:text-slate-900" to="/">
              Back to TourVision
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
