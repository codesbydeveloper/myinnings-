import SectionHeader from './SectionHeader'

export default function SectionCard({ title, action, children, className = '' }) {
  return (
    <section
      className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 ${className}`}
    >
      {title ? <SectionHeader title={title} action={action} /> : null}
      {children}
    </section>
  )
}
