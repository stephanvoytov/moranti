/* ============================================
   DEMO — MASTLE-стиль для Moranti
   Тестовый прототип, не влияет на основной сайт
   ============================================ */
import Link from "next/link";
import { getProducts } from "@/data/products";
import "./demo.css";

const HERO_IMG =
  "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=1400&q=80";
const LIFESTYLE_IMG =
  "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&q=80";

export default async function DemoPage() {
  const allProducts = await getProducts();
  const demoProducts = allProducts.slice(0, 9);

  return (
    <div className="demo">
      {/* ═══════ HEADER ═══════ */}
      <header className="demo-header">
        {/* Top Bar */}
        <div className="demo-topbar">
          <div className="demo-topbar-left">
            <span>About Us</span>
            <span>Store</span>
            <span>Contact</span>
          </div>
          <a href="/demo" className="demo-logo">
            MASTLE
          </a>
          <div className="demo-topbar-right">
            <div className="demo-search">
              <input type="text" placeholder="Search" readOnly />
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </div>
        </div>

        {/* Navigation Bar */}
        <nav className="demo-nav">
          <button className="demo-nav-burger" aria-label="Menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/></svg>
          </button>

          <ul className="demo-nav-links">
            <li><a href="/demo">Home</a></li>
            <li><a href="/demo">Products</a></li>
            <li><a href="/demo">Bag</a></li>
            <li><a href="/demo">Accessories</a></li>
            <li><a href="/demo">Sale</a></li>
            <li><a href="/demo">Collections</a></li>
          </ul>

          <div className="demo-nav-right">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 21h16"/><path d="M4 21V7l8-4 8 4v14"/><path d="M9 17v-4h6v4"/></svg>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="9.5" cy="9.5" r="2.5"/><circle cx="16.5" cy="9.5" r="2.5"/><path d="M12 17.5c-2 0-3.5-1-4-2.5"/><path d="M2 12c0 5.5 4.5 10 10 10s10-4.5 10-10S17.5 2 12 2 2 6.5 2 12Z"/></svg>
          </div>
        </nav>
      </header>

      {/* ═══════ HERO ═══════ */}
      <section
        className="demo-hero"
        style={{ backgroundImage: `url(${HERO_IMG})` }}
      />

      {/* ═══════ CATALOG ═══════ */}
      <section className="demo-catalog">
        <h2 className="demo-catalog-title">See School Puneliciey</h2>

        {/* Filter pills */}
        <div className="demo-filters">
          <button className="demo-filter">All Products</button>
          <button className="demo-filter">Best Seller</button>
          <button className="demo-filter">New Arrivals</button>
          <button className="demo-filter">Best Seller</button>
          <button className="demo-filter">All Products</button>
        </div>

        {/* Product grid */}
        <div className="demo-grid">
          {demoProducts.map((p, i) => {
            // 4th slot = lifestyle image
            if (i === 3) {
              return (
                <div key="lifestyle" className="demo-card">
                  <div className="demo-card-image lifestyle">
                    <img src={LIFESTYLE_IMG} alt="Lifestyle" loading="lazy" />
                  </div>
                  <div className="demo-card-info">
                    <h3 className="demo-card-name">Lifestyle Collection</h3>
                    <p className="demo-card-desc">Minimal aesthetic</p>
                    <span className="demo-card-price">$240.00</span>
                  </div>
                </div>
              );
            }

            return (
              <div key={p.id} className="demo-card">
                <div className="demo-card-image">
                  <button className="demo-card-fav" aria-label="Add to favorites">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                  </button>
                  <img src={p.image} alt={p.name} loading="lazy" />
                </div>
                <div className="demo-card-info">
                  <div className="demo-card-top">
                    <h3 className="demo-card-name">{p.name}</h3>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                  </div>
                  <p className="demo-card-desc">
                    Italian leather, minimal design
                  </p>
                  <span className="demo-card-price">
                    {p.price.toLocaleString("ru-RU")} ₽
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══════ NOTE ═══════ */}
      <div className="demo-note">
        <p>
          ⚡ Это демонстрация MASTLE-стиля. Основной сайт работает на{" "}
          <Link href="/">localhost:3001</Link>
        </p>
      </div>
    </div>
  );
}
