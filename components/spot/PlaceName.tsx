"use client";

import { useI18n } from "@/components/i18n/LocaleProvider";
import { displayPlaceName } from "@/lib/place-name";

type Props = {
  name: string;
  as?: "h2" | "p" | "span";
  className?: string;
  secondaryClassName?: string;
};

export default function PlaceName({
  name,
  as: Tag = "p",
  className,
  secondaryClassName = "mt-0.5 text-sm font-normal text-slate-500",
}: Props) {
  const { locale } = useI18n();
  const { primary, secondary } = displayPlaceName(name, locale);

  return (
    <Tag className={className}>
      {primary}
      {secondary ? <span className={`block ${secondaryClassName}`}>{secondary}</span> : null}
    </Tag>
  );
}
