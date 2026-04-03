import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

interface pokemonFetch {
  name: string;
  url: string;
}

interface Pokemon {
  name: string;
  image: string;
  imageBack: string;
  imageShiny: string;
  types: PokemonType[];
}

interface PokemonType {
  type: {
    name: string;
    url: string;
  };
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
        "https://pokeapi.co/api/v2/pokemon/?limit=20",
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
    <ScrollView>
      {pokemons.map((pokemon: Pokemon) => (
        <View key={pokemon.name}>
          <Text style={styles.name}>{pokemon.name}</Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-start",
              gap: 10,
            }}
          >
            {pokemon.types.map((type: PokemonType) => (
              <Text key={type.type.name} style={styles.type}>
                {type.type.name}
              </Text>
            ))}
          </View>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Image
              source={{ uri: pokemon.image }}
              style={{ width: 150, height: 150 }}
            />
            <Image
              source={{ uri: pokemon.imageBack }}
              style={{ width: 150, height: 150 }}
            />
            <Image
              source={{ uri: pokemon.imageShiny }}
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
  },
  type: {
    fontSize: 16,
  },
});
