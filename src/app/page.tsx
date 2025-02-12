"use server";

import { auth } from "@/auth";
import client, { DB, HighScoreCollection, HighScoreEntry } from "@/db";
import { redirect } from "next/navigation";
import Game from "./Game";

async function submitDataAction(formData: FormData) {
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
    isNaN(score) ||
    isNaN(time) ||
    typeof ageGroup !== "string" ||
    !gameDate ||
    typeof gameDescription !== "string" ||
    typeof favoriteColor !== "string"
  ) {
    return { message: "Invalid request" };
  }

  await client
    .db(DB)
    .collection(HighScoreCollection)
    .insertOne({
      ageGroup,
      favoriteColor,
      gameDate,
      gameDescription,
      score,
      time,
      username: email,
      scorePerMinute: score / (time / 60),
    } satisfies Omit<HighScoreEntry, "id">);

  return redirect("/leaderboard");
}

export default async function Page() {
  const session = await auth();
  return (
    <Game
      userId={session?.user?.email ?? ""}
      scoreSubmitAction={submitDataAction}
    />
  );
}
