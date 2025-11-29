import { Bath, BedDouble, Ruler } from "lucide-react-native";

type IconType = "bedroom" | "bathroom" | "measure";

interface ListingIconProps {
  type: IconType;
  size?: number;
  color?: string;
}

export default function ListingIcon({
  type,
  size = 20,
  color = "#666666",
}: ListingIconProps) {
  switch (type) {
    case "bedroom":
      return <BedDouble size={size} color={color} />;
    case "bathroom":
      return <Bath size={size} color={color} />;
    case "measure":
      return <Ruler size={size} color={color} />;
  }
}
