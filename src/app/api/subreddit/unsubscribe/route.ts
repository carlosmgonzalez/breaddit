import { getAuthSession } from "@/lib/auth";
import {SubredditSubscriptionValidator} from "@/lib/validators/subreddit";
import {prisma} from "@/lib/prisma";
import {z} from "zod";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized", {status: 401});
    };

    const body = await req.json();
    const {subredditId} = SubredditSubscriptionValidator.parse(body);

    const isSubscribed = await prisma.subscription.findFirst({
      where: {
        subredditId,
        userId: session.user.id
      },
    });

    if (!isSubscribed) {
      return new Response("You've not been subscribed to this subreddit, yet.", {status: 400});
    };

    await prisma.subscription.delete({
      where: {
        userId_subredditId: {
          subredditId,
          userId: session.user.id
        },
      },
    });

    return new Response(subredditId);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, {status: 422});
    };

    return new Response("Could not subscribe, please try again later", {status: 500});
  };
};