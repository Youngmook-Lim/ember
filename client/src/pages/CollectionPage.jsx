import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon } from '../components/Icon';
import { TagChip } from '../components/TagChip';
import { useIsMobile } from '../hooks/useIsMobile';
import { TAGS } from '../constants';

const API_URL = import.meta.env.VITE_API_URL;

function SegmentedControl({ value, onChange, options }) {
  return (
    <div style={{
      display: 'inline-flex', padding: 4, borderRadius: 10,
      background: 'var(--bg-deeper)', border: '1px solid var(--rule)',
      gap: 2,
    }}>
      {options.map(o => {
        const active = value === o.id;
        return (
          <button key={o.id} onClick={() => onChange(o.id)} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: o.iconOnly ? '6px 9px' : '7px 12px',
            borderRadius: 7, border: 'none',
            background: active ? 'var(--surface-raised)' : 'transparent',
            color: active ? 'var(--ink)' : 'var(--ink-mute)',
            cursor: 'pointer', fontSize: 13, fontWeight: 500,
            boxShadow: active ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
            transition: 'all 120ms ease',
            whiteSpace: 'nowrap',
          }}>
            {o.iconOnly
              ? <Icon name={o.iconOnly} size={16} />
              : <>{o.icon && <Icon name={o.icon} size={14} />}{o.label}</>
            }
          </button>
        );
      })}
    </div>
  );
}

function IconButton({ icon, onClick, active, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 28, height: 28, borderRadius: 6,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: active ? 'var(--ember)' : 'transparent',
        color: active ? '#FFFBEE' : 'var(--ink-mute)',
        border: 'none', cursor: 'pointer', transition: 'all 120ms ease',
      }}
      onMouseEnter={e => {
        if (!active) { e.currentTarget.style.background = 'var(--bg-deeper)'; e.currentTarget.style.color = 'var(--ink)'; }
      }}
      onMouseLeave={e => {
        if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink-mute)'; }
      }}
    >
      <Icon name={icon} size={14} />
    </button>
  );
}

function QuoteCard({ quote, onPin, onRemove, onShare, onEdit }) {
  const isLarge = quote._large;
  const { t, i18n } = useTranslation();
  const date = new Date(quote.createdAt).toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' });

  return (
    <div
      className="card"
      style={{
        padding: isLarge ? '28px 26px' : '22px 22px',
        background: isLarge ? 'var(--surface-raised)' : 'var(--surface)',
        borderRadius: 14, position: 'relative',
      }}
    >
      {quote.pinned && <div className="tape" title={t('collection.pinned')} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <TagChip tag={quote.tag} />
        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-mute)' }}>{date}</span>
      </div>

      <p className="italic-display" style={{
        fontSize: isLarge ? 22 : 17, lineHeight: 1.42, margin: 0, color: 'var(--ink)',
      }}>
        "{quote.text}"
      </p>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        marginTop: 16, paddingTop: 12,
        borderTop: '1px dashed var(--rule)',
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {quote.source && (
            <p style={{
              margin: 0, fontSize: 13, color: 'var(--ink-soft)', fontWeight: 600,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {quote.source}
            </p>
          )}
          {quote.work && (
            <p style={{
              margin: '2px 0 0', fontSize: 11, color: 'var(--ink-mute)',
              fontStyle: 'italic', overflow: 'hidden',
              textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {quote.work}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: 2 }}>
          <IconButton icon="edit" onClick={() => onEdit(quote)} title={t('collection.edit')} />
          <IconButton icon="pin" onClick={() => onPin(quote.id)} active={quote.pinned} title={quote.pinned ? t('collection.unpin') : t('collection.pin')} />
          <IconButton icon="share" onClick={() => onShare(quote)} title={t('collection.share')} />
          <IconButton icon="trash" onClick={() => onRemove(quote.id)} title={t('collection.remove')} />
        </div>
      </div>

      {quote.reflection && (
        <div style={{
          marginTop: 14, padding: '10px 12px',
          background: 'var(--bg-deeper)', borderRadius: 8,
          fontSize: 12, fontStyle: 'italic',
          color: 'var(--ink-soft)', lineHeight: 1.5,
        }}>
          <span className="smallcaps" style={{ display: 'block', marginBottom: 4, fontStyle: 'normal', fontSize: 10 }}>
            {t('collection.reflection')}
          </span>
          {quote.reflection}
        </div>
      )}
    </div>
  );
}

function EditModal({ quote, onSave, onClose }) {
  const [text, setText] = useState(quote.text);
  const [source, setSource] = useState(quote.source || '');
  const [work, setWork] = useState(quote.work || '');
  const [reflection, setReflection] = useState(quote.reflection || '');
  const [tag, setTag] = useState(quote.tag || '');
  const [saving, setSaving] = useState(false);
  const { t } = useTranslation();

  const handleSave = async () => {
    if (!text.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/quotes/${quote.id}`, {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, source: source || null, work: work || null, reflection: reflection || null, tag: tag || null }),
      });
      if (res.ok) { onSave(await res.json()); onClose(); }
    } finally { setSaving(false); }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', color: 'var(--ink-mute)', cursor: 'pointer' }}>
          <Icon name="x" size={18} />
        </button>
        <p className="smallcaps" style={{ color: 'var(--ember-deep)', marginBottom: 14 }}>{t('collection.editQuote')}</p>
        <textarea value={text} onChange={e => setText(e.target.value)} rows={4} className="textarea"
          style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 17, marginBottom: 12 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          <input value={source} onChange={e => setSource(e.target.value)} className="input" placeholder={t('collection.editAuthorPlaceholder')} style={{ fontSize: 14 }} />
          <input value={work} onChange={e => setWork(e.target.value)} className="input" placeholder={t('collection.editWorkPlaceholder')} style={{ fontSize: 14 }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <p className="smallcaps" style={{ marginBottom: 8 }}>{t('collection.editTagLabel')}</p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {TAGS.map(tg => <TagChip key={tg} tag={tg} active={tag === tg} onClick={() => setTag(a => a === tg ? '' : tg)} />)}
          </div>
        </div>
        <textarea value={reflection} onChange={e => setReflection(e.target.value)} rows={2} className="textarea"
          style={{ fontStyle: 'italic', fontFamily: 'var(--font-display)', fontSize: 15, marginBottom: 16 }}
          placeholder={t('collection.editReflectionPlaceholder')} />
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleSave} disabled={saving} className="btn btn-primary">
            <Icon name="check" size={15} stroke={2} /> {saving ? t('collection.editSaving') : t('collection.editSave')}
          </button>
          <button onClick={onClose} className="btn btn-ghost">{t('collection.editCancel')}</button>
        </div>
      </div>
    </div>
  );
}

function ShuffleModal({ quote, onClose, onAgain }) {
  const { t } = useTranslation();
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 580 }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', color: 'var(--ink-mute)', cursor: 'pointer' }}>
          <Icon name="x" size={18} />
        </button>
        <p className="smallcaps" style={{ color: 'var(--ember-deep)' }}>{t('collection.encounterTitle')}</p>
        <p className="italic-display" style={{ fontSize: 26, lineHeight: 1.3, margin: '20px 0' }}>
          "{quote.text}"
        </p>
        <p style={{ fontSize: 13, color: 'var(--ink-soft)', fontWeight: 600, margin: 0 }}>— {quote.source}</p>
        <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
          <button className="btn btn-primary" onClick={onAgain}>
            <Icon name="shuffle" size={14} /> {t('collection.encounterAgain')}
          </button>
          <button className="btn btn-ghost" onClick={onClose}>{t('collection.encounterClose')}</button>
        </div>
      </div>
    </div>
  );
}

function CollectionPage({ onShare }) {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState(null);
  const [groupBy, setGroupBy] = useState('none');
  const [layout, setLayout] = useState('masonry');
  const [shuffleQuote, setShuffleQuote] = useState(null);
  const [editingQuote, setEditingQuote] = useState(null);
  const mobile = useIsMobile();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    fetch(`${API_URL}/api/quotes`, { credentials: 'include' })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => { setQuotes(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handlePin = async (id) => {
    const res = await fetch(`${API_URL}/api/quotes/${id}/pin`, { method: 'PATCH', credentials: 'include' });
    if (res.ok) { const u = await res.json(); setQuotes(qs => qs.map(q => q.id === u.id ? u : q)); }
  };

  const handleRemove = async (id) => {
    const res = await fetch(`${API_URL}/api/quotes/${id}`, { method: 'DELETE', credentials: 'include' });
    if (res.ok) setQuotes(qs => qs.filter(q => q.id !== id));
  };

  const handleUpdate = (updated) => setQuotes(qs => qs.map(q => q.id === updated.id ? updated : q));

  const allTags = useMemo(() => Array.from(new Set(quotes.map(q => q.tag).filter(Boolean))), [quotes]);

  const filtered = useMemo(() => {
    return quotes.filter(q => {
      if (activeTag && q.tag !== activeTag) return false;
      if (query) {
        const s = query.toLowerCase();
        return q.text.toLowerCase().includes(s) ||
          (q.source || '').toLowerCase().includes(s) ||
          (q.work || '').toLowerCase().includes(s);
      }
      return true;
    });
  }, [quotes, query, activeTag]);

  const grouped = useMemo(() => {
    if (groupBy === 'pinned') return [
      { label: t('collection.filterPinned'), items: filtered.filter(q => q.pinned) },
      { label: t('collection.groupEverythingElse'), items: filtered.filter(q => !q.pinned) },
    ].filter(g => g.items.length);
    if (groupBy === 'author') {
      const unknown = t('collection.groupUnknownAuthor');
      const map = {};
      filtered.forEach(q => { (map[q.source || unknown] = map[q.source || unknown] || []).push(q); });
      return Object.entries(map).sort((a, b) => b[1].length - a[1].length).map(([label, items]) => ({ label, items }));
    }
    if (groupBy === 'month') {
      const map = {};
      filtered.forEach(q => {
        const k = new Date(q.createdAt).toLocaleDateString(i18n.language, { month: 'long', year: 'numeric' });
        (map[k] = map[k] || []).push(q);
      });
      return Object.entries(map).map(([label, items]) => ({ label, items }));
    }
    return [{ label: null, items: filtered }];
  }, [filtered, groupBy, t, i18n.language]);

  const shuffle = () => {
    const pool = filtered.length ? filtered : quotes;
    const candidates = shuffleQuote ? pool.filter(q => q.id !== shuffleQuote.id) : pool;
    const pick = candidates.length ? candidates : pool;
    if (pick.length) setShuffleQuote(pick[Math.floor(Math.random() * pick.length)]);
  };

  const colCount = mobile ? 1 : 3;

  return (
    <div className="paper-grain" style={{ minHeight: 'calc(100vh - 61px)' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: mobile ? '24px 16px 100px' : '40px 28px 80px' }}>

        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-end', marginBottom: 8,
          flexWrap: 'wrap', gap: 16,
        }}>
          <div>
            <p className="smallcaps" style={{ color: 'var(--ember-deep)', marginBottom: 10 }}>
              ✦ &nbsp;{t('collection.header')}
            </p>
            <h1 className="display" style={{ fontSize: mobile ? 32 : 48, margin: 0, fontWeight: 500, letterSpacing: '-0.02em' }}>
              <span style={{ fontVariantNumeric: 'oldstyle-nums' }}>{quotes.length}</span>{' '}
              <span className="italic-display" style={{ color: 'var(--ink-soft)', fontWeight: 400 }}>
                {t('collection.countQuotes')}
              </span>
            </h1>
          </div>
          <button className="btn btn-ghost" onClick={shuffle}>
            <Icon name="shuffle" size={15} /> {t('collection.shuffle')}
          </button>
        </div>

        <div className="rule" style={{ margin: '28px 0' }} />

        {/* Controls */}
        <div style={{
          display: 'flex', gap: 12, flexWrap: 'wrap',
          alignItems: 'center', marginBottom: 16,
        }}>
          <div style={{ position: 'relative', flex: mobile ? '0 0 100%' : '1 1 280px', minWidth: 0 }}>
            <span style={{
              position: 'absolute', left: 14, top: '50%',
              transform: 'translateY(-50%)', color: 'var(--ink-mute)',
              pointerEvents: 'none', display: 'flex',
            }}>
              <Icon name="search" size={16} />
            </span>
            <input
              className="input"
              placeholder={t('collection.search')}
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{ paddingLeft: 40 }}
            />
          </div>

          <SegmentedControl value={groupBy} onChange={setGroupBy} options={[
            { id: 'none', label: t('collection.filterAll') },
            { id: 'pinned', label: t('collection.filterPinned'), icon: 'pin' },
            { id: 'author', label: mobile ? t('collection.filterAuthorShort') : t('collection.filterAuthor'), icon: 'book' },
            { id: 'month', label: mobile ? t('collection.filterMonthShort') : t('collection.filterMonth'), icon: 'calendar' },
          ]} />

          <SegmentedControl value={layout} onChange={setLayout} options={[
            { id: 'masonry', iconOnly: 'grid' },
            { id: 'list', iconOnly: 'list' },
          ]} />
        </div>

        {/* Tag filter row */}
        {allTags.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28, alignItems: 'center' }}>
            <span className="smallcaps" style={{ marginRight: 4 }}>{t('collection.tags')}</span>
            <button
              className="chip"
              onClick={() => setActiveTag(null)}
              style={{
                background: !activeTag ? 'var(--ink)' : 'transparent',
                color: !activeTag ? 'var(--bg)' : 'var(--ink-mute)',
                borderColor: !activeTag ? 'transparent' : 'var(--rule)',
                cursor: 'pointer',
              }}
            >
              {t('collection.filterAllTags')}
            </button>
            {allTags.map(t => (
              <TagChip key={t} tag={t} active={activeTag === t} onClick={() => setActiveTag(activeTag === t ? null : t)} />
            ))}
          </div>
        )}

        {/* States */}
        {loading && (
          <div style={{ padding: '60px 0', textAlign: 'center' }}>
            <span className="mono" style={{ fontSize: 13, color: 'var(--ink-mute)' }}>{t('collection.loading')}</span>
          </div>
        )}

        {!loading && quotes.length === 0 && (
          <div style={{ padding: '80px 0', textAlign: 'center' }}>
            <p style={{ fontSize: 40, marginBottom: 20 }}>📝</p>
            <p style={{ color: 'var(--ink-mute)', fontSize: 15, marginBottom: 28 }}>{t('collection.empty')}</p>
            <Link to="/add" className="btn btn-primary">
              <Icon name="plus" size={16} stroke={2} /> {t('collection.emptyAdd')}
            </Link>
          </div>
        )}

        {!loading && quotes.length > 0 && filtered.length === 0 && (
          <div style={{ padding: '60px 0', textAlign: 'center' }}>
            <p style={{ color: 'var(--ink-mute)', fontSize: 15 }}>{t('collection.noMatch')}</p>
          </div>
        )}

        {/* Grouped sections */}
        {grouped.map((g, gi) => (
          <section key={g.label || gi} style={{ marginBottom: 40 }}>
            {g.label && (
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 20 }}>
                <h3 className="display" style={{ margin: 0, fontSize: 22, fontWeight: 500, color: 'var(--ink)', whiteSpace: 'nowrap' }}>
                  {g.label}
                </h3>
                <span className="tip">{t('collection.quoteCount', { count: g.items.length })}</span>
                <div style={{ flex: 1, height: 1, background: 'var(--rule)' }} />
              </div>
            )}

            {layout === 'masonry' ? (
              <div style={{ columnCount: colCount, columnGap: 20 }}>
                {g.items.map((q, i) => (
                  <div key={q.id} style={{ breakInside: 'avoid', marginBottom: 20 }}>
                    <QuoteCard
                      quote={{ ...q, _large: i % 5 === 0 }}
                      onPin={handlePin} onRemove={handleRemove}
                      onShare={onShare} onEdit={setEditingQuote}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {g.items.map(q => (
                  <QuoteCard
                    key={q.id} quote={q}
                    onPin={handlePin} onRemove={handleRemove}
                    onShare={onShare} onEdit={setEditingQuote}
                  />
                ))}
              </div>
            )}
          </section>
        ))}
      </div>

      {shuffleQuote && (
        <ShuffleModal quote={shuffleQuote} onClose={() => setShuffleQuote(null)} onAgain={shuffle} />
      )}
      {editingQuote && (
        <EditModal quote={editingQuote} onSave={handleUpdate} onClose={() => setEditingQuote(null)} />
      )}
    </div>
  );
}

export default CollectionPage;
