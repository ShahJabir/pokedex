import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

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
};

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
    <ScrollView
      contentContainerStyle={{
        gap: 16,
        padding: 16,
      }}
    >
      {pokemons.map((pokemon: Pokemon) => (
        <View
          key={pokemon.name}
          style={{
            // @ts-ignore
            backgroundColor: colorByType[pokemon.types[0].type.name] + 30,
            padding: 20,
          }}
        >
          <Text style={styles.name}>
            {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
          </Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: 10,
              borderRadius: 20,
            }}
          >
            {pokemon.types.map((type: PokemonType) => (
              <View
                key={type.type.name}
                style={{
                  backgroundColor: lightenHexColor(
                    // @ts-ignore
                    colorByType[type.type.name],
                    0.15,
                  ),
                  padding: 10,
                  borderRadius: 80,
                }}
              >
                <View style={styles.typeBadgeContent}>
                  <Text style={styles.typeIcon}>
                    {
                      // @ts-ignore
                      iconByType[type.type.name]
                    }
                  </Text>
                  <Text style={styles.type}>{type.type.name}</Text>
                </View>
              </View>
            ))}
          </View>
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <Image
              source={{ uri: pokemon.image }}
              style={{ width: 150, height: 150 }}
            />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  name: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
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
});
