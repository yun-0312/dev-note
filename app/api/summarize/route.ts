import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
    try {
        const { url, contents  } = await req.json();

        if (!url && !contents) {
            return NextResponse.json(
                { error: "URLまたはテキスト（コンテンツ）のいずれかを入力してください" },
                { status: 400 }
            );
        }

        let targetText = "";

        //contentsがある場合はそれを優先、またはベースにする
        if (contents) {
            targetText += `【テキストコンテンツ】\n${contents}\n\n`;
        }

        if (url) {
            try {
                const response = await fetch(url, {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64: x64)",
                    },
                });

                if (response.ok) {
                    const html = await response.text();
                    const scrapedText = html
                        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
                        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
                        .replace(/<[^>]+>/g, " ")
                        .replace(/\s+/g, " ")
                        .trim();

                    targetText += `【Webページの内容】\n${scrapedText}`;
                } else if (!contents) {
                    throw new Error("指定されたURLのページを取得できませんでした");
                }
            } catch (fetchError: any) {
                if (!contents) {
                    throw new Error(fetchError.message || "URLの取得に失敗しました");
                }
            }
        }
        //文字数制限
        const finalContent = targetText.slice(0, 8000);

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content:
                        "あなたは優秀なWeb記事の編集者です。提供されたWebページのテキストを読み、以下のJSONフォーマット（マークダウンのコードブロックは使わず、生のJSON文字列のみ）で出力してください。\n" +
                        "{\n  \"title\": \"記事のタイトル（日本語で30文字程度）\",\n" +
                        "  \"summary\": \"記事の要約（日本語で100〜150文字程度。何が書かれているか簡潔に）\",\n" + // 👈 カンマを追加！
                        "  \"tech_stack\": \"この記事に関連する主な技術や言語（例: React, Next.js, TypeScript, Supabase など。カンマ区切りで3つ程度）\"\n" +
                        "}",
                },
                {
                    role: "user",
                    content: `以下の情報を元に、タイトル、要約、関連する技術や言語を作成してください。\n\n${finalContent}`,
                },
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.3,
            response_format: { type: "json_object" },
        });

        const resultText = chatCompletion.choices[0]?.message?.content || "{}";
        const result = JSON.parse(resultText);


        // tech_stackを安全に配列に変換
        let techStackArray: string[] = [];
        if (typeof result.tech_stack === "string") {
            techStackArray = result.tech_stack
                .split(",")
                .map((t: string) => t.trim())
                .filter(Boolean);
        } else if (Array.isArray(result.tech_stack)) {
            techStackArray = result.tech_stack;
        }

        return NextResponse.json({
            title: result.title || "無題の記事",
            summary: result.summary || "要約を取得できませんでした",
            tech_stack: techStackArray,
        });
    } catch (error: any) {
        console.error("要約エラー:", error);
        return NextResponse.json(
            { error: error.message || "AIの処理中にエラーが発生しました" },
            { status: 500 }
        );
    }
}