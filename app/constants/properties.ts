import type { ImageSourcePropType } from "react-native";

export type PropertyAgent = {
  name: string;
  agency: string;
  avatar: ImageSourcePropType;
  phone?: string;
  email?: string;
};

export type Property = {
  id: number;
  title: string;
  location: string;
  address: string;
  price: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  parking: number;
  period?: string;
  image: any;
  category: "Louer" | "Acheter";
  isSponsored: boolean;
  status: string;
  propertyType: string;
  description: string;
  amenities: string[];
  agent?: PropertyAgent;
};

export const properties: Property[] = [
  {
    id: 1,
    title: "Lakeshore Blvd West",
    location: "Ouagadougou",
    address: "Quartier Koulouba, Ouagadougou",
    price: "450000",
    bedrooms: 4,
    bathrooms: 2,
    area: "1493",
    parking: 2,
    period: "Mois",
    image: require("../../assets/images/white_villa.jpg"),
    category: "Louer",
    isSponsored: true,
    status: "Disponible à la location",
    propertyType: "Résidence",
    description:
      "Maison moderne avec de grands espaces de vie, idéale pour les familles recherchant le confort et la proximité des commodités.",
    amenities: ["Piscine privée", "Sécurité 24/7", "Climatisation", "Jardin"],
    agent: {
      name: "Mohamed Soro",
      agency: "Soro Realty Group",
      avatar: require("../../assets/images/white_villa.jpg"),
      phone: "+226 70 12 34 56",
      email: "mohamedsoro@gmail.com",
    },
  },
  {
    id: 2,
    title: "Villa Moderne",
    location: "Ouaga 2000",
    address: "Ouaga 2000, Zone A",
    price: "950000",
    bedrooms: 3,
    bathrooms: 2,
    area: "800",
    parking: 1,
    period: "Mois",
    image: require("../../assets/images/white_villa_bg.jpg"),
    category: "Louer",
    isSponsored: true,
    status: "Disponible à la location",
    propertyType: "Villa",
    description:
      "Villa entièrement meublée avec un design contemporain, proche des écoles internationales et des centres commerciaux.",
    amenities: [
      "Fibre optique",
      "Générateur de secours",
      "Buanderie équipée",
      "Terrasse panoramique",
    ],
    agent: {
      name: "Mohamed Soro",
      agency: "Soro Realty Group",
      avatar: require("../../assets/images/white_villa.jpg"),
      phone: "+226 70 12 34 56",
      email: "mohamedsoro@gmail.com",
    },
  },
  {
    id: 3,
    title: "Appartement Centre-ville",
    location: "Somgandé",
    address: "Somgandé, Rue 12",
    price: "1200000",
    bedrooms: 2,
    bathrooms: 1,
    area: "650",
    parking: 1,
    period: "Mois",
    image: require("../../assets/images/white_villa.jpg"),
    category: "Louer",
    isSponsored: false,
    status: "Disponible à la location",
    propertyType: "Appartement",
    description:
      "Appartement lumineux au cœur de la ville, parfait pour les jeunes actifs ou les couples.",
    amenities: ["Ascenseur", "Cuisine équipée", "Bail flexible"],
    agent: {
      name: "Silvia Guigma",
      agency: "Guigma Group",
      avatar: require("../../assets/images/white_villa.jpg"),
      phone: "+226 70 12 34 56",
      email: "silvia@gmail.com",
    },
  },
  {
    id: 4,
    title: "Maison Familiale",
    location: "Cissin",
    address: "Cissin, Rue des Manguiers",
    price: "300000",
    bedrooms: 3,
    bathrooms: 2,
    area: "900",
    parking: 2,
    period: "Mois",
    image: require("../../assets/images/white_villa.jpg"),
    category: "Louer",
    isSponsored: false,
    status: "Disponible à la location",
    propertyType: "Maison",
    description:
      "Charmante maison familiale avec un grand jardin ombragé, idéale pour les enfants.",
    amenities: ["Forage privé", "Maison de gardien", "Clôture sécurisée"],
    agent: {
      name: "Maria Guigma",
      agency: "Maria Group",
      avatar: require("../../assets/images/white_villa.jpg"),
      phone: "+226 70 12 34 56",
      email: "maria@gmail.com",
    },
  },
  {
    id: 5,
    title: "Villa de Luxe",
    location: "Ouaga 2000",
    address: "Ouaga 2000, Résidence Les Palmiers",
    price: "1800000",
    bedrooms: 5,
    bathrooms: 3,
    area: "2000",
    parking: 3,
    image: require("../../assets/images/white_villa.jpg"),
    category: "Acheter",
    isSponsored: true,
    status: "En vente",
    propertyType: "Villa",
    description:
      "Villa d'exception offrant une architecture contemporaine et des finitions haut de gamme.",
    amenities: [
      "Salle de sport",
      "Piscine à débordement",
      "Système domotique",
      "Garage couvert",
    ],
    agent: {
      name: "Maria Guigma",
      agency: "Maria Group",
      avatar: require("../../assets/images/white_villa.jpg"),
      phone: "+226 70 12 34 56",
      email: "maria@gmail.com",
    },
  },
  {
    id: 6,
    title: "Résidence Soleil",
    location: "Somgandé",
    address: "Somgandé, Avenue du Soleil",
    price: "220000000",
    bedrooms: 4,
    bathrooms: 3,
    area: "1600",
    parking: 2,
    image: require("../../assets/images/white_villa_bg.jpg"),
    category: "Acheter",
    isSponsored: false,
    status: "En vente",
    propertyType: "Résidence",
    description:
      "Résidence haut standing construite avec des matériaux durables et une excellente isolation thermique.",
    amenities: [
      "Salle de cinéma",
      "Panneaux solaires",
      "Piscine chauffée",
      "Chambre d'amis indépendante",
    ],
    agent: {
      name: "Lookman Thombiano",
      agency: "Thombiano Group",
      avatar: require("../../assets/images/white_villa.jpg"),
      phone: "+226 70 12 34 56",
      email: "lookman@gmail.com",
    },
  },
  {
    id: 7,
    title: "Duplex Urbain",
    location: "Ouagadougou",
    address: "Ouagadougou, ZACA",
    price: "850000",
    bedrooms: 3,
    bathrooms: 2,
    area: "1100",
    parking: 2,
    period: "Mois",
    image: require("../../assets/images/white_villa_bg.jpg"),
    category: "Louer",
    isSponsored: false,
    status: "Disponible à la location",
    propertyType: "Duplex",
    description:
      "Duplex élégant avec espaces de coworking intégrés, parfait pour les professionnels.",
    amenities: [
      "Bureau privatif",
      "Connexion haut débit",
      "Sécurité biométrique",
    ],
    agent: {
      name: "Lookman Thombiano",
      agency: "Thombiano Group",
      avatar: require("../../assets/images/white_villa.jpg"),
      phone: "+226 70 12 34 56",
      email: "lookman@gmail.com",
    },
  },
  {
    id: 8,
    title: "Parcelle Investisseur",
    location: "Ouaga 2000",
    address: "Ouaga 2000, Boulevard des Affaires",
    price: "125000000",
    bedrooms: 4,
    bathrooms: 3,
    area: "2500",
    parking: 4,
    image: require("../../assets/images/white_villa.jpg"),
    category: "Acheter",
    isSponsored: true,
    status: "En vente",
    propertyType: "Parcelle",
    description:
      "Parcelle premium avec villa déjà construite, rentable pour un projet d'investissement locatif.",
    amenities: ["Titre foncier", "Voies goudronnées", "Clôture en béton"],
  },
];
