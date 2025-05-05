import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);

      // Set up auth listener
      supabase.auth.onAuthStateChange(async (_event, session) => {
        setIsAuthenticated(!!session);
        if (session?.user) {
          const userId = session.user.id;
          // Check if profile exists
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('user_id', userId)
            .maybeSingle();
          if (!profile && !error) {
            // Insert new profile with just user_id
            await supabase.from('profiles').insert({ user_id: userId });
          }
        }
      });
    };

    checkAuth();
  }, []);

  // Show loading state while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center h-screen bg-chat">
        <div className="animate-pulse text-white text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
