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

  useEffect(() => {
    const saved = localStorage.getItem("createChamaStep1");
    if (saved) setStep1Data(JSON.parse(saved));
  }, []);

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

    const payload = {
      name: step1Data.name,
      description: step1Data.description,
      iconUrl: step1Data.iconUrl || "",
      visibility: "PUBLIC",
      maxMembers: Number(formData.membersRequired),
      creatorId,
      contributionAmount: Number(formData.contributionAmount),
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

        {/* Preview (added without breaking layout) */}
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
                <span className="text-gray-500">Frequency</span>
                <span className="font-medium">
                  {formData.contributionFrequency}
                </span>
              </div>
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


        {/* Members */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Members Required
          </label>
          <input
            type="number"
            name="membersRequired"
            value={formData.membersRequired}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#059669]"
          />
        </div>

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
