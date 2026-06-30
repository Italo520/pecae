interface PartsListProps {
  parts: string[];
}

export function PartsList({ parts }: PartsListProps) {
  if (!parts || parts.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Peças Disponíveis</h2>
      <div className="flex flex-wrap gap-2">
        {parts.map((part, index) => (
          <span 
            key={index} 
            className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium border border-gray-200"
          >
            {part}
          </span>
        ))}
      </div>
    </div>
  );
}
