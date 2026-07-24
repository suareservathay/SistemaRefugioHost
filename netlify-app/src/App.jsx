import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2, Sparkles, CalendarDays, CalendarPlus, Brush, Wrench, LogIn, LogOut, MoreHorizontal, Home, ClipboardCheck, Wallet, TrendingUp, TrendingDown, ListChecks, CheckCircle2, Circle, X, Package, Minus, Search, RefreshCw, Link2, Loader2, ImagePlus, DatabaseBackup, Download, Upload } from "lucide-react";

// ---------- Config ----------
const PROPERTIES = [
  { id: "chale-a", name: "Chalé 1065", color: "#0F766E", soft: "#E6F4F2" },
  { id: "chale-b", name: "Chalé 1022", color: "#B45309", soft: "#FBF0E4" },
  { id: "chale-c", name: "Chalé 1017", color: "#6D28D9", soft: "#EFEAFB" },
];

const TASK_TYPES = [
  { id: "limpeza", label: "Limpeza", icon: Brush },
  { id: "manutencao", label: "Manutenção", icon: Wrench },
  { id: "vistoria", label: "Vistoria", icon: ClipboardCheck },
  { id: "checkin", label: "Check-in", icon: LogIn },
  { id: "checkout", label: "Check-out", icon: LogOut },
  { id: "outro", label: "Outro", icon: MoreHorizontal },
];

const CUSTOM_TASK_TYPES_KEY = "tipos-compromisso-personalizados";
const TRANSACOES_KEY = "transacoes-financeiras";
const TAREFAS_KEY = "lista-tarefas";
const CONCORRENTES_KEY = "concorrentes-links";
const ESTOQUE_KEY = "lista-estoque";
const ESTOQUE_SEED_VERSION_KEY = "estoque-seed-versao";
const CURRENT_ESTOQUE_SEED_VERSION = 4;

const ESTOQUE_CATEGORIAS_BASE = [
  { id: "enxoval", label: "Enxoval" },
  { id: "limpeza", label: "Limpeza" },
  { id: "higiene", label: "Reposições" },
];
const ESTOQUE_CATEGORIA_OUTROS = { id: "outros", label: "Outros" };
const CUSTOM_ESTOQUE_CATEGORIAS_KEY = "categorias-estoque-personalizadas";

// Locais de controle para itens de enxoval: cada chalé + a lavanderia (roupa suja/lavando).
const LAVANDERIA = { id: "lavanderia", name: "Lavanderia", color: "#475569", soft: "#EEF1F5" };
const ENXOVAL_LOCATIONS = [...PROPERTIES, LAVANDERIA];
function locationsFor(category) {
  return category === "enxoval" ? ENXOVAL_LOCATIONS : PROPERTIES;
}

const ESTOQUE_SEED = [
  { name: "Toalhas", category: "enxoval" },
  { name: "Fronhas", category: "enxoval" },
  { name: "Lençol", category: "enxoval" },
  { name: "Cobre-leito", category: "enxoval" },
  { name: "Cobertor", category: "enxoval" },
  { name: "Pano de prato", category: "enxoval" },
  { name: "Pano de pia", category: "enxoval" },
  { name: "Tapete de banheiro", category: "enxoval" },
  { name: "Desinfetante", category: "limpeza" },
  { name: "Cera", category: "limpeza" },
  { name: "Bucha de lavar louça", category: "limpeza" },
  { name: "Veja", category: "limpeza" },
  { name: "Cheirinho perfumador", category: "limpeza" },
  { name: "Limpa vidro", category: "limpeza" },
  { name: "Cândida", category: "limpeza" },
  { name: "Papel higiênico", category: "higiene" },
  { name: "Sabonete", category: "higiene" },
  { name: "Fósforo", category: "higiene" },
  { name: "Sacolas", category: "higiene" },
  { name: "Saco de lixo", category: "limpeza" },
  { name: "Detergente", category: "limpeza" },
].map((it, i) => ({
  id: `estoque-seed-${i}`,
  name: it.name,
  category: it.category,
  quantities: Object.fromEntries(locationsFor(it.category).map(l => [l.id, 0])),
}));
const TRANSACOES_SEED_VERSION_KEY = "transacoes-seed-versao";
const CURRENT_TRANSACOES_SEED_VERSION = 2;

// Correções de nome por id de reserva (confirmadas pelos comprovantes de repasse do Airbnb).
const RESERVA_ID_NAME_FIXES = {
  "seed2-a6": "Augusta Micaela De Souza Lima",
  "seed2-b5": "Alex André",
};

// Recebimentos do Airbnb informados pelo usuário (julho de 2026).
const SEED_TRANSACOES = [
  { id: "seedt-1", kind: "receita", propertyId: null, description: "Recebimento Airbnb", amount: 752.45, date: "2026-07-01" },
  { id: "seedt-2", kind: "receita", propertyId: null, description: "Recebimento Airbnb", amount: 1144.21, date: "2026-07-04" },
  { id: "seedt-3", kind: "receita", propertyId: null, description: "Recebimento Airbnb", amount: 646.12, date: "2026-07-05" },
  { id: "seedt-4", kind: "receita", propertyId: null, description: "Recebimento Airbnb", amount: 2532.13, date: "2026-07-07" },
  { id: "seedt-5", kind: "receita", propertyId: null, description: "Recebimento Airbnb", amount: 502.99, date: "2026-07-10" },
  { id: "seedt-6", kind: "receita", propertyId: null, description: "Recebimento Airbnb", amount: 2742.15, date: "2026-07-11" },
  { id: "seedt-7", kind: "receita", propertyId: null, description: "Recebimento Airbnb", amount: 81.79, date: "2026-07-13" },
  { id: "seedt-8", kind: "receita", propertyId: "chale-a", description: "Repasse Airbnb - Augusta Micaela De Souza Lima", amount: 1308.59, date: "2026-07-14" },
  { id: "seedt-9", kind: "receita", propertyId: "chale-b", description: "Repasse Airbnb - Alex André", amount: 572.51, date: "2026-07-14" },
];

const CHECKIN_HOUR = "17h";
const CHECKOUT_HOUR = "14h";

function slugify(text) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `tipo-${Date.now()}`;
}

const MONTH_NAMES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const WEEKDAY_LABELS = ["D","S","T","Q","Q","S","S"];

function toKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function parseKey(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// ---------- Storage helpers ----------
const EVENTS_KEY = "compromissos";
const RESERVAS_KEY = "reservas-manuais";
const SEED_VERSION_KEY = "reservas-seed-versao";
const CURRENT_SEED_VERSION = 2;

// Dados lidos das capturas de tela do calendário do Airbnb (revisão 2, mais precisa).
const SEED_RESERVAS = {
  "chale-a": [
    { id: "seed2-a1", guestName: "Miguel", start: "2026-07-01", end: "2026-07-02" },
    { id: "seed2-a2", guestName: "Rosiane", start: "2026-07-04", end: "2026-07-05" },
    { id: "seed2-a3", guestName: "Marcela + 2", start: "2026-07-06", end: "2026-07-10" },
    { id: "seed2-a4", guestName: "Isabela + 3", start: "2026-07-10", end: "2026-07-12" },
    { id: "seed2-a5", guestName: "Vitória", start: "2026-07-12", end: "2026-07-13" },
    { id: "seed2-a6", guestName: "Augusta Micaela + 2", start: "2026-07-13", end: "2026-07-17" },
    { id: "seed2-a7", guestName: "Hóspede A (nome e checkout a confirmar)", start: "2026-07-31", end: "2026-08-01" },
  ],
  "chale-b": [
    { id: "seed2-b1", guestName: "Every + 2", start: "2026-07-03", end: "2026-07-05" },
    { id: "seed2-b2", guestName: "Diane Christina + 3", start: "2026-07-06", end: "2026-07-09" },
    { id: "seed2-b3", guestName: "Mari... (nome a confirmar)", start: "2026-07-09", end: "2026-07-10" },
    { id: "seed2-b4", guestName: "Natanael + 3", start: "2026-07-10", end: "2026-07-12" },
    { id: "seed2-b5", guestName: "Alex... (nome a confirmar)", start: "2026-07-13", end: "2026-07-14" },
    { id: "seed2-b6", guestName: "Pedro + 2", start: "2026-07-14", end: "2026-07-16" },
    { id: "seed2-b7", guestName: "Ana Carolina + 2", start: "2026-07-16", end: "2026-07-20" },
    { id: "seed2-b8", guestName: "Ednete + 2", start: "2026-07-22", end: "2026-07-24" },
    { id: "seed2-b9", guestName: "Elias + 3", start: "2026-07-24", end: "2026-07-26" },
    { id: "seed2-b10", guestName: "Cassio Vinicius + 1", start: "2026-07-27", end: "2026-07-30" },
  ],
};

export default function App() {
  const [today] = useState(() => new Date());
  const [cursor, setCursor] = useState(() => new Date());
  const [events, setEvents] = useState({});
  const [reservas, setReservas] = useState({});
  const [customTaskTypes, setCustomTaskTypes] = useState([]);
  const [customEstoqueCategorias, setCustomEstoqueCategorias] = useState([]);
  const [tab, setTab] = useState("calendario");
  const [transacoes, setTransacoes] = useState([]);
  const [transacaoModal, setTransacaoModal] = useState(null);
  const [tarefas, setTarefas] = useState([]);
  const [estoque, setEstoque] = useState([]);
  const [concorrentes, setConcorrentes] = useState([]);
  const [selectedDay, setSelectedDay] = useState(() => toKey(new Date()));
  const [visibleProps, setVisibleProps] = useState(() => PROPERTIES.map(p => p.id));
  const [showAddTask, setShowAddTask] = useState(false);
  const [reservaModal, setReservaModal] = useState(null);
  const [showImportPrint, setShowImportPrint] = useState(false);
  const [showImportPagamentos, setShowImportPagamentos] = useState(false);
  const [showBackup, setShowBackup] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [evRes, resRes, verRes, customRes, transRes, transVerRes, tarefasRes, estoqueRes, estoqueVerRes, concRes, customCatRes] = await Promise.allSettled([
          window.storage.get(EVENTS_KEY, false),
          window.storage.get(RESERVAS_KEY, false),
          window.storage.get(SEED_VERSION_KEY, false),
          window.storage.get(CUSTOM_TASK_TYPES_KEY, false),
          window.storage.get(TRANSACOES_KEY, false),
          window.storage.get(TRANSACOES_SEED_VERSION_KEY, false),
          window.storage.get(TAREFAS_KEY, false),
          window.storage.get(ESTOQUE_KEY, false),
          window.storage.get(ESTOQUE_SEED_VERSION_KEY, false),
          window.storage.get(CONCORRENTES_KEY, false),
          window.storage.get(CUSTOM_ESTOQUE_CATEGORIAS_KEY, false),
        ]);
        if (evRes.status === "fulfilled" && evRes.value) {
          setEvents(JSON.parse(evRes.value.value));
        }
        if (customRes.status === "fulfilled" && customRes.value) {
          setCustomTaskTypes(JSON.parse(customRes.value.value));
        }
        if (customCatRes.status === "fulfilled" && customCatRes.value) {
          setCustomEstoqueCategorias(JSON.parse(customCatRes.value.value));
        }
        if (tarefasRes.status === "fulfilled" && tarefasRes.value) {
          setTarefas(JSON.parse(tarefasRes.value.value));
        }
        if (concRes.status === "fulfilled" && concRes.value) {
          setConcorrentes(JSON.parse(concRes.value.value));
        }
        {
          let currentEstoque = (estoqueRes.status === "fulfilled" && estoqueRes.value) ? JSON.parse(estoqueRes.value.value) : [];
          const estoqueStoredVersion = (estoqueVerRes.status === "fulfilled" && estoqueVerRes.value) ? Number(estoqueVerRes.value.value) : 0;
          if (estoqueStoredVersion < CURRENT_ESTOQUE_SEED_VERSION) {
            // Converte itens antigos (formato simples "quantity") para o novo formato categorizado com locais.
            currentEstoque = currentEstoque.map(it => {
              const seedMatch = ESTOQUE_SEED.find(s => s.name === it.name);
              const category = it.name === "Saco de lixo" ? "limpeza" : (it.category || seedMatch?.category || "outros");
              const locs = locationsFor(category);
              if (it.quantities && !("geral" in it.quantities) && locs.every(l => l.id in it.quantities)) {
                return { ...it, category };
              }
              const oldGeral = it.quantities?.geral ?? it.quantity ?? 0;
              const quantities = Object.fromEntries(locs.map(l => [l.id, l.id === "chale-a" ? oldGeral : 0]));
              return { id: it.id, name: it.name, category, quantities };
            });
            const already = new Set(currentEstoque.map(i => i.id));
            const toAdd = ESTOQUE_SEED.filter(i => !already.has(i.id));
            currentEstoque = [...currentEstoque, ...toAdd];
            window.storage.set(ESTOQUE_KEY, JSON.stringify(currentEstoque), false).catch(() => {});
            window.storage.set(ESTOQUE_SEED_VERSION_KEY, String(CURRENT_ESTOQUE_SEED_VERSION), false).catch(() => {});
          }
          setEstoque(currentEstoque);
        }
        {
          let currentTrans = (transRes.status === "fulfilled" && transRes.value) ? JSON.parse(transRes.value.value) : [];
          const transStoredVersion = (transVerRes.status === "fulfilled" && transVerRes.value) ? Number(transVerRes.value.value) : 0;
          if (transStoredVersion < CURRENT_TRANSACOES_SEED_VERSION) {
            const already = new Set(currentTrans.map(t => t.id));
            const toAdd = SEED_TRANSACOES.filter(t => !already.has(t.id));
            currentTrans = [...currentTrans, ...toAdd];
            window.storage.set(TRANSACOES_KEY, JSON.stringify(currentTrans), false).catch(() => {});
            window.storage.set(TRANSACOES_SEED_VERSION_KEY, String(CURRENT_TRANSACOES_SEED_VERSION), false).catch(() => {});
          }
          setTransacoes(currentTrans);
        }
        let current = (resRes.status === "fulfilled" && resRes.value) ? JSON.parse(resRes.value.value) : {};
        const storedVersion = (verRes.status === "fulfilled" && verRes.value) ? Number(verRes.value.value) : 0;

        let changed = false;
        if (storedVersion < CURRENT_SEED_VERSION) {
          // Remove seeds antigos (ids "seed-...") e aplica a revisão mais precisa.
          for (const pid of Object.keys(current)) {
            current[pid] = (current[pid] || []).filter(r => !r.id.startsWith("seed-"));
          }
          for (const pid of Object.keys(SEED_RESERVAS)) {
            const already = new Set((current[pid] || []).map(r => r.id));
            const toAdd = SEED_RESERVAS[pid].filter(r => !already.has(r.id));
            current = { ...current, [pid]: [...(current[pid] || []), ...toAdd] };
          }
          changed = true;
          window.storage.set(SEED_VERSION_KEY, String(CURRENT_SEED_VERSION), false).catch(() => {});
        } else {
          for (const pid of Object.keys(SEED_RESERVAS)) {
            if (!current[pid] || current[pid].length === 0) {
              current = { ...current, [pid]: SEED_RESERVAS[pid] };
              changed = true;
            }
          }
        }
        for (const pid of Object.keys(current)) {
          current[pid] = (current[pid] || []).map(r => {
            if (RESERVA_ID_NAME_FIXES[r.id] && r.guestName !== RESERVA_ID_NAME_FIXES[r.id]) {
              changed = true;
              return { ...r, guestName: RESERVA_ID_NAME_FIXES[r.id] };
            }
            return r;
          });
        }
        setReservas(current);
        if (changed) window.storage.set(RESERVAS_KEY, JSON.stringify(current), false).catch(() => {});
      } catch (e) {}
    })();
  }, []);

  const persistEvents = useCallback(async (next) => {
    setEvents(next);
    try { await window.storage.set(EVENTS_KEY, JSON.stringify(next), false); return true; }
    catch (e) { showToast("Não consegui salvar. Tente de novo."); return false; }
  }, [showToast]);

  const persistCustomTypes = useCallback(async (next) => {
    setCustomTaskTypes(next);
    try { await window.storage.set(CUSTOM_TASK_TYPES_KEY, JSON.stringify(next), false); }
    catch (e) {}
  }, []);

  const persistTransacoes = useCallback(async (next) => {
    setTransacoes(next);
    try { await window.storage.set(TRANSACOES_KEY, JSON.stringify(next), false); return true; }
    catch (e) { showToast("Não consegui salvar. Tente de novo."); return false; }
  }, [showToast]);

  async function addTransacao(t) {
    const next = [...transacoes, { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, ...t }];
    return persistTransacoes(next);
  }
  async function updateTransacao(id, data) {
    const next = transacoes.map(t => t.id === id ? { ...t, ...data } : t);
    return persistTransacoes(next);
  }
  function removeTransacao(id) {
    persistTransacoes(transacoes.filter(t => t.id !== id));
  }
  async function importarTransacoes(novasTransacoes) {
    const comIds = novasTransacoes.map(t => ({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, ...t }));
    const ok = await persistTransacoes([...transacoes, ...comIds]);
    if (ok !== false) showToast(`${novasTransacoes.length} lançamento(s) importado(s).`);
  }
  function syncTransacaoDaReserva(reservaId, pid, guestName, amount, dateKey) {
    const existente = transacoes.find(t => t.reservaId === reservaId);
    if (amount && amount > 0) {
      if (existente) {
        persistTransacoes(transacoes.map(t => t.id === existente.id
          ? { ...t, propertyId: pid, amount, date: dateKey, description: `Repasse Airbnb - ${guestName}` }
          : t));
      } else {
        const nova = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          kind: "receita", propertyId: pid, description: `Repasse Airbnb - ${guestName}`,
          amount, date: dateKey, reservaId,
        };
        persistTransacoes([...transacoes, nova]);
      }
    } else if (existente) {
      persistTransacoes(transacoes.filter(t => t.id !== existente.id));
    }
  }

  const persistTarefas = useCallback(async (next) => {
    setTarefas(next);
    try { await window.storage.set(TAREFAS_KEY, JSON.stringify(next), false); return true; }
    catch (e) { showToast("Não consegui salvar. Tente de novo."); return false; }
  }, [showToast]);

  async function addTarefa(title, propertyId) {
    const next = [...tarefas, { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, title, done: false, propertyId }];
    return persistTarefas(next);
  }
  function toggleTarefa(id) {
    persistTarefas(tarefas.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }
  function removeTarefa(id) {
    persistTarefas(tarefas.filter(t => t.id !== id));
  }

  const persistEstoque = useCallback(async (next) => {
    setEstoque(next);
    try { await window.storage.set(ESTOQUE_KEY, JSON.stringify(next), false); return true; }
    catch (e) { showToast("Não consegui salvar. Tente de novo."); return false; }
  }, [showToast]);

  async function addEstoqueItem(name, category) {
    const quantities = Object.fromEntries(locationsFor(category).map(l => [l.id, 0]));
    const next = [...estoque, { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name, category, quantities }];
    return persistEstoque(next);
  }
  function updateEstoqueQty(id, locationKey, quantity) {
    persistEstoque(estoque.map(i => i.id === id
      ? { ...i, quantities: { ...i.quantities, [locationKey]: Math.max(0, quantity) } }
      : i));
  }
  function removeEstoqueItem(id) {
    persistEstoque(estoque.filter(i => i.id !== id));
  }
  function changeEstoqueItemCategory(id, newCategory) {
    persistEstoque(estoque.map(i => {
      if (i.id !== id) return i;
      const locs = locationsFor(newCategory);
      const quantities = Object.fromEntries(locs.map(l => [l.id, i.quantities[l.id] || 0]));
      return { ...i, category: newCategory, quantities };
    }));
  }
  function moveEstoqueItem(id, direction) {
    const idx = estoque.findIndex(i => i.id === id);
    if (idx === -1) return;
    const cat = estoque[idx].category;
    let swapIdx = -1;
    if (direction === -1) {
      for (let k = idx - 1; k >= 0; k--) if (estoque[k].category === cat) { swapIdx = k; break; }
    } else {
      for (let k = idx + 1; k < estoque.length; k++) if (estoque[k].category === cat) { swapIdx = k; break; }
    }
    if (swapIdx === -1) return;
    const next = [...estoque];
    [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
    persistEstoque(next);
  }

  const persistCustomEstoqueCategorias = useCallback(async (next) => {
    setCustomEstoqueCategorias(next);
    try { await window.storage.set(CUSTOM_ESTOQUE_CATEGORIAS_KEY, JSON.stringify(next), false); }
    catch (e) {}
  }, []);
  function addEstoqueCategoria(label) {
    const clean = label.trim();
    if (!clean) return null;
    const id = slugify(clean);
    const jaExiste = [...ESTOQUE_CATEGORIAS_BASE, ...customEstoqueCategorias, ESTOQUE_CATEGORIA_OUTROS].some(c => c.id === id);
    if (jaExiste) return id;
    persistCustomEstoqueCategorias([...customEstoqueCategorias, { id, label: clean }]);
    return id;
  }

  const persistConcorrentes = useCallback(async (next) => {
    setConcorrentes(next);
    try { await window.storage.set(CONCORRENTES_KEY, JSON.stringify(next), false); return true; }
    catch (e) { showToast("Não consegui salvar. Tente de novo."); return false; }
  }, [showToast]);

  async function addConcorrente(url, label) {
    const item = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, url, label: label || "", analysis: null, updatedAt: null, status: "idle" };
    const next = [...concorrentes, item];
    const ok = await persistConcorrentes(next);
    if (ok) analisarConcorrente(item.id, [...next]);
    return ok;
  }
  function removeConcorrente(id) {
    persistConcorrentes(concorrentes.filter(c => c.id !== id));
  }

  async function analisarConcorrente(id, listAtual) {
    const list = listAtual || concorrentes;
    setConcorrentes(list.map(c => c.id === id ? { ...c, status: "loading" } : c));
    const alvo = list.find(c => c.id === id);
    if (!alvo) return;
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `Pesquise na web informações públicas sobre este anúncio do Airbnb: ${alvo.url}\n\n` +
              `Se não conseguir acessar a página diretamente, busque pelo nome/local do anúncio e por anúncios similares na região para estimar o padrão. ` +
              `Escreva uma análise curta e direta (use tópicos), cobrindo: ` +
              `1) Estratégia do anúncio (o que ele destaca, diferenciais); ` +
              `2) Padrão de precificação (faixa de preço por noite, se encontrar); ` +
              `3) Estilo de descrição/fotos (o que parece funcionar); ` +
              `4) Avaliação geral e como isso se compara ao preço de mercado da região. ` +
              `Seja honesto se a informação pública for limitada. Responda em português, de forma objetiva.`,
          }],
          tools: [{ type: "web_search_20250305", name: "web_search" }],
        }),
      });
      let data;
      try {
        data = await response.json();
      } catch (parseErr) {
        throw new Error(`Resposta inválida da API (status ${response.status})`);
      }
      if (!response.ok) {
        const apiMsg = data?.error?.message || `Erro ${response.status}`;
        throw new Error(apiMsg);
      }
      const text = (data.content || [])
        .filter(b => b.type === "text")
        .map(b => b.text)
        .join("\n\n")
        .trim();
      const finalText = text || "A busca não retornou texto — pode ser que o modelo não tenha encontrado nada relevante.";
      setConcorrentes(prev => {
        const next = prev.map(c => c.id === id ? { ...c, analysis: finalText, status: "done", errorMsg: null, updatedAt: new Date().toISOString() } : c);
        window.storage.set(CONCORRENTES_KEY, JSON.stringify(next), false).catch(() => {});
        return next;
      });
    } catch (e) {
      setConcorrentes(prev => {
        const next = prev.map(c => c.id === id ? { ...c, status: "error", errorMsg: e?.message || String(e) } : c);
        window.storage.set(CONCORRENTES_KEY, JSON.stringify(next), false).catch(() => {});
        return next;
      });
    }
  }

  const persistReservas = useCallback(async (next) => {
    setReservas(next);
    try { await window.storage.set(RESERVAS_KEY, JSON.stringify(next), false); return true; }
    catch (e) { showToast("Não consegui salvar a reserva."); return false; }
  }, [showToast]);

  const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const leadingBlanks = monthStart.getDay();
  const gridCells = useMemo(() => {
    const cells = [];
    for (let i = 0; i < leadingBlanks; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [cursor, leadingBlanks, daysInMonth]);

  const weeks = useMemo(() => {
    const w = [];
    for (let i = 0; i < gridCells.length; i += 7) w.push(gridCells.slice(i, i + 7));
    return w;
  }, [gridCells]);

  function findActiveReservation(pid, dateKey) {
    const list = reservas[pid] || [];
    return list.find(r => dateKey >= r.start && dateKey < r.end) || null;
  }

  // Segmenta as reservas da semana em blocos por hóspede, em unidades de meio-dia (14 colunas).
  // Cada dia ocupa 2 colunas: a de manhã (chegada ainda não / saída já aconteceu) e a de tarde.
  function computeSegments(weekDates, pid) {
    const list = reservas[pid] || [];
    const weekKeys = weekDates.map(d => d ? toKey(d) : null);
    const hasAnyDay = weekKeys.some(k => k !== null);
    if (!hasAnyDay) return [];
    const segments = [];
    for (const r of list) {
      const inWeekNight = weekKeys.some(k => k && k >= r.start && k < r.end);
      const checkinIdx = weekKeys.findIndex(k => k === r.start);
      const checkoutIdx = weekKeys.findIndex(k => k === r.end);
      if (!inWeekNight && checkinIdx === -1 && checkoutIdx === -1) continue;
      const isTrueStart = checkinIdx !== -1;
      const isTrueEnd = checkoutIdx !== -1;
      const startCol = isTrueStart ? (2 * checkinIdx + 2) : 1; // chegada ocupa só a tarde daquele dia
      const endColExclusive = isTrueEnd ? (2 * checkoutIdx + 2) : 15; // saída ocupa só a manhã do dia de checkout
      segments.push({ reservation: r, isTrueStart, isTrueEnd, startCol, endColExclusive, propertyId: pid });
    }
    return segments;
  }

  function tasksOnDay(dateKey) {
    const out = [];
    for (const pid of visibleProps) {
      const list = events[pid] || [];
      for (const t of list) if (t.dateKey === dateKey) out.push({ ...t, propertyId: pid });
    }
    return out;
  }
  function reservasOnDay(dateKey) {
    const out = [];
    for (const pid of visibleProps) {
      const r = findActiveReservation(pid, dateKey);
      if (r) out.push({ ...r, propertyId: pid });
    }
    return out;
  }
  function propColor(pid) { return PROPERTIES.find(p => p.id === pid)?.color || "#666"; }
  function propSoft(pid) { return PROPERTIES.find(p => p.id === pid)?.soft || "#eee"; }
  function propName(pid) { return PROPERTIES.find(p => p.id === pid)?.name || pid; }

  function goMonth(delta) { setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1)); }
  function goToday() { setCursor(new Date()); setSelectedDay(toKey(new Date())); }
  function toggleProp(pid) { setVisibleProps(v => v.includes(pid) ? v.filter(x => x !== pid) : [...v, pid]); }

  async function addTask(pid, task, newType) {
    const list = events[pid] || [];
    const next = { ...events, [pid]: [...list, { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, ...task }] };
    const ok = await persistEvents(next);
    if (ok && newType && !customTaskTypes.some(t => t.id === newType.id) && !TASK_TYPES.some(t => t.id === newType.id)) {
      persistCustomTypes([...customTaskTypes, newType]);
    }
    return ok;
  }
  function removeTask(pid, id) {
    const list = events[pid] || [];
    persistEvents({ ...events, [pid]: list.filter(t => t.id !== id) });
  }
  function saveReserva(pid, data, editId) {
    const { amount, ...reservaData } = data;
    if (editId) {
      const next = { ...reservas };
      for (const key of Object.keys(next)) next[key] = (next[key] || []).filter(r => r.id !== editId);
      next[pid] = [...(next[pid] || []), { id: editId, ...reservaData }];
      persistReservas(next);
      syncTransacaoDaReserva(editId, pid, reservaData.guestName, amount, reservaData.end);
      showToast("Reserva atualizada.");
    } else {
      const list = reservas[pid] || [];
      const newId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      persistReservas({ ...reservas, [pid]: [...list, { id: newId, ...reservaData }] });
      syncTransacaoDaReserva(newId, pid, reservaData.guestName, amount, reservaData.end);
      showToast("Reserva adicionada.");
    }
  }
  function removeReserva(pid, id) {
    const list = reservas[pid] || [];
    persistReservas({ ...reservas, [pid]: list.filter(r => r.id !== id) });
    const vinculada = transacoes.find(t => t.reservaId === id);
    if (vinculada) persistTransacoes(transacoes.filter(t => t.id !== vinculada.id));
  }
  async function importarReservas(pid, novasReservas) {
    const list = reservas[pid] || [];
    const comIds = novasReservas.map(r => ({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, ...r }));
    const ok = await persistReservas({ ...reservas, [pid]: [...list, ...comIds] });
    if (ok !== false) showToast(`${novasReservas.length} reserva(s) importada(s).`);
  }

  function exportBackup() {
    const payload = {
      formato: "backup-calendario-airbnb", versao: 1, exportadoEm: new Date().toISOString(),
      events, reservas, customTaskTypes, transacoes, tarefas, estoque, customEstoqueCategorias, concorrentes,
      seedVersions: {
        [SEED_VERSION_KEY]: CURRENT_SEED_VERSION,
        [TRANSACOES_SEED_VERSION_KEY]: CURRENT_TRANSACOES_SEED_VERSION,
        [ESTOQUE_SEED_VERSION_KEY]: CURRENT_ESTOQUE_SEED_VERSION,
      },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const dataHoje = toKey(new Date());
    a.href = url;
    a.download = `backup-calendario-chales-${dataHoje}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast("Backup baixado.");
  }

  async function importBackup(file) {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (data.formato !== "backup-calendario-airbnb") throw new Error("Esse não parece ser um arquivo de backup válido.");

      const sets = [
        [data.events, setEvents, EVENTS_KEY],
        [data.reservas, setReservas, RESERVAS_KEY],
        [data.customTaskTypes, setCustomTaskTypes, CUSTOM_TASK_TYPES_KEY],
        [data.transacoes, setTransacoes, TRANSACOES_KEY],
        [data.tarefas, setTarefas, TAREFAS_KEY],
        [data.estoque, setEstoque, ESTOQUE_KEY],
        [data.customEstoqueCategorias, setCustomEstoqueCategorias, CUSTOM_ESTOQUE_CATEGORIAS_KEY],
        [data.concorrentes, setConcorrentes, CONCORRENTES_KEY],
      ];
      for (const [value, setter, key] of sets) {
        if (value === undefined) continue;
        setter(value);
        await window.storage.set(key, JSON.stringify(value), false);
      }
      if (data.seedVersions) {
        for (const [key, value] of Object.entries(data.seedVersions)) {
          await window.storage.set(key, String(value), false);
        }
      }
      showToast("Backup restaurado com sucesso.");
      return true;
    } catch (e) {
      showToast(`Não consegui importar: ${e?.message || e}`);
      return false;
    }
  }

  const dayTasks = tasksOnDay(selectedDay);
  const selectedDate = parseKey(selectedDay);

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      background: "#FAF9F7", height: "100vh", color: "#1F2937",
      display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,500;9..144,600&display=swap');
        * { box-sizing: border-box; }
        .cal-cell { transition: background 0.15s ease; }
        .cal-cell:active { background: #F3F1EC; }
        .bar-seg:active { filter: brightness(0.92); }
        button:focus-visible, input:focus-visible, textarea:focus-visible { outline: 2px solid #FF385C; outline-offset: 1px; }
        .btn-primary { background: #FF385C; color: white; border: none; }
        .btn-primary:active { background: #E31C5F; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
        @media (prefers-reduced-motion: reduce) { * { transition: none !important; } .spin { animation: none; } }
      `}</style>

      {/* Header */}
      <header style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "14px 16px 12px", borderBottom: "1px solid #EAE7E0", background: "#fff", flexShrink: 0,
      }}>
        <div style={{ width: 30, height: 30, borderRadius: 9, background: "#FF385C", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <CalendarDays size={16} color="white" />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 16.5, fontWeight: 600, lineHeight: 1.15 }}>
            {tab === "calendario" ? "Calendário dos chalés" : tab === "tarefas" ? "Tarefas" : tab === "estoque" ? "Estoque" : tab === "concorrentes" ? "Concorrentes" : "Finanças"}
          </div>
          <div style={{ fontSize: 11.5, color: "#8A8478" }}>
            {tab === "calendario" ? "Reservas e compromissos do dia" : tab === "tarefas" ? "Sua lista de afazeres" : tab === "estoque" ? "Controle de itens dos chalés" : tab === "concorrentes" ? "Análise de anúncios concorrentes" : "Receitas e despesas por chalé"}
          </div>
        </div>
        {tab === "calendario" && (
          <button onClick={goToday} style={{
            padding: "7px 11px", borderRadius: 9, border: "1px solid #EAE7E0", background: "#fff",
            fontSize: 12, fontWeight: 600, color: "#1F2937", cursor: "pointer", flexShrink: 0,
          }}>
            Hoje
          </button>
        )}
        <button onClick={() => setShowBackup(true)} title="Backup" style={{
          width: 32, height: 32, borderRadius: 9, border: "1px solid #EAE7E0", background: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0,
        }}>
          <DatabaseBackup size={15} color="#6B6558" />
        </button>
      </header>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        {tab === "calendario" && (
        <div style={{ padding: "14px 12px 24px" }}>
          {/* Property chips */}
          <div style={{ display: "flex", gap: 8, marginBottom: 14, overflowX: "auto" }}>
            {PROPERTIES.map(p => (
              <button key={p.id} onClick={() => toggleProp(p.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 999, flexShrink: 0,
                  border: `1.5px solid ${visibleProps.includes(p.id) ? p.color : "#E5E1D8"}`,
                  background: visibleProps.includes(p.id) ? p.soft : "#fff",
                  color: visibleProps.includes(p.id) ? p.color : "#B3ADA0",
                  fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                }}>
                <Home size={11} />
                {p.name}
              </button>
            ))}
          </div>

          {/* Month nav */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <button onClick={() => goMonth(-1)} style={navBtnStyle}><ChevronLeft size={17} /></button>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 17.5, fontWeight: 600, textAlign: "center" }}>
              {MONTH_NAMES[cursor.getMonth()]} {cursor.getFullYear()}
            </div>
            <button onClick={() => goMonth(1)} style={navBtnStyle}><ChevronRight size={17} /></button>
          </div>

          {/* Weekday labels */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3, marginBottom: 6 }}>
            {WEEKDAY_LABELS.map((w, i) => (
              <div key={i} style={{ fontSize: 10.5, fontWeight: 700, color: "#B3ADA0", textAlign: "center" }}>{w}</div>
            ))}
          </div>

          {/* Gantt-style weeks (grid de 14 colunas = meio-dia por unidade) */}
          {weeks.map((weekDates, wi) => {
            const segByProp = visibleProps.map(pid => ({ pid, segs: computeSegments(weekDates, pid) })).filter(x => x.segs.length > 0);
            return (
              <div key={wi} style={{ marginBottom: 8 }}>
                {/* Day numbers */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3, marginBottom: 3 }}>
                  {weekDates.map((date, di) => {
                    if (!date) return <div key={di} />;
                    const key = toKey(date);
                    const isToday = isSameDay(date, today);
                    const isSelected = key === selectedDay;
                    const taskList = tasksOnDay(key);
                    return (
                      <button key={di} className="cal-cell" onClick={() => setSelectedDay(key)}
                        style={{
                          borderRadius: 9, border: isSelected ? "2px solid #FF385C" : "1px solid transparent",
                          background: isToday ? "#FFF0EC" : "transparent", padding: "3px 2px",
                          display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
                          cursor: "pointer", minHeight: 30,
                        }}>
                        <span style={{ fontSize: 12.5, fontWeight: isToday ? 700 : 500, color: isToday ? "#FF385C" : "#1F2937" }}>
                          {date.getDate()}
                        </span>
                        {taskList.length > 0 && (
                          <div style={{ display: "flex", gap: 2 }}>
                            {taskList.slice(0, 3).map((t, idx) => (
                              <span key={idx} style={{ width: 4, height: 4, borderRadius: 999, background: propColor(t.propertyId) }} />
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Reservation bars — grid de 14 colunas (meio-dia), refletindo chegada à tarde e saída de manhã */}
                {segByProp.map(({ pid, segs }) => (
                  <div key={pid} style={{ display: "grid", gridTemplateColumns: "repeat(14, 1fr)", gap: 0, height: 24, marginBottom: 3, position: "relative" }}>
                    {segs.map((seg, si) => (
                      <button key={si} className="bar-seg"
                        onClick={() => {
                          const vinculada = transacoes.find(t => t.reservaId === seg.reservation.id);
                          setReservaModal({ mode: "edit", reserva: { ...seg.reservation, propertyId: pid, amount: vinculada?.amount ?? null } });
                        }}
                        style={{
                          gridColumn: `${seg.startCol} / ${seg.endColExclusive}`,
                          background: propColor(pid), color: "#fff", border: "none", cursor: "pointer",
                          borderRadius: `${seg.isTrueStart ? 12 : 0}px ${seg.isTrueEnd ? 12 : 0}px ${seg.isTrueEnd ? 12 : 0}px ${seg.isTrueStart ? 12 : 0}px`,
                          display: "flex", alignItems: "center", position: "relative", zIndex: 1,
                          paddingLeft: seg.isTrueStart ? 8 : 3, paddingRight: 4,
                          fontSize: 10.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                          textAlign: "left",
                        }}>
                        {seg.isTrueStart && (
                          <span style={{
                            width: 15, height: 15, borderRadius: 999, background: "rgba(255,255,255,0.9)",
                            flexShrink: 0, marginRight: 5, border: `2px solid ${propColor(pid)}`,
                          }} />
                        )}
                        {seg.reservation.guestName}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            );
          })}

          {/* Legend */}
          <div style={{ display: "flex", gap: 14, marginBottom: 14, marginTop: 4, flexWrap: "wrap" }}>
            {PROPERTIES.map(p => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#8A8478" }}>
                <span style={{ width: 9, height: 9, borderRadius: 3, background: p.color }} />
                {p.name}
              </div>
            ))}
            <div style={{ fontSize: 11, color: "#8A8478" }}>
              Chegada {CHECKIN_HOUR} · Saída {CHECKOUT_HOUR}
            </div>
          </div>

          <button onClick={() => setShowImportPrint(true)} style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            padding: "10px", borderRadius: 10, border: "1px dashed #D8D3C7", background: "#FAF9F7",
            color: "#6B6558", fontSize: 12.5, fontWeight: 600, cursor: "pointer", marginBottom: 16,
          }}>
            <ImagePlus size={15} /> Importar print do calendário do Airbnb
          </button>

          {/* Selected day detail */}
          <div style={{ borderTop: "1px solid #EEEBE4", paddingTop: 14 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 6 }}>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 600 }}>
                {selectedDate.getDate()} de {MONTH_NAMES[selectedDate.getMonth()]}
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={() => setReservaModal({ mode: "create" })} style={quickActionStyle}>
                  <CalendarPlus size={13} /> Reserva
                </button>
                <button onClick={() => setShowAddTask(true)} style={quickActionStyle}>
                  <Plus size={13} /> Compromisso
                </button>
              </div>
            </div>

            {dayTasks.length === 0 && (
              <div style={{ textAlign: "center", color: "#B3ADA0", fontSize: 12.5, padding: "18px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <Sparkles size={18} />
                Nenhum compromisso nesse dia.
              </div>
            )}

            {dayTasks.map(t => {
              const TaskIcon = TASK_TYPES.find(tt => tt.id === t.type)?.icon || MoreHorizontal;
              return (
                <div key={t.id} style={{ padding: 10, borderRadius: 10, border: "1px solid #EEEBE4", marginBottom: 8, display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 8, background: propSoft(t.propertyId), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <TaskIcon size={13} color={propColor(t.propertyId)} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{t.title}</div>
                    <div style={{ fontSize: 11, color: "#8A8478" }}>
                      {propName(t.propertyId)}{t.time ? ` · ${t.time}` : ""}
                    </div>
                    {t.note && <div style={{ fontSize: 11, color: "#6B6558", marginTop: 3 }}>{t.note}</div>}
                  </div>
                  <button onClick={() => removeTask(t.propertyId, t.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#B3ADA0", padding: 2 }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Hoje */}
          <div style={{ marginTop: 22 }}>
            <HojeCard today={today} reservas={reservas} events={events} visibleProps={visibleProps}
              propName={propName} propColor={propColor} propSoft={propSoft}
              onOpen={() => { setSelectedDay(toKey(today)); setCursor(new Date(today)); }} />
          </div>
        </div>
        )}

        {tab === "tarefas" && (
          <TarefasTab tarefas={tarefas} onAdd={addTarefa} onToggle={toggleTarefa} onRemove={removeTarefa}
            propColor={propColor} propSoft={propSoft} />
        )}

        {tab === "estoque" && (
          <EstoqueTab
            estoque={estoque}
            categorias={[...ESTOQUE_CATEGORIAS_BASE, ...customEstoqueCategorias, ESTOQUE_CATEGORIA_OUTROS]}
            onAdd={addEstoqueItem}
            onChangeQty={updateEstoqueQty}
            onRemove={removeEstoqueItem}
            onChangeCategory={changeEstoqueItemCategory}
            onMove={moveEstoqueItem}
            onAddCategoria={addEstoqueCategoria}
          />
        )}

        {tab === "concorrentes" && (
          <ConcorrentesTab concorrentes={concorrentes} onAdd={addConcorrente} onRemove={removeConcorrente} onRefresh={(id) => analisarConcorrente(id)} />
        )}

        {tab === "financas" && (
          <FinancasTab
            transacoes={transacoes}
            onAdd={() => setTransacaoModal({ mode: "create" })}
            onEdit={(t) => setTransacaoModal({ mode: "edit", transacao: t })}
            onRemove={removeTransacao}
            onImportPrint={() => setShowImportPagamentos(true)}
            propName={propName}
            propColor={propColor}
            propSoft={propSoft}
          />
        )}
      </div>

      {/* Bottom tab bar */}
      <nav style={{
        display: "flex", borderTop: "1px solid #EAE7E0", background: "#fff",
        flexShrink: 0, paddingBottom: "env(safe-area-inset-bottom, 6px)",
      }}>
        {[
          { id: "calendario", label: "Calendário", icon: CalendarDays },
          { id: "tarefas", label: "Tarefas", icon: ListChecks },
          { id: "estoque", label: "Estoque", icon: Package },
          { id: "concorrentes", label: "Concorrentes", icon: Search },
          { id: "financas", label: "Finanças", icon: Wallet },
        ].map(t => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                padding: "10px 4px 8px", background: "none", border: "none", cursor: "pointer",
                color: active ? "#FF385C" : "#B3ADA0",
              }}>
              <Icon size={17} />
              <span style={{ fontSize: 9.5, fontWeight: 600, textAlign: "center", lineHeight: 1.1 }}>{t.label}</span>
            </button>
          );
        })}
      </nav>

      {transacaoModal && (
        <AddTransacaoModal
          initial={transacaoModal.mode === "edit" ? transacaoModal.transacao : null}
          onClose={() => setTransacaoModal(null)}
          onSave={async (data, editId) => {
            const ok = editId ? await updateTransacao(editId, data) : await addTransacao(data);
            if (ok) { setTransacaoModal(null); showToast(editId ? "Lançamento atualizado." : "Lançamento salvo."); }
          }}
        />
      )}

      {showBackup && (
        <BackupModal
          onClose={() => setShowBackup(false)}
          onExport={exportBackup}
          onImport={importBackup}
        />
      )}

      {showImportPagamentos && (
        <ImportarPagamentosModal
          onClose={() => setShowImportPagamentos(false)}
          onConfirm={async (list) => { await importarTransacoes(list); setShowImportPagamentos(false); }}
        />
      )}

      {showImportPrint && (
        <ImportarPrintModal
          onClose={() => setShowImportPrint(false)}
          onConfirm={async (pid, list) => { await importarReservas(pid, list); setShowImportPrint(false); }}
        />
      )}

      {reservaModal && (
        <AddReservaModal
          defaultDateKey={selectedDay}
          initial={reservaModal.mode === "edit" ? reservaModal.reserva : null}
          onClose={() => setReservaModal(null)}
          onSave={(pid, data, editId) => { saveReserva(pid, data, editId); setReservaModal(null); }}
          onDelete={(pid, id) => { removeReserva(pid, id); setReservaModal(null); showToast("Reserva excluída."); }}
        />
      )}

      {showAddTask && (
        <AddTaskModal
          defaultDateKey={selectedDay}
          customTaskTypes={customTaskTypes}
          onClose={() => setShowAddTask(false)}
          onSave={async (pid, task, newType) => {
            const ok = await addTask(pid, task, newType);
            if (ok) { setShowAddTask(false); showToast("Compromisso salvo."); }
          }}
        />
      )}

      {toast && (
        <div style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          background: "#1F2937", color: "#fff", padding: "9px 16px", borderRadius: 10,
          fontSize: 12.5, boxShadow: "0 8px 24px rgba(0,0,0,0.18)", zIndex: 60, whiteSpace: "nowrap",
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}

const navBtnStyle = {
  width: 30, height: 30, borderRadius: 9, border: "1px solid #EAE7E0",
  background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
};
const quickActionStyle = {
  display: "flex", alignItems: "center", gap: 5, background: "none", border: "none",
  color: "#FF385C", fontSize: 12, fontWeight: 700, cursor: "pointer", padding: 4,
};

function ModalShell({ title, onClose, children }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(31,41,55,0.4)",
      display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 50,
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "#fff", borderRadius: "18px 18px 0 0", padding: "18px 18px calc(20px + env(safe-area-inset-bottom, 0px))",
        width: "100%", maxWidth: 480, maxHeight: "85vh", overflowY: "auto",
        boxShadow: "0 -10px 40px rgba(0,0,0,0.2)",
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 999, background: "#EAE7E0", margin: "0 auto 14px" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 16.5, fontWeight: 600 }}>{title}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#8A8478" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function BackupModal({ onClose, onExport, onImport }) {
  const [file, setFile] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [importing, setImporting] = useState(false);

  async function handleImport() {
    if (!file) return;
    setImporting(true);
    const ok = await onImport(file);
    setImporting(false);
    if (ok) onClose();
  }

  return (
    <ModalShell title="Backup dos dados" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Exportar backup</div>
          <p style={{ fontSize: 12, color: "#6B6558", lineHeight: 1.5, margin: "0 0 10px" }}>
            Baixa um arquivo com tudo: reservas, tarefas, estoque e finanças. Guarde de vez em quando,
            principalmente antes de trocar de navegador ou aparelho.
          </p>
          <button onClick={onExport} className="btn-primary" style={{
            width: "100%", padding: "11px", borderRadius: 10, fontSize: 13, fontWeight: 600,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7, cursor: "pointer",
          }}>
            <Download size={15} /> Baixar backup agora
          </button>
        </div>

        <div style={{ borderTop: "1px solid #EEEBE4", paddingTop: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Importar backup</div>
          <p style={{ fontSize: 12, color: "#6B6558", lineHeight: 1.5, margin: "0 0 10px" }}>
            Restaura um arquivo salvo anteriormente. <b>Isso substitui todos os dados atuais</b> — use se
            perdeu informações ou quer levar os dados pra outro navegador/aparelho.
          </p>
          <label style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            border: "1.5px dashed #D8D3C7", borderRadius: 10, padding: "14px 10px",
            cursor: "pointer", fontSize: 13, color: "#6B6558", marginBottom: 10,
          }}>
            <Upload size={15} />
            {file ? file.name : "Escolher arquivo de backup"}
            <input type="file" accept="application/json,.json" style={{ display: "none" }}
              onChange={(e) => { setFile(e.target.files?.[0] || null); setConfirming(false); }} />
          </label>

          {file && !confirming && (
            <button onClick={() => setConfirming(true)} style={{
              width: "100%", padding: "11px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer",
              border: "1px solid #EAE7E0", background: "#fff", color: "#1F2937",
            }}>
              Continuar
            </button>
          )}

          {file && confirming && (
            <div style={{ padding: 12, borderRadius: 10, background: "#FBF0E4", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 12.5, color: "#7A4A0F" }}>
                Tem certeza? Os dados atuais serão substituídos pelos do arquivo <b>{file.name}</b>.
              </div>
              <button onClick={handleImport} disabled={importing} style={{
                padding: "10px", borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: importing ? "not-allowed" : "pointer",
                border: "none", background: "#B45309", color: "#fff", opacity: importing ? 0.6 : 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
              }}>
                {importing ? <Loader2 size={15} className="spin" /> : <Upload size={15} />}
                {importing ? "Restaurando..." : "Sim, substituir e importar"}
              </button>
            </div>
          )}
        </div>
      </div>
    </ModalShell>
  );
}

function ImportarPagamentosModal({ onClose, onConfirm }) {
  const [step, setStep] = useState("upload");
  const [year, setYear] = useState(new Date().getFullYear());
  const [fileData, setFileData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [parsed, setParsed] = useState([]); // [{description, date, amount, kind, propertyId, include}]

  function handleFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      const [, mediaType, base64] = result.match(/^data:(.+);base64,(.+)$/) || [];
      if (base64) setFileData({ base64, mediaType, previewUrl: result });
    };
    reader.readAsDataURL(file);
  }

  async function handleAnalyze() {
    if (!fileData) return;
    setStep("loading");
    setErrorMsg("");
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: fileData.mediaType, data: fileData.base64 } },
              {
                type: "text",
                text: `Este print mostra pagamentos/repasses recebidos do Airbnb (tela de "Ganhos" ou histórico de transações). ` +
                  `Identifique cada lançamento visível: a data (no formato DD/MM, sem o ano) e o valor recebido. ` +
                  `Se houver um nome de hóspede associado, inclua como descrição; senão use "Recebimento Airbnb". ` +
                  `Responda APENAS com um array JSON válido, sem markdown, sem texto antes ou depois, neste formato exato: ` +
                  `[{"description":"Nome ou Recebimento Airbnb","date":"DD/MM","amount":123.45}]. Se não encontrar nada, responda [].`,
              },
            ],
          }],
        }),
      });
      let data;
      try { data = await response.json(); }
      catch (e) { throw new Error(`Resposta inválida da API (status ${response.status})`); }
      if (!response.ok) throw new Error(data?.error?.message || `Erro ${response.status}`);

      const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("").trim();
      const cleaned = text.replace(/^```json\s*|^```\s*|```$/g, "").trim();
      let arr;
      try { arr = JSON.parse(cleaned); }
      catch (e) { throw new Error("Não consegui interpretar a resposta. Tente uma imagem mais nítida."); }
      if (!Array.isArray(arr) || arr.length === 0) throw new Error("Não encontrei nenhum lançamento nessa imagem.");

      const results = arr
        .filter(r => r && r.date && r.amount)
        .map(r => {
          const [d, m] = String(r.date).split("/").map(Number);
          const dateKey = (d && m) ? `${year}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}` : "";
          return {
            description: r.description || "Recebimento Airbnb",
            date: dateKey,
            amount: Number(r.amount),
            kind: "receita",
            propertyId: null,
            include: true,
          };
        })
        .filter(r => r.date);
      setParsed(results);
      setStep("review");
    } catch (e) {
      setErrorMsg(e?.message || String(e));
      setStep("error");
    }
  }

  function updateParsed(idx, field, value) {
    setParsed(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  }
  function removeParsed(idx) {
    setParsed(prev => prev.filter((_, i) => i !== idx));
  }
  function handleConfirm() {
    const toSave = parsed.filter(r => r.include && r.description && r.date && r.amount > 0)
      .map(({ description, date, amount, kind, propertyId }) => ({ description, date, amount, kind, propertyId }));
    if (toSave.length === 0) return;
    onConfirm(toSave);
  }

  return (
    <ModalShell title="Importar print de pagamentos" onClose={onClose}>
      {(step === "upload" || step === "loading") && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <FieldLabel>Ano dos lançamentos</FieldLabel>
            <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} style={inputStyle} />
          </div>
          <div>
            <FieldLabel>Print da tela de ganhos/pagamentos do Airbnb</FieldLabel>
            {fileData ? (
              <img src={fileData.previewUrl} alt="Preview" style={{ width: "100%", borderRadius: 10, border: "1px solid #EAE7E0" }} />
            ) : (
              <label style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                border: "1.5px dashed #D8D3C7", borderRadius: 10, padding: "20px 10px",
                cursor: "pointer", fontSize: 13, color: "#6B6558",
              }}>
                <ImagePlus size={16} />
                Escolher imagem
                <input type="file" accept="image/*" style={{ display: "none" }}
                  onChange={(e) => handleFile(e.target.files?.[0])} />
              </label>
            )}
          </div>
          <p style={{ fontSize: 11, color: "#B3ADA0", lineHeight: 1.5, margin: 0 }}>
            A próxima tela deixa você conferir e corrigir imóvel, descrição e valores antes de salvar.
          </p>
          <button className="btn-primary" disabled={!fileData || step === "loading"} onClick={handleAnalyze}
            style={{
              padding: "12px", borderRadius: 10, fontSize: 13.5, fontWeight: 600,
              cursor: (!fileData || step === "loading") ? "not-allowed" : "pointer", opacity: (!fileData || step === "loading") ? 0.5 : 1,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
            {step === "loading" ? <Loader2 size={16} className="spin" /> : <ImagePlus size={16} />}
            {step === "loading" ? "Analisando imagem..." : "Analisar imagem"}
          </button>
        </div>
      )}

      {step === "error" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 13, color: "#B4231F" }}>{errorMsg}</div>
          <button className="btn-primary" onClick={() => setStep("upload")}
            style={{ padding: "12px", borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>
            Tentar de novo
          </button>
        </div>
      )}

      {step === "review" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ fontSize: 12, color: "#6B6558", margin: 0 }}>
            Confira a descrição, o imóvel, a data e o valor antes de salvar.
          </p>
          {parsed.map((r, idx) => (
            <div key={idx} style={{ padding: 10, borderRadius: 10, border: "1px solid #EAE7E0", opacity: r.include ? 1 : 0.45 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <input type="checkbox" checked={r.include} onChange={(e) => updateParsed(idx, "include", e.target.checked)} />
                <input value={r.description} onChange={(e) => updateParsed(idx, "description", e.target.value)}
                  style={{ ...inputStyle, flex: 1, padding: "6px 8px" }} />
                <button onClick={() => removeParsed(idx)} style={{ background: "none", border: "none", cursor: "pointer", color: "#D8D3C7" }}>
                  <X size={15} />
                </button>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <select value={r.propertyId || ""} onChange={(e) => updateParsed(idx, "propertyId", e.target.value || null)}
                  style={{ ...inputStyle, flex: 1, fontSize: 12, padding: "6px 8px" }}>
                  <option value="">Sem imóvel específico</option>
                  {PROPERTIES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <input type="date" value={r.date} onChange={(e) => updateParsed(idx, "date", e.target.value)}
                  style={{ ...inputStyle, flex: 1, fontSize: 12, padding: "6px 8px" }} />
                <input value={r.amount} onChange={(e) => updateParsed(idx, "amount", Number(e.target.value))}
                  type="number" step="0.01" style={{ ...inputStyle, width: 90, fontSize: 12, padding: "6px 8px" }} />
              </div>
            </div>
          ))}
          {parsed.length === 0 && (
            <div style={{ fontSize: 12.5, color: "#B3ADA0", textAlign: "center", padding: "10px 0" }}>
              Nenhum lançamento restante pra importar.
            </div>
          )}
          <button className="btn-primary" disabled={parsed.filter(r => r.include).length === 0} onClick={handleConfirm}
            style={{
              padding: "12px", borderRadius: 10, fontSize: 13.5, fontWeight: 600, marginTop: 4,
              cursor: parsed.filter(r => r.include).length === 0 ? "not-allowed" : "pointer",
              opacity: parsed.filter(r => r.include).length === 0 ? 0.5 : 1,
            }}>
            Salvar {parsed.filter(r => r.include).length} lançamento(s)
          </button>
        </div>
      )}
    </ModalShell>
  );
}

function ImportarPrintModal({ onClose, onConfirm }) {
  const today = new Date();
  const [step, setStep] = useState("upload"); // upload | loading | review | error
  const [propertyId, setPropertyId] = useState(PROPERTIES[0].id);
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [fileData, setFileData] = useState(null); // { base64, mediaType, previewUrl }
  const [errorMsg, setErrorMsg] = useState("");
  const [parsed, setParsed] = useState([]); // [{guestName, checkinDay, checkoutDay, include}]

  function handleFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result; // data:image/png;base64,xxxx
      const [, mediaType, base64] = result.match(/^data:(.+);base64,(.+)$/) || [];
      if (base64) setFileData({ base64, mediaType, previewUrl: result });
    };
    reader.readAsDataURL(file);
  }

  async function handleAnalyze() {
    if (!fileData) return;
    setStep("loading");
    setErrorMsg("");
    const monthName = MONTH_NAMES[month - 1];
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: fileData.mediaType, data: fileData.base64 } },
              {
                type: "text",
                text: `Este print mostra o calendário de anúncios do Airbnb referente a ${monthName}. ` +
                  `Identifique todas as reservas visíveis (barras coloridas com nome de hóspede sobre os dias). ` +
                  `Para cada uma, retorne o dia de check-in e o dia de check-out (apenas o número do dia, de 1 a 31, sem o mês). ` +
                  `Se o nome do hóspede aparecer cortado (ex.: "Ro..."), retorne exatamente como está escrito, sem completar ou inventar. ` +
                  `Responda APENAS com um array JSON válido, sem markdown, sem texto antes ou depois, neste formato exato: ` +
                  `[{"guestName":"Nome","checkinDay":N,"checkoutDay":N}]. Se não encontrar nenhuma reserva, responda [].`,
              },
            ],
          }],
        }),
      });
      let data;
      try { data = await response.json(); }
      catch (e) { throw new Error(`Resposta inválida da API (status ${response.status})`); }
      if (!response.ok) throw new Error(data?.error?.message || `Erro ${response.status}`);

      const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("").trim();
      const cleaned = text.replace(/^```json\s*|^```\s*|```$/g, "").trim();
      let arr;
      try { arr = JSON.parse(cleaned); }
      catch (e) { throw new Error("Não consegui interpretar a resposta. Tente uma imagem mais nítida."); }
      if (!Array.isArray(arr) || arr.length === 0) throw new Error("Não encontrei nenhuma reserva nessa imagem.");

      const daysInMonth = new Date(year, month, 0).getDate();
      const toDateKey = (day) => `${year}-${String(month).padStart(2, "0")}-${String(Math.min(Math.max(day, 1), daysInMonth)).padStart(2, "0")}`;
      const results = arr
        .filter(r => r && r.guestName && r.checkinDay && r.checkoutDay)
        .map(r => ({
          guestName: String(r.guestName).trim(),
          start: toDateKey(Number(r.checkinDay)),
          end: toDateKey(Number(r.checkoutDay)),
          include: true,
        }));
      setParsed(results);
      setStep("review");
    } catch (e) {
      setErrorMsg(e?.message || String(e));
      setStep("error");
    }
  }

  function updateParsed(idx, field, value) {
    setParsed(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  }
  function removeParsed(idx) {
    setParsed(prev => prev.filter((_, i) => i !== idx));
  }

  function handleConfirm() {
    const toSave = parsed.filter(r => r.include && r.guestName && r.start && r.end && r.end > r.start)
      .map(({ guestName, start, end }) => ({ guestName, start, end }));
    if (toSave.length === 0) return;
    onConfirm(propertyId, toSave);
  }

  return (
    <ModalShell title="Importar print do Airbnb" onClose={onClose}>
      {(step === "upload" || step === "loading") && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <FieldLabel>Imóvel</FieldLabel>
            <div style={{ display: "flex", gap: 8 }}>
              {PROPERTIES.map(p => (
                <button key={p.id} onClick={() => setPropertyId(p.id)}
                  style={{
                    flex: 1, padding: "9px 6px", borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: "pointer",
                    border: `1.5px solid ${propertyId === p.id ? p.color : "#EAE7E0"}`,
                    background: propertyId === p.id ? p.soft : "#fff",
                    color: propertyId === p.id ? p.color : "#6B6558",
                  }}>{p.name}</button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <FieldLabel>Mês do print</FieldLabel>
              <select value={month} onChange={(e) => setMonth(Number(e.target.value))} style={inputStyle}>
                {MONTH_NAMES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div style={{ width: 100 }}>
              <FieldLabel>Ano</FieldLabel>
              <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} style={inputStyle} />
            </div>
          </div>
          <div>
            <FieldLabel>Print do calendário</FieldLabel>
            {fileData ? (
              <img src={fileData.previewUrl} alt="Preview" style={{ width: "100%", borderRadius: 10, border: "1px solid #EAE7E0" }} />
            ) : (
              <label style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                border: "1.5px dashed #D8D3C7", borderRadius: 10, padding: "20px 10px",
                cursor: "pointer", fontSize: 13, color: "#6B6558",
              }}>
                <ImagePlus size={16} />
                Escolher imagem
                <input type="file" accept="image/*" style={{ display: "none" }}
                  onChange={(e) => handleFile(e.target.files?.[0])} />
              </label>
            )}
          </div>
          <p style={{ fontSize: 11, color: "#B3ADA0", lineHeight: 1.5, margin: 0 }}>
            A leitura da imagem pode errar nomes cortados ou datas em prints de baixa qualidade — a próxima tela
            deixa você conferir e corrigir tudo antes de salvar.
          </p>
          <button className="btn-primary" disabled={!fileData || step === "loading"} onClick={handleAnalyze}
            style={{
              padding: "12px", borderRadius: 10, fontSize: 13.5, fontWeight: 600,
              cursor: (!fileData || step === "loading") ? "not-allowed" : "pointer", opacity: (!fileData || step === "loading") ? 0.5 : 1,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
            {step === "loading" ? <Loader2 size={16} className="spin" /> : <ImagePlus size={16} />}
            {step === "loading" ? "Analisando imagem..." : "Analisar imagem"}
          </button>
        </div>
      )}

      {step === "error" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 13, color: "#B4231F" }}>{errorMsg}</div>
          <button className="btn-primary" onClick={() => setStep("upload")}
            style={{ padding: "12px", borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>
            Tentar de novo
          </button>
        </div>
      )}

      {step === "review" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ fontSize: 12, color: "#6B6558", margin: 0 }}>
            Confira antes de salvar — corrija nomes cortados e confirme as datas.
          </p>
          {parsed.map((r, idx) => (
            <div key={idx} style={{ padding: 10, borderRadius: 10, border: "1px solid #EAE7E0", opacity: r.include ? 1 : 0.45 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <input type="checkbox" checked={r.include} onChange={(e) => updateParsed(idx, "include", e.target.checked)} />
                <input value={r.guestName} onChange={(e) => updateParsed(idx, "guestName", e.target.value)}
                  style={{ ...inputStyle, flex: 1, padding: "6px 8px" }} />
                <button onClick={() => removeParsed(idx)} style={{ background: "none", border: "none", cursor: "pointer", color: "#D8D3C7" }}>
                  <X size={15} />
                </button>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input type="date" value={r.start} onChange={(e) => updateParsed(idx, "start", e.target.value)}
                  style={{ ...inputStyle, flex: 1, fontSize: 12, padding: "6px 8px" }} />
                <input type="date" value={r.end} onChange={(e) => updateParsed(idx, "end", e.target.value)}
                  style={{ ...inputStyle, flex: 1, fontSize: 12, padding: "6px 8px" }} />
              </div>
            </div>
          ))}
          {parsed.length === 0 && (
            <div style={{ fontSize: 12.5, color: "#B3ADA0", textAlign: "center", padding: "10px 0" }}>
              Nenhuma reserva restante pra importar.
            </div>
          )}
          <button className="btn-primary" disabled={parsed.filter(r => r.include).length === 0} onClick={handleConfirm}
            style={{
              padding: "12px", borderRadius: 10, fontSize: 13.5, fontWeight: 600, marginTop: 4,
              cursor: parsed.filter(r => r.include).length === 0 ? "not-allowed" : "pointer",
              opacity: parsed.filter(r => r.include).length === 0 ? 0.5 : 1,
            }}>
            Salvar {parsed.filter(r => r.include).length} reserva(s) em {PROPERTIES.find(p => p.id === propertyId)?.name}
          </button>
        </div>
      )}
    </ModalShell>
  );
}

function AddReservaModal({ defaultDateKey, initial, onClose, onSave, onDelete }) {
  const isEdit = !!initial;
  const [propertyId, setPropertyId] = useState(initial?.propertyId || PROPERTIES[0].id);
  const [guestName, setGuestName] = useState(initial?.guestName || "");
  const [start, setStart] = useState(initial?.start || defaultDateKey);
  const [end, setEnd] = useState(initial?.end || defaultDateKey);
  const [amount, setAmount] = useState(initial?.amount != null ? String(initial.amount).replace(".", ",") : "");
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleSave() {
    if (!guestName.trim() || !start || !end || end <= start) return;
    const parsedAmount = amount.trim() ? Number(amount.replace(",", ".")) : null;
    onSave(propertyId, { guestName: guestName.trim(), start, end, amount: parsedAmount }, isEdit ? initial.id : null);
  }
  const invalid = !guestName.trim() || !start || !end || end <= start;

  return (
    <ModalShell title={isEdit ? "Editar reserva" : "Nova reserva"} onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <FieldLabel>Imóvel</FieldLabel>
          <div style={{ display: "flex", gap: 8 }}>
            {PROPERTIES.map(p => (
              <button key={p.id} onClick={() => setPropertyId(p.id)}
                style={{
                  flex: 1, padding: "9px 6px", borderRadius: 9, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                  border: `1.5px solid ${propertyId === p.id ? p.color : "#EAE7E0"}`,
                  background: propertyId === p.id ? p.soft : "#fff",
                  color: propertyId === p.id ? p.color : "#6B6558",
                }}>{p.name}</button>
            ))}
          </div>
        </div>
        <div>
          <FieldLabel>Hóspede</FieldLabel>
          <input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Ex.: Marcela + 2" style={inputStyle} />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <FieldLabel>Check-in ({CHECKIN_HOUR})</FieldLabel>
            <input type="date" value={start} onChange={(e) => setStart(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <FieldLabel>Check-out ({CHECKOUT_HOUR})</FieldLabel>
            <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} style={inputStyle} />
          </div>
        </div>
        <div>
          <FieldLabel>Valor recebido (R$, opcional)</FieldLabel>
          <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder="0,00" style={inputStyle} />
          <p style={{ fontSize: 11, color: "#B3ADA0", margin: "5px 0 0" }}>
            Se preencher, já lança sozinho em Finanças como receita na data de saída.
          </p>
        </div>
        <button className="btn-primary" disabled={invalid} onClick={handleSave}
          style={{ padding: "12px", borderRadius: 10, fontSize: 13.5, fontWeight: 600, marginTop: 4, cursor: invalid ? "not-allowed" : "pointer", opacity: invalid ? 0.5 : 1 }}>
          {isEdit ? "Salvar alterações" : "Salvar reserva"}
        </button>

        {isEdit && !confirmDelete && (
          <button onClick={() => setConfirmDelete(true)} style={{
            padding: "10px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer",
            border: "1px solid #F3D1CC", background: "#fff", color: "#B4231F",
          }}>
            Excluir reserva
          </button>
        )}
        {isEdit && confirmDelete && (
          <div style={{ padding: 12, borderRadius: 10, background: "#FBE9E7", display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 12.5, color: "#7A241A" }}>
              Excluir a reserva de <b>{guestName}</b>? Se houver um valor lançado em Finanças vinculado a ela, também será removido.
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setConfirmDelete(false)} style={{
                flex: 1, padding: "9px", borderRadius: 9, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                border: "1px solid #EAE7E0", background: "#fff", color: "#6B6558",
              }}>
                Cancelar
              </button>
              <button onClick={() => onDelete(propertyId, initial.id)} style={{
                flex: 1, padding: "9px", borderRadius: 9, fontSize: 12.5, fontWeight: 700, cursor: "pointer",
                border: "none", background: "#B4231F", color: "#fff",
              }}>
                Sim, excluir
              </button>
            </div>
          </div>
        )}
      </div>
    </ModalShell>
  );
}

function AddTaskModal({ defaultDateKey, customTaskTypes, onClose, onSave }) {
  const allTypes = [...TASK_TYPES.slice(0, -1), ...customTaskTypes, TASK_TYPES[TASK_TYPES.length - 1]]; // "Outro" sempre por último
  const [propertyId, setPropertyId] = useState(PROPERTIES[0].id);
  const [type, setType] = useState("limpeza");
  const [title, setTitle] = useState("Limpeza");
  const [customLabel, setCustomLabel] = useState("");
  const [dateKey, setDateKey] = useState(defaultDateKey);
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");

  function pickType(t) {
    setType(t.id);
    if (t.id !== "outro") setTitle(t.label);
    else { setTitle(""); setCustomLabel(""); }
  }

  function handleSave() {
    if (type === "outro") {
      const label = customLabel.trim();
      if (!label) return;
      const newTypeId = slugify(label);
      onSave(propertyId, { dateKey, type: newTypeId, title: label, time, note: note.trim() }, { id: newTypeId, label });
    } else {
      if (!title.trim()) return;
      onSave(propertyId, { dateKey, type, title: title.trim(), time, note: note.trim() });
    }
  }
  const invalid = type === "outro" ? !customLabel.trim() : !title.trim();

  return (
    <ModalShell title="Novo compromisso" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <FieldLabel>Imóvel</FieldLabel>
          <div style={{ display: "flex", gap: 8 }}>
            {PROPERTIES.map(p => (
              <button key={p.id} onClick={() => setPropertyId(p.id)}
                style={{
                  flex: 1, padding: "9px 6px", borderRadius: 9, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                  border: `1.5px solid ${propertyId === p.id ? p.color : "#EAE7E0"}`,
                  background: propertyId === p.id ? p.soft : "#fff",
                  color: propertyId === p.id ? p.color : "#6B6558",
                }}>{p.name}</button>
            ))}
          </div>
        </div>
        <div>
          <FieldLabel>Tipo</FieldLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {allTypes.map(t => (
              <button key={t.id} onClick={() => pickType(t)}
                style={{
                  padding: "7px 11px", borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: "pointer",
                  border: `1px solid ${type === t.id ? "#1F2937" : "#EAE7E0"}`,
                  background: type === t.id ? "#1F2937" : "#fff",
                  color: type === t.id ? "#fff" : "#6B6558",
                }}>{t.label}</button>
            ))}
          </div>
        </div>
        {type === "outro" ? (
          <div>
            <FieldLabel>Especificar (vira uma nova opção de tipo)</FieldLabel>
            <input value={customLabel} onChange={(e) => setCustomLabel(e.target.value)} placeholder="Ex.: Troca de gás, Jardinagem..." style={inputStyle} />
          </div>
        ) : (
          <div>
            <FieldLabel>Título</FieldLabel>
            <input value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} />
          </div>
        )}
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <FieldLabel>Data</FieldLabel>
            <input type="date" value={dateKey} onChange={(e) => setDateKey(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ width: 108 }}>
            <FieldLabel>Hora</FieldLabel>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} style={inputStyle} />
          </div>
        </div>
        <div>
          <FieldLabel>Observação (opcional)</FieldLabel>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} style={{ ...inputStyle, height: 60, resize: "vertical" }} />
        </div>
        <button className="btn-primary" disabled={invalid} onClick={handleSave}
          style={{ padding: "12px", borderRadius: 10, fontSize: 13.5, fontWeight: 600, marginTop: 4, cursor: invalid ? "not-allowed" : "pointer", opacity: invalid ? 0.5 : 1 }}>
          Salvar compromisso
        </button>
      </div>
    </ModalShell>
  );
}

function HojeCard({ today, reservas, events, visibleProps, propName, propColor, propSoft, onOpen }) {
  const todayKey = toKey(today);
  const items = [];
  for (const pid of visibleProps) {
    for (const r of (reservas[pid] || [])) {
      if (r.start === todayKey) items.push({ kind: "checkin", pid, label: `${r.guestName} chega`, sub: `Check-in · ${CHECKIN_HOUR}` });
      if (r.end === todayKey) items.push({ kind: "checkout", pid, label: `${r.guestName} sai`, sub: `Check-out · ${CHECKOUT_HOUR}` });
    }
    for (const t of (events[pid] || [])) {
      if (t.dateKey === todayKey) {
        const TaskIcon = TASK_TYPES.find(tt => tt.id === t.type)?.icon || MoreHorizontal;
        items.push({ kind: "tarefa", pid, label: t.title, sub: t.time || "Compromisso", icon: TaskIcon });
      }
    }
  }
  const order = { checkin: 0, checkout: 1, tarefa: 2 };
  items.sort((a, b) => order[a.kind] - order[b.kind]);

  return (
    <button onClick={onOpen} style={{
      width: "100%", textAlign: "left", border: "none", cursor: "pointer",
      background: "#1F2937", borderRadius: 18, padding: 20, marginBottom: 16,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <Sparkles size={18} color="#FF8A65" />
        <span style={{ fontFamily: "'Fraunces', serif", fontSize: 19, fontWeight: 600, color: "#fff" }}>
          Hoje · {today.getDate()} de {MONTH_NAMES[today.getMonth()]}
        </span>
      </div>
      {items.length === 0 ? (
        <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.6)", padding: "10px 0 4px" }}>Nada agendado para hoje.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map((it, idx) => {
            const Icon = it.kind === "checkin" ? LogIn : it.kind === "checkout" ? LogOut : (it.icon || MoreHorizontal);
            return (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 10, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(255,255,255,0.12)",
                }}>
                  <Icon size={16} color="#fff" />
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#fff", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {it.label}
                </span>
                <span style={{ fontSize: 11.5, color: propColor(it.pid), background: propSoft(it.pid), padding: "3px 8px", borderRadius: 999, fontWeight: 700, flexShrink: 0 }}>
                  {propName(it.pid)}
                </span>
                <span style={{ fontSize: 11.5, color: "rgba(255,255,255,0.55)", flexShrink: 0 }}>{it.sub}</span>
              </div>
            );
          })}
        </div>
      )}
    </button>
  );
}

function TarefasTab({ tarefas, onAdd, onToggle, onRemove, propColor, propSoft }) {
  const [novoTitulo, setNovoTitulo] = useState("");
  const [novaProp, setNovaProp] = useState(PROPERTIES[0].id);

  function handleAdd() {
    const title = novoTitulo.trim();
    if (!title) return;
    onAdd(title, novaProp);
    setNovoTitulo("");
  }

  return (
    <div style={{ padding: "14px 12px 24px" }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 8, overflowX: "auto" }}>
        {PROPERTIES.map(p => (
          <button key={p.id} onClick={() => setNovaProp(p.id)}
            style={{
              padding: "6px 11px", borderRadius: 999, flexShrink: 0, fontSize: 12, fontWeight: 600, cursor: "pointer",
              border: `1.5px solid ${novaProp === p.id ? p.color : "#E5E1D8"}`,
              background: novaProp === p.id ? p.soft : "#fff",
              color: novaProp === p.id ? p.color : "#B3ADA0",
            }}>{p.name}</button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <input value={novoTitulo} onChange={(e) => setNovoTitulo(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
          placeholder={`Nova tarefa para ${PROPERTIES.find(p => p.id === novaProp).name}...`} style={{ ...inputStyle, flex: 1 }} />
        <button onClick={handleAdd} disabled={!novoTitulo.trim()} className="btn-primary"
          style={{
            width: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: novoTitulo.trim() ? "pointer" : "not-allowed", opacity: novoTitulo.trim() ? 1 : 0.5,
          }}>
          <Plus size={17} />
        </button>
      </div>

      {tarefas.length === 0 && (
        <div style={{ textAlign: "center", color: "#B3ADA0", fontSize: 12.5, padding: "24px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <ListChecks size={20} />
          Nenhuma tarefa ainda. Adicione a primeira acima.
        </div>
      )}

      {PROPERTIES.map((p, idx) => {
        const doChale = tarefas.filter(t => t.propertyId === p.id);
        const pendentes = doChale.filter(t => !t.done);
        const feitas = doChale.filter(t => t.done);
        return (
          <div key={p.id} style={{
            marginBottom: 4,
            borderTop: idx > 0 ? "1px solid #EEEBE4" : "none",
            paddingTop: idx > 0 ? 14 : 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <span style={{ width: 9, height: 9, borderRadius: 3, background: p.color }} />
              <span style={{ fontFamily: "'Fraunces', serif", fontSize: 15, fontWeight: 600 }}>{p.name}</span>
            </div>
            {doChale.length === 0 && (
              <div style={{ fontSize: 12, color: "#B3ADA0", padding: "4px 0 14px" }}>Nenhuma tarefa por aqui.</div>
            )}
            {pendentes.map(t => (
              <TarefaRow key={t.id} tarefa={t} onToggle={onToggle} onRemove={onRemove} />
            ))}
            {feitas.length > 0 && (
              <>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: "#B3ADA0", textTransform: "uppercase", letterSpacing: 0.4, margin: "10px 0 6px" }}>
                  Concluídas
                </div>
                {feitas.map(t => (
                  <TarefaRow key={t.id} tarefa={t} onToggle={onToggle} onRemove={onRemove} />
                ))}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TarefaRow({ tarefa, onToggle, onRemove }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10, padding: "10px 4px",
      borderBottom: "1px solid #EEEBE4",
    }}>
      <button onClick={() => onToggle(tarefa.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
        {tarefa.done
          ? <CheckCircle2 size={22} color="#F2B705" fill="#F2B705" />
          : <Circle size={22} color="#D8D3C7" />}
      </button>
      <span style={{
        flex: 1, fontSize: 14.5, color: tarefa.done ? "#B3ADA0" : "#1F2937",
        textDecoration: tarefa.done ? "line-through" : "none",
      }}>
        {tarefa.title}
      </span>
      <button onClick={() => onRemove(tarefa.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#D8D3C7", padding: 4 }}>
        <X size={16} />
      </button>
    </div>
  );
}

function ConcorrentesTab({ concorrentes, onAdd, onRemove, onRefresh }) {
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [adding, setAdding] = useState(false);

  async function handleAdd() {
    const cleanUrl = url.trim();
    if (!cleanUrl) return;
    setAdding(true);
    await onAdd(cleanUrl, label.trim());
    setAdding(false);
    setUrl("");
    setLabel("");
  }

  return (
    <div style={{ padding: "14px 12px 24px" }}>
      <div style={{ padding: 12, borderRadius: 12, background: "#F3F1EC", marginBottom: 18 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#6B6558", marginBottom: 8 }}>Cadastrar concorrente</div>
        <input value={url} onChange={(e) => setUrl(e.target.value)}
          placeholder="Link do anúncio no Airbnb" style={{ ...inputStyle, marginBottom: 8 }} />
        <input value={label} onChange={(e) => setLabel(e.target.value)}
          placeholder="Apelido (opcional, ex.: Chalé da Serra)" style={{ ...inputStyle, marginBottom: 10 }} />
        <button onClick={handleAdd} disabled={!url.trim() || adding} className="btn-primary"
          style={{
            width: "100%", padding: "10px", borderRadius: 10, fontSize: 13, fontWeight: 600,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            cursor: (!url.trim() || adding) ? "not-allowed" : "pointer", opacity: (!url.trim() || adding) ? 0.5 : 1,
          }}>
          {adding ? <Loader2 size={15} className="spin" /> : <Plus size={15} />}
          {adding ? "Analisando..." : "Adicionar e analisar"}
        </button>
      </div>

      <p style={{ fontSize: 11, color: "#B3ADA0", lineHeight: 1.5, marginTop: -8, marginBottom: 18 }}>
        A análise é feita por busca na web — quando o Airbnb não expõe os dados publicamente, o resultado pode vir
        limitado. Cadastre uma vez; depois use "Atualizar" em cada card para refazer a pesquisa.
      </p>

      {concorrentes.length === 0 && (
        <div style={{ textAlign: "center", color: "#B3ADA0", fontSize: 12.5, padding: "24px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <Search size={20} />
          Nenhum concorrente cadastrado ainda.
        </div>
      )}

      {concorrentes.map(c => (
        <div key={c.id} style={{ padding: 12, borderRadius: 12, border: "1px solid #EAE7E0", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>{c.label || "Concorrente"}</div>
              <a href={c.url} target="_blank" rel="noreferrer" style={{
                fontSize: 11, color: "#0F766E", display: "flex", alignItems: "center", gap: 4,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                <Link2 size={11} /> {c.url}
              </a>
            </div>
            <button onClick={() => onRemove(c.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#D8D3C7", padding: 2, flexShrink: 0 }}>
              <X size={16} />
            </button>
          </div>

          {c.status === "loading" && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#8A8478", padding: "8px 0" }}>
              <Loader2 size={14} className="spin" /> Pesquisando na web...
            </div>
          )}
          {c.status === "error" && (
            <div style={{ fontSize: 12, color: "#B4231F", padding: "6px 0" }}>
              Não consegui concluir a análise{c.errorMsg ? `: ${c.errorMsg}` : "."} Tente atualizar.
            </div>
          )}
          {c.analysis && c.status !== "loading" && (
            <div style={{ fontSize: 12.5, color: "#1F2937", lineHeight: 1.6, whiteSpace: "pre-wrap", marginBottom: 8 }}>
              {c.analysis}
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 10.5, color: "#B3ADA0" }}>
              {c.updatedAt ? `Atualizado em ${new Date(c.updatedAt).toLocaleDateString("pt-BR")}` : "Ainda não analisado"}
            </span>
            <button onClick={() => onRefresh(c.id)} disabled={c.status === "loading"} style={{
              display: "flex", alignItems: "center", gap: 5, background: "none", border: "1px solid #EAE7E0",
              borderRadius: 8, padding: "5px 9px", fontSize: 11.5, fontWeight: 600, color: "#1F2937",
              cursor: c.status === "loading" ? "not-allowed" : "pointer", opacity: c.status === "loading" ? 0.5 : 1,
            }}>
              <RefreshCw size={12} /> Atualizar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function EstoqueTab({ estoque, categorias, onAdd, onChangeQty, onRemove, onChangeCategory, onMove, onAddCategoria }) {
  const [novoItem, setNovoItem] = useState("");
  const [novaCategoria, setNovaCategoria] = useState(categorias[0]?.id || "outros");
  const [openCats, setOpenCats] = useState(() => Object.fromEntries(categorias.map(c => [c.id, true])));
  const [showNovaCategoria, setShowNovaCategoria] = useState(false);
  const [nomeNovaCategoria, setNomeNovaCategoria] = useState("");

  function toggleCat(id) {
    setOpenCats(prev => ({ ...prev, [id]: prev[id] === undefined ? false : !prev[id] }));
  }
  function isCatOpen(id) {
    return openCats[id] === undefined ? true : openCats[id];
  }

  function handleAdd() {
    const name = novoItem.trim();
    if (!name) return;
    onAdd(name, novaCategoria);
    setNovoItem("");
  }

  function handleAddCategoria() {
    const label = nomeNovaCategoria.trim();
    if (!label) return;
    const id = onAddCategoria(label);
    if (id) setNovaCategoria(id);
    setNomeNovaCategoria("");
    setShowNovaCategoria(false);
  }

  function totalOf(item) {
    return Object.values(item.quantities).reduce((s, n) => s + n, 0);
  }

  return (
    <div style={{ padding: "14px 12px 24px" }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 8, overflowX: "auto" }}>
        {categorias.map(c => (
          <button key={c.id} onClick={() => setNovaCategoria(c.id)}
            style={{
              padding: "6px 11px", borderRadius: 999, flexShrink: 0, fontSize: 12, fontWeight: 600, cursor: "pointer",
              border: `1.5px solid ${novaCategoria === c.id ? "#1F2937" : "#EAE7E0"}`,
              background: novaCategoria === c.id ? "#1F2937" : "#fff",
              color: novaCategoria === c.id ? "#fff" : "#6B6558",
            }}>{c.label}</button>
        ))}
        <button onClick={() => setShowNovaCategoria(v => !v)} style={{
          padding: "6px 11px", borderRadius: 999, flexShrink: 0, fontSize: 12, fontWeight: 600, cursor: "pointer",
          border: "1.5px dashed #D8D3C7", background: "#fff", color: "#6B6558",
          display: "flex", alignItems: "center", gap: 4,
        }}>
          <Plus size={12} /> Categoria
        </button>
      </div>

      {showNovaCategoria && (
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <input value={nomeNovaCategoria} onChange={(e) => setNomeNovaCategoria(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAddCategoria(); }}
            placeholder="Nome da nova categoria (ex.: Manutenção)" style={{ ...inputStyle, flex: 1 }} autoFocus />
          <button onClick={handleAddCategoria} disabled={!nomeNovaCategoria.trim()} className="btn-primary"
            style={{
              padding: "0 14px", borderRadius: 10, fontSize: 12.5, fontWeight: 600,
              cursor: nomeNovaCategoria.trim() ? "pointer" : "not-allowed", opacity: nomeNovaCategoria.trim() ? 1 : 0.5,
            }}>
            Criar
          </button>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <input value={novoItem} onChange={(e) => setNovoItem(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
          placeholder={`Novo item de ${(categorias.find(c => c.id === novaCategoria)?.label || "").toLowerCase()}...`}
          style={{ ...inputStyle, flex: 1 }} />
        <button onClick={handleAdd} disabled={!novoItem.trim()} className="btn-primary"
          style={{
            width: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: novoItem.trim() ? "pointer" : "not-allowed", opacity: novoItem.trim() ? 1 : 0.5,
          }}>
          <Plus size={17} />
        </button>
      </div>

      {estoque.length === 0 && (
        <div style={{ textAlign: "center", color: "#B3ADA0", fontSize: 12.5, padding: "24px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <Package size={20} />
          Nenhum item ainda.
        </div>
      )}

      {categorias.map((cat, catIdx) => {
        const items = estoque.filter(i => i.category === cat.id);
        if (items.length === 0) return null;
        const isOpen = isCatOpen(cat.id);
        const isLastVisible = !categorias.slice(catIdx + 1).some(c => estoque.some(i => i.category === c.id));
        return (
          <div key={cat.id} style={{
            marginBottom: 32, paddingBottom: 20,
            borderBottom: isLastVisible ? "none" : "1px solid #EEEBE4",
          }}>
            <button onClick={() => toggleCat(cat.id)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 8, background: "none", border: "none",
              cursor: "pointer", padding: "6px 2px", marginBottom: isOpen ? 12 : 0,
            }}>
              <ChevronRight size={16} color="#6B6558" style={{
                transform: isOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s ease", flexShrink: 0,
              }} />
              <span style={{ fontFamily: "'Fraunces', serif", fontSize: 15, fontWeight: 600 }}>{cat.label}</span>
              <span style={{ fontSize: 11, color: "#B3ADA0", fontWeight: 600 }}>({items.length})</span>
            </button>
            {isOpen && items.map((item, i) => (
              <ItemRow key={item.id} item={item} onChangeQty={onChangeQty} onRemove={onRemove}
                total={totalOf(item)} categorias={categorias} onChangeCategory={onChangeCategory}
                onMoveUp={i > 0 ? () => onMove(item.id, -1) : null}
                onMoveDown={i < items.length - 1 ? () => onMove(item.id, 1) : null} />
            ))}
          </div>
        );
      })}
    </div>
  );
}

function ItemRow({ item, onChangeQty, onRemove, total, categorias, onChangeCategory, onMoveUp, onMoveDown }) {
  const locations = locationsFor(item.category);
  return (
    <div style={{ padding: "10px 4px", borderBottom: "1px solid #EEEBE4" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <button onClick={onMoveUp} disabled={!onMoveUp} style={{
            background: "none", border: "none", cursor: onMoveUp ? "pointer" : "default",
            color: onMoveUp ? "#6B6558" : "#E5E1D8", padding: 0, lineHeight: 0.7,
          }}>▲</button>
          <button onClick={onMoveDown} disabled={!onMoveDown} style={{
            background: "none", border: "none", cursor: onMoveDown ? "pointer" : "default",
            color: onMoveDown ? "#6B6558" : "#E5E1D8", padding: 0, lineHeight: 0.7,
          }}>▼</button>
        </div>
        <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: total === 0 ? "#B4231F" : "#1F2937" }}>
          {item.name}
        </span>
        <span style={{ fontSize: 11, color: "#8A8478", fontWeight: 600 }}>Total: {total}</span>
        <select value={item.category} onChange={(e) => onChangeCategory(item.id, e.target.value)}
          style={{ fontSize: 10.5, color: "#6B6558", border: "1px solid #EAE7E0", borderRadius: 7, padding: "3px 4px", background: "#fff" }}>
          {categorias.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <button onClick={() => onRemove(item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#D8D3C7", padding: 2 }}>
          <X size={15} />
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6 }}>
        {locations.map(loc => (
          <div key={loc.id} style={{
            display: "flex", alignItems: "center", gap: 6, padding: "5px 6px", borderRadius: 9,
            background: loc.soft, border: `1px solid ${loc.color}22`,
          }}>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: loc.color, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {loc.name}
            </span>
            <button onClick={() => onChangeQty(item.id, loc.id, (item.quantities[loc.id] || 0) - 1)}
              style={{ ...qtyBtnStyle, width: 20, height: 20, background: "#fff" }}>
              <Minus size={10} />
            </button>
            <span style={{ fontSize: 12.5, fontWeight: 700, width: 16, textAlign: "center" }}>{item.quantities[loc.id] || 0}</span>
            <button onClick={() => onChangeQty(item.id, loc.id, (item.quantities[loc.id] || 0) + 1)}
              style={{ ...qtyBtnStyle, width: 20, height: 20, background: "#fff" }}>
              <Plus size={10} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const qtyBtnStyle = {
  width: 26, height: 26, borderRadius: 8, border: "1px solid #EAE7E0", background: "#fff",
  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#6B6558", flexShrink: 0,
};

function FieldLabel({ children }) {
  return <div style={{ fontSize: 11, fontWeight: 700, color: "#8A8478", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.3 }}>{children}</div>;
}
const inputStyle = {
  width: "100%", padding: "9px 10px", borderRadius: 9, border: "1px solid #EAE7E0",
  fontSize: 13, fontFamily: "inherit", color: "#1F2937",
};

function formatBRL(n) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function FinancasTab({ transacoes, onAdd, onEdit, onRemove, onImportPrint, propName, propColor, propSoft }) {
  const [monthCursor, setMonthCursor] = useState(() => new Date());
  const monthKey = `${monthCursor.getFullYear()}-${String(monthCursor.getMonth() + 1).padStart(2, "0")}`;
  const monthTransacoes = transacoes
    .filter(t => t.date && t.date.startsWith(monthKey))
    .sort((a, b) => b.date.localeCompare(a.date));

  const receitas = monthTransacoes.filter(t => t.kind === "receita").reduce((s, t) => s + t.amount, 0);
  const despesas = monthTransacoes.filter(t => t.kind === "despesa").reduce((s, t) => s + t.amount, 0);
  const saldo = receitas - despesas;

  function goMonth(delta) { setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() + delta, 1)); }

  return (
    <div style={{ padding: "14px 12px 90px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <button onClick={() => goMonth(-1)} style={navBtnStyle}><ChevronLeft size={17} /></button>
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 600 }}>
          {MONTH_NAMES[monthCursor.getMonth()]} {monthCursor.getFullYear()}
        </div>
        <button onClick={() => goMonth(1)} style={navBtnStyle}><ChevronRight size={17} /></button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
        <div style={{ padding: 12, borderRadius: 12, background: "#E6F4F2" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: "#0F766E", marginBottom: 4 }}>
            <TrendingUp size={13} /> Receitas
          </div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{formatBRL(receitas)}</div>
        </div>
        <div style={{ padding: 12, borderRadius: 12, background: "#FBF0E4" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: "#B45309", marginBottom: 4 }}>
            <TrendingDown size={13} /> Despesas
          </div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{formatBRL(despesas)}</div>
        </div>
      </div>
      <div style={{
        padding: 12, borderRadius: 12, border: "1px solid #EAE7E0", marginBottom: 16,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: "#8A8478" }}>Saldo do mês</span>
        <span style={{ fontSize: 17, fontWeight: 700, color: saldo >= 0 ? "#0F766E" : "#B4231F" }}>{formatBRL(saldo)}</span>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button onClick={onAdd} className="btn-primary" style={{
          flex: 1, padding: "11px", borderRadius: 10, fontSize: 13.5, fontWeight: 600,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}>
          <Plus size={15} /> Manual
        </button>
        <button onClick={onImportPrint} style={{
          flex: 1, padding: "11px", borderRadius: 10, fontSize: 13.5, fontWeight: 600,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          border: "1.5px dashed #D8D3C7", background: "#FAF9F7", color: "#6B6558",
        }}>
          <ImagePlus size={15} /> Importar print
        </button>
      </div>

      {monthTransacoes.length === 0 && (
        <div style={{ textAlign: "center", color: "#B3ADA0", fontSize: 12.5, padding: "18px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <Wallet size={18} />
          Nenhum lançamento neste mês.
        </div>
      )}

      {monthTransacoes.map(t => (
        <button key={t.id} onClick={() => onEdit(t)} style={{
          width: "100%", textAlign: "left", padding: 10, borderRadius: 10, border: "1px solid #EEEBE4", marginBottom: 8,
          display: "flex", alignItems: "center", gap: 8, background: "#fff", cursor: "pointer",
        }}>
          <div style={{
            width: 26, height: 26, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
            background: t.kind === "receita" ? "#E6F4F2" : "#FBF0E4",
          }}>
            {t.kind === "receita"
              ? <TrendingUp size={13} color="#0F766E" />
              : <TrendingDown size={13} color="#B45309" />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{t.description}</div>
            <div style={{ fontSize: 11, color: "#8A8478" }}>
              {t.propertyId ? propName(t.propertyId) + " · " : ""}{parseKey(t.date).toLocaleDateString("pt-BR")}
            </div>
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: t.kind === "receita" ? "#0F766E" : "#B45309" }}>
            {t.kind === "receita" ? "+" : "-"}{formatBRL(t.amount)}
          </div>
          <button onClick={(e) => { e.stopPropagation(); onRemove(t.id); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#B3ADA0", padding: 2 }}>
            <Trash2 size={13} />
          </button>
        </button>
      ))}
    </div>
  );
}

function AddTransacaoModal({ initial, onClose, onSave }) {
  const isEdit = !!initial;
  const [kind, setKind] = useState(initial?.kind || "receita");
  const [propertyId, setPropertyId] = useState(initial?.propertyId || PROPERTIES[0].id);
  const [description, setDescription] = useState(initial?.description || "");
  const [amount, setAmount] = useState(initial ? String(initial.amount).replace(".", ",") : "");
  const [date, setDate] = useState(initial?.date || toKey(new Date()));

  const parsedAmount = Number(amount.replace(",", "."));
  const invalid = !description.trim() || !amount || isNaN(parsedAmount) || parsedAmount <= 0;

  function handleSave() {
    if (invalid) return;
    onSave({ kind, propertyId, description: description.trim(), amount: parsedAmount, date }, isEdit ? initial.id : null);
  }

  return (
    <ModalShell title={isEdit ? "Editar lançamento" : "Novo lançamento"} onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <FieldLabel>Tipo</FieldLabel>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setKind("receita")}
              style={{
                flex: 1, padding: "9px 6px", borderRadius: 9, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                border: `1.5px solid ${kind === "receita" ? "#0F766E" : "#EAE7E0"}`,
                background: kind === "receita" ? "#E6F4F2" : "#fff",
                color: kind === "receita" ? "#0F766E" : "#6B6558",
              }}>Receita</button>
            <button onClick={() => setKind("despesa")}
              style={{
                flex: 1, padding: "9px 6px", borderRadius: 9, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                border: `1.5px solid ${kind === "despesa" ? "#B45309" : "#EAE7E0"}`,
                background: kind === "despesa" ? "#FBF0E4" : "#fff",
                color: kind === "despesa" ? "#B45309" : "#6B6558",
              }}>Despesa</button>
          </div>
        </div>
        <div>
          <FieldLabel>Imóvel</FieldLabel>
          <div style={{ display: "flex", gap: 8 }}>
            {PROPERTIES.map(p => (
              <button key={p.id} onClick={() => setPropertyId(p.id)}
                style={{
                  flex: 1, padding: "9px 6px", borderRadius: 9, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                  border: `1.5px solid ${propertyId === p.id ? p.color : "#EAE7E0"}`,
                  background: propertyId === p.id ? p.soft : "#fff",
                  color: propertyId === p.id ? p.color : "#6B6558",
                }}>{p.name}</button>
            ))}
          </div>
        </div>
        <div>
          <FieldLabel>Descrição</FieldLabel>
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex.: Diária Airbnb, Produtos de limpeza..." style={inputStyle} />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <FieldLabel>Valor (R$)</FieldLabel>
            <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder="0,00" style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <FieldLabel>Data</FieldLabel>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
          </div>
        </div>
        <button className="btn-primary" disabled={invalid} onClick={handleSave}
          style={{ padding: "12px", borderRadius: 10, fontSize: 13.5, fontWeight: 600, marginTop: 4, cursor: invalid ? "not-allowed" : "pointer", opacity: invalid ? 0.5 : 1 }}>
          {isEdit ? "Salvar alterações" : "Salvar lançamento"}
        </button>
      </div>
    </ModalShell>
  );
}
