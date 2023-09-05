import { formatTimeToNow } from "@/lib/utils";
import { ExtendedPost } from "@/types/db";
import { Post, User, Vote } from "@prisma/client";
import { MessageSquare } from "lucide-react";
import { useRef } from "react";
import { EditorOutput } from "./EditorOutput";
import { PostVoteClient } from "./post-vote/PostVoteClient";

type PartialVote = Pick<Vote, "type">;

interface Props {
  subredditName: string;
  post: Post & {
    author: User,
    votes: Vote[]
  };
  commentAmt: number;
  votesAmt: number;
  currentVote?: PartialVote
};

const Post = ({subredditName, post, commentAmt, votesAmt, currentVote}: Props) => {

  const pRef = useRef<HTMLDivElement>(null);
  
  
  return(
    <div className="rounded-md bg-white shadow">
      <div className="px-6 py-6 flex justify-between">
        {/* TODO: PostVotes */}
        <PostVoteClient 
          initialVotesAmt={votesAmt} 
          postId={post.id} 
          initialVote={currentVote?.type}
          className="hidden sm:flex sm:flex-col gap-4 sm:gap-0 pr-6 sm:w-20 pb-4 sm:pb-0"
        />
        
        <div className="w-0 flex-1">
          <div className="max-h-40 mt-1 text-xs text-gray-500">
            { 
              subredditName
              ? (
                  <>
                    <a href={`r/${subredditName}`} className="underline text-zinc-900 text-sm underline-offset-2">
                      r/{subredditName}
                    </a>
                    <span className="px-1">•</span>
                  </>
                )
              : null
            }
            <span>Posted by u/{post.author.name} - </span>
            {formatTimeToNow(new Date(post.createdAt))}
          </div>


          <a href={`/r/${subredditName}/post/${post.id}`}>
            <h1 className="text-lg font-semibold py-2 leading-6 text-gray-900">
              {post.title}
            </h1>
          </a>

          <div className="relative text-sm max-h-40 w-full overflow-clip" ref={pRef}>
            <EditorOutput content={post.content}/>
            {
              pRef.current?.clientHeight === 160
              ? (
                  <div className="absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-white to-transparent"/>
                )
              : null
            }
          </div>
        </div>
      </div>

      <div className="flex gap-x-2 bg-gray-50 z-20 text-sm p-4 sm:px-6">
        <PostVoteClient 
          initialVotesAmt={votesAmt} 
          postId={post.id} 
          initialVote={currentVote?.type}
          className="flex flex-row sm:hidden"
        />
        <a 
          href={`/r/${subredditName}/post/${post.id}`}
          className="w-fit flex items-center gap-2"
        > 
          <MessageSquare className="h-4 w-4"/> {commentAmt} comments
        </a>
      </div>

    </div>
  )
};

export default Post;
