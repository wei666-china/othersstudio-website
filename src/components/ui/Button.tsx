/**
 * Button — 全站统一按钮。
 *
 * 取代过去各页内联重复的 "px-7 py-3.5 bg-ink text-on-ink rounded-full ..." 样式。
 * 两种主形态：primary（深色实心）/ secondary（描边）；可作为 <Link>（传 href）或 <button>。
 * 动效统一走 motion language（ease-soft + 微位移），克制而精准。
 */

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium no-underline " +
  "transition-all duration-[var(--dur-base)] ease-[var(--ease-out-soft)] " +
  "hover:-translate-y-0.5 active:translate-y-0";

const variants: Record<Variant, string> = {
  primary:
    "bg-ink text-on-ink shadow-[0_6px_22px_var(--c-shadow)] hover:shadow-[0_10px_32px_var(--c-shadow-strong)]",
  secondary:
    "bg-transparent text-text border border-border-strong hover:border-ink hover:bg-surface",
};

const sizes: Record<Size, string> = {
  md: "px-6 py-3 text-sm",
  lg: "px-7 py-3.5 text-sm",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

type ButtonAsLink = CommonProps & { href: string } & Omit<
    ComponentProps<typeof Link>,
    "href" | "className" | "children"
  >;
type ButtonAsButton = CommonProps & { href?: undefined } & Omit<
    ComponentProps<"button">,
    "className" | "children"
  >;

export default function Button(props: ButtonAsLink | ButtonAsButton) {
  const { variant = "primary", size = "lg", className = "", children } = props;
  const cls = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  if (props.href !== undefined) {
    const { variant: _v, size: _s, className: _c, children: _ch, href, ...rest } =
      props as ButtonAsLink;
    return (
      <Link href={href} className={cls} {...rest}>
        {children}
      </Link>
    );
  }

  const { variant: _v, size: _s, className: _c, children: _ch, href: _h, ...rest } =
    props as ButtonAsButton;
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
