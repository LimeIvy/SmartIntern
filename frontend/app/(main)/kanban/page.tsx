"use client";

import { useState } from "react";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import {
  DndContext,
  DragEndEvent,
  UniqueIdentifier,
  DragStartEvent,
  DragOverEvent,
  Active,
  Over,
  CollisionDetection,
  closestCorners,
  DragOverlay,
} from "@dnd-kit/core";

import { Sortable } from "@/components/dnd-kit/sortable";
import { SortableItem } from "@/components/dnd-kit/sortableItem";
import Droppable from "@/components/dnd-kit/droppable";
import type { ProjectDetail } from "@/types/project";

import { sampleProjectData } from "@/data/sampleProject";

// getData関数
export function getData(event: { active: Active; over: Over | null }) {
  const { active, over } = event;
  // キャンセルされた、もしくはターゲットがない場合はリターン
  if (!active || !over) return;
  // ドラッグアイテムとターゲットが同じ場合はリターン
  if (active.id === over.id) return;

  // activeのデータを取得
  const fromData = active.data.current?.sortable;
  if (!fromData) return;

  // overのデータを取得
  const toData = over.data.current?.sortable;
  const toDataNotSortable = {
    containerId: over.id,
    index: NaN, // 空のリストへの移動の場合、indexはNaN
    items: NaN, // 空のリストへの移動の場合、itemsはNaN
  };

  // データを返す
  return {
    from: fromData,
    to: toData ?? toDataNotSortable,
  };
}

export default function Kanban() {
  const [projectData, setProjectData] = useState<ProjectDetail>(sampleProjectData); // プロジェクトデータを管理するstate
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null); // ドラッグ中のアイテムIDを管理するstate

  // 衝突検出アルゴリズム
  const customClosestCorners: CollisionDetection = (args) => {
    const cornerCollisions = closestCorners(args);

    // 一番近いリストのコンテナを取得
    const listIds = new Set(projectData.lists.map((list) => list.id));
    const closestContainer = cornerCollisions.find((c) => {
      return listIds.has(c.id.toString());
    });
    if (!closestContainer) return cornerCollisions;

    // closestContainerの中のチケットのみを取得
    const collisions = cornerCollisions.filter(({ data }) => {
      if (!data) return false;
      const droppableData = data.droppableContainer?.data?.current;
      if (!droppableData) return false;
      const { containerId } = droppableData.sortable;
      return closestContainer.id === containerId;
    });

    // 中身のチケットがない場合は、closestContainerを返す
    if (collisions.length === 0) {
      return [closestContainer];
    }
    // 中身のチケットがある場合は、collisionsを返す
    return collisions;
  };

  // ドラッグ開始時の処理 (DragOverlay用)
  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    if (!active) return;
    setActiveId(active.id); // ドラッグ中のアイテムIDをactiveIdにセット
  }

  // ドラッグ中に別のコンテナへ移動する際の処理
  function handleDragOver(event: DragOverEvent) {
    const data = getData(event); // イベントデータからfrom, toを取得
    if (!data) return;
    const { from, to } = data;

    if (from.containerId === to.containerId) return; // コンテナ内移動の場合はリターン

    const fromList = projectData.lists.find((list) => list.id == from.containerId); // 移動元リストを取得
    const toList = projectData.lists.find((list) => list.id == to.containerId); // 移動先リストを取得
    if (!fromList || !toList) return;

    // 移動するチケットを取得
    const moveTicket = fromList.tickets.find((ticket) => ticket.id === from.items[from.index]);
    if (!moveTicket) return;

    // 移動元リストからチケットを削除
    const newFromTickets = fromList.tickets.filter((ticket) => ticket.id !== moveTicket.id);
    // 移動先リストの適切な位置にチケットを挿入
    const newToTickets = [
      ...toList.tickets.slice(0, to.index),
      moveTicket,
      ...toList.tickets.slice(to.index),
    ];

    // 新しいリストデータを作成し、stateを更新
    const newLists = projectData.lists.map((list) => {
      if (list.id === from.containerId) return { ...list, tickets: newFromTickets };
      if (list.id === to.containerId) return { ...list, tickets: newToTickets };
      return list;
    });
    setProjectData({ ...projectData, lists: newLists }); // 全体のデータを更新
  }

  // ドラッグ終了時の処理（コンテナ内移動）
  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null); // DragOverlayを非表示にするためactiveIdを空にする

    const data = getData(event); // イベントデータからfrom, toを取得
    if (!data) return;
    const { from, to } = data;

    if (from.containerId !== to.containerId) return; // 別コンテナへの移動の場合はリターン (onDragOverで処理済み)

    const list = projectData.lists.find((list) => list.id == from.containerId); // リストデータを取得
    if (!list) return;

    // arrayMoveを使って並び替え後のチケット一覧データを取得
    const newTickets = arrayMove(list.tickets, from.index, to.index);

    // 並べ替え後のリスト一覧データを作成
    const newLists = projectData.lists.map((list) => {
      if (list.id === from.containerId) return { ...list, tickets: newTickets };
      return list;
    });
    setProjectData({ ...projectData, lists: newLists }); // 全体のデータを更新
  }

  return (
    // DndContextで全体を囲む
    <DndContext
      onDragEnd={handleDragEnd} // ドラッグ終了時の処理
      onDragStart={handleDragStart} // ドラッグ開始時の処理
      onDragOver={handleDragOver} // ドラッグ中のオーバーラップ処理
      collisionDetection={customClosestCorners} // 衝突検出アルゴリズムを設定
      id={projectData.id}
    >
      <div className="h-screen overflow-hidden">
        <div className="mt-20 flex h-full min-w-fit items-start gap-6 overflow-x-auto overflow-y-auto px-8 py-8">
          {projectData.lists.map((list) => (
            <SortableContext
              items={list.tickets}
              key={list.id}
              id={list.id}
              strategy={verticalListSortingStrategy}
            >
              <Droppable key={list.id} id={list.id}>
                <div className="flex w-72 min-w-72 flex-shrink-0 flex-col rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  {/* ヘッダー */}
                  <div className="mb-4 flex items-center">
                    <div className="flex w-full items-center justify-between">
                      <span className="ml-4 py-3 text-xl font-semibold text-gray-700">
                        {list.title}
                      </span>
                      <span className="text-md mr-4 rounded bg-gray-100 px-2 py-0.5 text-gray-600">
                        {list.tickets.length}
                      </span>
                    </div>
                  </div>
                  {/* カードリスト */}
                  <div className="flex max-h-1/2 flex-1 flex-col gap-3 overflow-y-auto">
                    {list.tickets.map((ticket) => (
                      <Sortable key={ticket.id} id={ticket.id}>
                        <div className="flex flex-col gap-2 rounded-md border border-gray-200 bg-white p-3 shadow">
                          <div className="text-sm font-medium text-gray-800">
                            {ticket.title ?? `kanban card title - ${ticket.id}`}
                          </div>
                        </div>
                      </Sortable>
                    ))}
                  </div>
                  {/* + Create ボタン */}
                  <button className="mt-4 flex items-center gap-1 rounded px-2 py-1 text-sm font-medium text-gray-500 transition hover:text-blue-600">
                    <span className="text-lg">＋</span> Create
                  </button>
                </div>
              </Droppable>
            </SortableContext>
          ))}
          {activeId && (
            <DragOverlay>
              <SortableItem itemId={activeId} />
            </DragOverlay>
          )}
        </div>
      </div>
    </DndContext>
  );
}
