import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;
const STORAGE_KEY = 'ember_daily_quote';

// Returns today's date as a string like "2026-04-10"
function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function DashboardPage() {
  const [quote, setQuote] = useState(null);
  const [empty, setEmpty] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDailyQuote = async () => {
      // Check if we already fetched today's quote
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const { date, quote: savedQuote } = JSON.parse(stored);
        if (date === todayString()) {
          // Same day — show the stored quote, no network request needed
          setQuote(savedQuote);
          setLoading(false);
          return;
        }
      }

      // No stored quote for today — fetch a new one
      try {
        const res = await fetch(`${API_URL}/api/quotes/daily`, {
          credentials: 'include',
        });

        if (res.status === 404) {
          setEmpty(true);
        } else {
          const data = await res.json();
          setQuote(data);
          // Save it with today's date so it persists until tomorrow
          localStorage.setItem(STORAGE_KEY, JSON.stringify({
            date: todayString(),
            quote: data,
          }));
        }
      } catch (err) {
        console.error('Failed to fetch daily quote:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDailyQuote();
  }, []);

  return (
    <div className="min-h-[calc(100vh-57px)] bg-gradient-to-br from-peach/40 via-cream to-lavender/30 flex items-center justify-center px-4 sm:px-6 py-8">
      <div className="max-w-lg w-full text-center">

        {/* Loading state */}
        {loading && (
          <p className="text-muted text-lg">Loading...</p>
        )}

        {/* Empty state — no quotes saved yet */}
        {!loading && empty && (
          <div>
            <p className="text-4xl sm:text-5xl mb-6">✨</p>
            <h2 className="font-quote text-xl sm:text-2xl text-warm-gray mb-4">
              Your collection is empty
            </h2>
            <p className="text-muted mb-8 text-sm sm:text-base">
              Save your first quote and it will appear here.
            </p>
            <a
              href="/add"
              className="inline-block bg-ember text-white font-semibold px-6 py-3 rounded-full hover:bg-ember-dark transition-colors duration-300"
            >
              Add a quote
            </a>
          </div>
        )}

        {/* Quote of the day */}
        {!loading && quote && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ember mb-6">
              Quote of the Day
            </p>

            <div className="bg-warm-white rounded-2xl shadow-sm p-6 sm:p-10">
              <p className="font-quote text-xl sm:text-2xl leading-relaxed text-warm-gray italic">
                "{quote.text}"
              </p>
              {quote.source && (
                <p className="text-muted mt-4 sm:mt-6 text-sm">
                  — {quote.source}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
