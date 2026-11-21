export const GAME_MODE_SCRIPTS: readonly { file: string; label: string }[] = [
  { file: "Trackmania/TM_TimeAttack_Online.Script.txt", label: "Time Attack" },
  { file: "Trackmania/TM_Laps_Online.Script.txt", label: "Laps" },
  { file: "Trackmania/TM_Rounds_Online.Script.txt", label: "Rounds" },
  { file: "Trackmania/TM_Cup_Online.Script.txt", label: "Cup" },
  { file: "Trackmania/TM_Teams_Online.Script.txt", label: "Teams" },
  { file: "Trackmania/TM_Knockout_Online.Script.txt", label: "Knockout" },
  {
    file: "Trackmania/Deprecated/TM_Champion_Online.Script.txt",
    label: "Champion",
  },
  {
    file: "Trackmania/TM_RoyalTimeAttack_Online.Script.txt",
    label: "Royal Time Attack",
  },
  { file: "Trackmania/TM_StuntMulti_Online.Script.txt", label: "Stunt" },
  { file: "Trackmania/TM_Platform_Online.Script.txt", label: "Platform" },
  { file: "TrackMania/TM_TMWC2023_Online.Script.txt", label: "TMWC 2023" },
  { file: "TrackMania/TM_TMWTTeams_Online.Script.txt", label: "TMWT Teams" },
];

export const gameModeScriptFiles = GAME_MODE_SCRIPTS.map(({ file }) => file);
