import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

function AddQuotePage() {
  const [text, setText] = useState('');
  const [source, setSource] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); // prevent browser from reloading the page on form submit
    setError('');

    if (!text.trim()) {
      setError('Quote text is required.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/quotes`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, source }),
      });

      if (res.ok) {
        navigate('/collection'); // go to collection after saving
      } else {
        const data = await res.json();
        setError(data.error || 'Something went wrong.');
      }
    } catch {
      setError('Could not connect to the server.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-57px)] bg-cream flex items-center justify-center px-4 sm:px-6 py-8">
      <div className="max-w-lg w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-warm-gray mb-2">
          Add a Quote
        </h1>
        <p className="text-muted mb-6 sm:mb-8 text-sm sm:text-base">
          Capture something that resonated with you.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {/* Quote text */}
          <div>
            <label className="block text-sm font-semibold text-warm-gray mb-2">
              Quote
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              placeholder="Type or paste the quote here..."
              className="w-full bg-warm-white border border-peach rounded-xl px-4 py-3 font-quote text-base sm:text-lg text-warm-gray placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-ember/40 resize-none"
            />
          </div>

          {/* Source (optional) */}
          <div>
            <label className="block text-sm font-semibold text-warm-gray mb-2">
              Source <span className="text-muted font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="e.g. Marcus Aurelius, Huberman Lab Ep. 42"
              className="w-full bg-warm-white border border-peach rounded-xl px-4 py-3 text-warm-gray placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-ember/40"
            />
          </div>

          {/* Error message */}
          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-ember text-white font-semibold px-6 sm:px-8 py-3 rounded-full hover:bg-ember-dark transition-colors duration-300 disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Saving...' : 'Save Quote'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/collection')}
              className="text-muted font-semibold px-4 py-3 hover:text-warm-gray transition-colors duration-300 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddQuotePage;
