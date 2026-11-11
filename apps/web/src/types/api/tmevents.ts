// Trackmania Events data as the panel hands it to the browser

export interface TmeventsStatus {
  // The panel has a Trackmania Events app and can store its tokens
  configured: boolean;
  connected: boolean;
  // Display name of the connected Trackmania Events player
  name?: string;
}

export interface TmeventsEvent {
  id: string;
  slug: string;
  name: string;
  url: string;
  startsAt: string;
  endsAt: string;
  teamBased: boolean;
}

export interface TmeventsPlayer {
  login: string;
  name: string;
}

export interface TmeventsTeam {
  name: string;
  players: TmeventsPlayer[];
}

export interface TmeventsTrack {
  uid: string;
  name: string;
}

export interface TmeventsStep {
  participant: "A" | "B";
  action: "Pick" | "Ban" | "Random";
}

export interface TmeventsPreset {
  id: string;
  name: string;
  steps: TmeventsStep[];
}

export interface TmeventsEventData {
  event: TmeventsEvent;
  // In the order Trackmania Events returns them, which the import uses as seeding
  teams: TmeventsTeam[];
  players: TmeventsPlayer[];
  tracks: TmeventsTrack[];
  sequence: TmeventsStep[];
  presets: TmeventsPreset[];
}

export interface TmeventsMapsResult {
  // Event tracks now on the server, with their path in the maps folder
  added: { uid: string; fileName: string }[];
  // Names of tracks that could not be downloaded or added
  failed: string[];
}
