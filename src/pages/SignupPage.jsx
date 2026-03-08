import { Navigate } from 'react-router-dom';
import SignupForm from '../components/auth/SignupForm';
import CoffeeBackground from '../components/shared/CoffeeBackground';
import Logo from '../components/shared/Logo';
import PageTransition from '../components/layout/PageTransition';
import useAuth from '../hooks/useAuth';

export default function SignupPage() {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (!loading && isAuthenticated) {
    return <Navigate to={isAdmin ? '/admin' : '/chat'} replace />;
  }

  return (
    <PageTransition>
      <CoffeeBackground />
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative">
        <div className="mb-8">
          <Logo size="lg" className="text-brew-800" />
        </div>
        <div className="w-full max-w-md bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-brew-100">
          <SignupForm />
        </div>
      </div>
    </PageTransition>
  );
}
