import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useParentData } from "../hooks/useParentData";

export default function ParentScreen() {
  const [activeTab, setActiveTab] = useState("children");

  const [childName, setChildName] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskCategory, setTaskCategory] = useState("estudo");
  const [taskPoints, setTaskPoints] = useState("");
  const [rewardTitle, setRewardTitle] = useState("");
  const [rewardCost, setRewardCost] = useState("");

  const {
    children,
    tasks,
    rewards,
    handleAddChild,
    handleDeleteChild,
    handleAddTask,
    handleDeleteTask,
    handleAddReward,
    handleDeleteReward,
  } = useParentData();

  const categories = [
    { key: "comida", label: "🍽️ Alimentação", color: "#ff7675" },
    { key: "estudo", label: "📚 Estudo", color: "#74b9ff" },
    { key: "organizacao", label: "🧹 Organização", color: "#fdcb6e" },
    { key: "lazer", label: "🧸 Lazer", color: "#55efc4" },
    { key: "descanso", label: "💤 Descanso", color: "#a29bfe" },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Text style={styles.headerTitle}>Painel dos Pais ⚙️</Text>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "children" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("children")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "children" && styles.activeTabText,
            ]}
          >
            👶 Filhos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === "tasks" && styles.activeTab]}
          onPress={() => setActiveTab("tasks")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "tasks" && styles.activeTabText,
            ]}
          >
            📋 Tarefas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "rewards" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("rewards")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "rewards" && styles.activeTabText,
            ]}
          >
            🎁 Prêmios
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "children" ? (
        <View style={{ flex: 1 }}>
          <View style={styles.formContainer}>
            <Text style={styles.sectionHeading}>Cadastrar Filho(a)</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome da Criança (Ex: Rebeca)"
              placeholderTextColor="#999"
              value={childName}
              onChangeText={setChildName}
            />
            <TouchableOpacity
              style={styles.saveChildButton}
              onPress={() => handleAddChild(childName, () => setChildName(""))}
            >
              <Text style={styles.saveButtonText}>Adicionar Criança</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.listTitle}>Crianças Cadastradas:</Text>
          <FlatList
            data={children}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={[styles.card, { borderLeftColor: "#e17055" }]}>
                <View>
                  <Text style={styles.cardTitle}>👶 {item.name}</Text>
                  <Text style={styles.cardSub}>Saldo: {item.points} ⭐</Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteChild(item.id, item.name)}
                >
                  <Text style={styles.deleteButtonText}>🗑️ Excluir</Text>
                </TouchableOpacity>
              </View>
            )}
            contentContainerStyle={styles.listContainer}
          />
        </View>
      ) : activeTab === "tasks" ? (
        <View style={{ flex: 1 }}>
          <View style={styles.formContainer}>
            <Text style={styles.sectionHeading}>Nova Tarefa de Rotina</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Guardar os brinquedos"
              placeholderTextColor="#999"
              value={taskTitle}
              onChangeText={setTaskTitle}
            />
            <TextInput
              style={styles.input}
              placeholder="Quantas estrelas vale? (Ex: 5)"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={taskPoints}
              onChangeText={setTaskPoints}
            />
            <Text style={styles.labelCategory}>Categoria:</Text>
            <View style={styles.categoriesRow}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  style={[
                    styles.categoryBtn,
                    {
                      backgroundColor:
                        taskCategory === cat.key ? cat.color : "#dfe6e9",
                    },
                  ]}
                  onPress={() => setTaskCategory(cat.key)}
                >
                  <Text style={styles.categoryText}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() =>
                handleAddTask(taskTitle, taskPoints, taskCategory, () => {
                  setTaskTitle("");
                  setTaskPoints("");
                })
              }
            >
              <Text style={styles.saveButtonText}>Adicionar Tarefa</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.listTitle}>Tarefas Cadastradas:</Text>
          <FlatList
            data={tasks}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardSub}>
                    Categoria: {item.category} • ⭐ {item.reward_points}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteTask(item.id, item.title)}
                >
                  <Text style={styles.deleteButtonText}>🗑️ Excluir</Text>
                </TouchableOpacity>
              </View>
            )}
            contentContainerStyle={styles.listContainer}
          />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <View style={styles.formContainer}>
            <Text style={styles.sectionHeading}>
              Novo Prêmio para a Lojinha
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 30 minutos de desenho animado"
              placeholderTextColor="#999"
              value={rewardTitle}
              onChangeText={setRewardTitle}
            />
            <TextInput
              style={styles.input}
              placeholder="Custo em estrelas (Ex: 20)"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={rewardCost}
              onChangeText={setRewardCost}
            />
            <TouchableOpacity
              style={styles.saveRewardButton}
              onPress={() =>
                handleAddReward(rewardTitle, rewardCost, () => {
                  setRewardTitle("");
                  setRewardCost("");
                })
              }
            >
              <Text style={styles.saveButtonText}>Adicionar Prêmio</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.listTitle}>Prêmios na Lojinha:</Text>
          <FlatList
            data={rewards}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={[styles.card, { borderLeftColor: "#00b894" }]}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardSub}>Custo: ⭐ {item.cost}</Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteReward(item.id, item.title)}
                >
                  <Text style={styles.deleteButtonText}>🗑️ Excluir</Text>
                </TouchableOpacity>
              </View>
            )}
            contentContainerStyle={styles.listContainer}
          />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2d3436",
    textAlign: "center",
    marginBottom: 15,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#dfe6e9",
    borderRadius: 10,
    padding: 4,
    marginBottom: 15,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: { backgroundColor: "#fff", elevation: 2 },
  tabText: { fontWeight: "600", color: "#636e72", fontSize: 12 },
  activeTabText: { color: "#2d3436" },
  formContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    elevation: 3,
    marginBottom: 15,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2d3436",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#dfe6e9",
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  labelCategory: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2d3436",
    marginBottom: 6,
  },
  categoriesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  categoryBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6 },
  categoryText: { fontSize: 11, fontWeight: "600", color: "#2d3436" },
  saveButton: {
    backgroundColor: "#0984e3",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveRewardButton: {
    backgroundColor: "#00b894",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveChildButton: {
    backgroundColor: "#e17055",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: { color: "#fff", fontSize: 15, fontWeight: "bold" },
  listTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2d3436",
    marginBottom: 8,
  },
  listContainer: { paddingBottom: 20 },
  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    borderLeftWidth: 5,
    borderLeftColor: "#0984e3",
    elevation: 1,
  },
  cardTitle: { fontSize: 15, fontWeight: "600", color: "#2d3436" },
  cardSub: { fontSize: 11, color: "#b2bec3", marginTop: 2 },
  deleteButton: {
    backgroundColor: "#ff7675",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  deleteButtonText: { color: "#fff", fontSize: 11, fontWeight: "bold" },
});
