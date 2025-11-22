import React, { useState } from 'react';
import { X, DollarSign, User, Phone, MapPin, CheckCircle } from 'lucide-react';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  designContext: {
    style: string;
    climate: string;
    prompt: string;
  };
}

export const QuoteModal: React.FC<QuoteModalProps> = ({
  isOpen,
  onClose,
  designContext
}) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    budget: '10k-25k'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate network delay
    setTimeout(() => {
      const payload = {
        customer: formData,
        designContext: designContext,
        timestamp: new Date().toISOString()
      };

      console.log("=== NEW QUOTE REQUEST ===");
      console.log(JSON.stringify(payload, null, 2));
      console.log("=========================");

      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <h3 className="text-lg font-bold text-brand-800 flex items-center gap-2">
            {isSuccess ? <CheckCircle className="text-brand-lime" /> : <DollarSign className="text-brand-600" />}
            {isSuccess ? 'Request Received' : 'Get a Quote'}
          </h3>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1 hover:bg-stone-200 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {isSuccess ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle size={32} />
              </div>
              <h4 className="text-2xl font-bold text-brand-900">Thanks, {formData.name.split(' ')[0]}!</h4>
              <p className="text-stone-600 max-w-xs mx-auto">
                An OnThyme Landscapes Team Member will review your design and call you shortly to discuss your project.
              </p>
              <button 
                onClick={onClose}
                className="mt-6 px-6 py-2 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <p className="text-stone-600 text-sm mb-6">
                Ready to make this design a reality? Provide your details below and we'll prepare an estimate based on the <strong>{designContext.style}</strong> style.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="name" className="text-xs font-bold text-stone-500 uppercase tracking-wider">Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                      <input
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-brand-500/20 outline-none"
                        placeholder="Your Name"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="phone" className="text-xs font-bold text-stone-500 uppercase tracking-wider">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                      <input
                        name="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-brand-500/20 outline-none"
                        placeholder="0400 000 000"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="address" className="text-xs font-bold text-stone-500 uppercase tracking-wider">Property Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                    <input
                      name="address"
                      type="text"
                      required
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-brand-500/20 outline-none"
                      placeholder="123 Garden Street..."
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="budget" className="text-xs font-bold text-stone-500 uppercase tracking-wider">Estimated Budget</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                    <select
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-brand-500/20 outline-none appearance-none bg-white"
                    >
                      <option value="under-5k">Under $5k (DIY / Consultation)</option>
                      <option value="5k-10k">$5k - $10k</option>
                      <option value="10k-25k">$10k - $25k</option>
                      <option value="25k-50k">$25k - $50k</option>
                      <option value="50k+">$50k+</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-brand-800 hover:bg-brand-900 text-white font-bold py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Sending Request...' : 'Submit Quote Request'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
