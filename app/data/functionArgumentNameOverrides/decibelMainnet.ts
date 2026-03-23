import type {FunctionArgumentNameOverrideMap} from "./types";

/**
 * Decibel package on Aptos mainnet (`knownAddresses` / branding: "Decibel").
 * Keys are every **public** `entry` / `view` function as of a mainnet module crawl;
 * values are positional stubs (`arg0`, …) until replaced with real parameter names.
 */
export const decibelMainnetFunctionArgumentNameOverrides = {
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::accounts_collateral::available_order_margin":
    ["account"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::accounts_collateral::get_reserved_collateral":
    ["account"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::adl_tracker::view_adl_bucket_sizes":
    ["market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::adl_tracker::view_adl_cutoffs":
    ["market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::adl_tracker::view_first_n_adl_positions":
    ["market", "is_long", "bucket_index", "n"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::add_access_control_admin":
    ["admin", "delegated_admin"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::add_access_control_guardian":
    ["admin", "delegated_admin"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::add_fee_config_governor":
    ["admin", "delegated_admin"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::add_global_pause_guardian":
    ["admin", "delegated_admin"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::add_global_unpause_council":
    ["admin", "delegated_admin"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::add_invite_only_referral_management_permission":
    ["admin", "delegated_admin"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::add_market_delist_council":
    ["admin", "delegated_admin"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::add_market_list_admin":
    ["admin", "delegated_admin"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::add_market_mode_guardian":
    ["admin", "delegated_admin"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::add_market_open_admin":
    ["admin", "delegated_admin"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::add_market_risk_governor":
    ["admin", "delegated_admin"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::add_market_risk_tightener":
    ["admin", "delegated_admin"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::add_oracle_and_mark_update_permission":
    ["admin", "delegated_admin"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::add_order_management_admin":
    ["admin", "delegated_admin"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::add_to_account_creation_allow_list":
    ["admin", "accounts"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::add_vault_global_config_admin":
    ["admin", "delegated_admin"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::add_withdraw_rate_limit_governor":
    ["admin", "delegated_admin"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::admin_register_affiliate":
    ["admin", "affiliate_addr"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::admin_register_referral_code":
    ["admin", "user_addr", "referral_code"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::admin_register_referrer":
    ["admin", "user_addr", "referrer_code"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::allow_market_cross_margin_mode":
    ["admin", "market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::configure_withdraw_rate_limit":
    [
      "admin",
      "metadata",
      "enabled",
      "rate_limit_bps",
      "absolute_rate_limit",
      "window_duration_seconds",
      "num_buckets",
    ],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::decrease_market_lot_size":
    ["admin", "market", "new_lot_size"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::decrease_market_notional_open_interest":
    ["admin", "market", "new_notional_open_interest"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::decrease_market_open_interest":
    ["admin", "market", "new_open_interest"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::delist_market":
    ["admin", "market", "reason"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::delist_market_with_mark_price":
    ["admin", "market", "mark_price", "reason"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::drain_async_queue":
    ["_admin", "_market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::increase_market_lot_size":
    ["admin", "market", "new_lot_size"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::increase_market_notional_open_interest":
    ["admin", "market", "new_notional_open_interest"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::increase_market_open_interest":
    ["admin", "market", "new_open_interest"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::increment_time":
    ["account", "increment_microseconds"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::init_account_status_cache_for_subaccount":
    ["updater", "subaccount"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::initialize":
    ["admin", "collateral_asset", "backstop_liquidator"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::pause_global_exchange":
    ["admin"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::register_market_with_composite_oracle_primary_chainlink":
    [
      "admin",
      "name",
      "sz_decimals",
      "min_size",
      "lot_size",
      "ticker_size",
      "max_open_interest",
      "max_leverage",
      "margin_call_fee_pct",
      "async_matching_enabled",
      "chainlink_feed_id",
      "chainlink_max_staleness_secs",
      "chainlink_rescale_decimals",
      "internal_initial_price",
      "internal_max_staleness_secs",
      "oracles_deviation_bps",
      "consecutive_deviation_count",
    ],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::register_market_with_composite_oracle_primary_chainlink_v2":
    [
      "admin",
      "name",
      "sz_decimals",
      "min_size",
      "lot_size",
      "ticker_size",
      "max_open_interest",
      "max_leverage",
      "margin_call_fee_pct",
      "async_matching_enabled",
      "is_isolated_only",
      "chainlink_feed_id",
      "chainlink_max_staleness_secs",
      "chainlink_rescale_decimals",
      "internal_initial_price",
      "internal_max_staleness_secs",
      "oracles_deviation_bps",
      "consecutive_deviation_count",
    ],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::register_market_with_composite_oracle_primary_pyth":
    [
      "admin",
      "name",
      "sz_decimals",
      "min_size",
      "lot_size",
      "ticker_size",
      "max_open_interest",
      "max_leverage",
      "margin_call_fee_pct",
      "async_matching_enabled",
      "pyth_identifier_bytes",
      "pyth_max_staleness_secs",
      "pyth_confidence_interval_threshold",
      "pyth_rescale_decimals",
      "internal_initial_price",
      "internal_max_staleness_secs",
      "oracles_deviation_bps",
      "consecutive_deviation_count",
    ],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::register_market_with_composite_oracle_primary_pyth_v2":
    [
      "admin",
      "name",
      "sz_decimals",
      "min_size",
      "lot_size",
      "ticker_size",
      "max_open_interest",
      "max_leverage",
      "margin_call_fee_pct",
      "async_matching_enabled",
      "is_isolated_only",
      "pyth_identifier_bytes",
      "pyth_max_staleness_secs",
      "pyth_confidence_interval_threshold",
      "pyth_rescale_decimals",
      "internal_initial_price",
      "internal_max_staleness_secs",
      "oracles_deviation_bps",
      "consecutive_deviation_count",
    ],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::register_market_with_internal_oracle":
    [
      "admin",
      "name",
      "sz_decimals",
      "min_size",
      "lot_size",
      "ticker_size",
      "max_open_interest",
      "max_leverage",
      "margin_call_fee_pct",
      "async_matching_enabled",
      "initial_oracle_price",
      "max_staleness_secs",
    ],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::register_market_with_internal_oracle_v2":
    [
      "admin",
      "name",
      "sz_decimals",
      "min_size",
      "lot_size",
      "ticker_size",
      "max_open_interest",
      "max_leverage",
      "margin_call_fee_pct",
      "async_matching_enabled",
      "is_isolated_only",
      "initial_oracle_price",
      "max_staleness_secs",
    ],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::register_market_with_pyth_oracle":
    [
      "admin",
      "name",
      "sz_decimals",
      "min_size",
      "lot_size",
      "ticker_size",
      "max_open_interest",
      "max_leverage",
      "margin_call_fee_pct",
      "async_matching_enabled",
      "pyth_identifier_bytes",
      "pyth_max_staleness_secs",
      "pyth_confidence_interval_threshold",
      "pyth_rescale_decimals",
    ],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::register_market_with_pyth_oracle_v2":
    [
      "admin",
      "name",
      "sz_decimals",
      "min_size",
      "lot_size",
      "ticker_size",
      "max_open_interest",
      "max_leverage",
      "margin_call_fee_pct",
      "async_matching_enabled",
      "is_isolated_only",
      "pyth_identifier_bytes",
      "pyth_max_staleness_secs",
      "pyth_confidence_interval_threshold",
      "pyth_rescale_decimals",
    ],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::remove_access_control_admin":
    ["admin", "delegated_admin"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::remove_access_control_guardian":
    ["admin", "delegated_admin"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::remove_fee_config_governor":
    ["admin", "delegated_admin"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::remove_global_pause_guardian":
    ["admin", "delegated_admin"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::remove_global_unpause_council":
    ["admin", "delegated_admin"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::remove_invite_only_referral_management_permission":
    ["admin", "delegated_admin"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::remove_market_delist_council":
    ["admin", "delegated_admin"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::remove_market_list_admin":
    ["admin", "delegated_admin"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::remove_market_mode_guardian":
    ["admin", "delegated_admin"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::remove_market_open_admin":
    ["admin", "delegated_admin"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::remove_market_risk_governor":
    ["admin", "delegated_admin"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::remove_market_risk_tightener":
    ["admin", "delegated_admin"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::remove_oracle_and_mark_update_permission":
    ["admin", "delegated_admin"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::remove_order_management_admin":
    ["admin", "delegated_admin"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::remove_vault_global_config_admin":
    ["admin", "delegated_admin"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::remove_withdraw_rate_limit_governor":
    ["admin", "delegated_admin"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::set_backstop_liquidator_high_watermark":
    ["admin", "market", "new_watermark"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::set_blp_margin_as_profit_percentage":
    ["admin", "percentage_bps"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::set_global_max_builder_fee":
    ["admin", "new_max_builder_fee"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::set_invite_only_account_creation":
    ["admin", "require"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::set_market_adl_trigger_threshold":
    ["admin", "market", "threshold"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::set_market_allowlist_only":
    ["admin", "market", "allowlist", "reason"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::set_market_book_oracle_ratio_cap_bps":
    ["admin", "market", "book_oracle_ratio_cap_bps"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::set_market_cooldown_period_micros":
    ["admin", "market", "cooldown_period_micros"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::set_market_funding_mode":
    ["admin", "market", "funding_period_us"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::set_market_funding_rate_pause_timeout_microseconds":
    ["admin", "market", "timeout_microseconds"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::set_market_halted":
    ["admin", "market", "reason"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::set_market_margin_call_backstop_pct":
    ["admin", "market", "margin_call_backstop_pct"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::set_market_margin_call_fee_pct":
    ["admin", "market", "margin_call_fee_pct"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::set_market_max_leverage":
    ["admin", "market", "max_leverage"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::set_market_max_leverage_with_fee_scaling":
    ["admin", "market", "max_leverage"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::set_market_min_size":
    ["admin", "market", "min_size"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::set_market_notional_open_interest":
    ["_admin", "market", "notional_open_interest"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::set_market_open":
    ["admin", "market", "reason"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::set_market_open_interest":
    ["_admin", "market", "open_interest"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::set_market_reduce_only":
    ["admin", "market", "allowlist", "reason"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::set_market_slippage_increment_pct":
    ["admin", "market", "slippage_increment_pct"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::set_market_starting_slippage_pct":
    ["admin", "market", "starting_slippage_pct"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::set_market_unrealized_pnl_haircut":
    ["admin", "market", "haircut_bps"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::set_market_withdrawable_margin_leverage":
    ["_admin", "_market", "_leverage"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::set_max_referral_codes_for_address":
    ["admin", "user_addr", "max_codes"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::set_max_usage_per_referral_code_for_address":
    ["admin", "user_addr", "max_usage"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::set_withdraw_rate_limit_enabled":
    ["admin", "metadata", "enabled"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::unpause_global_exchange":
    ["admin"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::update_fee_config":
    [
      "admin",
      "tier_thresholds",
      "tier_maker_fees",
      "tier_taker_fees",
      "market_maker_absolute_threshold",
      "market_maker_tier_pct_thresholds",
      "market_maker_tier_fee_rebates",
      "builder_max_fee",
      "backstop_vault_fee_pct",
      "referral_fee_enabled",
      "referral_fee_pct",
      "referred_fee_discount_pct",
      "discount_eligibility_volume_threshold",
      "referrer_eligibility_volume_threshold",
    ],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::update_mark_for_chainlink_oracle":
    [
      "updater",
      "market",
      "signed_report",
      "backstop_liquidations",
      "margin_call_liquidations",
      "trigger",
    ],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::update_mark_for_chainlink_oracle_with_batch_key":
    [
      "updater",
      "market",
      "signed_report",
      "backstop_liquidations",
      "margin_call_liquidations",
      "trigger",
      "batch_key",
    ],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::update_mark_for_composite_chainlink":
    [
      "updater",
      "market",
      "internal_oracle_price",
      "signed_report",
      "impact_bid_px_hint",
      "impact_ask_px_hint",
      "backstop_liquidations",
      "margin_call_liquidations",
      "trigger",
    ],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::update_mark_for_composite_chainlink_with_batch_key":
    [
      "updater",
      "market",
      "internal_oracle_price",
      "signed_report",
      "impact_bid_px_hint",
      "impact_ask_px_hint",
      "backstop_liquidations",
      "margin_call_liquidations",
      "trigger",
      "batch_key",
    ],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::update_mark_for_internal_oracle":
    [
      "updater",
      "market",
      "oracle_price",
      "backstop_liquidations",
      "margin_call_liquidations",
      "trigger",
    ],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::update_mark_for_internal_oracle_with_batch_key":
    [
      "updater",
      "market",
      "oracle_price",
      "backstop_liquidations",
      "margin_call_liquidations",
      "trigger",
      "batch_key",
    ],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::update_mark_for_pyth_oracle":
    [
      "updater",
      "market",
      "vaa",
      "backstop_liquidations",
      "margin_call_liquidations",
      "trigger",
    ],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::update_mark_for_pyth_oracle_with_batch_key":
    [
      "updater",
      "market",
      "vaa",
      "backstop_liquidations",
      "margin_call_liquidations",
      "trigger",
      "batch_key",
    ],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::update_withdraw_absolute_rate_limit":
    ["admin", "metadata", "absolute_rate_limit"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::update_withdraw_rate_limit_bps":
    ["admin", "metadata", "rate_limit_bps"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::update_withdraw_window_duration":
    ["admin", "metadata", "window_duration_seconds"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::admin_apis::view_fee_treasury_balance":
    [],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::async_matching_engine::count_pending_individual_jobs_in_queue_capped":
    ["market", "max_count"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::async_matching_engine::view_backstop_liquidations_length":
    ["market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::async_matching_engine::view_first_n_backstop_liquidations":
    ["market", "n"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::async_matching_engine::view_first_n_margin_call_liquidations":
    ["market", "n"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::async_matching_engine::view_first_n_mark_prices_in_queue":
    ["market", "n"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::async_matching_engine::view_first_n_pending_requests":
    ["market", "n"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::async_matching_engine::view_margin_call_liquidations_length":
    ["market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::async_matching_engine::view_mark_prices_in_queue_length":
    ["market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::async_matching_engine::view_nth_backstop_liquidation":
    ["market", "n"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::async_matching_engine::view_nth_margin_call_liquidation":
    ["market", "n"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::async_matching_engine::view_nth_mark_price_in_queue":
    ["market", "n"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::async_matching_engine::view_nth_pending_request":
    ["market", "n"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::async_matching_engine::view_pending_requests_length":
    ["market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::async_matching_engine::view_pending_requests_length_capped":
    ["_market", "_max_length"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::async_vault_engine::count_pending_individual_jobs_in_queue_capped":
    ["max_count"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::async_withdraw_queue::count_pending_individual_jobs_in_queue_capped":
    ["max_count"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::async_withdraw_queue::get_current_window_usage":
    ["metadata", "total_system_balance"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::async_withdraw_queue::get_pending_withdrawal_count":
    ["user"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::async_withdraw_queue::get_pending_withdrawals":
    ["user"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::async_withdraw_queue::get_queue_length":
    [],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::async_withdraw_queue::get_rate_limit_config":
    ["metadata"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::backstop_liquidator_profit_tracker::get_adl_tracker_status":
    ["market", "adl_threshold"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::backstop_liquidator_profit_tracker::view_blp_margin_as_profit_pct":
    [],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::backstop_liquidator_profit_tracker::view_market_tracking_data":
    ["market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::backstop_liquidator_profit_tracker::view_realized_pnl":
    ["market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::backstop_liquidator_profit_tracker::view_total_pnl":
    ["market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::backstop_liquidator_profit_tracker::view_total_pnl_at_price":
    ["market", "mark_price"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::backstop_liquidator_profit_tracker::view_unrealized_pnl":
    ["market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::backstop_liquidator_profit_tracker::view_unrealized_pnl_at_price":
    ["market", "mark_price"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::builder_code_registry::get_approved_max_fee":
    ["user", "builder"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::chainlink_state::verify_and_store_multiple_prices":
    ["account", "signed_reports"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::chainlink_state::verify_and_store_single_price":
    ["account", "signed_report"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::dex_accounts::primary_subaccount":
    ["owner_addr"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::dex_accounts::primary_subaccount_object":
    ["owner"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::dex_accounts::seeded_subacccount_address":
    ["owner_addr", "seed"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::dex_accounts::view_delegated_permissions":
    ["subaccount"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::dex_accounts::view_is_subaccount_active":
    ["subaccount"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::dex_accounts_entry::add_delegated_trader_and_deposit_to_subaccount":
    [
      "owner",
      "subaccount",
      "metadata",
      "amount",
      "account_to_delegate_to",
      "expiration_time_s",
    ],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::dex_accounts_entry::admin_create_new_subaccount":
    ["admin", "user_addr"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::dex_accounts_entry::approve_max_builder_fee_for_subaccount":
    ["auth", "subaccount", "builder", "max_fee"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::dex_accounts_entry::cancel_bulk_order_to_subaccount":
    ["auth", "subaccount", "market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::dex_accounts_entry::cancel_client_order_to_subaccount":
    ["auth", "subaccount", "client_order_id", "market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::dex_accounts_entry::cancel_order_to_subaccount":
    ["auth", "subaccount", "order_id", "market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::dex_accounts_entry::cancel_tp_sl_order_for_position":
    ["auth", "subaccount", "market", "order_id"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::dex_accounts_entry::cancel_twap_orders_to_subaccount":
    ["auth", "subaccount", "market", "order_id"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::dex_accounts_entry::configure_user_settings_for_market":
    ["auth", "subaccount", "market", "is_cross", "user_leverage"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::dex_accounts_entry::contribute_to_vault":
    ["auth", "subaccount", "vault", "metadata", "amount"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::dex_accounts_entry::create_new_subaccount":
    ["owner"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::dex_accounts_entry::deactivate_subaccount":
    ["owner", "subaccount", "revoke_delegations"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::dex_accounts_entry::delegate_ability_to_sub_delegate_to_for_subaccount":
    ["auth", "subaccount", "account_to_delegate_to", "expiration_time_s"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::dex_accounts_entry::delegate_all_trading_to_for_subaccount":
    ["auth", "subaccount", "account_to_delegate_to", "expiration_time_s"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::dex_accounts_entry::delegate_perp_trading_to_for_subaccount":
    ["auth", "subaccount", "account_to_delegate_to", "expiration_time_s"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::dex_accounts_entry::delegate_perp_trading_to_market_for_subaccount":
    [
      "auth",
      "subaccount",
      "account_to_delegate_to",
      "market",
      "expiration_time_s",
    ],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::dex_accounts_entry::delegate_trading_to_for_subaccount":
    ["auth", "subaccount", "account_to_delegate_to", "expiration_time_s"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::dex_accounts_entry::deposit_to_isolated_position_collateral":
    ["owner", "subaccount", "market", "metadata", "amount"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::dex_accounts_entry::deposit_to_subaccount_at":
    ["owner", "subaccount", "metadata", "amount"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::dex_accounts_entry::place_bulk_orders_to_subaccount":
    [
      "auth",
      "subaccount",
      "market",
      "sequence_number",
      "bid_prices",
      "bid_sizes",
      "ask_prices",
      "ask_sizes",
      "builder_address",
      "builder_fees",
    ],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::dex_accounts_entry::place_market_order_to_subaccount":
    [
      "auth",
      "subaccount",
      "market",
      "size",
      "is_buy",
      "is_reduce_only",
      "client_order_id",
      "stop_price",
      "tp_trigger_price",
      "tp_limit_price",
      "sl_trigger_price",
      "sl_limit_price",
      "builder_address",
      "builder_fees",
    ],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::dex_accounts_entry::place_order_to_subaccount":
    [
      "auth",
      "subaccount",
      "market",
      "price",
      "size",
      "is_buy",
      "time_in_force",
      "is_reduce_only",
      "client_order_id",
      "stop_price",
      "tp_trigger_price",
      "tp_limit_price",
      "sl_trigger_price",
      "sl_limit_price",
      "builder_address",
      "builder_fees",
    ],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::dex_accounts_entry::place_tp_sl_order_for_position":
    [
      "auth",
      "subaccount",
      "market",
      "tp_trigger_price",
      "tp_limit_price",
      "tp_size",
      "sl_trigger_price",
      "sl_limit_price",
      "sl_size",
      "builder_address",
      "builder_fees",
    ],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::dex_accounts_entry::place_twap_order_to_subaccount":
    [
      "auth",
      "subaccount",
      "market",
      "size",
      "is_buy",
      "is_reduce_only",
      "twap_frequency_s",
      "twap_duration_s",
      "builder_address",
      "builder_fees",
    ],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::dex_accounts_entry::place_twap_order_to_subaccount_v2":
    [
      "auth",
      "subaccount",
      "market",
      "size",
      "is_buy",
      "is_reduce_only",
      "client_order_id",
      "twap_frequency_s",
      "twap_duration_s",
      "builder_address",
      "builder_fees",
    ],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::dex_accounts_entry::reactivate_subaccount":
    ["owner", "subaccount"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::dex_accounts_entry::redeem_from_vault":
    ["auth", "subaccount", "vault", "shares"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::dex_accounts_entry::register_referral_code":
    ["owner", "referral_code"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::dex_accounts_entry::register_referrer":
    ["owner", "referrer_code"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::dex_accounts_entry::revoke_all_delegations":
    ["owner", "subaccount"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::dex_accounts_entry::revoke_delegation":
    ["owner", "subaccount", "account_to_revoke"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::dex_accounts_entry::revoke_max_builder_fee_for_subaccount":
    ["owner", "subaccount", "builder"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::dex_accounts_entry::transfer_collateral_between_subaccounts":
    ["owner", "from", "to", "metadata", "amount"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::dex_accounts_entry::transfer_collateral_to_isolated_position":
    ["owner", "subaccount", "market", "is_deposit", "metadata", "amount"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::dex_accounts_entry::update_client_order_to_subaccount":
    [
      "auth",
      "subaccount",
      "client_order_id",
      "market",
      "price",
      "orig_size",
      "is_buy",
      "time_in_force",
      "is_reduce_only",
      "tp_trigger_price",
      "tp_limit_price",
      "sl_trigger_price",
      "sl_limit_price",
      "builder_address",
      "builder_fees",
    ],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::dex_accounts_entry::update_order_to_subaccount":
    [
      "auth",
      "subaccount",
      "order_id",
      "market",
      "price",
      "orig_size",
      "is_buy",
      "time_in_force",
      "is_reduce_only",
      "tp_trigger_price",
      "tp_limit_price",
      "sl_trigger_price",
      "sl_limit_price",
      "builder_address",
      "builder_fees",
    ],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::dex_accounts_entry::update_sl_order_for_position":
    [
      "auth",
      "subaccount",
      "order_id",
      "market",
      "sl_trigger_price",
      "sl_limit_price",
      "sl_size",
    ],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::dex_accounts_entry::update_tp_order_for_position":
    [
      "auth",
      "subaccount",
      "order_id",
      "market",
      "tp_trigger_price",
      "tp_limit_price",
      "tp_size",
    ],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::dex_accounts_entry::withdraw_from_cross_collateral":
    ["owner", "subaccount", "metadata", "amount"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::dex_accounts_entry::withdraw_from_isolated_position_collateral":
    ["owner", "subaccount", "market", "metadata", "amount"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::dex_accounts_entry::withdraw_from_non_collateral":
    ["owner", "subaccount", "metadata", "amount"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::dex_accounts_entry::withdraw_from_subaccount":
    ["owner", "subaccount", "metadata", "amount"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::fee_treasury::get_balance":
    [],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::fee_treasury::get_fee_vault_address":
    [],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::open_interest_tracker::view_available_open_interest":
    ["market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::open_interest_tracker::view_open_interest_tracker":
    ["market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::pending_order_tracker::bulk_order_using_margin":
    ["account", "market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::pending_order_tracker::get_bulk_order_pending_sizes":
    ["account", "market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::pending_order_tracker::get_next_tracked_order_using_margin":
    ["account"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::pending_order_tracker::get_tracked_order_ids_with_sizes":
    ["account", "market", "max_orders"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::pending_order_tracker::is_order_id_tracking_enabled":
    ["account"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::pending_order_tracker::view_account_summary":
    ["account"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_engine::account_has_any_assets_positions_or_orders":
    ["account"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_engine::account_has_any_positions_or_orders":
    ["account"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_engine::backstop_liquidator":
    [],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_engine::collateral_balance_decimals":
    [],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_engine::cross_position_status":
    ["account"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_engine::get_account_net_asset_value":
    ["account"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_engine::get_adl_tracker_status":
    ["market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_engine::get_async_queue_length":
    ["market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_engine::get_blp_pnl":
    ["market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_engine::get_bulk_order":
    ["market", "account"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_engine::get_cross_total_collateral_value":
    ["account"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_engine::get_current_open_interest":
    ["market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_engine::get_fee_treasury_balance":
    [],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_engine::get_global_primary_store_balance":
    [],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_engine::get_global_secondary_store_balance":
    ["asset_type"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_engine::get_isolated_position_total_collateral_value":
    ["account", "market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_engine::get_mark_and_oracle_price":
    ["market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_engine::get_mark_price":
    ["market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_engine::get_market_mode":
    ["market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_engine::get_max_notional_open_interest":
    ["market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_engine::get_max_open_interest_delta":
    ["market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_engine::get_oracle_internal_snapshot":
    ["market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_engine::get_oracle_price":
    ["market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_engine::get_oracle_source":
    ["market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_engine::get_position_avg_price":
    ["account", "market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_engine::get_position_entry_price_times_size_sum":
    ["account", "market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_engine::get_position_funding_index_at_last_update":
    ["account", "market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_engine::get_position_is_long":
    ["account", "market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_engine::get_position_size":
    ["account", "market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_engine::get_position_unrealized_funding_amount_before_last_update":
    ["account", "market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_engine::get_position_unrealized_funding_cost":
    ["account", "market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_engine::get_rate_limit_status":
    ["metadata"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_engine::get_remaining_size_for_order":
    ["market", "order_id"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_engine::has_position":
    ["account", "market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_engine::initialize_for_test":
    ["admin", "collateral_token", "backstop_liquidator"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_engine::is_exchange_open":
    [],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_engine::is_market_open":
    ["market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_engine::is_position_isolated":
    ["account", "market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_engine::is_position_liquidatable":
    ["account", "market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_engine::is_supported_collateral":
    ["metadata"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_engine::list_markets":
    [],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_engine::list_positions":
    ["account"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_engine::market_cooldown_period_micros":
    ["market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_engine::market_lot_size":
    ["market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_engine::market_margin_call_backstop_pct":
    ["market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_engine::market_margin_call_fee_pct":
    ["market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_engine::market_max_leverage":
    ["market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_engine::market_min_size":
    ["market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_engine::market_name":
    ["market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_engine::market_slippage_increment_pct":
    ["market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_engine::market_starting_slippage_pct":
    ["market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_engine::market_sz_decimals":
    ["market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_engine::market_ticker_size":
    ["market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_engine::max_allowed_withdraw_from_cross":
    ["account", "metadata"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_engine::primary_asset_metadata":
    [],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_engine::view_position":
    ["account", "market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_engine::view_position_status":
    ["account", "market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_market::get_best_bid_and_ask_price":
    ["market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_positions::get_maker_volume_in_window":
    ["account"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_positions::get_primary_account_addr":
    ["account"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::perp_positions::get_taker_volume_in_window":
    ["account"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::position_tp_sl::get_fixed_sized_tp_sl_for_key":
    [
      "account",
      "market",
      "is_tp",
      "trigger_price",
      "limit_price",
      "builder_code",
    ],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::position_tp_sl::get_fixed_sized_tp_sl_for_order_id":
    ["account", "market", "is_tp", "order_id"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::position_tp_sl::get_fixed_sized_tp_sl_orders":
    ["account", "market", "is_tp"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::position_tp_sl::get_sl_order":
    ["account", "market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::position_tp_sl::get_tp_order":
    ["account", "market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::position_tp_sl_tracker::get_ready_price_move_down_orders":
    ["market", "mark_price", "limit"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::position_tp_sl_tracker::get_ready_price_move_up_orders":
    ["market", "mark_price", "limit"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::public_apis::close_delisted_position":
    ["address", "market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::public_apis::liquidate_position":
    ["account", "market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::public_apis::liquidate_positions":
    ["accounts", "market"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::public_apis::process_perp_collateral_withdrawals":
    ["max_work_units"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::public_apis::process_perp_market_pending_requests":
    ["market", "max_work_unit"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::trading_fees_manager::get_fee_tier":
    ["user_addr"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::trading_fees_manager::get_global_volume_in_window":
    [],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::trading_fees_manager::get_maker_fees_and_config":
    ["user_addr"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::trading_fees_manager::get_maker_volume_all_time":
    ["user_addr"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::trading_fees_manager::get_maker_volume_in_window":
    ["user_addr"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::trading_fees_manager::get_referral_codes":
    ["user_addr"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::trading_fees_manager::get_referrer_addr":
    ["user_addr"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::trading_fees_manager::get_taker_fees_and_config":
    ["user_addr"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::trading_fees_manager::get_taker_volume_all_time":
    ["user_addr"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::trading_fees_manager::get_taker_volume_in_window":
    ["user_addr"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::trading_fees_manager::get_total_volume_in_window":
    ["user_addr"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::trading_fees_manager::get_user_volume_all_time":
    ["user_addr"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::trading_fees_manager::view_global_volume_history":
    [],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::trading_fees_manager::view_maker_volume_history":
    ["user_addr"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::trading_fees_manager::view_referral_code_state":
    ["referral_code"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::trading_fees_manager::view_referrer_for_code":
    ["referral_code"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::trading_fees_manager::view_referrer_state":
    ["user_addr"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::trading_fees_manager::view_taker_volume_history":
    ["user_addr"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::trading_fees_manager::view_trading_fee_config":
    [],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::vault::get_vault_admin":
    ["vault"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::vault::get_vault_contribution_asset_type":
    ["vault"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::vault::get_vault_net_asset_value":
    ["vault"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::vault::get_vault_net_asset_value_in_contribution_asset":
    ["vault"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::vault::get_vault_num_shares":
    ["vault"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::vault::get_vault_portfolio_subaccounts":
    ["vault"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::vault::get_vault_share_asset_type":
    ["vault"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::vault_admin_api::activate_vault":
    ["admin", "vault"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::vault_admin_api::approve_become_admin":
    ["new_admin", "vault"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::vault_admin_api::cancel_admin_change_request":
    ["admin", "vault"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::vault_admin_api::close_vault":
    ["admin", "vault"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::vault_admin_api::delegate_dex_actions_to":
    ["admin", "vault", "account_to_delegate_to", "expiration_time_s"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::vault_admin_api::request_admin_change":
    ["admin", "vault", "new_admin"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::vault_admin_api::revoke_all_dex_actions_delegations":
    ["admin", "vault"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::vault_admin_api::revoke_dex_actions_delegation":
    ["admin", "vault", "accounts_to_revoke_delegation_from"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::vault_admin_api::set_not_respecting_manager_minimum_shares_requirement":
    ["admin", "vault"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::vault_admin_api::update_vault_manager_subaccount":
    ["admin", "vault", "vault_manager_subaccount"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::vault_admin_api::update_vault_max_outstanding_shares":
    ["admin", "vault", "max_outstanding_shares_when_contributing"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::vault_admin_api::update_vault_use_global_redemption_slippage_adjustment":
    ["admin", "vault", "use_global_redemption_slippage_adjustment"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::vault_api::activate_vault":
    ["admin", "vault"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::vault_api::create_and_fund_vault":
    [
      "creator",
      "funded_from_dex_subaccount",
      "contribution_asset_type",
      "vault_name",
      "vault_description",
      "vault_social_links",
      "vault_share_symbol",
      "vault_share_icon_uri",
      "vault_share_project_uri",
      "fee_bps",
      "fee_interval_s",
      "contribution_lockup_duration_s",
      "initial_funding",
      "accepts_contributions",
      "delegate_to_creator",
    ],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::vault_api::distribute_fees":
    ["vault"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::vault_api::get_max_synchronous_redemption":
    ["vault"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::vault_api::process_pending_requests":
    ["remaining_work_units"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::vault_global_config::halt_vault_module":
    ["admin"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::vault_global_config::open_vault_module":
    ["admin"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::vault_global_config::update_global_creation_fee":
    ["admin", "creation_fee", "creation_fee_recipient"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::vault_global_config::update_global_fee_config":
    ["admin", "max_fee_bps", "min_fee_interval", "max_fee_interval"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::vault_global_config::update_global_redemption_slippage_adjustment":
    [
      "admin",
      "async_adjustment_bps",
      "free_collateral_factor_bps_array",
      "adjustment_bps_array",
    ],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::vault_global_config::update_minimum_contribution_amount":
    ["admin", "minimum_contribution_amount"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::vault_global_config::update_minimum_manager_funds":
    [
      "admin",
      "minimum_manager_funds_fraction_bps",
      "minimum_manager_funds_amount",
    ],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::vault_global_config::update_minimum_redemption_amount":
    ["admin", "minimum_redemption_amount"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::vault_share_asset::can_withdraw":
    ["share_asset", "user", "amount"],
  "0x50ead22afd6ffd9769e3b3d6e0e64a2a350d68e8b102c4e72e33d0b8cfdfdb06::vault_share_asset::get_user_unlocked_balance":
    ["share_asset", "user"],
} as const satisfies FunctionArgumentNameOverrideMap;
