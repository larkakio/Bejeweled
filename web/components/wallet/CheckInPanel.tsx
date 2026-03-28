"use client";

import { useCallback, useState } from "react";
import { useReadContract, useWriteContract } from "wagmi";

import { checkInAbi } from "@/lib/check-in-abi";
import { getBuilderDataSuffix } from "@/lib/builder-code";
import { targetChain } from "@/lib/chains";

type Props = {
  address: `0x${string}`;
  contractAddress: `0x${string}` | undefined;
};

export function CheckInPanel({ address, contractAddress }: Props) {
  const [localError, setLocalError] = useState<string | null>(null);

  const { data: canCheck, isFetching } = useReadContract({
    chainId: targetChain.id,
    address: contractAddress,
    abi: checkInAbi,
    functionName: "canCheckIn",
    args: [address],
    query: { enabled: Boolean(contractAddress) },
  });

  const { writeContractAsync, isPending } = useWriteContract();

  const onCheckIn = useCallback(async () => {
    if (!contractAddress) return;
    setLocalError(null);
    try {
      let suffix;
      try {
        suffix = getBuilderDataSuffix();
      } catch {
        setLocalError("Invalid NEXT_PUBLIC_BUILDER_CODE or suffix.");
        return;
      }
      await writeContractAsync({
        address: contractAddress,
        abi: checkInAbi,
        functionName: "checkIn",
        dataSuffix: suffix,
      });
    } catch (e) {
      setLocalError(
        e instanceof Error ? e.message : "Transaction failed or rejected.",
      );
    }
  }, [contractAddress, writeContractAsync]);

  if (!contractAddress) return null;

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
        disabled={
          isPending || isFetching || canCheck === false || canCheck === undefined
        }
        onClick={onCheckIn}
      >
        {isPending
          ? "Confirm in wallet…"
          : canCheck === false
            ? "Already checked in today"
            : "Daily check-in (on-chain)"}
      </button>
      {localError && (
        <p className="text-xs text-red-400/90">{localError}</p>
      )}
    </div>
  );
}
