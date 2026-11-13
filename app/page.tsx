
const menu = [
  { icon: "▦", name: "Dashboard", active: true },
  { icon: "♙", name: "Data Santri" },
  { icon: "♟", name: "Data Pengurus" },
  { icon: "⌂", name: "Asrama & Kamar" },
  { icon: "✓", name: "Absensi" },
  { icon: "Rp", name: "Keuangan" },
  { icon: "↗", name: "Perizinan" },
  { icon: "⚑", name: "Pelanggaran" },
  { icon: "★", name: "Prestasi" },
  { icon: "▤", name: "Laporan" },
];

const statistics = [
  { title: "Total Santri", value: "—", note: "Data belum tersedia", icon: "♙" },
  { title: "Pengurus & Pengajar", value: "—", note: "Data belum tersedia", icon: "♟" },
  { title: "Jumlah Asrama", value: "—", note: "Data belum tersedia", icon: "⌂" },
  { title: "Santri Aktif", value: "—", note: "Data belum tersedia", icon: "✓" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 md:flex">

      {/* SIDEBAR */}
      <aside className="w-full bg-slate-950 text-white md:fixed md:inset-y-0 md:left-0 md:w-64">
        <div className="border-b border-slate-800 px-6 py-6">
          <h1 className="text-2xl font-bold tracking-wide text-emerald-400">
            SIMESTA
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Sistem Manajemen Pesantren
          </p>
        </div>

        <div className="px-4 py-5">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Menu Utama
          </p>

          <nav className="space-y-1">
            {menu.map((item) => (
              <div
                key={item.name}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm ${
                  item.active
                    ? "bg-emerald-600 font-semibold text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <span className="w-5 text-center">{item.icon}</span>
                {item.name}
              </div>
            ))}
          </nav>
        </div>

        <div className="border-t border-slate-800 p-5">
          <p className="text-xs text-slate-400">Versi Aplikasi</p>
          <p className="mt-1 text-sm font-medium">SIMESTA v1.0</p>
        </div>
      </aside>

      {/* KONTEN UTAMA */}
      <main className="min-w-0 flex-1 p-5 md:ml-64 md:p-8">

        {/* HEADER */}
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">
              Sistem Informasi Pesantren
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              Dashboard
            </h2>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
            <p className="text-xs text-slate-500">Status Aplikasi</p>
            <p className="text-sm font-semibold text-emerald-600">
              ● Sistem Aktif
            </p>
          </div>
        </header>

        {/* SAMBUTAN */}
        <section className="mb-8 rounded-2xl bg-gradient-to-r from-emerald-800 to-emerald-600 p-7 text-white shadow-lg">
          <p className="text-sm text-emerald-100">
            Selamat Datang di SIMESTA
          </p>
          <h3 className="mt-2 text-2xl font-bold">
            Sistem Manajemen Santri dan Pesantren
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50">
            Kelola data santri, administrasi, kegiatan, dan seluruh
            kebutuhan pengelolaan pesantren dalam satu sistem terpadu.
          </p>
        </section>

        {/* STATISTIK */}
        <section className="mb-8">
          <h3 className="mb-4 text-lg font-bold text-slate-900">
            Ringkasan Pesantren
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statistics.map((stat) => (
              <div
                key={stat.title}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">{stat.title}</p>
                  <span className="rounded-lg bg-emerald-50 px-3 py-2 font-bold text-emerald-700">
                    {stat.icon}
                  </span>
                </div>

                <h4 className="mt-4 text-3xl font-bold text-slate-900">
                  {stat.value}
                </h4>
                <p className="mt-2 text-xs text-slate-400">
                  {stat.note}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* MODUL */}
        <section className="mb-8">
          <h3 className="mb-4 text-lg font-bold text-slate-900">
            Modul Pengelolaan
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {menu.slice(1).map((item) => (
              <div
                key={item.name}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-xl font-bold text-emerald-700">
                  {item.icon}
                </div>
                <h4 className="font-semibold text-slate-800">
                  {item.name}
                </h4>
                <p className="mt-1 text-sm text-slate-500">
                  Modul pengelolaan {item.name.toLowerCase()} pesantren.
                </p>
                <p className="mt-3 text-xs font-medium text-amber-600">
                  Segera dikembangkan
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-slate-200 py-5 text-center text-xs text-slate-500">
          © 2026 SIMESTA - Sistem Manajemen Santri dan Pengelola Pesantren
        </footer>

      </main>
    </div>
  );
}
