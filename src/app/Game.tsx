"use client";
import ScoreForm from "@/components/ScoreForm";
import { RefObject, useEffect, useRef, useState } from "react";

const FieldXBlocks = 10;
const FieldYBlocks = 10;
const TickDurationMS = 150;
const BlocksPerTick = 1;
const AppleChancePerTick = 0.5;
const AppleChanceDegradationMultiplierPerApple = 0.1;
const ScoreTickDurationMultiplier = 0.99;

type Direction = "north" | "east" | "west" | "south";

type OpenScoreSubmissionHandler = (
  score: number,
  time: number,
  startDateTime: Date,
) => void;

interface Block {
  x: number;
  y: number;
}

interface GameState {
  snake: Block[];
  direction: Direction;
  startTime: Date;
  gameOver: boolean;
  gameStarted: boolean;
  apples: Block[];
  lastDirection: Direction;
  score: number;
}

function paint(gameState: GameState, context: CanvasRenderingContext2D) {
  context.clearRect(0, 0, FieldXBlocks, FieldYBlocks); // Reset canvas

  context.fillStyle = "white";
  context.fillRect(0, 0, FieldXBlocks, FieldYBlocks);

  context.fillStyle = "green";
  for (const block of gameState.snake) {
    context.fillRect(block.x, block.y, 1, 1);
  }

  context.fillStyle = "red";
  for (const apple of gameState.apples) {
    context.beginPath();
    context.ellipse(
      apple.x + 0.5,
      apple.y + 0.5,
      0.5,
      0.5,
      Math.PI / 4,
      0,
      2 * Math.PI,
    );
    context.closePath();
    context.fill();
  }
}

function determineGameOver(gameState: GameState) {
  gameState.gameOver = !(
    gameState.snake[0].x >= 0 &&
    gameState.snake[0].x < FieldXBlocks &&
    gameState.snake[0].y >= 0 &&
    gameState.snake[0].y < FieldYBlocks &&
    gameState.snake.every(
      (block, index, blocks) =>
        index == 0 || block.x != blocks[0].x || block.y != blocks[0].y,
    )
  );
}

function move(gameState: GameState) {
  const tail = gameState.snake[gameState.snake.length - 1];
  const head = gameState.snake[0] ?? tail;
  let x = head.x;
  let y = head.y;

  switch (gameState.direction) {
    case "north":
      y -= BlocksPerTick;
      break;
    case "south":
      y += BlocksPerTick;
      break;
    case "east":
      x += BlocksPerTick;
      break;
    case "west":
      x -= BlocksPerTick;
      break;
  }

  gameState.snake.unshift({
    x,
    y,
  });

  const collisionAppleIndex = gameState.apples.findIndex(
    (apple) => apple.x == x && apple.y == y,
  );

  if (collisionAppleIndex != -1) {
    gameState.apples.splice(collisionAppleIndex, 1);
    gameState.score += 1;
  } else {
    gameState.snake.pop();
  }
}

function generateAppleIfChance(gameState: GameState) {
  if (
    Math.random() >
    AppleChancePerTick *
      Math.pow(
        AppleChanceDegradationMultiplierPerApple,
        gameState.apples.length,
      )
  ) {
    return;
  }

  const tiles = new Array(FieldXBlocks * FieldYBlocks)
    .fill({ x: 0, y: 0 })
    .map((_, index) => ({
      x: Math.floor(index / FieldXBlocks),
      y: index % FieldYBlocks,
    }))
    .filter((tile) =>
      gameState.snake
        .concat(gameState.apples)
        .every(
          (placedTile) => placedTile.x != tile.x || placedTile.y != tile.y,
        ),
    );

  gameState.apples.push(tiles[Math.floor(Math.random() * tiles.length)]);
}

function doTick(
  gameState: GameState,
  context: CanvasRenderingContext2D,
  openScoreSubmissionHandler: OpenScoreSubmissionHandler,
) {
  paint(gameState, context);
  move(gameState);
  determineGameOver(gameState);
  if (!gameState.gameOver) {
    generateAppleIfChance(gameState);
    paint(gameState, context);
    gameState.lastDirection = gameState.direction;
    setTimeout(
      () => doTick(gameState, context, openScoreSubmissionHandler),
      TickDurationMS * Math.pow(ScoreTickDurationMultiplier, gameState.score),
    );
  } else {
    openScoreSubmissionHandler(
      gameState.score,
      (new Date().getTime() - gameState.startTime.getTime()) / 1000,
      gameState.startTime,
    );
  }
}

function Canvas({
  openScoreSubmissionHandler,
  gameState,
}: {
  openScoreSubmissionHandler: OpenScoreSubmissionHandler;
  gameState: RefObject<GameState>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current,
      context = canvas?.getContext("2d");
    if (!canvas || !context) {
      return;
    }

    context.resetTransform();
    context.scale(canvas.width / FieldXBlocks, canvas.height / FieldYBlocks);

    paint(gameState.current, context);

    const keydownListener = (keyboardEvent: KeyboardEvent) => {
      {
        switch (keyboardEvent.key) {
          case "w":
          case "ArrowUp":
            if (
              gameState.current.lastDirection == "south" &&
              gameState.current.snake.length > 1
            ) {
              return;
            }
            gameState.current.direction = "north";
            break;
          case "a":
          case "ArrowLeft":
            if (
              gameState.current.lastDirection == "east" &&
              gameState.current.snake.length > 1
            ) {
              return;
            }
            gameState.current.direction = "west";
            break;
          case "d":
          case "ArrowRight":
            if (
              gameState.current.lastDirection == "west" &&
              gameState.current.snake.length > 1
            ) {
              return;
            }
            gameState.current.direction = "east";
            break;
          case "s":
          case "ArrowDown":
            if (
              gameState.current.lastDirection == "north" &&
              gameState.current.snake.length > 1
            ) {
              return;
            }
            gameState.current.direction = "south";
            break;
          default:
            return;
        }

        if (gameState.current.gameStarted) {
          return; // don't double start the game
        }

        gameState.current.gameStarted = true;
        doTick(gameState.current, context, openScoreSubmissionHandler);
      }
    };

    document.addEventListener("keydown", keydownListener);

    return () => {
      document.removeEventListener("keydown", keydownListener);
    };
  }, [gameState, canvasRef, openScoreSubmissionHandler]);

  return <canvas ref={canvasRef} width="500" height="500"></canvas>;
}

export default function Game({
  userId,
  scoreSubmitAction,
}: {
  userId: string;
  scoreSubmitAction: (formData: FormData) => void;
}) {
  const [scoreSubmissionVisible, setScoreSubmissionVisible] = useState(false);
  const [score, setScore] = useState(0);
  const [duration, setDuration] = useState(0);
  const [date, setDate] = useState(new Date());
  const gameState = useRef<GameState>({
    snake: [
      {
        x: FieldXBlocks / 2,
        y: FieldYBlocks / 2,
      },
    ],
    direction: "north",
    startTime: new Date(),
    gameOver: false,
    apples: [],
    lastDirection: "north",
    score: 0,
    gameStarted: false,
  });

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <p className="text-white/75 italic text-sm">
        Use WASD or arrow-keys to begin and move
      </p>

      <div className="relative">
        <Canvas
          gameState={gameState}
          openScoreSubmissionHandler={(
            newScore,
            newDuration,
            newStartDateTime,
          ) => {
            setScore(newScore);
            setDuration(newDuration);
            setDate(newStartDateTime);
            setScoreSubmissionVisible(true);
          }}
        />
        {scoreSubmissionVisible && (
          <div
            className="absolute bg-black/75 top-0 bottom-0 left-0 right-0 p-[5px] flex flex-col justify-center animate-fade-in"
            id="scoreSubmitDiv"
          >
            <ScoreForm
              formAction={scoreSubmitAction}
              userId={userId}
              score={score}
              duration={duration}
              startDateTime={date}
              headerPrimary="Game Over"
              headerDescription="Want to submit your high score?"
              secondaryButton={
                <button
                  type="button"
                  onClick={() => {
                    gameState.current = {
                      snake: [
                        {
                          x: FieldXBlocks / 2,
                          y: FieldYBlocks / 2,
                        },
                      ],
                      direction: "north",
                      startTime: new Date(),
                      gameOver: false,
                      apples: [],
                      lastDirection: "north",
                      score: 0,
                      gameStarted: false,
                    };
                    setScoreSubmissionVisible(false);
                  }}
                  className="playGame bg-black rounded-sm hover:bg-gray-900 cursor-pointer py-1 px-2 outline-[0.5]"
                >
                  Play Again
                </button>
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
