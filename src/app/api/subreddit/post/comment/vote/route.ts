import { getAuthSession } from "@/lib/auth";
import {prisma} from "@/lib/prisma";
import { CommentVoteValidator } from "@/lib/validators/vote";
import { z } from "zod";

export async function PATCH (req: Request) {
  try {

    const session = await getAuthSession();
    if (!session?.user) return new Response("Unauthorized access", {status: 401});
    const userId = session.user.id;

    const body = await req.json();

    const {commentId, voteType} = CommentVoteValidator.parse(body);

    const existingVote = await prisma.commentVote.findFirst({
      where: {
        commentId,
        userId,
      }
    });

    if (existingVote) {

      if (existingVote.type === voteType) {
        await prisma.commentVote.delete({
          where: {
            userId_commentId: {
              commentId,
              userId
            }
          }
        });

        return new Response("OK");
      };

      await prisma.commentVote.update({
        where: {
          userId_commentId: {
            commentId,
            userId
          }
        },
        data: {
          type: voteType
        }
      });

      return new Response("OK");
    };

    await prisma.commentVote.create({
      data: {
        commentId,
        userId,
        type: voteType,
      }
    });

    return new Response("OK");

  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid POST request data passed", {status: 422});
    };

    return new Response("Could not register your vote, please try again later", {status: 500});
  };
};