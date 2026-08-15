#!/bin/sh
set -e

printenv | grep -E '^(CRON_SECRET|CRON_TARGET)=' > /etc/cron-env

cat > /etc/crontabs/root <<'EOF'
0 8 * * * . /etc/cron-env && curl -fsS -m 60 -X POST -H "x-cron-secret: $CRON_SECRET" "$CRON_TARGET" > /proc/1/fd/1 2>&1
EOF

exec crond -f -l 8 -L /dev/stdout
