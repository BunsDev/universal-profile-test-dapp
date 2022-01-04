import Web3 from "web3";

export interface Errors {
  search?: string;
  amount?: string;
}

export interface Notification {
  message?: string;
  type?: string;
}

export type NotificationType = "primary" | "danger" | "info" | "warning";

export type Channel = "browserExtension" | "walletConnect";

export interface Store {
  isConnected: boolean;
  address: string;
  chainId: number;
  balance: number;
  channel?: Channel;
}

declare global {
  interface Window {
    web3: Web3;
    store: Store;
  }
}
