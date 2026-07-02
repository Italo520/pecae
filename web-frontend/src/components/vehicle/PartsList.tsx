interface PartsListProps {
  parts: string[];
}

export function PartsList({ parts }: PartsListProps) {
  if (!parts || parts.length === 0) return null;

  return (
    <div className="mt-8 bg-surface p-6 rounded-3xl border border-border backdrop-blur-md">
      <h2 className="text-xl font-bold font-display mb-4 text-foreground">Peças Disponíveis</h2>
      <div className="flex flex-wrap gap-2">
        {parts.map((part, index) => (
          <span 
            key={index} 
            className="px-4 py-1.5 bg-background border border-border text-foreground rounded-full text-sm font-medium"
          >
            {part}
          </span>
        ))}
      </div>
    </div>
  );
}
