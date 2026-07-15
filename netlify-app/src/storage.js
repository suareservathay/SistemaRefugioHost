// Substituto do "window.storage" do Claude, usando localStorage do navegador.
// Mesma assinatura (get/set/delete/list), para o App.jsx não precisar mudar de lógica.
// Atenção: localStorage é por navegador/aparelho — não sincroniza entre dispositivos
// nem entre "modo anônimo" e normal. Para isso, seria necessário um banco de dados
// real (ex.: Supabase, Firebase) rodando num backend.

const PREFIX = "calendario-airbnb:";

export const storage = {
  async get(key) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      if (raw === null) return null;
      return { key, value: raw, shared: false };
    } catch (e) {
      return null;
    }
  },
  async set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, value);
      return { key, value, shared: false };
    } catch (e) {
      return null;
    }
  },
  async delete(key) {
    try {
      localStorage.removeItem(PREFIX + key);
      return { key, deleted: true, shared: false };
    } catch (e) {
      return null;
    }
  },
  async list(prefix = "") {
    try {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(PREFIX + prefix)) keys.push(k.slice(PREFIX.length));
      }
      return { keys, prefix, shared: false };
    } catch (e) {
      return null;
    }
  },
};
