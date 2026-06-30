function Login() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center">
      <div className="bg-white w-96 p-8 rounded-2xl shadow-2xl">
        <h1 className="text-3xl font-bold text-center text-blue-700">
          Skylark Cooperative
        </h1>

        <p className="text-center text-gray-500 mt-2 mb-6">
          Management System
        </p>

        <input
          type="text"
          placeholder="Username"
          className="w-full border border-gray-300 rounded-lg p-3 mb-4"
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border border-gray-300 rounded-lg p-3 mb-6"
        />

        <button className="w-full bg-blue-600 text-white py-3 rounded-lg">
          Login
        </button>
      </div>
    </div>
  );
}

export default Login;