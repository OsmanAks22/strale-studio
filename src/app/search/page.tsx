import type { Metadata } from "next";
import { getProducts } from "@/components/sites/reigningchamp/catalog";
import {
  applyFilters,
  toListingItem,
  readSort,
  SEARCH_SORTS,
  searchProducts,
  sortProducts,
  toQueryPairs,
  type SearchParamsRecord,
} from "@/components/sites/reigningchamp/collection/facets";
import { Listing } from "@/components/sites/reigningchamp/collection/listing";
import { SearchForm } from "@/components/sites/reigningchamp/collection/search-form";

type Props = { searchParams: Promise<SearchParamsRecord> };

const readQuery = (query: SearchParamsRecord) => {
  const raw = query.q;
  return (Array.isArray(raw) ? raw[0] : raw)?.trim() ?? "";
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = readQuery(await searchParams);
  if (!q) return { title: "Search" };
  const count = searchProducts(Object.values(getProducts()), q).length;
  return { title: `Search: ${count} ${count === 1 ? "result" : "results"} found for "${q}"` };
}

export default async function SearchPage({ searchParams }: Props) {
  const query = await searchParams;
  const q = readQuery(query);
  const matches = q ? searchProducts(Object.values(getProducts()), q) : [];

  return (
    <div className="pb-12">
      <div className="px-3 pt-3 pb-6 tab:px-8">
        <h1 className="mb-2 font-rc-cond text-[24px] leading-[30px] tracking-[1.5px] uppercase tab:text-[32px] tab:leading-10">
          {q ? "Search results" : "Search"}
        </h1>
        <SearchForm query={q} />
      </div>
      {!q ? null : matches.length === 0 ? (
        <p className="px-3 pt-3 tab:px-8">
          No results found for &ldquo;{q}&rdquo;. Check the spelling or use a different word or phrase.
        </p>
      ) : (
        <SearchListing matches={matches} query={query} />
      )}
    </div>
  );
}

function SearchListing({
  matches,
  query,
}: {
  matches: ReturnType<typeof searchProducts>;
  query: SearchParamsRecord;
}) {
  const { products, groups } = applyFilters(matches, query);
  const sort = readSort(query, SEARCH_SORTS);
  return (
    <Listing
      basePath="/search"
      query={toQueryPairs(query)}
      groups={groups}
      quickFacets={[]}
      sortOptions={SEARCH_SORTS}
      sort={sort.value}
      keepOnClear={["q"]}
      items={sortProducts(products, sort.value).map(toListingItem)}
    />
  );
}
