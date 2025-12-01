import { atom } from 'jotai';
import { atomWithQuery } from 'jotai-tanstack-query';
import { client } from '@/lib/hono';
import { InferResponseType } from 'hono';

// APIレスポンスの型定義
type CompanyResponseType = InferResponseType<(typeof client.api.company)[':id']['$get'], 200> | null;

/**
 * 現在のcompanyIdを保持するAtom
 * コンポーネント側でこのAtomにIDを設定することで、companyAtomがデータ取得を開始する
 */
export const companyIdAtom = atom<string | null>(null);

/**
 * companyIdAtomの値に基づいて単一の企業データを取得・管理するAtom
 */
export const companyAtom = atomWithQuery<CompanyResponseType>((get) => {
  const id = get(companyIdAtom);

  return {
    // queryKeyにidを含めることで、idが変わると自動的に再取得される
    queryKey: ['company', id],
    queryFn: async () => {
      // idがnullの場合はデータ取得を行わない
      if (!id) {
        return null;
      }
      const res = await client.api.company[':id'].$get({
        param: { id },
      });
      if (!res.ok) {
        throw new Error('企業の取得に失敗しました。');
      }
      return res.json();
    },
    // idが存在する場合のみデータ取得を有効にする
    enabled: !!id,
  };
}); 