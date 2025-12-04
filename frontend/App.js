import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Dashboard from './src/screens/Dashboard';
import Veiculos from './src/screens/Veiculos';
import CadastrarVeiculo from './src/screens/CadastrarVeiculo';
import Vagas from './src/screens/Vagas';
import DetalheVaga from './src/screens/DetalheVaga';
import DetalheCarro from "./src/screens/DetalheCarro";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Dashboard">
          <Stack.Screen name="Dashboard" component={Dashboard} />
          <Stack.Screen name="Vagas" component={Vagas} />
          <Stack.Screen name="DetalheVaga" component={DetalheVaga} />
          <Stack.Screen name="Veiculos" component={Veiculos} />
          <Stack.Screen name="CadastrarVeiculo" component={CadastrarVeiculo} />
          <Stack.Screen name="DetalheCarro" component={DetalheCarro} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
