import { useEffect } from 'react';
import { useRouter } from 'next/router';
import SignUpForm from '@/components/auth/SignUpForm';
import { useAuth } from '@/lib/auth/authContext';
import Head from 'next/head';

export default function SignUp() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Sign Up | TaskMonk</title>
      </Head>
      <SignUpForm />
    </>
  );
}