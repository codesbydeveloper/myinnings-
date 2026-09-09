import { Navigate, Route, Routes } from 'react-router-dom'
import { ROLES } from '../utils/constants'
import DashboardLayout from '../components/layout/DashboardLayout'
import ProtectedRoute from '../components/routes/ProtectedRoute'
import PublicOnlyRoute from '../components/routes/PublicOnlyRoute'
import RoleRoute from '../components/routes/RoleRoute'
import AdminDashboard from '../pages/admin/AdminDashboard'
import Users from '../pages/admin/Users'
import Search from '../pages/search/Search'
import ReportsLayout from '../pages/reports/ReportsLayout'
import ReportsOverview from '../pages/reports/ReportsOverview'
import MatchReports from '../pages/reports/MatchReports'
import TeamReports from '../pages/reports/TeamReports'
import PlayerReports from '../pages/reports/PlayerReports'
import TournamentReports from '../pages/reports/TournamentReports'
import FinanceReports from '../pages/reports/FinanceReports'
import GroundReports from '../pages/reports/GroundReports'
import ForgotPassword from '../pages/auth/ForgotPassword'
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import ResetPassword from '../pages/auth/ResetPassword'
import Dashboard from '../pages/dashboard/Dashboard'
import FinanceLayout from '../pages/finance/FinanceLayout'
import FinanceOverview from '../pages/finance/FinanceOverview'
import FinancePayments from '../pages/finance/FinancePayments'
import FinancePaymentDetails from '../pages/finance/FinancePaymentDetails'
import FinanceExpenses from '../pages/finance/FinanceExpenses'
import FinanceLedger from '../pages/finance/FinanceLedger'
import Payments from '../pages/finance/Payments'
import Availability from '../pages/matches/Availability'
import CreateMatch from '../pages/matches/CreateMatch'
import EditMatch from '../pages/matches/EditMatch'
import MatchDetails from '../pages/matches/MatchDetails'
import Matches from '../pages/matches/Matches'
import Notifications from '../pages/notifications/Notifications'
import CreatePlayer from '../pages/players/CreatePlayer'
import EditPlayer from '../pages/players/EditPlayer'
import PlayerDetails from '../pages/players/PlayerDetails'
import Players from '../pages/players/Players'
import Settings from '../pages/settings/Settings'
import CreateTeam from '../pages/teams/CreateTeam'
import EditTeam from '../pages/teams/EditTeam'
import TeamDetails from '../pages/teams/TeamDetails'
import Teams from '../pages/teams/Teams'
import Fixtures from '../pages/tournaments/Fixtures'
import Tournaments from '../pages/tournaments/Tournaments'
import CreateTournament from '../pages/tournaments/CreateTournament'
import EditTournament from '../pages/tournaments/EditTournament'
import TournamentDetails from '../pages/tournaments/TournamentDetails'
import Grounds from '../pages/grounds/Grounds'
import CreateGround from '../pages/grounds/CreateGround'
import EditGround from '../pages/grounds/EditGround'
import GroundDetails from '../pages/grounds/GroundDetails'
import NotificationPreferences from '../pages/notifications/NotificationPreferences'
import Activity from '../pages/activity/Activity'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/teams/new" element={<CreateTeam />} />
          <Route path="/teams/create" element={<CreateTeam />} />
          <Route path="/teams/:teamId/edit" element={<EditTeam />} />
          <Route path="/teams/:teamId" element={<TeamDetails />} />
          <Route path="/players" element={<Players />} />
          <Route path="/players/new" element={<CreatePlayer />} />
          <Route path="/players/create" element={<CreatePlayer />} />
          <Route path="/players/:playerId/edit" element={<EditPlayer />} />
          <Route path="/players/:playerId" element={<PlayerDetails />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/matches/new" element={<CreateMatch />} />
          <Route path="/matches/create" element={<CreateMatch />} />
          <Route path="/matches/:matchId/edit" element={<EditMatch />} />
          <Route path="/matches/:matchId" element={<MatchDetails />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/tournaments/new" element={<CreateTournament />} />
          <Route path="/tournaments/create" element={<CreateTournament />} />
          <Route path="/tournaments/:tournamentId/edit" element={<EditTournament />} />
          <Route path="/tournaments/:tournamentId" element={<TournamentDetails />} />
          <Route path="/fixtures" element={<Fixtures />} />
          <Route path="/availability" element={<Availability />} />
          <Route path="/grounds" element={<Grounds />} />
          <Route path="/grounds/new" element={<CreateGround />} />
          <Route path="/grounds/create" element={<CreateGround />} />
          <Route path="/grounds/:groundId/edit" element={<EditGround />} />
          <Route path="/grounds/:groundId" element={<GroundDetails />} />
          <Route path="/finance" element={<FinanceLayout />}>
            <Route index element={<FinanceOverview />} />
            <Route path="payments" element={<FinancePayments />} />
            <Route path="payments/:paymentId" element={<FinancePaymentDetails />} />
            <Route path="expenses" element={<FinanceExpenses />} />
            <Route path="ledger" element={<FinanceLedger />} />
          </Route>
          <Route path="/payments" element={<Payments />} />
          <Route path="/notifications/preferences" element={<NotificationPreferences />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/search" element={<Search />} />
          <Route element={<RoleRoute roles={[ROLES.ADMIN]} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/users" element={<Users />} />
          </Route>
          <Route path="/reports" element={<ReportsLayout />}>
            <Route index element={<ReportsOverview />} />
            <Route path="matches" element={<MatchReports />} />
            <Route path="teams" element={<TeamReports />} />
            <Route path="players" element={<PlayerReports />} />
            <Route path="tournaments" element={<TournamentReports />} />
            <Route path="finance" element={<FinanceReports />} />
            <Route path="grounds" element={<GroundReports />} />
          </Route>
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  )
}
