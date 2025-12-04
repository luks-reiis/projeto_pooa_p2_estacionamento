import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';

export default function CadastrarVeiculo({ navigation }) {
  const [form, setForm] = useState({ placa: '', modelo: '', cor: '', proprietario: '' });
  const [foto, setFoto] = useState(null);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert('Permissão necessária para acessar a galeria');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setFoto(result.assets[0]);
    }
  };

  const salvar = async () => {
    if (!form.placa) { alert('Placa é obrigatória'); return; }

    const data = new FormData();
    data.append('placa', form.placa);
    data.append('modelo', form.modelo);
    data.append('cor', form.cor);
    data.append('proprietario', form.proprietario);

    if (foto) {
      data.append('foto', {
        uri: foto.uri,
        name: `foto_${Date.now()}.jpg`,
        type: 'image/jpeg',
      });
    }

    try {
      await api.post('/veiculos', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      alert('Veículo cadastrado!');
      navigation.goBack();
    } catch (err) {
      console.log(err);
      alert('Erro ao cadastrar veículo');
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall">Novo Veículo</Text>

      <TextInput label="Placa" value={form.placa} onChangeText={(v) => setForm({ ...form, placa: v })} style={styles.input} />
      <TextInput label="Modelo" value={form.modelo} onChangeText={(v) => setForm({ ...form, modelo: v })} style={styles.input} />
      <TextInput label="Cor" value={form.cor} onChangeText={(v) => setForm({ ...form, cor: v })} style={styles.input} />
      <TextInput label="Proprietário" value={form.proprietario} onChangeText={(v) => setForm({ ...form, proprietario: v })} style={styles.input} />

      <Button mode="outlined" onPress={pickImage}>Escolher Foto</Button>

      {foto && <Image source={{ uri: foto.uri }} style={{ width: 150, height: 150, marginTop: 10 }} />}

      <Button mode="contained" onPress={salvar} style={{ marginTop: 12 }}>Salvar</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  input: { marginTop: 8 },
});
