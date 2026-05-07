import React, { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── SUPABASE CONFIG ────────────────────────────────────────────────────────
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const FASHN_KEY_STORAGE = "vestis_fashn_key";

// ─── STARTER WARDROBE (loaded once for new users) ───────────────────────────
const STARTER_WARDROBE = [
  { name: "White Oxford Shirt", category: "Tops", color: "White", style: "Classic", season: "All Seasons", details: "Crisp cotton, button-down collar", pairs_with: "Trousers, jeans, blazers" },
  { name: "Navy Blazer", category: "Outerwear", color: "Navy", style: "Smart Casual", season: "All Seasons", details: "Tailored, two-button", pairs_with: "Chinos, jeans, dress trousers" },
  { name: "Charcoal Trousers", category: "Bottoms", color: "Charcoal", style: "Formal", season: "All Seasons", details: "Wool blend, flat front", pairs_with: "Dress shirts, blazers" },
  { name: "Dark Wash Jeans", category: "Bottoms", color: "Indigo", style: "Casual", season: "All Seasons", details: "Slim straight, raw denim", pairs_with: "T-shirts, oxfords, sweaters" },
  { name: "Black Crew Tee", category: "Tops", color: "Black", style: "Casual", season: "All Seasons", details: "Pima cotton, slim fit", pairs_with: "Jeans, chinos, blazers" },
  { name: "Camel Overcoat", category: "Outerwear", color: "Camel", style: "Refined", season: "Fall/Winter", details: "Wool-cashmere blend, knee-length", pairs_with: "Suits, sweaters, dress trousers" },
  { name: "White Sneakers", category: "Shoes", color: "White", style: "Casual", season: "All Seasons", details: "Minimalist leather", pairs_with: "Jeans, chinos, casual outfits" },
  { name: "Black Oxfords", category: "Shoes", color: "Black", style: "Formal", season: "All Seasons", details: "Cap-toe leather", pairs_with: "Suits, dress trousers" },
  { name: "Olive Field Jacket", category: "Outerwear", color: "Olive", style: "Casual", season: "Spring/Fall", details: "Cotton twill, four pockets", pairs_with: "Tees, oxfords, jeans" },
  { name: "Grey Turtleneck", category: "Tops", color: "Grey", style: "Refined", season: "Fall/Winter", details: "Merino wool", pairs_with: "Trousers, blazers, overcoat" },
  { name: "Navy Chinos", category: "Bottoms", color: "Navy", style: "Smart Casual", season: "All Seasons", details: "Cotton twill, slim taper", pairs_with: "Oxfords, tees, blazers" },
  { name: "Tan Leather Belt", category: "Accessories", color: "Tan", style: "Versatile", season: "All Seasons", details: "Full-grain leather, brass buckle", pairs_with: "Chinos, jeans, casual trousers" },
  { name: "Black Leather Belt", category: "Accessories", color: "Black", style: "Formal", season: "All Seasons", details: "Smooth leather, silver buckle", pairs_with: "Suits, dress trousers" },
  { name: "Striped Linen Shirt", category: "Tops", color: "Blue/White", style: "Smart Casual", season: "Spring/Summer", details: "Pinstripe, breathable linen", pairs_with: "Chinos, shorts, jeans" },
  { name: "Cognac Chelsea Boots", category: "Shoes", color: "Cognac", style: "Smart Casual", season: "Fall/Winter", details: "Suede, elastic side panels", pairs_with: "Jeans, chinos, smart casual" },
  { name: "Black Evening Suit", category: "Suits", color: "Black", style: "Formal/Black Tie", season: "All Seasons", details: "Slim fit, satin lapels", pairs_with: "White dress shirt, black oxfords" },
  { name: "White Dress Shirt", category: "Tops", color: "White", style: "Formal", season: "All Seasons", details: "Spread collar, French cuffs", pairs_with: "Suits, formal trousers" },
  { name: "Khaki Shorts", category: "Bottoms", color: "Khaki", style: "Casual", season: "Spring/Summer", details: "Cotton twill, 9-inch inseam", pairs_with: "Tees, polos, sneakers" }
];

// ─── ICONS (inline SVG) ─────────────────────────────────────────────────────
const Icon = {
  Camera: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  Upload: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  Sparkle: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2z"/></svg>,
  Suitcase: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  Hanger: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4a2 2 0 0 0-2 2c0 1 .5 1.5 1 2L3 17c-.5.5-.5 1.5 0 2s1.5.5 2 0l7-5 7 5c.5.5 1.5.5 2 0s.5-1.5 0-2L13 8c.5-.5 1-1 1-2a2 2 0 0 0-2-2z"/></svg>,
  Mirror: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="9" rx="7" ry="6"/><path d="M12 15v6M9 21h6"/></svg>,
  X: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Trash: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/></svg>,
  LogOut: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
};

const CATEGORY_EMOJI = {
  "Tops": "👔", "Bottoms": "👖", "Outerwear": "🧥", "Shoes": "👞",
  "Accessories": "👜", "Suits": "🤵", "Dresses": "👗", "Other": "✨"
};

// ─── AUTH SCREEN ────────────────────────────────────────────────────────────
function AuthScreen({ onAuthSuccess }) {
  const [mode, setMode] = useState("login"); // login | signup | reset
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user && !data.session) {
          setMessage("Check your email for a verification link to complete signup.");
        } else if (data.session) {
          onAuthSuccess(data.session);
        }
      } else if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuthSuccess(data.session);
      } else if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        setMessage("Password reset link sent. Check your email.");
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-bg-orb orb-1"></div>
      <div className="auth-bg-orb orb-2"></div>
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo">V</div>
          <h1 className="auth-wordmark">VESTIS</h1>
          <p className="auth-tag">Your wardrobe, intelligent.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-label">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="auth-input"
              placeholder="you@example.com"
            />
          </label>

          {mode !== "reset" && (
            <label className="auth-label">
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                className="auth-input"
                placeholder="••••••••"
              />
            </label>
          )}

          {error && <div className="auth-error">{error}</div>}
          {message && <div className="auth-message">{message}</div>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? "..." : mode === "signup" ? "Create account" : mode === "login" ? "Sign in" : "Send reset link"}
          </button>
        </form>

        <div className="auth-switcher">
          {mode === "login" && (
            <>
              <button onClick={() => { setMode("signup"); setError(null); setMessage(null); }} className="auth-link">New to VESTIS? Create an account</button>
              <button onClick={() => { setMode("reset"); setError(null); setMessage(null); }} className="auth-link auth-link-subtle">Forgot password?</button>
            </>
          )}
          {mode === "signup" && (
            <button onClick={() => { setMode("login"); setError(null); setMessage(null); }} className="auth-link">Already have an account? Sign in</button>
          )}
          {mode === "reset" && (
            <button onClick={() => { setMode("login"); setError(null); setMessage(null); }} className="auth-link">Back to sign in</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── CAMERA MODAL ───────────────────────────────────────────────────────────
function CameraModal({ onCapture, onClose, facing = "environment" }) {
  const videoRef = useRef();
  const canvasRef = useRef();
  const streamRef = useRef(null);
  const [hasStream, setHasStream] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [captured, setCaptured] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        if (cancelled) { s.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = s;
        setHasStream(true);
        if (videoRef.current) videoRef.current.srcObject = s;
      } catch {
        setCameraError("Camera access denied. Please allow camera permissions and try again.");
      }
    })();
    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, [facing]);

  const takeShot = () => {
    if (!videoRef.current) return;
    const c = canvasRef.current;
    c.width = videoRef.current.videoWidth;
    c.height = videoRef.current.videoHeight;
    c.getContext("2d").drawImage(videoRef.current, 0, 0);
    setCaptured(c.toDataURL("image/jpeg", 0.92));
  };

  const confirm = () => { onCapture(captured); onClose(); };
  const retake = () => setCaptured(null);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="camera-modal" onClick={(e) => e.stopPropagation()}>
        <div className="camera-header">
          <span>Camera</span>
          <button className="icon-btn" onClick={onClose}><Icon.X /></button>
        </div>
        <div className="camera-stage">
          {cameraError && <div className="camera-error">{cameraError}</div>}
          {!captured && <video ref={videoRef} autoPlay playsInline muted className="camera-video" />}
          {captured && <img src={captured} alt="" className="camera-preview" />}
          <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>
        <div className="camera-controls">
          {!captured ? (
            <button className="shutter-btn" onClick={takeShot} disabled={!hasStream}>
              <span className="shutter-inner"></span>
            </button>
          ) : (
            <>
              <button className="btn-ghost" onClick={retake}>Retake</button>
              <button className="btn-primary" onClick={confirm}>Use photo</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ───────────────────────────────────────────────────────────────
function App() {
  const [session, setSession] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [tab, setTab] = useState("wardrobe");
  const [wardrobe, setWardrobe] = useState([]);
  const [wardrobeLoading, setWardrobeLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Check session on load + listen for changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthChecking(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load wardrobe when session changes
  useEffect(() => {
    if (!session) { setWardrobe([]); return; }
    loadWardrobe();
  }, [session?.user?.id]);

  const loadWardrobe = async () => {
    setWardrobeLoading(true);
    try {
      const { data, error } = await supabase
        .from("wardrobe_items")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      // If wardrobe is empty for this user, seed with starter inventory
      if (data.length === 0) {
        const starterRows = STARTER_WARDROBE.map(item => ({
          ...item,
          user_id: session.user.id,
          is_starter: true
        }));
        const { data: seeded, error: seedErr } = await supabase
          .from("wardrobe_items")
          .insert(starterRows)
          .select();
        if (seedErr) throw seedErr;
        setWardrobe(seeded || []);
      } else {
        setWardrobe(data);
      }
    } catch (err) {
      showNotification("Failed to load wardrobe: " + err.message);
    } finally {
      setWardrobeLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setWardrobe([]);
    setTab("wardrobe");
  };

  const addItem = async (item) => {
    try {
      const { data, error } = await supabase
        .from("wardrobe_items")
        .insert({ ...item, user_id: session.user.id, is_starter: false })
        .select()
        .single();
      if (error) throw error;
      setWardrobe(prev => [data, ...prev]);
      showNotification("Added to wardrobe");
      return data;
    } catch (err) {
      showNotification("Failed to add: " + err.message);
      throw err;
    }
  };

  const removeItem = async (id) => {
    try {
      const { error } = await supabase.from("wardrobe_items").delete().eq("id", id);
      if (error) throw error;
      setWardrobe(prev => prev.filter(i => i.id !== id));
      showNotification("Removed from wardrobe");
    } catch (err) {
      showNotification("Failed to remove: " + err.message);
    }
  };

  if (authChecking) {
    return <div className="loading-screen"><div className="loading-pulse">VESTIS</div></div>;
  }

  if (!session) {
    return <AuthScreen onAuthSuccess={setSession} />;
  }

  return (
    <div className="app-shell">
      {notification && <div className="notification">{notification}</div>}

      <header className="app-header">
        <div className="brand">
          <div className="brand-mark">V</div>
          <h1 className="brand-name">VESTIS</h1>
        </div>
        <div className="header-actions">
          <span className="user-email">{session.user.email}</span>
          <button className="signout-btn" onClick={handleSignOut} title="Sign out">
            <Icon.LogOut />
          </button>
        </div>
      </header>

      <nav className="tab-nav">
        {[
          { id: "wardrobe", label: "Wardrobe", icon: Icon.Hanger },
          { id: "style", label: "Style Me", icon: Icon.Sparkle },
          { id: "tryon", label: "Try On", icon: Icon.Mirror },
          { id: "pack", label: "Pack Smart", icon: Icon.Suitcase },
        ].map(t => (
          <button
            key={t.id}
            className={`tab ${tab === t.id ? "tab-active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            <t.icon /> <span>{t.label}</span>
          </button>
        ))}
      </nav>

      <main className="app-main">
        {tab === "wardrobe" && (
          <WardrobeTab
            wardrobe={wardrobe}
            loading={wardrobeLoading}
            session={session}
            onAdd={addItem}
            onRemove={removeItem}
            showNotification={showNotification}
          />
        )}
        {tab === "style" && <StyleTab wardrobe={wardrobe} showNotification={showNotification} />}
        {tab === "tryon" && <TryOnTab wardrobe={wardrobe} session={session} showNotification={showNotification} />}
        {tab === "pack" && <PackTab wardrobe={wardrobe} showNotification={showNotification} />}
      </main>
    </div>
  );
}

// ─── WARDROBE TAB ───────────────────────────────────────────────────────────
function WardrobeTab({ wardrobe, loading, session, onAdd, onRemove, showNotification }) {
  const [filter, setFilter] = useState("All");
  const [analyzing, setAnalyzing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [detail, setDetail] = useState(null);
  const fileInputRef = useRef();

  const categories = ["All", ...new Set(wardrobe.map(i => i.category))];
  const filtered = filter === "All" ? wardrobe : wardrobe.filter(i => i.category === filter);

  const analyzePhoto = async (dataUrl) => {
    setAnalyzing(true);
    try {
      // Upload to Supabase storage first
      const blob = await (await fetch(dataUrl)).blob();
      const fileName = `${session.user.id}/${Date.now()}.jpg`;
      const { error: uploadErr } = await supabase.storage
        .from("wardrobe-photos")
        .upload(fileName, blob, { contentType: "image/jpeg" });
      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage
        .from("wardrobe-photos")
        .getPublicUrl(fileName);
      const imageUrl = urlData.publicUrl;

      // Analyze with Claude vision
      const base64 = dataUrl.split(",")[1];
      const response = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-5",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: "image/jpeg", data: base64 } },
              { type: "text", text: `Analyze this clothing item. Respond ONLY with valid JSON, no markdown, no preamble:
{
  "name": "concise descriptive name",
  "category": "one of: Tops, Bottoms, Outerwear, Shoes, Accessories, Suits, Dresses, Other",
  "color": "primary color",
  "style": "one of: Casual, Smart Casual, Formal, Refined, Classic, Athletic",
  "season": "one of: Spring/Summer, Fall/Winter, All Seasons",
  "details": "brief description of fabric, fit, notable features",
  "pairs_with": "what this pairs well with"
}` }
            ]
          }]
        })
      });
      const data = await response.json();
      if (!response.ok || !data.content || !data.content[0]) {
        const errMsg = data.error || data.detail?.error?.message || JSON.stringify(data).slice(0, 300);
        throw new Error(errMsg);
      }
      const text = data.content[0].text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(text);

      await onAdd({ ...parsed, image_url: imageUrl });
    } catch (err) {
      showNotification("Analysis failed: " + err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => analyzePhoto(reader.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="tab-content">
      <div className="section-header">
        <div>
          <h2 className="section-title">Your Wardrobe</h2>
          <p className="section-sub">{wardrobe.length} pieces · synced to cloud</p>
        </div>
      </div>

      <div className="upload-row">
        <button className="upload-card" onClick={() => fileInputRef.current?.click()} disabled={analyzing}>
          <Icon.Upload />
          <div>
            <div className="upload-title">{analyzing ? "Analyzing..." : "Upload photo"}</div>
            <div className="upload-sub">From camera roll or website</div>
          </div>
        </button>
        <button className="upload-card upload-camera" onClick={() => setShowCamera(true)} disabled={analyzing}>
          <Icon.Camera />
          <div>
            <div className="upload-title">Take photo</div>
            <div className="upload-sub">Use camera</div>
          </div>
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} hidden />
      </div>

      <div className="filter-row">
        {categories.map(c => (
          <button key={c} className={`filter-chip ${filter === c ? "filter-active" : ""}`} onClick={() => setFilter(c)}>
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="empty-state">Loading wardrobe...</div>
      ) : (
        <div className="wardrobe-grid">
          {filtered.map(item => (
            <button key={item.id} className={`item-card ${item.is_starter ? "item-starter" : ""}`} onClick={() => setDetail(item)}>
              <div className="item-visual">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} />
                ) : (
                  <>
                    <div className="item-emoji">{CATEGORY_EMOJI[item.category] || "✨"}</div>
                    <div className="item-swatch" style={{ background: colorToCSS(item.color) }}></div>
                  </>
                )}
              </div>
              <div className="item-info">
                <div className="item-name">{item.name}</div>
                <div className="item-meta">{item.category} · {item.color}</div>
              </div>
              {item.is_starter && !item.image_url && <div className="starter-badge">Add your photo</div>}
            </button>
          ))}
        </div>
      )}

      {showCamera && <CameraModal onCapture={analyzePhoto} onClose={() => setShowCamera(false)} />}
      {detail && <ItemDetail item={detail} onClose={() => setDetail(null)} onRemove={() => { onRemove(detail.id); setDetail(null); }} />}
    </div>
  );
}

function ItemDetail({ item, onClose, onRemove }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><Icon.X /></button>
        <div className="detail-visual">
          {item.image_url ? <img src={item.image_url} alt={item.name} /> : <div className="detail-emoji">{CATEGORY_EMOJI[item.category] || "✨"}</div>}
        </div>
        <h3 className="detail-name">{item.name}</h3>
        <div className="detail-meta">
          <span>{item.category}</span> · <span>{item.color}</span> · <span>{item.style}</span>
        </div>
        <div className="detail-grid">
          <div><label>Season</label><p>{item.season}</p></div>
          <div><label>Details</label><p>{item.details}</p></div>
          <div><label>Pairs with</label><p>{item.pairs_with}</p></div>
        </div>
        <button className="btn-danger" onClick={onRemove}><Icon.Trash /> Remove from wardrobe</button>
      </div>
    </div>
  );
}

// ─── STYLE TAB ──────────────────────────────────────────────────────────────
function StyleTab({ wardrobe, showNotification }) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [outfit, setOutfit] = useState(null);
  const [selected, setSelected] = useState([]);

  const toggle = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const getOutfit = async () => {
    if (!prompt.trim() && selected.length === 0) return;
    setLoading(true);
    try {
      const wardrobeText = wardrobe.map(i => `- ${i.name} (${i.category}, ${i.color}, ${i.style})`).join("\n");
      const anchorText = selected.length > 0 ? `\n\nMust include these pieces: ${selected.map(id => wardrobe.find(i => i.id === id)?.name).filter(Boolean).join(", ")}` : "";
      const userPrompt = prompt || "an outfit for today";

      const response = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-5",
          max_tokens: 1500,
          messages: [{
            role: "user",
            content: `You are a personal stylist. Build an outfit from this wardrobe for: ${userPrompt}${anchorText}

WARDROBE:
${wardrobeText}

Respond ONLY with valid JSON, no markdown:
{
  "outfit_name": "evocative name for this look",
  "pieces": [{"name": "item from wardrobe", "role": "top/bottom/shoes/etc"}],
  "reasoning": "why these pieces work together",
  "stylist_note": "pro tip on fit, tucking, layering, or accessories"
}`
          }]
        })
      });
      const data = await response.json();
      if (!response.ok || !data.content || !data.content[0]) {
        const errMsg = data.error || data.detail?.error?.message || JSON.stringify(data).slice(0, 300);
        throw new Error(errMsg);
      }
      const text = data.content[0].text.replace(/```json|```/g, "").trim();
      setOutfit(JSON.parse(text));
    } catch (err) {
      showNotification("Styling failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tab-content">
      <div className="section-header">
        <h2 className="section-title">Style Me</h2>
        <p className="section-sub">Your AI stylist, always on call</p>
      </div>

      <div className="style-input">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="What's the occasion? e.g. 'first date at a wine bar' or 'casual but put-together for a museum'"
          rows={3}
          className="style-textarea"
        />
        {selected.length > 0 && (
          <div className="anchor-pills">
            <span className="anchor-label">Anchored to:</span>
            {selected.map(id => {
              const item = wardrobe.find(i => i.id === id);
              return item ? <span key={id} className="anchor-pill">{item.name} <button onClick={() => toggle(id)}>×</button></span> : null;
            })}
          </div>
        )}
        <button className="btn-primary btn-large" onClick={getOutfit} disabled={loading}>
          {loading ? "Styling..." : <><Icon.Sparkle /> Get my outfit</>}
        </button>
      </div>

      {outfit && (
        <div className="outfit-result">
          <div className="outfit-header">
            <h3 className="outfit-title">{outfit.outfit_name}</h3>
          </div>
          <div className="outfit-pieces">
            {outfit.pieces.map((p, i) => (
              <div key={i} className="outfit-piece">
                <span className="piece-role">{p.role}</span>
                <span className="piece-name">{p.name}</span>
              </div>
            ))}
          </div>
          <div className="outfit-reasoning">
            <p>{outfit.reasoning}</p>
          </div>
          <div className="stylist-note">
            <span className="note-label">Stylist's note</span>
            <p>{outfit.stylist_note}</p>
          </div>
        </div>
      )}

      <div className="anchor-section">
        <h3 className="anchor-heading">Or anchor an outfit around specific pieces</h3>
        <div className="anchor-grid">
          {wardrobe.map(item => (
            <button
              key={item.id}
              className={`anchor-card ${selected.includes(item.id) ? "anchor-selected" : ""}`}
              onClick={() => toggle(item.id)}
            >
              <div className="anchor-visual">
                {item.image_url ? <img src={item.image_url} alt={item.name} /> : <div className="anchor-emoji">{CATEGORY_EMOJI[item.category] || "✨"}</div>}
              </div>
              <div className="anchor-name">{item.name}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── TRY ON TAB ─────────────────────────────────────────────────────────────
function TryOnTab({ wardrobe, session, showNotification }) {
  const [fashnKey, setFashnKey] = useState("");
  const [keyEntered, setKeyEntered] = useState(false);
  const [personPhoto, setPersonPhoto] = useState(null);
  const [showPersonCamera, setShowPersonCamera] = useState(false);
  const [selectedGarment, setSelectedGarment] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const personFileRef = useRef();

  // Load saved key
  useEffect(() => {
    try {
      const saved = localStorage.getItem(FASHN_KEY_STORAGE);
      if (saved) {
        setFashnKey(saved);
        setKeyEntered(true);
      }
    } catch {}
  }, []);

  // Load try-on history from cloud
  useEffect(() => {
    if (!session) return;
    supabase.from("tryon_history").select("*").order("created_at", { ascending: false }).limit(20).then(({ data }) => {
      if (data) setHistory(data);
    });
  }, [session?.user?.id]);

  const connectKey = () => {
    if (!fashnKey.trim()) return;
    try { localStorage.setItem(FASHN_KEY_STORAGE, fashnKey.trim()); } catch {}
    setKeyEntered(true);
    showNotification("Fashn.ai connected");
  };

  const clearKey = () => {
    try { localStorage.removeItem(FASHN_KEY_STORAGE); } catch {}
    setFashnKey("");
    setKeyEntered(false);
  };

  const handlePersonFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPersonPhoto(reader.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const garmentsWithPhotos = wardrobe.filter(i => i.image_url);

  const generateTryOn = async () => {
    if (!personPhoto || !selectedGarment) return;
    setGenerating(true);
    try {
      // Submit job to Fashn
      const submitRes = await fetch("https://api.fashn.ai/v1/run", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${fashnKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model_image: personPhoto,
          garment_image: selectedGarment.image_url,
          category: "auto"
        })
      });
      const submitData = await submitRes.json();
      if (!submitData.id) throw new Error(submitData.error || "Failed to submit");

      // Poll for result
      let pollCount = 0;
      const poll = async () => {
        if (pollCount++ > 40) throw new Error("Timed out waiting for result");
        const statusRes = await fetch(`https://api.fashn.ai/v1/status/${submitData.id}`, {
          headers: { "Authorization": `Bearer ${fashnKey}` }
        });
        const status = await statusRes.json();
        if (status.status === "completed" && status.output?.[0]) {
          return status.output[0];
        }
        if (status.status === "failed") throw new Error(status.error || "Generation failed");
        await new Promise(r => setTimeout(r, 1500));
        return poll();
      };
      const resultUrl = await poll();
      setResult(resultUrl);

      // Save to history
      const { data: histRow } = await supabase.from("tryon_history").insert({
        user_id: session.user.id,
        garment_id: selectedGarment.id,
        result_image_url: resultUrl
      }).select().single();
      if (histRow) setHistory(prev => [histRow, ...prev]);

      showNotification("Try-on generated!");
    } catch (err) {
      showNotification("Try-on failed: " + err.message);
    } finally {
      setGenerating(false);
    }
  };

  if (!keyEntered) {
    return (
      <div className="tab-content">
        <div className="section-header">
          <h2 className="section-title">Virtual Try-On</h2>
          <p className="section-sub">See yourself wearing any item from your wardrobe</p>
        </div>
        <div className="key-gate">
          <div className="key-gate-icon">🔑</div>
          <h3>Connect Fashn.ai</h3>
          <p>Enter your Fashn.ai API key to enable photorealistic virtual try-on. Get one at fashn.ai for ~$0.075 per try-on.</p>
          <input
            type="password"
            value={fashnKey}
            onChange={(e) => setFashnKey(e.target.value)}
            placeholder="fa-xxxxxxxxxxxxxxx"
            className="auth-input"
          />
          <button className="btn-primary btn-large" onClick={connectKey}>Connect</button>
          <div className="key-note">🔒 Saved to this device only — never sent anywhere except Fashn's servers.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-content">
      <div className="section-header">
        <div>
          <h2 className="section-title">Virtual Try-On</h2>
          <p className="section-sub">
            <span className="status-dot"></span> Fashn.ai connected
            <button className="change-key-btn" onClick={clearKey}>Change key</button>
          </p>
        </div>
      </div>

      <div className="tryon-flow">
        <div className="tryon-step">
          <div className="step-number">1</div>
          <h3 className="step-title">Your photo</h3>
          {personPhoto ? (
            <div className="person-preview">
              <img src={personPhoto} alt="You" />
              <button className="btn-ghost" onClick={() => setPersonPhoto(null)}>Replace</button>
            </div>
          ) : (
            <div className="upload-row">
              <button className="upload-card" onClick={() => personFileRef.current?.click()}>
                <Icon.Upload /> Upload photo
              </button>
              <button className="upload-card" onClick={() => setShowPersonCamera(true)}>
                <Icon.Camera /> Take photo
              </button>
              <input ref={personFileRef} type="file" accept="image/*" onChange={handlePersonFile} hidden />
            </div>
          )}
        </div>

        <div className="tryon-step">
          <div className="step-number">2</div>
          <h3 className="step-title">Pick a garment</h3>
          {garmentsWithPhotos.length === 0 ? (
            <p className="muted-note">Upload photos of your wardrobe items to try them on. Items without photos can't be used yet.</p>
          ) : (
            <div className="garment-grid">
              {garmentsWithPhotos.map(item => (
                <button
                  key={item.id}
                  className={`garment-card ${selectedGarment?.id === item.id ? "garment-selected" : ""}`}
                  onClick={() => setSelectedGarment(item)}
                >
                  <img src={item.image_url} alt={item.name} />
                  <div className="garment-name">{item.name}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="tryon-step">
          <div className="step-number">3</div>
          <button
            className="btn-primary btn-large btn-full"
            onClick={generateTryOn}
            disabled={!personPhoto || !selectedGarment || generating}
          >
            {generating ? "Generating... (15-30s)" : <><Icon.Sparkle /> Try it on</>}
          </button>
        </div>

        {result && (
          <div className="tryon-result">
            <h3>Result</h3>
            <div className="before-after">
              <div><label>Before</label><img src={personPhoto} alt="Before" /></div>
              <div><label>After</label><img src={result} alt="After" /></div>
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div className="tryon-history">
            <h3>Recent try-ons</h3>
            <div className="history-strip">
              {history.map(h => (
                <img key={h.id} src={h.result_image_url} alt="" className="history-thumb" onClick={() => setResult(h.result_image_url)} />
              ))}
            </div>
          </div>
        )}
      </div>

      {showPersonCamera && <CameraModal facing="user" onCapture={setPersonPhoto} onClose={() => setShowPersonCamera(false)} />}
    </div>
  );
}

// ─── PACK TAB ───────────────────────────────────────────────────────────────
function PackTab({ wardrobe, showNotification }) {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(3);
  const [weather, setWeather] = useState("");
  const [events, setEvents] = useState("");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);

  const generatePlan = async () => {
    if (!destination.trim()) return;
    setLoading(true);
    try {
      const wardrobeText = wardrobe.map(i => `- ${i.name} (${i.category}, ${i.color})`).join("\n");
      const response = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-5",
          max_tokens: 2000,
          messages: [{
            role: "user",
            content: `Build a smart packing plan. Goal: minimize overpacking by finding versatile pieces that work across multiple events.

DESTINATION: ${destination}
LENGTH: ${days} days
WEATHER: ${weather || "moderate"}
EVENTS: ${events || "general travel"}

WARDROBE:
${wardrobeText}

Respond ONLY with valid JSON, no markdown:
{
  "summary": "one-line summary of trip strategy",
  "days": [{"day": 1, "event": "event description", "outfit": ["item names"], "note": "why this works"}],
  "essentials": ["versatile pieces to pack that work for multiple days"],
  "skip_list": ["items you might think to pack but don't need, with reasons"]
}`
          }]
        })
      });
      const data = await response.json();
      if (!response.ok || !data.content || !data.content[0]) {
        const errMsg = data.error || data.detail?.error?.message || JSON.stringify(data).slice(0, 300);
        throw new Error(errMsg);
      }
      const text = data.content[0].text.replace(/```json|```/g, "").trim();
      setPlan(JSON.parse(text));
    } catch (err) {
      showNotification("Packing failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tab-content">
      <div className="section-header">
        <h2 className="section-title">Pack Smart</h2>
        <p className="section-sub">Day-by-day outfits, no overpacking</p>
      </div>

      <div className="pack-form">
        <label className="auth-label">
          Destination
          <input className="auth-input" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Paris, France" />
        </label>
        <div className="pack-row">
          <label className="auth-label">
            Days
            <input className="auth-input" type="number" min={1} max={30} value={days} onChange={(e) => setDays(Number(e.target.value))} />
          </label>
          <label className="auth-label" style={{ flex: 2 }}>
            Weather
            <input className="auth-input" value={weather} onChange={(e) => setWeather(e.target.value)} placeholder="50-60°F, light rain" />
          </label>
        </div>
        <label className="auth-label">
          Events / itinerary
          <textarea
            className="auth-input"
            rows={4}
            value={events}
            onChange={(e) => setEvents(e.target.value)}
            placeholder="Mon: museum walking. Tue: business meetings. Wed: fancy dinner. Thu: travel home."
          />
        </label>
        <button className="btn-primary btn-large" onClick={generatePlan} disabled={loading}>
          {loading ? "Planning..." : <><Icon.Suitcase /> Build my packing plan</>}
        </button>
      </div>

      {plan && (
        <div className="pack-plan">
          <div className="plan-summary">{plan.summary}</div>

          <h3 className="plan-heading">Day by day</h3>
          {plan.days.map((d, i) => (
            <div key={i} className="plan-day">
              <div className="plan-day-num">Day {d.day}</div>
              <div className="plan-day-body">
                <div className="plan-event">{d.event}</div>
                <div className="plan-outfit">{d.outfit.join(" · ")}</div>
                <div className="plan-note">{d.note}</div>
              </div>
            </div>
          ))}

          <h3 className="plan-heading">Pack these essentials</h3>
          <ul className="plan-list">
            {plan.essentials.map((e, i) => <li key={i}>{e}</li>)}
          </ul>

          {plan.skip_list && plan.skip_list.length > 0 && (
            <>
              <h3 className="plan-heading">Skip these (saves you space)</h3>
              <ul className="plan-list plan-skip">
                {plan.skip_list.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── HELPERS ────────────────────────────────────────────────────────────────
function colorToCSS(color) {
  if (!color) return "#d4cfc4";
  const map = {
    "white": "#f5f0e6", "black": "#1a1a1a", "navy": "#1e2a44", "charcoal": "#3a3a3a",
    "indigo": "#2b3a55", "camel": "#c19a6b", "olive": "#6b7a3a", "grey": "#8a8a8a",
    "tan": "#b89968", "cognac": "#834d2c", "khaki": "#b8a778", "blue/white": "#a8b8c8"
  };
  return map[color.toLowerCase()] || "#d4cfc4";
}

// ─── STYLES ─────────────────────────────────────────────────────────────────
const styles = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter+Tight:wght@300;400;500;600;700&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --cream: #f5f0e6;
  --cream-dark: #e8e0d0;
  --ink: #1a1a1a;
  --ink-soft: #3a3a3a;
  --ink-muted: #6b6b6b;
  --accent: #8b6f47;
  --accent-light: #b8956a;
  --gold: #c19a6b;
  --line: rgba(26, 26, 26, 0.08);
  --line-strong: rgba(26, 26, 26, 0.15);
  --success: #5a7a3a;
  --error: #a13b3b;
  --shadow: 0 1px 3px rgba(26, 26, 26, 0.04), 0 4px 20px rgba(26, 26, 26, 0.06);
  --shadow-lg: 0 4px 12px rgba(26, 26, 26, 0.08), 0 20px 60px rgba(26, 26, 26, 0.12);
}

body {
  font-family: 'Inter Tight', -apple-system, sans-serif;
  background: var(--cream);
  color: var(--ink);
  -webkit-font-smoothing: antialiased;
}

.serif { font-family: 'Cormorant Garamond', serif; }

/* ─── LOADING / AUTH ─── */
.loading-screen {
  position: fixed; inset: 0; display: flex; align-items: center; justify-content: center;
  background: var(--cream);
}
.loading-pulse {
  font-family: 'Cormorant Garamond', serif;
  font-size: 3rem; letter-spacing: 0.3em; font-weight: 500;
  animation: pulse 1.5s ease-in-out infinite;
}
@keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }

.auth-wrap {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  padding: 2rem; position: relative; overflow: hidden;
  background: linear-gradient(135deg, #f5f0e6 0%, #e8d8c0 100%);
}
.auth-bg-orb {
  position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.4; pointer-events: none;
}
.orb-1 { width: 500px; height: 500px; background: #c19a6b; top: -100px; right: -100px; }
.orb-2 { width: 400px; height: 400px; background: #8b6f47; bottom: -100px; left: -100px; }

.auth-card {
  background: rgba(255, 252, 246, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 24px;
  padding: 3rem 2.5rem;
  box-shadow: var(--shadow-lg);
  width: 100%; max-width: 440px;
  position: relative; z-index: 1;
}

.auth-brand { text-align: center; margin-bottom: 2.5rem; }
.auth-logo {
  width: 56px; height: 56px; border-radius: 50%;
  background: var(--ink); color: var(--cream);
  display: flex; align-items: center; justify-content: center;
  font-family: 'Cormorant Garamond', serif; font-size: 1.75rem; font-weight: 600;
  margin: 0 auto 1.25rem;
}
.auth-wordmark {
  font-family: 'Cormorant Garamond', serif;
  font-size: 2.5rem; letter-spacing: 0.25em; font-weight: 500;
  margin-bottom: 0.5rem;
}
.auth-tag { color: var(--ink-muted); font-size: 0.875rem; letter-spacing: 0.05em; }

.auth-form { display: flex; flex-direction: column; gap: 1.25rem; }
.auth-label {
  display: flex; flex-direction: column; gap: 0.5rem;
  font-size: 0.75rem; font-weight: 500; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--ink-muted);
}
.auth-input {
  font-family: inherit; font-size: 1rem; color: var(--ink);
  padding: 0.875rem 1rem;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid var(--line-strong);
  border-radius: 10px; transition: all 0.2s;
}
.auth-input:focus { outline: none; border-color: var(--accent); background: white; }

.auth-error {
  padding: 0.75rem 1rem; background: rgba(161, 59, 59, 0.08);
  border: 1px solid rgba(161, 59, 59, 0.2); border-radius: 8px;
  color: var(--error); font-size: 0.875rem;
}
.auth-message {
  padding: 0.75rem 1rem; background: rgba(90, 122, 58, 0.08);
  border: 1px solid rgba(90, 122, 58, 0.2); border-radius: 8px;
  color: var(--success); font-size: 0.875rem;
}

.auth-submit {
  background: var(--ink); color: var(--cream);
  font-family: inherit; font-size: 0.875rem; font-weight: 500;
  letter-spacing: 0.15em; text-transform: uppercase;
  padding: 1rem; border: none; border-radius: 10px;
  cursor: pointer; transition: all 0.2s; margin-top: 0.5rem;
}
.auth-submit:hover:not(:disabled) { background: var(--ink-soft); transform: translateY(-1px); }
.auth-submit:disabled { opacity: 0.5; cursor: not-allowed; }

.auth-switcher {
  display: flex; flex-direction: column; gap: 0.5rem; margin-top: 2rem;
  padding-top: 1.5rem; border-top: 1px solid var(--line); text-align: center;
}
.auth-link {
  background: none; border: none; color: var(--ink-soft);
  font-family: inherit; font-size: 0.875rem; cursor: pointer;
  padding: 0.5rem; transition: color 0.2s;
}
.auth-link:hover { color: var(--ink); }
.auth-link-subtle { font-size: 0.8125rem; color: var(--ink-muted); }

/* ─── APP SHELL ─── */
.app-shell { min-height: 100vh; max-width: 1280px; margin: 0 auto; padding: 0 1.5rem; }

.app-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1.5rem 0; border-bottom: 1px solid var(--line);
}
.brand { display: flex; align-items: center; gap: 0.875rem; }
.brand-mark {
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--ink); color: var(--cream);
  display: flex; align-items: center; justify-content: center;
  font-family: 'Cormorant Garamond', serif; font-size: 1.125rem; font-weight: 600;
}
.brand-name {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.5rem; letter-spacing: 0.25em; font-weight: 500;
}
.header-actions { display: flex; align-items: center; gap: 1rem; }
.user-email { font-size: 0.8125rem; color: var(--ink-muted); }
.signout-btn {
  width: 36px; height: 36px; border-radius: 50%; background: transparent;
  border: 1px solid var(--line-strong); color: var(--ink-soft);
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.signout-btn:hover { background: var(--ink); color: var(--cream); }

.tab-nav {
  display: flex; gap: 0.5rem; padding: 1rem 0;
  border-bottom: 1px solid var(--line); overflow-x: auto;
}
.tab {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.625rem 1rem; background: transparent; border: 1px solid transparent;
  border-radius: 8px; font-family: inherit; font-size: 0.875rem; font-weight: 500;
  color: var(--ink-muted); cursor: pointer; transition: all 0.2s;
  white-space: nowrap;
}
.tab:hover { color: var(--ink); }
.tab-active { background: var(--ink); color: var(--cream); }
.tab-active:hover { color: var(--cream); }

.app-main { padding: 2rem 0 4rem; }
.tab-content { animation: fadeIn 0.3s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }

.section-header { margin-bottom: 2rem; }
.section-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 2.5rem; font-weight: 500; letter-spacing: -0.01em;
}
.section-sub {
  color: var(--ink-muted); font-size: 0.9375rem; margin-top: 0.375rem;
  display: flex; align-items: center; gap: 0.625rem;
}

/* ─── NOTIFICATION ─── */
.notification {
  position: fixed; top: 1.5rem; right: 1.5rem; z-index: 100;
  background: var(--ink); color: var(--cream);
  padding: 0.875rem 1.25rem; border-radius: 10px;
  box-shadow: var(--shadow-lg);
  font-size: 0.875rem; animation: slideIn 0.3s ease;
}
@keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: none; } }

/* ─── UPLOAD ─── */
.upload-row {
  display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;
}
.upload-card {
  display: flex; align-items: center; gap: 1rem; text-align: left;
  padding: 1.25rem 1.5rem; background: white; border: 1.5px dashed var(--line-strong);
  border-radius: 14px; cursor: pointer; transition: all 0.2s;
  font-family: inherit; color: var(--ink);
}
.upload-card:hover:not(:disabled) { border-color: var(--accent); background: var(--cream); }
.upload-card:disabled { opacity: 0.5; cursor: not-allowed; }
.upload-camera { background: linear-gradient(135deg, var(--ink) 0%, var(--ink-soft) 100%); color: var(--cream); border-style: solid; border-color: var(--ink); }
.upload-camera:hover:not(:disabled) { background: var(--ink-soft); border-color: var(--ink-soft); }
.upload-title { font-weight: 600; font-size: 0.9375rem; }
.upload-sub { font-size: 0.8125rem; opacity: 0.7; margin-top: 0.125rem; }

/* ─── FILTERS ─── */
.filter-row { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 2rem; }
.filter-chip {
  padding: 0.5rem 1rem; background: white; border: 1px solid var(--line-strong);
  border-radius: 100px; font-family: inherit; font-size: 0.8125rem; font-weight: 500;
  color: var(--ink-soft); cursor: pointer; transition: all 0.2s;
}
.filter-chip:hover { border-color: var(--ink); }
.filter-active { background: var(--ink); color: var(--cream); border-color: var(--ink); }

/* ─── WARDROBE GRID ─── */
.wardrobe-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1rem;
}
.item-card {
  display: flex; flex-direction: column; background: white;
  border: 1px solid var(--line); border-radius: 14px;
  overflow: hidden; cursor: pointer; transition: all 0.2s;
  font-family: inherit; text-align: left;
  position: relative;
}
.item-card:hover { transform: translateY(-2px); box-shadow: var(--shadow); }
.item-starter { background: linear-gradient(180deg, #faf6ed 0%, #ffffff 100%); }
.item-visual {
  position: relative; aspect-ratio: 1; background: var(--cream-dark);
  display: flex; align-items: center; justify-content: center; overflow: hidden;
}
.item-visual img { width: 100%; height: 100%; object-fit: cover; }
.item-emoji { font-size: 3rem; opacity: 0.8; }
.item-swatch {
  position: absolute; bottom: 0.75rem; right: 0.75rem;
  width: 18px; height: 18px; border-radius: 50%;
  border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.item-info { padding: 0.875rem 1rem; }
.item-name {
  font-weight: 600; font-size: 0.875rem; line-height: 1.3;
  margin-bottom: 0.25rem; overflow: hidden; text-overflow: ellipsis;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
}
.item-meta { font-size: 0.75rem; color: var(--ink-muted); }
.starter-badge {
  position: absolute; top: 0.75rem; right: 0.75rem;
  background: rgba(26, 26, 26, 0.85); color: var(--cream);
  padding: 0.25rem 0.625rem; border-radius: 100px;
  font-size: 0.6875rem; font-weight: 500; letter-spacing: 0.05em;
}

/* ─── MODAL ─── */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(26, 26, 26, 0.6);
  backdrop-filter: blur(8px); z-index: 50;
  display: flex; align-items: center; justify-content: center;
  padding: 1.5rem; animation: fadeIn 0.2s;
}
.detail-modal, .camera-modal {
  background: var(--cream); border-radius: 20px; padding: 2rem;
  max-width: 500px; width: 100%; max-height: 90vh; overflow-y: auto;
  position: relative; box-shadow: var(--shadow-lg);
}
.modal-close {
  position: absolute; top: 1rem; right: 1rem;
  width: 36px; height: 36px; border-radius: 50%;
  background: rgba(26, 26, 26, 0.06); border: none;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  color: var(--ink-soft); transition: all 0.2s;
}
.modal-close:hover { background: var(--ink); color: var(--cream); }

.detail-visual {
  width: 100%; aspect-ratio: 1; background: var(--cream-dark);
  border-radius: 14px; display: flex; align-items: center; justify-content: center;
  margin-bottom: 1.5rem; overflow: hidden;
}
.detail-visual img { width: 100%; height: 100%; object-fit: cover; }
.detail-emoji { font-size: 5rem; opacity: 0.7; }
.detail-name { font-family: 'Cormorant Garamond', serif; font-size: 1.75rem; margin-bottom: 0.5rem; }
.detail-meta { font-size: 0.875rem; color: var(--ink-muted); margin-bottom: 1.5rem; }
.detail-grid { display: grid; gap: 1rem; margin-bottom: 1.5rem; }
.detail-grid label {
  font-size: 0.6875rem; font-weight: 600; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--ink-muted); display: block; margin-bottom: 0.25rem;
}
.detail-grid p { font-size: 0.9375rem; }

/* ─── CAMERA ─── */
.camera-modal { padding: 0; max-width: 600px; overflow: hidden; }
.camera-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1rem 1.25rem; border-bottom: 1px solid var(--line);
}
.camera-stage {
  background: black; aspect-ratio: 4/3; position: relative;
  display: flex; align-items: center; justify-content: center;
}
.camera-video, .camera-preview { width: 100%; height: 100%; object-fit: cover; }
.camera-error { color: white; padding: 2rem; text-align: center; }
.camera-controls {
  display: flex; align-items: center; justify-content: center; gap: 1rem;
  padding: 1.5rem; background: var(--cream);
}
.shutter-btn {
  width: 64px; height: 64px; border-radius: 50%;
  background: white; border: 3px solid var(--ink); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.shutter-btn:hover:not(:disabled) { transform: scale(1.05); }
.shutter-inner {
  width: 48px; height: 48px; border-radius: 50%; background: var(--ink);
}
.icon-btn {
  background: transparent; border: none; cursor: pointer; color: var(--ink-soft);
  width: 36px; height: 36px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; transition: all 0.2s;
}
.icon-btn:hover { background: var(--cream-dark); }

/* ─── BUTTONS ─── */
.btn-primary {
  display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
  background: var(--ink); color: var(--cream);
  padding: 0.75rem 1.5rem; border: none; border-radius: 10px;
  font-family: inherit; font-size: 0.875rem; font-weight: 500;
  letter-spacing: 0.05em; cursor: pointer; transition: all 0.2s;
}
.btn-primary:hover:not(:disabled) { background: var(--ink-soft); transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-large { padding: 1rem 2rem; font-size: 0.9375rem; }
.btn-full { width: 100%; }
.btn-ghost {
  background: transparent; color: var(--ink); border: 1px solid var(--line-strong);
  padding: 0.75rem 1.25rem; border-radius: 10px;
  font-family: inherit; font-size: 0.875rem; cursor: pointer; transition: all 0.2s;
}
.btn-ghost:hover { background: var(--cream-dark); }
.btn-danger {
  display: flex; align-items: center; justify-content: center; gap: 0.5rem;
  width: 100%; background: transparent; color: var(--error);
  border: 1px solid rgba(161, 59, 59, 0.3); padding: 0.75rem 1.5rem;
  border-radius: 10px; font-family: inherit; font-size: 0.875rem;
  cursor: pointer; transition: all 0.2s;
}
.btn-danger:hover { background: rgba(161, 59, 59, 0.08); }

/* ─── STYLE TAB ─── */
.style-input {
  background: white; border: 1px solid var(--line);
  border-radius: 16px; padding: 1.5rem; margin-bottom: 2rem;
  display: flex; flex-direction: column; gap: 1rem;
}
.style-textarea {
  width: 100%; padding: 1rem; border: 1px solid var(--line-strong);
  border-radius: 10px; font-family: inherit; font-size: 1rem;
  background: var(--cream); resize: vertical; color: var(--ink);
}
.style-textarea:focus { outline: none; border-color: var(--accent); background: white; }

.anchor-pills { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; }
.anchor-label { font-size: 0.75rem; color: var(--ink-muted); text-transform: uppercase; letter-spacing: 0.1em; }
.anchor-pill {
  display: inline-flex; align-items: center; gap: 0.375rem;
  background: var(--ink); color: var(--cream);
  padding: 0.375rem 0.625rem 0.375rem 0.875rem; border-radius: 100px;
  font-size: 0.75rem;
}
.anchor-pill button { background: none; border: none; color: var(--cream); cursor: pointer; font-size: 1rem; line-height: 1; padding: 0; }

.outfit-result {
  background: white; border: 1px solid var(--line);
  border-radius: 20px; padding: 2rem; margin-bottom: 2.5rem;
}
.outfit-title { font-family: 'Cormorant Garamond', serif; font-size: 2rem; margin-bottom: 1.5rem; }
.outfit-pieces { display: grid; gap: 0.75rem; margin-bottom: 1.5rem; }
.outfit-piece {
  display: flex; gap: 1rem; padding: 0.875rem 1rem;
  background: var(--cream); border-radius: 10px;
}
.piece-role {
  font-size: 0.6875rem; font-weight: 600; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--ink-muted); min-width: 80px;
}
.piece-name { font-weight: 500; }
.outfit-reasoning {
  padding: 1.25rem; background: var(--cream); border-left: 3px solid var(--accent);
  border-radius: 4px; margin-bottom: 1rem; font-size: 0.9375rem;
  font-style: italic; color: var(--ink-soft);
}
.stylist-note {
  padding: 1.25rem; background: linear-gradient(135deg, var(--ink) 0%, var(--ink-soft) 100%);
  color: var(--cream); border-radius: 12px;
}
.note-label {
  font-size: 0.6875rem; font-weight: 600; letter-spacing: 0.15em;
  text-transform: uppercase; color: var(--gold); display: block; margin-bottom: 0.5rem;
}

.anchor-section { margin-top: 2rem; }
.anchor-heading {
  font-family: 'Cormorant Garamond', serif; font-size: 1.5rem;
  margin-bottom: 1rem;
}
.anchor-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 0.75rem;
}
.anchor-card {
  background: white; border: 2px solid transparent; border-radius: 12px;
  overflow: hidden; cursor: pointer; transition: all 0.2s;
  font-family: inherit; text-align: left;
}
.anchor-card:hover { transform: translateY(-2px); box-shadow: var(--shadow); }
.anchor-selected { border-color: var(--ink); }
.anchor-visual {
  aspect-ratio: 1; background: var(--cream-dark);
  display: flex; align-items: center; justify-content: center; overflow: hidden;
}
.anchor-visual img { width: 100%; height: 100%; object-fit: cover; }
.anchor-emoji { font-size: 2.5rem; opacity: 0.7; }
.anchor-name {
  padding: 0.625rem 0.75rem; font-size: 0.8125rem; font-weight: 500;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

/* ─── TRY ON ─── */
.key-gate {
  background: white; border: 1px solid var(--line);
  border-radius: 20px; padding: 3rem 2rem; text-align: center;
  max-width: 480px; margin: 2rem auto;
}
.key-gate-icon { font-size: 3rem; margin-bottom: 1rem; }
.key-gate h3 { font-family: 'Cormorant Garamond', serif; font-size: 1.75rem; margin-bottom: 0.75rem; }
.key-gate p { color: var(--ink-muted); margin-bottom: 1.5rem; line-height: 1.6; }
.key-gate .auth-input { margin-bottom: 1rem; }
.key-note { font-size: 0.75rem; color: var(--ink-muted); margin-top: 1rem; }

.status-dot {
  display: inline-block; width: 8px; height: 8px; border-radius: 50%;
  background: var(--success); animation: blink 2s infinite;
}
@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
.change-key-btn {
  background: none; border: none; color: var(--ink-muted); cursor: pointer;
  font-family: inherit; font-size: 0.8125rem; text-decoration: underline;
  margin-left: 1rem;
}
.change-key-btn:hover { color: var(--ink); }

.tryon-flow { display: flex; flex-direction: column; gap: 2rem; }
.tryon-step {
  background: white; border: 1px solid var(--line);
  border-radius: 16px; padding: 1.5rem; position: relative;
}
.step-number {
  position: absolute; top: -12px; left: 1.5rem;
  width: 28px; height: 28px; border-radius: 50%;
  background: var(--ink); color: var(--cream);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.8125rem; font-weight: 600;
}
.step-title {
  font-family: 'Cormorant Garamond', serif; font-size: 1.25rem;
  margin-bottom: 1rem; margin-top: 0.5rem;
}
.person-preview {
  display: flex; gap: 1rem; align-items: center;
}
.person-preview img {
  width: 120px; height: 120px; object-fit: cover; border-radius: 12px;
}
.muted-note { color: var(--ink-muted); font-size: 0.875rem; padding: 1rem 0; }

.garment-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 0.75rem;
}
.garment-card {
  background: white; border: 2px solid transparent; border-radius: 10px;
  overflow: hidden; cursor: pointer; padding: 0; font-family: inherit;
  transition: all 0.2s;
}
.garment-card:hover { transform: translateY(-2px); }
.garment-selected { border-color: var(--ink); box-shadow: var(--shadow); }
.garment-card img { width: 100%; aspect-ratio: 1; object-fit: cover; display: block; }
.garment-name {
  padding: 0.5rem; font-size: 0.75rem; font-weight: 500;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

.tryon-result h3, .tryon-history h3 {
  font-family: 'Cormorant Garamond', serif; font-size: 1.5rem; margin-bottom: 1rem;
}
.before-after { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.before-after label {
  font-size: 0.6875rem; font-weight: 600; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--ink-muted); display: block; margin-bottom: 0.5rem;
}
.before-after img { width: 100%; border-radius: 12px; }

.history-strip {
  display: flex; gap: 0.75rem; overflow-x: auto; padding-bottom: 0.5rem;
}
.history-thumb {
  width: 96px; height: 96px; object-fit: cover; border-radius: 10px;
  cursor: pointer; flex-shrink: 0; transition: transform 0.2s;
}
.history-thumb:hover { transform: scale(1.05); }

/* ─── PACK ─── */
.pack-form {
  background: white; border: 1px solid var(--line);
  border-radius: 16px; padding: 1.5rem; margin-bottom: 2rem;
  display: flex; flex-direction: column; gap: 1.25rem;
}
.pack-row { display: flex; gap: 1rem; }
.pack-row > * { flex: 1; }

.pack-plan { display: flex; flex-direction: column; gap: 1.5rem; }
.plan-summary {
  padding: 1.25rem 1.5rem; background: linear-gradient(135deg, var(--ink) 0%, var(--ink-soft) 100%);
  color: var(--cream); border-radius: 12px;
  font-family: 'Cormorant Garamond', serif; font-size: 1.25rem;
  font-style: italic;
}
.plan-heading {
  font-family: 'Cormorant Garamond', serif; font-size: 1.5rem;
  margin-top: 1rem;
}
.plan-day {
  display: flex; gap: 1rem; padding: 1.25rem;
  background: white; border: 1px solid var(--line); border-radius: 12px;
}
.plan-day-num {
  font-family: 'Cormorant Garamond', serif; font-size: 1.5rem;
  color: var(--accent); min-width: 70px; font-weight: 600;
}
.plan-day-body { flex: 1; }
.plan-event { font-weight: 600; margin-bottom: 0.375rem; }
.plan-outfit { font-size: 0.9375rem; color: var(--ink-soft); margin-bottom: 0.375rem; }
.plan-note { font-size: 0.8125rem; color: var(--ink-muted); font-style: italic; }
.plan-list { list-style: none; padding: 0; }
.plan-list li {
  padding: 0.75rem 1rem; background: white;
  border: 1px solid var(--line); border-radius: 8px; margin-bottom: 0.5rem;
  font-size: 0.9375rem;
}
.plan-skip li { color: var(--ink-muted); border-style: dashed; }

.empty-state { text-align: center; padding: 4rem 2rem; color: var(--ink-muted); }

@media (max-width: 640px) {
  .upload-row { grid-template-columns: 1fr; }
  .pack-row { flex-direction: column; }
  .before-after { grid-template-columns: 1fr; }
  .section-title { font-size: 2rem; }
}
`;

export default function VESTIS() {
  return (
    <>
      <style>{styles}</style>
      <App />
    </>
  );
}
