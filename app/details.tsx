import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface PokemonType {
  type: {
    name: string;
  };
}

interface PokemonStat {
  base_stat: number;
  stat: {
    name: string;
  };
}

interface PokemonDetails {
  name: string;
  height: number;
  weight: number;
  types: PokemonType[];
  stats: PokemonStat[];
  sprites: {
    front_default: string | null;
    front_shiny: string | null;
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

export default function Details() {
  const params = useLocalSearchParams();
  const rawName = params.name;
  const name = Array.isArray(rawName) ? (rawName[0] ?? "") : (rawName ?? "");

  const [pokemon, setPokemon] = useState<PokemonDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const displayName = useMemo(
    () => (name ? name.charAt(0).toUpperCase() + name.slice(1) : "Details"),
    [name],
  );

  const mainTypeColor = useMemo(() => {
    const typeName = pokemon?.types?.[0]?.type?.name;
    if (!typeName) {
      return "#334155";
    }
    return colorByType[typeName as keyof typeof colorByType] ?? "#334155";
  }, [pokemon]);

  useEffect(() => {
    let cancelled = false;

    async function fetchPokemonDetails() {
      if (!name) {
        if (!cancelled) {
          setError("Pokemon name is missing.");
          setLoading(false);
        }
        return;
      }

      try {
        if (!cancelled) {
          setLoading(true);
          setError(null);
        }

        const response = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${name}`,
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch pokemon: ${response.status}`);
        }

        const data = await response.json();
        if (!cancelled) {
          setPokemon(data);
        }
      } catch (fetchError) {
        const message =
          fetchError instanceof Error
            ? fetchError.message
            : "Something went wrong.";
        if (!cancelled) {
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchPokemonDetails();

    return () => {
      cancelled = true;
    };
  }, [name]);

  return (
    <>
      <Stack.Screen
        options={{
          title: displayName,
          headerShown: true,
          headerTransparent: Platform.OS === "android",
          headerStyle: { backgroundColor: mainTypeColor },
          headerTintColor: "#ffffff",
        }}
      />
      <View style={styles.modalShell}>
        <ScrollView
          style={styles.screen}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.centerState}>
              <ActivityIndicator size="large" color={mainTypeColor} />
              <Text style={styles.stateText}>Loading pokemon...</Text>
            </View>
          ) : null}

          {!loading && error ? (
            <View style={styles.centerState}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {!loading && !error && pokemon ? (
            <View style={[styles.card, { borderColor: mainTypeColor }]}>
              <Text style={styles.name}>{displayName}</Text>

              <View style={styles.imageRow}>
                <Image
                  source={{ uri: pokemon.sprites.front_default ?? undefined }}
                  style={styles.image}
                />
                <Image
                  source={{ uri: pokemon.sprites.front_shiny ?? undefined }}
                  style={styles.image}
                />
              </View>

              <View style={styles.typeRow}>
                {pokemon.types.map((item) => {
                  const typeName = item.type.name;
                  const badgeColor =
                    colorByType[typeName as keyof typeof colorByType] ??
                    "#64748b";

                  return (
                    <View
                      key={typeName}
                      style={[
                        styles.typeBadge,
                        { backgroundColor: badgeColor },
                      ]}
                    >
                      <Text style={styles.typeText}>{typeName}</Text>
                    </View>
                  );
                })}
              </View>

              <View style={styles.metaGrid}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Height</Text>
                  <Text style={styles.metaValue}>
                    {(pokemon.height / 10).toFixed(1)} m
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Weight</Text>
                  <Text style={styles.metaValue}>
                    {(pokemon.weight / 10).toFixed(1)} kg
                  </Text>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Base Stats</Text>
              <View style={styles.statsList}>
                {pokemon.stats.map((item) => (
                  <View key={item.stat.name} style={styles.statRow}>
                    <Text style={styles.statName}>
                      {item.stat.name.replace("-", " ")}
                    </Text>
                    <Text style={styles.statValue}>{item.base_stat}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#f8fafc",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  modalShell: {
    flex: 1,
    ...(Platform.OS === "android"
      ? {
          backgroundColor: "rgba(15, 23, 42, 0.35)",
          justifyContent: "flex-end",
          paddingTop: 72,
        }
      : {}),
  },
  centerState: {
    minHeight: 300,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  stateText: {
    fontSize: 16,
    color: "#334155",
  },
  errorText: {
    fontSize: 16,
    color: "#b91c1c",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderRadius: 28,
    overflow: "hidden",
    padding: 16,
    gap: 14,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  name: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    color: "#0f172a",
  },
  imageRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  image: {
    width: 140,
    height: 140,
  },
  typeRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  typeBadge: {
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  typeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metaGrid: {
    flexDirection: "row",
    gap: 10,
  },
  metaItem: {
    flex: 1,
    backgroundColor: "#e2e8f0",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  metaLabel: {
    fontSize: 12,
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metaValue: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  statsList: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    overflow: "hidden",
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  statName: {
    textTransform: "capitalize",
    color: "#334155",
  },
  statValue: {
    fontWeight: "700",
    color: "#0f172a",
  },
});
