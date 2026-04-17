import axios from 'axios';
import Constants from 'expo-constants';

// Em ambiente local, você deve usar o IP da sua máquina se estiver usando um dispositivo físico.
// Para simuladores, 10.0.2.2 (Android) ou localhost (iOS).
const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
