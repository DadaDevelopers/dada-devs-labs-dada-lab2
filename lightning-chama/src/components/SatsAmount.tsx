import { formatBtcFromSats, formatKesFromSats, formatSats } from '@/lib/currency';

type SatsAmountProps = {
  sats: number;
  exchangeRate?: number | null;
  loadingRate?: boolean;
  align?: 'left' | 'right' | 'center';
  primaryClassName?: string;
  detailClassName?: string;
  className?: string;
};

const SatsAmount = ({
  sats,
  exchangeRate,
  loadingRate = false,
  align = 'left',
  primaryClassName = 'font-semibold text-sm text-gray-900',
  detailClassName = 'text-xs text-gray-500',
  className = '',
}: SatsAmountProps) => {
  const alignClass = {
    left: 'text-left',
    right: 'text-right',
    center: 'text-center',
  }[align];

  return (
    <div className={`${alignClass} ${className}`}>
      <p className={primaryClassName}>{formatSats(sats)} sats</p>
      <p className={detailClassName}>{loadingRate && !exchangeRate ? 'Loading rate...' : formatKesFromSats(sats, exchangeRate)}</p>
      <p className={detailClassName}>{formatBtcFromSats(sats)}</p>
    </div>
  );
};

export default SatsAmount;
