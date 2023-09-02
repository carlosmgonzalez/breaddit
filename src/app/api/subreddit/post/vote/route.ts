import { getAuthSession } from "@/lib/auth";
import {prisma} from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { PostVoteValidator } from "@/lib/validators/vote";
import { CachedPost } from "@/types/redis";
import { z } from "zod";

const CACHE_AFTER_UPVOTES = 1;

export async function PATCH (req: Request) {
  try {

    const session = await getAuthSession();

    if (!session?.user) return new Response("Unauthorized access", {status: 401});

    const userId = session.user.id;

    const body = await req.json();

    const {postId, voteType} = PostVoteValidator.parse(body);

    const existingVote = await prisma.vote.findFirst({
      where: {
        postId,
        userId,
      }
    });

    const post = await prisma.post.findUnique({
      where: {
        id: postId
      },
      include: {
        author: true,
        votes: true
      }
    });

    if (!post) return new Response("Post not found", {status: 404});

    if (existingVote) {

      if (existingVote.type === voteType) {
        await prisma.vote.delete({
          where: {
            userId_postId: {
              postId,
              userId
            }
          }
        });

        const votesAmt = post.votes.reduce((acc, vote) => {
          if (vote.type === "UP" ) return acc + 1;
          if (vote.type === "DOWN") return acc - 1;
          return acc;
        }, 0);
  
        if (votesAmt >= CACHE_AFTER_UPVOTES) {
          const cachePayload: CachedPost = {
            authorUsername: post.author.username ?? "",
            contect: JSON.stringify(post.content),
            id: post.id,
            title: post.title,
            currentVote: voteType,
            createdAt: post.createdAt
          };
  
          await redis.hset(`post:${postId}`, cachePayload);
        };

        return new Response("OK");
      };

      await prisma.vote.update({
        where: {
          userId_postId: {
            postId,
            userId
          }
        },
        data: {
          type: voteType
        }
      });

      const votesAmt = post.votes.reduce((acc, vote) => {
        if (vote.type === "UP" ) return acc + 1;
        if (vote.type === "DOWN") return acc - 1;
        return acc;
      }, 0);

      if (votesAmt >= CACHE_AFTER_UPVOTES) {
        const cachePayload: CachedPost = {
          authorUsername: post.author.username ?? "",
          contect: JSON.stringify(post.content),
          id: post.id,
          title: post.title,
          currentVote: voteType,
          createdAt: post.createdAt
        };

        await redis.hset(`post:${postId}`, cachePayload);
      };

      return new Response("OK");
    };

    await prisma.vote.create({
      data: {
        postId,
        userId,
        type: voteType,
      }
    });

    const votesAmt = post.votes.reduce((acc, vote) => {
      if (vote.type === "UP" ) return acc + 1;
      if (vote.type === "DOWN") return acc - 1;
      return acc;
    }, 0);

    if (votesAmt >= CACHE_AFTER_UPVOTES) {
      const cachePayload: CachedPost = {
        authorUsername: post.author.username ?? "",
        contect: JSON.stringify(post.content),
        id: post.id,
        title: post.title,
        currentVote: voteType,
        createdAt: post.createdAt
      };

      await redis.hset(`post:${postId}`, cachePayload);
    };

    return new Response("OK");

  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid POST request data passed", {status: 422});
    };

    return new Response("Could not register your vote, please try again later", {status: 500});
  };
};