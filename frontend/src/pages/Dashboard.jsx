function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-blue-700 text-white p-4 text-2xl font-bold">
        Skylark Cooperative Dashboard
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">Total Members</h2>
          <p className="text-3xl font-bold text-blue-600">120</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">Total Deposit</h2>
          <p className="text-3xl font-bold text-green-600">৳ 12,50,000</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">Total Loan</h2>
          <p className="text-3xl font-bold text-red-600">৳ 5,00,000</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">Profit</h2>
          <p className="text-3xl font-bold text-purple-600">৳ 1,25,000</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;