export default function PagePlaceholder({ title, description }) {
  return (
    <section className="max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
        {title}
      </h1>
      <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
        {description}
      </p>
    </section>
  )
}
