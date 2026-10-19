import { useCallback, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut, GoogleAuthProvider, type User } from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import { Check, Copy, Link2, LockKeyhole, ShieldCheck, X } from "lucide-react";
import type { CardRecord } from "../lib/cards";
import { getFirebaseServices, isFirebaseConfigured, isShareManagementConfigured } from "../lib/firebase";

const fieldOptions = [
  { value: "name", label: "이름" },
  { value: "role", label: "직무" },
  { value: "company", label: "회사 / 브랜드" },
  { value: "email", label: "이메일" },
  { value: "phone", label: "전화번호" },
  { value: "website", label: "웹사이트" },
  { value: "location", label: "위치" },
  { value: "bio", label: "소개" },
] as const;

type ShareField = (typeof fieldOptions)[number]["value"];
type ShareSummary = {
  shareId: string;
  fields: string[];
  createdAt: string | null;
  expiresAt: string | null;
  revoked: boolean;
  expired: boolean;
};
type CreateShareResponse = { token: string; shareId: string; expiresAt: string };
type ListSharesResponse = { shares: ShareSummary[] };

export default function SharePanel({ card, onNotice }: { card: CardRecord; onNotice: (message: string) => void }) {
  const [user, setUser] = useState<User | null>(null);
  const [configured, setConfigured] = useState(false);
  const [appCheckConfigured, setAppCheckConfigured] = useState(false);
  const [selectedFields, setSelectedFields] = useState<ShareField[]>(["name", "role", "company"]);
  const [expiresInDays, setExpiresInDays] = useState("7");
  const [shares, setShares] = useState<ShareSummary[]>([]);
  const [createdUrl, setCreatedUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const refreshShares = useCallback(async () => {
    const services = getFirebaseServices();
    if (!services) return;
    const callable = httpsCallable<Record<string, never>, ListSharesResponse>(services.functions, "listMyShares");
    const response = await callable({});
    setShares(response.data.shares);
  }, []);

  useEffect(() => {
    setConfigured(isFirebaseConfigured());
    setAppCheckConfigured(isShareManagementConfigured());
    const services = getFirebaseServices();
    if (!services) return;
    return onAuthStateChanged(services.auth, nextUser => {
      setUser(nextUser);
      if (nextUser && isShareManagementConfigured()) {
        void refreshShares().catch(() => setError("공유 목록을 불러오지 못했습니다. Firebase 설정과 권한을 확인해 주세요."));
      } else {
        setShares([]);
      }
    });
  }, [refreshShares]);

  async function signIn() {
    const services = getFirebaseServices();
    if (!services) return;
    setBusy(true);
    setError("");
    try {
      await signInWithPopup(services.auth, new GoogleAuthProvider());
    } catch {
      setError("로그인하지 못했습니다. Firebase Authentication과 승인 도메인을 확인해 주세요.");
    } finally {
      setBusy(false);
    }
  }

  async function createLink() {
    const services = getFirebaseServices();
    if (!services || !isShareManagementConfigured()) return;
    if (!card.name.trim()) {
      setError("공유할 명함의 이름을 입력해 주세요.");
      return;
    }
    if (!selectedFields.includes("name")) {
      setError("이름은 공개 필수 항목입니다.");
      return;
    }
    setBusy(true);
    setError("");
    setCreatedUrl("");
    try {
      const profile = {
        name: card.name,
        role: card.role,
        company: card.company,
        email: card.email,
        phone: card.phone,
        website: card.website,
        location: card.location,
        bio: card.bio,
      };
      const callable = httpsCallable<
        { profile: typeof profile; fields: ShareField[]; expiresInDays: number },
        CreateShareResponse
      >(services.functions, "createShare");
      const response = await callable({ profile, fields: selectedFields, expiresInDays: Number(expiresInDays) });
      const url = new URL(window.location.href);
      url.search = "";
      url.hash = "";
      url.searchParams.set("share", response.data.token);
      setCreatedUrl(url.toString());
      await refreshShares();
      onNotice("공유 링크를 만들었습니다. 링크를 받은 사람은 선택한 정보만 볼 수 있습니다.");
    } catch {
      setError("공유 링크를 만들지 못했습니다. 로그인, App Check, Functions 배포 및 Firestore 설정을 확인해 주세요.");
    } finally {
      setBusy(false);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(createdUrl);
      onNotice("공유 링크를 복사했습니다.");
    } catch {
      setError("자동 복사가 차단되었습니다. 링크 입력란에서 직접 복사해 주세요.");
    }
  }

  async function revoke(shareId: string) {
    const services = getFirebaseServices();
    if (!services || !isShareManagementConfigured()) return;
    setBusy(true);
    setError("");
    try {
      const callable = httpsCallable<{ shareId: string }, { revoked: boolean }>(services.functions, "revokeShare");
      await callable({ shareId });
      await refreshShares();
      onNotice("공유 링크를 폐기했습니다. 해당 링크로는 더 이상 명함을 볼 수 없습니다.");
    } catch {
      setError("공유 링크를 폐기하지 못했습니다. 연결 상태와 권한을 확인해 주세요.");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    const services = getFirebaseServices();
    if (services) await signOut(services.auth);
    setCreatedUrl("");
  }

  return (
    <section className="share-panel" aria-labelledby="share-panel-title">
      <div className="share-panel-heading">
        <span className="wallet-callout-icon"><ShieldCheck size={18} /></span>
        <div>
          <strong id="share-panel-title">보안 공개 링크</strong>
          <p>공개할 항목을 직접 선택하고 만료 또는 폐기할 수 있습니다.</p>
        </div>
      </div>

      {!configured && (
        <div className="share-setup-note" role="status">
          Firebase 설정이 필요합니다. 저장소의 <code>.env.example</code>을 참고해 환경 변수를 설정한 후 사용하세요.
        </div>
      )}

      {configured && !user && (
        <button type="button" className="button-secondary share-wide-button" onClick={() => void signIn()} disabled={busy}>
          <LockKeyhole size={15} /> Google로 로그인
        </button>
      )}

      {user && (
        <div className="share-user-row">
          <span>{user.displayName || user.email || "로그인 사용자"}</span>
          <button type="button" className="text-action" onClick={() => void logout()}>로그아웃</button>
        </div>
      )}

      {configured && user && !appCheckConfigured && (
        <div className="share-setup-note" role="alert">
          공유 생성과 폐기에는 <code>VITE_FIREBASE_APPCHECK_SITE_KEY</code> 설정이 필요합니다.
        </div>
      )}

      {configured && user && appCheckConfigured && (
        <>
          <div className="share-fields">
            <p className="share-subheading">공개할 정보</p>
            {fieldOptions.map(field => (
              <label key={field.value} className="share-field-option">
                <input
                  type="checkbox"
                  checked={selectedFields.includes(field.value)}
                  disabled={field.value === "name" || busy}
                  onChange={event => setSelectedFields(current =>
                    event.target.checked
                      ? [...current, field.value]
                      : current.filter(value => value !== field.value)
                  )}
                />
                <span>{field.label}</span>
              </label>
            ))}
          </div>
          <label className="share-expiry-field">
            링크 만료
            <select value={expiresInDays} onChange={event => setExpiresInDays(event.target.value)} disabled={busy}>
              <option value="1">1일</option>
              <option value="7">7일</option>
              <option value="30">30일</option>
              <option value="90">90일</option>
            </select>
          </label>
          <button type="button" className="button-primary share-wide-button" onClick={() => void createLink()} disabled={busy}>
            <Link2 size={15} /> {busy ? "처리 중…" : "공유 링크 만들기"}
          </button>
          {createdUrl && (
            <div className="created-share-link">
              <label htmlFor="created-share-url">새 공유 링크</label>
              <input id="created-share-url" readOnly value={createdUrl} onFocus={event => event.currentTarget.select()} />
              <button type="button" className="button-secondary share-wide-button" onClick={() => void copyLink()}>
                <Copy size={15} /> 링크 복사
              </button>
            </div>
          )}
          <div className="share-list">
            <p className="share-subheading">내 공유 링크</p>
            {shares.length === 0 && <p className="share-muted">아직 생성한 링크가 없습니다.</p>}
            {shares.map(share => {
              const unavailable = share.revoked || share.expired;
              return (
                <div className="share-list-item" key={share.shareId}>
                  <div>
                    <strong>{share.fields.join(" · ")}</strong>
                    <span>{share.expiresAt ? `만료: ${new Date(share.expiresAt).toLocaleString()}` : "만료 정보 없음"}</span>
                    <span className={unavailable ? "share-status inactive" : "share-status"}>{share.revoked ? "폐기됨" : share.expired ? "만료됨" : "활성"}</span>
                  </div>
                  {!unavailable && (
                    <button type="button" className="text-action danger-action" disabled={busy} onClick={() => void revoke(share.shareId)}>
                      <X size={14} /> 폐기
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {error && <p className="share-error" role="alert">{error}</p>}
      <p className="share-privacy-note">링크에는 프로필 정보가 아니라 무작위 토큰만 포함됩니다. 공유 링크는 생성된 시점의 정보 스냅샷을 표시합니다.</p>
    </section>
  );
}
