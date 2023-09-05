import { Post, Vote, VoteType } from "@prisma/client";
import { promises } from "dns";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { PostVoteClient } from "./PostVoteClient";

interface Props {
  postId: string;
  initialVotesAmt: number;
  initialVote: VoteType | null;
  getData?: () => Promise<(Post & {votes: Vote[]}) | null>
}


export const PostVoteServer = async ({postId, initialVotesAmt, initialVote, getData}: Props) => {

  const session = await getServerSession();

  let _votesAmt: number = 0;
  let _currentVote: Vote["type"] | null | undefined = undefined;

  if (getData) {
    const post = await getData();
    if (!post) return notFound();

    _votesAmt = post.votes.reduce((acc, vote) => {
      if (vote.type === "UP") return acc + 1;
      if (vote.type === "DOWN") return acc - 1;
      return acc
    }, 0);

    _currentVote = post.votes.find(vote => vote.userId === session?.user?.id)?.type;

  } else {
    _votesAmt = initialVotesAmt!;
    _currentVote = initialVote;
  };

  return (
    <PostVoteClient 
      postId={postId} 
      initialVotesAmt={_votesAmt} 
      initialVote={_currentVote} 
      className="flex sm:flex-col gap-4 sm:gap-0 sm:w-20 sm:pb-0"
    />
  );
};
