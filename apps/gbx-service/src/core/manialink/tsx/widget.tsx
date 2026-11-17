import {
  WidgetFrame,
  type WidgetFrameProps,
} from "@tmcontrolpanel/plugin-sdk/ui";

export type WidgetProps = WidgetFrameProps;

// Core pages use the SDK's widget frame, the same one plugin components get
export const Widget = WidgetFrame;
