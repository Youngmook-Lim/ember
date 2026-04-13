import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

function QuoteCard({ quote, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(quote.text);
  const [editSource, setEditSource] = useState(quote.source || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!editText.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/quotes/${quote.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: editText, source: editSource }),
      });

      if (res.ok) {
        const updated = await res.json();
        onUpdate(updated);
        setEditing(false);
      }
    } catch (err) {
      console.error('Failed to update quote:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditText(quote.text);
    setEditSource(quote.source || '');
    setEditing(false);
  };

  return (
    <div className="bg-warm-white rounded-xl p-4 sm:p-6 shadow-sm group">
      {editing ? (
        /* Edit mode */
        <div className="space-y-3">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={3}
            className="w-full bg-cream border border-peach rounded-lg px-3 py-2 font-quote text-base text-warm-gray focus:outline-none focus:ring-2 focus:ring-ember/40 resize-none"
          />
          <input
            type="text"
            value={editSource}
            onChange={(e) => setEditSource(e.target.value)}
            placeholder="Source (optional)"
            className="w-full bg-cream border border-peach rounded-lg px-3 py-2 text-sm text-warm-gray placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-ember/40"
          />
          <div className="flex gap-3 pt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-sm font-semibold text-white bg-ember px-4 py-1.5 rounded-full hover:bg-ember-dark transition-colors duration-200 disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              className="text-sm font-semibold text-muted hover:text-warm-gray transition-colors duration-200 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        /* View mode */
        <>
          <p className="font-quote text-base sm:text-lg leading-relaxed text-warm-gray italic">
            "{quote.text}"
          </p>
          {quote.source && (
            <p className="text-muted text-sm mt-3">
              — {quote.source}
            </p>
          )}

          {/* Footer: date + actions */}
          <div className="flex justify-between items-center mt-4 pt-3 border-t border-peach/30">
            <span className="text-xs text-muted">
              {new Date(quote.createdAt).toLocaleDateString()}
            </span>
            <div className="flex gap-4 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={() => setEditing(true)}
                className="text-xs text-muted hover:text-ember transition-colors duration-200 cursor-pointer"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(quote.id)}
                className="text-xs text-muted hover:text-red-400 transition-colors duration-200 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function CollectionPage() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const res = await fetch(`${API_URL}/api/quotes`, {
          credentials: 'include',
        });
        const data = await res.json();
        setQuotes(data);
      } catch (err) {
        console.error('Failed to fetch quotes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuotes();
  }, []);

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/quotes/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        setQuotes(quotes.filter((q) => q.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete quote:', err);
    }
  };

  const handleUpdate = (updated) => {
    setQuotes(quotes.map((q) => (q.id === updated.id ? updated : q)));
  };

  return (
    <div className="min-h-[calc(100vh-57px)] bg-cream px-4 sm:px-6 py-8 sm:py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-warm-gray mb-2">
          My Collection
        </h1>
        <p className="text-muted mb-6 sm:mb-8 text-sm sm:text-base">
          {quotes.length} {quotes.length === 1 ? 'quote' : 'quotes'} saved
        </p>

        {loading && (
          <p className="text-muted">Loading your quotes...</p>
        )}

        {!loading && quotes.length === 0 && (
          <div className="text-center py-12 sm:py-16">
            <p className="text-4xl sm:text-5xl mb-6">📝</p>
            <p className="text-muted text-base sm:text-lg">
              No quotes yet. Add your first one!
            </p>
          </div>
        )}

        <div className="space-y-4">
          {quotes.map((quote) => (
            <QuoteCard
              key={quote.id}
              quote={quote}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default CollectionPage;
