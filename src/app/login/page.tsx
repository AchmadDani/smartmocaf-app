"use client";

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-sm">
                <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">SmartMocaf</h1>
                <p className="text-center text-gray-500 mb-8">Masuk untuk memantau perangkat</p>

                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#bd7e7e] focus:border-transparent outline-none"
                            placeholder="example@email.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#bd7e7e] focus:border-transparent outline-none"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        className="w-full bg-[#bd7e7e] text-white font-medium py-2.5 rounded-lg hover:bg-[#a66b6b] transition-colors mt-4"
                    >
                        Masuk
                    </button>
                </form>
            </div>
        </div>
    );
}
