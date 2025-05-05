
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/components/ui/use-toast";

interface ProfileEditorProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

const profileSchema = z.object({
  profession: z.string().optional(),
  mission: z.string().optional(),
  audience: z.string().optional(),
  img_style: z.string().optional(),
  blog_sample_url: z.string().url().optional().or(z.string().length(0)),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const ProfileEditor: React.FC<ProfileEditorProps> = ({ isOpen, onOpenChange, userId }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      profession: "",
      mission: "",
      audience: "",
      img_style: "",
      blog_sample_url: "",
    },
  });

  useEffect(() => {
    if (isOpen && userId) {
      fetchProfileData();
    }
  }, [isOpen, userId]);

  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile data:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive"
        });
        return;
      }

      if (data) {
        form.reset({
          profession: data.profession || "",
          mission: data.mission || "",
          audience: data.audience || "",
          img_style: data.img_style || "",
          blog_sample_url: data.blog_sample_url || "",
        });
      }
    } catch (error) {
      console.error("Error processing profile data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: ProfileFormValues) => {
    setIsLoading(true);
    try {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();

      let error;
      
      if (existingProfile) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('profiles')
          .update(values)
          .eq('user_id', userId);
        
        error = updateError;
      } else {
        // Insert new profile
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            ...values,
            user_id: userId
          });
        
        error = insertError;
      }

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Your profile has been updated",
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-chat text-white border-chat-accent">
        <DialogHeader>
          <DialogTitle className="text-chat-highlight">Edit Your Profile</DialogTitle>
        </DialogHeader>
        
        {isLoading && !form.formState.isSubmitting ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse text-chat-highlight">Loading profile data...</div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="profession"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Profession</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Your profession" 
                        className="bg-chat-assistant/10 border-chat-accent text-white"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="mission"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Mission</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="What's your mission?" 
                        className="bg-chat-assistant/10 border-chat-accent text-white min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="audience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Target Audience</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Your target audience" 
                        className="bg-chat-assistant/10 border-chat-accent text-white"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="img_style"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Preferred Image Style</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Your preferred image style" 
                        className="bg-chat-assistant/10 border-chat-accent text-white"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="blog_sample_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Blog Sample URL</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="URL to your blog sample" 
                        className="bg-chat-assistant/10 border-chat-accent text-white"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  className="text-white hover:bg-chat-accent/20"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isLoading || form.formState.isSubmitting}
                  className="bg-chat-highlight text-chat hover:bg-chat-highlight/90"
                >
                  {form.formState.isSubmitting ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditor;
