"use client"

import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Icons } from "./Icons";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react'

interface Props extends React.HTMLAttributes<HTMLDivElement> {};

export const UserAuthForm = ({className, ...props}: Props) => {
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const {toast} = useToast();

  const loginWithGoogle = async() => {
    
    setIsLoading(true);
    
    try {
      await signIn("google");
    } catch (error) {
      
      toast({
        title: "There was a problem",
        description: "There was an error logging in with Google",
        variant: "destructive"
      });

    } finally {
      setIsLoading(false);
    };
  };

  return (
    <div className={cn("flex justify-center", className)} {...props}>
      <Button onClick={loginWithGoogle} isLoading={isLoading} size="sm" className="w-full max-w-xs flex gap-1">
        {isLoading ? null : <Icons.google className="w-6 h-6"/>}
        Google
      </Button>
    </div>
  );
};





