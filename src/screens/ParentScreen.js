import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import db from "../database/db";

// --- HOOK INTEGRADO ---
export function useParentData() {
  const [children, setChildren] = useState([]);
  const [activeChildId, setActiveChildId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [rewards, setRewards] = useState([]);

  const loadData = useCallback(() => {
    try {
      const childResults = db.getAllSync('SELECT * FROM children ORDER BY id ASC');
      setChildren(childResults);

      if (childResults.length > 0 && (!activeChildId || !childResults.some(c => c.id === activeChildId))) {
        setActiveChildId(childResults[0].id);
      } else if (childResults.length === 0) {
        setActiveChildId(null);
      }

      const taskResults = db.getAllSync('SELECT * FROM tasks ORDER BY id ASC');
      setTasks(taskResults);

      const rewardResults = db.getAllSync('SELECT * FROM rewards ORDER BY id DESC');
      setRewards(rewardResults);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  }, [activeChildId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeChild = children.find(c => c.id === activeChildId) || children[0] || null;

  const handleAddChild = (childName, onSuccess) => {
    if (!childName.trim()) {
      Alert.alert('Atenção', 'Digite o nome do(a) filho(a)!');
      return;
    }
    try {
      const result = db.runSync('INSERT INTO children (name, points) VALUES (?, 0)', [childName]);
      loadData();
      if (result.lastInsertRowId) {
        setActiveChildId(result.lastInsertRowId);
      }
      onSuccess();
      Alert.alert('Sucesso!', 'Perfil da criança criado!');
    } catch (error) {
      console.error('Erro ao salvar criança:', error);
    }
  };

  const handleDeleteChild = (id, name) => {
    Alert.alert(
      'Excluir Perfil',
      `Deseja realmente remover o(a) ${name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: () => {
            try {
              db.runSync('DELETE FROM children WHERE id = ?', [id]);
              loadData();
              Alert.alert('Pronto', 'Perfil removido com sucesso!');
            } catch (error) {
              console.error('Erro ao deletar criança:', error);
            }
          }
        }
      ]
    );
  };

  const handleAddTask = (taskTitle, taskPoints, taskCategory, onSuccess) => {
    if (!taskTitle.trim() || !taskPoints.trim()) {
      Alert.alert('Atenção', 'Preencha o título e as estrelas da tarefa!');
      return;
    }

    const pointsNum = parseInt(taskPoints, 10);
    if (isNaN(pointsNum) || pointsNum <= 0) {
      Alert.alert('Atenção', 'O valor das estrelas deve ser maior que zero.');
      return;
    }

    try {
      db.runSync(
        'INSERT INTO tasks (title, category, reward_points, is_recurring) VALUES (?, ?, ?, 1)',
        [taskTitle, taskCategory, pointsNum]
      );
      loadData();
      onSuccess();
      Alert.alert('Sucesso!', 'Tarefa adicionada à rotina diária!');
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
    }
  };

  const handleDeleteTask = (id, title) => {
    Alert.alert(
      'Excluir Tarefa',
      `Deseja realmente remover a tarefa "${title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: () => {
            try {
              db.runSync('DELETE FROM tasks WHERE id = ?', [id]);
              loadData();
              Alert.alert('Pronto', 'Tarefa removida com sucesso!');
            } catch (error) {
              console.error('Erro ao deletar tarefa:', error);
            }
          }
        }
      ]
    );
  };

  const handleAddReward = (rewardTitle, rewardCost, onSuccess) => {
    if (!rewardTitle.trim() || !rewardCost.trim()) {
      Alert.alert('Atenção', 'Preencha o nome do prêmio e o custo em estrelas!');
      return;
    }

    const costNum = parseInt(rewardCost, 10);
    if (isNaN(costNum) || costNum <= 0) {
      Alert.alert('Atenção', 'O custo deve ser um número maior que zero.');
      return;
    }

    try {
      db.runSync('INSERT INTO rewards (title, cost) VALUES (?, ?)', [rewardTitle, costNum]);
      loadData();
      onSuccess();
      Alert.alert('Sucesso!', 'Prêmio adicionado à lojinha!');
    } catch (error) {
      console.error('Erro ao salvar prêmio:', error);
    }
  };

  const handleDeleteReward = (id, title) => {
    Alert.alert(
      'Excluir Prêmio',
      `Deseja realmente remover o prêmio "${title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: () => {
            try {
              db.runSync('DELETE FROM rewards WHERE id = ?', [id]);
              loadData();
              Alert.alert('Pronto', 'Prêmio removido com sucesso!');
            } catch (error) {
              console.error('Erro ao deletar prêmio:', error);
            }
          }
        }
      ]
    );
  };

  return {
    children,
    activeChild,
    activeChildId,
    setActiveChildId,
    tasks,
    rewards,
    handleAddChild,
    handleDeleteChild,
    handleAddTask,
    handleDeleteTask,
    handleAddReward,
    handleDeleteReward,
  };
}

// --- TELA PRINCIPAL ---
export default function ParentScreen() {
  const [activeTab, setActiveTab] = useState("tasks"); // "children" | "tasks" | "rewards"

  const [childName, setChildName] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskCategory, setTaskCategory] = useState("estudo");
  const [taskPoints, setTaskPoints] = useState("2");
  const [rewardTitle, setRewardTitle] = useState("");
  const [rewardCost, setRewardCost] = useState("");

  const {
    children,
    activeChild,
    activeChildId,
    setActiveChildId,
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
    { key: "comida", label: "🍽️ Alimentação", color: "#e8f8f5", textColor: "#00b894" },
    { key: "estudo", label: "📚 Estudo", color: "#e1f5fe", textColor: "#0984e3" },
    { key: "organizacao", label: "🧹 Organização", color: "#fef9e7", textColor: "#f1c40f" },
    { key: "lazer", label: "🧸 Lazer", color: "#e8f8f5", textColor: "#00b894" },
    { key: "descanso", label: "💤 Descanso", color: "#f4f2ff", textColor: "#6c5ce7" },
    { key: "higiene", label: "🪥 Higiene", color: "#e3f2fd", textColor: "#0288d1" },
    { key: "ajudar", label: "🤝 Ajudar", color: "#f3e5f5", textColor: "#8e24aa" },
  ];

  const pointOptions = [
    { value: "1", label: "Leve" },
    { value: "2", label: "Ideal" },
    { value: "3", label: "Média" },
    { value: "5", label: "Herói" },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Header Superior Padrão */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerEmoji}>⭐</Text>
          <View>
            <Text style={styles.headerMainTitle}>Estrelinhas</Text>
            <Text style={styles.headerSubtitle}>Painel Dos Pais</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Banner do Painel */}
          <View style={styles.bannerCard}>
            <View style={styles.bannerTopRow}>
              <View style={styles.bannerIconBox}>
                <Text style={{ fontSize: 22 }}>🛡️</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Text style={styles.bannerTitle}>Painel dos Pais</Text>
                  <Text style={{ fontSize: 14 }}>🔒</Text>
                </View>
                <Text style={styles.bannerSub}>
                  Rotina guiada com afeto e autonomia
                </Text>
              </View>
              <TouchableOpacity style={styles.settingsIconButton}>
                <Text>⚙️</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Filhos Ativos e Botão Gerenciar */}
          <View style={styles.activeChildrenSection}>
            <View style={styles.activeChildrenHeader}>
              <Text style={styles.sectionCategoryTitle}>FILHOS ATIVOS</Text>
              <TouchableOpacity onPress={() => setActiveTab("children")}>
                <Text style={styles.manageText}>👤+ Gerenciar</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.childrenChipsRow}
            >
              {children.map((child) => {
                const isActive = activeChildId === child.id;
                return (
                  <TouchableOpacity
                    key={child.id}
                    style={isActive ? styles.childChipActive : styles.childChipInactive}
                    onPress={() => setActiveChildId(child.id)}
                  >
                    <Text style={{ fontSize: 12 }}>{isActive ? "👧" : "👦"}</Text>
                    <Text style={isActive ? styles.childChipTextActive : styles.childChipTextInactive}>
                      {child.name}
                    </Text>
                    <Text style={isActive ? styles.childChipStarsActive : styles.childChipStarsInactive}>
                      ⭐ {child.points}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity 
                style={styles.addChildChip}
                onPress={() => setActiveTab("children")}
              >
                <Text style={styles.addChildChipText}>+ Filho</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Abas de Navegação */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === "children" && styles.activeTab]}
              onPress={() => setActiveTab("children")}
            >
              <Text style={[styles.tabText, activeTab === "children" && styles.activeTabText]}>
                👶 Filhos
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === "tasks" && styles.activeTab]}
              onPress={() => setActiveTab("tasks")}
            >
              <Text style={[styles.tabText, activeTab === "tasks" && styles.activeTabText]}>
                📋 Tarefas {tasks.length > 0 && `(${tasks.length})`}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === "rewards" && styles.activeTab]}
              onPress={() => setActiveTab("rewards")}
            >
              <Text style={[styles.tabText, activeTab === "rewards" && styles.activeTabText]}>
                🎁 Prêmios
              </Text>
            </TouchableOpacity>
          </View>

          {/* Conteúdo dinâmico baseado na Aba Selecionada */}
          {activeTab === "children" ? (
            <View>
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
              {children.map((item) => (
                <View key={item.id} style={styles.card}>
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
              ))}
            </View>
          ) : activeTab === "tasks" ? (
            <View>
              {/* Formulário Nova Tarefa */}
              <View style={styles.formContainer}>
                <View style={styles.formTopRow}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text style={{ fontSize: 16 }}>➕</Text>
                    <Text style={styles.sectionHeading}>Nova Tarefa de Rotina</Text>
                  </View>
                  <View style={styles.selectedChildBadge}>
                    <Text style={styles.selectedChildBadgeText}>
                      {activeChild ? `${activeChild.name} selecionada` : "Nenhum selecionado"}
                    </Text>
                  </View>
                </View>

                <Text style={styles.inputLabel}>Nome da Missão *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Arrumar o quarto, Escovar dentes..."
                  placeholderTextColor="#b2bec3"
                  value={taskTitle}
                  onChangeText={setTaskTitle}
                />

                <View style={styles.rewardHeaderRow}>
                  <Text style={styles.inputLabel}>Valor em Estrelas</Text>
                  <Text style={styles.magicRewardLabel}>⭐ Recompensa Mágica</Text>
                </View>

                {/* Seletores Rápidos de Pontos */}
                <View style={styles.pointsRow}>
                  {pointOptions.map((opt) => {
                    const isSelected = taskPoints === opt.value;
                    return (
                      <TouchableOpacity
                        key={opt.value}
                        style={[styles.pointOptionCard, isSelected && styles.pointOptionCardSelected]}
                        onPress={() => setTaskPoints(opt.value)}
                      >
                        <Text style={[styles.pointValueText, isSelected && styles.pointValueTextSelected]}>
                          +{opt.value}
                        </Text>
                        <Text style={[styles.pointLabelText, isSelected && styles.pointLabelTextSelected]}>
                          ⭐ {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={styles.inputLabel}>Categoria Temática</Text>
                <View style={styles.categoriesRow}>
                  {categories.map((cat) => {
                    const isSelected = taskCategory === cat.key;
                    return (
                      <TouchableOpacity
                        key={cat.key}
                        style={[
                          styles.categoryBtn,
                          { backgroundColor: isSelected ? "#0984e3" : cat.color },
                        ]}
                        onPress={() => setTaskCategory(cat.key)}
                      >
                        <Text style={[styles.categoryText, isSelected && { color: "#fff" }]}>
                          {cat.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={() =>
                    handleAddTask(taskTitle, taskPoints, taskCategory, () => {
                      setTaskTitle("");
                      setTaskPoints("2");
                    })
                  }
                >
                  <Text style={styles.saveButtonText}>➕ Adicionar Tarefa</Text>
                </TouchableOpacity>
              </View>

              {/* Lista de Tarefas Cadastradas */}
              <View style={styles.listHeaderRow}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={styles.listTitleHeader}>Tarefas Cadastradas</Text>
                  <View style={styles.activeCountBadge}>
                    <Text style={styles.activeCountText}>{tasks.length} ativas</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.filterButton}>
                  <Text style={styles.filterButtonText}>⚙️ Filtrar</Text>
                </TouchableOpacity>
              </View>

              {tasks.map((item) => (
                <View key={item.id} style={styles.taskCard}>
                  <View style={styles.taskCardLeft}>
                    <View style={styles.taskIconBox}>
                      <Text style={{ fontSize: 16 }}>
                        {item.category === "organizacao" ? "🧹" : 
                         item.category === "estudo" ? "📚" : 
                         item.category === "comida" ? "🍽️" : 
                         item.category === "higiene" ? "🪥" : 
                         item.category === "ajudar" ? "🤝" : 
                         item.category === "lazer" ? "🧸" : "💤"}
                      </Text>
                    </View>
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text style={styles.taskCardTitle}>{item.title}</Text>
                      <Text style={styles.taskCardSub}>
                        • {item.category.charAt(0).toUpperCase() + item.category.slice(1)} ⭐ {item.reward_points || item.points || 2}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.taskActionsRow}>
                    <TouchableOpacity style={styles.iconActionBtn}>
                      <Text>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.iconActionBtn}
                      onPress={() => handleDeleteTask(item.id, item.title)}
                    >
                      <Text>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {/* Dica do Guardião */}
              <View style={styles.guardiansTipCard}>
                <View style={styles.guardiansTipIconBox}>
                  <Text>💡</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.guardiansTipTitle}>Dica do Guardião</Text>
                  <Text style={styles.guardiansTipText}>
                    Elogiar o esforço logo após a missão dobra o engajamento natural da criança!
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View>
              <View style={styles.formContainer}>
                <Text style={styles.sectionHeading}>Novo Prêmio para a Lojinha</Text>
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
              {rewards.map((item) => (
                <View key={item.id} style={[styles.card, { borderLeftColor: "#00b894" }]}>
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
              ))}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", paddingHorizontal: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  headerTitleRow: { flexDirection: "row", alignItems: "center" },
  headerEmoji: { fontSize: 28, marginRight: 8 },
  headerMainTitle: { fontSize: 18, fontWeight: "bold", color: "#2d3436" },
  headerSubtitle: { fontSize: 12, color: "#636e72", fontWeight: "500" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  starsBadge: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: "center",
    elevation: 2,
  },
  starIcon: { fontSize: 14, marginRight: 4 },
  starsCount: { fontWeight: "bold", color: "#2d3436", fontSize: 14 },
  profileButton: {
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 20,
    elevation: 2,
  },

  scrollContent: { paddingBottom: 40 },

  bannerCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginTop: 4,
    marginBottom: 14,
    elevation: 2,
  },
  bannerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bannerIconBox: { backgroundColor: "#eef6fc", padding: 10, borderRadius: 14 },
  bannerTitle: { fontSize: 16, fontWeight: "bold", color: "#2d3436" },
  bannerSub: { fontSize: 11, color: "#636e72", marginTop: 2 },
  settingsIconButton: {
    backgroundColor: "#f1f2f6",
    padding: 10,
    borderRadius: 14,
  },

  activeChildrenSection: { marginBottom: 16 },
  activeChildrenHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionCategoryTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#b2bec3",
    letterSpacing: 0.5,
  },
  manageText: { fontSize: 12, fontWeight: "bold", color: "#0984e3" },
  childrenChipsRow: { flexDirection: "row", gap: 8 },
  childChipActive: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eef6fc",
    borderWidth: 1.5,
    borderColor: "#0984e3",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 6,
  },
  childChipTextActive: { fontSize: 13, fontWeight: "bold", color: "#2d3436" },
  childChipStarsActive: { fontSize: 11, color: "#636e72", fontWeight: "600" },
  childChipInactive: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#dfe6e9",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 6,
  },
  childChipTextInactive: { fontSize: 13, fontWeight: "bold", color: "#636e72" },
  childChipStarsInactive: { fontSize: 11, color: "#b2bec3" },
  addChildChip: {
    backgroundColor: "#eef6fc",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    justifyContent: "center",
  },
  addChildChipText: { fontSize: 12, fontWeight: "bold", color: "#0984e3" },

  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#eef2f7",
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  activeTab: { backgroundColor: "#fff", elevation: 2 },
  tabText: { fontWeight: "600", color: "#636e72", fontSize: 12 },
  activeTabText: { color: "#2d3436", fontWeight: "bold" },

  formContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 20,
    elevation: 2,
    marginBottom: 16,
  },
  formTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionHeading: { fontSize: 15, fontWeight: "bold", color: "#2d3436" },
  selectedChildBadge: {
    backgroundColor: "#e8f8f5",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  selectedChildBadgeText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#00b894",
  },

  inputLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#2d3436",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#f1f2f6",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    backgroundColor: "#fcfcfc",
    marginBottom: 14,
  },

  rewardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  magicRewardLabel: { fontSize: 11, fontWeight: "bold", color: "#d4ac0d" },

  pointsRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  pointOptionCard: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  pointOptionCardSelected: {
    backgroundColor: "#fef9e7",
    borderColor: "#f1c40f",
    borderWidth: 1.5,
  },
  pointValueText: { fontSize: 16, fontWeight: "bold", color: "#636e72" },
  pointValueTextSelected: { color: "#d35400" },
  pointLabelText: { fontSize: 10, color: "#b2bec3", marginTop: 2 },
  pointLabelTextSelected: { color: "#d35400", fontWeight: "bold" },

  categoriesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 16,
  },
  categoryBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10 },
  categoryText: { fontSize: 11, fontWeight: "600", color: "#2d3436" },

  saveButton: {
    backgroundColor: "#0984e3",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    elevation: 2,
  },
  saveRewardButton: {
    backgroundColor: "#00b894",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    elevation: 2,
  },
  saveChildButton: {
    backgroundColor: "#e17055",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    elevation: 2,
  },
  saveButtonText: { color: "#fff", fontSize: 14, fontWeight: "bold" },

  listHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  listTitleHeader: { fontSize: 15, fontWeight: "bold", color: "#2d3436" },
  activeCountBadge: {
    backgroundColor: "#eef6fc",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  activeCountText: { fontSize: 10, fontWeight: "bold", color: "#0984e3" },
  filterButton: {
    backgroundColor: "#fff",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  filterButtonText: { fontSize: 11, fontWeight: "bold", color: "#636e72" },

  listTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#2d3436",
    marginBottom: 10,
  },

  taskCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 1,
  },
  taskCardLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  taskIconBox: { backgroundColor: "#f1f2f6", padding: 10, borderRadius: 12 },
  taskCardTitle: { fontSize: 14, fontWeight: "bold", color: "#2d3436" },
  taskCardSub: { fontSize: 11, color: "#b2bec3", marginTop: 2 },
  taskActionsRow: { flexDirection: "row", gap: 6 },
  iconActionBtn: { backgroundColor: "#f8f9fa", padding: 8, borderRadius: 10 },

  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#0984e3",
    elevation: 1,
  },
  cardTitle: { fontSize: 14, fontWeight: "bold", color: "#2d3436" },
  cardSub: { fontSize: 11, color: "#b2bec3", marginTop: 2 },
  deleteButton: { backgroundColor: "#f8f9fa", padding: 8, borderRadius: 10 },
  deleteButtonText: { fontSize: 12 },

  guardiansTipCard: {
    backgroundColor: "#eef6fc",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  guardiansTipIconBox: {
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 10,
    elevation: 1,
  },
  guardiansTipTitle: { fontSize: 12, fontWeight: "bold", color: "#0984e3" },
  guardiansTipText: {
    fontSize: 11,
    color: "#636e72",
    marginTop: 2,
    lineHeight: 15,
  },
});