import type { CardRecord } from "./cards";

export interface CardTemplate {
  id: string;
  title: string;
  description: string;
  card: CardRecord;
}

const timestamp = "2026-01-01T00:00:00.000Z";

export const cardTemplates: CardTemplate[] = [
  {
    id: "template-midnight", title: "미드나이트 프로", description: "신뢰감 있는 비즈니스 스타일",
    card: { id: "template-midnight", name: "Alex Morgan", role: "Managing Director", company: "Northstar Group", email: "hello@example.com", phone: "+82 10 1234 5678", website: "https://example.com", location: "Seoul, South Korea", bio: "Building meaningful business connections.", category: "business", theme: "dark", createdAt: timestamp, updatedAt: timestamp }
  },
  {
    id: "template-minimal", title: "미니멀 에디션", description: "깔끔하고 절제된 개인 브랜딩",
    card: { id: "template-minimal", name: "Jamie Chen", role: "Independent Consultant", company: "JC Studio", email: "jamie@example.com", phone: "+82 10 2345 6789", website: "https://example.com", location: "Busan, South Korea", bio: "Clarity in every connection.", category: "personal", theme: "light", createdAt: timestamp, updatedAt: timestamp }
  },
  {
    id: "template-violet", title: "크리에이티브 바이올렛", description: "디자이너와 창작자를 위한 감각적인 스타일",
    card: { id: "template-violet", name: "Taylor Rivera", role: "Creative Director", company: "Studio TR", email: "studio@example.com", phone: "+82 10 3456 7890", website: "https://example.com", location: "Seoul, South Korea", bio: "Ideas, identity and visual stories.", category: "creative", theme: "violet", createdAt: timestamp, updatedAt: timestamp }
  },
  {
    id: "template-founder", title: "스타트업 파운더", description: "대표·창업자용 정보 중심 구성",
    card: { id: "template-founder", name: "Morgan Lee", role: "Founder & CEO", company: "Next Chapter", email: "morgan@example.com", phone: "+82 10 4567 8901", website: "https://example.com", location: "Incheon, South Korea", bio: "Turning bold ideas into useful products.", category: "business", theme: "dark", createdAt: timestamp, updatedAt: timestamp }
  },
  {
    id: "template-portfolio", title: "포트폴리오 카드", description: "포트폴리오와 웹사이트를 강조",
    card: { id: "template-portfolio", name: "Robin Park", role: "Product Designer", company: "Independent", email: "robin@example.com", phone: "+82 10 5678 9012", website: "https://example.com", location: "Daejeon, South Korea", bio: "Designing digital products people love.", category: "creative", theme: "violet", createdAt: timestamp, updatedAt: timestamp }
  },
  {
    id: "template-personal", title: "퍼스널 네트워크", description: "가볍게 나를 소개하는 친근한 스타일",
    card: { id: "template-personal", name: "Casey Kim", role: "Community Builder", company: "Open Circle", email: "casey@example.com", phone: "+82 10 6789 0123", website: "https://example.com", location: "Jeju, South Korea", bio: "Connecting people and possibilities.", category: "personal", theme: "light", createdAt: timestamp, updatedAt: timestamp }
  }
];
