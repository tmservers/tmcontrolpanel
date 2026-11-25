# Event archive

The GBX service can store raw callbacks from opted-in dedicated servers in Cloudflare R2. Recording is off by default and also needs **Record Events** enabled in that server's settings.

## Setup

1. Create an R2 bucket. Create an API token with **Object Read & Write** access to that bucket only. Keep the bucket private. Use separate buckets for staging and production.
2. Add all four credentials to the GBX service environment. Leave all four unset to keep the archive off. Setting only some stops the service at startup:

   ```env
   EVENT_ARCHIVE_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
   EVENT_ARCHIVE_BUCKET=<bucket-name>
   EVENT_ARCHIVE_ACCESS_KEY_ID=<access-key-id>
   EVENT_ARCHIVE_SECRET_ACCESS_KEY=<secret-access-key>
   ```

   `EVENT_ARCHIVE_SPOOL_DIR` defaults to `/data/events`. `EVENT_ARCHIVE_SPOOL_MB` defaults to `1024`; when the spool is larger, new events are dropped and counted. `EVENT_ARCHIVE_SKIP_REPLIES` defaults to `false`; set it to `true` to skip script callbacks with a non-empty `responseid`, such as plugins polling `Trackmania.GetScores`.

3. Mount a persistent, writable volume at `/data/events`. The container uses uid 1001. Without persistent storage, events not yet uploaded are lost when the container is recreated.
4. Enable **Record Events** on each server that should be recorded. The setting defaults off.
5. Add an R2 lifecycle rule to remove objects after your chosen retention period. Ninety days is a suggested starting point.

## Format and pipeline

The service buffers events in memory and appends them to a local spool file per server every two seconds. It seals a file at 1 MB or one hour, compresses it with zstd level 1, uploads it, then deletes the local file. Failed uploads remain in the spool and are retried. A crash can lose about two seconds of buffered events. Files left by a crashed process are picked up for upload about two hours later by any GBX process using the same spool directory. The archive does not use the database or Redis.

Object keys are `<serverId>/<YYYY>/<MM>/<DD>/<HHmmss>-<startMs>-<instance>-<seq>.ndjson.zst`. The date and time are UTC and say when the file was started, up to two seconds after its first event.

Each line is a JSON array: `[receivedAtMs, name, payload]`. The time is when the controller received the callback. Mode script callbacks use the script event name, such as `Trackmania.Event.WayPoint`, and the script's JSON payload with its line breaks and indentation removed. Other callbacks use the XML-RPC method name and an array of arguments. Service lines are `TMControlPanel.Connected`, `TMControlPanel.Disconnected`, and `TMControlPanel.Dropped` with `{"count":n}`. Events while the controller is disconnected are not recorded. Replies to the controller's own method calls are not recorded; only callbacks are stored. A crash or full disk can leave a broken line, so readers should skip lines that do not parse.

## Read events

Use rclone to copy one day's objects, then decompress and filter them. For example:

```sh
rclone copy remote:bucket/<serverId>/2026/11/25 ./events
zstd -dc ./events/*.zst | jq -cR 'fromjson? | select(.[1]=="Trackmania.Event.WayPoint")'
```

## Limits, cost, and privacy

Plan for 50 KB compressed per player-hour. A synthetic load test measured about 27 KB in a typical case and 55 KB in a heavy case. Estimate monthly storage in GB as `servers × average players × 0.0365`. R2 Standard costs $0.015 per GB-month, with 10 GB free and free egress. Check [Cloudflare R2 pricing](https://developers.cloudflare.com/r2/pricing/).

The archive can contain chat, logins, account IDs, and manialink form input. Objects do not expire by themselves; configure an R2 lifecycle rule. To delete one server's archive, remove its `<serverId>/` prefix. Removing one player requires rewriting objects. Turning **Record Events** off stops recording but keeps stored objects.
