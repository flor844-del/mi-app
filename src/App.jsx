import { useState, useRef, useEffect } from "react";

// TODO: Integrar con API real de transcripción (OpenAI Whisper o similar)
// TODO: Integrar con backend para persistencia real de notas
// TODO: Implementar sistema real de flashcards con spaced repetition algorithm

const COLORS = {
  primary: "#C1622D",
  primaryLight: "#D98A5C",
  primaryDark: "#9B4A1F",
  secondary: "#8A6D4F",
  accent: "#4C7A6B",
  bg: "#FAF6F0",
  bgCard: "#FFFFFF",
  bgCardLight: "#F2ECE2",
  text: "#2A241D",
  textSecondary: "#6B5D4F",
  textMuted: "#A89882",
  border: "#E8DFD1",
  danger: "#D64545",
  gold: "#D4A537",
};

const SCENES = [
  { id: "sunday", label: "Servicio Dominical", icon: "⛪", color: "#6B4EFF" },
  { id: "prayer", label: "Reunión de Oración", icon: "🙏", color: "#F5A623" },
  { id: "devotion", label: "Devoción Personal", icon: "📖", color: "#4CAF50" },
  { id: "fellowship", label: "Comunión", icon: "🤝", color: "#FF6B9D" },
  { id: "study", label: "Estudio Bíblico", icon: "🔍", color: "#00BCD4" },
];

const SAMPLE_NOTES = [
  {
    id: 1,
    title: "Sermón: La Fe que Mueve Montañas",
    scene: "sunday",
    date: "2025-01-12",
    content:
      "El pastor habló sobre Mateo 17:20 — 'Si tienen fe tan pequeña como un grano de mostaza...' La fe no se mide por su tamaño sino por su objeto. Dios es el objeto de nuestra fe y Él es infinito.",
    transcript:
      "Buenos días hermanos. Hoy vamos a hablar sobre la fe. La Biblia dice en Mateo 17:20 que si tienen fe como un grano de mostaza, nada les será imposible. La fe no es un sentimiento, es una decisión...",
    summary:
      "La fe genuina no depende de su tamaño sino de su objeto: Dios todopoderoso. Incluso la fe más pequeña puede lograr lo imposible cuando está puesta en Cristo.",
    verses: ["Mateo 17:20", "Hebreos 11:1", "Marcos 9:23"],
    flashcards: [
      {
        front: "¿Qué dice Mateo 17:20 sobre la fe?",
        back: "Si tienen fe tan pequeña como un grano de mostaza, le dirán a esta montaña: Trasládate de aquí para allá, y se trasladará.",
        type: "scripture",
      },
      {
        front: "¿Cuál es el objeto correcto de nuestra fe?",
        back: "Dios todopoderoso — la fe se mide no por su tamaño sino por quién es su objeto.",
        type: "insight",
      },
    ],
    duration: "45:30",
    tags: ["fe", "oración", "milagros"],
  },
  {
    id: 2,
    title: "Devoción: El Salmo 23",
    scene: "devotion",
    date: "2025-01-11",
    content:
      "Meditando en el Salmo 23. El Señor es mi pastor — esta declaración cambia todo. No soy un huérfano espiritual. Tengo un pastor que me guía, me protege y me sustenta.",
    transcript:
      "Señor, al leer el Salmo 23 esta mañana, mi corazón se llena de gratitud. Tú eres mi pastor y nada me faltará...",
    summary:
      "El Salmo 23 nos recuerda que bajo el cuidado de Dios-Pastor, tenemos provisión, descanso, restauración y protección constante.",
    verses: ["Salmo 23:1-6", "Juan 10:11", "Ezequiel 34:15"],
    flashcards: [
      {
        front: "¿Qué promete el Salmo 23:1?",
        back: "El Señor es mi pastor; nada me faltará.",
        type: "scripture",
      },
    ],
    duration: "15:20",
    tags: ["salmos", "paz", "confianza"],
  },
  {
    id: 3,
    title: "Reunión de Oración Intercesora",
    scene: "prayer",
    date: "2025-01-10",
    content:
      "Oramos por la nación, por los enfermos y por los que aún no conocen a Cristo. El hermano Carlos compartió una palabra poderosa sobre la intercesión.",
    transcript:
      "Padre celestial, venimos ante ti con corazones humildes intercediendo por nuestra nación...",
    summary:
      "La intercesión es un privilegio y responsabilidad del creyente. Dios nos invita a participar en Su obra a través de la oración.",
    verses: ["1 Timoteo 2:1", "Santiago 5:16", "Jeremías 29:7"],
    flashcards: [
      {
        front: "¿Por qué es importante la intercesión?",
        back: "Santiago 5:16 dice que la oración eficaz del justo puede mucho.",
        type: "application",
      },
    ],
    duration: "62:15",
    tags: ["intercesión", "oración", "comunidad"],
  },
];

const FLASHCARD_TYPES = {
  scripture: { label: "Memoria de Escritura", color: "#6B4EFF", icon: "📜" },
  insight: { label: "Perspectiva Devocional", color: "#F5A623", icon: "💡" },
  application: { label: "Aplicación Práctica", color: "#4CAF50", icon: "✅" },
};

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [notes, setNotes] = useState(SAMPLE_NOTES);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showNewNote, setShowNewNote] = useState(false);
  const [darkMode] = useState(true);
  const [activeFlashcard, setActiveFlashcard] = useState(null);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedScene, setSelectedScene] = useState("sunday");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [activeNoteTab, setActiveNoteTab] = useState("notes");
  const [showVerseSearch, setShowVerseSearch] = useState(false);
  const [verseQuery, setVerseQuery] = useState("");
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      role: "ai",
      text: "¡Hola! Soy tu asistente bíblico con IA. Puedo ayudarte a profundizar en las Escrituras, explicar pasajes y responder tus preguntas espirituales. ¿En qué puedo ayudarte hoy?",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isAITyping, setIsAITyping] = useState(false);
  const [toast, setToast] = useState(null);
  const recordingInterval = useRef(null);
  const chatEndRef = useRef(null);
  const toastTimeout = useRef(null);

  const showToast = (message) => {
    clearTimeout(toastTimeout.current);
    setToast(message);
    toastTimeout.current = setTimeout(() => setToast(null), 2200);
  };

  useEffect(() => {
    if (isRecording) {
      recordingInterval.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    } else {
      clearInterval(recordingInterval.current);
    }
    return () => clearInterval(recordingInterval.current);
  }, [isRecording]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    // TODO: Implementar grabación real con MediaRecorder API
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    // TODO: Enviar audio a API de transcripción
  };

  const handleSaveNote = () => {
    if (!noteTitle.trim()) return;
    const newNote = {
      id: Date.now(),
      title: noteTitle,
      scene: selectedScene,
      date: new Date().toISOString().split("T")[0],
      content: noteContent,
      transcript: noteContent,
      summary:
        "Resumen generado por IA próximamente...", // TODO: Generar con IA real
      verses: [],
      flashcards: [],
      duration: formatTime(recordingTime),
      tags: [],
    };
    setNotes([newNote, ...notes]);
    setNoteTitle("");
    setNoteContent("");
    setRecordingTime(0);
    setShowNewNote(false);
    setIsRecording(false);
  };

  // TODO: Conectar con API de chat real (OpenAI GPT o similar)
  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const userMsg = { id: Date.now(), role: "user", text: chatInput };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsAITyping(true);

    const responses = [
      "Excelente pregunta. En el contexto bíblico, esto nos remite a Juan 3:16 donde encontramos el corazón del evangelio: 'Porque tanto amó Dios al mundo, que dio a su Hijo unigénito...'",
      "Las Escrituras nos enseñan en Romanos 8:28 que todas las cosas ayudan a bien a los que aman a Dios. Podemos confiar en Su providencia incluso en tiempos difíciles.",
      "Hebreos 4:12 nos recuerda que la Palabra de Dios es viva y eficaz. Te recomendaría meditar en este pasaje y pedir al Espíritu Santo que lo haga vivo en tu corazón.",
      "La paz que sobrepasa todo entendimiento de Filipenses 4:7 es una promesa para todos los creyentes. Esta paz viene de llevar nuestras cargas a Dios en oración.",
    ];
    const randomResponse =
      responses[Math.floor(Math.random() * responses.length)];

    setTimeout(() => {
      setIsAITyping(false);
      setChatMessages((prev) => [
        ...prev,
        { id: Date.now(), role: "ai", text: randomResponse },
      ]);
    }, 1500);
  };

  const getAllFlashcards = () => {
    return notes.flatMap((note) =>
      note.flashcards.map((fc) => ({ ...fc, noteTitle: note.title }))
    );
  };

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getSceneInfo = (sceneId) =>
    SCENES.find((s) => s.id === sceneId) || SCENES[0];

  // ─── STYLES ────────────────────────────────────────────────────────────────

  const styles = {
    app: {
      maxWidth: 430,
      margin: "0 auto",
      minHeight: "100vh",
      background: COLORS.bg,
      color: COLORS.text,
      fontFamily:
        "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif",
      position: "relative",
      overflow: "hidden",
    },
    header: {
      background: `linear-gradient(135deg, ${COLORS.bgCard} 0%, ${COLORS.bg} 100%)`,
      padding: "52px 20px 20px",
      borderBottom: `1px solid ${COLORS.border}`,
      position: "sticky",
      top: 0,
      zIndex: 100,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: 700,
      color: COLORS.text,
      margin: 0,
    },
    headerSubtitle: {
      fontSize: 14,
      color: COLORS.textSecondary,
      marginTop: 4,
    },
    content: {
      paddingBottom: 90,
      minHeight: "calc(100vh - 160px)",
      overflowY: "auto",
    },
    bottomNav: {
      position: "fixed",
      bottom: 0,
      left: "50%",
      transform: "translateX(-50%)",
      width: "100%",
      maxWidth: 430,
      background: COLORS.bgCard,
      borderTop: `1px solid ${COLORS.border}`,
      display: "flex",
      justifyContent: "space-around",
      alignItems: "center",
      padding: "8px 0 20px",
      zIndex: 200,
    },
    navItem: (active) => ({
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 4,
      padding: "6px 12px",
      borderRadius: 12,
      cursor: "pointer",
      background: active ? `${COLORS.primary}20` : "transparent",
      border: "none",
      color: active ? COLORS.primary : COLORS.textMuted,
      transition: "all 0.2s ease",
      minWidth: 60,
    }),
    navIcon: {
      fontSize: 22,
    },
    navLabel: (active) => ({
      fontSize: 10,
      fontWeight: active ? 600 : 400,
    }),
    card: {
      background: COLORS.bgCard,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      border: `1px solid ${COLORS.border}`,
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
    pill: (color) => ({
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      background: `${color}20`,
      color: color,
      borderRadius: 20,
      padding: "3px 10px",
      fontSize: 12,
      fontWeight: 600,
    }),
    btn: (variant = "primary") => ({
      background:
        variant === "primary"
          ? `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})`
          : variant === "outline"
          ? "transparent"
          : variant === "danger"
          ? COLORS.danger
          : COLORS.bgCardLight,
      color:
        variant === "outline" ? COLORS.primary : COLORS.text,
      border:
        variant === "outline" ? `2px solid ${COLORS.primary}` : "none",
      borderRadius: 14,
      padding: "14px 24px",
      fontSize: 16,
      fontWeight: 600,
      cursor: "pointer",
      width: "100%",
      textAlign: "center",
      transition: "all 0.2s ease",
    }),
    input: {
      background: COLORS.bgCardLight,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 12,
      padding: "12px 16px",
      fontSize: 16,
      color: COLORS.text,
      width: "100%",
      outline: "none",
      boxSizing: "border-box",
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 700,
      color: COLORS.text,
      margin: "20px 20px 12px",
    },
    divider: {
      height: 1,
      background: COLORS.border,
      margin: "16px 0",
    },
  };

  // ─── SCREENS ────────────────────────────────────────────────────────────────

  const renderHome = () => (
    <div>
      {/* Hero greeting */}
      <div
        style={{
          background: `linear-gradient(135deg, ${COLORS.primary}30, ${COLORS.primaryDark}20)`,
          margin: "16px",
          borderRadius: 20,
          padding: 20,
          border: `1px solid ${COLORS.primary}40`,
        }}
      >
        <div style={{ fontSize: 14, color: COLORS.textSecondary, marginBottom: 4 }}>
          Bienvenido de nuevo 🙏
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
          Continúa tu jornada de fe
        </div>
        <div
          style={{
            background: COLORS.bgCard,
            borderRadius: 12,
            padding: 12,
            fontSize: 13,
            color: COLORS.textSecondary,
            fontStyle: "italic",
            borderLeft: `3px solid ${COLORS.secondary}`,
          }}
        >
          "Si tienen fe tan pequeña como un grano de mostaza... nada les será
          imposible." — Mateo 17:20
        </div>
      </div>

      {/* Quick Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 12,
          padding: "0 16px",
          marginBottom: 20,
        }}
      >
        {[
          { label: "Notas", value: notes.length, icon: "📝", color: COLORS.primary },
          {
            label: "Flashcards",
            value: getAllFlashcards().length,
            icon: "🃏",
            color: COLORS.secondary,
          },
          {
            label: "Versículos",
            value: notes.reduce((acc, n) => acc + n.verses.length, 0),
            icon: "📖",
            color: COLORS.accent,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: COLORS.bgCard,
              borderRadius: 16,
              padding: 14,
              textAlign: "center",
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <div style={{ fontSize: 24 }}>{stat.icon}</div>
            <div
              style={{ fontSize: 22, fontWeight: 700, color: stat.color, marginTop: 4 }}
            >
              {stat.value}
            </div>
            <div style={{ fontSize: 11, color: COLORS.textSecondary }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Record Button */}
      <div style={{ padding: "0 16px", marginBottom: 24 }}>
        <button
          onClick={() => setShowNewNote(true)}
          style={{
            ...styles.btn("primary"),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            padding: "18px 24px",
            borderRadius: 20,
            fontSize: 18,
          }}
        >
          <span style={{ fontSize: 24 }}>🎙️</span>
          Nueva Nota / Grabación
        </button>
      </div>

      {/* Scenes */}
      <div style={styles.sectionTitle}>Tipos de reunión</div>
      <div
        style={{
          display: "flex",
          gap: 10,
          padding: "0 16px",
          overflowX: "auto",
          marginBottom: 24,
          paddingBottom: 4,
        }}
      >
        {SCENES.map((scene) => (
          <div
            key={scene.id}
            onClick={() => {
              setSelectedScene(scene.id);
              setShowNewNote(true);
            }}
            style={{
              background: COLORS.bgCard,
              border: `1px solid ${scene.color}40`,
              borderRadius: 16,
              padding: "12px 16px",
              textAlign: "center",
              cursor: "pointer",
              minWidth: 90,
              flexShrink: 0,
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 6 }}>{scene.icon}</div>
            <div
              style={{ fontSize: 11, color: scene.color, fontWeight: 600, lineHeight: 1.3 }}
            >
              {scene.label}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Notes */}
      <div style={styles.sectionTitle}>Notas recientes</div>
      <div style={{ padding: "0 16px" }}>
        {notes.slice(0, 3).map((note) => {
          const scene = getSceneInfo(note.scene);
          return (
            <div
              key={note.id}
              onClick={() => {
                setSelectedNote(note);
                setActiveTab("notes");
              }}
              style={styles.card}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 8,
                }}
              >
                <span style={styles.pill(scene.color)}>
                  {scene.icon} {scene.label}
                </span>
                <span style={{ fontSize: 12, color: COLORS.textMuted }}>
                  {note.date}
                </span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>
                {note.title}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: COLORS.textSecondary,
                  lineHeight: 1.5,
                  WebkitLineClamp: 2,
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                }}
              >
                {note.content}
              </div>
              <div
                style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}
              >
                {note.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      background: COLORS.bgCardLight,
                      color: COLORS.textSecondary,
                      borderRadius: 10,
                      padding: "2px 8px",
                      fontSize: 11,
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderNotes = () => {
    if (selectedNote) {
      return renderNoteDetail(selectedNote);
    }
    return (
      <div>
        <div style={{ padding: "16px 16px 0" }}>
          <input
            style={styles.input}
            placeholder="🔍  Buscar notas, versículos, temas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            padding: "12px 16px",
            overflowX: "auto",
          }}
        >
          {SCENES.map((scene) => (
            <button
              key={scene.id}
              style={{
                background:
                  selectedScene === scene.id
                    ? `${scene.color}30`
                    : COLORS.bgCard,
                border: `1px solid ${
                  selectedScene === scene.id ? scene.color : COLORS.border
                }`,
                color:
                  selectedScene === scene.id ? scene.color : COLORS.textSecondary,
                borderRadius: 20,
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
              onClick={() =>
                setSelectedScene(selectedScene === scene.id ? "" : scene.id)
              }
            >
              {scene.icon} {scene.label}
            </button>
          ))}
        </div>
        <div style={{ padding: "0 16px" }}>
          {filteredNotes
            .filter((n) => !selectedScene || n.scene === selectedScene)
            .map((note) => {
              const scene = getSceneInfo(note.scene);
              return (
                <div
                  key={note.id}
                  onClick={() => setSelectedNote(note)}
                  style={styles.card}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <span style={styles.pill(scene.color)}>
                      {scene.icon} {scene.label}
                    </span>
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                      }}
                    >
                      <span style={{ fontSize: 11, color: COLORS.textMuted }}>
                        ⏱ {note.duration}
                      </span>
                      <span style={{ fontSize: 11, color: COLORS.textMuted }}>
                        {note.date}
                      </span>
                    </div>
                  </div>
                  <div
                    style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}
                  >
                    {note.title}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: COLORS.textSecondary,
                      WebkitLineClamp: 2,
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {note.content}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      marginTop: 10,
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: 12, color: COLORS.textSecondary }}>
                      📜 {note.verses.length} versículos
                    </span>
                    <span style={{ fontSize: 12, color: COLORS.textSecondary }}>
                      🃏 {note.flashcards.length} tarjetas
                    </span>
                  </div>
                </div>
              );
            })}
          {filteredNotes.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: 40,
                color: COLORS.textMuted,
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
              <div style={{ fontSize: 16 }}>No se encontraron notas</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderNoteDetail = (note) => {
    const scene = getSceneInfo(note.scene);
    const tabs = ["notes", "transcript", "summary", "flashcards"];
    const tabLabels = {
      notes: "Notas",
      transcript: "Transcripción",
      summary: "Resumen IA",
      flashcards: "Flashcards",
    };

    return (
      <div>
        <div style={{ padding: "0 16px" }}>
          <button
            onClick={() => setSelectedNote(null)}
            style={{
              background: "transparent",
              border: "none",
              color: COLORS.primary,
              fontSize: 16,
              cursor: "pointer",
              padding: "8px 0",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            ← Volver
          </button>
        </div>

        <div
          style={{
            background: `linear-gradient(135deg, ${scene.color}20, transparent)`,
            padding: "16px 16px 20px",
            margin: "0 16px",
            borderRadius: 20,
            border: `1px solid ${scene.color}30`,
            marginBottom: 16,
          }}
        >
          <span style={styles.pill(scene.color)}>
            {scene.icon} {scene.label}
          </span>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 700,
              margin: "10px 0 6px",
              lineHeight: 1.3,
            }}
          >
            {note.title}
          </h2>
          <div
            style={{
              display: "flex",
              gap: 12,
              color: COLORS.textMuted,
              fontSize: 13,
            }}
          >
            <span>📅 {note.date}</span>
            <span>⏱ {note.duration}</span>
          </div>
          {note.verses.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
              {note.verses.map((v) => (
                <span key={v} style={styles.pill(COLORS.secondary)}>
                  📖 {v}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: 4,
            padding: "0 16px",
            marginBottom: 16,
            overflowX: "auto",
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveNoteTab(tab)}
              style={{
                background:
                  activeNoteTab === tab ? COLORS.primary : COLORS.bgCard,
                color:
                  activeNoteTab === tab ? "#fff" : COLORS.textSecondary,
                border: "none",
                borderRadius: 10,
                padding: "8px 14px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {tabLabels[tab]}
            </button>
          ))}
        </div>

        <div style={{ padding: "0 16px" }}>
          {activeNoteTab === "notes" && (
            <div
              style={{
                background: COLORS.bgCard,
                borderRadius: 16,
                padding: 16,
                lineHeight: 1.7,
                fontSize: 15,
                color: COLORS.text,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              {note.content}
            </div>
          )}

          {activeNoteTab === "transcript" && (
            <div>
              <div
                style={{
                  background: `${COLORS.primary}15`,
                  border: `1px solid ${COLORS.primary}30`,
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 12,
                  fontSize: 13,
                  color: COLORS.textSecondary,
                }}
              >
                🤖 Transcripción generada por IA con alta precisión
                {/* TODO: Mostrar confidence score real de la transcripción */}
              </div>
              <div
                style={{
                  background: COLORS.bgCard,
                  borderRadius: 16,
                  padding: 16,
                  lineHeight: 1.8,
                  fontSize: 14,
                  color: COLORS.text,
                  border: `1px solid ${COLORS.border}`,
                }}
              >
                {note.transcript}
              </div>
            </div>
          )}

          {activeNoteTab === "summary" && (
            <div>
              <div
                style={{
                  background: `linear-gradient(135deg, ${COLORS.primary}20, ${COLORS.secondary}10)`,
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 12,
                  border: `1px solid ${COLORS.primary}30`,
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    color: COLORS.secondary,
                    fontWeight: 600,
                    marginBottom: 8,
                  }}
                >
                  ✨ Resumen inteligente
                </div>
                <div style={{ fontSize: 15, lineHeight: 1.7, color: COLORS.text }}>
                  {note.summary}
                </div>
              </div>
              <div
                style={{
                  background: COLORS.bgCard,
                  borderRadius: 16,
                  padding: 16,
                  border: `1px solid ${COLORS.border}`,
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: COLORS.accent,
                    marginBottom: 10,
                  }}
                >
                  🙏 Perspectiva espiritual
                </div>
                <div style={{ fontSize: 14, color: COLORS.textSecondary, lineHeight: 1.7 }}>
                  {/* TODO: Generar perspectiva espiritual real con IA */}
                  Este mensaje nos invita a fortalecer nuestra fe y confianza en
                  Dios. Aplica este principio en tu vida diaria con oración y
                  meditación en Su Palabra.
                </div>
              </div>
            </div>
          )}

          {activeNoteTab === "flashcards" && (
            <div>
              {note.flashcards.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: 32,
                    color: COLORS.textMuted,
                  }}
                >
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🃏</div>
                  <div>
                    No hay flashcards todavía.
                    {/* TODO: Botón para generar flashcards con IA */}
                  </div>
                </div>
              ) : (
                note.flashcards.map((fc, i) => {
                  const type = FLASHCARD_TYPES[fc.type] || FLASHCARD_TYPES.insight;
                  return (
                    <div
                      key={i}
                      style={{
                        background: `linear-gradient(135deg, ${type.color}20, ${COLORS.bgCard})`,
                        borderRadius: 20,
                        padding: 20,
                        marginBottom: 12,
                        border: `1px solid ${type.color}30`,
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        setActiveFlashcard(fc);
                        setFlashcardFlipped(false);
                      }}
                    >
                      <span style={styles.pill(type.color)}>
                        {type.icon} {type.label}
                      </span>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 600,
                          margin: "10px 0 6px",
                        }}
                      >
                        {fc.front}
                      </div>
                      <div
                        style={{ fontSize: 13, color: COLORS.textSecondary }}
                      >
                        Toca para ver la respuesta
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderFlashcardsScreen = () => {
    const allCards = getAllFlashcards();

    if (activeFlashcard) {
      const type =
        FLASHCARD_TYPES[activeFlashcard.type] || FLASHCARD_TYPES.insight;
      return (
        <div>
          <div style={{ padding: "0 16px" }}>
            <button
              onClick={() => {
                setActiveFlashcard(null);
                setFlashcardFlipped(false);
              }}
              style={{
                background: "transparent",
                border: "none",
                color: COLORS.primary,
                fontSize: 16,
                cursor: "pointer",
                padding: "8px 0",
              }}
            >
              ← Volver
            </button>
          </div>
          <div style={{ padding: "0 16px", textAlign: "center" }}>
            <span style={styles.pill(type.color)}>
              {type.icon} {type.label}
            </span>
            <div
              onClick={() => setFlashcardFlipped(!flashcardFlipped)}
              style={{
                background: flashcardFlipped
                  ? `linear-gradient(135deg, ${type.color}30, ${COLORS.bgCard})`
                  : COLORS.bgCard,
                borderRadius: 24,
                padding: "40px 24px",
                marginTop: 20,
                marginBottom: 20,
                minHeight: 220,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                border: `2px solid ${type.color}50`,
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  color: COLORS.textMuted,
                  marginBottom: 16,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                {flashcardFlipped ? "✅ Respuesta" : "❓ Pregunta"}
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  lineHeight: 1.6,
                  color: COLORS.text,
                  textAlign: "center",
                }}
              >
                {flashcardFlipped
                  ? activeFlashcard.back
                  : activeFlashcard.front}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: COLORS.textMuted,
                  marginTop: 20,
                }}
              >
                Toca para {flashcardFlipped ? "ver pregunta" : "revelar respuesta"}
              </div>
            </div>
            {flashcardFlipped && (
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  justifyContent: "center",
                }}
              >
                <button
                  style={{
                    ...styles.btn("danger"),
                    width: "auto",
                    padding: "12px 24px",
                    background: "#FF5C5C20",
                    color: COLORS.danger,
                    border: `1px solid ${COLORS.danger}40`,
                  }}
                  onClick={() => setFlashcardFlipped(false)}
                >
                  😕 Repasar
                </button>
                <button
                  style={{
                    ...styles.btn("primary"),
                    width: "auto",
                    padding: "12px 24px",
                    background: `${COLORS.accent}20`,
                    color: COLORS.accent,
                    border: `1px solid ${COLORS.accent}40`,
                  }}
                  onClick={() => {
                    setActiveFlashcard(null);
                    setFlashcardFlipped(false);
                  }}
                >
                  ✅ Dominado
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            padding: "16px 16px 0",
          }}
        >
          {Object.entries(FLASHCARD_TYPES).map(([key, type]) => {
            const count = allCards.filter((c) => c.type === key).length;
            return (
              <div
                key={key}
                style={{
                  background: `linear-gradient(135deg, ${type.color}25, ${COLORS.bgCard})`,
                  borderRadius: 16,
                  padding: 16,
                  border: `1px solid ${type.color}30`,
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>{type.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: type.color }}>
                  {type.label}
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>
                  {count}
                </div>
                <div style={{ fontSize: 11, color: COLORS.textMuted }}>
                  tarjetas
                </div>
              </div>
            );
          })}
          <div
            style={{
              background: COLORS.bgCard,
              borderRadius: 16,
              padding: 16,
              border: `1px solid ${COLORS.border}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            onClick={() => setActiveTab("notes")}
          >
            <div style={{ fontSize: 28 }}>+</div>
            <div
              style={{
                fontSize: 13,
                color: COLORS.textSecondary,
                textAlign: "center",
                marginTop: 4,
              }}
            >
              Crear desde nota
            </div>
          </div>
        </div>

        <div style={styles.sectionTitle}>Todas las tarjetas ({allCards.length})</div>
        <div style={{ padding: "0 16px" }}>
          {allCards.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: 40,
                color: COLORS.textMuted,
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 12 }}>🃏</div>
              <div>
                Aún no tienes flashcards. Ve a una nota y crea tarjetas de
                estudio.
              </div>
            </div>
          ) : (
            allCards.map((fc, i) => {
              const type =
                FLASHCARD_TYPES[fc.type] || FLASHCARD_TYPES.insight;
              return (
                <div
                  key={i}
                  onClick={() => {
                    setActiveFlashcard(fc);
                    setFlashcardFlipped(false);
                  }}
                  style={{
                    background: COLORS.bgCard,
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 10,
                    border: `1px solid ${COLORS.border}`,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: `${type.color}20`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                      flexShrink: 0,
                    }}
                  >
                    {type.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {fc.front}
                    </div>
                    <div style={{ fontSize: 12, color: COLORS.textMuted }}>
                      {fc.noteTitle}
                    </div>
                  </div>
                  <span style={{ fontSize: 18, color: COLORS.textMuted }}>›</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  const renderChat = () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 160px)",
      }}
    >
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "0 16px 16px",
        }}
      >
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              marginBottom: 14,
            }}
          >
            {msg.role === "ai" && (
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  marginRight: 8,
                  flexShrink: 0,
                  alignSelf: "flex-end",
                }}
              >
                ✝️
              </div>
            )}
            <div
              style={{
                maxWidth: "80%",
                background:
                  msg.role === "user"
                    ? `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})`
                    : COLORS.bgCard,
                color: COLORS.text,
                borderRadius:
                  msg.role === "user"
                    ? "18px 18px 4px 18px"
                    : "18px 18px 18px 4px",
                padding: "12px 16px",
                fontSize: 14,
                lineHeight: 1.6,
                border: msg.role === "ai" ? `1px solid ${COLORS.border}` : "none",
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isAITyping && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
              }}
            >
              ✝️
            </div>
            <div
              style={{
                background: COLORS.bgCard,
                borderRadius: "18px 18px 18px 4px",
                padding: "12px 16px",
                border: `1px solid ${COLORS.border}`,
                display: "flex",
                gap: 4,
                alignItems: "center",
              }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: COLORS.textMuted,
                    animation: "pulse 1.2s infinite",
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div
        style={{
          padding: "12px 16px",
          borderTop: `1px solid ${COLORS.border}`,
          background: COLORS.bgCard,
          display: "flex",
          gap: 10,
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 6,
            overflowX: "auto",
            flex: 1,
          }}
        >
          {["¿Qué dice la Biblia sobre la fe?", "Explica Juan 3:16", "¿Cómo orar mejor?"].map(
            (suggestion) => (
              <button
                key={suggestion}
                onClick={() => setChatInput(suggestion)}
                style={{
                  background: COLORS.bgCardLight,
                  border: `1px solid ${COLORS.border}`,
                  color: COLORS.textSecondary,
                  borderRadius: 20,
                  padding: "6px 12px",
                  fontSize: 11,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {suggestion}
              </button>
            )
          )}
        </div>
      </div>
      <div
        style={{
          padding: "0 16px 16px",
          background: COLORS.bgCard,
          display: "flex",
          gap: 10,
        }}
      >
        <input
          style={{ ...styles.input, flex: 1 }}
          placeholder="Pregunta sobre la Biblia..."
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
        />
        <button
          onClick={handleSendChat}
          style={{
            background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})`,
            border: "none",
            borderRadius: 12,
            width: 48,
            height: 48,
            fontSize: 20,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          ↑
        </button>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div style={{ padding: "0 16px" }}>
      {/* Profile Header */}
      <div
        style={{
          background: `linear-gradient(135deg, ${COLORS.primary}30, ${COLORS.bgCard})`,
          borderRadius: 20,
          padding: 24,
          textAlign: "center",
          marginBottom: 20,
          border: `1px solid ${COLORS.primary}30`,
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 36,
            margin: "0 auto 12px",
          }}
        >
          ✝️
        </div>
        {/* TODO: Implementar autenticación real de usuario */}
        <div style={{ fontSize: 20, fontWeight: 700 }}>Mi Perfil</div>
        <div style={{ fontSize: 14, color: COLORS.textSecondary, marginTop: 4 }}>
          Discípulo de Cristo
        </div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: `${COLORS.secondary}20`,
            color: COLORS.secondary,
            borderRadius: 20,
            padding: "4px 12px",
            fontSize: 13,
            fontWeight: 600,
            marginTop: 10,
          }}
        >
          ⭐ Plan Gratuito
          {/* TODO: Mostrar plan de suscripción real */}
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          background: COLORS.bgCard,
          borderRadius: 16,
          padding: 16,
          marginBottom: 16,
          border: `1px solid ${COLORS.border}`,
        }}
      >
        <div
          style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}
        >
          📊 Mi progreso espiritual
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          {[
            { label: "Notas creadas", value: notes.length, icon: "📝" },
            {
              label: "Flashcards",
              value: getAllFlashcards().length,
              icon: "🃏",
            },
            {
              label: "Versículos",
              value: notes.reduce((a, n) => a + n.verses.length, 0),
              icon: "📖",
            },
            { label: "Días activo", value: 7, icon: "🔥" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: COLORS.bgCardLight,
                borderRadius: 12,
                padding: 12,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span style={{ fontSize: 24 }}>{stat.icon}</span>
              <div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: COLORS.primary,
                  }}
                >
                  {stat.value}
                </div>
                <div style={{ fontSize: 11, color: COLORS.textSecondary }}>
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subscription */}
      <div
        style={{
          background: `linear-gradient(135deg, ${COLORS.secondary}20, ${COLORS.bgCard})`,
          borderRadius: 16,
          padding: 16,
          marginBottom: 16,
          border: `1px solid ${COLORS.secondary}30`,
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
          ⭐ Actualizar a Premium
        </div>
        <div
          style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: 14 }}
        >
          Desbloquea transcripción ilimitada, resúmenes IA avanzados y todas las
          funciones de flashcards.
        </div>
        {[
          {
            plan: "Plan Semanal",
            price: "$2.99/semana",
            features: ["Grabación ilimitada", "Transcripción IA"],
          },
          {
            plan: "Plan Anual",
            price: "$29.99/año",
            features: [
              "Todo lo anterior",
              "Flashcards IA",
              "Resúmenes personalizados",
            ],
            recommended: true,
          },
        ].map((plan) => (
          <div
            key={plan.plan}
            style={{
              background: plan.recommended
                ? `linear-gradient(135deg, ${COLORS.primary}20, ${COLORS.primaryDark}10)`
                : COLORS.bgCardLight,
              borderRadius: 12,
              padding: 14,
              marginBottom: 8,
              border: `1px solid ${
                plan.recommended ? COLORS.primary : COLORS.border
              }`,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 600 }}>
                {plan.plan}
              </span>
              <span style={{ color: COLORS.primary, fontWeight: 700 }}>
                {plan.price}
              </span>
            </div>
            {plan.features.map((f) => (
              <div
                key={f}
                style={{
                  fontSize: 13,
                  color: COLORS.textSecondary,
                  marginBottom: 2,
                }}
              >
                ✓ {f}
              </div>
            ))}
            {plan.recommended && (
              <button
                onClick={() => showToast("🚧 Suscripciones próximamente disponibles")}
                style={{
                  ...styles.btn("primary"),
                  marginTop: 10,
                  padding: "10px 20px",
                  fontSize: 14,
                }}
              >
                Comenzar prueba gratuita
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Settings Menu */}
      <div
        style={{
          background: COLORS.bgCard,
          borderRadius: 16,
          overflow: "hidden",
          border: `1px solid ${COLORS.border}`,
          marginBottom: 20,
        }}
      >
        {[
          { icon: "🔔", label: "Notificaciones", arrow: true },
          { icon: "🌐", label: "Idioma", value: "Español", arrow: true },
          { icon: "📤", label: "Exportar notas", arrow: true },
          { icon: "🔒", label: "Privacidad", arrow: true },
          // TODO: Implementar funcionalidades de configuración reales
          { icon: "❓", label: "Ayuda y soporte", arrow: true },
          { icon: "⭐", label: "Calificar la app", arrow: true },
        ].map((item, i) => (
          <div
            key={item.label}
            onClick={() => showToast(`🚧 "${item.label}" próximamente disponible`)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 16px",
              borderBottom:
                i < 5 ? `1px solid ${COLORS.border}` : "none",
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: 20, width: 28 }}>{item.icon}</span>
            <span style={{ flex: 1, fontSize: 15 }}>{item.label}</span>
            {item.value && (
              <span style={{ fontSize: 14, color: COLORS.textSecondary }}>
                {item.value}
              </span>
            )}
            {item.arrow && (
              <span style={{ color: COLORS.textMuted, fontSize: 18 }}>›</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // ─── NEW NOTE MODAL ──────────────────────────────────────────────────────────

  const renderNewNoteModal = () => (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        zIndex: 300,
        display: "flex",
        alignItems: "flex-end",
      }}
      onClick={(e) => e.target === e.currentTarget && setShowNewNote(false)}
    >
      <div
        style={{
          background: COLORS.bgCard,
          width: "100%",
          maxWidth: 430,
          margin: "0 auto",
          borderRadius: "24px 24px 0 0",
          padding: "24px 20px 40px",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            width: 40,
            height: 4,
            background: COLORS.textMuted,
            borderRadius: 2,
            margin: "0 auto 20px",
          }}
        />
        <h3
          style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, textAlign: "center" }}
        >
          Nueva nota
        </h3>

        {/* Scene selector */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: 8 }}
          >
            Tipo de reunión
          </div>
          <div
            style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}
          >
            {SCENES.map((scene) => (
              <button
                key={scene.id}
                onClick={() => setSelectedScene(scene.id)}
                style={{
                  background:
                    selectedScene === scene.id
                      ? `${scene.color}30`
                      : COLORS.bgCardLight,
                  border: `1px solid ${
                    selectedScene === scene.id ? scene.color : COLORS.border
                  }`,
                  color:
                    selectedScene === scene.id ? scene.color : COLORS.textSecondary,
                  borderRadius: 12,
                  padding: "8px 14px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {scene.icon} {scene.label}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div style={{ marginBottom: 16 }}>
          <input
            style={{ ...styles.input, fontSize: 18, fontWeight: 600 }}
            placeholder="Título de la nota..."
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
          />
        </div>

        {/* Recording */}
        <div
          style={{
            background: COLORS.bgCardLight,
            borderRadius: 16,
            padding: 20,
            marginBottom: 16,
            textAlign: "center",
            border: `1px solid ${COLORS.border}`,
          }}
        >
          <div
            style={{
              fontSize: isRecording ? 14 : 13,
              color: isRecording ? COLORS.danger : COLORS.textSecondary,
              marginBottom: 12,
              fontWeight: isRecording ? 600 : 400,
            }}
          >
            {isRecording ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: COLORS.danger,
                    display: "inline-block",
                  }}
                />
                Grabando... {formatTime(recordingTime)}
              </span>
            ) : (
              "Toca para grabar el sermón o reunión"
            )}
          </div>
          <button
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: isRecording
                ? `linear-gradient(135deg, ${COLORS.danger}, #FF8A80)`
                : `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})`,
              border: "none",
              fontSize: 28,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
              boxShadow: isRecording
                ? `0 0 20px ${COLORS.danger}60`
                : `0 0 20px ${COLORS.primary}60`,
            }}
          >
            {isRecording ? "⏹" : "🎙️"}
          </button>
          {/* TODO: Mostrar waveform de audio real durante la grabación */}
        </div>

        {/* Note content */}
        <div style={{ marginBottom: 16 }}>
          <textarea
            style={{
              ...styles.input,
              minHeight: 120,
              resize: "vertical",
              lineHeight: 1.6,
            }}
            placeholder="Escribe tus notas aquí... Anota versículos, reflexiones y puntos clave."
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => setShowNewNote(false)}
            style={{ ...styles.btn("secondary"), flex: 1, padding: "14px" }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSaveNote}
            style={{ ...styles.btn("primary"), flex: 2, padding: "14px" }}
          >
            💾 Guardar nota
          </button>
        </div>
      </div>
    </div>
  );

  const NAV_TABS = [
    { id: "home", icon: "🏠", label: "Inicio" },
    { id: "notes", icon: "📝", label: "Notas" },
    { id: "flashcards", icon: "🃏", label: "Flashcards" },
    { id: "chat", icon: "✝️", label: "Chat IA" },
    { id: "profile", icon: "👤", label: "Perfil" },
  ];

  const getHeaderTitle = () => {
    const headers = {
      home: { title: "Bible Note", subtitle: "Tu compañero de fe digital" },
      notes: {
        title: selectedNote ? selectedNote.title : "Mis Notas",
        subtitle: selectedNote ? getSceneInfo(selectedNote.scene).label : `${notes.length} notas guardadas`,
      },
      flashcards: {
        title: "Flashcards",
        subtitle: `${getAllFlashcards().length} tarjetas de estudio`,
      },
      chat: {
        title: "Asistente IA Bíblico",
        subtitle: "Pregunta sobre las Escrituras",
      },
      profile: { title: "Mi Perfil", subtitle: "Configuración y estadísticas" },
    };
    return headers[activeTab] || headers.home;
  };

  const header = getHeaderTitle();

  return (
    <div style={styles.app}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${COLORS.bg}; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 4px; }
        textarea { font-family: inherit; }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={styles.headerTitle}>{header.title}</h1>
            <p style={styles.headerSubtitle}>{header.subtitle}</p>
          </div>
          <button
            onClick={() => setShowNewNote(true)}
            style={{
              background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})`,
              border: "none",
              borderRadius: 14,
              width: 44,
              height: 44,
              fontSize: 22,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            +
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {activeTab === "home" && renderHome()}
        {activeTab === "notes" && renderNotes()}
        {activeTab === "flashcards" && renderFlashcardsScreen()}
        {activeTab === "chat" && renderChat()}
        {activeTab === "profile" && renderProfile()}
      </div>

      {/* Bottom Nav */}
      <nav style={styles.bottomNav}>
        {NAV_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              if (tab.id === "notes") setSelectedNote(null);
              if (tab.id === "flashcards") setActiveFlashcard(null);
            }}
            style={styles.navItem(activeTab === tab.id)}
          >
            <span style={styles.navIcon}>{tab.icon}</span>
            <span style={styles.navLabel(activeTab === tab.id)}>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* New Note Modal */}
      {showNewNote && renderNewNoteModal()}

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 96,
            left: "50%",
            transform: "translateX(-50%)",
            background: COLORS.text,
            color: COLORS.bg,
            padding: "10px 18px",
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 600,
            zIndex: 400,
            boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
            whiteSpace: "nowrap",
            animation: "fadeIn 0.2s ease",
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}