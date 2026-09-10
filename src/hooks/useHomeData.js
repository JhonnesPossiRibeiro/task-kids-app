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
          const updatedCurrent = childResults.find(c => c.id === prev.id);
          return updatedCurrent || childResults[0];
        });
      } else {
        setSelectedChild(null);
      }

      const taskResults = db.getAllSync('SELECT * FROM tasks ORDER BY id ASC');
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

  const handleSwitchChild = () => {
    if (children.length <= 1) return;
    const currentIndex = children.findIndex(c => c.id === selectedChild?.id);
    const nextIndex = (currentIndex + 1) % children.length;
    setSelectedChild(children[nextIndex]);
  };

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

  const handleUndoTask = (task) => {
    if (!selectedChild) return;

    try {
      db.runSync(
        'UPDATE tasks SET completed_today = 0 WHERE id = ?',
        [task.id]
      );

      const newPoints = Math.max(0, selectedChild.points - task.reward_points);
      db.runSync(
        'UPDATE children SET points = ? WHERE id = ?',
        [newPoints, selectedChild.id]
      );

      loadData();
    } catch (error) {
      console.error('Erro ao desmarcar tarefa:', error);
    }
  };

  const readyMissions = tasks.filter(t => t.completed_today === 0);
  const completedMissions = tasks.filter(t => t.completed_today === 1);

  const totalTasksCount = tasks.length;
  const completedCount = completedMissions.length;
  const progressPercent = totalTasksCount > 0 ? Math.round((completedCount / totalTasksCount) * 100) : 0;
  const remainingForWheel = Math.max(0, totalTasksCount - completedCount);

  const otherChild = children.find(c => c.id !== selectedChild?.id) || children[0];

  return {
    children,
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
  };
}