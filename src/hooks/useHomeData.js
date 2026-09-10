import { useState, useCallback, useEffect } from 'react';
import { Alert, AppState } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import db from '../database/db';

export function useHomeData() {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [tasks, setTasks] = useState([]);

  const checkDayAndLoadData = useCallback(() => {
    try {
      // 1. REGRA DE VIRADA DE DIA: Verificar se mudou o dia (com base na data atual do celular)
      const todayStr = new Date().toISOString().split('T')[0]; // Formato "YYYY-MM-DD"
      
      db.runSync(`
        CREATE TABLE IF NOT EXISTS app_settings (
          key TEXT PRIMARY KEY,
          value TEXT
        );
      `);

      const lastDateRow = db.getFirstSync("SELECT value FROM app_settings WHERE key = 'last_reset_date'");
      
      console.log('Data salva no DB:', lastDateRow?.value, '| Data atual do celular:', todayStr);

      if (!lastDateRow || lastDateRow.value !== todayStr) {
        console.log('Virou o dia! Resetando tarefas e estrelas...');
        
        // Reseta todas as tarefas para pendentes (completed_today = 0)
        db.runSync('UPDATE tasks SET completed_today = 0');
        
        // Se você também quer zerar as estrelas das crianças na virada do dia:
        db.runSync('UPDATE children SET points = 0');
        
        // Atualiza a última data registrada para hoje
        db.runSync(
          "INSERT OR REPLACE INTO app_settings (key, value) VALUES ('last_reset_date', ?)",
          [todayStr]
        );
      }

      // 2. Carregar crianças
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

      // 3. Carregar tarefas atualizadas
      const taskResults = db.getAllSync('SELECT * FROM tasks ORDER BY id ASC');
      setTasks(taskResults);
    } catch (error) {
      console.error('Erro ao carregar dados na Home:', error);
    }
  }, []);

  // Executa toda vez que a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      checkDayAndLoadData();
    }, [checkDayAndLoadData])
  );

  // Executa também caso o app volte do fundo (background) para o primeiro plano (foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        checkDayAndLoadData();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [checkDayAndLoadData]);

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
      checkDayAndLoadData();
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

      checkDayAndLoadData();
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