'use client';

import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Article } from "@/lib/articles";

type ArticleEditModalProps = {
    article: Article | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (id: string, data: { title: string; summary: string; tech_stack?: string[]; contents?: string; url?: string }) => Promise<boolean>;
}

export function ArticleEditModal({ article, isOpen, onClose, onUpdate,}: ArticleEditModalProps) {
    const [title, setTitle] = useState("");
    const [summary, setSummary] = useState("");
    const [techStackInput, setTechStackInput] = useState("");
    const [contents, setContents] = useState("");
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (article) {
            setTitle(article.title || "");
            setSummary(article.summary || "");
            setTechStackInput(article.tech_stack ? article.tech_stack.join(",") : "");
            setContents(article.contents || "");
            setUrl(article.url || "");
        }
    }, [article]);

    if (!article) return null;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!article) return;

        setLoading(true);

        const techStackArray = techStackInput
            ? techStackInput.split(",").map((t) => t.trim()).filter(Boolean)
            : [];

        const success = await onUpdate(article.id, {
            title,
            summary,
            tech_stack: techStackArray,
            contents,
            url,
        });

        setLoading(false);
        if (success) {
            onClose();
        }
    }

return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] w-[95vw] max-h-[85vh] flex flex-col p-6 overflow-hidden">
                <DialogHeader className="flex-shrink-0 pb-2">
                    <DialogTitle>記事を編集</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4 overflow-y-auto pr-2">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="edit-title">タイトル</Label>
                        <Input
                            id="edit-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="edit-tech">技術スタック</Label>
                        <Input
                            id="edit-tech"
                            value={techStackInput}
                            onChange={(e) => setTechStackInput(e.target.value)}
                            placeholder="React, Next.js など（カンマ区切り）"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="edit-summary">要約 / メモ</Label>
                        <Textarea
                            id="edit-summary"
                            rows={4}
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="edit-url">記事のURL</Label>
                        <Input
                            id="edit-url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="edit-contents">コンテンツ</Label>
                        <Textarea
                            id="edit-contents"
                            rows={12}
                            value={contents}
                            onChange={(e) => setContents(e.target.value)}
                            className="font-mono text-xs leading-relaxed"
                        />
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            キャンセル
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "保存中..." : "保存する"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}