import type {FunctionArgumentNameOverrideMap} from "./types";

/**
 * Decibel package on Aptos mainnet (`knownAddresses` / branding: "Decibel").
 * Keys are every **public** `entry` / `view` function as of a mainnet module crawl;
 * values are positional stubs (`arg0`, …) until replaced with real parameter names.
 */
export const decibelMainnetFunctionArgumentNameOverrides = {
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::add_access_control_admin":
    ["arg0"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::add_fee_config_governor":
    ["arg0"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::add_global_pause_guardian":
    ["arg0"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::add_invite_only_referral_management_permission":
    ["arg0"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::add_to_account_creation_allow_list":
    ["arg0"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::add_vault_global_config_admin":
    ["arg0"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::add_withdraw_rate_limit_governor":
    ["arg0"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::admin_register_referral_code":
    ["arg0", "arg1"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::admin_register_referrer":
    ["arg0", "arg1"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::configure_withdraw_rate_limit":
    ["arg0", "arg1", "arg2", "arg3", "arg4", "arg5"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::initialize":
    ["arg0", "arg1"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::pause_global_exchange":
    [],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::remove_vault_global_config_admin":
    ["arg0"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::remove_withdraw_rate_limit_governor":
    ["arg0"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::set_invite_only_account_creation":
    ["arg0"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::set_max_referral_codes_for_address":
    ["arg0", "arg1"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::set_withdraw_rate_limit_enabled":
    ["arg0", "arg1"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::update_fee_config":
    [
      "arg0",
      "arg1",
      "arg2",
      "arg3",
      "arg4",
      "arg5",
      "arg6",
      "arg7",
      "arg8",
      "arg9",
      "arg10",
      "arg11",
      "arg12",
    ],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::update_withdraw_absolute_rate_limit":
    ["arg0", "arg1"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::update_withdraw_rate_limit_bps":
    ["arg0", "arg1"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::update_withdraw_window_duration":
    ["arg0", "arg1"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::dex_accounts_entry::admin_create_new_subaccount":
    ["arg0"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::public_apis::process_perp_collateral_withdrawals":
    ["arg0"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::public_apis::process_perp_market_pending_requests":
    ["arg0", "arg1"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::vault_admin_api::activate_vault":
    ["arg0"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::vault_api::activate_vault":
    ["arg0"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::vault_api::distribute_fees":
    ["arg0"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::vault_api::process_pending_requests":
    ["arg0"],
} as const satisfies FunctionArgumentNameOverrideMap;
