import { useState, useEffect, useCallback } from 'react';

// ─── TOKENS ────────────────────────────────────────────────────
// Paleta Slow con Sof: bases cálidas de su marca + azul marino como acento
const C = {
  bg: '#faf8f5',        // blanco cálido — fondo principal
  card: '#ffffff',
  panel: '#f5f1ec',     // beige muy suave para filas alternas
  sand: '#ddd4c2',      // arena — separadores, bordes
  mink: '#c6a8a0',      // rosa polvoso — acento cálido suave
  minkSoft: '#f1e4e0',  // rosa muy claro — fondo chips pilar 1
  navy: '#404c74',      // azul marino — acento principal con carácter
  navySoft: '#e8eaf2',  // azul muy claro — fondo chips pilar 2
  taupe: '#a88f7f',     // marrón cálido
  taupeLight: '#ede8e3',
  ink: '#2d2926',       // casi negro cálido
  inkSoft: '#6b5f57',
  inkFaint: '#a89e96',
  sage: '#a3aca1',      // verde salvia
  sageSoft: '#edf0ec',
  border: 'rgba(45,41,38,0.08)',
  borderMd: 'rgba(45,41,38,0.15)',
};

const FONT = {
  display: "'Playfair Display', Georgia, serif",
  body: "'DM Sans', system-ui, sans-serif",
};

// ─── DATOS ─────────────────────────────────────────────────────
const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const PILARES = [
  {
    id: 'pov',
    label: 'Mi POV',
    desc: 'Tu teoría, tu postura, lo que te diferencia',
    color: C.navy,
    soft: C.navySoft,
  },
  {
    id: 'trabajo',
    label: 'Mi trabajo',
    desc: 'La aplicación real, el detrás de cámara',
    color: C.taupe,
    soft: C.taupeLight,
  },
];

const FORMATOS = {
  instagram: ['Reel', 'Carrusel', 'Post', 'Historia'],
  tiktok: ['Reel', 'Dueto', 'Stitch'],
  substack: ['Artículo', 'Newsletter', 'Nota'],
};

const PLATFORM_META = {
  instagram: { label: 'Instagram', emoji: '📸', accent: '#E1306C', accentSoft: '#ffedf5' },
  tiktok: { label: 'TikTok', emoji: '🎵', accent: '#2d2926', accentSoft: '#e8e8e8' },
  substack: { label: 'Substack', emoji: '✍️', accent: '#FF6719', accentSoft: '#fff0e6' },
};

const STATUSES = ['Borrador', 'En proceso', 'Listo', 'Programado', 'Publicado'];
const STATUS_COLORS = {
  'Borrador': C.inkFaint,
  'En proceso': '#b8924a',
  'Listo': C.sage,
  'Programado': C.mink,
  'Publicado': C.navy,
};

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

// ─── STORAGE ───────────────────────────────────────────────────
const STORAGE_KEY = 'slow-con-sof-calendar-v1';

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

function saveState(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {}
}

// ─── HELPERS ───────────────────────────────────────────────────
function getPilar(id) {
  return PILARES.find(p => p.id === id) || PILARES[0];
}

function getMonthDates(d) {
  const year = d.getFullYear(), month = d.getMonth();
  const firstDay = new Date(year, month, 1);
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dates = [];
  for (let i = 1 - startDow; i <= daysInMonth; i++) {
    dates.push(new Date(year, month, i));
  }
  while (dates.length % 7 !== 0) {
    const last = dates[dates.length - 1];
    dates.push(new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1));
  }
  return dates;
}

// ─── ESTILOS BASE ──────────────────────────────────────────────
const base = {
  input: {
    width: '100%',
    padding: '9px 11px',
    border: `0.5px solid ${C.borderMd}`,
    borderRadius: '7px',
    fontSize: '13px',
    fontFamily: FONT.body,
    color: C.ink,
    background: '#fff',
    boxSizing: 'border-box',
    outline: 'none',
  },
  label: {
    display: 'block',
    fontSize: '10px',
    fontWeight: 500,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: C.navy,
    marginBottom: '6px',
    fontFamily: FONT.body,
  },
  btnPrimary: {
    flex: 1,
    padding: '10px',
    background: C.navy,
    color: '#fff',
    border: 'none',
    borderRadius: '7px',
    fontSize: '11px',
    fontWeight: 500,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    fontFamily: FONT.body,
  },
  btnSecondary: {
    flex: 1,
    padding: '10px',
    background: 'transparent',
    color: C.ink,
    border: `0.5px solid ${C.borderMd}`,
    borderRadius: '7px',
    fontSize: '11px',
    fontWeight: 500,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    fontFamily: FONT.body,
  },
};

// ─── COMPONENTES PEQUEÑOS ──────────────────────────────────────
function PilarChip({ id, size = 'sm' }) {
  const p = getPilar(id);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: size === 'sm' ? '2px 8px' : '4px 10px',
      borderRadius: '20px',
      fontSize: size === 'sm' ? '10px' : '11px',
      fontWeight: 500,
      background: p.soft,
      color: p.color,
      fontFamily: FONT.body,
      whiteSpace: 'nowrap',
      letterSpacing: '0.02em',
    }}>
      {p.label}
    </span>
  );
}

function StatusDot({ status }) {
  return (
    <span style={{
      display: 'inline-block',
      width: '6px', height: '6px',
      borderRadius: '50%',
      background: STATUS_COLORS[status] || C.inkFaint,
      flexShrink: 0,
    }} />
  );
}

function ProgressBar({ value, max, color }) {
  const pct = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0;
  return (
    <div style={{ height: '6px', background: C.panel, borderRadius: '3px', overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, transition: 'width 0.4s ease', borderRadius: '3px' }} />
    </div>
  );
}

// ─── MODAL ─────────────────────────────────────────────────────
function Modal({ title, subtitle, onClose, children }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(45,41,38,0.4)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        zIndex: 1000, padding: '3rem 1rem 1rem', overflowY: 'auto',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: C.card, borderRadius: '14px', padding: '1.75rem',
          width: '100%', maxWidth: '500px',
          border: `0.5px solid ${C.border}`,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontFamily: FONT.display, fontWeight: 400, fontSize: '22px', color: C.ink, margin: 0, lineHeight: 1.2 }}>
              {title}
            </h2>
            {subtitle && (
              <div style={{ fontSize: '11px', color: C.inkFaint, marginTop: '4px', fontFamily: FONT.body, letterSpacing: '0.06em' }}>
                {subtitle}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: C.inkFaint, lineHeight: 1, marginLeft: '1rem', flexShrink: 0 }}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FormGroup({ label, children }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={base.label}>{label}</label>
      {children}
    </div>
  );
}

// ─── MODAL DE POST ─────────────────────────────────────────────
function PostModal({ mode, platform, day, post, onClose, onSave, onDelete }) {
  const [form, setForm] = useState(post || {
    pilar: 'pov', formato: '', topic: '', caption: '', scheduleDate: '', status: 'Borrador',
  });

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const pm = PLATFORM_META[platform] || PLATFORM_META.instagram;

  const handleSave = () => {
    if (!form.pilar || !form.formato) { alert('Selecciona pilar y formato.'); return; }
    onSave(form);
  };

  const formatos = FORMATOS[platform] || [];
  const titleText = mode === 'add' ? `Nuevo · ${day}` : `Editar · ${day}`;

  return (
    <Modal title={titleText} subtitle={`${pm.emoji} ${pm.label}`} onClose={onClose}>
      <FormGroup label="Pilar *">
        <div style={{ display: 'flex', gap: '8px' }}>
          {PILARES.map(pl => (
            <button
              key={pl.id}
              onClick={() => set('pilar', pl.id)}
              style={{
                flex: 1, padding: '10px 8px',
                fontSize: '11px', fontWeight: 500,
                borderRadius: '8px', cursor: 'pointer',
                fontFamily: FONT.body,
                border: `0.5px solid ${form.pilar === pl.id ? pl.color : C.borderMd}`,
                background: form.pilar === pl.id ? pl.soft : C.card,
                color: form.pilar === pl.id ? pl.color : C.inkSoft,
                transition: 'all 0.15s',
                textAlign: 'center',
                lineHeight: 1.3,
              }}
            >
              {pl.label}
            </button>
          ))}
        </div>
      </FormGroup>

      <FormGroup label="Formato *">
        <select value={form.formato} onChange={e => set('formato', e.target.value)} style={base.input}>
          <option value="">Selecciona formato</option>
          {formatos.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </FormGroup>

      <FormGroup label="Tema o idea">
        <input
          style={base.input}
          type="text"
          placeholder="¿De qué trata este post?"
          value={form.topic}
          onChange={e => set('topic', e.target.value)}
        />
      </FormGroup>

      <FormGroup label="Caption / guión / borrador">
        <textarea
          style={{ ...base.input, minHeight: '90px', resize: 'vertical' }}
          placeholder="Escribe aquí tu caption, hilo o idea de guión..."
          value={form.caption}
          onChange={e => set('caption', e.target.value)}
        />
      </FormGroup>

      <FormGroup label="Fecha de publicación">
        <input style={base.input} type="date" value={form.scheduleDate} onChange={e => set('scheduleDate', e.target.value)} />
      </FormGroup>

      <FormGroup label="Estado">
        <select value={form.status} onChange={e => set('status', e.target.value)} style={base.input}>
          {STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
        </select>
      </FormGroup>

      <div style={{ display: 'flex', gap: '8px', marginTop: '1.5rem' }}>
        {mode === 'edit' && (
          <button
            onClick={onDelete}
            style={{
              padding: '10px 14px', background: C.minkSoft, color: C.taupe,
              border: `0.5px solid ${C.mink}`, borderRadius: '7px',
              fontSize: '11px', fontWeight: 500, cursor: 'pointer', fontFamily: FONT.body,
            }}
          >
            Eliminar
          </button>
        )}
        <button style={base.btnSecondary} onClick={onClose}>Cancelar</button>
        <button style={base.btnPrimary} onClick={handleSave}>
          {mode === 'add' ? 'Agregar' : 'Guardar'}
        </button>
      </div>
    </Modal>
  );
}

// ─── MODAL DE METAS ────────────────────────────────────────────
function GoalsModal({ goals, onClose, onSave }) {
  const [form, setForm] = useState({ ...goals });
  const set = (k, v) => setForm(prev => ({ ...prev, [k]: parseInt(v) || 0 }));
  return (
    <Modal title="Metas del mes" onClose={onClose}>
      <FormGroup label="Total de posts">
        <input style={base.input} type="number" value={form.total} onChange={e => set('total', e.target.value)} />
      </FormGroup>
      <FormGroup label="Instagram">
        <input style={base.input} type="number" value={form.instagram} onChange={e => set('instagram', e.target.value)} />
      </FormGroup>
      <FormGroup label="TikTok">
        <input style={base.input} type="number" value={form.tiktok} onChange={e => set('tiktok', e.target.value)} />
      </FormGroup>
      <FormGroup label="Substack">
        <input style={base.input} type="number" value={form.substack} onChange={e => set('substack', e.target.value)} />
      </FormGroup>
      <div style={{ display: 'flex', gap: '8px', marginTop: '1.5rem' }}>
        <button style={base.btnSecondary} onClick={onClose}>Cancelar</button>
        <button style={base.btnPrimary} onClick={() => onSave(form)}>Guardar</button>
      </div>
    </Modal>
  );
}

// ─── TARJETA DE POST ───────────────────────────────────────────
function PostCard({ post, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: C.card,
        border: `0.5px solid ${C.border}`,
        borderRadius: '8px',
        padding: '9px 11px',
        cursor: 'pointer',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderMd; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px', gap: '6px' }}>
        <span style={{ fontSize: '10px', fontWeight: 500, color: C.inkSoft, fontFamily: FONT.body }}>
          {post.formato}
        </span>
        <PilarChip id={post.pilar} />
      </div>
      {post.topic && (
        <div style={{ fontSize: '12px', color: C.ink, lineHeight: 1.4, marginBottom: '5px', fontFamily: FONT.body }}>
          {post.topic}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <StatusDot status={post.status} />
        <span style={{ fontSize: '10px', color: C.inkFaint, fontFamily: FONT.body }}>{post.status}</span>
        {post.scheduleDate && (
          <span style={{ fontSize: '10px', color: C.inkFaint, fontFamily: FONT.body, marginLeft: 'auto' }}>
            {new Date(post.scheduleDate + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── VISTA: PLATAFORMA ─────────────────────────────────────────
function PlatformView({ posts, onAdd, onEdit }) {
  const platforms = ['instagram', 'tiktok', 'substack'];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
      {platforms.map(platform => {
        const pm = PLATFORM_META[platform];
        return (
          <div
            key={platform}
            style={{
              background: C.card,
              border: `0.5px solid ${C.border}`,
              borderRadius: '12px',
              overflow: 'hidden',
            }}
          >
            {/* Header plataforma */}
            <div style={{
              padding: '0.85rem 1rem',
              display: 'flex', alignItems: 'center', gap: '8px',
              borderBottom: `0.5px solid ${C.border}`,
              background: C.panel,
            }}>
              <span style={{ fontSize: '16px' }}>{pm.emoji}</span>
              <span style={{
                fontSize: '11px', fontWeight: 500,
                letterSpacing: '0.14em', textTransform: 'uppercase',
                color: C.ink, fontFamily: FONT.body,
              }}>
                {pm.label}
              </span>
              <span style={{
                marginLeft: 'auto',
                fontSize: '10px', color: C.inkFaint, fontFamily: FONT.body,
              }}>
                {posts.filter(p => p.platform === platform).length} posts
              </span>
            </div>

            {/* Días */}
            <div style={{ padding: '6px' }}>
              {DAYS.map((day, di) => {
                const dayPosts = posts.filter(p => p.platform === platform && p.day === day);
                return (
                  <div key={day}>
                    <div style={{
                      fontSize: '9px', fontWeight: 500,
                      letterSpacing: '0.12em', textTransform: 'uppercase',
                      color: C.inkFaint, padding: '7px 6px 3px',
                      fontFamily: FONT.body,
                    }}>
                      {day}
                    </div>
                    <div style={{ padding: '0 4px 6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {dayPosts.map(post => (
                        <PostCard key={post.id} post={post} onClick={() => onEdit(post)} />
                      ))}
                      <button
                        onClick={() => onAdd(platform, day)}
                        style={{
                          width: '100%', padding: '6px',
                          background: 'transparent',
                          border: `0.5px dashed ${C.sand}`,
                          borderRadius: '7px',
                          fontSize: '10px', fontWeight: 400,
                          color: C.inkFaint, cursor: 'pointer',
                          fontFamily: FONT.body,
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = C.navy;
                          e.currentTarget.style.color = C.navy;
                          e.currentTarget.style.background = C.navySoft;
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = C.sand;
                          e.currentTarget.style.color = C.inkFaint;
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        {dayPosts.length === 0 ? '+ agregar' : '+ otro'}
                      </button>
                    </div>
                    {di < 6 && (
                      <div style={{ height: '0.5px', background: C.border, margin: '0 6px' }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── VISTA: CALENDARIO ─────────────────────────────────────────
function CalendarView({ posts, currentMonth, onChangeMonth, onEditPost }) {
  const today = new Date();
  const dates = getMonthDates(currentMonth);

  const getPostsForDate = (date) =>
    posts.filter(p => p.scheduleDate === date.toISOString().split('T')[0]);

  return (
    <div style={{ background: C.card, border: `0.5px solid ${C.border}`, borderRadius: '12px', padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontFamily: FONT.display, fontWeight: 400, fontSize: '26px', color: C.ink, margin: 0 }}>
          {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        <div style={{ display: 'flex', gap: '6px' }}>
          {['← Anterior', 'Hoy', 'Siguiente →'].map((label, i) => (
            <button
              key={label}
              onClick={() => onChangeMonth(i === 0 ? -1 : i === 1 ? 0 : 1)}
              style={{
                padding: '6px 12px', fontSize: '11px',
                border: `0.5px solid ${C.borderMd}`, borderRadius: '7px',
                background: C.card, color: C.inkSoft,
                cursor: 'pointer', fontFamily: FONT.body,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '4px' }}>
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
          <div key={d} style={{
            padding: '6px', textAlign: 'center',
            fontSize: '10px', fontWeight: 500, letterSpacing: '0.10em',
            textTransform: 'uppercase', color: C.inkFaint,
            borderBottom: `0.5px solid ${C.border}`,
            fontFamily: FONT.body,
          }}>
            {d}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {dates.map((date, idx) => {
          const inMonth = date.getMonth() === currentMonth.getMonth();
          const isToday = date.toDateString() === today.toDateString();
          const datePosts = getPostsForDate(date);
          return (
            <div
              key={idx}
              style={{
                border: `0.5px solid ${C.border}`,
                padding: '7px', minHeight: '88px',
                background: !inMonth ? C.bg : isToday ? '#eef0f7' : C.card,
                opacity: inMonth ? 1 : 0.45,
              }}
            >
              <div style={{
                fontSize: '12px', fontWeight: isToday ? 500 : 400,
                color: isToday ? C.navy : C.ink,
                marginBottom: '4px', fontFamily: FONT.body,
              }}>
                {date.getDate()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {datePosts.map(post => {
                  const pm = PLATFORM_META[post.platform] || PLATFORM_META.instagram;
                  const pilar = getPilar(post.pilar);
                  return (
                    <div
                      key={post.id}
                      onClick={() => onEditPost(post)}
                      style={{
                        fontSize: '9px', padding: '2px 5px',
                        cursor: 'pointer',
                        background: pm.accentSoft,
                        color: C.inkSoft,
                        borderLeft: `2px solid ${pm.accent}`,
                        borderRadius: '0 3px 3px 0',
                        display: 'flex', alignItems: 'center', gap: '3px',
                        fontFamily: FONT.body,
                      }}
                    >
                      <span style={{
                        display: 'inline-block', width: '5px', height: '5px',
                        borderRadius: '50%', background: pilar.color, flexShrink: 0,
                      }} />
                      {post.platform === 'instagram' ? 'IG' : post.platform === 'tiktok' ? 'TK' : 'SS'} · {post.formato}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── VISTA: ESTADÍSTICAS ───────────────────────────────────────
function StatsView({ posts, goals, onEditGoals }) {
  const published = posts.filter(p => p.status === 'Publicado');
  const scheduled = posts.filter(p => p.status === 'Programado');
  const inProgress = posts.filter(p => ['Borrador', 'En proceso', 'Listo'].includes(p.status));
  const total = published.length;
  const pct = goals.total > 0 ? Math.min(Math.round((total / goals.total) * 100), 100) : 0;

  const byPlatform = {
    instagram: published.filter(p => p.platform === 'instagram').length,
    tiktok: published.filter(p => p.platform === 'tiktok').length,
    substack: published.filter(p => p.platform === 'substack').length,
  };

  const byPilar = {
    pov: posts.filter(p => p.pilar === 'pov').length,
    trabajo: posts.filter(p => p.pilar === 'trabajo').length,
  };

  const totalPosts = posts.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* Meta general */}
      <div style={{ background: C.card, border: `0.5px solid ${C.border}`, borderRadius: '12px', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.inkSoft, fontFamily: FONT.body }}>
            Meta del mes
          </span>
          <button
            onClick={onEditGoals}
            style={{
              padding: '6px 14px', background: 'transparent',
              border: `0.5px solid ${C.borderMd}`, borderRadius: '7px',
              fontSize: '10px', fontWeight: 500, letterSpacing: '0.1em',
              textTransform: 'uppercase', cursor: 'pointer',
              color: C.inkSoft, fontFamily: FONT.body,
            }}
          >
            Editar
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '1.25rem' }}>
          {[
            { label: 'Publicados', value: total, sub: 'este mes' },
            { label: 'Programados', value: scheduled.length, sub: 'listos para salir' },
            { label: 'En proceso', value: inProgress.length, sub: 'borradores' },
            { label: 'Meta', value: goals.total, sub: 'posts este mes' },
          ].map(k => (
            <div key={k.label} style={{ background: C.panel, borderRadius: '8px', padding: '0.9rem 1rem' }}>
              <div style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: C.inkFaint, marginBottom: '5px', fontFamily: FONT.body }}>{k.label}</div>
              <div style={{ fontFamily: FONT.display, fontSize: '32px', fontWeight: 400, color: C.ink, lineHeight: 1 }}>{k.value}</div>
              <div style={{ fontSize: '10px', color: C.inkFaint, marginTop: '3px', fontFamily: FONT.body }}>{k.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: C.inkSoft, marginBottom: '5px', fontFamily: FONT.body }}>
          <span>{total} / {goals.total} publicados</span>
          <span>{pct}%</span>
        </div>
        <ProgressBar value={total} max={goals.total} color={C.navy} />
      </div>

      {/* Equilibrio de pilares */}
      <div style={{ background: C.card, border: `0.5px solid ${C.border}`, borderRadius: '12px', padding: '1.5rem' }}>
        <div style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.inkSoft, marginBottom: '1rem', fontFamily: FONT.body }}>
          Equilibrio de pilares
        </div>
        {PILARES.map(pl => {
          const count = byPilar[pl.id] || 0;
          const pctP = totalPosts > 0 ? Math.round((count / totalPosts) * 100) : 0;
          return (
            <div key={pl.id} style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PilarChip id={pl.id} />
                  <span style={{ fontSize: '11px', color: C.inkFaint, fontFamily: FONT.body }}>{pl.desc}</span>
                </div>
                <span style={{ fontSize: '12px', color: C.ink, fontFamily: FONT.body, fontWeight: 500 }}>
                  {count} <span style={{ fontWeight: 400, color: C.inkFaint }}>({pctP}%)</span>
                </span>
              </div>
              <ProgressBar value={count} max={totalPosts || 1} color={pl.color} />
            </div>
          );
        })}
        {totalPosts > 0 && byPilar.pov > 0 && byPilar.trabajo > 0 && (
          <div style={{
            marginTop: '1rem', padding: '10px 12px',
            background: C.navySoft, borderRadius: '8px',
            fontSize: '12px', color: C.navy, fontFamily: FONT.body,
            borderLeft: `3px solid ${C.navy}`,
          }}>
            {Math.abs(byPilar.pov - byPilar.trabajo) <= 2
              ? '✓ Buen equilibrio entre teoría y práctica.'
              : byPilar.pov > byPilar.trabajo
              ? 'Tienes más teoría que ejemplos reales — considera agregar posts de "Mi trabajo".'
              : 'Tienes más casos reales que teoría — considera agregar posts de "Mi POV".'}
          </div>
        )}
      </div>

      {/* Por plataforma */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {['instagram', 'tiktok', 'substack'].map(plat => {
          const pm = PLATFORM_META[plat];
          const pub = byPlatform[plat] || 0;
          const goal = goals[plat] || 0;
          const platTotal = posts.filter(p => p.platform === plat).length;
          return (
            <div key={plat} style={{ background: C.card, border: `0.5px solid ${C.border}`, borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '1rem' }}>
                <span>{pm.emoji}</span>
                <span style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.inkSoft, fontFamily: FONT.body }}>{pm.label}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: C.inkSoft, marginBottom: '5px', fontFamily: FONT.body }}>
                <span>Publicados</span><span>{pub} / {goal}</span>
              </div>
              <ProgressBar value={pub} max={goal} color={pm.accent} />
              <div style={{ marginTop: '8px', fontSize: '10px', color: C.inkFaint, fontFamily: FONT.body }}>
                {platTotal} posts en total
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── APP PRINCIPAL ─────────────────────────────────────────────
export default function App() {
  const saved = loadState();

  const [posts, setPosts] = useState(saved?.posts || []);
  const [goals, setGoals] = useState(saved?.goals || { total: 16, instagram: 8, tiktok: 4, substack: 4 });
  const [nextId, setNextId] = useState(saved?.nextId || 1);
  const [view, setView] = useState('platform');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [modal, setModal] = useState(null);

  useEffect(() => {
    saveState({ posts, goals, nextId });
  }, [posts, goals, nextId]);

  const handleAdd = useCallback((platform, day) => {
    setModal({ type: 'post', mode: 'add', platform, day });
  }, []);

  const handleEdit = useCallback((post) => {
    setModal({ type: 'post', mode: 'edit', post });
  }, []);

  const handleSavePost = useCallback((form) => {
    if (modal.mode === 'add') {
      setPosts(prev => [...prev, { id: nextId, platform: modal.platform, day: modal.day, ...form }]);
      setNextId(prev => prev + 1);
    } else {
      setPosts(prev => prev.map(p => p.id === modal.post.id ? { ...p, ...form } : p));
    }
    setModal(null);
  }, [modal, nextId]);

  const handleDeletePost = useCallback(() => {
    setPosts(prev => prev.filter(p => p.id !== modal.post.id));
    setModal(null);
  }, [modal]);

  const handleChangeMonth = (dir) => {
    if (dir === 0) setCurrentMonth(new Date());
    else setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + dir));
  };

  const tabs = [
    { id: 'platform', label: 'Por plataforma' },
    { id: 'calendar', label: 'Calendario' },
    { id: 'stats', label: 'Estadísticas' },
  ];

  return (
    <div style={{ background: C.bg, minHeight: '100vh', padding: '1.75rem', fontFamily: FONT.body, color: C.ink }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            fontSize: '10px', fontWeight: 500, letterSpacing: '0.22em',
            textTransform: 'uppercase', color: C.navy,
            fontFamily: FONT.body, marginBottom: '6px',
          }}>
            Slow con Sof
          </div>
          <h1 style={{
            fontFamily: FONT.display, fontWeight: 400, fontSize: '40px',
            color: C.ink, margin: 0, lineHeight: 1.1,
          }}>
            Calendario de contenido
          </h1>
          <div style={{ fontSize: '12px', color: C.inkFaint, marginTop: '8px', fontFamily: FONT.body }}>
            Instagram · TikTok · Substack
          </div>

          {/* Leyenda de pilares */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '14px', flexWrap: 'wrap' }}>
            {PILARES.map(pl => (
              <div key={pl.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: pl.color, display: 'inline-block', flexShrink: 0,
                }} />
                <span style={{ fontSize: '11px', color: C.inkSoft, fontFamily: FONT.body }}>
                  <strong style={{ color: pl.color, fontWeight: 500 }}>{pl.label}</strong>
                  {' '}— {pl.desc}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setView(t.id)}
              style={{
                padding: '8px 16px', fontSize: '11px', fontWeight: 500,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                borderRadius: '7px', cursor: 'pointer', fontFamily: FONT.body,
                border: `0.5px solid ${view === t.id ? C.navy : C.borderMd}`,
                background: view === t.id ? C.navy : C.card,
                color: view === t.id ? '#fff' : C.inkSoft,
                transition: 'all 0.15s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Vistas */}
        {view === 'platform' && (
          <PlatformView posts={posts} onAdd={handleAdd} onEdit={handleEdit} />
        )}
        {view === 'calendar' && (
          <CalendarView
            posts={posts}
            currentMonth={currentMonth}
            onChangeMonth={handleChangeMonth}
            onEditPost={handleEdit}
          />
        )}
        {view === 'stats' && (
          <StatsView posts={posts} goals={goals} onEditGoals={() => setModal({ type: 'goals' })} />
        )}
      </div>

      {/* Modales */}
      {modal?.type === 'post' && (
        <PostModal
          mode={modal.mode}
          platform={modal.platform || modal.post?.platform}
          day={modal.day || modal.post?.day}
          post={modal.post}
          onClose={() => setModal(null)}
          onSave={handleSavePost}
          onDelete={handleDeletePost}
        />
      )}
      {modal?.type === 'goals' && (
        <GoalsModal
          goals={goals}
          onClose={() => setModal(null)}
          onSave={(g) => { setGoals(g); setModal(null); }}
        />
      )}
    </div>
  );
}
