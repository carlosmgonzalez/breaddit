import { VoteType } from "@prisma/client";

export type CachedPost = {
  id: string;
  title: string;
  authorUsername: string;
  contect: string;
  currentVote: VoteType | null;
  createdAt: Date;
};