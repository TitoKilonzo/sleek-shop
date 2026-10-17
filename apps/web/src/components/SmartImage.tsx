import { ImageOff } from 'lucide-react';
import { useEffect, useState, type ImgHTMLAttributes } from 'react';

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & { src: string; fallback?: string; alt: string };

/** Loads the local photo first, then the original source, then shows a clean placeholder instead of a broken image. */
export function SmartImage({ src, fallback, alt, className, ...rest }: Props) {
  const [stage, setStage] = useState(0);
  useEffect(() => setStage(0), [src, fallback]);
  const current = stage === 0 ? src : stage === 1 ? fallback : undefined;
  if (!current) return <span className={`image-placeholder ${className ?? ''}`} role="img" aria-label={alt}><ImageOff size={26} /></span>;
  return <img {...rest} className={className} src={current} alt={alt} onError={() => setStage((value) => (value === 0 && fallback && fallback !== src ? 1 : 2))} />;
}
