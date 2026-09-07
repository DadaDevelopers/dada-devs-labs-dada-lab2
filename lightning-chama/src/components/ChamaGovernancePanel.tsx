"use client";

import { useMemo, useState } from "react";
import { CheckCircle, ChevronDown, Loader2, Scale } from "lucide-react";
import { formatWalletName } from "@/lib/wallet";

const API_BASE_URL = "https://dada-devs-labs-dada-lab2-chamavault.onrender.com";
const FREQUENCIES = ["DAILY", "WEEKLY", "FORTNIGHTLY", "MONTHLY", "QUARTERLY", "YEARLY"];

const ACTION_COPY: Record<Action, { label: string; description: string }> = {
  WITHDRAW_GROUP_WALLET: { label: "Send money from a group wallet", description: "Pay a Lightning invoice using money held by the group." },
  CHANGE_CONTRIBUTION_AMOUNT: { label: "Change how much members contribute", description: "Set a new amount for future contributions. Existing dues will not change." },
  CHANGE_CHAMA_CONFIG: { label: "Change the contribution schedule", description: "Update how often members contribute and how many people approve decisions." },
  SKIP_ROTATION_MEMBER: { label: "Postpone a member's turn", description: "Skip their next payout turn without removing them from the Chama." },
};

type Action = "WITHDRAW_GROUP_WALLET" | "CHANGE_CONTRIBUTION_AMOUNT" | "CHANGE_CHAMA_CONFIG" | "SKIP_ROTATION_MEMBER";
type ContributionType = "POOLING" | "MERRY_GO_ROUND";

type WalletOption = {
  walletReference: string;
  walletType?: string;
  lightning?: { name?: string };
};

type MemberOption = {
  memberReference?: string;
  chamaMemberReference?: string;
  user?: { username?: string };
};

export default function ChamaGovernancePanel({ chamaId, wallets, members }: { chamaId: string; wallets: WalletOption[]; members: MemberOption[] }) {
  const [expanded, setExpanded] = useState(false);
  const [mode, setMode] = useState<"request" | "vote">("request");
  const [action, setAction] = useState<Action>("WITHDRAW_GROUP_WALLET");
  const [contributionType, setContributionType] = useState<ContributionType>("POOLING");
  const [walletReference, setWalletReference] = useState("");
  const [amountSats, setAmountSats] = useState("");
  const [destination, setDestination] = useState("");
  const [frequency, setFrequency] = useState("MONTHLY");
  const [requiresApproval, setRequiresApproval] = useState(true);
  const [requiredApprovals, setRequiredApprovals] = useState("2");
  const [beneficiaryContributes, setBeneficiaryContributes] = useState(false);
  const [memberReference, setMemberReference] = useState("");
  const [reason, setReason] = useState("");
  const [requestId, setRequestId] = useState("");
  const [decision, setDecision] = useState<"APPROVE" | "DISAPPROVE">("APPROVE");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const actionCopy = ACTION_COPY[action];

  const parameters = useMemo<Record<string, string>>(() => {
    const values: Record<string, string> = {};
    if (action === "WITHDRAW_GROUP_WALLET") {
      Object.assign(values, { walletReference, amountSats, destination });
    } else if (action === "CHANGE_CONTRIBUTION_AMOUNT") {
      Object.assign(values, { contributionType, contributionAmount: amountSats });
    } else if (action === "SKIP_ROTATION_MEMBER") {
      values.memberReference = memberReference;
    } else if (contributionType === "POOLING") {
      Object.assign(values, { contributionType, poolingFrequency: frequency, poolingRequiresApproval: String(requiresApproval), poolingRequiredApprovals: requiresApproval ? requiredApprovals : "0" });
    } else {
      Object.assign(values, { contributionType, merryGoRoundFrequency: frequency, beneficiaryContributes: String(beneficiaryContributes), merryGoRoundRequiresApproval: String(requiresApproval), merryGoRoundRequiredApprovals: requiresApproval ? requiredApprovals : "0" });
    }
    return values;
  }, [action, amountSats, beneficiaryContributes, contributionType, destination, frequency, memberReference, requiredApprovals, requiresApproval, walletReference]);

  const submit = async () => {
    setError(""); setMessage("");
    const token = localStorage.getItem("token");
    if (!token) return setError("You are not authenticated.");
    if (mode === "request" && !reason.trim()) return setError("Tell the group why this change is needed.");
    if (mode === "request" && Object.values(parameters).some(value => !value.trim())) return setError("Please complete all the fields shown above.");
    if (mode === "vote" && !requestId.trim()) return setError("Enter the request code you received.");
    setLoading(true);
    try {
      const url = mode === "request"
        ? `${API_BASE_URL}/chamas/${chamaId}/governance/requests`
        : `${API_BASE_URL}/chamas/${chamaId}/governance/requests/${requestId.trim()}/votes`;
      const body = mode === "request" ? { action, parameters, reason: reason.trim() } : { decision, comment: comment.trim() };
      const response = await fetch(url, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof data.message === "string" ? data.message : "We could not save this decision. Please try again.");
      setMessage(mode === "request" ? `Your change was ${data.status === "EXECUTED" ? "made immediately" : "shared with the group for approval"}.` : `Your decision was saved successfully.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong.");
    } finally { setLoading(false); }
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <button type="button" onClick={() => setExpanded(value => !value)} aria-expanded={expanded} className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-gray-50"><span className="rounded-lg bg-emerald-50 p-2 text-emerald-600"><Scale size={20} /></span><span className="min-w-0 flex-1"><span className="block font-bold text-gray-900">Group decisions</span><span className="block text-xs text-gray-500">Suggest or review important changes for your Chama.</span></span><span className="mr-1 text-xs font-semibold text-gray-500">{expanded ? 'Close' : 'Open'}</span><ChevronDown size={18} className={`text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} /></button>
      {expanded && <>
      <div className="grid grid-cols-2 border-b border-gray-100">{(["request", "vote"] as const).map(item => <button key={item} onClick={() => { setMode(item); setError(""); setMessage(""); }} className={`py-3 text-sm font-semibold ${mode === item ? "border-b-2 border-emerald-600 bg-emerald-50/50 text-emerald-700" : "text-gray-500 hover:bg-gray-50"}`}>{item === "request" ? "Suggest a change" : "Review a change"}</button>)}</div>
      <div className="space-y-4 p-4">
        {mode === "request" ? <>
          <div><p className="mb-2 text-xs font-semibold text-gray-600">What would you like to do?</p><select value={action} onChange={event => setAction(event.target.value as Action)} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm font-medium text-gray-900"><option value="WITHDRAW_GROUP_WALLET">Send money from a group wallet</option><option value="CHANGE_CONTRIBUTION_AMOUNT">Change the contribution amount</option><option value="CHANGE_CHAMA_CONFIG">Change the contribution schedule</option><option value="SKIP_ROTATION_MEMBER">Postpone a member&apos;s turn</option></select></div>
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-3"><p className="text-sm font-semibold text-blue-950">{actionCopy.label}</p><p className="mt-1 text-xs leading-5 text-blue-700">{actionCopy.description}</p></div>
          {(action === "CHANGE_CONTRIBUTION_AMOUNT" || action === "CHANGE_CHAMA_CONFIG") && <div><p className="mb-2 text-xs font-semibold text-gray-600">Which savings plan?</p><select value={contributionType} onChange={event => setContributionType(event.target.value as ContributionType)} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm text-gray-900"><option value="POOLING">Shared savings pot</option><option value="MERRY_GO_ROUND">Rotating member payout</option></select></div>}
          {action === "WITHDRAW_GROUP_WALLET" && <><select value={walletReference} onChange={event => setWalletReference(event.target.value)} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm text-gray-800"><option value="">Select group wallet</option>{wallets.map(wallet => <option key={wallet.walletReference} value={wallet.walletReference}>{formatWalletName(wallet.lightning?.name) || wallet.walletType || "Group wallet"}</option>)}</select><label className="block text-xs font-semibold text-gray-600">Amount in satoshis<input value={amountSats} onChange={event => setAmountSats(event.target.value.replace(/\D/g, ""))} placeholder="e.g. 25,000" className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm text-gray-900 placeholder:text-gray-400" /></label><label className="block text-xs font-semibold text-gray-600">Destination Lightning invoice<input value={destination} onChange={event => setDestination(event.target.value)} placeholder="Paste the complete invoice" className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm text-gray-900 placeholder:text-gray-400" /></label></>}
          {action === "CHANGE_CONTRIBUTION_AMOUNT" && <label className="block text-xs font-semibold text-gray-600">New contribution amount (sats)<input value={amountSats} onChange={event => setAmountSats(event.target.value.replace(/\D/g, ""))} placeholder="Enter amount" className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm text-gray-900 placeholder:text-gray-400" /></label>}
          {action === "CHANGE_CHAMA_CONFIG" && <><div><p className="mb-2 text-xs font-semibold text-gray-600">How often should members contribute?</p><select value={frequency} onChange={event => setFrequency(event.target.value)} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm text-gray-900">{FREQUENCIES.map(item => <option key={item} value={item}>{item.charAt(0) + item.slice(1).toLowerCase().replaceAll('_', ' ')}</option>)}</select></div>{contributionType === "MERRY_GO_ROUND" && <label className="flex items-start gap-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-700"><input className="mt-0.5" type="checkbox" checked={beneficiaryContributes} onChange={event => setBeneficiaryContributes(event.target.checked)} /><span><strong className="block text-gray-900">The person receiving money also contributes</strong><span className="text-xs text-gray-500">Include them in payments during their payout turn.</span></span></label>}<label className="flex items-start gap-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-700"><input className="mt-0.5" type="checkbox" checked={requiresApproval} onChange={event => setRequiresApproval(event.target.checked)} /><span><strong className="block text-gray-900">Ask members to approve this type of decision</strong><span className="text-xs text-gray-500">If switched off, future requests happen immediately.</span></span></label>{requiresApproval && <label className="block text-xs font-semibold text-gray-600">How many approvals are needed?<input value={requiredApprovals} onChange={event => setRequiredApprovals(event.target.value.replace(/\D/g, ""))} placeholder="e.g. 2" className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm font-normal text-gray-900 placeholder:text-gray-400" /></label>}</>}
          {action === "SKIP_ROTATION_MEMBER" && <select value={memberReference} onChange={event => setMemberReference(event.target.value)} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm text-gray-800"><option value="">Select member</option>{members.map((member, index) => { const reference = member.memberReference || member.chamaMemberReference || ""; return <option key={reference || index} value={reference}>{member.user?.username || `Member ${index + 1}`}</option>; })}</select>}
          <label className="block text-xs font-semibold text-gray-600">Reason<textarea value={reason} onChange={event => setReason(event.target.value)} placeholder="Explain why this change is needed" rows={3} className="mt-2 w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm font-normal text-gray-900 placeholder:text-gray-400" /></label>
        </> : <><div className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs leading-5 text-amber-800">Use the request code shared with you to approve or decline a proposed change.</div><label className="block text-xs font-semibold text-gray-600">Request code<input value={requestId} onChange={event => setRequestId(event.target.value)} placeholder="Paste the request code" className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm font-normal text-gray-900 placeholder:text-gray-400" /></label><div><p className="mb-2 text-xs font-semibold text-gray-600">Your decision</p><select value={decision} onChange={event => setDecision(event.target.value as "APPROVE" | "DISAPPROVE")} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm text-gray-900"><option value="APPROVE">Yes, I approve this change</option><option value="DISAPPROVE">No, I do not approve</option></select></div><label className="block text-xs font-semibold text-gray-600">Add a note (optional)<textarea value={comment} onChange={event => setComment(event.target.value)} placeholder="Explain your decision to the group" rows={3} className="mt-2 w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm font-normal text-gray-900 placeholder:text-gray-400" /></label></>}
        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}{message && <p className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700"><CheckCircle size={16} />{message}</p>}
        <button onClick={submit} disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50">{loading && <Loader2 size={16} className="animate-spin" />}{mode === "request" ? "Share this change with the group" : decision === "APPROVE" ? "Approve this change" : "Decline this change"}</button>
      </div>
      </>}
    </section>
  );
}
