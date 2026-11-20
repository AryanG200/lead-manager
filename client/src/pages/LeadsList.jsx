import { Link } from 'react-router-dom';

const LeadsListPlaceholder = () => (
  <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
    <h3 className="text-base font-semibold text-slate-800">Leads Table</h3>
    <p className="text-sm text-slate-500 mt-1 mb-4">Lead list will be implemented in Checkpoint 6.</p>
    <Link to="/dashboard" className="text-sm text-indigo-600 font-medium hover:underline">
      Return to Dashboard
    </Link>
  </div>
);

export default LeadsListPlaceholder;
