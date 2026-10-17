import type { StaticImageData } from "next/image";

import food1 from "@/assets/images/food1.png";
import food2 from "@/assets/images/food2.png";
import food3 from "@/assets/images/food3.png";
import food5 from "@/assets/images/food5.png";
import traiteur1 from "@/assets/images/traiteur1.png";
import traiteur2 from "@/assets/images/traiteur2.png";
import traiteur3 from "@/assets/images/traiteur3.jpg";
import traiteur4 from "@/assets/images/traiteur4.jpg";
import traiteur5 from "@/assets/images/traiteur5.jpg";
import traiteur6 from "@/assets/images/traiteur6.jpg";
import traiteur7 from "@/assets/images/traiteur7.jpg";
import traiteur8 from "@/assets/images/traiteur8.jpg";
import type { Locale } from "@/lib/i18n";

// Réservation en ligne (Libro) de Tsak Tsak Beaubien. Saint-Laurent réserve par téléphone seulement.
export const RESERVATION_URL =
  "https://booking.libroreserve.com/17728187886232abb6783/QC01772818788C89D1C/seat";

export const FACEBOOK_URL = "https://www.facebook.com/TsakTsakMtl";
export const CONTACT_EMAIL = "resto@tsaktsak.com";

/** Texte en français et en anglais. */
export type Text = Record<Locale, string>;

export type Photo = {
  src: StaticImageData;
  alt: Text;
};

export const foodGallery: (Photo & { label: Text })[] = [
  {
    src: food1,
    alt: { fr: "Assiette de saumon fumé et œufs pochés", en: "Smoked salmon plate with poached eggs" },
    label: { fr: "Brunch", en: "Brunch" },
  },
  {
    src: food2,
    alt: { fr: "Assiette sucrée-salée aux bleuets", en: "Sweet and savoury blueberry plate" },
    label: { fr: "Dîner", en: "Lunch" },
  },
  {
    src: food3,
    alt: { fr: "Bénédictines à la sauce aux truffes", en: "Eggs Benedict with truffle sauce" },
    label: { fr: "Souper", en: "Dinner" },
  },
  {
    src: food5,
    alt: { fr: "Bénédictine au foie gras", en: "Foie gras eggs Benedict" },
    label: { fr: "Dessert", en: "Dessert" },
  },
];

export type Address = {
  number: string;
  name: string;
  address: string;
  phone: string;
  mapQuery: string;
  map: string;
  /** Lien de réservation en ligne ; null = réservation par téléphone seulement. */
  booking: string | null;
};

export const addresses: Address[] = [
  {
    number: "01",
    name: "Tsak Tsak Beaubien",
    address: "200, rue Beaubien Est",
    phone: "514-495-7812",
    // Nom et adresse tels qu’ils apparaissent sur Google Maps : la carte affiche la fiche du restaurant.
    mapQuery: "Tsak-Tsak Beaubien, 200 Rue Beaubien E, Montréal, QC H2S 1R4",
    map: "https://www.google.com/maps/search/?api=1&query=Tsak-Tsak%20Beaubien%2C%20200%20Rue%20Beaubien%20E%2C%20Montr%C3%A9al%2C%20QC%20H2S%201R4",
    booking: RESERVATION_URL,
  },
  {
    number: "02",
    name: "Tsak Tsak Saint-Laurent",
    address: "5115, boulevard Saint-Laurent",
    phone: "514-272-3369",
    mapQuery: "Restaurant Tsak Tsak Mile-End, 5115 Boul. Saint-Laurent, Montréal, QC H2T 1R9",
    map: "https://www.google.com/maps/search/?api=1&query=Restaurant%20Tsak%20Tsak%20Mile-End%2C%205115%20Boul.%20Saint-Laurent%2C%20Montr%C3%A9al%2C%20QC%20H2T%201R9",
    booking: null,
  },
];

/**
 * Photos de la galerie traiteur, sans légende, en deux blocs de 4 : la première photo de chaque
 * bloc est la grande (à gauche dans le premier bloc, à droite dans le second), la dernière est
 * large. `position` règle le cadrage dans sa case.
 */
export const cateringPhotos: (Photo & { position: string })[] = [
  {
    src: traiteur1,
    alt: {
      fr: "Grand buffet Tsak Tsak décoré de fleurs et de clémentines",
      en: "Large Tsak Tsak buffet decorated with flowers and clementines",
    },
    position: "center 70%",
  },
  {
    src: traiteur2,
    alt: {
      fr: "Buffet Tsak Tsak garni de bouchées et de fleurs",
      en: "Tsak Tsak buffet with bites and flowers",
    },
    position: "center 65%",
  },
  {
    src: traiteur5,
    alt: {
      fr: "Samoussas et nems servis sur de grands plats, avec le menu du kiosque",
      en: "Samosas and spring rolls served on large platters, with the stand’s menu",
    },
    position: "center 50%",
  },
  {
    src: traiteur4,
    alt: {
      fr: "Buffet chaud Tsak Tsak avec salades, fruits et bouchées",
      en: "Tsak Tsak hot buffet with salads, fruit and bites",
    },
    position: "center 72%",
  },
  {
    src: traiteur7,
    alt: {
      fr: "Kiosque Tsak Tsak « Madagascar Streetfood » sous une tente, au Festival Street Food",
      en: "Tsak Tsak “Madagascar Streetfood” stand under a tent at the Street Food Festival",
    },
    position: "22% 40%",
  },
  {
    src: traiteur3,
    alt: {
      fr: "Table de sushis, charcuteries et fromages préparée par Tsak Tsak",
      en: "Sushi, charcuterie and cheese table prepared by Tsak Tsak",
    },
    position: "center 60%",
  },
  {
    src: traiteur6,
    alt: {
      fr: "Plateau de jus maison et présentoir de bouchées frites",
      en: "Tray of house juices and a stand of fried bites",
    },
    position: "center 55%",
  },
  {
    src: traiteur8,
    alt: {
      fr: "Nouilles sautées au poulet grillé et brochettes de bœuf, sauce piquante",
      en: "Stir-fried noodles with grilled chicken and beef skewers with spicy sauce",
    },
    position: "center 55%",
  },
];

/** Options du formulaire traiteur : `value` (en français) est ce qui est envoyé à l’équipe. */
export const eventTypes: { value: string; en: string }[] = [
  { value: "Anniversaire", en: "Birthday" },
  { value: "Baby shower", en: "Baby shower" },
  { value: "Mariage", en: "Wedding" },
  { value: "Événement corporatif", en: "Corporate event" },
  { value: "Réception privée", en: "Private reception" },
  { value: "Autre", en: "Other" },
];

export const eventLocations: { value: string; en: string }[] = [
  { value: "Tsak Tsak Beaubien", en: "Tsak Tsak Beaubien" },
  { value: "Tsak Tsak Saint-Laurent", en: "Tsak Tsak Saint-Laurent" },
  { value: "À l’extérieur", en: "Off-site" },
  { value: "À déterminer", en: "To be determined" },
];

/** Numéro de téléphone pour un lien tel: (ex. 514-495-7812 → +15144957812). */
export function telHref(phone: string) {
  return `tel:+1${phone.replaceAll("-", "")}`;
}
