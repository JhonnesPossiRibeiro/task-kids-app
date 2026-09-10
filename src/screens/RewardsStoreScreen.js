import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import db from '../database/db';

export default function RewardsStoreScreen({ navigation }) {
  const [rewards, setRewards] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = () => {
    try {
      // Carrega as recompensas cadastradas
      const rewardResults = db.getAllSync('SELECT * FROM rewards ORDER BY cost ASC');
      setRewards(rewardResults);

      // Carrega o saldo atual de estrelas
      const walletResults = db.getAllSync('SELECT * FROM wallet LIMIT 1');
      if (walletResults.length > 0) {
        setTotalPoints(walletResults[0].points);
      }
    } catch (error) {
      console.error('Erro ao carregar dados da lojinha:', error);
    }
  };

  // Resgatar / Comprar recompensa
  const handleBuyReward = (reward) => {
    if (totalPoints < reward.cost) {
      Alert.alert(
        '🌟 Quase lá!',
        `Você precisa de mais ${reward.cost - totalPoints} estrelinhas para resgatar "${reward.title}". Continue cumprindo as tarefas!`
      );
      return;
    }

    Alert.alert(
      '🎁 Resgatar Prêmio?',
      `Deseja gastar ${reward.cost} estrelinhas em "${reward.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sim, quero!', 
          onPress: () => {
            try {
              const newPoints = totalPoints - reward.cost;
              db.runSync('UPDATE wallet SET points = ? WHERE id = 1', [newPoints]);
              setTotalPoints(newPoints);

              Alert.alert(
                '🎉 Oba! Resgate Realizado! 🎉',
                `Mostre esta tela para um adulto para aproveitar o seu prêmio: "${reward.title}"!`
              );
            } catch (error) {
              console.error('Erro ao resgatar prêmio:', error);
              Alert.alert('Ops', 'Não foi possível realizar o resgate.');
            }
          } 
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>⬅️ Voltar</Text>
        </TouchableOpacity>

        {/* Placar de Estrelas */}
        <View style={styles.pointsBadge}>
          <Text style={styles.pointsText}>⭐ {totalPoints}</Text>
        </View>
      </View>

      <Text style={styles.title}>🎁 Lojinha de Prêmios</Text>
      <Text style={styles.subtitle}>Troque suas estrelinhas por momentos legais!</Text>

      {/* Lista de Prêmios */}
      <FlatList
        data={rewards}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const canAfford = totalPoints >= item.cost;

          return (
            <View style={[styles.rewardCard, { opacity: canAfford ? 1 : 0.7 }]}>
              <View style={styles.rewardInfo}>
                <Text style={styles.rewardEmoji}>🏆</Text>
                <View style={styles.rewardTextContainer}>
                  <Text style={styles.rewardTitle}>{item.title}</Text>
                  <Text style={styles.rewardCostText}>Custo: ⭐ {item.cost} estrelas</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.buyButton, { backgroundColor: canAfford ? '#00b894' : '#b2bec3' }]}
                onPress={() => handleBuyReward(item)}
              >
                <Text style={styles.buyButtonText}>
                  {canAfford ? 'Resgatar 🚀' : 'Faltam ⭐'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        }}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🛍️</Text>
            <Text style={styles.emptyText}>A lojinha está vazia!</Text>
            <Text style={styles.emptySubText}>Peça para um adulto adicionar prêmios na Área dos Pais.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f3f4',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  backButton: {
    backgroundColor: '#dfe6e9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  backButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#636e72',
  },
  pointsBadge: {
    backgroundColor: '#ffeaa7',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fdcb6e',
  },
  pointsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d63031',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3436',
  },
  subtitle: {
    fontSize: 13,
    color: '#636e72',
    marginBottom: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  rewardCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rewardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rewardEmoji: {
    fontSize: 30,
    marginRight: 12,
  },
  rewardTextContainer: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3436',
  },
  rewardCostText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#e17055',
    marginTop: 4,
  },
  buyButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  buyButtonText: {
    fontWeight: 'bold',
    color: '#ffffff',
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  emptyEmoji: {
    fontSize: 50,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#636e72',
  },
  emptySubText: {
    fontSize: 13,
    color: '#b2bec3',
    textAlign: 'center',
    marginTop: 5,
    paddingHorizontal: 20,
  },
});