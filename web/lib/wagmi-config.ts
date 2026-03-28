import { http, createConfig, createStorage, cookieStorage } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { injected, walletConnect, baseAccount } from "wagmi/connectors";

import { targetChain } from "./chains";

const wcId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

const connectors = [
  injected(),
  baseAccount({
    appName: process.env.NEXT_PUBLIC_APP_NAME || "Bejeweled",
  }),
  ...(wcId
    ? [
        walletConnect({
          projectId: wcId,
          showQrModal: true,
        }),
      ]
    : []),
];

export const wagmiConfig = createConfig({
  chains: [targetChain],
  connectors,
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
