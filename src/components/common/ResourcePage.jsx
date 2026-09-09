import { useAuth } from '../../context/AuthContext'
import { getPageMeta } from '../../utils/navigation'

export default function ResourcePage({ pathname, children }) {
  const { user } = useAuth()
  const { title, description } = getPageMeta(pathname, user?.role)

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
          {description}
        </p>
      </section>
      {children}
    </div>
  )
}
