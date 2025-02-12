"use server";

import { auth } from "@/auth";
import client, { DB, HighScoreCollection, HighScoreEntry } from "@/db";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import Leaderboard from "./Leaderboard";

async function editFormAction(id: string, _: unknown, formData: FormData) {
  "use server";

  const submitSession = await auth(),
    email = submitSession?.user?.email;
  if (email === undefined || email === null) {
    return { message: "Unauthorized" };
  }

  const score = parseInt(formData.get("score")?.toString() ?? "");
  const time = parseFloat(formData.get("time")?.toString() ?? "");
  const gameDate = new Date(formData.get("gameDate")?.toString() ?? "");
  const ageGroup = formData.get("ageGroup")?.toString();
  const gameDescription = formData.get("gameDescription")?.toString();
  const favoriteColor = formData.get("favoriteColor")?.toString();

  if (
    (formData.get("score") && isNaN(score)) ||
    (formData.get("time") && isNaN(time)) ||
    (formData.get("ageGroup") && typeof ageGroup !== "string") ||
    (formData.get("gameDate") && !gameDate) ||
    (formData.get("gameDescription") && typeof gameDescription !== "string") ||
    (formData.get("favoriteColor") && typeof favoriteColor !== "string")
  ) {
    return { message: "Invalid request" };
  }

  const updateResponse = await client
    .db(DB)
    .collection<HighScoreEntry>(HighScoreCollection)
    .findOneAndUpdate(
      {
        _id: ObjectId.createFromBase64(id),
        username: email,
      },
      [
        {
          $set: {
            score: formData.get("score") ? score : undefined,
            time: formData.get("time") ? time : undefined,
            ageGroup,
            gameDate,
            gameDescription,
            favoriteColor,
          },
        },
        {
          $set: {
            scorePerMinute: {
              $cond: {
                if: { $eq: ["$time", 0] },
                then: null,
                else: { $divide: ["$score", { $divide: ["$time", 60] }] },
              },
            },
          },
        },
      ],
      {
        upsert: false,
      },
    );

  if (!updateResponse) {
    return {
      message: "Not found",
    };
  }

  revalidatePath("/leaderboard");

  return {
    message: "Ok",
  };
}

async function deleteAction(id: string, _: unknown) {
  "use server";

  const session = await auth(),
    email = session?.user?.email;

  if (!email) {
    return { message: "Unauthorized" };
  }

  const removed = await client
    .db(DB)
    .collection<HighScoreEntry>(HighScoreCollection)
    .findOneAndDelete({
      _id: ObjectId.createFromBase64(id),
      username: email,
    });

  // Send if we failed to send the scores
  if (!removed) {
    return { message: "Not found" };
  }

  revalidatePath("/leaderboard");

  return {
    message: "Ok",
  };
}

export default async function Page() {
  const session = await auth();
  const username = session?.user?.email ?? "";

  const data = (
    await client
      .db(DB)
      .collection<Omit<HighScoreEntry, "id">>(HighScoreCollection)
      .find({
        $expr: {
          $eq: ["$username", username],
        },
      })
      .toArray()
  ).map(
    (dataWithId) =>
      // force conversion to POJO so we can serialize
      JSON.parse(
        JSON.stringify({
          id: dataWithId._id.toString("base64"),
          ...dataWithId,
        }),
      ) as Omit<HighScoreEntry, "gameDate"> & { gameDate: string },
  );

  return (
    <Leaderboard
      scores={data}
      editFormAction={editFormAction}
      deleteAction={deleteAction}
    ></Leaderboard>
  );
}
