import { atom } from 'jotai';
import { SelectionType } from '@prisma/client';

export type SelectionFilter = 'ALL' | SelectionType;
 
export const selectionFilterAtom = atom<SelectionFilter>('ALL'); 