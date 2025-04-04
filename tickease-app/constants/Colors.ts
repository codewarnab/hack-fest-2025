/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

const DEFAULTS = {
  primary1: "#A7B6E7",
  primary2: "#EBD9BF",
};

export const Colors = {
  light: {
    text: "#11181C",
    background: "#FFF3D6",
    tint: tintColorLight,
    ...DEFAULTS,
  },
  dark: {
    text: "#00000",
    background: "#FFF3D6",
    tint: tintColorDark,
    ...DEFAULTS,
  },
};
