import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { fetchProfile } from '../api/auth'

const ProfileContext = createContext(null)

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)

  const loadProfile = useCallback(() => {
    setProfileLoading(true)
    fetchProfile()
      .then(setProfile)
      .catch(() => setProfile(null))
      .finally(() => setProfileLoading(false))
  }, [])

  useEffect(() => { loadProfile() }, [loadProfile])

  return (
    <ProfileContext.Provider value={{ profile, profileLoading, refreshProfile: loadProfile }}>
      {children}
    </ProfileContext.Provider>
  )
}

export const useProfile = () => useContext(ProfileContext)
