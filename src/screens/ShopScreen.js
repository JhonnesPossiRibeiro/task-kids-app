import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useParentData } from "../hooks/useParentData";

export default function ShopScreen({ navigation }) {
  const { children, rewards, redeemReward } = useParentData();

  // Pega a criança ativa ou a primeira da lista (fallback para 0 estrelas)
  const activeChild = children.length > 0 ? children[0] : { name: "Criança", points: 0 };
  const userStars = activeChild.points;

  const handleRedeem = (reward) => {
    if (userStars < reward.cost) {
      Alert.alert("Ops! 🛑", `Você ainda precisa de mais ${reward.cost - userStars} estrelas para resgatar este prêmio.`);
      return;
    }

    Alert.alert(
      "Resgatar Prêmio 🎉",
      `Deseja gastar ${reward.cost} estrelas para resgatar "${reward.title}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Resgatar!",
          onPress: () => {
            const success = redeemReward(activeChild.id, reward.cost, reward.title);
            if (success) {
              Alert.alert("Oba! ✨", "Prêmio resgatado com sucesso! Aproveite muito!");
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Header Superior */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerEmoji}>⭐</Text>
          <View>
            <Text style={styles.headerMainTitle}>Estrelinhas</Text>
            <Text style={styles.headerSubtitle}>Lojinha • {activeChild.name}</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.starsBadge}>
            <Text style={styles.starIcon}>⭐</Text>
            <Text style={styles.starsCount}>{userStars}</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Text>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Card do Cofrinho Mágico */}
        <LinearGradient
          colors={["#ffda79", "#ffb142"]}
          style={styles.magicCard}
        >
          <View style={styles.magicIconContainer}>
            <Text style={styles.magicChestEmoji}>🎁</Text>
          </View>
          <Text style={styles.magicTitle}>SEU COFRINHO MÁGICO</Text>
          <View style={styles.magicPointsRow}>
            <Text style={styles.magicPointsNumber}>{userStars}</Text>
            <Text style={styles.magicPointsStar}> ⭐</Text>
            <Text style={styles.magicPointsLabel}> Estrelinhas</Text>
          </View>
          <Text style={styles.magicDescription}>
            Troque suas conquistas diárias por momentos inesquecíveis e prêmios super legais! ✨
          </Text>
        </LinearGradient>

        {/* Seção de Recompensas */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>🎁 Recompensas Disponíveis</Text>
          <View style={styles.optionsBadge}>
            <Text style={styles.optionsBadgeText}>{rewards.length} opções</Text>
          </View>
        </View>

        {/* Lista de Prêmios do Banco */}
        {rewards.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum prêmio na lojinha ainda. Peça para os pais adicionarem no Painel! 💡</Text>
          </View>
        ) : (
          rewards.map((item) => {
            const progress = Math.min(userStars / item.cost, 1.0);
            const ready = userStars >= item.cost;
            const diff = item.cost - userStars;

            return (
              <View key={item.id} style={styles.rewardCard}>
                <View style={styles.rewardTopRow}>
                  <View style={styles.rewardIconBox}>
                    <Text style={{ fontSize: 22 }}>🎁</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.rewardItemTitle}>{item.title}</Text>
                    <Text style={styles.rewardItemDesc}>Recompensa especial da lojinha</Text>
                  </View>
                  {ready && (
                    <View style={styles.readyBadge}>
                      <Text style={styles.readyBadgeText}>
                        🔒 Pronto!
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={styles.costText}>
                  Custo: <Text style={styles.costNumber}>{item.cost} ⭐</Text>
                </Text>

                {/* Barra de Progresso Dinâmica */}
                <View style={styles.progressInfoRow}>
                  <Text style={styles.progressStatusText}>
                    {ready ? "Pronto para resgatar! 🚀" : `Faltam ${diff} estrelas`}
                  </Text>
                  <Text style={styles.progressFraction}>
                    {userStars} / {item.cost} ⭐
                  </Text>
                </View>

                <View style={styles.progressBarBackground}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${progress * 100}%`,
                        backgroundColor: ready ? "#00b894" : "#0984e3",
                      },
                    ]}
                  />
                </View>

                {ready ? (
                  <TouchableOpacity 
                    style={styles.redeemButton}
                    onPress={() => handleRedeem(item)}
                  >
                    <Text style={styles.redeemButtonText}>
                      🎁 Resgatar Prêmio Agora!
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.lockedBottomBox}>
                    <Text style={styles.lockIcon}>🔒</Text>
                    <Text style={styles.lockedText}>Faltam {diff} ⭐ para desbloquear</Text>
                  </View>
                )}
              </View>
            );
          })
        )}

        {/* Card Inferior: Quer um prêmio novo? */}
        <View style={styles.suggestCard}>
          <View style={styles.suggestIconContainer}>
            <Text style={{ fontSize: 24 }}>👨‍👩‍👧‍👦</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.suggestTitle}>Quer um prêmio novo?</Text>
            <Text style={styles.suggestDesc}>
              Peça para o papai ou a mamãe adicionar novas ideias incríveis direto no Painel dos Pais! 💡
            </Text>
          </View>
        </View>
      </ScrollView>
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
  scrollContent: { paddingBottom: 30 },
  magicCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
    elevation: 3,
  },
  magicIconContainer: {
    backgroundColor: "rgba(255,255,255,0.4)",
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
  },
  magicChestEmoji: { fontSize: 32 },
  magicTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#7c5300",
    letterSpacing: 1,
    marginBottom: 6,
  },
  magicPointsRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 8,
  },
  magicPointsNumber: { fontSize: 36, fontWeight: "bold", color: "#2d3436" },
  magicPointsStar: { fontSize: 24 },
  magicPointsLabel: { fontSize: 22, fontWeight: "bold", color: "#2d3436" },
  magicDescription: {
    fontSize: 13,
    color: "#593d00",
    textAlign: "center",
    lineHeight: 18,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#2d3436" },
  optionsBadge: {
    backgroundColor: "#dfe6e9",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  optionsBadgeText: { fontSize: 12, fontWeight: "600", color: "#636e72" },
  emptyContainer: { padding: 20, alignItems: 'center', backgroundColor: '#fff', borderRadius: 16 },
  emptyText: { textAlign: 'center', color: '#b2bec3', fontSize: 13 },
  rewardCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
  },
  rewardTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  rewardIconBox: { backgroundColor: "#f1f2f6", padding: 10, borderRadius: 12 },
  rewardItemTitle: { fontSize: 16, fontWeight: "bold", color: "#2d3436" },
  rewardItemDesc: { fontSize: 12, color: "#636e72", marginTop: 2 },
  readyBadge: {
    backgroundColor: "#e1f5fe",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  readyBadgeText: { fontSize: 10, fontWeight: "bold", color: "#00b894" },
  costText: { fontSize: 13, color: "#636e72", marginBottom: 10 },
  costNumber: { fontWeight: "bold", color: "#d63031" },
  progressInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  progressStatusText: { fontSize: 12, fontWeight: "600", color: "#0984e3" },
  progressFraction: { fontSize: 12, fontWeight: "bold", color: "#2d3436" },
  progressBarBackground: {
    height: 8,
    backgroundColor: "#dfe6e9",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressBarFill: { height: "100%", borderRadius: 4 },
  redeemButton: {
    backgroundColor: "#00b894",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
  },
  redeemButtonText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  lockedBottomBox: {
    flexDirection: "row",
    backgroundColor: "#f1f2f6",
    paddingVertical: 10,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  lockIcon: { fontSize: 12, marginRight: 6 },
  lockedText: { fontSize: 12, fontWeight: "bold", color: "#636e72" },
  suggestCard: {
    flexDirection: "row",
    backgroundColor: "#eef2f7",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginTop: 6,
    marginBottom: 20,
  },
  suggestIconContainer: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 12,
  },
  suggestTitle: { fontSize: 14, fontWeight: "bold", color: "#2d3436" },
  suggestDesc: { fontSize: 11, color: "#636e72", marginTop: 2, lineHeight: 15 },
});