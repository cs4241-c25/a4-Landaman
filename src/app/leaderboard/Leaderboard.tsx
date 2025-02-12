"use client";

import ScoreForm from "@/components/ScoreForm";
import { HighScoreEntry } from "@/db";
import {
  startTransition,
  useActionState,
  useEffect,
  useMemo,
  useState,
} from "react";

export default function Leaderboard({
  scores,
  editFormAction,
  deleteAction,
}: {
  scores: (Omit<HighScoreEntry, "gameDate"> & { gameDate: string })[];
  editFormAction: (id: string, oldData: unknown, formData: FormData) => void;
  deleteAction: (idToDelete: string, oldData: unknown) => void;
}) {
  const [editedEntry, setEditedEntry] = useState<HighScoreEntry | null>(null);
  const deleteWithIdAction = useMemo(
    () => deleteAction.bind(null, editedEntry?.id ?? ""),
    [editedEntry, deleteAction],
  );
  const [deleteResult, deleteDispatch, deletePending] = useActionState(
    deleteWithIdAction,
    undefined,
  );
  const editWithIdAction = useMemo(
    () => editFormAction.bind(null, editedEntry?.id ?? ""),
    [editedEntry, editFormAction],
  );
  const [editResult, editDispatch, editPending] = useActionState(
    editWithIdAction,
    undefined,
  );

  useEffect(() => {
    if (
      (editResult !== undefined && !editPending) ||
      (deleteResult !== undefined && !deletePending)
    ) {
      setEditedEntry(null);
    }
  }, [deletePending, deleteResult, editPending, editResult]);

  return (
    <div className="h-full items-center justify-center flex flex-col">
      <div className="relative">
        <table className="border-separate border-spacing-x-[15px] border-spacing-y-0">
          <thead>
            <tr className="[&>th]:border-b-2 [&>th]:border-b-red-500 [&>th]:border-solid [&>th]:text-left">
              <th>ID</th>
              <th>Score</th>
              <th>Time (sec)</th>
              <th>Score per minute</th>
            </tr>
            <tr className="[&>th]:border-b-0 [&>th]:h-2">
              <th></th>
              <th></th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {scores.map((score) => {
              const parsedScore = {
                ...score,
                gameDate: new Date(score.gameDate),
              };

              return (
                <tr
                  className="text-[14px] text-white/75 hover:text-white/100"
                  key={score.id}
                >
                  <td>{score.id}</td>
                  <td>{score.score.toLocaleString()}</td>
                  <td>
                    {score.time.toLocaleString(undefined, {
                      maximumFractionDigits: 3,
                    })}
                  </td>
                  <td>
                    {score.scorePerMinute?.toLocaleString(undefined, {
                      maximumFractionDigits: 3,
                    })}
                  </td>
                  <td>
                    <button
                      className="cursor-pointer underline underline-offset-1"
                      onClick={() => setEditedEntry(parsedScore)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {editedEntry && (
          <div
            className="absolute bg-black/75 top-0 left-0 right-0 bottom-0 p-[5px] flex flex-col justify-center transition-all duration-1000"
            id="scoreEditDiv"
          >
            <ScoreForm
              userId={editedEntry.username}
              duration={editedEntry.time}
              score={editedEntry.score}
              startDateTime={editedEntry.gameDate}
              headerPrimary="Edit Score"
              ageGroup={editedEntry.ageGroup}
              favoriteColor={editedEntry.favoriteColor}
              gameDescription={editedEntry.gameDescription}
              headerDescription="No cheating"
              formAction={editDispatch}
              secondaryButton={
                <button
                  type="button"
                  className="bg-red-500 rounded-sm hover:bg-red-400 cursor-pointer py-1 px-2 outline-[0.5]"
                  onClick={() => startTransition(deleteDispatch)}
                >
                  Delete
                </button>
              }
            ></ScoreForm>
          </div>
        )}
      </div>
    </div>
  );
}
