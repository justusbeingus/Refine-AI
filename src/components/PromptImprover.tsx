"use client";

import { useState } from "react";
import { Wand2, Loader2, Send, Copy, Sparkles, FlaskConical, AlertCircle, Check, Hexagon, ArrowLeft, ArrowRight } from "lucide-react";
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
type View = "home" | "refine";

export default function PromptImprover() {
    // Core State
    const [view, setView] = useState<View>("home");
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
            const msg = err.message || "Failed to generate prompt";
            setError(msg);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartRefinement = async () => {
        setIsLoading(true);
        try {
            const qs = await generateClarifyingQuestions(improvedPrompt);
            setQuestions(qs);
            setAnswers(new Array(qs.length).fill(""));
            setView("refine"); // Switch to refinement view
        } catch (err: any) {
            toast.error("Failed to generate questions");
        } finally {
            setIsLoading(false);
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

            // Return to home view with new result
            setView("home");
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
        border border-slate-300 dark:border-white/10 
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

            {/* Animated Background Orbs (Fixed Corners) - Cleaner, no sidebars */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-10%] left-[-10%] w-[900px] h-[900px] rounded-full bg-indigo-600/20 blur-[140px] mix-blend-multiply dark:mix-blend-normal opacity-20"
                />
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-[-10%] right-[-10%] w-[900px] h-[900px] rounded-full bg-violet-600/20 blur-[140px] mix-blend-multiply dark:mix-blend-normal opacity-20"
                />
            </div>

            <div className="absolute top-6 right-6 z-50">
                <ThemeToggle />
            </div>

            <div className="w-full max-w-6xl mx-auto p-4 md:p-8 relative z-10 flex flex-col justify-start min-h-screen">

                <AnimatePresence mode="wait">
                    {view === "home" ? (
                        <motion.div
                            key="home"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex flex-col justify-center min-h-[85vh]"
                        >
                            {/* Hero Section - Compact */}
                            <section className="text-center space-y-4 mb-8">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, ease: "easeOut" }}
                                    className="flex flex-col items-center"
                                >
                                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight flex items-center gap-3">
                                        <span className="bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                                            REFINE
                                        </span>
                                        <span className="bg-gradient-to-r from-indigo-500 to-cyan-400 bg-clip-text text-transparent">
                                            AI
                                        </span>
                                        <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-cyan-500 animate-pulse ml-2" />
                                    </h1>

                                    <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 font-light max-w-xl mx-auto mt-2">
                                        Transmute vague ideas into <span className="text-indigo-500 font-medium">magical prompts</span>.
                                    </p>
                                </motion.div>
                            </section>

                            {/* Main Content Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                                {/* Left Column: Mode & Input */}
                                <div className="lg:col-span-7 space-y-6">
                                    {/* Mode Selector - Compact */}
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setMode("instant")}
                                            className={cn(
                                                "flex-1 relative p-4 rounded-2xl border text-left transition-all duration-300 overflow-hidden group",
                                                cardStyles,
                                                mode === "instant"
                                                    ? "border-indigo-500/50 ring-1 ring-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-500/10"
                                                    : "hover:bg-white/80 dark:hover:bg-white/5 opacity-70 hover:opacity-100"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Sparkles className={cn("w-5 h-5", mode === "instant" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400")} />
                                                <div>
                                                    <h3 className="font-semibold text-base">Instant Polish</h3>
                                                </div>
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => setMode("alchemist")}
                                            className={cn(
                                                "flex-1 relative p-4 rounded-2xl border text-left transition-all duration-300 overflow-hidden group",
                                                cardStyles,
                                                mode === "alchemist"
                                                    ? "border-cyan-500/50 ring-1 ring-cyan-500/20 bg-cyan-50/50 dark:bg-cyan-500/10"
                                                    : "hover:bg-white/80 dark:hover:bg-white/5 opacity-70 hover:opacity-100"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <FlaskConical className={cn("w-5 h-5", mode === "alchemist" ? "text-cyan-600 dark:text-cyan-400" : "text-slate-400")} />
                                                <div>
                                                    <h3 className="font-semibold text-base">Alchemist Lab</h3>
                                                </div>
                                            </div>
                                        </button>
                                    </div>

                                    {/* Input Area */}
                                    <Card className={cn("border-0 overflow-visible bg-transparent shadow-none")}>
                                        <div className={cn("rounded-[2rem] p-0.5 bg-gradient-to-br from-white/50 to-white/10 dark:from-white/10 dark:to-white/0 shadow-xl", isLoading && "animate-pulse")}>
                                            <div className={cn("rounded-[1.9rem] overflow-hidden relative", cardStyles)}>
                                                <CardContent className="p-6 md:p-8 relative">
                                                    <AnimatePresence mode="wait">
                                                        {mode === "instant" ? (
                                                            <motion.div
                                                                key="instant"
                                                                initial={{ opacity: 0, scale: 0.99 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                exit={{ opacity: 0, scale: 0.99 }}
                                                                transition={{ duration: 0.2 }}
                                                            >
                                                                <Label className="text-base font-medium mb-3 block text-slate-700 dark:text-slate-300">Your Idea</Label>
                                                                <Textarea
                                                                    placeholder="e.g. I need a blog post about the future of AI in healthcare..."
                                                                    className={cn("min-h-[160px] text-lg resize-y p-4 leading-relaxed", inputStyles)}
                                                                    value={instantInput}
                                                                    onChange={(e) => setInstantInput(e.target.value)}
                                                                />
                                                            </motion.div>
                                                        ) : (
                                                            <motion.div
                                                                key="alchemist"
                                                                initial={{ opacity: 0, scale: 0.99 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                exit={{ opacity: 0, scale: 0.99 }}
                                                                transition={{ duration: 0.2 }}
                                                                className="space-y-4"
                                                            >
                                                                <div className="grid md:grid-cols-2 gap-4">
                                                                    <div className="space-y-2">
                                                                        <Label className="text-sm font-medium ml-1">Task</Label>
                                                                        <Input
                                                                            placeholder="Do what?"
                                                                            className={cn("h-10", inputStyles)}
                                                                            value={alchemistInput.task}
                                                                            onChange={(e) => setAlchemistInput({ ...alchemistInput, task: e.target.value })}
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label className="text-sm font-medium ml-1">Role</Label>
                                                                        <Input
                                                                            placeholder="Act as who?"
                                                                            className={cn("h-10", inputStyles)}
                                                                            value={alchemistInput.role}
                                                                            onChange={(e) => setAlchemistInput({ ...alchemistInput, role: e.target.value })}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label className="text-sm font-medium ml-1">Context</Label>
                                                                    <Textarea
                                                                        placeholder="Background info..."
                                                                        className={cn("h-20 min-h-[80px] p-3 text-sm", inputStyles)}
                                                                        value={alchemistInput.context}
                                                                        onChange={(e) => setAlchemistInput({ ...alchemistInput, context: e.target.value })}
                                                                    />
                                                                </div>
                                                                <div className="grid md:grid-cols-2 gap-4">
                                                                    <div className="space-y-2">
                                                                        <Label className="text-sm font-medium ml-1">Instructions</Label>
                                                                        <Textarea
                                                                            placeholder="Steps..."
                                                                            className={cn("h-20 min-h-[80px] p-3 text-sm", inputStyles)}
                                                                            value={alchemistInput.instructions}
                                                                            onChange={(e) => setAlchemistInput({ ...alchemistInput, instructions: e.target.value })}
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label className="text-sm font-medium ml-1">Format</Label>
                                                                        <Input
                                                                            placeholder="Output type..."
                                                                            className={cn("h-10", inputStyles)}
                                                                            value={alchemistInput.format}
                                                                            onChange={(e) => setAlchemistInput({ ...alchemistInput, format: e.target.value })}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>

                                                    <div className="mt-6 flex justify-end">
                                                        <Button
                                                            size="lg"
                                                            className="h-12 rounded-full px-8 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.03] active:scale-[0.98] text-base font-medium tracking-wide"
                                                            onClick={handleGenerate}
                                                            disabled={isLoading}
                                                        >
                                                            {isLoading ? (
                                                                <>
                                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                    Transmuting...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Wand2 className="mr-2 h-4 w-4" />
                                                                    Transmute
                                                                </>
                                                            )}
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </div>
                                        </div>
                                    </Card>
                                </div>

                                {/* Right Column: Results (Sticky) */}
                                <div className="lg:col-span-5 h-full">
                                    <AnimatePresence>
                                        {improvedPrompt && (
                                            <motion.div
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="space-y-6 lg:sticky lg:top-8"
                                            >
                                                {/* Main Result */}
                                                <Card className={cn(cardStyles, "border-green-500/30 dark:border-green-500/20 overflow-hidden relative max-h-[60vh] flex flex-col")}>
                                                    <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
                                                    <CardHeader className="flex flex-row items-center justify-between pb-3 p-4 bg-green-500/5 border-b border-green-500/10">
                                                        <CardTitle className="text-green-600 dark:text-green-400 flex items-center gap-2 text-sm">
                                                            <Sparkles className="h-4 w-4" />
                                                            Golden Prompt
                                                        </CardTitle>
                                                        <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-100 dark:hover:bg-green-400/10 rounded-full text-xs">
                                                            <Copy className="h-3 w-3 mr-2" />
                                                            Copy
                                                        </Button>
                                                    </CardHeader>
                                                    <CardContent className="p-0 overflow-y-auto flex-1 custom-scrollbar">
                                                        <div className="p-4 font-mono text-xs md:text-sm leading-relaxed whitespace-pre-wrap text-slate-800 dark:text-slate-200">
                                                            {improvedPrompt}
                                                        </div>
                                                    </CardContent>
                                                    <div className="p-4 bg-white/40 dark:bg-black/20 border-t border-slate-200 dark:border-white/5">
                                                        <Button
                                                            className="w-full h-10 bg-green-500/10 text-green-700 dark:bg-green-500/10 dark:text-green-400 hover:bg-green-500/20 dark:hover:bg-green-500/20 border border-green-500/20 rounded-lg text-sm"
                                                            onClick={handleStartRefinement}
                                                            disabled={isLoading} // Loading is managed by handleStartRefinement
                                                        >
                                                            {isLoading ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <FlaskConical className="h-3 w-3 mr-2" />}
                                                            Refine Further
                                                        </Button>
                                                    </div>
                                                </Card>

                                                {/* Explanation Card */}
                                                {explanation && (
                                                    <Card className={cn(cardStyles, "border-blue-500/30 dark:border-blue-500/20 p-4")}>
                                                        <div className="flex items-start gap-3">
                                                            <AlertCircle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                                                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-light">
                                                                {explanation}
                                                            </p>
                                                        </div>
                                                    </Card>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="refine"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="flex flex-col min-h-screen pt-4"
                        >
                            {/* Refinement View Header */}
                            <header className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-2">
                                    <Hexagon className="w-8 h-8 text-indigo-500 dark:text-indigo-400 fill-indigo-500/10" strokeWidth={1.5} />
                                    <h2 className="text-xl font-bold tracking-tight">
                                        <span className="bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                                            REFINE
                                        </span>
                                        <span className="bg-gradient-to-r from-indigo-500 to-cyan-400 bg-clip-text text-transparent ml-1">
                                            AI
                                        </span>
                                    </h2>
                                    <Sparkles className="w-4 h-4 text-cyan-500 animate-pulse" />
                                </div>
                                <Button
                                    variant="ghost"
                                    onClick={() => setView("home")}
                                    className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Results
                                </Button>
                            </header>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                                {/* Top Section: Reference Card (Split View) */}
                                <Card className={cn(cardStyles, "lg:col-span-2 border-indigo-500/20 overflow-hidden relative")}>
                                    <CardHeader className="pb-2 border-b border-indigo-500/10 bg-indigo-500/5">
                                        <CardTitle className="text-indigo-600 dark:text-indigo-400 text-sm flex items-center gap-2">
                                            <FlaskConical className="w-4 h-4" />
                                            Evolution Context
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-indigo-500/10">
                                            <div className="p-6">
                                                <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 block">Based On (Original)</Label>
                                                <div className="text-sm text-slate-600 dark:text-slate-300 font-mono opacity-80 line-clamp-6">
                                                    {mode === "instant" ? instantInput : `Task: ${alchemistInput.task}\nRole: ${alchemistInput.role}...`}
                                                </div>
                                            </div>
                                            <div className="p-6 bg-indigo-500/5">
                                                <Label className="text-xs font-semibold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider mb-3 block">Current Golden Prompt</Label>
                                                <div className="text-sm text-slate-800 dark:text-slate-200 font-mono line-clamp-6">
                                                    {improvedPrompt}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Center: Interrogation Form */}
                                <div className="lg:col-span-2 max-w-3xl mx-auto w-full space-y-8">
                                    <div className="text-center space-y-2">
                                        <h3 className="text-2xl font-bold">Sharpen the Details</h3>
                                        <p className="text-slate-600 dark:text-slate-400">The AI needs a few specifics to perfect your prompt.</p>
                                    </div>

                                    <Card className={cn(cardStyles, "p-8 border-cyan-500/20")}>
                                        <div className="space-y-8">
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
                                                        className={cn("h-12 text-base", inputStyles)}
                                                        placeholder="Your answer..."
                                                        autoFocus={i === 0}
                                                    />
                                                </div>
                                            ))}

                                            <div className="pt-6 border-t border-slate-200 dark:border-white/10">
                                                <Label className="text-lg font-medium text-foreground mb-4 block">Anything else to add?</Label>
                                                <Textarea
                                                    value={additionalInstructions}
                                                    onChange={(e) => setAdditionalInstructions(e.target.value)}
                                                    placeholder="E.g., Make it funnier, stricter format..."
                                                    className={cn("h-32", inputStyles)}
                                                />
                                            </div>

                                            <Button
                                                className="w-full h-14 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-xl rounded-xl text-lg hover:scale-[1.01] transition-transform"
                                                onClick={handleSubmitRefinement}
                                                disabled={isLoading}
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                                        Finalizing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Check className="h-5 w-5 mr-2" />
                                                        Finalize Prompt
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
