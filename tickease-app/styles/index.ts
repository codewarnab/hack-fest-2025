import { StyleSheet } from "react-native";

export const generalStyles = StyleSheet.create({
  text: {
    fontFamily: "Roboto_700Bold",
  },
  title: {
    fontSize: 25,
    textAlign: "left",
    lineHeight: 36,
    paddingLeft: 10,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  image: {
    width: 150,
    aspectRatio: 1,
  },
  textContainer: {
    flex: 0.3,
    paddingHorizontal: 5,
    width: "100%",
    gap: 12,
  },
  titleBold: {
    fontSize: 33,
    lineHeight: 40,
    textAlign: "left",
  },
  description: {
    fontSize: 16,
    opacity: 0.8,
    lineHeight: 20,
    color: "#fff",
  },
});
