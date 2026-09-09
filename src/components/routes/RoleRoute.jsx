import { Outlet } from 'react-router-dom'
import AccessRestricted from '../common/AccessRestricted'
import { useAuth } from '../../context/AuthContext'

export default function RoleRoute({ roles = [] }) {
  const { user } = useAuth()

  if (!roles.includes(user?.role)) {
    return (
      <AccessRestricted
        title="You don't have permission to perform this action."
        description="This area is limited to authorized MyInnings roles."
      />
    )
  }

  return <Outlet />
}
