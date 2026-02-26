import Link from "next/link";
import Image from "next/image";
import TelemetryPreview from "@/components/TelemetryPreview";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white font-sans antialiased">
            {/* ========== HEADER ========== */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 md:gap-3">
                        <Image
                            src="/assets/images/logos/Logo Growify Tech + Smart Mocaf.png"
                            alt="Growify x SmartMocaf"
                            width={140}
                            height={36}
                            className="h-8 md:h-10 w-auto object-contain"
                            priority
                        />
                    </Link>
                    <nav className="hidden lg:flex items-center gap-6 md:gap-8">
                        <a href="#masalah" className="text-xs md:text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Masalah</a>
                        <a href="#solusi" className="text-xs md:text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Solusi</a>
                        <a href="#fitur" className="text-xs md:text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Fitur</a>
                        <a href="#tentang" className="text-xs md:text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Tentang</a>
                    </nav>
                    <div className="flex items-center gap-2 md:gap-3">
                        <Link href="/auth/login" className="text-xs md:text-sm font-semibold text-gray-700 hover:text-gray-900 px-3 md:px-4 py-2 transition-colors">
                            Masuk
                        </Link>
                        <Link href="/auth/register" className="text-xs md:text-sm font-semibold text-white bg-[#009e3e] hover:bg-[#007d31] px-4 md:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl transition-all shadow-lg shadow-[#009e3e]/20 hover:shadow-xl hover:shadow-[#009e3e]/30">
                            Daftar
                        </Link>
                    </div>
                </div>
            </header>

            {/* ========== HERO SECTION ========== */}
            <section className="pt-24 md:pt-32 pb-16 md:pb-20 px-4 md:px-6 bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-4xl mx-auto mb-10 md:mb-16">
                        <div className="inline-flex items-center gap-2 bg-[#009e3e]/10 text-[#009e3e] text-xs md:text-sm font-semibold px-3 md:px-4 py-2 rounded-full mb-4 md:mb-6">
                            <span className="w-2 h-2 bg-[#009e3e] rounded-full animate-pulse"></span>
                            Innovillage 2025 - Desa Purwodadi, Pringsewu
                        </div>
                        <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4 md:mb-6">
                            Monitoring Fermentasi Mocaf
                            <span className="text-[#009e3e]"> Lebih Cerdas</span>
                        </h1>
                        <p className="text-sm md:text-lg text-gray-600 leading-relaxed max-w-2xl md:max-w-3xl mx-auto">
                            SmartMocaf membantu petani Pringsewu mengoptimalkan proses fermentasi singkong menjadi tepung mocaf berkualitas tinggi dengan monitoring pH dan suhu otomatis.
                        </p>
                    </div>

                    {/* Telemetry Preview - Clean Apple-like design */}
                    <TelemetryPreview />
                </div>
            </section>

            {/* Animated data script */}
            <script dangerouslySetInnerHTML={{
                __html: `
                    (function() {
                        // Animated counter
                        function animateValue(id, start, end, duration, suffix = '') {
                            const obj = document.getElementById(id);
                            let startTimestamp = null;
                            const step = (timestamp) => {
                                if (!startTimestamp) startTimestamp = timestamp;
                                const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                                const value = Math.floor(progress * (end - start) + start);
                                obj.textContent = value + suffix;
                                if (progress < 1) {
                                    window.requestAnimationFrame(step);
                                }
                            };
                            window.requestAnimationFrame(step);
                        }
                        
                        // Animate on load
                        setTimeout(function() {
                            animateValue('ph-value', 0, 4.52, 1500, '.');
                            animateValue('temp-value', 0, 28, 1200, '');
                            animateValue('water-value', 0, 85, 1400, '');
                            animateValue('duration-value', 0, 18, 1000, '');
                        }, 300);
                    })();
                `
            }} />

            {/* ========== PROBLEM SECTION ========== */}
            <section id="masalah" className="py-16 md:py-24 px-4 md:px-6 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16">
                        <span className="text-xs md:text-sm font-black text-red-500 uppercase tracking-[0.2em] mb-3 md:mb-4 block">Urgensi & Permasalahan</span>
                        <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6 tracking-tight">
                            Krisis Harga & Hilirisasi <br className="hidden md:block" />
                            <span className="text-[#009e3e]">Singkong di Lampung</span>
                        </h2>
                        <p className="text-sm md:text-lg text-gray-600 leading-relaxed">
                            Meskipun Lampung menjadi "Raksasa Singkong" dunia, petani di tingkat akar rumput 
                            masih terjebak dalam ketidakpastian harga dan minimnya nilai tambah.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6 md:gap-8 items-stretch">
                        {/* News Card 1: Kumparan */}
                        <div className="group relative bg-[#fcfdf2] rounded-2xl md:rounded-[2.5rem] p-6 md:p-8 lg:p-12 border border-yellow-100/50 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 md:p-8 opacity-10 group-hover:rotate-12 transition-transform duration-500">
                                <svg className="w-20 md:w-24 lg:w-32 h-20 md:h-24 lg:h-32 text-yellow-600" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m-2 10H7v-2h10v2z"/></svg>
                            </div>
                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-2 px-2.5 md:px-3 py-1 md:py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider mb-4 md:mb-6">
                                    Statistik Nasional
                                </div>
                                <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
                                    Lampung Menyumbang <span className="text-red-500 underline decoration-wavy decoration-red-200">51% Produksi</span> Singkong Nasional
                                </h3>
                                <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                                    <blockquote className="border-l-3 md:border-l-4 border-yellow-300 pl-3 md:pl-4 py-1.5 md:py-2 text-sm md:text-gray-700 italic leading-relaxed bg-white/50 rounded-r-lg md:rounded-r-xl">
                                        "Produksi singkong Lampung pada 2024 mencapai 7,9 juta ton atau setara 51% dari total produksi nasional."
                                    </blockquote>
                                    <p className="text-xs md:text-sm text-gray-500 font-medium">Sumber: <a href="https://kumparan.com" target="_blank" className="text-blue-500 underline">kumparan.com</a></p>
                                </div>
                                <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-white rounded-xl md:rounded-2xl border border-yellow-50">
                                    <div className="text-2xl md:text-3xl font-black text-yellow-600">7.9Jt</div>
                                    <div className="text-[10px] md:text-xs text-gray-500 uppercase font-bold tracking-wider leading-tight">Ton Per Tahun <br/> Kapasitas Produksi</div>
                                </div>
                            </div>
                        </div>

                        {/* News Card 2: Kompas */}
                        <div className="group relative bg-[#fff5f5] rounded-2xl md:rounded-[2.5rem] p-6 md:p-8 lg:p-12 border border-red-100/50 shadow-sm hover:shadow-xl transition-all duration-500">
                            <div className="absolute top-0 right-0 p-6 md:p-8 opacity-10 group-hover:-rotate-12 transition-transform duration-500">
                                <svg className="w-20 md:w-24 lg:w-32 h-20 md:h-24 lg:h-32 text-red-600" fill="currentColor" viewBox="0 0 24 24"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6h-6z"/></svg>
                            </div>
                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-2 px-2.5 md:px-3 py-1 md:py-1.5 bg-red-100 text-red-700 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider mb-4 md:mb-6">
                                    Polemik Harga
                                </div>
                                <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
                                    Harga Singkong Sangat <span className="text-red-500">Rendah & Tidak Stabil</span>
                                </h3>
                                <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                                    <blockquote className="border-l-3 md:border-l-4 border-red-300 pl-3 md:pl-4 py-1.5 md:py-2 text-sm md:text-gray-700 italic leading-relaxed bg-white/50 rounded-lg md:rounded-r-xl">
                                        "Tahun ini harga singkong di tingkat petani berkisar Rp 1.000 - Rp 1.100 dengan rafaksi (potongan) 30-40%."
                                    </blockquote>
                                    <p className="text-xs md:text-sm text-gray-500 font-medium">Sumber: <a href="https://kompas.id" target="_blank" className="text-blue-500 underline">kompas.id</a></p>
                                </div>
                                <div className="grid grid-cols-2 gap-3 md:gap-4">
                                    <div className="p-3 md:p-4 bg-white rounded-xl md:rounded-2xl border border-red-50 text-center">
                                        <div className="text-xl md:text-2xl font-black text-red-600">Rp 1000</div>
                                        <div className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-1">Harga Terendah</div>
                                    </div>
                                    <div className="p-3 md:p-4 bg-white rounded-xl md:rounded-2xl border border-red-50 text-center">
                                        <div className="text-xl md:text-2xl font-black text-red-600">40%</div>
                                        <div className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-1">Potongan Rafaksi</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bridge Quote */}
                    <div className="mt-8 md:mt-12 bg-gray-900 rounded-2xl md:rounded-[2rem] p-6 md:p-8 lg:p-10 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#009e3e]/20 to-transparent opacity-50"></div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8">
                            <div className="flex-1">
                                <p className="text-base md:text-xl lg:text-2xl text-white font-medium leading-relaxed">
                                    "Struktur pasar <span className="text-[#009e3e] font-bold">Oligopsoni</span> membuat petani tidak memiliki daya saing. Solusinya adalah <span className="italic text-gray-300 underline decoration-gray-600">Hilirisasi</span> dengan teknologi pengolahan mocaf."
                                </p>
                            </div>
                            <div className="flex-shrink-0 text-center md:text-left border-l border-gray-800 pl-0 md:pl-6 lg:pl-8">
                                <p className="text-xs md:text-sm text-gray-500 uppercase font-bold tracking-widest mb-1">Analisis Ekonomi</p>
                                <p className="text-white font-bold">Dosen FEB Unila</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========== SOLUTION SECTION ========== */}
            <section id="solusi" className="py-24 px-6 bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="order-2 lg:order-1">
                            <div className="bg-gradient-to-br from-[#009e3e]/10 to-emerald-50 rounded-3xl p-8 lg:p-12">
                                <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-[#009e3e] rounded-xl flex items-center justify-center">
                                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">SmartMocaf</p>
                                            <p className="text-sm text-gray-500">IoT Monitoring System</p>
                                        </div>
                                    </div>
                                    <p className="text-gray-600">Sistem monitoring pintar yang membantu petani mengontrol proses fermentasi secara real-time.</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white rounded-xl p-4 shadow-md">
                                        <p className="text-2xl font-bold text-[#009e3e]">95%</p>
                                        <p className="text-sm text-gray-600">Tingkat keberhasilan fermentasi</p>
                                    </div>
                                    <div className="bg-white rounded-xl p-4 shadow-md">
                                        <p className="text-2xl font-bold text-[#009e3e]">3x</p>
                                        <p className="text-sm text-gray-600">Peningkatan nilai jual produk</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="order-1 lg:order-2">
                            <span className="text-sm font-semibold text-[#009e3e] uppercase tracking-wider">Solusi Kami</span>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-4 mb-6">
                                SmartMocaf: Fermentasi Cerdas untuk Petani Modern
                            </h2>
                            <p className="text-lg text-gray-600 leading-relaxed mb-8">
                                SmartMocaf hadir sebagai solusi teknologi yang mendukung program hilirisasi mocaf 
                                Bupati Pringsewu, H. Riyanto Pamungkas, untuk meningkatkan kesejahteraan petani.
                            </p>
                            <div className="space-y-4">
                                {[
                                    "Kualitas mocaf lebih seragam",
                                    "Mengurangi gagal fermentasi",
                                    "Mengurangi beban pengecekan manual",
                                    "Proses lebih efisien",
                                    "Mendukung peningkatan nilai jual produk"
                                ].map((manfaat, idx) => (
                                    <div key={idx} className="flex items-center gap-4 group">
                                        <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-[#009e3e] transition-colors">
                                            <svg className="w-5 h-5 text-[#009e3e] group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <span className="text-gray-700 font-medium">{manfaat}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========== FEATURES SECTION ========== */}
            <section id="fitur" className="py-24 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-sm font-semibold text-[#009e3e] uppercase tracking-wider">Fitur Unggulan</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-4 mb-6">
                            Teknologi Canggih untuk Hasil Maksimal
                        </h2>
                        <p className="text-lg text-gray-600">
                            SmartMocaf dilengkapi dengan berbagai fitur monitoring yang memastikan setiap batch fermentasi berhasil sempurna.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-gray-50 rounded-2xl p-8 hover:shadow-xl transition-shadow group">
                            <div className="w-14 h-14 bg-[#009e3e]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#009e3e] transition-colors">
                                <svg className="w-7 h-7 text-[#009e3e] group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Sensor pH Presisi</h3>
                            <p className="text-gray-600">Pengukuran pH dengan akurasi tinggi untuk memastikan fermentasi berjalan pada level optimal 4.5 - 5.0.</p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-gray-50 rounded-2xl p-8 hover:shadow-xl transition-shadow group">
                            <div className="w-14 h-14 bg-[#009e3e]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#009e3e] transition-colors">
                                <svg className="w-7 h-7 text-[#009e3e] group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Monitoring Suhu</h3>
                            <p className="text-gray-600">Pantau suhu fermentasi secara real-time dan terima peringatan jika suhu keluar dari rentang ideal.</p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-gray-50 rounded-2xl p-8 hover:shadow-xl transition-shadow group">
                            <div className="w-14 h-14 bg-[#009e3e]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#009e3e] transition-colors">
                                <svg className="w-7 h-7 text-[#009e3e] group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Kontrol Waktu</h3>
                            <p className="text-gray-600">Timer otomatis untuk setiap tahap fermentasi dengan notifikasi saat proses selesai.</p>
                        </div>

                        {/* Feature 4 */}
                        <div className="bg-gray-50 rounded-2xl p-8 hover:shadow-xl transition-shadow group">
                            <div className="w-14 h-14 bg-[#009e3e]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#009e3e] transition-colors">
                                <svg className="w-7 h-7 text-[#009e3e] group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Akses Mobile</h3>
                            <p className="text-gray-600">Pantau dan kontrol fermentasi dari mana saja melalui smartphone Anda.</p>
                        </div>

                        {/* Feature 5 */}
                        <div className="bg-gray-50 rounded-2xl p-8 hover:shadow-xl transition-shadow group">
                            <div className="w-14 h-14 bg-[#009e3e]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#009e3e] transition-colors">
                                <svg className="w-7 h-7 text-[#009e3e] group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Riwayat Data</h3>
                            <p className="text-gray-600">Simpan dan analisis data setiap batch fermentasi untuk perbaikan berkelanjutan.</p>
                        </div>

                        {/* Feature 6 */}
                        <div className="bg-gray-50 rounded-2xl p-8 hover:shadow-xl transition-shadow group">
                            <div className="w-14 h-14 bg-[#009e3e]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#009e3e] transition-colors">
                                <svg className="w-7 h-7 text-[#009e3e] group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Kontrol Keran</h3>
                            <p className="text-gray-600">Buka dan tutup keran air secara otomatis atau manual melalui aplikasi.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========== HOW IT WORKS ========== */}
            <section className="py-24 px-6 bg-gray-900 text-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-sm font-semibold text-[#009e3e] uppercase tracking-wider">Cara Kerja</span>
                        <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-6">
                            Proses Fermentasi Mocaf dengan SmartMocaf
                        </h2>
                        <p className="text-lg text-gray-400">
                            Tiga langkah sederhana untuk menghasilkan tepung mocaf berkualitas tinggi.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-[#009e3e] rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                                1
                            </div>
                            <h3 className="text-xl font-bold mb-3">Persiapan</h3>
                            <p className="text-gray-400">Masukkan singkong yang sudah dikupas dan dipotong ke dalam tangki fermentor. Hubungkan perangkat SmartMocaf.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-[#009e3e] rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                                2
                            </div>
                            <h3 className="text-xl font-bold mb-3">Fermentasi</h3>
                            <p className="text-gray-400">Mulai proses fermentasi melalui aplikasi. SmartMocaf akan memonitor pH dan suhu secara otomatis selama 24-48 jam.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-[#009e3e] rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                                3
                            </div>
                            <h3 className="text-xl font-bold mb-3">Selesai</h3>
                            <p className="text-gray-400">Terima notifikasi saat fermentasi selesai. Buka keran untuk menguras air dan lanjutkan ke proses pengeringan.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========== ABOUT SECTION ========== */}
            <section id="tentang" className="py-24 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <span className="text-sm font-semibold text-[#009e3e] uppercase tracking-wider">Tentang Proyek</span>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-4 mb-6">
                                Innovillage 2025: SmartMocaf untuk Desa Purwodadi
                            </h2>
                            <p className="text-lg text-gray-600 leading-relaxed mb-6">
                                SmartMocaf adalah proyek yang dikembangkan oleh tim <strong>Growify Tech</strong> dalam rangka kompetisi 
                                <strong> Innovillage 2025</strong> yang diselenggarakan oleh Telkom Indonesia.
                            </p>
                            <p className="text-lg text-gray-600 leading-relaxed mb-6">
                                Proyek ini ditargetkan untuk membantu petani singkong di <strong>Desa Purwodadi, Kecamatan Adiluwih, 
                                Kabupaten Pringsewu, Lampung</strong> dalam meningkatkan kualitas dan nilai jual produk mocaf mereka.
                            </p>
                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                <h4 className="font-semibold text-gray-900 mb-3">Target Dampak:</h4>
                                <ul className="space-y-2">
                                    <li className="flex items-center gap-2 text-gray-600">
                                        <svg className="w-5 h-5 text-[#009e3e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                        Mengurangi tingkat kegagalan fermentasi hingga 90%
                                    </li>
                                    <li className="flex items-center gap-2 text-gray-600">
                                        <svg className="w-5 h-5 text-[#009e3e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                        Meningkatkan nilai jual singkong 3x lipat
                                    </li>
                                    <li className="flex items-center gap-2 text-gray-600">
                                        <svg className="w-5 h-5 text-[#009e3e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                        Memberdayakan 50+ keluarga petani di tahun pertama
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="bg-white rounded-[2.5rem] p-2 border border-blue-50 shadow-xl overflow-hidden relative group">
                                <iframe 
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15891.659381544368!2d105.00128324369686!3d-5.27597241523367!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e4734be636532d9%3A0xaf1be9aac7b44ff3!2sPurwodadi%2C%20Kec.%20Adi%20Luwih%2C%20Kabupaten%20Pringsewu%2C%20Lampung!5e0!3m2!1sid!2sid!4v1769669767035!5m2!1sid!2sid" 
                                    className="w-full h-80 rounded-[2rem] border-0 hover:scale-[1.02] transition-transform duration-700" 
                                    allowFullScreen 
                                    loading="lazy" 
                                    referrerPolicy="no-referrer-when-downgrade"
                                />
                                <div className="absolute bottom-6 right-6">
                                    <a 
                                        href="https://maps.app.goo.gl/9GvX3J9X4vYn7QY78" 
                                        target="_blank" 
                                        className="inline-flex items-center gap-2 bg-white px-5 py-3 rounded-2xl shadow-xl font-bold text-gray-900 group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:scale-105 active:scale-95"
                                    >
                                        <svg className="w-5 h-5 text-blue-500 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                                        Lihat Lokasi
                                    </a>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gradient-to-br from-[#009e3e]/5 to-emerald-50 rounded-2xl p-6 border border-[#009e3e]/10">
                                    <span className="text-[10px] uppercase font-black tracking-widest text-[#009e3e]/60 mb-1 block">Lokasi Fokus</span>
                                    <h5 className="font-bold text-gray-900">Pekon Purwodadi</h5>
                                    <p className="text-xs text-gray-500 mt-1">Kec. Adiluwih, Pringsewu</p>
                                </div>
                                <div className="bg-gray-900 rounded-2xl p-6 text-white text-center flex flex-col justify-center">
                                    <div className="text-2xl font-black text-[#009e3e]">2026</div>
                                    <div className="text-[10px] uppercase text-gray-500 font-bold tracking-widest">Target Implementasi</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========== SUPPORTED BY ========== */}
            <section className="py-16 bg-white border-y border-gray-100">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-center text-xs font-bold text-gray-400 uppercase tracking-[0.25em] mb-12">Didukung Oleh</h2>
                    <div className="flex flex-wrap items-center justify-center gap-14 md:gap-20">
                        <Image src="/assets/images/logos/Logo Danantara Indonesia.png" alt="Danantara" width={180} height={70} className="h-14 w-auto object-contain hover:scale-105 transition-transform" />
                        <Image src="/assets/images/logos/LOGO INNOVILLAGE6TH.png" alt="Innovillage" width={180} height={70} className="h-14 w-auto object-contain hover:scale-105 transition-transform" />
                        <Image src="/assets/images/logos/Telkom University.png" alt="TelU" width={180} height={70} className="h-14 w-auto object-contain hover:scale-105 transition-transform" />
                        <Image src="/assets/images/logos/Logo Telkom Indonesia.png" alt="Telkom" width={220} height={90} className="h-18 w-auto object-contain hover:scale-110 transition-transform brightness-110" />
                    </div>
                </div>
            </section>

            {/* ========== CTA SECTION ========== */}
            <section className="py-24 px-6 bg-gradient-to-br from-[#009e3e] to-emerald-600">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        Siap Tingkatkan Kualitas Mocaf Anda?
                    </h2>
                    <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
                        Bergabunglah dengan petani-petani Pringsewu yang sudah menggunakan SmartMocaf untuk menghasilkan tepung mocaf berkualitas tinggi.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/auth/register" className="bg-white text-[#009e3e] font-bold px-8 py-4 rounded-xl hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
                            Daftar Sekarang
                        </Link>
                        <Link href="/auth/login" className="bg-transparent text-white font-bold px-8 py-4 rounded-xl border-2 border-white/30 hover:bg-white/10 transition-all">
                            Sudah Punya Akun
                        </Link>
                    </div>
                </div>
            </section>

            {/* ========== FOOTER ========== */}
            <footer className="py-16 px-6 bg-gray-900 text-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        <div className="md:col-span-2">
                            <Image
                                src="/assets/images/logos/Logo Growify Tech + Smart Mocaf.png"
                                alt="Growify x SmartMocaf"
                                width={180}
                                height={48}
                                className="h-10 w-auto object-contain mb-4 brightness-0 invert"
                            />
                            <p className="text-gray-400 max-w-md">
                                SmartMocaf adalah sistem monitoring pintar untuk proses fermentasi mocaf, 
                                dikembangkan oleh Growify Tech untuk Innovillage 2025.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Navigasi</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#masalah" className="hover:text-white transition-colors">Masalah</a></li>
                                <li><a href="#solusi" className="hover:text-white transition-colors">Solusi</a></li>
                                <li><a href="#fitur" className="hover:text-white transition-colors">Fitur</a></li>
                                <li><a href="#tentang" className="hover:text-white transition-colors">Tentang</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4 text-white">Kontak & Lokasi</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><strong>Growify Tech Team</strong></li>
                                <li>Gedung TULT, Telkom University</li>
                                <li>Dayeuhkolot, Bandung 40257</li>
                                <li>growifytech@gmail.com</li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-gray-500 text-sm">
                            © 2026 Growify Tech. All rights reserved.
                        </p>
                        <p className="text-gray-500 text-sm">
                            Innovillage 2025 - Telkom Indonesia
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
