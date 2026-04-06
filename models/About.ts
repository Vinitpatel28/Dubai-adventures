import mongoose from 'mongoose';

const AboutSchema = new mongoose.Schema({
  hero: {
    title: { type: String, default: 'Redefining Arabian Luxury Adventures' },
    subtitle: { type: String, default: 'From humble beginnings to becoming Dubai\'s premier destination management leader...' },
    image: { type: String, default: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=2000' }
  },
  heritage: {
    title: { type: String, default: 'A Legacy of Passion' },
    description: { type: String, default: 'At Dubai Adventures, we believe that true travel is about more than just checking off landmarks...' },
    image: { type: String, default: 'https://images.unsplash.com/photo-1544949589-9e8c47f7d983?q=80&w=1200' }
  },
  stats: [
    { label: String, value: String }
  ],
  values: [
    {
      title: String,
      desc: String,
      iconName: String // Lucide icon name or index
    }
  ],
  fleet: {
    title: { type: String, default: 'Elite Fleet, Unmatched Standards' },
    description: { type: String, default: 'Whether it\'s our fleet of custom-modified 4x4 Land Cruisers...' },
    points: [{ type: String }],
    gallery: [{ type: String }]
  }
}, { timestamps: true });

export default mongoose.models.About || mongoose.model('About', AboutSchema);
