import {describe, it, expect} from "vitest";
import {
  truncateAddress,
  truncateAddressMiddle,
  isValidAccountAddress,
  is32ByteHex,
  isNumeric,
  standardizeAddress,
  tryStandardizeAddress,
  isValidStruct,
  isValidUrl,
  isValidIpfsUrl,
  toIpfsUrl,
  toIpfsDisplayUrl,
  formatNumber,
  octaToApt,
  formatApt,
  ensureMillisecondTimestamp,
  ensureBigInt,
  ensureBoolean,
  getAssetSymbol,
  isRateLimitError,
  extractPrivateViewFunctions,
} from "./utils";

describe("Address utilities", () => {
  describe("truncateAddress", () => {
    it("should truncate a long address", () => {
      const address =
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
      expect(truncateAddress(address)).toBe("0x1234…cdef");
    });

    it("should handle short addresses", () => {
      const address = "0x1234";
      expect(truncateAddress(address)).toBe("0x1234");
    });

    it("should handle empty string", () => {
      expect(truncateAddress("")).toBe("");
    });
  });

  describe("truncateAddressMiddle", () => {
    it("should truncate with more context", () => {
      const address =
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
      // truncateAddressMiddle uses 20 chars on each side
      expect(truncateAddressMiddle(address)).toBe(
        "0x1234567890abcdef12…cdef1234567890abcdef",
      );
    });
  });

  describe("isValidAccountAddress", () => {
    it("should validate full 64-char hex addresses", () => {
      expect(
        isValidAccountAddress(
          "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        ),
      ).toBe(true);
    });

    it("should validate short hex addresses with 0x prefix", () => {
      expect(isValidAccountAddress("0x1")).toBe(true);
      expect(isValidAccountAddress("0x123")).toBe(true);
    });

    it("should validate addresses without 0x prefix (64 chars)", () => {
      expect(
        isValidAccountAddress(
          "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        ),
      ).toBe(true);
    });

    it("should reject invalid addresses", () => {
      expect(isValidAccountAddress("invalid")).toBe(false);
      expect(isValidAccountAddress("0xGGGG")).toBe(false);
      expect(isValidAccountAddress("")).toBe(false);
    });
  });

  describe("standardizeAddress", () => {
    it("should standardize short addresses to 64 chars", () => {
      const result = standardizeAddress("0x1");
      expect(result).toBe(
        "0x0000000000000000000000000000000000000000000000000000000000000001",
      );
    });

    it("should lowercase addresses", () => {
      const result = standardizeAddress(
        "0xABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890",
      );
      expect(result).toBe(
        "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      );
    });
  });

  describe("tryStandardizeAddress", () => {
    it("should return standardized address for valid input", () => {
      const result = tryStandardizeAddress("0x1");
      expect(result).toBe(
        "0x0000000000000000000000000000000000000000000000000000000000000001",
      );
    });

    it("should return undefined for null/undefined", () => {
      expect(tryStandardizeAddress(null)).toBe(undefined);
      expect(tryStandardizeAddress(undefined)).toBe(undefined);
    });

    it("should return undefined for invalid addresses", () => {
      expect(tryStandardizeAddress("invalid")).toBe(undefined);
    });
  });
});

describe("Hex and numeric validation", () => {
  describe("is32ByteHex", () => {
    it("should validate 64-char hex strings", () => {
      expect(
        is32ByteHex(
          "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        ),
      ).toBe(true);
    });

    it("should validate 64-char hex with 0x prefix", () => {
      expect(
        is32ByteHex(
          "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        ),
      ).toBe(true);
    });

    it("should reject non-64-char strings", () => {
      expect(is32ByteHex("1234")).toBe(false);
      expect(is32ByteHex("")).toBe(false);
    });
  });

  describe("isNumeric", () => {
    it("should validate positive integers", () => {
      expect(isNumeric("123")).toBe(true);
      expect(isNumeric("0")).toBe(true);
    });

    it("should validate negative integers", () => {
      expect(isNumeric("-123")).toBe(true);
    });

    it("should reject non-numeric strings", () => {
      expect(isNumeric("12.34")).toBe(false);
      expect(isNumeric("abc")).toBe(false);
      expect(isNumeric("")).toBe(false);
    });
  });
});

describe("Struct validation", () => {
  describe("isValidStruct", () => {
    it("should validate correct struct types", () => {
      expect(isValidStruct("0x1::aptos_coin::AptosCoin")).toBe(true);
      expect(
        isValidStruct("0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"),
      ).toBe(true);
    });

    it("should reject invalid struct types", () => {
      expect(isValidStruct("invalid")).toBe(false);
      expect(isValidStruct("0x1")).toBe(false);
      expect(isValidStruct("")).toBe(false);
    });
  });
});

describe("URL validation", () => {
  describe("isValidUrl", () => {
    it("should validate correct URLs", () => {
      expect(isValidUrl("https://example.com")).toBe(true);
      expect(isValidUrl("http://localhost:3000")).toBe(true);
    });

    it("should reject invalid URLs", () => {
      expect(isValidUrl("not a url")).toBe(false);
      expect(isValidUrl("")).toBe(false);
    });
  });

  describe("isValidIpfsUrl", () => {
    it("should validate ipfs:// protocol", () => {
      expect(isValidIpfsUrl("ipfs://QmHash123")).toBe(true);
    });

    it("should validate ipns:// protocol", () => {
      expect(isValidIpfsUrl("ipns://QmHash123")).toBe(true);
    });

    it("should validate gateway URLs", () => {
      expect(isValidIpfsUrl("https://ipfs.io/ipfs/QmHash123")).toBe(true);
      expect(isValidIpfsUrl("https://gateway.com/ipns/QmHash123")).toBe(true);
    });

    it("should reject non-IPFS URLs", () => {
      expect(isValidIpfsUrl("https://example.com")).toBe(false);
      expect(isValidIpfsUrl("")).toBe(false);
    });
  });

  describe("toIpfsUrl", () => {
    it("should convert ipfs:// to gateway URL", () => {
      expect(toIpfsUrl("ipfs://QmHash123")).toBe(
        "https://ipfs.io/ipfs/QmHash123",
      );
    });

    it("should convert ipns:// to gateway URL", () => {
      expect(toIpfsUrl("ipns://QmHash123")).toBe(
        "https://ipfs.io/ipns/QmHash123",
      );
    });

    it("should convert gateway URL to ipfs.io", () => {
      expect(toIpfsUrl("https://other-gateway.com/ipfs/QmHash123")).toBe(
        "https://ipfs.io/ipfs/QmHash123",
      );
    });
  });

  describe("toIpfsDisplayUrl", () => {
    it("should convert gateway URL to native format", () => {
      expect(toIpfsDisplayUrl("https://ipfs.io/ipfs/QmHash123")).toBe(
        "ipfs://QmHash123",
      );
    });

    it("should keep native format unchanged", () => {
      expect(toIpfsDisplayUrl("ipfs://QmHash123")).toBe("ipfs://QmHash123");
    });
  });
});

describe("Formatting utilities", () => {
  describe("formatNumber", () => {
    it("should format numbers with commas", () => {
      expect(formatNumber(1000)).toBe("1,000");
      expect(formatNumber(1000000)).toBe("1,000,000");
    });

    it("should handle string numbers", () => {
      expect(formatNumber("1234567")).toBe("1,234,567");
    });
  });

  describe("octaToApt", () => {
    it("should convert octa to APT", () => {
      expect(octaToApt(100000000)).toBe(1);
      expect(octaToApt(50000000)).toBe(0.5);
    });

    it("should handle bigint", () => {
      expect(octaToApt(BigInt(100000000))).toBe(1);
    });
  });

  describe("formatApt", () => {
    it("should format APT amounts with suffix", () => {
      expect(formatApt(100000000)).toBe("1.00 APT");
      expect(formatApt(150000000)).toBe("1.50 APT");
    });

    it("should respect decimal places", () => {
      expect(formatApt(123456789, 4)).toBe("1.2346 APT");
    });
  });
});

describe("Timestamp utilities", () => {
  describe("ensureMillisecondTimestamp", () => {
    it("should handle microsecond timestamps", () => {
      const result = ensureMillisecondTimestamp("1609459200000000");
      expect(result).toBe(BigInt(1609459200000));
    });

    it("should handle second timestamps", () => {
      const result = ensureMillisecondTimestamp("1609459200");
      expect(result).toBe(BigInt(1609459200000));
    });

    it("should handle millisecond timestamps", () => {
      const result = ensureMillisecondTimestamp("1609459200000");
      expect(result).toBe(BigInt(1609459200000));
    });

    it("should handle null/undefined", () => {
      expect(ensureMillisecondTimestamp(null)).toBe(BigInt(0));
      expect(ensureMillisecondTimestamp(undefined)).toBe(BigInt(0));
    });
  });
});

describe("Type coercion utilities", () => {
  describe("ensureBigInt", () => {
    it("should convert number to bigint", () => {
      expect(ensureBigInt(123)).toBe(BigInt(123));
    });

    it("should convert string to bigint", () => {
      expect(ensureBigInt("123")).toBe(BigInt(123));
    });

    it("should pass through bigint", () => {
      expect(ensureBigInt(BigInt(123))).toBe(BigInt(123));
    });
  });

  describe("ensureBoolean", () => {
    it("should pass through booleans", () => {
      expect(ensureBoolean(true)).toBe(true);
      expect(ensureBoolean(false)).toBe(false);
    });

    it("should convert string booleans", () => {
      expect(ensureBoolean("true")).toBe(true);
      expect(ensureBoolean("false")).toBe(false);
    });

    it("should throw for invalid strings", () => {
      expect(() => ensureBoolean("yes")).toThrow();
    });
  });
});

describe("Asset utilities", () => {
  describe("getAssetSymbol", () => {
    it("should return panoraSymbol with bridge info", () => {
      expect(getAssetSymbol("USDC", "Wormhole", "USDCe")).toBe(
        "USDC (Wormhole USDCe)",
      );
    });

    it("should return panoraSymbol with original symbol", () => {
      expect(getAssetSymbol("zUSDC", null, "USDC")).toBe("zUSDC (USDC)");
    });

    it("should return symbol when no panoraSymbol", () => {
      expect(getAssetSymbol(null, null, "APT")).toBe("APT");
    });

    it("should return 'Unknown Symbol' for no symbols", () => {
      expect(getAssetSymbol(null, null, null)).toBe("Unknown Symbol");
    });
  });
});

describe("Error utilities", () => {
  describe("isRateLimitError", () => {
    it("should detect 429 status errors", () => {
      expect(isRateLimitError({status: 429})).toBe(true);
    });

    it("should detect 'Too Many Requests' type errors", () => {
      expect(isRateLimitError({type: "Too Many Requests"})).toBe(true);
    });

    it("should return false for other errors", () => {
      expect(isRateLimitError({status: 500})).toBe(false);
      expect(isRateLimitError(null)).toBe(false);
      expect(isRateLimitError(undefined)).toBe(false);
    });
  });
});

describe("Move source code parsing", () => {
  describe("extractPrivateViewFunctions", () => {
    it("should extract simple private view function", () => {
      const source = `
        module market {
          #[view]
          fun get_price(): u64 {
            100
          }
        }
      `;
      const functions = extractPrivateViewFunctions(source);
      expect(functions).toHaveLength(1);
      expect(functions[0].name).toBe("get_price");
      expect(functions[0].is_view).toBe(true);
      expect(functions[0].visibility).toBe("private");
      expect(functions[0].params).toEqual([]);
      expect(functions[0].return).toEqual(["u64"]);
    });

    it("should extract private view function without newline after #[view]", () => {
      const source = `
        module market {
          #[view] fun get_price(): u64 {
            100
          }
        }
      `;
      const functions = extractPrivateViewFunctions(source);
      expect(functions).toHaveLength(1);
      expect(functions[0].name).toBe("get_price");
      expect(functions[0].is_view).toBe(true);
    });

    it("should extract private view function with parameters", () => {
      const source = `
        module market {
          #[view]
          fun index_orders(market_id: u64, user: address): vector<Order> {
            // implementation
          }
        }
      `;
      const functions = extractPrivateViewFunctions(source);
      expect(functions).toHaveLength(1);
      expect(functions[0].name).toBe("index_orders");
      expect(functions[0].params).toEqual(["u64", "address"]);
      expect(functions[0].return).toEqual(["vector<Order>"]);
    });

    it("should extract private view function with generic type parameters", () => {
      const source = `
        module market {
          #[view]
          fun get_value<T: copy + drop>(key: u64): T {
            // implementation
          }
        }
      `;
      const functions = extractPrivateViewFunctions(source);
      expect(functions).toHaveLength(1);
      expect(functions[0].name).toBe("get_value");
      expect(functions[0].generic_type_params).toHaveLength(1);
      expect(functions[0].generic_type_params[0].constraints).toEqual([
        "copy",
        "drop",
      ]);
      expect(functions[0].params).toEqual(["u64"]);
      expect(functions[0].return).toEqual(["T"]);
    });

    it("should extract private view function with tuple return", () => {
      const source = `
        module market {
          #[view]
          fun get_stats(): (u64, u128, bool) {
            (100, 1000, true)
          }
        }
      `;
      const functions = extractPrivateViewFunctions(source);
      expect(functions).toHaveLength(1);
      expect(functions[0].name).toBe("get_stats");
      expect(functions[0].return).toEqual(["u64", "u128", "bool"]);
    });

    it("should extract multiple private view functions", () => {
      const source = `
        module market {
          #[view]
          fun get_price(): u64 {
            100
          }

          public fun not_a_view(): bool {
            true
          }

          #[view]
          fun get_count(addr: address): u64 {
            10
          }
        }
      `;
      const functions = extractPrivateViewFunctions(source);
      expect(functions).toHaveLength(2);
      expect(functions[0].name).toBe("get_price");
      expect(functions[1].name).toBe("get_count");
    });

    it("should not extract public view functions", () => {
      const source = `
        module market {
          #[view]
          public fun get_price(): u64 {
            100
          }
        }
      `;
      const functions = extractPrivateViewFunctions(source);
      expect(functions).toHaveLength(0);
    });

    it("should handle complex parameter types", () => {
      const source = `
        module market {
          #[view]
          fun complex_fn(
            orders: vector<Order>,
            opt: 0x1::option::Option<address>,
            ref: &signer
          ): (bool, vector<u8>) {
            (true, vector::empty())
          }
        }
      `;
      const functions = extractPrivateViewFunctions(source);
      expect(functions).toHaveLength(1);
      expect(functions[0].params).toEqual([
        "vector<Order>",
        "0x1::option::Option<address>",
        "&signer",
      ]);
      expect(functions[0].return).toEqual(["bool", "vector<u8>"]);
    });

    it("should return empty array for source without private view functions", () => {
      const source = `
        module market {
          public fun do_something(): bool {
            true
          }
        }
      `;
      const functions = extractPrivateViewFunctions(source);
      expect(functions).toEqual([]);
    });

    it("should extract private view function with acquires clause", () => {
      const source = `
        module market {
          #[view]
          fun index_orders(market_id: u64): Orders
          acquires OrderBooks {
            // implementation
          }
        }
      `;
      const functions = extractPrivateViewFunctions(source);
      expect(functions).toHaveLength(1);
      expect(functions[0].name).toBe("index_orders");
      expect(functions[0].params).toEqual(["u64"]);
      expect(functions[0].return).toEqual(["Orders"]);
    });

    it("should return empty array for empty source", () => {
      const functions = extractPrivateViewFunctions("");
      expect(functions).toEqual([]);
    });
  });
});
