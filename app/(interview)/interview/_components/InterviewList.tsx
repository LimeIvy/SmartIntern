'use client'
import React, { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import InterviewItemCard from './InterviewItemCard'
import { InferResponseType } from "hono";
import { client } from "@/lib/hono";
import { Skeleton } from '@/components/ui/skeleton';

type InterviewFromApi = InferResponseType<(typeof client.api.interview)["$get"], 200>[number];

const InterviewList = () => {
  const { user } = useUser();
  const [interviewList, setInterviewList] = useState<InterviewFromApi[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) fetchInterviewList();
  }, [user]);

  const fetchInterviewList = async () => {
    setIsLoading(true);
    try {
      const response = await client.api.interview.$get();
      if (!response.ok) {
        throw new Error(`APIエラー: ${response.status}`);
      }
      const data = await response.json();
      setInterviewList(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('[InterviewList] fetchInterviewList error:', err);
      } else {
        console.error('[InterviewList] fetchInterviewList error:', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section>
      <h2 className="font-medium text-xl mt-10">過去に受けた面接一覧</h2>
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          <Skeleton className="h-[100px] w-full" />
        ) : interviewList && interviewList.length > 0 ? (
          interviewList.map((interview, index) => {
            const interviewForCard = {
              ...interview,
              createdAt: new Date(interview.createdAt),
            };
            return <InterviewItemCard key={index} interview={interviewForCard} />;
          })
        ) : (
          <div className="col-span-full text-gray-500 py-8">面接データがありません</div>
        )}
      </div>
    </section>
  );
}

export default InterviewList