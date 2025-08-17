import React, { useEffect, useMemo, useState } from "react";
import { DateTime } from "luxon";

export function DateTimeWithTimezoneInput({ timestamp, timezone, onChange }) {
  const [localDateTime, setLocalDateTime] = useState("");
  const [currentZone, setCurrentZone] = useState("UTC");

  const allTimezones = useMemo(() => {
    if (typeof Intl === "undefined" || !Intl.supportedValuesOf) {
      // Fallback list for older environments
      return ["UTC", "America/New_York"];
    }
    return Intl.supportedValuesOf("timeZone");
  }, []);

  // Set initial datetime and timezone
  useEffect(() => {
    if (!timestamp || !timezone) return;

    const zone = allTimezones.includes(timezone) ? timezone : "UTC";

    const dt = DateTime.fromISO(timestamp, { zone: "utc" })
      .setZone(zone)
      .startOf("minute");
    setLocalDateTime(dt.toFormat("yyyy-MM-dd'T'HH:mm"));
    setCurrentZone(timezone);
  }, [timestamp, timezone, allTimezones]);

  const emitChange = (dtStr, tz) => {
    if (!dtStr) return;

    const dt = DateTime.fromFormat(dtStr, "yyyy-MM-dd'T'HH:mm", {
      zone: tz,
    });

    if (dt.isValid) {
      const isoString = dt.toISO();
      console.log("Emitting ISO string:", isoString);
      onChange?.({
        timestamp: isoString,
        timezone: tz,
      }); // emits ISO with zone offset
    }
  };

  const handleDateTimeChange = (e) => {
    const newValue = e.target.value;
    setLocalDateTime(newValue);
    emitChange(newValue, timezone);
  };

  const handleTimezoneChange = (e) => {
    const newTz = e.target.value;
    setCurrentZone(newTz);
    emitChange(localDateTime, newTz);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <label>
        Date & Time:
        <input
          type="datetime-local"
          value={localDateTime}
          onChange={handleDateTimeChange}
        />
      </label>

      <label>
        Timezone:
        <select
          value={currentZone}
          onChange={handleTimezoneChange}
          style={{ maxWidth: "300px" }}
        >
          {allTimezones.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
