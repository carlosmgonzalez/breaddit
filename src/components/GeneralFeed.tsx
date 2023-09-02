import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config";
import {prisma} from "@/lib/prisma";
import { PostFeed } from "./PostFeed";

const GeneralFeed = async () => {

  const post = await prisma.post.findMany({
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
  })

  return <PostFeed initialPosts={post}/>
};

export default GeneralFeed;
