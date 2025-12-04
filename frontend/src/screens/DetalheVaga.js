import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button, RadioButton } from 'react-native-paper';
import api from '../services/api';

export default function DetalheVaga({ route, navigation }) {
  const { vaga } = route.params; // objeto vaga inteiro
  const [veiculos, setVeiculos] = useState([]);
  const [selecionado, setSelecionado] = useState('');

  const carregarVeiculos = async () => {
    try {
      const { data } = await api.get('/veiculos');
      setVeiculos(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (!vaga.ocupada) carregarVeiculos();
  }, []);

  const estacionar = async () => {
    if (!selecionado) { Alert.alert('Escolha um veículo'); return; }
    try {
      await api.post('/estacionamento/entrada-vaga', { veiculoId: Number(selecionado), vagaId: vaga.id });
      Alert.alert('Sucesso', `Veículo estacionado na vaga ${vaga.numero}`);
      navigation.goBack();
    } catch (err) {
      console.log(err);
      Alert.alert('Erro', err.response?.data?.message || 'Erro ao estacionar');
    }
  };

  const liberar = async () => {
    try {
      const { data } = await api.get(`/estacionamento/movimentacao-ativa/${vaga.id}`);
      await api.post('/estacionamento/saida', { movimentacaoId: data.id, valor: 0 });
      Alert.alert('Sucesso', 'Vaga liberada');
      navigation.goBack();
    } catch (err) {
      console.log(err);
      Alert.alert('Erro', err.response?.data?.message || 'Erro ao liberar');
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall">Vaga {vaga.numero}</Text>
      <Text>Status: {vaga.ocupada ? 'Ocupada' : 'Livre'}</Text>

      {!vaga.ocupada ? (
        <>
          <Text style={{ marginTop: 12 }}>Escolha o veículo para estacionar:</Text>
          <RadioButton.Group onValueChange={v => setSelecionado(v)} value={selecionado}>
            {veiculos.map(v => (
              <RadioButton.Item key={v.id} label={`ID ${v.id} - ${v.placa}`} value={String(v.id)} />
            ))}
          </RadioButton.Group>
          <Button mode="contained" onPress={estacionar}>Estacionar</Button>
        </>
      ) : (
        <Button mode="contained" onPress={liberar}>Liberar Vaga</Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
});
