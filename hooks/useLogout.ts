import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useLogout() {
    const router = useRouter();

    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            toast.error("ログアウトに失敗しました");
            return;
        }
        toast.success("ログアウトしました");
        router.push("/login");
        router.refresh();
    };

    return { logout };
}