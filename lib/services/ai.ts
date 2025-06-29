import axiosInstance from "./axiosInstance"
import type { AiSuggestion } from "@/lib/types"

export const aiService = {
  async suggest(input: string): Promise<AiSuggestion> {
    const response = await axiosInstance.post("/api/ai/suggest", { input })
    return response.data.data
  },
}
