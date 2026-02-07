/**
 * Minimal REST client replacing the legacy `aptos` AptosClient.
 *
 * This is a thin fetch wrapper around the Aptos REST API used by functions
 * in `app/api/index.ts`.  It exposes only the methods the explorer actually
 * calls, keeping bundle size close to zero.
 */

import type {Types} from "~/types/aptos";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface AptosClientConfig {
  HEADERS?: Record<string, string>;
}

export class AptosClient {
  private readonly baseUrl: string;
  private readonly headers: Record<string, string>;

  constructor(nodeUrl: string, config?: AptosClientConfig) {
    // Strip trailing slash
    this.baseUrl = nodeUrl.replace(/\/+$/, "");
    this.headers = {
      "Content-Type": "application/json",
      ...config?.HEADERS,
    };
  }

  // ------------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------------
  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const resp = await fetch(url, {
      ...options,
      headers: {
        ...this.headers,
        ...((options?.headers as Record<string, string>) ?? {}),
      },
    });
    if (!resp.ok) {
      const body = await resp.text().catch(() => "");
      throw new Error(`Aptos API error ${resp.status}: ${body}`);
    }
    return resp.json() as Promise<T>;
  }

  private qs(
    params: Record<string, string | number | bigint | boolean | undefined>,
  ): string {
    const parts: string[] = [];
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined) parts.push(`${k}=${encodeURIComponent(String(v))}`);
    }
    return parts.length ? `?${parts.join("&")}` : "";
  }

  // ------------------------------------------------------------------
  // Transactions
  // ------------------------------------------------------------------
  async getTransactions(opts?: {
    start?: bigint | number;
    limit?: number;
  }): Promise<Types.Transaction[]> {
    return this.request(
      `/v1/transactions${this.qs({start: opts?.start, limit: opts?.limit})}`,
    );
  }

  async getAccountTransactions(
    address: string,
    opts?: {start?: bigint | number; limit?: number},
  ): Promise<Types.Transaction[]> {
    return this.request(
      `/v1/accounts/${address}/transactions${this.qs({start: opts?.start, limit: opts?.limit})}`,
    );
  }

  async getTransactionByVersion(
    version: bigint | number,
  ): Promise<Types.Transaction> {
    return this.request(`/v1/transactions/by_version/${version}`);
  }

  async getTransactionByHash(hash: string): Promise<Types.Transaction> {
    return this.request(`/v1/transactions/by_hash/${hash}`);
  }

  // ------------------------------------------------------------------
  // Ledger
  // ------------------------------------------------------------------
  async getLedgerInfo(): Promise<Types.IndexResponse> {
    return this.request("/v1");
  }

  // ------------------------------------------------------------------
  // Accounts
  // ------------------------------------------------------------------
  async getAccount(address: string): Promise<Types.AccountData> {
    return this.request(`/v1/accounts/${address}`);
  }

  async getAccountResources(
    address: string,
    opts?: {ledgerVersion?: bigint | number},
  ): Promise<Types.MoveResource[]> {
    return this.request(
      `/v1/accounts/${address}/resources${this.qs({ledger_version: opts?.ledgerVersion})}`,
    );
  }

  async getAccountResource(
    address: string,
    resourceType: string,
    opts?: {ledgerVersion?: bigint | number},
  ): Promise<Types.MoveResource> {
    return this.request(
      `/v1/accounts/${address}/resource/${encodeURIComponent(resourceType)}${this.qs({ledger_version: opts?.ledgerVersion})}`,
    );
  }

  async getAccountModules(
    address: string,
    opts?: {ledgerVersion?: bigint | number},
  ): Promise<Types.MoveModuleBytecode[]> {
    return this.request(
      `/v1/accounts/${address}/modules${this.qs({ledger_version: opts?.ledgerVersion})}`,
    );
  }

  async getAccountModule(
    address: string,
    moduleName: string,
    opts?: {ledgerVersion?: bigint | number},
  ): Promise<Types.MoveModuleBytecode> {
    return this.request(
      `/v1/accounts/${address}/module/${moduleName}${this.qs({ledger_version: opts?.ledgerVersion})}`,
    );
  }

  // ------------------------------------------------------------------
  // View function
  // ------------------------------------------------------------------
  async view(
    request: Types.ViewRequest,
    ledgerVersion?: string,
  ): Promise<Types.MoveValue[]> {
    const qs = ledgerVersion ? `?ledger_version=${ledgerVersion}` : "";
    return this.request(`/v1/view${qs}`, {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  // ------------------------------------------------------------------
  // Table
  // ------------------------------------------------------------------
  async getTableItem(
    tableHandle: string,
    data: Types.TableItemRequest,
  ): Promise<unknown> {
    return this.request(`/v1/tables/${tableHandle}/item`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // ------------------------------------------------------------------
  // Blocks
  // ------------------------------------------------------------------
  async getBlockByHeight(
    height: number,
    withTransactions?: boolean,
  ): Promise<Types.Block> {
    return this.request(
      `/v1/blocks/by_height/${height}${this.qs({with_transactions: withTransactions})}`,
    );
  }

  // ------------------------------------------------------------------
  // Wait for transaction
  // ------------------------------------------------------------------
  async waitForTransaction(
    hash: string,
    opts?: {checkSuccess?: boolean; timeoutSecs?: number},
  ): Promise<Types.Transaction> {
    const timeout = (opts?.timeoutSecs ?? 20) * 1000;
    const start = Date.now();
    const interval = 1000;

    while (Date.now() - start < timeout) {
      try {
        const txn: Types.Transaction = await this.getTransactionByHash(hash);
        if ("type" in txn && txn.type !== "pending_transaction") {
          if (
            opts?.checkSuccess &&
            "success" in txn &&
            !(txn as {success: boolean}).success
          ) {
            const vmStatus =
              (txn as {vm_status?: string}).vm_status ?? "unknown";
            throw new Error(
              `Transaction ${hash} committed but failed: ${vmStatus}`,
            );
          }
          return txn;
        }
      } catch (e: any) {
        // 404 means not found yet — keep polling
        if (!e?.message?.includes("404")) throw e;
      }
      await new Promise((r) => setTimeout(r, interval));
    }
    throw new Error(`Timed out waiting for transaction ${hash}`);
  }
}
