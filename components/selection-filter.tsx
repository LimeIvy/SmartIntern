"use client";

import { useAtom } from 'jotai';
import { Button } from '@/components/ui/button';
import { selectionFilterAtom } from '@/store/filter-atom';
import { SelectionType } from '@prisma/client';

export function SelectionFilter() {
  const [filter, setFilter] = useAtom(selectionFilterAtom);

  return (
    <div className="flex flex-col gap-1 px-2 py-4">
      <h3 className="mb-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        選考タイプ
      </h3>
      <Button
        onClick={() => setFilter('ALL')}
        variant={filter === 'ALL' ? 'secondary' : 'ghost'}
        className="w-full justify-start"
      >
        すべて
      </Button>
      <Button
        onClick={() => setFilter(SelectionType.INTERNSHIP)}
        variant={filter === SelectionType.INTERNSHIP ? 'secondary' : 'ghost'}
        className="w-full justify-start"
      >
        インターン
      </Button>
      <Button
        onClick={() => setFilter(SelectionType.FULLTIME)}
        variant={filter === SelectionType.FULLTIME ? 'secondary' : 'ghost'}
        className="w-full justify-start"
      >
        本選考
      </Button>
    </div>
  );
} 