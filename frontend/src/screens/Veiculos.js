import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, FlatList } from 'react-native';
import { List, Button, Avatar } from 'react-native-paper';
import api from '../services/api';

export default function Veiculos({ navigation }) {
  const [lista, setLista] = useState([]);

  const carregar = async () => {
    try {
      const { data } = await api.get('/veiculos');
      setLista(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const unsub = navigation.addListener('focus', carregar);
    return unsub;
  }, [navigation]);

  const renderItem = ({ item }) => {
    const fotoUri = item.foto ? `http://10.0.2.2:3001/uploads/${item.foto}` : null;
    return (
      <List.Item
        title={`ID ${item.id} - ${item.placa}`}
        description={`${item.modelo || ''} ${item.proprietario ? '- ' + item.proprietario : ''}`}
        left={props =>
          fotoUri ? <Avatar.Image size={48} source={{ uri: fotoUri }} /> : <Avatar.Icon size={48} icon="car" />
        }
      />
    );
  };

  return (
    <View style={styles.container}>
      <Button mode="contained" onPress={() => navigation.navigate('CadastrarVeiculo')}>Cadastrar Veículo</Button>

      <FlatList
        data={lista}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        style={{ marginTop: 10 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
});
