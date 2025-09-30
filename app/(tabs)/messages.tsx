import { MoreVertical, Phone, Video } from "lucide-react-native";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MessagesScreen() {
  const conversations = [
    {
      id: 1,
      name: "Marie Konaté",
      lastMessage: "Bonjour, est-ce que la propriété est toujours disponible ?",
      time: "10:30",
      unread: 2,
      avatar: require("../../assets/images/icon.png"),
      isOnline: true,
    },
    {
      id: 2,
      name: "Ahmed Traoré",
      lastMessage: "Merci pour la visite, je vais réfléchir",
      time: "09:15",
      unread: 0,
      avatar: require("../../assets/images/icon.png"),
      isOnline: false,
    },
    {
      id: 3,
      name: "Fatou Diallo",
      lastMessage: "Pouvez-vous m'envoyer plus de photos ?",
      time: "Hier",
      unread: 1,
      avatar: require("../../assets/images/icon.png"),
      isOnline: true,
    },
    {
      id: 4,
      name: "Ibrahim Ouédraogo",
      lastMessage: "Parfait, je suis intéressé",
      time: "Hier",
      unread: 0,
      avatar: require("../../assets/images/icon.png"),
      isOnline: false,
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 py-6">
        <Text className="text-2xl font-bold text-gray-900 mb-6">Messages</Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          {conversations.map((conversation) => (
            <TouchableOpacity
              key={conversation.id}
              className="flex-row items-center py-4 border-b border-gray-100"
            >
              <View className="relative">
                <Image
                  source={conversation.avatar}
                  className="w-12 h-12 rounded-full"
                />
                {conversation.isOnline && (
                  <View className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                )}
              </View>

              <View className="flex-1 ml-3">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-lg font-semibold text-gray-900">
                    {conversation.name}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    {conversation.time}
                  </Text>
                </View>

                <View className="flex-row items-center justify-between">
                  <Text
                    className={`text-sm flex-1 ${
                      conversation.unread > 0
                        ? "text-gray-900 font-medium"
                        : "text-gray-600"
                    }`}
                    numberOfLines={1}
                  >
                    {conversation.lastMessage}
                  </Text>

                  {conversation.unread > 0 && (
                    <View className="bg-blue-600 rounded-full w-5 h-5 items-center justify-center ml-2">
                      <Text className="text-white text-xs font-bold">
                        {conversation.unread}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <View className="flex-row items-center ml-2">
                <TouchableOpacity className="p-2">
                  <Phone size={20} color="#6B7280" />
                </TouchableOpacity>
                <TouchableOpacity className="p-2">
                  <Video size={20} color="#6B7280" />
                </TouchableOpacity>
                <TouchableOpacity className="p-2">
                  <MoreVertical size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
