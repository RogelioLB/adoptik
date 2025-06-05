import { ToastContainer } from "react-toastify";
import { useEffect } from 'react';
import { supabase } from '../lib/supabase'; // Adjust path if necessary

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Supabase auth event:', event);
      console.log('Supabase session:', session);

      // Example: If you have a global user state, you could update it here.
      // if (event === 'SIGNED_IN' && session) {
      //   setUser(session.user);
      // } else if (event === 'SIGNED_OUT') {
      //   setUser(null);
      // }
      // The TOKEN_REFRESHED event will also be caught here if you need to react to it specifically,
      // though supabase-js handles using the new token automatically.
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <>
      <ToastContainer />
      {children}
    </>
  );
}
