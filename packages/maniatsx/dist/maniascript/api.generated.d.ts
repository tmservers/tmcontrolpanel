import type { Integer, Real, Text, Boolean, Void, Ident, Vec2, Vec3, Int2, Int3 } from "./types.js";
/** This is the base Manialink page interface. Supported declare modes : - Local - Persistent */
export interface CMlScript extends CNod {
    readonly Page: CMlPage | null;
    readonly PageIsVisible: Boolean;
    PageAlwaysUpdateScript: Boolean;
    readonly Now: Integer;
    readonly Period: Integer;
    readonly CurrentTime: Integer;
    /** Local user structure. */
    readonly LocalUser: CUser | null;
    readonly LoadedTitle: CTitle | null;
    PendingEvents: (CMlScriptEvent | null)[];
    Dbg_WarnOnDroppedEvents: Boolean;
    readonly MouseX: Real;
    readonly MouseY: Real;
    readonly MouseLeftButton: Boolean;
    readonly MouseRightButton: Boolean;
    readonly MouseMiddleButton: Boolean;
    readonly KeyUp: Boolean;
    readonly KeyDown: Boolean;
    readonly KeyLeft: Boolean;
    readonly KeyRight: Boolean;
    readonly KeyReturn: Boolean;
    readonly KeySpace: Boolean;
    readonly KeyDelete: Boolean;
    EnableMenuNavigationInputs: Boolean;
    readonly IsMenuNavigationForeground: Boolean;
    readonly Xml: CParsingManager | null;
    readonly Http: CHttpManager | null;
    readonly Video: CVideoManager | null;
    readonly Audio: CAudioManager | null;
    readonly Input: CInputManager | null;
    readonly DataFileMgr: CDataFileMgr | null;
    readonly ScoreMgr: CScoreMgr | null;
    readonly ZoneMgr: CRankingsZoneMgr | null;
    readonly UserMgr: CUserV2Manager | null;
    readonly AnimMgr: CAnimManager | null;
    readonly MenuSceneMgr: CMenuSceneManager | null;
    readonly System: CSystemPlatform | null;
    readonly WSNotificationMgr: CWSNotificationManager | null;
    Dbg_SetProcessed(Event: CMlScriptEvent | null): Void;
    IsKeyPressed(KeyCode: Integer): Boolean;
    EnableMenuNavigation(EnableInputs: Boolean, WithAutoFocus: Boolean, AutoBackControl: CMlControl | null, InputPriority: Integer): Void;
    EnableMenuNavigation(EnableInputs: Boolean, WithAutoFocus: Boolean, WithManualScroll: Boolean, AutoBackControl: CMlControl | null, InputPriority: Integer): Void;
    OpenLink(Url: Text, LinkType: CMlScript.LinkType): Void;
    TriggerPageAction(ActionString: Text): Void;
    /** Send a custom event to the owner of the layer. */
    SendCustomEvent(Type: Text, Data: Text[]): Void;
    PreloadImage(ImageUrl: Text): Void;
    PreloadAll(): Void;
    Dbg_DumpDeclareForVariables(Nod: CNod | null, StatsOnly: Boolean): Text;
    FilterProfanities(TextToFilter: Text): Text;
}
export declare const CMlScript: Readonly<{
    readonly LinkType: Readonly<{
        ExternalBrowser: "CMlScript::LinkType::ExternalBrowser";
        ManialinkBrowser: "CMlScript::LinkType::ManialinkBrowser";
        Goto: "CMlScript::LinkType::Goto";
        ExternalFromId: "CMlScript::LinkType::ExternalFromId";
        ManialinkFromId: "CMlScript::LinkType::ManialinkFromId";
        GotoFromId: "CMlScript::LinkType::GotoFromId";
    }>;
}>;
export declare namespace CMlScript {
    type LinkType = (typeof CMlScript.LinkType)[keyof typeof CMlScript.LinkType];
}
/** API for Maniaplanet client scripts. Supported declare modes : - Local - Persistent */
export interface CManiaApp extends CNod {
    readonly ManiaAppUrl: Text;
    readonly ManiaAppBaseUrl: Text;
    readonly Now: Integer;
    readonly IsVisible: Boolean;
    LayersDefaultManialinkVersion: Integer;
    readonly LocalUser: CUser | null;
    readonly LoadedTitle: CTitle | null;
    EnableMenuNavigationInputs: Boolean;
    UILayers: (CUILayer | null)[];
    readonly Xml: CParsingManager | null;
    readonly Http: CHttpManager | null;
    readonly Video: CVideoManager | null;
    readonly Audio: CAudioManager | null;
    readonly Input: CInputManager | null;
    readonly DataFileMgr: CDataFileMgr | null;
    readonly ScoreMgr: CScoreMgr | null;
    readonly ZoneMgr: CRankingsZoneMgr | null;
    readonly TrackingMgr: CTrackingMgr | null;
    readonly UserMgr: CUserV2Manager | null;
    readonly WSNotificationMgr: CWSNotificationManager | null;
    readonly System: CSystemPlatform | null;
    TTS_Disabled: Boolean;
    UILayerCreate(): CUILayer | null;
    UILayerDestroy(Layer: CUILayer | null): Void;
    UILayerDestroyAll(): Void;
    LayerCustomEvent(Layer: CUILayer | null, Type: Text, Data: Text[]): Void;
    OpenLink(Url: Text, LinkType: CManiaApp.ELinkType): Void;
    /** Explore to given file or folder. Returns False if it does not exist on the filesystem. (may be because it is in a pack) */
    OpenFileInExplorer(FileName: Text): Boolean;
    Dialog_Message(Message: Text): Void;
    Dbg_DumpDeclareForVariables(Nod: CNod | null, StatsOnly: Boolean): Text;
    TTS_Context_Enter(Level: Integer): Ident;
    TTS_Context_Leave(ContextId: Ident): Ident;
    TTS_Context_Change(ContextId: Ident, Control: CMlControl | null): Void;
    TTS_Context_Change(ContextId: Ident, Text: Text, Translate: Boolean): Void;
    TTS_Context_Read(Level: Integer): Void;
    TTS_Context_Read(ContextId: Ident): Void;
    FilterProfanities(TextToFilter: Text): Text;
}
export declare const CManiaApp: Readonly<{
    readonly ELinkType: Readonly<{
        ExternalBrowser: "CManiaApp::ELinkType::ExternalBrowser";
        ManialinkBrowser: "CManiaApp::ELinkType::ManialinkBrowser";
    }>;
}>;
export declare namespace CManiaApp {
    type ELinkType = (typeof CManiaApp.ELinkType)[keyof typeof CManiaApp.ELinkType];
}
/** API for editor plugins. Supported declare modes : - Local - Persistent */
export interface CEditorMainPlugin extends CAnyEditorPlugin {
    Plugins: (CEditorPluginHandle | null)[];
    Modules: (CGameModuleEditorBase | null)[];
    Help_Open(): Void;
    Help_Close(): Void;
    GetPluginHandle(Name: Text): CEditorPluginHandle | null;
    SendPluginEvent(Handle: CEditorPluginHandle | null, Type: Text, Data: Text[]): Void;
    Context_SetActive(ContextName: Text, IsActive: Boolean): Void;
    Context_IsActive(ContextName: Text): Boolean;
    Binding_IsActive(BindingName: Text): Boolean;
    Binding_IsActive(ContextName: Text, BindingName: Text): Boolean;
    Plugin_SetClearance(Handle: CEditorPluginHandle | null, API: CEditorMainPlugin.EMeshEditorAPI, IsAllowed: Boolean): Void;
    Module_Load(ModuleName: Text): Void;
}
export declare const CEditorMainPlugin: Readonly<{
    readonly EMeshEditorAPI: Readonly<{
        Materials: "CEditorMainPlugin::EMeshEditorAPI::Materials";
        Interactions: "CEditorMainPlugin::EMeshEditorAPI::Interactions";
        Display: "CEditorMainPlugin::EMeshEditorAPI::Display";
        Global: "CEditorMainPlugin::EMeshEditorAPI::Global";
        Sets: "CEditorMainPlugin::EMeshEditorAPI::Sets";
        Voxel: "CEditorMainPlugin::EMeshEditorAPI::Voxel";
        PickInfo: "CEditorMainPlugin::EMeshEditorAPI::PickInfo";
        UndoRedo: "CEditorMainPlugin::EMeshEditorAPI::UndoRedo";
    }>;
}>;
export declare namespace CEditorMainPlugin {
    type EMeshEditorAPI = (typeof CEditorMainPlugin.EMeshEditorAPI)[keyof typeof CEditorMainPlugin.EMeshEditorAPI];
}
/** Server plugin Supported declare modes : - Local - Persistent */
export interface CServerPlugin extends CNod {
    readonly LoadedTitle: CTitle | null;
    readonly MapInfo: CMapInfo | null;
    /** Currently connected Users. */
    Clients: (CClient | null)[];
    /** Users connected as spectators. */
    Spectators: (CClient | null)[];
    /** Users connected as players. */
    Players: (CClient | null)[];
    /** Sorted scores. */
    Scores: (CScore | null)[];
    Users: (CUser | null)[];
    Teams: (CTeam | null)[];
    NeutralEmblemUrl: Text;
    ForcedClubLinkUrl1: Text;
    ForcedClubLinkUrl2: Text;
    ClansNbPlayers: Integer[];
    ClanScores: Integer[];
    readonly Now: Integer;
    PendingEvents: (CServerPluginEvent | null)[];
    readonly MapLoaded: Boolean;
    readonly MapUnloadRequested: Boolean;
    MapList: (CMapInfo | null)[];
    readonly CurMapIndex: Integer;
    NextMapIndex: Integer;
    HoldMapUnloadRequest: Boolean;
    /** Enable minimap on the clients, even if the mode does not do it. */
    Client_ComputeMinimap: Boolean;
    readonly UIManager: CUIConfigMgr | null;
    readonly ServerAdmin: CServerAdmin | null;
    readonly XmlRpc: CXmlRpc | null;
    readonly Xml: CParsingManager | null;
    readonly Http: CHttpManager | null;
    readonly System: CSystemPlatform | null;
    TaskResults: (CTaskResult | null)[];
    Ghosts: (CGhost | null)[];
    GetClient(Login: Text): CClient | null;
    GetClient(UI: CUIConfig | null): CClient | null;
    GetClient(Login: CUser | null): CClient | null;
    GetClientFromWebServicesUserId(WebServicesUserId: Text): CClient | null;
    GetPlaygroundPlayer(Login: Text): CPlayer | null;
    TweakTeamColorsToAvoidHueOverlap(): Void;
    TriggerModeScriptEvent(Type: Text, Data: Text[]): Void;
    SendModeScriptCommand(CommandName: Text, BoolVal: Boolean): Void;
    SendModeScriptCommand(CommandName: Text, IntVal: Integer): Void;
    SendModeScriptCommand(CommandName: Text, RealVal: Real): Void;
    SendModeScriptCommand(CommandName: Text, TextVal: Text): Void;
    SendModeScriptCommand(CommandName: Text, Vec2Val: Vec2): Void;
    SendModeScriptCommand(CommandName: Text, Vec3Val: Vec3): Void;
    SendModeScriptCommand(CommandName: Text, Int2Val: Int2): Void;
    SendModeScriptCommand(CommandName: Text, Int3Val: Int3): Void;
    RestartMap(): Void;
    NextMap(): Void;
    Dbg_DumpDeclareForVariables(Nod: CNod | null, StatsOnly: Boolean): Text;
    TaskResult_Release(TaskResultId: Ident): Void;
    Ghost_Download(Url: Text): CTaskResult_Ghost | null;
    GhostDriver_Playlist_Clear(Player: CPlayer | null): Void;
    GhostDriver_Playlist_Add(Player: CPlayer | null, Ghost: CGhost | null): Void;
}
/** Documentation for class CNotification_PrestigeEarned */
export interface CNotification_PrestigeEarned extends CNotification_Prestige {
    readonly CategoryType: Text;
    readonly CategoryLevel: Integer;
    readonly Mode: string;
    readonly PrestigeId: Text;
    readonly PrestigeLevel: Integer;
    readonly PrestigeLevelMax: Integer;
    readonly RewardDisplayName: Text;
    readonly RewardFileUrl: Text;
    readonly RewardThumbnailUrl: Text;
    readonly RewardType: Text;
    readonly SkinOptions: Text;
    readonly StatCurrentValue: Integer;
    readonly StatValueForCurrentLevel: Integer;
    readonly StatValueForNextLevel: Integer;
    readonly TimeStamp: Integer;
    readonly Year: Integer;
}
/** Documentation for class CNotification_SquadDeleted */
export interface CNotification_SquadDeleted extends CNotification_Squad {
    readonly SquadId: Text;
    readonly SquadType: Text;
    readonly TimeStamp: Integer;
}
/** Documentation for class CNotification_SquadInvitationAccepted */
export interface CNotification_SquadInvitationAccepted extends CNotification_Squad {
    readonly InvitedAccountId: Text;
    readonly InvitedCountryFlagUrl: Text;
    readonly InvitedDisplayName: Text;
    readonly InvitedIsCommunicationRestricted: Boolean;
    readonly InvitedIsFirstPartyDisplayName: Boolean;
    readonly InvitedSkinOptions: Text;
    InvitedSkinList: (CSkinInfo | null)[];
    readonly InvitedWebServicesUserId: Text;
    readonly SquadId: Text;
    readonly SquadType: Text;
    readonly TimeStamp: Integer;
}
/** Documentation for class CNotification_SquadInvitationAdded */
export interface CNotification_SquadInvitationAdded extends CNotification_Squad {
    readonly InvitedAccountId: Text;
    readonly InvitedCountryFlagUrl: Text;
    readonly InvitedDisplayName: Text;
    readonly InvitedIsFirstPartyDisplayName: Boolean;
    readonly InvitedWebServicesUserId: Text;
    readonly InviterAccountId: Text;
    readonly InviterCountryFlagUrl: Text;
    readonly InviterDisplayName: Text;
    readonly InviterIsFirstPartyDisplayName: Boolean;
    readonly InviterWebServicesUserId: Text;
    readonly SquadId: Text;
    readonly SquadType: Text;
    readonly TimeStamp: Integer;
}
/** Documentation for class CNotification_SquadInvitationCanceled */
export interface CNotification_SquadInvitationCanceled extends CNotification_Squad {
    readonly CancelerAccountId: Text;
    readonly CancelerCountryFlagUrl: Text;
    readonly CancelerDisplayName: Text;
    readonly CancelerIsFirstPartyDisplayName: Boolean;
    readonly CancelerWebServicesUserId: Text;
    readonly InvitedAccountId: Text;
    readonly InvitedCountryFlagUrl: Text;
    readonly InvitedDisplayName: Text;
    readonly InvitedIsFirstPartyDisplayName: Boolean;
    readonly InvitedWebServicesUserId: Text;
    readonly SquadId: Text;
    readonly SquadType: Text;
    readonly TimeStamp: Integer;
}
/** Documentation for class CNotification_SquadInvitationCanceledForExitingPlayer */
export interface CNotification_SquadInvitationCanceledForExitingPlayer extends CNotification_Squad {
    readonly InvitedAccountId: Text;
    readonly InvitedCountryFlagUrl: Text;
    readonly InvitedDisplayName: Text;
    readonly InvitedIsFirstPartyDisplayName: Boolean;
    readonly InvitedWebServicesUserId: Text;
    readonly SquadId: Text;
    readonly SquadType: Text;
    readonly TimeStamp: Integer;
}
/** Documentation for class CNotification_SquadInvitationCanceledForFullSquad */
export interface CNotification_SquadInvitationCanceledForFullSquad extends CNotification_Squad {
    readonly InvitedAccountId: Text;
    readonly InvitedCountryFlagUrl: Text;
    readonly InvitedDisplayName: Text;
    readonly InvitedIsFirstPartyDisplayName: Boolean;
    readonly InvitedWebServicesUserId: Text;
    readonly SquadId: Text;
    readonly SquadType: Text;
    readonly TimeStamp: Integer;
}
/** Documentation for class CNotification_SquadInvitationDeclined */
export interface CNotification_SquadInvitationDeclined extends CNotification_Squad {
    readonly InvitedAccountId: Text;
    readonly InvitedCountryFlagUrl: Text;
    readonly InvitedDisplayName: Text;
    readonly InvitedIsFirstPartyDisplayName: Boolean;
    readonly InvitedWebServicesUserId: Text;
    readonly SquadId: Text;
    readonly SquadType: Text;
    readonly TimeStamp: Integer;
}
/** Documentation for class CNotification_SquadInvitationReceived */
export interface CNotification_SquadInvitationReceived extends CNotification_Squad {
    readonly InviterAccountId: Text;
    readonly InviterCountryFlagUrl: Text;
    readonly InviterDisplayName: Text;
    readonly InviterIsFirstPartyDisplayName: Boolean;
    readonly InviterWebServicesUserId: Text;
    readonly SquadId: Text;
    readonly SquadType: Text;
    readonly TimeStamp: Integer;
}
/** Documentation for class CNotification_SquadLockStateUpdated */
export interface CNotification_SquadLockStateUpdated extends CNotification_Squad {
    readonly SquadId: Text;
    readonly SquadType: Text;
    readonly IsLocked: Boolean;
    readonly TimeStamp: Integer;
}
/** Documentation for class CNotification_SquadMemberAdded */
export interface CNotification_SquadMemberAdded extends CNotification_Squad {
    readonly MemberAccountId: Text;
    readonly MemberCountryFlagUrl: Text;
    readonly MemberDisplayName: Text;
    readonly MemberIsCommunicationRestricted: Boolean;
    readonly MemberIsFirstPartyDisplayName: Boolean;
    readonly MemberSkinOptions: Text;
    MemberSkinList: (CSkinInfo | null)[];
    readonly MemberWebServicesUserId: Text;
    readonly SquadId: Text;
    readonly SquadType: Text;
    readonly TimeStamp: Integer;
}
/** Documentation for class CNotification_SquadMemberKicked */
export interface CNotification_SquadMemberKicked extends CNotification_Squad {
    readonly KickerAccountId: Text;
    readonly KickerCountryFlagUrl: Text;
    readonly KickerDisplayName: Text;
    readonly KickerIsFirstPartyDisplayName: Boolean;
    readonly KickerWebServicesUserId: Text;
    readonly MemberAccountId: Text;
    readonly MemberCountryFlagUrl: Text;
    readonly MemberDisplayName: Text;
    readonly MemberIsFirstPartyDisplayName: Boolean;
    readonly MemberWebServicesUserId: Text;
    readonly SquadId: Text;
    readonly SquadType: Text;
    readonly TimeStamp: Integer;
}
/** Documentation for class CNotification_SquadMemberRemoved */
export interface CNotification_SquadMemberRemoved extends CNotification_Squad {
    readonly MemberAccountId: Text;
    readonly MemberCountryFlagUrl: Text;
    readonly MemberDisplayName: Text;
    readonly MemberIsFirstPartyDisplayName: Boolean;
    readonly MemberWebServicesUserId: Text;
    readonly SquadId: Text;
    readonly SquadType: Text;
    readonly TimeStamp: Integer;
}
/** Documentation for class CNotification_SquadUpdated */
export interface CNotification_SquadUpdated extends CNotification_Squad {
    readonly SquadId: Text;
    readonly SquadType: Text;
    readonly LeaderAccountId: Text;
    readonly LeaderWebServicesUserId: Text;
    readonly WasForcedToLeaveDueToCrossPlaySetting: Boolean;
    readonly TimeStamp: Integer;
}
/** Documentation for class CAccountTrophyGainForHistory */
export interface CAccountTrophyGainForHistory extends CAccountTrophyGain {
    TrophyAchievement: CTrophyAchievement | null;
}
/** Documentation for class CAccountTrophyGainForHistory_CompetitionMatch */
export interface CAccountTrophyGainForHistory_CompetitionMatch extends CAccountTrophyGainForHistory {
    readonly Rank: Integer;
    TrophyAchievement_CompetitionMatch: CTrophyAchievement_CompetitionMatch | null;
}
/** Documentation for class CAccountTrophyGainForHistory_CompetitionRanking */
export interface CAccountTrophyGainForHistory_CompetitionRanking extends CAccountTrophyGainForHistory {
    readonly Rank: Integer;
    TrophyAchievement_CompetitionRanking: CTrophyAchievement_CompetitionRanking | null;
}
/** Documentation for class CAccountTrophyGainForHistory_LiveMatch */
export interface CAccountTrophyGainForHistory_LiveMatch extends CAccountTrophyGainForHistory {
    readonly Rank: Integer;
    TrophyAchievement_LiveMatch: CTrophyAchievement_LiveMatch | null;
}
/** Documentation for class CAccountTrophyGainForHistory_SoloMedal */
export interface CAccountTrophyGainForHistory_SoloMedal extends CAccountTrophyGainForHistory {
    readonly Level: Integer;
    readonly PreviousLevel: Integer;
    TrophyAchievement_SoloMedal: CTrophyAchievement_SoloMedal | null;
}
/** Documentation for class CAccountTrophyGainForHistory_SoloRanking */
export interface CAccountTrophyGainForHistory_SoloRanking extends CAccountTrophyGainForHistory {
    readonly Rank: Integer;
    TrophyAchievement_SoloRanking: CTrophyAchievement_SoloRanking | null;
}
/** Documentation for class CTrophyAchievement_CompetitionMatch */
export interface CTrophyAchievement_CompetitionMatch extends CTrophyAchievement {
    readonly CompetitionId: Text;
    readonly CompetitionMatchInfo: Text;
    readonly CompetitionName: Text;
    readonly CompetitionStage: Text;
    readonly CompetitionStageStep: Text;
    readonly CompetitionType: Text;
    readonly ServerId: Text;
}
/** Documentation for class CTrophyAchievement_CompetitionRanking */
export interface CTrophyAchievement_CompetitionRanking extends CTrophyAchievement {
    readonly CompetitionId: Text;
    readonly CompetitionName: Text;
    readonly CompetitionStage: Text;
    readonly CompetitionStageStep: Text;
    readonly CompetitionType: Text;
}
/** Documentation for class CTrophyAchievement_LiveMatch */
export interface CTrophyAchievement_LiveMatch extends CTrophyAchievement {
    readonly Duration: Integer;
    readonly GameMode: Text;
    readonly GameModeCustomData: Text;
    readonly IsOfficial: Boolean;
    readonly ServerId: Text;
}
/** Documentation for class CTrophyAchievement_SoloMedal */
export interface CTrophyAchievement_SoloMedal extends CTrophyAchievement {
    readonly SoloMedalAchievementType: Text;
}
/** Documentation for class CTrophyAchievement_SoloRanking */
export interface CTrophyAchievement_SoloRanking extends CTrophyAchievement {
    readonly MapId: Text;
    readonly SeasonId: Text;
    readonly SoloRankingAchievementType: Text;
}
/** Rules API for ShootMania gamemodes. Supported declare modes : - Local - Persistent */
export interface CSmMode extends Omit<CMode, "PassOn" | "Discard"> {
    StartTime: Integer;
    EndTime: Integer;
    SpawnInvulnerabilityDuration: Integer;
    UnspawnAnimDuration: Integer;
    SpawnDelayDuration: Integer;
    RespawnBehaviour: CSmMode.ERespawnBehaviour;
    CheckpointBehaviour: CSmMode.ECheckpointBehaviour;
    GiveUpBehaviour: CSmMode.EGiveUpBehaviour;
    GiveUpBehaviour_RespawnAfter: Boolean;
    GiveUpBehaviour_SkipAfterFinishLine: Boolean;
    /** If not 0, we use this number of laps instead of the number defined in the map */
    LapCountOverride: Integer;
    UseMultiClans: Boolean;
    UseClans: Boolean;
    UseForcedClans: Boolean;
    UsePvECollisions: Boolean;
    UsePvPCollisions: Boolean;
    UseGuns: Boolean;
    UsePvPWeapons: Boolean;
    UseInterractiveScreensIn3d: Boolean;
    UseLaserVsBullets: Boolean;
    UseLaserSkewering: Boolean;
    UsePlayerTagging: Boolean;
    UseBeaconsWithRecipients: Boolean;
    UseAmmoBonusOnHit: Boolean;
    UseSameWallJump: Boolean;
    UseDefaultActionEvents: Boolean;
    UseLaunchedCheckpoints: Boolean;
    ReadonlyLaunchedCheckpoints: Boolean;
    CharCanFly: Boolean;
    UseProtectClanmates: Boolean;
    UseAllies: Boolean;
    UseStunts: Boolean;
    CanReTriggerLatestWaypoint: Boolean;
    /** Declare that the game mode will only use forced models, so the client can avoid preloading player own skins. */
    DisableDefaultSkinPreload: Boolean;
    GameplayVersion: Integer;
    Gameplay: CSmMode.EGameplay;
    OffZoneRadius: Real;
    OffZoneRadiusSpeed: Real;
    OffZoneCenterLandmarkId: Ident;
    readonly PlayersNbTotal: Integer;
    readonly PlayersNbAlive: Integer;
    readonly PlayersNbDead: Integer;
    readonly ClansNbTotal: Integer;
    readonly ClansNbAlive: Integer;
    readonly ClansNbDead: Integer;
    ClansNbPlayers: Integer[];
    ClansNbPlayersAlive: Integer[];
    Players: (CSmPlayer | null)[];
    BotPlayers: (CSmPlayer | null)[];
    Spectators: (CSmPlayer | null)[];
    AllPlayers: (CSmPlayer | null)[];
    PendingEvents: (CSmModeEvent | null)[];
    MapBases: (CSmMapBase | null)[];
    MapLandmarks: (CSmMapLandmark | null)[];
    MapLandmarks_PlayerSpawn: (CSmMapLandmark | null)[];
    MapLandmarks_Gauge: (CSmMapLandmark | null)[];
    MapLandmarks_Sector: (CSmMapLandmark | null)[];
    MapLandmarks_BotPath: (CSmMapLandmark | null)[];
    MapLandmarks_BotSpawn: (CSmMapLandmark | null)[];
    MapLandmarks_ObjectAnchor: (CSmMapLandmark | null)[];
    MapLandmarks_Gate: (CSmMapLandmark | null)[];
    MapLandmarks_Foundation: (CSmMapLandmark | null)[];
    UiScoresPointsLimit: Integer;
    Scores: (CSmScore | null)[];
    ClanScores: Integer[];
    readonly Scores_SortCriteria: CSmMode.ESmScoreSortOrder;
    Scores_AutoUpdateLadderRank: Boolean;
    Scores_AutoUploadPersonalBests: Boolean;
    Bots_AutoSpawn: Boolean;
    Bots_AutoRespawn: Boolean;
    Bots_AutoIgnoreBotEvents: Boolean;
    /** Navigation maps are needed for bots to move. If the current map has bot paths or items the navigation maps will always be computed, otherwise you will need to set this explicitely to True. May be necessary if you use CreateBotPlayer or SetNbBotPlayers. */
    ForceNavMapsComputation: Boolean;
    /** Allow players to see others with a delay when CrudeExtrapolation is used. The quality of the visuals is better (e.g. cars won't go through walls), but it is not suitable for 'real time' game modes, such as Rounds. */
    CrudeExtrapolation_AllowDelay: Boolean;
    Objects: (CSmObject | null)[];
    /** Only available in solo mode and map is loaded. */
    readonly GhostMgr: CGhostManager | null;
    GhostRecorder_Ghosts: (CGhost | null)[];
    Mood_GetTimeOfDay(): Real;
    Mood_SetTimeOfDay(Time01: Real): Void;
    Mood_GetDayDuration(): Integer;
    Mood_IsNight(): Boolean;
    GetPlayer(UI: CUIConfig | null): CSmPlayer | null;
    GetPlayer(Login: Text): CSmPlayer | null;
    Save_Request(FileName: Text): Void;
    Load_Request(FileName: Text): Void;
    SetPlayer_DelayedIsFull(Player: CSmPlayer | null): Boolean;
    /** Changes player's vehicle grip with a 250ms delay */
    SetPlayer_Delayed_AdherenceCoef(Player: CSmPlayer | null, AdherenceCoef: Real): Void;
    /** Changes player's vehicle control coef with a 250ms delay */
    SetPlayer_Delayed_ControlCoef(Player: CSmPlayer | null, ControlCoef: Real): Void;
    /** Changes player's vehicle accel coef with a 250ms delay */
    SetPlayer_Delayed_AccelCoef(Player: CSmPlayer | null, AccelCoef: Real): Void;
    /** Changes player's vehicle gravity coef with a 250ms delay */
    SetPlayer_Delayed_GravityCoef(Player: CSmPlayer | null, GravityCoef: Real): Void;
    /** Changes the color of the player's vehicle tires with a 250ms delay */
    SetPlayer_Delayed_TireWear(Player: CSmPlayer | null, TireWear: Real): Void;
    /** Reset all change from the game mode on the player's vehicle with a 250ms delay */
    SetPlayer_Delayed_Reset(Player: CSmPlayer | null): Void;
    /** Activate or Deactivate NoEngine on the player's vehicle with a 250ms delay */
    SetPlayer_Delayed_NoEngine(Player: CSmPlayer | null, Activate: Boolean): Void;
    /** Activate or Deactivate ForceEngine on the player's vehicle with a 250ms delay */
    SetPlayer_Delayed_ForceEngine(Player: CSmPlayer | null, Activate: Boolean): Void;
    /** Activate or Deactivate NoBrake on the player's vehicle with a 250ms delay */
    SetPlayer_Delayed_NoBrakes(Player: CSmPlayer | null, Activate: Boolean): Void;
    /** Activate or Deactivate NoSteer on the player's vehicle with a 250ms delay */
    SetPlayer_Delayed_NoSteer(Player: CSmPlayer | null, Activate: Boolean): Void;
    /** Activate or Deactivate BoostUp on the player's vehicle with a 250ms delay */
    SetPlayer_Delayed_BoostUp(Player: CSmPlayer | null, Activate: Boolean): Void;
    /** Activate or Deactivate BoostDown on the player's vehicle with a 250ms delay */
    SetPlayer_Delayed_BoostDown(Player: CSmPlayer | null, Activate: Boolean): Void;
    /** Activate or Deactivate Boost2Up on the player's vehicle with a 250ms delay */
    SetPlayer_Delayed_Boost2Up(Player: CSmPlayer | null, Activate: Boolean): Void;
    /** Activate or Deactivate Boost2Down on the player's vehicle with a 250ms delay */
    SetPlayer_Delayed_Boost2Down(Player: CSmPlayer | null, Activate: Boolean): Void;
    /** Activate or Deactivate SlowMotion on the player's vehicle with a 250ms delay */
    SetPlayer_Delayed_SlowMotion(Player: CSmPlayer | null, Activate: Boolean): Void;
    /** Activate or Deactivate Fragile on the player's vehicle with a 250ms delay */
    SetPlayer_Delayed_Fragile(Player: CSmPlayer | null, Activate: Boolean): Void;
    /** Activate or Deactivate Cruise at the given speed on the player's vehicle with a 250ms delay */
    SetPlayer_Delayed_Cruise(Player: CSmPlayer | null, Activate: Boolean, CruiseSpeedValue: Real): Void;
    /** Transform the car into another car model with a 250ms delay */
    SetPlayer_Delayed_VehicleTransform(Player: CSmPlayer | null, VehicleTransformType: CSmMode.EVehicleTransformType): Void;
    SetPlayerVehicle_ControlledByMode(Player: CSmPlayer | null, Activate: Boolean): Void;
    SetPlayerVehicle_Accelerate(Player: CSmPlayer | null, Activate: Boolean): Void;
    SetPlayerVehicle_TargetSpeedValue(Player: CSmPlayer | null, TargetSpeedValue: Real): Void;
    SetPlayerVehicle_MaxSpeedValue(Player: CSmPlayer | null, MaxSpeedValue: Real): Void;
    SetPlayerVehicle_BrakeValue(Player: CSmPlayer | null, BrakeValue: Real): Void;
    SetPlayerVehicle_SteerValue(Player: CSmPlayer | null, SteerValue: Real): Void;
    SetPlayerVehicle_ResetControlledModeValues(Player: CSmPlayer | null): Void;
    SetGameModeNameAndCustomData(GameModeName: Text): Void;
    SetGameModeNameAndCustomData(GameModeName: Text, Leaderbord_CustomData: Text): Void;
    SetGameModeNameAndCustomData(GameModeName: Text, Leaderbord_CustomData: Text, GhostDriver_CustomData: Text): Void;
    SetClubLogoUrl(ClubLogoUrl: Text): Void;
    SetDecoImageUrl_DecalSponsor4x1(ImageUrl: Text): Void;
    SetDecoImageUrl_Screen16x9(ImageUrl: Text): Void;
    SetDecoImageUrl_Screen8x1(ImageUrl: Text): Void;
    SetDecoImageUrl_Screen16x1(ImageUrl: Text): Void;
    PassOn(Event: CSmModeEvent | null): Void;
    Discard(Event: CSmModeEvent | null): Void;
    SpawnPlayer(Player: CSmPlayer | null, ClanNum: Integer, Armor: Integer, PlayerSpawn: CMapSpawn | null, ActivationDate: Integer): Void;
    SpawnPlayer(Player: CSmPlayer | null, ClanNum: Integer, Turret: CModeTurret | null, ActivationDate: Integer): Void;
    SpawnPlayer(Player: CSmPlayer | null, ClanNum: Integer, Vehicle: CModeVehicle | null, ActivationDate: Integer): Void;
    SpawnPlayer(Player: CSmPlayer | null, ClanNum: Integer, Vehicle: CModeVehicle | null, SlotIndex: Integer, ActivationDate: Integer): Void;
    SpawnBotPlayer(Player: CSmPlayer | null, ClanNum: Integer, Armor: Integer, PlayerSpawn: CMapSpawn | null, ActivationDate: Integer): Void;
    SpawnBotPlayer(Player: CSmPlayer | null, ClanNum: Integer, Armor: Integer, BotPath: CMapBotPath | null, ActivationDate: Integer): Void;
    SpawnBotPlayer(Player: CSmPlayer | null, ClanNum: Integer, Armor: Integer, BotSpawn: CMapBotSpawn | null, ActivationDate: Integer): Void;
    SpawnBotPlayer(Player: CSmPlayer | null, Owner: CSmPlayer | null, Armor: Integer, Offset: Vec3, ActivationDate: Integer): Void;
    UnspawnPlayer(Player: CSmPlayer | null): Void;
    Scores_SetSortCriteria(Criteria: CSmMode.ESmScoreSortOrder): Void;
    Scores_ComputeLadderRank(Criteria: CSmMode.ESmScoreSortOrder): Void;
    Scores_ClearAll(): Void;
    Score_ClearPrevRace(Score: CSmScore | null): Void;
    Score_ClearPrevLap(Score: CSmScore | null): Void;
    Score_Clear(Score: CSmScore | null): Void;
    SetPlayerClan(Player: CSmPlayer | null, ClanNum: Integer): Void;
    SetPlayerWeapon(Player: CSmPlayer | null, DefaultWeapon: CSmMode.EWeapon, AutoSwitchWeapon: Boolean): Void;
    SetPlayerWeaponAvailable(Player: CSmPlayer | null, Weapon: CSmMode.EWeapon, Available: Boolean): Void;
    SetPlayerAllWeaponAvailable(Player: CSmPlayer | null, Available: Boolean): Void;
    SetPlayerReloadAllWeapons(Player: CSmPlayer | null, ReloadAllWeapons: Boolean): Void;
    SetPlayerAmmo(Player: CSmPlayer | null, Weapon: CSmMode.EWeapon, Count: Integer): Void;
    GetPlayerAmmo(Player: CSmPlayer | null, Weapon: CSmMode.EWeapon): Integer;
    AddPlayerAmmo(Player: CSmPlayer | null, Weapon: CSmMode.EWeapon, DeltaCount: Real): Void;
    SetPlayerAmmoMax(Player: CSmPlayer | null, Weapon: CSmMode.EWeapon, Count: Integer): Void;
    GetPlayerAmmoMax(Player: CSmPlayer | null, Weapon: CSmMode.EWeapon): Integer;
    Entity_AddArmor(Victim: CEntity | null, DeltaArmor: Integer, Shooter: CEntity | null, ShooterPoints: Integer): Void;
    Entity_RemoveArmor(Victim: CEntity | null, DeltaArmor: Integer, Shooter: CEntity | null, ShooterPoints: Integer): Void;
    Entity_TriggerTurbo(Target: CEntity | null, StartTime: Integer): Void;
    GetWeaponNum(Weapon: CSmMode.EWeapon): Integer;
    CanRespawnPlayer(Player: CSmPlayer | null): Boolean;
    RespawnPlayer(Player: CSmPlayer | null): Void;
    RespawnPlayer(Player: CSmPlayer | null, Waypoint: CMapWaypoint | null): Void;
    RespawnPlayer(Player: CSmPlayer | null, Spawn: CMapSpawn | null): Void;
    GiveUpBehaviour_RespawnAfter_SetLandmark(Player: CSmPlayer | null, Spawn: CMapSpawn | null, Date: Integer): Void;
    /** Debug helper: create/destroy bot players to match provided values. (see Users_SetNbFakeUsers() for fake players that appear and the score table, ...) */
    SetNbBotPlayers(NbClan1: Integer, NbClan2: Integer): Void;
    CreateBotPlayer(ModelId: Ident, ClanNum: Integer): CSmPlayer | null;
    DestroyBotPlayer(BotPlayer: CSmPlayer | null): Void;
    DestroyAllBotPlayers(): Void;
    ActionGetModelId(ActionName: Text): Ident;
    ActionLoad(Player: CSmPlayer | null, ActionSlot: CSmMode.EActionSlot, ModelId: Ident): Void;
    ActionLoad(Player: CSmPlayer | null, ActionSlot: CSmMode.EActionSlot, ModelId: Ident, MeleeMode: Boolean): Void;
    ActionLoad(Vehicle: CModeVehicle | null, VehicleSlotIndex: Integer, ActionSlot: CSmMode.EActionSlot, ModelId: Ident): Void;
    ActionLoad(Turret: CModeTurret | null, ActionSlot: CSmMode.EActionSlot, ModelId: Ident): Void;
    Action_GetCooldown(Player: CSmPlayer | null, ActionInput: CSmMode.EActionInput): Integer;
    Action_GetRemainingCooldown(Player: CSmPlayer | null, ActionInput: CSmMode.EActionInput): Integer;
    ActionBind(Player: CSmPlayer | null, ActionSlot: CSmMode.EActionSlot, ActionInput: CSmMode.EActionInput): Void;
    ActionUnBind(Player: CSmPlayer | null, ActionInput: CSmMode.EActionInput): Void;
    ActionSetVariant1(Player: CSmPlayer | null, ActionSlot: CSmMode.EActionSlot, ActionVariant: Integer): Void;
    ActionSetVariant2(Player: CSmPlayer | null, ActionSlot: CSmMode.EActionSlot, ActionVariant: Integer): Void;
    ActionSetVariant3(Player: CSmPlayer | null, ActionSlot: CSmMode.EActionSlot, ActionVariant: Integer): Void;
    ObjectCreate(ModelId: Ident): CSmObject | null;
    ObjectDestroy(Object: CSmObject | null): Void;
    ObjectDestroyAll(): Void;
    RemoveShieldArmor(VictimShieldId: Integer, Damage: Integer): Void;
    Replay_SaveAttackScore(Player: CSmPlayer | null, Score: Integer): Void;
    Replay_SaveDefenseScore(Player: CSmPlayer | null, Score: Integer): Void;
    Replay_SaveTeamScore(Team: Integer, Score: Integer): Void;
    Replay_SavePlayerOfInterest(Player: CSmPlayer | null): Void;
    Replay_SaveWinner(Player: CSmPlayer | null): Void;
    Replay_SaveInterface(): Void;
    Player_BeginNewRace(Player: CSmPlayer | null, AbsoluteTime: Integer): Void;
    Player_BeginNewLap(Player: CSmPlayer | null, RaceTime: Integer): Void;
    Player_RemoveLastWaypointTime(Player: CSmPlayer | null): Void;
    Player_AddWaypointTime(Player: CSmPlayer | null, Time: Integer, Landmark: CSmMapLandmark | null): Void;
    Player_SetFinishTime(Player: CSmPlayer | null, Time: Integer, Landmark: CSmMapLandmark | null): Void;
    Player_ClearRaceWaypointTimes(Player: CSmPlayer | null): Void;
    Player_ClearLapWaypointTimes(Player: CSmPlayer | null): Void;
    Player_SetPlayerCurRaceAsScoreBestRace(Player: CSmPlayer | null): Void;
    Player_SetPlayerCurRaceAsScorePrevRace(Player: CSmPlayer | null): Void;
    Player_SetPlayerCurLapAsScoreBestLap(Player: CSmPlayer | null): Void;
    Player_SetPlayerCurLapAsScorePrevLap(Player: CSmPlayer | null): Void;
    Player_SetPlayerPrevLapAsScoreBestLap(Player: CSmPlayer | null): Void;
    Player_SetPlayerPrevLapAsScorePrevLap(Player: CSmPlayer | null): Void;
    Ghosts_SetStartTime(StartTime: Integer): Void;
    Ghosts_SetMaxAlpha(MaxAlpha: Real): Void;
    Ghost_RetrieveFromPlayer(Player: CSmPlayer | null): CGhost | null;
    Ghost_RetrieveFromPlayer(Player: CSmPlayer | null, TruncateLaunchedCheckpointsRespawns: Boolean): CGhost | null;
    Ghost_GetTimeClosestToPlayer(Ghost: CGhost | null, Player: CSmPlayer | null): Integer;
    /** Transfer this ghost checkpoint-times to the score best race. The best lap of this ghost is transferred as the score best lap. */
    Ghost_CopyToScoreBestRaceAndLap(Ghost: CGhost | null, Score: CSmScore | null): Void;
    GhostRecorder_SetEnabled(Player: CSmPlayer | null, Value: Boolean): Void;
    GhostRecorder_Ghosts_Select(Player: CSmPlayer | null): Void;
    GhostRecorder_Clear(Player: CSmPlayer | null): Void;
    GhostDriver_Playlist_GetNextSpawn(Player: CPlayer | null): CSmMapLandmark | null;
}
export declare const CSmMode: Readonly<{
    readonly ESmScoreSortOrder: Readonly<{
        TotalPoints: "CSmMode::ESmScoreSortOrder::TotalPoints";
        RoundPoints: "CSmMode::ESmScoreSortOrder::RoundPoints";
        EliminationsInflicted: "CSmMode::ESmScoreSortOrder::EliminationsInflicted";
        EliminationsTaken: "CSmMode::ESmScoreSortOrder::EliminationsTaken";
        Respawns: "CSmMode::ESmScoreSortOrder::Respawns";
        DamageInflicted: "CSmMode::ESmScoreSortOrder::DamageInflicted";
        DamageTaken: "CSmMode::ESmScoreSortOrder::DamageTaken";
        BestRace: "CSmMode::ESmScoreSortOrder::BestRace";
        BestLap: "CSmMode::ESmScoreSortOrder::BestLap";
        PrevRace: "CSmMode::ESmScoreSortOrder::PrevRace";
        Name: "CSmMode::ESmScoreSortOrder::Name";
        LadderRank: "CSmMode::ESmScoreSortOrder::LadderRank";
    }>;
    readonly EWeapon: Readonly<{
        Laser: "CSmMode::EWeapon::Laser";
        Nucleus: "CSmMode::EWeapon::Nucleus";
        Arrow: "CSmMode::EWeapon::Arrow";
        Rocket: "CSmMode::EWeapon::Rocket";
        Missile: "CSmMode::EWeapon::Missile";
    }>;
    readonly EActionSlot: Readonly<{
        Slot_A: "CSmMode::EActionSlot::Slot_A";
        Slot_B: "CSmMode::EActionSlot::Slot_B";
        Slot_C: "CSmMode::EActionSlot::Slot_C";
        Slot_D: "CSmMode::EActionSlot::Slot_D";
        Slot_E: "CSmMode::EActionSlot::Slot_E";
        Slot_F: "CSmMode::EActionSlot::Slot_F";
        Slot_G: "CSmMode::EActionSlot::Slot_G";
        Slot_H: "CSmMode::EActionSlot::Slot_H";
    }>;
    readonly EActionInput: Readonly<{
        Weapon: "CSmMode::EActionInput::Weapon";
        Secondary: "CSmMode::EActionInput::Secondary";
        Movement: "CSmMode::EActionInput::Movement";
        QuickAccess1: "CSmMode::EActionInput::QuickAccess1";
        QuickAccess2: "CSmMode::EActionInput::QuickAccess2";
        QuickAccess3: "CSmMode::EActionInput::QuickAccess3";
        QuickAccess4: "CSmMode::EActionInput::QuickAccess4";
        QuickAccess5: "CSmMode::EActionInput::QuickAccess5";
        QuickAccess6: "CSmMode::EActionInput::QuickAccess6";
        QuickAccess7: "CSmMode::EActionInput::QuickAccess7";
        QuickAccess8: "CSmMode::EActionInput::QuickAccess8";
        QuickAccess9: "CSmMode::EActionInput::QuickAccess9";
        QuickAccess0: "CSmMode::EActionInput::QuickAccess0";
        Consumable1: "CSmMode::EActionInput::Consumable1";
        Consumable2: "CSmMode::EActionInput::Consumable2";
        None: "CSmMode::EActionInput::None";
    }>;
    readonly EGameplay: Readonly<{
        Default: "CSmMode::EGameplay::Default";
        Mp3Beta0: "CSmMode::EGameplay::Mp3Beta0";
    }>;
    readonly ERespawnBehaviour: Readonly<{
        Custom: "CSmMode::ERespawnBehaviour::Custom";
        DoNothing: "CSmMode::ERespawnBehaviour::DoNothing";
        GiveUpBeforeFirstCheckpoint: "CSmMode::ERespawnBehaviour::GiveUpBeforeFirstCheckpoint";
        AlwaysGiveUp: "CSmMode::ERespawnBehaviour::AlwaysGiveUp";
        AlwaysRespawn: "CSmMode::ERespawnBehaviour::AlwaysRespawn";
    }>;
    readonly ECheckpointBehaviour: Readonly<{
        Custom: "CSmMode::ECheckpointBehaviour::Custom";
        Default: "CSmMode::ECheckpointBehaviour::Default";
        InfiniteLaps: "CSmMode::ECheckpointBehaviour::InfiniteLaps";
    }>;
    readonly EGiveUpBehaviour: Readonly<{
        Custom: "CSmMode::EGiveUpBehaviour::Custom";
        DoNothing: "CSmMode::EGiveUpBehaviour::DoNothing";
        GiveUp: "CSmMode::EGiveUpBehaviour::GiveUp";
    }>;
    readonly EVehicleTransformType: Readonly<{
        Reset: "CSmMode::EVehicleTransformType::Reset";
        CarSnow: "CSmMode::EVehicleTransformType::CarSnow";
        CarRally: "CSmMode::EVehicleTransformType::CarRally";
        CarDesert: "CSmMode::EVehicleTransformType::CarDesert";
    }>;
}>;
export declare namespace CSmMode {
    type ESmScoreSortOrder = (typeof CSmMode.ESmScoreSortOrder)[keyof typeof CSmMode.ESmScoreSortOrder];
    type EWeapon = (typeof CSmMode.EWeapon)[keyof typeof CSmMode.EWeapon];
    type EActionSlot = (typeof CSmMode.EActionSlot)[keyof typeof CSmMode.EActionSlot];
    type EActionInput = (typeof CSmMode.EActionInput)[keyof typeof CSmMode.EActionInput];
    type EGameplay = (typeof CSmMode.EGameplay)[keyof typeof CSmMode.EGameplay];
    type ERespawnBehaviour = (typeof CSmMode.ERespawnBehaviour)[keyof typeof CSmMode.ERespawnBehaviour];
    type ECheckpointBehaviour = (typeof CSmMode.ECheckpointBehaviour)[keyof typeof CSmMode.ECheckpointBehaviour];
    type EGiveUpBehaviour = (typeof CSmMode.EGiveUpBehaviour)[keyof typeof CSmMode.EGiveUpBehaviour];
    type EVehicleTransformType = (typeof CSmMode.EVehicleTransformType)[keyof typeof CSmMode.EVehicleTransformType];
}
/** API for the plugins of the map editor. Supported declare modes : - Local - Persistent */
export interface CSmMapType extends CMapType {
    readonly Mode: CSmMode | null;
    AllPlayers: (CSmPlayer | null)[];
    Players: (CSmPlayer | null)[];
    AuthorTime_SetFromGhost(Ghost: CGhost | null): Void;
    SetAuthorTimeAndGhost(Ghost: CGhost | null): Void;
}
/** An action Supported declare modes : - Local */
export interface CSmAction extends CAction {
    readonly Now: Integer;
    readonly Variant1: Integer;
    readonly Variant2: Integer;
    readonly Variant3: Integer;
    Players: (CSmPlayer | null)[];
    readonly Owner: CSmPlayer | null;
    readonly OwnerVehicle: CModeVehicle | null;
    readonly IsActive: Boolean;
    readonly IsBound: Boolean;
    /** Is true only once during action init. Allow to init state variables */
    readonly IsInitialFrame: Boolean;
    Energy: Integer;
    EnergyMax: Integer;
    EnergyCost: Integer;
    EnergyReload: Boolean;
    AmmoGain: Real;
    State_EntityId1: Ident;
    State_Integer1: Integer;
    State_Integer2: Integer;
    State_Boolean1: Boolean;
    PendingEvents: (CSmActionEvent | null)[];
    IsJumping: Boolean;
    IsGliding: Boolean;
    IsAttractor: Boolean;
    IsFlying: Boolean;
    IsSliding: Boolean;
    IsRunning: Boolean;
    IsFrozen: Boolean;
    IsSneaking: Boolean;
    IsFreeLooking: Boolean;
    HasNoPlayerCollision: Boolean;
    Cooldown: Integer;
    readonly Focus_Active: Boolean;
    readonly Trigger0: Boolean;
    readonly Trigger1: Boolean;
    readonly Trigger2: Boolean;
    readonly Trigger3: Boolean;
    readonly Trigger4: Boolean;
    readonly Trigger5: Boolean;
    readonly Trigger6: Boolean;
    readonly Trigger7: Boolean;
    readonly Trigger8: Boolean;
    readonly Trigger9: Boolean;
    readonly Trigger10: Boolean;
    readonly Trigger11: Boolean;
    readonly Trigger12: Boolean;
    readonly Trigger13: Boolean;
    Focused_Scroll: Integer;
    Focused_Scroll_Max: Integer;
    SendRulesEvent(Param1: Text, Param2: Text[], Shooter: CEntity | null, Victim: CEntity | null): Void;
    Anim_GetModelId(ModelName: Text): Ident;
    Anim_PlayAtLocation(AnimModelId: Ident, Position: Vec3, Direction: Vec3): Ident;
    Anim_PlayOnPlayer(AnimModelId: Ident, Player: CSmPlayer | null): Ident;
    Anim_Stop(AnimId: Ident): Void;
    Projectile_GetModelId(ModelName: Text): Ident;
    Projectile_CreateAtLocation(ProjectileModelId: Ident, PlayerToIgnore: CSmPlayer | null, InitialPosition: Vec3, InitialDirection: Vec3, InitialVelocity: Vec3): Ident;
    Projectile_CreateOnPlayer(ProjectileModelId: Ident, Shooter: CSmPlayer | null): Ident;
    Cooldown_IsReady(): Boolean;
    Cooldown_Start(): Void;
    Shield_CreateAtLocation(Position: Vec3, Direction: Vec3): Ident;
    Shield_CreateOnPlayer(ShieldOwner: CSmPlayer | null): Ident;
    Shield_Destroy(ShieldId: Ident): Void;
    Shield_Exists(ShieldId: Ident): Boolean;
    Shield_GetArmor(ShieldId: Ident): Integer;
    Shield_SetArmor(ShieldId: Ident, ShieldArmor: Integer): Void;
    Shield_GetIsActive(ShieldId: Ident): Boolean;
    Shield_SetIsActive(ShieldId: Ident, ShieldIsActive: Boolean): Void;
    Shield_GetArmorMax(ShieldId: Ident): Integer;
    Shield_GetTickReload(ShieldId: Ident): Integer;
    Shield_GetCooldown(ShieldId: Ident): Integer;
    Vehicle_TriggerTurbo(): Void;
    Vehicle_TriggerTurboBrake(): Void;
    Focus_Request(): Boolean;
    Focus_Release(): Void;
}
/** Ingame Manialink API for ShootMania. Supported declare modes : - Local - Persistent */
export interface CSmMlScriptIngame extends CMlScriptIngame {
    ArenaNow: Integer;
    /** Player receiving the inputs. Null if spectating other players. */
    readonly InputPlayer: CSmPlayer | null;
    /** Player currently targetted by the camera. Same as InputPlayer when playing. Can be null in freecam when there's no specific target. */
    readonly GUIPlayer: CSmPlayer | null;
    Players: (CSmPlayer | null)[];
    Vehicles: (CModeVehicle | null)[];
    Scores: (CSmScore | null)[];
    ClanScores: Integer[];
    HideResumePlayingButton: Boolean;
    MapBases: (CSmMapBase | null)[];
    MapLandmarks: (CSmMapLandmark | null)[];
    MapLandmarks_PlayerSpawn: (CSmMapLandmark | null)[];
    MapLandmarks_Gauge: (CSmMapLandmark | null)[];
    MapLandmarks_Sector: (CSmMapLandmark | null)[];
    MapLandmarks_BotPath: (CSmMapLandmark | null)[];
    MapLandmarks_ObjectAnchor: (CSmMapLandmark | null)[];
    MapLandmarks_Gate: (CSmMapLandmark | null)[];
    MapLandmarks_Foundation: (CSmMapLandmark | null)[];
}
/** Documentation for class CSmArenaInterfaceManialinkScriptHandler_ReadOnly */
export interface CSmArenaInterfaceManialinkScriptHandler_ReadOnly extends CMlScriptIngame_ReadOnly {
    ArenaNow: Integer;
    /** Player receiving the inputs. Null if spectating other players. */
    readonly InputPlayer: CSmPlayer | null;
    /** Player currently targetted by the camera. Same as InputPlayer when playing. Can be null in freecam when there's no specific target. */
    readonly GUIPlayer: CSmPlayer | null;
    Players: (CSmPlayer | null)[];
    Vehicles: (CModeVehicle | null)[];
    Scores: (CSmScore | null)[];
    MapBases: (CSmMapBase | null)[];
    MapLandmarks: (CSmMapLandmark | null)[];
    MapLandmarks_PlayerSpawn: (CSmMapLandmark | null)[];
    MapLandmarks_Gauge: (CSmMapLandmark | null)[];
    MapLandmarks_Sector: (CSmMapLandmark | null)[];
    MapLandmarks_BotPath: (CSmMapLandmark | null)[];
    MapLandmarks_ObjectAnchor: (CSmMapLandmark | null)[];
    MapLandmarks_Gate: (CSmMapLandmark | null)[];
    MapLandmarks_Foundation: (CSmMapLandmark | null)[];
}
/** Documentation for class CTaskResult_GhostDriver_UploadLimit */
export interface CTaskResult_GhostDriver_UploadLimit {
    TeamLevel: Integer;
    Limit: Integer;
}
/** Documentation for class CTaskResult_GhostDriverDownload_Team */
export interface CTaskResult_GhostDriverDownload_Team {
    TeamLevel: Integer;
    Members: (CTaskResult_GhostDriverDownload_Member | null)[];
}
/** Documentation for class CTaskResult_GhostDriverDownload_Member */
export interface CTaskResult_GhostDriverDownload_Member {
    Ghosts: (CTaskResult_GhostDriverDownload_Ghost | null)[];
}
/** Documentation for class CTaskResult_GhostDriverDownload_Ghost */
export interface CTaskResult_GhostDriverDownload_Ghost {
    Ghost: CGhost | null;
}
/** Documentation for class CVoiceChatEvent_DisplayUI */
export interface CVoiceChatEvent_DisplayUI extends CVoiceChatEvent {
    readonly NewValue: Boolean;
}
/** Documentation for class CVoiceChatEvent_Message */
export interface CVoiceChatEvent_Message extends CVoiceChatEvent {
    readonly Sender: CGameUserVoiceChat | null;
    readonly Destination: CGameUserVoiceChat | null;
    readonly Message: Text;
    readonly Lang_BCP47: Text;
}
/** Documentation for class CVoiceChatEvent_SpeakingUsersChanged */
export interface CVoiceChatEvent_SpeakingUsersChanged extends CVoiceChatEvent {
}
/** Documentation for class CVoiceChatEvent_User_IsMuted */
export interface CVoiceChatEvent_User_IsMuted extends CVoiceChatEvent {
    readonly User: CGameUserVoiceChat | null;
    readonly NewValue: Boolean;
    readonly ChangePending: Boolean;
}
/** Documentation for class CVoiceChatEvent_User_IsConnected */
export interface CVoiceChatEvent_User_IsConnected extends CVoiceChatEvent {
    readonly User: CGameUserVoiceChat | null;
    readonly NewValue: Boolean;
}
/** Documentation for class CVoiceChatEvent_User_IsSpeaking */
export interface CVoiceChatEvent_User_IsSpeaking extends CVoiceChatEvent {
    readonly User: CGameUserVoiceChat | null;
    readonly NewValue: Boolean;
}
/** Documentation for class CVoiceChatEvent */
export interface CVoiceChatEvent extends CNod {
}
/** Documentation for class CDirectLink_JoinSession */
export interface CDirectLink_JoinSession extends CDirectLink {
    readonly SessionId: Text;
    readonly IsFirstPartySession: Boolean;
    readonly Context: Integer;
}
/** Documentation for class CDirectLink_WaitingPage */
export interface CDirectLink_WaitingPage extends CDirectLink {
    readonly Reason: Text;
}
/** Documentation for class CDirectLink_Garage */
export interface CDirectLink_Garage extends CDirectLink {
}
/** Documentation for class CDirectLink_Splitscreen */
export interface CDirectLink_Splitscreen extends CDirectLink {
}
/** Documentation for class CDirectLink_Hotseat */
export interface CDirectLink_Hotseat extends CDirectLink {
}
/** Documentation for class CDirectLink_ArcadeServer */
export interface CDirectLink_ArcadeServer extends CDirectLink {
}
/** Documentation for class CDirectLink_Royal */
export interface CDirectLink_Royal extends CDirectLink {
}
/** Documentation for class CDirectLink_Ranked */
export interface CDirectLink_Ranked extends CDirectLink {
}
/** Documentation for class CDirectLink_TrackOfTheDay */
export interface CDirectLink_TrackOfTheDay extends CDirectLink {
}
/** Documentation for class CDirectLink_JoinServer */
export interface CDirectLink_JoinServer extends CDirectLink {
    readonly ServerId: Text;
    readonly IsSpectator: Boolean;
}
/** Documentation for class CDirectLink_OfficialCampaign */
export interface CDirectLink_OfficialCampaign extends CDirectLink {
}
/** Documentation for class CDirectLink_NewMap */
export interface CDirectLink_NewMap extends CDirectLink {
}
/** Documentation for class CDirectLink_Home */
export interface CDirectLink_Home extends CDirectLink {
}
/** Documentation for class CDirectLink */
export interface CDirectLink {
}
/** Documentation for class CChatEvent_NewEntry */
export interface CChatEvent_NewEntry extends CChatEvent {
    Entry: CChatEntry | null;
}
/** Documentation for class CChatEvent_HistoryChange */
export interface CChatEvent_HistoryChange extends CChatEvent {
}
/** Documentation for class CChatEvent */
export interface CChatEvent {
}
/** Documentation for class CChatEntry */
export interface CChatEntry {
    readonly Text: SConstStringInt | null;
    readonly SenderLogin: SConstString | null;
    readonly SenderDisplayName: SConstStringInt | null;
    readonly SenderFullDisplayName: SConstStringInt | null;
    readonly SenderFullDisplayName_ForTTS: SConstStringInt | null;
    readonly SenderTeamColorText: SConstStringInt | null;
    readonly IsSystemMessage: Boolean;
    readonly ChatScope: string;
}
/** Documentation for class CChatHistory */
export interface CChatHistory {
    Entries: (CChatEntry | null)[];
    Window_Size: Integer;
    Window_Offset: Integer;
    readonly Window_OffsetMax: Integer;
    PendingEvents: (CChatEvent | null)[];
}
/** Documentation for class CChatContext */
export interface CChatContext {
    Histories: (CChatHistory | null)[];
    History_Create(Filter: Text, MaxSize: Integer): CChatHistory | null;
    History_Destroy(History: CChatHistory | null): Void;
}
/** Documentation for class CStuntFigure */
export interface CStuntFigure {
    Name: CStuntFigure.EStuntName;
    /** Values in range (0 - 255) */
    Combo: Integer;
    /** Values in range (0 - 65535) */
    Angle: Integer;
    /** Values in range (0 - 65535) */
    Points: Integer;
    Factor: Real;
    StraightLanding: Boolean;
    ReverseLanding: Boolean;
    PerfectLanding: Boolean;
    MasterJump: Boolean;
    MasterLanding: Boolean;
    EpicLanding: Boolean;
    Wreck: Boolean;
}
export declare const CStuntFigure: Readonly<{
    readonly EStuntName: Readonly<{
        None: "CStuntFigure::EStuntName::None";
        BasicJump: "CStuntFigure::EStuntName::BasicJump";
        Flip: "CStuntFigure::EStuntName::Flip";
        Backflip: "CStuntFigure::EStuntName::Backflip";
        Spin: "CStuntFigure::EStuntName::Spin";
        Aerial: "CStuntFigure::EStuntName::Aerial";
        AlleyOop: "CStuntFigure::EStuntName::AlleyOop";
        Roll: "CStuntFigure::EStuntName::Roll";
        Corkscrew: "CStuntFigure::EStuntName::Corkscrew";
        SpinOff: "CStuntFigure::EStuntName::SpinOff";
        Rodeo: "CStuntFigure::EStuntName::Rodeo";
        FlipFlap: "CStuntFigure::EStuntName::FlipFlap";
        Twister: "CStuntFigure::EStuntName::Twister";
        FreeStyle: "CStuntFigure::EStuntName::FreeStyle";
        SpinningChaos: "CStuntFigure::EStuntName::SpinningChaos";
        FlippingMix: "CStuntFigure::EStuntName::FlippingMix";
        RollingMadness: "CStuntFigure::EStuntName::RollingMadness";
    }>;
}>;
export declare namespace CStuntFigure {
    type EStuntName = (typeof CStuntFigure.EStuntName)[keyof typeof CStuntFigure.EStuntName];
}
/** Documentation for class CStuntStatus */
export interface CStuntStatus {
    LatestFigureTime: Integer;
    LatestFigure: CStuntFigure | null;
    IsInFigure: Boolean;
    IsNoAirControl: Boolean;
    IsEpicAirControl: Boolean;
    IsMasterAirControl: Boolean;
    /** Values in range (0 - 255) */
    ChainCounter: Integer;
    /** Values in range (0 - 65535) */
    ChainDelay: Integer;
    readonly TimeLeftForStuntCombo: Integer;
    readonly TimeElapsedSinceLastStunt: Integer;
}
/** Documentation for class CNod */
export interface CNod {
    readonly Id: Ident;
}
/** This is the base Manialink page interface. Supported declare modes : - Local - Persistent */
export interface CAnyEditorPluginLayer extends CMlScript {
    readonly ModuleEditor: CEditorModule | null;
    readonly MeshEditor: CEditorMesh | null;
    readonly EditorEditor: CEditorEditor | null;
    readonly MediaTracker: CEditorMediaTracker | null;
    readonly SkinEditor: CEditorSkin | null;
    Binding_GetShortcut(ContextName: Text, BindingName: Text): Text;
}
/** This is the title menus Manialink interface. Supported declare modes : - Local - Persistent */
export interface CManiaAppTitleLayer extends CMlScript {
    /** Will be Null if the script is not runing in a layer of an app. */
    readonly ParentApp: CManiaAppTitle | null;
    readonly TitleControl: CTitleControl | null;
}
/** This is the base Manialink page interface. Supported declare modes : - Local - Persistent */
export interface CMapEditorPluginLayer extends CMlScript {
    readonly Editor: CMapEditorPlugin | null;
}
/** This is the stations Manialink interface. Supported declare modes : - Local - Persistent */
export interface CMlStation extends CMlScript {
    /** Will be Null if the script is not runing in a layer of an app. */
    readonly ParentApp: CManiaAppStation | null;
    readonly Station: CStation | null;
    EnterStation(): Void;
}
/** This is the Manialink browser interface. Supported declare modes : - Local - Persistent */
export interface CMlBrowser extends CMlScript {
    /** Will be Null if the script is not runing in a layer of an app. */
    readonly ParentApp: CManiaAppBrowser | null;
    readonly CurMap: CMap | null;
    readonly IsInBrowser: Boolean;
    BrowserFocusedFrameId: Text;
    ShowCurMapCard(): Void;
    BrowserBack(): Void;
    BrowserQuit(): Void;
    BrowserHome(): Void;
    BrowserReload(): Void;
}
/** This is the Manialink browser interface. Supported declare modes : - Local - Persistent */
export interface CGameScriptHandlerMediaTrack extends CMlScript {
    /** Info of the map. */
    readonly CurMap: CMap | null;
    ShowCurMapCard(): Void;
}
/** Documentation for class CMlPage Supported declare modes : - Local - Persistent */
export interface CMlPage extends CNod {
    readonly MainFrame: CMlFrame | null;
    readonly FocusedControl: CMlControl | null;
    LinksInhibited: Boolean;
    GetClassChildren_Result: (CMlControl | null)[];
    GetFirstChild(ControlId: Text): CMlControl | null;
    GetClassChildren(Class: Text, Frame: CMlFrame | null, Recursive: Boolean): Void;
    ScrollToControl(Control: CMlControl | null): Void;
}
/** User profile. Supported declare modes : - Local - Persistent - Cloud */
export interface CUser extends CNod {
    readonly Login: Text;
    readonly WebServicesUserId: Text;
    readonly Name: Text;
    readonly IsFirstPartyDisplayName: Boolean;
    readonly AvatarUrl: Text;
    readonly ZonePath: Text;
    readonly ZoneFlagUrl: Text;
    readonly CountryFlagUrl: Text;
    readonly CountryPath: Text;
    ZoneIdPath: Text[];
    readonly Language: Text;
    readonly Description: Text;
    readonly Color: Vec3;
    readonly ClubLink: Text;
    readonly Trigram: Text;
    readonly BroadcastTVLogin: Text;
    readonly SteamUserId: Text;
    readonly FameStars: Integer;
    readonly Echelon: CUser.EEchelon;
    readonly NextEchelonPercent: Integer;
    readonly IsBeginner: Boolean;
    readonly LadderRank: Integer;
    readonly LadderTotal: Integer;
    readonly LadderPoints: Real;
    readonly LadderZoneName: Text;
    readonly LadderZoneFlagUrl: Text;
    readonly ReferenceScore: Real;
    readonly IsFakeUser: Boolean;
    Tags_Favored_Indices: Integer[];
    Tags_Id: Text[];
    Tags_Type: CUser.ETagType[];
    Tags_Comments: Text[];
    Tags_Deliverer: Text[];
    readonly ClubTag: Text;
    readonly StereoDisplayMode: CUser.EStereoDisplayMode;
    readonly ColorblindModeEnabled: Boolean;
    HackCamHmdDisabled: Boolean;
    readonly AvatarDisplayName: Text;
    readonly HornDisplayName: Text;
    readonly Model_CarSport_SkinName: Text;
    readonly Model_CarSport_SkinUrl: Text;
    readonly Model_CharacterPilot_SkinName: Text;
    readonly Model_CharacterPilot_SkinUrl: Text;
    readonly Prestige_SkinOptions: Text;
    readonly Character_SkinOptions: Text;
    readonly VoiceChat: CGameUserVoiceChat | null;
    readonly IsConnectedToMasterServer: Boolean;
    AlliesConnected: Text[];
}
export declare const CUser: Readonly<{
    readonly EEchelon: Readonly<{
        None: "CUser::EEchelon::None";
        Bronze1: "CUser::EEchelon::Bronze1";
        Bronze2: "CUser::EEchelon::Bronze2";
        Bronze3: "CUser::EEchelon::Bronze3";
        Silver1: "CUser::EEchelon::Silver1";
        Silver2: "CUser::EEchelon::Silver2";
        Silver3: "CUser::EEchelon::Silver3";
        Gold1: "CUser::EEchelon::Gold1";
        Gold2: "CUser::EEchelon::Gold2";
        Gold3: "CUser::EEchelon::Gold3";
    }>;
    readonly ETagType: Readonly<{
        Bronze: "CUser::ETagType::Bronze";
        Silver: "CUser::ETagType::Silver";
        Gold: "CUser::ETagType::Gold";
        Nadeo: "CUser::ETagType::Nadeo";
    }>;
    readonly EStereoDisplayMode: Readonly<{
        None: "CUser::EStereoDisplayMode::None";
        Stereo: "CUser::EStereoDisplayMode::Stereo";
        HMD: "CUser::EStereoDisplayMode::HMD";
    }>;
}>;
export declare namespace CUser {
    type EEchelon = (typeof CUser.EEchelon)[keyof typeof CUser.EEchelon];
    type ETagType = (typeof CUser.ETagType)[keyof typeof CUser.ETagType];
    type EStereoDisplayMode = (typeof CUser.EStereoDisplayMode)[keyof typeof CUser.EStereoDisplayMode];
}
/** Documentation for class CTitle Supported declare modes : - Local - Persistent */
export interface CTitle extends CNod {
    readonly TitleId: Text;
    readonly AuthorLogin: Text;
    readonly AuthorName: Text;
    readonly Name: Text;
    readonly Desc: Text;
    readonly InfoUrl: Text;
    readonly DownloadUrl: Text;
    readonly TitleVersion: Text;
    readonly MakerTitleId: Text;
    readonly BaseTitleId: Text;
}
/** Events for Manialink page scripts. Supported declare modes : - Local */
export interface CMlScriptEvent extends CBaseConstEvent {
    readonly Type: CMlScriptEvent.Type;
    readonly KeyCode: Integer;
    readonly KeyName: Text;
    readonly CharPressed: Text;
    readonly ControlId: Text;
    readonly Control: CMlControl | null;
    readonly MenuNavAction: CMlScriptEvent.EMenuNavAction;
    readonly IsActionAutoRepeat: Boolean;
    readonly CustomEventType: Text;
    CustomEventData: Text[];
}
export declare const CMlScriptEvent: Readonly<{
    readonly Type: Readonly<{
        KeyPress: "CMlScriptEvent::Type::KeyPress";
        MouseClick: "CMlScriptEvent::Type::MouseClick";
        MouseRightClick: "CMlScriptEvent::Type::MouseRightClick";
        MouseOver: "CMlScriptEvent::Type::MouseOver";
        MouseOut: "CMlScriptEvent::Type::MouseOut";
        EntrySubmit: "CMlScriptEvent::Type::EntrySubmit";
        MenuNavigation: "CMlScriptEvent::Type::MenuNavigation";
        PluginCustomEvent: "CMlScriptEvent::Type::PluginCustomEvent";
    }>;
    readonly EMenuNavAction: Readonly<{
        Up: "CMlScriptEvent::EMenuNavAction::Up";
        Right: "CMlScriptEvent::EMenuNavAction::Right";
        Left: "CMlScriptEvent::EMenuNavAction::Left";
        Down: "CMlScriptEvent::EMenuNavAction::Down";
        Select: "CMlScriptEvent::EMenuNavAction::Select";
        Cancel: "CMlScriptEvent::EMenuNavAction::Cancel";
        PageUp: "CMlScriptEvent::EMenuNavAction::PageUp";
        PageDown: "CMlScriptEvent::EMenuNavAction::PageDown";
        AppMenu: "CMlScriptEvent::EMenuNavAction::AppMenu";
        Action1: "CMlScriptEvent::EMenuNavAction::Action1";
        Action2: "CMlScriptEvent::EMenuNavAction::Action2";
        Action3: "CMlScriptEvent::EMenuNavAction::Action3";
        Action4: "CMlScriptEvent::EMenuNavAction::Action4";
        ScrollUp: "CMlScriptEvent::EMenuNavAction::ScrollUp";
        ScrollDown: "CMlScriptEvent::EMenuNavAction::ScrollDown";
    }>;
}>;
export declare namespace CMlScriptEvent {
    type Type = (typeof CMlScriptEvent.Type)[keyof typeof CMlScriptEvent.Type];
    type EMenuNavAction = (typeof CMlScriptEvent.EMenuNavAction)[keyof typeof CMlScriptEvent.EMenuNavAction];
}
/** Manialink control. Supported declare modes : - Local */
export interface CMlControl extends CNod {
    readonly Parent: CMlFrame | null;
    readonly ControlId: Text;
    Size: Vec2;
    HorizontalAlign: CMlControl.AlignHorizontal;
    VerticalAlign: CMlControl.AlignVertical;
    Visible: Boolean;
    RelativePosition_V3: Vec2;
    ZIndex: Real;
    RelativeScale: Real;
    RelativeRotation: Real;
    readonly AbsolutePosition_V3: Vec2;
    readonly AbsoluteScale: Real;
    readonly AbsoluteRotation: Real;
    ToolTip: Text;
    readonly IsFocused: Boolean;
    HasClass(Class: Text): Boolean;
    DataAttributeExists(DataName: Text): Boolean;
    DataAttributeGet(DataName: Text): Text;
    DataAttributeSet(DataName: Text, DataValue: Text): Void;
    Show(): Void;
    Hide(): Void;
    Focus(): Void;
    ScriptEvents_Disable(): Void;
    ScriptEvents_Restore(): Void;
}
export declare const CMlControl: Readonly<{
    readonly AlignHorizontal: Readonly<{
        Left: "CMlControl::AlignHorizontal::Left";
        HCenter: "CMlControl::AlignHorizontal::HCenter";
        Right: "CMlControl::AlignHorizontal::Right";
        None: "CMlControl::AlignHorizontal::None";
    }>;
    readonly AlignVertical: Readonly<{
        Top: "CMlControl::AlignVertical::Top";
        VCenter: "CMlControl::AlignVertical::VCenter";
        Bottom: "CMlControl::AlignVertical::Bottom";
        None: "CMlControl::AlignVertical::None";
        VCenter2: "CMlControl::AlignVertical::VCenter2";
    }>;
}>;
export declare namespace CMlControl {
    type AlignHorizontal = (typeof CMlControl.AlignHorizontal)[keyof typeof CMlControl.AlignHorizontal];
    type AlignVertical = (typeof CMlControl.AlignVertical)[keyof typeof CMlControl.AlignVertical];
}
/** Tool for parsing document */
export interface CParsingManager extends CNod {
    DocumentsSlotsLimit: Integer;
    DocumentsXml: (CParsingDocument | null)[];
    Create(Contents: Text): CParsingDocument | null;
    Create(Contents: Text, GenerateText: Boolean, GenerateTextRaw: Boolean, GenerateTextResursive: Boolean): CParsingDocument | null;
    Destroy(Document: CParsingDocument | null): Void;
    /** Parses an XML document */
    Parse_Xml(Contents: Text): CParsingDocument | null;
    /** Parses an XML document */
    Parse_Xml(Contents: Text, GenerateText: Boolean, GenerateTextRaw: Boolean, GenerateTextResursive: Boolean): CParsingDocument | null;
    Parse_Destroy(Document: CParsingDocument | null): Void;
    Compose_Start_Xml(Compact: Boolean): Ident;
    Compose_Start_Json(Compact: Boolean): Ident;
    Compose_End(ComposerId: Ident): Void;
    Compose_Destroy(ComposerId: Ident): Void;
    Compose_Node_Open(ComposerId: Ident, Name: Text): Void;
    Compose_Node_Close(ComposerId: Ident): Void;
    Compose_Array_Open(ComposerId: Ident, Name: Text): Void;
    Compose_Array_Close(ComposerId: Ident): Void;
    Compose_Attribute(ComposerId: Ident, Name: Text, Value: Text): Void;
    Compose_Attribute(ComposerId: Ident, Name: Text, Value: Integer): Void;
    Compose_Attribute(ComposerId: Ident, Name: Text, Value: Real): Void;
    Compose_Attribute(ComposerId: Ident, Name: Text, Value: Boolean): Void;
    Compose_Value(ComposerId: Ident, Name: Text, Value: Text): Void;
    Compose_GetResult(ComposerId: Ident): Text;
}
/** Manager for HTTP requests */
export interface CHttpManager extends CNod {
    Requests: (CHttpRequest | null)[];
    readonly SlotsAvailable: Integer;
    PendingEvents: (CHttpEvent | null)[];
    AutomaticHeaders_Timezone: Boolean;
    /** Create a get request, AdditionnalHeaders format is : "Header-name: Value\nOther-name: OtherValue" */
    CreateGet(Url: Text): CHttpRequest | null;
    CreateGet(Url: Text, UseCache: Boolean): CHttpRequest | null;
    CreateGet(Url: Text, UseCache: Boolean, AdditionalHeaders: Text): CHttpRequest | null;
    CreatePost(Url: Text, Resource: Text): CHttpRequest | null;
    CreatePost(Url: Text, Resource: Text, AdditionalHeaders: Text): CHttpRequest | null;
    CreatePostFile(Url: Text, FileName: Text, AdditionalHeaders: Text): CHttpRequest | null;
    Destroy(Request: CHttpRequest | null): Void;
    IsValidUrl(Url: Text): Boolean;
}
/** Documentation for class CVideoManager */
export interface CVideoManager extends CNod {
    Videos: (CVideo | null)[];
    CreateVideo(Url: Text, IsLooping: Boolean, AutoProcessing: Boolean): CVideo | null;
    CreateVideo(Url: Text, IsLooping: Boolean, AutoProcessing: Boolean, UseMipMap: Boolean): CVideo | null;
    DestroyVideo(Video: CVideo | null): Void;
}
/** Documentation for class CAudioManager */
export interface CAudioManager extends CNod {
    Sounds: (CAudioSource | null)[];
    ForceEnableMusic: Boolean;
    LimitMusicVolumedB: Real;
    LimitSceneSoundVolumedB: Real;
    LimitUiSoundVolumedB: Real;
    CreateSound(Url: Text): CAudioSource | null;
    CreateSound(Url: Text, VolumedB: Real, IsMusic: Boolean, IsLooping: Boolean, IsSpatialized: Boolean): CAudioSource | null;
    DestroySound(Sound: CAudioSource | null): Void;
    CreateMusic(Url: Text): CAudioSourceMusic | null;
    DestroyMusic(Music: CAudioSourceMusic | null): Void;
    PlaySoundEvent(Sound: CAudioSource | null, VolumedB: Real): Void;
    PlaySoundEvent(Url: Text, VolumedB: Real): Void;
    PlaySoundEvent(Sound: CAudioManager.ELibSound, SoundVariant: Integer, VolumedB: Real): Void;
    PlaySoundEvent(Sound: CAudioSource | null, VolumedB: Real, Delay: Integer): Void;
    PlaySoundEvent(Url: Text, VolumedB: Real, Delay: Integer): Void;
    PlaySoundEvent(Sound: CAudioManager.ELibSound, SoundVariant: Integer, VolumedB: Real, Delay: Integer): Void;
    PlaySoundEvent(Sound: CAudioSource | null, VolumedB: Real, PanRadiusLfe: Vec3): Void;
    PlaySoundEvent(Url: Text, VolumedB: Real, PanRadiusLfe: Vec3): Void;
    PlaySoundEvent(Sound: CAudioSource | null, VolumedB: Real, PanRadiusLfe: Vec3, Delay: Integer): Void;
    PlaySoundEvent(Url: Text, VolumedB: Real, PanRadiusLfe: Vec3, Delay: Integer): Void;
    ClearAllDelayedSoundsEvents(): Void;
}
export declare const CAudioManager: Readonly<{
    readonly ELibSound: Readonly<{
        Alert: "CAudioManager::ELibSound::Alert";
        ShowDialog: "CAudioManager::ELibSound::ShowDialog";
        HideDialog: "CAudioManager::ELibSound::HideDialog";
        ShowMenu: "CAudioManager::ELibSound::ShowMenu";
        HideMenu: "CAudioManager::ELibSound::HideMenu";
        Focus: "CAudioManager::ELibSound::Focus";
        Valid: "CAudioManager::ELibSound::Valid";
        Start: "CAudioManager::ELibSound::Start";
        Countdown: "CAudioManager::ELibSound::Countdown";
        Victory: "CAudioManager::ELibSound::Victory";
        ScoreIncrease: "CAudioManager::ELibSound::ScoreIncrease";
        Checkpoint: "CAudioManager::ELibSound::Checkpoint";
    }>;
}>;
export declare namespace CAudioManager {
    type ELibSound = (typeof CAudioManager.ELibSound)[keyof typeof CAudioManager.ELibSound];
}
/** Input devices. */
export interface CInputManager extends CNod {
    PendingEvents: (CInputEvent | null)[];
    readonly Now: Integer;
    readonly Period: Integer;
    Pads: (CInputPad | null)[];
    readonly MousePos: Vec2;
    readonly MouseKineticScrollVel: Vec2;
    readonly MouseLeftButton: Boolean;
    readonly MouseRightButton: Boolean;
    readonly MouseMiddleButton: Boolean;
    TouchPoints_Cur: Vec2[];
    TouchPoints_Init: Vec2[];
    readonly JapanStylePadButtons: Boolean;
    ExclusiveMode: Boolean;
    readonly LatestActivePad: CInputPad | null;
    readonly LatestActivePadType: CInputManager.EPadType;
    /** Duration (ms) elapsed since latest user interraction on any device. */
    readonly TimeSinceLatestActivity: Integer;
    readonly TimeSinceLatestMouseActivity: Integer;
    readonly TimeSinceLatestTouchActivity: Integer;
    readonly TimeSinceLatestKeyboardActivity: Integer;
    readonly TimeSinceLatestPadActivity: Integer;
    GetPadButtonPlaygroundBinding(Pad: CInputPad | null, Button: CInputManager.EButton): Text;
    GetPadButtonCurrentBinding(Pad: CInputPad | null, Button: CInputManager.EButton): Text;
    GetActionBindingRaw(Pad: CInputPad | null, ActionMap: Text, ActionId: Text): Text;
    GetActionBinding(Pad: CInputPad | null, ActionMap: Text, ActionId: Text): Text;
    GetActionDisplayName(ActionMap: Text, ActionId: Text): Text;
    IsKeyPressed(KeyCode: Integer): Boolean;
}
export declare const CInputManager: Readonly<{
    readonly EButton: Readonly<{
        Left: "CInputManager::EButton::Left";
        Right: "CInputManager::EButton::Right";
        Up: "CInputManager::EButton::Up";
        Down: "CInputManager::EButton::Down";
        A: "CInputManager::EButton::A";
        B: "CInputManager::EButton::B";
        X: "CInputManager::EButton::X";
        Y: "CInputManager::EButton::Y";
        L1: "CInputManager::EButton::L1";
        R1: "CInputManager::EButton::R1";
        LeftStick: "CInputManager::EButton::LeftStick";
        RightStick: "CInputManager::EButton::RightStick";
        Menu: "CInputManager::EButton::Menu";
        View: "CInputManager::EButton::View";
        LeftStick_Left: "CInputManager::EButton::LeftStick_Left";
        LeftStick_Right: "CInputManager::EButton::LeftStick_Right";
        LeftStick_Up: "CInputManager::EButton::LeftStick_Up";
        LeftStick_Down: "CInputManager::EButton::LeftStick_Down";
        RightStick_Left: "CInputManager::EButton::RightStick_Left";
        RightStick_Right: "CInputManager::EButton::RightStick_Right";
        RightStick_Up: "CInputManager::EButton::RightStick_Up";
        RightStick_Down: "CInputManager::EButton::RightStick_Down";
        L2: "CInputManager::EButton::L2";
        R2: "CInputManager::EButton::R2";
        None: "CInputManager::EButton::None";
    }>;
    readonly EPadType: Readonly<{
        Keyboard: "CInputManager::EPadType::Keyboard";
        Mouse: "CInputManager::EPadType::Mouse";
        Generic: "CInputManager::EPadType::Generic";
        XBox: "CInputManager::EPadType::XBox";
        PlayStation: "CInputManager::EPadType::PlayStation";
        Vive: "CInputManager::EPadType::Vive";
    }>;
}>;
export declare namespace CInputManager {
    type EButton = (typeof CInputManager.EButton)[keyof typeof CInputManager.EButton];
    type EPadType = (typeof CInputManager.EPadType)[keyof typeof CInputManager.EPadType];
}
/** Script API to manage game data. */
export interface CDataFileMgr extends CNod {
    /** Array of task results. */
    TaskResults: (CTaskResult | null)[];
    /** Array of campaigns. */
    Campaigns: (CCampaign | null)[];
    /** Array of ghosts. */
    Ghosts: (CGhost | null)[];
    /** Available space for user files, in kilobytes. (clamped to 1Gb) */
    readonly UserSave_AvailableSpace: Integer;
    /** Background write to usersave in progress. Do not switch off the console. */
    readonly UserSave_IsWriting: Boolean;
    /** Release a task result no more used. */
    TaskResult_Release(TaskId: Ident): Void;
    /** Get a campaign from its id. */
    Campaign_Get(CampaignId: Text): CCampaign | null;
    ItemCollection_Create(UserId: Ident, ClubId: Text, DisplayName: Text, FileName: Text): CTaskResult_NSItemCollection | null;
    ItemCollection_CreateVersion(UserId: Ident, ItemCollectionId: Text, FileName: Text): CTaskResult_NSItemCollection | null;
    ItemCollection_Get(UserId: Ident, ItemCollectionId: Text): CTaskResult_NSItemCollection | null;
    ItemCollection_GetList(UserId: Ident, ItemCollectionIdList: Text[]): CTaskResult_NSItemCollectionList | null;
    ItemCollection_GetListByUser(UserId: Ident, WebServicesUserId: Text): CTaskResult_NSItemCollectionList | null;
    ItemCollection_SetActivityId(UserId: Ident, ItemCollectionId: Text, ActivityId: Text): CTaskResult_NSItemCollection | null;
    ItemCollection_Update(UserId: Ident, ItemCollectionId: Text, DisplayName: Text): CTaskResult_NSItemCollection | null;
    ItemCollection_AddFavorite(UserId: Ident, ItemCollectionId: Text): CTaskResult | null;
    ItemCollection_GetFavoriteList(UserId: Ident): CTaskResult_NSItemCollectionList | null;
    ItemCollection_RemoveFavorite(UserId: Ident, ItemCollectionId: Text): CTaskResult | null;
    Map_RefreshFromDisk(): Void;
    /** Get the list of map stored in the specified path. */
    Map_GetGameList(Path: Text, Flatten: Boolean): CTaskResult_MapList | null;
    /** Get the list of map stored according to the filters in the specified path. */
    Map_GetGameList(Path: Text, Flatten: Boolean, SortByNameElseByDate: Boolean, SortOrderAsc: Boolean): CTaskResult_MapList | null;
    /** Get the list of map stored in the specified path. Scope is used to specify if the list is retrieved from game data (1), title data (2) or user data (4), which can be added). */
    Map_GetFilteredGameList(Scope: Integer, Path: Text, Flatten: Boolean, SortByNameElseByDate: Boolean, SortOrderAsc: Boolean): CTaskResult_MapList | null;
    Map_GetAuthorGhost(Map: CMap | null): CGhost | null;
    Map_NadeoServices_Get(UserId: Ident, MapId: Text): CTaskResult_NSMap | null;
    Map_NadeoServices_GetFromUid(UserId: Ident, MapUid: Text): CTaskResult_NSMap | null;
    Map_NadeoServices_GetList(UserId: Ident, MapIdList: Text[]): CTaskResult_NSMapList | null;
    Map_NadeoServices_GetListFromUid(UserId: Ident, MapUidList: Text[]): CTaskResult_NSMapList | null;
    Map_NadeoServices_GetListFromUser(UserId: Ident, WebServicesUserId: Text): CTaskResult_NSMapList | null;
    Map_NadeoServices_GetVote(UserId: Ident, MapUid: Text): Integer;
    Map_NadeoServices_Register(UserId: Ident, MapUid: Text): CTaskResult_NSMap | null;
    Map_NadeoServices_Vote(UserId: Ident, MapUid: Text, Vote: Integer): Void;
    Map_NadeoServices_AddFavorite(UserId: Ident, MapUid: Text): CTaskResult | null;
    Map_NadeoServices_GetFavoriteList(UserId: Ident, MapTypeList: Text[], SortByDateElseByName: Boolean, SortOrderAsc: Boolean, OnlyPlayable: Boolean, OnlyMine: Boolean): CTaskResult_NSMapList | null;
    Map_NadeoServices_GetFavoriteListByUid(UserId: Ident, MapUidList: Text[]): CTaskResult_NSMapList | null;
    Map_NadeoServices_RemoveFavorite(UserId: Ident, MapUid: Text): CTaskResult | null;
    Map_NadeoServices_GetZenCount(UserId: Ident, MapUid: Text): CWebServicesTaskResult_Natural | null;
    Map_NadeoServices_IncrZenCount(UserId: Ident, MapUid: Text): CWebServicesTaskResult_Natural | null;
    Skin_NadeoServices_Get(UserId: Ident, SkinId: Text): CTaskResult_NSSkin | null;
    Skin_NadeoServices_GetFromChecksum(UserId: Ident, SkinChecksum: Text): CTaskResult_NSSkin | null;
    Skin_NadeoServices_GetList(UserId: Ident, SkinIdList: Text[]): CTaskResult_NSSkinList | null;
    Skin_NadeoServices_GetListFromChecksum(UserId: Ident, SkinChecksumList: Text[]): CTaskResult_NSSkinList | null;
    Skin_NadeoServices_GetListFromUser(UserId: Ident, WebServicesUserId: Text): CTaskResult_NSSkinList | null;
    Skin_NadeoServices_Register(UserId: Ident, SkinDisplayName: Text, SkinFileName: Text): CTaskResult_NSSkin | null;
    AccountSkin_NadeoServices_AddFavorite(UserId: Ident, SkinId: Text): CTaskResult | null;
    AccountSkin_NadeoServices_GetFavoriteList(UserId: Ident): CTaskResult_NSSkinList | null;
    AccountSkin_NadeoServices_GetList(UserId: Ident): CTaskResult_NSSkinList | null;
    AccountSkin_NadeoServices_GetListForUser(UserId: Ident, WebServicesUserId: Text): CTaskResult_NSSkinList | null;
    AccountSkin_NadeoServices_RemoveFavorite(UserId: Ident, SkinId: Text): CTaskResult | null;
    AccountSkin_NadeoServices_Set(UserId: Ident, SkinId: Text): CTaskResult_NSSkin | null;
    AccountSkin_NadeoServices_Unset(UserId: Ident, SkinType: Text): CTaskResult | null;
    /** Release a downloaded ghost no longer needed. */
    Ghost_Release(GhostId: Ident): Void;
    Ghost_Download(FileName: Text, Url: Text): CTaskResult_Ghost | null;
    Ghost_Upload(Url: Text, Ghost: CGhost | null, AdditionalHeaders: Text): CTaskResult | null;
    Replay_RefreshFromDisk(): Void;
    /** Get the list of replay stored in the specified path. */
    Replay_GetGameList(Path: Text, Flatten: Boolean): CTaskResult_ReplayList | null;
    /** Get the list of replay stored according to the filters in the specified path. */
    Replay_GetGameList(Path: Text, Flatten: Boolean, SortByNameElseByDate: Boolean, SortOrderAsc: Boolean): CTaskResult_ReplayList | null;
    /** Get the list of replay stored in the specified path. Scope is used to specify if the list is retrieved from game data (1), title data (2) or user data (4), which can be added. */
    Replay_GetFilteredGameList(Scope: Integer, Path: Text, Flatten: Boolean, SortByNameElseByDate: Boolean, SortOrderAsc: Boolean): CTaskResult_ReplayList | null;
    /** Get the list of ghosts from the replay stored at the specified file path. */
    Replay_Load(Path: Text): CTaskResult_GhostList | null;
    /** Save the map and the ghost into a replay file stored at the specified path. */
    Replay_Save(Path: Text, Map: CMap | null, Ghost: CGhost | null): CTaskResult | null;
    Replay_Author_Save(Map: CMap | null, Ghost: CGhost | null): CTaskResult | null;
    /** Get the list of media stored in the specified path. */
    Media_GetGameList(Type: CDataFileMgr.EMediaType, Path: Text, Flatten: Boolean): CTaskResult_FileList | null;
    /** Get the list of media stored according to the filters in the specified path. */
    Media_GetGameList(Type: CDataFileMgr.EMediaType, Path: Text, Flatten: Boolean, SortByNameElseByDate: Boolean, SortOrderAsc: Boolean): CTaskResult_FileList | null;
    /** Get the list of media stored in the specified path. Scope is used to specify if the list is retrieved from game data (1), title data (2) or user data (4), which can be added. */
    Media_GetFilteredGameList(Type: CDataFileMgr.EMediaType, Scope: Integer, Path: Text, Flatten: Boolean, SortByNameElseByDate: Boolean, SortOrderAsc: Boolean): CTaskResult_FileList | null;
    /** Refresh the list of media stored in the specified path. Scope is used to specify if the list is retrieved from game data (1), title data (2) or user data (4), which can be added. */
    Media_RefreshFromDisk(Type: CDataFileMgr.EMediaType, Scope: Integer): Void;
    GameMode_GetGameList(Scope: Integer, Path: Text, Flatten: Boolean): CTaskResult_GameModeList | null;
    Pack_DownloadOrUpdate(DisplayName: Text, Url: Text): CTaskResult | null;
    UserSave_DeleteFile(Path: Text): CTaskResult | null;
}
export declare const CDataFileMgr: Readonly<{
    readonly EMediaType: Readonly<{
        Image: "CDataFileMgr::EMediaType::Image";
        Sound: "CDataFileMgr::EMediaType::Sound";
        Script: "CDataFileMgr::EMediaType::Script";
        MatchSettings: "CDataFileMgr::EMediaType::MatchSettings";
        Module: "CDataFileMgr::EMediaType::Module";
        Skins: "CDataFileMgr::EMediaType::Skins";
        ItemCollection: "CDataFileMgr::EMediaType::ItemCollection";
    }>;
}>;
export declare namespace CDataFileMgr {
    type EMediaType = (typeof CDataFileMgr.EMediaType)[keyof typeof CDataFileMgr.EMediaType];
}
/** Score and leaderboard manager. */
export interface CScoreMgr extends CNod {
    /** Array of task results. */
    TaskResults: (CTaskResult | null)[];
    /** Release a task result no more used. */
    TaskResult_Release(TaskId: Ident): Void;
    /** Returns the ghost currently being recorded for a player on the current playground. (or the latest ghost if the player is not playing.) */
    Playground_GetPlayerGhost(GamePlayer: CPlayer | null): CGhost | null;
    /** Get respawn count and time from a compressed platform score value. */
    Score_GetFromCompressedPlatformScore(CompressedScore: Integer, RespawnCount: Integer, Time: Integer): Void;
    /** Set a new record for a map. */
    Map_SetNewRecord_v2(UserId: Ident, MapUid: Text, GameMode: Text, GameModeCustomData: Text, Ghost: CGhost | null): CTaskResult | null;
    /** Returns the user record time for a map. */
    Map_GetRecord_v2(UserId: Ident, MapUid: Text, ScopeType: Text, ScopeId: Text, GameMode: Text, GameModeCustomData: Text): Integer;
    /** Returns the user record full score (time, score, respawn) for a map. */
    Map_GetRecordFullScore(UserId: Ident, MapUid: Text, ScopeType: Text, ScopeId: Text, GameMode: Text, GameModeCustomData: Text, Time: Integer, Points: Integer, RespawnCount: Integer): Void;
    /** Returns the user record ghost for a map. */
    Map_GetRecordGhost_v2(UserId: Ident, MapUid: Text, ScopeType: Text, ScopeId: Text, GameMode: Text, GameModeCustomData: Text): CTaskResult_Ghost | null;
    /** Returns the number of medals for a map. */
    Map_GetMedal(UserId: Ident, MapUid: Text, ScopeType: Text, ScopeId: Text, GameMode: Text, GameModeCustomData: Text): Integer;
    /** Returns the record score of the medal for a map. */
    Map_GetMultiAsyncLevelRecord_v2(MapUid: Text, ScopeType: Text, ScopeId: Text, GameMode: Text, GameModeCustomData: Text, MultiAsyncLevel: Integer): Integer;
    /** Returns the record ghost of the medal for a map. */
    Map_GetMultiAsyncLevelRecordGhost_v2(MapUid: Text, ScopeType: Text, ScopeId: Text, GameMode: Text, GameModeCustomData: Text, MultiAsyncLevel: Integer): CTaskResult_Ghost | null;
    Map_GetPlayerListRecordList(UserId: Ident, WebServicesUserIdList: Text[], MapUid: Text, ScopeType: Text, ScopeId: Text, GameMode: Text, GameModeCustomData: Text): CTaskResult_MapRecordList | null;
    /** Loads and synchronizes scores for a list of map. */
    Map_LoadPBScoreList(UserId: Ident, MapUidList: Text[], GameMode: Text, GameModeCustomData: Text): CTaskResult | null;
    /** Creates a new season. */
    Season_Create(UserId: Ident, SeasonName: Text, GameMode: Text, GameModeCustomData: Text, MapRecordType: Text, StartTimeStamp: Integer, EndTimeStamp: Integer, MapUidList: Text[]): CTaskResult_Season | null;
    Season_Update(UserId: Ident, SeasonId: Text, SeasonName: Text, GameMode: Text, GameModeCustomData: Text, MapRecordType: Text, StartTimeStamp: Integer, EndTimeStamp: Integer, MapUidList: Text[]): CTaskResult_Season | null;
    Season_AddMapList(UserId: Ident, SeasonId: Text, MapUidList: Text[]): CTaskResult_Season | null;
    Season_RemoveMapList(UserId: Ident, SeasonId: Text, MapUidList: Text[]): CTaskResult_Season | null;
    /** Returns the season info from a season id. */
    Season_Get(UserId: Ident, SeasonId: Text): CTaskResult_Season | null;
    /** Returns a list of season info from a list of season id. */
    Season_GetList(UserId: Ident, SeasonIdList: Text[]): CTaskResult_SeasonList | null;
    /** Returns the list of created season from a webservices user id. */
    Season_GetListFromUser(UserId: Ident, WebServicesUserId: Text): CTaskResult_SeasonList | null;
    /** Loads and synchronizes season scores. */
    Season_LoadScore(UserId: Ident, SeasonId: Text): CTaskResult | null;
    /** Loads and synchronizes scores for a list of season. */
    Season_LoadScoreList(UserId: Ident, SeasonIdList: Text[]): CTaskResult | null;
    /** Returns the account trophy history. */
    Trophy_GetGainHistory(UserId: Ident, Offset: Integer, Count: Integer): CTaskResult_AccountTrophyGainHistory | null;
    /** Returns the account trophy history filtered by the specified type. */
    Trophy_GetGainHistoryByType(UserId: Ident, TrophyType: Integer, Offset: Integer, Count: Integer): CTaskResult_AccountTrophyGainHistory | null;
    /** Returns the account trophy summary for the last year. */
    Trophy_GetLastYearSummary(UserId: Ident): CTaskResult_AccountTrophyLastYearSummary | null;
    /** Returns the account trophy summary for the last year for the specified user */
    Trophy_GetLastYearSummaryForUser(UserId: Ident, WebServicesUserId: Text): CTaskResult_AccountTrophyLastYearSummary | null;
    /** Returns the trophy solo medal achievement settings */
    Trophy_GetSoloMedalAchievementSettings(UserId: Ident, SoloMedalAchievementType: Text): CTaskResult_TrophySoloMedalAchievementSettings | null;
}
/** Documentation for class CRankingsZoneMgr */
export interface CRankingsZoneMgr extends CNod {
    TaskResults: (CTaskResult | null)[];
    TaskResult_Release(TaskId: Ident): Void;
    GetPathAndName(ZoneFullPath: Text, ZonePath: Text, ZoneName: Text): Void;
    GetZoneList(ZoneIdList: Text[]): CTaskResult_ZoneList | null;
    GetChildZoneList(ZoneFullPath: Text): CTaskResult_ZoneList | null;
    RetrieveUserZoneList(UserId: Ident, WebServicesUserIdList: Text[]): CTaskResult_UserZoneList | null;
    SetUserZone(UserId: Ident, ZoneFullPath: Text): CTaskResult | null;
}
/** API for local users/profiles. */
export interface CUserV2Manager extends CNod {
    readonly MainUserProfile: CUserV2Profile | null;
    TaskResults: (CTaskResult | null)[];
    readonly MainUserWebServicesInfo: CMasterServerUser | null;
    readonly IsNetworkAvailable: Boolean;
    VoiceChat_Events: (CVoiceChatEvent | null)[];
    readonly VoiceChat_DisplayUI: Boolean;
    VoiceChat_Mute_Myself: Boolean;
    VoiceChat_Users: (CGameUserVoiceChat | null)[];
    VoiceChat_Users_Local: (CGameUserVoiceChat | null)[];
    VoiceChat_Users_Remote: (CGameUserVoiceChat | null)[];
    /** List of users currently speaking. Sorted with local users first. */
    VoiceChat_Users_Speaking: (CGameUserVoiceChat | null)[];
    VoiceChat_Users_Muted: (CGameUserVoiceChat | null)[];
    VoiceChat_Users_Remote_Muted: (CGameUserVoiceChat | null)[];
    TaskResult_Release(TaskId: Ident): Void;
    TaskError_ShowSystemDialog(UserId: Ident, ErrorCode: Text): CTaskResult | null;
    /** NullId for the mainuser. */
    GetGroups(UserId: Ident): CTaskResult_StringIntList | null;
    FindDisplayName(WebServicesUserId: Text, IsFirstPartyDisplayName: Boolean): Text;
    ResolveURLShorcut(ShortCutId: Text): Text;
    FindWebServicesUserInfo(UserId: Ident): CMasterServerUser | null;
    CheckNetworkAvailability(UserId: Ident): CTaskResult | null;
    ConnectUser(UserId: Ident): CTaskResult_Connect | null;
    ConnectUser(UserId: Ident, ForceUbisoftConnectOverlay: Boolean): CTaskResult_Connect | null;
    ConnectUser(UserId: Ident, ForceUbisoftConnectOverlay: Boolean, OfflineMode: Boolean): CTaskResult | null;
    Commerce_ShowPrimaryStore(UserId: Ident): CTaskResult | null;
    Config_GetBoolValue(Key: Text, Value: Boolean): Boolean;
    Config_GetNatValue(Key: Text, Value: Integer): Boolean;
    Config_GetRealValue(Key: Text, Value: Real): Boolean;
    Config_GetStringIntValue(Key: Text, Value: Text): Boolean;
    Config_GetStringValue(Key: Text, Value: Text): Boolean;
    CrossPlay_IsEnabled(UserId: Ident): CTaskResult_Bool | null;
    CrossPlay_Setting_GetEnabled(UserId: Ident): Boolean;
    CrossPlay_Setting_SetEnabled(UserId: Ident, Value: Boolean): Void;
    CrossPlay_V2_IsEnabled(UserId: Ident): CUserV2Manager.ECrossPlayState;
    CrossPlay_V2_SetEnabled(UserId: Ident, Enabled: Boolean): Void;
    Blocklist_CanViewUGC(UserId: Ident, WebServicesUserId: Text): Boolean;
    Friend_GetLastChangeIndex(UserId: Ident): Integer;
    Friend_GetList(UserId: Ident): CTaskResult_FriendList | null;
    LiveSession_GetInfo(UserId: Ident, SessionId: Text): CTaskResult_Session_Get | null;
    News_GetProfileNewsList(UserId: Ident): CTaskResult_UserNewsList | null;
    News_GetSpaceNewsList(UserId: Ident): CTaskResult_UserNewsList | null;
    News_OpenLink(UserId: Ident, Type: Text, Param: Text): CTaskResult | null;
    Prestige_GetAccountPrestigeList(UserId: Ident): CTaskResult_UserPrestigeList | null;
    Prestige_GetCurrentAccountPrestige(UserId: Ident): CTaskResult_UserPrestige | null;
    Prestige_GetCurrentAccountPrestigeForUser(UserId: Ident, WebServicesUserId: Text): CTaskResult_UserPrestige | null;
    Prestige_GetPrestigeList(UserId: Ident, Mode: CUserV2Manager.EPrestigeMode, Year: Integer, CategoryType: Text): CTaskResult_PrestigeList | null;
    Prestige_GetPrestigeListByYear(UserId: Ident, Year: Integer): CTaskResult_PrestigeList | null;
    Prestige_SetCurrentAccountPrestige(UserId: Ident, PrestigeId: Text): CTaskResult_UserPrestige | null;
    Prestige_ResetCurrentAccountPrestige(UserId: Ident): CTaskResult_UserPrestige | null;
    Squad_AcceptInvitation(UserId: Ident, SquadId: Text): CTaskResult_Squad | null;
    Squad_CancelInvitation(UserId: Ident, SquadId: Text, WebServicesUserId: Text): CTaskResult_Squad | null;
    Squad_Create(UserId: Ident, SquadName: Text, Size: Integer): CTaskResult_Squad | null;
    Squad_Create(UserId: Ident, SquadName: Text, Size: Integer, Type: Text): CTaskResult_Squad | null;
    Squad_DeclineInvitation(UserId: Ident, SquadId: Text): CTaskResult_Squad | null;
    Squad_Get(UserId: Ident, SquadId: Text): CTaskResult_Squad | null;
    Squad_GetCurrent(UserId: Ident): CTaskResult_Squad | null;
    Squad_Invite(UserId: Ident, SquadId: Text, WebServicesUserId: Text): CTaskResult_Squad | null;
    Squad_JoinSession(UserId: Ident, SessionId: Text, IsFirstPartySession: Boolean): CTaskResult | null;
    Squad_Leave(UserId: Ident, SquadId: Text): CTaskResult_Squad | null;
    Squad_RemoveMember(UserId: Ident, SquadId: Text, WebServicesUserId: Text): CTaskResult_Squad | null;
    Squad_SetLeader(UserId: Ident, SquadId: Text, WebServicesUserId: Text): CTaskResult_Squad | null;
    Squad_SetLocked(UserId: Ident, SquadId: Text, Locked: Boolean): Void;
    Squad_SetType(UserId: Ident, SquadId: Text, Type: Text): Void;
    Squad_SetEnabled(UserId: Ident, Enabled: Boolean): Void;
    VoiceChat_MuteAll(): Void;
    VoiceChat_UnmuteAll(): Void;
    VoiceChat_FindUserFromWebServicesUserId(WebServicesUserId: Text): CGameUserVoiceChat | null;
    Subscription_GetEndTimeStamp(UserId: Ident, SubscriptionName: Text): Integer;
    Subscription_IsRefreshingInfo(UserId: Ident): Boolean;
    Tag_GetClubTag(UserId: Ident): CTaskResult_StringInt | null;
    Tag_GetClubTagList(UserId: Ident, WebServicesUserIdList: Text[]): CTaskResult_ClubTagList | null;
    Tag_SetClubTag(UserId: Ident, ClubTag: Text): CTaskResult | null;
}
export declare const CUserV2Manager: Readonly<{
    readonly ECrossPlayState: Readonly<{
        Unknown: "CUserV2Manager::ECrossPlayState::Unknown";
        Disabled: "CUserV2Manager::ECrossPlayState::Disabled";
        Enabled: "CUserV2Manager::ECrossPlayState::Enabled";
    }>;
    readonly EPrestigeMode: Readonly<{
        Unknown: "CUserV2Manager::EPrestigeMode::Unknown";
        Ranked: "CUserV2Manager::EPrestigeMode::Ranked";
        Royal: "CUserV2Manager::EPrestigeMode::Royal";
        Season: "CUserV2Manager::EPrestigeMode::Season";
    }>;
}>;
export declare namespace CUserV2Manager {
    type ECrossPlayState = (typeof CUserV2Manager.ECrossPlayState)[keyof typeof CUserV2Manager.ECrossPlayState];
    type EPrestigeMode = (typeof CUserV2Manager.EPrestigeMode)[keyof typeof CUserV2Manager.EPrestigeMode];
}
/** Documentation for class CAnimManager */
export interface CAnimManager extends CNod {
    Add(Control: CMlControl | null, XmlTarget: Text, StartTime: Integer, Duration: Integer, EasingFunc: CAnimManager.EAnimManagerEasing): Void;
    Add(Control: CMlControl | null, XmlTarget: Text, Duration: Integer, EasingFunc: CAnimManager.EAnimManagerEasing): Void;
    AddChain(Control: CMlControl | null, XmlTarget: Text, Duration: Integer, EasingFunc: CAnimManager.EAnimManagerEasing): Void;
    Flush(Control: CMlControl | null): Void;
}
export declare const CAnimManager: Readonly<{
    readonly EAnimManagerEasing: Readonly<{
        Linear: "CAnimManager::EAnimManagerEasing::Linear";
        QuadIn: "CAnimManager::EAnimManagerEasing::QuadIn";
        QuadOut: "CAnimManager::EAnimManagerEasing::QuadOut";
        QuadInOut: "CAnimManager::EAnimManagerEasing::QuadInOut";
        CubicIn: "CAnimManager::EAnimManagerEasing::CubicIn";
        CubicOut: "CAnimManager::EAnimManagerEasing::CubicOut";
        CubicInOut: "CAnimManager::EAnimManagerEasing::CubicInOut";
        QuartIn: "CAnimManager::EAnimManagerEasing::QuartIn";
        QuartOut: "CAnimManager::EAnimManagerEasing::QuartOut";
        QuartInOut: "CAnimManager::EAnimManagerEasing::QuartInOut";
        QuintIn: "CAnimManager::EAnimManagerEasing::QuintIn";
        QuintOut: "CAnimManager::EAnimManagerEasing::QuintOut";
        QuintInOut: "CAnimManager::EAnimManagerEasing::QuintInOut";
        SineIn: "CAnimManager::EAnimManagerEasing::SineIn";
        SineOut: "CAnimManager::EAnimManagerEasing::SineOut";
        SineInOut: "CAnimManager::EAnimManagerEasing::SineInOut";
        ExpIn: "CAnimManager::EAnimManagerEasing::ExpIn";
        ExpOut: "CAnimManager::EAnimManagerEasing::ExpOut";
        ExpInOut: "CAnimManager::EAnimManagerEasing::ExpInOut";
        CircIn: "CAnimManager::EAnimManagerEasing::CircIn";
        CircOut: "CAnimManager::EAnimManagerEasing::CircOut";
        CircInOut: "CAnimManager::EAnimManagerEasing::CircInOut";
        BackIn: "CAnimManager::EAnimManagerEasing::BackIn";
        BackOut: "CAnimManager::EAnimManagerEasing::BackOut";
        BackInOut: "CAnimManager::EAnimManagerEasing::BackInOut";
        ElasticIn: "CAnimManager::EAnimManagerEasing::ElasticIn";
        ElasticOut: "CAnimManager::EAnimManagerEasing::ElasticOut";
        ElasticInOut: "CAnimManager::EAnimManagerEasing::ElasticInOut";
        ElasticIn2: "CAnimManager::EAnimManagerEasing::ElasticIn2";
        ElasticOut2: "CAnimManager::EAnimManagerEasing::ElasticOut2";
        ElasticInOut2: "CAnimManager::EAnimManagerEasing::ElasticInOut2";
        BounceIn: "CAnimManager::EAnimManagerEasing::BounceIn";
        BounceOut: "CAnimManager::EAnimManagerEasing::BounceOut";
        BounceInOut: "CAnimManager::EAnimManagerEasing::BounceInOut";
    }>;
}>;
export declare namespace CAnimManager {
    type EAnimManagerEasing = (typeof CAnimManager.EAnimManagerEasing)[keyof typeof CAnimManager.EAnimManagerEasing];
}
/** Create scenes for use in menus with &lt;Camera&gt; manialink element */
export interface CMenuSceneManager extends CNod {
    /** LayoutFileName: can be 'Default' (or '') for default painter scene, 'Empty' for a simple empty scene, or a filename to game data. */
    SceneCreate(LayoutFileName: Text): Ident;
    SceneDestroy(SceneId: Ident): Void;
    CameraSetLocation(SceneId: Ident, Position: Vec3, AngleDeg: Real): Void;
    CameraSetLocation(SceneId: Ident, Position: Vec3, AngleDeg: Real, FovY_Deg: Real): Void;
    CameraSetFromItem(SceneId: Ident, ItemId: Ident): Void;
    LightDir0Set(SceneId: Ident, sRGB: Vec3, Intensity: Real): Void;
    LightDir0Set(SceneId: Ident, sRGB: Vec3, Intensity: Real, AltitudeDeg: Real, AzimutDeg: Real): Void;
    /** SkinNameOrUrl: can be 'Skins/Model/....', 'http://....', 'Default' (or '') for item default skin, 'Profile' for the user choice for the model. ModelName: item filename. */
    ItemCreate(SceneId: Ident, ModelName: Text, SkinName: Text, SkinUrl: Text): Ident;
    /** SkinNameOrUrl: can be 'Skins/Model/....', 'http://....', 'Default' (or '') for item default skin, 'Profile' for the user choice for the model. ModelName: item filename. */
    ItemCreate(SceneId: Ident, ModelName: Text, SkinName: Text, SkinUrl: Text, SkinOptions: Text): Ident;
    ItemDestroy(SceneId: Ident, ItemId: Ident): Void;
    ItemSetLocation(SceneId: Ident, ItemId: Ident, Position: Vec3, AngleDeg: Real, IsTurntable: Boolean): Void;
    ItemAttachTo(SceneId: Ident, ItemId: Ident, ParentItemId: Ident): Void;
    ItemSetVehicleState(SceneId: Ident, ItemId: Ident, Steer: Real, Brakes: Boolean, FrontLight: Boolean, TurboLvl: Integer, BoostLvl: Integer, BurnoutSmoke: Boolean): Void;
    ItemSetPlayerState(SceneId: Ident, ItemId: Ident, LightrailColor: Vec3, DossardColor: Vec3, DossardNumber: Text, DossardTrigram: Text): Void;
    ItemSetPlayerState(SceneId: Ident, ItemId: Ident, User: CUser | null): Void;
    ItemTriggerPlayerGesture(SceneId: Ident, ItemId: Ident): Void;
    ItemSetPivot(SceneId: Ident, ItemId: Ident, Pivot: Vec3): Void;
    ItemSetVisible(SceneId: Ident, ItemId: Ident, IsVisible: Boolean): Void;
    PlaneReflectEnable(SceneId: Ident, OutOpacity: Real, Quad0: CMlQuad | null, Quad1: CMlQuad | null, Quad2: CMlQuad | null, Quad3: CMlQuad | null): Void;
    PlaneReflectEnable(SceneId: Ident, OutOpacity: Real, Quad0: CMlQuad | null, Quad1: CMlQuad | null, Quad2: CMlQuad | null, Quad3: CMlQuad | null, HorizonAngleDeg_InCamera: Real): Void;
    PlaneReflectRefresh(): Void;
    SetBackgroundQuads(SceneId: Ident, Quad0: CMlQuad | null, Quad1: CMlQuad | null, Quad2: CMlQuad | null, Quad3: CMlQuad | null): Void;
    CubeMapSetImage2ds(SceneId: Ident, RelName0: Text, RelName1: Text, RelName2: Text, RelName3: Text): Void;
    CubeMapSetFromEquirect(SceneId: Ident, Quad: CMlQuad | null): Void;
    ColorGradingSetImage2ds(SceneId: Ident, RelName0: Text, RelName1: Text, RelName2: Text, RelName3: Text): Void;
    /** iMood: BackgroundQuads AltitudeDeg: 0=horizon, 90°=Zenith AzimutDeg: 0=North(+Z), 90=East(-X), 180=South(-Z), 270=West(+X) !! the feature is enabled only when all 4 Moods have been set !! */
    MoodLightDir0Set(SceneId: Ident, iMood: Integer, sRGB: Vec3, Intensity: Real, AltitudeDeg: Real, AzimutDeg: Real): Void;
    /** All scales are [0,1] range */
    PodiumTweakShadingSet(SceneId: Ident, BaseColor: Real, CubeReflect: Real, PlaneReflect: Real): Void;
    PostFxSet(SceneId: Ident, BloomIntensity: Real): Void;
}
/** API for platform calls. Supported declare modes : - Local */
export interface CSystemPlatform extends CNod {
    readonly Platform: CSystemPlatform.ESystemPlatform;
    readonly SkuIdentifier: CSystemPlatform.ESystemSkuIdentifier;
    readonly ExeVersion: Text;
    /** Beware: altough it is a number of seconds since 'local epoch', this is *not a unix timestamp* as it is the time in the local time zone. It is only useful for localized UI. Use Timelib::GetCurrent() instead if you need an absolute unix timestamp. */
    readonly CurrentLocalDate: Integer;
    readonly CurrentLocalDateText: Text;
    readonly CurrentTimezone: Text;
    readonly CurrentTimezoneTimeOffset: Text;
    readonly ExtraTool_Info: Text;
    ExtraTool_Data: Text;
    /** Background write to usersave in progress. Do not switch off the console. */
    readonly IsWritingUserSave: Boolean;
    ClipboardSet(ClipboardText: Text): Void;
    FlashWindow(): Void;
}
export declare const CSystemPlatform: Readonly<{
    readonly ESystemPlatform: Readonly<{
        None: "CSystemPlatform::ESystemPlatform::None";
        Steam: "CSystemPlatform::ESystemPlatform::Steam";
        UPlay: "CSystemPlatform::ESystemPlatform::UPlay";
        PS4: "CSystemPlatform::ESystemPlatform::PS4";
        XBoxOne: "CSystemPlatform::ESystemPlatform::XBoxOne";
        PS5: "CSystemPlatform::ESystemPlatform::PS5";
        XBoxSeries: "CSystemPlatform::ESystemPlatform::XBoxSeries";
        Stadia: "CSystemPlatform::ESystemPlatform::Stadia";
        Luna: "CSystemPlatform::ESystemPlatform::Luna";
    }>;
    readonly ESystemSkuIdentifier: Readonly<{
        Unknown: "CSystemPlatform::ESystemSkuIdentifier::Unknown";
        EU: "CSystemPlatform::ESystemSkuIdentifier::EU";
        US: "CSystemPlatform::ESystemSkuIdentifier::US";
        JP: "CSystemPlatform::ESystemSkuIdentifier::JP";
        CN: "CSystemPlatform::ESystemSkuIdentifier::CN";
    }>;
}>;
export declare namespace CSystemPlatform {
    type ESystemPlatform = (typeof CSystemPlatform.ESystemPlatform)[keyof typeof CSystemPlatform.ESystemPlatform];
    type ESystemSkuIdentifier = (typeof CSystemPlatform.ESystemSkuIdentifier)[keyof typeof CSystemPlatform.ESystemSkuIdentifier];
}
/** API for webservices notifications. */
export interface CWSNotificationManager extends CNod {
    /** Array of task results. */
    TaskResults: (CTaskResult | null)[];
    /** Release a task result no more used. */
    TaskResult_Release(TaskId: Ident): Void;
    /** Check if a notification is available for the specified user. */
    Notification_IsAvailable(UserId: Ident): Boolean;
    /** Retrieve the next available notification for the specified user. */
    Notification_PopNext(UserId: Ident): CTaskResult_WSNotification | null;
}
/** API for Maniaplanet client scripts. Supported declare modes : - Local - Persistent */
export interface CGameModuleEditorBase extends CManiaApp {
}
/** API for a Title main menu. Supported declare modes : - Local - Persistent */
export interface CManiaAppTitle extends CManiaApp {
    PendingEvents: (CManiaAppEvent | null)[];
    LoadingScreenRequireKeyPressed: Boolean;
    DontScaleMainMenuForHMD: Boolean;
    /** Values in range (0.000000-1.000000) */
    FillExtraSpaceWithBluredContents_Opacity: Real;
    readonly TitleControl: CTitleControl | null;
    /** Only available when editing a title. */
    readonly TitleEdition: CTitleEdition | null;
    readonly Notifications: CNotificationsConsumer | null;
    readonly ExternalRequest_Type: Text;
    ExternalRequest_Data: Text[];
    readonly MatchSettingsManager: CMatchSettingsManager | null;
    readonly MenuSceneManager: CMenuSceneManager | null;
    readonly Authentication_GetTokenResponseReceived: Boolean;
    readonly Authentication_ErrorCode: Integer;
    readonly Authentication_Token: Text;
    Adverts_UsePersonnalData: Boolean;
    Adverts_Enabled: Boolean;
    readonly VoiceChat: CVoiceChatConfig | null;
    Menu_Quit(): Void;
    Menu_Home(): Void;
    Menu_Solo(): Void;
    Menu_Local(): Void;
    Menu_Internet(): Void;
    Menu_Editor(): Void;
    Menu_Profile(): Void;
    /** Call as soon as the request has been consumed and is being processed. */
    ExternalRequest_Clear(): Void;
    LogToSessionTrace(Text: Text): Void;
    Authentication_GetToken(UserId: Ident, AppLogin: Text): Void;
}
/** API for the plugins of the map editor. Supported declare modes : - Local - Persistent */
export interface CMapEditorPlugin extends CManiaApp {
    PendingEvents: (CMapEditorPluginEvent | null)[];
    readonly Map: CMap | null;
    readonly MapName: Text;
    readonly MapFileName: Text;
    readonly IsEditorReadyForRequest: Boolean;
    readonly BackToMainMenuRequested: Boolean;
    HoldLoadingScreen: Boolean;
    readonly CurrentShadowsQuality: CMapEditorPlugin.ShadowsQuality;
    readonly IsUltraShadowsQualityAvailable: Boolean;
    EnableMapTypeStartTest: Boolean;
    PlaceMode: CMapEditorPlugin.PlaceMode;
    EditMode: CMapEditorPlugin.EditMode;
    NextMapElemColor: CMapEditorPlugin.MapElemColor;
    MapElemColorPalette: CMapEditorPlugin.MapElemColorPalette;
    readonly IsColorBlindModeActive: Boolean;
    MapElemColorPalettes: CMapEditorPlugin.MapElemColorPalette[];
    ForceMacroblockColor: Boolean;
    NextItemPhaseOffset: CMapEditorPlugin.PhaseOffset;
    NextMbAdditionalPhaseOffset: CMapEditorPlugin.PhaseOffset;
    NextMapElemLightmapQuality: CMapEditorPlugin.MapElemLightmapQuality;
    ForceMacroblockLightmapQuality: Boolean;
    UndergroundMode: Boolean;
    BlockStockMode: Boolean;
    readonly Inventory: CMapEditorInventory | null;
    HideInventory: Boolean;
    CameraVAngle: Real;
    CameraHAngle: Real;
    CameraToTargetDistance: Real;
    CameraTargetPosition: Vec3;
    readonly CameraPosition: Vec3;
    ThumbnailCameraVAngle: Real;
    ThumbnailCameraHAngle: Real;
    ThumbnailCameraRoll: Real;
    ThumbnailCameraFovY: Real;
    ThumbnailCameraPosition: Vec3;
    EnableAirMapping: Boolean;
    EnableMixMapping: Boolean;
    CopyPaste_GetLightmapQualityInSelection_Results: CMapEditorPlugin.MapElemLightmapQuality[];
    MacroblockInstanceItemsResults: (CItemAnchor | null)[];
    GetItemsCountRequest: Text[];
    readonly Camera: CMapEditorCamera | null;
    readonly Cursor: CMapEditorCursor | null;
    Items: (CItemAnchor | null)[];
    MediatrackIngameClips: Text[];
    MediatrackIngameEditedClipIndex: Integer;
    Blocks: (CBlock | null)[];
    BlockModels: (CBlockModel | null)[];
    TerrainBlockModels: (CBlockModel | null)[];
    MacroblockModels: (CMacroblockModel | null)[];
    ClassicBlocks: (CBlock | null)[];
    TerrainBlocks: (CBlock | null)[];
    GhostBlocks: (CBlock | null)[];
    FixedClipLists: (CBlockClipList | null)[];
    FrameClipLists: (CBlockClipList | null)[];
    MacroblockInstanceClipLists: (CBlockClipList | null)[];
    MacroblockInstances: (CMacroblockInstance | null)[];
    ConnectResults: (CMapEditorConnectResults | null)[];
    AnchorData: (CAnchorData | null)[];
    CustomSelectionCoords: Int3[];
    CustomSelectionRGB: Vec3;
    EnableEditorInputsCustomProcessing: Boolean;
    EnableCursorShowingWhenInterfaceIsFocused: Boolean;
    HideEditorInterface: Boolean;
    HideBlockHelpers: Boolean;
    ShowPlacementGrid: Boolean;
    readonly IsTesting: Boolean;
    readonly IsValidating: Boolean;
    readonly EditorInputIsDown_Menu: Boolean;
    readonly EditorInputIsDown_SwitchToRace: Boolean;
    readonly EditorInputIsDown_Undo: Boolean;
    readonly EditorInputIsDown_Redo: Boolean;
    readonly EditorInputIsDown_CursorTiltLeft: Boolean;
    readonly EditorInputIsDown_CursorTiltRight: Boolean;
    readonly EditorInputIsDown_CursorUp: Boolean;
    readonly EditorInputIsDown_CursorRight: Boolean;
    readonly EditorInputIsDown_CursorDown: Boolean;
    readonly EditorInputIsDown_CursorLeft: Boolean;
    readonly EditorInputIsDown_CursorRaise: Boolean;
    readonly EditorInputIsDown_CursorLower: Boolean;
    readonly EditorInputIsDown_CursorTurn: Boolean;
    readonly EditorInputIsDown_CursorPick: Boolean;
    readonly EditorInputIsDown_CursorPlace: Boolean;
    readonly EditorInputIsDown_CursorDelete: Boolean;
    readonly EditorInputIsDown_CameraUp: Boolean;
    readonly EditorInputIsDown_CameraRight: Boolean;
    readonly EditorInputIsDown_CameraDown: Boolean;
    readonly EditorInputIsDown_CameraLeft: Boolean;
    readonly EditorInputIsDown_CameraZoomNext: Boolean;
    readonly EditorInputIsDown_Camera0: Boolean;
    readonly EditorInputIsDown_Camera1: Boolean;
    readonly EditorInputIsDown_Camera3: Boolean;
    readonly EditorInputIsDown_Camera7: Boolean;
    readonly EditorInputIsDown_Camera9: Boolean;
    readonly EditorInputIsDown_PivotChange: Boolean;
    readonly EditorInputIsDown_CursorTurnSlightly: Boolean;
    readonly EditorInputIsDown_CursorTurnSlightlyAntiClockwise: Boolean;
    readonly EditorInputIsDown_IconUp: Boolean;
    readonly EditorInputIsDown_IconRight: Boolean;
    readonly EditorInputIsDown_IconDown: Boolean;
    readonly EditorInputIsDown_IconLeft: Boolean;
    readonly EditorInputIsDown_RemoveAll: Boolean;
    readonly EditorInputIsDown_Save: Boolean;
    readonly EditorInputIsDown_SelectAll: Boolean;
    readonly EditorInputIsDown_Copy: Boolean;
    readonly EditorInputIsDown_Cut: Boolean;
    readonly EditorInputIsDown_Paste: Boolean;
    readonly CollectionSquareSize: Real;
    readonly CollectionSquareHeight: Real;
    readonly CollectionGroundY: Integer;
    readonly ValidationStatus: CMapEditorPlugin.ValidationStatus;
    /** Preview the 'RoadsideSpectators' on the bleachers. if -1, use the BleacherSpectatorsAbsoluteCount instead. */
    BleacherSpectatorsFillRatio: Real;
    /** Preview the 'RoadsideSpectators' on the bleachers. used if BleacherSpectatorsFillRatio < 0. */
    BleacherSpectatorsCount: Integer;
    ManialinkText: Text;
    readonly ManialinkPage: CMlPage | null;
    HideOtherPlugins(): Void;
    ShowOtherPlugins(): Void;
    ComputeShadows(): Void;
    ComputeShadows(ShadowsQuality: CMapEditorPlugin.ShadowsQuality): Void;
    DisplayDefaultSetObjectivesDialog(): Void;
    Undo(): Boolean;
    Redo(): Boolean;
    Help(): Void;
    Validate(): Void;
    AutoSave(): Void;
    Quit(): Void;
    QuickQuit(): Void;
    QuitAndSetResult(Type: Text, Data: Text[]): Void;
    QuickQuitAndSetResult(Type: Text, Data: Text[]): Void;
    TestMapFromStart(): Void;
    TestMapFromCoord(Coord: Int3, Dir: CMapEditorPlugin.CardinalDirections): Void;
    TestMapFromMacroblockInstance(MbInstance: CMacroblockInstance | null): Void;
    TestMapWithMode(RulesModeName: Text): Void;
    TestMapWithMode(RulesModeName: Text, SettingsXml: Text): Void;
    TestMapWithMode_SplitScreen(RulesModeName: Text): Void;
    TestMapWithMode_SplitScreen(RulesModeName: Text, ScreenCount: Integer): Void;
    TestMapWithMode_SplitScreen(RulesModeName: Text, ScreenCount: Integer, FakeCount: Integer, SettingsXml: Text): Void;
    SaveMap(FileName: Text): Void;
    SaveMap(FileName: Text, Path: Text): Void;
    SaveMapGamepadEditor(FileName: Text): Void;
    SetNextMapElemColorPalette(): Void;
    GetMapElemColor(Block: CBlock | null): CMapEditorPlugin.MapElemColor;
    GetMapElemColor(AnchoredObject: CItemAnchor | null): CMapEditorPlugin.MapElemColor;
    GetMapElemColor(Anchor: CAnchorData | null): CMapEditorPlugin.MapElemColor;
    SetMapElemColor(Block: CBlock | null, Color: CMapEditorPlugin.MapElemColor): Void;
    SetMapElemColor(AnchoredObject: CItemAnchor | null, Color: CMapEditorPlugin.MapElemColor): Void;
    SetMapElemColor(Anchor: CAnchorData | null, Color: CMapEditorPlugin.MapElemColor): Void;
    GetColorPaletteName(EColorPalette: CMapEditorPlugin.MapElemColorPalette): Text;
    GetColorPaletteCurrentColor(EColorPalette: CMapEditorPlugin.MapElemColorPalette, EColor: CMapEditorPlugin.MapElemColor): Vec3;
    GetColorPaletteColorblindColor(EColorPalette: CMapEditorPlugin.MapElemColorPalette, EColor: CMapEditorPlugin.MapElemColor): Vec3;
    GetColorPaletteNotColorblindColor(EColorPalette: CMapEditorPlugin.MapElemColorPalette, EColor: CMapEditorPlugin.MapElemColor): Vec3;
    GetRaceCamera(Position: Vec3, Yaw: Real, Pitch: Real, Roll: Real, FovY: Real): Boolean;
    RemoveAllBlocks(): Void;
    RemoveAllTerrain(): Void;
    RemoveAllOffZone(): Void;
    RemoveAllObjects(): Void;
    RemoveAll(): Void;
    RemoveAllBlocksAndTerrain(): Void;
    ShowCustomSelection(): Void;
    HideCustomSelection(): Void;
    CopyPaste_Copy(): Void;
    CopyPaste_Cut(): Void;
    CopyPaste_Remove(): Void;
    CopyPaste_SelectAll(): Void;
    CopyPaste_ResetSelection(): Void;
    OpenToolsMenu(): Void;
    EditMediatrackIngame(): Void;
    PreloadAllBlocks(): Void;
    PreloadAllItems(): Void;
    CanPlaceBlock(BlockModel: CBlockModel | null, Coord: Int3, Dir: CMapEditorPlugin.CardinalDirections, OnGround: Boolean, VariantIndex: Integer): Boolean;
    PlaceBlock(BlockModel: CBlockModel | null, Coord: Int3, Dir: CMapEditorPlugin.CardinalDirections): Boolean;
    CanPlaceGhostBlock(BlockModel: CBlockModel | null, Coord: Int3, Dir: CMapEditorPlugin.CardinalDirections): Boolean;
    PlaceGhostBlock(BlockModel: CBlockModel | null, Coord: Int3, Dir: CMapEditorPlugin.CardinalDirections): Boolean;
    CanPlaceBlock_NoDestruction(BlockModel: CBlockModel | null, Coord: Int3, Dir: CMapEditorPlugin.CardinalDirections, OnGround: Boolean, VariantIndex: Integer): Boolean;
    PlaceBlock_NoDestruction(BlockModel: CBlockModel | null, Coord: Int3, Dir: CMapEditorPlugin.CardinalDirections): Boolean;
    CanPlaceRoadBlocks(BlockModel: CBlockModel | null, StartCoord: Int3, EndCoord: Int3): Boolean;
    PlaceRoadBlocks(BlockModel: CBlockModel | null, StartCoord: Int3, EndCoord: Int3): Boolean;
    CanPlaceTerrainBlocks(BlockModel: CBlockModel | null, StartCoord: Int3, EndCoord: Int3): Boolean;
    PlaceTerrainBlocks(BlockModel: CBlockModel | null, StartCoord: Int3, EndCoord: Int3): Boolean;
    PlaceTerrainBlocks_NoDestruction(BlockModel: CBlockModel | null, StartCoord: Int3, EndCoord: Int3): Boolean;
    CanPlaceMacroblock(MacroblockModel: CMacroblockModel | null, Coord: Int3, Dir: CMapEditorPlugin.CardinalDirections): Boolean;
    PlaceMacroblock(MacroblockModel: CMacroblockModel | null, Coord: Int3, Dir: CMapEditorPlugin.CardinalDirections): Boolean;
    PlaceMacroblock_AirMode(MacroblockModel: CMacroblockModel | null, Coord: Int3, Dir: CMapEditorPlugin.CardinalDirections): Boolean;
    CanPlaceMacroblock_NoDestruction(MacroblockModel: CMacroblockModel | null, Coord: Int3, Dir: CMapEditorPlugin.CardinalDirections): Boolean;
    PlaceMacroblock_NoDestruction(MacroblockModel: CMacroblockModel | null, Coord: Int3, Dir: CMapEditorPlugin.CardinalDirections): Boolean;
    CanPlaceMacroblock_NoTerrain(MacroblockModel: CMacroblockModel | null, Coord: Int3, Dir: CMapEditorPlugin.CardinalDirections): Boolean;
    PlaceMacroblock_NoTerrain(MacroblockModel: CMacroblockModel | null, Coord: Int3, Dir: CMapEditorPlugin.CardinalDirections): Boolean;
    RemoveMacroblock(MacroblockModel: CMacroblockModel | null, Coord: Int3, Dir: CMapEditorPlugin.CardinalDirections): Boolean;
    RemoveMacroblock_NoTerrain(MacroblockModel: CMacroblockModel | null, Coord: Int3, Dir: CMapEditorPlugin.CardinalDirections): Boolean;
    GetBlock(Coord: Int3): CBlock | null;
    GetBlock(BlockModel: CBlockModel | null, Coord: Int3, Dir: CMapEditorPlugin.CardinalDirections): CBlock | null;
    GetGhostBlock(BlockModel: CBlockModel | null, Coord: Int3, Dir: CMapEditorPlugin.CardinalDirections): CBlock | null;
    IsBlockModelSkinnable(BlockModel: CBlockModel | null): Boolean;
    GetNbBlockModelSkins(BlockModel: CBlockModel | null): Integer;
    GetBlockModelSkin(BlockModel: CBlockModel | null, SkinIndex: Integer): Text;
    IsItemModelSkinnable(ItemModel: CGameItemModel | null): Boolean;
    GetNbItemModelSkins(ItemModel: CGameItemModel | null): Integer;
    GetItemModelSkin(ItemModel: CGameItemModel | null, SkinIndex: Integer): Text;
    GetSkinDisplayName(SkinFileName: Text): Text;
    GetBlockSkinBg(Block: CBlock | null): Text;
    GetBlockSkinFg(Block: CBlock | null): Text;
    SetBlockSkin(Block: CBlock | null, SkinFileName: Text): Void;
    SetBlockSkins(Block: CBlock | null, BgSkinFileName: Text, FgSkinFileName: Text): Void;
    GetItemSkinBg(AnchoredObject: CItemAnchor | null): Text;
    GetItemSkinFg(AnchoredObject: CItemAnchor | null): Text;
    SetItemSkin(AnchoredObject: CItemAnchor | null, SkinFileName: Text): Void;
    SetItemSkins(AnchoredObject: CItemAnchor | null, BgSkinFileName: Text, FgSkinFileName: Text): Void;
    IsSkinForeground(BlockModel: CBlockModel | null, SkinFileName: Text): Boolean;
    IsSkinForeground(ItemModel: CGameItemModel | null, SkinFileName: Text): Boolean;
    IsMacroblockModelSkinnable(BlockModel: CMacroblockModel | null): Boolean;
    SetMacroblockSkin(Macroblock: CMacroblockInstance | null, SkinFileName: Text): Boolean;
    OpenBlockSkinDialog(Block: CBlock | null): Boolean;
    RemoveBlock(Coord: Int3): Boolean;
    RemoveBlock(BlockModel: CBlockModel | null, Coord: Int3, Dir: CMapEditorPlugin.CardinalDirections): Boolean;
    RemoveGhostBlock(BlockModel: CBlockModel | null, Coord: Int3, Dir: CMapEditorPlugin.CardinalDirections): Boolean;
    RemoveTerrainBlocks(StartCoord: Int3, EndCoord: Int3): Boolean;
    GetBlockGroundHeight(BlockModel: CBlockModel | null, CoordX: Integer, CoordZ: Integer, Dir: CMapEditorPlugin.CardinalDirections): Integer;
    GetGroundHeight(CoordX: Integer, CoordZ: Integer): Integer;
    GetMouseCoordOnGround(): Int3;
    GetMouseCoordAtHeight(CoordY: Integer): Int3;
    GetStartLineBlock(): CBlock | null;
    RemoveItem(Item: CAnchorData | null): Boolean;
    CopyPaste_AddOrSubSelection(StartCoord: Int3, EndCoord: Int3): Void;
    CopyPaste_Symmetrize(): Boolean;
    CopyPaste_GetSelectedCoordsCount(): Integer;
    SaveMacroblock(MacroblockModel: CMacroblockModel | null): Void;
    CopyPaste_ApplyColorToSelection(Color: CMapEditorPlugin.MapElemColor): Boolean;
    CopyPaste_IncreaseSelectionPhaseOffset(Offset: CMapEditorPlugin.PhaseOffset): Boolean;
    CopyPaste_DecreaseSelectionPhaseOffset(Offset: CMapEditorPlugin.PhaseOffset): Boolean;
    CopyPaste_SetSelectionPhaseOffset(Offset: CMapEditorPlugin.PhaseOffset): Boolean;
    CopyPaste_ApplyLightmapQualityToSelection(LightmapQuality: CMapEditorPlugin.MapElemLightmapQuality): Boolean;
    CopyPaste_GetLightmapQualityInSelection(): Void;
    GetMacroblockModelFromFilePath(MacroblockModelFilePath: Text): CMacroblockModel | null;
    GetTerrainBlockModelFromName(TerrainBlockModelName: Text): CBlockModel | null;
    GetBlockModelFromName(BlockModelName: Text): CBlockModel | null;
    CreateFrameClipList(): CBlockClipList | null;
    CreateFixedClipList(): CBlockClipList | null;
    UnvalidateMetadata(): Void;
    UnvalidateGameplayInfo(): Void;
    UnvalidatePlayfield(): Void;
    RemoveMacroblock_NoTerrain_NoUnvalidate(MacroblockModel: CMacroblockModel | null, Coord: Int3, Dir: CMapEditorPlugin.CardinalDirections): Boolean;
    PlaceMacroblock_NoTerrain_NoUnvalidate(MacroblockModel: CMacroblockModel | null, Coord: Int3, Dir: CMapEditorPlugin.CardinalDirections): Boolean;
    ResetAutoRepeat(): Void;
    ComputeItemsForMacroblockInstance(MacroBlockInstance: CMacroblockInstance | null): Void;
    GetConnectResults(ExistingBlock: CBlock | null, NewBlock: CBlockModel | null): Void;
    GetConnectResults(ExistingBlock: CBlock | null, NewBlock: CMacroblockModel | null): Void;
    GetConnectResults(ExistingBlock: CMacroblockInstance | null, NewBlock: CBlockModel | null): Void;
    GetConnectResults(ExistingBlock: CMacroblockInstance | null, NewBlock: CMacroblockModel | null): Void;
    GetStartBlockCount(IncludeMultilaps: Boolean): Integer;
    GetFinishBlockCount(IncludeMultilaps: Boolean): Integer;
    GetMultilapBlockCount(): Integer;
    GetCheckpointBlockCount(): Integer;
    GetItemsCountResult(): Integer;
    CreateMacroblockInstance(MacroblockModel: CMacroblockModel | null, Coord: Int3, Dir: CMapEditorPlugin.CardinalDirections, Color: CMapEditorPlugin.MapElemColor, ForceMacroblockColor: Boolean): CMacroblockInstance | null;
    CreateMacroblockInstance(MacroblockModel: CMacroblockModel | null, Coord: Int3, Dir: CMapEditorPlugin.CardinalDirections, Color: CMapEditorPlugin.MapElemColor, ForceMacroblockColor: Boolean, UserData: Integer): CMacroblockInstance | null;
    CreateMacroblockInstance(MacroblockModel: CMacroblockModel | null, Coord: Int3, Dir: CMapEditorPlugin.CardinalDirections, DefaultClipList: CBlockClipList | null, Color: CMapEditorPlugin.MapElemColor, ForceMacroblockColor: Boolean): CMacroblockInstance | null;
    CreateMacroblockInstance(MacroblockModel: CMacroblockModel | null, Coord: Int3, Dir: CMapEditorPlugin.CardinalDirections, DefaultClipList: CBlockClipList | null, Color: CMapEditorPlugin.MapElemColor, ForceMacroblockColor: Boolean, UserData: Integer): CMacroblockInstance | null;
    GetMacroblockInstanceFromOrder(Order: Integer): CMacroblockInstance | null;
    GetMacroblockInstanceFromUnitCoord(Coord: Int3): CMacroblockInstance | null;
    GetLatestMacroblockInstance(): CMacroblockInstance | null;
    GetLatestMacroblockInstance(Offset: Integer): CMacroblockInstance | null;
    GetMacroblockInstanceConnectedToClip(Clip: CBlockClip | null): CMacroblockInstance | null;
    RemoveMacroblockInstance(MacroblockInstance: CMacroblockInstance | null): Boolean;
    RemoveMacroblockInstanceFromOrder(Order: Integer): Boolean;
    RemoveMacroblockInstanceFromUnitCoord(Order: Integer): Boolean;
    RemoveMacroblockInstancesByUserData(UserData: Integer): Boolean;
    ResetAllMacroblockInstances(): Void;
    GetMaxOrder(): Integer;
    SetMapType(MapType: Text): Boolean;
    GetMapType(): Text;
    SetMapStyle(MapStyle: Text): Void;
    GetMapStyle(): Text;
    GetAvailableMapName(): Text;
    IsMapFileNameAvailable(MapName: Text): Boolean;
    GetVec3FromCoord(Coord: Int3): Vec3;
    DoesAnchorHaveSpawn(Anchor: CAnchorData | null): Boolean;
}
export declare const CMapEditorPlugin: Readonly<{
    readonly CardinalDirections: Readonly<{
        North: "CMapEditorPlugin::CardinalDirections::North";
        East: "CMapEditorPlugin::CardinalDirections::East";
        South: "CMapEditorPlugin::CardinalDirections::South";
        West: "CMapEditorPlugin::CardinalDirections::West";
    }>;
    readonly CardinalDirections8: Readonly<{
        North: "CMapEditorPlugin::CardinalDirections8::North";
        East: "CMapEditorPlugin::CardinalDirections8::East";
        South: "CMapEditorPlugin::CardinalDirections8::South";
        West: "CMapEditorPlugin::CardinalDirections8::West";
        NorthEast: "CMapEditorPlugin::CardinalDirections8::NorthEast";
        SouthEast: "CMapEditorPlugin::CardinalDirections8::SouthEast";
        SouthWest: "CMapEditorPlugin::CardinalDirections8::SouthWest";
        NorthWest: "CMapEditorPlugin::CardinalDirections8::NorthWest";
    }>;
    readonly RelativeDirections: Readonly<{
        Forward: "CMapEditorPlugin::RelativeDirections::Forward";
        RightForward: "CMapEditorPlugin::RelativeDirections::RightForward";
        Right: "CMapEditorPlugin::RelativeDirections::Right";
        RightBackward: "CMapEditorPlugin::RelativeDirections::RightBackward";
        Backward: "CMapEditorPlugin::RelativeDirections::Backward";
        LeftBackward: "CMapEditorPlugin::RelativeDirections::LeftBackward";
        Left: "CMapEditorPlugin::RelativeDirections::Left";
        LeftForward: "CMapEditorPlugin::RelativeDirections::LeftForward";
    }>;
    readonly PlaceMode: Readonly<{
        Unknown: "CMapEditorPlugin::PlaceMode::Unknown";
        Terraform: "CMapEditorPlugin::PlaceMode::Terraform";
        Block: "CMapEditorPlugin::PlaceMode::Block";
        Macroblock: "CMapEditorPlugin::PlaceMode::Macroblock";
        Skin: "CMapEditorPlugin::PlaceMode::Skin";
        CopyPaste: "CMapEditorPlugin::PlaceMode::CopyPaste";
        Test: "CMapEditorPlugin::PlaceMode::Test";
        Plugin: "CMapEditorPlugin::PlaceMode::Plugin";
        CustomSelection: "CMapEditorPlugin::PlaceMode::CustomSelection";
        OffZone: "CMapEditorPlugin::PlaceMode::OffZone";
        BlockProperty: "CMapEditorPlugin::PlaceMode::BlockProperty";
        Path: "CMapEditorPlugin::PlaceMode::Path";
        GhostBlock: "CMapEditorPlugin::PlaceMode::GhostBlock";
        Item: "CMapEditorPlugin::PlaceMode::Item";
        Light: "CMapEditorPlugin::PlaceMode::Light";
        FreeBlock: "CMapEditorPlugin::PlaceMode::FreeBlock";
        FreeMacroblock: "CMapEditorPlugin::PlaceMode::FreeMacroblock";
    }>;
    readonly EditMode: Readonly<{
        Unknown: "CMapEditorPlugin::EditMode::Unknown";
        Place: "CMapEditorPlugin::EditMode::Place";
        FreeLook: "CMapEditorPlugin::EditMode::FreeLook";
        Erase: "CMapEditorPlugin::EditMode::Erase";
        Pick: "CMapEditorPlugin::EditMode::Pick";
        SelectionAdd: "CMapEditorPlugin::EditMode::SelectionAdd";
        SelectionRemove: "CMapEditorPlugin::EditMode::SelectionRemove";
    }>;
    readonly ShadowsQuality: Readonly<{
        NotComputed: "CMapEditorPlugin::ShadowsQuality::NotComputed";
        VeryFast: "CMapEditorPlugin::ShadowsQuality::VeryFast";
        Fast: "CMapEditorPlugin::ShadowsQuality::Fast";
        Default: "CMapEditorPlugin::ShadowsQuality::Default";
        High: "CMapEditorPlugin::ShadowsQuality::High";
        Ultra: "CMapEditorPlugin::ShadowsQuality::Ultra";
    }>;
    readonly ValidationStatus: Readonly<{
        NotValidable: "CMapEditorPlugin::ValidationStatus::NotValidable";
        Validable: "CMapEditorPlugin::ValidationStatus::Validable";
        Validated: "CMapEditorPlugin::ValidationStatus::Validated";
    }>;
    readonly MapElemColor: Readonly<{
        Default: "CMapEditorPlugin::MapElemColor::Default";
        White: "CMapEditorPlugin::MapElemColor::White";
        Green: "CMapEditorPlugin::MapElemColor::Green";
        Blue: "CMapEditorPlugin::MapElemColor::Blue";
        Red: "CMapEditorPlugin::MapElemColor::Red";
        Black: "CMapEditorPlugin::MapElemColor::Black";
    }>;
    readonly PhaseOffset: Readonly<{
        None: "CMapEditorPlugin::PhaseOffset::None";
        One8th: "CMapEditorPlugin::PhaseOffset::One8th";
        Two8th: "CMapEditorPlugin::PhaseOffset::Two8th";
        Three8th: "CMapEditorPlugin::PhaseOffset::Three8th";
        Four8th: "CMapEditorPlugin::PhaseOffset::Four8th";
        Five8th: "CMapEditorPlugin::PhaseOffset::Five8th";
        Six8th: "CMapEditorPlugin::PhaseOffset::Six8th";
        Seven8th: "CMapEditorPlugin::PhaseOffset::Seven8th";
    }>;
    readonly MapElemLightmapQuality: Readonly<{
        Normal: "CMapEditorPlugin::MapElemLightmapQuality::Normal";
        High: "CMapEditorPlugin::MapElemLightmapQuality::High";
        VeryHigh: "CMapEditorPlugin::MapElemLightmapQuality::VeryHigh";
        Highest: "CMapEditorPlugin::MapElemLightmapQuality::Highest";
        Low: "CMapEditorPlugin::MapElemLightmapQuality::Low";
        VeryLow: "CMapEditorPlugin::MapElemLightmapQuality::VeryLow";
        Lowest: "CMapEditorPlugin::MapElemLightmapQuality::Lowest";
    }>;
    readonly MapElemColorPalette: Readonly<{
        Classic: "CMapEditorPlugin::MapElemColorPalette::Classic";
        Stunt: "CMapEditorPlugin::MapElemColorPalette::Stunt";
        Red: "CMapEditorPlugin::MapElemColorPalette::Red";
        Orange: "CMapEditorPlugin::MapElemColorPalette::Orange";
        Yellow: "CMapEditorPlugin::MapElemColorPalette::Yellow";
        Lime: "CMapEditorPlugin::MapElemColorPalette::Lime";
        Green: "CMapEditorPlugin::MapElemColorPalette::Green";
        Cyan: "CMapEditorPlugin::MapElemColorPalette::Cyan";
        Blue: "CMapEditorPlugin::MapElemColorPalette::Blue";
        Purple: "CMapEditorPlugin::MapElemColorPalette::Purple";
        Pink: "CMapEditorPlugin::MapElemColorPalette::Pink";
        White: "CMapEditorPlugin::MapElemColorPalette::White";
        Black: "CMapEditorPlugin::MapElemColorPalette::Black";
    }>;
}>;
export declare namespace CMapEditorPlugin {
    type CardinalDirections = (typeof CMapEditorPlugin.CardinalDirections)[keyof typeof CMapEditorPlugin.CardinalDirections];
    type CardinalDirections8 = (typeof CMapEditorPlugin.CardinalDirections8)[keyof typeof CMapEditorPlugin.CardinalDirections8];
    type RelativeDirections = (typeof CMapEditorPlugin.RelativeDirections)[keyof typeof CMapEditorPlugin.RelativeDirections];
    type PlaceMode = (typeof CMapEditorPlugin.PlaceMode)[keyof typeof CMapEditorPlugin.PlaceMode];
    type EditMode = (typeof CMapEditorPlugin.EditMode)[keyof typeof CMapEditorPlugin.EditMode];
    type ShadowsQuality = (typeof CMapEditorPlugin.ShadowsQuality)[keyof typeof CMapEditorPlugin.ShadowsQuality];
    type ValidationStatus = (typeof CMapEditorPlugin.ValidationStatus)[keyof typeof CMapEditorPlugin.ValidationStatus];
    type MapElemColor = (typeof CMapEditorPlugin.MapElemColor)[keyof typeof CMapEditorPlugin.MapElemColor];
    type PhaseOffset = (typeof CMapEditorPlugin.PhaseOffset)[keyof typeof CMapEditorPlugin.PhaseOffset];
    type MapElemLightmapQuality = (typeof CMapEditorPlugin.MapElemLightmapQuality)[keyof typeof CMapEditorPlugin.MapElemLightmapQuality];
    type MapElemColorPalette = (typeof CMapEditorPlugin.MapElemColorPalette)[keyof typeof CMapEditorPlugin.MapElemColorPalette];
}
/** Documentation for class CUILayer */
export interface CUILayer extends CNod {
    IsVisible: Boolean;
    readonly AnimInProgress: Boolean;
    Type: CUILayer.EUILayerType;
    InAnimation: CUILayer.EUILayerAnimation;
    OutAnimation: CUILayer.EUILayerAnimation;
    InOutAnimation: CUILayer.EUILayerAnimation;
    AttachId: Text;
    ManialinkPage: Text;
    readonly LocalPage: CMlPage | null;
    readonly IsLocalPageScriptRunning: Boolean;
}
export declare const CUILayer: Readonly<{
    readonly EUILayerType: Readonly<{
        Normal: "CUILayer::EUILayerType::Normal";
        ScoresTable: "CUILayer::EUILayerType::ScoresTable";
        ScreenIn3d: "CUILayer::EUILayerType::ScreenIn3d";
        AltMenu: "CUILayer::EUILayerType::AltMenu";
        Markers: "CUILayer::EUILayerType::Markers";
        CutScene: "CUILayer::EUILayerType::CutScene";
        InGameMenu: "CUILayer::EUILayerType::InGameMenu";
        EditorPlugin: "CUILayer::EUILayerType::EditorPlugin";
        ManiaplanetPlugin: "CUILayer::EUILayerType::ManiaplanetPlugin";
        ManiaplanetMenu: "CUILayer::EUILayerType::ManiaplanetMenu";
        LoadingScreen: "CUILayer::EUILayerType::LoadingScreen";
    }>;
    readonly EUILayerAnimation: Readonly<{
        None: "CUILayer::EUILayerAnimation::None";
        DownFast: "CUILayer::EUILayerAnimation::DownFast";
        DownSlow: "CUILayer::EUILayerAnimation::DownSlow";
        LeftFast: "CUILayer::EUILayerAnimation::LeftFast";
        LeftSlow: "CUILayer::EUILayerAnimation::LeftSlow";
        RightFast: "CUILayer::EUILayerAnimation::RightFast";
        RightSlow: "CUILayer::EUILayerAnimation::RightSlow";
        ScaleFast: "CUILayer::EUILayerAnimation::ScaleFast";
        ScaleSlow: "CUILayer::EUILayerAnimation::ScaleSlow";
        UpFast: "CUILayer::EUILayerAnimation::UpFast";
        UpSlow: "CUILayer::EUILayerAnimation::UpSlow";
    }>;
}>;
export declare namespace CUILayer {
    type EUILayerType = (typeof CUILayer.EUILayerType)[keyof typeof CUILayer.EUILayerType];
    type EUILayerAnimation = (typeof CUILayer.EUILayerAnimation)[keyof typeof CUILayer.EUILayerAnimation];
}
/** User privileges manager. */
export interface CTrackingMgr extends CNod {
    /** Array of task results. */
    TaskResults: (CTaskResult | null)[];
    /** Release a task result no more used. */
    TaskResult_Release(TaskId: Ident): Void;
    /** Track_Context_PlayTime */
    Track_Context_PlayTime(UserId: Ident, PlayTimeContext: CTrackingMgr.EPlayTimeContext): Void;
    /** Track_Context_MenuStart */
    Track_Context_MenuStart(UserId: Ident, MenuName: Text): Void;
    /** Track_Context_MenuStop */
    Track_Context_MenuStop(UserId: Ident, MenuName: Text): Void;
    /** Track_Context_GameModeStart */
    Track_Context_GameModeStart(UserId: Ident, GameMode: Text): Void;
    /** Track_Context_GameModeStop */
    Track_Context_GameModeStop(UserId: Ident, GameMode: Text): Void;
    /** Track_Context_MapStart */
    Track_Context_MapStart(UserId: Ident, MapUid: Text, Environment: Text): Void;
    /** Track_Context_MapStop */
    Track_Context_MapStop(UserId: Ident, MapUid: Text): Void;
    /** Track_Context_PlayStart */
    Track_Context_PlayStart(UserId: Ident, Type: Text): Void;
    /** Track_Context_PlayStop */
    Track_Context_PlayStop(UserId: Ident, Type: Text, Reason: Text, NbRespawns: Integer): Void;
    /** Track_Create_NewMapCreated */
    Track_Create_NewMapCreated(UserId: Ident, Environment: Text, IsRandomlyGenerated: Boolean): Void;
    /** Track_Live_COTDPlayed */
    Track_Live_COTDPlayed(UserId: Ident, Rank: Integer, Win: Boolean): Void;
    /** Track_Live_MultiplayerPlayed */
    Track_Live_MultiplayerPlayed(UserId: Ident, Rank: Integer, Win: Boolean): Void;
    /** Track_Live_RankedPlayed */
    Track_Live_RankedPlayed(UserId: Ident, Rank: Integer, Win: Boolean): Void;
    /** Track_Live_RoyalPlayed_V2 */
    Track_Live_RoyalPlayed_V2(UserId: Ident, Rank: Integer, Win: Boolean, IsSuperRoyal: Boolean, Division: Text): Void;
    /** Track_Live_RoyalSectionFinished_V2 */
    Track_Live_RoyalSectionFinished_V2(UserId: Ident, ColorLevel: CTrackingMgr.EEventColorLevel): Void;
    /** Track_Local_HotseatPlayed_V2 */
    Track_Local_HotseatPlayed_V2(UserId: Ident): Void;
    /** Track_Local_SplitScreenPlayed_V2 */
    Track_Local_SplitScreenPlayed_V2(UserId: Ident): Void;
    /** Track_News_PlayerAction */
    Track_News_PlayerAction(UserId: Ident, NewsId: Text, Placement: Text, Action: Text): Void;
    /** Track_News_PlayerImpression */
    Track_News_PlayerImpression(UserId: Ident, NewsId: Text, Placement: Text, Duration: Integer): Void;
    /** Track_Player_MedalEarned */
    Track_Player_MedalEarned(UserId: Ident, Finished: Integer, BronzeMedal: Integer, SilverMedal: Integer, GoldMedal: Integer, AuthorMedal: Integer, IsOfficialCampaign: Boolean, IsTOTD: Boolean): Void;
    /** Track_Player_OfficialCampaign10TrackCompleted */
    Track_Player_OfficialCampaign10TrackCompleted(UserId: Ident, Year: Integer, Season: CTrackingMgr.EEventSeason, MedalLevel: CTrackingMgr.EEventMedalLevel): Void;
    /** Track_Player_OfficialCampaignAllTrackCompleted_V2 */
    Track_Player_OfficialCampaignAllTrackCompleted_V2(UserId: Ident, Year: Integer, Season: CTrackingMgr.EEventSeason, MedalLevel: CTrackingMgr.EEventMedalLevel): Void;
    /** Track_Player_TrackOfTheDayWeekAllTrackCompleted_V2 */
    Track_Player_TrackOfTheDayWeekAllTrackCompleted_V2(UserId: Ident, Year: Integer, Week: Integer, MedalLevel: CTrackingMgr.EEventMedalLevel): Void;
    /** Track_Player_TrophyEarned */
    Track_Player_TrophyEarned(UserId: Ident, T1CountPtr: Integer, T2CountPtr: Integer, T3CountPtr: Integer, T4CountPtr: Integer, T5CountPtr: Integer, T6CountPtr: Integer, T7CountPtr: Integer, T8CountPtr: Integer, T9CountPtr: Integer): Void;
    /** Track_Player_StartActivity */
    Track_Player_StartActivity(UserId: Ident, ActivityId: Text): Void;
    /** Track_Player_EndActivity */
    Track_Player_EndActivity(UserId: Ident, ActivityId: Text): Void;
}
export declare const CTrackingMgr: Readonly<{
    readonly EEventColorLevel: Readonly<{
        White: "CTrackingMgr::EEventColorLevel::White";
        Green: "CTrackingMgr::EEventColorLevel::Green";
        Blue: "CTrackingMgr::EEventColorLevel::Blue";
        Red: "CTrackingMgr::EEventColorLevel::Red";
        Black: "CTrackingMgr::EEventColorLevel::Black";
    }>;
    readonly EEventMedalLevel: Readonly<{
        Finished: "CTrackingMgr::EEventMedalLevel::Finished";
        Bronze: "CTrackingMgr::EEventMedalLevel::Bronze";
        Silver: "CTrackingMgr::EEventMedalLevel::Silver";
        Gold: "CTrackingMgr::EEventMedalLevel::Gold";
        Author: "CTrackingMgr::EEventMedalLevel::Author";
    }>;
    readonly EEventSeason: Readonly<{
        Winter: "CTrackingMgr::EEventSeason::Winter";
        Spring: "CTrackingMgr::EEventSeason::Spring";
        Summer: "CTrackingMgr::EEventSeason::Summer";
        Fall: "CTrackingMgr::EEventSeason::Fall";
    }>;
    readonly EPlayTimeContext: Readonly<{
        None: "CTrackingMgr::EPlayTimeContext::None";
        Club: "CTrackingMgr::EPlayTimeContext::Club";
        Create: "CTrackingMgr::EPlayTimeContext::Create";
        Live: "CTrackingMgr::EPlayTimeContext::Live";
        Local: "CTrackingMgr::EPlayTimeContext::Local";
        Solo: "CTrackingMgr::EPlayTimeContext::Solo";
    }>;
}>;
export declare namespace CTrackingMgr {
    type EEventColorLevel = (typeof CTrackingMgr.EEventColorLevel)[keyof typeof CTrackingMgr.EEventColorLevel];
    type EEventMedalLevel = (typeof CTrackingMgr.EEventMedalLevel)[keyof typeof CTrackingMgr.EEventMedalLevel];
    type EEventSeason = (typeof CTrackingMgr.EEventSeason)[keyof typeof CTrackingMgr.EEventSeason];
    type EPlayTimeContext = (typeof CTrackingMgr.EPlayTimeContext)[keyof typeof CTrackingMgr.EPlayTimeContext];
}
/** API for editor plugins. Supported declare modes : - Local - Persistent */
export interface CAnyEditorPlugin extends CManiaApp {
    PendingEvents: (CManiaAppEvent | null)[];
    readonly ModuleEditor: CEditorModule | null;
    readonly MeshEditor: CEditorMesh | null;
    readonly EditorEditor: CEditorEditor | null;
    readonly MediaTracker: CEditorMediaTracker | null;
    readonly SkinEditor: CEditorSkin | null;
    readonly InteractionStatus: CAnyEditorPlugin.EInteractionStatus;
}
export declare const CAnyEditorPlugin: Readonly<{
    readonly EInteractionStatus: Readonly<{
        Active: "CAnyEditorPlugin::EInteractionStatus::Active";
        Closed: "CAnyEditorPlugin::EInteractionStatus::Closed";
        Aborted: "CAnyEditorPlugin::EInteractionStatus::Aborted";
    }>;
}>;
export declare namespace CAnyEditorPlugin {
    type EInteractionStatus = (typeof CAnyEditorPlugin.EInteractionStatus)[keyof typeof CAnyEditorPlugin.EInteractionStatus];
}
/** Documentation for class CEditorPluginHandle Supported declare modes : - Local */
export interface CEditorPluginHandle extends CNod {
}
/** Documentation for class CMapInfo */
export interface CMapInfo extends CNod {
    readonly MapUid: Text;
    readonly Comments: Text;
    readonly CopperPrice: Integer;
    readonly CollectionName: Text;
    readonly AuthorLogin: Text;
    readonly AuthorNickName: Text;
    readonly AuthorZonePath: Text;
    readonly AuthorZoneFlagUrl: Text;
    readonly AuthorCountryFlagUrl: Text;
    readonly MapType: Text;
    readonly MapStyle: Text;
    readonly IsPlayable: Boolean;
    readonly CreatedWithSimpleEditor: Boolean;
    readonly CreatedWithPartyEditor: Boolean;
    readonly CreatedWithGamepadEditor: Boolean;
    readonly TMObjective_AuthorTime: Integer;
    readonly TMObjective_GoldTime: Integer;
    readonly TMObjective_SilverTime: Integer;
    readonly TMObjective_BronzeTime: Integer;
    readonly TMObjective_NbLaps: Integer;
    readonly TMObjective_IsLapRace: Boolean;
    readonly TMObjective_NbClones: Integer;
    readonly Name: Text;
    readonly Path: Text;
    readonly FileName: Text;
}
/** A currently connected CUser Supported declare modes : - Local */
export interface CClient extends CNod {
    readonly User: CUser | null;
    readonly UI: CUIConfig | null;
    /** Otherwise, it's a LAN account not currently authentified with the masterserver. */
    readonly IsConnectedToMasterServer: Boolean;
    readonly ClientVersion: Text;
    readonly ClientTitleVersion: Text;
    readonly IsSpectator: Boolean;
    /** Duration during which the player is not active while they should be (AFK). */
    readonly IdleDuration: Integer;
}
/** This object handles the interface. Supported declare modes : - Local - NetworkRead - NetworkWrite */
export interface CUIConfig extends CNod {
    UISequence: CUIConfig.EUISequence;
    readonly UISequenceIsCompleted: Boolean;
    UISequence_CustomMTClip: Text;
    UISequence_CustomMTRefTime: Integer;
    UISequence_CanSkipIntroMT: Boolean;
    UISequence_PodiumPlayersWin: Text;
    UISequence_PodiumPlayersLose: Text;
    UISequence_CutSceneStyle: CUIConfig.ECutSceneStyle;
    DisableZoomTransitions: Boolean;
    ManialinkPage: Text;
    BigMessage: Text;
    BigMessageAvatarLogin: Text;
    BigMessageAvatarVariant: CUIConfig.EAvatarVariant;
    BigMessageSound: CUIConfig.EUISound;
    BigMessageSoundVariant: Integer;
    StatusMessage: Text;
    GaugeMessage: Text;
    GaugeRatio: Real;
    GaugeClan: Integer;
    /** An XML text describing the map tooltips appearing in the HUD.<br/>It's a set of &lt;marker/&gt; elements which can have the following attributes : <ol><li>label : a text to display</li><li>pos : a vector of 3 world coordinates desribing the position of the marker</li><li>playerlogin : alternatively, instead of using pos, you can use a player login. The marker will smoothly follow the player</li><li>playerid : similar to playerlogin. Fill it with Player.MarkerId. The marker will smoothly follow the player</li><li>box : a vector of 3 dimensions describing the size of the marked object (allows a better placement of the marker on the screen)</li><li>gauge : a Real. If between 0. and 1. a gauge will be shown undeneath the text</li><li>imageurl : a string. URL of an image to use</li><li>distmax : a real. The marker will disappear if the dist to it is greater than distmax</li><li>isturning : a bool. Only for markers attached to players. If the marker appear on a minimap, it will turn around to reflect the player orientation.</li></ol> */
    MarkersXML: Text;
    /** If True, the markers of this UI config overrides the markers of more generic UI configs. If False they are merged. */
    OverrideMarkers: Boolean;
    Markers: (CUIConfigMarker | null)[];
    UILayers: (CUILayer | null)[];
    OverlayHideNotices: Boolean;
    OverlayHideMapInfo: Boolean;
    OverlayHideChat: Boolean;
    OverlayHideCountdown: Boolean;
    OverlayHideCrosshair: Boolean;
    OverlayHideGauges: Boolean;
    OverlayHideConsumables: Boolean;
    OverlayHide321Go: Boolean;
    OverlayMute321Go: Boolean;
    OverlayHideEndMapLadderRecap: Boolean;
    OverlayHideSpectatorInfos: Boolean;
    /** Values in range (0 - 40) */
    OverlayChatLineCount: Integer;
    OverlayChatOffset: Vec2;
    /** Values in range (0.100000-10.000000) */
    OverlayChatWidthCoef: Real;
    CountdownCoord: Vec2;
    NoticesFilter_HidePlayerInfo: Boolean;
    NoticesFilter_HidePlayerWarning: Boolean;
    NoticesFilter_HidePlayerInfoIfNotMe: Boolean;
    NoticesFilter_HidePlayerWarningIfNotMe: Boolean;
    NoticesFilter_HideMapInfo: Boolean;
    NoticesFilter_HideMapWarning: Boolean;
    NoticesFilter_HideMatchInfo: Boolean;
    NoticesFilter_HideMatchWarning: Boolean;
    NoticesFilter_LevelToShowAsBigMessage: CUIConfig.ENoticeLevel;
    ScoreTable: Text;
    ScoreTableVisibility: CUIConfig.EVisibility;
    SmallScoreTable: Text;
    SmallScoreTableVisibility: CUIConfig.EVisibility;
    ScoreTableOnlyManialink: Boolean;
    AltMenuNoDefaultScores: Boolean;
    AltMenuNoCustomScores: Boolean;
    OverlayScoreSummary: Boolean;
    ScoreSummary_Player1: Ident;
    ScoreSummary_Points1: Integer;
    ScoreSummary_RoundPoints1: Integer;
    ScoreSummary_MatchPoints1: Integer;
    ScoreSummary_Gauge1: Real;
    ScoreSummary_Player2: Ident;
    ScoreSummary_Points2: Integer;
    ScoreSummary_RoundPoints2: Integer;
    ScoreSummary_MatchPoints2: Integer;
    ScoreSummary_Gauge2: Real;
    ScreenIn3dHideScoreSummary: Boolean;
    ScreenIn3dHideVersus: Boolean;
    DisplayControl_UseLiveCamera: Boolean;
    DisplayControl_UseEsportsProgrammation: Boolean;
    CountdownEndTime: Integer;
    UIStatus: CUIConfig.EUIStatus;
    LabelsVisibility: CUIConfig.EHudVisibility;
    LabelsVisibility_SkipMarkersOnly: Boolean;
    AlliesLabelsVisibility: CUIConfig.ELabelsVisibility;
    AlliesLabelsShowGauges: CUIConfig.EVisibility;
    AlliesLabelsShowNames: CUIConfig.EVisibility;
    /** Values in range (0 - 250) */
    AlliesLabelsMaxCount: Integer;
    TeamLabelsVisibility: CUIConfig.ELabelsVisibility;
    TeamLabelsShowGauges: CUIConfig.EVisibility;
    TeamLabelsShowNames: CUIConfig.EVisibility;
    OpposingTeamLabelsVisibility: CUIConfig.ELabelsVisibility;
    OpposingTeamLabelsShowGauges: CUIConfig.EVisibility;
    OpposingTeamLabelsShowNames: CUIConfig.EVisibility;
    PlayerDisableFreeCam: Boolean;
    ForceSpectator: Boolean;
    SpectatorForceCameraType: Integer;
    SpectatorCamAutoLatitude: Real;
    SpectatorCamAutoLongitude: Real;
    SpectatorCamAutoRadius: Real;
    /** When not in spectator mode, allow/forbid to change the camera to observe other players. (in Trackmania there's no 'Manual' mode.) */
    SpectatorObserverMode: CUIConfig.EObserverMode;
    Spectator_SetAutoTarget_Clear(): Void;
    Spectator_SetAutoTarget_All(): Void;
    Spectator_SetAutoTarget_User(User: CUser | null): Void;
    Spectator_SetForcedTarget_Clear(): Void;
    Spectator_SetForcedTarget_AllPlayers(): Void;
    Spectator_SetForcedTarget_AllMap(): Void;
    Spectator_SetForcedTarget_Entity(Entity: CEntity | null): Void;
    Spectator_SetForcedTarget_Landmark(Landmark: CMapLandmark | null): Void;
    /** Only in local scripts, since ghosts are only known on the client. */
    Spectator_SetForcedTarget_Ghost(GhostInstanceId: Ident): Void;
    Spectator_SetForcedTarget_Clan(ClanNumber: Integer): Void;
    SendChat(Text: Text): Void;
    SendNotice(Text: Text, Level: CUIConfig.ENoticeLevel, Avatar: CUser | null, AvatarVariant: CUIConfig.EAvatarVariant, Sound: CUIConfig.EUISound, SoundVariant: Integer): Void;
    GetLayerManialinkAction(Layer: CUILayer | null): Text;
    ClearLayerManialinkAction(Layer: CUILayer | null): Void;
    AddMarker(Position: Vec3): CUIConfigMarker | null;
    AddMarker(Entity: CEntity | null): CUIConfigMarker | null;
    AddMarker(Landmark: CMapLandmark | null): CUIConfigMarker | null;
    AddMarker(GhostInstanceId: Ident): CUIConfigMarker | null;
    RemoveMarker(Marker: CUIConfigMarker | null): Void;
    ClearMarkers(): Void;
    QueueMessage(Duration: Integer, Priority: Integer, Level: CUIConfig.EMessageDisplay, Message: Text, Avatar: CUser | null, AvatarVariant: CUIConfig.EAvatarVariant, Sound: CUIConfig.EUISound, SoundVariant: Integer): Void;
    QueueMessage(Duration: Integer, Priority: Integer, Level: CUIConfig.EMessageDisplay, Message: Text, Sound: CUIConfig.EUISound, SoundVariant: Integer): Void;
    QueueMessage(Duration: Integer, Priority: Integer, Level: CUIConfig.EMessageDisplay, Message: Text): Void;
    ClearMessages(): Void;
}
export declare const CUIConfig: Readonly<{
    readonly EUISequence: Readonly<{
        None: "CUIConfig::EUISequence::None";
        Playing: "CUIConfig::EUISequence::Playing";
        Intro: "CUIConfig::EUISequence::Intro";
        Outro: "CUIConfig::EUISequence::Outro";
        Podium: "CUIConfig::EUISequence::Podium";
        CustomMTClip: "CUIConfig::EUISequence::CustomMTClip";
        EndRound: "CUIConfig::EUISequence::EndRound";
        PlayersPresentation: "CUIConfig::EUISequence::PlayersPresentation";
        UIInteraction: "CUIConfig::EUISequence::UIInteraction";
        RollingBackgroundIntro: "CUIConfig::EUISequence::RollingBackgroundIntro";
        CustomMTClip_WithUIInteraction: "CUIConfig::EUISequence::CustomMTClip_WithUIInteraction";
        Finish: "CUIConfig::EUISequence::Finish";
    }>;
    readonly EUIStatus: Readonly<{
        None: "CUIConfig::EUIStatus::None";
        Normal: "CUIConfig::EUIStatus::Normal";
        Warning: "CUIConfig::EUIStatus::Warning";
        Error: "CUIConfig::EUIStatus::Error";
        Official: "CUIConfig::EUIStatus::Official";
    }>;
    readonly EVisibility: Readonly<{
        None: "CUIConfig::EVisibility::None";
        Normal: "CUIConfig::EVisibility::Normal";
        Manual: "CUIConfig::EVisibility::Manual";
        ForcedHidden: "CUIConfig::EVisibility::ForcedHidden";
        ForcedVisible: "CUIConfig::EVisibility::ForcedVisible";
    }>;
    readonly ELabelsVisibility: Readonly<{
        None: "CUIConfig::ELabelsVisibility::None";
        Never: "CUIConfig::ELabelsVisibility::Never";
        Always: "CUIConfig::ELabelsVisibility::Always";
        WhenInFrustum: "CUIConfig::ELabelsVisibility::WhenInFrustum";
        WhenVisible: "CUIConfig::ELabelsVisibility::WhenVisible";
        WhenInMiddleOfScreen: "CUIConfig::ELabelsVisibility::WhenInMiddleOfScreen";
    }>;
    readonly EAvatarVariant: Readonly<{
        Default: "CUIConfig::EAvatarVariant::Default";
        Sad: "CUIConfig::EAvatarVariant::Sad";
        Happy: "CUIConfig::EAvatarVariant::Happy";
    }>;
    readonly EUISound: Readonly<{
        Default: "CUIConfig::EUISound::Default";
        Silence: "CUIConfig::EUISound::Silence";
        StartMatch: "CUIConfig::EUISound::StartMatch";
        EndMatch: "CUIConfig::EUISound::EndMatch";
        StartRound: "CUIConfig::EUISound::StartRound";
        EndRound: "CUIConfig::EUISound::EndRound";
        PhaseChange: "CUIConfig::EUISound::PhaseChange";
        TieBreakPoint: "CUIConfig::EUISound::TieBreakPoint";
        TiePoint: "CUIConfig::EUISound::TiePoint";
        VictoryPoint: "CUIConfig::EUISound::VictoryPoint";
        Capture: "CUIConfig::EUISound::Capture";
        TimeOut: "CUIConfig::EUISound::TimeOut";
        Notice: "CUIConfig::EUISound::Notice";
        Warning: "CUIConfig::EUISound::Warning";
        PlayerEliminated: "CUIConfig::EUISound::PlayerEliminated";
        PlayerHit: "CUIConfig::EUISound::PlayerHit";
        Checkpoint: "CUIConfig::EUISound::Checkpoint";
        Finish: "CUIConfig::EUISound::Finish";
        Record: "CUIConfig::EUISound::Record";
        ScoreProgress: "CUIConfig::EUISound::ScoreProgress";
        RankChange: "CUIConfig::EUISound::RankChange";
        Bonus: "CUIConfig::EUISound::Bonus";
        FirstHit: "CUIConfig::EUISound::FirstHit";
        Combo: "CUIConfig::EUISound::Combo";
        PlayersRemaining: "CUIConfig::EUISound::PlayersRemaining";
        Custom1: "CUIConfig::EUISound::Custom1";
        Custom2: "CUIConfig::EUISound::Custom2";
        Custom3: "CUIConfig::EUISound::Custom3";
        Custom4: "CUIConfig::EUISound::Custom4";
    }>;
    readonly ENoticeLevel: Readonly<{
        Default: "CUIConfig::ENoticeLevel::Default";
        PlayerInfo: "CUIConfig::ENoticeLevel::PlayerInfo";
        PlayerWarning: "CUIConfig::ENoticeLevel::PlayerWarning";
        MapInfo: "CUIConfig::ENoticeLevel::MapInfo";
        MapWarning: "CUIConfig::ENoticeLevel::MapWarning";
        MatchInfo: "CUIConfig::ENoticeLevel::MatchInfo";
        MatchWarning: "CUIConfig::ENoticeLevel::MatchWarning";
    }>;
    readonly EMessageDisplay: Readonly<{
        Chat: "CUIConfig::EMessageDisplay::Chat";
        Small: "CUIConfig::EMessageDisplay::Small";
        Status: "CUIConfig::EMessageDisplay::Status";
        Big: "CUIConfig::EMessageDisplay::Big";
    }>;
    readonly EObserverMode: Readonly<{
        Default: "CUIConfig::EObserverMode::Default";
        Forced: "CUIConfig::EObserverMode::Forced";
        Forbidden: "CUIConfig::EObserverMode::Forbidden";
        Manual: "CUIConfig::EObserverMode::Manual";
    }>;
    readonly EHudVisibility: Readonly<{
        Nothing: "CUIConfig::EHudVisibility::Nothing";
        Everything: "CUIConfig::EHudVisibility::Everything";
        MarkersOnly: "CUIConfig::EHudVisibility::MarkersOnly";
        Default: "CUIConfig::EHudVisibility::Default";
    }>;
    readonly ECutSceneStyle: Readonly<{
        None: "CUIConfig::ECutSceneStyle::None";
        TM: "CUIConfig::ECutSceneStyle::TM";
        SM: "CUIConfig::ECutSceneStyle::SM";
    }>;
}>;
export declare namespace CUIConfig {
    type EUISequence = (typeof CUIConfig.EUISequence)[keyof typeof CUIConfig.EUISequence];
    type EUIStatus = (typeof CUIConfig.EUIStatus)[keyof typeof CUIConfig.EUIStatus];
    type EVisibility = (typeof CUIConfig.EVisibility)[keyof typeof CUIConfig.EVisibility];
    type ELabelsVisibility = (typeof CUIConfig.ELabelsVisibility)[keyof typeof CUIConfig.ELabelsVisibility];
    type EAvatarVariant = (typeof CUIConfig.EAvatarVariant)[keyof typeof CUIConfig.EAvatarVariant];
    type EUISound = (typeof CUIConfig.EUISound)[keyof typeof CUIConfig.EUISound];
    type ENoticeLevel = (typeof CUIConfig.ENoticeLevel)[keyof typeof CUIConfig.ENoticeLevel];
    type EMessageDisplay = (typeof CUIConfig.EMessageDisplay)[keyof typeof CUIConfig.EMessageDisplay];
    type EObserverMode = (typeof CUIConfig.EObserverMode)[keyof typeof CUIConfig.EObserverMode];
    type EHudVisibility = (typeof CUIConfig.EHudVisibility)[keyof typeof CUIConfig.EHudVisibility];
    type ECutSceneStyle = (typeof CUIConfig.ECutSceneStyle)[keyof typeof CUIConfig.ECutSceneStyle];
}
/** A player is the incarnation of the user in the playground. Supported declare modes : - Local - NetworkRead - NetworkWrite */
export interface CPlayer extends CEntity {
    readonly User: CUser | null;
    readonly RequestedClan: Integer;
    readonly RequestsSpectate: Boolean;
    /** This player will only have Race interactions (CP, finishes...) with landmarks whose Order is equal to the selector. Set to -1 to interact with all landmarks. */
    LandmarkOrderSelector_Race: Integer;
}
/** Documentation for class CScore Supported declare modes : - Local - NetworkRead - NetworkWrite */
export interface CScore extends CNod {
    readonly User: CUser | null;
    readonly IsRegisteredForLadderMatch: Boolean;
    readonly LadderScore: Real;
    LadderRankSortValue: Integer;
    LadderMatchScoreValue: Real;
    LadderClan: Integer;
}
/** Documentation for class CTeam Supported declare modes : - Local - NetworkRead - NetworkWrite */
export interface CTeam extends CNod {
    Name: Text;
    ZonePath: Text;
    City: Text;
    EmblemUrl: Text;
    PresentationManialinkUrl: Text;
    ClubLinkUrl: Text;
    ColorPrimary: Vec3;
    ColorSecondary: Vec3;
    ColorUI: Vec3;
    readonly ColorText: Text;
    readonly ColorizedName: Text;
}
/** ServerPlugin Event Supported declare modes : - Local */
export interface CServerPluginEvent extends CBaseConstEvent {
    /** Event type. */
    readonly Type: CServerPluginEvent.EType;
    readonly Client: CClient | null;
    readonly ChatText: Text;
    readonly ChatOption: CServerPluginEvent.EChatOption;
    readonly ChatCommandType: Text;
    ChatCommandData: Text[];
    readonly ModeCallbackType: Text;
    ModeCallbackData: Text[];
    EndMatchScores: (CScore | null)[];
    EndMatchRanks: Integer[];
}
export declare const CServerPluginEvent: Readonly<{
    readonly EType: Readonly<{
        Unknown: "CServerPluginEvent::EType::Unknown";
        ClientConnected: "CServerPluginEvent::EType::ClientConnected";
        ClientDisconnected: "CServerPluginEvent::EType::ClientDisconnected";
        MapLoaded: "CServerPluginEvent::EType::MapLoaded";
        BeginMatch: "CServerPluginEvent::EType::BeginMatch";
        BeginRound: "CServerPluginEvent::EType::BeginRound";
        EndRound: "CServerPluginEvent::EType::EndRound";
        EndMatch: "CServerPluginEvent::EType::EndMatch";
        MapUnloadRequested: "CServerPluginEvent::EType::MapUnloadRequested";
        MapUnloaded: "CServerPluginEvent::EType::MapUnloaded";
        ChatCommand: "CServerPluginEvent::EType::ChatCommand";
        ChatMessage: "CServerPluginEvent::EType::ChatMessage";
        ModeCallback: "CServerPluginEvent::EType::ModeCallback";
    }>;
    readonly EChatOption: Readonly<{
        Default: "CServerPluginEvent::EChatOption::Default";
        ToSpectatorCurrent: "CServerPluginEvent::EChatOption::ToSpectatorCurrent";
        ToSpectatorAll: "CServerPluginEvent::EChatOption::ToSpectatorAll";
        ToTeam: "CServerPluginEvent::EChatOption::ToTeam";
    }>;
}>;
export declare namespace CServerPluginEvent {
    type EType = (typeof CServerPluginEvent.EType)[keyof typeof CServerPluginEvent.EType];
    type EChatOption = (typeof CServerPluginEvent.EChatOption)[keyof typeof CServerPluginEvent.EChatOption];
}
/** Documentation for class CUIConfigMgr */
export interface CUIConfigMgr extends CNod {
    readonly UIAll: CUIConfig | null;
    UI: (CUIConfig | null)[];
    UILayers: (CUILayer | null)[];
    UIReplayLayers: (CUILayer | null)[];
    UISequenceMaxDuration: Integer;
    HoldLoadingScreen: Boolean;
    PendingEvents: (CUIConfigEvent | null)[];
    ResetAll(): Void;
    GetUI(Player: CPlayer | null): CUIConfig | null;
    GetUI(User: CUser | null): CUIConfig | null;
    GetUI(Client: CClient | null): CUIConfig | null;
    UILayerCreate(): CUILayer | null;
    UILayerDestroy(Layer: CUILayer | null): Void;
    UILayerDestroyAll(): Void;
}
/** API for server control when playing online. */
export interface CServerAdmin extends CNod {
    /** ServerInfo */
    readonly ServerInfo: CServerInfo | null;
    /** Disable Team change UI on the clients. */
    IsDisableChangeTeams: Boolean;
    IsDisableProfileSkins: Boolean;
    readonly Authentication_GetTokenResponseReceived: Boolean;
    readonly Authentication_ErrorCode: Integer;
    readonly Authentication_Token: Text;
    readonly PlayerRestrictions: Text;
    AutoTeamBalance(): Void;
    Kick(User: CUser | null, Reason: Text): Boolean;
    Kick(Client: CClient | null, Reason: Text): Boolean;
    Ban(User: CUser | null, Reason: Text): Boolean;
    Ban(Client: CClient | null, Reason: Text): Boolean;
    ForceSpectator(User: CUser | null, SpecMode: CServerAdmin.ESpecMode): Boolean;
    ForceSpectator(Client: CClient | null, SpecMode: CServerAdmin.ESpecMode): Boolean;
    ForcePlayerRequestedTeam(User: CUser | null, Team: Integer): Boolean;
    /** Team is 1 or 2. */
    ForcePlayerRequestedTeam(Client: CClient | null, Team: Integer): Boolean;
    /** Connect a fake player (to help with debugging game modes) */
    ConnectFakePlayer(): Text;
    DisconnectFakePlayer(Login: Text): Void;
    SetLobbyInfo(IsLobby: Boolean, LobbyPlayerCount: Integer, LobbyMaxPlayerCount: Integer, LobbyPlayersLevel: Real): Void;
    SendToServerAfterMatch(ServerUrl: Text): Void;
    CustomizeQuitDialog(ManialinkPage: Text, SendToServerUrl: Text, ProposeAddToFavorites: Boolean, ForceDelay: Integer): Void;
    /** Always use NullId as UserId. */
    Authentication_GetToken(UserId: Ident, AppLogin: Text): Void;
    SetViewerCount(ViewerCount: Integer): Void;
}
export declare const CServerAdmin: Readonly<{
    readonly ESpecMode: Readonly<{
        Selectable: "CServerAdmin::ESpecMode::Selectable";
        SpectatorForced: "CServerAdmin::ESpecMode::SpectatorForced";
        PlayerForced: "CServerAdmin::ESpecMode::PlayerForced";
        SpectatorSelectable: "CServerAdmin::ESpecMode::SpectatorSelectable";
        PlayerSelectable: "CServerAdmin::ESpecMode::PlayerSelectable";
    }>;
}>;
export declare namespace CServerAdmin {
    type ESpecMode = (typeof CServerAdmin.ESpecMode)[keyof typeof CServerAdmin.ESpecMode];
}
/** Documentation for class CXmlRpc Supported declare modes : - Local - NetworkRead - NetworkWrite */
export interface CXmlRpc extends CNod {
    PendingEvents: (CXmlRpcEvent | null)[];
    SendCallback(Param1: Text, Param2: Text): Void;
    SendCallbackArray(Type: Text, Data: Text[]): Void;
    SendCallback_BeginRound(): Void;
    SendCallback_EndRound(): Void;
}
/** Asynchronous task result. Supported declare modes : - Local */
export interface CTaskResult extends CNod {
    /** Returns a boolean indicating if the task is still processing. */
    readonly IsProcessing: Boolean;
    /** Returns a boolean indicating if the task has succeeded. */
    readonly HasSucceeded: Boolean;
    /** Returns a boolean indicating if the task has failed or has been canceled. */
    readonly HasFailed: Boolean;
    /** Returns a boolean indicating if the task has been canceled. */
    readonly IsCanceled: Boolean;
    /** Returns the type of the error if the task has failed. */
    readonly ErrorType: Text;
    /** Returns the code of the error if the task has failed. */
    readonly ErrorCode: Text;
    /** Returns the description of the error if the task has failed. */
    readonly ErrorDescription: Text;
    Cancel(): Void;
}
/** A ghost model. */
export interface CGhost extends CNod {
    /** Ghost id */
    readonly Id: Ident;
    /** Result associated to this ghost (score/time/respawncount). */
    readonly Result: CTmRaceResultNod | null;
    /** Nickname of the player. */
    Nickname: Text;
    /** Trigram of the player. */
    Trigram: Text;
    CountryPath: Text;
    OverrideZoneIcon_ImageUrl: Text;
    SetProfileInfoFromUser(User: CUser | null): Void;
}
/** Task result containing a ghost. Supported declare modes : - Local */
export interface CTaskResult_Ghost extends CTaskResult {
    /** Ghost contained by this result. */
    readonly Ghost: CGhost | null;
}
/** Documentation for class CNotification_Prestige */
export interface CNotification_Prestige extends CNotification {
}
/** Documentation for class CNotification_Squad */
export interface CNotification_Squad extends CNotification {
}
/** Documentation for class CSkinInfo */
export interface CSkinInfo extends CNod {
    readonly Name: Text;
    readonly Type: Text;
    readonly Url: Text;
}
/** Documentation for class CAccountTrophyGain */
export interface CAccountTrophyGain extends CNod {
    readonly AccountId: Text;
    readonly WebServicesUserId: Text;
    readonly T1Count: Integer;
    readonly T2Count: Integer;
    readonly T3Count: Integer;
    readonly T4Count: Integer;
    readonly T5Count: Integer;
    readonly T6Count: Integer;
    readonly T7Count: Integer;
    readonly T8Count: Integer;
    readonly T9Count: Integer;
    readonly TimeStamp: Integer;
}
/** Documentation for class CTrophyAchievement */
export interface CTrophyAchievement extends CNod {
    readonly TrophyAchievementId: Text;
    readonly TrophyAchievementType: Text;
}
/** Rules API for gamemodes. Supported declare modes : - Local - Persistent */
export interface CMode extends CNod {
    TaskResults: (CTaskResult | null)[];
    ModeStatusMessage: Text;
    readonly LoadedTitle: CTitle | null;
    readonly ServerLogin: Text;
    readonly ServerName: Text;
    readonly ServerModeName: Text;
    readonly MapName: Text;
    readonly Map: CMap | null;
    readonly MapPlayerModelName: Text;
    readonly HasPodium: Boolean;
    Users: (CUser | null)[];
    Teams: (CTeam | null)[];
    NeutralEmblemUrl: Text;
    readonly ForcedClubLinkUrl1: Text;
    readonly ForcedClubLinkUrl2: Text;
    ClientManiaAppUrl: Text;
    readonly Now: Integer;
    readonly Period: Integer;
    MatchEndRequested: Boolean;
    readonly ServerShutdownRequested: Boolean;
    readonly MapLoaded: Boolean;
    MapList: (CMapInfo | null)[];
    NextMapIndex: Integer;
    readonly UIManager: CUIConfigMgr | null;
    readonly Hud: CModulePlaygroundHud | null;
    readonly Ladder_RequestInProgress: Boolean;
    readonly ServerAdmin: CServerAdmin | null;
    readonly Solo_NewRecordSequenceInProgress: Boolean;
    readonly XmlRpc: CXmlRpc | null;
    readonly Xml: CParsingManager | null;
    readonly Http: CHttpManager | null;
    /** Only available for local solo modes. */
    readonly Input: CInputManager | null;
    /** Only available for local solo modes. */
    readonly DataFileMgr: CDataFileMgr | null;
    readonly ScoreMgr: CScoreMgr | null;
    readonly System: CSystemPlatform | null;
    readonly UserMgr: CUserV2Manager | null;
    UseMinimap: Boolean;
    Replay_AutoStart: Boolean;
    readonly TurretsManager: CModeTurretManager | null;
    readonly VehiclesManager: CModeVehicleManager | null;
    readonly ActionsManager: CActionManager | null;
    EnableGhostRecording: Boolean;
    Ghosts: (CGhost | null)[];
    readonly UiUpdatePeriod: Integer;
    TaskResult_Release(TaskId: Ident): Void;
    TweakTeamColorsToAvoidHueOverlap(): Void;
    RequestLoadMap(): Void;
    RequestUnloadMap(): Void;
    Hud_Load(ModuleName: Text): Void;
    PassOn(EventToPassOn: CUIConfigEvent | null): Void;
    Discard(EventToDiscard: CUIConfigEvent | null): Void;
    Ladder_OpenMatch_Request(): Void;
    Ladder_AddPlayer(PlayerScore: CScore | null): Void;
    Ladder_OpenMatch_BeginRequest(): Void;
    Ladder_OpenMatch_AddPlayer(PlayerScore: CScore | null): Void;
    Ladder_OpenMatch_EndRequest(): Void;
    Ladder_CloseMatchRequest(): Void;
    Ladder_CancelMatchRequest(): Void;
    Ladder_SetResultsVersion(Version: Integer): Void;
    Ladder_SetMatchMakingMatchId(MatchId: Integer): Void;
    Ladder_EnableChallengeMode(Enable: Boolean): Void;
    Trophy_CompetitionMatch_AddResult(WebServicesUserId: Text, MatchRank: Integer, TrophyRanking: Integer): Void;
    Trophy_CompetitionMatch_ClearResultList(): Void;
    Trophy_CompetitionMatch_SendResultList(CompetitionName: Text, CompetitionStage: Text, CompetitionStageStep: Text, CompetitionMatchInfo: Text): CTaskResult_AccountTrophyGainList | null;
    Trophy_LiveTimeAttackAchievement_AddResult(WebServicesUserId: Text, MatchRank: Integer, TrophyRanking: Integer): Void;
    Trophy_LiveTimeAttackAchievement_ClearResultList(): Void;
    Trophy_LiveTimeAttackAchievement_SendResultList(Duration: Integer): CTaskResult_AccountTrophyGainList | null;
    AutoTeamBalance(): Void;
    Solo_SetNewRecord(PlayerScore: CScore | null, PlayerScore_: CMode.EMedal): Void;
    Synchro_AddBarrier(): Integer;
    Synchro_BarrierReached(Barrier: Integer): Boolean;
    Users_AreAllies(User1: CUser | null, User2: CUser | null): Boolean;
    Users_RequestSwitchToSpectator(User: CUser | null): Void;
    Users_CreateFake(NickName: Text, RequestedTeam: Integer): CUser | null;
    Users_DestroyFake(User: CUser | null): Void;
    Users_SetNbFakeUsers(NbTeam1: Integer, NbTeam2: Integer): Void;
    Users_DestroyAllFakes(): Void;
    ItemList_Begin(): Void;
    ItemList_Begin(): Boolean;
    ItemList_Add(ModelName: Text): Ident;
    /** SkinNameOrUrl: can be 'Skins/Model/....', 'http://....', 'Default' (or '') for item default skin, 'Profile' for the user choice for the model. ModelName: 'DefaultPlayerModel' for the default map model, or the item filename. */
    ItemList_AddWithSkin(ModelName: Text, SkinNameOrUrl: Text): Ident;
    ItemList_AddWithSkin(ModelName: Text, SkinNameOrUrl: Text, SkinOptions: Text): Ident;
    ItemList_End(): Void;
    DemoToken_StartUsingToken(): Void;
    DemoToken_StopUsingToken(): Void;
    DemoToken_GetAndUseToken(User: CUser | null): Void;
    ActionList_Begin(): Void;
    ActionList_Begin(): Boolean;
    ActionList_Add(ActionName: Text): Ident;
    ActionList_End(): Void;
    Replay_Start(): Void;
    Replay_Stop(): Void;
    Activity_Match_Create_Begin(ActivityId: Text): Void;
    Activity_Match_Create_AddPlayer(WebServicesUserId: Text, TeamName: Text): Void;
    Activity_Match_Create_AddTeam(TeamName: Text): Void;
    Activity_Match_Create_End(): Void;
    Activity_Match_ReportResult_Begin(): Void;
    Activity_Match_ReportResult_SetPlayerResult(WebServicesUserId: Text, Rank: Integer, Score: Integer): Void;
    Activity_Match_ReportResult_SetTeamResult(TeamName: Text, Rank: Integer, Score: Integer): Void;
    Activity_Match_ReportResult_End(): Void;
    Ghost_Release(GhostId: Ident): Void;
    GhostDriver_Playlist_Clear(Player: CPlayer | null): Void;
    GhostDriver_Playlist_Add(Player: CPlayer | null, Ghost: CGhost | null): Void;
    GhostDriver_UploadLimits_Begin(): Void;
    GhostDriver_UploadLimits_AddLevel(TeamLevel: Integer): Void;
    GhostDriver_UploadLimits_End(): CWebServicesTaskResult_GhostDriver_UploadLimits | null;
    GhostDriver_Upload_Begin(TeamLevel: Integer): Void;
    GhostDriver_Upload_TeamMember_Begin(): Void;
    GhostDriver_Upload_AddGhost(Ghost: CGhost | null): Void;
    GhostDriver_Upload_TeamMember_End(): Void;
    GhostDriver_Upload_End(): CTaskResult | null;
    GhostDriver_Download_Begin(): Void;
    GhostDriver_Download_AddRange(TeamLevelMin: Integer, TeamLevelMax: Integer, Count: Integer): Void;
    GhostDriver_Download_End(): CWebServicesTaskResult_GhostDriver_Download | null;
    MapRecord_GetListByMapAndPlayerList(UserId: Ident, WebServicesUserIdList: Text[], MapUid: Text, ScopeType: Text, ScopeId: Text, GameMode: Text, GameModeCustomData: Text): CTaskResult_MapRecordList | null;
    GameScene_ResetAll(): Void;
    Dbg_DumpDeclareForVariables(Nod: CNod | null, StatsOnly: Boolean): Text;
}
export declare const CMode: Readonly<{
    readonly EMedal: Readonly<{
        None: "CMode::EMedal::None";
        Finished: "CMode::EMedal::Finished";
        Bronze: "CMode::EMedal::Bronze";
        Silver: "CMode::EMedal::Silver";
        Gold: "CMode::EMedal::Gold";
        Author: "CMode::EMedal::Author";
    }>;
}>;
export declare namespace CMode {
    type EMedal = (typeof CMode.EMedal)[keyof typeof CMode.EMedal];
}
/** A Shootmania player. Supported declare modes : - Local - NetworkRead - NetworkWrite */
export interface CSmPlayer extends CPlayer {
    readonly Score: CSmScore | null;
    readonly SpawnStatus: CSmPlayer.ESpawnStatus;
    readonly StartTime: Integer;
    EndTime: Integer;
    RaceWaypointTimes: Integer[];
    /** Equals CurrentLapWaypointTimes when not empty. If it is empty (i.e. before the 1st CP of a new lap), equals PreviousLapWaypointTimes. */
    LapWaypointTimes: Integer[];
    CurrentLapWaypointTimes: Integer[];
    PreviousLapWaypointTimes: Integer[];
    readonly CurrentLapNumber: Integer;
    readonly CurrentRaceTime: Integer;
    readonly CurrentLapTime: Integer;
    readonly CurrentRaceRespawns: Integer;
    readonly CurrentLapRespawns: Integer;
    /** Values in range (0.000000-10.000000) */
    AmmoGain: Real;
    ActionWheelSelectedSlotIndex: Integer;
    Armor: Integer;
    ArmorMax: Integer;
    ArmorGain: Integer;
    ArmorReplenishGain: Integer;
    /** Values in range (0.100000-10.000000) */
    ArmorPower: Real;
    Stamina: Integer;
    readonly StaminaMaxValue: Integer;
    /** Values in range (0.100000-3.000000) */
    StaminaMax: Real;
    /** Values in range (0.000000-1.000000) */
    StaminaGain: Real;
    /** Values in range (0.100000-1.000000) */
    StaminaPower: Real;
    /** Values in range (0.100000-1.000000) */
    SpeedPower: Real;
    /** Values in range (0.100000-1.000000) */
    JumpPower: Real;
    AllowWallJump: Boolean;
    AllowProgressiveJump: Boolean;
    UseAlternateWeaponVisual: Boolean;
    ForceModelId: Ident;
    IsHighlighted: Boolean;
    /** Values in range (0.000000-1.000000) */
    EnergyLevel: Real;
    ForceColor: Vec3;
    /** 5 ascii chars (ex: '01TMN') or empty for default value */
    Dossard: Text;
    Dossard_Number: Text;
    Dossard_Trigram: Text;
    Dossard_Color: Vec3;
    /** Values in range (0.000000-1.000000) */
    readonly GetLinearHue: Real;
    ForceLinearHue: Real;
    ForceLightTrail: Boolean;
    HasShield: Boolean;
    readonly IsInVehicle: Boolean;
    IsStuck: Boolean;
    /** Values in range (0.000000-500.000000) */
    ThrowSpeed: Real;
    readonly CurrentClan: Integer;
    readonly IdleDuration: Integer;
    readonly IsEntityStateAvailable: Boolean;
    readonly Position: Vec3;
    readonly AimYaw: Real;
    readonly AimPitch: Real;
    readonly AimRoll: Real;
    readonly AimDirection: Vec3;
    readonly UpDirection: Vec3;
    readonly LeftDirection: Vec3;
    readonly Velocity: Vec3;
    readonly Speed: Real;
    readonly IsUnderground: Boolean;
    readonly IsTouchingGround: Boolean;
    readonly IsInAir: Boolean;
    readonly IsInWater: Boolean;
    readonly IsInOffZone: Boolean;
    readonly IsOnTech: Boolean;
    readonly IsOnTechGround: Boolean;
    readonly IsOnTechLaser: Boolean;
    readonly IsOnTechArrow: Boolean;
    readonly IsOnTechNucleus: Boolean;
    readonly IsOnTechArmor: Boolean;
    readonly IsOnTechSafeZone: Boolean;
    readonly IsOnTechTeleport: Boolean;
    readonly IsOnTechNoWeapon: Boolean;
    readonly IsPowerJumpActivable: Boolean;
    readonly IsTeleportActivable: Boolean;
    readonly IsAttractorActivable: Boolean;
    readonly NbActiveAttractors: Integer;
    readonly IsCapturing: Boolean;
    readonly CapturedLandmark: CSmMapLandmark | null;
    Objects: (CSmObject | null)[];
    readonly Vehicle: CModeVehicle | null;
    readonly IsFakePlayer: Boolean;
    readonly IsBot: Boolean;
    /** Use a low-fi extrapolation to display the player. This extrapolation mode does not take interactions into account. Only use it when this player does not interact with other player (e.g. TM TimeAttack, SM Obstacle). */
    UseCrudeExtrapolation: Boolean;
    TrustClientSimu: Boolean;
    readonly Driver: CSmPlayerDriver | null;
    /** Values in range (0.000000-1.000000) */
    AccelCoef: Real;
    /** Values in range (0.000000-1.000000) */
    ControlCoef: Real;
    /** Values in range (0.000000-1.000000) */
    GravityCoef: Real;
    /** Values in range (0.000000-1.000000) */
    AdherenceCoef: Real;
    readonly Upwardness: Real;
    readonly Distance: Real;
    readonly DisplaySpeed: Integer;
    readonly InputSteer: Real;
    readonly InputGasPedal: Real;
    readonly InputIsBraking: Boolean;
    readonly EngineRpm: Real;
    readonly EngineCurGear: Integer;
    readonly EngineTurboRatio: Real;
    readonly WheelsContactCount: Integer;
    readonly WheelsSkiddingCount: Integer;
    readonly FlyingDuration: Integer;
    readonly SkiddingDuration: Integer;
    readonly SkiddingDistance: Real;
    readonly FlyingDistance: Real;
    /** Latest stunt event, and stunt currently building-up. Available when `UseStunts` is enabled. */
    readonly Stunt: CStuntStatus | null;
    readonly HandicapNoGasDuration: Integer;
    readonly HandicapForceGasDuration: Integer;
    readonly HandicapNoBrakesDuration: Integer;
    readonly HandicapNoSteeringDuration: Integer;
    readonly HandicapNoGripDuration: Integer;
}
export declare const CSmPlayer: Readonly<{
    readonly ESpawnStatus: Readonly<{
        NotSpawned: "CSmPlayer::ESpawnStatus::NotSpawned";
        Spawning: "CSmPlayer::ESpawnStatus::Spawning";
        Spawned: "CSmPlayer::ESpawnStatus::Spawned";
    }>;
}>;
export declare namespace CSmPlayer {
    type ESpawnStatus = (typeof CSmPlayer.ESpawnStatus)[keyof typeof CSmPlayer.ESpawnStatus];
}
/** Event recieved by ShootMania gamemodes. Supported declare modes : - Local */
export interface CSmModeEvent extends CBaseEvent {
    /** Event type */
    readonly Type: CSmModeEvent.EType;
    readonly Player: CSmPlayer | null;
    Damage: Integer;
    readonly VictimShield: Integer;
    readonly VictimEntity: CEntity | null;
    ShooterPoints: Integer;
    readonly ShooterEntity: CEntity | null;
    readonly ShooterClan: Integer;
    readonly Height: Real;
    readonly UserData: Integer;
    readonly ItemPosition: Vec3;
    readonly MissDist: Real;
    readonly WeaponNum: Integer;
    readonly ShooterUsedAction: Boolean;
    readonly ShooterWeaponNum: Integer;
    readonly ShooterActionSlot: CSmModeEvent.EActionSlot;
    readonly ShooterActionId: Text;
    readonly VictimUsedAction: Boolean;
    readonly VictimWeaponNum: Integer;
    readonly VictimActionSlot: CSmModeEvent.EActionSlot;
    readonly VictimActionId: Text;
    readonly ActionSlot: CSmModeEvent.EActionSlot;
    readonly ActionInput: CSmModeEvent.EActionInput;
    readonly ActionId: Text;
    readonly Param1: Text;
    Param2: Text[];
    readonly Object: CSmObject | null;
    readonly WaypointTime: Integer;
    readonly WaypointLapTime: Integer;
    readonly IsFinish: Boolean;
    readonly IsNewLap: Boolean;
    readonly Landmark: CSmMapLandmark | null;
    readonly User: CUser | null;
    readonly PlayerWasSpawned: Boolean;
    readonly PlayerWasDisconnected: Boolean;
    readonly PlayerWasInLadderMatch: Boolean;
    readonly PlayerLastPosition: Vec3;
    readonly PlayerLastAimDirection: Vec3;
    readonly GiveUp: Boolean;
    readonly RegressRespawn: Boolean;
    readonly CommandName: Text;
    readonly CommandValueBoolean: Boolean;
    readonly CommandValueInteger: Integer;
    readonly CommandValueReal: Real;
    readonly CommandValueText: Text;
    readonly CommandValueVec2: Vec2;
    readonly CommandValueVec3: Vec3;
    readonly CommandValueInt2: Int2;
    readonly CommandValueInt3: Int3;
    readonly ActionChange: Integer;
    readonly StuntFigure: CStuntFigure | null;
}
export declare const CSmModeEvent: Readonly<{
    readonly EType: Readonly<{
        Unknown: "CSmModeEvent::EType::Unknown";
        OnShoot: "CSmModeEvent::EType::OnShoot";
        OnHit: "CSmModeEvent::EType::OnHit";
        OnNearMiss: "CSmModeEvent::EType::OnNearMiss";
        OnArmorEmpty: "CSmModeEvent::EType::OnArmorEmpty";
        OnCapture: "CSmModeEvent::EType::OnCapture";
        OnShotDeny: "CSmModeEvent::EType::OnShotDeny";
        OnFallDamage: "CSmModeEvent::EType::OnFallDamage";
        OnCommand: "CSmModeEvent::EType::OnCommand";
        OnPlayerAdded: "CSmModeEvent::EType::OnPlayerAdded";
        OnPlayerRemoved: "CSmModeEvent::EType::OnPlayerRemoved";
        OnPlayerRequestRespawn: "CSmModeEvent::EType::OnPlayerRequestRespawn";
        OnActionCustomEvent: "CSmModeEvent::EType::OnActionCustomEvent";
        OnActionEvent: "CSmModeEvent::EType::OnActionEvent";
        OnPlayerTouchesObject: "CSmModeEvent::EType::OnPlayerTouchesObject";
        OnPlayerThrowsObject: "CSmModeEvent::EType::OnPlayerThrowsObject";
        OnPlayerTriggersSector: "CSmModeEvent::EType::OnPlayerTriggersSector";
        OnPlayerTriggersWaypoint: "CSmModeEvent::EType::OnPlayerTriggersWaypoint";
        OnPlayerRequestActionChange: "CSmModeEvent::EType::OnPlayerRequestActionChange";
        OnVehicleArmorEmpty: "CSmModeEvent::EType::OnVehicleArmorEmpty";
        OnVehicleCollision: "CSmModeEvent::EType::OnVehicleCollision";
        OnVehicleVsVehicleCollision: "CSmModeEvent::EType::OnVehicleVsVehicleCollision";
        OnPlayerRequestItemInteraction: "CSmModeEvent::EType::OnPlayerRequestItemInteraction";
        OnStuntFigure: "CSmModeEvent::EType::OnStuntFigure";
    }>;
    readonly EActionSlot: Readonly<{
        Slot_A: "CSmModeEvent::EActionSlot::Slot_A";
        Slot_B: "CSmModeEvent::EActionSlot::Slot_B";
        Slot_C: "CSmModeEvent::EActionSlot::Slot_C";
        Slot_D: "CSmModeEvent::EActionSlot::Slot_D";
        Slot_E: "CSmModeEvent::EActionSlot::Slot_E";
        Slot_F: "CSmModeEvent::EActionSlot::Slot_F";
        Slot_G: "CSmModeEvent::EActionSlot::Slot_G";
        Slot_H: "CSmModeEvent::EActionSlot::Slot_H";
    }>;
    readonly EActionInput: Readonly<{
        Weapon: "CSmModeEvent::EActionInput::Weapon";
        Secondary: "CSmModeEvent::EActionInput::Secondary";
        Movement: "CSmModeEvent::EActionInput::Movement";
        QuickAccess1: "CSmModeEvent::EActionInput::QuickAccess1";
        QuickAccess2: "CSmModeEvent::EActionInput::QuickAccess2";
        QuickAccess3: "CSmModeEvent::EActionInput::QuickAccess3";
        QuickAccess4: "CSmModeEvent::EActionInput::QuickAccess4";
        QuickAccess5: "CSmModeEvent::EActionInput::QuickAccess5";
        QuickAccess6: "CSmModeEvent::EActionInput::QuickAccess6";
        QuickAccess7: "CSmModeEvent::EActionInput::QuickAccess7";
        QuickAccess8: "CSmModeEvent::EActionInput::QuickAccess8";
        QuickAccess9: "CSmModeEvent::EActionInput::QuickAccess9";
        QuickAccess0: "CSmModeEvent::EActionInput::QuickAccess0";
        Consumable1: "CSmModeEvent::EActionInput::Consumable1";
        Consumable2: "CSmModeEvent::EActionInput::Consumable2";
        None: "CSmModeEvent::EActionInput::None";
    }>;
}>;
export declare namespace CSmModeEvent {
    type EType = (typeof CSmModeEvent.EType)[keyof typeof CSmModeEvent.EType];
    type EActionSlot = (typeof CSmModeEvent.EActionSlot)[keyof typeof CSmModeEvent.EActionSlot];
    type EActionInput = (typeof CSmModeEvent.EActionInput)[keyof typeof CSmModeEvent.EActionInput];
}
/** Documentation for class CSmMapBase */
export interface CSmMapBase extends CNod {
    Clan: Integer;
    IsActive: Boolean;
    readonly NumberOfCollectors: Integer;
}
/** Documentation for class CSmMapLandmark Supported declare modes : - Local - Metadata */
export interface CSmMapLandmark extends CMapLandmark {
    readonly Base: CSmMapBase | null;
    readonly Gate: CSmMapGate | null;
    readonly Gauge: CSmMapGauge | null;
}
/** Scoring info for ShootMania players. Supported declare modes : - Local - NetworkRead - NetworkWrite */
export interface CSmScore extends CScore {
    TeamNum: Integer;
    Points: Integer;
    RoundPoints: Integer;
    NbRespawnsRequested: Integer;
    readonly NbEliminationsInflicted: Integer;
    readonly NbEliminationsTaken: Integer;
    readonly DamageInflicted: Integer;
    readonly DamageTaken: Integer;
    BestRaceTimes: Integer[];
    PrevRaceTimes: Integer[];
    BestLapTimes: Integer[];
    PrevLapTimes: Integer[];
    BestRaceNbRespawns: Integer;
    PrevRaceNbRespawns: Integer;
}
/** Documentation for class CMapSpawn */
export interface CMapSpawn extends CNod {
}
/** Documentation for class CModeTurret Supported declare modes : - Local */
export interface CModeTurret extends CEntity {
    Armor: Integer;
    ArmorMax: Integer;
    readonly Owner: CPlayer | null;
}
/** Documentation for class CModeVehicle Supported declare modes : - Local */
export interface CModeVehicle extends CEntity {
    Armor: Integer;
    ArmorMax: Integer;
    readonly Position: Vec3;
    readonly Pitch: Real;
    readonly Roll: Real;
    readonly Left: Vec3;
    readonly Up: Vec3;
    readonly Dir: Vec3;
    readonly Velocity: Vec3;
    Clan: Integer;
    AccelCoef: Real;
    readonly AccelInput: Real;
    SetEngineActivated(IsActivated: Boolean): Void;
}
/** Documentation for class CMapBotPath */
export interface CMapBotPath extends CNod {
    readonly Clan: Integer;
    Path: Vec3[];
    readonly IsFlying: Boolean;
    readonly BotModelId: Ident;
}
/** Documentation for class CMapBotSpawn */
export interface CMapBotSpawn extends CNod {
    readonly IsFlying: Boolean;
    readonly BotModelId: Ident;
}
/** Documentation for class CEntity */
export interface CEntity extends CNod {
    /** Use this instead of Id when filling CUIConfig.MarkersXML */
    readonly MarkerId: Ident;
}
/** Documentation for class CMapWaypoint */
export interface CMapWaypoint extends CNod {
    readonly IsFinish: Boolean;
    readonly IsMultiLap: Boolean;
}
/** An instance of an object. Supported declare modes : - Local */
export interface CSmObject extends CEntity {
    readonly Status: CSmObject.EStatus;
    readonly ModelId: Ident;
    /** Player holding the object, or Null if the object isn't held by a player. */
    readonly Player: CSmPlayer | null;
    readonly AnchorLandmark: CSmMapLandmark | null;
    readonly Position: Vec3;
    readonly Vel: Vec3;
    MachineState: Integer;
    Throwable: Boolean;
    readonly ThrowLatestPlayerId: Ident;
    SetAnchor(ObjectAnchor: CMapObjectAnchor | null): Void;
    SetPlayer(Player: CSmPlayer | null): Void;
    SetPosition(Position: Vec3): Void;
    SetPositionAndVel(Position: Vec3, Vel: Vec3): Void;
    SetUnspawned(): Void;
}
export declare const CSmObject: Readonly<{
    readonly EStatus: Readonly<{
        OnPlayer: "CSmObject::EStatus::OnPlayer";
        OnAnchor: "CSmObject::EStatus::OnAnchor";
        InWorld: "CSmObject::EStatus::InWorld";
        Unspawned: "CSmObject::EStatus::Unspawned";
    }>;
}>;
export declare namespace CSmObject {
    type EStatus = (typeof CSmObject.EStatus)[keyof typeof CSmObject.EStatus];
}
/** The ghosts manager. */
export interface CGhostManager extends CNod {
    Ghost_Add(Ghost: CGhost | null): Ident;
    Ghost_Add(Ghost: CGhost | null, IsGhostLayer: Boolean): Ident;
    Ghost_Add(Ghost: CGhost | null, IsGhostLayer: Boolean, TimeOffset: Integer): Ident;
    Ghost_AddWaypointSynced(Ghost: CGhost | null, IsGhostLayer: Boolean): Ident;
    Ghost_AddPhysicalized(Ghost: CGhost | null, TimeOffset: Integer, PlaySpeed: Real, GhostPhyMode: CGhostManager.EGhostPhyMode, ForceRandomSkin: Boolean): Ident;
    Ghost_IsReplayOver(GhostInstanceId: Ident): Boolean;
    Ghost_IsVisible(GhostInstanceId: Ident): Boolean;
    Ghost_Remove(GhostInstanceId: Ident): Void;
    Ghost_RemoveAll(): Void;
    /** 5 ascii chars (ex: '01TMN') or empty for default value */
    Ghost_SetDossard(GhostInstanceId: Ident, Dossard: Text): Void;
    /** 5 ascii chars (ex: '01TMN') or empty for default value + color */
    Ghost_SetDossard(GhostInstanceId: Ident, Dossard: Text, Color: Vec3): Void;
    Ghost_SetMarker(GhostInstanceId: Ident, Visibility: CUIConfigMarker.EHudVisibility, Name: Text, IconUrlPtr: Text): Void;
}
export declare const CGhostManager: Readonly<{
    readonly EGhostPhyMode: Readonly<{
        SoftCollisions: "CGhostManager::EGhostPhyMode::SoftCollisions";
    }>;
}>;
export declare namespace CGhostManager {
    type EGhostPhyMode = (typeof CGhostManager.EGhostPhyMode)[keyof typeof CGhostManager.EGhostPhyMode];
}
/** API for the plugins of the map editor. Supported declare modes : - Local - Persistent */
export interface CMapType extends Omit<CMapEditorPlugin, "ValidationStatus"> {
    CustomEditAnchorData: Boolean;
    ValidationStatus: CMapType.ValidationStatus;
    ValidabilityRequirementsMessage: Text;
    ValidationEndRequested: Boolean;
    ValidationEndNoConfirm: Boolean;
    readonly IsSwitchedToPlayground: Boolean;
    readonly UIManager: CUIConfigMgr | null;
    Users: (CUser | null)[];
    ClearMapMetadata(): Void;
    RequestEnterPlayground(): Void;
    RequestLeavePlayground(): Void;
}
export declare const CMapType: Readonly<{
    readonly ValidationStatus: Readonly<{
        NotValidable: "CMapType::ValidationStatus::NotValidable";
        Validable: "CMapType::ValidationStatus::Validable";
        Validated: "CMapType::ValidationStatus::Validated";
    }>;
}>;
export declare namespace CMapType {
    type ValidationStatus = (typeof CMapType.ValidationStatus)[keyof typeof CMapType.ValidationStatus];
}
/** Documentation for class CAction */
export interface CAction extends CNod {
}
/** An action event Supported declare modes : - Local */
export interface CSmActionEvent extends CBaseConstEvent {
    /** Type. */
    readonly Type: CSmActionEvent.EType;
    readonly ProjectileModelId: Ident;
    readonly ProjectileStartDate: Integer;
    readonly Damage: Integer;
    readonly ContextId: Integer;
    readonly Position: Vec3;
    readonly Direction: Vec3;
    readonly Normal: Vec3;
    readonly Victim: CEntity | null;
    readonly Shield: Integer;
    readonly Input: CSmActionEvent.EInputChange;
    readonly ScrollDelta: Integer;
}
export declare const CSmActionEvent: Readonly<{
    readonly EType: Readonly<{
        OnHitPlayer: "CSmActionEvent::EType::OnHitPlayer";
        OnProjectileEnd: "CSmActionEvent::EType::OnProjectileEnd";
        OnProjectileDestroyed: "CSmActionEvent::EType::OnProjectileDestroyed";
        OnHitObject: "CSmActionEvent::EType::OnHitObject";
        OnHitShield: "CSmActionEvent::EType::OnHitShield";
        OnHitVehicle: "CSmActionEvent::EType::OnHitVehicle";
        OnShieldEnd: "CSmActionEvent::EType::OnShieldEnd";
        OnHitTurret: "CSmActionEvent::EType::OnHitTurret";
        OnInputChange: "CSmActionEvent::EType::OnInputChange";
        OnFocusedScroll: "CSmActionEvent::EType::OnFocusedScroll";
    }>;
    readonly EInputChange: Readonly<{
        IsActive: "CSmActionEvent::EInputChange::IsActive";
        Focused_Main: "CSmActionEvent::EInputChange::Focused_Main";
        Focused_Secondary: "CSmActionEvent::EInputChange::Focused_Secondary";
        Focused_QuickAccess1: "CSmActionEvent::EInputChange::Focused_QuickAccess1";
        Focused_QuickAccess2: "CSmActionEvent::EInputChange::Focused_QuickAccess2";
        Focused_QuickAccess3: "CSmActionEvent::EInputChange::Focused_QuickAccess3";
        Focused_QuickAccess4: "CSmActionEvent::EInputChange::Focused_QuickAccess4";
        Focused_QuickAccess5: "CSmActionEvent::EInputChange::Focused_QuickAccess5";
        Focused_QuickAccess6: "CSmActionEvent::EInputChange::Focused_QuickAccess6";
        Focused_QuickAccess7: "CSmActionEvent::EInputChange::Focused_QuickAccess7";
        Focused_QuickAccess8: "CSmActionEvent::EInputChange::Focused_QuickAccess8";
        Focused_QuickAccess9: "CSmActionEvent::EInputChange::Focused_QuickAccess9";
        Focused_QuickAccess0: "CSmActionEvent::EInputChange::Focused_QuickAccess0";
        Focused_Consumable1: "CSmActionEvent::EInputChange::Focused_Consumable1";
        Focused_Consumable2: "CSmActionEvent::EInputChange::Focused_Consumable2";
    }>;
}>;
export declare namespace CSmActionEvent {
    type EType = (typeof CSmActionEvent.EType)[keyof typeof CSmActionEvent.EType];
    type EInputChange = (typeof CSmActionEvent.EInputChange)[keyof typeof CSmActionEvent.EInputChange];
}
/** API for GameModes Manialinks Supported declare modes : - Local - Persistent */
export interface CMlScriptIngame extends CMlScript {
    GameTime: Integer;
    readonly Playground: CPlaygroundClient | null;
    /** (read-only) UI actually displayed, as defined by the server. */
    readonly UI: CUIConfig | null;
    /** Locally accessible by the client script to locally override settings from the server. */
    readonly ClientUI: CUIConfig | null;
    /** Is in spectator mode - may be only for a short time between rounds. */
    IsSpectator: Boolean;
    /** Client actually desires to spectate instead of playing. */
    IsSpectatorClient: Boolean;
    UseClans: Boolean;
    UseForcedClans: Boolean;
    /** Will be Null if the script is not runing in a layer of an app. */
    readonly ParentApp: CManiaAppPlaygroundCommon | null;
    readonly Map: CMap | null;
    Teams: (CTeam | null)[];
    IsInGameMenuDisplayed: Boolean;
    CurrentServerLogin: Text;
    CurrentServerName: Text;
    CurrentServerDesc: Text;
    CurrentServerJoinLink: Text;
    CurrentServerModeName: Text;
    SplitScreenNum: Integer;
    SplitScreenCount: Integer;
    SplitScreenIsHorizontal: Boolean;
    ShowCurChallengeCard(): Void;
    ShowModeHelp(): Void;
    CopyServerLinkToClipBoard(): Void;
    JoinTeam1(): Void;
    JoinTeam2(): Void;
    /** Request change of IsSpectatorClient (not immediate, and it may be refused). */
    RequestSpectatorClient(Spectator: Boolean): Void;
    /** Set the spectated player, but do not switch to spectator mode automatically. Equivalent to numpad1/2/3/4 */
    SetSpectateTarget(Player: Text): Void;
    ShowProfile(Player: Text): Void;
    ShowInGameMenu(): Void;
    CloseInGameMenu(Result: CMlScriptIngame.EInGameMenuResult): Void;
    CloseScoresTable(): Void;
    PlayUiSound(Sound: CMlScriptIngame.EUISound, SoundVariant: Integer, Volume: Real): Void;
}
export declare const CMlScriptIngame: Readonly<{
    readonly EInGameMenuResult: Readonly<{
        Resume: "CMlScriptIngame::EInGameMenuResult::Resume";
        Quit: "CMlScriptIngame::EInGameMenuResult::Quit";
        NormalMenu: "CMlScriptIngame::EInGameMenuResult::NormalMenu";
        AdvancedMenu: "CMlScriptIngame::EInGameMenuResult::AdvancedMenu";
        ServerSettings: "CMlScriptIngame::EInGameMenuResult::ServerSettings";
    }>;
    readonly EUISound: Readonly<{
        Default: "CMlScriptIngame::EUISound::Default";
        Silence: "CMlScriptIngame::EUISound::Silence";
        StartMatch: "CMlScriptIngame::EUISound::StartMatch";
        EndMatch: "CMlScriptIngame::EUISound::EndMatch";
        StartRound: "CMlScriptIngame::EUISound::StartRound";
        EndRound: "CMlScriptIngame::EUISound::EndRound";
        PhaseChange: "CMlScriptIngame::EUISound::PhaseChange";
        TieBreakPoint: "CMlScriptIngame::EUISound::TieBreakPoint";
        TiePoint: "CMlScriptIngame::EUISound::TiePoint";
        VictoryPoint: "CMlScriptIngame::EUISound::VictoryPoint";
        Capture: "CMlScriptIngame::EUISound::Capture";
        TimeOut: "CMlScriptIngame::EUISound::TimeOut";
        Notice: "CMlScriptIngame::EUISound::Notice";
        Warning: "CMlScriptIngame::EUISound::Warning";
        PlayerEliminated: "CMlScriptIngame::EUISound::PlayerEliminated";
        PlayerHit: "CMlScriptIngame::EUISound::PlayerHit";
        Checkpoint: "CMlScriptIngame::EUISound::Checkpoint";
        Finish: "CMlScriptIngame::EUISound::Finish";
        Record: "CMlScriptIngame::EUISound::Record";
        ScoreProgress: "CMlScriptIngame::EUISound::ScoreProgress";
        RankChange: "CMlScriptIngame::EUISound::RankChange";
        Bonus: "CMlScriptIngame::EUISound::Bonus";
        FirstHit: "CMlScriptIngame::EUISound::FirstHit";
        Combo: "CMlScriptIngame::EUISound::Combo";
        PlayersRemaining: "CMlScriptIngame::EUISound::PlayersRemaining";
        Custom1: "CMlScriptIngame::EUISound::Custom1";
        Custom2: "CMlScriptIngame::EUISound::Custom2";
        Custom3: "CMlScriptIngame::EUISound::Custom3";
        Custom4: "CMlScriptIngame::EUISound::Custom4";
    }>;
}>;
export declare namespace CMlScriptIngame {
    type EInGameMenuResult = (typeof CMlScriptIngame.EInGameMenuResult)[keyof typeof CMlScriptIngame.EInGameMenuResult];
    type EUISound = (typeof CMlScriptIngame.EUISound)[keyof typeof CMlScriptIngame.EUISound];
}
/** Documentation for class CMlScriptIngame_ReadOnly */
export interface CMlScriptIngame_ReadOnly extends CMlScript_ReadOnly {
    GameTime: Integer;
    /** Read-only */
    readonly Playground: CPlaygroundClient | null;
    /** Is in spectator mode - may be only for a short time between rounds. */
    IsSpectator: Boolean;
    /** Client actually desires to spectate instead of playing. */
    IsSpectatorClient: Boolean;
    UseClans: Boolean;
    UseForcedClans: Boolean;
    readonly Map: CMap | null;
    Teams: (CTeam | null)[];
    IsInGameMenuDisplayed: Boolean;
    CurrentServerLogin: Text;
    CurrentServerName: Text;
    CurrentServerDesc: Text;
    CurrentServerJoinLink: Text;
    CurrentServerModeName: Text;
    SplitScreenNum: Integer;
    SplitScreenCount: Integer;
    SplitScreenIsHorizontal: Boolean;
}
/** Documentation for class CGameUserVoiceChat */
export interface CGameUserVoiceChat extends CNod {
    MuteSetting: CGameUserVoiceChat.EMuteSetting;
    readonly IsLocal: Boolean;
    readonly IsMuted: Boolean;
    readonly MuteChangePending: Boolean;
    readonly IsSpeaking: Boolean;
    readonly IsConnected: Boolean;
    readonly Supported: Boolean;
    readonly MatchingPlayerInfo: CUser | null;
}
export declare const CGameUserVoiceChat: Readonly<{
    readonly EMuteSetting: Readonly<{
        Muted: "CGameUserVoiceChat::EMuteSetting::Muted";
        NotMuted: "CGameUserVoiceChat::EMuteSetting::NotMuted";
    }>;
}>;
export declare namespace CGameUserVoiceChat {
    type EMuteSetting = (typeof CGameUserVoiceChat.EMuteSetting)[keyof typeof CGameUserVoiceChat.EMuteSetting];
}
/** Documentation for class SConstStringInt */
export interface SConstStringInt {
}
/** Documentation for class SConstString */
export interface SConstString {
}
/** Audio device settings. */
export interface CAudioSettings extends CNod {
    DirtyCounter: Integer;
    Devices: Text[];
    Device_Current: Text;
    Device_NextApply: Text;
    readonly VoiceChat_Devices_DirtyCounter: Integer;
    VoiceChat_Devices_In: Text[];
    VoiceChat_Devices_Out: Text[];
    readonly VoiceChat_Device_In_Current: Text;
    readonly VoiceChat_Device_Out_Current: Text;
    VoiceChat_Device_In_NextApply: Text;
    VoiceChat_Device_Out_NextApply: Text;
    VoiceChat_SpeakerVolume: Real;
    VoiceChat_VoiceDetection_Mode: string;
    /** VoiceChat_VoiceDetection_Sensitivity is a value between 0 and 1. */
    VoiceChat_VoiceDetection_Sensitivity: Real;
}
/** Documentation for class CModuleMenuComponent */
export interface CModuleMenuComponent extends CNod {
    readonly ComponentLayer: CUILayer | null;
    Hide(): Void;
    Show(): Void;
}
/** Documentation for class CModulePlayground */
export interface CModulePlayground extends CNod {
    Hide(): Void;
    Hide(UIConfig: CUIConfig | null): Void;
    Show(): Void;
    Show(UIConfig: CUIConfig | null): Void;
    IsVisible(UIConfig: CUIConfig | null): Boolean;
}
/** Documentation for class CModuleMenuPage */
export interface CModuleMenuPage extends CNod {
    readonly Name: Text;
    Components: (CModuleMenuComponent | null)[];
}
/** Documentation for class CEditorModule Supported declare modes : - Metadata */
export interface CEditorModule extends CEditorBase {
    readonly EditedMenu: CModuleMenuModel | null;
    readonly EditedMenuPage: CModuleMenuPageModel | null;
    readonly EditedPlaygroundHud: CModulePlaygroundHudModel | null;
    readonly FileBrowser_IsRunning: Boolean;
    readonly FileBrowser_FilePath: Text;
    PendingEvents: (CEditorPluginModuleEvent | null)[];
    IsPreviewMode: Boolean;
    NewModule(ModuleType: CEditorModule.EModuleType): Void;
    OpenModule(Path: Text): Void;
    Save(): Void;
    SaveAs(Path: Text): Void;
    SaveCopyAs(Path: Text): Void;
    ForceExit(): Void;
    SetPreviewBackground(Url: Text): Void;
    ReloadPreview(): Void;
    EditedPlaygroundHud_SetPreviewContext(ContextId: Ident): Void;
    FileBrowser_Open(): Void;
    FileBrowser_Save(): Void;
}
export declare const CEditorModule: Readonly<{
    readonly EModuleType: Readonly<{
        Undefined: "CEditorModule::EModuleType::Undefined";
        Hud: "CEditorModule::EModuleType::Hud";
        Inventory: "CEditorModule::EModuleType::Inventory";
        Store: "CEditorModule::EModuleType::Store";
        ScoresTable: "CEditorModule::EModuleType::ScoresTable";
        Equipment: "CEditorModule::EModuleType::Equipment";
        MenuBase: "CEditorModule::EModuleType::MenuBase";
        MenuPage: "CEditorModule::EModuleType::MenuPage";
        Chrono: "CEditorModule::EModuleType::Chrono";
        SpeedMeter: "CEditorModule::EModuleType::SpeedMeter";
        PlayerState: "CEditorModule::EModuleType::PlayerState";
        TeamState: "CEditorModule::EModuleType::TeamState";
    }>;
}>;
export declare namespace CEditorModule {
    type EModuleType = (typeof CEditorModule.EModuleType)[keyof typeof CEditorModule.EModuleType];
}
/** API for the mesh modeler. Supported declare modes : - Metadata */
export interface CEditorMesh extends CEditorAsset {
    GoToMaterialEditor: Boolean;
    IsCreateMaterial: Boolean;
    IsEditingLayer: Boolean;
    SubdivideSmooth_NbSteps: Integer;
    LayerValueAxisX: Real;
    LayerValueAxisY: Real;
    LayerValueAxisZ: Real;
    LayerIndep: Boolean;
    LayerValueParam1: Real;
    LayerValueParam2: Real;
    LayerValueParam3: Real;
    LayerValueParam4: Real;
    LayerIndexAxisX: Boolean;
    LayerIndexAxisY: Boolean;
    LayerIndexAxisZ: Boolean;
    Layer_IsVisible: Boolean;
    Layer_IsCollidable: Boolean;
    LayerName: Text;
    LayerGeneratable: Boolean;
    AddTransitionInProgress: Boolean;
    NewTransitionName: Text;
    NewTransitionPosition: Integer;
    NewTransitionSize: Real;
    RotateAxis: Integer;
    readonly Tmp_UseParts: Boolean;
    readonly IsDebug: Boolean;
    CameraEatingInputsScript: Boolean;
    readonly VertexCount: Integer;
    readonly EdgeCount: Integer;
    readonly FaceCount: Integer;
    readonly EditionBox_IsPlaneOriented: Boolean;
    readonly Scale: Real;
    readonly Step: Real;
    readonly Size: Real;
    readonly RotationStep: Integer;
    readonly RotationValue: Real;
    readonly ScalingStep: Real;
    readonly ScalingRatio: Real;
    DisplayVertices: Boolean;
    DisplayFaces: Boolean;
    DisplayJoints: Boolean;
    DisplayEdges: CEditorMesh.EEdgesDisplay;
    readonly GridSnap_IsActive: Boolean;
    IsUsingPhysicMatLib: Boolean;
    readonly MaterialGameplayIdNumber: Integer;
    readonly MaterialsUpdateId: Integer;
    MaterialIds: Ident[];
    MaterialPhysicsIds: Ident[];
    MaterialDynaIds: Ident[];
    MaterialNames: Text[];
    MaterialPhysicsNames: Text[];
    MaterialPhysics_GameplayRemap: Integer[];
    MaterialDynaNames: Text[];
    MaterialLastUsedColors: Vec3[];
    MaterialBaseColors: Vec3[];
    CurrentColorForSpecialMaterials: Vec3;
    readonly Material_Atlas_SelectedSubTexIndex: Integer;
    readonly CurrentInteraction: CEditorMesh.EInteraction;
    readonly CreationElemsCount: Integer;
    readonly Display_HideElemsByDistance_IsActive: Boolean;
    Display_HideElemsByDistance_Distance: Integer;
    Display_HideElemsByDistance_Opacity: Real;
    readonly SelectionSet: Ident;
    VoxelSpaceCenter: Vec3;
    VoxelSpaceAngle: Vec3;
    VoxelSpaceStep: Real;
    VoxelSpaceIsInteractive: Boolean;
    PrefabNames: Text[];
    readonly PrefabNamesUpdateId: Integer;
    PrefabListCurrentPage: Integer;
    Prefab_TotalNb: Integer;
    PendingEvents: (CEditorEvent | null)[];
    MustClearLastSaveBuffer: Boolean;
    readonly IsExperimental: Boolean;
    Layers_GetCount(): Integer;
    Layers_GetLayerIdFromIndex(LayerIndex: Integer): Ident;
    Layers_GetLayerNameFromIndex(LayerIndex: Integer): Text;
    Layers_GetLayerTypeFromIndex(LayerIndex: Integer): CEditorMesh.ELayerType;
    Layers_GetLayerGeneratableFromIndex(LayerIndex: Integer): Boolean;
    Layers_SetLayerGeneratableFromIndex(LayerIndex: Integer, LayerGeneratability: Boolean): Void;
    Layers_AddLayer(LayerType: CEditorMesh.ELayerType): Void;
    Layers_GetLayerIdSelected(): Ident;
    Layers_SetLayerIdSelected(LayerId: Ident): Void;
    Layers_GetLayerSelectedType(): CEditorMesh.ELayerType;
    Layers_GetLayerSelectedIndex(): Integer;
    Layers_GetEditedLayerType(): CEditorMesh.ELayerType;
    Layers_GetLayerSelectedName(): Text;
    Layers_EditMask(LayerIndex: Integer): Void;
    Layers_EditMaskValidate(LayerIndex: Integer): Void;
    Layers_MoveSelectedLayerUp(): Void;
    Layers_MoveSelectedLayerDown(): Void;
    Layers_EditSelectedLayer(RegenerateSolid: Boolean): Void;
    Layers_CloseEditSelectedLayer(): Void;
    Layers_DeleteSelectedLayer(): Void;
    Transitions_GetCount(): Integer;
    Transitions_AddTransition(TransitionName: Text, TransitionPosition: Integer, TransitionSize: Real): Void;
    Transitions_DeleteCurrentTransition(): Void;
    Transitions_GetTransitionSelectedIndex(): Integer;
    Transitions_SetTransitionSelectedIndex(TransitionIndex: Integer): Void;
    Transitions_GetTransitionCurrentPage(): Integer;
    Transitions_SetTransitionCurrentPage(TransitionCurrentPage: Integer): Void;
    Transitions_GetTransitionNameFromIndex(TransitionIndex: Integer): Text;
    Transitions_SetTransitionNameFromIndex(TransitionIndex: Integer, TransitionName: Real): Void;
    Transitions_GetTransitionVisibilityFromIndex(TransitionIndex: Integer): Boolean;
    Transitions_SetTransitionVisibilityFromIndex(TransitionIndex: Integer, TransitionVisibility: Boolean): Void;
    Transitions_GetTransitionSizeFromIndex(TransitionIndex: Integer): Real;
    Transitions_SetTransitionSizeFromIndex(TransitionIndex: Integer, TransitionSize: Real): Void;
    Transitions_GetTransitionPositionFromIndex(TransitionIndex: Integer): Integer;
    Transitions_SetTransitionPositionFromIndex(TransitionIndex: Integer, TransitionPosition: Integer): Void;
    EditionBox_SetStep(Step: Real): Void;
    EditedMesh_Clear(): Void;
    EditedMesh_Simplify(): Void;
    EditedMesh_SimplifySelection(): Void;
    EditedMesh_Lod(FacesRatio: Real): Void;
    UVUnwrap(SetHandle: Ident, ETexCoordLayer: CEditorMesh.ETexCoordLayer): Void;
    Undo(): Void;
    Redo(): Void;
    SwitchPlane(): Void;
    GridSnap_SetActive(IsActive: Boolean): Void;
    PickInfo_GetNormal(): Vec3;
    PickInfo_GetPosition(): Vec3;
    PickInfo_GetAnchorId(): Ident;
    PickInfo_GetEdgeLength(): Real;
    PickInfo_GetNextVertexPosition(): Vec3;
    PickInfo_GetMaterial(): Ident;
    PickInfo_GetError(): Text;
    Part_SetAnchorPos(Position: Vec3): Void;
    Part_SetIsJoint(IsJoint: Boolean): Void;
    Part_ClearAnchor(): Void;
    Joint_Add(Position: Vec3): Void;
    Joint_Link(IdChild: Ident, IdParent: Ident): Void;
    Anchor_Remove(Id: Ident): Void;
    Material_GetMaterialIdSelected(): Ident;
    Material_SetMaterialIdSelected(MaterialEditorId: Ident): Void;
    MaterialDyna_GetMaterialIdSelected(): Ident;
    MaterialDyna_SetMaterialIdSelected(DynaMaterialType: Ident): Void;
    Material_GetSubTexIndexSelected(): Integer;
    Material_MaterialLibGetCount(): Integer;
    Material_SetDefault(MaterialId: Ident): Void;
    Material_GetDefault(): Ident;
    MaterialPhysic_GetDefault(): Ident;
    MaterialPhysic_GetIndex(): Integer;
    MaterialPhysic_GetGameplayId(MaterialId: Ident): Integer;
    MaterialPhysic_GetNextBitmap(): CImage | null;
    MaterialDyna_GetDefault(): Ident;
    MaterialDyna_SetDefault(MaterialId: Ident): Void;
    Material_GetBitmapBase(MaterialId: Ident): CImage | null;
    Material_GetBitmap(MaterialId: Ident): CImage | null;
    MaterialDyna_GetBitmap(MaterialId: Ident): CImage | null;
    Material_IsSpecialColored(MaterialId: Ident): Boolean;
    Material_MatchesCriterion(MaterialId: Ident, ResultSetHandle: CEditorMesh.EMaterialFilterCriterion): Boolean;
    Material_SetFilter(Criterion: CEditorMesh.EMaterialFilterCriterion, FilterKind: CEditorMesh.EFilterKind): Void;
    Material_GetFilter(Criterion: CEditorMesh.EMaterialFilterCriterion): CEditorMesh.EFilterKind;
    Material_ClearFilters(): Void;
    Material_UVEditor_SetIsRotation(IsRotation: Boolean): Void;
    Material_UVEditor_SetIsScale(IsScale: Boolean): Void;
    Material_UVEditor_SetIsScale1D(IsScale: Boolean): Void;
    Material_UVEditor_Open(MaterialId: Ident, LocationQuad: CMlQuad | null): Void;
    Material_UVEditor_Close(): Void;
    Material_UVEditor_IsRunning(): Boolean;
    Material_UVEditor_SetMode(Mode: CEditorMesh.EUVEditorMode): Void;
    Material_UVEditor_GetMode(): CEditorMesh.EUVEditorMode;
    Material_UVEditor_SetProjectionType(ProjectionType: CEditorMesh.EUVEditorProjectionType): Void;
    Material_IsGameMaterial(): Boolean;
    Material_IsCustomLinkFull(MaterialId: Ident): Boolean;
    Material_UVEditor_Apply(): Void;
    Material_CopyMaterial(SetHandle: Ident): Void;
    Material_PasteMaterial(SetHandle: Ident): Void;
    Interaction_Close(): Void;
    Interaction_SetPreview(SetToPreview: Ident): Void;
    Interaction_StartCreation(CreationSetHandle: Ident, ElemType: CEditorMesh.EElemType, SetToPickFromHandle: Ident): Boolean;
    Interaction_Creation_GetElems(ResultSetHandle: Ident): Void;
    Interaction_Creation_ClearParams(): Void;
    Interaction_Creation_SetEdgesConstraint(EdgesConstraint: CEditorMesh.EEdgesConstraint): Void;
    Interaction_Creation_SetAutoMerge(AutoMerge: Boolean): Void;
    Interaction_StartPaste(): Boolean;
    Interaction_StartBlocTransformation(TransformationSetHandle: Ident): Boolean;
    Interaction_StartCurve2D(BordersSetHandle: Ident): Boolean;
    Interaction_CloseCurve2D(CanDoCurve2D: Boolean): Void;
    Interaction_StartPick(ElemType: CEditorMesh.EElemType, SetToPickFrom: Ident): Boolean;
    Interaction_StartPickJoint(): Boolean;
    Interaction_StartVoxelPickDrag_Base(ElemType: CEditorMesh.EElemType): Boolean;
    Interaction_StartVoxelPickDrag_Creation(): Boolean;
    Interaction_StartVoxelPickDrag_Delete(): Boolean;
    Interaction_StartVoxelPickDrag_Select(SelectionSetHandle: Ident): Boolean;
    Interaction_CloseVoxelPickDrag_Select(): Void;
    Interaction_StartVoxelPickDrag_Pick(): Boolean;
    Interaction_CloseVoxelPickDrag_Pick(): Void;
    Interaction_StartVoxelPickDrag_SelectTranslation(): Boolean;
    Interaction_StartVoxelPickDrag_SelectRotation(): Boolean;
    Interaction_StartVoxelPickDrag_Paste(): Boolean;
    CutVoxels(): Void;
    CopyVoxels(): Void;
    Interaction_StartMerge(MergeSetHandle: Ident): Boolean;
    Interaction_StartMirror(SetHandle: Ident): Boolean;
    Interaction_Selection_ClearParams(): Void;
    Interaction_Selection_SetUseParts(UseParts: Boolean): Void;
    Interaction_Selection_SetCanEnterLeaf(CanEnterLeaf: Boolean): Void;
    Interaction_StartSelection(SelectionSetHandle: Ident, ElemType: CEditorMesh.EElemType, SelectionSetToPickFrom: Ident, IsFromALayer: Boolean, AllowDoubleClick: Boolean): Boolean;
    Interaction_CloseSelection(): Void;
    Interaction_StartTranslation(TranslationSetHandle: Ident): Boolean;
    Interaction_StartPickTranslation(TranslationSetHandle: Ident): Boolean;
    Interaction_StartRotation(RotationSetHandle: Ident): Boolean;
    Interaction_StartPickRotation(RotationSetHandle: Ident): Boolean;
    Interaction_Rotation_SetStep(RotationStep: Real): Void;
    Interaction_StartPickScale(ScalingSetHandle: Ident): Boolean;
    Interaction_Scale_SetStep(ScalingStep: Real): Void;
    Interaction_StartSplit(): Boolean;
    Display_HighlightSet(SetHandle: Ident): Void;
    Display_ClearHighlighting(): Void;
    Display_HideElemsByDistance_Start(SetHandle: Ident): Void;
    Display_HideElemsByDistance_Stop(): Void;
    Display_HideMap(): Void;
    Display_ShowMap(): Void;
    MergeAllSuperposedElements(SetHandle: Ident): Void;
    Selection_Undo(): Void;
    Selection_Redo(): Void;
    Selection_Invert(): Void;
    Selection_SelectAllByMaterial(): Void;
    SetOfElements_Create(): Ident;
    SetOfElements_CopyFrom(DestinationSet: Ident, SourceSet: Ident): Void;
    SetOfElements_Append(DestinationSet: Ident, SourceSet: Ident): Void;
    SetOfElements_Destroy(SetHandle: Ident): Void;
    SetOfElements_Empty(SetHandle: Ident): Void;
    SetOfElements_SetAllElements(SetHandle: Ident): Void;
    SetOfElements_SetAllFaces(SetHandle: Ident): Void;
    SetOfElements_DeleteElements(SetHandle: Ident): Void;
    SetOfElements_DeleteElements(SetHandle: Ident, Spread: Boolean): Void;
    SetOfElements_HasHorizontalFaces(SetHandle: Ident): Boolean;
    SetOfElements_HasVerticalFaces(SetHandle: Ident): Boolean;
    SetOfElements_GetElemsCount(SetHandle: Ident): Integer;
    SetOfElements_GetVerticesCount(SetHandle: Ident): Integer;
    SetOfElements_GetEdgesCount(SetHandle: Ident): Integer;
    SetOfElements_GetFacesCount(SetHandle: Ident): Integer;
    ExtendSelectedSet(SetHandle: Ident): Void;
    GetBordersSet(SetHandle: Ident, SetBordersHandle: Ident): Boolean;
    GetBordersVertexs(SetHandle: Ident, SetVertexHandle: Ident): Void;
    SelectionSet_SelectAll(): Void;
    Curve2DPolygon(FourVertexSetHandle: Ident, Sethandle: Ident, SubTexIndex: Integer): Void;
    Preview_Clear(): Void;
    VoxelSpace_SetVec3(Pos: Vec3): Void;
    VoxelSpace_GetVoxelsCount(): Integer;
    VoxelSpace_SelectAll(): Void;
    VoxelSpace_DeleteOneVoxel(): Void;
    VoxelSpace_DeleteSelection(): Void;
    VoxelSpace_ApplyMaterialToVoxel(): Void;
    VoxelSpace_GenerateMesh(): Void;
    SetOfElements_ProjectOnPlane(SetHandle: Ident): Void;
    SetOfElements_ProjectOnGround(SetHandle: Ident, Height: Real): Void;
    SetOfElements_SplitEdgeWithVertex(SetHandle: Ident): Void;
    SetOfElements_CollapseEdgeWithVertex(SetHandle: Ident): Void;
    SetOfElements_Subdivide(SetHandle: Ident): Void;
    SetOfElements_Subdivide_Interpolation(SetHandle: Ident): Void;
    SetOfVertices_DrawCircle(InputSetHandle: Ident, ResultSetHandle: Ident): Void;
    SetOfVertices_DrawCircle(CenterSetHandle: Ident, PointOnCircle: Vec3, ResultSetHandle: Ident): Void;
    SetOfVertices_DrawDisc(InputSetHandle: Ident, ResultSetHandle: Ident): Void;
    SetOfVertices_DrawIcosahedron(InputSetHandle: Ident, ResultSetHandle: Ident): Void;
    SetOfVertices_DrawIcosahedron(CenterSetHandle: Ident, PointOnCircle: Vec3, ResultSetHandle: Ident): Void;
    SetOfVertices_DrawIcosahedricSphere(InputSetHandle: Ident, ResultSetHandle: Ident): Void;
    SetOfVertices_DrawPoly(InputSetHandle: Ident, ResultSetHandle: Ident, VerticesCount: Integer): Void;
    SetOfVertices_DrawPoly(CenterSetHandle: Ident, PointOnPoly: Vec3, ResultSetHandle: Ident, VerticesCount: Integer): Void;
    SetOfVertices_DrawSpline(ControlSetHandle: Ident, ResultSetHandle: Ident): Void;
    SetOfVertices_Weld(VerticesSetHandle: Ident): Void;
    SetOfVertices_DrawBox(ControlSetHandle: Ident, ResultSetHandle: Ident): Void;
    SetOfEdges_Fill(SetHandle: Ident): Void;
    SetOfEdges_Flip(SetHandle: Ident, ResultSetHandle: Ident): Void;
    SetOfEdges_BorderExpand(SetHandle: Ident): Void;
    SetOfOneEdge_FaceLoopExpand(SetHandle: Ident): Void;
    SetOfOneEdge_EdgeLoopExpand(SetHandle: Ident): Void;
    SetOfOneFace_CutHole(FaceSetHandle: Ident, EdgesSetHandle: Ident): Void;
    SetOfFaces_Extrude(SetHandle: Ident, ResultSetHandle: Ident): Void;
    SetOfFaces_QuadsToTriangles(SetHandle: Ident, ResultSetHandle: Ident): Void;
    SetOfFaces_TrianglesToQuads(SetHandle: Ident, ResultSetHandle: Ident): Void;
    SetOfFaces_ApplyMaterial(SetHandle: Ident, MaterialId: Ident): Void;
    SetOfFaces_PlanarExpand(FacesSetHandle: Ident): Void;
    SetOfFaces_ChangeOrientation(FacesSetHandle: Ident): Void;
    Prefabs_Reload(): Void;
    Prefab_Export(): Void;
    Prefab_Import(PrefabIndex: Integer): Void;
    Parts_CanMergeParts(): Boolean;
    Parts_CanGroupParts(): Boolean;
    Parts_CanUngroupParts(): Boolean;
    Parts_GetOpsState(): Int3;
    Parts_MergeSelectedParts(): Void;
    Parts_Group(): Void;
    Parts_UngroupSelectedParts(): Void;
    Cut(): Void;
    Copy(): Void;
    AddUndoState(): Void;
    AutoSave(FileName: Text): Boolean;
    GetTitleCoreType(): CEditorMesh.ETitleCoreType;
}
export declare const CEditorMesh: Readonly<{
    readonly EEdgesDisplay: Readonly<{
        Any: "CEditorMesh::EEdgesDisplay::Any";
        Borders: "CEditorMesh::EEdgesDisplay::Borders";
        None: "CEditorMesh::EEdgesDisplay::None";
    }>;
    readonly EEdgesConstraint: Readonly<{
        Any: "CEditorMesh::EEdgesConstraint::Any";
        Adjacent: "CEditorMesh::EEdgesConstraint::Adjacent";
        Closed: "CEditorMesh::EEdgesConstraint::Closed";
    }>;
    readonly EElemType: Readonly<{
        Vertex: "CEditorMesh::EElemType::Vertex";
        Edge: "CEditorMesh::EElemType::Edge";
        Face: "CEditorMesh::EElemType::Face";
        EVoxel: "CEditorMesh::EElemType::EVoxel";
        Any: "CEditorMesh::EElemType::Any";
    }>;
    readonly EInteraction: Readonly<{
        Creation: "CEditorMesh::EInteraction::Creation";
        Pick: "CEditorMesh::EInteraction::Pick";
        PickJoint: "CEditorMesh::EInteraction::PickJoint";
        VoxelPickDrag_Base: "CEditorMesh::EInteraction::VoxelPickDrag_Base";
        VoxelPickDrag_Creation: "CEditorMesh::EInteraction::VoxelPickDrag_Creation";
        VoxelPickDrag_Delete: "CEditorMesh::EInteraction::VoxelPickDrag_Delete";
        VoxelPickDrag_Select: "CEditorMesh::EInteraction::VoxelPickDrag_Select";
        VoxelPickDrag_Pick: "CEditorMesh::EInteraction::VoxelPickDrag_Pick";
        VoxelPickDrag_SelectTranslation: "CEditorMesh::EInteraction::VoxelPickDrag_SelectTranslation";
        VoxelPickDrag_SelectRotation: "CEditorMesh::EInteraction::VoxelPickDrag_SelectRotation";
        VoxelPickDrag_Paste: "CEditorMesh::EInteraction::VoxelPickDrag_Paste";
        Selection: "CEditorMesh::EInteraction::Selection";
        Translation: "CEditorMesh::EInteraction::Translation";
        PickTranslation: "CEditorMesh::EInteraction::PickTranslation";
        ExtrudeTranslation: "CEditorMesh::EInteraction::ExtrudeTranslation";
        Rotation: "CEditorMesh::EInteraction::Rotation";
        PickRotation: "CEditorMesh::EInteraction::PickRotation";
        Scale: "CEditorMesh::EInteraction::Scale";
        Curve2D: "CEditorMesh::EInteraction::Curve2D";
        Merge: "CEditorMesh::EInteraction::Merge";
        Split: "CEditorMesh::EInteraction::Split";
        Mirror: "CEditorMesh::EInteraction::Mirror";
        Paste: "CEditorMesh::EInteraction::Paste";
        PasteMaterial: "CEditorMesh::EInteraction::PasteMaterial";
        BlocTransformation: "CEditorMesh::EInteraction::BlocTransformation";
        None: "CEditorMesh::EInteraction::None";
    }>;
    readonly ETexCoordLayer: Readonly<{
        Lightmap: "CEditorMesh::ETexCoordLayer::Lightmap";
    }>;
    readonly EMaterialFilterCriterion: Readonly<{
        IsAutomatic: "CEditorMesh::EMaterialFilterCriterion::IsAutomatic";
        IsBadForHorizontalFaces: "CEditorMesh::EMaterialFilterCriterion::IsBadForHorizontalFaces";
        IsBadForVerticalFaces: "CEditorMesh::EMaterialFilterCriterion::IsBadForVerticalFaces";
    }>;
    readonly EFilterKind: Readonly<{
        NoFilter: "CEditorMesh::EFilterKind::NoFilter";
        PassIfMatches: "CEditorMesh::EFilterKind::PassIfMatches";
        CutIfMatches: "CEditorMesh::EFilterKind::CutIfMatches";
    }>;
    readonly EUVEditorMode: Readonly<{
        UV: "CEditorMesh::EUVEditorMode::UV";
        Atlas_ApplyOnClic: "CEditorMesh::EUVEditorMode::Atlas_ApplyOnClic";
        Atlas_SelectOnClic: "CEditorMesh::EUVEditorMode::Atlas_SelectOnClic";
    }>;
    readonly EUVEditorProjectionType: Readonly<{
        Planar: "CEditorMesh::EUVEditorProjectionType::Planar";
        Curve2D: "CEditorMesh::EUVEditorProjectionType::Curve2D";
        Cylindrical2D: "CEditorMesh::EUVEditorProjectionType::Cylindrical2D";
        Cubic: "CEditorMesh::EUVEditorProjectionType::Cubic";
        Polyedric: "CEditorMesh::EUVEditorProjectionType::Polyedric";
        Cylindrical: "CEditorMesh::EUVEditorProjectionType::Cylindrical";
        ApplyOnlyMaterial: "CEditorMesh::EUVEditorProjectionType::ApplyOnlyMaterial";
    }>;
    readonly ELayerType: Readonly<{
        AddGeometry: "CEditorMesh::ELayerType::AddGeometry";
        SubdivideSmooth: "CEditorMesh::ELayerType::SubdivideSmooth";
        Translation: "CEditorMesh::ELayerType::Translation";
        Rotation: "CEditorMesh::ELayerType::Rotation";
        Scale: "CEditorMesh::ELayerType::Scale";
        Mirror: "CEditorMesh::ELayerType::Mirror";
        MoveToGround: "CEditorMesh::ELayerType::MoveToGround";
        Extrude: "CEditorMesh::ELayerType::Extrude";
        Subdivide: "CEditorMesh::ELayerType::Subdivide";
        Chaos: "CEditorMesh::ELayerType::Chaos";
        Smooth: "CEditorMesh::ELayerType::Smooth";
        BorderTransition: "CEditorMesh::ELayerType::BorderTransition";
        BlocTransfo: "CEditorMesh::ELayerType::BlocTransfo";
        Voxels: "CEditorMesh::ELayerType::Voxels";
        TriggerShape: "CEditorMesh::ELayerType::TriggerShape";
        RespawnPos: "CEditorMesh::ELayerType::RespawnPos";
        Sector: "CEditorMesh::ELayerType::Sector";
        Light: "CEditorMesh::ELayerType::Light";
        LightModel: "CEditorMesh::ELayerType::LightModel";
        WaterShape: "CEditorMesh::ELayerType::WaterShape";
        None: "CEditorMesh::ELayerType::None";
    }>;
    readonly ETitleCoreType: Readonly<{
        TrackMania: "CEditorMesh::ETitleCoreType::TrackMania";
        ShootMania: "CEditorMesh::ETitleCoreType::ShootMania";
    }>;
}>;
export declare namespace CEditorMesh {
    type EEdgesDisplay = (typeof CEditorMesh.EEdgesDisplay)[keyof typeof CEditorMesh.EEdgesDisplay];
    type EEdgesConstraint = (typeof CEditorMesh.EEdgesConstraint)[keyof typeof CEditorMesh.EEdgesConstraint];
    type EElemType = (typeof CEditorMesh.EElemType)[keyof typeof CEditorMesh.EElemType];
    type EInteraction = (typeof CEditorMesh.EInteraction)[keyof typeof CEditorMesh.EInteraction];
    type ETexCoordLayer = (typeof CEditorMesh.ETexCoordLayer)[keyof typeof CEditorMesh.ETexCoordLayer];
    type EMaterialFilterCriterion = (typeof CEditorMesh.EMaterialFilterCriterion)[keyof typeof CEditorMesh.EMaterialFilterCriterion];
    type EFilterKind = (typeof CEditorMesh.EFilterKind)[keyof typeof CEditorMesh.EFilterKind];
    type EUVEditorMode = (typeof CEditorMesh.EUVEditorMode)[keyof typeof CEditorMesh.EUVEditorMode];
    type EUVEditorProjectionType = (typeof CEditorMesh.EUVEditorProjectionType)[keyof typeof CEditorMesh.EUVEditorProjectionType];
    type ELayerType = (typeof CEditorMesh.ELayerType)[keyof typeof CEditorMesh.ELayerType];
    type ETitleCoreType = (typeof CEditorMesh.ETitleCoreType)[keyof typeof CEditorMesh.ETitleCoreType];
}
/** Documentation for class CEditorEditor Supported declare modes : - Metadata */
export interface CEditorEditor extends CEditorBase {
    readonly Bindings_RequestInput_Done: Boolean;
    BindingContexts: Text[];
    RequestedContextBindings: Text[];
    PendingEvents: (CEditorEvent | null)[];
    Bindings_AddContext(ContextName: Text): Void;
    Bindings_AddBinding(ContextName: Text, BindingScriptId: Text, BindingDisplayName: Text): Void;
    Bindings_RemoveContext(ContextName: Text): Void;
    Bindings_RemoveBinding(ContextName: Text, BindingName: Text): Void;
    Bindings_RequestInput(ContextName: Text, BindingName: Text): Void;
    Bindings_SetBindingScriptId(ContextName: Text, BindingScriptId: Text, NewBindingScriptId: Text): Void;
    Bindings_SetBindingDisplayName(ContextName: Text, BindingScriptId: Text, BindingDisplayName: Text): Void;
    Bindings_SetContextName(ContextName: Text, NewContextName: Text): Void;
    Bindings_GetContextBindings(ContextName: Text): Void;
    Bindings_GetBindingActionName(ContextName: Text, BindingName: Text): Text;
    Bindings_GetBindingDisplayName(ContextName: Text, BindingName: Text): Text;
}
/** Documentation for class CEditorMediaTracker */
export interface CEditorMediaTracker extends CEditorPluginAPI {
    CurrentTimer: Real;
    UseOrbitalInsteadOfFreeCam: Boolean;
    UseClipCamWhenAvailable: Boolean;
    CanUseClipCam: Boolean;
    PlaySpeed: Real;
    CameraSpeed: Real;
    ClipConditionValue: Real;
    readonly Clip: CMediaTrackerClip | null;
    readonly ClipGroup: CMediaTrackerClipGroup | null;
    PendingEvents: (CEditorEvent | null)[];
    readonly PopUpMessage: Text;
    readonly EditMode: CEditorMediaTracker.EMediaTrackerBlockType;
    TimePlay(): Void;
    TimeStop(): Void;
    TimeToggle(): Void;
    Rewind(): Void;
    Quit(): Void;
    UpdatePropertyListReadOnly(): Void;
    CreateBlock(): Void;
    CreateKey(): Void;
    ToggleTriggersMode(): Void;
    CreateClip(): Void;
    RemoveClip(): Void;
    Undo(): Void;
    Redo(): Void;
    ImportClip(): Void;
    ExportClip(): Void;
    ImportGhosts(): Void;
    ToggleRecordGhostMode(): Void;
    ShootVideo(): Void;
    ShootScreen(): Void;
    ComputeShadows(): Void;
    ToggleDisplayPlayerNames(): Void;
    InformInterfaceIsHidden(): Void;
    ToggleGhostRef(): Void;
    StopGhostRefPreview(): Void;
    ToggleClipCondition(): Void;
    Copy(): Void;
    Paste(): Void;
    Cut(): Void;
    DuplicateTrack(): Void;
    SplitBlock(): Void;
    MergeTracks(): Void;
    ToggleAlwaysShowTriggerZone(): Void;
    ResetTriggerZone(): Void;
    RemoveAllTracks(): Void;
    SetClip(Clip: CMediaTrackerClip | null): Void;
    IsPlaying(): Boolean;
    IsDevMode(): Boolean;
    SetCameraDrawRect(Pos: Vec2, Size: Vec2): Void;
    GetSelectedClip(): Integer;
    GetSelectedTrack(): Integer;
    GetSelectedBlock(): Integer;
    GetSelectedKey(): Integer;
    SelectItem(Track: Integer, Block: Integer, Key: Integer): Void;
    CreateTrack(Type: CEditorMediaTracker.EMediaTrackerBlockType): Void;
    CanCreateTrack(Type: CEditorMediaTracker.EMediaTrackerBlockType): Boolean;
    IsKeyStartEnd(Track: Integer, Block: Integer, Key: Integer): Boolean;
    RemoveTrack(Track: Integer): Void;
    RemoveBlock(Track: Integer, Block: Integer): Void;
    RemoveKey(Track: Integer, Block: Integer, Key: Integer): Void;
    CanRemoveAllKeys(Track: Integer, Block: Integer): Boolean;
    RemoveAllKeys(Track: Integer, Block: Integer): Void;
    SetProcessCamInputs(ProcessCamInputs: Boolean): Void;
    ToolBarSetVisible(Visible: Boolean): Void;
    IsTriggersModeOn(): Boolean;
    IsRecordGhostModeOn(): Boolean;
    SetTempHidePropertyList(TempHide: Boolean): Void;
    SetClipName(Index: Integer, Name: Text): Void;
    SetTrackName(Index: Integer, Name: Text): Void;
    SetTrackIsCycling(Track: CMediaTrackerTrack | null, IsCycling: Boolean): Void;
    SetTrackIsKeepPlaying(Track: CMediaTrackerTrack | null, IsKeepPlaying: Boolean): Void;
    GetTrackIsCycling(Track: CMediaTrackerTrack | null): Boolean;
    GetTrackIsKeepPlaying(Track: CMediaTrackerTrack | null): Boolean;
    SetStartIsCycling(Track: CMediaTrackerTrack | null): Void;
    SetStopIsCycling(Track: CMediaTrackerTrack | null): Void;
    GetStartIsCycling(Track: CMediaTrackerTrack | null): Real;
    GetStopIsCycling(Track: CMediaTrackerTrack | null): Real;
    GetGhostRefName(): Text;
    GetClipConditionName(): Text;
    HasClipCondition(): Boolean;
    GetTimeLimit(): Real;
    SetTimer(Time: Text): Void;
    SetCurrentBlockStart(Start: Text): Void;
    SetCurrentBlockEnd(End: Text): Void;
    CanCopy(): CEditorMediaTracker.EMediaTrackerCopyType;
    CanCut(): CEditorMediaTracker.EMediaTrackerCopyType;
    CanPaste(): CEditorMediaTracker.EMediaTrackerPasteType;
    HasCopiedItem(): Boolean;
    IsPropertyListReadOnlyAndVisible(): Boolean;
    SelectGhostRef(Type: CEditorMediaTracker.EMediaTrackerGhostRef): Void;
    DeleteGhostRef(Type: CEditorMediaTracker.EMediaTrackerGhostRef): Void;
    RecordGhostRef(Type: CEditorMediaTracker.EMediaTrackerGhostRef): Void;
    GhostRefExists(Type: CEditorMediaTracker.EMediaTrackerGhostRef): Boolean;
    GetSelectedGhostRef(): CEditorMediaTracker.EMediaTrackerGhostRef;
    StartGhostRefPreview(Type: CEditorMediaTracker.EMediaTrackerGhostRef): Void;
    RemoveAllGhostTracksExcept(Track: Integer): Void;
    RemoveAllCameraTracksExcept(Track: Integer): Void;
    CanRemoveAllGhostTracks(): Boolean;
    CanRemoveAllCameraTracks(): Boolean;
    IsGhostRefPreview(): Boolean;
    SetProfileTheme(Theme: Integer): Void;
    GetProfileTheme(): Integer;
}
export declare const CEditorMediaTracker: Readonly<{
    readonly EMediaTrackerBlockType: Readonly<{
        Ghost: "CEditorMediaTracker::EMediaTrackerBlockType::Ghost";
        CameraCustom: "CEditorMediaTracker::EMediaTrackerBlockType::CameraCustom";
        CameraPath: "CEditorMediaTracker::EMediaTrackerBlockType::CameraPath";
        Time: "CEditorMediaTracker::EMediaTrackerBlockType::Time";
        FxColors: "CEditorMediaTracker::EMediaTrackerBlockType::FxColors";
        Sound: "CEditorMediaTracker::EMediaTrackerBlockType::Sound";
        Fog: "CEditorMediaTracker::EMediaTrackerBlockType::Fog";
        TransitionFade: "CEditorMediaTracker::EMediaTrackerBlockType::TransitionFade";
        CameraEffectShake: "CEditorMediaTracker::EMediaTrackerBlockType::CameraEffectShake";
        CameraEffectScript: "CEditorMediaTracker::EMediaTrackerBlockType::CameraEffectScript";
        Stereo3d: "CEditorMediaTracker::EMediaTrackerBlockType::Stereo3d";
        DOF: "CEditorMediaTracker::EMediaTrackerBlockType::DOF";
        ToneMapping: "CEditorMediaTracker::EMediaTrackerBlockType::ToneMapping";
        BloomHdr: "CEditorMediaTracker::EMediaTrackerBlockType::BloomHdr";
        DirtyLens: "CEditorMediaTracker::EMediaTrackerBlockType::DirtyLens";
        ColorGrading: "CEditorMediaTracker::EMediaTrackerBlockType::ColorGrading";
        FxCameraBlend: "CEditorMediaTracker::EMediaTrackerBlockType::FxCameraBlend";
        MusicEffect: "CEditorMediaTracker::EMediaTrackerBlockType::MusicEffect";
        TimeSpeed: "CEditorMediaTracker::EMediaTrackerBlockType::TimeSpeed";
        TextBlock: "CEditorMediaTracker::EMediaTrackerBlockType::TextBlock";
        Image: "CEditorMediaTracker::EMediaTrackerBlockType::Image";
        ColoringCapturable: "CEditorMediaTracker::EMediaTrackerBlockType::ColoringCapturable";
        ColoringBase: "CEditorMediaTracker::EMediaTrackerBlockType::ColoringBase";
        CameraGame: "CEditorMediaTracker::EMediaTrackerBlockType::CameraGame";
        Trails: "CEditorMediaTracker::EMediaTrackerBlockType::Trails";
        Manialink: "CEditorMediaTracker::EMediaTrackerBlockType::Manialink";
        EditingCut: "CEditorMediaTracker::EMediaTrackerBlockType::EditingCut";
        CamFxInertialTracking: "CEditorMediaTracker::EMediaTrackerBlockType::CamFxInertialTracking";
        VehicleLight: "CEditorMediaTracker::EMediaTrackerBlockType::VehicleLight";
        Interface: "CEditorMediaTracker::EMediaTrackerBlockType::Interface";
        Triangles2D: "CEditorMediaTracker::EMediaTrackerBlockType::Triangles2D";
        Triangles3D: "CEditorMediaTracker::EMediaTrackerBlockType::Triangles3D";
        CameraOrbital: "CEditorMediaTracker::EMediaTrackerBlockType::CameraOrbital";
        OpponentVisibility: "CEditorMediaTracker::EMediaTrackerBlockType::OpponentVisibility";
        Spectators: "CEditorMediaTracker::EMediaTrackerBlockType::Spectators";
    }>;
    readonly EMediaTrackerCopyType: Readonly<{
        None: "CEditorMediaTracker::EMediaTrackerCopyType::None";
        Key: "CEditorMediaTracker::EMediaTrackerCopyType::Key";
        Block: "CEditorMediaTracker::EMediaTrackerCopyType::Block";
    }>;
    readonly EMediaTrackerPasteType: Readonly<{
        None: "CEditorMediaTracker::EMediaTrackerPasteType::None";
        KeyInfo: "CEditorMediaTracker::EMediaTrackerPasteType::KeyInfo";
        NewKey: "CEditorMediaTracker::EMediaTrackerPasteType::NewKey";
        BlockCurrentTrack: "CEditorMediaTracker::EMediaTrackerPasteType::BlockCurrentTrack";
        BlockNewTrack: "CEditorMediaTracker::EMediaTrackerPasteType::BlockNewTrack";
    }>;
    readonly EMediaTrackerGhostRef: Readonly<{
        Author: "CEditorMediaTracker::EMediaTrackerGhostRef::Author";
        Ghost1: "CEditorMediaTracker::EMediaTrackerGhostRef::Ghost1";
        Ghost2: "CEditorMediaTracker::EMediaTrackerGhostRef::Ghost2";
        Ghost3: "CEditorMediaTracker::EMediaTrackerGhostRef::Ghost3";
    }>;
}>;
export declare namespace CEditorMediaTracker {
    type EMediaTrackerBlockType = (typeof CEditorMediaTracker.EMediaTrackerBlockType)[keyof typeof CEditorMediaTracker.EMediaTrackerBlockType];
    type EMediaTrackerCopyType = (typeof CEditorMediaTracker.EMediaTrackerCopyType)[keyof typeof CEditorMediaTracker.EMediaTrackerCopyType];
    type EMediaTrackerPasteType = (typeof CEditorMediaTracker.EMediaTrackerPasteType)[keyof typeof CEditorMediaTracker.EMediaTrackerPasteType];
    type EMediaTrackerGhostRef = (typeof CEditorMediaTracker.EMediaTrackerGhostRef)[keyof typeof CEditorMediaTracker.EMediaTrackerGhostRef];
}
/** Documentation for class CEditorSkin */
export interface CEditorSkin extends CEditorPluginAPI {
    AllIcons: (CImage | null)[];
    PendingEvents: (CEditorEvent | null)[];
    CustomColors: Vec3[];
    PainterMode: CEditorSkin.EPainterMode;
    PainterSolidType: CEditorSkin.EPainterSolidType;
    IsTextEnabled: Boolean;
    IsPickingColor: Boolean;
    IsErasing: Boolean;
    IsUsingShininessOnly: Boolean;
    IsBrushNormal: Boolean;
    IsTextSymmetry: Boolean;
    SubObjectsSelected: Integer[];
    SubObjectsCount: Integer;
    LayersSelected: Integer[];
    LayersCount: Integer;
    StickersSelected: Integer[];
    StickersCount: Integer;
    BrushsSelected: Integer[];
    BrushsCount: Integer;
    SubFolderElemSelected: Integer[];
    CurSubFolderElemCount: Integer;
    Transparency: Real;
    Scale: Real;
    Rough: Real;
    Metal: Real;
    Color: Vec3;
    EditionLayersCount: Integer;
    IsEditingLayer: Boolean;
    EditionLayerSelected: Integer;
    SubObjectHovered: Integer;
    CurrentLayerSubObjectsSelected: Integer[];
    CanUndo: Boolean;
    CanRedo: Boolean;
    TextToCreateBitmap: Text;
    IsFillWithReplacement: Boolean;
    SkinName: Text;
    IsCameraButtonOn: Boolean;
    ToggleIsTextEnabled(): Void;
    ToggleIsPickingColor(): Void;
    TogglePaintSymMode(): Void;
    EditCurrentLayerSelected(): Void;
    AddAndEditLayer(): Void;
    CloseEditSelectedLayer(): Void;
    MoveSelectedLayerUp(): Void;
    MoveSelectedLayerDown(): Void;
    DeleteSelectedLayer(): Void;
    Undo(): Void;
    Redo(): Void;
    ExportSkin(): Void;
    AlignBrushSticker(): Void;
    AskSwitchEditedNodType(): Void;
    ToggleHelper(): Void;
    ToggleLight(): Void;
    ExportLayerEdition(): Void;
    ImportLayerEdition(): Void;
    GetAllIconFromId(Index: Integer, IconType: CEditorSkin.EEditorSkin_IconType): CImage | null;
    GetSubFolderIconFromId(FolderIndex: Integer, ElemIndex: Integer, IconType: CEditorSkin.EEditorSkin_IconType): CImage | null;
    GetLayerNameFromIndex(Index: Integer): Text;
    GetLayerVisibleFromIndex(Index: Integer): Boolean;
    SetLayerVisibleFromIndex(IsVisible: Boolean, Index: Integer): Void;
    SetPainterMode(Mode: CEditorSkin.EPainterMode): Boolean;
    GetSubObjectMaxPage(NbPerPage: Integer): Integer;
    GetMainFrameMaxPage(NbPerPage: Integer): Integer;
    OnLayerSelected(CurrentPage: Integer, Index: Integer): Void;
    OnStickerSelected(CurrentPage: Integer, Index: Integer): Void;
    OnBrushSelected(CurrentPage: Integer, Index: Integer): Void;
    OnSubFolderElemSelected(SubFolderCurrentPage: Integer, ElemIndex: Integer): Void;
    SetCurrentLayerSelectedName(Name: Text): Void;
    AddScale(Delta: Real): Void;
    AddAngle(DeltaRad: Real): Void;
    SetSubObjectIndexForLayer(SubObjectIndex: Integer, LayerIndex: Integer, ResetFirst: Boolean): Void;
    IsElemAtScriptIndexFolder(ScriptIndex: Integer, IconType: CEditorSkin.EEditorSkin_IconType): Boolean;
    GetFolderNameFromScriptIndex(ScriptIndex: Integer, IconType: CEditorSkin.EEditorSkin_IconType): Text;
    IsCtrlDown(): Boolean;
    GetSubObjectNameFromIndex(ScriptIndex: Integer): Text;
    OpenMediaFolder(SubFolderPath: Text): Void;
    ReloadResources(forSubObjects: Boolean): Void;
}
export declare const CEditorSkin: Readonly<{
    readonly EPainterMode: Readonly<{
        NoOp: "CEditorSkin::EPainterMode::NoOp";
        Fill: "CEditorSkin::EPainterMode::Fill";
        Brush: "CEditorSkin::EPainterMode::Brush";
        Sticker: "CEditorSkin::EPainterMode::Sticker";
        Layer: "CEditorSkin::EPainterMode::Layer";
        BadgeSlots: "CEditorSkin::EPainterMode::BadgeSlots";
        Team: "CEditorSkin::EPainterMode::Team";
    }>;
    readonly EPainterSolidType: Readonly<{
        Other: "CEditorSkin::EPainterSolidType::Other";
        CarWithPilot: "CEditorSkin::EPainterSolidType::CarWithPilot";
        Pilot_Male: "CEditorSkin::EPainterSolidType::Pilot_Male";
        Pilot_Female: "CEditorSkin::EPainterSolidType::Pilot_Female";
        Helmet: "CEditorSkin::EPainterSolidType::Helmet";
    }>;
    readonly EEditorSkin_IconType: Readonly<{
        Stickers: "CEditorSkin::EEditorSkin_IconType::Stickers";
        Brushs: "CEditorSkin::EEditorSkin_IconType::Brushs";
        Layers: "CEditorSkin::EEditorSkin_IconType::Layers";
        SubObjects: "CEditorSkin::EEditorSkin_IconType::SubObjects";
    }>;
}>;
export declare namespace CEditorSkin {
    type EPainterMode = (typeof CEditorSkin.EPainterMode)[keyof typeof CEditorSkin.EPainterMode];
    type EPainterSolidType = (typeof CEditorSkin.EPainterSolidType)[keyof typeof CEditorSkin.EPainterSolidType];
    type EEditorSkin_IconType = (typeof CEditorSkin.EEditorSkin_IconType)[keyof typeof CEditorSkin.EEditorSkin_IconType];
}
/** This is the title menus Manialink interface. Supported declare modes : - Local - Persistent */
export interface CModuleMenuLayer extends CManiaAppTitleLayer {
    Components: (CModuleMenuComponent | null)[];
    GetFirstComponent(Name: Text): CModuleMenuComponent | null;
}
/** API for titles menus to control the main loop. */
export interface CTitleControl extends CNod {
    /** Can a command be issued. */
    readonly IsReady: Boolean;
    /** Result of the latest command issued. */
    readonly LatestResult: CTitleControl.EResult;
    readonly CustomResultType: Text;
    CustomResultData: Text[];
    readonly CanPublishFiles: Boolean;
    LocalServers: (CServerInfo | null)[];
    LocalServers_CurrentTitle: (CServerInfo | null)[];
    readonly GetServerInfo_Result: CServerInfo | null;
    JoinServer_DisableSystemDialogs: Boolean;
    PlayMap(Map: Text, Mode: Text, SettingsXml: Text): Void;
    PlayCampaign(Campaign: CCampaign | null, MapInfo: CMapInfo | null, Mode: Text, SettingsXml: Text): Void;
    PlayMapList(MapList: Text[], Mode: Text, SettingsXml: Text): Void;
    PlayMatchSettings(MatchSettings: CMatchSettings | null, OverrideMode: Text, OverrideSettingsXml: Text): Void;
    PlayAgainstReplay(Replay: Text, Mode: Text, SettingsXml: Text): Void;
    PlaySplitScreen(LayoutType: CTitleControl.ESplitScreenLayout, MapList: Text[], Mode: Text, SettingsXml: Text): Void;
    PlaySplitScreen(LayoutType: CTitleControl.ESplitScreenLayout, MatchSettings: CMatchSettings | null): Void;
    PlayMultiOnSameScreen(MapList: Text[], Mode: Text, SettingsXml: Text): Void;
    PlayMultiOnSameScreen(MatchSettings: CMatchSettings | null): Void;
    ViewReplay(Replay: Text): Void;
    OpenEditor(EditorName: Text, MainPluginSettings: Text): Void;
    OpenEditor(EditorType: CTitleControl.EEditorType): Void;
    EditSkins(): Void;
    EditSkinsFromFileName(SkinFilePath: Text): Void;
    EditReplay(ReplayList: Text[]): Void;
    EditReplay(ReplayList: Text[], EditType: CTitleControl.EReplayEditType): Void;
    EditGhosts(Map: Text): Void;
    EditAsset(EditorName: Text, MainPluginSettingsXml: Text, RelativeFileName: Text): Void;
    EditMap(Map: Text, EditorPluginScript: Text, EditorPluginArgument: Text): Void;
    EditMap(Map: Text, Decoration: Text, ModNameOrUrl: Text, PlayerModel: Text, EditorPluginScript: Text, EditorPluginArgument: Text): Void;
    EditMap(Map: Text, Decoration: Text, ModNameOrUrl: Text, PlayerModel: Text, EditorPluginScript: Text, EditorPluginArgument: Text, UpgradeToAdvancedEditor: Boolean): Void;
    EditMap(Map: Text, Decoration: Text, ModNameOrUrl: Text, PlayerModel: Text, EditorPluginsScripts: Text[], EditorPluginsArguments: Text[], UpgradeToAdvancedEditor: Boolean): Void;
    EditMap(Map: Text, Decoration: Text, ModNameOrUrl: Text, PlayerModel: Text, EditorPluginsScripts: Text[], EditorPluginsArguments: Text[], UpgradeToAdvancedEditor: Boolean, OnlyUseForcedPlugins: Boolean): Void;
    EditNewMap(Environment: Text, Decoration: Text, ModNameOrUrl: Text, PlayerModel: Text, MapType: Text, EditorPluginScript: Text, EditorPluginArgument: Text): Void;
    EditNewMap(Environment: Text, Decoration: Text, ModNameOrUrl: Text, PlayerModel: Text, MapType: Text, UseSimpleEditor: Boolean, EditorPluginScript: Text, EditorPluginArgument: Text): Void;
    EditNewMap(Environment: Text, Decoration: Text, ModNameOrUrl: Text, PlayerModel: Text, MapType: Text, UseSimpleEditor: Boolean, EditorPluginsScripts: Text[], EditorPluginsArguments: Text[]): Void;
    EditNewMap(Environment: Text, Decoration: Text, ModNameOrUrl: Text, PlayerModel: Text, MapType: Text, UseSimpleEditor: Boolean, EditorPluginsScripts: Text[], EditorPluginsArguments: Text[], OnlyUseForcedPlugins: Boolean): Void;
    EditNewMapFromBaseMap(BaseMapName: Text, ModNameOrUrl: Text, PlayerModel: Text, MapType: Text, EditorPluginScript: Text, EditorPluginArgument: Text): Void;
    EditNewMapFromBaseMap(BaseMapName: Text, Decoration: Text, ModNameOrUrl: Text, PlayerModel: Text, MapType: Text, EditorPluginScript: Text, EditorPluginArgument: Text): Void;
    EditNewMapFromBaseMap(BaseMapName: Text, Decoration: Text, ModNameOrUrl: Text, PlayerModel: Text, MapType: Text, EditorPluginsScripts: Text[], EditorPluginsArguments: Text[], OnlyUseForcedPlugins: Boolean): Void;
    /** Set FileName='' to open a file select dialog. */
    PublishFile(FileName: Text): Void;
    ProcessManiaCodeXml(ManiaCodeXml: Text): Void;
    DiscoverLocalServers(): Void;
    CreateServer(ServerName: Text, ServerComment: Text, MaxPlayerCount: Integer, Password: Text, PasswordSpectators: Text, MatchSettings: CMatchSettings | null): Void;
    CreateServer(ServerName: Text, ServerComment: Text, MaxPlayerCount: Integer, Password: Text, PasswordSpectators: Text, MatchSettings: CMatchSettings | null, LocalOnly: Boolean): Void;
    /** Fetch the server info, from the account id, or 'IP:xxx.xxx.xxx.xxx' with LAN ip */
    GetServerInfo(ServerLogin: Text): Void;
    GetServerInfo(LocalServer: CServerInfo | null): Void;
    GetServerInfo_Abort(): Void;
    Join_GetServerInfo_Result(AsSpectator: Boolean, Password: Text): Void;
    /** Join a server */
    JoinServer(ServerLogin: Text, AsSpectator: Boolean, Password: Text): Void;
    Quit(): Void;
}
export declare const CTitleControl: Readonly<{
    readonly ESplitScreenLayout: Readonly<{
        Horizontal: "CTitleControl::ESplitScreenLayout::Horizontal";
        Vertical: "CTitleControl::ESplitScreenLayout::Vertical";
        Four: "CTitleControl::ESplitScreenLayout::Four";
    }>;
    readonly EResult: Readonly<{
        Success: "CTitleControl::EResult::Success";
        Error_Internal: "CTitleControl::EResult::Error_Internal";
        Error_DataMgr: "CTitleControl::EResult::Error_DataMgr";
        Error_Net_ServerNotFound: "CTitleControl::EResult::Error_Net_ServerNotFound";
        Error_Net_ServerUnreachable: "CTitleControl::EResult::Error_Net_ServerUnreachable";
        Error_Net_Disconnected: "CTitleControl::EResult::Error_Net_Disconnected";
        Error_Net_WrongPassword: "CTitleControl::EResult::Error_Net_WrongPassword";
        Error_Network_OnlineExpired: "CTitleControl::EResult::Error_Network_OnlineExpired";
        Error_Network_ServerFull: "CTitleControl::EResult::Error_Network_ServerFull";
        Error_Abort: "CTitleControl::EResult::Error_Abort";
    }>;
    readonly EEditorType: Readonly<{
        ActionMaker: "CTitleControl::EEditorType::ActionMaker";
        ChallengeEditor: "CTitleControl::EEditorType::ChallengeEditor";
        ItemEditor: "CTitleControl::EEditorType::ItemEditor";
        InterfaceDesigner: "CTitleControl::EEditorType::InterfaceDesigner";
        MeshModeler: "CTitleControl::EEditorType::MeshModeler";
    }>;
    readonly EReplayEditType: Readonly<{
        None: "CTitleControl::EReplayEditType::None";
        Edit: "CTitleControl::EReplayEditType::Edit";
        View: "CTitleControl::EReplayEditType::View";
        Shoot: "CTitleControl::EReplayEditType::Shoot";
    }>;
}>;
export declare namespace CTitleControl {
    type ESplitScreenLayout = (typeof CTitleControl.ESplitScreenLayout)[keyof typeof CTitleControl.ESplitScreenLayout];
    type EResult = (typeof CTitleControl.EResult)[keyof typeof CTitleControl.EResult];
    type EEditorType = (typeof CTitleControl.EEditorType)[keyof typeof CTitleControl.EEditorType];
    type EReplayEditType = (typeof CTitleControl.EReplayEditType)[keyof typeof CTitleControl.EReplayEditType];
}
/** Station mania app. Supported declare modes : - Local - Persistent */
export interface CManiaAppStation extends CManiaAppBase {
    readonly Station: CStation | null;
    Maker_EditedTitles: (CPackCreatorTitleInfo | null)[];
    EnterStation(): Void;
    Maker_EditTitle(EditedTitleId: Text): Void;
    /** A new title id will be derived from the EditedTitleName. */
    Maker_EditNewTitle(EditedTitleName: Text): Void;
}
/** Station info & manipulation. */
export interface CStation extends CNod {
    readonly Title: CTitle | null;
    readonly AudienceRegisteredUsers: Integer;
    readonly CampaignMedalsMax: Integer;
    readonly CampaignMedalsCurrent: Integer;
    readonly CampaignMedalsRanking: Integer;
    readonly LadderPoints: Real;
    readonly LadderRank: Integer;
    readonly Echelon: CStation.EEchelon;
    readonly NextEchelonPercent: Integer;
    DisableQuickEnter: Boolean;
    IsLogoVisible: Boolean;
    GhostAlpha: Real;
    FocusLightColor: Vec3;
    NormalLightColor: Vec3;
    /** Is title present in WorkTitles folder? */
    readonly IsEditable: Boolean;
}
export declare const CStation: Readonly<{
    readonly EEchelon: Readonly<{
        None: "CStation::EEchelon::None";
        Bronze1: "CStation::EEchelon::Bronze1";
        Bronze2: "CStation::EEchelon::Bronze2";
        Bronze3: "CStation::EEchelon::Bronze3";
        Silver1: "CStation::EEchelon::Silver1";
        Silver2: "CStation::EEchelon::Silver2";
        Silver3: "CStation::EEchelon::Silver3";
        Gold1: "CStation::EEchelon::Gold1";
        Gold2: "CStation::EEchelon::Gold2";
        Gold3: "CStation::EEchelon::Gold3";
    }>;
}>;
export declare namespace CStation {
    type EEchelon = (typeof CStation.EEchelon)[keyof typeof CStation.EEchelon];
}
/** API for Maniaplanet client scripts. Supported declare modes : - Local - Persistent */
export interface CManiaAppBrowser extends CManiaApp {
    PendingEvents: (CManiaAppEvent | null)[];
    BrowserFocusedFrameId: Text;
    BrowserBack(): Void;
    BrowserQuit(): Void;
    BrowserHome(): Void;
    BrowserReload(): Void;
}
/** Documentation for class CMap Supported declare modes : - Local - Metadata - Persistent */
export interface CMap extends CNod {
    readonly MapInfo: CMapInfo | null;
    MapName: Text;
    Comments: Text;
    readonly AuthorZoneIconUrl: Text;
    readonly CollectionName: Text;
    readonly DecorationName: Text;
    readonly AuthorLogin: Text;
    readonly AuthorNickName: Text;
    readonly AuthorZonePath: Text;
    readonly MapType: Text;
    readonly MapStyle: Text;
    TMObjective_AuthorTime: Integer;
    TMObjective_GoldTime: Integer;
    TMObjective_SilverTime: Integer;
    TMObjective_BronzeTime: Integer;
    TMObjective_NbLaps: Integer;
    TMObjective_IsLapRace: Boolean;
    ObjectiveTextAuthor: Text;
    ObjectiveTextGold: Text;
    ObjectiveTextSilver: Text;
    ObjectiveTextBronze: Text;
    readonly CopperPrice: Integer;
    readonly Size: Int3;
    readonly HasCustomIntro: Boolean;
    readonly HasCustomMusic: Boolean;
}
/** Documentation for class CMlFrame Supported declare modes : - Local */
export interface CMlFrame extends CMlControl {
    Controls: (CMlControl | null)[];
    ScrollActive: Boolean;
    ScrollWheel: CMlFrame.EScrollWheel;
    ScrollOffset: Vec2;
    readonly ScrollAnimOffset: Vec2;
    ScrollMax: Vec2;
    ScrollMin: Vec2;
    ScrollGridSnap: Boolean;
    ScrollGrid: Vec2;
    DisablePreload: Boolean;
    GetFirstChild(ControlId: Text): CMlControl | null;
    Scroll(DeltaInGridUnits: Vec2): Void;
    ScrollBumpTop(): Void;
    ScrollBumpBottom(): Void;
    ScrollBumpLeft(): Void;
    ScrollBumpRight(): Void;
}
export declare const CMlFrame: Readonly<{
    readonly EScrollWheel: Readonly<{
        Vertical: "CMlFrame::EScrollWheel::Vertical";
        Horizontal: "CMlFrame::EScrollWheel::Horizontal";
        NonInteractive: "CMlFrame::EScrollWheel::NonInteractive";
    }>;
}>;
export declare namespace CMlFrame {
    type EScrollWheel = (typeof CMlFrame.EScrollWheel)[keyof typeof CMlFrame.EScrollWheel];
}
/** An event Supported declare modes : - Local */
export interface CBaseConstEvent extends CNod {
    /** Use this flag to solve issues where some events are interpreted twice by different script librairies.<br/>Discard events if the flag is set. Set the flag after handling the event. */
    HasBeenProcessed: Boolean;
}
/** Manialink control. Supported declare modes : - Local */
export interface CMlColorPicker extends CMlControl {
    Color: Vec3;
}
/** Manialink control. Supported declare modes : - Local */
export interface CMlTimeLine extends CMlControl {
    Time: Real;
    TimeMin: Real;
    TimeMax: Real;
    Page: Integer;
    TracksPerPage: Integer;
    readonly IsDraggingCursor: Boolean;
    readonly IsDraggingBlock: Boolean;
    readonly IsDraggingKey: Boolean;
    readonly IsScaling: Boolean;
    readonly IsPanning: Boolean;
    ShowFullTimeLine(): Void;
    ResetCycling(): Void;
    SetSimpleMediaTrackerPilot(MediaTracker: CEditorMediaTracker | null): Void;
    SetSelection(Track: Integer, Block: Integer, Key: Integer): Void;
    SetSeparatorColor(HexColor: Text): Void;
    SetBgColor(HexColor: Text): Void;
    SetCursorColor(HexColor: Text): Void;
    SetRulerColor(HexColor: Text): Void;
    SetRulerLineColor(HexColor: Text): Void;
    SetKeyColor(HexColor: Text): Void;
    SetStartIsCycling(Time: Real): Void;
    SetStopIsCycling(Time: Real): Void;
    SetTimeLimit(TimeLimit: Real): Void;
}
/** Manialink control. Supported declare modes : - Local */
export interface CMlSlider extends CMlControl {
    Value: Real;
    MinRange: Real;
    MaxRange: Real;
}
/** Manialink control. Supported declare modes : - Local */
export interface CMlMediaPlayer extends CMlControl {
    IsInitPlay: Boolean;
    Music: Boolean;
    IsLooping: Boolean;
    Volume: Real;
    Url: Text;
    Play(): Void;
    Stop(): Void;
    StopAndRewind(): Void;
}
/** Manialink control. Supported declare modes : - Local */
export interface CMlGraph extends CMlControl {
    CoordsMin: Vec2;
    CoordsMax: Vec2;
    Curves: (CMlGraphCurve | null)[];
    AddCurve(): CMlGraphCurve | null;
    RemoveCurve(Curve: CMlGraphCurve | null): Void;
}
/** Manialink control. Supported declare modes : - Local */
export interface CMlGauge extends CMlControl {
    Style: Text;
    /** Values in range (0.000000-1.000000) */
    Ratio: Real;
    /** Values in range (0.000000-1.000000) */
    GradingRatio: Real;
    Clan: Integer;
    Color: Vec3;
    DrawBackground: Boolean;
    DrawBlockBackground: Boolean;
    CenteredBar: Boolean;
    SetRatio(NewRatio: Real): Void;
    SetClan(NewClan: Integer): Void;
}
/** Manialink control. Supported declare modes : - Local */
export interface CMlCamera extends CMlControl {
    Fullscreen: Boolean;
}
/** Manialink entry. Supported declare modes : - Local */
export interface CMlTextEdit extends CMlControl {
    Value: Text;
    MaxLine: Integer;
    AutoNewLine: Boolean;
    ShowLineNumbers: Boolean;
    LineSpacing: Real;
    readonly ValueLineCount: Integer;
    Opacity: Real;
    TextColor: Vec3;
    TextSizeReal: Real;
    TextFormat: CMlTextEdit.EControlScriptEditorTextFormat;
    StartEdition(): Void;
}
export declare const CMlTextEdit: Readonly<{
    readonly EControlScriptEditorTextFormat: Readonly<{
        Basic: "CMlTextEdit::EControlScriptEditorTextFormat::Basic";
        Script: "CMlTextEdit::EControlScriptEditorTextFormat::Script";
        Password: "CMlTextEdit::EControlScriptEditorTextFormat::Password";
        Newpassword: "CMlTextEdit::EControlScriptEditorTextFormat::Newpassword";
    }>;
}>;
export declare namespace CMlTextEdit {
    type EControlScriptEditorTextFormat = (typeof CMlTextEdit.EControlScriptEditorTextFormat)[keyof typeof CMlTextEdit.EControlScriptEditorTextFormat];
}
/** Manialink entry. Supported declare modes : - Local */
export interface CMlEntry extends CMlControl {
    Value: Text;
    TextFormat: CMlEntry.ETextFormat;
    Opacity: Real;
    TextColor: Vec3;
    TextSizeReal: Real;
    MaxLength: Integer;
    StartEdition(): Void;
    SetText(NewText: Text, SendSubmitEvent: Boolean): Void;
    GetValueType(): CMlEntry.ValueType;
    SetValueType(ValueType: CMlEntry.ValueType): Void;
}
export declare const CMlEntry: Readonly<{
    readonly ETextFormat: Readonly<{
        Basic: "CMlEntry::ETextFormat::Basic";
        Script: "CMlEntry::ETextFormat::Script";
        Password: "CMlEntry::ETextFormat::Password";
        Newpassword: "CMlEntry::ETextFormat::Newpassword";
    }>;
    readonly ValueType: Readonly<{
        Ml_Unknown: "CMlEntry::ValueType::Ml_Unknown";
        Ml_Natural: "CMlEntry::ValueType::Ml_Natural";
        Ml_Integer: "CMlEntry::ValueType::Ml_Integer";
        Ml_Real: "CMlEntry::ValueType::Ml_Real";
        Ml_String: "CMlEntry::ValueType::Ml_String";
        Ml_TimeMmSsCc: "CMlEntry::ValueType::Ml_TimeMmSsCc";
        Ml_TimeHhMmSs: "CMlEntry::ValueType::Ml_TimeHhMmSs";
        Ml_RealFormated: "CMlEntry::ValueType::Ml_RealFormated";
        Ml_TimeMmSs: "CMlEntry::ValueType::Ml_TimeMmSs";
        Ml_Ascii7bit: "CMlEntry::ValueType::Ml_Ascii7bit";
        Ml_Real3Decimals: "CMlEntry::ValueType::Ml_Real3Decimals";
        Ml_TimeHhMmSs_24: "CMlEntry::ValueType::Ml_TimeHhMmSs_24";
        Ml_TimeHhMm: "CMlEntry::ValueType::Ml_TimeHhMm";
        Ml_Percent: "CMlEntry::ValueType::Ml_Percent";
        Ml_Hexa: "CMlEntry::ValueType::Ml_Hexa";
        Ml_TimeHhMmSsOrMmSs: "CMlEntry::ValueType::Ml_TimeHhMmSsOrMmSs";
        Ml_TimeHhMmFromSeconds: "CMlEntry::ValueType::Ml_TimeHhMmFromSeconds";
        Ml_TimeHhMmSsMil: "CMlEntry::ValueType::Ml_TimeHhMmSsMil";
    }>;
}>;
export declare namespace CMlEntry {
    type ETextFormat = (typeof CMlEntry.ETextFormat)[keyof typeof CMlEntry.ETextFormat];
    type ValueType = (typeof CMlEntry.ValueType)[keyof typeof CMlEntry.ValueType];
}
/** Manialink entry. Supported declare modes : - Local */
export interface CMlLabel extends CMlControl {
    Style: Text;
    Substyle: Text;
    TextFont: Text;
    Value: Text;
    readonly ValueLineCount: Integer;
    MaxLine: Integer;
    LineSpacing: Real;
    ItalicSlope: Real;
    AppendEllipsis: Boolean;
    AutoNewLine: Boolean;
    Opacity: Real;
    /** Used to include styling attributes like $s,$o... */
    TextPrefix: Text;
    TextColor: Vec3;
    TextSizeReal: Real;
    Blend: CMlLabel.EBlendMode;
    TTS_AltText: Text;
    TTS_AltText_Translate: Boolean;
    FilterProfanities: CMlLabel.EFilterProfanities;
    SetText(NewText: Text): Void;
    ComputeWidth(Text: Text): Real;
    ComputeWidth(Text: Text, Translated: Boolean): Real;
    ComputeHeight(Text: Text): Real;
    TTS_Focus(): Void;
    TTS_Unfocus(): Void;
}
export declare const CMlLabel: Readonly<{
    readonly EBlendMode: Readonly<{
        Default: "CMlLabel::EBlendMode::Default";
        Add: "CMlLabel::EBlendMode::Add";
    }>;
    readonly EFilterProfanities: Readonly<{
        Never: "CMlLabel::EFilterProfanities::Never";
        OnlyIfNotTranslated: "CMlLabel::EFilterProfanities::OnlyIfNotTranslated";
        Always: "CMlLabel::EFilterProfanities::Always";
    }>;
}>;
export declare namespace CMlLabel {
    type EBlendMode = (typeof CMlLabel.EBlendMode)[keyof typeof CMlLabel.EBlendMode];
    type EFilterProfanities = (typeof CMlLabel.EFilterProfanities)[keyof typeof CMlLabel.EFilterProfanities];
}
/** Manialink control. Supported declare modes : - Local */
export interface CMlMinimap extends CMlControl {
    WorldPosition: Vec3;
    MapPosition: Vec2;
    MapYaw: Real;
    /** Values in range (0.500000-10.000000) */
    ZoomFactor: Real;
    Underground: Boolean;
    DisableAutoUnderground: Boolean;
    Fog_SetAll(Value: Real): Void;
    Fog_ClearDisk(WorldCenter: Vec3, Radius: Real, FadeSize: Real): Void;
}
/** Documentation for class CMlQuad Supported declare modes : - Local */
export interface CMlQuad extends CMlControl {
    Image: CImage | null;
    ImageUrl: Text;
    ImageUrlFocus: Text;
    AlphaMaskUrl: Text;
    Style: Text;
    Substyle: Text;
    StyleSelected: Boolean;
    readonly DownloadInProgress: Boolean;
    SuperSample: Boolean;
    Colorize: Vec3;
    ModulateColor: Vec3;
    BgColor: Vec3;
    BgColorFocus: Vec3;
    Opacity: Real;
    KeepRatio: CMlQuad.EKeepRatioMode;
    Blend: CMlQuad.EBlendMode;
    TTS_AltText: Text;
    TTS_AltText_Translate: Boolean;
    ChangeImageUrl(fieldName: Text): Void;
    RefreshImages(): Void;
    TTS_Focus(): Void;
    TTS_Unfocus(): Void;
}
export declare const CMlQuad: Readonly<{
    readonly EKeepRatioMode: Readonly<{
        Inactive: "CMlQuad::EKeepRatioMode::Inactive";
        Clip: "CMlQuad::EKeepRatioMode::Clip";
        Fit: "CMlQuad::EKeepRatioMode::Fit";
    }>;
    readonly EBlendMode: Readonly<{
        Default: "CMlQuad::EBlendMode::Default";
        Add: "CMlQuad::EBlendMode::Add";
    }>;
}>;
export declare namespace CMlQuad {
    type EKeepRatioMode = (typeof CMlQuad.EKeepRatioMode)[keyof typeof CMlQuad.EKeepRatioMode];
    type EBlendMode = (typeof CMlQuad.EBlendMode)[keyof typeof CMlQuad.EBlendMode];
}
/** Documentation for class CParsingDocument */
export interface CParsingDocument extends CNod {
    readonly TextContents: Text;
    readonly Root: CParsingNode | null;
    Nodes: (CParsingNode | null)[];
    GetFirstChild(Name: Text): CParsingNode | null;
}
/** An HTTP request. Supported declare modes : - Local */
export interface CHttpRequest extends CNod {
    /** Url of the request */
    readonly Url: Text;
    /** Result available once IsCompleted and StatusCode = 200 */
    readonly Result: Text;
    /** HTTP status code */
    readonly StatusCode: Integer;
    readonly IsCompleted: Boolean;
}
/** An HTTP event. */
export interface CHttpEvent extends CNod {
    readonly Type: CHttpEvent.EType;
    /** Request triggering the event */
    readonly Request: CHttpRequest | null;
}
export declare const CHttpEvent: Readonly<{
    readonly EType: Readonly<{
        RequestComplete: "CHttpEvent::EType::RequestComplete";
    }>;
}>;
export declare namespace CHttpEvent {
    type EType = (typeof CHttpEvent.EType)[keyof typeof CHttpEvent.EType];
}
/** This is a video playback handle. */
export interface CVideo extends CNod {
    readonly Image: CImage | null;
    IsLooping: Boolean;
    readonly DownloadInProgress: Boolean;
    readonly PlayLength: Real;
    readonly IsProcessing: Boolean;
    /** Automatically begin processing when the layer becomes visible and end when hidden. */
    AutoProcessing: Boolean;
    readonly IsPlaying: Boolean;
    /** note: seeking not implemented, setting a value is ignored. */
    PlayCursor: Real;
    TextureFilter: CVideo.ETextureFilter;
    BeginProcessing(): Void;
    EndProcessing(): Void;
    Play(): Void;
    Pause(): Void;
    Stop(): Void;
}
export declare const CVideo: Readonly<{
    readonly ETextureFilter: Readonly<{
        Default: "CVideo::ETextureFilter::Default";
        Point: "CVideo::ETextureFilter::Point";
    }>;
}>;
export declare namespace CVideo {
    type ETextureFilter = (typeof CVideo.ETextureFilter)[keyof typeof CVideo.ETextureFilter];
}
/** Documentation for class CAudioSource */
export interface CAudioSource extends CNod {
    readonly IsPlaying: Boolean;
    readonly DownloadInProgress: Boolean;
    Volume: Real;
    FadeDuration: Real;
    VolumedB: Real;
    Pitch: Real;
    RelativePosition: Vec3;
    PanRadiusLfe: Vec3;
    PlayCursor: Real;
    readonly PlayLength: Real;
    Play(): Void;
    Stop(): Void;
}
/** Documentation for class CAudioSourceMusic */
export interface CAudioSourceMusic extends CAudioSource {
    Tracks_Volume: Real[];
    Tracks_VolumedB: Real[];
    Tracks_Name: Text[];
    Tracks_Length: Real[];
    readonly Tracks_Count: Integer;
    readonly BeatsPerMinute: Real;
    readonly BeatDuration: Real;
    readonly BeatsPerBar: Integer;
    UpdateMode: CAudioSourceMusic.EUpdateMode;
    Dbg_ForceIntensity: Boolean;
    Dbg_ForceSequential: Boolean;
    Dbg_ForceRandom: Boolean;
    /** Values in range (0.000000-1.000000) */
    LPF_CutoffRatio: Real;
    /** Values in range (0.100000-20.000000) */
    LPF_Q: Real;
    /** Values in range (0.000000-1.000000) */
    HPF_CutoffRatio: Real;
    /** Values in range (0.100000-20.000000) */
    HPF_Q: Real;
    FadeTracksDuration: Real;
    FadeFiltersDuration: Real;
    UseNewImplem: Boolean;
    MuteAllTracks(): Void;
    UnmuteAllTracks(): Void;
    NextVariant(): Void;
    NextVariant(IsIntensityDecreasing: Boolean): Void;
    EnableSegment(SegmentName: Text): Void;
}
export declare const CAudioSourceMusic: Readonly<{
    readonly EUpdateMode: Readonly<{
        Cut: "CAudioSourceMusic::EUpdateMode::Cut";
        OnNextBar: "CAudioSourceMusic::EUpdateMode::OnNextBar";
        OnNextHalfBar: "CAudioSourceMusic::EUpdateMode::OnNextHalfBar";
        OnNextBeat: "CAudioSourceMusic::EUpdateMode::OnNextBeat";
    }>;
}>;
export declare namespace CAudioSourceMusic {
    type EUpdateMode = (typeof CAudioSourceMusic.EUpdateMode)[keyof typeof CAudioSourceMusic.EUpdateMode];
}
/** Documentation for class CInputEvent */
export interface CInputEvent extends CNod {
    readonly Type: CInputEvent.EType;
    readonly Pad: CInputPad | null;
    readonly Button: CInputEvent.EButton;
    readonly IsAutoRepeat: Boolean;
    readonly KeyCode: Integer;
    readonly KeyName: Text;
}
export declare const CInputEvent: Readonly<{
    readonly EType: Readonly<{
        PadButtonPress: "CInputEvent::EType::PadButtonPress";
    }>;
    readonly EButton: Readonly<{
        Left: "CInputEvent::EButton::Left";
        Right: "CInputEvent::EButton::Right";
        Up: "CInputEvent::EButton::Up";
        Down: "CInputEvent::EButton::Down";
        A: "CInputEvent::EButton::A";
        B: "CInputEvent::EButton::B";
        X: "CInputEvent::EButton::X";
        Y: "CInputEvent::EButton::Y";
        L1: "CInputEvent::EButton::L1";
        R1: "CInputEvent::EButton::R1";
        LeftStick: "CInputEvent::EButton::LeftStick";
        RightStick: "CInputEvent::EButton::RightStick";
        Menu: "CInputEvent::EButton::Menu";
        View: "CInputEvent::EButton::View";
        LeftStick_Left: "CInputEvent::EButton::LeftStick_Left";
        LeftStick_Right: "CInputEvent::EButton::LeftStick_Right";
        LeftStick_Up: "CInputEvent::EButton::LeftStick_Up";
        LeftStick_Down: "CInputEvent::EButton::LeftStick_Down";
        RightStick_Left: "CInputEvent::EButton::RightStick_Left";
        RightStick_Right: "CInputEvent::EButton::RightStick_Right";
        RightStick_Up: "CInputEvent::EButton::RightStick_Up";
        RightStick_Down: "CInputEvent::EButton::RightStick_Down";
        L2: "CInputEvent::EButton::L2";
        R2: "CInputEvent::EButton::R2";
        None: "CInputEvent::EButton::None";
    }>;
}>;
export declare namespace CInputEvent {
    type EType = (typeof CInputEvent.EType)[keyof typeof CInputEvent.EType];
    type EButton = (typeof CInputEvent.EButton)[keyof typeof CInputEvent.EButton];
}
/** game controller. */
export interface CInputPad extends CNod {
    readonly ControllerId: Integer;
    readonly UserId: Ident;
    readonly Type: CInputPad.EPadType;
    readonly ModelName: Text;
    readonly IdleDuration: Integer;
    readonly Left: Integer;
    readonly Right: Integer;
    readonly Up: Integer;
    readonly Down: Integer;
    readonly A: Integer;
    readonly B: Integer;
    readonly X: Integer;
    readonly Y: Integer;
    readonly L1: Integer;
    readonly R1: Integer;
    readonly LeftStickBut: Integer;
    readonly RightStickBut: Integer;
    readonly Menu: Integer;
    readonly View: Integer;
    /** Values in range (-1.000000-1.000000) */
    readonly LeftStickX: Real;
    /** Values in range (-1.000000-1.000000) */
    readonly LeftStickY: Real;
    /** Values in range (-1.000000-1.000000) */
    readonly RightStickX: Real;
    /** Values in range (-1.000000-1.000000) */
    readonly RightStickY: Real;
    /** Values in range (0.000000-1.000000) */
    readonly L2: Real;
    /** Values in range (0.000000-1.000000) */
    readonly R2: Real;
    ButtonEvents: CInputPad.EButton[];
    ClearRumble(): Void;
    /** Duration = 0 --> forever. */
    AddRumble(Duration: Integer, LargeMotor: Real, SmallMotor: Real): Void;
    /** (only works on PS4.) set to (0,0,0) to reset back to default color. */
    SetColor(Color: Vec3): Void;
}
export declare const CInputPad: Readonly<{
    readonly EButton: Readonly<{
        Left: "CInputPad::EButton::Left";
        Right: "CInputPad::EButton::Right";
        Up: "CInputPad::EButton::Up";
        Down: "CInputPad::EButton::Down";
        A: "CInputPad::EButton::A";
        B: "CInputPad::EButton::B";
        X: "CInputPad::EButton::X";
        Y: "CInputPad::EButton::Y";
        L1: "CInputPad::EButton::L1";
        R1: "CInputPad::EButton::R1";
        LeftStick: "CInputPad::EButton::LeftStick";
        RightStick: "CInputPad::EButton::RightStick";
        Menu: "CInputPad::EButton::Menu";
        View: "CInputPad::EButton::View";
        LeftStick_Left: "CInputPad::EButton::LeftStick_Left";
        LeftStick_Right: "CInputPad::EButton::LeftStick_Right";
        LeftStick_Up: "CInputPad::EButton::LeftStick_Up";
        LeftStick_Down: "CInputPad::EButton::LeftStick_Down";
        RightStick_Left: "CInputPad::EButton::RightStick_Left";
        RightStick_Right: "CInputPad::EButton::RightStick_Right";
        RightStick_Up: "CInputPad::EButton::RightStick_Up";
        RightStick_Down: "CInputPad::EButton::RightStick_Down";
        L2: "CInputPad::EButton::L2";
        R2: "CInputPad::EButton::R2";
        None: "CInputPad::EButton::None";
    }>;
    readonly EPadType: Readonly<{
        Keyboard: "CInputPad::EPadType::Keyboard";
        Mouse: "CInputPad::EPadType::Mouse";
        Generic: "CInputPad::EPadType::Generic";
        XBox: "CInputPad::EPadType::XBox";
        PlayStation: "CInputPad::EPadType::PlayStation";
        Vive: "CInputPad::EPadType::Vive";
    }>;
}>;
export declare namespace CInputPad {
    type EButton = (typeof CInputPad.EButton)[keyof typeof CInputPad.EButton];
    type EPadType = (typeof CInputPad.EPadType)[keyof typeof CInputPad.EPadType];
}
/** Documentation for class CCampaign */
export interface CCampaign extends CNod {
    readonly CampaignId: Text;
    MapGroups: (CMapGroup | null)[];
    ScoreContext: Text;
    OfficialRecordEnabled: Boolean;
    GetMapGroupCount(): Integer;
    GetMapGroup(Index: Integer): CMapGroup | null;
    GetNextMap(CurrentMapInfo: CMapInfo | null): CMapInfo | null;
}
/** Task result containing a ItemCollection info from NadeoServices. Supported declare modes : - Local */
export interface CTaskResult_NSItemCollection extends CWebServicesTaskResult_NadeoServicesItemCollection {
    /** ItemCollection info retrieve from NadeoServices contained by this result. */
    readonly ItemCollection: CNadeoServicesItemCollection | null;
}
/** Task result containing a list of ItemCollection info from NadeoServices. Supported declare modes : - Local */
export interface CTaskResult_NSItemCollectionList extends CWebServicesTaskResult_NadeoServicesItemCollectionList {
    /** List of ItemCollection info retrieve from NadeoServices contained by this result. */
    ItemCollectionList: (CNadeoServicesItemCollection | null)[];
}
/** Results containing a list of map info. Supported declare modes : - Local */
export interface CTaskResult_MapList extends CTaskResult {
    /** Path of the parent zone. */
    readonly ParentPath: Text;
    /** Path of the current zone. */
    readonly Path: Text;
    /** List of the map info. Array of CMapInfo objects. */
    MapInfos: (CMapInfo | null)[];
    /** List of the sub folders. Array of string. */
    SubFolders: Text[];
}
/** Task result containing a map info from NadeoServices. Supported declare modes : - Local */
export interface CTaskResult_NSMap extends CWebServicesTaskResult_NadeoServicesMap {
    /** Map info retrieve from NadeoServices contained by this result. */
    readonly Map: CNadeoServicesMap | null;
}
/** Task result containing a list of map info from NadeoServices. Supported declare modes : - Local */
export interface CTaskResult_NSMapList extends CWebServicesTaskResult_NadeoServicesMapList {
    /** List of map info retrieve from NadeoServices contained by this result. */
    MapList: (CNadeoServicesMap | null)[];
}
/** Asynchronous task result. Supported declare modes : - Local */
export interface CWebServicesTaskResult_Natural extends CTaskResult {
    readonly Value: Integer;
}
/** Task result containing a Skin info from NadeoServices. Supported declare modes : - Local */
export interface CTaskResult_NSSkin extends CWebServicesTaskResult_NadeoServicesSkin {
    /** Skin info retrieve from NadeoServices contained by this result. */
    readonly Skin: CNadeoServicesSkin | null;
}
/** Task result containing a list of Skin info from NadeoServices. Supported declare modes : - Local */
export interface CTaskResult_NSSkinList extends CWebServicesTaskResult_NadeoServicesSkinList {
    /** List of Skin info retrieve from NadeoServices contained by this result. */
    SkinList: (CNadeoServicesSkin | null)[];
}
/** Results containing a list of replay info. Supported declare modes : - Local */
export interface CTaskResult_ReplayList extends CTaskResult {
    /** Path of the parent zone. */
    readonly ParentPath: Text;
    /** Path of the current zone. */
    readonly Path: Text;
    /** List of the replay info. Array of CReplayInfo objects. */
    ReplayInfos: (CReplayInfo | null)[];
    /** List of the sub folders. Array of string. */
    SubFolders: Text[];
}
/** Results containing a list of ghost. Supported declare modes : - Local */
export interface CTaskResult_GhostList extends CTaskResult {
    /** List of ghost. Array of CGhost. */
    Ghosts: (CGhost | null)[];
}
/** Results containing a list of media info. Supported declare modes : - Local */
export interface CTaskResult_FileList extends CTaskResult {
    /** Path of the parent zone. */
    readonly ParentPath: Text;
    /** Path of the current zone. */
    readonly Path: Text;
    /** List of files. Array of string. */
    Files: Text[];
    /** List of the sub folders. Array of string. */
    SubFolders: Text[];
}
/** Results containing a list of GameMode info. Supported declare modes : - Local */
export interface CTaskResult_GameModeList extends CTaskResult {
    /** Description of the GameMode */
    GameModes: (CTaskResult_ModeInfo | null)[];
}
/** Task result containing a list of map record info from NadeoServices. Supported declare modes : - Local */
export interface CTaskResult_MapRecordList extends CWebServicesTaskResult_WSMapRecordList {
    /** List of map record info retrieve from NadeoServices contained by this result. */
    MapRecordList: (CMapRecord | null)[];
}
/** Task result containing a season. Supported declare modes : - Local */
export interface CTaskResult_Season extends CWebServicesTaskResult_Season {
    /** Season info contained by this result. */
    readonly Season: CSeason | null;
}
/** Task result containing a list of season. Supported declare modes : - Local */
export interface CTaskResult_SeasonList extends CWebServicesTaskResult_SeasonList {
    /** List of season contained by this result. */
    SeasonList: (CSeason | null)[];
}
/** Task result containing a part of the history of account trophy gain. Supported declare modes : - Local */
export interface CTaskResult_AccountTrophyGainHistory extends CWebServicesTaskResult_AccountTrophyGainHistory {
    /** List of account trophy gain contained in this result. */
    AccountTrophyGainList: (CAccountTrophyGainForHistory | null)[];
    readonly AccountTrophyGainTotalCount: Integer;
}
/** Task result containing a last year summary of account trophy. Supported declare modes : - Local */
export interface CTaskResult_AccountTrophyLastYearSummary extends CWebServicesTaskResult_AccountTrophyLastYearSummary {
    /** Last year summary of account trophy contained by this result. */
    readonly Summary: CAccountTrophyLastYearSummary | null;
}
/** Task result containing the settings of a solo medal trophy achievement. Supported declare modes : - Local */
export interface CTaskResult_TrophySoloMedalAchievementSettings extends CWebServicesTaskResult_TrophySoloMedalAchievementSettings {
    /** Settings of a solo medal trophy achievement contained by this result. */
    readonly Settings: CTrophySoloMedalAchievementSettings | null;
}
/** Results containing a list of zones. Supported declare modes : - Local */
export interface CTaskResult_ZoneList extends CWebServicesTaskResult_WSZonePtrList {
    /** List of zones. Array of CRankingsZone objects. */
    ZoneList: (CZone | null)[];
    /** Get a zone into the list from a zone id. Must be called after the task has succeeded. */
    GetZone(ZoneId: Text): CZone | null;
}
/** Results of task requesting the zone of user. Supported declare modes : - Local */
export interface CTaskResult_UserZoneList extends CTaskResult {
    ZoneList: (CZone | null)[];
    /** Get a zone for a user. Must be called after the task has succeeded. */
    GetUserZone(WebServicesUserId: Text): CZone | null;
}
/** Local profile settings. */
export interface CUserV2Profile extends CNod {
    readonly CanChangePassword: Boolean;
    readonly CanChangeNickName: Boolean;
    /** avatar, horn and podium pose */
    readonly CanChangeAvatar: Boolean;
    readonly CanChangeSkin: Boolean;
    readonly CanChangeZone: Boolean;
    readonly CanChangeGroups: Boolean;
    Account_Name: Text;
    Account_EMail: Text;
    Account_AcceptNews: Boolean;
    Account_EnableAutoConnect: Boolean;
    /** Values in range (0.000000-1.000000) */
    User_LightTrailHue: Real;
    /** Values in range (0.500000-2.000000) */
    User_HornPitch: Real;
    User_Description: Text;
    User_ClubLinkUrl: Text;
    User_Trigram: Text;
    User_ForceEmptyPilotSkin: Boolean;
    User_CharacterSkinOptions: Text;
    User_CombinePrestigeAndSkins: Boolean;
    Custom_EnableAvatars: Boolean;
    Custom_EnableChat: Boolean;
    Custom_PlayerModels: CUserV2Profile.ECustomPlayerModels;
    Custom_EnableUnlimitedHorns: Boolean;
    /** Favoured way to open the Map Editor */
    Editors_MapEditorMode: CUserV2Profile.EMapEditorMode;
    Editors_MapEditorUseQuickstart: Boolean;
    Editors_MapEditorQuickstartUseGamepad: Boolean;
    Editors_MapEditorQuickstartDifficulty: CUserV2Profile.EMapEditorDifficulty;
    Editors_MapEditorQuickstartMood: CUserV2Profile.EMapEditorMood;
    Editors_MapEditorQuickstartEnviro: CUserV2Profile.EMapEditorEnviro;
    Editors_MapEditorQuickstartMapType: Integer;
    Online_AutoSaveReplay: Boolean;
    Online_SaveRoundReplaysSeparately: Boolean;
    Online_DefaultOpponentVisibility: CUserV2Profile.EPlayerVisibility;
    Online_RoadsideSpectatorVisibility: CUserV2Profile.ERoadsideSpectatorVisibility;
    Title_IsForbiddenWithParentalLock: Boolean;
    AddictionLimiter_DailyQuotaMinutes: Integer;
    Steam_OpenLinksInSteam: Boolean;
    Steam_SynchonizeWorkshopFiles: Boolean;
    Interface_CrosshairEnableCustomColor: Boolean;
    /** Values in range (0.000000-1.000000) */
    Interface_CrosshairSaturation: Real;
    /** Values in range (0.000000-1.000000) */
    Interface_CrosshairLinearHue: Real;
    /** Values in range (0.100000-2.000000) */
    Interface_CrosshairSize: Real;
    /** Values in range (0.100000-1.000000) */
    Interface_CrosshairOpacity: Real;
    Interface_CrosshairName: Text;
    /** Values in range (0.100000-2.000000) */
    Interface_PlayerShieldScale: Real;
    Interface_AllyEnableCustomColor: Boolean;
    /** Values in range (0.000000-1.000000) */
    Interface_AllyLinearHue: Real;
    Interface_OppoEnableCustomColor: Boolean;
    /** Values in range (0.000000-1.000000) */
    Interface_OppoLinearHue: Real;
    Interface_BeaconUseProfileColor: Boolean;
    /** Values in range (0.000000-1.000000) */
    Interface_BeaconOpacity: Real;
    /** Values in range (0.100000-5.000000) */
    Interface_BeaconSize: Real;
    /** Values in range (0.500000-15.000000) */
    Interface_BeaconDuration: Real;
    Interface_InternalCamLocalPlayerVisibility: CUserV2Profile.EPlayerVisibility;
    Interface_UseOldInternalCam: Boolean;
    Interface_UseAlternateCam1: Boolean;
    Interface_UseAlternateCam2: Boolean;
    Interface_ShowSpecialsFeedback: Boolean;
    Interface_DisplayRecords: CUserV2Profile.EDisplayRecords;
    Interface_AllowChatHiding: Boolean;
    Interface_ColorblindMode: Boolean;
    Interface_IngameChatBackground: CUserV2Profile.EIngameChatBackground;
    Interface_IngameChatTextSize: CUserV2Profile.EIngameChatTextSize;
    Inputs_MouseLookInvertY: Boolean;
    Inputs_MouseReleaseKey: CUserV2Profile.EInputMouseReleaseKey;
    /** Values in range (0.100000-3.000000) */
    Inputs_MouseScaleY: Real;
    /** Values in range (0.100000-3.000000) */
    Inputs_MouseScaleFreeLook: Real;
    /** Values in range (0.000000-3.000000) */
    Inputs_MouseAccel: Real;
    /** Values in range (-1.000000-1.000000) */
    Inputs_MouseSensitivityDefault: Real;
    /** Values in range (-1.000000-1.000000) */
    Inputs_MouseSensitivityLaser: Real;
    Inputs_MouseSensitivityDefault_Raw: Real;
    Inputs_MouseSensitivityLaser_Raw: Real;
    Inputs_Vehicles: (CVehicleSettings | null)[];
    Adverts_Enabled: Boolean;
    Adverts_UsePersonnalData: Boolean;
    TTS_Enabled: Boolean;
    STT_Enabled: Boolean;
    VoiceChat_Loopback: Boolean;
    VoiceChat_Enabled: Boolean;
    readonly STT_Available: Boolean;
    VoiceChat_SendTextAsVoice: Boolean;
    Account_ResetChanges(): Void;
}
export declare const CUserV2Profile: Readonly<{
    readonly EMapEditorMode: Readonly<{
        Ask: "CUserV2Profile::EMapEditorMode::Ask";
        Advanced: "CUserV2Profile::EMapEditorMode::Advanced";
    }>;
    readonly EMapEditorMood: Readonly<{
        Sunrise: "CUserV2Profile::EMapEditorMood::Sunrise";
        Day: "CUserV2Profile::EMapEditorMood::Day";
        Sunset: "CUserV2Profile::EMapEditorMood::Sunset";
        Night: "CUserV2Profile::EMapEditorMood::Night";
    }>;
    readonly EMapEditorEnviro: Readonly<{
        Ask: "CUserV2Profile::EMapEditorEnviro::Ask";
        Stadium: "CUserV2Profile::EMapEditorEnviro::Stadium";
        BlueBay: "CUserV2Profile::EMapEditorEnviro::BlueBay";
        RedIsland: "CUserV2Profile::EMapEditorEnviro::RedIsland";
        GreenCoast: "CUserV2Profile::EMapEditorEnviro::GreenCoast";
        WhiteShore: "CUserV2Profile::EMapEditorEnviro::WhiteShore";
    }>;
    readonly EMapEditorDifficulty: Readonly<{
        Simple: "CUserV2Profile::EMapEditorDifficulty::Simple";
        Advanced: "CUserV2Profile::EMapEditorDifficulty::Advanced";
        Expert: "CUserV2Profile::EMapEditorDifficulty::Expert";
    }>;
    readonly ECustomPlayerModels: Readonly<{
        All: "CUserV2Profile::ECustomPlayerModels::All";
        OnlyTextures: "CUserV2Profile::ECustomPlayerModels::OnlyTextures";
        None: "CUserV2Profile::ECustomPlayerModels::None";
    }>;
    readonly EInputMouseReleaseKey: Readonly<{
        LeftAlt: "CUserV2Profile::EInputMouseReleaseKey::LeftAlt";
        RightAlt: "CUserV2Profile::EInputMouseReleaseKey::RightAlt";
        LeftCtrl: "CUserV2Profile::EInputMouseReleaseKey::LeftCtrl";
        RightCtrl: "CUserV2Profile::EInputMouseReleaseKey::RightCtrl";
    }>;
    readonly EPlayerVisibility: Readonly<{
        Hidden: "CUserV2Profile::EPlayerVisibility::Hidden";
        Ghost: "CUserV2Profile::EPlayerVisibility::Ghost";
        Opaque: "CUserV2Profile::EPlayerVisibility::Opaque";
    }>;
    readonly EDisplayRecords: Readonly<{
        Progressive: "CUserV2Profile::EDisplayRecords::Progressive";
        Always: "CUserV2Profile::EDisplayRecords::Always";
        Hide: "CUserV2Profile::EDisplayRecords::Hide";
    }>;
    readonly ERoadsideSpectatorVisibility: Readonly<{
        Never: "CUserV2Profile::ERoadsideSpectatorVisibility::Never";
        SpectatorOnly: "CUserV2Profile::ERoadsideSpectatorVisibility::SpectatorOnly";
        Always: "CUserV2Profile::ERoadsideSpectatorVisibility::Always";
    }>;
    readonly EIngameChatBackground: Readonly<{
        Hidden: "CUserV2Profile::EIngameChatBackground::Hidden";
        Transparent: "CUserV2Profile::EIngameChatBackground::Transparent";
        Opaque: "CUserV2Profile::EIngameChatBackground::Opaque";
    }>;
    readonly EIngameChatTextSize: Readonly<{
        Medium: "CUserV2Profile::EIngameChatTextSize::Medium";
        Small: "CUserV2Profile::EIngameChatTextSize::Small";
        Big: "CUserV2Profile::EIngameChatTextSize::Big";
    }>;
}>;
export declare namespace CUserV2Profile {
    type EMapEditorMode = (typeof CUserV2Profile.EMapEditorMode)[keyof typeof CUserV2Profile.EMapEditorMode];
    type EMapEditorMood = (typeof CUserV2Profile.EMapEditorMood)[keyof typeof CUserV2Profile.EMapEditorMood];
    type EMapEditorEnviro = (typeof CUserV2Profile.EMapEditorEnviro)[keyof typeof CUserV2Profile.EMapEditorEnviro];
    type EMapEditorDifficulty = (typeof CUserV2Profile.EMapEditorDifficulty)[keyof typeof CUserV2Profile.EMapEditorDifficulty];
    type ECustomPlayerModels = (typeof CUserV2Profile.ECustomPlayerModels)[keyof typeof CUserV2Profile.ECustomPlayerModels];
    type EInputMouseReleaseKey = (typeof CUserV2Profile.EInputMouseReleaseKey)[keyof typeof CUserV2Profile.EInputMouseReleaseKey];
    type EPlayerVisibility = (typeof CUserV2Profile.EPlayerVisibility)[keyof typeof CUserV2Profile.EPlayerVisibility];
    type EDisplayRecords = (typeof CUserV2Profile.EDisplayRecords)[keyof typeof CUserV2Profile.EDisplayRecords];
    type ERoadsideSpectatorVisibility = (typeof CUserV2Profile.ERoadsideSpectatorVisibility)[keyof typeof CUserV2Profile.ERoadsideSpectatorVisibility];
    type EIngameChatBackground = (typeof CUserV2Profile.EIngameChatBackground)[keyof typeof CUserV2Profile.EIngameChatBackground];
    type EIngameChatTextSize = (typeof CUserV2Profile.EIngameChatTextSize)[keyof typeof CUserV2Profile.EIngameChatTextSize];
}
/** Asynchronous task result. Supported declare modes : - Local */
export interface CTaskResult_StringIntList extends CTaskResult {
    Values: Text[];
}
/** Masterserver user info. */
export interface CMasterServerUser extends CNod {
    readonly NeedToChangeZone: Boolean;
    /** Number of level in the full path of the user zone. */
    readonly ZoneLevelCount: Integer;
    readonly MultiInternetPlayTimeLeft: Integer;
    /** Login. */
    readonly Login: Text;
    /** Display name. */
    readonly DisplayName: Text;
    /** Connection status: NotConnected, Connecting, Connected or Disconnecting. */
    readonly ConnectionStatus: CMasterServerUser.EMasterServerConnectionStatus;
    readonly LastConnectionErrorType: Text;
    readonly LastConnectionErrorCode: Text;
    readonly LastConnectionErrorDescription: Text;
    /** Returns the zone path of the indicated level. */
    GetZone(ZoneLevel: Integer): Text;
}
export declare const CMasterServerUser: Readonly<{
    readonly EMasterServerConnectionStatus: Readonly<{
        NotConnected: "CMasterServerUser::EMasterServerConnectionStatus::NotConnected";
        Connecting: "CMasterServerUser::EMasterServerConnectionStatus::Connecting";
        Connected: "CMasterServerUser::EMasterServerConnectionStatus::Connected";
        Disconnecting: "CMasterServerUser::EMasterServerConnectionStatus::Disconnecting";
    }>;
}>;
export declare namespace CMasterServerUser {
    type EMasterServerConnectionStatus = (typeof CMasterServerUser.EMasterServerConnectionStatus)[keyof typeof CMasterServerUser.EMasterServerConnectionStatus];
}
/** Asynchronous task result. Supported declare modes : - Local */
export interface CTaskResult_Connect extends CTaskResult {
}
/** Asynchronous task result. Supported declare modes : - Local */
export interface CTaskResult_Bool extends CTaskResult {
    readonly Value: Boolean;
}
/** Task result containing a list of friend info. Supported declare modes : - Local */
export interface CTaskResult_FriendList extends CWebServicesTaskResult_WSFriendList {
    /** List of friend info contained by this result. */
    FriendList: (CFriend | null)[];
}
/** Asynchronous task result. Supported declare modes : - Local */
export interface CTaskResult_Session_Get extends CTaskResult {
    readonly SessionId: Text;
    readonly ServerLogin: Text;
    readonly ServerPassword: Text;
}
/** Asynchronous task result. Supported declare modes : - Local */
export interface CTaskResult_UserNewsList extends CWebServicesTaskResult_WSNewsList {
    NewsList: (CNews | null)[];
}
/** Asynchronous task result. Supported declare modes : - Local */
export interface CTaskResult_UserPrestigeList extends CWebServicesTaskResult_WSUserPrestigeList {
    UserPrestigeList: (CUserPrestige | null)[];
}
/** Asynchronous task result. Supported declare modes : - Local */
export interface CTaskResult_UserPrestige extends CWebServicesTaskResult_WSUserPrestige {
    readonly UserPrestige: CUserPrestige | null;
    readonly HasUserPrestige: Boolean;
}
/** Asynchronous task result. Supported declare modes : - Local */
export interface CTaskResult_PrestigeList extends CWebServicesTaskResult_WSPrestigeList {
    PrestigeList: (CPrestige | null)[];
}
/** Task result containing a Squad Supported declare modes : - Local */
export interface CTaskResult_Squad extends CWebServicesTaskResult_Squad {
    /** Squad info contained by this result. */
    readonly Squad: CSquad | null;
}
/** Asynchronous task result. Supported declare modes : - Local */
export interface CTaskResult_StringInt extends CTaskResult {
    readonly Value: Text;
}
/** Results of task requesting the club tag of users. Supported declare modes : - Local */
export interface CTaskResult_ClubTagList extends CTaskResult {
    /** Get a club name for a webservices user id. Must be called after the task has succeeded. */
    GetClubTag(WebServicesUserId: Text): Text;
}
/** Task result containing a Notification Supported declare modes : - Local */
export interface CTaskResult_WSNotification extends CWebServicesTaskResult_WSNotification {
    /** Notification info contained by this result. */
    readonly Notification: CNotification | null;
}
/** Documentation for class CModuleMenu Supported declare modes : - Local - Persistent */
export interface CModuleMenu extends CManiaAppTitle {
    Menu_Goto(PageId: Text): Void;
    Menu_Back(): Void;
    Menu_Previous(): Void;
    Menu_Quit(): Void;
}
/** An event Supported declare modes : - Local */
export interface CManiaAppEvent extends CBaseConstEvent {
    readonly Type: CManiaAppEvent.EType;
    readonly CustomEventLayer: CUILayer | null;
    readonly CustomEventType: Text;
    CustomEventData: Text[];
    readonly ExternalEventType: Text;
    ExternalEventData: Text[];
    readonly MenuNavAction: CManiaAppEvent.EMenuNavAction;
    readonly IsActionAutoRepeat: Boolean;
    readonly KeyCode: Integer;
    readonly KeyName: Text;
}
export declare const CManiaAppEvent: Readonly<{
    readonly EType: Readonly<{
        LayerCustomEvent: "CManiaAppEvent::EType::LayerCustomEvent";
        KeyPress: "CManiaAppEvent::EType::KeyPress";
        ExternalCustomEvent: "CManiaAppEvent::EType::ExternalCustomEvent";
        MenuNavigation: "CManiaAppEvent::EType::MenuNavigation";
    }>;
    readonly EMenuNavAction: Readonly<{
        Up: "CManiaAppEvent::EMenuNavAction::Up";
        Right: "CManiaAppEvent::EMenuNavAction::Right";
        Left: "CManiaAppEvent::EMenuNavAction::Left";
        Down: "CManiaAppEvent::EMenuNavAction::Down";
        Select: "CManiaAppEvent::EMenuNavAction::Select";
        Cancel: "CManiaAppEvent::EMenuNavAction::Cancel";
        PageUp: "CManiaAppEvent::EMenuNavAction::PageUp";
        PageDown: "CManiaAppEvent::EMenuNavAction::PageDown";
        AppMenu: "CManiaAppEvent::EMenuNavAction::AppMenu";
        Action1: "CManiaAppEvent::EMenuNavAction::Action1";
        Action2: "CManiaAppEvent::EMenuNavAction::Action2";
        Action3: "CManiaAppEvent::EMenuNavAction::Action3";
        Action4: "CManiaAppEvent::EMenuNavAction::Action4";
        ScrollUp: "CManiaAppEvent::EMenuNavAction::ScrollUp";
        ScrollDown: "CManiaAppEvent::EMenuNavAction::ScrollDown";
    }>;
}>;
export declare namespace CManiaAppEvent {
    type EType = (typeof CManiaAppEvent.EType)[keyof typeof CManiaAppEvent.EType];
    type EMenuNavAction = (typeof CManiaAppEvent.EMenuNavAction)[keyof typeof CManiaAppEvent.EMenuNavAction];
}
/** API for titles in edition mode. */
export interface CTitleEdition extends CNod {
    readonly TitleMaker: CTitle | null;
    /** PackCreator - only available when the title author is the current logged user. */
    readonly PackCreator: CPackCreator | null;
    readonly EditedTitleId: Text;
    readonly EditedTitleInfo: CPackCreatorTitleInfo | null;
    readonly Dialog_IsFinished: Boolean;
    readonly Dialog_Success: Boolean;
    readonly Dialog_Aborted: Boolean;
    /** Will copy file 'FileName' from the UserDir to the TitleDir, including its dependencies. */
    File_ImportFromUser(FileName: Text): Void;
    /** Will move or copy file 'OrigName' to 'DestName'. If DestName is a '\' terminated folder path, keeps the orginial short name. */
    File_Move(OrigName: Text, DestNameOrFolder: Text, KeepOriginalCopy: Boolean): Void;
    File_Exists(FileName: Text, InDrive: CTitleEdition.EDrive): Boolean;
    File_Delete(Name: Text): Void;
    File_WriteText(FileName: Text, Text: Text): Void;
    File_ReadText(FileName: Text): Text;
    Dialog_ImportFiles(): Void;
    OpenTitleFolderInExplorer(): Void;
    ReloadTitleDesc(): Void;
    SaveTitleDesc(): Void;
    /** nb: The maps from the campaign are automatically added to the pack, no need to Build_AddFile(). */
    SetTitleCampaign(CampaignNum: Integer, ScoreContext: Text, MapsFolderNameOrPlayListName: Text, OfficialRecordEnabled: Boolean): Void;
    SetTitleCampaign(CampaignNum: Integer, ScoreContext: Text, MapsFolderNameOrPlayListName: Text, OfficialRecordEnabled: Boolean, DisableUnlockSystem: Boolean): Void;
}
export declare const CTitleEdition: Readonly<{
    readonly EDrive: Readonly<{
        TitleReadable: "CTitleEdition::EDrive::TitleReadable";
        Title: "CTitleEdition::EDrive::Title";
        User: "CTitleEdition::EDrive::User";
    }>;
}>;
export declare namespace CTitleEdition {
    type EDrive = (typeof CTitleEdition.EDrive)[keyof typeof CTitleEdition.EDrive];
}
/** Manager of buddies instant messaging. */
export interface CNotificationsConsumer extends CNod {
    /** Events */
    Events: (CNotificationsConsumerEvent | null)[];
    /** List of the Notifications. */
    Notifications: (CNotificationsConsumerNotification | null)[];
    FilteredNotifications: (CNotificationsConsumerNotification | null)[];
    Filter_Priority: CNotificationsConsumer.EFilterPriority;
}
export declare const CNotificationsConsumer: Readonly<{
    readonly EFilterPriority: Readonly<{
        All: "CNotificationsConsumer::EFilterPriority::All";
        MoreThanMemo: "CNotificationsConsumer::EFilterPriority::MoreThanMemo";
        MoreThanNotice: "CNotificationsConsumer::EFilterPriority::MoreThanNotice";
    }>;
}>;
export declare namespace CNotificationsConsumer {
    type EFilterPriority = (typeof CNotificationsConsumer.EFilterPriority)[keyof typeof CNotificationsConsumer.EFilterPriority];
}
/** Allows handling of match-settings files */
export interface CMatchSettingsManager extends CNod {
    readonly MatchSettings_EditScriptSettings_Ongoing: Boolean;
    /** Array of the matchsettings */
    MatchSettings: (CMatchSettings | null)[];
    MatchSettings_File: (CMatchSettings | null)[];
    MatchSettings_Temp: (CMatchSettings | null)[];
    /** Clear all matchsettings files and reload them from disk. Be aware that any non-saved changes will be lost. Temporary matchsettings are not changed. */
    MatchSettings_RefreshFiles(): Void;
    MatchSettings_FindFile(FilePath: Text): CMatchSettings | null;
    /** Create a new matchsettings file. */
    MatchSettings_CreateFile(FilePath: Text): CMatchSettings | null;
    /** Create a new temporary matchsettings. Those will be lost when the game is closed. */
    MatchSettings_CreateTemp(): CMatchSettings | null;
    /** Save a matchsettings file. */
    MatchSettings_Save(MatchSettings: CMatchSettings | null): Void;
    MatchSettings_ReloadFromFile(MatchSettings: CMatchSettings | null): Void;
    /** Save a matchsettings to a new file. */
    MatchSettings_SaveAs(FilePath: Text, MatchSettings: CMatchSettings | null): CMatchSettings | null;
    MatchSettings_EditScriptSettings(MatchSettings: CMatchSettings | null): Void;
    /** Remove a matchsetting file (or only the matchsetting for temp ones). */
    MatchSettings_Remove(MatchSettings: CMatchSettings | null): Void;
}
/** Documentation for class CVoiceChatConfig */
export interface CVoiceChatConfig {
    NewRemoteUser_DefaultMuteSetting: CGameUserVoiceChat.EMuteSetting;
    SyncMode: CVoiceChatConfig.ESyncMode;
    Manual_Channel: Text;
    Manual_ClearUsers(): Void;
    Manual_UserAdd_Proc(WebServicesUserId: Text): CGameUserVoiceChat | null;
}
export declare const CVoiceChatConfig: Readonly<{
    readonly ESyncMode: Readonly<{
        Default: "CVoiceChatConfig::ESyncMode::Default";
        Disabled: "CVoiceChatConfig::ESyncMode::Disabled";
        Manual: "CVoiceChatConfig::ESyncMode::Manual";
        Clan: "CVoiceChatConfig::ESyncMode::Clan";
        Squad: "CVoiceChatConfig::ESyncMode::Squad";
    }>;
}>;
export declare namespace CVoiceChatConfig {
    type ESyncMode = (typeof CVoiceChatConfig.ESyncMode)[keyof typeof CVoiceChatConfig.ESyncMode];
}
/** An event Supported declare modes : - Local */
export interface CMapEditorPluginEvent extends Omit<CManiaAppEvent, "Type"> {
    readonly Type: CMapEditorPluginEvent.Type;
    readonly Input: CMapEditorPluginEvent.EInput;
    readonly EditedAnchorDataId: Ident;
    readonly IsFromPad: Boolean;
    readonly IsFromMouse: Boolean;
    readonly IsFromKeyboard: Boolean;
    readonly OnlyScriptMetadataModified: Boolean;
    readonly MapSavedOrSaveCancelled: Boolean;
}
export declare const CMapEditorPluginEvent: Readonly<{
    readonly Type: Readonly<{
        LayerCustomEvent: "CMapEditorPluginEvent::Type::LayerCustomEvent";
        KeyPress: "CMapEditorPluginEvent::Type::KeyPress";
        MenuNavigation: "CMapEditorPluginEvent::Type::MenuNavigation";
        CursorSelectionBegin: "CMapEditorPluginEvent::Type::CursorSelectionBegin";
        CursorSelectionEnd: "CMapEditorPluginEvent::Type::CursorSelectionEnd";
        CursorChange: "CMapEditorPluginEvent::Type::CursorChange";
        MapModified: "CMapEditorPluginEvent::Type::MapModified";
        EditorInput: "CMapEditorPluginEvent::Type::EditorInput";
        MapSavedOrSaveCancelled: "CMapEditorPluginEvent::Type::MapSavedOrSaveCancelled";
        EditAnchor: "CMapEditorPluginEvent::Type::EditAnchor";
        EditObjectives: "CMapEditorPluginEvent::Type::EditObjectives";
        StartValidation: "CMapEditorPluginEvent::Type::StartValidation";
        StartTest: "CMapEditorPluginEvent::Type::StartTest";
    }>;
    readonly EInput: Readonly<{
        Unknown: "CMapEditorPluginEvent::EInput::Unknown";
        Menu: "CMapEditorPluginEvent::EInput::Menu";
        SwitchToRace: "CMapEditorPluginEvent::EInput::SwitchToRace";
        Undo: "CMapEditorPluginEvent::EInput::Undo";
        Redo: "CMapEditorPluginEvent::EInput::Redo";
        CursorUp: "CMapEditorPluginEvent::EInput::CursorUp";
        CursorRight: "CMapEditorPluginEvent::EInput::CursorRight";
        CursorDown: "CMapEditorPluginEvent::EInput::CursorDown";
        CursorLeft: "CMapEditorPluginEvent::EInput::CursorLeft";
        CursorRaise: "CMapEditorPluginEvent::EInput::CursorRaise";
        CursorLower: "CMapEditorPluginEvent::EInput::CursorLower";
        CursorTurn: "CMapEditorPluginEvent::EInput::CursorTurn";
        CursorTurnSlightly: "CMapEditorPluginEvent::EInput::CursorTurnSlightly";
        CursorTurnSlightlyAntiClockwise: "CMapEditorPluginEvent::EInput::CursorTurnSlightlyAntiClockwise";
        CursorTiltLeft: "CMapEditorPluginEvent::EInput::CursorTiltLeft";
        CursorTiltRight: "CMapEditorPluginEvent::EInput::CursorTiltRight";
        CursorPick: "CMapEditorPluginEvent::EInput::CursorPick";
        CursorPlace: "CMapEditorPluginEvent::EInput::CursorPlace";
        CursorDelete: "CMapEditorPluginEvent::EInput::CursorDelete";
        CameraUp: "CMapEditorPluginEvent::EInput::CameraUp";
        CameraRight: "CMapEditorPluginEvent::EInput::CameraRight";
        CameraDown: "CMapEditorPluginEvent::EInput::CameraDown";
        CameraLeft: "CMapEditorPluginEvent::EInput::CameraLeft";
        CameraZoomNext: "CMapEditorPluginEvent::EInput::CameraZoomNext";
        Camera0: "CMapEditorPluginEvent::EInput::Camera0";
        Camera1: "CMapEditorPluginEvent::EInput::Camera1";
        Camera3: "CMapEditorPluginEvent::EInput::Camera3";
        Camera7: "CMapEditorPluginEvent::EInput::Camera7";
        Camera9: "CMapEditorPluginEvent::EInput::Camera9";
        PivotChange: "CMapEditorPluginEvent::EInput::PivotChange";
        IconUp: "CMapEditorPluginEvent::EInput::IconUp";
        IconRight: "CMapEditorPluginEvent::EInput::IconRight";
        IconDown: "CMapEditorPluginEvent::EInput::IconDown";
        IconLeft: "CMapEditorPluginEvent::EInput::IconLeft";
        RemoveAll: "CMapEditorPluginEvent::EInput::RemoveAll";
        Save: "CMapEditorPluginEvent::EInput::Save";
        SelectAll: "CMapEditorPluginEvent::EInput::SelectAll";
        Copy: "CMapEditorPluginEvent::EInput::Copy";
        Cut: "CMapEditorPluginEvent::EInput::Cut";
        Paste: "CMapEditorPluginEvent::EInput::Paste";
    }>;
}>;
export declare namespace CMapEditorPluginEvent {
    type Type = (typeof CMapEditorPluginEvent.Type)[keyof typeof CMapEditorPluginEvent.Type];
    type EInput = (typeof CMapEditorPluginEvent.EInput)[keyof typeof CMapEditorPluginEvent.EInput];
}
/** Documentation for class CMacroblockInstance */
export interface CMacroblockInstance extends CNod {
    readonly MacroblockModel: CMacroblockModel | null;
    readonly ClipList: CBlockClipList | null;
    Dir: CMapEditorPlugin.CardinalDirections;
    readonly Coord: Int3;
    Order: Integer;
    UserData: Integer;
    UnitCoords: Int3[];
    readonly Color: CMapEditorPlugin.MapElemColor;
    readonly ForceMacroblockColor: Boolean;
    GetSize(): Int3;
}
/** Documentation for class CBlock */
export interface CBlock extends CNod {
    readonly CanHaveAnchor: Boolean;
    readonly Coord: Int3;
    readonly Dir: CMapEditorPlugin.CardinalDirections;
    readonly Direction: CBlock.CardinalDirections;
    BlockUnits: (CBlockUnit | null)[];
    readonly BlockModel: CBlockModel | null;
    UseDefaultAnchor(): Void;
    UseCustomAnchor(): Void;
    IsGhostBlock(): Boolean;
}
export declare const CBlock: Readonly<{
    readonly CardinalDirections: Readonly<{
        North: "CBlock::CardinalDirections::North";
        East: "CBlock::CardinalDirections::East";
        South: "CBlock::CardinalDirections::South";
        West: "CBlock::CardinalDirections::West";
    }>;
}>;
export declare namespace CBlock {
    type CardinalDirections = (typeof CBlock.CardinalDirections)[keyof typeof CBlock.CardinalDirections];
}
/** Documentation for class CItemAnchor */
export interface CItemAnchor extends CNod {
    readonly Position: Vec3;
    readonly ItemModel: CGameItemModel | null;
}
/** Landmark of a map. Supported declare modes : - Metadata */
export interface CAnchorData extends CNod {
    readonly DefaultTag: Text;
    readonly DefaultOrder: Integer;
    Tag: Text;
    Order: Integer;
    RuntimeCustomMarker: Text;
    readonly WaypointType: CAnchorData.EWaypointType;
    readonly Position: Vec3;
}
export declare const CAnchorData: Readonly<{
    readonly EWaypointType: Readonly<{
        Start: "CAnchorData::EWaypointType::Start";
        Finish: "CAnchorData::EWaypointType::Finish";
        Checkpoint: "CAnchorData::EWaypointType::Checkpoint";
        None: "CAnchorData::EWaypointType::None";
        StartFinish: "CAnchorData::EWaypointType::StartFinish";
        Dispenser: "CAnchorData::EWaypointType::Dispenser";
    }>;
}>;
export declare namespace CAnchorData {
    type EWaypointType = (typeof CAnchorData.EWaypointType)[keyof typeof CAnchorData.EWaypointType];
}
/** Documentation for class CMapEditorInventory */
export interface CMapEditorInventory extends CNod {
    readonly CurrentRootNode: CMapEditorInventoryDirectory | null;
    readonly CurrentDirectory: CMapEditorInventoryDirectory | null;
    readonly CurrentSelectedNode: CMapEditorInventoryNode | null;
    RootNodes: (CMapEditorInventoryNode | null)[];
    EnterDirectory(): Void;
    LeaveDirectory(): Void;
    SelectArticle(NodeArticle: CMapEditorInventoryArticle | null): Void;
    OpenDirectory(NodeDirectory: CMapEditorInventoryDirectory | null): Void;
    SelectNode(Node: CMapEditorInventoryNode | null): Void;
    OpenBrotherDirectory(NextOrElsePrevious: Boolean): Void;
    SelectBrotherArticle(NextOrElsePrevious: Boolean): Void;
    SelectBrotherNode(NextOrElsePrevious: Boolean): Void;
    GetDirectoryAfter(Node: CMapEditorInventoryNode | null): CMapEditorInventoryDirectory | null;
    GetDirectoryBefore(Node: CMapEditorInventoryNode | null): CMapEditorInventoryDirectory | null;
    GetArticleAfter(Node: CMapEditorInventoryNode | null): CMapEditorInventoryArticle | null;
    GetArticleBefore(Node: CMapEditorInventoryNode | null): CMapEditorInventoryArticle | null;
}
/** The model of a map block */
export interface CBlockModel extends CCollector {
    readonly Name: Text;
    readonly IsRoad: Boolean;
    readonly IsTerrain: Boolean;
    readonly IsPodium: Boolean;
    readonly WaypointType: CBlockModel.EWayPointType;
    readonly NoRespawn: Boolean;
    readonly IsClip: Boolean;
    readonly VariantGround: CBlockModelVariantGround | null;
    readonly VariantAir: CBlockModelVariantAir | null;
}
export declare const CBlockModel: Readonly<{
    readonly EWayPointType: Readonly<{
        Start: "CBlockModel::EWayPointType::Start";
        Finish: "CBlockModel::EWayPointType::Finish";
        Checkpoint: "CBlockModel::EWayPointType::Checkpoint";
        None: "CBlockModel::EWayPointType::None";
        StartFinish: "CBlockModel::EWayPointType::StartFinish";
        Dispenser: "CBlockModel::EWayPointType::Dispenser";
    }>;
}>;
export declare namespace CBlockModel {
    type EWayPointType = (typeof CBlockModel.EWayPointType)[keyof typeof CBlockModel.EWayPointType];
}
/** Documentation for class CMacroblockModel Supported declare modes : - Local - Metadata */
export interface CMacroblockModel extends CCollector {
    readonly IsGround: Boolean;
    readonly HasStart: Boolean;
    readonly HasFinish: Boolean;
    readonly HasCheckpoint: Boolean;
    readonly HasMultilap: Boolean;
    readonly GeneratedBlockModel: CBlockModel | null;
    readonly Name: Text;
    ClearScriptMetadata(): Void;
}
/** Documentation for class CGameItemModel */
export interface CGameItemModel extends CCollector {
}
/** Documentation for class CBlockClipList */
export interface CBlockClipList extends CNod {
    Clips: (CBlockClip | null)[];
    readonly Size: Int3;
    SetClipListFromMacroblock(MacroBlockModel: CMacroblockModel | null, Coord: Int3, Dir: CMapEditorPlugin.CardinalDirections): Boolean;
    SetClipListFromMacroblock(MacroBlockModel: CMacroblockModel | null): Boolean;
    SetClipListFromBlock(BlockModel: CBlockModel | null, Coord: Int3, Dir: CMapEditorPlugin.CardinalDirections): Boolean;
    SetClipListFromBlock(BlockModel: CBlockModel | null): Boolean;
    CreateAndAddClip(Name: Text, Coord: Int3, Offset: Int3, Dir: CMapEditorPlugin.CardinalDirections, ClipId: Integer): Void;
    SetFromClipList(ClipList: CBlockClipList | null, Coord: Int3, Dir: CMapEditorPlugin.CardinalDirections): Boolean;
    RemoveClip(Clip: CBlockClip | null): Void;
    ClearClips(): Void;
    Destroy(): Void;
}
/** Documentation for class CBlockClip */
export interface CBlockClip extends CNod {
    readonly Name: Text;
    Dir: CMapEditorPlugin.CardinalDirections;
    readonly Coord: Int3;
    readonly Offset: Int3;
    ClipId: Integer;
    GetConnectableCoord(): Int3;
}
/** Documentation for class CMapEditorCamera */
export interface CMapEditorCamera extends CNod {
    ReleaseLock(): Void;
    CenterOnCursor(): Void;
    CenterOnCursor(Smooth: Boolean): Void;
    WatchStart(): Void;
    WatchStart(Smooth: Boolean): Void;
    WatchClosestFinishLine(): Void;
    WatchClosestFinishLine(Smooth: Boolean): Void;
    WatchClosestCheckpoint(): Void;
    WatchClosestCheckpoint(Smooth: Boolean): Void;
    WatchWholeMap(): Void;
    WatchWholeMap(Smooth: Boolean): Void;
    WatchCustomSelection(): Void;
    WatchCustomSelection(WatchCustomSelection: Boolean): Void;
    MoveToMapCenter(): Void;
    MoveToMapCenter(Smooth: Boolean): Void;
    GetLock(): Boolean;
    CanUse(): Boolean;
    IgnoreCameraCollisions(IgnoreCameraCollisions: Boolean): Void;
    TurnH(Clockwise: Boolean): Void;
    TurnH(Clockwise: Boolean, HalfSteps: Boolean): Void;
    TurnH(Clockwise: Boolean, HalfSteps: Boolean, Smooth: Boolean): Void;
    TurnV(UpOrElseDown: Boolean): Void;
    TurnV(UpOrElseDown: Boolean, Smooth: Boolean): Void;
    Move(RelativeDir: CMapEditorPlugin.RelativeDirections): Void;
    FollowCursor(Follow: Boolean): Void;
    Watch(Block: CBlock | null): Void;
    Watch(Block: CBlock | null, Smooth: Boolean): Void;
    Watch(Macroblock: CMacroblockInstance | null): Void;
    Watch(Macroblock: CMacroblockInstance | null, Smooth: Boolean): Void;
    Watch(Clip: CBlockClip | null): Void;
    Watch(Clip: CBlockClip | null, Smooth: Boolean): Void;
    WatchMacroblocks(UserData: Integer): Void;
    WatchMacroblocks(UserData: Integer, Smooth: Boolean): Void;
    ZoomIn(Loop: Boolean): Void;
    ZoomIn(Loop: Boolean, Smooth: Boolean): Void;
    ZoomOut(Loop: Boolean): Void;
    ZoomOut(Loop: Boolean, Smooth: Boolean): Void;
    Zoom(Level: CMapEditorCamera.EZoomLevel): Void;
    Zoom(Level: CMapEditorCamera.EZoomLevel, Smooth: Boolean): Void;
    Look(Direction: CMapEditorPlugin.CardinalDirections8): Void;
    Look(Direction: CMapEditorPlugin.CardinalDirections8, Smooth: Boolean): Void;
    Look(Direction: CMapEditorPlugin.CardinalDirections): Void;
    Look(Direction: CMapEditorPlugin.CardinalDirections, Smooth: Boolean): Void;
    SetVStep(Step: CMapEditorCamera.ECameraVStep): Void;
    ActivateScrollRotateMode(ActivateScrollRotateMode: Boolean): Void;
}
export declare const CMapEditorCamera: Readonly<{
    readonly EZoomLevel: Readonly<{
        Close: "CMapEditorCamera::EZoomLevel::Close";
        Medium: "CMapEditorCamera::EZoomLevel::Medium";
        Far: "CMapEditorCamera::EZoomLevel::Far";
    }>;
    readonly ECameraVStep: Readonly<{
        Low: "CMapEditorCamera::ECameraVStep::Low";
        MediumLow: "CMapEditorCamera::ECameraVStep::MediumLow";
        Medium: "CMapEditorCamera::ECameraVStep::Medium";
        MediumHigh: "CMapEditorCamera::ECameraVStep::MediumHigh";
        High: "CMapEditorCamera::ECameraVStep::High";
    }>;
}>;
export declare namespace CMapEditorCamera {
    type EZoomLevel = (typeof CMapEditorCamera.EZoomLevel)[keyof typeof CMapEditorCamera.EZoomLevel];
    type ECameraVStep = (typeof CMapEditorCamera.ECameraVStep)[keyof typeof CMapEditorCamera.ECameraVStep];
}
/** Documentation for class CMapEditorCursor */
export interface CMapEditorCursor extends CNod {
    Coord: Int3;
    Dir: CMapEditorPlugin.CardinalDirections;
    BlockModel: CBlockModel | null;
    TerrainBlockModel: CBlockModel | null;
    MacroblockModel: CMacroblockModel | null;
    Brightness: Real;
    HideDirectionalArrow: Boolean;
    ReleaseLock(): Void;
    MoveToCameraTarget(): Void;
    ResetCustomRGB(): Void;
    GetLock(): Boolean;
    CanUse(): Boolean;
    Raise(): Boolean;
    Lower(): Boolean;
    FollowCameraTarget(Follow: Boolean): Void;
    Rotate(CWOrCCW: Boolean): Void;
    Move(CardinalDir: CMapEditorPlugin.CardinalDirections): Void;
    Move(CardinalDir8: CMapEditorPlugin.CardinalDirections8): Void;
    Move(RelativeDir: CMapEditorPlugin.RelativeDirections): Void;
    DisableMouseDetection(Disable: Boolean): Void;
    CanPlace(): Boolean;
    IsCustomRGBActivated(): Boolean;
    IsCurrentItemAnimated(): Boolean;
    CurrentMacroblockHasAnimatedItem(): Boolean;
    CurrentSelectionHasAnimatedItem(): Boolean;
    SetCustomRGB(Color: Vec3): Void;
}
/** Documentation for class CMapEditorConnectResults */
export interface CMapEditorConnectResults extends CNod {
    CanPlace: Boolean;
    Coord: Int3;
    Dir: CMapEditorPlugin.CardinalDirections;
}
/** Documentation for class CUIConfigMarker */
export interface CUIConfigMarker extends CNod {
    readonly Type: CUIConfigMarker.EAnchorType;
    IsTurning: Boolean;
    ShowArmor: Boolean;
    Label: Text;
    Box: Vec3;
    Icon: Text;
    Color: Vec3;
    ImageUrl: Text;
    ManialinkFrameId: Text;
    DistMin: Real;
    /** DistMax is not used to fade out the marker when spectating */
    DistMax: Real;
    MiniMapVisibility: CUIConfigMarker.EMiniMapVisibility;
    HudVisibility: CUIConfigMarker.EHudVisibility;
    /** Hide the marker if it is on the current player. Only if Type is EAnchorType::Player . */
    HideOnSelf: Boolean;
    Gauge: Real;
}
export declare const CUIConfigMarker: Readonly<{
    readonly EAnchorType: Readonly<{
        Invalid: "CUIConfigMarker::EAnchorType::Invalid";
        Position: "CUIConfigMarker::EAnchorType::Position";
        Player: "CUIConfigMarker::EAnchorType::Player";
        Entity: "CUIConfigMarker::EAnchorType::Entity";
        Landmark: "CUIConfigMarker::EAnchorType::Landmark";
        GhostInstance: "CUIConfigMarker::EAnchorType::GhostInstance";
    }>;
    readonly EMiniMapVisibility: Readonly<{
        Never: "CUIConfigMarker::EMiniMapVisibility::Never";
        Always: "CUIConfigMarker::EMiniMapVisibility::Always";
        WhenInFrame: "CUIConfigMarker::EMiniMapVisibility::WhenInFrame";
    }>;
    readonly EHudVisibility: Readonly<{
        Never: "CUIConfigMarker::EHudVisibility::Never";
        Always: "CUIConfigMarker::EHudVisibility::Always";
        WhenInFrustum: "CUIConfigMarker::EHudVisibility::WhenInFrustum";
        WhenVisible: "CUIConfigMarker::EHudVisibility::WhenVisible";
        WhenInMiddleOfScreen: "CUIConfigMarker::EHudVisibility::WhenInMiddleOfScreen";
    }>;
}>;
export declare namespace CUIConfigMarker {
    type EAnchorType = (typeof CUIConfigMarker.EAnchorType)[keyof typeof CUIConfigMarker.EAnchorType];
    type EMiniMapVisibility = (typeof CUIConfigMarker.EMiniMapVisibility)[keyof typeof CUIConfigMarker.EMiniMapVisibility];
    type EHudVisibility = (typeof CUIConfigMarker.EHudVisibility)[keyof typeof CUIConfigMarker.EHudVisibility];
}
/** Documentation for class CMapLandmark Supported declare modes : - Local - Metadata */
export interface CMapLandmark extends CNod {
    /** Use this instead of Id when filling CUIConfig.MarkersXML */
    readonly MarkerId: Ident;
    readonly Tag: Text;
    readonly Order: Integer;
    readonly Position: Vec3;
    readonly Sector: CMapSector | null;
    readonly Waypoint: CMapWaypoint | null;
    readonly PlayerSpawn: CMapSpawn | null;
    readonly BotPath: CMapBotPath | null;
    readonly BotSpawn: CMapBotSpawn | null;
    readonly ObjectAnchor: CMapObjectAnchor | null;
}
/** UIConfig Event Supported declare modes : - Local */
export interface CUIConfigEvent extends CBaseEvent {
    readonly Type: CUIConfigEvent.EType;
    readonly UI: CUIConfig | null;
    readonly ModuleType: CUIConfigEvent.EModuleType;
    readonly Param1: Text;
    Param2: Text[];
    readonly CustomEventLayer: CUILayer | null;
    readonly CustomEventType: Text;
    CustomEventData: Text[];
    readonly ItemUrl: Text;
    readonly Quantity: Integer;
}
export declare const CUIConfigEvent: Readonly<{
    readonly EType: Readonly<{
        Unknown: "CUIConfigEvent::EType::Unknown";
        OnModuleCustomEvent: "CUIConfigEvent::EType::OnModuleCustomEvent";
        OnModuleShowRequest: "CUIConfigEvent::EType::OnModuleShowRequest";
        OnModuleHideRequest: "CUIConfigEvent::EType::OnModuleHideRequest";
        OnModuleStorePurchase: "CUIConfigEvent::EType::OnModuleStorePurchase";
        OnModuleInventoryDrop: "CUIConfigEvent::EType::OnModuleInventoryDrop";
        OnModuleInventoryEquip: "CUIConfigEvent::EType::OnModuleInventoryEquip";
        OnLayerCustomEvent: "CUIConfigEvent::EType::OnLayerCustomEvent";
    }>;
    readonly EModuleType: Readonly<{
        Undefined: "CUIConfigEvent::EModuleType::Undefined";
        Hud: "CUIConfigEvent::EModuleType::Hud";
        Inventory: "CUIConfigEvent::EModuleType::Inventory";
        Store: "CUIConfigEvent::EModuleType::Store";
        ScoresTable: "CUIConfigEvent::EModuleType::ScoresTable";
        Equipment: "CUIConfigEvent::EModuleType::Equipment";
        MenuBase: "CUIConfigEvent::EModuleType::MenuBase";
        MenuPage: "CUIConfigEvent::EModuleType::MenuPage";
        Chrono: "CUIConfigEvent::EModuleType::Chrono";
        SpeedMeter: "CUIConfigEvent::EModuleType::SpeedMeter";
        PlayerState: "CUIConfigEvent::EModuleType::PlayerState";
        TeamState: "CUIConfigEvent::EModuleType::TeamState";
    }>;
}>;
export declare namespace CUIConfigEvent {
    type EType = (typeof CUIConfigEvent.EType)[keyof typeof CUIConfigEvent.EType];
    type EModuleType = (typeof CUIConfigEvent.EModuleType)[keyof typeof CUIConfigEvent.EModuleType];
}
/** Documentation for class CServerInfo */
export interface CServerInfo extends CNod {
    readonly ServerName: Text;
    readonly ServerLogin: Text;
    readonly JoinLink: Text;
    readonly Comment: Text;
    readonly ServerVersionBuild: Text;
    readonly PlayerCount: Integer;
    readonly MaxPlayerCount: Integer;
    readonly SpectatorCount: Integer;
    readonly MaxSpectatorCount: Integer;
    readonly PlayersLevelMin: Real;
    readonly PlayersLevelAvg: Real;
    readonly PlayersLevelMax: Real;
    readonly ModeName: Text;
    readonly LadderServerLimitMax: Real;
    readonly LadderServerLimitMin: Real;
    PlayerNames: Text[];
    ChallengeNames: Text[];
    ChallengeIds: Text[];
    readonly NbChallenges: Integer;
    readonly HasBuddies: Boolean;
    readonly IsFavourite: Boolean;
    readonly IsLobbyServer: Boolean;
    readonly IsPrivate: Boolean;
    readonly IsPrivateForSpectator: Boolean;
    readonly IsMapDownloadAllowed: Boolean;
    readonly IsTeamMode: Boolean;
    readonly IsDisableChangeTeams: Boolean;
    readonly SendToServerAfterMatchUrl: Text;
    readonly ViewerCount: Integer;
}
/** An event Supported declare modes : - Local */
export interface CXmlRpcEvent extends CBaseConstEvent {
    readonly Type: CXmlRpcEvent.EType;
    readonly Param1: Text;
    readonly Param2: Text;
    readonly ParamArray1: Text;
    ParamArray2: Text[];
}
export declare const CXmlRpcEvent: Readonly<{
    readonly EType: Readonly<{
        Unknown: "CXmlRpcEvent::EType::Unknown";
        Callback: "CXmlRpcEvent::EType::Callback";
        CallbackArray: "CXmlRpcEvent::EType::CallbackArray";
    }>;
}>;
export declare namespace CXmlRpcEvent {
    type EType = (typeof CXmlRpcEvent.EType)[keyof typeof CXmlRpcEvent.EType];
}
/** Description of a race run. */
export interface CTmRaceResultNod extends CNod {
    Time: Integer;
    Score: Integer;
    NbRespawns: Integer;
    SpawnLandmarkId: Ident;
    Checkpoints: Integer[];
    CheckpointLandmarkIds: Ident[];
    Compare(Other: CTmRaceResultNod | null, Criteria: CTmRaceResultNod.ETmRaceResultCriteria): Integer;
}
export declare const CTmRaceResultNod: Readonly<{
    readonly ETmRaceResultCriteria: Readonly<{
        Time: "CTmRaceResultNod::ETmRaceResultCriteria::Time";
        Stunts: "CTmRaceResultNod::ETmRaceResultCriteria::Stunts";
        NbRespawns: "CTmRaceResultNod::ETmRaceResultCriteria::NbRespawns";
        CheckpointsProgress: "CTmRaceResultNod::ETmRaceResultCriteria::CheckpointsProgress";
        None: "CTmRaceResultNod::ETmRaceResultCriteria::None";
    }>;
}>;
export declare namespace CTmRaceResultNod {
    type ETmRaceResultCriteria = (typeof CTmRaceResultNod.ETmRaceResultCriteria)[keyof typeof CTmRaceResultNod.ETmRaceResultCriteria];
}
/** Documentation for class CNotification */
export interface CNotification extends CNod {
    readonly Type: Text;
}
/** Documentation for class CModulePlaygroundHud */
export interface CModulePlaygroundHud extends CNod {
    Inventory: CModulePlaygroundInventory | null;
    Store: CModulePlaygroundStore | null;
    ScoresTable: CModulePlaygroundScoresTable | null;
    Chrono: CModulePlaygroundChrono | null;
    SpeedMeter: CModulePlaygroundSpeedMeter | null;
    PlayerState: CModulePlaygroundPlayerState | null;
    TeamState: CModulePlaygroundTeamState | null;
    Modules: (CModulePlayground | null)[];
    SwitchContext(Player: CPlayer | null, ContextName: Text): Void;
    SetDefaultContext(Player: CPlayer | null): Void;
    RetrieveModuleId(ModuleName: Text): Ident;
}
/** Task result containing a list of account trophy gain. Supported declare modes : - Local */
export interface CTaskResult_AccountTrophyGainList extends CWebServicesTaskResult_AccountTrophyGainList {
    /** List of account trophy gain contained in this result. */
    AccountTrophyGainList: (CAccountTrophyGain | null)[];
}
/** Documentation for class CModeTurretManager */
export interface CModeTurretManager extends CNod {
    Turrets: (CModeTurret | null)[];
    MapTurrets_Reset(): Void;
    Turret_Create(ModelId: Ident, Position: Vec3, Direction: Vec3, Clan: Integer, OwnerPlayer: CPlayer | null): CModeTurret | null;
    Turret_CreateWithOwner(ModelId: Ident, Position: Vec3, Direction: Vec3, Up: Vec3, Clan: Integer, OwnerId: Ident): CModeTurret | null;
    Turret_CreateWithOwner(ModelId: Ident, Position: Vec3, Direction: Vec3, Up: Vec3, Clan: Integer, OwnerId: Ident, AutoAimOn: Boolean, AutoTriggerOn: Boolean): CModeTurret | null;
    Turret_GetPosition(Turret: CModeTurret | null): Vec3;
    Turret_Destroy(Turret: CModeTurret | null): Void;
    Turret_DestroyAll(): Void;
    Turret_Activate(Turret: CModeTurret | null): Void;
    Turret_Deactivate(Turret: CModeTurret | null): Void;
    Turret_SetIsAutomatic(Turret: CModeTurret | null, IsAuto: Boolean): Void;
    Turret_Auto_SetAimAnticipation(Turret: CModeTurret | null, AimAnticipationMs: Real): Void;
    Turret_Auto_SetFirePeriod(Turret: CModeTurret | null, FirePeriodMs: Integer): Void;
    Turret_Auto_SetTargetDetectionFov(Turret: CModeTurret | null, DectectionFOVDeg: Real): Void;
    Turret_Auto_SetTargetDetectionRadius(Turret: CModeTurret | null, DetectionRadius: Real): Void;
    Turret_Manual_SetTargetPos(Turret: CModeTurret | null, TargetPos: Vec3): Void;
    Turret_Manual_Fire(Turret: CModeTurret | null): Void;
}
/** Documentation for class CModeVehicleManager */
export interface CModeVehicleManager extends CNod {
    Vehicles: (CModeVehicle | null)[];
    MapVehicles_Reset(): Void;
    DestroyAllVehicles(): Void;
    Vehicle_Create(ModelId: Ident, Clan: Integer, Armor: Integer, ArmorUse: CModeVehicleManager.EArmorUse, Spawn: CMapSpawn | null): CModeVehicle | null;
    Vehicle_Create(ModelId: Ident, Offset: Vec3, Armor: Integer, ArmorUse: CModeVehicleManager.EArmorUse, Owner: CModeVehicle | null): CModeVehicle | null;
    Vehicle_Destroy(Vehicle: CModeVehicle | null): Void;
    Vehicle_Assign_AutoPilot(Vehicle: CModeVehicle | null, ModelName: Text): Void;
    Vehicle_Assign_AutoPilot(Vehicle: CModeVehicle | null, ModelName: Text, LoopPath: Boolean): Void;
    Vehicle_SetTrailVisible(Vehicle: CModeVehicle | null, IsVisible: Boolean): Void;
    Vehicle_SetShieldVisible(Vehicle: CModeVehicle | null, IsVisible: Boolean): Void;
    VehicleModel_GetSlotsCount(ModelId: Ident, SlotType: CModeVehicleManager.ESlotType): Integer;
}
export declare const CModeVehicleManager: Readonly<{
    readonly EArmorUse: Readonly<{
        Self: "CModeVehicleManager::EArmorUse::Self";
        Group: "CModeVehicleManager::EArmorUse::Group";
        Owner: "CModeVehicleManager::EArmorUse::Owner";
        Children: "CModeVehicleManager::EArmorUse::Children";
        Mine: "CModeVehicleManager::EArmorUse::Mine";
    }>;
    readonly ESlotType: Readonly<{
        Driver: "CModeVehicleManager::ESlotType::Driver";
        Passenger: "CModeVehicleManager::ESlotType::Passenger";
    }>;
}>;
export declare namespace CModeVehicleManager {
    type EArmorUse = (typeof CModeVehicleManager.EArmorUse)[keyof typeof CModeVehicleManager.EArmorUse];
    type ESlotType = (typeof CModeVehicleManager.ESlotType)[keyof typeof CModeVehicleManager.ESlotType];
}
/** Documentation for class CActionManager */
export interface CActionManager extends CNod {
    Actions: (CActionInterface | null)[];
    Action_GetState(Player: CPlayer | null, Slot: CActionManager.EActionSlot): CActionInterface | null;
    Action_GetState(Vehicle: CModeVehicle | null, VehicleSlotIndex: Integer, Slot: CActionManager.EActionSlot): CActionInterface | null;
    Action_GetState(Turret: CModeTurret | null, Slot: CActionManager.EActionSlot): CActionInterface | null;
}
export declare const CActionManager: Readonly<{
    readonly EActionSlot: Readonly<{
        Slot_A: "CActionManager::EActionSlot::Slot_A";
        Slot_B: "CActionManager::EActionSlot::Slot_B";
        Slot_C: "CActionManager::EActionSlot::Slot_C";
        Slot_D: "CActionManager::EActionSlot::Slot_D";
        Slot_E: "CActionManager::EActionSlot::Slot_E";
        Slot_F: "CActionManager::EActionSlot::Slot_F";
        Slot_G: "CActionManager::EActionSlot::Slot_G";
        Slot_H: "CActionManager::EActionSlot::Slot_H";
    }>;
}>;
export declare namespace CActionManager {
    type EActionSlot = (typeof CActionManager.EActionSlot)[keyof typeof CActionManager.EActionSlot];
}
/** Asynchronous task result. Supported declare modes : - Local */
export interface CWebServicesTaskResult_GhostDriver_UploadLimits extends CTaskResult {
    Limits: (CTaskResult_GhostDriver_UploadLimit | null)[];
}
/** Asynchronous task result. Supported declare modes : - Local */
export interface CWebServicesTaskResult_GhostDriver_Download extends CTaskResult {
    Teams: (CTaskResult_GhostDriverDownload_Team | null)[];
}
/** API for ShootMania bots */
export interface CSmPlayerDriver extends CNod {
    Behaviour: CSmPlayerDriver.ESmDriverBehaviour;
    PursueTarget: Boolean;
    AggroRadius: Real;
    ShootRadius: Real;
    TargetMinDistance: Real;
    DisengageDistance: Real;
    PathSpeedCoef: Real;
    Accuracy: Real;
    ReactionTime: Integer;
    ShootPeriodMin: Integer;
    ShootPeriodMax: Integer;
    RocketAnticipation: Boolean;
    /** The field of view angle the driver uses to search for targets. Value in degrees.Values in range (0.000000-360.000000) */
    TargetDetectionFov: Real;
    AttackFilter: CSmPlayerDriver.ESmAttackFilter;
    readonly Target: CSmPlayer | null;
    readonly IsStuck: Boolean;
    /** PathFinding takes some time to compute and doesn't always reach the intended goal. The player will most probably reach the goal in the case CSmPlayerDriver::ESmDriverPathState::Full. */
    readonly PathState: CSmPlayerDriver.ESmDriverPathState;
    readonly Owner: CSmPlayer | null;
    Patrol_Mode: CSmPlayerDriver.ESmDriverPatrolMode;
    Patrol_Path: CMapBotPath | null;
    /** Note that CSmMode::SpawnPlayer and CSmMode::SpawnBotPlayer may reset this value to the spawn position. */
    Escape_AnchorPoint: Vec3;
    Escape_DistanceSafe: Real;
    Escape_DistanceMinEscape: Real;
    Escape_DistanceMaxEscape: Real;
    /** Note that CSmMode::SpawnPlayer and CSmMode::SpawnBotPlayer may reset this value to the spawn position. */
    Saunter_AnchorPoint: Vec3;
    Saunter_BaseChillingTime: Integer;
    Saunter_ChillingTimeDelta: Integer;
    Saunter_Radius: Real;
    /** Note that CSmMode::SpawnPlayer and CSmMode::SpawnBotPlayer may reset this value to the spawn position. */
    Orbit_AnchorPoint: Vec3;
    Orbit_Radius: Real;
    Orbit_IsClockWise: Boolean;
    Scripted_ForceAimInMoveDir: Boolean;
    Follow_Offset: Vec3;
    Follow_ForceAimInLeaderDir: Boolean;
    Follow_HasLeader: Boolean;
    Follow_Leader: CSmPlayer | null;
    Follow_AnchorPoint: Vec3;
    ForcedTarget: CSmPlayer | null;
    TargetsToAvoid: (CSmPlayer | null)[];
    PredictJump: Boolean;
    UsePathFinding: Boolean;
    OnStuckInput: CSmMode.EActionInput;
    MaxPathDivergence: Real;
    /** If larger than 0.0, this bot can attack destructible parts of the world. */
    TargetWorldRadius: Real;
    /** How much the driver value attacking the world rather than players. 0.0 for players only, 1.0 for world only, 0.5 for no preference.Values in range (0.000000-1.000000) */
    TargetWorldPriority: Real;
    /** How long the driver will try to chase its target after it can't see it, 0 to disable. */
    LostTargetChaseDuration: Integer;
    /** Flocking is a work in progress. You need to fill this array and define a default behaviour for each member of the flock. */
    FlockPartners: (CSmPlayerDriver | null)[];
    /** Flocking is a work in progress. How far the driver see its neighbours. */
    FlockRadius: Real;
    /** Flocking is a work in progress. The field of view angle the driver uses to see its neighbours. Value in degrees.Values in range (0.000000-360.000000) */
    FlockFov: Real;
    /** Flocking is a work in progress. How much the driver values going towards its neighbours. */
    FlockCohesionWeight: Real;
    /** Flocking is a work in progress. How much the driver values going the same direction as its neighbours. */
    FlockAlignmentWeight: Real;
    /** Flocking is a work in progress. How much the driver values not hitting its neighbours. */
    FlockSeparationWeight: Real;
    Scripted_Move(Goal: Vec3): Void;
    Scripted_MoveDelta(Delta: Vec3): Void;
    Scripted_MoveAndAim(Goal: Vec3): Void;
    Scripted_MoveDeltaAndAim(Delta: Vec3): Void;
    Scripted_Aim(Goal: Vec3): Void;
    Scripted_AimDelta(DeltaYaw: Real, DeltaPitch: Real): Void;
    /** Same as Scripted_RequestInput(CSmMode::EActionInput::Movement). */
    Scripted_RequestAction(): Void;
    /** Same as Scripted_RequestInput(CSmMode::EActionInput::Weapon). This has no effect when ForcedTarget is not Null. */
    Scripted_RequestGunTrigger(): Void;
    Scripted_RequestInput(Input: CSmMode.EActionInput): Void;
}
export declare const CSmPlayerDriver: Readonly<{
    readonly ESmDriverBehaviour: Readonly<{
        Static: "CSmPlayerDriver::ESmDriverBehaviour::Static";
        Turret: "CSmPlayerDriver::ESmDriverBehaviour::Turret";
        Scripted: "CSmPlayerDriver::ESmDriverBehaviour::Scripted";
        IA: "CSmPlayerDriver::ESmDriverBehaviour::IA";
        Patrol: "CSmPlayerDriver::ESmDriverBehaviour::Patrol";
        Escape: "CSmPlayerDriver::ESmDriverBehaviour::Escape";
        Saunter: "CSmPlayerDriver::ESmDriverBehaviour::Saunter";
        Orbit: "CSmPlayerDriver::ESmDriverBehaviour::Orbit";
        Follow: "CSmPlayerDriver::ESmDriverBehaviour::Follow";
    }>;
    readonly ESmDriverPathState: Readonly<{
        Static: "CSmPlayerDriver::ESmDriverPathState::Static";
        None: "CSmPlayerDriver::ESmDriverPathState::None";
        Computing: "CSmPlayerDriver::ESmDriverPathState::Computing";
        Simple: "CSmPlayerDriver::ESmDriverPathState::Simple";
        Full: "CSmPlayerDriver::ESmDriverPathState::Full";
        Incomplete: "CSmPlayerDriver::ESmDriverPathState::Incomplete";
        InFlock: "CSmPlayerDriver::ESmDriverPathState::InFlock";
    }>;
    readonly ESmDriverPatrolMode: Readonly<{
        OneTrip: "CSmPlayerDriver::ESmDriverPatrolMode::OneTrip";
        BackAndForth: "CSmPlayerDriver::ESmDriverPatrolMode::BackAndForth";
        Loop: "CSmPlayerDriver::ESmDriverPatrolMode::Loop";
    }>;
    readonly ESmAttackFilter: Readonly<{
        All: "CSmPlayerDriver::ESmAttackFilter::All";
        AllPlayers: "CSmPlayerDriver::ESmAttackFilter::AllPlayers";
        AllBots: "CSmPlayerDriver::ESmAttackFilter::AllBots";
        AllOpposite: "CSmPlayerDriver::ESmAttackFilter::AllOpposite";
        OppositePlayers: "CSmPlayerDriver::ESmAttackFilter::OppositePlayers";
        OppositeBots: "CSmPlayerDriver::ESmAttackFilter::OppositeBots";
        Nobody: "CSmPlayerDriver::ESmAttackFilter::Nobody";
    }>;
}>;
export declare namespace CSmPlayerDriver {
    type ESmDriverBehaviour = (typeof CSmPlayerDriver.ESmDriverBehaviour)[keyof typeof CSmPlayerDriver.ESmDriverBehaviour];
    type ESmDriverPathState = (typeof CSmPlayerDriver.ESmDriverPathState)[keyof typeof CSmPlayerDriver.ESmDriverPathState];
    type ESmDriverPatrolMode = (typeof CSmPlayerDriver.ESmDriverPatrolMode)[keyof typeof CSmPlayerDriver.ESmDriverPatrolMode];
    type ESmAttackFilter = (typeof CSmPlayerDriver.ESmAttackFilter)[keyof typeof CSmPlayerDriver.ESmAttackFilter];
}
/** An event Supported declare modes : - Local */
export interface CBaseEvent extends CBaseConstEvent {
    readonly HasBeenPassed: Boolean;
    readonly HasBeenDiscarded: Boolean;
}
/** Documentation for class CSmMapGate */
export interface CSmMapGate extends CNod {
    Clan: Integer;
    Automatic: Boolean;
    ManualClosed: Boolean;
    readonly AutoClosed: Boolean;
    AutoIsActive: Boolean;
    AutoCloseDelay: Integer;
    AutoOpenSpeed: Integer;
}
/** Documentation for class CSmMapGauge */
export interface CSmMapGauge extends CNod {
    Clan: Integer;
    /** Values in range (0.000000-1.000000) */
    ValueReal: Real;
    Value: Integer;
    Max: Integer;
    Speed: Integer;
    Captured: Boolean;
}
/** Documentation for class CMapObjectAnchor */
export interface CMapObjectAnchor extends CNod {
    readonly ItemName: Text;
    readonly ItemModelId: Ident;
}
/** API for plugins to get playground info. Supported declare modes : - Local - Persistent */
export interface CPlaygroundClient extends CNod {
    /** Null when no map loaded. */
    readonly Map: CMap | null;
    readonly GameTime: Integer;
    readonly LocalUser: CUser | null;
    readonly UI: CUIConfig | null;
    readonly ServerInfo: CServerInfo | null;
    readonly SettingsPlayerModelId: Ident;
    readonly HasPodium: Boolean;
    /** Is in spectator mode - may be only for a short time between rounds. */
    readonly IsSpectator: Boolean;
    /** Client actually desires to spectate instead of playing. */
    readonly IsSpectatorClient: Boolean;
    readonly UseClans: Boolean;
    readonly UseForcedClans: Boolean;
    readonly IsLoadingScreen: Boolean;
    readonly IsServerOrSolo: Boolean;
    readonly IsInGameMenuDisplayed: Boolean;
    Teams: (CTeam | null)[];
    readonly MapList_IsInProgress: Boolean;
    MapList_Names: Text[];
    MapList_MapUids: Text[];
    readonly Request_IsInProgress: Boolean;
    readonly Request_Success: Boolean;
    readonly Vote_Question: Text;
    readonly Vote_CanVote: Boolean;
    QuitServer(Silent: Boolean): Void;
    QuitServerAndSetResult(Silent: Boolean, Type: Text, Data: Text[]): Void;
    JoinTeam1(): Void;
    JoinTeam2(): Void;
    /** Request change of IsSpectatorClient (not immediate, and it may be refused). Caveat: will not set Request_Success */
    RequestSpectatorClient(Spectator: Boolean): Void;
    SetSpectateTarget(Player: Text): Void;
    ShowProfile(Player: Text): Void;
    /** Save the current replay to a file. Filename is optional. */
    SaveReplay(FileName: Text): Boolean;
    SavePrevReplay(FileName: Text): Boolean;
    /** Save the current map to a file (if the server IsMapDownloadAllowed). Filename is optional. */
    SaveMap(FileName: Text): Boolean;
    MapList_Request(): Void;
    GetSpectatorCameraType(): CPlaygroundClient.ESpectatorCameraType;
    GetSpectatorTargetType(): CPlaygroundClient.ESpectatorTargetType;
    SetWantedSpectatorCameraType(CameraType: CPlaygroundClient.ESpectatorCameraType): Void;
    RequestRestartMap(): Void;
    RequestNextMap(): Void;
    RequestGotoMap(MapUid: Text): Void;
    RequestSetNextMap(MapUid: Text): Void;
    RequestAutoTeamBalance(): Void;
    /** Change some settings from the mode with new values. No need to include unchanged settings. ex: '&lt;script_settings&gt;&lt;setting name="S_TimeLimit" type="integer" value="300"/&gt;&lt;script_settings/&gt;' nb: you can use TriggerPageAction('maniaplanet:editsettings'); to use the legacy UI. */
    RequestChangeModeScriptSettings(SettingsXml: Text): Void;
    Vote_Cast(Answer: Boolean): Void;
}
export declare const CPlaygroundClient: Readonly<{
    readonly ESpectatorCameraType: Readonly<{
        Replay: "CPlaygroundClient::ESpectatorCameraType::Replay";
        Follow: "CPlaygroundClient::ESpectatorCameraType::Follow";
        Free: "CPlaygroundClient::ESpectatorCameraType::Free";
        StandardCount: "CPlaygroundClient::ESpectatorCameraType::StandardCount";
        NotUsed0: "CPlaygroundClient::ESpectatorCameraType::NotUsed0";
        NotUsed1: "CPlaygroundClient::ESpectatorCameraType::NotUsed1";
        NotUsed2: "CPlaygroundClient::ESpectatorCameraType::NotUsed2";
        NotUsed3: "CPlaygroundClient::ESpectatorCameraType::NotUsed3";
        NotUsed4: "CPlaygroundClient::ESpectatorCameraType::NotUsed4";
        NotUsed5: "CPlaygroundClient::ESpectatorCameraType::NotUsed5";
        NotUsed6: "CPlaygroundClient::ESpectatorCameraType::NotUsed6";
        NotUsed7: "CPlaygroundClient::ESpectatorCameraType::NotUsed7";
        NotUsed8: "CPlaygroundClient::ESpectatorCameraType::NotUsed8";
        NotUsed9: "CPlaygroundClient::ESpectatorCameraType::NotUsed9";
        FollowForced: "CPlaygroundClient::ESpectatorCameraType::FollowForced";
        DontChange: "CPlaygroundClient::ESpectatorCameraType::DontChange";
    }>;
    readonly ESpectatorTargetType: Readonly<{
        None: "CPlaygroundClient::ESpectatorTargetType::None";
        Single: "CPlaygroundClient::ESpectatorTargetType::Single";
        AllPlayers: "CPlaygroundClient::ESpectatorTargetType::AllPlayers";
        AllMap: "CPlaygroundClient::ESpectatorTargetType::AllMap";
    }>;
}>;
export declare namespace CPlaygroundClient {
    type ESpectatorCameraType = (typeof CPlaygroundClient.ESpectatorCameraType)[keyof typeof CPlaygroundClient.ESpectatorCameraType];
    type ESpectatorTargetType = (typeof CPlaygroundClient.ESpectatorTargetType)[keyof typeof CPlaygroundClient.ESpectatorTargetType];
}
/** API for game interface client scripts Supported declare modes : - Local - Persistent */
export interface CManiaAppPlaygroundCommon extends CManiaApp {
    PendingEvents: (CManiaAppPlaygroundEvent | null)[];
    readonly Playground: CPlaygroundClient | null;
    readonly Map: CMap | null;
    readonly GhostMgr: CGhostManager | null;
    /** (read-only) UI actually displayed, as defined by the server. */
    UI: CUIConfig | null;
    /** Locally accessible by the client script to locally override settings from the server. */
    ClientUI: CUIConfig | null;
    readonly SplitScreenCount: Integer;
    readonly VoiceChat: CVoiceChatConfig | null;
    /** Set a layer to be displayed on a subscreen. ScreenNum: 0=global, 1,2.... = screen index. Limitation: a local layer can only be one screen at a time. */
    SplitScreenAssignLayer(UILayer: CUILayer | null, ScreenNum: Integer): Void;
}
/** Documentation for class CMlScript_ReadOnly */
export interface CMlScript_ReadOnly extends CNod {
    Page: CMlPage | null;
    PageIsVisible: Boolean;
    PageAlwaysUpdateScript: Boolean;
    Now: Integer;
    Period: Integer;
    CurrentTime: Integer;
    CurrentTimeText: Text;
    CurrentLocalDateText: Text;
    CurrentTimezone: Text;
    readonly LocalUser: CUser | null;
    readonly LoadedTitle: CTitle | null;
    SystemPlatform: CMlScript_ReadOnly.ESystemPlatform;
    SystemSkuIdentifier: CMlScript_ReadOnly.ESystemSkuIdentifier;
    Xml: CParsingManager | null;
    Video: CVideoManager | null;
    Input: CInputManager | null;
    AnimMgr: CAnimManager | null;
}
export declare const CMlScript_ReadOnly: Readonly<{
    readonly ESystemPlatform: Readonly<{
        None: "CMlScript_ReadOnly::ESystemPlatform::None";
        Steam: "CMlScript_ReadOnly::ESystemPlatform::Steam";
        UPlay: "CMlScript_ReadOnly::ESystemPlatform::UPlay";
        PS4: "CMlScript_ReadOnly::ESystemPlatform::PS4";
        XBoxOne: "CMlScript_ReadOnly::ESystemPlatform::XBoxOne";
        PS5: "CMlScript_ReadOnly::ESystemPlatform::PS5";
        XBoxSeries: "CMlScript_ReadOnly::ESystemPlatform::XBoxSeries";
        Stadia: "CMlScript_ReadOnly::ESystemPlatform::Stadia";
        Luna: "CMlScript_ReadOnly::ESystemPlatform::Luna";
    }>;
    readonly ESystemSkuIdentifier: Readonly<{
        Unknown: "CMlScript_ReadOnly::ESystemSkuIdentifier::Unknown";
        EU: "CMlScript_ReadOnly::ESystemSkuIdentifier::EU";
        US: "CMlScript_ReadOnly::ESystemSkuIdentifier::US";
        JP: "CMlScript_ReadOnly::ESystemSkuIdentifier::JP";
        CN: "CMlScript_ReadOnly::ESystemSkuIdentifier::CN";
    }>;
}>;
export declare namespace CMlScript_ReadOnly {
    type ESystemPlatform = (typeof CMlScript_ReadOnly.ESystemPlatform)[keyof typeof CMlScript_ReadOnly.ESystemPlatform];
    type ESystemSkuIdentifier = (typeof CMlScript_ReadOnly.ESystemSkuIdentifier)[keyof typeof CMlScript_ReadOnly.ESystemSkuIdentifier];
}
/** Documentation for class CModuleMenuFileBrowser */
export interface CModuleMenuFileBrowser extends CModuleMenuComponent {
    readonly HasFinished: Boolean;
    Selection: Text[];
    SetFileType(FileType: CModuleMenuFileBrowser.EFileType): Void;
    SetFileAction(FileAction: CModuleMenuFileBrowser.EFileAction): Void;
}
export declare const CModuleMenuFileBrowser: Readonly<{
    readonly EFileType: Readonly<{
        Maps: "CModuleMenuFileBrowser::EFileType::Maps";
        Skins: "CModuleMenuFileBrowser::EFileType::Skins";
        Items: "CModuleMenuFileBrowser::EFileType::Items";
        Blocks: "CModuleMenuFileBrowser::EFileType::Blocks";
        Scripts: "CModuleMenuFileBrowser::EFileType::Scripts";
        Images: "CModuleMenuFileBrowser::EFileType::Images";
        Manialinks: "CModuleMenuFileBrowser::EFileType::Manialinks";
        Packs: "CModuleMenuFileBrowser::EFileType::Packs";
        Actions: "CModuleMenuFileBrowser::EFileType::Actions";
        Modules: "CModuleMenuFileBrowser::EFileType::Modules";
        Meshes: "CModuleMenuFileBrowser::EFileType::Meshes";
        Replays: "CModuleMenuFileBrowser::EFileType::Replays";
    }>;
    readonly EFileAction: Readonly<{
        Select: "CModuleMenuFileBrowser::EFileAction::Select";
        Save: "CModuleMenuFileBrowser::EFileAction::Save";
        MultiSelect: "CModuleMenuFileBrowser::EFileAction::MultiSelect";
    }>;
}>;
export declare namespace CModuleMenuFileBrowser {
    type EFileType = (typeof CModuleMenuFileBrowser.EFileType)[keyof typeof CModuleMenuFileBrowser.EFileType];
    type EFileAction = (typeof CModuleMenuFileBrowser.EFileAction)[keyof typeof CModuleMenuFileBrowser.EFileAction];
}
/** Documentation for class CModulePlaygroundTeamState */
export interface CModulePlaygroundTeamState extends CModulePlayground {
    Reset(Player: CPlayer | null): Void;
}
/** Documentation for class CModulePlaygroundPlayerState */
export interface CModulePlaygroundPlayerState extends CModulePlayground {
    Reset(Player: CPlayer | null): Void;
}
/** Documentation for class CModulePlaygroundSpeedMeter */
export interface CModulePlaygroundSpeedMeter extends CModulePlayground {
    Reset(Player: CPlayer | null): Void;
    SetGlobalScale(Scale: Real): Void;
    SetGaugeNumber(Number: Integer): Void;
    SetGaugeAngle(Angle: Real): Void;
    SetGaugeBGVisible(Visibility: Boolean): Void;
    SetSpeedLineVisible(Visibility: Boolean): Void;
    SetGaugeSpeedMax(Maximum: Real): Void;
    SetSpeedValueScale(Scale: Real): Void;
    SetSpeedUnitScale(Scale: Real): Void;
    SetFooterUnitVisible(Visibility: Boolean): Void;
    SetFooterLineVisible(Visibility: Boolean): Void;
    SetDistanceVisible(Visibility: Boolean): Void;
    SetDistanceFooterLineVisible(Visibility: Boolean): Void;
}
/** Documentation for class CModulePlaygroundChrono */
export interface CModulePlaygroundChrono extends CModulePlayground {
    StopChrono(): Void;
    StartChrono(): Void;
    Reset(): Void;
    Reset(Player: CPlayer | null): Void;
}
/** Documentation for class CModulePlaygroundScoresTable */
export interface CModulePlaygroundScoresTable extends CModulePlayground {
    SetFooterText(FooterText: Text): Void;
    ResetCustomColumns(Score: CScore | null): Void;
    ResetCustomColumns(): Void;
    Scores_Sort(SortOrder: CModulePlaygroundScoresTable.EScoreSortOrder): Void;
    SetColumnValue(Score: CScore | null, ColumnId: Text, ColumnValue: Text): Void;
    SetColumnValue(Score: CScore | null, ColumnId: Text, ColumnValue: Integer): Void;
    SetColumnValue(Score: CScore | null, ColumnId: Text, ColumnValue: Real): Void;
    SetColumnVisibility(Type: CModulePlaygroundScoresTable.EColumnType, Visibility: Boolean): Void;
    SetColumnVisibility(ColumnId: Text, Visibility: Boolean): Void;
    SetColor(Score: CScore | null, Color: Vec3): Void;
    ResetColor(Score: CScore | null): Void;
}
export declare const CModulePlaygroundScoresTable: Readonly<{
    readonly EColumnType: Readonly<{
        CustomString: "CModulePlaygroundScoresTable::EColumnType::CustomString";
        CustomNatural: "CModulePlaygroundScoresTable::EColumnType::CustomNatural";
        CustomInteger: "CModulePlaygroundScoresTable::EColumnType::CustomInteger";
        CustomReal: "CModulePlaygroundScoresTable::EColumnType::CustomReal";
        CustomTime: "CModulePlaygroundScoresTable::EColumnType::CustomTime";
        Avatar: "CModulePlaygroundScoresTable::EColumnType::Avatar";
        Name: "CModulePlaygroundScoresTable::EColumnType::Name";
        ManiaStars: "CModulePlaygroundScoresTable::EColumnType::ManiaStars";
        Tools: "CModulePlaygroundScoresTable::EColumnType::Tools";
        Tags: "CModulePlaygroundScoresTable::EColumnType::Tags";
        TMBestTime: "CModulePlaygroundScoresTable::EColumnType::TMBestTime";
        TMPrevTime: "CModulePlaygroundScoresTable::EColumnType::TMPrevTime";
        TMBestLapTime: "CModulePlaygroundScoresTable::EColumnType::TMBestLapTime";
        TMStunts: "CModulePlaygroundScoresTable::EColumnType::TMStunts";
        TMRespawns: "CModulePlaygroundScoresTable::EColumnType::TMRespawns";
        TMCheckpoints: "CModulePlaygroundScoresTable::EColumnType::TMCheckpoints";
        TMPoints: "CModulePlaygroundScoresTable::EColumnType::TMPoints";
        TMPrevRaceDeltaPoints: "CModulePlaygroundScoresTable::EColumnType::TMPrevRaceDeltaPoints";
        SMPoints: "CModulePlaygroundScoresTable::EColumnType::SMPoints";
        SMRoundPoints: "CModulePlaygroundScoresTable::EColumnType::SMRoundPoints";
    }>;
    readonly EScoreSortOrder: Readonly<{
        Default: "CModulePlaygroundScoresTable::EScoreSortOrder::Default";
        Name: "CModulePlaygroundScoresTable::EScoreSortOrder::Name";
        LadderRanking: "CModulePlaygroundScoresTable::EScoreSortOrder::LadderRanking";
        TMPoints: "CModulePlaygroundScoresTable::EScoreSortOrder::TMPoints";
        TMBestTime: "CModulePlaygroundScoresTable::EScoreSortOrder::TMBestTime";
        TMBestLapTime: "CModulePlaygroundScoresTable::EScoreSortOrder::TMBestLapTime";
        TMStunts: "CModulePlaygroundScoresTable::EScoreSortOrder::TMStunts";
        TMRespawns: "CModulePlaygroundScoresTable::EScoreSortOrder::TMRespawns";
        TMCheckpoints: "CModulePlaygroundScoresTable::EScoreSortOrder::TMCheckpoints";
        TMPrevTime: "CModulePlaygroundScoresTable::EScoreSortOrder::TMPrevTime";
        SMPoints: "CModulePlaygroundScoresTable::EScoreSortOrder::SMPoints";
        SMRoundPoints: "CModulePlaygroundScoresTable::EScoreSortOrder::SMRoundPoints";
    }>;
}>;
export declare namespace CModulePlaygroundScoresTable {
    type EColumnType = (typeof CModulePlaygroundScoresTable.EColumnType)[keyof typeof CModulePlaygroundScoresTable.EColumnType];
    type EScoreSortOrder = (typeof CModulePlaygroundScoresTable.EScoreSortOrder)[keyof typeof CModulePlaygroundScoresTable.EScoreSortOrder];
}
/** Documentation for class CModulePlaygroundInventory */
export interface CModulePlaygroundInventory extends CModulePlayground {
    AddItem(Player: CPlayer | null, Url: Text, Quantity: Integer): Integer;
    AddAction(Player: CPlayer | null, Url: Text): Boolean;
    RemoveInventoryItem(Player: CPlayer | null, Url: Text, Quantity: Integer): Integer;
    GetInventoryItemQuantity(Player: CPlayer | null, Url: Text): Integer;
    IsInventoryItemStored(Player: CPlayer | null, Url: Text): Boolean;
    GetStoredItemsList(Player: CPlayer | null): Text[];
    GetStoredActionsList(Player: CPlayer | null): Text[];
}
/** An playground Store module. */
export interface CModulePlaygroundStore extends CModulePlayground {
    Reset(): Void;
    Reset(Player: CPlayer | null): Void;
    SetMoney(Player: CPlayer | null, Amount: Integer): Void;
    GetMoney(Player: CPlayer | null): Integer;
    AddMoney(Player: CPlayer | null, Amount: Integer): Boolean;
    SubMoney(Player: CPlayer | null, Amount: Integer): Boolean;
    SetActionLevel(Player: CPlayer | null, ActionUrl: Text, ActionLevel: Integer): Void;
    GetActionLevel(Player: CPlayer | null, ActionUrl: Text): Integer;
    SetItemCanBeBought(Player: CPlayer | null, ActionUrl: Text, CanBeBought: Boolean): Void;
    GetItemCanBeBought(Player: CPlayer | null, ActionUrl: Text): Boolean;
}
/** Documentation for class CEditorBase Supported declare modes : - Metadata */
export interface CEditorBase extends CNod {
}
/** Documentation for class CModuleMenuModel */
export interface CModuleMenuModel extends CNod {
    Pages: (CModuleMenuPageModel | null)[];
    MenuScript: Text;
    AddPage(PageUrl: Text): CModuleMenuPageModel | null;
    AddLink(ParentPage: CModuleMenuPageModel | null, ChildPage: CModuleMenuPageModel | null): Void;
}
/** Documentation for class CModuleMenuPageModel */
export interface CModuleMenuPageModel extends CNod {
    ManialinkText: Text;
}
/** Documentation for class CModulePlaygroundHudModel */
export interface CModulePlaygroundHudModel extends CNod {
    ContextsIds: Ident[];
    SubModules: (CHudModule | null)[];
    readonly EditorContextIndex: Integer;
    ContextAdd(ContextName: Text): Ident;
    ContextSetId(ContextId: Ident, NewContextName: Text): Ident;
    ContextRemove(ContextId: Ident): Void;
    NewSubModule(ModulePath: Text): CHudModule | null;
    DeleteSubModule(SubModule: CHudModule | null): Void;
    SubModuleIsContextActive(SubModule: CHudModule | null, ContextId: Ident): Boolean;
    SubModuleSetContextIsActive(SubModule: CHudModule | null, ContextId: Ident, IsActive: Boolean): Void;
}
/** An event Supported declare modes : - Local */
export interface CEditorPluginModuleEvent extends Omit<CManiaAppEvent, "Type"> {
    readonly Type: CEditorPluginModuleEvent.Type;
    Eat(): Void;
}
export declare const CEditorPluginModuleEvent: Readonly<{
    readonly Type: Readonly<{
        LayerCustomEvent: "CEditorPluginModuleEvent::Type::LayerCustomEvent";
        KeyPress: "CEditorPluginModuleEvent::Type::KeyPress";
        MenuNavigation: "CEditorPluginModuleEvent::Type::MenuNavigation";
        Exit: "CEditorPluginModuleEvent::Type::Exit";
        FileNew: "CEditorPluginModuleEvent::Type::FileNew";
        FileOpen: "CEditorPluginModuleEvent::Type::FileOpen";
        FileSave: "CEditorPluginModuleEvent::Type::FileSave";
        FileSaveAs: "CEditorPluginModuleEvent::Type::FileSaveAs";
    }>;
}>;
export declare namespace CEditorPluginModuleEvent {
    type Type = (typeof CEditorPluginModuleEvent.Type)[keyof typeof CEditorPluginModuleEvent.Type];
}
/** Documentation for class CEditorAsset Supported declare modes : - Metadata */
export interface CEditorAsset extends CEditorBase {
}
/** Documentation for class CImage */
export interface CImage extends CNod {
}
/** An event Supported declare modes : - Local */
export interface CEditorEvent extends Omit<CManiaAppEvent, "Type"> {
    readonly Type: CEditorEvent.Type;
}
export declare const CEditorEvent: Readonly<{
    readonly Type: Readonly<{
        LayerCustomEvent: "CEditorEvent::Type::LayerCustomEvent";
        KeyPress: "CEditorEvent::Type::KeyPress";
        MenuNavigation: "CEditorEvent::Type::MenuNavigation";
        FileChanged: "CEditorEvent::Type::FileChanged";
        Exit: "CEditorEvent::Type::Exit";
        FileSave: "CEditorEvent::Type::FileSave";
        OnUndo: "CEditorEvent::Type::OnUndo";
        OnRedo: "CEditorEvent::Type::OnRedo";
        OnSwitchedBack: "CEditorEvent::Type::OnSwitchedBack";
        CameraButtonOn: "CEditorEvent::Type::CameraButtonOn";
        CameraButtonOff: "CEditorEvent::Type::CameraButtonOff";
        VoxelUpdateMaterial: "CEditorEvent::Type::VoxelUpdateMaterial";
        OpenUVEditor: "CEditorEvent::Type::OpenUVEditor";
        CloseUVEditor: "CEditorEvent::Type::CloseUVEditor";
        EnableUndo: "CEditorEvent::Type::EnableUndo";
        DisableUndo: "CEditorEvent::Type::DisableUndo";
        EnableRedo: "CEditorEvent::Type::EnableRedo";
        DisableRedo: "CEditorEvent::Type::DisableRedo";
        UpdateUI: "CEditorEvent::Type::UpdateUI";
        UpdateSliders: "CEditorEvent::Type::UpdateSliders";
        UpdateMaterialsLibPage: "CEditorEvent::Type::UpdateMaterialsLibPage";
        MediaTrackerPopUp: "CEditorEvent::Type::MediaTrackerPopUp";
        HideUI: "CEditorEvent::Type::HideUI";
        ShowUI: "CEditorEvent::Type::ShowUI";
        EnableFullScreen: "CEditorEvent::Type::EnableFullScreen";
        DisableFullScreen: "CEditorEvent::Type::DisableFullScreen";
        Autosave: "CEditorEvent::Type::Autosave";
    }>;
}>;
export declare namespace CEditorEvent {
    type Type = (typeof CEditorEvent.Type)[keyof typeof CEditorEvent.Type];
}
/** Documentation for class CEditorPluginAPI */
export interface CEditorPluginAPI extends CNod {
    NewFile(): Void;
    Undo(): Void;
    Redo(): Void;
    FileToolBarSendCmd(CmdName: Text): Void;
    SetToolBarButtonVisible(Type: CEditorPluginAPI.EEditorFileToolBar_QuadType): Boolean;
}
export declare const CEditorPluginAPI: Readonly<{
    readonly EEditorFileToolBar_QuadType: Readonly<{
        Quit: "CEditorPluginAPI::EEditorFileToolBar_QuadType::Quit";
        New: "CEditorPluginAPI::EEditorFileToolBar_QuadType::New";
        Open: "CEditorPluginAPI::EEditorFileToolBar_QuadType::Open";
        SaveAs: "CEditorPluginAPI::EEditorFileToolBar_QuadType::SaveAs";
        Save: "CEditorPluginAPI::EEditorFileToolBar_QuadType::Save";
        Import: "CEditorPluginAPI::EEditorFileToolBar_QuadType::Import";
        Export: "CEditorPluginAPI::EEditorFileToolBar_QuadType::Export";
        Close: "CEditorPluginAPI::EEditorFileToolBar_QuadType::Close";
        Help: "CEditorPluginAPI::EEditorFileToolBar_QuadType::Help";
    }>;
}>;
export declare namespace CEditorPluginAPI {
    type EEditorFileToolBar_QuadType = (typeof CEditorPluginAPI.EEditorFileToolBar_QuadType)[keyof typeof CEditorPluginAPI.EEditorFileToolBar_QuadType];
}
/** Documentation for class CMediaTrackerClip */
export interface CMediaTrackerClip extends CNod {
    Name: Text;
    Tracks: (CMediaTrackerTrack | null)[];
    StopWhenRespawn: Boolean;
    StopWhenLeave: Boolean;
    TriggersBeforeRaceStart: Boolean;
}
/** Documentation for class CMediaTrackerClipGroup */
export interface CMediaTrackerClipGroup extends CNod {
    Clips: (CMediaTrackerClip | null)[];
}
/** Documentation for class CMediaTrackerTrack */
export interface CMediaTrackerTrack extends CNod {
    Name: Text;
    Blocks: (CMediaTrackerBlock | null)[];
}
/** Represents a match-settings file */
export interface CMatchSettings extends CNod {
    /** Name of the file */
    readonly Name: Text;
    readonly FileName: Text;
    ScriptModeName: Text;
    Playlist: (CMatchSettingsPlaylistItem | null)[];
    ScriptModeName_Check(ScriptModeName: Text): Boolean;
    ScriptModeName_Set(ScriptModeName: Text): Void;
    ScriptSettings_SetToDefault(): Void;
    Playlist_FileExists(File: Text): Boolean;
    Playlist_FileMatchesMode(File: Text): Boolean;
    Playlist_Add(File: Text): Void;
    Playlist_Remove(Index: Integer): Void;
    Playlist_SwapUp(Index: Integer): Void;
    Playlist_SwapDown(Index: Integer): Void;
}
/** API for Maniaplanet client scripts. Supported declare modes : - Local - Persistent */
export interface CManiaAppBase extends CManiaApp {
    PendingEvents: (CManiaAppEvent | null)[];
}
/** Script API to create Pack files (can be Titlepack or plain ManiaCredited data). */
export interface CPackCreatorTitleInfo extends CNod {
    readonly TitleId: Ident;
    readonly MakerTitleId: Ident;
    DisplayName: Text;
    Description: Text;
    InfoUrl: Text;
    DownloadUrl: Text;
    TitleVersion: Text;
    AllowedClientTitleVersion: Text;
    BaseTitleIds: Text;
    ForcedPlayerModel: Text;
    Packaging_ImageFileName: Text;
    Packaging_LogosFileName: Text;
    Packaging_Group: Text;
    /** Can be an http://url or a ./path/in/title/datas/station.app.txt */
    Station_ManialinkUrl: Text;
    Menus_BgReplayFileName: Text;
    Menus_ManiaAppFileName: Text;
    Menus_MusicFileName: Text;
    /** Use CGameManiaTitleEditionScriptAPI::SetTitleCampaign() to modify */
    readonly Solo_HasCampaign: Boolean;
    FallbackFontFileName: Text;
    Hud3dFontFileName: Text;
    MusicFolder: Text;
    Editor_MusicFileName: Text;
}
/** Documentation for class CMlGraphCurve */
export interface CMlGraphCurve extends CNod {
    Points: Vec2[];
    Color: Vec3;
    Style: Text;
    /** Values in range (0.000000-50.000000) */
    Width: Real;
    SortPoints(): Void;
}
/** Manialink filename entry. Supported declare modes : - Local */
export interface CMlFileEntry extends CMlEntry {
    OnlyUserFiles: Boolean;
    readonly FullFileName: Text;
    readonly RelativeNameToRoot: Text;
    readonly RelativeNameToTypeFolder: Text;
    ClearFileNames(): Void;
}
/** Documentation for class CParsingNode */
export interface CParsingNode extends CNod {
    readonly Name: Text;
    readonly TextContents: Text;
    readonly TextRawContents: Text;
    readonly TextRecursiveContents: Text;
    Children: (CParsingNode | null)[];
    GetAttributeText(Name: Text, DefaultValue: Text): Text;
    GetAttributeInteger(Name: Text, DefaultValue: Integer): Integer;
    GetAttributeReal(Name: Text, DefaultValue: Real): Real;
    GetAttributeBoolean(Name: Text, DefaultValue: Boolean): Boolean;
    GetFirstChild(Name: Text): CParsingNode | null;
}
/** Documentation for class CMapGroup */
export interface CMapGroup extends CNod {
    MapInfos: (CMapInfo | null)[];
}
/** Asynchronous task result. Supported declare modes : - Local */
export interface CWebServicesTaskResult_NadeoServicesItemCollection extends CTaskResult {
}
/** Documentation for class CNadeoServicesItemCollection */
export interface CNadeoServicesItemCollection extends Omit<CNod, "Id"> {
    readonly ActivityId: Text;
    readonly CreationTimeStamp: Integer;
    readonly CreatorAccountId: Text;
    readonly CreatorWebServicesUserId: Text;
    readonly CreatorDisplayName: Text;
    readonly CreatorIsFirstPartyDisplayName: Boolean;
    readonly ClubId: Text;
    CurrentVersion: CNadeoServicesItemCollectionVersion | null;
    readonly DisplayName: Text;
    readonly HasVersionList: Boolean;
    readonly Id: Text;
    readonly IsCurrentVersionNull: Boolean;
    readonly Name: Text;
    readonly Type: Text;
    readonly UpdateTimeStamp: Integer;
    VersionList: (CNadeoServicesItemCollectionVersion | null)[];
}
/** Asynchronous task result. Supported declare modes : - Local */
export interface CWebServicesTaskResult_NadeoServicesItemCollectionList extends CTaskResult {
}
/** Asynchronous task result. Supported declare modes : - Local */
export interface CWebServicesTaskResult_NadeoServicesMap extends CTaskResult {
}
/** Documentation for class CNadeoServicesMap */
export interface CNadeoServicesMap extends Omit<CNod, "Id"> {
    readonly AuthorAccountId: Text;
    readonly AuthorWebServicesUserId: Text;
    readonly AuthorDisplayName: Text;
    readonly AuthorIsFirstPartyDisplayName: Boolean;
    readonly AuthorScore: Integer;
    readonly BronzeScore: Integer;
    readonly CollectionName: Text;
    readonly CreatedWithGamepadEditor: Boolean;
    readonly CreatedWithSimpleEditor: Boolean;
    readonly FileName: Text;
    readonly FileUrl: Text;
    readonly GoldScore: Integer;
    readonly HasClones: Boolean;
    readonly Id: Text;
    readonly IsPlayable: Boolean;
    readonly Name: Text;
    readonly SilverScore: Integer;
    readonly Style: Text;
    readonly SubmitterAccountId: Text;
    readonly SubmitterWebServicesUserId: Text;
    readonly ThumbnailUrl: Text;
    readonly TimeStamp: Integer;
    readonly Type: Text;
    readonly Uid: Text;
}
/** Asynchronous task result. Supported declare modes : - Local */
export interface CWebServicesTaskResult_NadeoServicesMapList extends CTaskResult {
}
/** Asynchronous task result. Supported declare modes : - Local */
export interface CWebServicesTaskResult_NadeoServicesSkin extends CTaskResult {
}
/** Documentation for class CNadeoServicesSkin */
export interface CNadeoServicesSkin extends Omit<CNod, "Id"> {
    readonly Checksum: Text;
    readonly CreatorAccountId: Text;
    readonly CreatorWebServicesUserId: Text;
    readonly CreatorDisplayName: Text;
    readonly CreatorIsFirstPartyDisplayName: Boolean;
    readonly DisplayName: Text;
    readonly FileName: Text;
    readonly FileUrl: Text;
    readonly Id: Text;
    readonly Name: Text;
    readonly ThumbnailUrl: Text;
    readonly TimeStamp: Integer;
    readonly Type: Text;
}
/** Asynchronous task result. Supported declare modes : - Local */
export interface CWebServicesTaskResult_NadeoServicesSkinList extends CTaskResult {
}
/** Documentation for class CReplayInfo */
export interface CReplayInfo extends CNod {
    readonly MapUid: Text;
    readonly Name: Text;
    readonly Path: Text;
    readonly FileName: Text;
}
/** A GameMode script. */
export interface CTaskResult_ModeInfo extends CNod {
    /** Name of the GameMode */
    readonly Name: Text;
    readonly Path: Text;
    readonly Description: Text;
    readonly Version: Text;
    CompatibleMapTypes: Text[];
}
/** Asynchronous task result. Supported declare modes : - Local */
export interface CWebServicesTaskResult_WSMapRecordList extends CTaskResult {
}
/** Documentation for class CMapRecord */
export interface CMapRecord extends CNod {
    readonly AccountId: Text;
    readonly WebServicesUserId: Text;
    readonly MapId: Text;
    readonly MapUid: Ident;
    readonly ScopeType: Text;
    readonly ScopeId: Text;
    readonly GameMode: Text;
    readonly GameModeCustomData: Text;
    readonly Score: Integer;
    readonly Time: Integer;
    readonly RespawnCount: Integer;
    readonly Timestamp: Integer;
    readonly Medal: Integer;
    readonly MultiAsyncLevel: Integer;
    readonly SkillPoints: Integer;
    readonly FileName: Text;
    readonly ReplayUrl: Text;
}
/** Asynchronous task result. Supported declare modes : - Local */
export interface CWebServicesTaskResult_Season extends CTaskResult {
}
/** Documentation for class CSeason */
export interface CSeason extends Omit<CNod, "Id"> {
    readonly CreatorAccountId: Text;
    readonly CreatorWebServicesUserId: Text;
    readonly GameMode: Text;
    readonly GameModeCustomData: Text;
    readonly MapRecordType: Text;
    readonly Id: Text;
    readonly Name: Text;
    readonly CreationTimeStamp: Integer;
    readonly StartTimeStamp: Integer;
    readonly EndTimeStamp: Integer;
    MapInfoList: (CSeasonMapInfo | null)[];
}
/** Asynchronous task result. Supported declare modes : - Local */
export interface CWebServicesTaskResult_SeasonList extends CTaskResult {
}
/** Asynchronous task result. Supported declare modes : - Local */
export interface CWebServicesTaskResult_AccountTrophyGainHistory extends CTaskResult {
}
/** Asynchronous task result. Supported declare modes : - Local */
export interface CWebServicesTaskResult_AccountTrophyLastYearSummary extends CTaskResult {
}
/** Documentation for class CAccountTrophyLastYearSummary */
export interface CAccountTrophyLastYearSummary extends CNod {
    readonly AccountId: Text;
    readonly WebServicesUserId: Text;
    readonly T1Count: Integer;
    readonly T2Count: Integer;
    readonly T3Count: Integer;
    readonly T4Count: Integer;
    readonly T5Count: Integer;
    readonly T6Count: Integer;
    readonly T7Count: Integer;
    readonly T8Count: Integer;
    readonly T9Count: Integer;
    readonly TimeStamp: Integer;
}
/** Asynchronous task result. Supported declare modes : - Local */
export interface CWebServicesTaskResult_TrophySoloMedalAchievementSettings extends CTaskResult {
}
/** Documentation for class CTrophySoloMedalAchievementSettings */
export interface CTrophySoloMedalAchievementSettings extends CNod {
    readonly Type: Text;
    AllBronzeLevelSettings: CTrophySoloMedalAchievementLevelSettings | null;
    AllSilverLevelSettings: CTrophySoloMedalAchievementLevelSettings | null;
    AllGoldLevelSettings: CTrophySoloMedalAchievementLevelSettings | null;
    AllAuthorLevelSettings: CTrophySoloMedalAchievementLevelSettings | null;
}
/** Asynchronous task result. Supported declare modes : - Local */
export interface CWebServicesTaskResult_WSZonePtrList extends CTaskResult {
}
/** Documentation for class CZone */
export interface CZone extends Omit<CNod, "Id"> {
    readonly Id: Text;
    readonly Name: Text;
    readonly ParentId: Text;
    readonly Path: Text;
    readonly FullPath: Text;
    readonly FlagUrl: Text;
    readonly CountryFlagUrl: Text;
    readonly Model_CarSport_SkinName: Text;
    readonly Model_CarSport_SkinUrl: Text;
    readonly Model_CharacterPilot_SkinName: Text;
    readonly Model_CharacterPilot_SkinUrl: Text;
}
/** Vehicle or Character settings. */
export interface CVehicleSettings extends CNod {
    readonly ModelDisplayName: Text;
    readonly ModelName: Text;
    /** .... */
    readonly SkinName: Text;
    readonly SkinUrl: Text;
    /** actual range is [1.0..10.0]Values in range (0.100000-10.000000) */
    AnalogSensitivity: Real;
    /** Values in range (0.000000-0.900000) */
    AnalogDeadZone: Real;
    InvertSteer: Boolean;
    AccelIsToggleMode: Boolean;
    BrakeIsToggleMode: Boolean;
    /** Values in range (0.000000-2.000000) */
    RumbleIntensity: Real;
    HapticFeedbackEnabled: Boolean;
    /** Values in range (0.000000-1.000000) */
    CenterSpringIntensity: Real;
}
/** Asynchronous task result. Supported declare modes : - Local */
export interface CWebServicesTaskResult_WSFriendList extends CTaskResult {
}
/** Documentation for class CFriend */
export interface CFriend extends CNod {
    readonly AccountId: Text;
    readonly CountryFlagUrl: Text;
    readonly DisplayName: Text;
    readonly IsFirstPartyDisplayName: Boolean;
    readonly PlatformType: Text;
    readonly Presence: Text;
    readonly Relationship: Text;
    readonly WebServicesUserId: Text;
}
/** Asynchronous task result. Supported declare modes : - Local */
export interface CWebServicesTaskResult_WSNewsList extends CTaskResult {
}
/** Documentation for class CNews */
export interface CNews extends Omit<CNod, "Id"> {
    readonly Id: Text;
    readonly Type: Text;
    readonly Placement: Text;
    readonly Locale: Text;
    readonly Title: Text;
    readonly Body: Text;
    readonly MediaUrl: Text;
    readonly MediaType: Text;
    readonly PublicationDate: Text;
    readonly Priority: Integer;
    readonly DisplayTime: Integer;
    LinkList: (CNewsLink | null)[];
}
/** Asynchronous task result. Supported declare modes : - Local */
export interface CWebServicesTaskResult_WSUserPrestigeList extends CTaskResult {
}
/** Documentation for class CUserPrestige */
export interface CUserPrestige extends CNod {
    readonly CategoryType: Text;
    readonly CategoryLevel: Integer;
    readonly Mode: string;
    readonly PrestigeId: Text;
    readonly PrestigeLevel: Integer;
    readonly SkinOptions: Text;
    readonly TimeStamp: Integer;
    readonly Year: Integer;
}
/** Asynchronous task result. Supported declare modes : - Local */
export interface CWebServicesTaskResult_WSUserPrestige extends CTaskResult {
}
/** Asynchronous task result. Supported declare modes : - Local */
export interface CWebServicesTaskResult_WSPrestigeList extends CTaskResult {
}
/** Documentation for class CPrestige */
export interface CPrestige extends CNod {
    readonly CategoryType: Text;
    readonly CategoryLevel: Integer;
    readonly IsUnlocked: Boolean;
    readonly Mode: string;
    readonly PrestigeId: Text;
    readonly PrestigeLevel: Integer;
    readonly PrestigeLevelMax: Integer;
    readonly RewardDisplayName: Text;
    readonly RewardFileUrl: Text;
    readonly RewardThumbnailUrl: Text;
    readonly RewardType: Text;
    readonly SkinOptions: Text;
    readonly StatCurrentValue: Integer;
    readonly StatValueForCurrentLevel: Integer;
    readonly StatValueForNextLevel: Integer;
    readonly TimeStamp: Integer;
    readonly Year: Integer;
}
/** Asynchronous task result. Supported declare modes : - Local */
export interface CWebServicesTaskResult_Squad extends CTaskResult {
}
/** Documentation for class CSquad */
export interface CSquad extends Omit<CNod, "Id"> {
    readonly CreationTimeStamp: Integer;
    readonly LeaderAccountId: Text;
    readonly LeaderWebServicesUserId: Text;
    readonly Id: Text;
    readonly IsLocked: Boolean;
    readonly Name: Text;
    readonly Size: Integer;
    readonly Type: Text;
    readonly UpdateTimeStamp: Integer;
    InvitationList: (CSquadInvitation | null)[];
    MemberList: (CSquadMember | null)[];
}
/** Asynchronous task result. Supported declare modes : - Local */
export interface CWebServicesTaskResult_WSNotification extends CTaskResult {
}
/** Script API to create Packs (can be Titlepacks or plain ManiaCredited data), and generate new builds of these packs. */
export interface CPackCreator extends CNod {
    readonly RegisterPack_IsInProgess: Boolean;
    readonly CurrentPack: CPackCreatorPack | null;
    /** Register (or retreive) a package for the currently edited title. */
    RegisterPackForEditedTitle(): Void;
    /** Start a new build for a pack, optionnaly a titlepack. */
    Build_Begin(Pack: CPackCreatorPack | null, TitleInfo: CPackCreatorTitleInfo | null): Ident;
    Build_AddFile(BuildId: Ident, FileName: Text): Void;
    Build_AddFile(BuildId: Ident, FileName: Text, IsPublic: Boolean, IsInternal: Boolean, NoAutomaticDeps: Boolean): Void;
    Build_AddFolder(BuildId: Ident, FolderName: Text): Void;
    Build_AddFolder(BuildId: Ident, FolderName: Text, IsPublic: Boolean, IsInternal: Boolean, NoRecursion: Boolean, NoAutomaticDeps: Boolean): Void;
    Build_Generate(BuildId: Ident, Upload: Boolean): Void;
    Build_IsGenerated(BuildId: Ident): Boolean;
    Build_ErrorMessage(BuildId: Ident): Text;
    Build_End(BuildId: Ident): Void;
}
/** An event. */
export interface CNotificationsConsumerEvent extends CNod {
    /** Type of the event. */
    readonly Type: CNotificationsConsumerEvent.EType;
    /** Notification concerned by the event. */
    readonly Notification: CNotificationsConsumerNotification | null;
}
export declare const CNotificationsConsumerEvent: Readonly<{
    readonly EType: Readonly<{
        NewNotification: "CNotificationsConsumerEvent::EType::NewNotification";
        NotificationChanged: "CNotificationsConsumerEvent::EType::NotificationChanged";
    }>;
}>;
export declare namespace CNotificationsConsumerEvent {
    type EType = (typeof CNotificationsConsumerEvent.EType)[keyof typeof CNotificationsConsumerEvent.EType];
}
/** A Notification. */
export interface CNotificationsConsumerNotification extends CNod {
    readonly Title: Text;
    readonly Description: Text;
    readonly ImageUrl: Text;
    readonly Priority: CNotificationsConsumerNotification.ENotificationPriority;
    readonly HasBeenRead: Boolean;
    readonly HasBeenActivated: Boolean;
    /** The user has been displayed the Notification for a sufficient time. */
    SetRead(): Void;
    /** The user has clicked on the Notification. */
    SetActivated(): Void;
}
export declare const CNotificationsConsumerNotification: Readonly<{
    readonly ENotificationPriority: Readonly<{
        Memo: "CNotificationsConsumerNotification::ENotificationPriority::Memo";
        Notice: "CNotificationsConsumerNotification::ENotificationPriority::Notice";
        Alarm: "CNotificationsConsumerNotification::ENotificationPriority::Alarm";
    }>;
}>;
export declare namespace CNotificationsConsumerNotification {
    type ENotificationPriority = (typeof CNotificationsConsumerNotification.ENotificationPriority)[keyof typeof CNotificationsConsumerNotification.ENotificationPriority];
}
/** A 1-square-sized part of a block instance. */
export interface CBlockUnit extends CNod {
    readonly AbsoluteOffset: Int3;
    readonly BlockUnitModel: CBlockUnitModel | null;
    readonly Block: CBlock | null;
}
/** Documentation for class CMapEditorInventoryDirectory */
export interface CMapEditorInventoryDirectory extends CMapEditorInventoryNode {
    Children: (CMapEditorInventoryNode | null)[];
    readonly HasChildDirectory: Boolean;
    readonly HasChildArticle: Boolean;
}
/** Documentation for class CMapEditorInventoryNode */
export interface CMapEditorInventoryNode extends CNod {
    readonly NodeName: Text;
    readonly IsDirectory: Boolean;
    readonly ParentNode: CMapEditorInventoryDirectory | null;
    GetCollectorNod(): CNod | null;
}
/** Documentation for class CMapEditorInventoryArticle */
export interface CMapEditorInventoryArticle extends CMapEditorInventoryNode {
}
/** Documentation for class CCollector */
export interface CCollector extends CNod {
    readonly Name: Text;
    PageName: Text;
    InterfaceNumber: Integer;
    readonly Icon: CImage | null;
    readonly SkinDirectory: Text;
}
/** Documentation for class CBlockModelVariantGround */
export interface CBlockModelVariantGround extends CBlockModelVariant {
}
/** Documentation for class CBlockModelVariantAir */
export interface CBlockModelVariantAir extends CBlockModelVariant {
}
/** Documentation for class CMapSector */
export interface CMapSector extends CNod {
    PlayersIds: Ident[];
    readonly Tag: Text;
}
/** Asynchronous task result. Supported declare modes : - Local */
export interface CWebServicesTaskResult_AccountTrophyGainList extends CTaskResult {
}
/** Documentation for class CActionInterface */
export interface CActionInterface extends CNod {
    readonly Cooldown: Integer;
    readonly CooldownStartTime: Integer;
    readonly Energy: Integer;
    readonly EnergyCost: Integer;
    readonly EnergyMax: Integer;
}
/** This is the client ManiaApp for game modes. Supported declare modes : - Local - Persistent */
export interface CManiaAppPlayground extends CManiaAppPlaygroundCommon {
    HoldLoadingScreen: Boolean;
    /** Send a custom event to the CMode script. */
    SendCustomEvent(Type: Text, Data: Text[]): Void;
}
/** GameMode ManaiApp event Supported declare modes : - Local */
export interface CManiaAppPlaygroundEvent extends CManiaAppEvent {
    readonly PlaygroundType: CManiaAppPlaygroundEvent.Type;
    readonly PlaygroundScriptEventType: Text;
    PlaygroundScriptEventData: Text[];
    readonly Ghost: CGhost | null;
    readonly GameplaySpecialType: CManiaAppPlaygroundEvent.GameplaySpecialType;
    readonly GameplayTurboRoulette: CManiaAppPlaygroundEvent.GameplayTurboRoulette;
    readonly IsBoostUpElseDown: Boolean;
    readonly WaypointLandmarkIndex: Integer;
    readonly RaceWaypointTime: Integer;
    readonly DiffWithBestRace: Integer;
    readonly DiffWithBestRace_IsValid: Boolean;
    readonly LapWaypointTime: Integer;
    readonly DiffWithBestLap: Integer;
    readonly DiffWithBestLap_IsValid: Boolean;
    readonly IsFinish: Boolean;
    readonly IsNewLap: Boolean;
    readonly RaceWaypointCount: Integer;
    readonly LapWaypointCount: Integer;
}
export declare const CManiaAppPlaygroundEvent: Readonly<{
    readonly Type: Readonly<{
        LayerCustomEvent: "CManiaAppPlaygroundEvent::Type::LayerCustomEvent";
        KeyPress: "CManiaAppPlaygroundEvent::Type::KeyPress";
        MenuNavigation: "CManiaAppPlaygroundEvent::Type::MenuNavigation";
        PlaygroundScriptEvent: "CManiaAppPlaygroundEvent::Type::PlaygroundScriptEvent";
        GhostAdded: "CManiaAppPlaygroundEvent::Type::GhostAdded";
        RecordUpdated: "CManiaAppPlaygroundEvent::Type::RecordUpdated";
        RecordsUpdated: "CManiaAppPlaygroundEvent::Type::RecordsUpdated";
        OnPlayerTriggerSpecial: "CManiaAppPlaygroundEvent::Type::OnPlayerTriggerSpecial";
        OnPlayerTriggerWaypoint: "CManiaAppPlaygroundEvent::Type::OnPlayerTriggerWaypoint";
    }>;
    readonly GameplaySpecialType: Readonly<{
        None: "CManiaAppPlaygroundEvent::GameplaySpecialType::None";
        Turbo: "CManiaAppPlaygroundEvent::GameplaySpecialType::Turbo";
        Turbo2: "CManiaAppPlaygroundEvent::GameplaySpecialType::Turbo2";
        TurboRoulette: "CManiaAppPlaygroundEvent::GameplaySpecialType::TurboRoulette";
        FreeWheeling: "CManiaAppPlaygroundEvent::GameplaySpecialType::FreeWheeling";
        NoGrip: "CManiaAppPlaygroundEvent::GameplaySpecialType::NoGrip";
        NoSteering: "CManiaAppPlaygroundEvent::GameplaySpecialType::NoSteering";
        ForceAcceleration: "CManiaAppPlaygroundEvent::GameplaySpecialType::ForceAcceleration";
        Reset: "CManiaAppPlaygroundEvent::GameplaySpecialType::Reset";
        SlowMotion: "CManiaAppPlaygroundEvent::GameplaySpecialType::SlowMotion";
        Bumper: "CManiaAppPlaygroundEvent::GameplaySpecialType::Bumper";
        Bumper2: "CManiaAppPlaygroundEvent::GameplaySpecialType::Bumper2";
        ReactorBoost_Legacy: "CManiaAppPlaygroundEvent::GameplaySpecialType::ReactorBoost_Legacy";
        Fragile: "CManiaAppPlaygroundEvent::GameplaySpecialType::Fragile";
        ReactorBoost2_Legacy: "CManiaAppPlaygroundEvent::GameplaySpecialType::ReactorBoost2_Legacy";
        Bouncy: "CManiaAppPlaygroundEvent::GameplaySpecialType::Bouncy";
        NoBrakes: "CManiaAppPlaygroundEvent::GameplaySpecialType::NoBrakes";
        Cruise: "CManiaAppPlaygroundEvent::GameplaySpecialType::Cruise";
        ReactorBoost_Oriented: "CManiaAppPlaygroundEvent::GameplaySpecialType::ReactorBoost_Oriented";
        ReactorBoost2_Oriented: "CManiaAppPlaygroundEvent::GameplaySpecialType::ReactorBoost2_Oriented";
        VehicleTransform_Reset: "CManiaAppPlaygroundEvent::GameplaySpecialType::VehicleTransform_Reset";
        VehicleTransform_CarSnow: "CManiaAppPlaygroundEvent::GameplaySpecialType::VehicleTransform_CarSnow";
        VehicleTransform_CarRally: "CManiaAppPlaygroundEvent::GameplaySpecialType::VehicleTransform_CarRally";
        VehicleTransform_CarDesert: "CManiaAppPlaygroundEvent::GameplaySpecialType::VehicleTransform_CarDesert";
        Null: "CManiaAppPlaygroundEvent::GameplaySpecialType::Null";
    }>;
    readonly GameplayTurboRoulette: Readonly<{
        TurboRoulette_None: "CManiaAppPlaygroundEvent::GameplayTurboRoulette::TurboRoulette_None";
        TurboRoulette_1: "CManiaAppPlaygroundEvent::GameplayTurboRoulette::TurboRoulette_1";
        TurboRoulette_2: "CManiaAppPlaygroundEvent::GameplayTurboRoulette::TurboRoulette_2";
        TurboRoulette_3: "CManiaAppPlaygroundEvent::GameplayTurboRoulette::TurboRoulette_3";
    }>;
}>;
export declare namespace CManiaAppPlaygroundEvent {
    type Type = (typeof CManiaAppPlaygroundEvent.Type)[keyof typeof CManiaAppPlaygroundEvent.Type];
    type GameplaySpecialType = (typeof CManiaAppPlaygroundEvent.GameplaySpecialType)[keyof typeof CManiaAppPlaygroundEvent.GameplaySpecialType];
    type GameplayTurboRoulette = (typeof CManiaAppPlaygroundEvent.GameplayTurboRoulette)[keyof typeof CManiaAppPlaygroundEvent.GameplayTurboRoulette];
}
/** Documentation for class CHudModule */
export interface CHudModule extends CNod {
    ModuleName: Text;
    PosX: Real;
    PosY: Real;
    ZIndex: Real;
    Scale: Real;
    readonly ModulePath: Text;
}
/** Documentation for class CMediaTrackerBlock */
export interface CMediaTrackerBlock extends CNod {
    Start: Real;
    End: Real;
    GetKeyTime(KeyIndex: Integer): Real;
    GetKeysCount(): Integer;
}
/** Represents a map in the playlist of a matchsetting */
export interface CMatchSettingsPlaylistItem extends CNod {
    /** Name of the map */
    readonly Name: Text;
    /** True if the file is found */
    readonly FileExists: Boolean;
}
/** Documentation for class CNadeoServicesItemCollectionVersion */
export interface CNadeoServicesItemCollectionVersion extends Omit<CNod, "Id"> {
    readonly Checksum: Text;
    readonly CreationTimeStamp: Integer;
    readonly Id: Text;
    readonly UpdateTimeStamp: Integer;
    readonly Url: Text;
}
/** Documentation for class CSeasonMapInfo */
export interface CSeasonMapInfo extends CNod {
    readonly MapId: Text;
    readonly MapUid: Ident;
    readonly BronzeScore: Integer;
    readonly SilverScore: Integer;
    readonly GoldScore: Integer;
    readonly AuthorScore: Integer;
    readonly TimeStamp: Integer;
}
/** Documentation for class CTrophySoloMedalAchievementLevelSettings */
export interface CTrophySoloMedalAchievementLevelSettings extends CNod {
    readonly Level: Text;
    readonly T1Count: Integer;
    readonly T2Count: Integer;
    readonly T3Count: Integer;
    readonly T4Count: Integer;
    readonly T5Count: Integer;
    readonly T6Count: Integer;
    readonly T7Count: Integer;
    readonly T8Count: Integer;
    readonly T9Count: Integer;
}
/** Documentation for class CNewsLink */
export interface CNewsLink extends CNod {
    readonly Type: Text;
    readonly Param: Text;
    readonly ActionName: Text;
    readonly ActionDescription: Text;
}
/** Documentation for class CSquadInvitation */
export interface CSquadInvitation extends CNod {
    readonly AccountId: Text;
    readonly CountryFlagUrl: Text;
    readonly DisplayName: Text;
    readonly IsFirstPartyDisplayName: Boolean;
    readonly PrestigeSkinOptions: Text;
    SkinList: (CSkinInfo | null)[];
}
/** Documentation for class CSquadMember */
export interface CSquadMember extends CNod {
    readonly AccountId: Text;
    readonly CountryFlagUrl: Text;
    readonly DisplayName: Text;
    readonly IsFirstPartyDisplayName: Boolean;
    readonly PrestigeSkinOptions: Text;
    SkinList: (CSkinInfo | null)[];
}
/** A pack */
export interface CPackCreatorPack extends CNod {
    /** PackId is the TitleId if the pack is a TitlePack. */
    readonly PackId: Ident;
    readonly CreatorId: Ident;
    readonly IsTitlePack: Boolean;
    Recipients: (CPackCreatorRecipient | null)[];
    Recipients_Add(Login: Text, UseCost: Integer, GetCost: Integer): Void;
    Recipients_Remove(Login: Text): Void;
}
/** A 1-square-sized part of a block model. */
export interface CBlockUnitModel extends CNod {
    readonly RelativeOffset: Int3;
    Clips: (CBlockModelClip | null)[];
}
/** Documentation for class CBlockModelVariant */
export interface CBlockModelVariant extends CNod {
    Name: Text;
    readonly IsAllUnderground: Boolean;
    readonly IsPartUnderground: Boolean;
    readonly Size: Int3;
    readonly OffsetBoundingBoxMin: Int3;
    readonly OffsetBoundingBoxMax: Int3;
    BlockUnitModels: (CBlockUnitModel | null)[];
}
/** A recipient included in the bill for a Pack. */
export interface CPackCreatorRecipient extends CNod {
    /** Login of the recipient. */
    readonly Login: Text;
    /** Cost to read the data (and see it ingame). */
    readonly GetCost: Integer;
    /** Cost to use the in other creations. */
    readonly UseCost: Integer;
}
/** The model of a map block */
export interface CBlockModelClip extends CBlockModel {
}
export declare const MathLib: {
    readonly Pi: Real;
    readonly Tau: Real;
    Abs(_Argument1: Integer): Integer;
    Abs(_Argument1: Real): Real;
    ToReal(_Argument1: Integer): Real;
    /** Converts an angle from degrees to radians. */
    DegToRad(_Degree: Real): Real;
    /** Converts an angle from radians to degrees. */
    RadToDeg(_Radian: Real): Real;
    Sin(_Argument1: Real): Real;
    Cos(_Argument1: Real): Real;
    Tan(_Argument1: Real): Real;
    Atan2(_Argument1: Real, _Argument2: Real): Real;
    Exp(_Argument1: Real): Real;
    Rand(_Argument1: Real, _Argument2: Real): Real;
    Rand(_Argument1: Real, _Argument2: Real, _Argument3: Integer): Real;
    Rand(_Argument1: Integer, _Argument2: Integer): Integer;
    Rand(_Argument1: Integer, _Argument2: Integer, _Argument3: Integer): Integer;
    NearestReal(_Argument1: Integer): Real;
    NearestInteger(_Argument1: Real): Integer;
    FloorInteger(_Argument1: Real): Integer;
    TruncInteger(_Argument1: Real): Integer;
    CeilingInteger(_Argument1: Real): Integer;
    Distance(_Argument1: Real, _Argument2: Real): Real;
    /** Euclidian distance between two 2d points. */
    Distance(_Argument1: Vec2, _Argument2: Vec2): Real;
    /** Euclidian distance between two 3d points. */
    Distance(_Argument1: Vec3, _Argument2: Vec3): Real;
    /** Euclidian norm of the vector. */
    Length(_Argument1: Vec2): Real;
    /** Euclidian norm of the vector. */
    Length(_Argument1: Vec3): Real;
    /** Returns maximum of the absolute value of each component. */
    Norm0(_Argument1: Vec2): Real;
    /** Returns maximum of the absolute value of each component. */
    Norm0(_Argument1: Vec3): Real;
    /** Returns maximum of the absolute value of each component. */
    Norm0(_Argument1: Int2): Integer;
    /** Returns maximum of the absolute value of each component. */
    Norm0(_Argument1: Int3): Integer;
    /** Returns the sum of the absolute value of each component. */
    Norm1(_Argument1: Vec2): Real;
    /** Returns the sum of the absolute value of each component. */
    Norm1(_Argument1: Vec3): Real;
    /** Returns the sum of the absolute value of each component. */
    Norm1(_Argument1: Int2): Integer;
    /** Returns the sum of the absolute value of each component. */
    Norm1(_Argument1: Int3): Integer;
    DotProduct(_Argument1: Vec3, _Argument2: Vec3): Real;
    DotProduct(_Argument1: Vec2, _Argument2: Vec2): Real;
    DotProduct(_Argument1: Int3, _Argument2: Int3): Integer;
    DotProduct(_Argument1: Int2, _Argument2: Int2): Integer;
    CrossProduct(_Argument1: Vec3, _Argument2: Vec3): Vec3;
    CrossProduct(_Argument1: Int3, _Argument2: Int3): Int3;
    Angle(_Argument1: Vec3, _Argument2: Vec3): Real;
    /** Returns the smallest angle from A to B */
    Angle(_Radian1: Real, _Radian2: Real): Real;
    Angle(_Argument1: Vec2, _Argument2: Vec2): Real;
    OrientedAngle(_Argument1: Vec3, _Argument2: Vec3): Real;
    OrientedAngle(_Argument1: Vec2, _Argument2: Vec2): Real;
    PI(): Real;
    Asin(_Argument1: Real): Real;
    Acos(_Argument1: Real): Real;
    Pow(_Argument1: Real, _Argument2: Real): Real;
    Ln(_Argument1: Real): Real;
    Sqrt(_Argument1: Real): Real;
    /** Returns the maximum between A and B */
    Max(_A: Integer, _B: Integer): Integer;
    /** Returns the maximum between A and B */
    Max(_A: Real, _B: Real): Real;
    /** Returns the maximum between A and B */
    Max(_A: Vec2, _B: Vec2): Vec2;
    /** Returns the maximum between A and B */
    Max(_A: Vec3, _B: Vec3): Vec3;
    /** Returns the maximum between A and B */
    Max(_A: Int2, _B: Int2): Int2;
    /** Returns the maximum between A and B */
    Max(_A: Int3, _B: Int3): Int3;
    /** Returns the minimum between A and B */
    Min(_A: Integer, _B: Integer): Integer;
    /** Returns the minimum between A and B */
    Min(_A: Real, _B: Real): Real;
    /** Returns the minimum between A and B */
    Min(_A: Vec2, _B: Vec2): Vec2;
    /** Returns the minimum between A and B */
    Min(_A: Vec3, _B: Vec3): Vec3;
    /** Returns the minimum between A and B */
    Min(_A: Int2, _B: Int2): Int2;
    /** Returns the minimum between A and B */
    Min(_A: Int3, _B: Int3): Int3;
    /** Returns the value X clamped to the range Min..Max */
    Clamp(_X: Integer, _Min: Integer, _Max: Integer): Integer;
    /** Returns the value X clamped to the range Min..Max */
    Clamp(_X: Real, _Min: Real, _Max: Real): Real;
    /** Returns the value X clamped to the range Min..Max */
    Clamp(_X: Vec2, _Min: Vec2, _Max: Vec2): Vec2;
    /** Returns the value X clamped to the range Min..Max */
    Clamp(_X: Vec3, _Min: Vec3, _Max: Vec3): Vec3;
    /** Returns the value X clamped to the range Min..Max */
    Clamp(_X: Int2, _Min: Int2, _Max: Int2): Int2;
    /** Returns the value X clamped to the range Min..Max */
    Clamp(_X: Int3, _Min: Int3, _Max: Int3): Int3;
    /** Returns the modulus of X in the range Min..Max */
    Mod(_X: Real, _Min: Real, _Max: Real): Real;
};
export declare const TextLib: {
    /** Returns the Real corresponding to _Text Returns -1 if an invalid Text is given _Text: The text you want to convert into a Real */
    ToReal(_Text: Text): Real;
    /** Returns the Integer corresponding to _Text Returns -1 if an invalid Text is given _Text: The text you want to convert into an Integer */
    ToInteger(_Text: Text): Integer;
    /** Returns the RGB color corresponding to _Text Returns an empty Vec3 if an invalid Text is given _Text: The text you want to convert into a RGB color */
    ToColor(_Text: Text): Vec3;
    /** Returns a substring of _Text Returns the substring of _Text beginning at the _Start index, with a length of _Length chars Returns an empty Text if _Start > Text.Length or _Length == 0 _Text: The text in which we look for the substring _Start: The beginning index of the substring _Length: The length of the substring */
    SubString(_Text: Text, _Start: Integer, _Length: Integer): Text;
    /** Returns a substring of _Text Returns the substring of _Text beginning at the _Start index, with a length of _Length chars Returns an empty Text if _Start > Text.Length or _Length == 0 _Text: The text in which we look for the substring _Start: The beginning index of the substring _Length: The length of the substring */
    SubText(_Text: Text, _Start: Integer, _Length: Integer): Text;
    /** Returns the length of _Text _Text: The text you want the length */
    Length(_Text: Text): Integer;
    /** Returns the Text corresponding to _Integer _Integer: The Integer you want to convert */
    ToText(_Integer: Integer): Text;
    /** Returns the Text corresponding to _Real _Real: The Real you want to convert */
    ToText(_Real: Real): Text;
    /** Returns the Text corresponding to _Boolean _Boolean: The Boolean you want to convert */
    ToText(_Boolean: Boolean): Text;
    /** Returns the Text corresponding to _Int3 _Int3: The Int3 you want to convert */
    ToText(_Int3: Int3): Text;
    /** Returns the Text corresponding to _Vec3 _Vec3: The Vec3 you want to convert */
    ToText(_Vec3: Vec3): Text;
    /** Returns the Text corresponding to _Time Converts a _Time Integer to a Text with the format HhMmSs Hh will be hidden if _Time is less than one hour. _Time: The time you want to convert into a Text */
    TimeToText(_Time: Integer): Text;
    /** Returns the Text corresponding to _Time Converts a _Time Integer to a Text with the following format : - HhMmSsCc if IncludeCentiSeconds is True - HhMmSs if there's no activated option Hh will be hidden if _Time is less than one hour. _Time: The time you want to convert into a Text _IncludeCentiSeconds: Set IncludeCentiSeconds to True if you want the CentiSeconds to be displayed in the returned Text */
    TimeToText(_Time: Integer, _IncludeCentiSeconds: Boolean): Text;
    /** Returns the Text corresponding to _Time Converts a _Time Integer to a Text with the following format : - HhMmSsMil if IncludeMilliSeconds is True - HhMmSsCc if IncludeCentiSeconds is True - HhMmSs if there's no activated option Hh will be hidden if _Time is less than one hour. _Time: The time you want to convert into a Text _IncludeCentiSeconds: Set IncludeCentiSeconds to True if you want the CentiSeconds to be displayed in the returned Text _IncludeMilliSeconds: Set IncludeMilliSeconds to True if you want the MilliSeconds to be displayed in the returned Text */
    TimeToText(_Time: Integer, _IncludeCentiSeconds: Boolean, _IncludeMilliSeconds: Boolean): Text;
    /** Returns the Text corresponding to _Color _Color: The color you want to convert into a text */
    ColorToText(_Color: Vec3): Text;
    FormatInteger(_Argument1: Integer, _Argument2: Integer): Text;
    /** _Value: The Integer value you want to convert _MinLength: Minimum number of digits of the number, padded with leading zeroes. (excluding the minus sign) _WithSeparator: Optionally add a thousands separator space. */
    FormatInteger(_Value: Integer, _MinLength: Integer, _WithSeparator: Boolean): Text;
    /** Returns the rank corresponding to a number, formatted according to the locale. ShortFormat: '25k' otherwise '25654th'. */
    FormatRank(_Rank: Integer, _ShortFormat: Boolean): Text;
    /** Returns the Text corresponding to a Real. With formatting _Value: The Real value you want to convert _FPartLength: The number of digits you want for the FPart _HideZeroes: Hide trailing zeroes _HideDot: Hide trailing dot if there is nothing after it */
    FormatReal(_Value: Real, _FPartLength: Integer, _HideZeroes: Boolean, _HideDot: Boolean): Text;
    /** Changes lower case characters to upper case characters */
    ToUpperCase(_TextToChange: Text): Text;
    /** Changes upper case characters to lower case characters */
    ToLowerCase(_TextToChange: Text): Text;
    /** Return a string where the previously unclosed $< tags have their $> counterpart */
    CloseStyleTags(_String: Text): Text;
    /** Compares texts without taking format characters in account. Returns True if Text1 and Text2 are equal. Format differences are not taken into account. Case differences are taken into account if IsCaseSensitive is set to True. */
    CompareWithoutFormat(_Text1: Text, _Text2: Text, _IsCaseSensitive: Boolean): Boolean;
    /** Returns True if the searched text is found in the text to search in. Format is not taken into account if IsFormatSensitive is set to False. Case is not taken into account if IsCaseSensitive is set to False. _TextToFind: The text you are looking for _TextToSearchIn: The text you are searching in _IsFormatSensitive: True if you want to take Format into account, False elseway _IsCaseSensitive: True if you want to take Case into account, False elseway */
    Find(_TextToFind: Text, _TextToSearchIn: Text, _IsFormatSensitive: Boolean, _IsCaseSensitive: Boolean): Boolean;
    /** Return True if the Text ends with the TextToFind _TextToFind: The text you are looking for _TextToSearchIn: The text you are searching in */
    EndsWith(_TextToFind: Text, _TextToSearchIn: Text): Boolean;
    /** Return True if the Text ends with the TextToFind _TextToFind: The text you are looking for _TextToSearchIn: The text you are searching in _IsFormatSensitive: True if you want to take Format into account, False elseway _IsCaseSensitive: True if you want to take Case into account, False elseway */
    EndsWith(_TextToFind: Text, _TextToSearchIn: Text, _IsFormatSensitive: Boolean, _IsCaseSensitive: Boolean): Boolean;
    /** Return True if the Text starts with the TextToFind _TextToFind: The text you are looking for _TextToSearchIn: The text you are searching in */
    StartsWith(_TextToFind: Text, _TextToSearchIn: Text): Boolean;
    /** Return True if the Text starts with the TextToFind _TextToFind: The text you are looking for _TextToSearchIn: The text you are searching in _IsFormatSensitive: True if you want to take Format into account, False elseway _IsCaseSensitive: True if you want to take Case into account, False elseway */
    StartsWith(_TextToFind: Text, _TextToSearchIn: Text, _IsFormatSensitive: Boolean, _IsCaseSensitive: Boolean): Boolean;
    Compose(_Argument1: Text): Text;
    Compose(_Argument1: Text, _Argument2: Text): Text;
    Compose(_Argument1: Text, _Argument2: Text, _Argument3: Text): Text;
    Compose(_Argument1: Text, _Argument2: Text, _Argument3: Text, _Argument4: Text): Text;
    Compose(_Argument1: Text, _Argument2: Text, _Argument3: Text, _Argument4: Text, _Argument5: Text): Text;
    Compose(_Argument1: Text, _Argument2: Text, _Argument3: Text, _Argument4: Text, _Argument5: Text, _Argument6: Text): Text;
    MLEncode(_Argument1: Text): Text;
    URLEncode(_Argument1: Text): Text;
    StripFormatting(_Argument1: Text): Text;
    /** Splits a given text based on a given separators set. _Separators: The separators to use _Text: The text to split. */
    Split(_Separators: Text, _Text: Text): Text[];
    /** Splits a given text based on a given separators set. _Separators: The separators to use _Text: The text to split. _MergeSeparators: Separator may be repeated between values (default = true) */
    Split(_Separators: Text, _Text: Text, _MergeSeparators: Boolean): Text[];
    /** Joins a set of texts with the given separator _Separator: The separator to use _Texts: The texts to join. */
    Join(_Separator: Text, _Texts: Text[]): Text;
    Trim(_Argument1: Text): Text;
    ReplaceChars(_Argument1: Text, _Argument2: Text, _Argument3: Text): Text;
    /** Replaces occurences of _ToReplace in _Text with _Replacement _Text: The text you search in _ToReplace: The text you want to replace _Replacement: The text you want to insert */
    Replace(_Text: Text, _ToReplace: Text, _Replacement: Text): Text;
    /** Find occurences of the _Pattern in the _Text. _Pattern: Pattern is a regular expression, similar to javascript syntax. _Text: _Flags: Flags can be 'g' to find all occurences, 'i' to ignore case, 'm' for multiline mode. */
    RegexFind(_Pattern: Text, _Text: Text, _Flags: Text): Text[];
    /** Captures the groups of the _Pattern in the matching _Text. group[0] is the whole pattern match. _Pattern: Pattern is a regular expression, similar to javascript syntax. _Text: _Flags: Flags can be 'i' to ignore case, 'm' for multiline mode. */
    RegexMatch(_Pattern: Text, _Text: Text, _Flags: Text): Text[];
    /** Replace the _Pattern in the matching text with _Replacement. _Pattern: Pattern is a regular expression, similar to javascript syntax. _Text: _Flags: Flags can be 'g' to find all occurences, 'i' to ignore case, 'm' for multiline mode. _Replacement: */
    RegexReplace(_Pattern: Text, _Text: Text, _Flags: Text, _Replacement: Text): Text;
    /** Lookup the text in the current translation dictionary. Lookup the text in the current translation dictionary, and returns the translation, or returns the original text if not found. */
    GetTranslatedText(_Text: Text): Text;
};
export declare const MapUnits: {
    GetNextDir(_Argument1: CMapEditorPlugin.CardinalDirections): CMapEditorPlugin.CardinalDirections;
    GetPreviousDir(_Argument1: CMapEditorPlugin.CardinalDirections): CMapEditorPlugin.CardinalDirections;
    GetOpposedDir(_Argument1: CMapEditorPlugin.CardinalDirections): CMapEditorPlugin.CardinalDirections;
    AddDirs(_Argument1: CMapEditorPlugin.CardinalDirections, _Argument2: CMapEditorPlugin.CardinalDirections): CMapEditorPlugin.CardinalDirections;
    SubDirs(_Argument1: CMapEditorPlugin.CardinalDirections, _Argument2: CMapEditorPlugin.CardinalDirections): CMapEditorPlugin.CardinalDirections;
    GetNeighbourCoord(_Argument1: Int3, _Argument2: CMapEditorPlugin.CardinalDirections): Int3;
    GetRotatedOffset(_Argument1: Int3, _Argument2: CMapEditorPlugin.CardinalDirections): Int3;
    GetRotatedOffsetPositive(_Argument1: Int3, _Argument2: CMapEditorPlugin.CardinalDirections, _Argument3: Int3): Int3;
};
export declare const AnimLib: {
    /** Returns the value smoothly transitionning from 0 to 1 */
    SmoothStep(_X: Real): Real;
    /** Returns the value animated from Base to Base+Delta using Robert Penner easing functions. Function must be one of: "Linear", "QuadIn", "QuadOut", "QuadInOut", "CubicIn", "CubicOut", "CubicInOut", "QuartIn", "QuartOut", "QuartInOut", "QuintIn", "QuintOut", "QuintInOut", "SineIn", "SineOut", "SineInOut", "ExpIn", "ExpOut", "ExpInOut", "CircIn", "CircOut", "CircInOut", "BackIn", "BackOut", "BackInOut", "ElasticIn", "ElasticOut", "ElasticInOut", "ElasticIn2", "ElasticOut2", "ElasticInOut2", "BounceIn", "BounceOut", "BounceInOut" */
    Ease(_Function: Text, _T: Real, _Base: Real, _Change: Real, _Duration: Real): Real;
    /** Returns the value animated from Base to Base+Delta using R. Penner easing functions. */
    EaseLinear(_T: Integer, _Base: Real, _Change: Real, _Duration: Integer): Real;
    /** Returns the value animated from Base to Base+Delta using R. Penner easing functions. */
    EaseInQuad(_T: Integer, _Base: Real, _Change: Real, _Duration: Integer): Real;
    /** Returns the value animated from Base to Base+Delta using R. Penner easing functions. */
    EaseOutQuad(_T: Integer, _Base: Real, _Change: Real, _Duration: Integer): Real;
    /** Returns the value animated from Base to Base+Delta using R. Penner easing functions. */
    EaseInOutQuad(_T: Integer, _Base: Real, _Change: Real, _Duration: Integer): Real;
    /** Returns the value animated from Base to Base+Delta using R. Penner easing functions. */
    EaseInCubic(_T: Integer, _Base: Real, _Change: Real, _Duration: Integer): Real;
    /** Returns the value animated from Base to Base+Delta using R. Penner easing functions. */
    EaseOutCubic(_T: Integer, _Base: Real, _Change: Real, _Duration: Integer): Real;
    /** Returns the value animated from Base to Base+Delta using R. Penner easing functions. */
    EaseInOutCubic(_T: Integer, _Base: Real, _Change: Real, _Duration: Integer): Real;
    /** Returns the value animated from Base to Base+Delta using R. Penner easing functions. */
    EaseInQuart(_T: Integer, _Base: Real, _Change: Real, _Duration: Integer): Real;
    /** Returns the value animated from Base to Base+Delta using R. Penner easing functions. */
    EaseOutQuart(_T: Integer, _Base: Real, _Change: Real, _Duration: Integer): Real;
    /** Returns the value animated from Base to Base+Delta using R. Penner easing functions. */
    EaseInOutQuart(_T: Integer, _Base: Real, _Change: Real, _Duration: Integer): Real;
    /** Returns the value animated from Base to Base+Delta using R. Penner easing functions. */
    EaseInQuint(_T: Integer, _Base: Real, _Change: Real, _Duration: Integer): Real;
    /** Returns the value animated from Base to Base+Delta using R. Penner easing functions. */
    EaseOutQuint(_T: Integer, _Base: Real, _Change: Real, _Duration: Integer): Real;
    /** Returns the value animated from Base to Base+Delta using R. Penner easing functions. */
    EaseInOutQuint(_T: Integer, _Base: Real, _Change: Real, _Duration: Integer): Real;
    /** Returns the value animated from Base to Base+Delta using R. Penner easing functions. */
    EaseInSine(_T: Integer, _Base: Real, _Change: Real, _Duration: Integer): Real;
    /** Returns the value animated from Base to Base+Delta using R. Penner easing functions. */
    EaseOutSine(_T: Integer, _Base: Real, _Change: Real, _Duration: Integer): Real;
    /** Returns the value animated from Base to Base+Delta using R. Penner easing functions. */
    EaseInOutSine(_T: Integer, _Base: Real, _Change: Real, _Duration: Integer): Real;
    /** Returns the value animated from Base to Base+Delta using R. Penner easing functions. */
    EaseInExp(_T: Integer, _Base: Real, _Change: Real, _Duration: Integer): Real;
    /** Returns the value animated from Base to Base+Delta using R. Penner easing functions. */
    EaseOutExp(_T: Integer, _Base: Real, _Change: Real, _Duration: Integer): Real;
    /** Returns the value animated from Base to Base+Delta using R. Penner easing functions. */
    EaseInOutExp(_T: Integer, _Base: Real, _Change: Real, _Duration: Integer): Real;
    /** Returns the value animated from Base to Base+Delta using R. Penner easing functions. */
    EaseInCirc(_T: Integer, _Base: Real, _Change: Real, _Duration: Integer): Real;
    /** Returns the value animated from Base to Base+Delta using R. Penner easing functions. */
    EaseOutCirc(_T: Integer, _Base: Real, _Change: Real, _Duration: Integer): Real;
    /** Returns the value animated from Base to Base+Delta using R. Penner easing functions. */
    EaseInOutCirc(_T: Integer, _Base: Real, _Change: Real, _Duration: Integer): Real;
    /** Returns the value animated from Base to Base+Delta using R. Penner easing functions. */
    EaseInBack(_T: Integer, _Base: Real, _Change: Real, _Duration: Integer): Real;
    /** Returns the value animated from Base to Base+Delta using R. Penner easing functions. */
    EaseOutBack(_T: Integer, _Base: Real, _Change: Real, _Duration: Integer): Real;
    /** Returns the value animated from Base to Base+Delta using R. Penner easing functions. */
    EaseInOutBack(_T: Integer, _Base: Real, _Change: Real, _Duration: Integer): Real;
    /** Returns the value animated from Base to Base+Delta using R. Penner easing functions. */
    EaseInElastic(_T: Integer, _Base: Real, _Change: Real, _Duration: Integer): Real;
    /** Returns the value animated from Base to Base+Delta using R. Penner easing functions. */
    EaseOutElastic(_T: Integer, _Base: Real, _Change: Real, _Duration: Integer): Real;
    /** Returns the value animated from Base to Base+Delta using R. Penner easing functions. */
    EaseInOutElastic(_T: Integer, _Base: Real, _Change: Real, _Duration: Integer): Real;
    /** Returns the value animated from Base to Base+Delta using R. Penner easing functions. */
    EaseInElastic2(_T: Integer, _Base: Real, _Change: Real, _Duration: Integer): Real;
    /** Returns the value animated from Base to Base+Delta using R. Penner easing functions. */
    EaseOutElastic2(_T: Integer, _Base: Real, _Change: Real, _Duration: Integer): Real;
    /** Returns the value animated from Base to Base+Delta using R. Penner easing functions. */
    EaseInOutElastic2(_T: Integer, _Base: Real, _Change: Real, _Duration: Integer): Real;
    /** Returns the value animated from Base to Base+Delta using R. Penner easing functions. */
    EaseInBounce(_T: Integer, _Base: Real, _Change: Real, _Duration: Integer): Real;
    /** Returns the value animated from Base to Base+Delta using R. Penner easing functions. */
    EaseOutBounce(_T: Integer, _Base: Real, _Change: Real, _Duration: Integer): Real;
    /** Returns the value animated from Base to Base+Delta using R. Penner easing functions. */
    EaseInOutBounce(_T: Integer, _Base: Real, _Change: Real, _Duration: Integer): Real;
};
export type TimeLib_EDateFormats = "TimeLib::EDateFormats::Full" | "TimeLib::EDateFormats::Date" | "TimeLib::EDateFormats::DateCompact" | "TimeLib::EDateFormats::DateShort" | "TimeLib::EDateFormats::Time" | "TimeLib::EDateFormats::TimeShort" | "TimeLib::EDateFormats::Relative" | "TimeLib::EDateFormats::RelativeShort" | "TimeLib::EDateFormats::MonthYear";
export type TimeLib_EDurationFormats = "TimeLib::EDurationFormats::Full" | "TimeLib::EDurationFormats::Abbreviated" | "TimeLib::EDurationFormats::Chrono";
export declare const TimeLib: {
    readonly EDateFormats: {
        readonly Full: "TimeLib::EDateFormats::Full";
        readonly Date: "TimeLib::EDateFormats::Date";
        readonly DateCompact: "TimeLib::EDateFormats::DateCompact";
        readonly DateShort: "TimeLib::EDateFormats::DateShort";
        readonly Time: "TimeLib::EDateFormats::Time";
        readonly TimeShort: "TimeLib::EDateFormats::TimeShort";
        readonly Relative: "TimeLib::EDateFormats::Relative";
        readonly RelativeShort: "TimeLib::EDateFormats::RelativeShort";
        readonly MonthYear: "TimeLib::EDateFormats::MonthYear";
    };
    readonly EDurationFormats: {
        readonly Full: "TimeLib::EDurationFormats::Full";
        readonly Abbreviated: "TimeLib::EDurationFormats::Abbreviated";
        readonly Chrono: "TimeLib::EDurationFormats::Chrono";
    };
    /** Returns the date corresponding to a timestamp, formatted according to the locale. Not available on servers. _Timestamp: Timestamp to format _Format: Format */
    FormatDate(_Timestamp: Text, _Format: TimeLib_EDateFormats): Text;
    /** Returns the duration between 2 timestamps, formatted according to the locale. Not available on servers. _Timestamp1: Timestamp1 _Timestamp2: Timestamp2 _Format: Format */
    FormatDelta(_Timestamp1: Text, _Timestamp2: Text, _Format: TimeLib_EDurationFormats): Text;
    /** Returns the duration Delta formatted according to the locale. Not available on servers. _Delta: Delta in seconds _Format: Format */
    FormatDelta(_Delta: Text, _Format: TimeLib_EDurationFormats): Text;
    /** Compares 2 timestamps _Timestamp1: Unix timestamp _Timestamp2: Unix timestamp */
    Compare(_Timestamp1: Text, _Timestamp2: Text): Integer;
    /** Returns a Real between 0 and 1, given an interval and a timestamp _Boundary1: Lower boundary defining the time interval _Boundary2: Higher boundary defining the time interval _Timestamp: Timestamp to check */
    Clamp01(_Boundary1: Text, _Boundary2: Text, _Timestamp: Text): Real;
    /** Returns a Real between 0 and 1, given a timestamp, according to the day cycle in local timezone _Timestamp: Timestamp to check */
    Clamp01TZDay(_Timestamp: Text): Real;
    /** Returns a Real between 0 and 1, given a timestamp, according to the day cycle in UTC timezone _Timestamp: Timestamp to check */
    Clamp01UTCDay(_Timestamp: Text): Real;
    /** Gets current timestamp */
    GetCurrent(): Text;
    /** Returns the duration in seconds between 2 timestamps. May be clamped if huge. _Timestamp1: First timestamp. Result will be positive if this one is bigger/more recent _Timestamp2: Second timestamp */
    GetDelta(_Timestamp1: Text, _Timestamp2: Text): Integer;
    /** Returns the duration in complete years between 2 timestamps, according to the local dates. _Timestamp1: First timestamp. Result will be positive if this one is bigger/more recent _Timestamp2: Second timestamp */
    GetLocalDelta_Years(_Timestamp1: Text, _Timestamp2: Text): Integer;
    /** Returns the duration in complete months between 2 timestamps, according to the local dates. _Timestamp1: First timestamp. Result will be positive if this one is bigger/more recent _Timestamp2: Second timestamp */
    GetLocalDelta_Months(_Timestamp1: Text, _Timestamp2: Text): Integer;
    /** Returns local milliseconds elapsed since game initialisation. */
    GetMillisecondsSinceInit(): Integer;
};
export declare const ColorLib: {
    HsvToRgb(_Hsv: Vec3): Vec3;
    RgbToHsv(_Rgb: Vec3): Vec3;
    /** Returns the Hexa3 corresponding to the RGB given. */
    RgbToHex3(_Rgb: Vec3): Text;
    /** Returns the Hexa6 corresponding to the RGB given. */
    RgbToHex6(_Rrggbb: Vec3): Text;
    /** Returns the RGB color corresponding to Hex3. Returns an empty Vec3 if an invalid Text is given. _Text: The text you want to convert into a RGB color. */
    Hex3ToRgb(_Text: Text): Vec3;
    /** Returns the RGB color corresponding to Hex6. Returns an empty Vec3 if an invalid Text is given. _Text: The text you want to convert into a RGB color. */
    Hex6ToRgb(_Text: Text): Vec3;
    /** Returns the RGB color corresponding to Hex. Returns an empty Vec3 if an invalid Text is given. _Text: The text you want to convert into a RGB color. */
    HexToRgb(_Text: Text): Vec3;
};
