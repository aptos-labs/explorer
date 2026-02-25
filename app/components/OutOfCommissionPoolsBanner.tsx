import {useWallet} from "@aptos-labs/wallet-adapter-react";
import {useEffect, useState} from "react";
import {getValidatorCommission} from "../api";
import {useGetDelegatedStaking} from "../api/hooks/delegations/useGetDelegatedStaking";
import {useAptosClient} from "../global-config/GlobalConfig";
import {addressFromWallet} from "../utils";
import {Banner} from "./Banner";

/**
 * Component that checks if a user has any pools with 0% commission
 * and displays a warning banner if they do.
 */
export function OutOfCommissionPoolsBanner() {
  const {connected, account} = useWallet();
  const aptosClient = useAptosClient();
  const [zeroCommissionPoolAddresses, setZeroCommissionPoolAddresses] =
    useState<string[]>([]);

  const {delegatorPools, loading} = useGetDelegatedStaking(
    addressFromWallet(account?.address),
  );

  useEffect(() => {
    let cancelled = false;

    const checkPools = async () => {
      if (!connected || loading || !delegatorPools || !aptosClient) {
        setZeroCommissionPoolAddresses([]);
        return;
      }

      try {
        const poolChecks = delegatorPools.map(async (pool) => {
          try {
            const commissionResult = await getValidatorCommission(
              aptosClient,
              pool.pool_address,
            );

            let hasZeroCommission = false;
            if (commissionResult && commissionResult.length > 0) {
              const commission = Number(commissionResult[0]) / 100; // Convert from basis points
              hasZeroCommission = commission === 0;
            }

            return {
              address: pool.pool_address,
              hasZeroCommission,
            };
          } catch (error) {
            console.error(
              `Error checking pool commission for ${pool.pool_address}:`,
              error,
            );
            return {
              address: pool.pool_address,
              hasZeroCommission: false,
            };
          }
        });

        const results = await Promise.all(poolChecks);

        if (cancelled) return;

        const zeroCommissionPools = results
          .filter((result) => result.hasZeroCommission)
          .map((result) => result.address);

        setZeroCommissionPoolAddresses(zeroCommissionPools);
      } catch (error) {
        console.error("Error checking pool commissions:", error);
      }
    };

    checkPools();

    return () => {
      cancelled = true;
    };
  }, [connected, loading, delegatorPools, aptosClient]);

  const hasZeroCommission = zeroCommissionPoolAddresses.length > 0;

  if (!connected || !hasZeroCommission) {
    return null;
  }

  const message = `You have ${zeroCommissionPoolAddresses.length} staking ${zeroCommissionPoolAddresses.length === 1 ? "pool" : "pools"} with 0% commission. You will not earn rewards from ${zeroCommissionPoolAddresses.length === 1 ? "this pool" : "these pools"}. Consider withdrawing your funds.`;

  return (
    <Banner pillText="WARNING" pillColor="error" sx={{marginBottom: 2}}>
      {message}
    </Banner>
  );
}
