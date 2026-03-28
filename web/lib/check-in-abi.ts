export const checkInAbi = [
  {
    type: "function",
    name: "checkIn",
    stateMutability: "payable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "canCheckIn",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "lastCheckInDay",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "event",
    name: "CheckedIn",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "day", type: "uint256", indexed: true },
    ],
  },
] as const;
