/**
 * Helper function for exhaustiveness checks.
 *
 * Hint: If this function is causing a type error, check to make sure that your
 * switch statement covers all cases!
 */
export function assertNever(x: never): never {
  throw new Error("Unexpected object: " + x);
}

/*
Converts a utf8 string encoded as hex back to string
if hex starts with 0x - ignore this part and start from the 3rd char (at index 2).
*/
export function hex_to_string(hex: string): string {
  var hexString = hex.toString();
  var str = "";
  let n = hex.startsWith("0x") ? 2 : 0;
  for (n; n < hexString.length; n += 2) {
    str += String.fromCharCode(parseInt(hexString.substring(n, n + 2), 16));
  }
  return str;
}
