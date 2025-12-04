import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text, Card } from 'react-native-paper';
import api from '../services/api';

export default function Vagas({ navigation }) {
  const [vagas, setVagas] = useState([]);

  const carregar = async () => {
    try {
      const { data } = await api.get('/vagas');
      setVagas(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const unsub = navigation.addListener('focus', carregar);
    return unsub;
  }, [navigation]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineMedium" style={{ marginBottom: 10 }}>Vagas</Text>
      <View style={styles.grid}>
        {vagas.map(vaga => (
          <TouchableOpacity key={vaga.id} onPress={() => navigation.navigate('DetalheVaga', { vaga })}>
            <Card style={[styles.card, { backgroundColor: vaga.ocupada ? '#ffb3b3' : '#b2ffb2' }]}>
              <Card.Content>
                <Text variant="titleMedium">Vaga {vaga.numero}</Text>
                <Text>{vaga.ocupada ? 'Ocupada' : 'Livre'}</Text>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 10 },
  card: { width: 140, height: 100, margin: 6, alignItems: 'center', justifyContent: 'center' },
});
