"use client";

import { useState } from "react";
import { useConnection, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { isAddress } from "viem";

import { CheckInPanel } from "@/components/wallet/CheckInPanel";
import { SiweButton } from "@/components/wallet/SiweButton";
import { targetChain } from "@/lib/chains";

export function WalletBar() {
  const expectedChainId = targetChain.id;
  const { address, chainId, status } = useConnection();
  const { disconnect } = useDisconnect();
  const { connect, connectors, isPending: connectPending } = useConnect();
  const { switchChain, isPending: switchPending } = useSwitchChain();
  const [sheetOpen, setSheetOpen] = useState(false);

  const wrong =
    status === "connected" &&
    chainId !== undefined &&
    chainId !== expectedChainId;

  const contractRaw = process.env.NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS;
  const contractOk =
    typeof contractRaw === "string" && isAddress(contractRaw);

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-3">
      {wrong && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-amber-500/15 px-3 py-2 text-sm text-amber-100">
          <span>Wrong network — switch to Base for check-in.</span>
          <button
            type="button"
            className="rounded-lg bg-amber-500/30 px-3 py-1.5 text-xs font-medium hover:bg-amber-500/40 disabled:opacity-50"
            disabled={switchPending}
            onClick={() => switchChain({ chainId: expectedChainId })}
          >
            {switchPending ? "Switching…" : "Switch network"}
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {status === "connected" && address ? (
          <div className="flex flex-col gap-1 text-sm">
            <span className="text-zinc-500">Connected</span>
            <span className="font-mono text-xs text-zinc-200">
              {address.slice(0, 6)}…{address.slice(-4)}
            </span>
          </div>
        ) : (
          <span className="text-sm text-zinc-500">Wallet disconnected</span>
        )}

        <div className="flex flex-wrap gap-2">
          {status === "disconnected" || status === "connecting" ? (
            <>
              <button
                type="button"
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
                disabled={connectPending}
                onClick={() => setSheetOpen(true)}
              >
                {connectPending ? "Connecting…" : "Connect wallet"}
              </button>
              {sheetOpen && (
                <div
                  className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center"
                  role="dialog"
                  aria-modal="true"
                  onClick={() => setSheetOpen(false)}
                >
                  <div
                    className="w-full max-w-md rounded-t-2xl border border-white/10 bg-zinc-900 p-4 shadow-xl sm:rounded-2xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-white">
                        Choose wallet
                      </h2>
                      <button
                        type="button"
                        className="text-zinc-500 hover:text-white"
                        onClick={() => setSheetOpen(false)}
                      >
                        Close
                      </button>
                    </div>
                    <ul className="flex flex-col gap-2">
                      {connectors.map((c) => (
                        <li key={c.uid}>
                          <button
                            type="button"
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm hover:bg-white/10 disabled:opacity-50"
                            disabled={connectPending}
                            onClick={() => {
                              connect({ connector: c, chainId: targetChain.id });
                              setSheetOpen(false);
                            }}
                          >
                            {c.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </>
          ) : (
            <button
              type="button"
              className="rounded-xl border border-white/15 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5"
              onClick={() => disconnect()}
            >
              Disconnect
            </button>
          )}
        </div>
      </div>

      {status === "connected" && address && !wrong && (
        <div className="mt-3 flex flex-col gap-3 border-t border-white/10 pt-3">
          <SiweButton />
          <CheckInPanel
            address={address}
            contractAddress={contractOk ? contractRaw : undefined}
          />
        </div>
      )}
    </div>
  );
}
