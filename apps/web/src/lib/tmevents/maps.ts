import { addMapFilesAs } from "@/actions/gbx/server-only/bulk-maps";
import { type Actor, requirePermission } from "@/lib/actor";
import { downloadFile, getMapsInfo } from "@/lib/api/nadeo";
import { getLogger } from "@/lib/logger";
import type { TmeventsMapsResult } from "@/types/api/tmevents";
import { ServerError } from "@/types/responses";
import { serverPermissions } from "@tmcontrolpanel/shared";
import "server-only";
import { tmeventsGet } from "./oauth";

// An event has a handful of tracks; this keeps a bad request from downloading a campaign
const MAX_MAPS = 50;

// Downloads event tracks from Nadeo and adds them to the server. Only UIDs that belong
// to the event are used, read again as the user so the browser can't add other maps.
export async function addTmeventsMapsAs(
  actor: Actor,
  serverId: string,
  eventId: string,
  uids: string[],
): Promise<TmeventsMapsResult> {
  requirePermission(actor, serverPermissions.admin, serverId);
  if (!actor.userId)
    throw new ServerError("Sign in to the panel first", "Unauthorized");

  const base = `/events/${encodeURIComponent(eventId)}`;
  const [event, { tracks }] = await Promise.all([
    tmeventsGet<{ name: string }>(actor.userId, base),
    tmeventsGet<{ tracks: { uid: string; name: string }[] }>(
      actor.userId,
      `${base}/tracks`,
    ),
  ]);
  const wanted = tracks
    .filter(
      (track, index) =>
        uids.includes(track.uid) &&
        tracks.findIndex((other) => other.uid === track.uid) === index,
    )
    .slice(0, MAX_MAPS);
  const result: TmeventsMapsResult = { added: [], failed: [] };
  if (wanted.length === 0) return result;

  const { data: infos, error } = await getMapsInfo(
    wanted.map((track) => track.uid),
  );
  if (error || !infos)
    throw new ServerError(
      "Nadeo did not return the event's maps",
      "NadeoMapsError",
    );

  const log = getLogger(serverId);
  const files: { uid: string; file: File }[] = [];
  const downloads = await Promise.allSettled(
    wanted.map(async (track) => {
      const info = infos.find((item) => item.mapUid === track.uid);
      // Tracks that were never uploaded to Nadeo can't be downloaded from it
      if (!info) throw new Error("Not on Nadeo");
      return {
        uid: track.uid,
        file: await downloadFile(info.fileUrl, info.filename),
      };
    }),
  );
  downloads.forEach((download, index) => {
    if (download.status === "fulfilled") files.push(download.value);
    else {
      log.warn(
        { err: download.reason, mapUid: wanted[index].uid },
        "Trackmania Events map download failed",
      );
      result.failed.push(wanted[index].name);
    }
  });
  if (files.length === 0) return result;

  const { paths, failed } = await addMapFilesAs(
    actor,
    serverId,
    files.map((item) => item.file),
    `Trackmania Events ${event.name}`,
    "server.tmevents.maps.add",
    { eventId, uids: files.map((item) => item.uid) },
  );
  for (const { uid, file } of files) {
    const path = paths.find((item) => item.endsWith(`/${file.name}`));
    if (path) result.added.push({ uid, fileName: path });
    else if (failed.includes(file.name))
      result.failed.push(
        wanted.find((track) => track.uid === uid)?.name ?? uid,
      );
  }
  return result;
}
