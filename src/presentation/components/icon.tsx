interface IconProps {
  name: string;
  className?: string;
  ariaLabel?: string;
}

export function Icon({ name, className = "", ariaLabel }: IconProps) {
  return (
    <i
      className={`material-icons ${className}`}
      aria-label={ariaLabel}
      aria-hidden={!ariaLabel ? "true" : undefined}
    >
      {name}
    </i>
  );
}
