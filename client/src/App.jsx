function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Meaningful Quotes
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Your personal collection of inspiration.
        </p>
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
          <p className="text-gray-500 italic">
            "The best time to plant a tree was 20 years ago. The second best time is now."
          </p>
          <p className="text-gray-400 mt-2 text-sm">
            — Chinese Proverb
          </p>
        </div>
        <p className="mt-8 text-sm text-green-600 font-medium">
          Frontend is running!
        </p>
      </div>
    </div>
  );
}

export default App;
