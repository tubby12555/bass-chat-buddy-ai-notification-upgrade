import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ContentPage from "./pages/ContentPage";
import ImagesPage from "./pages/ImagesPage";
import { useToast } from "@/components/ui/use-toast";
import React from "react";

const queryClient = new QueryClient();

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: unknown }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, error };
  }
  componentDidCatch(error: unknown, errorInfo: React.ErrorInfo) {
    // Log error to service if needed
    console.error("ErrorBoundary caught:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return <div className="fixed inset-0 flex items-center justify-center bg-black/90 z-50 text-white text-center">
        <div>
          <div className="text-2xl font-bold mb-2">Something went wrong</div>
          <div className="mb-4">{(this.state.error as Error)?.message || "An unexpected error occurred."}</div>
          <button className="bg-chat-accent px-4 py-2 rounded" onClick={() => window.location.reload()}>Reload</button>
        </div>
      </div>;
    }
    return this.props.children;
  }
}

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        setIsAuthenticated(!!data.session);
      } catch (err) {
        console.error('Error checking auth session:', err);
        setIsAuthenticated(false);
      }
      const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
        setIsAuthenticated(!!session);
        if (session?.user) {
          ensureProfileExists(session.user).catch(console.error);
        }
      });
      // cleanup
      return () => { sub.subscription.unsubscribe(); };
    };
    checkAuth();
  }, []);

  // Function to ensure profile exists for a user
  const ensureProfileExists = async (user: { id: string; user_metadata?: Record<string, unknown> }) => {
    if (!user || !user.id) return;
    
    console.log("Checking profile for user:", user.id);
    
    const userId = user.id;
    
    try {
      // Check if profile exists
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();
        
      // If no profile exists or there was an error finding it, create one
      if (!profile) {
        console.log("Creating new profile for user:", userId);
        
        // Extract metadata from user if available
        const firstName = typeof user.user_metadata?.first_name === 'string' ? user.user_metadata.first_name : null;
        const lastName = typeof user.user_metadata?.last_name === 'string' ? user.user_metadata.last_name : null;
        const profession = typeof user.user_metadata?.profession === 'string' ? user.user_metadata.profession : null;
        
        // Insert the profile with available data
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({ 
            user_id: userId,
            first_name: firstName || null,
            last_name: lastName || null,
            profession: profession || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (insertError) {
          console.error("Error creating profile:", insertError);
          toast({
            title: "Profile Error",
            description: "Could not create your profile. Some features may be limited.",
            variant: "destructive"
          });
        } else {
          console.log("Profile successfully created for:", userId);
        }
      } 
      // else {
      //   // Existing profile detected; no action needed
      //   // console.log("Profile already exists for user:", userId);
      // }
    } catch (error) {
      console.error("Error in profile check/creation:", error);
    }
  };

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />} />
              <Route path="/content" element={<ContentPage />} />
              <Route path="/images" element={<ImagesPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
