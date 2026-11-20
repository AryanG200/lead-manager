import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { leadService } from '../services/leadService';
import {
  User,
  Mail,
  Phone,
  Building,
  Globe,
  Tag,
  ArrowLeft,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const sources = [
  'Website',
  'LinkedIn',
  'Referral',
  'Social Media',
  'Advertisement',
  'Cold Calling',
  'Other',
];

const statuses = ['New', 'Contacted', 'Qualified', 'Lost'];

const LeadForm = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    source: 'Website',
    status: 'New',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  // If editing, fetch existing lead data to populate form
  useEffect(() => {
    if (isEditing) {
      const fetchLead = async () => {
        try {
          setInitialLoading(true);
          const data = await leadService.getLeadById(id);
          if (data.success && data.lead) {
            setFormData({
              name: data.lead.name || '',
              email: data.lead.email || '',
              phone: data.lead.phone || '',
              company: data.lead.company || '',
              source: data.lead.source || 'Website',
              status: data.lead.status || 'New',
            });
          }
        } catch (err) {
          console.error('Failed to load lead details:', err);
          toast.error('Failed to load lead details');
          navigate('/leads');
        } finally {
          setInitialLoading(false);
        }
      };

      fetchLead();
    }
  }, [id, isEditing, navigate]);

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please provide a valid phone number (at least 7 digits)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation error when user begins typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      if (isEditing) {
        const res = await leadService.updateLead(id, formData);
        if (res.success) {
          toast.success('Lead updated successfully!');
          navigate('/leads');
        }
      } else {
        const res = await leadService.createLead(formData);
        if (res.success) {
          toast.success('Lead created successfully!');
          navigate('/leads');
        }
      }
    } catch (err) {
      console.error('Save lead error:', err);
      const message =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        'Failed to save lead. Please check your connection and inputs.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
        <p className="text-sm text-slate-500">Loading lead details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/leads"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
            title="Back to leads"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {isEditing ? 'Edit Lead' : 'Create New Lead'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEditing
                ? 'Update client information and conversion stage'
                : 'Add a new prospect to your sales pipeline'}
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="h-4 w-4" />
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Sarah Jenkins"
                className={`block w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition ${
                  errors.name
                    ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/20'
                    : 'border-slate-300 focus:ring-indigo-500/20 focus:border-indigo-600'
                }`}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-rose-600 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="sarah.jenkins@company.com"
                className={`block w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition ${
                  errors.email
                    ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/20'
                    : 'border-slate-300 focus:ring-indigo-500/20 focus:border-indigo-600'
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-rose-600 mt-1">{errors.email}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Phone className="h-4 w-4" />
              </div>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 234-5678"
                className={`block w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition ${
                  errors.phone
                    ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/20'
                    : 'border-slate-300 focus:ring-indigo-500/20 focus:border-indigo-600'
                }`}
              />
            </div>
            {errors.phone && (
              <p className="text-xs text-rose-600 mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Company Name (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Building className="h-4 w-4" />
              </div>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Acme Corporation"
                className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              />
            </div>
          </div>

          {/* Grid: Source & Status Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Lead Source */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Lead Source <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Globe className="h-4 w-4" />
                </div>
                <select
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white transition"
                >
                  {sources.map((src) => (
                    <option key={src} value={src}>
                      {src}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Lead Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Pipeline Status <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Tag className="h-4 w-4" />
                </div>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white transition"
                >
                  {statuses.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link
              to="/leads"
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {isEditing ? 'Updating Lead...' : 'Creating Lead...'}
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {isEditing ? 'Save Changes' : 'Create Lead'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadForm;
