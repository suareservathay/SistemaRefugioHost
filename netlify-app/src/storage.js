// Substituto do "window.storage" do Claude, usando localStorage do navegador.
// Mesma assinatura (get/set/delete/list), para o App.jsx não precisar mudar de lógica.
// Atenção: localStorage é por navegador/aparelho — não sincroniza entre dispositivos
// nem entre "modo anônimo" e normal. Para isso, seria necessário um banco de dados
// real (ex.: Supabase, Firebase) rodando num backend.
//
// IMPORTANTE: get/set NÃO engolem erros — se o navegador bloquear ou falhar a
// gravação (ex.: modo privado, restrição de armazenamento em apps "adicionados
// à tela de início"), o erro é repassado pra cima, pra o app avisar o usuário
// em vez de achar que salvou quando na verdade não salvou.

const PREFIX = "calendario-airbnb:";

export const storage = {
  async get(key) {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw === null) return null;
    return { key, value: raw, shared: false };
  },
  async set(key, value) {
    localStorage.setItem(PREFIX + key, value);
    // Confirma que realmente gravou (alguns navegadores falham silenciosamente).
    const check = localStorage.getItem(PREFIX + key);
    if (check !== value) throw new Error("O navegador não confirmou a gravação dos dados.");
    return { key, value, shared: false };
  },
  async delete(key) {
    localStorage.removeItem(PREFIX + key);
    return { key, deleted: true, shared: false };
  },
  async list(prefix = "") {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIX + prefix)) keys.push(k.slice(PREFIX.length));
    }
    return { keys, prefix, shared: false };
  },
};
