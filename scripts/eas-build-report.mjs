// Summarises recent EAS builds for CI logs: status, error, and the failing phase's log lines.
// Usage: node scripts/eas-build-report.mjs builds.json   (output of `eas build:list --json`)
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';

const builds = JSON.parse(readFileSync(process.argv[2], 'utf8'));

for (const b of builds) {
  console.log(`\n## Build ${b.id} · #${b.appBuildVersion ?? '?'} · ${b.status} · ${b.createdAt}`);
  if (b.gitCommitHash) console.log(`commit ${b.gitCommitHash} ${b.gitCommitMessage?.split('\n')[0] ?? ''}`);
  if (b.error) console.log('ERROR:', b.error.errorCode, '-', b.error.message);
}

const failed = builds.find((b) => b.status === 'ERRORED' || b.status === 'errored');
if (!failed) process.exit(0);

console.log(`\n# Log of failed build ${failed.id}`);
for (const url of failed.logFiles ?? []) {
  const res = await fetch(url);
  let buf = Buffer.from(await res.arrayBuffer());
  if (buf[0] === 0x1f && buf[1] === 0x8b) buf = gunzipSync(buf);
  // EAS logs are JSON lines: { msg, phase, marker, ... }
  const lines = buf
    .toString('utf8')
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      try {
        const j = JSON.parse(line);
        return `${j.phase ?? ''} ${j.msg ?? ''}`.trim();
      } catch {
        return line;
      }
    });
  const errors = lines.filter((l) => /error|failed|❌/i.test(l));
  console.log('--- lines mentioning errors (last 60) ---');
  console.log(errors.slice(-60).join('\n'));
  console.log('--- last 80 lines ---');
  console.log(lines.slice(-80).join('\n'));
}
