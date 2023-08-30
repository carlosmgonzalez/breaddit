"use client"

import { useMutation } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { SubcribeToSubredditPayload } from "@/lib/validators/subreddit";
import axios, { AxiosError } from "axios";
import {useCustomToast} from "@/hooks/use-custom-toast";
import { toast } from "@/hooks/use-toast";
import { startTransition } from "react";
import { useRouter } from "next/navigation";

interface Props {
  subredditId: string;
  subredditName: string;
  isSubscribed: boolean;
}

export const SubscribeLeaveToggle = ({ subredditId, subredditName, isSubscribed } : Props) => {
  
  const {loginToast} = useCustomToast();
  const router = useRouter();

  const {mutate: subscribe, isLoading: isSubLoading} = useMutation({
    mutationFn: async () => {
      const payload:SubcribeToSubredditPayload = {
        subredditId
      };
      const {data} = await axios.post("/api/subreddit/subscribe", payload);
      return data as string;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast();
        };
      };

      return toast({
        title: "There was a problem.",
        description: "Something was wrong, please try again.",
        variant: "destructive"
      });
    },
    onSuccess: (data) => {
      startTransition(() => {
        router.refresh();
      });

      return toast({
        title: "Subscribed",
        description: `You are now subscribed to r/${subredditName}`,
      });
    }
  });

  const {mutate: unsubscribe, isLoading: isUnsubLoading} = useMutation({
    mutationFn: async () => {
      const payload:SubcribeToSubredditPayload = {
        subredditId
      };
      const {data} = await axios.post("/api/subreddit/unsubscribe", payload);
      return data as string;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast();
        };
      };

      return toast({
        title: "There was a problem.",
        description: "Something was wrong, please try again.",
        variant: "destructive"
      });
    },
    onSuccess: (data) => {
      startTransition(() => {
        router.refresh();
      });

      return toast({
        title: "Unsubscribed",
        description: `You are now unsubscribed to r/${subredditName}`
      });
    }
  });
  


  return isSubscribed 
    ? (
        <Button
          className="w-full mt-1 mb-4"
          onClick={() => unsubscribe()}
          isLoading={isUnsubLoading}
        >
          Leave community
        </Button>
      ) 
    : (
        <Button
          className="w-full mt-1 mb-4"
          onClick={() => subscribe()}
          isLoading={isSubLoading}
        >
          Join to post
        </Button>
      )
};
