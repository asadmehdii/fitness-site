import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface WorkoutPromptProps {
  onSubmitPrompt: (prompt: string) => void;
  isLoading: boolean;
}

export const WorkoutPrompt = ({
  onSubmitPrompt,
  isLoading,
}: WorkoutPromptProps) => {
  const [prompt, setPrompt] = useState("");
  const [charCount, setCharCount] = useState(0);

  const handleSubmit = () => {
    if (prompt.trim() && !isLoading) {
      onSubmitPrompt(prompt.trim());
    }
  };

  const handleInputChange = (value: string) => {
    setPrompt(value);
    setCharCount(value.length);
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="font-poppins font-bold text-3xl md:text-[32px] leading-[150%] text-[#131313]">
            Smarter training starts here
          </h1>
          <p className="font-poppins font-normal text-base md:text-[18px] leading-[150%] text-[#131313]">
            Chat with AI to build custom fitness plans
          </p>
        </div>

        <Card className="p-2 bg-white rounded-3xl shadow-[0px_0px_4px_0px_#0000001F]">
          {/* Input Area */}
          <div className="space-y-6">
            <div className="relative">
              <Textarea
                placeholder="Describe what are we building today..."
                value={prompt}
                onChange={(e) => handleInputChange(e.target.value)}
                maxLength={1000}
                style={{ resize: "vertical" }}
                className="min-h-[120px] w-full p-4 mt-1 border border-[#E0E0E0] focus:border-[#6367EF] focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-white rounded-xl text-base placeholder:text-[#717680] resize-y"
                disabled={isLoading}
              />
            </div>
            <div className="flex items-center gap-2 justify-end">
              <div className="text-xs text-[#9E9E9E] bg-white pl-2 pointer-events-none">
                {charCount}/1000
              </div>
              <Button
                onClick={handleSubmit}
                disabled={!prompt.trim() || isLoading}
                size="icon"
                variant="ghost"
                className="rounded-full p-0 hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              >
                {isLoading ? (
                  <Loader2 className="w-[44px] h-[44px] animate-spin text-[#3B82F6]" />
                ) : (
                  <img
                    src={
                      !prompt.trim()
                        ? "/disable-arrow.png"
                        : "/enable-arrow.png"
                    }
                    alt={!prompt.trim() ? "Disabled arrow" : "Enabled arrow"}
                    className="w-[44px] h-[44px]"
                  />
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
