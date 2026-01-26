/**
 * Tipos para Google Maps
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GeocodingResult {
  formattedAddress: string;
  coordinates: Coordinates;
  placeId: string;
  types: string[];
  addressComponents: AddressComponent[];
}

export interface AddressComponent {
  longName: string;
  shortName: string;
  types: string[];
}

export interface ReverseGeocodingResult {
  formattedAddress: string;
  placeId: string;
  types: string[];
  addressComponents: AddressComponent[];
}

export interface DistanceResult {
  originAddress: string;
  destinationAddress: string;
  distance: {
    text: string;
    value: number; // metros
  };
  duration: {
    text: string;
    value: number; // segundos
  };
}

export interface PlaceAutocompleteResult {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
  types: string[];
}

export interface PlaceDetails {
  placeId: string;
  name: string;
  formattedAddress: string;
  coordinates: Coordinates;
  formattedPhoneNumber?: string;
  internationalPhoneNumber?: string;
  website?: string;
  rating?: number;
  userRatingsTotal?: number;
  openingHours?: {
    openNow: boolean;
    weekdayText: string[];
  };
  types: string[];
}
