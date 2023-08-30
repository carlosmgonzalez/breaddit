import { getAuthSession } from "@/lib/auth";
import {prisma} from "@/lib/prisma";
import { notFound } from "next/navigation";
import {format} from "date-fns"
import { SubscribeLeaveToggle } from "@/components/SubscribeLeaveToggle";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  params: {
    slug: string;
  }
}

export default async function Layout({children, params}: Props) {
  
  const {slug} = params;
  const name = decodeURIComponent(slug);
  
  const session = await getAuthSession();

  const subreddit = await prisma.subreddit.findFirst({
    where: {
      name
    },
    include: {
      posts: {
        include: {
          author: true,
          votes: true
        },
      },
    },
  });


  const subscription = await prisma.subscription.findFirst({
    where: {
      subredditId: subreddit?.id,
      userId: session?.user.id
    },
  });

  const isSubscribed = !!subscription;

  if (!subreddit) return notFound();

  const memberCount = prisma.subscription.count({
    where: {
      subreddit: {
        name
      },
    },
  });

  return (
    <div className="sm:container max-w-7xl mx-auto h-full pt-12">
      <div>
        {/* Todo: Button to take us back*/}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-x-4 py-6">
          <div className="flex flex-col col-span-2 space-y-6">
            {children}
          </div>
      
          {/* info sidebar */}
          <div className="hidden md:block overflow-hidden h-fit rounded-lg border border-gray-200 order-first md:order-last">
            <div className="px-6 py-4">
              <p className="font-semibold py-3">
                About r/{name}
              </p>
            </div>
            
            <dl className="divide-y divide-gray-100 px-6 py-4 text-sm leading-6 bg-white">
              <div className="flex justify-between gap-x-4 py-3">
                <dt className="text-gray-500">
                  Created
                </dt>
                <dd className="text-gray-700">
                  <time dateTime={subreddit.createdAt.toDateString()}> 
                    {format(subreddit.createdAt, "MMMM d, yyyy")} {/* format funciona para poder leer las fechas creadas por la base de datos, MMMM significa que va a colocar el mes con las letras, si son solo MMM va hacer abrevido y si es MM con numeros, ejemplo: MMMM = agosto, MMM = ago y MM = 08*/}
                  </time>
                </dd>
              </div>

              <div className="flex justify-between gap-x-4 py-3">
                <dt className="text-gray-500">
                  Members
                </dt>
                <dd className="text-gray-700">
                  <div className="text-gray-900">
                    {memberCount}
                  </div>
                </dd>
              </div>

              {
                subreddit.creatorId === session?.user.id
                ? (
                    <div className="flex justify-between gap-x-4 py-4">
                      <p className="text-gray-500">You created this community</p>
                    </div>
                  )
                : <SubscribeLeaveToggle 
                    subredditId={subreddit.id} 
                    subredditName={subreddit.name} 
                    isSubscribed={isSubscribed}
                  />
              }

              {
                isSubscribed
                  ? (
                      <Link 
                        href={`/r/${slug}/submit`} 
                        className={cn(buttonVariants({variant: "outline"}), "w-full mt-1 mb-4")}
                      >
                        Create Post
                      </Link>
                    )
                  : null
              }

              
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};


// const subscription = !session?.user 
  //   ? undefined 
  //   : await prisma.subscription.findFirst({
  //       where: {
  //         subreddit: {
  //           name
  //         },
  //         user: {
  //           name: session.user.name
  //         },
  //       },
  //     });

  
  // const isSubscribed = !!subscription;