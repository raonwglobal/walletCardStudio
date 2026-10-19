import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownToLine, ArrowRight, Check, CircleHelp, Copy,
  CreditCard, Eye, Filter, Grid2X2, LayoutTemplate, Link2, LockKeyhole,
  Plus, Search, ShieldCheck, Sparkles, WalletCards, X
} from "lucide-react";
import type { CardCategory, CardInput, CardRecord } from "./lib/cards";
import { createCard, loadCards, saveCards, toVCard, validateCard } from "./lib/cards";
import { createQrDataUrl } from "./lib/qr";

type Tab = "gallery" | "studio";
type FilterValue = "all" | CardCategory;

const blankInput: CardInput = {
  name: "", role: "", company: "", email: "", phone: "", website: "",
  location: "", bio: "", category: "business", theme: "dark"
};

function CardPreview({ card, compact = false }: { card: CardRecord; compact?: boolean }) {
  return (
    <article className={`business-card theme-${card.theme} ${compact ? "compact" : ""}`}>
      <div className="card-glow" />
      <div className="card-topline"><span className="brand-mark"><Sparkles size={14} /></span><span>WALLET / STUDIO</span><span className="card-index">DIGITAL CARD</span></div>
      <div className="card-person">
        <div className="avatar">{card.name.trim().split(/\s+/).map(part => part[0]).join("").slice(0, 2).toUpperCase() || "YO"}</div>
        <div className="card-person-copy">
          <h3>{card.name || "Your name"}</h3>
          <p>{card.role || "Your role"}{card.company ? ` · ${card.company}` : ""}</p>
        </div>
      </div>
      {card.bio && <p className="card-bio">{card.bio}</p>}
      <div className="card-contact">
        {card.email && <span>{card.email}</span>}
        {card.phone && <span>{card.phone}</span>}
        {card.website && <span>{card.website.replace(/^https?:\/\//, "")}</span>}
      </div>
      <div className="card-bottom"><span>{card.location || "YOUR NEXT CONNECTION"}</span><span className="card-chip"><span /> READY TO CONNECT</span></div>
    </article>
  );
}

function App() {
  const [cards, setCards] = useState<CardRecord[]>(() => loadCards());
  const [activeId, setActiveId] = useState<string>(() => loadCards()[0]?.id ?? "");
  const [tab, setTab] = useState<Tab>("gallery");
  const [filter, setFilter] = useState<FilterValue>("all");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<CardInput>(blankInput);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [showQr, setShowQr] = useState(false);
  const [mobilePreview, setMobilePreview] = useState(false);

  const activeCard = cards.find(card => card.id === activeId) ?? cards[0];
  const filteredCards = useMemo(() => cards.filter(card => {
    const matchesFilter = filter === "all" || card.category === filter;
    const text = `${card.name} ${card.role} ${card.company}`.toLowerCase();
    return matchesFilter && text.includes(query.toLowerCase());
  }), [cards, filter, query]);

  useEffect(() => {
    if (!saveCards(cards)) setNotice("브라우저 저장 공간에 저장하지 못했습니다. JSON으로 내보내 백업해 주세요.");
  }, [cards]);

  useEffect(() => {
    let cancelled = false;
    if (showQr) {
      const qrCard: CardRecord = {
        ...draft, id: editingId ?? "draft", createdAt: "", updatedAt: ""
      };
      createQrDataUrl(toVCard(qrCard)).then(url => { if (!cancelled) setQrUrl(url); })
        .catch(() => { if (!cancelled) setNotice("QR 코드를 생성하지 못했습니다."); });
    }
    return () => { cancelled = true; };
  }, [draft, editingId, showQr]);

  function startNew() {
    setDraft(blankInput);
    setEditingId(null);
    setErrors([]);
    setTab("studio");
    setShowQr(false);
    setMobilePreview(false);
  }

  function editCard(card: CardRecord) {
    const input: CardInput = {
    name: card.name, role: card.role, company: card.company, email: card.email,
    phone: card.phone, website: card.website, location: card.location, bio: card.bio,
    category: card.category, theme: card.theme
  };
  setDraft(input);
    setEditingId(card.id);
    setErrors([]);
    setTab("studio");
    setShowQr(false);
    setMobilePreview(false);
  }

  function saveDraft() {
    const validation = validateCard(draft);
    setErrors(validation);
    if (validation.length) return;
    const now = new Date().toISOString();
    const next = editingId
      ? cards.map(card => card.id === editingId ? { ...card, ...draft, updatedAt: now } : card)
      : [createCard(draft), ...cards];
    setCards(next);
    const selected = editingId ?? next[0].id;
    setActiveId(selected);
    setNotice("명함을 이 기기에 저장했습니다.");
    setTab("gallery");
    setShowQr(false);
  }

  function exportJson(card: CardRecord) {
    const blob = new Blob([JSON.stringify(card, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `wallet-card-${card.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "contact"}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice("명함 JSON 파일을 내보냈습니다. 파일에 개인정보가 포함될 수 있습니다.");
  }

  async function copyVCard(card: CardRecord) {
    try {
      await navigator.clipboard.writeText(toVCard(card));
      setNotice("vCard 내용을 복사했습니다.");
    } catch {
      setNotice("클립보드 접근이 차단되었습니다. QR 또는 JSON 내보내기를 이용해 주세요.");
    }
  }

  const categories: { value: FilterValue; label: string }[] = [
    { value: "all", label: "전체" }, { value: "business", label: "비즈니스" },
    { value: "creative", label: "크리에이티브" }, { value: "personal", label: "개인" }
  ];

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="wordmark" href="#home" onClick={event => { event.preventDefault(); setTab("gallery"); }}>
          <span className="logo-box"><WalletCards size={19} /></span><span>wallet<span className="wordmark-light">card</span><span className="wordmark-studio"> STUDIO</span></span>
        </a>
        <nav className="main-nav" aria-label="주 메뉴">
          <button className={tab === "gallery" ? "nav-link active" : "nav-link"} onClick={() => setTab("gallery")}>명함 광장</button>
          <button className={tab === "studio" ? "nav-link active" : "nav-link"} onClick={() => setTab("studio")}>스튜디오</button>
        </nav>
        <div className="topbar-actions">
          <span className="local-status"><span /> 기기 내 저장</span>
          <button className="avatar-small" aria-label="현재 사용자">U</button>
        </div>
      </header>

      <main>
        {tab === "gallery" ? (
          <>
            <section className="hero">
              <div className="hero-copy">
                <div className="eyebrow"><span className="eyebrow-dot" /> YOUR IDENTITY, REIMAGINED</div>
                <h1>좋은 연결은<br /><span>좋은 인상</span>에서 시작됩니다.</h1>
                <p>나를 가장 잘 보여주는 디지털 명함을 만들고, 언제 어디서든 간편하게 공유하세요.</p>
                <div className="hero-actions"><button className="button-primary" onClick={startNew}><Plus size={17} /> 명함 만들기 <ArrowRight size={16} /></button><button className="button-secondary" onClick={() => document.getElementById("card-gallery")?.scrollIntoView({ behavior: "smooth" })}><Eye size={16} /> 샘플 둘러보기</button></div>
                <div className="hero-proof"><span><Check size={14} /> 설치 없이 시작</span><span><Check size={14} /> QR 코드 생성</span><span><Check size={14} /> 내 기기에 저장</span></div>
              </div>
              <div className="hero-art" aria-label="디지털 명함 미리보기">
                <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
                <div className="floating-card floating-back"><span className="floating-spark">✳</span><span>MAKE IT PERSONAL</span></div>
                <div className="floating-card floating-front"><div className="floating-brand"><Sparkles size={14} /> W / S</div><div className="floating-avatar">AM</div><strong>Alex Morgan</strong><span>Product Designer</span><div className="floating-lines"><i /><i /><i /></div><div className="floating-foot">CONNECT WITH INTENTION <ArrowRight size={13} /></div></div>
                <div className="art-caption"><span className="caption-line" /> A LITTLE CARD. A BIG IMPRESSION.</div>
              </div>
            </section>

            <section className="feature-strip" aria-label="주요 기능">
              <div><span className="feature-icon"><CreditCard size={18} /></span><span><strong>나만의 디자인</strong><small>브랜드에 맞춘 카드</small></span></div>
              <div><span className="feature-icon"><Grid2X2 size={18} /></span><span><strong>다양한 템플릿</strong><small>목적에 맞는 스타일</small></span></div>
              <div><span className="feature-icon"><ShieldCheck size={18} /></span><span><strong>로컬 우선</strong><small>QR은 이 기기에서 생성</small></span></div>
              <div><span className="feature-icon"><Link2 size={18} /></span><span><strong>쉬운 내보내기</strong><small>vCard 및 JSON 파일</small></span></div>
            </section>

            <section className="gallery-section" id="card-gallery">
              <div className="section-heading"><div><div className="eyebrow muted">THE COLLECTION</div><h2>명함 광장 <span className="count-badge">{filteredCards.length.toString().padStart(2, "0")}</span></h2><p>스타일을 탐색하고 나만의 명함으로 시작해 보세요.</p></div><button className="text-action" onClick={startNew}>새 명함 만들기 <ArrowRight size={15} /></button></div>
              <div className="gallery-tools"><div className="search-box"><Search size={16} /><input aria-label="명함 검색" value={query} onChange={event => setQuery(event.target.value)} placeholder="이름, 직무 또는 회사 검색" /></div><div className="filter-row" aria-label="명함 유형 필터"><Filter size={15} />{categories.map(item => <button key={item.value} className={filter === item.value ? "filter-chip selected" : "filter-chip"} onClick={() => setFilter(item.value)}>{item.label}</button>)}</div></div>
              <div className="gallery-grid">
                {filteredCards.map(card => <div className="gallery-item" key={card.id}><button className="preview-button" onClick={() => { setActiveId(card.id); editCard(card); }} aria-label={`${card.name} 명함 편집`}><CardPreview card={card} compact /></button><div className="gallery-item-meta"><div><strong>{card.name}</strong><span>{card.role}{card.company ? ` · ${card.company}` : ""}</span></div><button className="icon-button" aria-label={`${card.name} 명함 선택`} onClick={() => { setActiveId(card.id); setNotice(`${card.name} 명함을 선택했습니다.`); }}><ArrowRight size={17} /></button></div></div>)}
                {filteredCards.length === 0 && <div className="empty-state"><CircleHelp size={24} /><strong>검색 결과가 없습니다.</strong><span>다른 검색어를 입력하거나 새 명함을 만들어 보세요.</span><button className="button-secondary" onClick={startNew}>명함 만들기</button></div>}
              </div>
            </section>
          </>
        ) : (
          <section className="studio-page">
            <div className="studio-heading"><button className="back-link" onClick={() => setTab("gallery")}>← 명함 광장으로</button><div className="eyebrow muted">CARD BUILDER / 01</div><h1>{editingId ? "명함을 다듬어 보세요." : "나만의 명함을 만들어 보세요."}</h1><p>정보를 입력하면 미리보기에 바로 반영됩니다. 입력한 정보는 현재 브라우저에 저장됩니다.</p></div>
            <div className="studio-layout">
              <form className="editor-panel" onSubmit={event => { event.preventDefault(); saveDraft(); }}>
                <div className="panel-title"><span className="step-number">01</span><div><h2>기본 정보</h2><p>명함에 표시할 내용을 입력하세요.</p></div></div>
                <div className="form-grid">
                  <label className="field full">이름 <span>*</span><input autoComplete="name" value={draft.name} onChange={event => setDraft({ ...draft, name: event.target.value })} placeholder="예: Alex Morgan" /></label>
                  <label className="field">직무<input value={draft.role} onChange={event => setDraft({ ...draft, role: event.target.value })} placeholder="예: Product Designer" /></label>
                  <label className="field">회사 / 브랜드<input autoComplete="organization" value={draft.company} onChange={event => setDraft({ ...draft, company: event.target.value })} placeholder="예: Northstar Studio" /></label>
                  <label className="field full">이메일<input type="email" autoComplete="email" value={draft.email} onChange={event => setDraft({ ...draft, email: event.target.value })} placeholder="you@example.com" /></label>
                  <label className="field">전화번호<input type="tel" autoComplete="tel" value={draft.phone} onChange={event => setDraft({ ...draft, phone: event.target.value })} placeholder="+82 10 1234 5678" /></label>
                  <label className="field">웹사이트<input type="url" autoComplete="url" value={draft.website} onChange={event => setDraft({ ...draft, website: event.target.value })} placeholder="https://example.com" /></label>
                  <label className="field full">위치<input value={draft.location} onChange={event => setDraft({ ...draft, location: event.target.value })} placeholder="예: Seoul, South Korea" /></label>
                  <label className="field full">짧은 소개<textarea rows={3} maxLength={180} value={draft.bio} onChange={event => setDraft({ ...draft, bio: event.target.value })} placeholder="나를 소개하는 한 문장을 작성하세요." /><span className="field-hint">{draft.bio.length}/180</span></label>
                </div>
                <div className="panel-title second-title"><span className="step-number">02</span><div><h2>스타일 선택</h2><p>브랜드에 어울리는 톤을 고르세요.</p></div></div>
                <div className="theme-options">
                  {(["dark", "light", "violet"] as const).map(theme => <button type="button" key={theme} className={`theme-option swatch-${theme} ${draft.theme === theme ? "chosen" : ""}`} onClick={() => setDraft({ ...draft, theme })} aria-pressed={draft.theme === theme}><span className="swatch-dot" />{theme === "dark" ? "미드나이트" : theme === "light" ? "미니멀" : "바이올렛"}{draft.theme === theme && <Check size={14} />}</button>)}
                </div>
                <div className="category-options"><label className="field">명함 유형<select value={draft.category} onChange={event => setDraft({ ...draft, category: event.target.value as CardCategory })}><option value="business">비즈니스</option><option value="creative">크리에이티브</option><option value="personal">개인</option></select></label></div>
                {errors.length > 0 && <div className="error-list" role="alert">{errors.map(error => <p key={error}>{error}</p>)}</div>}
                <div className="form-actions"><button className="button-primary" type="submit"><Check size={16} /> {editingId ? "변경 사항 저장" : "명함 저장하기"}</button><button type="button" className="button-secondary" onClick={() => setMobilePreview(!mobilePreview)}><Eye size={16} /> {mobilePreview ? "편집 계속하기" : "미리보기 크게 보기"}</button></div>
                <p className="privacy-note"><LockKeyhole size={14} /> 브라우저 로컬 저장소를 사용합니다. 이 기능은 클라우드 백업이 아니며 기기·브라우저 데이터 삭제 시 내용이 사라질 수 있습니다.</p>
              </form>
              <aside className={`preview-panel ${mobilePreview ? "preview-expanded" : ""}`}><div className="preview-panel-head"><div><span className="eyebrow muted">LIVE PREVIEW</span><h2>실시간 미리보기</h2></div><span className="live-indicator"><i /> LIVE</span></div><CardPreview card={{ ...draft, id: editingId ?? "draft", createdAt: "", updatedAt: "" }} /><div className="preview-actions"><button className="button-secondary" type="button" onClick={() => { setActiveId(editingId ?? "draft"); setShowQr(true); }}><Grid2X2 size={16} /> vCard QR 보기</button><button className="button-secondary" type="button" onClick={() => { const errorsNow = validateCard(draft); setErrors(errorsNow); if (!errorsNow.length) { const card = { ...draft, id: editingId ?? "preview", createdAt: "", updatedAt: "" } as CardRecord; void copyVCard(card); } }}><Copy size={16} /> vCard 복사</button></div>
                {showQr && <div className="qr-panel"><div className="qr-head"><strong>vCard QR</strong><button className="icon-button" aria-label="QR 닫기" onClick={() => setShowQr(false)}><X size={16} /></button></div>{qrUrl ? <img className="qr-image" src={qrUrl} alt="명함 연락처 vCard QR 코드" /> : <div className="qr-placeholder">QR 생성 중…</div>}<p>QR에는 명함의 연락처 정보가 포함됩니다. 스캔한 사람이 해당 정보를 볼 수 있으니 공유 전에 확인하세요.</p></div>}
                <div className="wallet-callout"><div className="wallet-callout-icon"><WalletCards size={18} /></div><div><strong>Google Wallet</strong><p>실제 Wallet 패스 발급은 서버 연동 후 활성화됩니다.</p></div><span className="coming-soon">준비 중</span></div>
                <div className="wallet-callout security-callout"><div className="wallet-callout-icon"><ShieldCheck size={18} /></div><div><strong>보안 및 공유</strong><p>공개 링크는 만료·폐기 가능한 서버 토큰 기능이 구현된 뒤 제공됩니다.</p></div></div>
              </aside>
            </div>
          </section>
        )}
      </main>

      <footer className="site-footer"><a className="wordmark footer-wordmark" href="#home" onClick={event => { event.preventDefault(); setTab("gallery"); }}><span className="logo-box"><WalletCards size={16} /></span><span>wallet<span className="wordmark-light">card</span></span></a><span>Thoughtfully made for better connections.</span><div><a href="https://github.com/raonwglobal/walletCardStudio" target="_blank" rel="noreferrer">Project on GitHub <ArrowDownToLine size={13} /></a><span>v0.1 · MVP</span></div></footer>
      {notice && <div className="toast" role="status"><Check size={16} />{notice}<button aria-label="알림 닫기" onClick={() => setNotice("")}><X size={14} /></button></div>}
      <button className="help-button" aria-label="도움말" onClick={() => setNotice("현재 버전은 명함 편집, 로컬 저장, vCard QR 및 JSON 내보내기를 지원합니다. Wallet 발급과 서버 공유는 아직 연결되지 않았습니다.")}><CircleHelp size={19} /></button>
      <div className="mobile-bottom-nav"><button onClick={() => setTab("gallery")} className={tab === "gallery" ? "active" : ""}><LayoutTemplate size={18} />광장</button><button onClick={startNew}><Plus size={18} />만들기</button><button onClick={() => activeCard && editCard(activeCard)}><CreditCard size={18} />내 명함</button></div>
    </div>
  );
}

export default App;
