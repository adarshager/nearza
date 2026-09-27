/**
 * Nearza — Merchant Shop Profile & Settings
 * Complete store profile management:
 * - Shop name, description, address, city, state, pincode
 * - Geolocation coordinates with browser location auto-detect
 * - Phone and WhatsApp contact numbers with normalization
 * - Full 7-day interactive opening hours configuration
 * - Store logo and cover banner with upload & preview
 * - Verification status tracker & criteria
 */

import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Store,
  MapPin,
  Phone,
  MessageSquare,
  Upload,
  Save,
  CheckCircle,
  Clock,
  Locate,
  AlertCircle,
  ShieldCheck,
  Building2,
  Calendar,
  Image as ImageIcon,
} from 'lucide-react';
import { merchantService } from '../../services/merchant';
import { useToast } from '../../contexts/ToastContext';
import { useLocation } from '../../contexts/LocationContext';
import { normalizePhoneNumber, formatPhoneForDisplay } from '../../utils/merchant-contact';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

const DEFAULT_HOURS = {
  open: '09:00',
  close: '21:00',
  is_closed: false,
};

export function MerchantShopManage() {
  const toast = useToast();
  const outletCtx = useOutletContext();
  const { latitude: userLat, longitude: userLng } = useLocation() || {};

  const [hasShop, setHasShop] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateVal, setStateVal] = useState('Karnataka');
  const [pincode, setPincode] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('pending');

  // Operating Hours State
  const [operatingHours, setOperatingHours] = useState({
    monday: { open: '09:00', close: '21:00', is_closed: false },
    tuesday: { open: '09:00', close: '21:00', is_closed: false },
    wednesday: { open: '09:00', close: '21:00', is_closed: false },
    thursday: { open: '09:00', close: '21:00', is_closed: false },
    friday: { open: '09:00', close: '21:00', is_closed: false },
    saturday: { open: '09:00', close: '21:00', is_closed: false },
    sunday: { open: '10:00', close: '19:00', is_closed: false },
  });

  useEffect(() => {
    async function loadShop() {
      try {
        const data = await merchantService.getShop();
        if (data && data.id) {
          setHasShop(true);
          setName(data.name || '');
          setDescription(data.description || '');
          setAddress(data.address || '');
          setCity(data.city || '');
          setStateVal(data.state || 'Karnataka');
          setPincode(data.pincode || '');
          setLatitude(data.latitude || '');
          setLongitude(data.longitude || '');
          setPhone(data.phone || '');
          setWhatsappNumber(data.whatsapp_number || '');
          setLogoUrl(data.logo_url || '');
          setCoverImageUrl(data.cover_image_url || '');
          setVerificationStatus(data.verification_status || 'pending');

          if (data.operating_hours && typeof data.operating_hours === 'object') {
            setOperatingHours((prev) => ({
              ...prev,
              ...data.operating_hours,
            }));
          }
        }
      } catch {
        setHasShop(false);
      } finally {
        setIsLoading(false);
      }
    }
    loadShop();
  }, []);

  // Detect and populate coordinates using current browser location
  const handleDetectLocation = () => {
    if (userLat && userLng) {
      setLatitude(String(userLat));
      setLongitude(String(userLng));
      toast.success('Coordinates populated from current location!');
      return;
    }

    if (navigator?.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(String(pos.coords.latitude));
          setLongitude(String(pos.coords.longitude));
          toast.success('Coordinates populated from current GPS location!');
        },
        () => {
          toast.error('Unable to detect location. Please enter coordinates manually.');
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser.');
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    try {
      const res = await merchantService.uploadImage(file, 'logo');
      const uploadedUrl = res.url || res.data?.url;
      if (!uploadedUrl) throw new Error('No image URL returned from upload');
      setLogoUrl(uploadedUrl);
      toast.success('Store logo uploaded & optimized successfully!');
      if (outletCtx?.refreshShop) {
        outletCtx.refreshShop();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Logo upload failed. Please try another image.');
    } finally {
      setIsUploadingLogo(false);
      e.target.value = '';
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    try {
      const res = await merchantService.uploadImage(file, 'cover');
      const uploadedUrl = res.url || res.data?.url;
      if (!uploadedUrl) throw new Error('No image URL returned from upload');
      setCoverImageUrl(uploadedUrl);
      toast.success('Store banner uploaded & optimized successfully!');
      if (outletCtx?.refreshShop) {
        outletCtx.refreshShop();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Cover banner upload failed. Please try another image.');
    } finally {
      setIsUploadingCover(false);
      e.target.value = '';
    }
  };

  const handleDayChange = (dayKey, field, value) => {
    setOperatingHours((prev) => ({
      ...prev,
      [dayKey]: {
        ...(prev[dayKey] || DEFAULT_HOURS),
        [field]: value,
      },
    }));
  };

  const applyDefaultHoursToAll = () => {
    const updated = {};
    DAYS_OF_WEEK.forEach((d) => {
      updated[d.key] = { open: '09:00', close: '21:00', is_closed: d.key === 'sunday' };
    });
    setOperatingHours(updated);
    toast.info('Applied standard 9 AM - 9 PM schedule (Sun Closed).');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.warning('Please enter a shop name.');
      return;
    }
    if (!address.trim() || !city.trim() || !pincode.trim()) {
      toast.warning('Please provide a complete store address.');
      return;
    }
    if (!phone.trim()) {
      toast.warning('Please enter a contact phone number.');
      return;
    }

    // Validate phone numbers
    const normalizedPhone = normalizePhoneNumber(phone);
    if (!normalizedPhone) {
      toast.error('Invalid store phone number. Please enter a valid 10-digit Indian phone number.');
      return;
    }

    let normalizedWa = '';
    if (whatsappNumber.trim()) {
      normalizedWa = normalizePhoneNumber(whatsappNumber);
      if (!normalizedWa) {
        toast.error('Invalid WhatsApp number. Please enter a valid phone number or leave blank.');
        return;
      }
    }

    setIsSubmitting(true);
    const payload = {
      name: name.trim(),
      description: description.trim(),
      address: address.trim(),
      city: city.trim(),
      state: stateVal.trim(),
      pincode: pincode.trim(),
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      phone: normalizedPhone,
      whatsapp_number: normalizedWa,
      logo_url: logoUrl.trim(),
      cover_image_url: coverImageUrl.trim(),
      operating_hours: operatingHours,
    };

    try {
      let savedShop;
      if (hasShop) {
        savedShop = await merchantService.updateShop(payload);
        toast.success('Shop profile updated successfully!');
      } else {
        savedShop = await merchantService.createShop(payload);
        setHasShop(true);
        toast.success('Shop profile registered on Nearza!');
      }

      if (outletCtx?.refreshShop) {
        outletCtx.refreshShop();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save shop profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-96 rounded-3xl" />
          <Skeleton className="h-96 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {hasShop ? 'Shop Profile & Settings' : 'Register Your Shop'}
            </h1>
            {hasShop && (
              <Badge
                variant={verificationStatus === 'approved' ? 'success' : 'warning'}
                size="sm"
                dot
              >
                {verificationStatus === 'approved' ? 'Verified Store' : 'Pending Verification'}
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage physical location, contact channels, opening hours, and branding
          </p>
        </div>

        {hasShop && (
          <Button
            type="submit"
            form="shop-manage-form"
            variant="primary"
            size="md"
            icon={Save}
            isLoading={isSubmitting}
          >
            Save Changes
          </Button>
        )}
      </div>

      <form id="shop-manage-form" onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Column: Details, Address, Hours */}
          <div className="lg:col-span-8 space-y-6">
            {/* 1. Basic Store Info */}
            <Card className="p-6 bg-white border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
                <Store className="w-4 h-4 text-sky-600" /> Store Identity
              </h2>

              <div className="space-y-4">
                <Input
                  label="Shop Name *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sri Krishna Supermarket"
                  required
                />

                <Textarea
                  label="Store Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the categories, brands, and specialties available at your store..."
                  rows={3}
                />
              </div>
            </Card>

            {/* 2. Physical Location & Coordinates */}
            <Card className="p-6 bg-white border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-sky-600" /> Physical Location
                </h2>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  icon={Locate}
                  onClick={handleDetectLocation}
                >
                  Detect Location
                </Button>
              </div>

              <div className="space-y-4">
                <Input
                  label="Full Street Address *"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. #42, 100 Feet Road, 4th Block, Indiranagar"
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="City *"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Bengaluru"
                    required
                  />

                  <Input
                    label="State *"
                    value={stateVal}
                    onChange={(e) => setStateVal(e.target.value)}
                    placeholder="e.g. Karnataka"
                    required
                  />

                  <Input
                    label="Pincode *"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="e.g. 560038"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <Input
                    label="Latitude (for Navigation)"
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="e.g. 12.9716"
                  />

                  <Input
                    label="Longitude (for Navigation)"
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="e.g. 77.5946"
                  />
                </div>
              </div>
            </Card>

            {/* 3. Contact & Direct Communication Channels */}
            <Card className="p-6 bg-white border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
                <Phone className="w-4 h-4 text-sky-600" /> Communication Channels
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Store Phone (Dialer / Calls) *"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 6363984209"
                    required
                  />
                  {phone && (
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Dialer format: {formatPhoneForDisplay(phone)}
                    </span>
                  )}
                </div>

                <div>
                  <Input
                    label="WhatsApp Number (Customer Inquiries)"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="e.g. 6363984209 (defaults to phone if empty)"
                  />
                  {whatsappNumber && (
                    <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
                      WhatsApp format: {formatPhoneForDisplay(whatsappNumber)}
                    </span>
                  )}
                </div>
              </div>
            </Card>

            {/* 4. Opening Hours Configuration */}
            <Card className="p-6 bg-white border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-sky-600" /> Opening Hours
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Inform nearby customers when your store is open for physical shopping
                  </p>
                </div>

                <button
                  type="button"
                  onClick={applyDefaultHoursToAll}
                  className="text-xs font-semibold text-sky-600 hover:text-sky-700 underline cursor-pointer"
                >
                  Apply 9 AM – 9 PM Preset
                </button>
              </div>

              <div className="space-y-2.5">
                {DAYS_OF_WEEK.map((day) => {
                  const schedule = operatingHours[day.key] || DEFAULT_HOURS;
                  const isClosed = Boolean(schedule.is_closed);

                  return (
                    <div
                      key={day.key}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-50/70 border border-slate-100"
                    >
                      <div className="w-28 font-bold text-xs text-slate-800">
                        {day.label}
                      </div>

                      <div className="flex items-center gap-3 flex-1 justify-end">
                        <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isClosed}
                            onChange={(e) => handleDayChange(day.key, 'is_closed', e.target.checked)}
                            className="rounded border-slate-300 text-sky-600"
                          />
                          <span>Closed</span>
                        </label>

                        {!isClosed && (
                          <div className="flex items-center gap-2 text-xs">
                            <input
                              type="time"
                              value={schedule.open || '09:00'}
                              onChange={(e) => handleDayChange(day.key, 'open', e.target.value)}
                              className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
                            />
                            <span className="text-slate-400">to</span>
                            <input
                              type="time"
                              value={schedule.close || '21:00'}
                              onChange={(e) => handleDayChange(day.key, 'close', e.target.value)}
                              className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Side Column: Branding, Verification, Actions */}
          <div className="lg:col-span-4 space-y-6">
            {/* Store Branding (Logo & Banner) */}
            <Card className="p-6 bg-white border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
                <ImageIcon className="w-4 h-4 text-sky-600" /> Store Branding
              </h2>

              <div className="space-y-5">
                {/* Store Logo */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Store Logo
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0 overflow-hidden relative shadow-2xs">
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt="Store logo"
                          key={logoUrl}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <Building2 className={`w-7 h-7 text-sky-500 ${logoUrl ? 'hidden' : ''}`} />
                    </div>

                    <div className="flex-1">
                      <label className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer transition-colors ${isUploadingLogo ? 'opacity-60 pointer-events-none' : ''}`}>
                        <Upload className={`w-3.5 h-3.5 ${isUploadingLogo ? 'animate-bounce' : ''}`} />
                        <span>{isUploadingLogo ? 'Processing & Uploading...' : 'Upload Logo'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          disabled={isUploadingLogo}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[10px] text-slate-400 mt-1">Upload any normal image — Nearza will automatically optimize and crop it.</p>
                    </div>
                  </div>
                </div>

                {/* Cover Banner */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Store Front / Cover Image
                  </label>
                  {coverImageUrl && (
                    <div className="w-full h-28 sm:h-32 rounded-xl overflow-hidden mb-2 bg-slate-50 border border-slate-100 relative shadow-2xs">
                      <img
                        src={coverImageUrl}
                        alt="Store cover"
                        key={coverImageUrl}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  <label className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer transition-colors w-full justify-center ${isUploadingCover ? 'opacity-60 pointer-events-none' : ''}`}>
                    <Upload className={`w-3.5 h-3.5 ${isUploadingCover ? 'animate-bounce' : ''}`} />
                    <span>{isUploadingCover ? 'Processing & Uploading...' : 'Upload Cover Banner'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      disabled={isUploadingCover}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[10px] text-slate-400 mt-1 text-center">Upload any normal image — Nearza will automatically optimize and crop it to banner format.</p>
                </div>
              </div>
            </Card>

            {/* Verification Status Card */}
            <Card className="p-6 bg-white border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                <ShieldCheck className="w-4 h-4 text-sky-600" /> Verification Status
              </h2>

              <div className="mb-4">
                {verificationStatus === 'approved' ? (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs mb-1">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Verified Merchant Store</span>
                    </div>
                    <p className="text-[11px] text-emerald-700 leading-relaxed">
                      Your store has been verified by the Nearza administration. Verified badges appear in local search results and build buyer trust.
                    </p>
                  </div>
                ) : verificationStatus === 'pending' ? (
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
                    <div className="flex items-center gap-2 text-amber-800 font-bold text-xs mb-1">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Pending Verification Review</span>
                    </div>
                    <p className="text-[11px] text-amber-700 leading-relaxed">
                      Your store details are under review. You can continue publishing products and managing live inventory while our team verifies your merchant details.
                    </p>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200">
                    <div className="flex items-center gap-2 text-rose-800 font-bold text-xs mb-1">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Action Required</span>
                    </div>
                    <p className="text-[11px] text-rose-700 leading-relaxed">
                      Status: {verificationStatus}. Please ensure accurate physical store address and valid phone numbers.
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2 text-[11px] text-slate-500 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-sky-600" />
                  <span>Physical shop address verified</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-sky-600" />
                  <span>Verified phone & WhatsApp contact</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-sky-600" />
                  <span>Eligible for Nearza Best Price Badge</span>
                </div>
              </div>
            </Card>

            {/* Bottom Save Action */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              icon={Save}
              isLoading={isSubmitting}
              className="w-full shadow-md shadow-sky-500/20"
            >
              {hasShop ? 'Save Shop Profile' : 'Register Store'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default MerchantShopManage;
