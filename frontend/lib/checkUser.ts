import { currentUser } from "@clerk/nextjs/server";
import db from "./prisma";
import { Prisma } from "@prisma/client";

export const checkUser = async () => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  try {
    // clerkUserIdで検索
    let loggedInUser = await db?.user.findUnique({
      where: {
        clerkUserId: user.id,
      },
    });

    // 見つからなければemailで検索
    if (!loggedInUser) {
      loggedInUser = await db?.user.findUnique({
        where: {
          email: user.emailAddresses[0]?.emailAddress || "",
        },
      });
    }

    if (loggedInUser) {
      return loggedInUser;
    }

    // 新規作成
    const newUser = await db?.user.create({
      data: {
        clerkUserId: user.id,
        name: user.username || "",
        imageUrl: user.imageUrl,
        email: user.emailAddresses[0]?.emailAddress || "",
      },
    });

    return newUser;
  } catch (error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      // 一意制約違反時は既存ユーザーを返す
      const existingUser = await db?.user.findUnique({
        where: {
          email: user.emailAddresses[0]?.emailAddress || "",
        },
      });
      if (existingUser) return existingUser;
    }
    console.error("checkUser error:", error);
    throw error;
  }
};
