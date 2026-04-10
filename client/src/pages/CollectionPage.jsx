import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

function CollectionPage() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all quotes for the logged-in user
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

  // Delete a quote and remove it from the list immediately
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

  return (
    <div className="min-h-[calc(100vh-57px)] bg-cream px-4 sm:px-6 py-8 sm:py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-warm-gray mb-2">
          My Collection
        </h1>
        <p className="text-muted mb-6 sm:mb-8 text-sm sm:text-base">
          {quotes.length} {quotes.length === 1 ? 'quote' : 'quotes'} saved
        </p>

        {/* Loading state */}
        {loading && (
          <p className="text-muted">Loading your quotes...</p>
        )}

        {/* Empty state */}
        {!loading && quotes.length === 0 && (
          <div className="text-center py-12 sm:py-16">
            <p className="text-4xl sm:text-5xl mb-6">📝</p>
            <p className="text-muted text-base sm:text-lg">
              No quotes yet. Add your first one!
            </p>
          </div>
        )}

        {/* Quote cards */}
        <div className="space-y-4">
          {quotes.map((quote) => (
            <div
              key={quote.id}
              className="bg-warm-white rounded-xl p-4 sm:p-6 shadow-sm group"
            >
              <p className="font-quote text-base sm:text-lg leading-relaxed text-warm-gray italic">
                "{quote.text}"
              </p>
              {quote.source && (
                <p className="text-muted text-sm mt-3">
                  — {quote.source}
                </p>
              )}

              {/* Footer: date + delete */}
              <div className="flex justify-between items-center mt-4 pt-3 border-t border-peach/30">
                <span className="text-xs text-muted">
                  {new Date(quote.createdAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => handleDelete(quote.id)}
                  className="text-xs text-muted hover:text-red-400 transition-colors duration-200 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CollectionPage;
