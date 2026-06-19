export default function StatCard({
  title,
  value
}) {
  return (
    <div className="bg-slate-800 p-5 rounded-xl">
      <h3 className="text-gray-400">
        {title}
      </h3>

      <h2 className="text-2xl font-bold mt-2">
        {value}
      </h2>
    </div>
  );
}