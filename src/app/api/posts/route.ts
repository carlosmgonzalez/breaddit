import { getAuthSession } from "@/lib/auth";
import {prisma} from "@/lib/prisma";
import { z } from "zod";


export async function GET (req: Request) {
  try {
    const url = new URL(req.url);

    const session = await getAuthSession();

    let followedCommunitiesIds: string[] = [];

    if (session) {
      const followedCommunities = await prisma.subscription.findMany({
        where: {
          userId: session.user.id
        },
        include: {
          subreddit: true
        }
      });

      followedCommunitiesIds = followedCommunities.map(({subreddit}) => subreddit.id);
    };

    const {limit, page, subredditName} = z.object({
      limit: z.string(),
      page: z.string(),
      subredditName: z.string().nullish().optional(),
    }).parse({
      subredditName: url.searchParams.get("subredditName"),
      limit: url.searchParams.get("limit"),
      page: url.searchParams.get("page"),
    });

    let whereClause = {};

    if (subredditName) {
      whereClause= {
        subreddit: {
          name: subredditName,
        },
      };
    } else if (session) {
      whereClause = {
        subreddit: {
          id: {
            in: followedCommunitiesIds,
          },
        },
      };
    };

    const post = await prisma.post.findMany({
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      orderBy: {
        createdAt: "desc"
      },
      include: {
        subreddit: true,
        votes: true,
        author: true,
        comments: true
      },
      where: whereClause
    });

    return new Response(JSON.stringify(post));

  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid request data passed", {status: 422});
    };

    return new Response("Could not fetch more post, please try again later", {status: 500});
  };
};