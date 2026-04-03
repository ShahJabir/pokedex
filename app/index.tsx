import { Link } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface pokemonFetch {
  name: string;
  url: string;
}

interface Pokemon {
  name: string;
  image: string;
  types: PokemonType[];
}

interface PokemonType {
  type: {
    name: string;
    url: string;
  };
}

const colorByType = {
  normal: "#a8a878",
  fire: "#f08030",
  water: "#6890f0",
  electric: "#f8d030",
  grass: "#78c850",
  ice: "#98d8d8",
  fighting: "#c03028",
  poison: "#a040a0",
  ground: "#e0c068",
  flying: "#a890f0",
  psychic: "#f85888",
  bug: "#a8b820",
  rock: "#b8a038",
  ghost: "#705898",
  dragon: "#7038f8",
  dark: "#705848",
  steel: "#b8b8d0",
  fairy: "#ee99ac",
} as const;

const iconByType = {
  normal: "⚪",
  fire: "🔥",
  water: "💧",
  electric: "⚡",
  grass: "🌿",
  ice: "❄️",
  fighting: "🥊",
  poison: "☠️",
  ground: "🪨",
  flying: "🪽",
  psychic: "🔮",
  bug: "🐛",
  rock: "⛰️",
  ghost: "👻",
  dragon: "🐉",
  dark: "🌑",
  steel: "⚙️",
  fairy: "✨",
};

function lightenHexColor(hex: string, amount: number) {
  const safeHex = hex.replace("#", "");
  const r = parseInt(safeHex.substring(0, 2), 16);
  const g = parseInt(safeHex.substring(2, 4), 16);
  const b = parseInt(safeHex.substring(4, 6), 16);

  const lighten = (channel: number) =>
    Math.min(255, Math.round(channel + (255 - channel) * amount));

  const rr = lighten(r).toString(16).padStart(2, "0");
  const gg = lighten(g).toString(16).padStart(2, "0");
  const bb = lighten(b).toString(16).padStart(2, "0");

  return `#${rr}${gg}${bb}`;
}

function hexToRgba(hex: string, alpha: number) {
  const safeHex = hex.replace("#", "");
  const r = parseInt(safeHex.substring(0, 2), 16);
  const g = parseInt(safeHex.substring(2, 4), 16);
  const b = parseInt(safeHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getTypeColor(typeName?: string) {
  if (!typeName) {
    return "#94a3b8";
  }
  return colorByType[typeName as keyof typeof colorByType] ?? "#94a3b8";
}

export default function Index() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  useEffect(() => {
    // fetch pokemon
    fetchPokemon();
  }, []);
  async function fetchPokemon() {
    try {
      const response = await fetch(
        "https://pokeapi.co/api/v2/pokemon/?limit=25",
      );
      const data = await response.json();
      // Fetch detailed info for each Pokemon in parallel
      const detailedPokemons = await Promise.all(
        data.results.map(async (pokemon: pokemonFetch) => {
          const res = await fetch(pokemon.url);
          const details = await res.json();
          return {
            name: pokemon.name,
            image: details.sprites.front_default,
            imageBack: details.sprites.back_default,
            imageShiny: details.sprites.front_shiny,
            types: details.types,
          };
        }),
      );
      setPokemons(detailedPokemons);
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {pokemons.map((pokemon: Pokemon) => {
        const mainType = getTypeColor(pokemon.types[0]?.type.name);

        return (
          <Link
            asChild
            key={pokemon.name}
            href={{ pathname: "./details", params: { name: pokemon.name } }}
          >
            <Pressable
              style={[
                styles.card,
                {
                  backgroundColor: lightenHexColor(mainType, 0.45),
                  borderColor: hexToRgba(mainType, 0.75),
                },
              ]}
            >
              <Text style={styles.name}>
                {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
              </Text>
              <View style={styles.typeRow}>
                {pokemon.types.map((type: PokemonType) => (
                  <View
                    key={type.type.name}
                    style={[
                      styles.typeBadge,
                      {
                        backgroundColor: lightenHexColor(
                          getTypeColor(type.type.name),
                          0.15,
                        ),
                      },
                    ]}
                  >
                    <View style={styles.typeBadgeContent}>
                      <Text style={styles.typeIcon}>
                        {iconByType[type.type.name as keyof typeof iconByType]}
                      </Text>
                      <Text style={styles.type}>{type.type.name}</Text>
                    </View>
                  </View>
                ))}
              </View>
              <View style={styles.imageWrap}>
                <Image source={{ uri: pokemon.image }} style={styles.image} />
              </View>
            </Pressable>
          </Link>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#f1f5f9",
  },
  content: {
    gap: 16,
    padding: 16,
    paddingBottom: 24,
  },
  card: {
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  typeRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 10,
    borderRadius: 20,
    marginBottom: 8,
  },
  typeBadge: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 80,
  },
  type: {
    fontSize: 13,
    fontWeight: "800",
    textTransform: "capitalize",
    letterSpacing: 0.4,
    textAlign: "center",
    color: "#f8fafc",
    textShadowColor: "rgba(0, 0, 0, 0.35)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  typeBadgeContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  typeIcon: {
    fontSize: 16,
  },
  imageWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 150,
    height: 150,
  },
});
