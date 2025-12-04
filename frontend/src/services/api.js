import axios from "axios";

const api = axios.create({
  
  baseURL: "http://192.168.15.9:3001/api",

  // Se estiver usando o celular na mesma rede Wi-Fi:
  // baseURL: "http://SEU_IP_LOCAL:3001/api"
});

export default api;
