import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { leadService } from '../services/leadService';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import {
  Users,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  Plus,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Clock,
  Building,
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await leadService.getDashboardStats();
      if (data.success) {
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err);
      setError('Could not load dashboard data. Please try again.');
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const total = stats?.stats?.totalLeads || 0;
  const statusDist = stats?.statusDistribution || { New: 0, Contacted: 0, Qualified: 0, Lost: 0 };

  const getPercentage = (count) => {
    if (!total) return 0;
    return Math.round((count / total) * 100);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Skeleton Top Greeting */}
        <div className="h-8 bg-slate-200 rounded-md w-1/4"></div>

        {/* Skeleton Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white border border-slate-200 rounded-xl p-5"></div>
          ))}
        </div>

        {/* Skeleton Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-white border border-slate-200 rounded-xl"></div>
          <div className="h-72 bg-white border border-slate-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-10 text-center max-w-lg mx-auto mt-12 shadow-xs">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900">Dashboard Unavailable</h3>
        <p className="text-sm text-slate-500 mt-1 mb-6">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Header & Quick Add */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Performance Overview</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time pipeline metrics and lead conversion tracking
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/leads/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Lead</span>
          </Link>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Total Leads"
          value={stats?.stats?.totalLeads}
          icon={Users}
          color="indigo"
          description="Total leads in database"
        />
        <StatCard
          title="New Leads"
          value={stats?.stats?.newLeads}
          icon={Sparkles}
          color="blue"
          description="Uncontacted prospects"
        />
        <StatCard
          title="Contacted Leads"
          value={stats?.stats?.contactedLeads}
          icon={PhoneCall}
          color="amber"
          description="Outreach in progress"
        />
        <StatCard
          title="Qualified Leads"
          value={stats?.stats?.qualifiedLeads}
          icon={CheckCircle2}
          color="emerald"
          description="High conversion probability"
        />
      </div>

      {/* Split Section: Recent Leads & Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Leads Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Recent Leads</h3>
              <p className="text-xs text-slate-400 mt-0.5">Most recently created prospective clients</p>
            </div>
            <Link
              to="/leads"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 transition"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            {stats?.recentLeads?.length > 0 ? (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                    <th className="px-5 py-3">Lead Name</th>
                    <th className="px-4 py-3">Company</th>
                    <th className="px-4 py-3">Source</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.recentLeads.map((lead) => (
                    <tr
                      key={lead._id}
                      onClick={() => navigate(`/leads/edit/${lead._id}`)}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                    >
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-slate-900 group-hover:text-indigo-600 transition-colors text-xs sm:text-sm">
                          {lead.name}
                        </div>
                        <div className="text-[11px] text-slate-400">{lead.email}</div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-600">
                        {lead.company || <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-600">
                        {lead.source}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={lead.status} />
                      </td>
                      <td className="px-5 py-3.5 text-right text-xs text-slate-400">
                        {new Date(lead.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <Building className="w-5 h-5" />
                </div>
                <p className="text-sm font-medium text-slate-700">No leads recorded yet</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Start filling your CRM pipeline by creating your first sales lead.
                </p>
                <Link
                  to="/leads/new"
                  className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Lead</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Lead Status Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">Status Distribution</h3>
                <p className="text-xs text-slate-400 mt-0.5">Pipeline volume by stage</p>
              </div>
              <TrendingUp className="w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-4">
              {/* New */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    New
                  </span>
                  <span className="text-slate-500 font-semibold">
                    {statusDist.New} ({getPercentage(statusDist.New)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${getPercentage(statusDist.New)}%` }}
                  />
                </div>
              </div>

              {/* Contacted */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Contacted
                  </span>
                  <span className="text-slate-500 font-semibold">
                    {statusDist.Contacted} ({getPercentage(statusDist.Contacted)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${getPercentage(statusDist.Contacted)}%` }}
                  />
                </div>
              </div>

              {/* Qualified */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Qualified
                  </span>
                  <span className="text-slate-500 font-semibold">
                    {statusDist.Qualified} ({getPercentage(statusDist.Qualified)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${getPercentage(statusDist.Qualified)}%` }}
                  />
                </div>
              </div>

              {/* Lost */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    Lost
                  </span>
                  <span className="text-slate-500 font-semibold">
                    {statusDist.Lost} ({getPercentage(statusDist.Lost)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-slate-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${getPercentage(statusDist.Lost)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Conversion Rate</span>
              <span className="font-bold text-emerald-600">
                {getPercentage(statusDist.Qualified)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
