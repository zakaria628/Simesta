"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";
import type { User } from "@supabase/supabase-js";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { Database } from "@/lib/supabase/database.types";

const PAGE_SIZE = 10;
const PHOTO_BUCKET = "pengurus-profile";

type Pengurus = Database["public"]["Tables"]["pengurus"]["Row"];
type PengurusForm = Omit<
  Pengurus,
  "id" | "kode_pengurus" | "created_at" | "updated_at" | "foto_path"
>;
type PengurusWithPhoto = Pengurus & { fotoUrl: string | null };
type SelectOptions = { jabatan: string[]; bagian: string[] };

const EMPTY_FORM: PengurusForm = {
  nama_lengkap: "",
  nik: "",
  jenis_kelamin: "Laki-laki",
  tempat_lahir: "",
  tanggal_lahir: "",
  alamat: "",
  nomor_hp: "",
  jabatan: "",
  bagian: "",
  tanggal_mulai: "",
  status: "Aktif",
};

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Terjadi kesalahan yang tidak diketahui.";
}
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      <span className="mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

export default function DataPengurus() {
  const [clientSetup] = useState(() => {
    try {
      return { client: createSupabaseBrowserClient(), error: "" };
    } catch (clientError) {
      return { client: null, error: errorMessage(clientError) };
    }
  });
  const supabase = clientSetup.client;
  const [user, setUser] = useState<User | null>(null);
  const configError = clientSetup.error;
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [rows, setRows] = useState<PengurusWithPhoto[]>([]);
  const [options, setOptions] = useState<SelectOptions>({
    jabatan: [],
    bagian: [],
  });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [jabatanFilter, setJabatanFilter] = useState("");
  const [bagianFilter, setBagianFilter] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState<PengurusForm>(EMPTY_FORM);
  const [photo, setPhoto] = useState<File | null>(null);
  const [editing, setEditing] = useState<PengurusWithPhoto | null>(null);
  const [details, setDetails] = useState<PengurusWithPhoto | null>(null);

  useEffect(() => {
    if (!supabase) return;

    let active = true;
    supabase.auth
      .getSession()
      .then(({ data, error: sessionError }) => {
        if (!active) return;
        if (sessionError) {
          setError(`Gagal memeriksa sesi: ${sessionError.message}`);
        } else {
          setUser(data.session?.user ?? null);
        }
        setAuthLoading(false);
      })
      .catch((sessionError: unknown) => {
        if (!active) return;
        setError(`Gagal memeriksa sesi: ${errorMessage(sessionError)}`);
        setAuthLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setError("");
      setAuthLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(searchText.trim());
      setPage(0);
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [searchText]);

  const loadPengurus = useCallback(async () => {
    if (!supabase || !user) return;
    setRecordsLoading(true);
    setError("");

    try {
      const start = page * PAGE_SIZE;
      let recordsQuery = supabase
        .from("pengurus")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(start, start + PAGE_SIZE - 1);

      if (search) {
        const escapedSearch = search
          .replace(/\\/g, "\\\\")
          .replace(/"/g, '\\"')
          .replace(/[(),]/g, "\\$&");
        recordsQuery = recordsQuery.or(
          `nama_lengkap.ilike."%${escapedSearch}%",nik.ilike."%${escapedSearch}%"`,
        );
      }
      if (jabatanFilter) recordsQuery = recordsQuery.eq("jabatan", jabatanFilter);
      if (bagianFilter) recordsQuery = recordsQuery.eq("bagian", bagianFilter);

      const [recordsResult, optionsResult] = await Promise.all([
        recordsQuery,
        supabase.from("pengurus").select("jabatan,bagian"),
      ]);

      if (recordsResult.error) throw recordsResult.error;
      if (optionsResult.error) throw optionsResult.error;

      const records = await Promise.all(
        (recordsResult.data ?? []).map(async (record) => {
          if (!record.foto_path) return { ...record, fotoUrl: null };
          const { data: signedPhoto, error: photoError } = await supabase.storage
            .from(PHOTO_BUCKET)
            .createSignedUrl(record.foto_path, 3600);
          if (photoError) {
            throw new Error(`Gagal memuat foto ${record.nama_lengkap}: ${photoError.message}`);
          }
          return { ...record, fotoUrl: signedPhoto.signedUrl };
        }),
      );

      setRows(records);
      setTotal(recordsResult.count ?? 0);
      setOptions({
        jabatan: [...new Set((optionsResult.data ?? []).map((item) => item.jabatan))].sort(),
        bagian: [...new Set((optionsResult.data ?? []).map((item) => item.bagian))].sort(),
      });
    } catch (loadError) {
      setError(`Gagal memuat data pengurus: ${errorMessage(loadError)}`);
    } finally {
      setRecordsLoading(false);
    }
  }, [bagianFilter, jabatanFilter, page, search, supabase, user]);

  useEffect(() => {
    if (!user) return;
    const timer = window.setTimeout(() => {
      void loadPengurus();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadPengurus, reloadKey, user]);

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    setFormLoading(true);
    setError("");
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) setError(`Gagal masuk: ${signInError.message}`);
    } catch (signInError) {
      setError(`Gagal masuk: ${errorMessage(signInError)}`);
    } finally {
      setFormLoading(false);
    }
  }

  async function handleSignOut() {
    if (!supabase) return;
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        setError(`Gagal keluar: ${signOutError.message}`);
        return;
      }
      setRows([]);
    } catch (signOutError) {
      setError(`Gagal keluar: ${errorMessage(signOutError)}`);
    }
  }

  function openCreateForm() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setPhoto(null);
    setError("");
    setFormOpen(true);
  }

  function openEditForm(record: PengurusWithPhoto) {
    setEditing(record);
    setForm({
      nama_lengkap: record.nama_lengkap,
      nik: record.nik,
      jenis_kelamin: record.jenis_kelamin,
      tempat_lahir: record.tempat_lahir,
      tanggal_lahir: record.tanggal_lahir,
      alamat: record.alamat,
      nomor_hp: record.nomor_hp,
      jabatan: record.jabatan,
      bagian: record.bagian,
      tanggal_mulai: record.tanggal_mulai,
      status: record.status,
    });
    setPhoto(null);
    setError("");
    setFormOpen(true);
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !user) return;

    if (!/^\d{16}$/.test(form.nik)) {
      setError("NIK harus terdiri dari tepat 16 angka.");
      return;
    }
    if (!/^\+?[0-9\s()-]{9,18}$/.test(form.nomor_hp.trim())) {
      setError("Nomor HP tidak valid. Masukkan 9-18 karakter angka atau format nomor telepon.");
      return;
    }
    if (photo && !["image/jpeg", "image/png", "image/webp"].includes(photo.type)) {
      setError("Foto harus berformat JPG, PNG, atau WebP.");
      return;
    }
    if (photo && photo.size > 3 * 1024 * 1024) {
      setError("Ukuran foto maksimal 3 MB.");
      return;
    }

    setFormLoading(true);
    setError("");
    setNotice("");
    let uploadedPath: string | null = null;

    try {
      let fotoPath = editing?.foto_path ?? null;
      if (photo) {
        const safeName = photo.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        uploadedPath = `${user.id}/${crypto.randomUUID()}-${safeName}`;
        const { error: uploadError } = await supabase.storage
          .from(PHOTO_BUCKET)
          .upload(uploadedPath, photo, {
            contentType: photo.type,
            upsert: false,
          });
        if (uploadError) throw new Error(`Gagal mengunggah foto: ${uploadError.message}`);
        fotoPath = uploadedPath;
      }

      const values = { ...form, foto_path: fotoPath };
      if (editing) {
        const { data, error: updateError } = await supabase
          .from("pengurus")
          .update(values)
          .eq("id", editing.id)
          .select("id")
          .maybeSingle();
        if (updateError) throw updateError;
        if (!data) throw new Error("Data tidak ditemukan atau perubahan tidak diizinkan.");
      } else {
        const { error: insertError } = await supabase
          .from("pengurus")
          .insert(values);
        if (insertError) throw insertError;
      }

      let cleanupWarning = "";
      if (editing?.foto_path && fotoPath !== editing.foto_path) {
        try {
          const { error: removeError } = await supabase.storage
            .from(PHOTO_BUCKET)
            .remove([editing.foto_path]);
          if (removeError) {
            cleanupWarning = ` Data tersimpan, tetapi foto lama gagal dihapus: ${removeError.message}`;
          }
        } catch (removeError) {
          cleanupWarning = ` Data tersimpan, tetapi foto lama gagal dihapus: ${errorMessage(removeError)}`;
        }
      }

      setFormOpen(false);
      setEditing(null);
      setForm(EMPTY_FORM);
      setPhoto(null);
      setPage(0);
      setNotice(
        `${editing ? "Perubahan data pengurus berhasil disimpan." : "Data pengurus berhasil ditambahkan."}${cleanupWarning}`,
      );
      setReloadKey((key) => key + 1);
    } catch (saveError) {
      if (uploadedPath) {
        try {
          const { error: cleanupError } = await supabase.storage
            .from(PHOTO_BUCKET)
            .remove([uploadedPath]);
          if (cleanupError) {
            setError(
              `${errorMessage(saveError)} Foto yang gagal disimpan juga tidak dapat dibersihkan: ${cleanupError.message}`,
            );
            return;
          }
        } catch (cleanupError) {
          setError(
            `${errorMessage(saveError)} Pembersihan foto gagal: ${errorMessage(cleanupError)}`,
          );
          return;
        }
      }
      setError(`Gagal menyimpan data pengurus: ${errorMessage(saveError)}`);
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(record: PengurusWithPhoto) {
    if (!supabase) return;
    if (!window.confirm(`Hapus data pengurus ${record.nama_lengkap} (${record.kode_pengurus})?`)) {
      return;
    }
    setError("");
    setNotice("");
    try {
      const { data, error: deleteError } = await supabase
        .from("pengurus")
        .delete()
        .eq("id", record.id)
        .select("id");
      if (deleteError) {
        setError(`Gagal menghapus data pengurus: ${deleteError.message}`);
        return;
      }
      if (!data?.length) {
        setError("Data tidak ditemukan atau penghapusan tidak diizinkan.");
        return;
      }

      let cleanupWarning = "";
      if (record.foto_path) {
        try {
          const { error: removeError } = await supabase.storage
            .from(PHOTO_BUCKET)
            .remove([record.foto_path]);
          if (removeError) cleanupWarning = ` Foto profil gagal dihapus: ${removeError.message}`;
        } catch (removeError) {
          cleanupWarning = ` Foto profil gagal dihapus: ${errorMessage(removeError)}`;
        }
      }
      setNotice(`Data pengurus berhasil dihapus.${cleanupWarning}`);
      setReloadKey((key) => key + 1);
    } catch (deleteError) {
      setError(`Gagal menghapus data pengurus: ${errorMessage(deleteError)}`);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-800 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-7 flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link href="/" className="text-sm font-medium text-emerald-700 hover:text-emerald-800">
              SIMESTA / Dashboard
            </Link>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Data Pengurus
            </h1>
            <p className="mt-1 text-slate-500">
              Kelola profil, jabatan, dan status pengurus pesantren.
            </p>
          </div>
          {user && (
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Keluar
            </button>
          )}
        </header>

        {configError ? (
          <section className="rounded-xl border border-amber-300 bg-amber-50 p-6">
            <h2 className="font-semibold text-amber-950">Supabase belum dikonfigurasi</h2>
            <p className="mt-2 text-sm text-amber-900">{configError}</p>
            <p className="mt-2 text-sm text-amber-900">
              Salin <code>.env.example</code> menjadi <code>.env.local</code>, lalu isi URL proyek dan publishable/anon key Supabase.
            </p>
          </section>
        ) : authLoading ? (
          <p className="rounded-xl bg-white p-6 text-slate-600 shadow-sm">Memeriksa sesi Supabase...</p>
        ) : !user ? (
          <section className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Masuk ke SIMESTA</h2>
            <p className="mt-1 text-sm text-slate-500">
              Gunakan akun pengurus yang telah dibuat di Supabase Auth.
            </p>
            <form onSubmit={handleSignIn} className="mt-5 space-y-4">
              <Field label="Email">
                <input
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Kata sandi">
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className={inputClass}
                />
              </Field>
              {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
              <button
                type="submit"
                disabled={formLoading}
                className="w-full rounded-lg bg-emerald-700 px-4 py-2.5 font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
              >
                {formLoading ? "Memproses..." : "Masuk"}
              </button>
            </form>
          </section>
        ) : (
          <>
            <section className="mb-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Total pengurus ditemukan</p>
                <p className="mt-1 text-3xl font-bold text-slate-900">{total}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Pengurus aktif</p>
                <p className="mt-1 text-3xl font-bold text-emerald-700">
                  {rows.filter((record) => record.status === "Aktif").length}
                  {total > rows.length && <span className="ml-2 text-xs font-normal text-slate-400">di halaman ini</span>}
                </p>
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-slate-900">Daftar Pengurus</h2>
                <button
                  type="button"
                  onClick={openCreateForm}
                  className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
                >
                  + Tambah Pengurus
                </button>
              </div>

              <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <input
                  type="search"
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="Cari nama atau NIK..."
                  aria-label="Cari nama atau NIK pengurus"
                  className={inputClass}
                />
                <select
                  value={jabatanFilter}
                  onChange={(event) => {
                    setJabatanFilter(event.target.value);
                    setPage(0);
                  }}
                  aria-label="Filter jabatan"
                  className={inputClass}
                >
                  <option value="">Semua jabatan</option>
                  {options.jabatan.map((jabatan) => <option key={jabatan}>{jabatan}</option>)}
                </select>
                <select
                  value={bagianFilter}
                  onChange={(event) => {
                    setBagianFilter(event.target.value);
                    setPage(0);
                  }}
                  aria-label="Filter bagian"
                  className={inputClass}
                >
                  <option value="">Semua bagian</option>
                  {options.bagian.map((bagian) => <option key={bagian}>{bagian}</option>)}
                </select>
              </div>

              {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
              {notice && <p role="status" className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}

              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="bg-slate-100 text-slate-600">
                    <tr>
                      <th className="p-3 font-semibold">ID</th>
                      <th className="p-3 font-semibold">Nama Pengurus</th>
                      <th className="p-3 font-semibold">NIK</th>
                      <th className="p-3 font-semibold">Jabatan / Bagian</th>
                      <th className="p-3 font-semibold">No. HP</th>
                      <th className="p-3 font-semibold">Status</th>
                      <th className="p-3 font-semibold">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recordsLoading ? (
                      <tr><td colSpan={7} className="p-8 text-center text-slate-500">Memuat data pengurus...</td></tr>
                    ) : rows.length === 0 ? (
                      <tr><td colSpan={7} className="p-8 text-center text-slate-500">Tidak ada data pengurus yang sesuai.</td></tr>
                    ) : rows.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50">
                        <td className="whitespace-nowrap p-3 font-medium text-emerald-800">{record.kode_pengurus}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            {record.fotoUrl ? (
                              <Image
                                src={record.fotoUrl}
                                alt={`Foto ${record.nama_lengkap}`}
                                width={40}
                                height={40}
                                unoptimized
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-800">
                                {record.nama_lengkap.charAt(0).toUpperCase()}
                              </span>
                            )}
                            <span className="font-medium text-slate-900">{record.nama_lengkap}</span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap p-3">{record.nik}</td>
                        <td className="p-3">
                          <span className="block font-medium text-slate-800">{record.jabatan}</span>
                          <span className="text-xs text-slate-500">{record.bagian}</span>
                        </td>
                        <td className="whitespace-nowrap p-3">{record.nomor_hp}</td>
                        <td className="p-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${record.status === "Aktif" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-3 whitespace-nowrap">
                            <button type="button" onClick={() => setDetails(record)} className="font-medium text-slate-600 hover:text-slate-900">Detail</button>
                            <button type="button" onClick={() => openEditForm(record)} className="font-medium text-blue-700 hover:text-blue-900">Edit</button>
                            <button type="button" onClick={() => void handleDelete(record)} className="font-medium text-red-700 hover:text-red-900">Hapus</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
                <span>
                  {total === 0 ? "0 data" : `${page * PAGE_SIZE + 1}-${Math.min((page + 1) * PAGE_SIZE, total)} dari ${total} data`}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.max(0, current - 1))}
                    disabled={page === 0 || recordsLoading}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Sebelumnya
                  </button>
                  <span>Halaman {page + 1} / {totalPages}</span>
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
                    disabled={page >= totalPages - 1 || recordsLoading}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Berikutnya
                  </button>
                </div>
              </div>
            </section>
          </>
        )}
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 p-4">
          <section role="dialog" aria-modal="true" aria-labelledby="pengurus-form-title" className="mx-auto my-6 max-w-4xl rounded-xl bg-white p-5 shadow-xl sm:p-7">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 id="pengurus-form-title" className="text-xl font-bold text-slate-900">
                  {editing ? "Edit Data Pengurus" : "Tambah Pengurus"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">Kolom bertanda * wajib diisi.</p>
              </div>
              <button type="button" onClick={() => setFormOpen(false)} aria-label="Tutup formulir" className="rounded-lg px-2 py-1 text-xl text-slate-500 hover:bg-slate-100">×</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Nama lengkap *">
                  <input required maxLength={150} value={form.nama_lengkap} onChange={(event) => setForm({ ...form, nama_lengkap: event.target.value })} className={inputClass} />
                </Field>
                <Field label="NIK *">
                  <input required inputMode="numeric" pattern="[0-9]{16}" maxLength={16} value={form.nik} onChange={(event) => setForm({ ...form, nik: event.target.value.replace(/\D/g, "").slice(0, 16) })} className={inputClass} />
                </Field>
                <Field label="Jenis kelamin *">
                  <select required value={form.jenis_kelamin} onChange={(event) => setForm({ ...form, jenis_kelamin: event.target.value as PengurusForm["jenis_kelamin"] })} className={inputClass}>
                    <option>Laki-laki</option><option>Perempuan</option>
                  </select>
                </Field>
                <Field label="Tempat lahir *">
                  <input required maxLength={100} value={form.tempat_lahir} onChange={(event) => setForm({ ...form, tempat_lahir: event.target.value })} className={inputClass} />
                </Field>
                <Field label="Tanggal lahir *">
                  <input required type="date" value={form.tanggal_lahir} onChange={(event) => setForm({ ...form, tanggal_lahir: event.target.value })} className={inputClass} />
                </Field>
                <Field label="Nomor HP *">
                  <input required type="tel" maxLength={18} value={form.nomor_hp} onChange={(event) => setForm({ ...form, nomor_hp: event.target.value })} className={inputClass} />
                </Field>
                <Field label="Jabatan *">
                  <input required maxLength={100} value={form.jabatan} onChange={(event) => setForm({ ...form, jabatan: event.target.value })} className={inputClass} />
                </Field>
                <Field label="Bagian *">
                  <input required maxLength={100} value={form.bagian} onChange={(event) => setForm({ ...form, bagian: event.target.value })} className={inputClass} />
                </Field>
                <Field label="Mulai bertugas *">
                  <input required type="date" value={form.tanggal_mulai} onChange={(event) => setForm({ ...form, tanggal_mulai: event.target.value })} className={inputClass} />
                </Field>
                <Field label="Status *">
                  <select required value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as PengurusForm["status"] })} className={inputClass}>
                    <option>Aktif</option><option>Nonaktif</option>
                  </select>
                </Field>
                <Field label="Foto profil (JPG, PNG, WebP; maks. 3 MB)">
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setPhoto(event.target.files?.[0] ?? null)} className={`${inputClass} file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-medium`} />
                </Field>
                <div className="sm:col-span-2 lg:col-span-3">
                  <Field label="Alamat *">
                    <textarea required maxLength={500} rows={3} value={form.alamat} onChange={(event) => setForm({ ...form, alamat: event.target.value })} className={inputClass} />
                  </Field>
                </div>
              </div>
              {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setFormOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Batal</button>
                <button type="submit" disabled={formLoading} className="rounded-lg bg-emerald-700 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">
                  {formLoading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {details && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setDetails(null);
          }}
        >
          <section role="dialog" aria-modal="true" aria-labelledby="pengurus-detail-title" className="mx-auto my-10 max-w-xl rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-emerald-700">{details.kode_pengurus}</p>
                <h2 id="pengurus-detail-title" className="mt-1 text-2xl font-bold text-slate-900">{details.nama_lengkap}</h2>
              </div>
              <button type="button" onClick={() => setDetails(null)} aria-label="Tutup detail" className="rounded-lg px-2 py-1 text-xl text-slate-500 hover:bg-slate-100">×</button>
            </div>
            {details.fotoUrl && (
              <Image src={details.fotoUrl} alt={`Foto ${details.nama_lengkap}`} width={96} height={96} unoptimized className="mt-5 h-24 w-24 rounded-full object-cover" />
            )}
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                ["NIK", details.nik],
                ["Jenis kelamin", details.jenis_kelamin],
                ["Tempat, tanggal lahir", `${details.tempat_lahir}, ${details.tanggal_lahir}`],
                ["Nomor HP", details.nomor_hp],
                ["Jabatan", details.jabatan],
                ["Bagian", details.bagian],
                ["Mulai bertugas", details.tanggal_mulai],
                ["Status", details.status],
                ["Alamat", details.alamat],
              ].map(([label, value]) => (
                <div key={label} className={label === "Alamat" ? "sm:col-span-2" : ""}>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
                  <dd className="mt-1 break-words text-sm text-slate-900">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setDetails(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Tutup
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
} 