import { atomWithQuery } from "jotai-tanstack-query";
import { client } from "@/lib/hono";
import { InferResponseType } from "hono";

type CompanyType = InferResponseType<(typeof client.api.company)["$get"], 200>[number];

// companiesのデータを非同期で取得・管理するAtom
export const companiesAtom = atomWithQuery<CompanyType[]>(() => {
  console.log("[companiesAtom] queryFn実行開始");
  return {
    queryKey: ["companies"],
    queryFn: async () => {
      console.log("[companiesAtom] API呼び出し開始");
      const res = await client.api.company.$get();
      console.log("[companiesAtom] API応答:", res.ok);
      if (!res.ok) {
        throw new Error("企業の取得に失敗しました。");
      }
      const data = await res.json();
      console.log("[companiesAtom] 取得した企業数:", data.length);
      console.log("[companiesAtom] 取得した企業データ:", data);
      return data;
    },
  };
});
