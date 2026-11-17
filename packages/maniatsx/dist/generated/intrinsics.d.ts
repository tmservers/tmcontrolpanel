import type { Color, MsCode, Node, Vec2 } from "../vnode.js";
/** TextFonts available to used with CMlLabel. */
export type LabelTextfont = "RajdhaniMono" | "Oswald" | "OswaldMono" | "GameFontBlack" | "GameFontRegular" | "GameFontSemiBold" | "RobotoCondensed" | "RobotoCondensedBold" | "Nadeo/Trackmania/BebasNeueRegular";
/** Value type used with CMlEntry. */
export type CmlentryValue = "Ml_Unknown" | "Ml_Natural" | "Ml_Integer" | "Ml_Real" | "Ml_String" | "Ml_TimeMmSsCc" | "Ml_TimeHhMmSs" | "Ml_RealFormated" | "Ml_TimeMmSs" | "Ml_Ascii7bit" | "Ml_Real3Decimals" | "Ml_TimeHhMmSs_24" | "Ml_TimeHhMm" | "Ml_Percent" | "Ml_Hexa" | "Ml_TimeHhMmSsOrMmSs" | "Ml_TimeHhMmFromSeconds";
/** Available language ids (partial for maniaplanet) */
export type DicoLanguages = "en" | "fr" | "de" | "ru" | "zh" | "ko" | "it" | "es" | "pl" | "br" | "cz" | "tu" | "nl";
/** can be one of: top, bottom, center, center2 */
export type Valign = "top" | "bottom" | "center" | "center2";
/** can be one of: left, right, center */
export type Halign = "left" | "right" | "center";
/** Set to Clip, Fit or Inactive to keep the ratio of the image */
export type KeepRatio = "Clip" | "Fit" | "Inactive";
/** Type of the file entry, used to filter the files shown */
export type FileEntry = "skin" | "challenge" | "map" | "replay" | "image" | "audio" | "video" | "text" | "zip";
/** Blend mode of the quad, can be one of: default, add */
export type QuadBlend = "default" | "add";
/** Text format of the entry, can be one of: Basic, Password, Newpassword */
export type EntryTextformat = "Basic" | "Password" | "Newpassword";
/** Text format of the textedit, can be one of: Basic, Script, Password, Newpassword */
export type TexteditFormat = "Basic" | "Script" | "Password" | "Newpassword";
/** Shared attribute group `basicAttrib`. */
export interface BasicAttrib {
    /** Id of the element, used to identify it in the script */
    id?: string;
    /** Position of the element, 2 numbers separated with space "32.0 -18.0" */
    pos?: Vec2 | string;
    /** New position of the element, 3 numbers separated with space "32.0 -18.0 1" */
    posn?: string;
    /** z-index of the element, 0 is the lowest */
    "z-index"?: number;
    /** Class name */
    class?: string | readonly string[];
    /** Rotation of the element, in degrees */
    rot?: number;
    /** Set to 1 to hide the element */
    hidden?: boolean;
    /** Scale of the element, 1.0 is 100% */
    scale?: number;
}
/** Shared attribute group `sizeAttrib`. */
export interface SizeAttrib {
    /** Vertical alignment, can be one of: top, bottom, center, center2 */
    valign?: Valign;
    /** Horizontal alignment, can be one of: left, right, center */
    halign?: Halign;
    /** Size of the element, 2 positive numbers separated with space "32.0 18.0" */
    size?: Vec2 | string;
    /** Size of the element , positive numbers separated with space "32.0 18.0" */
    sizen?: Vec2 | string;
}
/** Shared attribute group `actionAttrib`. */
export interface ActionAttrib {
    /** URL to open when clicked */
    url?: string;
    /** Manialink Url to to open when clicked */
    manialink?: string;
    /** Manialink action to send to server when clicked */
    action?: string;
}
/** Shared attribute group `scriptAttrib`. */
export interface ScriptAttrib {
    /** Send events to the script, 1 to enable, 0 to disable */
    scriptevents?: boolean;
    /** Sends click as Event.CustomLayerEvent to parent app, where scheme is defined with “EventType'EventData1'EventData2'EventData3'…” */
    scriptaction?: string;
}
/** Shared attribute group `styleAttrib`. */
export interface StyleAttrib {
    /** Style name, used to apply a style to the element */
    style?: string;
    /** Font name, used to apply a font to the element */
    textfont?: string;
    /** Text size, used to apply a font size to the element */
    textsize?: number;
    /** Text color, used to apply a font color to the element */
    textcolor?: Color;
    /** Background color of the element, when not focused */
    focusareacolor1?: Color;
    /** Background color of the element, when focused */
    focusareacolor2?: Color;
}
/** Attributes of the `<audio>` element. */
export interface AudioAttributes extends BasicAttrib, SizeAttrib, ScriptAttrib {
    /** URL to the file to play */
    data?: string;
    /** Play the video when loaded */
    play?: boolean;
    /** Set 1 to move sound source to music */
    music?: boolean;
    /** Volume of the video, 0.0 is silent, 1.0 is 100% */
    volume?: number;
    children?: never;
}
/** Attributes of the `<camera>` element. */
export interface CameraAttributes extends BasicAttrib, SizeAttrib {
    children?: never;
}
/** Attributes of the `<colorpicker>` element. */
export interface ColorpickerAttributes extends BasicAttrib, SizeAttrib, ScriptAttrib {
    /** Color of the colorpicker, use 000 for none. */
    color?: Color;
    children?: never;
}
/** Attributes of the `<curve>` element. */
export interface CurveAttributes {
    /** Color of the curve */
    color?: Color;
    /** Width of the curve */
    width?: number;
    /** If left empty, width is described in Ml units. If set to "thin", width is described in pixels. */
    style?: string;
    children?: Node;
}
/** Attributes of the `<dico>` element. */
export interface DicoAttributes {
    children?: Node;
}
/** Attributes of the `<entry>` element. */
export interface EntryAttributes extends BasicAttrib, SizeAttrib, StyleAttrib, ScriptAttrib {
    /** Name of the entry, used to identify for server */
    name?: string;
    /** Text format, can be one of: Basic, Password, Newpassword */
    textformat?: EntryTextformat;
    /** Set to 1 to select the text when focused */
    selecttext?: boolean;
    /** Default value of the entry */
    default?: string;
    /** Type of the value */
    valuetype?: CmlentryValue;
    /** Set to 1 to enable emboss effect */
    textemboss?: boolean;
    /** Defaults to 255, can be more */
    maxlen?: number;
    children?: never;
}
/** Attributes of the `<fileentry>` element. */
export interface FileentryAttributes extends BasicAttrib, SizeAttrib, StyleAttrib, ScriptAttrib {
    /** Default value of the file entry */
    default?: string;
    /** Name of the file entry sent to server */
    name?: string;
    /** Folder of the file entry */
    folder?: string;
    /** Set to 1 to select the text when clicked */
    selecttext?: boolean;
    /** Type of the file entry, used to filter the files shown */
    type?: FileEntry;
    children?: never;
}
/** Frame, can hold and reposition any elements */
export interface FrameAttributes extends BasicAttrib {
    /** Size of the frame, 2 positive numbers separated with space "32.0 18.0" */
    size?: Vec2 | string;
    /** Set to 1 to enable clipping */
    clip?: boolean;
    /** Position of the clipping area, 2 numbers separated with space "32.0 18.0" */
    clipposn?: Vec2 | string;
    /** Size of the clipping area, 2 positive numbers separated with space "32.0 18.0" */
    clipsizen?: Vec2 | string;
    /** Set to 1 to enable scrolling */
    scroll?: boolean;
    /** Maximum scroll value, 2 positive numbers separated with space "32.0 18.0" */
    scrollmax?: Vec2 | string;
    children?: Node;
}
/** Attributes of the `<frameinstance>` element. */
export interface FrameinstanceAttributes extends BasicAttrib {
    /** Id of the model to use */
    modelid?: string;
    children?: never;
}
/** Attributes of the `<framemodel>` element. */
export interface FramemodelAttributes extends BasicAttrib {
    children?: Node;
}
/** Attributes of the `<gauge>` element. */
export interface GaugeAttributes extends BasicAttrib, SizeAttrib {
    /** Style name, used to apply a style to the element */
    style?: string;
    /** Clan id, used to apply a clan style to the element */
    clan?: number;
    /** Set to 1 to center the gauge */
    centered?: boolean;
    /** Set to 1 to draw the background */
    drawbg?: boolean;
    /** Set to 1 to draw the block background */
    drawblockbg?: boolean;
    /** Color of the gauge */
    color?: Color;
    /** Ratio of the gauge, 0.0 is empty, 1.0 is full */
    ratio?: number;
    /** Grading of the gauge, use 0.0 for no grading */
    grading?: number;
    children?: never;
}
/** Attributes of the `<graph>` element. */
export interface GraphAttributes extends BasicAttrib, SizeAttrib {
    /** Minimum value of the graph, 2 positive numbers separated with space "32.0 18.0" */
    min?: Vec2 | string;
    /** Maximum value of the graph, 2 positive numbers separated with space "32.0 18.0" */
    max?: Vec2 | string;
    children?: Node;
}
/** Attributes of the `<label>` element. */
export interface LabelAttributes extends BasicAttrib, SizeAttrib, StyleAttrib, ScriptAttrib, ActionAttrib {
    /** Text to display */
    text?: string;
    /** Sets multilingual textid for looking up translation from Dico-element, note this is used as XML-tag in Dico. */
    textid?: string;
    /** Prefix of the text to display */
    textprefix?: string;
    /** Set to 1 to enable auto new line */
    autonewline?: boolean;
    /** Set to 1 to append ellipsis if text is too long */
    appendellipsis?: boolean;
    /** Opacity of the text, 0.0 is transparent, 1.0 is opaque */
    opacity?: number;
    /** Set to 1 to enable emboss effect */
    textemboss?: boolean;
    /** Text must be set to italic ($i) for this to work, accepts values between 0.0 and 1.0 */
    italicslope?: number;
    /** Maximum number of lines to display, 0 for unlimited */
    maxline?: number;
    /** Set to 1 to enable line spacing */
    linespacing?: boolean;
    /** Set to 1 to enable translation */
    translate?: boolean;
    children?: never;
}
/** Attributes of the `<language>` element. */
export interface LanguageAttributes {
    /** Language id: such as "en", "de", "fr"... */
    id: string;
    children?: Node;
}
/** Manialink */
export interface ManialinkAttributes {
    /** Version to use, current one is 3 */
    version?: number;
    /** Id of the manialink */
    id?: string;
    /** Name of the manialink */
    name?: string;
    /** Set to 0 to disable background */
    background?: boolean;
    children?: Node;
}
/** Attributes of the `<minimap>` element. */
export interface MinimapAttributes extends BasicAttrib, SizeAttrib, ScriptAttrib {
    children?: never;
}
/** Attributes of the `<point>` element. */
export interface PointAttributes {
    /** Coordinates of the point, 2 positive numbers separated with space "32.0 18.0" */
    coords?: Vec2 | string;
    children?: never;
}
/** Attributes of the `<quad>` element. */
export interface QuadAttributes extends BasicAttrib, SizeAttrib, ActionAttrib, ScriptAttrib {
    /** URI to the image to display */
    image?: string;
    /** URI to the image to display when focused */
    imagefocus?: string;
    /** URI to the image to use as alpha mask */
    alphamask?: string;
    /** Background color of the element, when not focused */
    bgcolor?: Color;
    /** Background color of the element, when focused */
    bgcolorfocus?: Color;
    /** Set to Clip, Fit or Inactive to keep the ratio of the image */
    keepratio?: KeepRatio;
    /** Color to use to colorize the image */
    colorize?: Color;
    /** Color to use to modulate the image */
    modulatecolor?: Color;
    /** Style name, used to apply a style to the element */
    style?: string;
    /** Substyle name, used to apply a substyle to the element */
    substyle?: string;
    /** Set to 1 to use focused state of the style */
    styleselected?: boolean;
    /** Set to 1 to use fixed width for autoscale */
    autoscalefixedwidth?: boolean;
    /** Opacity of the quad, 0.0 is transparent, 1.0 is opaque */
    opacity?: number;
    /** Blur amount of the quad, 0.0 is no blur. Notice: works only when spectating. */
    bluramount?: number;
    /** Blend mode of the quad, can be one of: default, add */
    blend?: QuadBlend;
    /** Pin the corners of the quad, use as 4 x Vec3: "<-0.75,1.>:<1.,1.>:<0.75,-1.>:<-1.,-1.>" */
    pincorners?: string;
    children?: never;
}
/** Attributes of the `<script>` element. */
export interface ScriptAttributes {
    children?: string | MsCode | readonly (string | MsCode)[];
}
/** Attributes of the `<slider>` element. */
export interface SliderAttributes extends BasicAttrib, SizeAttrib, ScriptAttrib {
    /** Value of the slider */
    value?: number;
    /** Minimum value of the slider, 0.0 is minimum */
    minrange?: number;
    /** Maximum value of the slider */
    maxrange?: number;
    children?: never;
}
/** Attributes of the `<style>` element. */
export interface StyleAttributes extends BasicAttrib, SizeAttrib, StyleAttrib, ScriptAttrib, ActionAttrib {
    children?: never;
}
/** Attributes of the `<stylesheet>` element. */
export interface StylesheetAttributes {
    children?: Node;
}
/** Attributes of the `<textedit>` element. */
export interface TexteditAttributes extends BasicAttrib, SizeAttrib, StyleAttrib, ScriptAttrib {
    /** Default value of the textedit */
    default?: string;
    /** Set to 1 to show line numbers */
    showlinenumbers?: boolean;
    /** Set to 1 to enable auto new line */
    autonewline?: boolean;
    /** Maximum number of lines to display, 0 for unlimited */
    maxline?: number;
    /** Text format, can be one of: Basic, Password, Newpassword */
    textformat?: TexteditFormat;
    /** Line spacing, 0.0 is no spacing */
    linespacing?: number;
    /** Set to 1 to enable emboss effect */
    textemboss?: boolean;
    /** Set to 1 to select the text when focused */
    selecttext?: boolean;
    children?: string;
}
/** Attributes of the `<timeline>` element. */
export interface TimelineAttributes extends BasicAttrib, SizeAttrib, ScriptAttrib {
    defaulttimeshown?: number;
    trackcount?: number;
    separatorcolor?: Color;
    cursorcolor?: Color;
    rulerlinecolor?: Color;
    rulercolor?: Color;
    keycolor?: Color;
    bgcolor?: Color;
    children?: never;
}
/** Attributes of the `<timeout>` element. */
export interface TimeoutAttributes {
    children?: number;
}
/** Attributes of the `<video>` element. */
export interface VideoAttributes extends BasicAttrib, SizeAttrib, ScriptAttrib {
    /** URL to the file to play */
    data?: string;
    /** Play the video when loaded */
    play?: boolean;
    /** Set 1 to move sound source to music */
    music?: boolean;
    /** Volume of the video, 0.0 is silent, 1.0 is 100% */
    volume?: number;
    children?: never;
}
export interface GeneratedIntrinsicElements {
    audio: AudioAttributes;
    camera: CameraAttributes;
    colorpicker: ColorpickerAttributes;
    curve: CurveAttributes;
    dico: DicoAttributes;
    entry: EntryAttributes;
    fileentry: FileentryAttributes;
    frame: FrameAttributes;
    frameinstance: FrameinstanceAttributes;
    framemodel: FramemodelAttributes;
    gauge: GaugeAttributes;
    graph: GraphAttributes;
    label: LabelAttributes;
    language: LanguageAttributes;
    manialink: ManialinkAttributes;
    minimap: MinimapAttributes;
    point: PointAttributes;
    quad: QuadAttributes;
    script: ScriptAttributes;
    slider: SliderAttributes;
    style: StyleAttributes;
    stylesheet: StylesheetAttributes;
    textedit: TexteditAttributes;
    timeline: TimelineAttributes;
    timeout: TimeoutAttributes;
    video: VideoAttributes;
}
