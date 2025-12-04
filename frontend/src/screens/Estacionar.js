import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text, TextInput, Button, HelperText } from "react-native-paper";
import api from "../services/api";

export default function Estacionar({ route }) {
  const [veiculoId, setVeiculoId] = useState(route.params?.veiculoId || "");

  const estacionar = async () => {
    const { data } = await api.post("/estacionamento/entrada", {
      veiculoId: Number(veiculoId),
    });

    alert("Carro estacionado na vaga " + data.vaga.numero);
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall">Estacionar veículo</Text>

      <TextInput
        label="ID do veículo"
        style={styles.input}
        value={String(veiculoId)}
        keyboardType="numeric"
        onChangeText={setVeiculoId}
      />

      <Button mode="contained" onPress={estacionar}>
        Estacionar
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 10 },
  input: { marginVertical: 10 },
});
