import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Star, CheckCircle, ThumbsUp, Medal, Quote, ArrowRight, Heart, Sparkles } from "lucide-react";
import Link from "next/link";
import HelpfulButton from "./components/HelpfulButton";
import dbConnect from "@/lib/mongodb";
import Review from "@/models/Review";
import Category from "@/models/Category";

export const revalidate = 300; // Cache for 5 minutes

async function getPageData() {
  await dbConnect();
  const [reviewsData, categoriesData] = await Promise.all([
    Review.find({}).sort({ createdAt: -1 }).lean(),
    Category.find().sort({ order: 1 }).lean()
  ]);
  
  return {
    reviews: reviewsData ? JSON.parse(JSON.stringify(reviewsData)) : [],
    categories: categoriesData ? JSON.parse(JSON.stringify(categoriesData)) : []
  };
}

export default async function ReviewsPage() {
  const { reviews, categories } = await getPageData();

  const avgRating = reviews.length
    ? reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length
    : 4.9;

  return (
    <main className="min-h-screen relative overflow-hidden" style={{ backgroundColor: "var(--s0)" }}>
      
      {/* ─── Global Cinematic Ambient Background ─── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute inset-0 bg-[url('/images/hero_bg_4k_1772860004560.png')] bg-cover bg-fixed bg-center opacity-0 dark:opacity-[0.20] mix-blend-luminosity grayscale-[30%] transition-opacity duration-500" />
         
         <div className="absolute top-0 inset-x-0 h-[80vh] bg-gradient-to-b from-[#D4962A]/5 dark:from-[#D4962A]/20 via-transparent to-transparent opacity-100" />
         
         <div className="absolute top-[-20%] right-[-10%] w-[100vw] max-w-[1200px] h-[100vw] max-h-[1200px] rounded-full bg-gradient-to-bl from-[#D4962A]/5 dark:from-[#D4962A]/30 to-transparent blur-[120px] opacity-100" />
         
         <div className="absolute bottom-[-10%] left-[-10%] w-[80vw] max-w-[1000px] h-[80vw] max-h-[1000px] rounded-full bg-gradient-to-tr from-[#ECC86A]/5 dark:from-[#ECC86A]/30 to-transparent blur-[150px] opacity-100" />
         
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,var(--s0)_90%)] opacity-0 dark:opacity-95 transition-opacity duration-500" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar hasBooking={false} categories={categories} forceDark={false} />

        {/* Hero Section */}
        <section className="pt-40 pb-20 px-6 relative">
        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-8">
          <div className="flex justify-center mb-6">
            <div className="px-5 py-2 rounded-full bg-[var(--g300)]/10 border border-[var(--g300)]/20 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-1000">
              <Sparkles size={14} className="text-[var(--g200)]" />
              <span className="text-[0.65rem] uppercase tracking-[0.25em] font-black gold-text">Guest Chronicles</span>
            </div>
          </div>

          <h1 className="text-4xl md:text-7xl fd font-bold tracking-tight leading-[1.1]" style={{ color: "var(--t1)" }}>
            Our Reputation <br />
            <em className="gold-text not-italic font-light">In Their Words</em>
          </h1>

          <p className="text-[0.95rem] max-w-2xl mx-auto leading-relaxed" style={{ color: "var(--t3)" }}>
            With over 10,000 পাঁচ-তারকা (five-star) experiences curated, discover why Dubai Adventures remains the choice for discerning desert explorers.
          </p>

          <div className="flex justify-center gap-12 pt-8">
            <div className="text-center">
              <div className="fd text-5xl font-light gold-text">{avgRating.toFixed(1)}</div>
              <div className="flex justify-center gap-0.5 my-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={14} fill={s <= Math.round(avgRating) ? "var(--g300)" : "none"} stroke="var(--g300)" />
                ))}
              </div>
              <p className="text-[0.6rem] uppercase tracking-[0.2em]" style={{ color: "var(--t4)" }}>Average Rating</p>
            </div>
            <div className="w-px h-16 bg-[var(--bw1)] self-center" />
            <div className="text-center">
              <div className="fd text-5xl font-light text-[var(--t1)]">{reviews.length}+</div>
              <div className="h-4 my-2" />
              <p className="text-[0.6rem] uppercase tracking-[0.2em]" style={{ color: "var(--t4)" }}>Verified Stories</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 px-6 border-y border-[var(--bw1)] mb-20">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-10 md:gap-24 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
          {["TripAdvisor Travelers Choice 2026", "Gold Service Award", "Eco-Tourism Certified", "Google Premium Partner"].map(b => (
             <div key={b} className="flex items-center gap-2 text-[0.6rem] uppercase tracking-widest font-black" style={{ color: "var(--t1)" }}>
               <Medal size={16} className="text-[var(--g300)]" />
               {b}
             </div>
          ))}
        </div>
      </section>

      {/* Main Reviews List */}
      <section className="py-20 px-6 relative">
        <div className="max-w-4xl mx-auto">
          {reviews.length === 0 ? (
            <div className="text-center py-40 rounded-[3rem] border-2 border-dashed border-[var(--bw2)]" style={{ background: "var(--s1)" }}>
              <div className="w-20 h-20 rounded-full bg-[var(--g300)]/10 flex items-center justify-center mx-auto mb-6">
                <Heart size={32} className="text-[var(--g300)] opacity-40" />
              </div>
              <h3 className="fd text-2xl text-[var(--t1)] mb-4">First Chapter Awaits</h3>
              <p className="text-[0.88rem] max-w-xs mx-auto mb-8" style={{ color: "var(--t3)" }}>
                We haven&apos;t published our chronicles for this season yet. Be the first to share your journey!
              </p>
              <Link href="/" className="btn-g px-8 py-3 inline-block">Start Your Adventure</Link>
            </div>
          ) : (
            <div className="space-y-10">
              {reviews.map((rev: any, i: number) => (
                <div 
                  key={rev._id} 
                  className="group relative p-8 md:p-12 rounded-[2.5rem] transition-all duration-700 hover:scale-[1.01] hover:shadow-[0_40px_100px_-20px_rgba(212,150,42,0.3)] overflow-hidden"
                  style={{ backgroundColor: "var(--s1)", backdropFilter: "blur(20px)", border: "1px solid var(--bw2)" }}
                >
                  <div className="absolute inset-0 bg-[var(--s2)] opacity-50 dark:opacity-20 pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-br from-[#D4962A]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0" />
                  
                  <Quote className="absolute top-10 right-10 text-[var(--g300)] opacity-[0.05] group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-700 z-0" size={80} />
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 relative z-10">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 rounded-[1.3rem] flex items-center justify-center text-2xl font-black text-[#06040A] shadow-lg group-hover:rotate-3 transition-transform duration-500"
                        style={{ background: "linear-gradient(135deg, var(--g500), var(--g300))" }}>
                        {rev.authorName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="text-[1.1rem] font-bold tracking-wide" style={{ color: "var(--t1)" }}>{rev.authorName}</span>
                          {rev.verified && (
                             <span className="flex items-center gap-1.5 text-[0.55rem] uppercase tracking-[0.2em] px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-black shadow-inner">
                               <CheckCircle size={10} /> Verified Guest
                             </span>
                          )}
                        </div>
                        <p className="text-[0.7rem] uppercase tracking-widest mt-1" style={{ color: "var(--t4)" }}>
                          {new Date(rev.createdAt).toLocaleDateString('en-AE', { month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={16} fill={s <= rev.rating ? "var(--g300)" : "none"} stroke="var(--g300)" />
                      ))}
                    </div>
                  </div>

                  <h3 className="fd text-xl md:text-2xl font-medium mb-4 leading-snug" style={{ color: "var(--t1)" }}>
                    &ldquo;{rev.title}&rdquo;
                  </h3>
                  <p className="text-[1rem] leading-relaxed italic" style={{ color: "var(--t2)" }}>
                    {rev.comment}
                  </p>

                  <div className="mt-10 pt-8 border-t flex items-center justify-between" style={{ borderColor: "var(--bw1)" }}>
                    <div className="flex items-center gap-3">
                      <HelpfulButton reviewId={rev._id} initialCount={rev.helpfulCount} />
                    </div>
                    <Link 
                      href={`/?activityId=${rev.activityId}#activities`}
                      className="text-[0.6rem] uppercase tracking-[0.2em] font-black gold-text flex items-center gap-2 transition-transform group-hover:translate-x-2"
                    >
                      View this experience <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto rounded-[3.5rem] p-12 text-center space-y-8 overflow-hidden relative" 
          style={{ background: "linear-gradient(135deg, var(--bw1), var(--s1))", border: "1px solid var(--bw2)" }}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--g200)]/10 blur-[100px] pointer-events-none" />
          <h2 className="fd text-3xl md:text-5xl font-light" style={{ color: "var(--t1)" }}>Ready to write <br /><em className="gold-text not-italic">Your Chapter?</em></h2>
          <p className="text-[0.9rem] max-w-sm mx-auto" style={{ color: "var(--t3)" }}>Book your signature experience today and join the elite ranks of our satisfied guests.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Link href="/" className="btn-g px-10 py-4 inline-block">Explore Adventures</Link>
            <Link href="/contact" className="px-10 py-4 rounded-full border border-[var(--bw2)] text-[0.75rem] font-black uppercase tracking-widest text-[var(--t1)] hover:bg-[var(--bw1)] transition-all inline-block">Contact Us</Link>
          </div>
        </div>
      </section>

        <Footer categories={categories} />
      </div>
    </main>
  );
}
