import { redis } from "@/lib/redis";
import { CachedPost } from "@/types/redis";
import { Post, User, Vote } from "@prisma/client";
import {prisma} from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Suspense, cache } from "react";
import { buttonVariants } from "@/components/ui/button";
import { ArrowBigDown, ArrowBigUp, Loader2 } from "lucide-react";
import { PostVoteServer } from "@/components/post-vote/PostVoteServer";
import { formatTimeToNow } from "@/lib/utils";
import { EditorOutput } from "@/components/EditorOutput";
import { CommentsSection } from "@/components/CommentsSection";

export default async function page({params}: {params: {postId: string} }) {
  
  const cachedPost = await redis.hgetall(`post:${params.postId}`) as CachedPost;

  let post: (Post & {votes: Vote[], author: User}) | null = null;

  if (!cachedPost) {
    post = await prisma.post.findFirst({
      where: {
        id: params.postId
      },
      include: {
        author: true,
        votes: true
      }
    });
  };

  if (!post && !cachedPost) return notFound();

  return (
    <div>
      <div className="h-full flex flex-col sm:flex-row items-center sm:items-start justify-between">
        <Suspense fallback={<PostVoteShell/>}>
          {/* @ts-expect-error server component */}
          <PostVoteServer 
            postId={post?.id ?? cachedPost.id} 
            getData={async () => {
              return await prisma.post.findUnique({
                where: {
                  id: params.postId
                },
                include: {
                  votes: true
                }
              })
            }}
          />
        </Suspense>

        <div className="sm:w-0 w-full flex-1 bg-white p-4 rounded-sm">
          <p className="max-h-40 truncate text-xs text-gray-500">
            Posted by u/{post?.author.name ?? cachedPost.authorUsername} {` `}
            {formatTimeToNow(new Date(post?.createdAt ?? cachedPost.createdAt))}
          </p>
          <h1 className="text-xl font-semibold py-2 leading-6 text-gray-900">
            {post?.title ?? cachedPost.title}
          </h1>

          <EditorOutput content={post?.content ?? cachedPost.contect}/>

          <Suspense
            fallback={
              <Loader2 className="h-5 w-5 animate-spin text-zinc-500"/>
            }
          >
            {/* @ts-expect-error server commponent */}
            <CommentsSection postId={post?.id ?? cachedPost.id}/>
          </Suspense>
        </div>
      </div>
    </div>
  );
};

function PostVoteShell () {
  return (
    <div className="flex items-center flex-col pr-6 w-20">
      {/* Up Vote */}
      <div className={buttonVariants({variant: "ghost"})}>
        <ArrowBigUp className="h-5 w-5 text-zinc-700"/>
      </div>

      {/* Score */}
      <div className="text-center py-2 font-medium text-sm text-zinc-900">
        <Loader2 className="h3 w-3 animate-spin"/>
      </div>

      {/* Down Vote */}
      <div className={buttonVariants({variant: "ghost"})}>
        <ArrowBigDown className="h-5 w-5 text-zinc-700"/>
      </div>
    </div>
  )
}
