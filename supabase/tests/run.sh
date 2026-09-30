#!/usr/bin/env bash
# Runs every migration plus the scenario tests against a throwaway local Postgres database.
# Needs a local Postgres you can reach as the postgres superuser.
set -euo pipefail
cd "$(dirname "$0")"
DB=gymmy_migration_test
if [ "$(id -u)" = 0 ]; then RUN=(sudo -u postgres); else RUN=(); fi

FILES=(-f stubs.sql)
for f in ../migrations/*.sql; do FILES+=(-f "$f"); done
for f in gyms.test.sql moderation.test.sql; do FILES+=(-f "$f"); done

"${RUN[@]}" dropdb --if-exists "$DB" 2>/dev/null
"${RUN[@]}" createdb "$DB"
trap '"${RUN[@]}" dropdb --if-exists "$DB"' EXIT
OUT=$("${RUN[@]}" psql -q -t -v ON_ERROR_STOP=1 -d "$DB" "${FILES[@]}" 2>&1) || {
  echo "$OUT" | grep -E 'ok - |ERROR|FAILED' | sed 's/.*NOTICE:  //'
  exit 1
}
echo "$OUT" | grep -E 'ok - |PASSED' | sed 's/.*NOTICE:  //'
