import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSupabase = () => {
  const { toast } = useToast();

  const handleError = (error: any, operation: string) => {
    console.error(`Error in ${operation}:`, error);
    toast({
      title: 'Database Error',
      description: `Failed to ${operation}. Please try again.`,
      variant: 'destructive',
    });
  };

  const handleSuccess = (message: string) => {
    toast({
      title: 'Success',
      description: message,
    });
  };

  return {
    supabase,
    handleError,
    handleSuccess,
  };
};

// Custom hook for real-time subscriptions
export const useRealtimeSubscription = (
  table: string,
  callback: (payload: any) => void,
  filter?: string
) => {
  useEffect(() => {
    const channel = supabase
      .channel(`realtime-${table}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter,
        },
        callback
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, callback, filter]);
};