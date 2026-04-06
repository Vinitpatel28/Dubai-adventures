import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
  siteName: { type: String, default: 'Dubai Adventures' },
  siteDescription: { type: String, default: 'Premium Luxury Desert Safaris & Tours in Dubai' },
  contactEmail: { type: String, default: 'bookings@dubaiadventures.com' },
  contactPhone: { type: String, default: '+971 50 123 4567' },
  address: { type: String, default: 'Downtown Dubai, UAE' },
  socialLinks: {
    instagram: { type: String, default: '' },
    facebook: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    twitter: { type: String, default: '' },
    youtube: { type: String, default: '' }
  },
  currency: { type: String, default: 'AED' },
  taxRate: { type: Number, default: 5 },
  bookingConfirmationEmail: { type: Boolean, default: true },
  maintenanceMode: { type: Boolean, default: false },
  heroImages: {
    type: [String], default: [
      "/images/hero_bg_4k_1772860004560.png",
      "/images/dune_bashing_4k_1772860044787.png",
      "/images/morning_safari_4k_1772860024785.png",
      "/images/red_dunes_atv_4k_1772860060049.png",
      "/images/deluxe_safari_4k_1772860076185.png",
      "/images/balloon_4k_1772860090220.png",
      "/images/superyacht_4k_1772860109758.png",
      "/images/buggy_4k_1772860128952.png"
    ]
  },
  heroVideoUrl: { type: String, default: '' },
  heroVideoEnabled: { type: Boolean, default: false },
  contactPage: {
    heroImage: { type: String, default: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=2000' },
    title: { type: String, default: 'Contact Dubai Adventures' },
    subtitle: { type: String, default: 'Whether you are planning a private luxury desert safari or need assistance with your booking, our 24/7 dedicated support team is here to assist you.' },
    cards: {
      type: Array,
      default: [
        { title: 'Booking Helpline', icon: 'Phone', value: '+971 4 123 4567', desc: '24/7 Support for existing bookings', link: 'tel:+97141234567' },
        { title: 'WhatsApp Connect', icon: 'MessageCircle', value: '+971 50 987 6543', desc: 'Average response time: 2 minutes', link: 'https://wa.me/971509876543' },
        { title: 'Official Email', icon: 'Mail', value: 'hello@dubaiadventure.com', desc: 'Concierge & Group Enquiries', link: 'mailto:hello@dubaiadventure.com' },
        { title: 'Corporate HQ', icon: 'MapPin', value: 'Business Bay, Dubai', desc: 'Opus Tower, Suite 402', link: 'https://goo.gl/maps/xyz' }
      ]
    },
    operatingHours: {
      type: Array,
      default: [
        { days: "Mon - Sat", hours: "09:00 AM - 10:00 PM" },
        { days: "Sunday", hours: "09:00 AM - 01:00 PM" },
        { days: "Digital Support", hours: "24 / 7 / 365" }
      ]
    },
    safetyContent: {
      text: { type: String, default: 'All our vehicles are RTA approved and drivers are DTCM certified. We maintain the highest safety standards in the UAE.' },
      tags: { type: [String], default: ['Certified Drivers', 'Fully Insured', '24/7 Monitoring'] }
    },
    location: {
      address: { type: String, default: 'Opus Tower, Dubai' },
      mapLink: { type: String, default: 'https://goo.gl/maps/xyz' },
      image: { type: String, default: 'https://images.unsplash.com/photo-1544949110-3882f054817a?q=80&w=1200' }
    }
  },
  admin: {
    name: { type: String, default: 'Executive Admin' },
    photo: { type: String, default: '' },
    email: { type: String, default: 'concierge@dubaiadventures.com' },
    phone: { type: String, default: '+971 50 111 2222' }
  },
  legalUrls: {
    privacy: { type: String, default: '#' },
    terms: { type: String, default: '#' },
    cookies: { type: String, default: '#' }
  }
}, { timestamps: true });

if (mongoose.models && mongoose.models.Settings) {
  delete mongoose.models.Settings;
}

export default mongoose.model('Settings', SettingsSchema);
// Triggering model refresh for dynamic hero images support
