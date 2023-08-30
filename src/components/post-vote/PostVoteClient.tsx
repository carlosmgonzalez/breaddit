"use client"

import { useCustomToast } from "@/hooks/use-custom-toast";
import { usePrevious } from "@mantine/hooks";
import { VoteType } from "@prisma/client";
import { useState } from "react";

interface Props {
  postId: string;
  initialVotesAmt: number;
  initialVote?: VoteType | null;
};


export const PostVoteClient = ({postId, initialVotesAmt, initialVote}: Props) => {

  const {loginToast} = useCustomToast();
  const [votesAmt, setVotesAmt] = useState<number>(initialVotesAmt);
  const [currentVote, setCurrentVote] = useState(initialVote);
  const prevVote = usePrevious(currentVote);
  
  return (
    <div>PostVoteClient</div>
  );
};
