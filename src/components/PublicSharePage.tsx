import { useEffect, useState } from "react";
import { httpsCallable } from "firebase/functions";
import { getFirebaseServices } from "../lib/firebase";

type PublicProfile = Record<string, string>;
type ResolveShareResponse = { profile: PublicProfile; fields: string[]; expiresAt: string };
const fieldLabels: Record<string, string> = {
  role: "직무",
  company: "회사 / 브랜드",
  email: "이메일",
  phone: "전화번호",
  website: "웹사이트",
  location: "위치",
  bio: "소개",
};

export default function PublicSharePage({ token }: { token: string }) {
  const [profile, setProfile] = useState<ResolveShareResponse | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "unavailable" | "unconfigured">("loading");

  useEffect(() => {
    let cancelled = false;
    const services = getFirebaseServices();
    if (!services) {
      setStatus("unconfigured");
      return;
    }
    const callable = httpsCallable<{ token: string }, ResolveShareResponse>(services.functions, "resolveShare");
    callable({ token })
      .then(result => {
        if (!cancelled) {
          setProfile(result.data);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("unavailable");
      });
    return () => { cancelled = true; };
  }, [token]);

  if (status === "loading") {
    return <main className="public-share-page"><p role="status">공유 명함을 불러오는 중입니다…</p></main>;
  }
  if (status === "unconfigured") {
    return <main className="public-share-page"><h1>공유 링크를 열 수 없습니다.</h1><p>서비스 설정이 아직 완료되지 않았습니다.</p><a href="/">Wallet Card Studio로 돌아가기</a></main>;
  }
  if (status !== "ready" || !profile) {
    return <main className="public-share-page"><h1>이 공유 링크를 사용할 수 없습니다.</h1><p>링크가 만료되었거나 폐기되었거나 올바르지 않습니다.</p><a href="/">Wallet Card Studio로 돌아가기</a></main>;
  }

  return (
    <main className="public-share-page">
      <a className="public-share-brand" href="/">WALLET / STUDIO</a>
      <article className="public-share-card">
        <div className="eyebrow muted">SHARED DIGITAL CARD</div>
        <h1>{profile.profile.name}</h1>
        {profile.fields.filter(field => field !== "name" && profile.profile[field]).map(field => (
          <div className="public-share-field" key={field}>
            <span>{fieldLabels[field] ?? field}</span>
            <p>{profile.profile[field]}</p>
          </div>
        ))}
        <p className="public-share-expiry">이 링크는 {new Date(profile.expiresAt).toLocaleDateString()}까지 유효합니다.</p>
      </article>
      <a href="/">Wallet Card Studio로 돌아가기</a>
    </main>
  );
}
