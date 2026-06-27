import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "lime" | "blue" | "dark" | "outline-white";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  withArrow?: boolean;
};

export function Button({ variant = "lime", withArrow = false, className, children, ...props }: ButtonProps) {
  const classes = ["btn", `btn-${variant}`, className].filter(Boolean).join(" ");
  return (
    <button className={classes} {...props}>
      {children}
      {withArrow && <span className="btn-icon">&#8599;</span>}
    </button>
  );
}

