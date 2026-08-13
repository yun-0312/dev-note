"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CalendarDays, ExternalLink, FileText, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import type { Article } from "@/lib/articles";
import { formatDate, getDomain } from "@/lib/articles";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

export default function ArticleDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchArticle() {
            if (!id) return;
            setLoading(true);

            const { data, error } = await supabase
                .from("articles")
                .select("*")
                .eq("id", Number(id));

            if (error) {
                console.error("記事の取得に失敗しました", error);
            } else if (data && data.length > 0) {
                const item = data[0];
                setArticle({
                    id: String(item.id),
                    url: item.url,
                    title: item.title,
                    summary: item.summary || "",
                    tech_stack: item.tech_stack || [],
                    contents: item.contents || "",
                    createdAt: item.created_at,
                });
            }
            setLoading(false);
        }

        fetchArticle();
    }, [id]);

    if (loading) {
        return (
            <div className="container max-w-4xl py-12 text-center text-muted-foreground">
                読み込み中...
            </div>
        );
    }

    if (!article) {
        return (
            <div className="container max-w-4xl py-12 text-center">
                <p className="text-muted-foreground mb-4">記事が見つかりませんでした。</p>
                <Button variant="outline" onClick={() => router.push("/")}>
                    <ArrowLeft className="size-4 mr-2" />
                    一覧に戻る
                </Button>
            </div>
        );
    }

    const domain = article.url ? getDomain(article.url) : null;

    return (
        <div className="container mx-auto max-w-4xl py-8 flex flex-col gap-6">
            {/* 戻るボタン */}
            <div>
                <Button
                    variant="ghost"
                    onClick={() => router.push("/")}
                    className="gap-2 text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="size-4" />
                        一覧に戻る
                </Button>
            </div>

            {/* メインカード */}
            <Card className="flex flex-col">
                <CardHeader className="gap-4">
                    {/* バッジ */}
                    {domain ? (
                        <Badge variant="secondary" className="w-fit font-mono font-normal">
                            {domain}
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="w-fit gap-1 text-purple-700 border-purple-300 bg-purple-50">
                            <FileText className="size-3" />
                            知見ノート
                        </Badge>
                    )}

                    {/* タイトル */}
                    <CardTitle className="text-2xl sm:text-3xl font-bold leading-tight">
                        {article.title}
                    </CardTitle>

                    {/* メタ情報（日付・外部リング） */}
                    <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground border-b border-border pb-4">
                        <span className="flex items-center gap-1.5">
                            <CalendarDays className="size-4" />
                            {formatDate(article.createdAt)}
                        </span>

                        {article.url && (
                            <a
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-primary font-medium hover:underline"
                            >
                                元の記事を開く
                                <ExternalLink className="size-4" />
                            </a>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="flex flex-col gap-8 pt-2">
                    {/* 要約セクション */}
                    <div className="flex flex-col gap-2">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                            要約 / まとめ
                        </h3>
                        <p className="text-foreground leading-relaxed bg-muted/30 p-4 rounded-lg border border-border/50">
                            {article.summary}
                        </p>
                    </div>

                    {/* 技術スタック */}
                    {article.tech_stack && article.tech_stack.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                <Tag className="size-3.5" />
                                技術スタック
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {article.tech_stack.map((tech, index) => (
                                    <Badge key={index} variant="outline" className="font-mono">
                                        {tech}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 本文 / 壁打ちログ セクション */}
                    {article.contents && (
                        <div className="flex flex-col gap-2">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                テキスト / AI壁打ちログ
                            </h3>
                            {/*  マークダウン対応の表示エリア */}
                            <div className="bg-muted/50 p-6 rounded-lg border border-border/60 leading-relaxed overflow-x-auto">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    rehypePlugins={[rehypeHighlight]}
                                    components={{
                                        code({ node, inline, className, children, ...props }: any) {
                                            return !inline ? (
                                                <pre className="bg-black/90 text-white p-4 rounded-md my-3 overflow-x-auto font-mono text-xs">
                                                    <code className={className} {...props}>
                                                        {children}
                                                    </code>
                                                </pre>
                                            ) : (
                                                <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary" {...props}>
                                                    {children}
                                                </code>
                                            );
                                        },
                                        p({ children }) {
                                            return <p className="mb-4 last:mb-0 leading-relaxed">{children}</p>;
                                        },
                                        ul({ children }) {
                                            return <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>;
                                        },
                                        ol({ children }) {
                                            return <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>;
                                        },
                                    }}
                                >
                                    {article.contents}
                                </ReactMarkdown>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}