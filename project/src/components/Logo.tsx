interface LogoProps {
  size?: number;
  className?: string;
}

export function HourglassLogo({ size = 24, className = '' }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 2h12M6 22h12" />
      <path d="M6 2c0 4 3 6 6 8s6 4 6 8" fill="currentColor" fillOpacity="0.15" />
      <path d="M18 2c0 4-3 6-6 8s-6 4-6 8" />
    </svg>
  );
}
