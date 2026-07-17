"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(
    searchParams.get("error") === "unauthorized" ? "このアカウントはアクセスできません" : ""
  );
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    await authClient.signIn.social({ provider: "google", callbackURL: "/" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await authClient.signIn.email({ email, password });
        if (error) setError(error.message ?? "ログインに失敗しました");
        else { router.push("/"); router.refresh(); }
      } else {
        const { error } = await authClient.signUp.email({ email, password, name });
        if (error) setError(error.message ?? "登録に失敗しました");
        else { router.push("/"); router.refresh(); }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between bg-[#0F172A] w-[420px] shrink-0 p-12">
        <div>
          <p className="text-white font-black text-xl tracking-tight">
            Atelier<span className="text-indigo-400">学習</span>
          </p>
        </div>
        <div>
          <p className="text-3xl font-black text-white tracking-tight leading-snug mb-4">
            動画で学ぶ、<br />自分のペースで。
          </p>
          <p className="text-slate-400 text-sm leading-relaxed">
            プロの講師が制作した高品質なコースで、<br />新しいスキルを身につけましょう。
          </p>
        </div>
        <p className="text-slate-600 text-xs">© 2026 Atelier学習</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <p className="text-[#111110] font-black text-xl tracking-tight">
              Atelier<span className="text-indigo-600">学習</span>
            </p>
          </div>

          <h2 className="text-2xl font-black text-[#111110] tracking-tight mb-1">
            {mode === "login" ? "おかえりなさい" : "アカウント作成"}
          </h2>
          <p className="text-sm text-[#6B6B6B] mb-8">
            {mode === "login" ? "アカウントにログインしてください" : "無料で始めましょう"}
          </p>

          {/* Google button */}
          <button
            type="button"
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 border border-[#E5E4E0] bg-white hover:bg-[#F8F7F4] text-sm font-medium text-[#111110] transition-colors mb-6"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google でログイン
          </button>

          <div className="flex items-center gap-3 mb-6">
            <hr className="flex-1 border-[#E5E4E0]" />
            <span className="text-xs text-[#6B6B6B]">またはメールで</span>
            <hr className="flex-1 border-[#E5E4E0]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-xs font-semibold text-[#111110] uppercase tracking-wider mb-1.5">名前</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full border border-[#E5E4E0] bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-[#111110] uppercase tracking-wider mb-1.5">メールアドレス</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full border border-[#E5E4E0] bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#111110] uppercase tracking-wider mb-1.5">パスワード</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                className="w-full border border-[#E5E4E0] bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            {error && <p className="text-red-600 text-xs">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold disabled:opacity-50 transition-colors"
            >
              {loading ? "処理中..." : mode === "login" ? "ログイン" : "登録する"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#6B6B6B]">
            {mode === "login" ? (
              <>アカウントをお持ちでない方は{" "}
                <button onClick={() => { setMode("register"); setError(""); }} className="text-indigo-600 font-medium hover:underline">新規登録</button>
              </>
            ) : (
              <>すでにアカウントをお持ちの方は{" "}
                <button onClick={() => { setMode("login"); setError(""); }} className="text-indigo-600 font-medium hover:underline">ログイン</button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
