export type Article = {
    id: string;
    url: string | null;
    title: string;
    summary: string;
    tech_stack: string[];
    contents: string | null;
    createdAt: string;
};

/** URL からホスト名（ドメイン）を取り出す。失敗した場合は元の文字列を返す。 */
export function getDomain(url: string): string {
    try {
        return new URL(url).hostname.replace(/^www\./, "");
    } catch {
        return url;
    }
}

/** ISO 日付文字列を日本語表記（例: 2026年8月11日）にフォーマットする。 */
export function formatDate(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return new Intl.DateTimeFormat("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
    }).format(date);
}

/** URL から人間が読みやすい仮タイトルを推測する。 */
export function guessTitleFromUrl(url: string): string {
    try {
        const { hostname, pathname } = new URL(url);
        const slug = pathname.split("/").filter(Boolean).pop();
        if (slug) {
        return decodeURIComponent(slug)
            .replace(/[-_]+/g, " ")
            .replace(/\.(html?|php|aspx?)$/i, "")
            .trim();
        }
        return hostname.replace(/^www\./, "");
    } catch {
        return url;
    }
}

export const seedArticles: Article[] = [
    {
        id: "seed-1",
        url: "https://nextjs.org/blog/next-16",
        title: "Next.js 16 の新機能まとめ",
        summary:
        "Turbopack の安定化、Cache Components、React Compiler 対応など、Next.js 16 で追加された主要な変更点を実例とともに整理した公式ブログ記事。",
        tech_stack: ["React"],
        contents: null,
        createdAt: "2026-08-09T09:30:00.000Z",
    },
    {
        id: "seed-2",
        url: "https://react.dev/reference/react/useEffectEvent",
        title: "useEffectEvent でエフェクトの依存を整理する",
        summary:
            "Effect の中の「反応させたくないロジック」を Effect Event として切り出す新しいフックの使い方と、依存配列の設計指針を解説。",
        tech_stack: ["React"],
        contents: null,
        createdAt: "2026-08-07T14:10:00.000Z",
    },
    {
        id: "seed-3",
        url: "https://tailwindcss.com/blog/tailwindcss-v4",
        title: "Tailwind CSS v4 への移行ガイド",
        summary:
            "設定ファイル不要の CSS ファーストな構成、@theme によるトークン定義、パフォーマンス改善など v4 の要点と移行手順をまとめた記事。",
        tech_stack: ["TailwindCSS"],
        contents: null,
        createdAt: "2026-08-03T02:45:00.000Z",
    },
];
