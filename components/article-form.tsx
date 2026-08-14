"use client";

import { useState } from "react";
import { Plus, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { guessTitleFromUrl } from "@/lib/articles";

type ArticleDraft = {
    url?: string | null;
    title: string;
    summary: string;
    contents?: string | null;
    tech_stack?: string | null;
};

function isValidUrl(value: string) {
    try {
        const parsed = new URL(value);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
        return false;
    }
}

export function ArticleForm({
    onAdd,
}: {
    onAdd: (draft: ArticleDraft) => void;
}) {
    const [url, setUrl] = useState("");
    const [title, setTitle] = useState("");
    const [summary, setSummary] = useState("");
    const [techStack, setTechStack] = useState("");
    const [contents, setContents] = useState("");
    const [aiLoading, setAiLoading] = useState(false);

    async function handleAiSummarize() {
        const trimmedUrl = url.trim();
        const trimmedContents = contents.trim();

        if (!trimmedUrl && !trimmedContents) {
            toast.error("URLまたはテキストのどちらかを入力して下さい");
            return;
        }

        //URLが入力されているのに「無効なURL」の場合にエラー
        if (trimmedUrl && !isValidUrl(trimmedUrl)) {
            toast.error("有効なURLを入力してください");
            return;
        }

        try {
            setAiLoading(true);
            toast.loading("AIが記事を読み込んでいます...");

            const response = await fetch("/api/summarize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    url: trimmedUrl || undefined,
                    contents: trimmedContents || undefined,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "要約に失敗しました");
            }

            setTitle(data.title);
            setSummary(data.summary);
            setTechStack(Array.isArray(data.tech_stack) ? data.tech_stack.join(", ") : data.tech_stack);

            toast.dismiss();
            toast.success("AIがタイトルと要約を作成しました！");
        } catch (error: any) {
            toast.dismiss();
            toast.error(error.message || "AIの処理中にエラーが発生しました");
        } finally {
            setAiLoading(false);
        }
    }

    function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        const trimmedUrl = url.trim();
        const trimmedContents = contents.trim();

        if (!trimmedUrl && !trimmedContents) {
            toast.error("URLまたはテキストのいずれかを入力してください");
            return;
        }

        if (trimmedUrl && !isValidUrl(trimmedUrl)) {
            toast.error("有効な URL を入力してください（http:// または https://）");
            return;
        }

        onAdd({
            url: trimmedUrl || null,
            contents: trimmedContents || null,
            title: title.trim() || (trimmedUrl ? guessTitleFromUrl(trimmedUrl) : "無題のノート"),
            summary:
                summary.trim() ||
                "まだ要約がありません。あとで内容を読んで追記しましょう。",
            tech_stack: techStack.trim() || null,
        });

        setUrl("");
        setTitle("");
        setSummary("");
        setTechStack("");
        setContents("");
    }

    return (
        <Card>
        <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <Label htmlFor="article-url">記事の URL（任意）</Label>
                <Input
                    id="article-url"
                    type="url"
                    inputMode="url"
                    placeholder="https://example.com/great-article"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1"
                        />
                <div className="flex flex-col gap-2">
                    <Label htmlFor="article-contents">テキスト / AI壁打ちログ（任意）</Label>
                    <Textarea
                        id="article-contents"
                        rows={8}
                        placeholder="ChatGPTなどとのやり取りや、自分で残したいメモをここにペタッと貼り付けてください"
                        value={contents}
                        onChange={(e) => setContents(e.target.value)}
                        className="min-h-[200px]"
                    />
                </div>

                <Button
                    type="button"
                    variant="outline"
                    onClick={handleAiSummarize}
                    disabled={aiLoading}
                    className="shrink-0 gap-1.5 border-purple-300 text-purple-700 hover:bg-purple-50"
                >
                    {aiLoading ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <Sparkles className="size-4 text-purple-600" />
                    )}
                    AI自動生成
                </Button>
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="article-title">タイトル（任意）</Label>
                <Input
                id="article-title"
                placeholder="未入力の場合は URL から自動で推測します"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                />
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="article-summary">要約 / メモ（任意）</Label>
                <Textarea
                id="article-summary"
                rows={3}
                placeholder="この記事のポイントや、あとで読む理由を書いておきましょう"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                />
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="article-tech">技術スタック</Label>
                <Input
                id="article-tech"
                placeholder="例：React, Supabase"
                value={techStack}
                onChange={(e) => setTechStack(e.target.value)}
            />
            </div>

            <Button type="submit" className="w-full sm:w-auto sm:self-end">
                <Plus className="size-4" aria-hidden="true" />
                記事を保存
            </Button>
            </form>
        </CardContent>
        </Card>
    );
}
