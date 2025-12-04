import React, { useEffect, useState } from 'react';
import { View, StyleSheet, RefreshControl, ScrollView } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import api from '../services/api';

export default function Dashboard({ navigation }) {
  const [status, setStatus] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadStatus = async () => {
    try {
      const { data } = await api.get('/vagas/status');
      setStatus(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStatus();
    setRefreshing(false);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text variant="headlineLarge" style={styles.title}>Estacionamento</Text>

      {status && (
        <View style={styles.cards}>
          <Card style={styles.card}>
            <Card.Content>
              <Text>Total</Text>
              <Text variant="headlineMedium">{status.total}</Text>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text>Livres</Text>
              <Text variant="headlineMedium" style={{ color: 'green' }}>{status.livres}</Text>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text>Ocupadas</Text>
              <Text variant="headlineMedium" style={{ color: 'red' }}>{status.ocupadas}</Text>
            </Card.Content>
          </Card>
        </View>
      )}

      <Button mode="contained" style={styles.button} onPress={() => navigation.navigate('Vagas')}>Ver Vagas</Button>
      <Button mode="outlined" style={styles.button} onPress={() => navigation.navigate('Veiculos')}>Gerenciar Veículos</Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flexGrow: 1 },
  title: { marginBottom: 20 },
  cards: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  card: { width: '30%', padding: 10 },
  button: { marginTop: 12 },
});
