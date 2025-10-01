import { Image, Text, TouchableOpacity, View } from "react-native";
import type { PropertyAgent } from "../constants/properties";

type AgentCardProps = {
  agent: PropertyAgent;
  onContactPress?: () => void;
};

export default function AgentCard({ agent, onContactPress }: AgentCardProps) {
  return (
    <View className="flex-row items-center bg-white rounded-full p-4 border border-gray-100">
      <Image
        source={agent.avatar}
        className="w-14 h-14 rounded-full"
        resizeMode="cover"
      />

      <View className="flex-1 ml-4">
        <Text className="text-base font-semibold text-gray-900">
          {agent.name}
        </Text>
        <Text className="text-sm text-gray-500">{agent.agency}</Text>
      </View>

      <TouchableOpacity
        onPress={onContactPress}
        className="bg-gray-900 rounded-full px-5 py-3"
        activeOpacity={0.8}
        accessibilityLabel="Contacter l'agent"
        accessibilityRole="button"
      >
        <Text className="text-white font-semibold text-sm">Contacter</Text>
      </TouchableOpacity>
    </View>
  );
}
