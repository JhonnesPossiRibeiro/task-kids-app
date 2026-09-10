import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useHomeData } from "../hooks/useHomeData";

export default function HomeScreen({ navigation }) {
  const {
    selectedChild,
    otherChild,
    readyMissions,
    completedMissions,
    progressPercent,
    completedCount,
    totalTasksCount,
    remainingForWheel,
    handleSwitchChild,
    handleCompleteTask,
    handleUndoTask,
  } = useHomeData();

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Header Superior */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerEmoji}>⭐</Text>
          <View>
            <Text style={styles.headerMainTitle}>Estrelinhas</Text>
            <Text style={styles.headerSubtitle}>Missões</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.starsBadge}>
            <Text style={styles.starIcon}>⭐</Text>
            <Text style={styles.starsCount}>{selectedChild?.points || 0}</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate("Parent")}
          >
            <Text>🛡️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Card: Quem está jogando? */}
        <View style={styles.playerCard}>
          <View style={styles.playerCardTop}>
            <View style={styles.playerCardTitleRow}>
              <Text style={{ fontSize: 16 }}>🎮</Text>
              <Text style={styles.playerCardTitle}>Quem está jogando?</Text>
            </View>
          </View>

          {/* Seletores de Perfil */}
          <View style={styles.profilesRow}>
            {/* Ativo */}
            <View style={styles.activeProfileBox}>
              <View style={styles.profileAvatarActive}>
                <Text>{selectedChild?.avatar || "👧"}</Text>
              </View>
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={styles.activeProfileName}>
                  {selectedChild?.name || "Carregando..."}
                </Text>
                <Text style={styles.activeProfileStars}>
                  ⭐ {selectedChild?.points || 0} estrelas
                </Text>
              </View>
              <Text style={{ color: "#0984e3", fontWeight: "bold" }}>‹</Text>
            </View>

            {/* Inativo (Outro filho, se houver) */}
            {otherChild && otherChild.id !== selectedChild?.id && (
              <TouchableOpacity
                style={styles.inactiveProfileBox}
                onPress={handleSwitchChild}
              >
                <View style={styles.profileAvatarInactive}>
                  <Text>{otherChild.avatar || "👦"}</Text>
                </View>
                <View style={{ marginLeft: 8 }}>
                  <Text style={styles.inactiveProfileName}>
                    {otherChild.name}
                  </Text>
                  <Text style={styles.inactiveProfileStars}>
                    ⭐ {otherChild.points} estrelas
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Botão de Atalho para a Lojinha */}
            <TouchableOpacity
              style={styles.storeShortcutBox}
              onPress={() => navigation.navigate("Shop")} // ou a navegação para a tela da lojinha
            >
              <View style={styles.storeShortcutAvatar}>
                <Text>🎁</Text>
              </View>
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.storeShortcutName}>Lojinha</Text>
                <Text style={styles.storeShortcutSub}>Resgatar</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Barra de Progresso de Missões */}
          <View style={styles.missionProgressContainer}>
            <View style={styles.missionProgressHeader}>
              <Text style={styles.missionProgressTitle}>Missões de Hoje</Text>
              <View style={styles.missionProgressBadge}>
                <Text style={styles.missionProgressBadgeText}>
                  {completedCount} de {totalTasksCount} prontas!
                </Text>
              </View>
              <Text style={styles.xpText}>{progressPercent}% XP</Text>
            </View>

            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${progressPercent}%` },
                ]}
              />
            </View>

            <Text style={styles.missionProgressFooter}>
              Faltam só {remainingForWheel} missões para girar{" "}
              <Text style={{ fontWeight: "bold" }}>Roleta Mágica!</Text> 🎡
            </Text>
          </View>
        </View>

        {/* Seção: Missões Prontas */}
        <View style={styles.sectionHeaderRow}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontSize: 16, marginRight: 6 }}>⚡</Text>
            <Text style={styles.sectionTitle}>Missões Prontas</Text>
          </View>
          <View style={styles.countActiveBadge}>
            <Text style={styles.countActiveText}>
              {readyMissions.length} ativas
            </Text>
          </View>
        </View>

        {/* Lista de Missões Prontas */}
        {readyMissions.length === 0 ? (
          <Text
            style={{
              textAlign: "center",
              color: "#b2bec3",
              marginVertical: 10,
            }}
          >
            Nenhuma missão pendente por hoje! 🎉
          </Text>
        ) : (
          readyMissions.map((item) => (
            <View key={item.id} style={styles.missionCard}>
              <View style={styles.missionCardHeader}>
                <View style={styles.missionCategoryBox}>
                  <Text style={{ fontSize: 18 }}>
                    {item.category.includes("Organização")
                      ? "🛏️"
                      : item.category.includes("Alimentação")
                        ? "🍎"
                        : "📚"}
                  </Text>
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.missionCategoryTag}>{item.category}</Text>
                  <Text style={styles.missionItemTitle}>{item.title}</Text>
                </View>
                <View style={styles.rewardBadge}>
                  <Text style={styles.rewardBadgeText}>
                    ⭐ +{item.reward_points}
                  </Text>
                </View>
              </View>

              <Text style={styles.missionItemDesc}>{item.description}</Text>

              <View style={styles.missionCardFooter}>
                <View style={styles.timeTag}>
                  <Text style={{ fontSize: 11, marginRight: 4 }}>🕒</Text>
                  <Text style={styles.timeTagText}>
                    {item.time || "Qualquer horário"}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.concludeButton}
                  onPress={() => handleCompleteTask(item)}
                >
                  <Text style={styles.concludeButtonText}>Concluir! ✨</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {/* Seção: Missões Cumpridas Hoje */}
        <View style={[styles.sectionHeaderRow, { marginTop: 10 }]}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontSize: 16, marginRight: 6 }}>✅</Text>
            <Text style={styles.sectionTitle}>Missões Cumpridas Hoje</Text>
          </View>
          <View style={styles.countDoneBadge}>
            <Text style={styles.countDoneText}>
              {completedMissions.length} feitas 🎉
            </Text>
          </View>
        </View>

        {/* Lista de Missões Cumpridas (Tocável para desfazer) */}
        {completedMissions.length === 0 ? (
          <Text
            style={{ textAlign: "center", color: "#b2bec3", marginBottom: 20 }}
          >
            Nenhuma missão concluída ainda hoje. Vamos começar? 💪
          </Text>
        ) : (
          completedMissions.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.completedCard}
              onPress={() => handleUndoTask(item)}
              activeOpacity={0.7}
            >
              <View style={styles.completedIconBox}>
                <Text>✏️</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.completedItemTitle}>{item.title}</Text>
                <Text style={styles.completedItemTime}>
                  Concluído (+{item.reward_points} ⭐) •{" "}
                  <Text style={{ color: "#0984e3", fontWeight: "bold" }}>
                    Toque para desfazer ↩️
                  </Text>
                </Text>
              </View>
              <View style={styles.checkCircle}>
                <Text style={{ color: "#00b894", fontWeight: "bold" }}>✓</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", paddingHorizontal: 16, marginBottom: 20 },
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

  scrollContent: { paddingBottom: 30 },

  playerCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    marginTop: 6,
    marginBottom: 16,
    elevation: 2,
  },
  playerCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  playerCardTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  playerCardTitle: { fontSize: 15, fontWeight: "bold", color: "#2d3436" },
  switchButton: {
    backgroundColor: "#f1f2f6",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  switchButtonText: { fontSize: 11, fontWeight: "600", color: "#636e72" },

  profilesRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  activeProfileBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eef6fc",
    borderWidth: 1.5,
    borderColor: "#0984e3",
    borderRadius: 14,
    padding: 10,
  },
  profileAvatarActive: {
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 12,
    elevation: 1,
  },
  activeProfileName: { fontSize: 14, fontWeight: "bold", color: "#2d3436" },
  activeProfileStars: { fontSize: 11, color: "#636e72" },

  inactiveProfileBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#dfe6e9",
    borderRadius: 14,
    padding: 10,
    opacity: 0.8,
  },
  profileAvatarInactive: {
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 12,
  },
  inactiveProfileName: { fontSize: 14, fontWeight: "bold", color: "#636e72" },
  inactiveProfileStars: { fontSize: 11, color: "#b2bec3" },

  missionProgressContainer: {
    backgroundColor: "#fafbfc",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#f1f2f6",
  },
  missionProgressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  missionProgressTitle: { fontSize: 13, fontWeight: "bold", color: "#2d3436" },
  missionProgressBadge: {
    backgroundColor: "#e1f5fe",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  missionProgressBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#0984e3",
  },
  xpText: { fontSize: 12, fontWeight: "bold", color: "#636e72" },

  progressBarBg: {
    height: 8,
    backgroundColor: "#dfe6e9",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#fdcb6e",
    borderRadius: 4,
  },
  missionProgressFooter: { fontSize: 11, color: "#636e72" },

  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#2d3436" },
  countActiveBadge: {
    backgroundColor: "#e1f5fe",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  countActiveText: { fontSize: 11, fontWeight: "bold", color: "#0984e3" },
  countDoneBadge: {
    backgroundColor: "#e8f8f5",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  countDoneText: { fontSize: 11, fontWeight: "bold", color: "#00b894" },

  missionCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  missionCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  missionCategoryBox: {
    backgroundColor: "#f1f2f6",
    padding: 8,
    borderRadius: 12,
  },
  missionCategoryTag: { fontSize: 11, color: "#636e72", fontWeight: "500" },
  missionItemTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#2d3436",
    marginTop: 2,
  },
  rewardBadge: {
    backgroundColor: "#ffeaa7",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
  },
  rewardBadgeText: { fontSize: 12, fontWeight: "bold", color: "#d63031" },
  missionItemDesc: { fontSize: 12, color: "#636e72", marginBottom: 12 },

  missionCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f1f2f6",
    paddingTop: 10,
  },
  timeTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  timeTagText: { fontSize: 11, color: "#636e72", fontWeight: "500" },
  concludeButton: {
    backgroundColor: "#00b894",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    elevation: 1,
  },
  concludeButtonText: { color: "#fff", fontWeight: "bold", fontSize: 13 },

  completedCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    opacity: 0.9,
    elevation: 1,
  },
  completedIconBox: {
    backgroundColor: "#eef2f7",
    padding: 10,
    borderRadius: 12,
  },
  completedItemTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2d3436",
    textDecorationLine: "line-through",
  },
  completedItemTime: { fontSize: 11, color: "#b2bec3", marginTop: 2 },
  checkCircle: {
    backgroundColor: "#e8f8f5",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  bottomButtonsContainer: { marginTop: 10, marginBottom: 20, gap: 10 },
  shopMagicButton: {
    backgroundColor: "#006241",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    elevation: 3,
  },
  shopMagicButtonText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  parentPanelButton: {
    backgroundColor: "#dceefc",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    elevation: 1,
  },
  parentPanelButtonText: { color: "#0984e3", fontWeight: "bold", fontSize: 13 },
  storeShortcutBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#dfe6e9",
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    elevation: 1,
  },
  storeShortcutAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#eef6fc",
    justifyContent: "center",
    alignItems: "center",
  },
  storeShortcutName: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#2d3436",
  },
  storeShortcutSub: {
    fontSize: 11,
    color: "#0984e3",
    fontWeight: "600",
  },
});
