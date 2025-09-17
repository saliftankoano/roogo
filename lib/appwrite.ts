import { Account, Avatars, Client, OAuthProvider } from "react-native-appwrite";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";

export const config = {
  platform: "com.bloomingxp.roogo",
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
};

export const client = new Client();

client
  .setEndpoint(config.endpoint!)
  .setProject(config.projectId!)
  .setPlatform(config.platform);

export const avatar = new Avatars(client);
export const account = new Account(client);
const deepLink = new URL(makeRedirectUri({ preferLocalhost: true }));
const scheme = `${deepLink.protocol}//`;

export async function login() {
  try {
    const loginUrl = account.createOAuth2Token(
      OAuthProvider.Google,
      `${deepLink}`,
      `${deepLink}`,
    );

    if (!loginUrl) {
      throw new Error("Failed to login");
    }
    const browserResult = await WebBrowser.openAuthSessionAsync(
      `${loginUrl}`,
      scheme,
    );

    if (browserResult.type === "success" && browserResult.url) {
      const url = new URL(browserResult.url);
      const secret = url.searchParams.get("secret") || "";
      const userId = url.searchParams.get("userId") || "";
      if (secret != "" && userId != "") {
        // Create session with OAuth credentials
        const session = await account.createSession({
          userId,
          secret,
        });
        if (!session) throw new Error("Failed to create a session");
      }
    } else {
      throw new Error("Authentication was not successful or URL missing.");
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function logOut() {
  try {
    await account.deleteSession("current");
    return true;
  } catch (error) {
    console.error(error);
  }
}

export async function getCurrentUser() {
  try {
    const response = await account.get();
    if (response.$id) {
      const name = response.name || "";
      const userAvatar = avatar.getInitials({ name });
      return { ...response, avatar: userAvatar.toString() };
    }
  } catch (error) {
    console.error(error);
    return null;
  }
}
