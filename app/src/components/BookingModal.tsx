import { useEffect, useRef, useState } from 'react';
import { X, Calendar, Clock, MapPin, FileText, CreditCard, Check } from 'lucide-react';
import { bookingConfig, paymentConfig } from '../config';
import { createBooking } from '../lib/api';
import gsap from 'gsap';

import type { Artist } from '../config';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  artist: Artist | null;
  onBookingCreated?: () => Promise<void> | void;
}

const BookingModal = ({ isOpen, onClose, artist, onBookingCreated }: BookingModalProps) => {
  const [step, setStep] = useState<'booking' | 'payment' | 'success'>('booking');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [clientLocation, setClientLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingReference, setBookingReference] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const timeSlots = [
    '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM',
    '04:00 PM', '05:00 PM', '06:00 PM'
  ];

  useEffect(() => {
    if (isOpen) {
      gsap.fromTo(
        modalRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: 'power2.out' }
      );
      gsap.fromTo(
        contentRef.current,
        { scale: 0.9, y: 50, opacity: 0 },
        { scale: 1, y: 0, opacity: 1, duration: 0.4, ease: 'back.out(1.7)', delay: 0.1 }
      );
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    // Reset state when modal opens
    if (isOpen) {
      setStep('booking');
      setSelectedDate('');
      setSelectedTime('');
      setClientLocation('');
      setNotes('');
      setPaymentMethod('card');
      setBookingReference('');
      setErrorMessage('');
    }
  }, [isOpen]);

  const handleClose = () => {
    gsap.to(contentRef.current, {
      scale: 0.9,
      y: 50,
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in',
    });
    gsap.to(modalRef.current, {
      opacity: 0,
      duration: 0.3,
      delay: 0.1,
      ease: 'power2.in',
      onComplete: onClose,
    });
  };

  const handleProceedToPayment = () => {
    if (selectedDate && selectedTime && clientLocation) {
      setStep('payment');
    }
  };

  const handlePayment = async () => {
    if (!artist) return;

    setIsProcessing(true);
    setErrorMessage('');

    try {
      const response = await createBooking<{ id: string }>({
        artistId: artist.id,
        clientId: 'client-1',
        clientName: 'Maya Johnson',
        service: artist.specialty,
        date: selectedDate,
        time: selectedTime,
        location: clientLocation,
        notes,
      });

      setBookingReference(response.data.id.toUpperCase());
      await onBookingCreated?.();
      setIsProcessing(false);
      setStep('success');
    } catch (error) {
      setIsProcessing(false);
      setErrorMessage('We could not create the booking right now. Please try again.');
      console.error('Booking creation failed:', error);
    }
  };

  const bookingFee = artist ? artist.pricePerSession * 0.05 : 0;
  const totalAmount = artist ? artist.pricePerSession + bookingFee : 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (!isOpen || !artist) return null;

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm opacity-0"
      onClick={handleClose}
    >
      <div
        ref={contentRef}
        className="relative w-full max-w-lg bg-neutral-900 border border-white/10 overflow-hidden opacity-0 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative corner */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-pink/10 -translate-y-1/2 translate-x-1/2 rotate-45" />
        
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Artist Info Header */}
        <div className="p-6 border-b border-white/10 bg-neutral-800/50">
          <div className="flex items-center gap-4">
            <img
              src={artist.image}
              alt={artist.name}
              className="w-16 h-16 object-cover rounded-full border-2 border-pink"
            />
            <div>
              <h3 className="font-display font-bold text-lg text-white">{artist.name}</h3>
              <p className="font-body text-pink text-sm">{artist.specialty}</p>
              <p className="font-body text-white/50 text-xs">{artist.location}</p>
            </div>
          </div>
        </div>

        {/* Step 1: Booking Details */}
        {step === 'booking' && (
          <div className="p-6 space-y-5">
            <div className="text-center mb-6">
              <h2 className="font-display font-black text-xl text-white uppercase tracking-tight">
                {bookingConfig.title}
              </h2>
              <p className="font-body text-white/50 text-sm">{bookingConfig.subtitle}</p>
            </div>

            {/* Date Selection */}
            <div>
              <label className="flex items-center gap-2 font-body text-white/70 text-sm mb-2">
                <Calendar className="w-4 h-4 text-pink" />
                {bookingConfig.dateLabel}
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-black border border-white/10 px-4 py-3 font-body text-white focus:border-pink focus:outline-none transition-colors"
              />
            </div>

            {/* Time Selection */}
            <div>
              <label className="flex items-center gap-2 font-body text-white/70 text-sm mb-2">
                <Clock className="w-4 h-4 text-pink" />
                {bookingConfig.timeLabel}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`py-2 px-3 font-body text-xs border transition-all duration-300 ${
                      selectedTime === time
                        ? 'bg-pink text-black border-pink'
                        : 'bg-black text-white/70 border-white/10 hover:border-pink'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="flex items-center gap-2 font-body text-white/70 text-sm mb-2">
                <MapPin className="w-4 h-4 text-pink" />
                {bookingConfig.locationLabel}
              </label>
              <select
                value={clientLocation}
                onChange={(e) => setClientLocation(e.target.value)}
                className="w-full bg-black border border-white/10 px-4 py-3 font-body text-white focus:border-pink focus:outline-none transition-colors"
              >
                <option value="">Select your area</option>
                <option value="ikeja">Ikeja (Mainland)</option>
                <option value="yaba">Yaba (Mainland)</option>
                <option value="surulere">Surulere (Mainland)</option>
                <option value="lekki">Lekki (Island)</option>
                <option value="vi">Victoria Island</option>
                <option value="ikoyi">Ikoyi (Island)</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="flex items-center gap-2 font-body text-white/70 text-sm mb-2">
                <FileText className="w-4 h-4 text-pink" />
                {bookingConfig.notesLabel}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={bookingConfig.notesPlaceholder}
                rows={3}
                className="w-full bg-black border border-white/10 px-4 py-3 font-body text-white placeholder:text-white/30 focus:border-pink focus:outline-none transition-colors resize-none"
              />
            </div>

            {/* Price Summary */}
            <div className="bg-black/50 p-4 space-y-2">
              <div className="flex justify-between font-body text-sm">
                <span className="text-white/50">{bookingConfig.priceLabel}</span>
                <span className="text-white">{formatPrice(artist.pricePerSession)}</span>
              </div>
              <div className="flex justify-between font-body text-sm">
                <span className="text-white/50">{bookingConfig.bookingFeeLabel}</span>
                <span className="text-white">{formatPrice(bookingFee)}</span>
              </div>
              <div className="border-t border-white/10 pt-2 flex justify-between font-display font-bold">
                <span className="text-white">{bookingConfig.totalLabel}</span>
                <span className="text-pink">{formatPrice(totalAmount)}</span>
              </div>
            </div>

            <div className="border border-pink/30 bg-pink/10 p-4">
              <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-pink">
                Client protection
              </p>
              <p className="mt-2 font-body text-sm text-white/70">
                Your payment stays on hold until the artist accepts. If the artist rejects or cancels,
                your refund is triggered and we can help rematch you.
              </p>
            </div>

            {/* Proceed Button */}
            <button
              onClick={handleProceedToPayment}
              disabled={!selectedDate || !selectedTime || !clientLocation}
              className="w-full bg-pink text-black font-display font-bold text-sm uppercase tracking-wider py-4 hover:bg-white transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <CreditCard className="w-5 h-5" />
              {bookingConfig.bookButtonText}
            </button>
          </div>
        )}

        {/* Step 2: Payment */}
        {step === 'payment' && (
          <div className="p-6 space-y-5">
            <div className="text-center mb-6">
              <h2 className="font-display font-black text-xl text-white uppercase tracking-tight">
                {paymentConfig.title}
              </h2>
              <p className="font-body text-white/50 text-sm">{paymentConfig.subtitle}</p>
            </div>

            {/* Payment Method Tabs */}
            <div className="flex gap-2 mb-4">
              {bookingConfig.paymentMethods.map((method) => (
                <button
                  key={method.name}
                  onClick={() => setPaymentMethod(method.icon)}
                  className={`flex-1 py-3 px-2 font-body text-xs uppercase tracking-wider border transition-all duration-300 ${
                    paymentMethod === method.icon
                      ? 'bg-pink text-black border-pink'
                      : 'bg-black text-white/50 border-white/10 hover:border-pink'
                  }`}
                >
                  {method.name}
                </button>
              ))}
            </div>

            {/* Card Payment Form */}
            {paymentMethod === 'card' && (
              <div className="space-y-4">
                <div>
                  <label className="font-body text-white/70 text-sm mb-2 block">
                    {paymentConfig.cardNumberLabel}
                  </label>
                  <input
                    type="text"
                    placeholder={paymentConfig.cardNumberPlaceholder}
                    className="w-full bg-black border border-white/10 px-4 py-3 font-body text-white placeholder:text-white/30 focus:border-pink focus:outline-none transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-body text-white/70 text-sm mb-2 block">
                      {paymentConfig.expiryLabel}
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full bg-black border border-white/10 px-4 py-3 font-body text-white placeholder:text-white/30 focus:border-pink focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="font-body text-white/70 text-sm mb-2 block">
                      {paymentConfig.cvvLabel}
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full bg-black border border-white/10 px-4 py-3 font-body text-white placeholder:text-white/30 focus:border-pink focus:outline-none transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-body text-white/70 text-sm mb-2 block">
                    {paymentConfig.nameLabel}
                  </label>
                  <input
                    type="text"
                    placeholder={paymentConfig.namePlaceholder}
                    className="w-full bg-black border border-white/10 px-4 py-3 font-body text-white placeholder:text-white/30 focus:border-pink focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Bank Transfer */}
            {paymentMethod === 'bank' && (
              <div className="bg-black/50 p-4 text-center space-y-3">
                <p className="font-body text-white/70 text-sm">{paymentConfig.bankTransferText}</p>
                <div className="space-y-1">
                  <p className="font-display font-bold text-white text-lg">{paymentConfig.accountNumber}</p>
                  <p className="font-body text-pink">{paymentConfig.accountName}</p>
                  <p className="font-body text-white/50 text-sm">{paymentConfig.bankName}</p>
                </div>
              </div>
            )}

            {/* USSD */}
            {paymentMethod === 'ussd' && (
              <div className="bg-black/50 p-4 text-center space-y-3">
                <p className="font-body text-white/70 text-sm">Dial the code below:</p>
                <p className="font-display font-bold text-white text-xl">{paymentConfig.ussdCode}</p>
                <p className="font-body text-white/50 text-xs">Replace Amount with {formatPrice(totalAmount)}</p>
              </div>
            )}

            {/* Total */}
            <div className="bg-pink/10 border border-pink/30 p-4">
              <div className="flex justify-between items-center">
                <span className="font-body text-white/70">Total to Pay</span>
                <span className="font-display font-black text-2xl text-pink">{formatPrice(totalAmount)}</span>
              </div>
              <p className="mt-2 font-body text-xs text-white/55">
                This is an authorization hold first. Capture happens only after artist acceptance.
              </p>
            </div>

            {/* Pay Button */}
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full bg-pink text-black font-display font-bold text-sm uppercase tracking-wider py-4 hover:bg-white transition-colors duration-300 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  {paymentConfig.payButtonText} {formatPrice(totalAmount)}
                </>
              )}
            </button>

            <p className="text-center font-body text-white/30 text-xs">
              {paymentConfig.secureText}
            </p>
            {errorMessage ? (
              <p className="text-center font-body text-sm text-red-400">{errorMessage}</p>
            ) : null}
          </div>
        )}

        {/* Step 3: Success */}
        {step === 'success' && (
          <div className="p-6 text-center">
            <div className="w-20 h-20 bg-pink rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-black" />
            </div>
            <h2 className="font-display font-black text-2xl text-white uppercase tracking-tight mb-2">
              Request sent
            </h2>
            <p className="font-body text-white/60 mb-6">
              Your request is with the artist now. Payment is on hold until acceptance, and a rejection
              or artist-side cancellation will trigger protection for you.
            </p>
            
            <div className="bg-black/50 p-4 mb-6 text-left">
              <p className="font-body text-white/50 text-sm mb-1">Booking Reference</p>
              <p className="font-display font-bold text-white text-lg">
                GLOW-{bookingReference || 'PENDING'}
              </p>
            </div>

            <button
              onClick={handleClose}
              className="w-full bg-pink text-black font-display font-bold text-sm uppercase tracking-wider py-4 hover:bg-white transition-colors duration-300"
            >
              Done
            </button>
          </div>
        )}

        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 w-16 h-16 border-l-2 border-b-2 border-pink/20" />
      </div>
    </div>
  );
};

export default BookingModal;
