import { Outlet, useLocation } from 'react-router-dom'
import AccessRestricted from '../../components/common/AccessRestricted'
import ReportDateFilter from '../../components/reports/ReportDateFilter'
import ReportNav from '../../components/reports/ReportNav'
import { useAuth } from '../../context/AuthContext'
import { useReportRange } from '../../context/ReportContext'
import { canAccessReport, defaultReportPath, reportSectionsFor } from '../../utils/reportAccess'

function sectionFromPath(pathname) {
  if (pathname === '/reports') return 'overview'
  return pathname.split('/')[2] || 'overview'
}

export default function ReportsLayout() {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const { rangeLabel } = useReportRange()
  const tabs = reportSectionsFor(user?.role)
  const section = sectionFromPath(pathname)

  if (!canAccessReport(user?.role, section)) {
    return (
      <AccessRestricted
        description="You don't have permission to view this report."
        to={defaultReportPath(user?.role)}
        actionLabel="Back to Reports"
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="hidden print:block">
        <h1 className="text-2xl font-semibold text-slate-900">Reports & Statistics</h1>
        <p className="mt-1 text-sm text-slate-500">Date range: {rangeLabel}</p>
      </div>
      <section className="no-print flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Reports & Statistics
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Analyze performance, activity, finances, and growth across MyInnings.
          </p>
        </div>
      </section>
      <ReportDateFilter />
      <ReportNav tabs={tabs} />
      <Outlet />
    </div>
  )
}
