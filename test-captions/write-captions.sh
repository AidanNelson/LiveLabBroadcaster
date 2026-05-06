#!/usr/bin/env bash
set -euo pipefail

OUT_FILE="${1:-captions.txt}"
INTERVAL_SECONDS="${2:-1}"

echo "Writing captions to: ${OUT_FILE}"
echo "Interval: ${INTERVAL_SECONDS}s"
echo "Press Ctrl+C to stop."

touch "${OUT_FILE}"

i=1
while true; do
  ts="$(date '+%H:%M:%S')"
  printf '[%s] caption line %03d\n' "${ts}" "${i}" >> "${OUT_FILE}"
  i=$((i + 1))
  sleep "${INTERVAL_SECONDS}"
done
