import { useClerk, useUser } from "@clerk/clerk-expo";
import { router, useFocusEffect } from "expo-router";
import {
  CaretRightIcon,
  GearIcon,
  HeartIcon,
  HouseIcon,
  MapPinIcon,
  QuestionIcon,
  SignOutIcon,
  UserCircleIcon,
} from "phosphor-react-native";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import UserTypeSelection from "../../components/UserTypeSelection";
import { useUserType } from "../../hooks/useUserType";
import {
  getUserByClerkId,
  getUserStats,
  type UserStats,
} from "../../services/userService";
import { tokens } from "../../theme/tokens";

export default function ProfileScreen() {
  const { hasUserType, userType } = useUserType();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [showUserTypeSelection, setShowUserTypeSelection] = useState(false);
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

  const handlePostUserTypeSelection = async (selectedUserType: string) => {
    try {
      if (user) {
        await user.update({
          unsafeMetadata: {
            ...user.unsafeMetadata,
            userType: selectedUserType,
          },
        });
        // Reload user to get updated metadata
        await user.reload();
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
    { label: "Paramètres", icon: GearIcon, onPress: () => {} },
    { label: "Aide & Support", icon: QuestionIcon, onPress: () => {} },
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
      style={{ flex: 1, backgroundColor: "#FFFFFF" }}
      edges={["top"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: tokens.colors.roogo.neutral[100] }}
        contentContainerStyle={{
          paddingBottom: 120,
        }}
      >
        {/* Profile Header with Avatar - Design Kept */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            paddingBottom: 32,
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.05,
            shadowRadius: 12,
            elevation: 4,
            zIndex: 10,
          }}
        >
          <View
            style={{
              alignItems: "center",
              paddingTop: 24,
              paddingBottom: 24,
            }}
          >
            <View style={{ position: "relative" }}>
              <View
                style={{
                  width: 112,
                  height: 112,
                  borderRadius: 56,
                  marginBottom: 20,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 3,
                  borderColor: "#E48C26",
                  backgroundColor: "#FFF5EB",
                }}
              >
                <Image
                  source={
                    displayUser?.imageUrl
                      ? { uri: displayUser.imageUrl }
                      : require("../../assets/images/icon.png")
                  }
                  style={{ width: 96, height: 96, borderRadius: 48 }}
                />
              </View>
              {userType && (
                <View
                  style={{
                    position: "absolute",
                    bottom: 8,
                    alignSelf: "center",
                    backgroundColor:
                      userType === "owner" || userType === "agent"
                        ? tokens.colors.roogo.primary[500]
                        : tokens.colors.roogo.neutral[900],
                    paddingHorizontal: 16,
                    paddingVertical: 6,
                    borderRadius: 20,
                    borderWidth: 3,
                    borderColor: "#FFFFFF",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 5,
                    zIndex: 20,
                    minWidth: 110,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 10,
                      fontFamily: "Urbanist-Bold",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      textAlign: "center",
                    }}
                    numberOfLines={1}
                  >
                    {userType === "owner"
                      ? "Propriétaire"
                      : userType === "agent"
                        ? "Agent"
                        : "Locataire"}
                  </Text>
                </View>
              )}
            </View>
            <Text
              style={{
                fontSize: 24,
                fontFamily: "Urbanist-Bold",
                color: tokens.colors.roogo.neutral[900],
                marginBottom: 6,
              }}
            >
              {displayUser?.fullName || displayUser?.firstName || "Utilisateur"}
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Urbanist-Medium",
                color: tokens.colors.roogo.neutral[500],
                marginBottom: 16,
              }}
            >
              {displayUser?.primaryEmailAddress?.emailAddress ||
                "Email non disponible"}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 100,
                backgroundColor: "#FFF5EB",
                borderWidth: 1,
                borderColor: "rgba(228, 140, 38, 0.2)",
              }}
            >
              <MapPinIcon size={16} color="#E48C26" weight="fill" />
              <Text
                style={{
                  marginLeft: 6,
                  fontSize: 14,
                  fontFamily: "Urbanist-SemiBold",
                  color: tokens.colors.roogo.neutral[700],
                }}
              >
                {String(
                  supabaseLocation ||
                    displayUser?.unsafeMetadata?.location ||
                    "Ouagadougou, Burkina Faso"
                )}
              </Text>
            </View>
          </View>

          {/* Stats Section - Revamped */}
          {(userType === "owner" || userType === "agent") && (
            <View style={{ paddingHorizontal: 24 }}>
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
                      backgroundColor: tokens.colors.roogo.neutral[100],
                      borderRadius: 16,
                      padding: 16,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 20,
                        fontFamily: "Urbanist-Bold",
                        color: tokens.colors.roogo.primary[500],
                        marginBottom: 4,
                      }}
                    >
                      {loadingStats ? "-" : stat.value}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: "Urbanist-Medium",
                        color: tokens.colors.roogo.neutral[500],
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

        {/* Menu Items - Revamped */}
        <View style={{ paddingHorizontal: 24, paddingTop: 24, gap: 16 }}>
          <Text
            style={{
              fontSize: 18,
              fontFamily: "Urbanist-Bold",
              color: tokens.colors.roogo.neutral[900],
              marginBottom: 8,
            }}
          >
            Général
          </Text>

          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={item.onPress}
              activeOpacity={0.7}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "white",
                padding: 20,
                borderRadius: 20,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <View
                style={{
                  backgroundColor: tokens.colors.roogo.neutral[100],
                  padding: 10,
                  borderRadius: 12,
                  marginRight: 16,
                }}
              >
                <item.icon
                  size={22}
                  color={tokens.colors.roogo.neutral[900]}
                  weight="duotone"
                />
              </View>
              <Text
                style={{
                  flex: 1,
                  fontSize: 16,
                  fontFamily: "Urbanist-SemiBold",
                  color: tokens.colors.roogo.neutral[900],
                }}
              >
                {item.label}
              </Text>
              <CaretRightIcon
                size={20}
                color={tokens.colors.roogo.neutral[400]}
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
              padding: 20,
              borderRadius: 20,
              marginTop: 8,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
              borderWidth: 1,
              borderColor: "#FEE2E2",
            }}
          >
            <View
              style={{
                backgroundColor: "#FEE2E2",
                padding: 10,
                borderRadius: 12,
                marginRight: 16,
              }}
            >
              <SignOutIcon size={22} color="#DC2626" weight="duotone" />
            </View>
            <Text
              style={{
                flex: 1,
                fontSize: 16,
                fontFamily: "Urbanist-SemiBold",
                color: "#DC2626",
              }}
            >
              Se déconnecter
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* User Type Selection Modal */}
      <UserTypeSelection
        visible={showUserTypeSelection}
        onSelectUserType={handlePostUserTypeSelection}
      />
    </SafeAreaView>
  );
}
