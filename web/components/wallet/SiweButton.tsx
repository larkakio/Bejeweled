"use client";

import { useState } from "react";
import { createSiweMessage, generateSiweNonce } from "viem/siwe";
import { useConnection, usePublicClient, useSignMessage } from "wagmi";

export function SiweButton() {
  const { address, chainId, status } = useConnection();
  const { signMessageAsync, isPending } = useSignMessage();
  const publicClient = usePublicClient();
  const [error, setError] = useState<string | null>(null);

  async function handleSign() {
    if (!address || chainId === undefined || !publicClient) return;
    setError(null);
    try {
      const nonce = generateSiweNonce();
      const message = createSiweMessage({
        address,
        chainId,
        domain: window.location.host,
        nonce,
        uri: window.location.origin,
        version: "1",
      });
      const signature = await signMessageAsync({ message });
      const ok = await publicClient.verifySiweMessage({ message, signature });
      if (!ok) setError("Could not verify signature.");
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Signature cancelled or failed.";
      if (
        msg.toLowerCase().includes("user rejected") ||
        msg.toLowerCase().includes("denied")
      ) {
        setError("You cancelled the signature request.");
      } else {
        setError(msg);
      }
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-zinc-200 hover:bg-white/10 disabled:opacity-50"
        disabled={status !== "connected" || isPending}
        onClick={handleSign}
      >
        {isPending ? "Signing…" : "Sign with wallet (SIWE)"}
      </button>
      {error && <p className="text-xs text-red-400/90">{error}</p>}
    </div>
  );
}
