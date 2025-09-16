import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View
    style={
      {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }
    }
    >
      <Link href="/signin">Sign In</Link>
      <Link href="/explore">Explore</Link>
      <Link href="/profile">Profile</Link>
      <Link href="/properties/1">Property</Link>

    </View>
  );
}

