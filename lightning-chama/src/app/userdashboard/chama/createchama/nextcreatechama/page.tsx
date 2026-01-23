"use client";
import { useState, useEffect, useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  });

  const [step1Data, setStep1Data] = useState<{
    name: string;
    description: string;
    iconUrl: string;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [loadingRate, setLoadingRate] = useState(true);
  const [lastFetched, setLastFetched] = useState<number | null>(null);

  // 1 Bitcoin = 100,000,000 Satoshis
  const SATOSHIS_PER_BTC = 100000000;
  // Cache the rate for 5 minutes (300,000 milliseconds)
  const CACHE_DURATION_MS = 5 * 60 * 1000;

  useEffect(() => {
    const saved = localStorage.getItem("createChamaStep1");
    if (saved) setStep1Data(JSON.parse(saved));
  }, []);

  // Fetch exchange rate with simple caching
  useEffect(() => {
    const fetchExchangeRate = async () => {
      // Check if we have a recently cached rate
      if (lastFetched && Date.now() - lastFetched < CACHE_DURATION_MS) {
        console.log("Using cached exchange rate.");
        setLoadingRate(false);
        return;
      }

      try {
        setLoadingRate(true);
        console.log("Fetching new exchange rate from CoinGecko...");
        // *** Using 'kes'  ***
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=kes"
        );
        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }
        const data = await response.json();
        // *** Accessing 'kes' property ***
        if (data.bitcoin && data.bitcoin.kes) {
          setExchangeRate(data.bitcoin.kes);
          setLastFetched(Date.now()); // Update the last fetched timestamp
        }
      } catch (error) {
        console.error("Failed to fetch exchange rate:", error);
        // Fallback to a default rate if API fails and no rate exists
        if (!exchangeRate) {
           // Using a more recent approximate rate
           setExchangeRate(11500000); 
        }
      } finally {
        setLoadingRate(false);
      }
    };

    fetchExchangeRate();
  }, []); // Empty dependency array means this runs once on mount

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
    step1Data &&
    formData.contributionAmount &&
    formData.contributionFrequency &&
    formData.dueDate &&
    formData.membersRequired &&
    Number(formData.contributionAmount) > 0 &&
    Number(formData.membersRequired) > 0;

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

    const payload = {
      name: step1Data.name,
      description: step1Data.description,
      iconUrl: step1Data.iconUrl || "",
      visibility: "PUBLIC",
      maxMembers: Number(formData.membersRequired),
      creatorId,
      contributionAmount: contributionAmountInSatoshis, // Send in Satoshis
      requiresApproval: true,
      requiredApprovals: 2,
      frequency: formData.contributionFrequency,
    };

    try {
      const response = await fetch(
        "https://dada-devs-labs-dada-lab2.onrender.com/chama",
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
      router.push(`/userdashboard/chama/${data.chamaReference}`);
    } catch (err) {
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

          {/* Contribution Amount */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Contribution Amount (KES)
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
          </div>

          {/* Contribution Frequency (Dropdown) */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Contribution Frequency
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
          </div>

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