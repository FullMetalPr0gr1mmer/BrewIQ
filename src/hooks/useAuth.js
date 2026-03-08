import useAuthStore from '../store/authStore';

export default function useAuth() {
  const { user, profile, loading } = useAuthStore();
  return {
    user,
    profile,
    loading,
    isAdmin: profile?.role === 'admin',
    isUser: profile?.role === 'user',
    isAuthenticated: !!user,
  };
}
