import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import db from '../database/db';

export function useParentData() {
  const [children, setChildren] = useState([]);
  const [activeChildId, setActiveChildId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [rewards, setRewards] = useState([]);

  const loadData = useCallback(() => {
    try {
      const childResults = db.getAllSync('SELECT * FROM children ORDER BY id ASC');
      setChildren(childResults);

      // Se houver crianças e nenhuma ativa selecionada, define a primeira como padrão
      if (childResults.length > 0 && (!activeChildId || !childResults.some(c => c.id === activeChildId))) {
        setActiveChildId(childResults[0].id);
      } else if (childResults.length === 0) {
        setActiveChildId(null);
      }

      const taskResults = db.getAllSync('SELECT * FROM tasks ORDER BY id DESC');
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

  // Criança ativa atual
  const activeChild = children.find(c => c.id === activeChildId) || children[0] || null;

  // --- GERENCIAMENTO DE FILHOS ---
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

  // --- ADICIONAR / REMOVER ESTRELAS MANUALMENTE (Painel dos Pais) ---
  const handleUpdatePoints = (childId, delta) => {
    try {
      const current = db.getFirstSync('SELECT points FROM children WHERE id = ?', [childId]);
      if (!current) return;

      const newPoints = Math.max(0, current.points + delta);
      db.runSync('UPDATE children SET points = ? WHERE id = ?', [newPoints, childId]);
      loadData();
    } catch (error) {
      console.error('Erro ao atualizar pontos:', error);
    }
  };

  // --- TAREFAS ---
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

  // --- PRÊMIOS E LOJINHA ---
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

  const redeemReward = (childId, cost, rewardTitle) => {
    try {
      const child = db.getFirstSync('SELECT points FROM children WHERE id = ?', [childId]);
      if (!child || child.points < cost) {
        Alert.alert('Ops! 🛑', 'Estrelas insuficientes para resgatar este prêmio.');
        return false;
      }

      const newPoints = child.points - cost;
      db.runSync('UPDATE children SET points = ? WHERE id = ?', [newPoints, childId]);
      
      const today = new Date().toISOString();
      db.runSync('INSERT INTO redemptions (child_id, reward_title, cost, date) VALUES (?, ?, ?, ?)', [
        childId, rewardTitle, cost, today
      ]);

      loadData();
      return true;
    } catch (error) {
      console.error('Erro ao resgatar prêmio:', error);
      return false;
    }
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
    handleUpdatePoints,
    handleAddTask,
    handleDeleteTask,
    handleAddReward,
    handleDeleteReward,
    redeemReward,
  };
}