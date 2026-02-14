"use client";

import { useState } from "react";
import { Wand2, Loader2, Send, Copy, Sparkles, FlaskConical, AlertCircle, Check, Hexagon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { generateImprovedPrompt, generateClarifyingQuestions, generateRefinedPrompt } from "@/app/actions";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Mode = "instant" | "alchemist";

export default function PromptImprover() {
    // Core State
    const [mode, setMode] = useState<Mode>("instant");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Input State
    const [instantInput, setInstantInput] = useState("");
    const [alchemistInput, setAlchemistInput] = useState({
        task: "",
        role: "",
        context: "",
        instructions: "",
        format: ""
    });

    // Result State
    const [improvedPrompt, setImprovedPrompt] = useState("");
    const [explanation, setExplanation] = useState("");

    // Refinement State
    const [showRefine, setShowRefine] = useState(false);
    const [isRefining, setIsRefining] = useState(false);
    const [questions, setQuestions] = useState<string[]>([]);
    const [answers, setAnswers] = useState<string[]>([]);
    const [additionalInstructions, setAdditionalInstructions] = useState("");

    const handleCopy = () => {
        navigator.clipboard.writeText(improvedPrompt);
        toast.success("Prompt copied to clipboard!");
    };

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        setShowRefine(false);
        setQuestions([]);

        try {
            let promptToSend = "";
            if (mode === "instant") {
                if (!instantInput.trim()) return;
                promptToSend = instantInput;
            } else {
                // Assemble Alchemist inputs
                promptToSend = `
Task: ${alchemistInput.task}
Role: ${alchemistInput.role}
Context: ${alchemistInput.context}
Instructions: ${alchemistInput.instructions}
Format: ${alchemistInput.format}
                `.trim();
                if (!promptToSend) return;
            }

            const result = await generateImprovedPrompt(promptToSend);
            setImprovedPrompt(result.improvedPrompt);
            setExplanation(result.explanation);
        } catch (err: any) {
            console.error(err);
            setError("Failed to generate prompt. Please try again.");
            toast.error("Generation failed");
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartRefinement = async () => {
        setIsRefining(true);
        try {
            const qs = await generateClarifyingQuestions(improvedPrompt);
            setQuestions(qs);
            setAnswers(new Array(qs.length).fill(""));
            setShowRefine(true);
        } catch (err: any) {
            toast.error("Failed to generate questions");
        } finally {
            setIsRefining(false);
        }
    };

    const handleSubmitRefinement = async () => {
        setIsLoading(true);
        try {
            // Combine answers and additional instructions
            const finalAnswers = [...answers];
            if (additionalInstructions.trim()) {
                questions.push("Additional User Instructions");
                finalAnswers.push(additionalInstructions);
            }

            const result = await generateRefinedPrompt(improvedPrompt, questions, finalAnswers);
            setImprovedPrompt(result.improvedPrompt);
            setExplanation(result.explanation);

            // Reset refinement state for infinite loop
            setShowRefine(false);
            setQuestions([]);
            setAnswers([]);
            setAdditionalInstructions("");
            toast.success("Prompt refined successfully!");
        } catch (err: any) {
            toast.error("Refinement failed");
        } finally {
            setIsLoading(false);
        }
    };

    // Premium Input Styles
    const inputStyles = `
        bg-white/80 dark:bg-black/20 
        border border-slate-200 dark:border-white/10 
        text-slate-900 dark:text-slate-100 
        placeholder:text-slate-400 dark:placeholder:text-slate-500
        shadow-sm dark:shadow-none
        focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 
        transition-all duration-300
        backdrop-blur-sm
    `;

    // Premium Card Styles
    const cardStyles = `
        border-white/40 dark:border-white/10 
        bg-white/60 dark:bg-black/40 
        backdrop-blur-3xl 
        shadow-2xl dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]
    `;

    return (
        <div className="min-h-screen w-full bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-50 transition-colors duration-500 relative overflow-hidden font-sans selection:bg-indigo-500/30">

            {/* Animated Background Orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                        x: [0, 50, 0],
                        y: [0, -50, 0]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] rounded-full bg-indigo-500/20 blur-[120px] mix-blend-multiply dark:mix-blend-normal"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.6, 0.3],
                        x: [0, -30, 0],
                        y: [0, 50, 0]
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-500/20 blur-[120px] mix-blend-multiply dark:mix-blend-normal"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute top-[40%] left-[20%] w-[400px] h-[400px] rounded-full bg-cyan-500/10 blur-[100px] mix-blend-multiply dark:mix-blend-normal"
                />
            </div>

            {/* Side Accents (Desktop) */}
            <div className="fixed left-12 top-1/2 -translate-y-1/2 hidden 2xl:flex flex-col gap-12 opacity-10 pointer-events-none select-none">
                <span className="text-7xl font-black writing-vertical-rl text-foreground rotate-180 tracking-widest"># ROLE</span>
                <span className="text-7xl font-black writing-vertical-rl text-foreground rotate-180 tracking-widest"># TASK</span>
            </div>
            <div className="fixed right-12 top-1/2 -translate-y-1/2 hidden 2xl:flex flex-col gap-12 opacity-10 pointer-events-none select-none">
                <span className="text-7xl font-black writing-vertical-rl text-foreground tracking-widest"># CONTEXT</span>
                <span className="text-7xl font-black writing-vertical-rl text-foreground tracking-widest"># FORMAT</span>
            </div>

            <div className="absolute top-6 right-6 z-50">
                <ThemeToggle />
            </div>

            <div className="w-full max-w-5xl mx-auto p-6 md:p-12 relative z-10 space-y-16">
                {/* Hero Section */}
                <section className="text-center space-y-8 pt-8 flex flex-col items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="flex flex-col items-center"
                    >
                        {/* Logo */}
                        <div className="bg-white/50 dark:bg-white/5 backdrop-blur-xl p-4 rounded-3xl border border-white/20 shadow-xl mb-8 ring-1 ring-black/5 dark:ring-white/10">
                            <div className="relative w-16 h-16 flex items-center justify-center">
                                <Hexagon className="w-16 h-16 text-indigo-500 dark:text-indigo-400 fill-indigo-500/10" strokeWidth={1.5} />
                                <Sparkles className="w-8 h-8 text-cyan-500 dark:text-cyan-400 absolute animate-pulse" />
                            </div>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">
                            <span className="bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                                REFINE
                            </span>
                            <span className="bg-gradient-to-r from-indigo-500 to-cyan-400 bg-clip-text text-transparent ml-4">
                                AI
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 font-light max-w-2xl leading-relaxed">
                            Transmute vague ideas into <span className="text-indigo-500 font-medium">magical prompts</span> with a single click.
                        </p>
                    </motion.div>
                </section>

                {/* Mode Selector */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                    <button
                        onClick={() => setMode("instant")}
                        className={cn(
                            "relative p-8 rounded-3xl border text-left transition-all duration-300 overflow-hidden",
                            cardStyles,
                            mode === "instant"
                                ? "border-indigo-500/50 ring-2 ring-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-500/10"
                                : "hover:bg-white/80 dark:hover:bg-white/5 hover:border-slate-300 dark:hover:border-white/20"
                        )}
                    >
                        <div className={cn("absolute inset-0 opacity-0 transition-opacity duration-500 bg-gradient-to-br from-indigo-500/10 to-transparent", mode === "instant" && "opacity-100")} />
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-3">
                                <div className={cn("p-3 rounded-2xl transition-colors", mode === "instant" ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30" : "bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400")}>
                                    <Sparkles className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-xl tracking-tight">Instant Polish</h3>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-light">
                                Quick & Magic. Paste a raw idea, get a professional prompt instantly.
                            </p>
                        </div>
                    </button>

                    <button
                        onClick={() => setMode("alchemist")}
                        className={cn(
                            "relative p-8 rounded-3xl border text-left transition-all duration-300 overflow-hidden",
                            cardStyles,
                            mode === "alchemist"
                                ? "border-cyan-500/50 ring-2 ring-cyan-500/20 bg-cyan-50/50 dark:bg-cyan-500/10"
                                : "hover:bg-white/80 dark:hover:bg-white/5 hover:border-slate-300 dark:hover:border-white/20"
                        )}
                    >
                        <div className={cn("absolute inset-0 opacity-0 transition-opacity duration-500 bg-gradient-to-br from-cyan-500/10 to-transparent", mode === "alchemist" && "opacity-100")} />
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-3">
                                <div className={cn("p-3 rounded-2xl transition-colors", mode === "alchemist" ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30" : "bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400")}>
                                    <FlaskConical className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-xl tracking-tight">Alchemist Lab</h3>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-light">
                                Precision Engineering. Build a complex prompt from structured components.
                            </p>
                        </div>
                    </button>
                </div>

                {/* Main Input Area */}
                <Card className={cn("border-0 overflow-visible bg-transparent shadow-none")}>
                    <div className={cn("rounded-[2.5rem] p-1 bg-gradient-to-br from-white/50 to-white/10 dark:from-white/10 dark:to-white/0 shadow-2xl", isLoading && "animate-pulse")}>
                        <div className={cn("rounded-[2.25rem] overflow-hidden relative", cardStyles)}>
                            {/* Inner Glow */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-50" />

                            <CardContent className="p-8 md:p-12 relative">
                                <AnimatePresence mode="wait">
                                    {mode === "instant" ? (
                                        <motion.div
                                            key="instant"
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.98 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <Label className="text-lg font-semibold mb-6 block text-slate-700 dark:text-slate-200">What do you want to create?</Label>
                                            <Textarea
                                                placeholder="e.g. I need a blog post about the future of AI in healthcare..."
                                                className={cn("min-h-[220px] text-lg lg:text-xl resize-y p-6 leading-relaxed", inputStyles)}
                                                value={instantInput}
                                                onChange={(e) => setInstantInput(e.target.value)}
                                            />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="alchemist"
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.98 }}
                                            transition={{ duration: 0.3 }}
                                            className="space-y-8"
                                        >
                                            <div className="grid md:grid-cols-2 gap-8">
                                                <div className="space-y-3">
                                                    <Label className="font-medium ml-1">Task</Label>
                                                    <Input
                                                        placeholder="What should the AI do?"
                                                        className={cn("h-12", inputStyles)}
                                                        value={alchemistInput.task}
                                                        onChange={(e) => setAlchemistInput({ ...alchemistInput, task: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-3">
                                                    <Label className="font-medium ml-1">Role</Label>
                                                    <Input
                                                        placeholder="Who is the AI acting as?"
                                                        className={cn("h-12", inputStyles)}
                                                        value={alchemistInput.role}
                                                        onChange={(e) => setAlchemistInput({ ...alchemistInput, role: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="font-medium ml-1">Context</Label>
                                                <Textarea
                                                    placeholder="Background information, data, or constraints..."
                                                    className={cn("h-32 p-4", inputStyles)}
                                                    value={alchemistInput.context}
                                                    onChange={(e) => setAlchemistInput({ ...alchemistInput, context: e.target.value })}
                                                />
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-8">
                                                <div className="space-y-3">
                                                    <Label className="font-medium ml-1">Specific Instructions</Label>
                                                    <Textarea
                                                        placeholder="Step-by-step requirements..."
                                                        className={cn("h-32 p-4", inputStyles)}
                                                        value={alchemistInput.instructions}
                                                        onChange={(e) => setAlchemistInput({ ...alchemistInput, instructions: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-3">
                                                    <Label className="font-medium ml-1">Format</Label>
                                                    <Input
                                                        placeholder="Table, Markdown, Code, etc."
                                                        className={cn("h-12", inputStyles)}
                                                        value={alchemistInput.format}
                                                        onChange={(e) => setAlchemistInput({ ...alchemistInput, format: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="mt-10 flex justify-end">
                                    <Button
                                        size="lg"
                                        className="h-14 rounded-full px-10 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-xl shadow-cyan-500/20 transition-all hover:scale-[1.03] active:scale-[0.98] text-lg font-medium tracking-wide"
                                        onClick={handleGenerate}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                                                Transmuting...
                                            </>
                                        ) : (
                                            <>
                                                <Wand2 className="mr-3 h-5 w-5" />
                                                Transmute
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </div>
                    </div>
                </Card>

                {/* Results Section */}
                <AnimatePresence>
                    {improvedPrompt && (
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-10 pb-20"
                        >
                            <div className="grid lg:grid-cols-3 gap-8">
                                {/* Main Result */}
                                <div className="lg:col-span-2 relative group">
                                    <div className="absolute inset-0 bg-green-500/20 blur-3xl opacity-20 dark:opacity-10 group-hover:opacity-30 transition-opacity" />
                                    <Card className={cn(cardStyles, "border-green-500/30 dark:border-green-500/20 overflow-hidden relative")}>
                                        <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
                                        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-green-500/10">
                                            <CardTitle className="text-green-600 dark:text-green-400 flex items-center gap-3 text-xl">
                                                <div className="p-2 bg-green-500/10 rounded-lg">
                                                    <Sparkles className="h-5 w-5" />
                                                </div>
                                                Golden Prompt
                                            </CardTitle>
                                            <Button variant="ghost" size="sm" onClick={handleCopy} className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-100 dark:hover:bg-green-400/10 rounded-full px-4">
                                                <Copy className="h-4 w-4 mr-2" />
                                                Copy
                                            </Button>
                                        </CardHeader>
                                        <CardContent className="pt-6">
                                            <div className="bg-white/80 dark:bg-black/40 rounded-xl p-8 border border-slate-200 dark:border-white/10 font-mono text-sm leading-relaxed whitespace-pre-wrap shadow-inner overflow-x-auto text-slate-800 dark:text-slate-200">
                                                {improvedPrompt}
                                            </div>

                                            {!showRefine && (
                                                <Button
                                                    className="w-full mt-8 h-12 bg-green-500/10 text-green-700 dark:bg-green-500/10 dark:text-green-400 hover:bg-green-500/20 dark:hover:bg-green-500/20 border border-green-500/20 rounded-xl transition-all hover:scale-[1.01]"
                                                    onClick={handleStartRefinement}
                                                    disabled={isRefining}
                                                >
                                                    {isRefining ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FlaskConical className="h-4 w-4 mr-2" />}
                                                    Refine Further
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Explanation Card */}
                                <Card className={cn(cardStyles, "border-blue-500/30 dark:border-blue-500/20 h-fit")}>
                                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                                    <CardHeader className="pb-4 border-b border-blue-500/10">
                                        <CardTitle className="text-blue-600 dark:text-blue-400 flex items-center gap-3 text-xl">
                                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                                <AlertCircle className="h-5 w-5" />
                                            </div>
                                            Alchemist's Notes
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-light">
                                            {explanation}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Refinement Loop */}
                            {showRefine && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="max-w-3xl mx-auto"
                                >
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-indigo-500/20 blur-3xl opacity-20" />
                                        <Card className={cn(cardStyles, "border-indigo-500/30 dark:border-indigo-500/20 overflow-hidden relative")}>
                                            <CardHeader className="pb-4 border-b border-indigo-500/10">
                                                <CardTitle className="text-indigo-600 dark:text-indigo-400 text-2xl">Refinement Loop</CardTitle>
                                                <CardDescription className="text-slate-600 dark:text-slate-400 text-lg font-light mt-1">The AI has a few clarifying questions to perfect your prompt.</CardDescription>
                                            </CardHeader>
                                            <CardContent className="pt-8 space-y-8">
                                                {questions.map((q, i) => (
                                                    <div key={i} className="space-y-3">
                                                        <Label className="text-lg font-medium text-foreground">{q}</Label>
                                                        <Input
                                                            value={answers[i] || ""}
                                                            onChange={(e) => {
                                                                const newAnswers = [...answers];
                                                                newAnswers[i] = e.target.value;
                                                                setAnswers(newAnswers);
                                                            }}
                                                            className={cn("h-12", inputStyles)}
                                                            placeholder="Your answer..."
                                                        />
                                                    </div>
                                                ))}

                                                <div className="pt-6 border-t border-slate-200 dark:border-white/10">
                                                    <Label className="text-lg font-medium text-foreground mb-4 block">Anything else?</Label>
                                                    <Textarea
                                                        value={additionalInstructions}
                                                        onChange={(e) => setAdditionalInstructions(e.target.value)}
                                                        placeholder="Add any extra instructions or constraints here..."
                                                        className={cn("h-32", inputStyles)}
                                                    />
                                                </div>

                                                <Button
                                                    className="w-full h-14 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-xl rounded-xl text-lg hover:scale-[1.01] transition-transform"
                                                    onClick={handleSubmitRefinement}
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Check className="h-5 w-5 mr-2" />}
                                                    Finalize Prompt
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
