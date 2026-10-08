import axios from "axios";
import "./echo";

window.axios = axios;
window.axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

axios.interceptors.request.use((config) => {
    if (typeof window !== "undefined" && window.Echo?.socketId()) {
        config.headers["X-Socket-ID"] = window.Echo.socketId();
    }
    return config;
});
