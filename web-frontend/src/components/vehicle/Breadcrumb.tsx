import Link from 'next/link';

interface BreadcrumbProps {
  brand: string;
  model: string;
  year: number;
}

export function Breadcrumb({ brand, model, year }: BreadcrumbProps) {
  return (
    <nav className="text-sm text-muted mb-4" aria-label="Breadcrumb">
      <ol className="list-none p-0 inline-flex">
        <li className="flex items-center">
          <Link href="/" className="hover:text-brand transition-colors">Home</Link>
          <span className="mx-2">/</span>
        </li>
        <li className="flex items-center">
          <Link href={`/busca?brand=${brand}`} className="hover:text-brand transition-colors">{brand}</Link>
          <span className="mx-2">/</span>
        </li>
        <li className="flex items-center">
          <Link href={`/busca?brand=${brand}&model=${model}`} className="hover:text-brand transition-colors">{model}</Link>
          <span className="mx-2">/</span>
        </li>
        <li className="flex items-center">
          <span className="text-foreground" aria-current="page">{year}</span>
        </li>
      </ol>
    </nav>
  );
}
