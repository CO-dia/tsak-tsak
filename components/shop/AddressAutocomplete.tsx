"use client";

import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { useEffect, useId, useRef, useState } from "react";

export type AddressFields = {
  line1: string;
  line2: string;
  city: string;
  province: string;
  postalCode: string;
  placeId: string;
  lat: string;
  lng: string;
};

type Suggestion = {
  id: string;
  main: string;
  secondary: string;
  prediction: google.maps.places.PlacePrediction;
};

// Centre de Montréal : les suggestions proches sont mises en avant.
const MONTREAL = { center: { lat: 45.5088, lng: -73.5878 }, radius: 40000 };

// Le chargeur Google ne se configure qu’une fois par page : la langue est celle du premier appel.
let configuredKey: string | null = null;
function loadPlaces(apiKey: string, language: string) {
  if (configuredKey !== apiKey) {
    setOptions({ key: apiKey, v: "weekly", language, region: "CA" });
    configuredKey = apiKey;
  }
  return importLibrary("places");
}

function component(place: google.maps.places.Place, type: string, short = false) {
  const match = place.addressComponents?.find((item) => item.types.includes(type));
  return (short ? match?.shortText : match?.longText) ?? "";
}

/**
 * Champ « Adresse » avec suggestions Google (Places API — nouvelle version).
 * Sans clé Google ou en cas d’erreur, il reste un simple champ texte : l’adresse est alors
 * saisie à la main dans les champs voisins.
 */
export default function AddressAutocomplete({
  apiKey,
  lang,
  placeholder,
  credit,
  value,
  onChange,
  onSelect,
}: {
  apiKey: string | null;
  lang: "fr" | "en";
  placeholder: string;
  credit: string;
  value: string;
  onChange: (line1: string) => void;
  onSelect: (fields: Partial<AddressFields>) => void;
}) {
  const listId = useId();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [active, setActive] = useState(-1);
  const [open, setOpen] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const places = useRef<google.maps.PlacesLibrary | null>(null);
  const token = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const request = useRef(0);
  const skipNextLookup = useRef(false);

  const enabled = Boolean(apiKey) && !unavailable;

  useEffect(() => {
    if (!enabled || !apiKey) return;
    if (skipNextLookup.current) {
      skipNextLookup.current = false;
      return;
    }
    const input = value.trim();
    const current = ++request.current;
    const timer = window.setTimeout(async () => {
      if (input.length < 3) {
        setSuggestions([]);
        return;
      }
      try {
        places.current ??= await loadPlaces(apiKey, lang);
        token.current ??= new places.current.AutocompleteSessionToken();
        const { suggestions: results } =
          await places.current.AutocompleteSuggestion.fetchAutocompleteSuggestions({
            input,
            sessionToken: token.current,
            includedRegionCodes: ["ca"],
            locationBias: MONTREAL,
            language: lang,
          });
        if (current !== request.current) return;
        setSuggestions(
          results.flatMap((result) =>
            result.placePrediction
              ? [
                  {
                    id: result.placePrediction.placeId,
                    main: result.placePrediction.mainText?.text ?? result.placePrediction.text.text,
                    secondary: result.placePrediction.secondaryText?.text ?? "",
                    prediction: result.placePrediction,
                  },
                ]
              : [],
          ),
        );
        setActive(-1);
        setOpen(true);
      } catch (error) {
        console.warn("[adresse] Suggestions Google indisponibles", error);
        setUnavailable(true);
      }
    }, 220);
    return () => window.clearTimeout(timer);
  }, [value, enabled, apiKey, lang]);

  async function choose(suggestion: Suggestion) {
    setOpen(false);
    setSuggestions([]);
    try {
      const place = suggestion.prediction.toPlace();
      await place.fetchFields({ fields: ["addressComponents", "formattedAddress", "location"] });
      const number = component(place, "street_number");
      const street = component(place, "route");
      const line1 = [number, street].filter(Boolean).join(" ") || suggestion.main;
      skipNextLookup.current = true;
      onSelect({
        line1,
        line2: component(place, "subpremise"),
        city:
          component(place, "locality") ||
          component(place, "sublocality_level_1") ||
          component(place, "administrative_area_level_3"),
        province: component(place, "administrative_area_level_1", true) || "QC",
        postalCode: component(place, "postal_code"),
        placeId: suggestion.id,
        lat: place.location ? String(place.location.lat()) : "",
        lng: place.location ? String(place.location.lng()) : "",
      });
    } catch (error) {
      console.warn("[adresse] Détails de l’adresse indisponibles", error);
      skipNextLookup.current = true;
      onSelect({ line1: suggestion.main });
    } finally {
      // Une session de saisie se termine à la sélection (facturation Google).
      token.current = null;
    }
  }

  return (
    <div className="address-field">
      <input
        name="line1"
        type="text"
        value={value}
        placeholder={placeholder}
        autoComplete={enabled ? "off" : "address-line1"}
        required
        role={enabled ? "combobox" : undefined}
        aria-expanded={enabled ? open && suggestions.length > 0 : undefined}
        aria-controls={enabled ? listId : undefined}
        aria-autocomplete={enabled ? "list" : undefined}
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        onChange={(event) => {
          onChange(event.target.value);
          // L’adresse a changé : les coordonnées Google précédentes ne s’appliquent plus.
          onSelect({ placeId: "", lat: "", lng: "" });
        }}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 150)}
        onKeyDown={(event) => {
          if (!open || suggestions.length === 0) return;
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActive((index) => (index + 1) % suggestions.length);
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActive((index) => (index <= 0 ? suggestions.length - 1 : index - 1));
          } else if (event.key === "Enter" && active >= 0) {
            event.preventDefault();
            void choose(suggestions[active]);
          } else if (event.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      {enabled && open && suggestions.length > 0 && (
        <ul className="address-field__list" id={listId} role="listbox">
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion.id}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === active}
              className={index === active ? "is-active" : undefined}
              onMouseDown={(event) => {
                event.preventDefault();
                void choose(suggestion);
              }}
            >
              <strong>{suggestion.main}</strong>
              {suggestion.secondary && <span>{suggestion.secondary}</span>}
            </li>
          ))}
          <li className="address-field__credit" aria-hidden="true">
            {credit}
          </li>
        </ul>
      )}
    </div>
  );
}
