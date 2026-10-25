import { useState } from "react";
import { ArrowLeftRight, Globe2, Mail, MapPin, Phone, Sparkles } from "lucide-react";
import type { CardRecord } from "../lib/cards";

type Props = {
  card: CardRecord;
  templateId?: string;
  title?: string;
  compact?: boolean;
};

const photoByTemplate: Record<string, string> = {
  "template-violet": "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=85",
  "template-founder": "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=85",
  "template-portfolio": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=85",
  "template-personal": "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1200&q=85"
};

export default function CardDesignShowcase({ card, templateId = "", title, compact = false }: Props) {
  const [side, setSide] = useState<"front" | "back">("front");
  const photo = photoByTemplate[templateId];
  const initials = card.name.trim().split(/\\s+/).map(part => part[0]).join("").slice(0, 2).toUpperCase() || "YO";
  const displayTitle = title || card.name || "디자인 미리보기";

  return (
    <div className={`design-showcase ${compact ? "showcase-compact" : "showcase-detail"} theme-${card.theme}`}>
      {!compact && <div className="showcase-toolbar"><div><span className="eyebrow muted">DESIGN PREVIEW</span><strong>{displayTitle}</strong></div><div className="side-switch" role="group" aria-label="명함 앞면과 뒷면 보기"><button type="button" className={side === "front" ? "active" : ""} onClick={() => setSide("front")} aria-pressed={side === "front"}>앞면</button><button type="button" className={side === "back" ? "active" : ""} onClick={() => setSide("back")} aria-pressed={side === "back"}>뒷면</button><button type="button" className="flip-button" onClick={() => setSide(side === "front" ? "back" : "front")} aria-label="명함 앞면과 뒷면 전환"><ArrowLeftRight size={15} /></button></div></div>}
      <article className={`showcase-card showcase-${side} ${photo ? "has-photo" : ""} ${templateId}`} style={photo && side === "front" ? { backgroundImage: `linear-gradient(115deg, rgba(12,12,18,.88), rgba(12,12,18,.25)), url("${photo}")` } : undefined}>
        {side === "front" ? <>
          <div className="showcase-brand"><span className="showcase-mark"><Sparkles size={compact ? 12 : 17} /></span><span>WALLET / STUDIO</span><small>PERSONAL IDENTITY</small></div>
          <div className="showcase-front-content">
            {photo && <div className="showcase-photo-chip">VISUAL EDITION</div>}
            <div className="showcase-initials">{initials}</div>
            <h3>{card.name || "Your name"}</h3>
            <p className="showcase-role">{card.role || "Your role"}{card.company ? ` · ${card.company}` : ""}</p>
            {!compact && card.bio && <p className="showcase-bio">{card.bio}</p>}
          </div>
          <div className="showcase-footer"><span>{card.location || "YOUR NEXT CONNECTION"}</span><span>01 / 02</span></div>
        </> : <>
          <div className="showcase-back-heading"><span className="showcase-mark"><Sparkles size={compact ? 12 : 17} /></span><span>LET'S CONNECT</span></div>
          <div className="showcase-back-content">
            <h3>{card.name || "Your name"}</h3>
            {card.role && <p className="showcase-back-role">{card.role}{card.company ? ` · ${card.company}` : ""}</p>}
            <div className="showcase-contact-list">
              {card.email && <div><Mail size={compact ? 11 : 15} /><span>{card.email}</span></div>}
              {card.phone && <div><Phone size={compact ? 11 : 15} /><span>{card.phone}</span></div>}
              {card.website && <div><Globe2 size={compact ? 11 : 15} /><span>{card.website.replace(/^https?:\\/\\//, "")}</span></div>}
              {card.location && <div><MapPin size={compact ? 11 : 15} /><span>{card.location}</span></div>}
            </div>
            {!compact && card.bio && <p className="showcase-back-bio">{card.bio}</p>}
          </div>
          <div className="showcase-footer"><span>{card.company || "WALLET / STUDIO"}</span><span>02 / 02</span></div>
        </>}
      </article>
      {compact && <button type="button" className="compact-side-toggle" onClick={() => setSide(side === "front" ? "back" : "front")} aria-label={`${displayTitle} ${side === "front" ? "뒷면" : "앞면"} 보기`}>{side === "front" ? "뒷면 보기" : "앞면 보기"} <ArrowLeftRight size={12} /></button>}
      {!compact && <p className="showcase-hint">앞면과 뒷면을 전환해 디자인과 연락처 배치를 확인하세요. 사진이 있는 템플릿은 앞면에 이미지가 포함됩니다.</p>}
    </div>
  );
}
