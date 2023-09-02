import { MiniCreatePost } from "@/components/MiniCreatePost";
import { PostFeed } from "@/components/PostFeed";
import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config";
import { getAuthSession } from "@/lib/auth";
import {prisma} from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function page({params}: {params: {slug: string}}) {

  const {slug} = params;
  const name = decodeURIComponent(slug);
  const session = await getAuthSession();

  const subreddit = await prisma.subreddit.findFirst({
    where: {
      name
    },
    include: {
      posts: {
        include: {
          author: true,
          votes: true,
          comments: true,
          subreddit: true
        },
        take: INFINITE_SCROLLING_PAGINATION_RESULTS
      }
    }
  });

  if (!subreddit) return notFound();

  return (
    <>
      <h1 className="font-bold text-3xl md:text-4xl h-14">
        r/{subreddit.name}
      </h1>
      <MiniCreatePost session={session}/>
      {/* Show post in user feed */}
      <PostFeed initialPosts={subreddit.posts} subredditName={subreddit.name}/>
    </>
  );
};

