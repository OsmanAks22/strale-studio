import { SearchIcon } from "../icons";

/** Full-width GET form used on the /search page. */
export function SearchForm({ query }: { query: string }) {
  return (
    <form action="/search" method="get" role="search" className="relative">
      <label htmlFor="Search-In-Template" className="sr-only">
        Search
      </label>
      <input
        id="Search-In-Template"
        type="search"
        name="q"
        defaultValue={query}
        className="h-10 w-full rounded-none border border-[#333] bg-white pr-11 pl-1.5 text-[12px] leading-[18px] tracking-[1px] outline-none focus-visible:border-black [&::-webkit-search-cancel-button]:hidden"
      />
      <button
        type="submit"
        aria-label="Search"
        className="absolute top-1.5 right-1.5 flex size-7 cursor-pointer items-center justify-center"
      >
        <SearchIcon className="size-4" />
      </button>
    </form>
  );
}
