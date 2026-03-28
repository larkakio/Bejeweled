import { Attribution } from "ox/erc8021";
import type { Hex } from "viem";

/** ERC-8021 data suffix for Builder Code attribution on `writeContract` calls. */
export function getBuilderDataSuffix(): Hex | undefined {
  const override = process.env.NEXT_PUBLIC_BUILDER_CODE_SUFFIX;
  if (override?.startsWith("0x")) {
    return override as Hex;
  }
  const code = process.env.NEXT_PUBLIC_BUILDER_CODE;
  if (!code) return undefined;
  return Attribution.toDataSuffix({ codes: [code] });
}
