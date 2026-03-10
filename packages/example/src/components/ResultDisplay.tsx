"use client";

interface ResultDisplayProps {
  label: string;
  value: string | null | undefined;
  loading?: boolean;
  error?: string | null;
  mono?: boolean;
}

export function ResultDisplay({ label, value, loading, error, mono }: ResultDisplayProps) {
  return (
    <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
      <p className="text-xs font-medium text-zinc-400 mb-1">{label}</p>
      {loading ? (
        <div className="h-5 w-48 bg-zinc-700 rounded animate-pulse" />
      ) : error ? (
        <p className="text-red-400 text-sm">{error}</p>
      ) : value ? (
        <p className={`text-sm break-all ${mono ? "mono text-violet-300" : "text-white"}`}>{value}</p>
      ) : (
        <p className="text-zinc-500 text-sm italic">No result</p>
      )}
    </div>
  );
}
