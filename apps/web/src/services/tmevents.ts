import { doServerActionWithAuth } from "@/lib/actions";
import {
  isTmeventsConnected,
  tmeventsConfigured,
  tmeventsGet,
} from "@/lib/tmevents/oauth";
import { orderByRanking, type RankingEntry } from "@/lib/tmevents/ranking";
import {
  TmeventsEvent,
  TmeventsEventData,
  TmeventsPlayer,
  TmeventsPreset,
  TmeventsStatus,
  TmeventsStep,
  TmeventsTrack,
} from "@/types/api/tmevents";
import { ServerError, ServerResponse } from "@/types/responses";
import "server-only";
import slugid from "slugid";

// Every signed-in user reads their own Trackmania Events account, so there is no
// panel role to check here. Saving imported settings is checked where they are saved.

interface ApiPlayer {
  id: string;
  accountId: string;
  name: string;
}

function requireConfigured() {
  if (!tmeventsConfigured())
    throw new ServerError(
      "Trackmania Events is not set up on this panel",
      "TmeventsNotConfigured",
    );
}

// Game servers and plugin settings identify players by login, the API by account id
function player(raw: ApiPlayer): TmeventsPlayer {
  return { login: slugid.encode(raw.accountId), name: raw.name };
}

export async function getTmeventsStatus(): Promise<
  ServerResponse<TmeventsStatus>
> {
  return doServerActionWithAuth([], async (session) => {
    if (!tmeventsConfigured()) return { configured: false, connected: false };
    if (!(await isTmeventsConnected(session.user.id)))
      return { configured: true, connected: false };
    try {
      const me = await tmeventsGet<ApiPlayer>(session.user.id, "/me");
      return { configured: true, connected: true, name: me.name };
    } catch (error) {
      // The link was revoked on Trackmania Events
      if (error instanceof Error && error.name === "TmeventsNotConnected")
        return { configured: true, connected: false };
      throw error;
    }
  });
}

export async function getTmeventsEvents(): Promise<
  ServerResponse<TmeventsEvent[]>
> {
  return doServerActionWithAuth([], async (session) => {
    requireConfigured();
    const { events } = await tmeventsGet<{ events: TmeventsEvent[] }>(
      session.user.id,
      "/events",
    );
    return events
      .map(({ id, slug, name, url, startsAt, endsAt, teamBased }) => ({
        id,
        slug,
        name,
        url,
        startsAt,
        endsAt,
        teamBased,
      }))
      .sort((a, b) => b.startsAt.localeCompare(a.startsAt));
  });
}

export async function getTmeventsEventData(
  eventId: string,
): Promise<ServerResponse<TmeventsEventData>> {
  return doServerActionWithAuth([], async (session) => {
    requireConfigured();
    const base = `/events/${encodeURIComponent(eventId)}`;
    const get = <T>(path: string) =>
      tmeventsGet<T>(session.user.id, `${base}${path}`);
    const [event, teams, players, tracks, pickBan, ranking] = await Promise.all(
      [
        get<TmeventsEvent>(""),
        get<{ teams: { id: string; name: string; players: ApiPlayer[] }[] }>(
          "/teams",
        ),
        get<{ players: ApiPlayer[] }>("/players"),
        get<{ tracks: TmeventsTrack[] }>("/tracks"),
        get<{ sequence: TmeventsStep[]; presets: TmeventsPreset[] }>(
          "/pick-ban",
        ),
        // Seeding only; without it the import keeps the registration order
        get<{ entries: RankingEntry[] }>("/ranking").catch(() => null),
      ],
    );
    const seeds = ranking?.entries ?? [];
    const ranked = (id: string) => {
      const entry = seeds.find((item) => item.id === id);
      return {
        seed: entry?.seed ?? null,
        averagePosition: entry?.averagePosition ?? null,
      };
    };
    return {
      event: {
        id: event.id,
        slug: event.slug,
        name: event.name,
        url: event.url,
        startsAt: event.startsAt,
        endsAt: event.endsAt,
        teamBased: event.teamBased,
      },
      teams: orderByRanking(teams.teams, (team) => team.id, seeds).map(
        (team) => ({
          name: team.name,
          players: team.players.map(player),
          ...ranked(team.id),
        }),
      ),
      players: orderByRanking(players.players, (entry) => entry.id, seeds).map(
        (entry) => ({ ...player(entry), ...ranked(entry.id) }),
      ),
      tracks: tracks.tracks.map(({ uid, name }) => ({ uid, name })),
      sequence: pickBan.sequence,
      presets: pickBan.presets,
    };
  });
}
