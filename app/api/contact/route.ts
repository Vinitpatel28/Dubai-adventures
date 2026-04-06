import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';
import { sendNewsletterAdminAlert, sendNewsletterWelcomeEmail } from '@/lib/email';

// Simple model for contact messages
const ContactSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  type: String,
  message: String,
  createdAt: { type: Date, default: Date.now },
  status: { type: String, default: 'unread' }
});

const Contact = mongoose.models.Contact || mongoose.model('Contact', ContactSchema);

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { name, email, phone, type, message } = body;
    
    // Security: Only save specific fields, ignoring any injected metadata
    const newMessage = await Contact.create({
      name,
      email,
      phone,
      type,
      message,
      status: 'unread' // Force reset
    });
    
    // If it's a newsletter sub, send emails
    if (body.type === 'Newsletter') {
      await Promise.all([
        sendNewsletterAdminAlert(body),
        sendNewsletterWelcomeEmail(body.email)
      ]);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Your message has been received by our concierge.',
      id: newMessage._id
    }, { status: 201 });
  } catch (error: any) {
    console.error('Contact API Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to transmit message' }, { status: 500 });
  }
}
