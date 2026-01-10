import { BathtubIcon, BedIcon, RulerIcon } from "phosphor-react-native";

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
      return <BedIcon size={size} color={color} />;
    case "bathroom":
      return <BathtubIcon size={size} color={color} />;
    case "measure":
      return <RulerIcon size={size} color={color} />;
  }
}
