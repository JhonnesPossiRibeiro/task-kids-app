import React from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useHomeData } from "../hooks/useHomeData";

export default function HomeScreen({ navigation }) {
  const {
    children,
    selectedChild,
    setSelectedChild,
    tasks,
    handleCompleteTask,
  } = useHomeData();

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎮 Missões do Dia</Text>

        {children.length > 0 ? (
          <View style={styles.childSelectorContainer}>
            <Text style={styles.selectorLabel}>Quem está jogando?</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.childScroll}
            >
              {children.map((child) => (
                <TouchableOpacity
                  key={child.id}
                  style={[
                    styles.childChip,
                    selectedChild?.id === child.id && styles.activeChildChip,
                  ]}
                  onPress={() => setSelectedChild(child)}
                >
                  <Text
                    style={[
                      styles.childChipText,
                      selectedChild?.id === child.id &&
                        styles.activeChildChipText,
                    ]}
                  >
                    👶 {child.name} ({child.points} ⭐)
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.noChildAlert}
            onPress={() => navigation.navigate("Parent")}
          >
            <Text style={styles.noChildText}>
              ⚠️ Nenhum filho cadastrado. Clique aqui para cadastrar!
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.sectionTitle}>Tarefas Disponíveis:</Text>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.taskCard,
              item.completed_today === 1 && styles.taskCompleted,
            ]}
            onPress={() => handleCompleteTask(item)}
            activeOpacity={0.8}
          >
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text
                style={[
                  styles.taskTitle,
                  item.completed_today === 1 && styles.textCompleted,
                ]}
              >
                {item.title}
              </Text>
              <Text style={styles.taskCategory}>
                Categoria: {item.category}
              </Text>
            </View>
            <View style={styles.rewardBadge}>
              <Text style={styles.rewardText}>⭐ {item.reward_points}</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContainer}
      />

      <View style={styles.footer}>
        {/* Botão da Lojinha */}
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => navigation.navigate("RewardsStore")}
        >
          <Text style={styles.shopButtonText}>🎁 Lojinha de Prêmios</Text>
        </TouchableOpacity>

        {/* Botão do Painel dos Pais */}
        <TouchableOpacity
          style={styles.parentButton}
          onPress={() => navigation.navigate("Parent")}
        >
          <Text style={styles.parentButtonText}>⚙️ Painel dos Pais</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", paddingHorizontal: 20 },
  header: { marginTop: 10, marginBottom: 15 },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2d3436",
    textAlign: "center",
    marginBottom: 10,
  },
  childSelectorContainer: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 12,
    elevation: 2,
  },
  selectorLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#636e72",
    marginBottom: 6,
  },
  childScroll: { flexDirection: "row" },
  childChip: {
    backgroundColor: "#dfe6e9",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
  },
  activeChildChip: { backgroundColor: "#0984e3" },
  childChipText: { fontSize: 14, fontWeight: "bold", color: "#2d3436" },
  activeChildChipText: { color: "#fff" },
  noChildAlert: {
    backgroundColor: "#ffeaa7",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  noChildText: { color: "#d63031", fontWeight: "bold", fontSize: 13 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2d3436",
    marginBottom: 10,
  },
  listContainer: { paddingBottom: 20 },
  taskCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    borderLeftWidth: 5,
    borderLeftColor: "#0984e3",
    elevation: 2,
  },
  taskCompleted: {
    backgroundColor: "#f1f2f6",
    borderLeftColor: "#00b894",
    opacity: 0.7,
  },
  taskTitle: { fontSize: 16, fontWeight: "600", color: "#2d3436" },
  textCompleted: { textDecorationLine: "line-through", color: "#b2bec3" },
  taskCategory: { fontSize: 12, color: "#b2bec3", marginTop: 4 },
  rewardBadge: {
    backgroundColor: "#ffeaa7",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  rewardText: { fontWeight: "bold", color: "#d63031", fontSize: 13 },
  footer: {
    paddingTop: 8,
    paddingBottom: 50,
    backgroundColor: "#f8f9fa",
    gap: 10,
  },
  shopButton: {
    backgroundColor: "#00b894",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    elevation: 3,
  },
  shopButtonText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  parentButton: {
    backgroundColor: "#636e72",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    elevation: 3,
  },
  parentButtonText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
});
