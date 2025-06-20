import { atomWithQuery } from 'jotai-tanstack-query';
import { client } from '@/lib/hono';
import { InferResponseType } from 'hono';

type CompanyType = InferResponseType<(typeof client.api.company)["$get"], 200>[number];

// companiesのデータを非同期で取得・管理するAtom
export const companiesAtom = atomWithQuery<CompanyType[]>(() => ({
  queryKey: ['companies'],
  queryFn: async () => {
    const res = await client.api.company.$get();
    if (!res.ok) {
      throw new Error('企業の取得に失敗しました。');
    }
    return res.json();
  },
})); 