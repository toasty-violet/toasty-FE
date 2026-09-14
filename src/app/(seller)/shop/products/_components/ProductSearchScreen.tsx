"use client";

import { Fragment, useState } from "react";

import SearchIcon from "@/assets/Search.svg";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { SellerProduct, SellerProductFilter } from "@/types/product";

import { useLoadMoreOnReach } from "@/hooks/use-load-more-on-reach";

import { useSellerProducts } from "../_lib/use-seller-products";
import { ProductActions } from "./ProductActions";
import { ProductFilterChips } from "./ProductFilterChips";
import { SellerProductRow } from "./SellerProductRow";

const DEBOUNCE_MS = 300;

export function ProductSearchScreen() {
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<SellerProductFilter>("ALL");
  const [picked, setPicked] = useState<SellerProduct | null>(null);

  // 글자마다 부르지 않는다. 건수도 검색 결과 안에서 세어 온다.
  const debounced = useDebouncedValue(keyword, DEBOUNCE_MS).trim();
  const searching = debounced !== "";

  const {
    items,
    counts,
    isPending,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useSellerProducts({ status, keyword: debounced, enabled: searching });

  // 받는 중에는 관찰을 끊는다. 그대로 두면 같은 묶음을 다시 부르며 앞 요청을 취소한다.
  const loadMore = useLoadMoreOnReach(fetchNextPage, {
    enabled: searching && hasNextPage === true && !isFetchingNextPage,
  });

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex w-full flex-col gap-20 px-20 pt-20">
        <label className="bg-bg-neutral-weak rounded-10 flex h-[4.4rem] w-full items-center gap-8 px-16">
          <SearchIcon className="text-fg-neutral-icon size-24 shrink-0 [&_path]:fill-current" />
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="상품명을 검색해 주세요."
            aria-label="상품 검색"
            autoFocus
            className="text-b3-regular text-fg-neutral-solid placeholder:text-fg-neutral-placeholder min-w-0 flex-1 bg-transparent outline-none"
          />
        </label>

        <ProductFilterChips
          status={status}
          counts={searching ? counts : null}
          onChange={setStatus}
        />
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-20 py-20">
        {!searching && (
          <p className="text-b4-regular text-fg-neutral-secondary py-20 text-center">
            찾을 상품 이름을 적어 주세요.
          </p>
        )}

        {searching && isPending && (
          <p className="text-b4-regular text-fg-neutral-secondary py-20 text-center">
            찾는 중이에요.
          </p>
        )}

        {searching && !isPending && items.length === 0 && (
          <p className="text-b4-regular text-fg-neutral-secondary py-20 text-center">
            검색 결과가 없어요.
          </p>
        )}

        {searching &&
          items.map((product, index) => (
            <Fragment key={product.productId}>
              {index > 0 && (
                <div
                  aria-hidden
                  className="bg-stroke-neutral-weak my-12 h-px w-full shrink-0"
                />
              )}
              <SellerProductRow
                product={product}
                onMore={() => setPicked(product)}
              />
            </Fragment>
          ))}

        <div ref={loadMore} aria-hidden className="h-px w-full shrink-0" />
      </div>

      <ProductActions product={picked} onClose={() => setPicked(null)} />
    </div>
  );
}
