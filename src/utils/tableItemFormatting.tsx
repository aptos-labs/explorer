import {Types} from "aptos";
import React from "react";
import {Typography} from "@mui/material";
import HashButton, {HashType} from "../components/HashButton";
import JsonViewCard from "../components/IndividualPageContent/JsonViewCard";
import {parseMoveType, findStructInABI} from "./tableItemParsing";

/**
 * Format an address value
 */
export function formatAddress(value: unknown): React.ReactNode {
  if (typeof value === "string") {
    // Check if it's a valid address format
    if (/^0x[a-fA-F0-9]{1,64}$/.test(value)) {
      return <HashButton hash={value} type={HashType.ACCOUNT} size="small" />;
    }
  }
  return (
    <Typography variant="body1" sx={{fontFamily: "monospace"}}>
      {String(value)}
    </Typography>
  );
}

/**
 * Format a number value (u8, u16, u32, u64, u128, u256)
 */
export function formatNumber(value: unknown): React.ReactNode {
  if (typeof value === "string") {
    try {
      // Try to parse as BigInt for large numbers
      const num = BigInt(value);
      // Format with commas for readability
      const formatted = num.toLocaleString();
      return (
        <Typography variant="body1" sx={{fontFamily: "monospace"}}>
          {formatted}
        </Typography>
      );
    } catch {
      // If parsing fails, just display as string
      return (
        <Typography variant="body1" sx={{fontFamily: "monospace"}}>
          {value}
        </Typography>
      );
    }
  }
  if (typeof value === "number") {
    return (
      <Typography variant="body1" sx={{fontFamily: "monospace"}}>
        {value.toLocaleString()}
      </Typography>
    );
  }
  return (
    <Typography variant="body1" sx={{fontFamily: "monospace"}}>
      {String(value)}
    </Typography>
  );
}

/**
 * Format a boolean value
 */
export function formatBoolean(value: unknown): React.ReactNode {
  const boolValue =
    typeof value === "boolean" ? value : String(value) === "true";
  return (
    <Typography
      variant="body1"
      sx={{
        fontFamily: "monospace",
        color: boolValue ? "success.main" : "text.secondary",
      }}
    >
      {String(boolValue)}
    </Typography>
  );
}

/**
 * Format a vector/array value
 */
export function formatVector(value: unknown): React.ReactNode {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return (
        <Typography variant="body1" sx={{fontFamily: "monospace"}}>
          []
        </Typography>
      );
    }
    return <JsonViewCard data={value} />;
  }
  return (
    <Typography variant="body1" sx={{fontFamily: "monospace"}}>
      {String(value)}
    </Typography>
  );
}

/**
 * Format a struct value using ABI if available
 */
export function formatStruct(
  value: unknown,
  typeString: string,
  abi: Types.MoveModule | undefined,
): React.ReactNode {
  const structInfo = parseMoveType(typeString);
  if (!structInfo) {
    // Fallback to JSON view
    return typeof value === "object" && value !== null ? (
      <JsonViewCard data={value} />
    ) : (
      <Typography variant="body1" sx={{fontFamily: "monospace"}}>
        {String(value)}
      </Typography>
    );
  }

  const structDef = findStructInABI(abi, structInfo.structName);
  if (structDef && typeof value === "object" && value !== null) {
    // We have ABI info, but the value is already parsed by the API
    // Just display it nicely
    return <JsonViewCard data={value} />;
  }

  // Fallback to JSON view
  return typeof value === "object" && value !== null ? (
    <JsonViewCard data={value} />
  ) : (
    <Typography variant="body1" sx={{fontFamily: "monospace"}}>
      {String(value)}
    </Typography>
  );
}

/**
 * Format a value based on its type
 */
export function formatValueByType(
  value: unknown,
  typeString?: string,
  abi?: Types.MoveModule,
): React.ReactNode | null {
  if (!typeString) {
    // No type info, try to infer
    if (typeof value === "object" && value !== null) {
      return <JsonViewCard data={value} />;
    }
    return (
      <Typography variant="body1" sx={{fontFamily: "monospace"}}>
        {String(value)}
      </Typography>
    );
  }

  // Parse the type to determine how to format
  try {
    const typeTag = parseMoveType(typeString);
    if (!typeTag) {
      // Try to parse as primitive
      if (typeString.includes("address")) {
        return formatAddress(value);
      }
      if (typeString.includes("bool")) {
        return formatBoolean(value);
      }
      if (/u\d+/.test(typeString)) {
        return formatNumber(value);
      }
      if (typeString.includes("vector")) {
        return formatVector(value);
      }
      // Default fallback
      return typeof value === "object" && value !== null ? (
        <JsonViewCard data={value} />
      ) : (
        <Typography variant="body1" sx={{fontFamily: "monospace"}}>
          {String(value)}
        </Typography>
      );
    }

    // It's a struct type
    return formatStruct(value, typeString, abi);
  } catch {
    // Parsing failed, fallback
    return typeof value === "object" && value !== null ? (
      <JsonViewCard data={value} />
    ) : (
      <Typography variant="body1" sx={{fontFamily: "monospace"}}>
        {String(value)}
      </Typography>
    );
  }
}

/**
 * Format a key value (similar to formatValueByType but for keys)
 */
export function formatKey(
  keyValue: unknown,
  depth: number = 0,
): React.ReactNode {
  if (depth > 3) {
    // Prevent infinite recursion
    return (
      <Typography variant="body1" sx={{fontFamily: "monospace"}}>
        {String(keyValue)}
      </Typography>
    );
  }

  if (typeof keyValue === "object" && keyValue !== null) {
    if (Array.isArray(keyValue)) {
      return formatVector(keyValue);
    }
    return <JsonViewCard data={keyValue} />;
  }

  if (typeof keyValue === "string") {
    // Check if it looks like an address
    if (/^0x[a-fA-F0-9]{1,64}$/.test(keyValue)) {
      return formatAddress(keyValue);
    }
  }

  return (
    <Typography variant="body1" sx={{fontFamily: "monospace"}}>
      {String(keyValue)}
    </Typography>
  );
}
