import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { initDatabase } from './src/database/db';
import HomeScreen from './src/screens/HomeScreen';
import ParentScreen from './src/screens/ParentScreen';
import RewardsStoreScreen from './src/screens/ShopScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    try {
      initDatabase();
      console.log('Banco de dados e tabelas inicializados com sucesso!');
    } catch (error) {
      console.error('Erro ao inicializar o banco:', error);
    }
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        {/* Tela Principal da Criança */}
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ headerShown: false }} 
        />
        
        {/* Painel de Configuração dos Pais */}
        <Stack.Screen 
          name="Parent" 
          component={ParentScreen} 
          options={{ title: 'Painel dos Pais', headerTintColor: '#2d3436' }} 
        />

        {/* Lojinha de Prêmios */}
        <Stack.Screen 
          name="Shop" 
          component={RewardsStoreScreen} 
          options={{ headerShown: false }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}