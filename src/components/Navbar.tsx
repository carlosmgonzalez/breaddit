import Link from "next/link";
import { Icons } from "./Icons";
import { buttonVariants } from "./ui/button";
import { getAuthSession } from "@/lib/auth";
import { UserAccountNav } from "./UserAccountNav";
import { SearchBar } from "./SearchBar";

export const Navbar = async () => {

  const session = await getAuthSession();

  return (
    <div className="fixed top-0 inset-x-0 h-fit bg-zinc-100 border-b border-zinc-300 z-10 py-2">
      <div className="container max-w-7xl h-full mx-auto flex items-center justify-between gap-2">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1">
          <Icons.logo className="h-8 w-8 sm:h-6 sm:w-6"/>
          <p className="hidden text-zinc-700 text-sm font-medium md:block">Breaddit</p>
        </Link>

        {/* Search bar */}
        <SearchBar/>
        
        {/* Sing in - Auth */}
        {
          session?.user
            ? <UserAccountNav user={session.user}/>
            : (
                <Link 
                  href="/sign-in" 
                  className={ buttonVariants({size: "sm"}) }
                >
                  <p>Sign-In</p>
                </Link>
              )
        }
      </div>
    </div>
  );
};
