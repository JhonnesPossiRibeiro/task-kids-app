import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import db from '../database/db';

export function useHomeData() {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [tasks, setTasks] = useState([]);

  const loadData = useCallback(() => {
    try {
      const childResults = db.getAllSync('SELECT * FROM children ORDER BY id ASC');
      setChildren(childResults);

      if (childResults.length > 0) {
        setSelectedChild(prev => {
          if (!prev || !childResults.some(c => c.id === prev.id)) {
            return childResults[0];
          }
          return prev;
        });
      } else {
        setSelectedChild(null);
      }

      const taskResults = db.getAllSync('SELECT * FROM tasks ORDER BY id DESC');
      setTasks(taskResults);
    } catch (error) {
      console.error('Erro ao carregar dados na Home:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleCompleteTask = (task) => {
    if (!selectedChild) {
      Alert.alert('Atenção', 'Selecione quem está jogando no topo da tela!');
      return;
    }

    if (task.completed_today === 1) {
      Alert.alert('Eba!', 'Essa tarefa já foi concluída hoje!');
      return;
    }

    try {
      db.runSync(
        'UPDATE tasks SET completed_today = 1 WHERE id = ?',
        [task.id]
      );

      const newPoints = selectedChild.points + task.reward_points;
      db.runSync(
        'UPDATE children SET points = ? WHERE id = ?',
        [newPoints, selectedChild.id]
      );

      Alert.alert('Parabéns! 🌟', `Você ganhou ${task.reward_points} estrelinhas!`);
      loadData();
    } catch (error) {
      console.error('Erro ao concluir tarefa:', error);
    }
  };

  return {
    children,
    selectedChild,
    setSelectedChild,
    tasks,
    handleCompleteTask,
  };
}