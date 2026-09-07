"use client";
import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, Wallet } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBitcoinKesRate } from "@/hooks/useBitcoinKesRate";

const CONTRIBUTION_FREQUENCIES = [
  { label: "Daily", value: "DAILY", days: 1 },
  { label: "Weekly", value: "WEEKLY", days: 7 },
  { label: "Fortnightly", value: "FORTNIGHTLY", days: 14 },
  { label: "Monthly", value: "MONTHLY", days: 30 },
  { label: "Quarterly", value: "QUARTERLY", days: 90 },
  { label: "Yearly", value: "YEARLY", days: 365 },
];

export default function CreateChamaForm() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    contributionAmount: "",
    contributionFrequency: "",
    dueDate: "",
    purpose: "",
    targetAmount: "",
    membersRequired: "",
    createGroupWallet: false,
    poolingContributionAmount: "",
    poolingFrequency: "MONTHLY",
    merryGoRoundEnabled: true,
    beneficiaryContributes: false,
    poolingRequiresApproval: true,
    poolingRequiredApprovals: "2",
    merryGoRoundRequiresApproval: true,
    merryGoRoundRequiredApprovals: "2",
  });

  const [step1Data, setStep1Data] = useState<{
    name: string;
    description: string;
    iconUrl: string;
    visibility: "PUBLIC" | "PRIVATE";
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const { exchangeRate, loadingRate, lastFetched } = useBitcoinKesRate();

  // 1 Bitcoin = 100,000,000 Satoshis
  const SATOSHIS_PER_BTC = 100000000;

  useEffect(() => {
    const saved = localStorage.getItem("createChamaStep1");
    if (saved) {
      const data = JSON.parse(saved);
      setStep1Data({
        ...data,
        visibility: data.visibility === "PRIVATE" ? "PRIVATE" : "PUBLIC",
      });
    }
  }, []);

  // Convert KES to Satoshis
  const convertKesToSatoshis = (kesAmount: number): number => {
    if (!exchangeRate) return 0;
    const btcAmount = kesAmount / exchangeRate;
    return Math.round(btcAmount * SATOSHIS_PER_BTC);
  };

  // Convert KES to BTC
  const convertKesToBtc = (kesAmount: number): number => {
    if (!exchangeRate) return 0;
    return kesAmount / exchangeRate;
  };

  const selectedFrequency = CONTRIBUTION_FREQUENCIES.find(
    (f) => f.value === formData.contributionFrequency
  );

  const contributionSchedule = useMemo(() => {
    if (!formData.dueDate || !selectedFrequency) return null;

    const start = new Date(formData.dueDate);
    return Array.from({ length: 5 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i * selectedFrequency.days);
      return d.toDateString();
    });
  }, [formData.dueDate, selectedFrequency]);

  const isFormValid =
    Boolean(step1Data) &&
    formData.dueDate &&
    formData.membersRequired &&
    Number(formData.membersRequired) > 0 &&
    (formData.createGroupWallet || formData.merryGoRoundEnabled) &&
    (!formData.createGroupWallet || (
      Number(formData.poolingContributionAmount) > 0 &&
      Number(formData.targetAmount) > 0 &&
      Boolean(formData.poolingFrequency)
      && (!formData.poolingRequiresApproval || Number(formData.poolingRequiredApprovals) > 0)
    )) &&
    (!formData.merryGoRoundEnabled || (
      Number(formData.contributionAmount) > 0 &&
      Boolean(formData.contributionFrequency)
      && (!formData.merryGoRoundRequiresApproval || Number(formData.merryGoRoundRequiredApprovals) > 0)
    ));

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!isFormValid || !step1Data) return;

    const token = localStorage.getItem("token");
    const creatorId = localStorage.getItem("userReference");

    if (!token || !creatorId) {
      alert("You are not authenticated");
      return;
    }

    setLoading(true);

    // Convert KES to Satoshis for the API
    const contributionAmountInSatoshis = convertKesToSatoshis(
      Number(formData.contributionAmount)
    );
    const groupWalletTargetAmountSats = convertKesToSatoshis(
      Number(formData.targetAmount)
    );
    const poolingContributionAmountSats = convertKesToSatoshis(
      Number(formData.poolingContributionAmount)
    );

    const purpose = formData.createGroupWallet && formData.merryGoRoundEnabled
      ? "BOTH"
      : formData.createGroupWallet
        ? "POOLING"
        : "MERRY_GO_ROUND";

    const payload = {
      name: step1Data.name,
      description: step1Data.description,
      iconUrl: step1Data.iconUrl || "",
      visibility: step1Data.visibility,
      purpose,
      creatorId,
      maximumMembers: Number(formData.membersRequired),
      poolingConfig: formData.createGroupWallet
        ? {
            enable: true,
            contributionAmount: poolingContributionAmountSats,
            frequency: formData.poolingFrequency,
            targetAmount: groupWalletTargetAmountSats,
            requiresApproval: formData.poolingRequiresApproval,
            requiredApprovals: formData.poolingRequiresApproval ? Number(formData.poolingRequiredApprovals) : 0,
          }
        : { enable: false },
      merryGoRoundConfig: formData.merryGoRoundEnabled
        ? {
            enable: true,
            contributionAmount: contributionAmountInSatoshis,
            frequency: formData.contributionFrequency,
            beneficiaryContributes: formData.beneficiaryContributes,
            requiresApproval: formData.merryGoRoundRequiresApproval,
            requiredApprovals: formData.merryGoRoundRequiresApproval ? Number(formData.merryGoRoundRequiredApprovals) : 0,
          }
        : { enable: false },
    };

    try {
      const response = await fetch(
        "https://dada-devs-labs-dada-lab2-chamavault.onrender.com/chama",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to create Chama");
        return;
      }

      localStorage.removeItem("createChamaStep1");
      alert("Chama created successfully 🎉");
      router.push(`/userdashboard/contribute/${data.chamaReference}`);
    } catch {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Calculate converted values for display
  const satoshisValue = formData.contributionAmount
    ? convertKesToSatoshis(Number(formData.contributionAmount))
    : 0;
  const btcValue = formData.contributionAmount
    ? convertKesToBtc(Number(formData.contributionAmount))
    : 0;

  return (
    <div className="min-h-screen bg-white pt-20">
      <Navbar isAuthenticated={true} userName="" />

      <div className="w-full max-w-md flex p-3 items-center">
        <Link
          href="/userdashboard/chama/createchama"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft />
          <span className="text-sm">Go Back</span>
        </Link>
      </div>

      <main className="px-4 py-6 max-w-md mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Create a Chama
          </h1>
          <p className="text-gray-600 text-sm">
            Set up your group and start saving together
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-center text-base font-semibold text-gray-900 mb-4">
            Contribution Rules
          </h2>

          <label className={`mb-5 flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition ${formData.merryGoRoundEnabled ? 'border-emerald-600 bg-emerald-50 ring-1 ring-emerald-600' : 'border-gray-200 hover:border-emerald-300'}`}>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-gray-900">Enable merry-go-round contributions</span>
              <span className="mt-1 block text-xs leading-5 text-gray-500">Members contribute toward a rotating beneficiary.</span>
            </span>
            <input type="checkbox" checked={formData.merryGoRoundEnabled} onChange={(event) => setFormData((previous) => ({ ...previous, merryGoRoundEnabled: event.target.checked }))} className="mt-2 h-5 w-5 accent-emerald-600" />
          </label>

          {/* Contribution Amount */}
          {formData.merryGoRoundEnabled && <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Merry-go-round Amount (KES)
            </label>
            <input
              type="number"
              name="contributionAmount"
              value={formData.contributionAmount}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-200 text-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#059669]"
            />
            
            {/* Display converted values */}
            {formData.contributionAmount && !loadingRate && (
              <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                <div>
                  <span className="font-medium">Satoshis:</span>{" "}
                  {satoshisValue.toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Bitcoin:</span>{" "}
                  {btcValue.toFixed(8)} BTC
                </div>
                {exchangeRate && (
                  <div className="mt-1 text-gray-500">
                    Exchange rate: 1 BTC ≈ {exchangeRate.toLocaleString()} KES
                    {lastFetched && (
                        <span className="block">
                            (Rate updated {Math.round((Date.now() - lastFetched) / 60000)} mins ago)
                        </span>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {loadingRate && (
              <div className="mt-2 text-xs text-gray-500">
                Loading exchange rate...
              </div>
            )}
          </div>}

          {/* Contribution Frequency (Dropdown) */}
          {formData.merryGoRoundEnabled && <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Merry-go-round Frequency
            </label>
            <select
              name="contributionFrequency"
              value={formData.contributionFrequency}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#059669]"
            >
              <option value="" disabled>
                Select frequency
              </option>
              {CONTRIBUTION_FREQUENCIES.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>}

          {formData.merryGoRoundEnabled && (
            <div className="mb-4 space-y-3 rounded-xl bg-gray-50 p-4">
              <label className="flex items-center gap-3 text-sm text-gray-700">
                <input type="checkbox" checked={formData.beneficiaryContributes} onChange={(event) => setFormData((previous) => ({ ...previous, beneficiaryContributes: event.target.checked }))} className="h-4 w-4 accent-emerald-600" />
                The current beneficiary also contributes during their cycle
              </label>
              <label className="flex items-center gap-3 text-sm text-gray-700">
                <input type="checkbox" checked={formData.merryGoRoundRequiresApproval} onChange={(event) => setFormData((previous) => ({ ...previous, merryGoRoundRequiresApproval: event.target.checked }))} className="h-4 w-4 accent-emerald-600" />
                Require approvals for merry-go-round operations
              </label>
              {formData.merryGoRoundRequiresApproval && <input type="number" min="1" name="merryGoRoundRequiredApprovals" value={formData.merryGoRoundRequiredApprovals} onChange={handleInputChange} aria-label="Required merry-go-round approvals" className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-600" />}
            </div>
          )}

          {/* Due Date (Date Picker) */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Due Date
            </label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#059669]"
            />
          </div>
        </div>

        {/* Saving Goals Section */}
        <div className="mb-6">
          <h2 className="text-center text-base font-semibold text-gray-900 mb-4">
            Saving Goals
          </h2>

          {/* Pooled group wallet */}
          <label className={`mb-5 flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition ${formData.createGroupWallet ? 'border-emerald-600 bg-emerald-50 ring-1 ring-emerald-600' : 'border-gray-200 hover:border-emerald-300'}`}>
            <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${formData.createGroupWallet ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
              <Wallet className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-gray-900">Create a pooled group wallet</span>
              <span className="mt-1 block text-xs leading-5 text-gray-500">Create a shared wallet for this Chama&apos;s contributions and savings goal.</span>
            </span>
            <input
              type="checkbox"
              checked={formData.createGroupWallet}
              onChange={(event) => setFormData((previous) => ({ ...previous, createGroupWallet: event.target.checked }))}
              className="mt-2 h-5 w-5 accent-emerald-600"
            />
          </label>

          {formData.createGroupWallet && (
            <div className="mb-5 space-y-4 rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">Pooling Contribution Amount (KES)</label>
                <input type="number" name="poolingContributionAmount" value={formData.poolingContributionAmount} onChange={handleInputChange} placeholder="Amount per member" className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#059669]" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">Pooling Frequency</label>
                <select name="poolingFrequency" value={formData.poolingFrequency} onChange={handleInputChange} className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#059669]">
                  {CONTRIBUTION_FREQUENCIES.map((frequency) => <option key={frequency.value} value={frequency.value}>{frequency.label}</option>)}
                </select>
              </div>
              <label className="flex items-center gap-3 text-sm text-gray-700">
                <input type="checkbox" checked={formData.poolingRequiresApproval} onChange={(event) => setFormData((previous) => ({ ...previous, poolingRequiresApproval: event.target.checked }))} className="h-4 w-4 accent-emerald-600" />
                Require approvals for pooled-wallet operations
              </label>
              {formData.poolingRequiresApproval && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900">Required approvals</label>
                  <input type="number" min="1" name="poolingRequiredApprovals" value={formData.poolingRequiredApprovals} onChange={handleInputChange} className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-600" />
                </div>
              )}
            </div>
          )}

          {/* Purpose of the Chama */}
          <div className="mb-4">
            <label htmlFor="purpose" className="block text-sm font-medium text-gray-900 mb-2">
              Purpose of the Chama
            </label>
            <input
              type="text"
              id="purpose"
              name="purpose"
              value={formData.purpose}
              onChange={handleInputChange}
              placeholder="What is the purpose of your Chama?"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent text-md text-gray-600"
            />
          </div>

          {/* Target Amount */}
          <div className="mb-4">
            <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-900 mb-2">
              Target Amount (KES)
            </label>
            <input
              type="number"
              id="targetAmount"
              name="targetAmount"
              value={formData.targetAmount}
              onChange={handleInputChange}
              placeholder="Enter amount"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent text-md text-gray-600"
            />
            
            {/* Display converted values for target amount */}
            {formData.targetAmount && !loadingRate && (
              <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                <div>
                  <span className="font-medium">Satoshis:</span>{" "}
                  {convertKesToSatoshis(Number(formData.targetAmount)).toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Bitcoin:</span>{" "}
                  {convertKesToBtc(Number(formData.targetAmount)).toFixed(8)} BTC
                </div>
              </div>
            )}
          </div>

          {/* Members Required */}
          <div className="mb-6">
            <label htmlFor="membersRequired" className="block text-sm font-medium text-gray-900 mb-2">
              Members Required
            </label>
            <input
              type="number"
              id="membersRequired"
              name="membersRequired"
              value={formData.membersRequired}
              onChange={handleInputChange}
              placeholder="max 200 people"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent text-md text-gray-600"
            />
          </div>
        </div>

        {/* Preview */}
        {isFormValid && contributionSchedule && (
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-gray-900">
                Chama Preview
              </h3>
              <p className="text-xs text-gray-500">
                Review your contribution setup
              </p>
            </div>

            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex justify-between">
                <span className="text-gray-500">Chama Name</span>
                <span className="font-medium">{step1Data?.name}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Visibility</span>
                <span className="font-medium capitalize">{step1Data?.visibility.toLowerCase()}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Group Wallet</span>
                <span className="font-medium">{formData.createGroupWallet ? 'Create pooled wallet' : 'Do not create'}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Contribution</span>
                <span className="font-medium">
                  KES {Number(formData.contributionAmount).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">In Satoshis</span>
                <span className="font-medium">
                  {satoshisValue.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Frequency</span>
                <span className="font-medium">
                  {formData.contributionFrequency}
                </span>
              </div>

              {formData.purpose && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Purpose</span>
                  <span className="font-medium">{formData.purpose}</span>
                </div>
              )}

              {formData.targetAmount && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Target Amount</span>
                  <span className="font-medium">
                    KES {Number(formData.targetAmount).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-4">
              <p className="text-xs font-medium text-gray-600 mb-2">
                Upcoming Contributions
              </p>

              <div className="space-y-1">
                {contributionSchedule.map((d, index) => (
                  <div
                    key={d}
                    className={`flex items-center justify-between rounded-md px-3 py-2 text-xs
                      ${index === 0 ? "bg-emerald-50 text-emerald-700" : "bg-gray-50 text-gray-700"}
                    `}
                  >
                    <span>{index === 0 ? "Next" : `#${index + 1}`}</span>
                    <span className="font-medium">{d}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!isFormValid || loading}
          className="w-full bg-[#059669] disabled:opacity-50 text-white font-semibold py-3.5 px-4 rounded-lg transition-colors"
        >
          {loading ? "Creating..." : "Create Chama"}
        </button>
      </main>

      <div className="fixed bottom-2 left-1/2 transform -translate-x-1/2">
        <div className="w-32 h-1 bg-gray-900 rounded-full"></div>
      </div>
    </div>
  );
}
