"use client"

import { User } from "next-auth";
import { DropdownMenuTrigger, DropdownMenu, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuItem } from "./ui/dropdown-menu";
import { UserAvatar } from "./UserAvatar";
import Link from "next/link";
import { signOut } from "next-auth/react";

interface Props {
  user: User
};

export const UserAccountNav = ({user}: Props) => {

  const handlerSignOut = (event: Event) => {
    event.preventDefault();
    signOut({
      callbackUrl: `${window.location.origin}/sing-in`
    })
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <UserAvatar 
          user={{
            name: user.name || null,
            image: user.image || null
          }}
          className="h-8 w-8" 
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent className="bg-white" align="end">

        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col gap-y-1 leading-none">
            {user.name && <p className="font-medium">{user.name}</p>}
            {user.email && <p className="text-sm text-zinc-700">{user.email}</p>}
          </div>
        </div>

        <DropdownMenuSeparator/>

        <DropdownMenuItem asChild>
          <Link href="/">Feed</Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/r/create">Create community</Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/settings">Settings</Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator/>

        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={handlerSignOut}
        >
          Sign out
        </DropdownMenuItem>

      </DropdownMenuContent>
    </DropdownMenu>
  )
};
