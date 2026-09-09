import { Outlet, useLocation } from 'react-router-dom'
import FinanceTabs from '../../components/finance/FinanceTabs'
import { useAuth } from '../../context/AuthContext'
import { financeTabsFor } from '../../utils/financeAccess'
import { ROLES } from '../../utils/constants'

export default function FinanceLayout() {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const tabs = financeTabsFor(user?.role)
  const player = user?.role === ROLES.PLAYER
  const subtitle = player
    ? 'View your pending contributions and payment history.'
    : 'Track payments, expenses, and financial activity.'

  const detail = pathname.startsWith('/finance/payments/') && pathname !== '/finance/payments'

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          {player ? 'My Payments' : 'Finance'}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">{subtitle}</p>
      </section>
      {detail ? null : <FinanceTabs tabs={tabs} />}
      <Outlet />
    </div>
  )
}
