import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ShoppingBag, Star, ShieldCheck, Truck, Sparkles, ChevronRight, ChevronLeft,
  Check, RefreshCw, ZoomIn, Maximize2, X, Play, Pause, RotateCw, Compass
} from "lucide-react";
import { BRAND } from "../config/brand";
import { api } from "../services/api";
import { useCart } from "../context/CartContext";
import { useCurrency } from "../context/CurrencyContext";
import ProductCard from "../components/ProductCard";

export function getImageAngleInfo(url, index) {
  const lower = (url || "").toLowerCase();
  if (lower.includes("model") || lower.includes("editorial")) {
    return { label: "Model Editorial", short: "Model", icon: "✦", degree: null, is360: false };
  }
  if (lower.includes("quarter") || lower.includes("45")) {
    return { label: "45° Three-Quarter View", short: "45° Angle", icon: "◈", degree: "45°", is360: true };
  }
  if (lower.includes("side") || lower.includes("profile") || lower.includes("90")) {
    return { label: "90° Side Profile View", short: "90° Profile", icon: "◆", degree: "90°", is360: true };
  }
  if (lower.includes("back") || lower.includes("rear") || lower.includes("180")) {
    return { label: "180° Rear Drape View", short: "180° Back", icon: "◉", degree: "180°", is360: true };
  }
  if (lower.includes("bust") || lower.includes("front")) {
    return { label: "0° Front Bust View", short: "0° Front", icon: "⯀", degree: "0°", is360: true };
  }
  if (lower.includes("detail") || lower.includes("lace") || lower.includes("texture") || lower.includes("knot")) {
    return { label: "Macro Lace & Knot Detail", short: "Lace Detail", icon: "🔍", degree: null, is360: false };
  }

  return { label: `Atelier View ${index + 1}`, short: `View ${index + 1}`, icon: "✧", degree: null, is360: false };
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { format, isUsd } = useCurrency();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("specs");
  const [addedNotification, setAddedNotification] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // 360 Turntable State
  const [isAutoSpinning, setIsAutoSpinning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartXRef = useRef(null);
  const isDraggingRef = useRef(false);

  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ name: '', email: '', rating: 5, title: '', comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newReview.name || !newReview.comment) return;
    setSubmittingReview(true);
    try {
      const res = await api.addProductReview(product._id, {
        ...newReview,
        verifiedPurchase: true
      });
      if (res.success) {
        setReviews([res.review, ...reviews]);
        if (product) {
          setProduct({ ...product, rating: res.rating, reviewsCount: res.reviewsCount });
        }
        setReviewSuccessMsg("Thank you! Your verified atelier review has been published.");
        setNewReview({ name: '', email: '', rating: 5, title: '', comment: '' });
        setShowReviewForm(false);
        setTimeout(() => setReviewSuccessMsg(''), 4000);
      }
    } catch (err) {
      alert(err.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.getProductByIdOrSlug(id);
        if (res.success && res.product) {
          setProduct(res.product);
          setReviews(res.product.reviews || []);
          setRelated(res.related || []);
          setActiveImageIndex(0);
          setSelectedVariant(res.product.variants?.length > 0 ? res.product.variants[0] : null);
        } else {
          setError("Product not found in our boutique.");
        }
      } catch (err) {
        setError(err.message || "Error loading product details");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  const handleKeyDown = useCallback((e) => {
    if (!isLightboxOpen) return;
    if (e.key === "Escape") setIsLightboxOpen(false);
    if (e.key === "ArrowRight") setLightboxIndex(i => Math.min(i + 1, (product?.images?.length || 1) - 1));
    if (e.key === "ArrowLeft") setLightboxIndex(i => Math.max(i - 1, 0));
  }, [isLightboxOpen, product]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const currentImages = product?.images?.length > 0
    ? product.images
    : ["https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=80"];

  const has360Rotation = currentImages.filter((img, idx) => {
    const info = getImageAngleInfo(img, idx);
    return info.is360;
  }).length >= 3;

  // 360 Auto-spin Interval
  useEffect(() => {
    let interval;
    if (isAutoSpinning && currentImages.length > 1) {
      interval = setInterval(() => {
        setActiveImageIndex((prev) => (prev + 1) % currentImages.length);
      }, 1600);
    }
    return () => clearInterval(interval);
  }, [isAutoSpinning, currentImages.length]);

  // Drag to rotate turntable handlers
  const handleDragStart = (e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    dragStartXRef.current = clientX;
    isDraggingRef.current = true;
    setIsDragging(true);
  };

  const handleDragMove = (e) => {
    if (!isDraggingRef.current || dragStartXRef.current === null) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const diff = clientX - dragStartXRef.current;
    const threshold = 35;
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        setActiveImageIndex((prev) => (prev - 1 + currentImages.length) % currentImages.length);
      } else {
        setActiveImageIndex((prev) => (prev + 1) % currentImages.length);
      }
      dragStartXRef.current = clientX;
      if (isAutoSpinning) setIsAutoSpinning(false);
    }
  };

  const handleDragEnd = () => {
    isDraggingRef.current = false;
    dragStartXRef.current = null;
    setIsDragging(false);
  };

  if (loading) return (
    <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gold-primary)" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "40px", marginBottom: "16px" }}>&#10022;</div>
        <div style={{ letterSpacing: "0.25em", textTransform: "uppercase", fontSize: "11px", color: "var(--text-secondary)" }}>Unveiling Haute Creation...</div>
      </div>
    </div>
  );

  if (error || !product) return (
    <div className="container" style={{ padding: "80px 24px", textAlign: "center" }}>
      <h2 style={{ fontSize: "24px", color: "var(--text-primary)", marginBottom: "12px" }}>Product Unavailable</h2>
      <p style={{ color: "var(--text-muted)", marginBottom: "24px" }}>{error}</p>
      <Link to="/shop" className="btn-gold">Return to Collection</Link>
    </div>
  );

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;

  const handleAddToCart = () => {
    addToCart(product, selectedVariant, quantity);
    setAddedNotification(true);
    setTimeout(() => setAddedNotification(false), 3000);
  };
  const handleBuyNow = () => { addToCart(product, selectedVariant, quantity); navigate("/checkout"); };
  const openLightbox = (idx) => { setLightboxIndex(idx); setIsLightboxOpen(true); };
  const navigateImage = (dir) => {
    const next = activeImageIndex + dir;
    if (next >= 0 && next < currentImages.length) setActiveImageIndex(next);
  };

  const availableColors = product.specifications?.availableColors ||
    (product.specifications?.colorHex ? [{ name: product.specifications.colorName, hex: product.specifications.colorHex }] : []);

  const tabLabels = {
    specs: "Technical Specifications",
    care: "Atelier Care Guide",
    shipping: "White-Glove Delivery",
    reviews: `Client Reviews (${reviews.length || product.reviewsCount || 0})`
  };

  const specsConfig = product.category === "wigs"
    ? [
        { label: "Hair Texture", value: product.specifications?.texture, gold: true },
        { label: "Lace Construction", value: product.specifications?.laceType },
        { label: "Donor Origin", value: product.specifications?.origin },
        { label: "Hair Grade", value: product.specifications?.hairGrade },
        { label: "Cap Fit", value: product.specifications?.capSize },
        { label: "Expected Lifespan", value: product.specifications?.longevity },
      ]
    : product.category === "attachments"
    ? [
        { label: "Attachment Method", value: product.specifications?.laceType, gold: true },
        { label: "Hair Material", value: product.specifications?.hairType },
        { label: "Donor Origin", value: product.specifications?.origin },
        { label: "Set & Weight", value: product.specifications?.hairGrade },
        { label: "Pieces", value: product.specifications?.capSize },
        { label: "Reusable Lifespan", value: product.specifications?.longevity },
      ]
    : [
        { label: "Net Volume", value: product.specifications?.volume, gold: true },
        { label: "Origin & Lab", value: product.specifications?.origin },
        { label: "Thermal Protection", value: product.specifications?.longevity },
        { label: "Texture / Form", value: product.specifications?.texture },
      ];

  const careContent = product.category === "hair-care" ? [
    { title: "Daily Radiance", body: "Dispense 2-3 drops into palms, warm between hands, apply from mid-shaft to ends for mirror-like shine." },
    { title: "Thermal Armor", body: "Apply before heat styling up to 450F to prevent split ends and moisture loss." },
    { title: "Overnight Restoration", body: "Massage into scalp or unit base before sleep; rinse in the morning." },
  ] : product.category === "attachments" ? [
    { title: "Brushing", body: "Detangle from ends upward using an extension-safe loop brush before washing." },
    { title: "Cleansing", body: "Use sulfate-free shampoo in lukewarm water; never rub wefts together." },
    { title: "Re-taping", body: "Tape-ins should be re-applied every 6-8 weeks with medical-grade adhesive tabs." },
    { title: "Storage", body: "Store in the " + BRAND.name + " breathable satin pouch to prevent dust and friction." },
  ] : [
    { title: "Washing", body: "Wash bi-weekly with sulfate-free hydrating shampoo in lukewarm water." },
    { title: "Conditioning", body: "Apply Moroccan Argan & Marula Elixir from mid-shaft to ends before blow-drying." },
    { title: "Heat Styling", body: "Safe for flat-ironing and curling up to 450F - always use heat protection." },
    { title: "Storage", body: "Store on a satin wig stand or inside the " + BRAND.name + " luxury dust pouch when not in rotation." },
  ];

  return (
    <div style={{ backgroundColor: "var(--bg-main)", color: "var(--text-primary)", minHeight: "100vh", paddingBottom: "80px", transition: "background-color 0.3s ease, color 0.3s ease" }}>

      {/* LIGHTBOX */}
      {isLightboxOpen && (
        <div onClick={() => setIsLightboxOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 9999, backgroundColor: "rgba(0,0,0,0.96)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(14px)" }}>
          <button onClick={() => setIsLightboxOpen(false)} style={{ position: "absolute", top: "20px", right: "24px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "50%", width: "46px", height: "46px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", zIndex: 10000 }}>
            <X size={20} />
          </button>
          {lightboxIndex > 0 && (
            <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => i - 1); }} style={{ position: "absolute", left: "24px", top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "50%", width: "52px", height: "52px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", zIndex: 10000 }}>
              <ChevronLeft size={26} />
            </button>
          )}
          <img onClick={(e) => e.stopPropagation()} src={currentImages[lightboxIndex]} alt={product.name} style={{ maxWidth: "88vw", maxHeight: "88vh", objectFit: "contain", borderRadius: "6px", boxShadow: "0 40px 120px rgba(0,0,0,0.8)" }} onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=80"; }} />
          {lightboxIndex < currentImages.length - 1 && (
            <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => i + 1); }} style={{ position: "absolute", right: "24px", top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "50%", width: "52px", height: "52px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", zIndex: 10000 }}>
              <ChevronRight size={26} />
            </button>
          )}
          <div style={{ position: "absolute", bottom: "28px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "8px" }}>
            {currentImages.map((_, idx) => (
              <button key={idx} onClick={(e) => { e.stopPropagation(); setLightboxIndex(idx); }} style={{ width: lightboxIndex === idx ? "26px" : "8px", height: "8px", borderRadius: "4px", backgroundColor: lightboxIndex === idx ? "#C9A876" : "rgba(255,255,255,0.3)", border: "none", cursor: "pointer", transition: "all 0.3s ease" }} />
            ))}
          </div>
          <div style={{ position: "absolute", top: "22px", left: "50%", transform: "translateX(-50%)", backgroundColor: "rgba(201,168,118,0.14)", border: "1px solid rgba(201,168,118,0.35)", color: "#C9A876", padding: "6px 18px", borderRadius: "20px", fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", gap: "8px" }}>
            <span>{getImageAngleInfo(currentImages[lightboxIndex], lightboxIndex).icon}</span>
            <span>{getImageAngleInfo(currentImages[lightboxIndex], lightboxIndex).label}</span>
          </div>
        </div>
      )}

      <div className="container" style={{ paddingTop: "30px" }}>
        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", color: "var(--text-muted)", marginBottom: "36px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          <Link to="/" style={{ color: "var(--text-muted)" }}>Atelier</Link>
          <ChevronRight size={11} />
          <Link to={"/shop?category=" + product.category} style={{ color: "var(--text-muted)", textTransform: "capitalize" }}>{product.category}</Link>
          <ChevronRight size={11} />
          <span style={{ color: "var(--gold-primary)" }}>{product.name}</span>
        </div>

        {/* MAIN GRID */}
        <div style={{ display: "grid", gridTemplateColumns: "minmax(300px, 1.15fr) minmax(300px, 1fr)", gap: "56px", marginBottom: "80px" }} className="pdp-layout">

          {/* LEFT: GALLERY / 360 TURNTABLE */}
          <div>
            {/* 360 Header Bar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  fontSize: "10px",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "var(--gold-primary)",
                  fontWeight: 700,
                  backgroundColor: "rgba(201,168,118,0.08)",
                  padding: "6px 12px",
                  borderRadius: "20px",
                  border: "1px solid rgba(201,168,118,0.25)"
                }}>
                  <RotateCw size={12} className={isAutoSpinning ? "spin-animation" : ""} />
                  <span>{has360Rotation ? "360° Studio Turntable" : "Atelier Gallery"}</span>
                </div>
                {has360Rotation && getImageAngleInfo(currentImages[activeImageIndex], activeImageIndex).degree && (
                  <span style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.15em",
                    color: "var(--gold-primary)",
                    border: "1px solid var(--gold-primary)",
                    borderRadius: "12px",
                    padding: "2px 8px",
                    backgroundColor: "rgba(201,168,118,0.12)"
                  }}>
                    {getImageAngleInfo(currentImages[activeImageIndex], activeImageIndex).degree}
                  </span>
                )}
              </div>

              {/* Controls */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => setIsAutoSpinning(prev => !prev)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    backgroundColor: isAutoSpinning ? "var(--gold-primary)" : "var(--bg-surface-2)",
                    color: isAutoSpinning ? "#0E0D0C" : "var(--text-primary)",
                    border: "1px solid " + (isAutoSpinning ? "var(--gold-primary)" : "var(--border-subtle)"),
                    padding: "5px 12px",
                    borderRadius: "16px",
                    fontSize: "10px",
                    letterSpacing: "0.1em",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    fontWeight: 600
                  }}
                  title={has360Rotation ? "Toggle 360° Auto-Turntable Rotation" : "Auto-Browse Gallery"}
                >
                  {isAutoSpinning ? <Pause size={12} /> : <Play size={12} />}
                  <span>{isAutoSpinning ? (has360Rotation ? "Pause 360°" : "Pause") : (has360Rotation ? "Auto-Spin 360°" : "Auto-Play")}</span>
                </button>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  {activeImageIndex + 1} / {currentImages.length}
                </span>
              </div>
            </div>

            {/* Main 360 Image Turntable Stage */}
            <div
              onMouseDown={handleDragStart}
              onMouseMove={handleDragMove}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              onTouchStart={handleDragStart}
              onTouchMove={handleDragMove}
              onTouchEnd={handleDragEnd}
              style={{
                position: "relative",
                width: "100%",
                paddingTop: "118%",
                backgroundColor: "var(--bg-surface-2)",
                borderRadius: "6px",
                overflow: "hidden",
                border: "1px solid var(--border-subtle)",
                boxShadow: "0 25px 70px rgba(0,0,0,0.22)",
                cursor: isDragging ? "grabbing" : "grab",
                userSelect: "none"
              }}
            >
              <img
                key={activeImageIndex}
                src={currentImages[activeImageIndex]}
                alt={`${product.name} - ${getImageAngleInfo(currentImages[activeImageIndex], activeImageIndex).label}`}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition: "opacity 0.35s ease, transform 0.35s ease",
                  pointerEvents: "none"
                }}
                onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=80"; }}
              />

              {/* Badges */}
              <div style={{ position: "absolute", top: "14px", left: "14px", display: "flex", flexDirection: "column", gap: "6px", zIndex: 2 }}>
                {product.isBestseller && <span className="badge-gold">Bestseller</span>}
                {product.compareAtPrice > currentPrice && (
                  <span style={{ backgroundColor: "#991B1B", color: "#fff", fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "2px", letterSpacing: "0.06em" }}>SAVE {Math.round(((product.compareAtPrice - currentPrice) / product.compareAtPrice) * 100)}%</span>
                )}
              </div>

              {/* Angle Label & Drag Prompt */}
              <div style={{
                position: "absolute",
                bottom: "52px",
                left: "14px",
                backgroundColor: "rgba(0,0,0,0.82)",
                color: "#fff",
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "10px",
                letterSpacing: "0.14em",
                backdropFilter: "blur(10px)",
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                border: "1px solid rgba(201,168,118,0.35)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.4)"
              }}>
                <span style={{ color: "var(--gold-primary)", fontSize: "12px" }}>
                  {getImageAngleInfo(currentImages[activeImageIndex], activeImageIndex).icon}
                </span>
                <span style={{ fontWeight: 600 }}>
                  {getImageAngleInfo(currentImages[activeImageIndex], activeImageIndex).label}
                </span>
              </div>

              {/* Drag to Rotate Indicator */}
              <div style={{
                position: "absolute",
                bottom: "16px",
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "rgba(0,0,0,0.65)",
                color: "rgba(255,255,255,0.75)",
                padding: "4px 12px",
                borderRadius: "14px",
                fontSize: "9px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                backdropFilter: "blur(8px)",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                pointerEvents: "none"
              }}>
                <span>&#10229;</span>
                <span>{has360Rotation ? "Drag to Rotate 360°" : "Drag to Browse"}</span>
                <span>&#10230;</span>
              </div>

              <div
                onClick={() => openLightbox(activeImageIndex)}
                style={{
                  position: "absolute",
                  bottom: "52px",
                  right: "14px",
                  backgroundColor: "rgba(0,0,0,0.7)",
                  color: "rgba(255,255,255,0.85)",
                  padding: "6px 12px",
                  borderRadius: "20px",
                  fontSize: "10px",
                  letterSpacing: "0.1em",
                  backdropFilter: "blur(8px)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  cursor: "pointer",
                  border: "1px solid rgba(255,255,255,0.15)"
                }}
              >
                <ZoomIn size={12} /><span>Zoom</span>
              </div>

              {activeImageIndex > 0 && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); navigateImage(-1); if (isAutoSpinning) setIsAutoSpinning(false); }}
                  style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", backgroundColor: "rgba(0,0,0,0.65)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "50%", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", zIndex: 3, backdropFilter: "blur(8px)", transition: "all 0.2s ease" }}
                  aria-label="Previous angle"
                >
                  <ChevronLeft size={20} />
                </button>
              )}
              {activeImageIndex < currentImages.length - 1 && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); navigateImage(1); if (isAutoSpinning) setIsAutoSpinning(false); }}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", backgroundColor: "rgba(0,0,0,0.65)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "50%", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", zIndex: 3, backdropFilter: "blur(8px)", transition: "all 0.2s ease" }}
                  aria-label="Next angle"
                >
                  <ChevronRight size={20} />
                </button>
              )}

              {/* Progress bar */}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "3px", backgroundColor: "rgba(255,255,255,0.08)" }}>
                <div style={{ height: "100%", width: ((activeImageIndex + 1) / currentImages.length * 100) + "%", backgroundColor: "var(--gold-primary)", transition: "width 0.3s ease" }} />
              </div>
            </div>

            {/* Quick 360 Angle Selector Pills */}
            <div style={{ display: "flex", gap: "6px", marginTop: "12px", overflowX: "auto", paddingBottom: "4px", scrollbarWidth: "none" }}>
              {currentImages.map((img, idx) => {
                const info = getImageAngleInfo(img, idx);
                const isActive = activeImageIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => { setActiveImageIndex(idx); if (isAutoSpinning) setIsAutoSpinning(false); }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "6px 12px",
                      borderRadius: "20px",
                      fontSize: "10px",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      fontWeight: isActive ? 700 : 500,
                      backgroundColor: isActive ? "rgba(201,168,118,0.2)" : "var(--bg-surface-2)",
                      color: isActive ? "var(--gold-primary)" : "var(--text-secondary)",
                      border: isActive ? "1px solid var(--gold-primary)" : "1px solid var(--border-subtle)",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <span>{info.icon}</span>
                    <span>{info.short}</span>
                  </button>
                );
              })}
            </div>

            {/* Thumbnails Tray */}
            <div style={{ display: "flex", gap: "10px", marginTop: "10px", overflowX: "auto", paddingBottom: "4px" }}>
              {currentImages.map((img, idx) => {
                const info = getImageAngleInfo(img, idx);
                const isActive = activeImageIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => { setActiveImageIndex(idx); if (isAutoSpinning) setIsAutoSpinning(false); }}
                    style={{
                      position: "relative",
                      flexShrink: 0,
                      width: "78px",
                      height: "96px",
                      borderRadius: "4px",
                      overflow: "hidden",
                      padding: 0,
                      backgroundColor: "var(--bg-surface-2)",
                      border: isActive ? "2px solid var(--gold-primary)" : "1px solid var(--border-subtle)",
                      opacity: isActive ? 1 : 0.6,
                      transition: "all 0.2s",
                      cursor: "pointer",
                      boxShadow: isActive ? "0 0 0 3px rgba(201,168,118,0.2)" : "none"
                    }}
                  >
                    <img src={img} alt={info.label} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&auto=format&fit=crop&q=80"; }} />
                    <div style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      backgroundColor: isActive ? "rgba(201,168,118,0.95)" : "rgba(0,0,0,0.8)",
                      color: isActive ? "#0E0D0C" : "#fff",
                      fontSize: "7.5px",
                      letterSpacing: "0.05em",
                      textAlign: "center",
                      padding: "3px 2px",
                      textTransform: "uppercase",
                      fontWeight: isActive ? 700 : 500
                    }}>
                      {info.short}
                    </div>
                    {isActive && <div style={{ position: "absolute", top: "5px", right: "5px", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--gold-primary)", boxShadow: "0 0 8px rgba(201,168,118,0.9)" }} />}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => openLightbox(activeImageIndex)}
                style={{
                  flexShrink: 0,
                  width: "78px",
                  height: "96px",
                  borderRadius: "4px",
                  padding: 0,
                  cursor: "pointer",
                  backgroundColor: "var(--bg-surface-2)",
                  border: "1px dashed var(--border-medium)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  color: "var(--text-muted)",
                  transition: "all 0.2s"
                }}
              >
                <Maximize2 size={15} />
                <span style={{ fontSize: "7px", letterSpacing: "0.08em", textTransform: "uppercase" }}>Full View</span>
              </button>
            </div>

            {/* Dots */}
            <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginTop: "14px" }}>
              {currentImages.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => { setActiveImageIndex(idx); if (isAutoSpinning) setIsAutoSpinning(false); }}
                  style={{
                    width: activeImageIndex === idx ? "24px" : "7px",
                    height: "7px",
                    borderRadius: "3px",
                    padding: 0,
                    backgroundColor: activeImageIndex === idx ? "var(--gold-primary)" : "var(--border-medium)",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.3s ease"
                  }}
                />
              ))}
            </div>
          </div>

          {/* RIGHT: CONFIGURATOR */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
              <span style={{ fontSize: "10px", letterSpacing: "0.22em", color: "var(--gold-primary)", textTransform: "uppercase", fontWeight: 700 }}>{product.category} Collection</span>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-secondary)" }}>
                <div style={{ display: "flex", color: "var(--gold-primary)" }}>{[...Array(5)].map((_, i) => <Star key={i} size={12} fill="var(--gold-primary)" stroke="var(--gold-primary)" />)}</div>
                <span>{product.rating} ({product.reviewsCount})</span>
              </div>
            </div>

            <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(26px, 3vw, 40px)", fontWeight: 400, lineHeight: 1.15, color: "var(--text-primary)", marginBottom: "6px" }}>
              {product.name}
            </h1>
            {product.specifications?.colorName && (
              <p style={{ fontSize: "13px", color: "var(--gold-primary)", marginBottom: "18px", fontStyle: "italic" }}>in {product.specifications.colorName}</p>
            )}

            <div style={{ display: "flex", alignItems: "baseline", gap: "14px", paddingBottom: "22px", borderBottom: "1px solid var(--border-subtle)", marginBottom: "24px" }}>
              <span style={{ fontSize: "32px", fontWeight: 700, color: "var(--gold-primary)" }}>{format(currentPrice)}</span>
              {product.compareAtPrice > currentPrice && <span style={{ fontSize: "18px", color: "var(--text-muted)", textDecoration: "line-through" }}>{format(product.compareAtPrice)}</span>}
              {product.compareAtPrice > currentPrice && (
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#10B981", backgroundColor: "rgba(16,185,129,0.1)", padding: "3px 9px", borderRadius: "20px" }}>
                  {Math.round(((product.compareAtPrice - currentPrice) / product.compareAtPrice) * 100)}% off
                </span>
              )}
            </div>

            {availableColors.length > 0 && (
              <div style={{ marginBottom: "24px" }}>
                <div style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: "10px" }}>
                  Haute Color: <strong style={{ color: "var(--gold-primary)" }}>{product.specifications?.colorName || "Signature Shade"}</strong>
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {availableColors.map((col, idx) => (
                    <div key={idx} style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", border: "1px solid var(--border-medium)", borderRadius: "20px", backgroundColor: "var(--bg-surface-2)", fontSize: "12px", color: "var(--text-primary)" }}>
                      <span style={{ width: "14px", height: "14px", borderRadius: "50%", backgroundColor: col.hex, border: "2px solid rgba(255,255,255,0.2)", boxShadow: "0 0 8px " + col.hex + "50", flexShrink: 0 }} />
                      <span>{col.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.75, marginBottom: "28px" }}>{product.shortDescription || product.description}</p>

            {product.variants?.length > 0 && (
              <div style={{ marginBottom: "28px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                  <span style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-secondary)" }}>
                    {product.category === "hair-care" ? "Select Volume:" : product.category === "attachments" ? "Select Type & Shade:" : "Select Length & Density:"}
                  </span>
                  <span style={{ fontSize: "12px", color: "var(--gold-primary)", fontWeight: 600 }}>{selectedVariant ? selectedVariant.name : "Choose variant"}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {product.variants.map((v) => {
                    const isSel = selectedVariant?._id === v._id || selectedVariant?.name === v.name;
                    return (
                      <button key={v._id || v.name} onClick={() => setSelectedVariant(v)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", backgroundColor: isSel ? "rgba(201,168,118,0.08)" : "var(--bg-surface-2)", border: isSel ? "1px solid var(--gold-primary)" : "1px solid var(--border-subtle)", borderRadius: "4px", color: isSel ? "var(--text-primary)" : "var(--text-secondary)", cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ width: "14px", height: "14px", borderRadius: "50%", flexShrink: 0, border: isSel ? "4px solid var(--gold-primary)" : "2px solid var(--border-medium)", backgroundColor: isSel ? "transparent" : "var(--bg-main)", transition: "all 0.2s" }} />
                          <span style={{ fontSize: "13px", fontWeight: isSel ? 600 : 400 }}>{v.name}</span>
                        </div>
                        <span style={{ fontSize: "13px", fontWeight: 600, color: isSel ? "var(--gold-primary)" : "var(--text-secondary)", flexShrink: 0 }}>{format(v.price)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{ marginBottom: "28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#10B981", marginBottom: "14px" }}>
                <Check size={14} /><span>In Stock - Ready for dispatch from Victoria Island Atelier</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                <span style={{ fontSize: "11px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Qty:</span>
                <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid var(--border-medium)", backgroundColor: "var(--bg-surface-2)", borderRadius: "4px" }}>
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ padding: "10px 16px", color: "var(--text-secondary)", cursor: "pointer", fontSize: "18px", lineHeight: 1 }}>-</button>
                  <span style={{ padding: "0 16px", fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", minWidth: "30px", textAlign: "center" }}>{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} style={{ padding: "10px 16px", color: "var(--text-secondary)", cursor: "pointer", fontSize: "18px", lineHeight: 1 }}>+</button>
                </div>
              </div>
            </div>

            {addedNotification && (
              <div style={{ backgroundColor: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.35)", color: "#10B981", padding: "12px 16px", borderRadius: "4px", fontSize: "13px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Check size={16} /><span>Added to your luxury shopping bag!</span>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "28px" }}>
              <button onClick={handleAddToCart} className="btn-gold" style={{ width: "100%", padding: "17px", fontSize: "13px", letterSpacing: "0.12em" }}>
                <ShoppingBag size={16} /><span>Add to Shopping Bag - {format(currentPrice * quantity)}</span>
              </button>
              <button onClick={handleBuyNow} className="btn-dark" style={{ width: "100%", padding: "16px", fontSize: "13px" }}>
                Instant Checkout - {isUsd ? "Stripe" : "Paystack"}
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", padding: "16px", backgroundColor: "var(--bg-surface-2)", border: "1px solid var(--border-subtle)", borderRadius: "4px", fontSize: "11px", color: "var(--text-secondary)" }}>
              {[
                { icon: <ShieldCheck size={14} />, text: "100% Raw Virgin Certified" },
                { icon: <Truck size={14} />, text: "Lagos 24-Hr Express" },
                { icon: <Sparkles size={14} />, text: "Bleached Knots Included" },
                { icon: <RefreshCw size={14} />, text: "Pay on Delivery Available" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                  <span style={{ color: "var(--gold-primary)", flexShrink: 0 }}>{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TABS */}
        <div style={{ backgroundColor: "var(--bg-surface-1)", border: "1px solid var(--border-subtle)", borderRadius: "6px", overflow: "hidden", marginBottom: "80px" }}>
          <div style={{ display: "flex", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-surface-2)", overflowX: "auto" }}>
            {["specs", "care", "shipping", "reviews"].map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "16px 24px", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: isActive ? 700 : 400, color: isActive ? "var(--gold-primary)" : "var(--text-muted)", borderBottom: isActive ? "2px solid var(--gold-primary)" : "2px solid transparent", backgroundColor: "transparent", cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap", flexShrink: 0 }}>
                  {tabLabels[tab]}
                </button>
              );
            })}
          </div>
          <div style={{ padding: "36px" }}>
            {activeTab === "specs" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "28px" }}>
                {specsConfig.map((spec, i) => (
                  <div key={i}>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "5px" }}>{spec.label}</div>
                    <div style={{ fontSize: "14px", color: spec.gold ? "var(--gold-primary)" : "var(--text-primary)", fontWeight: spec.gold ? 600 : 400 }}>{spec.value || "-"}</div>
                  </div>
                ))}
                {product.category === "hair-care" && product.specifications?.keyIngredients && (
                  <div style={{ gridColumn: "1 / -1" }}>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "5px" }}>Key Botanical Actives</div>
                    <div style={{ fontSize: "13px", color: "var(--text-primary)", lineHeight: 1.6 }}>{product.specifications.keyIngredients}</div>
                  </div>
                )}
              </div>
            )}
            {activeTab === "care" && (
              <div style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.85, maxWidth: "760px" }}>
                <p style={{ marginBottom: "18px", color: "var(--text-primary)", fontWeight: 600, fontSize: "15px" }}>
                  {product.category === "hair-care" ? "Atelier Application Directions:" : product.category === "attachments" ? "Extension Longevity Ritual:" : "100% Human Hair Unit Atelier Care:"}
                </p>
                <ul style={{ paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  {careContent.map((item, i) => (
                    <li key={i}><strong>{item.title}:</strong> {item.body}</li>
                  ))}
                </ul>
              </div>
            )}
            {activeTab === "shipping" && (
              <div style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.85, maxWidth: "760px" }}>
                <p style={{ marginBottom: "18px", color: "var(--text-primary)", fontWeight: 600, fontSize: "15px" }}>
                  Every order ships in our signature matte black rigid gift box with silk dust bag, satin edge wrap, and authenticity seal.
                </p>
                <ul style={{ paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <li><strong>Lagos Metropolis:</strong> 24-48 Hr Express Courier (N3,500). Free on orders over N250,000.</li>
                  <li><strong>Abuja &amp; Port Harcourt:</strong> 48-72 Hr via DHL Express (N7,500).</li>
                  <li><strong>Pay on Delivery:</strong> Available for Lagos &amp; Abuja. Card or cash on courier arrival.</li>
                  <li><strong>International:</strong> 7-14 Business Days via DHL International (rates at checkout).</li>
                </ul>
              </div>
            )}
            {activeTab === "reviews" && (
              <div>
                {/* Success Notification */}
                {reviewSuccessMsg && (
                  <div style={{ backgroundColor: 'rgba(126, 182, 133, 0.15)', border: '1px solid #7EB685', color: '#7EB685', padding: '12px 16px', borderRadius: '4px', marginBottom: '24px', fontSize: '13px' }}>
                    ✦ {reviewSuccessMsg}
                  </div>
                )}

                {/* Rating Overview & Breakdown Header */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '32px',
                  alignItems: 'center',
                  paddingBottom: '28px',
                  borderBottom: '1px solid var(--border-subtle)',
                  marginBottom: '32px'
                }}>
                  {/* Big Rating Score */}
                  <div style={{ textAlign: 'center', minWidth: '140px' }}>
                    <div style={{ fontSize: '48px', fontFamily: "'Cormorant Garamond', Georgia, serif", color: 'var(--gold-primary)', fontWeight: 600, lineHeight: 1 }}>
                      {product.rating || 5.0}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '3px', margin: '8px 0 4px', color: 'var(--gold-primary)' }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={15} fill={s <= Math.round(product.rating || 5) ? 'currentColor' : 'none'} />
                      ))}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Based on {reviews.length || product.reviewsCount || 0} Verified Patron Reviews
                    </div>
                  </div>

                  {/* Stars Distribution Bar Chart */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '300px' }}>
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const count = reviews.filter(r => Math.round(r.rating) === stars).length;
                      const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : (stars === 5 ? 90 : stars === 4 ? 10 : 0);
                      return (
                        <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                          <span style={{ width: '22px' }}>{stars}★</span>
                          <div style={{ flex: 1, height: '5px', backgroundColor: 'var(--bg-surface-2)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, backgroundColor: 'var(--gold-primary)', transition: 'width 0.4s ease' }} />
                          </div>
                          <span style={{ width: '28px', textAlign: 'right' }}>{pct}%</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Action Button */}
                  <div style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="btn-gold"
                      style={{ padding: '12px 20px', fontSize: '12px', whiteSpace: 'nowrap' }}
                    >
                      {showReviewForm ? 'Cancel Review' : '✦ Write Atelier Review'}
                    </button>
                  </div>
                </div>

                {/* Review Form (Expandable) */}
                {showReviewForm && (
                  <form
                    onSubmit={handleReviewSubmit}
                    style={{
                      backgroundColor: 'var(--bg-surface-2)',
                      border: '1px solid var(--gold-primary)',
                      borderRadius: '6px',
                      padding: '28px',
                      marginBottom: '36px'
                    }}
                  >
                    <h4 style={{ fontSize: '15px', color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
                      Share Your Experience with {product.name}
                    </h4>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                        Your Rating
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {[1, 2, 3, 4, 5].map((starVal) => (
                          <button
                            key={starVal}
                            type="button"
                            onClick={() => setNewReview({ ...newReview, rating: starVal })}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', color: starVal <= newReview.rating ? 'var(--gold-primary)' : 'var(--text-muted)' }}
                          >
                            <Star size={24} fill={starVal <= newReview.rating ? 'currentColor' : 'none'} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                          Your Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Chioma Adeleke"
                          value={newReview.name}
                          onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                          className="input-luxury"
                          style={{ width: '100%' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                          Email Address
                        </label>
                        <input
                          type="email"
                          placeholder="e.g. chioma@example.com"
                          value={newReview.email}
                          onChange={(e) => setNewReview({ ...newReview, email: e.target.value })}
                          className="input-luxury"
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Review Headline
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Unbelievable hair luster and natural movement"
                        value={newReview.title}
                        onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                        className="input-luxury"
                        style={{ width: '100%' }}
                      />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Detailed Feedback &amp; Styling Impressions *
                      </label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Describe texture, lace melt, hair density, styling longevity, and packaging..."
                        value={newReview.comment}
                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                        className="input-luxury"
                        style={{ width: '100%', resize: 'vertical' }}
                      />
                    </div>

                    <button type="submit" disabled={submittingReview} className="btn-gold" style={{ padding: '12px 28px' }}>
                      {submittingReview ? 'Publishing Review...' : 'Publish Atelier Review'}
                    </button>
                  </form>
                )}

                {/* Reviews List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {reviews.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      No reviews published yet. Be the first patron to share your styling experience!
                    </div>
                  ) : (
                    reviews.map((rev, idx) => (
                      <div
                        key={idx}
                        style={{
                          backgroundColor: 'var(--bg-surface-2)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '4px',
                          padding: '24px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ display: 'flex', gap: '2px', color: 'var(--gold-primary)' }}>
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} size={13} fill={s <= rev.rating ? 'currentColor' : 'none'} />
                              ))}
                            </div>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>
                              {rev.name}
                            </span>
                            {rev.verifiedPurchase !== false && (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '10px',
                                color: '#7EB685',
                                backgroundColor: 'rgba(126, 182, 133, 0.12)',
                                border: '1px solid rgba(126, 182, 133, 0.25)',
                                padding: '2px 8px',
                                borderRadius: '10px',
                                letterSpacing: '0.04em'
                              }}>
                                ✓ Verified Atelier Client
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {new Date(rev.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>

                        {rev.title && (
                          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gold-primary)', marginBottom: '8px' }}>
                            {rev.title}
                          </div>
                        )}
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
                          {rev.comment}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <div>
            <div style={{ marginBottom: "32px", textAlign: "center" }}>
              <span className="section-tag">Curated Pairings</span>
              <h2 className="section-title">Complete The Aesthetic</h2>
            </div>
            <div className="grid-products">
              {related.map((item) => (
                <ProductCard key={item._id} product={item} />
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .pdp-layout { grid-template-columns: 1fr !important; gap: 36px !important; }
        }
      `}</style>
    </div>
  );
}
