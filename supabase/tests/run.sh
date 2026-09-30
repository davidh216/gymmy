#!/usr/bin/env bash
# Runs the migration and scenario tests against a throwaway local Postgres database.
# Needs a local Postgres you can reach as the postgres superuser.
set -euo pipefail
cd "$(dirname "$0")"
DB=gymmy_migration_test
PSQL=(psql -q -t -v ON_ERROR_STOP=1)
if [ "$(id -u)" = 0 ]; then RUN=(sudo -u postgres); else RUN=(); fi
"${RUN[@]}" dropdb --if-exists "$DB"
"${RUN[@]}" createdb "$DB"
trap '"${RUN[@]}" dropdb --if-exists "$DB"' EXIT
"${RUN[@]}" "${PSQL[@]}" -d "$DB" -f stubs.sql -f ../migrations/*.sql -f gyms.test.sql 2>&1 \
  | grep -E 'ok - |FAILED|ERROR|PASSED' | sed 's/.*NOTICE:  //'
