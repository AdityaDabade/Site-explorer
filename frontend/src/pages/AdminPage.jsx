import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { approveContent, getUsers, rejectContent } from '../api/adminApi';
import axiosInstance from '../api/axiosInstance';
import { extractArray, extractData, extractMessage } from '../api/responseUtils';
import Loader from '../components/common/Loader';
import { useAuth } from '../context/AuthContext';

const DASHBOARD_NAV = ['Dashboard', 'Places', 'Users', 'AI Content', 'Settings'];

/**
 * Vercel/Linear-inspired admin dashboard for moderation and user management.
 */
export default function AdminPage() {
  const { user } = useAuth();
  const [pendingContent, setPendingContent] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchAdminData = async () => {
      setLoading(true);

        try {
          const [contentResponse, usersResponse] = await Promise.all([
            axiosInstance.get('/admin/content/pending'),
            getUsers()
          ]);

        if (!isMounted) {
          return;
        }

        setPendingContent(extractArray(contentResponse, ['items']));
        setUsers(extractArray(usersResponse, ['users']));
      } catch (error) {
        if (isMounted) {
          toast.error(extractMessage(error, 'Unable to load admin data.'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAdminData();
    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(
    () => [
      { label: 'Pending reviews', value: pendingContent.length, icon: '🧠', tone: 'bg-[#FEF0EB] text-[var(--c-primary)]', trend: 'vs last week ↑ 8%' },
      { label: 'Active users', value: users.filter((item) => item.active).length, icon: '👥', tone: 'bg-[var(--c-teal-light)] text-[var(--c-teal)]', trend: 'vs last week ↑ 5%' },
      { label: 'Published places', value: 124, icon: '📍', tone: 'bg-[#FFF8E1] text-[var(--c-warning)]', trend: 'vs last week ↑ 12%' },
      { label: 'Flagged items', value: 6, icon: '⚠️', tone: 'bg-[#FDECEC] text-[var(--c-error)]', trend: 'vs last week ↓ 3%' }
    ],
    [pendingContent.length, users]
  );

  const updateContentStatus = async (contentId, status) => {
    setActionLoadingId(contentId);

    try {
      if (status === 'approved') {
        await approveContent(contentId);
      } else {
        await rejectContent(contentId);
      }
      setPendingContent((current) => current.filter((item) => item.id !== contentId));
      toast.success(`Content ${status.toLowerCase()}.`);
    } catch (error) {
      toast.error(extractMessage(error, 'Unable to update content status.'));
    } finally {
      setActionLoadingId('');
    }
  };

  const toggleUserStatus = async (managedUser) => {
    setActionLoadingId(`user-${managedUser.id}`);

    try {
      const response = await axiosInstance.put(`/admin/users/${managedUser.id}`, {
        active: !managedUser.active
      });
      const updatedUser = extractData(response)?.user || { ...managedUser, active: !managedUser.active };
      setUsers((current) => current.map((item) => (item.id === managedUser.id ? updatedUser : item)));
      toast.success('User updated.');
    } catch (error) {
      toast.error(extractMessage(error, 'Unable to update user.'));
    } finally {
      setActionLoadingId('');
    }
  };

  if (user?.role && user.role !== 'admin') {
    return (
      <div className="container py-16">
        <div className="card card-bordered p-8">
          <h1>Admin access required</h1>
          <p className="mt-3 text-[var(--c-text-secondary)]">Your account is authenticated, but this area is reserved for administrators.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#FAFAFA]">
      <div className="grid min-h-[calc(100vh-80px)] lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden border-r border-[var(--c-border)] bg-white lg:block">
          <div className="sticky top-20 p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-[var(--c-primary-light)] text-lg">🧭</span>
              <div>
                <p className="font-heading text-lg font-extrabold">TourVision</p>
                <p className="text-sm text-[var(--c-text-secondary)]">Admin Console</p>
              </div>
            </div>

            <nav className="mt-8 space-y-1">
              {DASHBOARD_NAV.map((item, index) => (
                <button
                  key={item}
                  type="button"
                  className={`flex w-full items-center gap-3 rounded-[var(--r-md)] px-4 py-3 text-left text-sm font-semibold ${
                    index === 0
                      ? 'border-l-2 border-[var(--c-primary)] bg-[var(--c-primary-light)] text-[var(--c-primary)]'
                      : 'text-[var(--c-text-secondary)] hover:bg-[var(--c-surface-inset)]'
                  }`}
                >
                  <span>{index === 0 ? '◉' : '○'}</span>
                  {item}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        <main className="p-4 sm:p-6 lg:p-8">
          <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm text-[var(--c-text-secondary)]">Hello, {user?.name || user?.email || 'Admin'}</p>
              <h1 className="mt-1">Dashboard</h1>
            </div>
            <div className="text-sm text-[var(--c-text-secondary)]">{new Date().toLocaleDateString()}</div>
          </header>

          {loading ? (
            <div className="flex min-h-[50vh] items-center justify-center">
              <Loader label="Loading admin data..." size="lg" />
            </div>
          ) : (
            <div className="space-y-8">
              <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                  <article key={stat.label} className="card card-bordered p-5">
                    <div className="flex items-center justify-between">
                      <span className={`flex h-12 w-12 items-center justify-center rounded-[14px] text-xl ${stat.tone}`}>{stat.icon}</span>
                      <span className="text-xs font-semibold text-[var(--c-text-secondary)]">{stat.trend}</span>
                    </div>
                    <p className="mt-5 text-sm text-[var(--c-text-secondary)]">{stat.label}</p>
                    <p className="mt-2 font-heading text-3xl font-extrabold">{stat.value}</p>
                  </article>
                ))}
              </section>

              <section className="card card-bordered overflow-hidden">
                <div className="flex items-center justify-between border-b border-[var(--c-border)] px-6 py-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--c-text-secondary)]">Moderation</p>
                    <h2 className="mt-2">Content Approval</h2>
                  </div>
                  <span className="badge badge-orange">{pendingContent.length} pending</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-[var(--c-surface-inset)] text-[var(--c-text-secondary)]">
                      <tr>
                        <th className="px-6 py-4">#</th>
                        <th className="px-6 py-4">Thumbnail</th>
                        <th className="px-6 py-4">Place</th>
                        <th className="px-6 py-4">Content Type</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingContent.map((item, index) => (
                        <tr key={item.id} className="border-t border-[var(--c-border)] hover:bg-[var(--c-bg)]">
                          <td className="px-6 py-4">{index + 1}</td>
                          <td className="px-6 py-4">
                            <div className="h-12 w-16 rounded-[10px] bg-[var(--c-surface-inset)]" />
                          </td>
                          <td className="px-6 py-4 font-semibold">{item.place_name || item.title}</td>
                          <td className="px-6 py-4">{item.type || 'AI Content'}</td>
                          <td className="px-6 py-4"><span className="badge badge-amber">Pending</span></td>
                          <td className="px-6 py-4">{item.date || 'Today'}</td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button type="button" className="btn-outline btn-sm !border-[var(--c-success)] !text-[var(--c-success)]" disabled={actionLoadingId === item.id} onClick={() => updateContentStatus(item.id, 'approved')}>
                                Approve
                              </button>
                              <button type="button" className="btn-outline btn-sm !border-[var(--c-error)] !text-[var(--c-error)]" disabled={actionLoadingId === item.id} onClick={() => updateContentStatus(item.id, 'rejected')}>
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between border-t border-[var(--c-border)] px-6 py-4 text-sm text-[var(--c-text-secondary)]">
                  <span>Page 1 of 4</span>
                  <div className="flex gap-2">
                    <button type="button" className="btn-outline btn-sm">Previous</button>
                    <button type="button" className="btn-outline btn-sm">Next</button>
                  </div>
                </div>
              </section>

              <section className="card card-bordered overflow-hidden">
                <div className="flex items-center justify-between border-b border-[var(--c-border)] px-6 py-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--c-text-secondary)]">Users</p>
                    <h2 className="mt-2">Traveler accounts</h2>
                  </div>
                  <span className="badge badge-teal">{users.length} total</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-[var(--c-surface-inset)] text-[var(--c-text-secondary)]">
                      <tr>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Joined</th>
                        <th className="px-6 py-4">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((managedUser) => (
                        <tr key={managedUser.id} className="border-t border-[var(--c-border)] hover:bg-[var(--c-bg)]">
                          <td className="px-6 py-4 font-semibold">{managedUser.name || managedUser.email}</td>
                          <td className="px-6 py-4 capitalize">{managedUser.role || 'traveler'}</td>
                          <td className="px-6 py-4">
                            <span className={`badge ${managedUser.active ? 'badge-green' : 'badge-neutral'}`}>
                              {managedUser.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4">{managedUser.created_at || 'This month'}</td>
                          <td className="px-6 py-4">
                            <button type="button" className="btn-outline btn-sm" disabled={actionLoadingId === `user-${managedUser.id}`} onClick={() => toggleUserStatus(managedUser)}>
                              {managedUser.active ? 'Deactivate' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
