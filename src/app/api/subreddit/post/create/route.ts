import { getAuthSession } from "@/lib/auth";
import { PostValidator } from "@/lib/validators/post";
import {prisma} from "@/lib/prisma";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized", {status: 401});
    };

    const body = await req.json();
    const {title, content, subredditId} = PostValidator.parse(body);

    const subscriptionExists = await prisma.subscription.findFirst({
      where: {
        subredditId,
        userId: session.user.id
      },
    });

    if (!subscriptionExists) {
      return new Response("Subscribe to post", {status: 400});
    };

    await prisma.post.create({
      data: {
        title,
        content,
        subredditId,
        authorId: session.user.id,
      }
    });

    return new Response("OK");

  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid POST request data passed", {status: 422});
    };

    return new Response("Could not post subreddit at this time, please try again later", {status: 500});
  };
};