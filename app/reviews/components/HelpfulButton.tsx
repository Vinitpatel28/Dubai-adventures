"use client";

import { useState, useEffect } from "react";
import { ThumbsUp } from "lucide-react";

interface Props {
  reviewId: string;
  initialCount: number;
}

export default function HelpfulButton({ reviewId, initialCount }: Props) {
  const [voted, setVoted] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user has already voted for this review
    const hasVoted = localStorage.getItem(`voted_review_${reviewId}`);
    if (hasVoted) setVoted(true);
  }, [reviewId]);

  const handleVote = async () => {
    if (voted || loading) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setCount(data.review.helpfulCount);
        setVoted(true);
        localStorage.setItem(`voted_review_${reviewId}`, 'true');
      }
    } catch (e) {
      console.error("Helpful vote error", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleVote}
      disabled={voted || loading}
      className={`flex items-center gap-3 text-[0.65rem] uppercase tracking-widest font-black transition-all ${voted ? 'text-[var(--g300)]' : 'hover:text-[var(--g200)]'}`} 
      style={{ color: voted ? "var(--g300)" : "var(--t4)" }}
    >
      <ThumbsUp size={14} className={voted ? "text-[var(--g300)]" : "text-[var(--t3)]"} />
      <span className="helpful-count">{count} people found this helpful</span>
    </button>
  );
}
