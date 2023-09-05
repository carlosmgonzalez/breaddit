"use client"

import { Comment, CommentVote, User, VoteType } from "@prisma/client";
import { useRef, useState } from "react";
import { UserAvatar } from "./UserAvatar";
import { formatTimeToNow } from "@/lib/utils";
import { CommentVotes } from "./CommentVotes";
import { Button } from "./ui/button";
import { MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Textarea } from "./ui/textarea";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { CommentRequest } from "@/lib/validators/comment";
import { toast } from "@/hooks/use-toast";

type ExtendedComment = Comment & {
  votes: CommentVote[],
  author: User
}

interface Props {
  comment: ExtendedComment;
  votesAmt: number;
  currentVote: CommentVote | undefined;
  postId: string;
};

export const PostComment = ({comment, votesAmt, currentVote, postId}: Props) => {

  const commentRef = useRef(null);
  const router = useRouter();
  const {data: session} = useSession();
  const [isReplying, setIsReplying] = useState<boolean>(false);
  const [input, setInput] = useState<string>("");

  const {mutate: postComment, isLoading} = useMutation({
    mutationFn: async ({postId, text, replyToId}: CommentRequest) => {
      const payload: CommentRequest = {
        postId,
        text,
        replyToId
      };

      const {data} = await axios.patch("/api/subreddit/post/comment", payload);
      return data;
    },
    onError: () => {
      return toast({
        title: "Something went wrong",
        description: "Comment wasn't posted successfully, please try again",
        variant: "destructive"
      });
    },
    onSuccess: () => {
      router.refresh();
      setIsReplying(false);
      setInput("");
    }
  });

  return (
    <div ref={commentRef} className="flex flex-col">
      <div className="flex items-center">
        <UserAvatar
          user={{
            name: comment.author.name || null,
            image: comment.author.image || null
          }}
          className="h-6 w-6"
        />

        <div className="ml-2 flex items-center gap-x-2">
          <p className="text-sm font-medium text-gray-900">
            u/{comment.author.username}
          </p>
          <p className="max-h-40 truncate text-xs text-zinc-500">
            {formatTimeToNow(new Date(comment.createdAt))}
          </p>
        </div>
      </div>

      <p className="text-sm text-zinc-900 mt-2">
        {comment.text}
      </p>

      <div className="flex flex-wrap gap-2 items-center">
        <CommentVotes 
          className="flex gap-1" 
          commentId={comment.id}
          initialVotesAmt={votesAmt}
          initialVote={currentVote}
        />
        <Button 
          variant="ghost" 
          size="xs"
          onClick={() => {
            if(!session?.user) return router.push("/sing-in");
            setIsReplying(true);
          }}
        >
          <MessageSquare className="w-4 h-4 mr-1.5"/>
          Reply
        </Button>
        {
          isReplying 
          ? (
              <div className="grid w-full gap-1.5">
                <label>You'r comment</label>
                <div className="mt-2">
                  <Textarea 
                    id="comment" 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="What are your thoughts?"
                  />
                  <div className="mt-2 flex justify-end gap-2">
                    <Button 
                        tabIndex={-1} 
                        variant="subtle" 
                        onClick={() => setIsReplying(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        isLoading={isLoading}
                        disabled={input.length === 0}
                        onClick={() => {
                          if (!input) return;
                          postComment({
                            postId,
                            text: input,
                            replyToId: comment.replyToId ?? comment.id
                          })
                        }}
                      >
                        Post
                      </Button>
                  </div>
                </div>
              </div>
            )
          : null
        }
      </div>
    </div>
  );
};
