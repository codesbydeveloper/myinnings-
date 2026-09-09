import DistributionChart from '../../components/reports/DistributionChart'
import FinanceTrendChart from '../../components/reports/FinanceTrendChart'
import ReportActions from '../../components/reports/ReportActions'
import ReportSection from '../../components/reports/ReportSection'
import ReportStatCard from '../../components/reports/ReportStatCard'
import ReportTable from '../../components/reports/ReportTable'
import StatusBadge from '../../components/dashboard/StatusBadge'
import { useReportData } from '../../hooks/useReportData'
import { ROLES } from '../../utils/constants'
import { downloadCsv, money } from '../../utils/reportUtils'

export default function FinanceReports() {
  const data = useReportData()
  const player = data.user?.role === ROLES.PLAYER
  const transactions = [
    ...data.payments.map((item) => ({
      id: item.id,
      kind: 'Payment',
      name: item.description || item.type,
      date: item.paidDate || item.createdDate || item.dueDate,
      amount: item.amount,
      status: data.effectiveStatus(item),
    })),
    ...(!player
      ? data.expenses.map((item) => ({
          id: item.id,
          kind: 'Expense',
          name: item.description,
          date: item.date || item.createdDate,
          amount: item.amount,
          status: 'Expense',
        }))
      : []),
  ].slice(0, 12)

  function handleExport() {
    downloadCsv(
      'myinnings-finance-report.csv',
      player ? data.payments : transactions,
      player
        ? [
            { label: 'Payment', value: (row) => row.description || row.type },
            { label: 'Amount', value: (row) => row.amount },
            { label: 'Status', value: (row) => data.effectiveStatus(row) },
            { label: 'Date', value: (row) => row.paidDate || row.dueDate || row.createdDate },
          ]
        : [
            { label: 'Type', value: (row) => row.kind },
            { label: 'Item', value: (row) => row.name },
            { label: 'Date', value: (row) => row.date },
            { label: 'Amount', value: (row) => row.amount },
            { label: 'Status', value: (row) => row.status },
          ],
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <ReportActions onPrint={() => window.print()} onExport={handleExport} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {!player ? <ReportStatCard label="Total Match Costs" value={money(data.finance.matchCosts)} icon="matches" /> : null}
        {!player ? <ReportStatCard label="Total Expenses" value={money(data.finance.expenses)} icon="fileText" /> : null}
        <ReportStatCard label="Total Amount Collected" value={money(data.finance.collected)} icon="finance" />
        <ReportStatCard label="Total Pending Payments" value={money(data.finance.pending)} icon="clock" />
        <ReportStatCard
          label={player ? 'Overdue Payments' : 'Total Paid Payments'}
          value={player ? money(data.finance.overdue) : money(data.finance.collected)}
          icon={player ? 'alert' : 'check'}
        />
      </div>
      {player ? (
        <p className="text-sm text-slate-500">
          This view is limited to your own payment and contribution records.
        </p>
      ) : null}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ReportSection title="Financial trend">
          <FinanceTrendChart data={data.financeTrend} />
        </ReportSection>
        <ReportSection title="Payment status">
          <DistributionChart
            data={data.paymentSlices}
            emptyTitle="NO FINANCE DATA"
            emptyDescription="No financial activity was found."
          />
        </ReportSection>
      </div>
      {!player ? (
        <ReportSection title="Expense breakdown">
          <DistributionChart
            data={data.expenseSlices}
            emptyTitle="NO FINANCE DATA"
            emptyDescription="No financial activity was found."
          />
        </ReportSection>
      ) : null}
      <ReportSection title="Recent transactions">
        <ReportTable
          rows={transactions}
          emptyTitle="NO FINANCE DATA"
          emptyDescription="No financial activity was found."
          columns={[
            { id: 'kind', label: player ? 'Payment' : 'Type', render: (row) => (player ? row.name : row.kind) },
            { id: 'name', label: 'Details' },
            { id: 'date', label: 'Date' },
            { id: 'amount', label: 'Amount', render: (row) => money(row.amount) },
            { id: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
          ]}
        />
      </ReportSection>
    </div>
  )
}
