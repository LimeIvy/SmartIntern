import AddNewInterview from './_components/AddNewInterview'
import InterviewList from './_components/InterviewList'

const Interview = () => {
  return (
    <div className="p-10">
      <h1 className="font-bold text-2xl">AI面接</h1>
      <h2 className="text-gray-500 mt-1">就活の面接練習をAIでサポート</h2>

      <div className="mt-5">
        <AddNewInterview /> 
      </div>

      {/* Previous Interview List */}
      <InterviewList />
    </div>
  )
}

export default Interview
