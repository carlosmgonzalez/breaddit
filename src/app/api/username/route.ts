import { getAuthSession } from "@/lib/auth";
import { UsernameValidator } from "@/lib/validators/username";
import {prisma} from "@/lib/prisma";
import { z } from "zod";

export async function PATCH (req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) return new Response("Unauthorized", {status: 401});

    const body = await req.json();
    const {name} = UsernameValidator.parse(body);

    const username = await prisma.user.findFirst({
      where: {
        username: name
      }
    });

    if (username) return new Response("Username is taken", {status: 409});

    await prisma.user.update({
      where: {
        id: session.user.id
      },
      data: {
        username: name
      }
    });

    return new Response("OK");

  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid request data pased", {status: 402});
    };

    return new Response ("Could not update yout username, please try again later ", {status: 500});
  };
};