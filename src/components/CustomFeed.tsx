import { getAuthSession } from "@/lib/auth";
import { PostFeed } from "./PostFeed";
import {prisma} from "@/lib/prisma";
import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config";

export const CustomFeed = async () => {

  const session = await getAuthSession();

  const followedCommunities = await prisma.subscription.findMany({
    where: {
      userId: session?.user.id
    },
    include: {
      subreddit: true
    }
  });

  const followedCommunitiesNames = followedCommunities.map(({subreddit}) => subreddit.id);

  const post = await prisma.post.findMany({
    where: {
      subreddit: {
        name: {
          in: followedCommunitiesNames
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    },
    include: {
      votes: true,
      author: true,
      comments: true,
      subreddit: true
    },
    take: INFINITE_SCROLLING_PAGINATION_RESULTS
  });

  return <PostFeed initialPosts={post}/>
};
