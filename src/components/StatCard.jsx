export default function StatCard({ title, value }) {
  return (
    <div
      className="p-5 rounded-xl"
      style={{ background: "var(--bg-surface-2)" }}
    >
      <h3 style={{ color: "var(--text-secondary)" }}>{title}</h3>

      <h2 className="text-2xl font-bold mt-2">{value}</h2>
    </div>
  );
}
