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

const ACTIVITY_OPTIONS = [
  { id: "business", emoji: "💼", label: "Business meetings" },
  { id: "smart_casual", emoji: "👔", label: "Smart casual" },
  { id: "beach", emoji: "🏖️", label: "Beach / pool" },
  { id: "outdoors", emoji: "🥾", label: "Hiking / outdoors" },
  { id: "fine_dining", emoji: "🍷", label: "Fine dining" },
  { id: "sightseeing", emoji: "🏛️", label: "Sightseeing / walking" },
  { id: "fitness", emoji: "💪", label: "Gym / fitness" },
  { id: "black_tie", emoji: "🎩", label: "Black tie / formal" },
  { id: "casual", emoji: "🎨", label: "Casual exploring" },
  { id: "travel", emoji: "✈️", label: "Travel days" },
];

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
          video: {
            facingMode: facing,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            // request widest FOV available to avoid zoomed-in framing
            advanced: [{ zoom: 1.0 }]
          }
        });
        if (cancelled) { s.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = s;
        // Try to set zoom to 1.0 explicitly if supported
        const track = s.getVideoTracks()[0];
        const capabilities = track?.getCapabilities?.();
        if (capabilities?.zoom) {
          try { await track.applyConstraints({ advanced: [{ zoom: capabilities.zoom.min || 1.0 }] }); } catch {}
        }
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
  const [profile, setProfile] = useState(null);
  const [showStyleModal, setShowStyleModal] = useState(false);

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

  // Handle Google OAuth callback (from "Connect Calendar" flow)
  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    if (code && state === "vestis_calendar" && session?.user?.id) {
      (async () => {
        try {
          const redirectUri = `${window.location.origin}/`;
          const tokenResponse = await fetch("/api/google-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, redirect_uri: redirectUri }),
          });
          const tokenData = await tokenResponse.json();
          if (!tokenResponse.ok) {
            throw new Error(tokenData.error || "Token exchange failed");
          }
          const expiresAt = new Date(Date.now() + (tokenData.expires_in || 3600) * 1000).toISOString();
          const { error } = await supabase.from("google_tokens").upsert({
            user_id: session.user.id,
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            expires_at: expiresAt,
            scope: tokenData.scope,
          });
          if (error) throw error;
          showNotification("Google Calendar connected");
        } catch (err) {
          showNotification("Calendar connect failed: " + err.message);
        } finally {
          // Clean up the URL
          window.history.replaceState({}, "", window.location.pathname);
          setTab("pack");
        }
      })();
    }
  }, [session?.user?.id]);

  // Load wardrobe when session changes
  useEffect(() => {
    if (!session) { setWardrobe([]); setProfile(null); return; }
    loadWardrobe();
    loadProfile();
  }, [session?.user?.id]);

  const loadProfile = async () => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();
      setProfile(data);
      // Show modal if style preference not yet set
      if (data && !data.style_preference) {
        setShowStyleModal(true);
      }
    } catch (err) {
      // Non-fatal
      console.error("Profile load error:", err);
    }
  };

  const saveStylePreference = async (pref) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({ style_preference: pref })
        .eq("id", session.user.id)
        .select()
        .single();
      if (error) throw error;
      setProfile(data);
      setShowStyleModal(false);
      showNotification("Preference saved");
    } catch (err) {
      showNotification("Failed to save: " + err.message);
    }
  };

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

  const updateItem = async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from("wardrobe_items")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      setWardrobe(prev => prev.map(i => i.id === id ? data : i));
      showNotification("Item updated");
      return data;
    } catch (err) {
      showNotification("Failed to update: " + err.message);
      return null;
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
          <button
            className="pref-btn"
            onClick={() => setShowStyleModal(true)}
            title="Change style preference"
          >
            {profile?.style_preference === "mens" && "👨 Men's"}
            {profile?.style_preference === "womens" && "👩 Women's"}
            {profile?.style_preference === "both" && "🧑 Both"}
            {!profile?.style_preference && "Set style"}
          </button>
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
            onUpdate={updateItem}
            showNotification={showNotification}
          />
        )}
        {tab === "style" && <StyleTab wardrobe={wardrobe} profile={profile} showNotification={showNotification} />}
        {tab === "tryon" && <TryOnTab wardrobe={wardrobe} session={session} showNotification={showNotification} />}
        {tab === "pack" && <PackTab wardrobe={wardrobe} session={session} profile={profile} showNotification={showNotification} />}
      </main>

      {tab === "wardrobe" && wardrobe.length > 0 && (
        <SelfieLogger
          wardrobe={wardrobe}
          session={session}
          profile={profile}
          onLogged={(updates) => {
            // Apply wear-count + last-worn updates returned from logging
            updates.forEach(u => {
              setWardrobe(prev => prev.map(i => i.id === u.id ? { ...i, ...u.changes } : i));
            });
          }}
          showNotification={showNotification}
        />
      )}

      {showStyleModal && (
        <StylePreferenceModal
          onSave={saveStylePreference}
          onClose={() => setShowStyleModal(false)}
          allowClose={!!profile?.style_preference}
        />
      )}
    </div>
  );
}

// ─── STYLE PREFERENCE MODAL ─────────────────────────────────────────────────
function StylePreferenceModal({ onSave, onClose, allowClose }) {
  const [selected, setSelected] = useState(null);

  const options = [
    { id: "mens", emoji: "👨", label: "Men's clothing", desc: "Suits, shirts, ties, oxfords" },
    { id: "womens", emoji: "👩", label: "Women's clothing", desc: "Dresses, skirts, blouses, heels" },
    { id: "both", emoji: "🧑", label: "Both / Non-binary", desc: "Mix and match across styles" },
  ];

  return (
    <div className="modal-overlay" onClick={allowClose ? onClose : undefined}>
      <div className="detail-modal style-pref-modal" onClick={(e) => e.stopPropagation()}>
        {allowClose && <button className="modal-close" onClick={onClose}><Icon.X /></button>}
        <h3 className="detail-name" style={{ marginTop: 0 }}>Welcome to VESTIS</h3>
        <p style={{ color: "var(--ink-muted)", fontSize: "0.9375rem", marginBottom: "1.5rem" }}>
          To give you better styling recommendations, which clothing categories should I focus on for you?
        </p>
        <div className="style-pref-options">
          {options.map(opt => (
            <button
              key={opt.id}
              className={`style-pref-card ${selected === opt.id ? "style-pref-selected" : ""}`}
              onClick={() => setSelected(opt.id)}
            >
              <span className="style-pref-emoji">{opt.emoji}</span>
              <div>
                <div className="style-pref-label">{opt.label}</div>
                <div className="style-pref-desc">{opt.desc}</div>
              </div>
            </button>
          ))}
        </div>
        <button
          className="btn-primary btn-large btn-full"
          style={{ marginTop: "1.5rem" }}
          onClick={() => selected && onSave(selected)}
          disabled={!selected}
        >
          Continue
        </button>
        <p style={{ fontSize: "0.75rem", color: "var(--ink-muted)", textAlign: "center", marginTop: "0.875rem" }}>
          You can change this anytime from your profile.
        </p>
      </div>
    </div>
  );
}

// ─── SELFIE LOGGER ──────────────────────────────────────────────────────────
function SelfieLogger({ wardrobe, session, profile, onLogged, showNotification }) {
  const [stage, setStage] = useState("idle"); // idle | analyzing | confirm
  const [selfieDataUrl, setSelfieDataUrl] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [confirmedIds, setConfirmedIds] = useState([]);
  const fileRef = useRef();

  const open = () => fileRef.current?.click();

  const close = () => {
    setStage("idle");
    setSelfieDataUrl(null);
    setAnalysis(null);
    setConfirmedIds([]);
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSelfieDataUrl(reader.result);
      analyzeSelfie(reader.result);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const analyzeSelfie = async (dataUrl) => {
    setStage("analyzing");
    try {
      const wardrobeText = wardrobe.map(i =>
        `[id:${i.id}] ${i.name} (${i.category}, ${i.color}, ${i.style}${i.details ? ", " + i.details : ""})`
      ).join("\n");

      const mimeMatch = dataUrl.match(/^data:(image\/[a-z+]+);base64,(.+)$/i);
      const mediaType = mimeMatch ? mimeMatch[1] : "image/jpeg";
      const base64 = mimeMatch ? mimeMatch[2] : dataUrl.split(",")[1];

      const response = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-5",
          max_tokens: 1500,
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
              { type: "text", text: `You're analyzing an outfit photo (mirror selfie, full-body, or flat-lay) to identify which items from the user's wardrobe they're wearing.

USER'S WARDROBE:
${wardrobeText}

For each garment visible in the photo, find the BEST match from the wardrobe (use the item's id). Score your confidence honestly.

Confidence guide:
- 95+ : unmistakable match (same color, same category, same distinguishing details)
- 80-94 : very likely match (color and category match, no contradicting details)
- 60-79 : probable match but some uncertainty (color similar but slightly off, or detail unclear)
- below 60 : not confident — list as unmatched instead

If you see a garment that doesn't match anything in the wardrobe, list it under "unmatched_items" — don't force a match.

Respond ONLY with valid JSON:
{
  "detected_items": [
    {"wardrobe_id": "the id", "wardrobe_name": "name from wardrobe", "confidence": 95, "reason": "brief why"}
  ],
  "unmatched_items": ["description of any visible garment not in wardrobe"],
  "outfit_summary": "one-line description of the look"
}` }
            ]
          }]
        })
      });

      const data = await response.json();
      if (!response.ok || !data.content || !data.content[0]) {
        throw new Error(data.error || data.detail?.error?.message || "Analysis failed");
      }
      const text = data.content[0].text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(text);

      // Filter detected items to actual wardrobe entries (defensive)
      const validIds = new Set(wardrobe.map(i => i.id));
      parsed.detected_items = (parsed.detected_items || []).filter(d => validIds.has(d.wardrobe_id));

      setAnalysis(parsed);

      // Auto-log if all matches are 95+
      const allPerfect = parsed.detected_items.length > 0
        && parsed.detected_items.every(d => d.confidence >= 95)
        && (parsed.unmatched_items?.length || 0) === 0;

      if (allPerfect) {
        await commitLog(parsed.detected_items.map(d => d.wardrobe_id), parsed, dataUrl, true);
      } else {
        // Pre-select items above the auto-confirm threshold
        setConfirmedIds(parsed.detected_items.filter(d => d.confidence >= 80).map(d => d.wardrobe_id));
        setStage("confirm");
      }
    } catch (err) {
      showNotification("Couldn't read selfie: " + err.message);
      close();
    }
  };

  const toggleId = (id) => {
    setConfirmedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const commitLog = async (ids, parsedAnalysis, dataUrl, autoSilent = false) => {
    if (ids.length === 0) {
      showNotification("Nothing logged");
      close();
      return;
    }
    try {
      // Upload selfie if user wants to keep them
      let selfieUrl = null;
      if (profile?.keep_selfies !== false && dataUrl) {
        try {
          const blob = await (await fetch(dataUrl)).blob();
          const path = `${session.user.id}/${Date.now()}.jpg`;
          const { error: upErr } = await supabase.storage
            .from("outfit-selfies")
            .upload(path, blob, { contentType: blob.type || "image/jpeg" });
          if (!upErr) {
            const { data: urlData } = supabase.storage.from("outfit-selfies").getPublicUrl(path);
            selfieUrl = urlData?.publicUrl || null;
          }
        } catch {}
      }

      // Insert log row
      await supabase.from("outfit_logs").insert({
        user_id: session.user.id,
        selfie_url: selfieUrl,
        detected_items: parsedAnalysis.detected_items.filter(d => ids.includes(d.wardrobe_id)),
        unmatched_items: parsedAnalysis.unmatched_items || [],
        worn_date: new Date().toISOString().split("T")[0],
      });

      // Update wear count + last worn for each item
      const today = new Date().toISOString();
      const updates = [];
      for (const id of ids) {
        const item = wardrobe.find(i => i.id === id);
        if (!item) continue;
        const newCount = (item.wear_count || 0) + 1;
        await supabase.from("wardrobe_items").update({
          last_worn_date: today,
          wear_count: newCount,
        }).eq("id", id);
        updates.push({ id, changes: { last_worn_date: today, wear_count: newCount } });
      }

      if (onLogged) onLogged(updates);

      const msg = autoSilent
        ? `Logged ${ids.length} ${ids.length === 1 ? "item" : "items"} ✓`
        : `Logged ${ids.length} ${ids.length === 1 ? "item" : "items"}`;
      showNotification(msg);
      close();
    } catch (err) {
      showNotification("Save failed: " + err.message);
    }
  };

  return (
    <>
      <button className="selfie-fab" onClick={open} title="Log what I'm wearing" disabled={stage === "analyzing"}>
        {stage === "analyzing" ? (
          <div className="fab-spinner" />
        ) : (
          <Icon.Camera />
        )}
        <span className="fab-label">Log fit</span>
      </button>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} hidden />

      {stage === "analyzing" && (
        <div className="modal-overlay">
          <div className="selfie-analyzing-modal">
            <div className="fab-spinner big" />
            <h3 className="detail-name" style={{ marginTop: "1rem" }}>Reading your fit...</h3>
            <p style={{ color: "var(--ink-muted)", fontSize: "0.875rem" }}>Matching to your wardrobe</p>
          </div>
        </div>
      )}

      {stage === "confirm" && analysis && (
        <div className="modal-overlay" onClick={close}>
          <div className="detail-modal selfie-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={close}><Icon.X /></button>
            <h3 className="detail-name" style={{ marginTop: 0 }}>Confirm what you wore</h3>
            {analysis.outfit_summary && (
              <p style={{ color: "var(--ink-soft)", fontStyle: "italic", marginBottom: "1rem" }}>
                "{analysis.outfit_summary}"
              </p>
            )}

            {selfieDataUrl && (
              <img src={selfieDataUrl} alt="Your fit" className="selfie-thumb" />
            )}

            <p style={{ color: "var(--ink-muted)", fontSize: "0.8125rem", marginTop: "1rem" }}>
              Tap to confirm or remove. We'll log only what you confirm.
            </p>

            <div className="confirm-list">
              {analysis.detected_items.map(d => {
                const item = wardrobe.find(i => i.id === d.wardrobe_id);
                if (!item) return null;
                const checked = confirmedIds.includes(d.wardrobe_id);
                return (
                  <button
                    key={d.wardrobe_id}
                    type="button"
                    className={`confirm-row ${checked ? "confirm-checked" : ""}`}
                    onClick={() => toggleId(d.wardrobe_id)}
                  >
                    <div className="confirm-thumb">
                      {item.image_url ? <img src={item.image_url} alt={item.name} /> : <span>{CATEGORY_EMOJI[item.category] || "✨"}</span>}
                    </div>
                    <div className="confirm-info">
                      <div className="confirm-name">{item.name}</div>
                      <div className="confirm-meta">
                        <span className={`confirm-badge confirm-${d.confidence >= 95 ? "high" : d.confidence >= 80 ? "med" : "low"}`}>
                          {d.confidence}% match
                        </span>
                        <span className="confirm-reason">{d.reason}</span>
                      </div>
                    </div>
                    <div className="confirm-check">{checked ? "✓" : ""}</div>
                  </button>
                );
              })}
            </div>

            {analysis.unmatched_items && analysis.unmatched_items.length > 0 && (
              <div className="unmatched-block">
                <div className="unmatched-label">Couldn't match these:</div>
                <ul className="unmatched-list">
                  {analysis.unmatched_items.map((u, i) => <li key={i}>{u}</li>)}
                </ul>
                <p className="unmatched-hint">Tip: photograph these to add them to your wardrobe.</p>
              </div>
            )}

            <div style={{ display: "flex", gap: "0.625rem", marginTop: "1.25rem" }}>
              <button className="btn-ghost" onClick={close} style={{ flex: 1 }}>Cancel</button>
              <button
                className="btn-primary"
                onClick={() => commitLog(confirmedIds, analysis, selfieDataUrl, false)}
                style={{ flex: 1 }}
                disabled={confirmedIds.length === 0}
              >
                Log {confirmedIds.length > 0 ? `${confirmedIds.length} ${confirmedIds.length === 1 ? "item" : "items"}` : "items"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── WARDROBE TAB ───────────────────────────────────────────────────────────
function WardrobeTab({ wardrobe, loading, session, onAdd, onRemove, onUpdate, showNotification }) {
  const [filter, setFilter] = useState("All");
  const [analyzing, setAnalyzing] = useState(false);
  const [detail, setDetail] = useState(null);
  const fileInputRef = useRef();

  const categories = ["All", ...new Set(wardrobe.map(i => i.category))];
  const wearFilters = ["🔥 Recently worn", "💤 Dormant 30+", "💤 Dormant 60+", "💤 Dormant 90+", "✨ Never worn"];

  let filtered;
  if (filter === "All") {
    filtered = wardrobe;
  } else if (filter === "🔥 Recently worn") {
    filtered = wardrobe.filter(i => {
      const d = daysSince(i.last_worn_date);
      return d !== null && d <= 7;
    });
  } else if (filter === "💤 Dormant 30+") {
    filtered = wardrobe.filter(i => {
      const d = daysSince(i.last_worn_date);
      return d !== null && d >= 30;
    });
  } else if (filter === "💤 Dormant 60+") {
    filtered = wardrobe.filter(i => {
      const d = daysSince(i.last_worn_date);
      return d !== null && d >= 60;
    });
  } else if (filter === "💤 Dormant 90+") {
    filtered = wardrobe.filter(i => {
      const d = daysSince(i.last_worn_date);
      return d !== null && d >= 90;
    });
  } else if (filter === "✨ Never worn") {
    filtered = wardrobe.filter(i => !i.last_worn_date);
  } else {
    filtered = wardrobe.filter(i => i.category === filter);
  }

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
      // Extract MIME type and base64 from data URL (handles jpeg, png, webp, etc.)
      const mimeMatch = dataUrl.match(/^data:(image\/[a-z+]+);base64,(.+)$/i);
      const mediaType = mimeMatch ? mimeMatch[1] : "image/jpeg";
      const base64 = mimeMatch ? mimeMatch[2] : dataUrl.split(",")[1];

      const response = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-5",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
              { type: "text", text: `You are an expert clothing analyst. Analyze this garment carefully.

CRITICAL — COLOR ACCURACY:
- Photo lighting often makes colors appear darker/duller than they really are. Look closely for color tints in shadows/highlights.
- If you see ANY blue tint, it's likely Navy or Indigo (NOT black). Black is truly black with no color cast.
- If you see ANY blue/green tint in a "gray" item, it's likely Light Blue, Sky Blue, or Slate (NOT gray).
- Common denim colors: Indigo, Dark Wash, Medium Wash, Light Wash, Black Denim — use these specifically, not just "blue".
- Be specific: "Navy" not "dark blue", "Burgundy" not "dark red", "Charcoal" not "dark gray".

Respond ONLY with valid JSON, no markdown, no preamble:
{
  "name": "concise descriptive name",
  "category": "one of: Tops, Bottoms, Outerwear, Shoes, Accessories, Suits, Dresses, Other",
  "color": "specific primary color (be precise — see color rules above)",
  "color_alternatives": ["2-3 plausible alternative colors in case primary is wrong, e.g. 'Navy', 'Indigo', 'Black'"],
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
          <p className="section-sub">
            {wardrobe.length} pieces · synced to cloud
            {(() => {
              const dormant = wardrobe.filter(i => {
                const d = daysSince(i.last_worn_date);
                return d !== null && d >= 60;
              }).length;
              return dormant > 0 ? <span> · <strong>{dormant} dormant 60+</strong></span> : null;
            })()}
          </p>
        </div>
      </div>

      <div className="upload-row upload-row-single">
        <button className="upload-card upload-card-primary" onClick={() => fileInputRef.current?.click()} disabled={analyzing}>
          <Icon.Camera />
          <div>
            <div className="upload-title">{analyzing ? "Analyzing..." : "Add a photo"}</div>
            <div className="upload-sub">Camera, photo library, or website</div>
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

      <div className="filter-row filter-row-wear">
        {wearFilters.map(c => (
          <button key={c} className={`filter-chip filter-chip-wear ${filter === c ? "filter-active" : ""}`} onClick={() => setFilter(c)}>
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
                <div className="item-meta">
                  {item.category} · {item.color}
                  {item.last_worn_date && daysSince(item.last_worn_date) >= 30 && (
                    <span className={`dormancy-dot ${getDormancyClass(item.last_worn_date)}`} title={`Last worn ${formatLastWorn(item.last_worn_date)}`}></span>
                  )}
                </div>
              </div>
              {item.is_starter && !item.image_url && <div className="starter-badge">Add your photo</div>}
            </button>
          ))}
        </div>
      )}

      {detail && (
        <ItemDetail
          item={detail}
          onClose={() => setDetail(null)}
          onRemove={() => { onRemove(detail.id); setDetail(null); }}
          onUpdate={async (updates) => {
            const updated = await onUpdate(detail.id, updates);
            if (updated) setDetail(updated);
          }}
        />
      )}
    </div>
  );
}

function ItemDetail({ item, onClose, onRemove, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.name || "");
  const [category, setCategory] = useState(item.category || "Other");
  const [color, setColor] = useState(item.color || "");
  const [style, setStyle] = useState(item.style || "Casual");
  const [season, setSeason] = useState(item.season || "All Seasons");
  const [details, setDetails] = useState(item.details || "");
  const [pairsWith, setPairsWith] = useState(item.pairs_with || "");
  const [saving, setSaving] = useState(false);

  // Suggested color alternatives the AI returned (if any)
  const colorAlternatives = item.color_alternatives || [];

  const handleSave = async () => {
    setSaving(true);
    await onUpdate({ name, category, color, style, season, details, pairs_with: pairsWith });
    setSaving(false);
    setEditing(false);
  };

  const handleCancel = () => {
    setName(item.name || "");
    setCategory(item.category || "Other");
    setColor(item.color || "");
    setStyle(item.style || "Casual");
    setSeason(item.season || "All Seasons");
    setDetails(item.details || "");
    setPairsWith(item.pairs_with || "");
    setEditing(false);
  };

  const CATEGORIES = ["Tops", "Bottoms", "Outerwear", "Shoes", "Accessories", "Suits", "Dresses", "Other"];
  const STYLES = ["Casual", "Smart Casual", "Formal", "Refined", "Classic", "Athletic"];
  const SEASONS = ["Spring/Summer", "Fall/Winter", "All Seasons"];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><Icon.X /></button>
        <div className="detail-visual">
          {item.image_url ? <img src={item.image_url} alt={item.name} /> : <div className="detail-emoji">{CATEGORY_EMOJI[item.category] || "✨"}</div>}
        </div>

        {!editing ? (
          <>
            <div className="detail-header-row">
              <h3 className="detail-name">{item.name}</h3>
              <button className="edit-btn" onClick={() => setEditing(true)}>Edit</button>
            </div>
            <div className="detail-meta">
              <span>{item.category}</span> · <span>{item.color}</span> · <span>{item.style}</span>
            </div>

            <div className="wear-block">
              <div className="wear-stats">
                <div className="wear-stat">
                  <span className="wear-stat-label">Last worn</span>
                  <span className={`wear-stat-value ${getDormancyClass(item.last_worn_date)}`}>
                    {formatLastWorn(item.last_worn_date)}
                  </span>
                </div>
                <div className="wear-stat">
                  <span className="wear-stat-label">Times worn</span>
                  <span className="wear-stat-value">{item.wear_count || 0}</span>
                </div>
              </div>
              <button
                className="wore-today-btn"
                onClick={async () => {
                  await onUpdate({
                    last_worn_date: new Date().toISOString(),
                    wear_count: (item.wear_count || 0) + 1,
                  });
                }}
              >
                ✓ I wore this today
              </button>
            </div>

            <div className="detail-grid">
              <div><label>Season</label><p>{item.season}</p></div>
              <div><label>Details</label><p>{item.details}</p></div>
              <div><label>Pairs with</label><p>{item.pairs_with}</p></div>
            </div>
            <button className="btn-danger" onClick={onRemove}><Icon.Trash /> Remove from wardrobe</button>
          </>
        ) : (
          <>
            <h3 className="detail-name" style={{ marginBottom: "1rem" }}>Edit item</h3>
            <div className="edit-form">
              <label className="auth-label">
                Name
                <input className="auth-input" value={name} onChange={(e) => setName(e.target.value)} />
              </label>
              <label className="auth-label">
                Category
                <select className="auth-input" value={category} onChange={(e) => setCategory(e.target.value)}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label className="auth-label">
                Color
                <input className="auth-input" value={color} onChange={(e) => setColor(e.target.value)} placeholder="e.g. Navy, Indigo, Burgundy" />
                {colorAlternatives.length > 0 && (
                  <div className="color-alts">
                    <span className="color-alts-label">AI suggestions:</span>
                    {colorAlternatives.filter(c => c !== color).map(alt => (
                      <button key={alt} type="button" className="color-alt-chip" onClick={() => setColor(alt)}>
                        {alt}
                      </button>
                    ))}
                  </div>
                )}
              </label>
              <label className="auth-label">
                Style
                <select className="auth-input" value={style} onChange={(e) => setStyle(e.target.value)}>
                  {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <label className="auth-label">
                Season
                <select className="auth-input" value={season} onChange={(e) => setSeason(e.target.value)}>
                  {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <label className="auth-label">
                Details
                <textarea className="auth-input" rows={2} value={details} onChange={(e) => setDetails(e.target.value)} />
              </label>
              <label className="auth-label">
                Pairs with
                <textarea className="auth-input" rows={2} value={pairsWith} onChange={(e) => setPairsWith(e.target.value)} />
              </label>
            </div>
            <div style={{ display: "flex", gap: "0.625rem", marginTop: "1rem" }}>
              <button className="btn-ghost" onClick={handleCancel} disabled={saving} style={{ flex: 1 }}>Cancel</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ flex: 1 }}>
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── STYLE TAB ──────────────────────────────────────────────────────────────
function StyleTab({ wardrobe, profile, showNotification }) {
  const [mode, setMode] = useState("ask"); // "ask" or "look"

  // ASK THE STYLIST state
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [outfit, setOutfit] = useState(null);
  const [selected, setSelected] = useState([]);

  // GET THE LOOK state
  const [inspirationPhoto, setInspirationPhoto] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [lookAnalysis, setLookAnalysis] = useState(null);
  const inspirationFileRef = useRef();

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
      const styleNote = profile?.style_preference === "mens"
        ? "\n\nThe person prefers men's clothing categories (suits, shirts, ties, oxfords, etc.)."
        : profile?.style_preference === "womens"
        ? "\n\nThe person prefers women's clothing categories (dresses, skirts, blouses, heels, etc.)."
        : "";

      const response = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-5",
          max_tokens: 1500,
          messages: [{
            role: "user",
            content: `You are a personal stylist. Build an outfit from this wardrobe for: ${userPrompt}${anchorText}${styleNote}

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

  const handleInspirationFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setInspirationPhoto(reader.result);
      setLookAnalysis(null);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const analyzeInspiration = async () => {
    if (!inspirationPhoto) return;
    setAnalyzing(true);
    try {
      const wardrobeText = wardrobe.map(i =>
        `- ${i.name} (${i.category}, color: ${i.color}, style: ${i.style}${i.details ? `, ${i.details}` : ""})`
      ).join("\n");

      const styleNote = profile?.style_preference === "mens"
        ? "The user prefers men's clothing."
        : profile?.style_preference === "womens"
        ? "The user prefers women's clothing."
        : "The user wears a mix of styles.";

      // Extract MIME type and base64 from data URL (handles jpeg, png, webp, etc.)
      const mimeMatch = inspirationPhoto.match(/^data:(image\/[a-z+]+);base64,(.+)$/i);
      const mediaType = mimeMatch ? mimeMatch[1] : "image/jpeg";
      const base64 = mimeMatch ? mimeMatch[2] : inspirationPhoto.split(",")[1];

      const response = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-5",
          max_tokens: 2500,
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
              { type: "text", text: `You're a personal stylist analyzing an inspiration photo to help recreate the outfit from the user's existing wardrobe.

${styleNote}

THE USER'S WARDROBE (${wardrobe.length} items):
${wardrobeText}

Analyze the outfit in the photo, then match it to the user's wardrobe. For each garment in the inspiration, either find a wardrobe match OR identify it as a shopping gap.

Respond ONLY with valid JSON, no markdown:
{
  "look_name": "evocative name for this aesthetic (e.g. 'Coastal Italian summer', 'Minimalist downtown')",
  "vibe_description": "2-3 sentence description of the overall vibe and what makes it work",
  "outfit_breakdown": [
    {
      "garment_in_photo": "what you see in the photo (e.g. 'cream cable-knit sweater')",
      "role": "top/bottom/outerwear/shoes/accessory",
      "wardrobe_match": "exact name from user's wardrobe OR null if no match",
      "match_quality": "perfect/close/loose/none",
      "match_reason": "brief reason — if 'close' or 'loose', explain what's similar and what's different",
      "shopping_suggestion": "if no match, what they'd need to buy to recreate this — be specific (e.g. 'cream cable-knit crewneck sweater, oversized fit')"
    }
  ],
  "recreation_outfit": ["names of wardrobe items that recreate this look as closely as possible"],
  "shopping_gaps": ["specific items they'd need to buy to fully recreate the look"],
  "styling_notes": "how to wear/style these pieces for the best vibe match — tucking, layering, accessories"
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
      setLookAnalysis(JSON.parse(text));
    } catch (err) {
      showNotification("Analysis failed: " + err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const resetLook = () => {
    setInspirationPhoto(null);
    setLookAnalysis(null);
  };

  return (
    <div className="tab-content">
      <div className="section-header">
        <h2 className="section-title">Style Me</h2>
        <p className="section-sub">Your AI stylist, always on call</p>
      </div>

      <div className="style-mode-tabs">
        <button
          className={`style-mode-btn ${mode === "ask" ? "style-mode-active" : ""}`}
          onClick={() => setMode("ask")}
        >
          💬 Ask the Stylist
        </button>
        <button
          className={`style-mode-btn ${mode === "look" ? "style-mode-active" : ""}`}
          onClick={() => setMode("look")}
        >
          📸 Get the Look
        </button>
      </div>

      {mode === "ask" && (
        <>
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
        </>
      )}

      {mode === "look" && (
        <>
          <div className="look-input">
            {!inspirationPhoto ? (
              <>
                <div className="look-prompt">
                  <h3 className="look-title">Upload an inspiration photo</h3>
                  <p className="look-sub">
                    Saw an outfit you love on Pinterest, Instagram, or anywhere else? Upload it here and I'll match it to your wardrobe — and tell you what you're missing.
                  </p>
                </div>
                <button
                  className="upload-card upload-card-primary"
                  onClick={() => inspirationFileRef.current?.click()}
                >
                  <Icon.Camera />
                  <div>
                    <div className="upload-title">Add inspiration photo</div>
                    <div className="upload-sub">Camera, photo library, or screenshot</div>
                  </div>
                </button>
                <input
                  ref={inspirationFileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleInspirationFile}
                  hidden
                />
              </>
            ) : (
              <>
                <div className="inspiration-preview">
                  <img src={inspirationPhoto} alt="Inspiration" />
                  <button className="btn-ghost" onClick={resetLook}>Use a different photo</button>
                </div>
                {!lookAnalysis && (
                  <button
                    className="btn-primary btn-large btn-full"
                    onClick={analyzeInspiration}
                    disabled={analyzing}
                  >
                    {analyzing ? "Analyzing the look... (15-30s)" : <><Icon.Sparkle /> Get the Look</>}
                  </button>
                )}
              </>
            )}
          </div>

          {lookAnalysis && (
            <div className="look-result">
              <div className="look-header">
                <h3 className="outfit-title">{lookAnalysis.look_name}</h3>
                <p className="look-vibe">{lookAnalysis.vibe_description}</p>
              </div>

              <h4 className="look-section-heading">The breakdown</h4>
              <div className="look-breakdown">
                {lookAnalysis.outfit_breakdown.map((item, i) => (
                  <div key={i} className={`breakdown-row breakdown-${item.match_quality}`}>
                    <div className="breakdown-role">{item.role}</div>
                    <div className="breakdown-content">
                      <div className="breakdown-photo">
                        <span className="breakdown-label">In the photo:</span> {item.garment_in_photo}
                      </div>
                      {item.wardrobe_match ? (
                        <div className="breakdown-match">
                          <span className={`match-badge match-${item.match_quality}`}>
                            {item.match_quality === "perfect" && "✓ Perfect match"}
                            {item.match_quality === "close" && "≈ Close match"}
                            {item.match_quality === "loose" && "~ Loose match"}
                          </span>
                          <span className="match-name">{item.wardrobe_match}</span>
                          {item.match_reason && <p className="match-reason">{item.match_reason}</p>}
                        </div>
                      ) : (
                        <div className="breakdown-shop">
                          <span className="shop-badge">🛍️ Shopping gap</span>
                          <p className="shop-suggestion">{item.shopping_suggestion}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {lookAnalysis.recreation_outfit && lookAnalysis.recreation_outfit.length > 0 && (
                <>
                  <h4 className="look-section-heading">Recreate from your wardrobe</h4>
                  <div className="recreation-pieces">
                    {lookAnalysis.recreation_outfit.map((name, i) => (
                      <div key={i} className="outfit-piece">
                        <span className="piece-name">{name}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {lookAnalysis.shopping_gaps && lookAnalysis.shopping_gaps.length > 0 && (
                <>
                  <h4 className="look-section-heading">🛍️ To complete this look</h4>
                  <ul className="shopping-list">
                    {lookAnalysis.shopping_gaps.map((gap, i) => (
                      <li key={i}>{gap}</li>
                    ))}
                  </ul>
                </>
              )}

              {lookAnalysis.styling_notes && (
                <div className="stylist-note">
                  <span className="note-label">Styling notes</span>
                  <p>{lookAnalysis.styling_notes}</p>
                </div>
              )}

              <button className="btn-ghost btn-full" onClick={resetLook} style={{ marginTop: "1.5rem" }}>
                Try another look
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── TRY ON TAB ─────────────────────────────────────────────────────────────
function TryOnTab({ wardrobe, session, showNotification }) {
  const [fashnKey, setFashnKey] = useState("");
  const [keyEntered, setKeyEntered] = useState(false);
  const [personPhoto, setPersonPhoto] = useState(null);
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
            <div className="upload-row upload-row-single">
              <button className="upload-card upload-card-primary" onClick={() => personFileRef.current?.click()}>
                <Icon.Camera />
                <div>
                  <div className="upload-title">Add a photo of yourself</div>
                  <div className="upload-sub">Camera or photo library</div>
                </div>
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
    </div>
  );
}

// ─── PACK TAB (Trip Wizard) ─────────────────────────────────────────────────
const TRANSPORTATION_OPTIONS = [
  { id: "flying", emoji: "✈️", label: "Flying" },
  { id: "driving", emoji: "🚗", label: "Driving" },
  { id: "train", emoji: "🚆", label: "Train" },
  { id: "cruise", emoji: "🚢", label: "Cruise" },
  { id: "other", emoji: "🤷", label: "Other" },
];

const BAG_OPTIONS = [
  { id: "personal", emoji: "🎒", label: "Personal item only", desc: "Fits under seat" },
  { id: "carryon", emoji: "🧳", label: "Carry-on", desc: "Overhead bin, no checked" },
  { id: "carryon_checked", emoji: "🧳➕", label: "Carry-on + checked", desc: "More room to pack" },
  { id: "multiple_checked", emoji: "🧳🧳", label: "Multiple checked bags", desc: "No constraints" },
];

const SPECIAL_EVENT_OPTIONS = [
  { id: "in_da_club", emoji: "🪩", label: "In Da Club", desc: "Bar / nightlife — look snappy" },
  { id: "date_night", emoji: "💕", label: "Date night", desc: "Romantic dinner, want to impress" },
  { id: "fancy_dinner", emoji: "🥂", label: "Fancy dinner", desc: "Upscale restaurant or special occasion" },
  { id: "black_tie", emoji: "🎩", label: "Black tie event", desc: "Formal gala, wedding, ceremony" },
  { id: "presentation", emoji: "💼", label: "Big presentation", desc: "Interview, pitch, important meeting" },
  { id: "photo_op", emoji: "📸", label: "Photo opportunity", desc: "Family photos, milestone moment" },
];

function PackTab({ wardrobe, session, profile, showNotification }) {
  // Trip list & current trip
  const [trips, setTrips] = useState([]);
  const [view, setView] = useState("list"); // list | wizard | plan
  const [currentTrip, setCurrentTrip] = useState(null);

  // Calendar connection
  const [calendarConnected, setCalendarConnected] = useState(false);

  // Load trips & calendar status
  useEffect(() => {
    if (!session?.user?.id) return;
    loadTrips();
    checkCalendar();
  }, [session?.user?.id]);

  const loadTrips = async () => {
    const { data } = await supabase
      .from("trips")
      .select("*")
      .order("start_date", { ascending: false });
    if (data) setTrips(data);
  };

  const checkCalendar = async () => {
    const { data } = await supabase
      .from("google_tokens")
      .select("user_id")
      .eq("user_id", session.user.id)
      .maybeSingle();
    setCalendarConnected(!!data);
  };

  const newTrip = () => {
    setCurrentTrip({
      destination: "",
      start_date: "",
      end_date: "",
      transportation: null,
      bag_setup: null,
      days: [],
      special_events: [],
      manual_notes: "",
    });
    setView("wizard");
  };

  const editTrip = (trip) => {
    setCurrentTrip(trip);
    setView("wizard");
  };

  const viewPlan = (trip) => {
    setCurrentTrip(trip);
    setView("plan");
  };

  const deleteTrip = async (id) => {
    if (!confirm("Delete this trip?")) return;
    await supabase.from("trips").delete().eq("id", id);
    setTrips(prev => prev.filter(t => t.id !== id));
    showNotification("Trip deleted");
  };

  const saveTrip = async (trip) => {
    if (trip.id) {
      const { data } = await supabase
        .from("trips")
        .update(trip)
        .eq("id", trip.id)
        .select()
        .single();
      if (data) {
        setTrips(prev => prev.map(t => t.id === data.id ? data : t));
        return data;
      }
    } else {
      const { data } = await supabase
        .from("trips")
        .insert({ ...trip, user_id: session.user.id })
        .select()
        .single();
      if (data) {
        setTrips(prev => [data, ...prev]);
        return data;
      }
    }
    return trip;
  };

  if (view === "wizard") {
    return (
      <TripWizard
        trip={currentTrip}
        wardrobe={wardrobe}
        profile={profile}
        session={session}
        calendarConnected={calendarConnected}
        onSave={saveTrip}
        onDone={(savedTrip) => { setCurrentTrip(savedTrip); setView("plan"); }}
        onCancel={() => setView("list")}
        showNotification={showNotification}
      />
    );
  }

  if (view === "plan" && currentTrip) {
    return (
      <TripPlanView
        trip={currentTrip}
        onEdit={() => setView("wizard")}
        onBack={() => setView("list")}
      />
    );
  }

  // Trip list view
  return (
    <div className="tab-content">
      <div className="section-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h2 className="section-title">Pack Smart</h2>
            <p className="section-sub">Build a trip, get a packing plan</p>
          </div>
          <button className="btn-primary btn-large" onClick={newTrip}>
            <Icon.Suitcase /> New trip
          </button>
        </div>
      </div>

      {trips.length === 0 ? (
        <div className="empty-state">
          <p style={{ marginBottom: "1rem" }}>No trips yet.</p>
          <button className="btn-primary" onClick={newTrip}>Plan your first trip</button>
        </div>
      ) : (
        <div className="trip-list">
          {trips.map(trip => (
            <div key={trip.id} className="trip-card">
              <div className="trip-card-main" onClick={() => trip.generated_plan ? viewPlan(trip) : editTrip(trip)}>
                <div className="trip-card-dest">{trip.destination}</div>
                <div className="trip-card-dates">
                  {formatDate(trip.start_date)} – {formatDate(trip.end_date)}
                </div>
                <div className="trip-card-meta">
                  {trip.transportation && <span>{TRANSPORTATION_OPTIONS.find(t => t.id === trip.transportation)?.emoji}</span>}
                  {trip.bag_setup && <span>{BAG_OPTIONS.find(b => b.id === trip.bag_setup)?.emoji}</span>}
                  {trip.generated_plan ? <span className="trip-card-badge">✓ Planned</span> : <span className="trip-card-badge trip-draft">Draft</span>}
                </div>
              </div>
              <button className="trip-card-delete" onClick={() => deleteTrip(trip.id)} title="Delete">
                <Icon.Trash />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── TRIP WIZARD ────────────────────────────────────────────────────────────
function TripWizard({ trip, wardrobe, profile, session, calendarConnected, onSave, onDone, onCancel, showNotification }) {
  const [step, setStep] = useState(1);
  const [destination, setDestination] = useState(trip.destination || "");
  const [startDate, setStartDate] = useState(trip.start_date || "");
  const [endDate, setEndDate] = useState(trip.end_date || "");
  const [transportation, setTransportation] = useState(trip.transportation || null);
  const [bagSetup, setBagSetup] = useState(trip.bag_setup || null);
  const [days, setDays] = useState(trip.days || []);
  const [specialEvents, setSpecialEvents] = useState(trip.special_events || []);
  const [manualNotes, setManualNotes] = useState(trip.manual_notes || "");
  const [generating, setGenerating] = useState(false);

  const totalSteps = 5;
  const isFlying = transportation === "flying";

  // Initialize days array when dates set
  useEffect(() => {
    if (startDate && endDate && days.length === 0) {
      const start = new Date(startDate + "T00:00:00");
      const end = new Date(endDate + "T00:00:00");
      const numDays = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
      if (numDays > 0 && numDays <= 30) {
        const dayObjs = [];
        for (let i = 0; i < numDays; i++) {
          const d = new Date(start);
          d.setDate(start.getDate() + i);
          dayObjs.push({
            date: d.toISOString().split("T")[0],
            mode: "all_day",
            activities: [],
            morning: [],
            afternoon: [],
            evening: [],
          });
        }
        setDays(dayObjs);
      }
    }
  }, [startDate, endDate]);

  const updateDay = (idx, updater) => {
    setDays(prev => prev.map((d, i) => i === idx ? { ...d, ...updater } : d));
  };

  const toggleDayActivity = (idx, slot, activityId) => {
    setDays(prev => prev.map((d, i) => {
      if (i !== idx) return d;
      const list = d[slot] || [];
      return {
        ...d,
        [slot]: list.includes(activityId) ? list.filter(a => a !== activityId) : [...list, activityId]
      };
    }));
  };

  const toggleSpecialEvent = (eventId) => {
    setSpecialEvents(prev => {
      const existing = prev.find(e => e.id === eventId);
      if (existing) {
        return prev.filter(e => e.id !== eventId);
      }
      return [...prev, { id: eventId, day: null }];
    });
  };

  const setSpecialEventDay = (eventId, day) => {
    setSpecialEvents(prev => prev.map(e => e.id === eventId ? { ...e, day } : e));
  };

  const canAdvance = () => {
    if (step === 1) return destination.trim() && startDate && endDate && new Date(endDate) >= new Date(startDate);
    if (step === 2) return !!transportation && (!isFlying || !!bagSetup);
    if (step === 3) return days.length > 0;
    return true;
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      // Save trip first
      let saved = await onSave({
        ...trip,
        destination,
        start_date: startDate,
        end_date: endDate,
        transportation,
        bag_setup: bagSetup,
        days,
        special_events: specialEvents,
        manual_notes: manualNotes,
      });

      // Fetch weather
      let weatherData = null;
      try {
        const weatherRes = await fetch("/api/weather", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ city: destination }),
        });
        const wj = await weatherRes.json();
        if (weatherRes.ok) {
          const tripDays = wj.days.filter(d => d.date >= startDate && d.date <= endDate);
          weatherData = { ...wj, days: tripDays.length > 0 ? tripDays : wj.days.slice(0, 5) };
        }
      } catch {}

      // Fetch calendar events if connected
      let calendarEvents = [];
      if (calendarConnected) {
        try {
          const { data: tokenRow } = await supabase
            .from("google_tokens")
            .select("*")
            .eq("user_id", session.user.id)
            .single();
          if (tokenRow) {
            const calRes = await fetch("/api/calendar", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                access_token: tokenRow.access_token,
                refresh_token: tokenRow.refresh_token,
                time_min: new Date(startDate + "T00:00:00").toISOString(),
                time_max: new Date(endDate + "T23:59:59").toISOString(),
              }),
            });
            const cj = await calRes.json();
            if (calRes.ok) calendarEvents = cj.events || [];
            if (cj.new_access_token) {
              await supabase.from("google_tokens").update({
                access_token: cj.new_access_token,
                expires_at: new Date(Date.now() + (cj.expires_in || 3600) * 1000).toISOString(),
              }).eq("user_id", session.user.id);
            }
          }
        } catch {}
      }

      // Build the AI prompt
      const wardrobeText = wardrobe.map(i => `- ${i.name} (${i.category}, ${i.color}, ${i.style})`).join("\n");
      const transport = TRANSPORTATION_OPTIONS.find(t => t.id === transportation)?.label || "";
      const bag = BAG_OPTIONS.find(b => b.id === bagSetup);
      const bagNote = bag ? `BAG: ${bag.label} (${bag.desc})` : "";
      const styleNote = profile?.style_preference === "mens"
        ? "STYLE PREFERENCE: Men's clothing categories"
        : profile?.style_preference === "womens"
        ? "STYLE PREFERENCE: Women's clothing categories"
        : "STYLE PREFERENCE: Mix of styles";

      const weatherSummary = weatherData
        ? `LOCATION: ${weatherData.location}\nFORECAST:\n${weatherData.days.map(d => `  ${d.date}: ${d.temp_low}-${d.temp_high}°F, ${d.conditions}${d.rain_mm > 0 ? `, ${d.rain_mm}mm rain` : ""}`).join("\n")}`
        : `LOCATION: ${destination}\nWEATHER: not available`;

      const daysText = days.map((d, i) => {
        const dayNum = i + 1;
        const calForDay = calendarEvents.filter(ev => {
          const start = (ev.start?.dateTime || ev.start?.date || "").slice(0, 10);
          return start === d.date;
        }).map(ev => ev.summary).filter(Boolean);

        if (d.mode === "split") {
          const m = d.morning?.map(a => ACTIVITY_OPTIONS.find(o => o.id === a)?.label).filter(Boolean).join(", ") || "(none)";
          const a = d.afternoon?.map(a => ACTIVITY_OPTIONS.find(o => o.id === a)?.label).filter(Boolean).join(", ") || "(none)";
          const e = d.evening?.map(a => ACTIVITY_OPTIONS.find(o => o.id === a)?.label).filter(Boolean).join(", ") || "(none)";
          return `Day ${dayNum} (${d.date}):\n  Morning: ${m}\n  Afternoon: ${a}\n  Evening: ${e}${calForDay.length ? `\n  Calendar: ${calForDay.join("; ")}` : ""}`;
        }
        const acts = d.activities?.map(a => ACTIVITY_OPTIONS.find(o => o.id === a)?.label).filter(Boolean).join(", ") || "(unspecified)";
        return `Day ${dayNum} (${d.date}): ${acts}${calForDay.length ? ` | Calendar: ${calForDay.join("; ")}` : ""}`;
      }).join("\n");

      const specialEventsText = specialEvents.length > 0
        ? specialEvents.map(e => {
            const opt = SPECIAL_EVENT_OPTIONS.find(o => o.id === e.id);
            const dayNote = e.day ? ` (Day ${e.day})` : "";
            return `  ★ ${opt?.label}${dayNote}: ${opt?.desc}`;
          }).join("\n")
        : "  None";

      const response = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-5",
          max_tokens: 3000,
          messages: [{
            role: "user",
            content: `Build a smart packing plan for this trip.

DESTINATION: ${destination}
DATES: ${startDate} to ${endDate} (${days.length} days)
TRANSPORTATION: ${transport}
${bagNote}
${styleNote}

${weatherSummary}

DAILY ACTIVITIES:
${daysText}

SPECIAL EVENTS (give these days extra attention with sharper outfits):
${specialEventsText}

${manualNotes ? `ADDITIONAL NOTES: ${manualNotes}` : ""}

WARDROBE (${wardrobe.length} items):
${wardrobeText}

Build a day-by-day plan that:
- Honors weather (cold = layers, rain = waterproof, etc.)
- Matches outfits precisely to scheduled activities
- For SPECIAL EVENTS, deliver the most considered, sharpest outfit possible — these are moments the user wants to feel great
- Reuses versatile pieces across days when possible
- Respects bag constraints: carry-on requires ruthless minimalism; checked bags allow flexibility
- Identifies what NOT to pack (saves space)

Respond ONLY with valid JSON, no markdown:
{
  "summary": "one-line trip strategy mentioning weather, transport, and key moments",
  "days": [{"day": 1, "date": "YYYY-MM-DD", "weather": "brief", "activities": "what's happening", "outfit": ["item names"], "note": "why this works", "is_special": false}],
  "essentials": ["versatile pieces to pack"],
  "skip_list": ["items not to pack with reasons"],
  "special_callouts": ["highlight any special-event outfits and why they shine"]
}`
          }]
        })
      });

      const data = await response.json();
      if (!response.ok || !data.content || !data.content[0]) {
        throw new Error(data.error || data.detail?.error?.message || "AI generation failed");
      }
      const text = data.content[0].text.replace(/```json|```/g, "").trim();
      const plan = JSON.parse(text);

      // Save updated trip with weather, calendar, plan
      const finalTrip = await onSave({
        ...saved,
        weather_data: weatherData,
        calendar_events: calendarEvents,
        generated_plan: plan,
      });

      onDone(finalTrip);
    } catch (err) {
      showNotification("Plan failed: " + err.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="tab-content">
      <div className="wizard-header">
        <button className="btn-ghost" onClick={onCancel}>← Cancel</button>
        <div className="wizard-progress">
          {[1,2,3,4,5].map(n => (
            <div key={n} className={`wizard-dot ${step >= n ? "wizard-dot-active" : ""} ${step === n ? "wizard-dot-current" : ""}`}>{n}</div>
          ))}
        </div>
      </div>

      {step === 1 && (
        <div className="wizard-step">
          <h2 className="wizard-title">Where & when?</h2>
          <p className="wizard-sub">Let's start with the basics.</p>
          <label className="auth-label">
            Destination
            <input className="auth-input" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Paris, France" autoFocus />
          </label>
          <div className="pack-row">
            <label className="auth-label">
              Start date
              <input className="auth-input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </label>
            <label className="auth-label">
              End date
              <input className="auth-input" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </label>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="wizard-step">
          <h2 className="wizard-title">How are you getting there?</h2>
          <p className="wizard-sub">This affects packing strategy.</p>
          <div className="transport-grid">
            {TRANSPORTATION_OPTIONS.map(t => (
              <button key={t.id} type="button"
                className={`transport-card ${transportation === t.id ? "transport-selected" : ""}`}
                onClick={() => setTransportation(t.id)}>
                <span className="transport-emoji">{t.emoji}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {isFlying && (
            <div style={{ marginTop: "1.5rem" }}>
              <h3 className="wizard-subtitle">What bag are you bringing?</h3>
              <div className="bag-grid">
                {BAG_OPTIONS.map(b => (
                  <button key={b.id} type="button"
                    className={`bag-card ${bagSetup === b.id ? "bag-selected" : ""}`}
                    onClick={() => setBagSetup(b.id)}>
                    <span className="bag-emoji">{b.emoji}</span>
                    <div>
                      <div className="bag-label">{b.label}</div>
                      <div className="bag-desc">{b.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="wizard-step">
          <h2 className="wizard-title">Plan your days</h2>
          <p className="wizard-sub">Pick activities for each day. Tap "Split into morning/afternoon/evening" if a day has multiple vibes.</p>
          <div className="days-list">
            {days.map((d, idx) => (
              <DayCard
                key={idx}
                day={d}
                dayNum={idx + 1}
                onToggleAll={(actId) => {
                  setDays(prev => prev.map((dy, i) => {
                    if (i !== idx) return dy;
                    const list = dy.activities || [];
                    return { ...dy, activities: list.includes(actId) ? list.filter(a => a !== actId) : [...list, actId] };
                  }));
                }}
                onToggleSlot={(slot, actId) => toggleDayActivity(idx, slot, actId)}
                onSetMode={(mode) => updateDay(idx, { mode })}
              />
            ))}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="wizard-step">
          <h2 className="wizard-title">Special events?</h2>
          <p className="wizard-sub">Any moments where you want to look extra sharp? VESTIS will give these days extra attention.</p>
          <div className="special-events-grid">
            {SPECIAL_EVENT_OPTIONS.map(opt => {
              const selected = specialEvents.find(e => e.id === opt.id);
              return (
                <div key={opt.id} className={`special-event-card ${selected ? "special-selected" : ""}`}>
                  <button type="button" className="special-event-button"
                    onClick={() => toggleSpecialEvent(opt.id)}>
                    <span className="special-emoji">{opt.emoji}</span>
                    <div>
                      <div className="special-label">{opt.label}</div>
                      <div className="special-desc">{opt.desc}</div>
                    </div>
                  </button>
                  {selected && days.length > 0 && (
                    <div className="special-day-picker">
                      <span className="special-day-label">Which day?</span>
                      <select
                        className="special-day-select"
                        value={selected.day || ""}
                        onChange={(e) => setSpecialEventDay(opt.id, e.target.value ? Number(e.target.value) : null)}>
                        <option value="">Any / not sure</option>
                        {days.map((d, i) => (
                          <option key={i} value={i + 1}>Day {i + 1} — {formatDate(d.date)}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="wizard-step">
          <h2 className="wizard-title">Review & generate</h2>
          <p className="wizard-sub">Almost there. We'll pull live weather and calendar events, then build your plan.</p>

          <div className="review-grid">
            <div className="review-row"><strong>Destination</strong><span>{destination}</span></div>
            <div className="review-row"><strong>Dates</strong><span>{formatDate(startDate)} – {formatDate(endDate)} ({days.length} days)</span></div>
            <div className="review-row"><strong>Transport</strong><span>{TRANSPORTATION_OPTIONS.find(t => t.id === transportation)?.emoji} {TRANSPORTATION_OPTIONS.find(t => t.id === transportation)?.label}</span></div>
            {bagSetup && <div className="review-row"><strong>Bag</strong><span>{BAG_OPTIONS.find(b => b.id === bagSetup)?.label}</span></div>}
            <div className="review-row"><strong>Calendar</strong><span>{calendarConnected ? "✓ Will pull events" : "Not connected"}</span></div>
            <div className="review-row"><strong>Special events</strong><span>{specialEvents.length > 0 ? specialEvents.map(e => SPECIAL_EVENT_OPTIONS.find(o => o.id === e.id)?.emoji).join(" ") : "None"}</span></div>
          </div>

          <label className="auth-label" style={{ marginTop: "1.5rem" }}>
            Anything else? (optional)
            <textarea className="auth-input" rows={3} value={manualNotes} onChange={(e) => setManualNotes(e.target.value)}
              placeholder="Bringing my own toiletries. Don't forget my running shoes." />
          </label>

          <button className="btn-primary btn-large btn-full" style={{ marginTop: "1rem" }}
            onClick={handleGenerate} disabled={generating}>
            {generating ? "Building your plan... (15-30s)" : <><Icon.Sparkle /> Generate packing plan</>}
          </button>
        </div>
      )}

      <div className="wizard-nav">
        {step > 1 && (
          <button className="btn-ghost" onClick={() => setStep(step - 1)} disabled={generating}>← Back</button>
        )}
        {step < totalSteps && (
          <button className="btn-primary" onClick={() => setStep(step + 1)} disabled={!canAdvance() || generating}
            style={{ marginLeft: "auto" }}>
            Next →
          </button>
        )}
      </div>
    </div>
  );
}

// ─── DAY CARD ────────────────────────────────────────────────────────────────
function DayCard({ day, dayNum, onToggleAll, onToggleSlot, onSetMode }) {
  const isSplit = day.mode === "split";
  return (
    <div className="day-card">
      <div className="day-card-header">
        <div className="day-card-title">
          <span className="day-card-num">Day {dayNum}</span>
          <span className="day-card-date">{formatDate(day.date)}</span>
        </div>
        <button type="button" className="day-card-toggle"
          onClick={() => onSetMode(isSplit ? "all_day" : "split")}>
          {isSplit ? "← Single all-day" : "Split into morning/afternoon/evening"}
        </button>
      </div>

      {!isSplit ? (
        <div className="day-activities">
          {ACTIVITY_OPTIONS.map(act => (
            <button key={act.id} type="button"
              className={`activity-chip ${day.activities?.includes(act.id) ? "activity-selected" : ""}`}
              onClick={() => onToggleAll(act.id)}>
              <span className="activity-emoji">{act.emoji}</span>
              <span className="activity-label">{act.label}</span>
            </button>
          ))}
        </div>
      ) : (
        ["morning", "afternoon", "evening"].map(slot => (
          <div key={slot} className="day-slot">
            <div className="day-slot-label">{slot}</div>
            <div className="day-activities">
              {ACTIVITY_OPTIONS.map(act => (
                <button key={act.id} type="button"
                  className={`activity-chip activity-chip-sm ${day[slot]?.includes(act.id) ? "activity-selected" : ""}`}
                  onClick={() => onToggleSlot(slot, act.id)}>
                  <span className="activity-emoji">{act.emoji}</span>
                  <span className="activity-label">{act.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ─── TRIP PLAN VIEW ─────────────────────────────────────────────────────────
function TripPlanView({ trip, onEdit, onBack }) {
  const plan = trip.generated_plan;
  if (!plan) {
    return (
      <div className="tab-content">
        <button className="btn-ghost" onClick={onBack}>← Back to trips</button>
        <p style={{ marginTop: "2rem" }}>No plan generated yet for this trip.</p>
        <button className="btn-primary" onClick={onEdit}>Open trip wizard</button>
      </div>
    );
  }

  return (
    <div className="tab-content">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <button className="btn-ghost" onClick={onBack}>← All trips</button>
        <button className="btn-ghost" onClick={onEdit}>Edit trip</button>
      </div>
      <div className="section-header">
        <h2 className="section-title">{trip.destination}</h2>
        <p className="section-sub">{formatDate(trip.start_date)} – {formatDate(trip.end_date)}</p>
      </div>

      <div className="pack-plan">
        <div className="plan-summary">{plan.summary}</div>

        <h3 className="plan-heading">Day by day</h3>
        {plan.days?.map((d, i) => (
          <div key={i} className={`plan-day ${d.is_special ? "plan-day-special" : ""}`}>
            <div className="plan-day-num">Day {d.day}{d.is_special && " ✨"}</div>
            <div className="plan-day-body">
              {d.date && <div className="plan-date">{d.date}{d.weather ? ` · ${d.weather}` : ""}</div>}
              <div className="plan-event">{d.activities || d.event}</div>
              <div className="plan-outfit">{(d.outfit || []).join(" · ")}</div>
              <div className="plan-note">{d.note}</div>
            </div>
          </div>
        ))}

        {plan.special_callouts && plan.special_callouts.length > 0 && (
          <>
            <h3 className="plan-heading">✨ Standout moments</h3>
            <ul className="plan-list">
              {plan.special_callouts.map((s, i) => <li key={i} className="plan-callout">{s}</li>)}
            </ul>
          </>
        )}

        <h3 className="plan-heading">Pack these essentials</h3>
        <ul className="plan-list">
          {plan.essentials?.map((e, i) => <li key={i}>{e}</li>)}
        </ul>

        {plan.skip_list && plan.skip_list.length > 0 && (
          <>
            <h3 className="plan-heading">Skip these</h3>
            <ul className="plan-list plan-skip">
              {plan.skip_list.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

// ─── HELPERS ────────────────────────────────────────────────────────────────
function daysSince(isoDate) {
  if (!isoDate) return null;
  const then = new Date(isoDate);
  const now = new Date();
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

function formatLastWorn(isoDate) {
  if (!isoDate) return "Never worn";
  const days = daysSince(isoDate);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 14) return "1 week ago";
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 60) return "1 month ago";
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)}+ years ago`;
}

function getDormancyClass(isoDate) {
  if (!isoDate) return "wear-never";
  const days = daysSince(isoDate);
  if (days < 7) return "wear-recent";
  if (days < 30) return "wear-active";
  if (days < 60) return "wear-dormant-30";
  if (days < 90) return "wear-dormant-60";
  return "wear-dormant-90";
}

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
.upload-row-single { grid-template-columns: 1fr; }
.upload-card-primary {
  background: linear-gradient(135deg, var(--ink) 0%, var(--ink-soft) 100%) !important;
  color: var(--cream) !important;
  border-style: solid !important;
  border-color: var(--ink) !important;
  padding: 1.5rem 1.75rem !important;
}
.upload-card-primary:hover:not(:disabled) {
  background: var(--ink-soft) !important;
  border-color: var(--ink-soft) !important;
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

/* Wear tracking */
.wear-block {
  background: var(--cream); border-radius: 12px;
  padding: 1rem 1.25rem; margin: 1rem 0 1.25rem;
}
.wear-stats {
  display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;
  margin-bottom: 0.875rem;
}
.wear-stat { display: flex; flex-direction: column; gap: 0.25rem; }
.wear-stat-label {
  font-size: 0.6875rem; font-weight: 600; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--ink-muted);
}
.wear-stat-value {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.375rem; font-weight: 500; color: var(--ink);
}
.wear-recent { color: var(--success); }
.wear-active { color: var(--ink); }
.wear-dormant-30 { color: #c19a6b; }
.wear-dormant-60 { color: #b8956a; }
.wear-dormant-90 { color: var(--error); }
.wear-never { color: var(--ink-muted); font-style: italic; }
.wore-today-btn {
  display: block; width: 100%;
  padding: 0.75rem 1.25rem;
  background: white; border: 1.5px solid var(--ink);
  border-radius: 10px; cursor: pointer;
  font-family: inherit; font-size: 0.875rem; font-weight: 600;
  color: var(--ink); transition: all 0.2s;
}
.wore-today-btn:hover { background: var(--ink); color: var(--cream); }

.dormancy-dot {
  display: inline-block; width: 8px; height: 8px; border-radius: 50%;
  margin-left: 0.5rem; vertical-align: middle;
  background: var(--ink-muted);
}
.dormancy-dot.wear-dormant-30 { background: #c19a6b; }
.dormancy-dot.wear-dormant-60 { background: #b8956a; }
.dormancy-dot.wear-dormant-90 { background: var(--error); animation: pulse 2s infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

.filter-row-wear { margin-top: -0.75rem; opacity: 0.85; }
.filter-chip-wear {
  font-size: 0.75rem;
  background: var(--cream-dark);
}
.detail-header-row {
  display: flex; align-items: center; justify-content: space-between;
  gap: 1rem; flex-wrap: wrap;
}
.edit-btn {
  background: transparent; border: 1px solid var(--line-strong);
  color: var(--ink-soft); padding: 0.4rem 0.875rem;
  border-radius: 8px; font-family: inherit; font-size: 0.8125rem;
  font-weight: 500; cursor: pointer; transition: all 0.2s;
}
.edit-btn:hover { background: var(--ink); color: var(--cream); border-color: var(--ink); }
.edit-form { display: flex; flex-direction: column; gap: 0.875rem; }
.edit-form select.auth-input { cursor: pointer; }
.color-alts {
  display: flex; flex-wrap: wrap; gap: 0.375rem; align-items: center;
  margin-top: 0.5rem;
}
.color-alts-label {
  font-size: 0.6875rem; font-weight: 600; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--ink-muted);
}
.color-alt-chip {
  background: var(--cream); border: 1px solid var(--line-strong);
  border-radius: 100px; padding: 0.25rem 0.625rem;
  font-family: inherit; font-size: 0.75rem; cursor: pointer;
  transition: all 0.15s;
}
.color-alt-chip:hover { background: var(--ink); color: var(--cream); border-color: var(--ink); }
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
  background: black; aspect-ratio: 3/4; position: relative;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}
.camera-video, .camera-preview { width: 100%; height: 100%; object-fit: contain; }
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

/* ─── STYLE MODE TABS ─── */
.style-mode-tabs {
  display: flex; gap: 0.5rem; margin-bottom: 1.5rem;
  background: var(--cream-dark); padding: 0.375rem;
  border-radius: 12px;
}
.style-mode-btn {
  flex: 1; padding: 0.75rem 1rem; background: transparent;
  border: none; border-radius: 8px; cursor: pointer;
  font-family: inherit; font-size: 0.875rem; font-weight: 500;
  color: var(--ink-muted); transition: all 0.2s;
}
.style-mode-btn:hover { color: var(--ink); }
.style-mode-active {
  background: white; color: var(--ink);
  box-shadow: 0 1px 3px rgba(26, 26, 26, 0.08);
}

/* ─── GET THE LOOK ─── */
.look-input {
  background: white; border: 1px solid var(--line);
  border-radius: 16px; padding: 1.5rem;
  margin-bottom: 1.5rem;
  display: flex; flex-direction: column; gap: 1rem;
}
.look-prompt { text-align: center; padding: 0.5rem 0; }
.look-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.5rem; font-weight: 500; margin-bottom: 0.5rem;
}
.look-sub {
  color: var(--ink-muted); font-size: 0.9375rem;
  line-height: 1.5; max-width: 480px; margin: 0 auto;
}
.inspiration-preview {
  display: flex; flex-direction: column; gap: 0.875rem; align-items: center;
}
.inspiration-preview img {
  max-width: 320px; max-height: 480px; width: 100%;
  border-radius: 12px; object-fit: cover;
  box-shadow: var(--shadow);
}

.look-result {
  background: white; border: 1px solid var(--line);
  border-radius: 16px; padding: 1.75rem;
  margin-bottom: 2rem;
}
.look-header { margin-bottom: 1.5rem; padding-bottom: 1.25rem; border-bottom: 1px solid var(--line); }
.look-vibe {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.0625rem; line-height: 1.5; color: var(--ink-soft);
  font-style: italic; margin-top: 0.5rem;
}
.look-section-heading {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.25rem; font-weight: 500;
  margin: 1.5rem 0 0.875rem;
}

.look-breakdown { display: flex; flex-direction: column; gap: 0.75rem; }
.breakdown-row {
  display: flex; gap: 1rem; padding: 1rem 1.125rem;
  background: var(--cream); border-radius: 10px;
  border-left: 3px solid var(--ink-muted);
}
.breakdown-perfect { border-left-color: var(--success); }
.breakdown-close { border-left-color: var(--gold); }
.breakdown-loose { border-left-color: var(--accent); }
.breakdown-none { border-left-color: var(--error); background: rgba(161, 59, 59, 0.04); }
.breakdown-role {
  font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--ink-muted);
  min-width: 80px; padding-top: 0.125rem;
}
.breakdown-content { flex: 1; }
.breakdown-photo {
  font-size: 0.875rem; color: var(--ink-soft); margin-bottom: 0.5rem;
}
.breakdown-label {
  font-size: 0.6875rem; font-weight: 600; letter-spacing: 0.05em;
  text-transform: uppercase; color: var(--ink-muted);
  margin-right: 0.375rem;
}
.breakdown-match { display: flex; flex-direction: column; gap: 0.25rem; }
.match-badge {
  display: inline-block; padding: 0.25rem 0.625rem;
  border-radius: 100px; font-size: 0.6875rem;
  font-weight: 600; letter-spacing: 0.05em;
  align-self: flex-start;
}
.match-perfect { background: var(--success); color: white; }
.match-close { background: var(--gold); color: white; }
.match-loose { background: var(--accent); color: white; }
.match-name { font-weight: 600; font-size: 0.9375rem; }
.match-reason { font-size: 0.8125rem; color: var(--ink-muted); font-style: italic; }
.breakdown-shop { display: flex; flex-direction: column; gap: 0.375rem; }
.shop-badge {
  display: inline-block; padding: 0.25rem 0.625rem;
  background: rgba(161, 59, 59, 0.12); color: var(--error);
  border-radius: 100px; font-size: 0.6875rem;
  font-weight: 600; letter-spacing: 0.05em;
  align-self: flex-start;
}
.shop-suggestion { font-size: 0.875rem; color: var(--ink); line-height: 1.4; }

.recreation-pieces { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 0.5rem; }

.shopping-list { list-style: none; padding: 0; }
.shopping-list li {
  padding: 0.75rem 1rem; background: rgba(193, 154, 107, 0.08);
  border: 1px dashed var(--gold); border-radius: 8px;
  margin-bottom: 0.5rem; font-size: 0.9375rem;
}

.btn-full { width: 100%; }

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
.plan-date { font-size: 0.75rem; color: var(--ink-muted); margin-bottom: 0.375rem; letter-spacing: 0.05em; }

/* Calendar / Weather UI */
.calendar-status {
  display: flex; align-items: center; gap: 0.625rem;
  padding: 0.875rem 1.25rem; background: white;
  border: 1px solid var(--line); border-radius: 12px;
  margin-bottom: 1.5rem; font-size: 0.875rem;
}
.trip-data-block {
  background: var(--cream); border: 1px solid var(--line);
  border-radius: 10px; padding: 0.875rem 1rem; margin-top: 0.75rem;
}
.trip-data-label {
  font-size: 0.75rem; font-weight: 600; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--ink-muted);
  margin-bottom: 0.625rem;
}
.trip-data-content { display: flex; flex-direction: column; gap: 0.375rem; }
.weather-day {
  display: flex; gap: 1rem; font-size: 0.8125rem; color: var(--ink-soft);
  padding: 0.25rem 0;
}
.weather-date {
  min-width: 90px; font-weight: 500; color: var(--ink);
}

/* Activity selector */
.activity-selector { margin: 0.5rem 0; }
.field-label-strong {
  display: block; font-size: 0.875rem; font-weight: 600;
  color: var(--ink); margin-bottom: 0.75rem;
}
.activity-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.5rem;
}
.activity-chip {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.625rem 0.875rem; background: white;
  border: 1.5px solid var(--line-strong); border-radius: 100px;
  font-family: inherit; font-size: 0.8125rem; font-weight: 500;
  color: var(--ink); cursor: pointer; transition: all 0.15s;
  text-align: left;
}
.activity-chip:hover { border-color: var(--ink); transform: translateY(-1px); }
.activity-selected {
  background: var(--ink); color: var(--cream); border-color: var(--ink);
}
.activity-emoji { font-size: 1.125rem; }
.activity-label { flex: 1; }

/* Style preference button in header */
.pref-btn {
  display: inline-flex; align-items: center; gap: 0.375rem;
  padding: 0.4rem 0.75rem; background: white;
  border: 1px solid var(--line-strong); border-radius: 100px;
  font-family: inherit; font-size: 0.8125rem; font-weight: 500;
  color: var(--ink); cursor: pointer; transition: all 0.2s;
}
.pref-btn:hover { background: var(--cream-dark); border-color: var(--ink); }

/* Style preference modal */
.style-pref-modal { max-width: 460px; }
.style-pref-options {
  display: flex; flex-direction: column; gap: 0.75rem;
}
.style-pref-card {
  display: flex; align-items: center; gap: 1rem;
  padding: 1rem 1.25rem; background: white;
  border: 2px solid var(--line); border-radius: 14px;
  font-family: inherit; cursor: pointer; transition: all 0.2s;
  text-align: left;
}
.style-pref-card:hover { border-color: var(--accent-light); transform: translateY(-1px); }
.style-pref-selected {
  border-color: var(--ink); background: var(--cream);
}
.style-pref-emoji { font-size: 2rem; }
.style-pref-label {
  font-weight: 600; font-size: 1rem; margin-bottom: 0.125rem; color: var(--ink);
}
.style-pref-desc { font-size: 0.8125rem; color: var(--ink-muted); }

.empty-state { text-align: center; padding: 4rem 2rem; color: var(--ink-muted); }

/* ─── TRIP LIST & WIZARD ─── */
.trip-list { display: grid; gap: 0.875rem; }
.trip-card {
  display: flex; align-items: stretch;
  background: white; border: 1px solid var(--line);
  border-radius: 14px; overflow: hidden;
  transition: all 0.2s;
}
.trip-card:hover { transform: translateY(-2px); box-shadow: var(--shadow); }
.trip-card-main {
  flex: 1; padding: 1.25rem 1.5rem; cursor: pointer;
}
.trip-card-dest {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.5rem; font-weight: 500; margin-bottom: 0.25rem;
}
.trip-card-dates {
  font-size: 0.875rem; color: var(--ink-muted); margin-bottom: 0.625rem;
}
.trip-card-meta {
  display: flex; gap: 0.625rem; align-items: center;
  font-size: 0.875rem;
}
.trip-card-badge {
  display: inline-block; padding: 0.125rem 0.625rem;
  background: var(--success); color: white;
  border-radius: 100px; font-size: 0.6875rem;
  font-weight: 600; letter-spacing: 0.05em;
}
.trip-draft { background: var(--ink-muted); }
.trip-card-delete {
  background: transparent; border: none; border-left: 1px solid var(--line);
  padding: 0 1rem; cursor: pointer; color: var(--ink-muted);
  transition: all 0.2s;
}
.trip-card-delete:hover { background: rgba(161, 59, 59, 0.08); color: var(--error); }

.wizard-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 1.75rem; gap: 1rem;
}
.wizard-progress { display: flex; gap: 0.5rem; }
.wizard-dot {
  width: 32px; height: 32px; border-radius: 50%;
  background: var(--cream-dark); color: var(--ink-muted);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.875rem; font-weight: 600;
  transition: all 0.2s;
}
.wizard-dot-active { background: var(--ink); color: var(--cream); }
.wizard-dot-current {
  transform: scale(1.15);
  box-shadow: 0 0 0 4px rgba(26, 26, 26, 0.1);
}

.wizard-step {
  background: white; border: 1px solid var(--line);
  border-radius: 16px; padding: 2rem;
  display: flex; flex-direction: column; gap: 1.25rem;
  animation: fadeIn 0.3s ease;
}
.wizard-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 2rem; font-weight: 500; margin: 0;
}
.wizard-subtitle {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.375rem; font-weight: 500; margin: 0.5rem 0;
}
.wizard-sub {
  color: var(--ink-muted); font-size: 0.9375rem;
  margin: -0.5rem 0 0.5rem;
}
.wizard-nav {
  display: flex; gap: 0.75rem; margin-top: 1.5rem;
  align-items: center;
}

/* Transport */
.transport-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
}
.transport-card {
  display: flex; flex-direction: column; align-items: center;
  gap: 0.5rem; padding: 1.25rem 1rem; background: white;
  border: 2px solid var(--line); border-radius: 12px;
  font-family: inherit; font-size: 0.9375rem; font-weight: 500;
  color: var(--ink); cursor: pointer; transition: all 0.2s;
}
.transport-card:hover { border-color: var(--accent-light); transform: translateY(-2px); }
.transport-selected { border-color: var(--ink); background: var(--cream); }
.transport-emoji { font-size: 2rem; }

/* Bag */
.bag-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 0.625rem;
}
.bag-card {
  display: flex; align-items: center; gap: 0.875rem;
  padding: 0.875rem 1rem; background: white;
  border: 2px solid var(--line); border-radius: 10px;
  font-family: inherit; cursor: pointer; transition: all 0.2s;
  text-align: left;
}
.bag-card:hover { border-color: var(--accent-light); }
.bag-selected { border-color: var(--ink); background: var(--cream); }
.bag-emoji { font-size: 1.5rem; }
.bag-label { font-weight: 600; font-size: 0.875rem; margin-bottom: 0.125rem; }
.bag-desc { font-size: 0.75rem; color: var(--ink-muted); }

/* Days */
.days-list { display: flex; flex-direction: column; gap: 0.875rem; }
.day-card {
  background: var(--cream); border: 1px solid var(--line);
  border-radius: 12px; padding: 1rem 1.25rem;
}
.day-card-header {
  display: flex; justify-content: space-between; align-items: center;
  flex-wrap: wrap; gap: 0.625rem; margin-bottom: 0.875rem;
}
.day-card-title { display: flex; align-items: baseline; gap: 0.625rem; }
.day-card-num {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.25rem; font-weight: 600; color: var(--accent);
}
.day-card-date { font-size: 0.875rem; color: var(--ink-muted); }
.day-card-toggle {
  background: transparent; border: none; cursor: pointer;
  font-family: inherit; font-size: 0.75rem; color: var(--ink-soft);
  text-decoration: underline; padding: 0.25rem;
}
.day-card-toggle:hover { color: var(--ink); }
.day-activities {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.5rem;
}
.day-slot { margin-top: 0.875rem; }
.day-slot-label {
  font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.15em;
  text-transform: uppercase; color: var(--accent);
  margin-bottom: 0.5rem;
}
.activity-chip-sm { padding: 0.5rem 0.75rem; font-size: 0.75rem; }

/* Special events */
.special-events-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 0.75rem;
}
.special-event-card {
  background: white; border: 2px solid var(--line);
  border-radius: 12px; overflow: hidden; transition: all 0.2s;
}
.special-event-card.special-selected {
  border-color: var(--gold);
  background: linear-gradient(135deg, #fefaf2 0%, #ffffff 100%);
}
.special-event-button {
  display: flex; align-items: center; gap: 0.875rem;
  width: 100%; padding: 1rem 1.25rem;
  background: transparent; border: none; cursor: pointer;
  text-align: left; font-family: inherit;
}
.special-emoji { font-size: 1.75rem; }
.special-label { font-weight: 600; font-size: 0.9375rem; margin-bottom: 0.125rem; }
.special-desc { font-size: 0.75rem; color: var(--ink-muted); }
.special-day-picker {
  display: flex; align-items: center; gap: 0.625rem;
  padding: 0.625rem 1.25rem 1rem;
  border-top: 1px dashed var(--line);
  background: rgba(193, 154, 107, 0.05);
}
.special-day-label {
  font-size: 0.75rem; font-weight: 600; letter-spacing: 0.05em;
  text-transform: uppercase; color: var(--ink-muted);
}
.special-day-select {
  flex: 1; padding: 0.5rem 0.75rem; border: 1px solid var(--line-strong);
  border-radius: 8px; font-family: inherit; font-size: 0.8125rem;
  background: white; cursor: pointer;
}

/* Review screen */
.review-grid {
  background: var(--cream); border-radius: 10px;
  padding: 1.25rem; display: flex; flex-direction: column; gap: 0.625rem;
}
.review-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0.5rem 0; border-bottom: 1px solid var(--line);
  gap: 1rem; flex-wrap: wrap;
}
.review-row:last-child { border-bottom: none; }
.review-row strong {
  font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--ink-muted);
}
.review-row span { font-size: 0.9375rem; color: var(--ink); text-align: right; }

.plan-day-special {
  border: 2px solid var(--gold) !important;
  background: linear-gradient(135deg, #fefaf2 0%, #ffffff 100%) !important;
}
.plan-callout {
  border-left: 3px solid var(--gold) !important;
  font-style: italic;
}

/* ─── SELFIE LOGGER ─── */
.selfie-fab {
  position: fixed; bottom: 1.5rem; right: 1.5rem;
  display: flex; align-items: center; gap: 0.625rem;
  padding: 0.875rem 1.25rem;
  background: var(--ink); color: var(--cream);
  border: none; border-radius: 100px;
  font-family: inherit; font-size: 0.875rem; font-weight: 600;
  cursor: pointer; z-index: 100;
  box-shadow: 0 8px 24px rgba(26, 26, 26, 0.25), 0 2px 6px rgba(26, 26, 26, 0.12);
  transition: transform 0.2s, box-shadow 0.2s;
}
.selfie-fab:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(26, 26, 26, 0.32), 0 4px 8px rgba(26, 26, 26, 0.16);
}
.selfie-fab:disabled { opacity: 0.7; cursor: wait; }
.selfie-fab svg { width: 18px; height: 18px; }
.fab-label {
  letter-spacing: 0.02em;
}
.fab-spinner {
  width: 18px; height: 18px;
  border: 2px solid rgba(245, 240, 230, 0.3);
  border-top-color: var(--cream);
  border-radius: 50%; animation: spin 0.8s linear infinite;
}
.fab-spinner.big {
  width: 36px; height: 36px; border-width: 3px;
  border-color: rgba(26, 26, 26, 0.15);
  border-top-color: var(--ink);
}
@keyframes spin { to { transform: rotate(360deg); } }

.selfie-analyzing-modal {
  background: white; border-radius: 16px;
  padding: 2.5rem; text-align: center;
  display: flex; flex-direction: column; align-items: center;
  min-width: 280px;
}
.selfie-confirm-modal { max-width: 540px; }
.selfie-thumb {
  display: block; max-width: 200px; max-height: 280px;
  margin: 0 auto; border-radius: 12px; object-fit: cover;
  box-shadow: var(--shadow);
}

.confirm-list {
  display: flex; flex-direction: column; gap: 0.5rem;
  margin-top: 0.625rem;
  max-height: 360px; overflow-y: auto;
}
.confirm-row {
  display: flex; align-items: center; gap: 0.875rem;
  padding: 0.75rem; background: white;
  border: 1.5px solid var(--line); border-radius: 12px;
  cursor: pointer; transition: all 0.15s;
  font-family: inherit; text-align: left;
}
.confirm-row:hover { border-color: var(--ink-muted); }
.confirm-checked {
  background: var(--cream); border-color: var(--ink);
}
.confirm-thumb {
  width: 56px; height: 56px; flex-shrink: 0;
  background: var(--cream); border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden; font-size: 1.5rem;
}
.confirm-thumb img { width: 100%; height: 100%; object-fit: cover; }
.confirm-info { flex: 1; min-width: 0; }
.confirm-name { font-weight: 600; font-size: 0.9375rem; margin-bottom: 0.25rem; }
.confirm-meta { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.confirm-badge {
  display: inline-block; padding: 0.125rem 0.5rem;
  border-radius: 100px; font-size: 0.6875rem;
  font-weight: 600; letter-spacing: 0.03em;
  flex-shrink: 0;
}
.confirm-high { background: var(--success); color: white; }
.confirm-med { background: var(--gold); color: white; }
.confirm-low { background: var(--accent); color: white; }
.confirm-reason {
  font-size: 0.75rem; color: var(--ink-muted);
  font-style: italic; line-height: 1.3;
}
.confirm-check {
  width: 28px; height: 28px; flex-shrink: 0;
  border-radius: 50%; background: var(--ink);
  color: var(--cream); display: flex;
  align-items: center; justify-content: center;
  font-weight: 700; font-size: 0.875rem;
  opacity: 0; transition: opacity 0.15s;
}
.confirm-checked .confirm-check { opacity: 1; }

.unmatched-block {
  background: rgba(193, 154, 107, 0.08);
  border: 1px dashed var(--gold);
  border-radius: 10px; padding: 0.875rem 1rem;
  margin-top: 1rem;
}
.unmatched-label {
  font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--gold);
  margin-bottom: 0.375rem;
}
.unmatched-list {
  list-style: none; padding: 0; margin: 0;
  font-size: 0.875rem; color: var(--ink);
}
.unmatched-list li { padding: 0.25rem 0; }
.unmatched-hint {
  font-size: 0.75rem; color: var(--ink-muted);
  margin-top: 0.5rem; font-style: italic;
}

@media (max-width: 640px) {
  .upload-row { grid-template-columns: 1fr; }
  .pack-row { flex-direction: column; }
  .before-after { grid-template-columns: 1fr; }
  .section-title { font-size: 2rem; }
  .activity-grid { grid-template-columns: 1fr 1fr; }
  .day-activities { grid-template-columns: 1fr 1fr; }
  .pref-btn span { display: none; }
  .bag-grid { grid-template-columns: 1fr; }
  .special-events-grid { grid-template-columns: 1fr; }
  .selfie-fab { bottom: 5rem; right: 1rem; padding: 0.75rem 1rem; }
  .fab-label { display: none; }
  .selfie-fab svg { width: 22px; height: 22px; }
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
