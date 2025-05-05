
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

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);

      // Set up auth listener
      supabase.auth.onAuthStateChange(async (event, session) => {
        console.log("Auth state changed:", event);
        setIsAuthenticated(!!session);
        
        if (session?.user) {
          await ensureProfileExists(session.user);
        }
      });
    };

    checkAuth();
  }, []);

  // Function to ensure profile exists for a user
  const ensureProfileExists = async (user: any) => {
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
        const firstName = user.user_metadata?.first_name;
        const lastName = user.user_metadata?.last_name;
        const profession = user.user_metadata?.profession;
        
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
      } else {
        console.log("Profile already exists for user:", userId);
      }
    } catch (error) {
      console.error("Error in profile check/creation:", error);
    }
  };

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
            <Route path="/content" element={<ContentPage />} />
            <Route path="/images" element={<ImagesPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
