import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ROLES } from '../../utils/constants'

export default function Payments() {
  const { user } = useAuth()
  if (user?.role === ROLES.PLAYER) {
    return <Navigate to="/finance" replace />
  }
  return <Navigate to="/finance/payments" replace />
}
