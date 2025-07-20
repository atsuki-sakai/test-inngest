import { z } from "zod";

export const inngestForGenerateSchema = z.object({
    menuName: z.string().min(2, "2文字以上で入力してください").max(100, "100文字以内で入力してください"),
    category: z.string().min(2, "2文字以上で入力してください").max(100, "100文字以内で入力してください"),
    targetGender: z.string().min(2, "2文字以上で入力してください").max(100, "100文字以内で入力してください"),
    menuDescription: z.string().min(2, "2文字以上で入力してください").max(1000, "1000文字以内で入力してください"),
    menuPrice: z.string().min(2, "2文字以上で入力してください").max(100, "100文字以内で入力してください"),
    query: z.string().min(2, "2文字以上で入力してください").max(1000, "1000文字以内で入力してください"),
});

export type InngestForGenerateValues = z.infer<typeof inngestForGenerateSchema>;
