import React from "react";
import { User, Mail, Phone, MapPin } from "lucide-react";
import { FormField } from "./BookingComponents";
import { BookingState } from "../../types";
import { useLanguage } from "../../context/LanguageContext";

interface Step3Props {
  booking: BookingState;
  onUpdate: (u: Partial<BookingState>) => void;
  errors: Record<string, string>;
}

export default function Step3GuestInfo({ booking, onUpdate, errors }: Step3Props) {
  const { t } = useLanguage();
  return (
    <div className="p-6 sm:p-8">
      <div className="mb-10 pb-4 border-b border-white/5">
        <p className="text-[0.65rem] tracking-[0.22em] uppercase font-semibold mb-1" style={{ color: "var(--g300)" }}>
          ✦ Step 03
        </p>
        <h3 className="fd text-xl font-medium">Primary Traveller Details</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        <div className="space-y-6">
          <FormField
            label={t('booking.full_name')}
            icon={<User size={13} />}
            type="text"
            placeholder={t('booking.placeholder_id')}
            value={booking.fullName}
            error={errors.fullName}
            onChange={(v) => onUpdate({ fullName: v })}
          />
          <FormField
            label={t('booking.email_address')}
            icon={<Mail size={13} />}
            type="email"
            placeholder={t('booking.placeholder_conf')}
            value={booking.email}
            error={errors.email}
            onChange={(v) => onUpdate({ email: v })}
          />
        </div>
        <div className="space-y-6">
          <FormField
            label={t('booking.phone_number')}
            icon={<Phone size={13} />}
            type="tel"
            placeholder="+971 -- --- ----"
            value={booking.phone}
            error={errors.phone}
            onChange={(v) => {
              const digits = v.replace(/\D/g, "").slice(0, 10);
              let formatted = digits;
              if (digits.length > 3 && digits.length <= 6) {
                formatted = `${digits.slice(0, 3)} ${digits.slice(3)}`;
              } else if (digits.length > 6) {
                formatted = `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
              }
              onUpdate({ phone: formatted });
            }}
          />
          <FormField
            label={t('booking.pickup_address')}
            icon={<MapPin size={13} />}
            type="text"
            placeholder={t('booking.placeholder_loc')}
            value={booking.pickupLocation || ""}
            error={errors.pickupLocation}
            onChange={(v) => onUpdate({ pickupLocation: v })}
          />
        </div>
      </div>
    </div>
  );
}
