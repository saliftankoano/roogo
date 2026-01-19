import { useClerk, useUser, useAuth } from "@clerk/clerk-expo";
import { router, useFocusEffect } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import {
  CaretRightIcon,
  HeartIcon,
  HouseIcon,
  MapPinIcon,
  QuestionIcon,
  SignOutIcon,
  UserCircleIcon,
  CameraIcon,
} from "phosphor-react-native";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import UserTypeSelection from "../../components/UserTypeSelection";
import SupportSheet from "../../components/SupportSheet";
import { useUserType } from "../../hooks/useUserType";
import {
  getUserByClerkId,
  getUserStats,
  updateClerkMetadata,
  type UserStats,
} from "../../services/userService";
import { tokens } from "../../theme/tokens";

export default function ProfileScreen() {
  const { hasUserType, userType } = useUserType();
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const { signOut } = useClerk();
  const [showUserTypeSelection, setShowUserTypeSelection] = useState(false);
  const [showSupportSheet, setShowSupportSheet] = useState(false);
  const [updatingPhoto, setUpdatingPhoto] = useState(false);
  const hasRenderedOnce = useRef(false);
  const cachedUserRef = useRef<typeof user>(null);

  // State for dynamic data
  const [stats, setStats] = useState<UserStats>({
    propertiesCount: 0,
    viewsCount: 0,
    pendingCount: 0,
    favoritesCount: 0,
    rating: 0,
    reviewsCount: 0,
  });
  const [loadingStats, setLoadingStats] = useState(false);
  const [supabaseLocation, setSupabaseLocation] = useState<string | null>(null);

  // Force re-render counter - used to ensure content paints on focus
  const [, forceRender] = useReducer((x) => x + 1, 0);

  // Cache user data when available, and track that we've rendered
  if (isLoaded && user) {
    hasRenderedOnce.current = true;
    cachedUserRef.current = user;
  }

  // Use cached user if current user is temporarily null (happens during tab switches)
  const displayUser = user || cachedUserRef.current;

  // Fetch stats and user profile
  const fetchUserProfileData = useCallback(async () => {
    if (!displayUser?.id || !userType) return;

    try {
      setLoadingStats(true);
      // 1. Get Supabase user ID from Clerk ID
      const supabaseUser = await getUserByClerkId(displayUser.id);

      if (supabaseUser) {
        setSupabaseLocation(supabaseUser.location);

        // 2. Get stats using Supabase ID
        const userStats = await getUserStats(supabaseUser.id, userType);
        setStats(userStats);
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    } finally {
      setLoadingStats(false);
    }
  }, [displayUser?.id, userType]);

  // Force a re-render when screen focuses to ensure content paints
  useFocusEffect(
    useCallback(() => {
      // Fetch fresh data on focus
      fetchUserProfileData();

      // Small delay to let the navigation animation complete, then force re-render
      const timer = setTimeout(() => {
        forceRender();
      }, 50);
      return () => clearTimeout(timer);
    }, [fetchUserProfileData])
  );

  useEffect(() => {
    // Show user type selection if user is authenticated but doesn't have a type
    if (isLoaded && user && (!hasUserType || !userType)) {
      setShowUserTypeSelection(true);
    }
  }, [isLoaded, user, hasUserType, userType]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/(auth)/sign-in");
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  const handleUpdatePhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0] && user) {
        setUpdatingPhoto(true);
        const asset = result.assets[0];

        // Compress and resize if needed
        const manipulated = await ImageManipulator.manipulateAsync(
          asset.uri,
          [{ resize: { width: 400, height: 400 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );

        // Convert to base64 or fetch as blob
        const response = await fetch(manipulated.uri);
        const blob = await response.blob();

        await user.setProfileImage({
          file: blob,
        });

        Alert.alert("Succès", "Photo de profil mise à jour.");
      }
    } catch (error) {
      console.error("Error updating profile photo:", error);
      Alert.alert("Erreur", "Impossible de mettre à jour la photo.");
    } finally {
      setUpdatingPhoto(false);
    }
  };

  const handlePostUserTypeSelection = async (selectedUserType: string) => {
    try {
      if (user) {
        const token = await getToken();
        if (token) {
          const success = await updateClerkMetadata(token, {
            userType: selectedUserType,
          });
          if (success) {
            // Reload user to get updated metadata
            await user.reload();
          } else {
            throw new Error("Failed to update user type via API");
          }
        }
      }
      setShowUserTypeSelection(false);
    } catch (error) {
      console.error("Error updating user type:", error);
      throw error;
    }
  };

  // Show loading state ONLY on first load, not on tab switches
  // Once we've rendered content, keep showing it to prevent blank flash
  if (!isLoaded && !hasRenderedOnce.current) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: tokens.colors.roogo.neutral[100] }}
        edges={["top"]}
      >
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text
            style={{
              fontSize: 16,
              color: tokens.colors.roogo.neutral[500],
              fontFamily: "Urbanist-Medium",
            }}
          >
            Chargement...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Only redirect/show loading if we have NO user data at all (not even cached)
  if (!displayUser) {
    // If we've never rendered and no user, redirect to sign-in
    if (!hasRenderedOnce.current) {
      router.replace("/(auth)/sign-in");
      return (
        <SafeAreaView
          style={{ flex: 1, backgroundColor: tokens.colors.roogo.neutral[100] }}
          edges={["top"]}
        >
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Text
              style={{
                fontSize: 16,
                color: tokens.colors.roogo.neutral[500],
                fontFamily: "Urbanist-Medium",
              }}
            >
              Redirection...
            </Text>
          </View>
        </SafeAreaView>
      );
    }
    // If we've rendered before but now have no user/cache, user truly signed out
    router.replace("/(auth)/sign-in");
    // Show loading indicator while redirecting
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#FFFFFF",
          alignItems: "center",
          justifyContent: "center",
        }}
        edges={["top"]}
      >
        <ActivityIndicator
          size="large"
          color={tokens.colors.roogo.primary[500]}
        />
      </SafeAreaView>
    );
  }

  const menuItems = [
    userType === "owner" || userType === "agent"
      ? {
          label: "Mes propriétés",
          icon: HouseIcon,
          onPress: () => router.push("/(tabs)/my-properties"),
        }
      : {
          label: "Mes favoris",
          icon: HeartIcon,
          onPress: () => router.push("/(tabs)/favoris"),
        },
    {
      label: "Aide & Support",
      icon: QuestionIcon,
      onPress: () => setShowSupportSheet(true),
    },
    // Add option to change user type if user doesn't have one or wants to change
    ...(!hasUserType || !userType
      ? [
          {
            label: "Choisir mon profil",
            icon: UserCircleIcon,
            onPress: () => setShowUserTypeSelection(true),
          },
        ]
      : []),
  ];

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: tokens.colors.roogo.neutral[100] }}
      edges={["top"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 120,
        }}
      >
        {/* Profile Header with Avatar */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            paddingBottom: 16,
            borderBottomLeftRadius: 40,
            borderBottomRightRadius: 40,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.03,
            shadowRadius: 12,
            elevation: 2,
          }}
        >
          <View
            style={{
              alignItems: "center",
              paddingTop: 8,
            }}
          >
            <View style={{ position: "relative" }}>
              <TouchableOpacity
                onPress={handleUpdatePhoto}
                disabled={updatingPhoto}
                activeOpacity={0.8}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 3,
                  borderColor: tokens.colors.roogo.primary[500],
                  backgroundColor: "#FFF5EB",
                  padding: 3,
                }}
              >
                {updatingPhoto ? (
                  <ActivityIndicator color={tokens.colors.roogo.primary[500]} />
                ) : (
                  <Image
                    source={
                      displayUser?.imageUrl
                        ? { uri: displayUser.imageUrl }
                        : require("../../assets/images/icon.png")
                    }
                    style={{ width: "100%", height: "100%", borderRadius: 50 }}
                  />
                )}
                <View
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    backgroundColor: tokens.colors.roogo.primary[500],
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    borderWidth: 3,
                    borderColor: "#FFFFFF",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CameraIcon size={16} color="white" weight="bold" />
                </View>
              </TouchableOpacity>
            </View>

            {userType && (
              <View
                style={{
                  backgroundColor:
                    userType === "owner" || userType === "agent"
                      ? tokens.colors.roogo.primary[500]
                      : tokens.colors.roogo.neutral[900],
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  borderRadius: 12,
                  marginTop: 12,
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 10,
                    fontFamily: "Urbanist-Bold",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  {userType === "owner"
                    ? "Propriétaire"
                    : userType === "agent"
                      ? "Agent"
                      : "Locataire"}
                </Text>
              </View>
            )}

            <Text
              style={{
                fontSize: 22,
                fontFamily: "Urbanist-Bold",
                color: tokens.colors.roogo.neutral[900],
                marginBottom: 2,
              }}
            >
              {displayUser?.fullName || displayUser?.firstName || "Utilisateur"}
            </Text>
            <Text
              style={{
                fontSize: 13,
                fontFamily: "Urbanist-Medium",
                color: tokens.colors.roogo.neutral[400],
                marginBottom: 8,
              }}
            >
              {displayUser?.primaryEmailAddress?.emailAddress ||
                "Email non disponible"}
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 100,
                backgroundColor: tokens.colors.roogo.neutral[50],
                borderWidth: 1,
                borderColor: tokens.colors.roogo.neutral[100],
              }}
            >
              <MapPinIcon
                size={14}
                color={tokens.colors.roogo.primary[500]}
                weight="fill"
              />
              <Text
                style={{
                  marginLeft: 6,
                  fontSize: 12,
                  fontFamily: "Urbanist-SemiBold",
                  color: tokens.colors.roogo.neutral[600],
                }}
              >
                {String(
                  supabaseLocation ||
                    displayUser?.publicMetadata?.location ||
                    "Ouagadougou, Burkina Faso"
                )}
              </Text>
            </View>
          </View>

          {/* Stats Section */}
          {(userType === "owner" || userType === "agent") && (
            <View style={{ paddingHorizontal: 24, marginTop: 16 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                {[
                  {
                    label: "Propriétés",
                    value: stats.propertiesCount.toString(),
                  },
                  { label: "Vues", value: stats.viewsCount.toString() },
                  {
                    label: "En attente",
                    value: stats.pendingCount.toString(),
                  },
                ].map((stat, idx) => (
                  <View
                    key={idx}
                    style={{
                      flex: 1,
                      backgroundColor: tokens.colors.roogo.neutral[50],
                      borderRadius: 20,
                      paddingVertical: 12,
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: tokens.colors.roogo.neutral[100],
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        fontFamily: "Urbanist-Bold",
                        color: tokens.colors.roogo.primary[500],
                        marginBottom: 2,
                      }}
                    >
                      {loadingStats ? "-" : stat.value}
                    </Text>
                    <Text
                      style={{
                        fontSize: 11,
                        fontFamily: "Urbanist-Medium",
                        color: tokens.colors.roogo.neutral[400],
                      }}
                    >
                      {stat.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Menu Items */}
        <View style={{ paddingHorizontal: 24, paddingTop: 16, gap: 8 }}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={item.onPress}
              activeOpacity={0.7}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "white",
                padding: 14,
                borderRadius: 24,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.02,
                shadowRadius: 8,
                elevation: 1,
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  backgroundColor: tokens.colors.roogo.neutral[50],
                  borderRadius: 14,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 16,
                }}
              >
                <item.icon
                  size={22}
                  color={tokens.colors.roogo.neutral[900]}
                  weight="regular"
                />
              </View>
              <Text
                style={{
                  flex: 1,
                  fontSize: 15,
                  fontFamily: "Urbanist-SemiBold",
                  color: tokens.colors.roogo.neutral[900],
                }}
              >
                {item.label}
              </Text>
              <CaretRightIcon
                size={18}
                color={tokens.colors.roogo.neutral[300]}
                weight="bold"
              />
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            onPress={handleSignOut}
            activeOpacity={0.7}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "white",
              padding: 14,
              borderRadius: 24,
              marginTop: 4,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.02,
              shadowRadius: 8,
              elevation: 1,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                backgroundColor: "#FEF2F2",
                borderRadius: 14,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 16,
              }}
            >
              <SignOutIcon size={22} color="#DC2626" weight="regular" />
            </View>
            <Text
              style={{
                flex: 1,
                fontSize: 15,
                fontFamily: "Urbanist-SemiBold",
                color: tokens.colors.roogo.neutral[900],
              }}
            >
              Se déconnecter
            </Text>
            <CaretRightIcon
              size={18}
              color={tokens.colors.roogo.neutral[300]}
              weight="bold"
            />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Support Sheet */}
      <SupportSheet
        visible={showSupportSheet}
        onClose={() => setShowSupportSheet(false)}
      />

      {/* User Type Selection Modal */}
      <UserTypeSelection
        visible={showUserTypeSelection}
        onSelectUserType={handlePostUserTypeSelection}
      />
    </SafeAreaView>
  );
}
