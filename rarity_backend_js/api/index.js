import axios from "axios";

export const API = axios.create({ baseURL: "https://api.opensea.io/api/v1" });
