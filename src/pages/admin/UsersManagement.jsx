import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { Badge } from '../../components/ui/Badge';
import { formatDate } from '../../utils/dates';
import { Users, Search } from 'lucide-react';

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminAPI.listUsers()
      .then((res) => setUsers(Array.isArray(res.users) ? res.users : (Array.isArray(res.data) ? res.data : [])))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="page-title">Users</h1>
        <p className="page-subtitle">{users.length} registered users</p>
      </div>

      <div className="mb-5 relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input className="input-field pl-9" placeholder="Search by name or email…"
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="card p-5"><TableSkeleton rows={8} /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 shadow-soft text-center">
          <Users size={40} className="text-slate-300" />
          <h3 className="mt-3 font-semibold text-ink">No users found</h3>
        </div>
      ) : (
        <div className="card overflow-auto">
          <table className="w-full min-w-[600px]">
            <thead className="border-b border-slate-100 bg-slate-50/70">
              <tr>
                <th className="table-th">User</th>
                <th className="table-th">Total Bookings</th>
                <th className="table-th">Role</th>
                <th className="table-th">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u._id} className="table-row">
                  <td className="table-td">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-full bg-pine text-white text-sm font-bold">
                        {u.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-ink">{u.name}</div>
                        <div className="text-xs text-slate-400">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="table-td">{u.totalBookings || 0}</td>
                  <td className="table-td">
                    <Badge variant={u.role === 'admin' ? 'coral' : 'pine'}>{u.role}</Badge>
                  </td>
                  <td className="table-td">{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
