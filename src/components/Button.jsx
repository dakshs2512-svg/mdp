import React from "react";
import { Link } from "react-router-dom";

/**
 * Reusable Button component supporting button and router link
 */
export default function Button({
  children,
  to,
  href,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
  type = "button",
  icon: Icon,
  iconPosition = "left",
  ...props
}) {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0B1020] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none select-none";

  const sizeStyles = {
    sm: "text-xs px-3.5 py-1.5 gap-1.5",
    md: "text-sm px-5 py-2.5 gap-2",
    lg: "text-base px-7 py-3.5 gap-2.5 font-semibold",
  };

  const variantStyles = {
    primary: "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-glow-violet focus:ring-violet-500 border border-violet-400/30",
    cyan: "bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-slate-950 font-semibold shadow-glow-cyan focus:ring-cyan-400 border border-cyan-300/40",
    secondary: "bg-[#121A2B] hover:bg-[#1A253C] text-slate-200 border border-slate-700/80 hover:border-slate-600 focus:ring-slate-500 shadow-sm",
    outline: "bg-transparent hover:bg-slate-800/40 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 focus:ring-slate-400",
    ghost: "bg-transparent hover:bg-slate-800/50 text-slate-400 hover:text-slate-100 focus:ring-slate-400",
    danger: "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 focus:ring-red-400",
  };

  const combinedStyles = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

  const content = (
    <>
      {Icon && iconPosition === "left" && <Icon className={size === "sm" ? "w-3.5 h-3.5" : size === "lg" ? "w-5 h-5" : "w-4 h-4"} />}
      <span>{children}</span>
      {Icon && iconPosition === "right" && <Icon className={size === "sm" ? "w-3.5 h-3.5" : size === "lg" ? "w-5 h-5" : "w-4 h-4"} />}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={combinedStyles} {...props}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={combinedStyles} {...props}>
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedStyles}
      {...props}
    >
      {content}
    </button>
  );
}
