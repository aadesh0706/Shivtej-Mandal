"use client";

import { useEffect, useState, useCallback, FormEvent } from "react";
import { useRouter } from "next/navigation";

interface Donation {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  city?: string;
  amount: number;
  status: string;
  paymentMethod: string;
  receiptNumber?: string;
  createdAt: string;
}

interface Stats {
  totalAmount: number;
  totalDonors: number;
  goalAmount: number;
  today: { total: number; count: number };
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [showManualForm, setShowManualForm] = useState(false);

  const pageSize = 20;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, donationsRes] = await Promise.all([
        fetch("/api/admin/stats", { cache: "no-store" }),
        fetch(
          `/api/admin/donations?page=${page}&pageSize=${pageSize}` +
            (statusFilter ? `&status=${statusFilter}` : "") +
            (search ? `&search=${encodeURIComponent(search)}` : ""),
          { cache: "no-store" }
        ),
      ]);

      if (statsRes.status === 401 || donationsRes.status === 401) {
        router.push("/admin");
        return;
      }

      const statsData = await statsRes.json();
      const donationsData = await donationsRes.json();

      setStats(statsData);
      setDonations(donationsData.donations ?? []);
      setTotal(donationsData.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <main className="min-h-screen bg-cream-100">
      <header className="bg-maroon-900 text-cream-50 px-6 py-4 flex items-center justify-between">
        <h1 className="font-display text-xl text-gold-300">Vargani Admin</h1>
        <button
          onClick={handleLogout}
          className="text-sm rounded-full border border-gold-500/50 px-4 py-1.5 hover:bg-maroon-800 transition-colors"
        >
          Log out
        </button>
      </header>

      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8">
        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total collected" value={`₹${(stats?.totalAmount ?? 0).toLocaleString("en-IN")}`} />
          <StatCard label="Donors" value={String(stats?.totalDonors ?? 0)} />
          <StatCard label="Today" value={`₹${(stats?.today.total ?? 0).toLocaleString("en-IN")} (${stats?.today.count ?? 0})`} />
          <StatCard
            label="Goal"
            value={`${stats && stats.goalAmount > 0 ? Math.round((stats.totalAmount / stats.goalAmount) * 100) : 0}%`}
          />
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Search name, phone, or receipt no."
            className="flex-1 min-w-[220px] rounded-lg border border-ink/15 px-4 py-2 outline-none focus:border-gold-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setPage(1);
              setStatusFilter(e.target.value);
            }}
            className="rounded-lg border border-ink/15 px-3 py-2 outline-none focus:border-gold-500"
          >
            <option value="">All statuses</option>
            <option value="paid">Paid</option>
            <option value="created">Created (unpaid)</option>
            <option value="failed">Failed</option>
          </select>
          <a
            href="/api/admin/donations/export"
            className="rounded-lg bg-maroon-700 text-cream-50 px-4 py-2 text-sm font-medium hover:bg-maroon-800 transition-colors"
          >
            Export CSV
          </a>
          <button
            onClick={() => setShowManualForm((s) => !s)}
            className="rounded-lg border border-maroon-700 text-maroon-700 px-4 py-2 text-sm font-medium hover:bg-maroon-50 transition-colors"
          >
            {showManualForm ? "Close" : "+ Add manual donation"}
          </button>
        </div>

        {showManualForm && (
          <ManualDonationForm
            onDone={() => {
              setShowManualForm(false);
              loadData();
            }}
          />
        )}

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-ink/10 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-maroon-50 text-left text-ink/70">
                <th className="px-4 py-3 font-semibold">Receipt</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">City</th>
                <th className="px-4 py-3 font-semibold text-right">Amount</th>
                <th className="px-4 py-3 font-semibold">Method</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-ink/50">
                    Loading…
                  </td>
                </tr>
              ) : donations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-ink/50">
                    No donations found.
                  </td>
                </tr>
              ) : (
                donations.map((d) => (
                  <tr key={d._id} className="border-t border-ink/5">
                    <td className="px-4 py-3 font-mono text-xs">{d.receiptNumber ?? "-"}</td>
                    <td className="px-4 py-3">{d.name}</td>
                    <td className="px-4 py-3">{d.phone}</td>
                    <td className="px-4 py-3">{d.city ?? "-"}</td>
                    <td className="px-4 py-3 text-right font-medium">
                      ₹{d.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3">
                      {d.paymentMethod === "razorpay" ? "Razorpay" : "Manual/UPI"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={d.status} />
                    </td>
                    <td className="px-4 py-3 text-ink/60">
                      {new Date(d.createdAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 text-sm text-ink/60">
          <span>
            Page {page} of {totalPages} · {total} total
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-ink/15 px-3 py-1.5 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-ink/15 px-3 py-1.5 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gold-300/60 bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-ink/50 mb-1">{label}</p>
      <p className="font-number text-2xl font-semibold text-maroon-700">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid: "bg-peacock-500/10 text-peacock-700",
    created: "bg-gold-500/10 text-gold-700",
    failed: "bg-maroon-500/10 text-maroon-700",
    pending_manual: "bg-saffron-500/10 text-saffron-600",
  };
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${styles[status] ?? ""}`}>
      {status}
    </span>
  );
}

function ManualDonationForm({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, amount: Number(amount), city: city || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to save");
        return;
      }
      onDone();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-4 grid grid-cols-1 sm:grid-cols-5 gap-3 rounded-xl border border-gold-300/60 bg-white p-4"
    >
      <input
        required
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="rounded-lg border border-ink/15 px-3 py-2 outline-none focus:border-gold-500"
      />
      <input
        required
        placeholder="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
        className="rounded-lg border border-ink/15 px-3 py-2 outline-none focus:border-gold-500"
      />
      <input
        required
        type="number"
        min={1}
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="rounded-lg border border-ink/15 px-3 py-2 outline-none focus:border-gold-500"
      />
      <input
        placeholder="City (optional)"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        className="rounded-lg border border-ink/15 px-3 py-2 outline-none focus:border-gold-500"
      />
      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-maroon-700 text-cream-50 px-3 py-2 text-sm font-medium hover:bg-maroon-800 disabled:opacity-60"
      >
        {submitting ? "Saving…" : "Save donation"}
      </button>
      {error && <p className="sm:col-span-5 text-sm text-maroon-700">{error}</p>}
      <p className="sm:col-span-5 text-xs text-ink/50">
        Use this only for donations already received in person, by cash, or via a direct UPI
        transfer you&apos;ve personally confirmed — it&apos;s recorded as paid immediately.
      </p>
    </form>
  );
}
