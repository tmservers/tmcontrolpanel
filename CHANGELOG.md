# Changelog

Release notes of TMControlPanel, newest first. The entries are the descriptions of the [GitHub releases](https://github.com/tmservers/tmcontrolpanel/releases).

## [1.2.0] - 2026-11-28

### New Features

- **Event archive.** The GBX service can store every raw callback of a server as compressed NDJSON in an S3-compatible bucket such as Cloudflare R2, without database or Redis writes. Turn it on with `EVENT_ARCHIVE_ENDPOINT`, `EVENT_ARCHIVE_BUCKET`, `EVENT_ARCHIVE_ACCESS_KEY_ID` and `EVENT_ARCHIVE_SECRET_ACCESS_KEY`, mount a persistent volume at `/data/events`, and enable **Record Events** in each server's settings. See `docs/event-archive.md`.

### Changes

- A plugin callback over the time limit no longer turns the plugin off. The callback is still interrupted, and the server's admins get a warning notification, at most once per plugin every 10 minutes. The limit per callback goes from 100 ms to 500 ms. Crashes, memory, the CPU budget and rate limit abuse still turn a plugin off.
- Personal best lookups for the same map are merged into one Nadeo request, simultaneous world record lookups share one, and map ids are cached for 24 hours, so joins and map changes no longer queue up behind the shared rate limit.
- Plugins that read live data (`ctx.live.liveInfo`, `activePlayers`) several times in one callback get it copied into the sandbox once per callback instead of on every read. Every installed plugin version gets this speedup, for example Live Round on a 27-player lobby uses about seven times less sandbox CPU.
- Requests to eCircuitMania, from the panel and the eCircuitMania plugin, send `NADEO_CONTACT` as the user agent. Other plugin hosts still get the generic one.

### Bug Fixes

- Pausing between the end of a round and its score table no longer makes plugins skip that round or lets the next round overwrite its records. The pause takes effect once the round is scored.
- The event archive stores mode script callbacks that the dedicated server sends as indented JSON under their script event name, instead of as escaped strings under `ManiaPlanet.ModeScriptCallbackArray`.
- Finishes during warm-up and pauses are stored without a match, and finishes of cancelled or repeated runs are detached instead of overwritten.

## [1.1.0] - 2026-11-20

### Breaking changes

- Manialink color themes are replaced by **theme presets**. Servers and groups now pick a preset (Default or Broadcast) or inherit one. Custom color themes saved before this release are ignored and fall back to Default, so pick a preset again on the server or group theme page.
- The plugin API is now **SDK 5**. Plugins built for SDK 4 and older keep working, but the first-party plugin updates listed below need SDK 5 and are only offered to panels on this release.

### New Features

- **Theme presets** for in-game Manialinks, with a preview in the panel. The new **Broadcast** preset gives every core page and first-party widget a broadcast-style layout. Changing a server's preset re-renders open pages in game without a reconnect.
- **Trackmania Events import** in plugin settings. Connect your Trackmania Events account under Settings, Connected apps, then import an event's teams, seeding, maps and pick and ban into a plugin (Match plugin). Every step can be edited before it is applied, and tracks missing from the server are downloaded during the import. Configure with `TMEVENTS_CLIENT_ID`, `TMEVENTS_CLIENT_SECRET` and `TMEVENTS_REDIRECT_URI`.
- **Plugin SDK 5.**
  - Write widgets and windows as TSX components (maniatsx) instead of Handlebars templates, with a shared UI kit (`@tmcontrolpanel/plugin-sdk/ui`: `Page`, `WindowFrame`, `WidgetFrame`, `Panel`, `UiTable`, `Label` and `HideWhileDriving`), typed actions and access to the server's theme preset with `ctx.ui.themeData()`. Handlebars templates still work.
  - Check whether a player is a panel admin of the server with `ctx.players.isAdmin`, and show action buttons only to admins with `adminOnly`.
  - Build paginated tables with the shared `components/table` partial.
  - Subscribe to any dedicated server callback with `gbx:` events (`gbx:*` for all). Manialink answers and tunnel data are never delivered.
  - Report exceptions to the operator's Sentry with `ctx.captureException`, tagged with the plugin and server.
  - Config schemas can declare where a Trackmania Events import writes (`tmevents`).
- "Check for updates" button on the server plugins page, so a newly published plugin version shows up without waiting for the marketplace cache.
- Plugin settings forms show Nadeo display names next to player logins.
- The action group and Codriver window in game are rendered from TSX and follow the server's theme preset.

### Changes

- Page headings moved into the shared panel layout.
- TMControlPanel chat notices use the panel's primary green.
- The Codriver confirmation hint in game is on its own line.
- Published the privacy notice with contact details.

### Bug Fixes

- Plugin list buttons are aligned.
- The Trackmania Events credentials are passed to the web container in the compose files.

### Plugins

The first-party plugins in the marketplace are rewritten as TSX components on SDK 5 and have Broadcast theme layouts. Versions below are the latest published ones.

- **New: Openplanet Control** (`openplanet` 2.1.2). Detects Openplanet and its signature mode, enforces whether it is allowed, which signature modes are accepted and a minimum version (warn, force to spectator or delayed kick), and gives admins a window with every player's signature. Flagged players get a help window that explains how to fix it.
- **New: Team Score** (`team-score` 2.1.1). Head-to-head scoreboard for teams mode with custom team names, colors and logos, a marker for the team leading the round, an orange status strip during warm-up, and automatic team placement for configured players.
- **Match** 1.4.1 → 2.1.6. Imports teams, seeding, maps and pick and ban from Trackmania Events, replacing the CSV team import. Pick and ban rows start below the header, and player name styling no longer leaks into chat messages.
- **eCircuitMania** 1.2.1 → 2.1.1. Failed eCircuitMania requests are reported to Sentry.
- **Map Info** 1.1.1 → 2.1.9. White map names now end in the widget's text color.
- **Live Round** 1.2.1 → 2.1.8 and **Live Ranking** 1.1.1 → 2.1.1. The rank quad is only colored in teams mode.
- **Time Attack Leaderboard** 1.1.1 → 2.1.3. The personal best box is drawn above its row.
- **Admin Help** 1.2.1 → 2.1.1, **Player Info** 1.2.1 → 2.1.1, **Records Info** 1.3.1 → 2.1.7 and **Time Attack Active Runs** 1.1.1 → 2.1.4. Ported to TSX with Broadcast layouts.

## [1.0.0] - 2026-11-06

### TMControlPanel Release

### Breaking changes

- GoControlPanel is now **TMControlPanel**. New name, branding and identifiers.
- The panel is split into two containers: the web panel and a new **GBX service** that holds the dedicated server connections, live updates, match recording and plugins. You now run both images (`tmcontrolpanel` + `tmcontrolpanel-gbx-service`, with `-postgres` variants).
- Server credentials are now stored encrypted.
- Upgrading from the beta is a side-by-side migration. Follow `docs/migrating-beta-to-release.md` before pulling `:latest`.

### New Features

- **Plugin marketplace**: install third-party plugins that run in a sandbox. The built-in plugins are now first-party marketplace packages.
  - Plugin settings use config schemas and tabbed forms.
  - Plugins can send events to other plugins.
  - Manialink themes for plugin UIs (SDK 4).
- **Public API** (`/api/v1`) with API keys per server or group. Covers players, maps, jukebox, game control, chat, server settings, plugins, file manager, fake players and server commands. Interactive docs are built in.
- **Codriver** (experimental): an AI assistant that runs server tasks in the panel or in game via `/co`. Includes budgets, usage history and permissions.
- **Clustering**: run several GBX workers and nodes. Servers are spread across them and handed over automatically, and a cluster status view is included.
- Send selected match rounds to eCircuitMania from Records (admin only).
- File manager: move, rename and download files.
- Hetzner: update Trackmania servers and file managers over SSH.
- Native system commands for server management and diagnostics.
- Database backup script, plus guides for moving the database and Redis to their own host.
- Mode type strings listed in the script generator.
- Trackmania formatting shown in map and nickname pickers.
- New landing page.

### Security

- Admin actions are authorized on the server side for every linked resource, and match deletion and exports are scoped to their server.
- Audit log access limited to targets you administer. Secrets stay out of audit entries and the browser.
- Map downloads restricted to public hosts.
- SSH host keys verified for provisioned servers.
- Security headers and request size limits added.
- Revoking a user's permissions now takes effect on open live connections.
- Runtime dependencies with published advisories upgraded.

### Bug Fixes

- Panel shows a notice instead of crashing when a server is unreachable.
- Servers that have never connected keep retrying instead of giving up.
- Fixed lost records and errors when players connect.
- Chat config is saved before it's applied to the server.
- Dialogs fit on small screens.
- Trackmania-formatted text is escaped properly before rendering.

## [0.12.0-beta] - 2026-08-26

### New Features

- Added button to randomize map order on Maps page.
- Added turn timeout to Match plugin pickban.
- Added controller support to Match plugin pickban.
- Added server messages for: (manage on Plugins page -> Chat tab)
  - Script change
  - Match settings load
  - Script settings change
  - Maplist change

### Bug Fixes

- Fixed checkpoint delta times not being calculated correctly in Live Round plugin

## [0.11.3-beta] - 2026-08-12

### New Features

- Added check to Match plugin config so that there can't be more pickban steps than maps.

### Bug Fixes

- Fixed deprecated web identities request.
- Fixed commands and actions from plugins not unloading.

### Changes

- Updated Next, React, and Next WS packages.

## [0.11.2-beta] - 2026-08-01

### New Features

- Added Sentry support for more detailed telemetry. This is disabled by default, check the [documentation](https://github.com/tmservers/tmcontrolpanel#2-modify-the-configuration) to enable and configure it.

### Changes

- Set max retry count of client connection to 10.

## [0.11.1-beta] - 2026-07-25

### New Features

- Added checkbox to toggle `/help` command to server settings.
- Added option to update existing server when creating a Hetzner server.

## [0.11.0-beta] - 2026-07-25

### New Features

- Added the Match plugin. With this plugin you can manage a match on the server it includes the following features:
  - Script to use for the match.
  - Maps to be used for the match. Select from local maps on the server or pick a folder with maps to use.
  - A pick and ban system.
    - Set player or team mode.
    - Set pick and ban order.
    - Option to let players choose the picked map's position.
    - Integrated pick and ban widget.
  - A lobby map and script.
  - Commands that admins can execute.
    - `/matchstart` - Starts the match.
    - `/matchstop` - Stops the match.
    - `/pause` - Pauses the match.
    - `/unpause` - Unpauses the match.
    - `/pickban` - Starts the pick and ban phase.
    - `/lobby` - Loads the lobby script and map.
    - `/setseeds <seed1> <seed2> ...` - Sets the seeds for the pick and ban order.
- Added the password to the joinlink if set.
- Added modal to view the logs of the following services on a Hetzner server.
  - Dedicated server
  - Filemanager
  - Servercontroller
- Added option to automatically create the server and add it to a group when creating a Trackmania server on Hetzner.
- Added a script generator to generate scripts with custom settings.
- Added config to the Live Round plugin.
  - Local Record text in widget.
  - Option to show points or just a finish flag when someone finishes.
  - Row count to update the number of players to display.
- Added `/help <plugin>` command to get information about a plugin.
- Added more detailed logging, this includes the type of action, the module and the function.

### Bug Fixes

- Removed deleted records from map records.
- Fixed server passwords that contained`$` not working.
- Refresh the map list when adding a new map.
- Fixed Nadeo account names search not returning the correct results.

### Changes

- Changed checkpoint splits from checkpoint diff to time diff in Live Round widget.

## [0.10.0-beta] - 2026-07-06

### New Features

- Added support for Plausible. You can enable Plausible by setting the new `PLAUSIBLE_API_HOST` environment variable.
- Added a filterbox for matchsettings files.
  - Requires the latest version (v1.3.0) for `marijnregterschot/trackmania-server-fm`.
- Added the Advanced page, on this page you can:
  - Manage fake players.
  - Get the server join link.
- Added option to set team points for Teams, TMWT, and TMWC modes.
- Added chat widget to the Live page, with this widget you can:
  - Send messages (Moderator and Admin only).
  - Read live chat.
  - Read chat history.

### Bug Fixes

- Fixed map records including deleted records.
- Fixed records not being deleted when deleting a match.
- Fixed maps getting downloaded to undefined folder when path is empty.
- Fixed mode script settings not being cast to the correct type.

### Changes

- Changed prefix of downloaded TMX maps from `map` to `TMX`.

## [0.9.1-beta] - 2026-07-01

### Bug Fixes

- Fixed players getting filtered out of live round after surpassing points limit in Teams mode.
- Set the correct points repartition when in Teams mode.

### Changes

- Use new `location` field in Hetzner Server object as `datacenter` is deprecated.

## [0.9.0-beta] - 2026-06-09

### New Features

- Added the Server Plugins tab to the Plugins page where you can manage server plugins.
  - Requires the latest version (v1.2.0) for `marijnregterschot/trackmania-server-fm`.
- Added more control for Trackmania servers on Hetzner like restarting and stopping the server.
  - Note this only works for servers created after this release.
- Added input to select SSH keys when creating a Hetzner server.
- Admins can now see all groups.

### Bug Fixes

- Fixed day on TOTD being the previous day.
- Now only sends scores from players who started the round to eCircuitMania.

### Changes

- Renamed Interface page to Plugins.

## [0.8.1-beta] - 2026-05-20

### Bug Fixes

- Fixed the UserData volume being mounted to the wrong directory in ManiaControl.

## [0.8.0-beta] - 2026-04-17

### New Features

- Added team colors to Live Round and Live Rankings plugins for Teams mode.
- Added support for multiple Trackmania servers per Hetzner server.

### Bug Fixes

- Specify server id when storing manialinks.

> Note: Multiserver only works with Hetzner servers created after this release. Server controllers are also not implemented for now.

## [0.7.8-beta] - 2026-04-10

### New Features

- Added button to reload all plugins.

### Bug Fixes

- Clear all Manialinks in cache after start.

## [0.7.7-beta] - 2026-04-08

### New Features

- Added disconnect button to client.

### Changes

- Storing Manialinks in Redis now for more consistency.

## [0.7.6-beta] - 2026-04-03

### New Features

- Added ordering to groups and servers.
- Added record notifiers in Live Round plugin.

## [0.7.5-beta] - 2026-03-29

### Bug Fixes

- Actually log the fucking response. :clown:

## [0.7.4-beta] - 2026-03-29

### Documentation

- Added logging to Trackmania OAuth request.

## [0.7.3-beta] - 2026-03-28

### New Features

- Added next map button under carousel when the current map is not in the map list.

### Bug Fixes

- Fixed records info plugin not resetting records correctly on new map.

## [0.7.2-beta] - 2026-03-27

### New Features

- Added clients page to manage connections to server clients.
- Added option to change text of Local Record widget.

### Bug Fixes

- Fixed bug while retrieving local record on server in group without shareRecords enabled.

### Changes

- Added pino for logging.
- Notification stored for every server admin.

## [0.7.1-beta] - 2026-03-21

### New Features

- Added imports and exports for plugin configs.
- Added export for records.
- Can visit certain pages when server is not connected.

## [0.7.0-beta] - 2026-03-12

### New Features

- Added option to share records between servers in a group.
- Added menu to set the match points of a player on the Live page.
- Added reverse cup mode support.
- Added player info plugin and widget with the following fields:
  - Device
  - Camera
  - Online personal best
  - Local personal best

### Bug Fixes

- Fixed plugin not initializing with correct config.

## [0.6.3-beta] - 2026-01-04

### Bug Fixes

- Updated to latest Next and React versions to fix a vulnerability.

## [0.6.2-beta] - 2025-12-13

### Bug Fixes

- Fixed Hetzner deployment script.

## [0.6.1-beta] - 2025-12-13

### New Features

- Export match data to CSV.

### Bug Fixes

- Fixed Hetzner server setup not working because of missing Handlebars helper.

## [0.6.0-beta] - 2025-11-23

### New Features

- Added TMX map randomizer.
- Added `recording` and `editors` fields to eCircuitMania plugin.
- Added GoControlPanel server UI!
  - Map Info widget
  - Records Info widget
  - Time Attack Leaderboard widget
  - Time Attack Active Runs widget
  - Live Ranking widget
  - Live Round widget
  - Notify Admin widget
  - eCircuitMania window

### Bug Fixes

- Fixed map records showing DNFs as fastest times.
- Fixed TMX infinite scrolling on initial page render.

### Changes

- Removed `commands` table from database.
- Removed `interfaces` table from database.
- Removed interface editor.

## [0.5.0-beta] - 2025-09-11

### New Features

- Added audit logs page. Here admins can see every action done by users.

### Bug Fixes

- Removed clubs from Nadeo OAuth scope.
- Fixed nadeo campaigns not being downloaded in the correct path.
- Fixed being unable to remove maps from map list.

## [0.4.0-beta] - 2025-09-03

### New Features

- Added eCircuitMania plugin. Just enter your key and match data will be sent to eCircuitMania.
- Added points to round records in matches.
- New Nadeo page. Add maps and campaigns uploaded to nadeo. This includes:
  - Track of the Day
  - Weekly Shorts
  - Seasonal Campaigns
  - Club Campaigns
  - Clubs

### Bug Fixes

- Fixed player info not updating correctly on the Live page.

### Documentation

- Updated the docs with the latest pages.
- Added a wiki to the Github repository.

## [0.3.1-beta] - 2025-08-26

### Bug Fixes

- Fixed records being created double for a match.

## [0.3.0-beta] - 2025-08-26

### New Features

- Added Matches! Every time a map gets played a new match will be created. The records driven during the match will be stored.
- Records page. On this page you can see your matches with the records and all the records from the server maps.
- Hetzner Pricing page. In your Hetzner project there is now a page where you can see all the details and pricing of the different servers.

### Bug Fixes

- Fixed select dropdown not being visible when opened in a modal.

### Changes

- Made database name in the server setup optional.
- Filtered databases in the server setup based on the selected server controller.
- Connect to servers on project start instead of on first request.

## [0.2.1-beta] - 2025-08-25

### New Features

- Store SSH keys from created Hetzner servers in the database.

### Bug Fixes

- Live page active players not updating correctly.
- Fixed Hetzner servers not being able to get the IP address consistently.

## [0.2.0-beta] - 2025-08-08

### New Features

- Added option to host database on the same server as the dedicated server.

### Bug Fixes

- Fixed ranking on Live page not being calculated correctly.
- Sending changelog after the images are actually released.

### Changes

- Improved download of TMX mappacks by allowing a longer timeout and having a more efficient download process.

### Known Issues

- TMX might sometimes still timeout if the mappack is very big. The limit is at max 100 maps per mappack right now.

## [0.1.0-beta] - 2025-08-07

### New Features

- Added TMX support. You can search for maps and mappacks and download them or add them straight to your server.

### Bug Fixes

- Fixed background color being the wrong color.

### Changes

- Refactored the commands to be plugins.

> Note: If you had the admin command enabled you need to enable it again.

## [0.0.7-beta] - 2025-08-05

### New Features

- Added a button to remove all maps from the map list.
- Added a button to add all filtered maps to the map list.

### Changes

- Added icons to buttons.

## [0.0.6-beta] - 2025-08-02

### Changes

- Added metadata to the head.
- Updated some CI workflows.

## [0.0.5-beta] - 2025-07-30

### New Features

- Metrics modal for Hetzner servers.

### Bug Fixes

- Fix removing all users when searching for an empty string.

## [0.0.4-beta] - 2025-07-30

### Bug Fixes

- Refreshing table when adding, modifying or deleting a record.
- Fixed servers websocket connection reinitializing everytime you close/open the sidebar on mobile.

### Changes

- Search users now only returns the exact search input.
- Minor consistency changes.
- Added Created At column to every table and added default sort.

## [0.0.3-beta] - 2025-07-28

### New Features

- Added Hetzner server caching so it's easier to add a recently created server.
- Added Servercontroller support to Hetzner for EvoSC, ManiaControl, MiniControl and PyPlanet.
- Added Network and Volume management for Hetzner.
- Added Database setup for Hetzner.

## [0.0.2-beta] - 2025-07-25

### Bug Fixes

- Fixed duplicate mapUid issue if there are multiple maps with the same filename on the server.

## [0.0.1-beta] - 2025-07-25

### New Features

- Added Docker images for both the base MySQL build and a Postgres build.

### Changes

- Updated setup process to include the new Docker image

### Documentation

- Updated setup documentation using the new Docker image

[Unreleased]: https://github.com/tmservers/tmcontrolpanel/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/tmservers/tmcontrolpanel/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/tmservers/tmcontrolpanel/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/tmservers/tmcontrolpanel/compare/v0.12.0-beta...v1.0.0
[0.12.0-beta]: https://github.com/tmservers/tmcontrolpanel/compare/v0.11.3-beta...v0.12.0-beta
[0.11.3-beta]: https://github.com/tmservers/tmcontrolpanel/compare/v0.11.2-beta...v0.11.3-beta
[0.11.2-beta]: https://github.com/tmservers/tmcontrolpanel/compare/v0.11.1-beta...v0.11.2-beta
[0.11.1-beta]: https://github.com/tmservers/tmcontrolpanel/compare/v0.11.0-beta...v0.11.1-beta
[0.11.0-beta]: https://github.com/tmservers/tmcontrolpanel/compare/v0.10.0-beta...v0.11.0-beta
[0.10.0-beta]: https://github.com/tmservers/tmcontrolpanel/compare/v0.9.1-beta...v0.10.0-beta
[0.9.1-beta]: https://github.com/tmservers/tmcontrolpanel/compare/v0.9.0-beta...v0.9.1-beta
[0.9.0-beta]: https://github.com/tmservers/tmcontrolpanel/compare/v0.8.1-beta...v0.9.0-beta
[0.8.1-beta]: https://github.com/tmservers/tmcontrolpanel/compare/v0.8.0-beta...v0.8.1-beta
[0.8.0-beta]: https://github.com/tmservers/tmcontrolpanel/compare/v0.7.8-beta...v0.8.0-beta
[0.7.8-beta]: https://github.com/tmservers/tmcontrolpanel/compare/v0.7.7-beta...v0.7.8-beta
[0.7.7-beta]: https://github.com/tmservers/tmcontrolpanel/compare/v0.7.6-beta...v0.7.7-beta
[0.7.6-beta]: https://github.com/tmservers/tmcontrolpanel/compare/v0.7.5-beta...v0.7.6-beta
[0.7.5-beta]: https://github.com/tmservers/tmcontrolpanel/compare/v0.7.4-beta...v0.7.5-beta
[0.7.4-beta]: https://github.com/tmservers/tmcontrolpanel/compare/v0.7.3-beta...v0.7.4-beta
[0.7.3-beta]: https://github.com/tmservers/tmcontrolpanel/compare/v0.7.2-beta...v0.7.3-beta
[0.7.2-beta]: https://github.com/tmservers/tmcontrolpanel/compare/v0.7.1-beta...v0.7.2-beta
[0.7.1-beta]: https://github.com/tmservers/tmcontrolpanel/compare/v0.7.0-beta...v0.7.1-beta
[0.7.0-beta]: https://github.com/tmservers/tmcontrolpanel/compare/v0.6.3-beta...v0.7.0-beta
[0.6.3-beta]: https://github.com/tmservers/tmcontrolpanel/compare/v0.6.2-beta...v0.6.3-beta
[0.6.2-beta]: https://github.com/tmservers/tmcontrolpanel/compare/v0.6.1-beta...v0.6.2-beta
[0.6.1-beta]: https://github.com/tmservers/tmcontrolpanel/compare/v0.6.0-beta...v0.6.1-beta
[0.6.0-beta]: https://github.com/tmservers/tmcontrolpanel/compare/v0.5.0-beta...v0.6.0-beta
[0.5.0-beta]: https://github.com/tmservers/tmcontrolpanel/compare/v0.4.0-beta...v0.5.0-beta
[0.4.0-beta]: https://github.com/tmservers/tmcontrolpanel/compare/v0.3.1-beta...v0.4.0-beta
[0.3.1-beta]: https://github.com/tmservers/tmcontrolpanel/compare/v0.3.0-beta...v0.3.1-beta
[0.3.0-beta]: https://github.com/tmservers/tmcontrolpanel/compare/v0.2.1-beta...v0.3.0-beta
[0.2.1-beta]: https://github.com/tmservers/tmcontrolpanel/compare/v0.2.0-beta...v0.2.1-beta
[0.2.0-beta]: https://github.com/tmservers/tmcontrolpanel/compare/v0.1.0-beta...v0.2.0-beta
[0.1.0-beta]: https://github.com/tmservers/tmcontrolpanel/compare/v0.0.7-beta...v0.1.0-beta
[0.0.7-beta]: https://github.com/tmservers/tmcontrolpanel/compare/v0.0.6-beta...v0.0.7-beta
[0.0.6-beta]: https://github.com/tmservers/tmcontrolpanel/compare/v0.0.5-beta...v0.0.6-beta
[0.0.5-beta]: https://github.com/tmservers/tmcontrolpanel/compare/v0.0.4-beta...v0.0.5-beta
[0.0.4-beta]: https://github.com/tmservers/tmcontrolpanel/compare/v0.0.3-beta...v0.0.4-beta
[0.0.3-beta]: https://github.com/tmservers/tmcontrolpanel/compare/v0.0.2-beta...v0.0.3-beta
[0.0.2-beta]: https://github.com/tmservers/tmcontrolpanel/compare/v0.0.1-beta...v0.0.2-beta
[0.0.1-beta]: https://github.com/tmservers/tmcontrolpanel/releases/tag/v0.0.1-beta
