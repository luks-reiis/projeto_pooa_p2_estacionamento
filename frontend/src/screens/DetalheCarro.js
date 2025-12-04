import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';

export default function DetalheCarro({ route, navigation }) {
  const { id } = route.params;
  const [carro, setCarro] = useState(null);
  const [foto, setFoto] = useState(null);

  const carregar = async () => {
    try {
      const { data } = await api.get(`/veiculos/${id}`);
      setCarro(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => { carregar(); }, []);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) { Alert.alert('Permissão negada'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!result.canceled) return;
    setFoto(result.assets[0]);
  };

  const salvar = async () => {
    try {
      const data = new FormData();
      data.append('placa', carro.placa);
      data.append('modelo', carro.modelo || '');
      data.append('cor', carro.cor || '');
      data.append('proprietario', carro.proprietario || '');
      if (foto) {
        data.append('foto', {
          uri: foto.uri,
          name: `foto_${Date.now()}.jpg`,
          type: 'image/jpeg'
        });
      }
      // Se quiser manter PUT sem multipart no backend, faça endpoint separado. Aqui vamos usar POST para substituir:
      await api.put(`/veiculos/${id}`, { placa: carro.placa, modelo: carro.modelo, cor: carro.cor, proprietario: carro.proprietario });
      // Nota: se quiser permitir atualizar foto via multer/PUT, é preciso adaptar backend para aceitar multipart no PUT.
      Alert.alert('Sucesso', 'Dados atualizados');
      navigation.goBack();
    } catch (err) {
      console.log(err);
      Alert.alert('Erro', 'Não foi possível salvar');
    }
  };

  if (!carro) return null;

  const fotoUri = foto ? foto.uri : (carro.foto ? `http://192.168.15.9:3001/uploads/${carro.foto}` : null);

  return (
    <View style={styles.container}>
      {fotoUri && (
        <Image
            source={{ uri: fotoUri }}
            style={styles.foto}
            resizeMode="contain"
        />
        )}
      <Button mode="outlined" onPress={pickImage}>Escolher nova foto</Button>

      <TextInput label="Placa" value={carro.placa} onChangeText={v => setCarro({ ...carro, placa: v })} style={{ marginTop: 10 }} />
      <TextInput label="Modelo" value={carro.modelo} onChangeText={v => setCarro({ ...carro, modelo: v })} style={{ marginTop: 10 }} />
      <TextInput label="Cor" value={carro.cor} onChangeText={v => setCarro({ ...carro, cor: v })} style={{ marginTop: 10 }} />
      <TextInput label="Proprietário" value={carro.proprietario} onChangeText={v => setCarro({ ...carro, proprietario: v })} style={{ marginTop: 10 }} />

      <Button mode="contained" onPress={salvar} style={{ marginTop: 12 }}>Salvar</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  foto: {
    width: "100%",
    aspectRatio: 16 / 9,
    alignSelf: "center",
    marginBottom: 12,
    borderRadius: 10,
    }


});
