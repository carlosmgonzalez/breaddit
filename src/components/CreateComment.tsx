"use client"

import { useState } from "react";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { CommentRequest } from "@/lib/validators/comment";
import {useCustomToast} from "@/hooks/use-custom-toast";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface Props {
  postId: string;
  replyToId?: string;
};

export const CreateComment = ({postId, replyToId}: Props) => {
  
  const [input, setInput] = useState<string>("");
  const {loginToast} = useCustomToast();
  const router = useRouter();

  const {mutate: comment, isLoading} = useMutation({
    mutationFn: async ({postId, text, replyToId}: CommentRequest) => {
      const payload: CommentRequest = {
        text,
        postId,
        replyToId
      };

      const {data} = await axios.patch("/api/subreddit/post/comment", payload);
      
      return data;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast();
        };
      };

      return toast({
        title: "There was a problem",
        description: "Something went wrong. Please try again later",
        variant: "destructive"
      });
    },
    onSuccess: () => {
      router.refresh();
      setInput("");
    }
  });

  return (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="comment">
        Your comment
      </Label>
      <div className="mt-2">
        <Textarea 
          id="comment" 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          placeholder="What are your thoughts?"
        />

        <div className="mt-2 flex justify-end">
          <Button
            isLoading={isLoading}
            disabled={input.length === 0}
            onClick={() => comment({postId, text: input, replyToId})}
          >
            Post
          </Button>
        </div>
      </div>
    </div>
  );
};
