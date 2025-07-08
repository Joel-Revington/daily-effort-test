
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Login from '@/components/auth/Login';
import Dashboard from '@/components/dashboard/Dashboard';

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Fetch user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        const userWithProfile = {
          ...session.user,
          id: session.user.id,
          role: profile?.role || 'user',
          name: profile?.full_name || session.user.email,
          position: profile?.role === 'admin' ? 'Administrator' : 'User'
        };
        
        setUser(userWithProfile);
      }
      
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
      } else if (event === 'SIGNED_IN' && session?.user) {
        // Fetch user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        const userWithProfile = {
          ...session.user,
          id: session.user.id,
          role: profile?.role || 'user',
          name: profile?.full_name || session.user.email,
          position: profile?.role === 'admin' ? 'Administrator' : 'User'
        };
        
        setUser(userWithProfile);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return <Dashboard user={user} onLogout={handleLogout} />;
};

export default Index;
