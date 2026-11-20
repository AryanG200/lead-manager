import { AlertTriangle, Loader2 } from 'lucide-react';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, leadName, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={loading ? undefined : onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all w-full max-w-md p-6 border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Confirm Deletion</h3>
              <p className="text-xs text-slate-500 mt-0.5">This action cannot be undone.</p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm text-slate-600">
              Are you sure you want to permanently delete lead{' '}
              <span className="font-semibold text-slate-900">{leadName ? `"${leadName}"` : 'this lead'}</span>?
              All associated details will be removed from your database.
            </p>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={onConfirm}
              className="inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-medium text-white bg-rose-600 border border-transparent rounded-lg hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 disabled:opacity-50 transition shadow-xs"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                  Deleting...
                </>
              ) : (
                'Delete Lead'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
