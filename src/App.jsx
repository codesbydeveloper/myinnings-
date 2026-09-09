import { BrowserRouter } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { AuthProvider } from './context/AuthContext'
import { TeamProvider } from './context/TeamContext'
import { MatchProvider } from './context/MatchContext'
import { TournamentProvider } from './context/TournamentContext'
import { FinanceProvider } from './context/FinanceContext'
import { GroundProvider } from './context/GroundContext'
import { NotificationProvider } from './context/NotificationContext'
import { ActivityProvider } from './context/ActivityContext'
import { ReportProvider } from './context/ReportContext'
import { ToastProvider } from './context/ToastContext'
import AppRoutes from './routes/AppRoutes'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <TeamProvider>
            <NotificationProvider>
              <ActivityProvider>
                <MatchProvider>
                  <TournamentProvider>
                    <GroundProvider>
                      <FinanceProvider>
                        <ReportProvider>
                          <ToastProvider>
                            <AppRoutes />
                          </ToastProvider>
                        </ReportProvider>
                      </FinanceProvider>
                    </GroundProvider>
                  </TournamentProvider>
                </MatchProvider>
              </ActivityProvider>
            </NotificationProvider>
          </TeamProvider>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
