"use client";

import { useState, useEffect } from "react";
import { Star, ThumbsUp, CheckCircle, X, Send, MessageSquare } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

interface Review {
  _id: string;
  authorName: string;
  rating: number;
  title: string;
  comment: string;
  verified: boolean;
  helpfulCount: number;
  createdAt: string;
}

interface Props {
  activityId: string;
  activityTitle: string;
}

export default function ReviewsSection({ activityId, activityTitle }: Props) {
  const { t, language } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form state
  const [rating, setRating] = useState(5);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [authorName, setAuthorName] = useState("");

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`/api/reviews?activityId=${activityId}`);
        if (res.ok) {
          const data = await res.json();
          setReviews(data.reviews || []);
        }
      } catch (e) {
        console.error("Error loading reviews", e);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [activityId]);

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !comment.trim()) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activityId, rating, title, comment, authorName }),
      });
      if (res.ok) {
        const data = await res.json();
        setReviews((prev) => [data.review, ...prev]);
        setSubmitted(true);
        setShowForm(false);
        setTitle(""); setComment(""); setAuthorName(""); setRating(5);
        setTimeout(() => setSubmitted(false), 4000);
      }
    } catch (e) {
      console.error("Submit review error", e);
    } finally {
      setSubmitting(false);
    }
  };

  const [votedReviews, setVotedReviews] = useState<string[]>([]);

  useEffect(() => {
    // Load already voted reviews from localStorage
    const saved = Object.keys(localStorage)
      .filter(key => key.startsWith('voted_review_'))
      .map(key => key.replace('voted_review_', ''));
    setVotedReviews(saved);
  }, []);

  const handleHelpful = async (reviewId: string) => {
    if (votedReviews.includes(reviewId)) return;
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setReviews(prev => prev.map(r => r._id === reviewId ? { ...r, helpfulCount: data.review.helpfulCount } : r));
        setVotedReviews(prev => [...prev, reviewId]);
        localStorage.setItem(`voted_review_${reviewId}`, 'true');
      }
    } catch (e) {
      console.error("Helpful click error", e);
    }
  };

  return (
    <div className="mt-10 pt-10" style={{ borderTop: "1px solid rgba(212,150,42,0.18)" }}>
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-[0.65rem] tracking-[0.22em] uppercase font-semibold mb-1" style={{ color: "var(--g300)" }}>
              <MessageSquare size={11} className="inline mr-1.5" />
              {t('reviews.title')}
            </p>
            <h4 className="fd text-xl font-medium" style={{ color: "var(--t1)" }}>{activityTitle}</h4>
          </div>

          {reviews.length > 0 && (
            <div className="flex flex-col items-center px-5 py-3 rounded-2xl" style={{ background: "rgba(212,150,42,0.1)", border: "1px solid rgba(212,150,42,0.25)" }}>
              <span className="fd text-4xl font-light gold-text leading-none">{avgRating.toFixed(1)}</span>
              <div className="flex gap-0.5 my-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={10} fill={s <= Math.round(avgRating) ? "var(--g300)" : "none"} stroke={s <= Math.round(avgRating) ? "var(--g300)" : "var(--t4)"} />
                ))}
              </div>
              <span className="text-[0.65rem]" style={{ color: "var(--t3)" }}>{reviews.length} {t('footer.reviews').toLowerCase()}</span>
            </div>
          )}
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[0.72rem] font-semibold tracking-wide uppercase transition-all duration-300 hover:scale-105"
          style={{ background: "linear-gradient(90deg, var(--g500), var(--g300))", color: "#06040A" }}
        >
          <Star size={13} />
          {t('reviews.write_review')}
        </button>
      </div>

      {/* ── Success toast ── */}
      {submitted && (
        <div className="flex items-center gap-3 p-4 rounded-2xl mb-6 a-down" style={{ background: "rgba(110,231,160,0.1)", border: "1px solid rgba(110,231,160,0.3)" }}>
          <CheckCircle size={18} className="text-emerald-400 flex-shrink-0" />
          <p className="text-sm text-emerald-300 font-medium">{t('reviews.success')}</p>
        </div>
      )}

      {/* ── Review form ── */}
      {showForm && (
        <form 
          onSubmit={handleSubmit} 
          className="mb-10 p-8 rounded-[2rem] a-down shadow-2xl overflow-hidden relative" 
          style={{ 
            background: "var(--s2)", 
            border: "1px solid var(--bw2)"
          }}
        >
          {/* Subtle accent line */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[var(--g300)] to-transparent opacity-40" />

          <div className="flex items-center justify-between mb-8">
            <h5 className="fd text-xl font-medium tracking-tight" style={{ color: "var(--t1)" }}>{t('reviews.share_experience')}</h5>
            <button 
              type="button" 
              onClick={() => setShowForm(false)} 
              className="p-2 rounded-full hover:bg-[var(--bw1)] transition-colors" 
              style={{ color: "var(--t3)" }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Star selector */}
          <div className="mb-8 p-6 rounded-2xl bg-[var(--bw1)] border border-[var(--bw1)]">
            <p className="text-[0.68rem] uppercase tracking-[0.25em] font-black mb-4" style={{ color: "var(--t3)" }}>
              {t('reviews.your_rating')}
            </p>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button 
                  key={s} 
                  type="button"
                  onMouseEnter={() => setHoveredStar(s)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => setRating(s)}
                  className="transition-all duration-300 hover:scale-110 active:scale-95 group"
                >
                  <Star
                    size={36}
                    fill={(hoveredStar || rating) >= s ? "var(--g300)" : "none"}
                    stroke={(hoveredStar || rating) >= s ? "var(--g300)" : "var(--t4)"}
                    strokeWidth={1}
                    className="drop-shadow-sm transition-colors group-hover:stroke-[var(--g300)]"
                  />
                </button>
              ))}
              <span className="text-sm font-bold ml-4 px-3 py-1 rounded-md bg-[var(--g300)] text-[#1C160C] uppercase tracking-wider text-[0.65rem] animate-in fade-in zoom-in-95">
                {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][hoveredStar || rating]}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <label className="text-[0.65rem] uppercase tracking-[0.2em] font-black block pl-1" style={{ color: "var(--t2)" }}>
                {t('reviews.your_name')}
              </label>
              <input
                className="w-full bg-[var(--bw1)] border border-[var(--bw2)] rounded-xl py-4 px-5 text-sm font-medium text-[var(--t1)] placeholder:text-[var(--t4)] focus:outline-none focus:border-[var(--g300)] transition-all"
                placeholder="John Smith"
                value={authorName}
                required
                onChange={(e) => setAuthorName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[0.65rem] uppercase tracking-[0.2em] font-black block pl-1" style={{ color: "var(--t2)" }}>
                {t('reviews.review_title')}
              </label>
              <input
                className="w-full bg-[var(--bw1)] border border-[var(--bw2)] rounded-xl py-4 px-5 text-sm font-medium text-[var(--t1)] placeholder:text-[var(--t4)] focus:outline-none focus:border-[var(--g300)] transition-all"
                placeholder="An unforgettable experience!"
                value={title}
                required
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-8 space-y-2">
            <label className="text-[0.65rem] uppercase tracking-[0.2em] font-black block pl-1" style={{ color: "var(--t2)" }}>
              {t('reviews.your_review')}
            </label>
            <textarea
              className="w-full bg-[var(--bw1)] border border-[var(--bw2)] rounded-xl py-4 px-5 text-sm font-medium text-[var(--t1)] placeholder:text-[var(--t4)] focus:outline-none focus:border-[var(--g300)] transition-all resize-none min-h-[160px]"
              placeholder="Tell other travelers what you loved about this experience..."
              value={comment}
              required
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <div className="flex justify-end">
            <button 
              type="submit" 
              disabled={submitting}
              className="flex items-center gap-3 px-10 py-4 rounded-full text-[0.7rem] font-black tracking-[0.2em] uppercase transition-all hover:scale-[1.03] active:scale-95 disabled:opacity-50 shadow-xl"
              style={{ background: "linear-gradient(90deg, var(--g500), var(--g300))", color: "#06040A" }}
            >
              <Send size={15} />
              {submitting ? t('reviews.submitting') : t('reviews.submit_review')}
            </button>
          </div>
        </form>
      )}

      {/* ── Rating breakdown ── */}
      {reviews.length > 0 && (
        <div className="mb-8 p-5 rounded-2xl" style={{ background: "var(--s2)", border: "1px solid var(--bw2)" }}>
          <p className="text-[0.65rem] uppercase tracking-wider mb-4 font-semibold" style={{ color: "var(--t3)" }}>{t('reviews.rating_breakdown')}</p>
          <div className="space-y-2">
            {ratingCounts.map(({ star, count }) => (
              <div key={star} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16 flex-shrink-0">
                  <span className="text-[0.75rem] font-medium" style={{ color: "var(--t2)" }}>{star}</span>
                  <Star size={11} fill="var(--g300)" stroke="var(--g300)" />
                </div>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bw1)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: reviews.length ? `${(count / reviews.length) * 100}%` : "0%",
                      background: "linear-gradient(90deg, var(--g500), var(--g300))"
                    }}
                  />
                </div>
                <span className="text-[0.72rem] w-6 text-right" style={{ color: "var(--t3)" }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Review list ── */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 rounded-2xl" style={{ background: "var(--s2)", animation: "pulse 2s ease-in-out infinite" }} />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ background: "var(--s2)", border: "1.5px dashed var(--bw2)" }}>
          <Star size={32} className="mx-auto mb-3 opacity-25" style={{ color: "var(--g300)" }} />
          <p className="text-[0.9rem] font-medium" style={{ color: "var(--t1)" }}>{t('reviews.no_reviews')}</p>
          <p className="text-[0.8rem] mt-1" style={{ color: "var(--t4)" }}>{t('reviews.be_first')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="p-5 rounded-2xl transition-all hover:border-[rgba(212,150,42,0.25)]" style={{ background: "var(--s2)", border: "1px solid var(--bw2)" }}>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, var(--g500), var(--g300))", color: "#06040A" }}>
                    {review.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[0.85rem] font-semibold" style={{ color: "var(--t1)" }}>{review.authorName}</span>
                      {review.verified && (
                        <span className="flex items-center gap-1 text-[0.6rem] px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(110,231,160,0.12)", color: "#6EE7A0", border: "1px solid rgba(110,231,160,0.25)" }}>
                          <CheckCircle size={9} /> {t('reviews.verified')}
                        </span>
                      )}
                    </div>
                    <p className="text-[0.68rem]" style={{ color: "var(--t4)" }}>
                      {new Date(review.createdAt).toLocaleDateString(language === 'ar' ? 'ar-AE' : 'en-AE', { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-0.5 flex-shrink-0">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={12} fill={s <= review.rating ? "var(--g300)" : "none"} stroke={s <= review.rating ? "var(--g300)" : "var(--t4)"} />
                  ))}
                </div>
              </div>

              <h5 className="text-[0.88rem] font-semibold mb-1.5" style={{ color: "var(--t1)" }}>{review.title}</h5>
              <p className="text-[0.82rem] leading-relaxed" style={{ color: "var(--t2)" }}>{review.comment}</p>

              <div className="mt-4 flex items-center gap-2">
                <button 
                  onClick={() => handleHelpful(review._id)}
                  disabled={votedReviews.includes(review._id)}
                  className={`flex items-center gap-1.5 text-[0.68rem] px-4 py-2 rounded-full transition-all active:scale-95 group ${votedReviews.includes(review._id) ? 'opacity-80' : 'hover:bg-[var(--bw1)]'}`}
                  style={{ border: "1px solid var(--bw2)", color: votedReviews.includes(review._id) ? "var(--g300)" : "var(--t3)" }}
                >
                  <ThumbsUp size={11} className={votedReviews.includes(review._id) ? "text-[var(--g300)]" : "group-hover:text-[var(--g300)] transition-colors"} /> {t('reviews.helpful')} ({review.helpfulCount})
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
