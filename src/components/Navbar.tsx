"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar({
  username,
  loginServerComponent,
}: {
  username: string;
  loginServerComponent: React.ReactNode;
}) {
  const pathName = usePathname();

  return (
    <nav className="mt-1 mx-5 flex flex-row justify-between">
      <ul>
        <li className="inline">
          <Link
            className={`px-1 py-0.5 text-white text-[20px] underline underline-offset-1 cursor-pointer transition-colors hover:text-red-500 hover:bg-white decoration-2 ${pathName === "/" ? "decoration-red-500 underline-offset-[3px] bold text-2xl" : ""}`}
            href="/"
          >
            Game
          </Link>
        </li>
        <li className="inline mx-2.5">
          <Link
            className={`px-1 py-0.5 text-white text-[20px] underline underline-offset-1 cursor-pointer transition-colors hover:text-red-500 hover:bg-white decoration-2 ${pathName === "/leaderboard" ? "decoration-red-500 underline-offset-[3px] bold text-2xl" : ""}`}
            href="/leaderboard"
          >
            My Scores
          </Link>
        </li>
      </ul>
      <ul>
        <li className="inline underline underline-offset-1 decoration-red-500 mx-2.5">
          {username}
        </li>
        <li className="inline">{loginServerComponent}</li>
      </ul>
    </nav>
  );
}
