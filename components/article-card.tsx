import Link from "next/link";
import { CalendarDays, ExternalLink, Pencil, Trash2, FileText } from "lucide-react";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Article } from "@/lib/articles";
import { formatDate, getDomain } from "@/lib/articles";

export function ArticleCard({
    article,
    onDelete,
    onEdit,
}: {
    article: Article;
    onDelete: (id: string) => void;
    onEdit: (article: Article) => void;
}) {
    const domain = article.url ? getDomain(article.url) : null;

    return (
        <Card className="flex h-full flex-col transition-colors hover:border-primary/40">
            <CardHeader>
                {domain ? (
                    <Badge variant="secondary" className="w-fit font-mono font-normal">
                        {getDomain(domain)}
                    </Badge>
                ) : (
                    <Badge variant="outline" className="w-fit gap-1 text-purple-700 border-purple-300 bg-purple-50">
                        <FileText className="size-3" />
                        知見ノート
                    </Badge>
                )}

                <CardTitle className="text-balance leading-snug">
                    <Link
                        href={`/articles/${article.id}`}
                        className="hover:text-primary hover:underline"
                    >
                        {article.title}
                    </Link>
                </CardTitle>

                <CardAction>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="この記事を編集"
                            onClick={() => onEdit(article)}
                        >
                            <Pencil className="size-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="この記事を削除"
                            onClick={() => onDelete(article.id)}
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    </div>
                </CardAction>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col gap-4">
                <CardDescription className="line-clamp-3 text-pretty leading-relaxed">
                    {article.summary}
                </CardDescription>

                {article.contents && (
                    <div className="round-md bg-muted/50 p-2.5 text-xs text-muted-foreground line-clamp-3 font-mono">
                        {article.contents}
                    </div>
                )}

                <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-3">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="size-3.5" aria-hidden="true" />
                    {formatDate(article.createdAt)}
                </span>

                {article.url && (
                    <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                        開く
                        <ExternalLink className="size-3.5" aria-hidden="true" />
                    </a>
                )}
                </div>
            </CardContent>
        </Card>
    );
}
