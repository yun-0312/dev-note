"use client";

import { useState } from "react";
import { Inbox } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { ArticleForm } from "@/components/article-form";
import { ArticleCard } from "@/components/article-card";
import { Card } from "@/components/ui/card";
import { useArticles } from "@/hooks/useArticles";
import { ArticleEditModal } from "@/components/article-edit-modal";
import type { Article } from "@/lib/articles";


export function Dashboard() {

    const { articles, addArticle, updateArticle, deleteArticle } = useArticles();

    const [editingArticle, setEditingArticle] = useState<Article | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const handleOpenEdit = (article: Article) => {
        setEditingArticle(article);
        setIsEditModalOpen(true);
    }

    return (
        <div className="min-h-screen bg-background">
        <DashboardHeader count={articles.length} />

        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
            <div className="flex flex-col gap-8">
            <section aria-labelledby="form-heading">
                <h2
                id="form-heading"
                className="mb-3 text-sm font-medium text-muted-foreground"
                >
                新しい記事を保存
                </h2>
                <ArticleForm onAdd={addArticle} />
            </section>

            <section aria-labelledby="list-heading">
                <div className="mb-4 flex items-baseline justify-between">
                <h2
                    id="list-heading"
                    className="text-base font-semibold tracking-tight"
                >
                    保存した記事
                </h2>
                <span className="font-mono text-sm text-muted-foreground tabular-nums">
                    {articles.length} 件
                </span>
                </div>

                {articles.length === 0 ? (
                <Card className="border-dashed">
                    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
                    <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <Inbox className="size-6" aria-hidden="true" />
                    </span>
                    <h3 className="text-base font-semibold">
                        まだ記事がありません
                    </h3>
                    <p className="max-w-sm text-sm text-muted-foreground text-pretty">
                        上のフォームから気になる技術記事の URL
                        を保存すると、ここに一覧で表示されます。
                    </p>
                    </div>
                </Card>
                ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {articles.map((article) => (
                    <ArticleCard
                        key={article.id}
                        article={article}
                        onEdit={handleOpenEdit}
                        onDelete={deleteArticle}
                    />
                    ))}
                </div>
                )}
            </section>
            </div>
            </main>
            <ArticleEditModal
                article={editingArticle}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onUpdate={async (id, data) => {
                    const success = await updateArticle(id, data);
                    return success;
                }}
            />
        </div>
    );
}
