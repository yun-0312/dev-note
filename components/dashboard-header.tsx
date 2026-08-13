import { BookMarked, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/hooks/useLogout";

export function DashboardHeader({ count }: { count: number }) {
    const { logout } = useLogout();

    return (
        <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
            <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <BookMarked className="size-5" aria-hidden="true" />
                </span>
                <div className="flex flex-col">
                    <h1 className="text-lg font-semibold leading-tight tracking-tight">
                    Readlist
                    </h1>
                    <p className="text-sm text-muted-foreground">
                    技術記事のあとで読むダッシュボード
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="hidden text-right sm:block">
                    <p className="font-mono text-2xl font-semibold leading-none tabular-nums">
                        {count}
                    </p>
                    <p className="text-xs text-muted-foreground">保存済みの記事</p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={logout}
                    className="gap-2 text-muted-foreground hover:text-foreground"
                >
                    <LogOut className="size-4" aria-hidden="true" />
                    ログアウト
                </Button>
            </div>
        </div>
        </header>
    );
}
