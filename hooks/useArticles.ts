"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import type { Article } from "@/lib/articles";
import { supabase } from "@/lib/supabase";

type ArticleDraft = {
    url?: string | null;
    title: string;
    summary: string;
    contents?: string | null;
    tech_stack?: string[] | string | null;
};

export function useArticles() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchArticles = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("articles")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("取得エラー：", error);
            toast.error("記事の取得に失敗しました");
        } else {
            const formatted: Article[] = (data || []).map((item) => ({
                id: String(item.id),
                url: item.url,
                title: item.title,
                summary: item.summary || "",
                tech_stack: item.tech_stack || [],
                contents: item.contents || "",
                createdAt: item.created_at,
            }));
            setArticles(formatted);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchArticles();
    }, [fetchArticles]);

    const addArticle = async (draft: ArticleDraft) => {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            toast.error("ログイン情報が取得できませんでした。再ログインしてください。");
            return false;
        }

        let techStackArray: string[] = [];
        if (typeof draft.tech_stack === "string") {
            techStackArray = draft.tech_stack.split(",").map((t) => t.trim()).filter(Boolean);
        } else if (Array.isArray(draft.tech_stack)) {
            techStackArray = draft.tech_stack;
        }

        const { error } = await supabase
            .from("articles")
            .insert([
                {
                    url: draft.url || null,
                    title: draft.title,
                    summary: draft.summary,
                    tech_stack: techStackArray,
                    contents: draft.contents || null,
                    user_id: user.id,
                },
            ]);

        if (error) {
            console.error("保存エラー:", error);
            toast.error("記事の保存に失敗しました");
            return false;
        }

        toast.success("知見ノートを保存しました！");
        await fetchArticles();
        return true;
    };

    const updateArticle = async (id: string, updatedData: { url?: string | null; title: string; summary: string; tech_stack?: string[] | string | null; contents?: string | null; }) => {

        let techStackArray: string[] = [];
        if (Array.isArray(updatedData.tech_stack)) {
            techStackArray = updatedData.tech_stack;
        } else if (typeof updatedData.tech_stack === "string") {
            techStackArray = updatedData.tech_stack.split(",").map((t: string) => t.trim()).filter(Boolean);
        }

        const { error } = await supabase
            .from("articles")
            .update({
                title: updatedData.title,
                summary: updatedData.summary,
                tech_stack: techStackArray,
                contents: updatedData.contents || null,
                url: updatedData.url || null,
            })
            .eq("id", Number(id));

        if (error) {
            console.error("更新エラー:", error);
            toast.error("記事の更新に失敗しました");
            return false;
        }

        toast.success("記事を更新しました！");
        await fetchArticles();
        return true;
    };

    const deleteArticle = (id: string) => {
        toast("この記事を削除しますか？", {
            description: "この操作は取り消せません。",
            action: {
                label: "削除する",
                onClick: async () => {
                    console.log("削除実行:", id);

                    const { error } = await supabase
                        .from("articles")
                        .delete()
                        .eq("id", Number(id));

                    if (error) {
                        console.error("削除エラー:", error);
                        toast.error("記事の削除に失敗しました", {
                            duration: 2000,
                        });
                        return;
                    }

                    setArticles((prev) => prev.filter((a) => a.id !== id));
                    toast.success("記事を削除しました", {
                        duration: 2000,
                    });
                },
            },
            cancel: {
                label: "キャンセル",
                onClick: () => {
                    console.log("削除がキャンセルされました");
                },
            },
        });
    };

    return {
        articles,
        loading,
        addArticle,
        updateArticle,
        deleteArticle,
    };
}