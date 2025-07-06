import React from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Interview } from '@prisma/client'


const InterviewItemCard = ({ interview }: { interview: Interview }) => {
  const router = useRouter();

  const onFeedBack = () => {
    router.push(`/interview/${interview.interviewId}/feedback`);
  }

  return (
    <div className="border shadow-sm rounded-lg p-5">
      <h2 className="ml-2 font-bold text-lg">{interview?.companyName}</h2>
      <h3 className="ml-2 mt-1 text-xs text-gray-400">実施日: {interview?.createdAt.toLocaleDateString()}</h3>
      <Button className="flex justify-end mt-3 truncate" size="sm" variant="outline" onClick={onFeedBack}>フィードバックを確認</Button>
    </div>
  )
}

export default InterviewItemCard
