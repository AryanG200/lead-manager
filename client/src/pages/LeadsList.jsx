import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { leadService } from '../services/leadService';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import {
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  ArrowUpDown,
  Mail,
  Phone,
  Building,
  RefreshCw,
  X,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';

const statuses = ['All', 'New', 'Contacted', 'Qualified', 'Lost'];
const sources = [
  'All',
  'Website',
  'LinkedIn',
  'Referral',
  'Social Media',
  'Advertisement',
  'Cold Calling',
  'Other',
];

const LeadsList = () => {
  const navigate = useNavigate();

  // State
  const [leads, setLeads] = useState([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Debounce search input (350ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1); // Reset to page 1 on new search
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch leads
  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: 10,
        sortBy,
        sortOrder,
        ...(debouncedSearch.trim() && { search: debouncedSearch.trim() }),
        ...(statusFilter !== 'All' && { status: statusFilter }),
        ...(sourceFilter !== 'All' && { source: sourceFilter }),
      };

      const data = await leadService.getLeads(params);
      if (data.success) {
        setLeads(data.leads || []);
        setTotalLeads(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error('Fetch leads error:', err);
      setError('Could not load leads. Please check your network or try again.');
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, statusFilter, sourceFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setStatusFilter('All');
    setSourceFilter('All');
    setSortBy('createdAt');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  // Open delete modal
  const handleOpenDelete = (lead, e) => {
    e.stopPropagation();
    setLeadToDelete(lead);
    setDeleteModalOpen(true);
  };

  // Confirm delete action
  const handleConfirmDelete = async () => {
    if (!leadToDelete) return;
    try {
      setDeleteLoading(true);
      const res = await leadService.deleteLead(leadToDelete._id);
      if (res.success) {
        toast.success(`Lead "${leadToDelete.name}" deleted`);
        setDeleteModalOpen(false);
        setLeadToDelete(null);
        // If last item on current page was deleted and page > 1, go back one page
        if (leads.length === 1 && currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
        } else {
          fetchLeads();
        }
      }
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to delete lead. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Lead Directory</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage, search, filter and track your sales leads
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchLeads}
            title="Refresh leads"
            className="p-2 text-slate-500 hover:text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/leads/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 text-white text-xs sm:text-sm font-medium hover:bg-indigo-700 transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lead</span>
          </Link>
        </div>
      </div>

      {/* Search, Filter & Sort Controls Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="lg:col-span-5 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or company..."
              className="block w-full pl-9 pr-8 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="lg:col-span-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Filter className="w-3.5 h-3.5" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="block w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white transition"
              >
                {statuses.map((st) => (
                  <option key={st} value={st}>
                    {st === 'All' ? 'All Statuses' : `Status: ${st}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Source Filter */}
          <div className="lg:col-span-2">
            <select
              value={sourceFilter}
              onChange={(e) => {
                setSourceFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="block w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white transition"
            >
              {sources.map((src) => (
                <option key={src} value={src}>
                  {src === 'All' ? 'All Sources' : src}
                </option>
              ))}
            </select>
          </div>

          {/* Sorting */}
          <div className="lg:col-span-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <ArrowUpDown className="w-3.5 h-3.5" />
              </div>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                  setCurrentPage(1);
                }}
                className="block w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white transition"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="name-asc">Name (A - Z)</option>
                <option value="name-desc">Name (Z - A)</option>
                <option value="company-asc">Company Name</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filter Indicators */}
        {(debouncedSearch || statusFilter !== 'All' || sourceFilter !== 'All') && (
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2 flex-wrap">
              <span>Active filters:</span>
              {debouncedSearch && (
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-medium border border-indigo-100">
                  Search: "{debouncedSearch}"
                </span>
              )}
              {statusFilter !== 'All' && (
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium border border-blue-100">
                  Status: {statusFilter}
                </span>
              )}
              {sourceFilter !== 'All' && (
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium border border-slate-200">
                  Source: {sourceFilter}
                </span>
              )}
            </div>
            <button
              onClick={handleResetFilters}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium underline"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Leads Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <p className="text-sm font-medium text-rose-600">{error}</p>
            <button
              onClick={fetchLeads}
              className="mt-3 px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
        ) : leads.length === 0 ? (
          /* Empty State */
          <div className="p-12 text-center max-w-sm mx-auto">
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              {debouncedSearch || statusFilter !== 'All' || sourceFilter !== 'All'
                ? 'No matching leads found'
                : 'No leads in your CRM yet'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              {debouncedSearch || statusFilter !== 'All' || sourceFilter !== 'All'
                ? 'Try adjusting your search keywords or resetting your active filters.'
                : 'Create your first lead to track outreach and qualify prospects.'}
            </p>
            {debouncedSearch || statusFilter !== 'All' || sourceFilter !== 'All' ? (
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Reset Filters
              </button>
            ) : (
              <Link
                to="/leads/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create First Lead</span>
              </Link>
            )}
          </div>
        ) : (
          /* Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/70">
                  <th className="px-5 py-3.5">Lead Name</th>
                  <th className="px-4 py-3.5">Contact Info</th>
                  <th className="px-4 py-3.5">Company</th>
                  <th className="px-4 py-3.5">Source</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Created Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((lead) => (
                  <tr
                    key={lead._id}
                    onClick={() => navigate(`/leads/edit/${lead._id}`)}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                  >
                    {/* Name */}
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors text-xs sm:text-sm">
                        {lead.name}
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-0.5 text-xs text-slate-600">
                        <span className="flex items-center gap-1 text-slate-600">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          {lead.email}
                        </span>
                        <span className="flex items-center gap-1 text-slate-500 text-[11px]">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          {lead.phone}
                        </span>
                      </div>
                    </td>

                    {/* Company */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 text-xs text-slate-700">
                        <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{lead.company || <span className="text-slate-300">—</span>}</span>
                      </div>
                    </td>

                    {/* Source */}
                    <td className="px-4 py-3.5 text-xs text-slate-600">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                        {lead.source}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <StatusBadge status={lead.status} />
                    </td>

                    {/* Created Date */}
                    <td className="px-4 py-3.5 text-xs text-slate-500">
                      {new Date(lead.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => navigate(`/leads/edit/${lead._id}`)}
                          title="Edit lead"
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleOpenDelete(lead, e)}
                          title="Delete lead"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {!loading && !error && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalLeads}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setLeadToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        leadName={leadToDelete?.name}
        loading={deleteLoading}
      />
    </div>
  );
};

export default LeadsList;
