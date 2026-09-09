const STYLES = {
  Pending: 'bg-amber-50 text-amber-700',
  Available: 'bg-emerald-50 text-emerald-700',
  'Not Available': 'bg-slate-100 text-slate-600',
  Approved: 'bg-emerald-50 text-emerald-700',
  Paid: 'bg-emerald-50 text-emerald-700',
  Received: 'bg-emerald-50 text-emerald-700',
  Expense: 'bg-slate-100 text-slate-600',
  Due: 'bg-amber-50 text-amber-700',
  Active: 'bg-emerald-50 text-emerald-700',
  Inactive: 'bg-slate-100 text-slate-600',
  Suspended: 'bg-red-50 text-red-700',
  Archived: 'bg-amber-50 text-amber-800',
  Completed: 'bg-slate-100 text-slate-600',
  Upcoming: 'bg-emerald-50 text-emerald-700',
  Live: 'bg-red-50 text-red-700',
  Draft: 'bg-slate-100 text-slate-600',
  Cancelled: 'bg-red-50 text-red-700',
  Selected: 'bg-emerald-50 text-emerald-700',
  Included: 'bg-emerald-50 text-emerald-700',
  Replaced: 'bg-amber-50 text-amber-800',
  Excluded: 'bg-slate-100 text-slate-600',
  'Pending Review': 'bg-amber-50 text-amber-700',
  Overdue: 'bg-red-50 text-red-700',
  Former: 'bg-slate-100 text-slate-600',
  'Registration Open': 'bg-emerald-50 text-emerald-700',
  'Registration Closed': 'bg-amber-50 text-amber-800',
  'Fixtures Generated': 'bg-sky-50 text-sky-800',
  Ongoing: 'bg-emerald-50 text-emerald-700',
  Booked: 'bg-amber-50 text-amber-800',
  Practice: 'bg-sky-50 text-sky-800',
  Match: 'bg-emerald-50 text-emerald-700',
  Tournament: 'bg-indigo-50 text-indigo-700',
  Other: 'bg-slate-100 text-slate-600',
  'Partially Booked': 'bg-amber-50 text-amber-800',
  'Fully Booked': 'bg-red-50 text-red-700',
  'Under Maintenance': 'bg-slate-100 text-slate-600',
  'Platform Admin': 'bg-indigo-50 text-indigo-700',
  'Team Manager': 'bg-emerald-50 text-emerald-700',
  'Team Captain': 'bg-sky-50 text-sky-800',
  'Tournament Organizer': 'bg-amber-50 text-amber-800',
  Player: 'bg-slate-100 text-slate-700',
}

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        STYLES[status] ?? 'bg-slate-100 text-slate-600'
      }`}
    >
      {status}
    </span>
  )
}
