import moment from "moment";

function ensureMillisecondTimestamp(timestamp: string): number {
  /*
  Could be: 1646458457
        or: 1646440953658538
   */
  if (timestamp.length > 13) {
    timestamp = timestamp.slice(0, 13);
  }
  if (timestamp.length == 10) {
    timestamp = timestamp + "000";
  }
  return parseInt(timestamp);
}

export function parseTimestamp(timestamp: string): moment.Moment {
  return moment(ensureMillisecondTimestamp(timestamp));
}

export interface TimestampDisplay {
  formatted: string;
  local_formatted: string;
  formatted_time_delta: string;
}

export function timestampDisplay(timestamp: moment.Moment): TimestampDisplay {
  return {
    formatted: timestamp.format("MM/DD/YY HH:mm:ss [UTC]"),
    local_formatted: timestamp.local().format("MM/DD/YYYY HH:mm:ss"),
    formatted_time_delta: timestamp.fromNow(),
  };
}

function truncate(
  str: string,
  frontLen: number,
  backLen: number,
  truncateStr: string,
) {
  if (!str) {
    return "";
  }

  if (!Number.isInteger(frontLen) || !Number.isInteger(backLen)) {
    throw `${frontLen} and ${backLen} should be an Integer`;
  }

  var strLen = str.length;
  // Setting default values
  frontLen = frontLen;
  backLen = backLen;
  truncateStr = truncateStr || "…";
  if (
    (frontLen === 0 && backLen === 0) ||
    frontLen >= strLen ||
    backLen >= strLen ||
    frontLen + backLen >= strLen
  ) {
    return str;
  } else if (backLen === 0) {
    return str.slice(0, frontLen) + truncateStr;
  } else {
    return str.slice(0, frontLen) + truncateStr + str.slice(strLen - backLen);
  }
}

export function truncateAddress(accountAddress: string) {
  return truncate(accountAddress, 6, 4, "…");
}

export function truncateAddressMiddle(accountAddress: string) {
  return truncate(accountAddress, 20, 20, "…");
}

export function isValidAccountAddress(accountAddr: string): boolean {
  // account address is 0x{64 hex characters}
  // with multiple options - 0X, 0x001, 0x1, 0x01
  // can start with that and see if any fails to parsing
  return /^(0[xX])?[a-fA-F0-9]{1,64}$/.test(accountAddr);
}

export function isValidTxnHashOrVersion(txnHashOrVersion: string): boolean {
  return isHex(txnHashOrVersion) || isNumeric(txnHashOrVersion);
}

export function isHex(text: string) {
  // if it's hex, and is <= (64 + 2 for 0x) char long
  return text.startsWith("0x") && text.length <= 66;
}

export function isNumeric(text: string) {
  return /^-?\d+$/.test(text);
}

export function getFormattedTimestamp(timestamp?: string): string {
  if (!timestamp || timestamp === "0") return "-";

  const moment = parseTimestamp(timestamp);
  const timestamp_display = timestampDisplay(moment);

  return timestamp_display.local_formatted;
}

export function getTableFormattedTimestamp(timestamp?: string): string {
  if (!timestamp || timestamp === "0") {
    return "-";
  }

  const timestampMoment = parseTimestamp(timestamp);
  const nowTimestamp = parseTimestamp(moment.now().toString());
  const duration = moment.duration(nowTimestamp.diff(timestampMoment));

  if (duration.asMinutes() < 1) {
    return duration.asSeconds().toFixed(0) + "s ago";
  } else if (duration.asHours() < 1) {
    return duration.asMinutes().toFixed(0) + "m ago";
  } else if (timestampMoment.year() == moment().year()) {
    return timestampMoment.calendar(null, {
      lastDay: "[yesterday] HH:mm",
      sameDay: "[today] HH:mm",
      nextDay: "[tomorrow] HH:mm",
      lastWeek: "MM/D HH:mm",
      nextWeek: "MM/D HH:mm",
      sameElse: "MM/D HH:mm",
    });
  } else {
    return timestampMoment.calendar(null, {
      lastDay: "[yesterday] HH:mm",
      sameDay: "[today] HH:mm",
      nextDay: "[tomorrow] HH:mm",
      lastWeek: "MM/D/YYYY HH:mm",
      nextWeek: "MM/D/YYYY HH:mm",
      sameElse: "MM/D/YYYY HH:mm",
    });
  }
}
