import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { List, Button, Avatar, IconButton } from 'react-native-paper';
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

  const excluir = async (id) => {
    Alert.alert('Confirmação', 'Deseja realmente excluir esse veículo?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/veiculos/${id}`);
            carregar();
          } catch (err) {
            console.log(err);
            Alert.alert('Erro', 'Não foi possível excluir');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => {
    const fotoUri = item.foto ? `http://192.168.15.9:3001/uploads/${item.foto}` : null;
    return (
      <List.Item
        title={`ID ${item.id} - ${item.placa}`}
        description={`${item.modelo || ''} ${item.proprietario ? '- ' + item.proprietario : ''}`}
        left={props =>
          fotoUri ? <Avatar.Image size={48} source={{ uri: fotoUri }} /> : <Avatar.Icon size={48} icon="car" />
        }
        right={props => (
          <>
            <IconButton icon="pencil" onPress={() => navigation.navigate('DetalheCarro', { id: item.id })} />
            <IconButton icon="delete" onPress={() => excluir(item.id)} />
          </>
        )}
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

const styles = StyleSheet.create({ container: { padding: 20, flex: 1 } });
