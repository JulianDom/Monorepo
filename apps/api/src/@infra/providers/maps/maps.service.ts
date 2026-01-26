import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Client,
  GeocodeResponse,
  ReverseGeocodeResponse,
  DistanceMatrixResponse,
  PlaceAutocompleteResponse,
  PlaceDetailsResponse,
  TravelMode,
  Language,
} from '@googlemaps/google-maps-services-js';
import {
  Coordinates,
  GeocodingResult,
  ReverseGeocodingResult,
  DistanceResult,
  PlaceAutocompleteResult,
  PlaceDetails,
} from '@shared/types';

/**
 * MapsService
 *
 * Servicio para integración con Google Maps API.
 * Provee geocoding, reverse geocoding, cálculo de distancias y autocompletado.
 *
 * @see https://developers.google.com/maps/documentation
 */
@Injectable()
export class MapsService {
  private readonly logger = new Logger(MapsService.name);
  private readonly client: Client;
  private readonly apiKey: string;
  private readonly defaultLanguage: Language;
  private readonly defaultRegion: string;

  constructor(private readonly configService: ConfigService) {
    this.client = new Client({});
    this.apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY', '');
    this.defaultLanguage = this.configService.get<Language>('GOOGLE_MAPS_LANGUAGE', Language.es);
    this.defaultRegion = this.configService.get<string>('GOOGLE_MAPS_REGION', 'AR');

    if (!this.apiKey) {
      this.logger.warn('GOOGLE_MAPS_API_KEY not configured');
    }
  }

  /**
   * Convertir dirección a coordenadas (Geocoding)
   */
  async geocode(address: string): Promise<GeocodingResult | null> {
    try {
      this.logger.debug(`Geocoding address: ${address}`);

      const response: GeocodeResponse = await this.client.geocode({
        params: {
          address,
          key: this.apiKey,
          language: this.defaultLanguage,
          region: this.defaultRegion,
        },
      });

      if (response.data.status !== 'OK' || response.data.results.length === 0) {
        this.logger.warn(`Geocoding failed for address: ${address} (${response.data.status})`);
        return null;
      }

      const result = response.data.results[0];
      if (!result) return null;

      return {
        formattedAddress: result.formatted_address,
        coordinates: {
          lat: result.geometry?.location?.lat ?? 0,
          lng: result.geometry?.location?.lng ?? 0,
        },
        placeId: result.place_id ?? '',
        types: result.types ?? [],
        addressComponents: (result.address_components ?? []).map((component) => ({
          longName: component.long_name,
          shortName: component.short_name,
          types: component.types,
        })),
      };
    } catch (error) {
      this.logger.error(`Geocoding error: ${(error as Error).message}`);
      throw new BadRequestException('Failed to geocode address');
    }
  }

  /**
   * Convertir coordenadas a dirección (Reverse Geocoding)
   */
  async reverseGeocode(coordinates: Coordinates): Promise<ReverseGeocodingResult | null> {
    try {
      this.logger.debug(`Reverse geocoding: ${coordinates.lat}, ${coordinates.lng}`);

      const response: ReverseGeocodeResponse = await this.client.reverseGeocode({
        params: {
          latlng: coordinates,
          key: this.apiKey,
          language: this.defaultLanguage,
        },
      });

      if (response.data.status !== 'OK' || response.data.results.length === 0) {
        this.logger.warn(`Reverse geocoding failed: ${response.data.status}`);
        return null;
      }

      const result = response.data.results[0];
      if (!result) return null;

      return {
        formattedAddress: result.formatted_address,
        placeId: result.place_id,
        types: result.types,
        addressComponents: (result.address_components ?? []).map((component) => ({
          longName: component.long_name,
          shortName: component.short_name,
          types: component.types,
        })),
      };
    } catch (error) {
      this.logger.error(`Reverse geocoding error: ${(error as Error).message}`);
      throw new BadRequestException('Failed to reverse geocode coordinates');
    }
  }

  /**
   * Calcular distancia y duración entre dos puntos
   */
  async getDistance(
    origin: string | Coordinates,
    destination: string | Coordinates,
    mode: TravelMode = TravelMode.driving,
  ): Promise<DistanceResult | null> {
    try {
      const originStr = typeof origin === 'string' ? origin : `${origin.lat},${origin.lng}`;
      const destStr = typeof destination === 'string' ? destination : `${destination.lat},${destination.lng}`;

      this.logger.debug(`Calculating distance: ${originStr} -> ${destStr}`);

      const response: DistanceMatrixResponse = await this.client.distancematrix({
        params: {
          origins: [originStr],
          destinations: [destStr],
          mode,
          key: this.apiKey,
          language: this.defaultLanguage,
        },
      });

      if (response.data.status !== 'OK') {
        this.logger.warn(`Distance matrix failed: ${response.data.status}`);
        return null;
      }

      const element = response.data.rows[0]?.elements[0];

      if (!element || element.status !== 'OK') {
        this.logger.warn(`Distance element status: ${element?.status}`);
        return null;
      }

      return {
        originAddress: response.data.origin_addresses[0] ?? '',
        destinationAddress: response.data.destination_addresses[0] ?? '',
        distance: {
          text: element.distance?.text ?? '',
          value: element.distance?.value ?? 0,
        },
        duration: {
          text: element.duration?.text ?? '',
          value: element.duration?.value ?? 0,
        },
      };
    } catch (error) {
      this.logger.error(`Distance calculation error: ${(error as Error).message}`);
      throw new BadRequestException('Failed to calculate distance');
    }
  }

  /**
   * Autocompletado de direcciones
   */
  async autocomplete(
    input: string,
    sessionToken?: string,
  ): Promise<PlaceAutocompleteResult[]> {
    try {
      this.logger.debug(`Autocomplete: ${input}`);

      const response: PlaceAutocompleteResponse = await this.client.placeAutocomplete({
        params: {
          input,
          key: this.apiKey,
          language: this.defaultLanguage,
          components: [`country:${this.defaultRegion.toLowerCase()}`],
          sessiontoken: sessionToken,
        },
      });

      if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
        this.logger.warn(`Autocomplete failed: ${response.data.status}`);
        return [];
      }

      return response.data.predictions.map((prediction) => ({
        placeId: prediction.place_id,
        description: prediction.description,
        mainText: prediction.structured_formatting.main_text,
        secondaryText: prediction.structured_formatting.secondary_text || '',
        types: prediction.types,
      }));
    } catch (error) {
      this.logger.error(`Autocomplete error: ${(error as Error).message}`);
      throw new BadRequestException('Failed to get address suggestions');
    }
  }

  /**
   * Obtener detalles de un lugar por Place ID
   */
  async getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
    try {
      this.logger.debug(`Getting place details: ${placeId}`);

      const response: PlaceDetailsResponse = await this.client.placeDetails({
        params: {
          place_id: placeId,
          key: this.apiKey,
          language: this.defaultLanguage,
          fields: [
            'place_id',
            'name',
            'formatted_address',
            'geometry',
            'formatted_phone_number',
            'international_phone_number',
            'website',
            'rating',
            'user_ratings_total',
            'opening_hours',
            'types',
          ],
        },
      });

      if (response.data.status !== 'OK' || !response.data.result) {
        this.logger.warn(`Place details failed: ${response.data.status}`);
        return null;
      }

      const result = response.data.result;

      return {
        placeId: result.place_id!,
        name: result.name || '',
        formattedAddress: result.formatted_address || '',
        coordinates: {
          lat: result.geometry?.location.lat || 0,
          lng: result.geometry?.location.lng || 0,
        },
        formattedPhoneNumber: result.formatted_phone_number,
        internationalPhoneNumber: result.international_phone_number,
        website: result.website,
        rating: result.rating,
        userRatingsTotal: result.user_ratings_total,
        openingHours: result.opening_hours
          ? {
              openNow: result.opening_hours.open_now || false,
              weekdayText: result.opening_hours.weekday_text || [],
            }
          : undefined,
        types: result.types || [],
      };
    } catch (error) {
      this.logger.error(`Place details error: ${(error as Error).message}`);
      throw new BadRequestException('Failed to get place details');
    }
  }

  /**
   * Actualizar ubicación de usuario con geocoding
   */
  async updateUserLocation(address: string): Promise<Coordinates | null> {
    const result = await this.geocode(address);
    return result?.coordinates || null;
  }

  /**
   * Validar si las coordenadas están dentro de un área
   */
  isWithinBounds(
    coordinates: Coordinates,
    bounds: { northeast: Coordinates; southwest: Coordinates },
  ): boolean {
    return (
      coordinates.lat >= bounds.southwest.lat &&
      coordinates.lat <= bounds.northeast.lat &&
      coordinates.lng >= bounds.southwest.lng &&
      coordinates.lng <= bounds.northeast.lng
    );
  }

  /**
   * Calcular distancia en kilómetros (Haversine formula)
   */
  calculateHaversineDistance(from: Coordinates, to: Coordinates): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.toRadians(to.lat - from.lat);
    const dLng = this.toRadians(to.lng - from.lng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(from.lat)) *
        Math.cos(this.toRadians(to.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
