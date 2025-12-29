import {useEffect, useState} from "react";
import {useWallet} from "@aptos-labs/wallet-adapter-react";
import {Banner} from "./Banner";
import {useGetDelegatedStaking} from "../api/hooks/delegations/useGetDelegatedStaking";
import {useAptosClient} from "../global-config/GlobalConfig";
import {getValidatorCommission} from "../api";
import {addressFromWallet} from "../utils";

/**
 * Component that checks if a user has any pools with 0% commission
 * and displays a warning banner if they do.
 */
export function OutOfCommissionPoolsBanner() {
  const {connected, account} = useWallet();
  const aptosClient = useAptosClient();
  const [hasZeroCommission, setHasZeroCommission] = useState<boolean>(false);
  const [zeroCommissionPoolAddresses, setZeroCommissionPoolAddresses] =
    useState<string[]>([]);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  const {delegatorPools, loading} = useGetDelegatedStaking(
    addressFromWallet(account?.address),
  );

  useEffect(() => {
    if (!connected || loading || !delegatorPools || !aptosClient) {
      setHasZeroCommission(false);
      setZeroCommissionPoolAddresses([]);
      return;
    }

    if (isChecking) return;

    const checkPools = async () => {
      setIsChecking(true);

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

        const zeroCommissionPools = results
          .filter((result) => result.hasZeroCommission)
          .map((result) => result.address);

        setZeroCommissionPoolAddresses(zeroCommissionPools);
        setHasZeroCommission(zeroCommissionPools.length > 0);
      } catch (error) {
        console.error("Error checking pool commissions:", error);
      } finally {
        setIsChecking(false);
      }
    };

    checkPools();
  }, [connected, loading, delegatorPools, aptosClient, isChecking]);

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
