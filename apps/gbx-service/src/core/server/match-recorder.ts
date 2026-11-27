import type { Scores, Waypoint } from "@tmcontrolpanel/shared";
import type { GbxConnection } from "../gbx/connection";
import type { LiveState } from "../live/live-state";
import type { Logger } from "../logger";
import type {
  MapRecord,
  MatchRepository,
  RecordInput,
  RecordRepository,
  UserRepository,
} from "../ports";
import { fetchPlayerInfo } from "./players";

export interface MatchRecorderDeps {
  serverId: string;
  state: LiveState;
  gbx: GbxConnection;
  matches: MatchRepository;
  records: RecordRepository;
  users: UserRepository;
  syncMap(): Promise<void>;
  log: Logger;
}

// Persists matches, finishes and round results for the current map
export class MatchRecorder {
  private writes: Promise<void> = Promise.resolve();
  private finishedRound = "";
  private readonly finished = new Set<string>();

  constructor(private readonly deps: MatchRecorderDeps) {}

  async startMatch(mode: string): Promise<void> {
    const { state, log } = this.deps;
    const map = state.activeMapRecord;

    if (!map) {
      // Records are still stored without a match; failing the connect over this helps nobody
      log.error("No active map, match not created");
      state.currentMatchId = null;
      return;
    }

    const match = await this.deps.matches.create({
      serverId: this.deps.serverId,
      mapId: map.id,
      mode,
    });
    state.currentMatchId = match.id;
  }

  // Every finish is stored; warm-up and pause finishes just belong to no match
  async recordFinish(waypoint: Waypoint): Promise<void> {
    const { state } = this.deps;
    const live = this.isLive();
    const matchId = live ? state.currentMatchId : null;
    const round = live ? this.claimRound() : null;
    const repeated = this.markFinished(matchId, round, waypoint.login);
    const known = this.knownMap();

    await this.enqueue(async () => {
      const map = known ?? (await this.resolveMap());
      if (!map) {
        this.deps.log.error({ waypoint }, "No active map, finish not saved");
        return;
      }
      if (repeated && matchId !== null && round !== null) {
        await this.detach(matchId, round, waypoint.login);
      }
      await this.save({
        ...this.base(map, matchId, round),
        login: waypoint.login,
        time: waypoint.racetime,
        checkpoints: waypoint.curracecheckpoints || [],
      });
    });
  }

  async recordRound(scores: Scores): Promise<void> {
    if (!this.isLive()) return;
    const matchId = this.deps.state.currentMatchId;
    const round = this.claimRound();
    const known = this.knownMap();

    await this.enqueue(async () => {
      const map = known ?? (await this.resolveMap());
      if (!map) {
        this.deps.log.error("No active map, round not saved");
        return;
      }
      for (const player of scores.players) {
        await this.save({
          ...this.base(map, matchId, round),
          login: player.login,
          time: player.prevracetime,
          checkpoints: player.prevracecheckpoints || [],
          points: player.roundpoints,
        });
      }
    });
  }

  // Keeps the finishes of the current round, which is about to be replayed
  async releaseRound(): Promise<void> {
    const { currentMatchId, roundNumber } = this.deps.state;
    this.finished.clear();
    if (currentMatchId === null || !roundNumber) return;
    await this.enqueue(() => this.detach(currentMatchId, roundNumber));
  }

  private isLive(): boolean {
    const { isWarmUp, isPaused } = this.deps.state.liveInfo;
    return !isWarmUp && !isPaused;
  }

  // A finish before the first StartRound belongs to round 1
  private claimRound(): number | null {
    const { state } = this.deps;
    if (state.roundNumber === 0) state.roundNumber = 1;
    return state.roundNumber;
  }

  // Whether this player already finished in this round
  private markFinished(
    matchId: string | null,
    round: number | null,
    login: string,
  ): boolean {
    if (matchId === null || round === null) return false;
    const key = `${matchId}:${round}`;
    if (this.finishedRound !== key) {
      this.finishedRound = key;
      this.finished.clear();
    }
    const repeated = this.finished.has(login);
    this.finished.add(login);
    return repeated;
  }

  // Writes run in event order, so a detach never overtakes the finish it is for
  private enqueue(task: () => Promise<void>): Promise<void> {
    const run = this.writes.then(task);
    this.writes = run.catch(() => {});
    return run;
  }

  // null while the map on the server has no synced row yet
  private knownMap(): MapRecord | null {
    const { activeMapRecord, liveInfo } = this.deps.state;
    if (!activeMapRecord) return null;
    const current = liveInfo.currentMap;
    return !current || current === activeMapRecord.uid ? activeMapRecord : null;
  }

  private async resolveMap(): Promise<MapRecord | null> {
    const known = this.knownMap();
    if (known) return known;
    try {
      await this.deps.syncMap();
      return this.deps.state.activeMapRecord;
    } catch (error) {
      this.deps.log.error({ err: error }, "Failed to sync the active map");
      return null;
    }
  }

  private base(map: MapRecord, matchId: string | null, round: number | null) {
    return {
      serverId: this.deps.serverId,
      matchId,
      round,
      mapId: map.id,
      mapUid: map.uid,
    };
  }

  private async detach(matchId: string, round: number, login?: string) {
    try {
      await this.deps.records.detachFinishes(matchId, round, login);
    } catch (error) {
      this.deps.log.error(
        { err: error, matchId, round, login },
        "Failed to detach finishes",
      );
    }
  }

  // A record can fail when the login has no users row yet; create it and retry once
  private async save(record: RecordInput): Promise<void> {
    const { records, log } = this.deps;
    try {
      await records.save(record);
      return;
    } catch (error) {
      log.warn(
        { err: error, login: record.login },
        "Saving record failed, syncing player",
      );
    }

    try {
      await this.ensureUser(record.login);
      await records.save(record);
    } catch (error) {
      log.error({ err: error, record }, "Failed to save record");
    }
  }

  private async ensureUser(login: string): Promise<void> {
    let nickName = login;
    try {
      nickName = (await fetchPlayerInfo(this.deps.gbx, login)).nickName;
    } catch {
      // Player may have left already; the login is a fine placeholder
    }
    await this.deps.users.ensureExists(login, nickName);
  }
}
