const Inteerview = () => {
  return (
    <div className="p-10">
      <h1 className="font-bold text-2xl">Dashboard</h1>
      <h2 className="text-gray-500">Create and Start your AI Mockup Interview</h2>

      <div>
        <AddNewInterview />
      </div>

      {/* Previous Interview List */}
      <InterviewList />
    </div>
  )
}

export default Inteerview
