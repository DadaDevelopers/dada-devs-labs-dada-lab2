// components/BalanceHero.tsx
type nextContribution = {
  date: string;
  amount: string;
}

type BalanceHeroProps = {
  btcAmount: string;
  kshAmount: string;
  nextContribution?: nextContribution;
  className?: string;
};

const BalanceHero = ({
  btcAmount,
  kshAmount,
  nextContribution,
  className = "",
}: BalanceHeroProps) => {
  return (
    <div
      className={`mt-20 bg-linear-to-l from-emerald-500 to-emerald-600  text-center rounded-2xl p-12 md:p-14 shadow-lg ${className}`}>
      <p className="text-emerald-50 text-sm md:text-base mb-2">
        Wallet Balance
      </p>

      <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-bold mb-1">
        {btcAmount} BTC
      </h1>

      <p className="text-emerald-50 text-lg md:text-xl">
        Kshs {kshAmount}
      </p>
      {nextContribution && (
        <div className="mt-4 border-t border-emerald-400 pt-4">
          <p className="text-emerald-50 text-sm">
            Next Contribution
          </p>
          <p className="text-white font-semibold">
            {nextContribution.amount}
          </p>
          <p className="text-emerald-100 text-xs">
            Due {nextContribution.date}
          </p>
        </div>
      )}
    </div>
  );
};

export default BalanceHero;
