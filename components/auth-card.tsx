"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Mail, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Mode = "login" | "signup";

export function AuthCard() {
    const [mode, setMode] = useState<Mode>("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const isSignup = mode === "signup";

    function switchMode(next: Mode) {
        if (next === mode) return;
        setMode(next);
        setError(null);
        setPassword("");
        setConfirm("");
    }

    function validate(): string | null {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim()) return "メールアドレスを入力してください。";
        if (!emailPattern.test(email))
        return "メールアドレスの形式が正しくありません。";
        if (!password) return "パスワードを入力してください。";
        if (password.length < 8)
        return "パスワードは 8 文字以上で入力してください。";
        if (isSignup && password !== confirm) return "パスワードが一致しません。";
        return null;
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        setError(null);

        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        try {
            if (isSignup) {
                const { error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (signUpError) throw signUpError;

                toast.success("アカウントを作成しました！ログインしてください。");
                setMode("login");
            } else {
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (signInError) throw signInError;

                toast.success("ログインしました！");
                router.push("/");
                router.refresh();
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : "エラーが発生しました。");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="gap-2">
                {/* モード切り替えタブ */}
                <div
                className="flex rounded-lg bg-muted p-1"
                role="tablist"
                aria-label="認証モード"
                >
                    <button
                        type="button"
                        role="tab"
                        aria-selected={!isSignup}
                        onClick={() => switchMode("login")}
                        className={cn(
                        "flex-1 rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
                        !isSignup
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                    >
                        ログイン
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={isSignup}
                        onClick={() => switchMode("signup")}
                        className={cn(
                        "flex-1 rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
                        isSignup
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                    >
                        新規登録
                    </button>
                </div>
                <CardTitle className="text-xl text-pretty">
                {isSignup ? "アカウントを作成" : "おかえりなさい"}
                </CardTitle>
                <CardDescription className="text-pretty">
                {isSignup
                    ? "メールアドレスとパスワードを入力して登録してください。"
                    : "メールアドレスとパスワードを入力してログインしてください。"}
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form
                id="auth-form"
                onSubmit={handleSubmit}
                className="flex flex-col gap-4"
                noValidate
                >
                {error ? (
                    <div
                    role="alert"
                    className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
                    >
                    <AlertCircle
                        className="mt-0.5 size-4 shrink-0"
                        aria-hidden="true"
                    />
                    <span className="text-pretty">{error}</span>
                    </div>
                ) : null}

                <div className="flex flex-col gap-2">
                    <Label htmlFor="email">メールアドレス</Label>
                    <div className="relative">
                    <Mail
                        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                        aria-hidden="true"
                    />
                    <Input
                        id="email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        aria-invalid={!!error && !email.trim()}
                        className="pl-9"
                    />
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="password">パスワード</Label>
                    <div className="relative">
                    <Lock
                        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                        aria-hidden="true"
                    />
                    <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete={isSignup ? "new-password" : "current-password"}
                        placeholder="8 文字以上"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        className="px-9"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        disabled={loading}
                        aria-label={
                        showPassword ? "パスワードを隠す" : "パスワードを表示"
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                    >
                        {showPassword ? (
                        <EyeOff className="size-4" aria-hidden="true" />
                        ) : (
                        <Eye className="size-4" aria-hidden="true" />
                        )}
                    </button>
                    </div>
                </div>

                {isSignup ? (
                    <div className="flex flex-col gap-2">
                    <Label htmlFor="confirm">パスワード（確認）</Label>
                    <div className="relative">
                        <Lock
                        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                        aria-hidden="true"
                        />
                        <Input
                        id="confirm"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="もう一度入力"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        disabled={loading}
                        className="pl-9"
                        />
                    </div>
                    </div>
                ) : null}

                {!isSignup ? (
                    <button
                    type="button"
                    className="-mt-1 self-end text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                    パスワードをお忘れですか？
                    </button>
                ) : null}
                </form>
            </CardContent>

            <CardFooter className="flex-col gap-4">
                <Button
                type="submit"
                form="auth-form"
                className="w-full"
                disabled={loading}
                >
                {loading ? (
                    <>
                    <Loader2
                        className="animate-spin"
                        data-icon="inline-start"
                        aria-hidden="true"
                    />
                    {isSignup ? "登録中..." : "ログイン中..."}
                    </>
                ) : isSignup ? (
                    "アカウントを作成"
                ) : (
                    "ログイン"
                )}
                </Button>
                <p className="text-center text-sm text-muted-foreground text-pretty">
                {isSignup
                    ? "すでにアカウントをお持ちですか？"
                    : "アカウントをお持ちでない場合は"}{" "}
                <button
                    type="button"
                    onClick={() => switchMode(isSignup ? "login" : "signup")}
                    disabled={loading}
                    className="font-medium text-primary underline-offset-4 hover:underline disabled:opacity-50"
                >
                    {isSignup ? "ログイン" : "新規登録"}
                </button>
                </p>
            </CardFooter>
        </Card>
    );
}
