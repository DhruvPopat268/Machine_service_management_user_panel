export default function ConfirmModal({ open, title, message, confirmLabel, confirmStyle = 'red', onConfirm, onCancel }) {
  if (!open) return null

  const confirmColors = {
    red: 'bg-red-500 hover:bg-red-600 text-white',
    orange: 'bg-orange-500 hover:bg-orange-600 text-white',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10">
        <h3 className="text-base font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${confirmColors[confirmStyle]}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
