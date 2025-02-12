export default function ScoreForm({
  duration,
  score,
  startDateTime,
  userId,
  gameDescription,
  ageGroup,
  favoriteColor,
  headerPrimary,
  headerDescription,
  formAction,
  secondaryButton,
}: {
  duration: number;
  score: number;
  startDateTime: Date;
  userId: string;
  gameDescription?: string;
  ageGroup?: string;
  favoriteColor?: string;
  headerPrimary: string;
  headerDescription: string;
  formAction: (formData: FormData) => void;
  secondaryButton: React.ReactNode;
}) {
  return (
    <form
      className="opacity-100 p-2.5 flex flex-col gap-[30px]"
      action={formAction}
    >
      <header className="text-center">
        <h1 className="underline underline-offset-[5px] text-[48px] text-red-500 mt-[5px] mb-[5px] ml-0 mr-0">
          {headerPrimary}
        </h1>
        <p className="text-white/75">{headerDescription}</p>
      </header>
      <div className="grid grid-cols-[fit-content(100%)_1fr] gap-x-5 gap-y-2.5 items-center">
        <label htmlFor="name">Your ID:</label>
        <input
          className="bg-gray-400 text-black p-1 rounded-md border"
          type="text"
          name="name"
          readOnly
          defaultValue={userId}
        />
        <label htmlFor="score">Score:</label>
        <input
          required
          type="number"
          name="score"
          className="bg-gray-300 text-black p-1 rounded-md border invalid:border-red-500"
          defaultValue={score}
        />
        <label htmlFor="time">Time (sec):</label>
        <input
          required
          type="number"
          name="time"
          step="0.001"
          className="bg-gray-300 text-black p-1 rounded-md border invalid:border-red-500"
          defaultValue={duration}
        />
        <label htmlFor="gameDescription">Description:</label>
        <textarea
          required
          name="gameDescription"
          defaultValue={gameDescription}
          className="bg-gray-300 text-black p-1 rounded-md border invalid:border-red-500"
        ></textarea>
        <label htmlFor="ageGroup">Age:</label>
        <select
          name="ageGroup"
          defaultValue={ageGroup}
          className="bg-gray-300 text-black p-1 rounded-md border invalid:border-red-500"
        >
          <option value="under18">&lt;18</option>
          <option value="18to21">18-21</option>
          <option value="21to25">21-25</option>
          <option value="25to30">25-30</option>
          <option value="over30">&gt;30</option>
        </select>
        <label htmlFor="gameDate">Date:</label>
        <input
          type="datetime-local"
          name="gameDate"
          defaultValue={new Date(
            startDateTime.getTime() - startDateTime.getTimezoneOffset() * 60000,
          )
            .toISOString()
            .slice(0, 16)}
          className="bg-gray-300 text-black p-1 rounded-md border invalid:border-red-500"
        />
        <label htmlFor="favoriteColor">Favorite Color:</label>
        <input
          type="color"
          name="favoriteColor"
          defaultValue={favoriteColor}
          className="bg-gray-300 text-black p-1 rounded-md border invalid:border-red-500"
        />
      </div>
      <div className="flex flex-row gap-2.5 content-center self-center">
        <button
          type="submit"
          className="bg-green-800 rounded-sm hover:bg-green-700 cursor-pointer py-1 px-2 outline-[0.5]"
        >
          Submit
        </button>
        {secondaryButton}
      </div>
    </form>
  );
}
