// Este componente lo creamos con la necesidad de agregar un formularios para crear un post el cual tiene que ser un
// componente cliente, porque vamos a usar unos hooks los cuales se deben renderizar del lado del cliente.
// Con esto hacemos que cada pagina de subreddit se renderice del lado del servidor

"use client"

import { Session } from "next-auth";
import { usePathname, useRouter } from "next/navigation";
import { UserAvatar } from "./UserAvatar";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ImageIcon, Link2 } from "lucide-react";

export const MiniCreatePost = ({session}: {session: Session | null}) => {

  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="overflow-hidden rounded-md bg-white shadow">
      <div className="h-full px-6 py-4 flex justify-between items-center gap-6">
        <div className="relative">
          <UserAvatar
            user={{
              name: session?.user.name || null,
              image: session?.user.image || null
            }}
          />

          <span className="absolute right-0 bottom-0 rounded-full w-3 h-3 bg-green-500 outline outline-2 outline-white"/>
        </div>

        <Input readOnly onClick={() => router.push(`${pathname}/submit`)} placeholder="Create post"/>
        
        <div className="flex items-center">
          <Button onClick={() => router.push(`${pathname}/submit`)} variant="ghost" size="sm">
            <ImageIcon className="text-zinc-600"/>
          </Button>
          <Button onClick={() => router.push(`${pathname}/submit`)} variant="ghost" size="sm">
            <Link2 className="text-zinc-600"/>
          </Button>
        </div>
      </div>
    </div>
  );
};
