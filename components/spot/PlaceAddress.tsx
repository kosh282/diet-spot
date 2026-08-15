"use client";

import { useI18n } from "@/components/i18n/LocaleProvider";
import { displayAddress } from "@/lib/place-name";

type Props = {
  address: string;
  className?: string;
  secondaryClassName?: string;
};

export default function PlaceAddress({
  address,
  className,
  secondaryClassName = "mt-0.5 block text-xs font-normal text-slate-500",
}: Props) {
  const { locale } = useI18n();
  const { primary, secondary } = displayAddress(address, locale);

  return (
    <p className={className}>
      {primary}
      {secondary ? <span className={secondaryClassName}>{secondary}</span> : null}
    </p>
  );
}
