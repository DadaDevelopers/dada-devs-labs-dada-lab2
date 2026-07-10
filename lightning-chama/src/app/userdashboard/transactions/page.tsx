"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight, Filter, RefreshCw, Wallet } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import SatsAmount from "@/components/SatsAmount";
import { useBitcoinKesRate } from "@/hooks/useBitcoinKesRate";

type WalletSummary = {
  walletReference: string;
  walletType: string;
  walletPurpose?: string;
  ownerReference?: string;
  balanceSats?: number;
  lightning?: {
    name?: string;
  };
};

type Transaction = {
  transactionReference: string;
  wallet?: WalletSummary;
  type: "CREDIT" | "DEBIT" | string;
  source?: string | null;
  category?: string | null;
  amountSats: number;
  feeSats?: number | null;
  externalRef?: string | null;
  initiatedBy?: string | null;
  counterpartyUser?: string | null;
  rotationIndex?: number | null;
  memo?: string | null;
  occurredAt?: string;
  createdAt?: string;
};

type TransactionsResponse = {
  content: Transaction[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

type ApiErrorResponse = {
  message?: string;
  error?: string;
};

const PAGE_SIZE = 20;
const AMOUNT_OPERATORS = [
  { value: "lt", label: "Less than" },
  { value: "gt", label: "Greater than" },
  { value: "gte", label: "At least" },
  { value: "lte", label: "At most" },
] as const;
const MEMO_OPERATORS = [
  { value: "contains", label: "Contains" },
  { value: "startsWith", label: "Starts with" },
  { value: "endsWith", label: "Ends with" },
] as const;

const extractError = (data: ApiErrorResponse | null, fallback: string) => {
  if (!data) return fallback;
  return data.message || data.error || fallback;
};

const formatDateTime = (value?: string) => {
  if (!value) return "—";
  return new Date(value).toLocaleString();
};

export default function TransactionsPage() {
  const { exchangeRate, loadingRate } = useBitcoinKesRate();
  const [wallets, setWallets] = useState<WalletSummary[]>([]);
  const [loadingWallets, setLoadingWallets] = useState(true);
  const [walletError, setWalletError] = useState("");

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [transactionError, setTransactionError] = useState("");

  const [scope, setScope] = useState<"USER" | "WALLET">("USER");
  const [selectedWalletRef, setSelectedWalletRef] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "CREDIT" | "DEBIT">("ALL");
  const [amountOperator, setAmountOperator] = useState<(typeof AMOUNT_OPERATORS)[number]["value"]>("lte");
  const [amountValue, setAmountValue] = useState("");
  const [memoOperator, setMemoOperator] = useState<(typeof MEMO_OPERATORS)[number]["value"]>("contains");
  const [memoValue, setMemoValue] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const selectedWallet = useMemo(
    () => wallets.find((wallet) => wallet.walletReference === selectedWalletRef),
    [selectedWalletRef, wallets]
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const walletRef = params.get("walletRef");
    if (walletRef) {
      setScope("WALLET");
      setSelectedWalletRef(walletRef);
    }
  }, []);

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        setLoadingWallets(true);
        setWalletError("");
        const token = localStorage.getItem("token");
        const ownerRef = localStorage.getItem("userReference");

        if (!token || !ownerRef) {
          setWalletError("Not authenticated");
          return;
        }

        const response = await fetch(
          `https://dada-devs-labs-dada-lab2-chamavault.onrender.com/wallets/${ownerRef}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          setWalletError(extractError(data, "Unable to load wallets."));
          return;
        }

        setWallets(data.content || []);
      } catch {
        setWalletError("Failed to connect to server.");
      } finally {
        setLoadingWallets(false);
      }
    };

    fetchWallets();
  }, []);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoadingTransactions(true);
        setTransactionError("");

        const token = localStorage.getItem("token");
        const userReference = localStorage.getItem("userReference");

        if (!token || !userReference) {
          setTransactionError("Not authenticated");
          return;
        }

        const params = new URLSearchParams({
          page: page.toString(),
          size: PAGE_SIZE.toString(),
        });

        if (typeFilter !== "ALL") params.set("type", typeFilter);
        if (amountValue) params.set(`amountSats.${amountOperator}`, amountValue);
        if (memoValue.trim()) params.set(`memo.${memoOperator}`, memoValue.trim());

        if (scope === "WALLET") {
          if (!selectedWalletRef) {
            setTransactions([]);
            setTotalPages(0);
            setTotalElements(0);
            return;
          }
          params.set("wallet.walletReference", selectedWalletRef);
        } else {
          params.set("wallet.ownerReference", userReference);
        }

        const response = await fetch(
          `https://dada-devs-labs-dada-lab2-chamavault.onrender.com/transactions/search?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json().catch(() => null) as TransactionsResponse | ApiErrorResponse | null;

        if (!response.ok) {
          setTransactionError(extractError(data as ApiErrorResponse | null, "Unable to load transactions."));
          return;
        }

        const result = data as TransactionsResponse;
        setTransactions(result.content || []);
        setTotalPages(result.totalPages || 0);
        setTotalElements(result.totalElements || 0);
      } catch {
        setTransactionError("Failed to connect to server.");
      } finally {
        setLoadingTransactions(false);
      }
    };

    fetchTransactions();
  }, [amountOperator, amountValue, memoOperator, memoValue, page, scope, selectedWalletRef, typeFilter]);

  const resetPageAndSetScope = (nextScope: "USER" | "WALLET") => {
    setScope(nextScope);
    setPage(0);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar isAuthenticated={true} userName="" />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mt-14 mb-6 flex items-center gap-4">
          <Link
            href="/userdashboard"
            className="p-2 bg-white rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Transactions</h1>
            <p className="text-sm text-gray-500">
              View your user transactions or filter by a specific wallet.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-semibold text-gray-900">Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="transactionScope" className="block text-sm font-medium text-gray-700 mb-1">
                Scope
              </label>
              <select
                id="transactionScope"
                value={scope}
                onChange={(event) => resetPageAndSetScope(event.target.value as "USER" | "WALLET")}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="USER">All my wallets</option>
                <option value="WALLET">Specific wallet</option>
              </select>
            </div>

            <div>
              <label htmlFor="transactionWallet" className="block text-sm font-medium text-gray-700 mb-1">
                Wallet
              </label>
              <select
                id="transactionWallet"
                value={selectedWalletRef}
                onChange={(event) => {
                  setSelectedWalletRef(event.target.value);
                  setPage(0);
                }}
                disabled={scope === "USER" || loadingWallets}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:bg-gray-50 disabled:text-gray-500"
              >
                <option value="">
                  {loadingWallets ? "Loading wallets..." : walletError || "Select wallet"}
                </option>
                {wallets.map((wallet) => (
                  <option key={wallet.walletReference} value={wallet.walletReference}>
                    {wallet.lightning?.name || wallet.walletPurpose || wallet.walletType} - {wallet.walletType}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="transactionType" className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                id="transactionType"
                value={typeFilter}
                onChange={(event) => {
                  setTypeFilter(event.target.value as "ALL" | "CREDIT" | "DEBIT");
                  setPage(0);
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="ALL">All</option>
                <option value="CREDIT">Credit</option>
                <option value="DEBIT">Debit</option>
              </select>
            </div>

            <div>
              <label htmlFor="transactionAmountOperator" className="block text-sm font-medium text-gray-700 mb-1">
                Amount filter
              </label>
              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2">
                <select
                  id="transactionAmountOperator"
                  value={amountOperator}
                  onChange={(event) => {
                    setAmountOperator(event.target.value as (typeof AMOUNT_OPERATORS)[number]["value"]);
                    setPage(0);
                  }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  {AMOUNT_OPERATORS.map((operator) => (
                    <option key={operator.value} value={operator.value}>
                      {operator.label}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={amountValue}
                  onChange={(event) => {
                    setAmountValue(event.target.value);
                    setPage(0);
                  }}
                  placeholder="500"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div>
              <label htmlFor="transactionMemoOperator" className="block text-sm font-medium text-gray-700 mb-1">
                Memo filter
              </label>
              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2">
                <select
                  id="transactionMemoOperator"
                  value={memoOperator}
                  onChange={(event) => {
                    setMemoOperator(event.target.value as (typeof MEMO_OPERATORS)[number]["value"]);
                    setPage(0);
                  }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  {MEMO_OPERATORS.map((operator) => (
                    <option key={operator.value} value={operator.value}>
                      {operator.label}
                    </option>
                  ))}
                </select>
                <input
                  id="transactionMemoValue"
                  type="text"
                  value={memoValue}
                  onChange={(event) => {
                    setMemoValue(event.target.value);
                    setPage(0);
                  }}
                  placeholder="rent"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>
          </div>

          {scope === "WALLET" && selectedWallet && (
            <div className="mt-4 rounded-lg bg-gray-50 px-3 py-2">
              <p className="text-xs font-medium text-gray-500 mb-1">Selected wallet balance</p>
              <SatsAmount
                sats={selectedWallet.balanceSats || 0}
                exchangeRate={exchangeRate}
                loadingRate={loadingRate}
                primaryClassName="font-semibold text-sm text-gray-700"
              />
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Transaction History</h2>
              <p className="text-xs text-gray-500">
                {loadingTransactions ? "Loading..." : `${totalElements.toLocaleString()} transaction${totalElements === 1 ? "" : "s"}`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPage(0)}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {transactionError && (
            <p className="m-4 rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-700">
              {transactionError}
            </p>
          )}

          {loadingTransactions ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-20 rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : !transactionError && transactions.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Wallet className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No transactions found for these filters.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {transactions.map((transaction) => {
                const isCredit = transaction.type === "CREDIT";
                return (
                  <div key={transaction.transactionReference} className="p-4 hover:bg-gray-50 transition">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                            isCredit ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                          }`}>
                            {transaction.type}
                          </span>
                          {transaction.source && (
                            <span className="text-xs text-gray-500">{transaction.source}</span>
                          )}
                        </div>
                        <p className="font-semibold text-gray-900 truncate">
                          {transaction.memo || transaction.category || "Transaction"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {transaction.wallet?.lightning?.name || transaction.wallet?.walletPurpose || transaction.wallet?.walletType || "Wallet"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDateTime(transaction.occurredAt || transaction.createdAt)}
                        </p>
                        <p className="text-[11px] text-gray-400 break-all mt-1">
                          Ref: {transaction.transactionReference}
                        </p>
                      </div>

                      <div className="shrink-0">
                        <SatsAmount
                          sats={transaction.amountSats}
                          exchangeRate={exchangeRate}
                          loadingRate={loadingRate}
                          align="right"
                          primaryClassName={`font-bold text-sm ${isCredit ? "text-emerald-700" : "text-gray-900"}`}
                        />
                        {typeof transaction.feeSats === "number" && (
                          <p className="text-xs text-gray-400 text-right mt-1">
                            Fee: {transaction.feeSats.toLocaleString()} sats
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(0, current - 1))}
              disabled={page === 0 || loadingTransactions}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <span className="text-sm text-gray-500">
              Page {totalPages === 0 ? 0 : page + 1} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((current) => current + 1)}
              disabled={page + 1 >= totalPages || loadingTransactions}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
