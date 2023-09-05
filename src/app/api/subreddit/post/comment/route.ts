import { CommentValidator } from "@/lib/validators/comment";
import {prisma} from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { z } from "zod";

export async function PATCH(req: Request) {
  
  try {

    const body = await req.json();

    const {postId, text, replyToId} = CommentValidator.parse(body);

    const session = await getAuthSession();

    if (!session?.user) return new Response("Unauthorized", {status: 401});

    await prisma.comment.create({
      data: {
        postId,
        authorId: session.user.id,
        text,
        replyToId
      }
    });
    
    return new Response("OK");
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid request data passed", {status: 422});
    };

    return new Response("Could not create cooment, please try again later", {status: 500});
  }
}