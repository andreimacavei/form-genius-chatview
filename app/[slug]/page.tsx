"use client";

import { useState, useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Send, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SurveyNotFound } from "@/components/survey-not-found";

// Define question types
type QuestionType =
  | "single-select"
  | "multi-select"
  | "number-range"
  | "date"
  | "text"
  | "long-text"
  | "email"
  | "dropdown";

interface Option {
  id: string;
  label: string;
}

interface Question {
  order: string;
  title: string;
  type: QuestionType;
  options?: Option[];
  number: number;
  scale?: {
    min: number;
    max: number;
  };
}

// Sample questions for the form - duplicated from API for client-side use
const formQuestions = [
  {
    id: "name",
    text: "What's your name?",
    type: "text" as QuestionType,
  },
  {
    id: "email",
    text: "What's your email address?",
    type: "email" as QuestionType,
  },
  {
    id: "experience",
    text: "How many years of experience do you have?",
    type: "number-range" as QuestionType,
    min: 0,
    max: 20,
  },
  {
    id: "preferred_role",
    text: "What role are you applying for?",
    type: "single-select" as QuestionType,
    options: [
      { id: "developer", label: "Developer" },
      { id: "designer", label: "Designer" },
      { id: "product_manager", label: "Product Manager" },
      { id: "marketing", label: "Marketing" },
      { id: "other", label: "Other" },
    ],
  },
  {
    id: "skills",
    text: "Which skills do you have? (Select all that apply)",
    type: "multi-select" as QuestionType,
    options: [
      { id: "javascript", label: "JavaScript" },
      { id: "typescript", label: "TypeScript" },
      { id: "react", label: "React" },
      { id: "nextjs", label: "Next.js" },
      { id: "node", label: "Node.js" },
      { id: "design", label: "UI/UX Design" },
    ],
  },
  {
    id: "start_date",
    text: "When are you available to start?",
    type: "date" as QuestionType,
  },
  {
    id: "about",
    text: "Tell us a bit about yourself and why you're interested in this position.",
    type: "long-text" as QuestionType,
  },
];
export default function ChatForm() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [formResponses, setFormResponses] = useState<Record<string, any>>({});
  const [singleSelectValue, setSingleSelectValue] = useState<string>("");
  const [multiSelectValue, setMultiSelectValue] = useState<string[]>([]);
  const [numberValue, setNumberValue] = useState<number[]>([5]);
  const [dateValue, setDateValue] = useState<Date | undefined>(undefined);
  const [textValue, setTextValue] = useState<string>("");
  const [emailValue, setEmailValue] = useState<string>("");
  const [isFormComplete, setIsFormComplete] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [formQuestions, setFormQuestions] = useState<any[]>([]);
  const [survey, setSurvey] = useState<any>(null);
  const [errorPage, setErrorPage] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<{
    email: string | null;
    singleSelect: string | null;
    multiSelect: string | null;
    date: string | null;
    text: string | null;
    longText: string | null;
    dropdown: string | null;
  }>({
    email: null,
    singleSelect: null,
    multiSelect: null,
    date: null,
    text: null,
    longText: null,
    dropdown: null,
  });
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    append,
    isLoading,
  } = useChat({
    api: "/api/chat",
    body: {
      questions: formQuestions,
    },
    initialMessages: [
      // {
      //   id: "welcome",
      //   role: "assistant",
      //   content:
      //     "👋 Welcome to our interactive form! I'll guide you through a series of questions. Let's start with the first one: What's your name?",
      // },
    ],
    onFinish: (message) => {
      try {
      } catch (error) {
        console.error("Failed to process question data:", error);
      }
    },
  });

  // Custom submit handler that ensures questions are loaded
  // const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();

  //   // Check if questions are loaded before submitting
  //   if (formQuestions.length === 0) {
  //     console.warn(
  //       "Form questions not loaded yet. Waiting before submitting..."
  //     );

  //     // Add a temporary loading message
  //     append({
  //       id: "temp-loading",
  //       role: "assistant",
  //       content: "Loading your questions... Please wait a moment.",
  //     });

  //     // Wait for questions to load (max 5 seconds)
  //     let attempts = 0;
  //     const checkQuestionsLoaded = setInterval(() => {
  //       attempts++;

  //       if (formQuestions.length > 0) {
  //         // Questions loaded, clear the interval and submit
  //         clearInterval(checkQuestionsLoaded);
  //         console.log("Questions loaded, now submitting the message");

  //         // Remove temporary message
  //         const filteredMessages = messages.filter(
  //           (msg) => msg.id !== "temp-loading"
  //         );

  //         // Process the form submission with the actual questions
  //         rawHandleSubmit(e);
  //       } else if (attempts >= 10) {
  //         // Give up after 10 attempts (5 seconds)
  //         clearInterval(checkQuestionsLoaded);
  //         console.error("Failed to load questions after multiple attempts");

  //         // Update the message to inform the user
  //         append({
  //           role: "assistant",
  //           content:
  //             "Sorry, I'm having trouble loading the form questions. Please refresh the page and try again.",
  //         });
  //       }
  //     }, 500); // Check every 500ms
  //   } else {
  //     // Questions already loaded, proceed normally
  //     rawHandleSubmit(e);
  //   }
  // };

  //   Scroll to bottom when messages change
  //   Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  //   Fetch survey questions based on slug
  const params = useParams();
  const slug = params.slug;

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const response = await fetch(`/api/surveys/${slug}`);
        if (response.ok) {
          const data = await response.json();
          if (data.response) {
            setSurvey(data?.response);
            if (data.response.survey_questions.length > 0) {
              mapApiSurveysAsFormQuestions(data.response.survey_questions);
            }
          }
        } else {
          if (response.status === 404) {
            setSurvey(null);
          }
        }
      } catch (error: any) {
        if (error?.status === 404) {
          setSurvey(null);
        }
      }
    };
    if (slug) {
      fetchSurvey();
    }
  }, [slug]);

  // Handle form input submission
  const mapApiSurveysAsFormQuestions = (surveyQuestions: any) => {
    const questions = surveyQuestions.map((question: any) => {
      switch (question.type) {
        case "radio":
          question.type = "single-select";
          break;
        case "checkboxes":
          question.type = "multi-select";
          break;
        case "linear-scale":
          question.type = "number-range";
          break;
      }
      return question;
    });

    console.log(questions, "Mapped questions");
    setFormQuestions(questions);

    // Set the first question as the current question
    if (questions.length > 0) {
      setCurrentQuestion(questions[0]);
      append({
        role: "assistant",
        content: `👋 Welcome to our interactive form! I'll guide you through a series of questions. Let's start with the first one: ${questions[0].title}`,
      });

      setProgress((1 / questions.length) * 100);
    } else {
      // If no questions, set progress to 0
      setProgress(0);
    }
  };

  const customHandleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submitFormInput(input);
    handleSubmit(e);
  };

  const submitFormInput = (inputValue?: string) => {
    console.log("Submitting form input...");
    if (!currentQuestion) return;

    let value: string | number | Date | string[] | any;
    let isValid = true;
    if (inputValue && typeof inputValue === "string") {
      value = inputValue;
    }

    switch (currentQuestion.type) {
      case "single-select":
        value = singleSelectValue;
        isValid = !!value;
        if (!isValid) {
          setValidationErrors((prev) => ({
            ...prev,
            singleSelect: "Please select an option.",
          }));
        } else {
          setValidationErrors((prev) => ({
            ...prev,
            singleSelect: null,
          }));
        }
        break;
      case "dropdown":
        value = singleSelectValue;
        isValid = !!value;
        if (!isValid) {
          setValidationErrors((prev) => ({
            ...prev,
            dropdown: "Please select an option.",
          }));
        } else {
          setValidationErrors((prev) => ({
            ...prev,
            dropdown: null,
          }));
        }
        break;
      case "multi-select":
        value = multiSelectValue;
        isValid = multiSelectValue.length > 0;
        if (!isValid) {
          setValidationErrors((prev) => ({
            ...prev,
            multiSelect: "Please select at least one option.",
          }));
        } else {
          setValidationErrors((prev) => ({
            ...prev,
            multiSelect: null,
          }));
        }
        break;
      case "number-range":
        value = numberValue[0];
        isValid = true;
        break;
      case "date":
        value = dateValue;
        isValid = !!dateValue;
        if (!isValid) {
          setValidationErrors((prev) => ({
            ...prev,
            date: "Please select a date.",
          }));
        } else {
          setValidationErrors((prev) => ({
            ...prev,
            date: null,
          }));
        }
        break;
      case "text":
        value = value || textValue;
        isValid = !!value.trim();
        if (!isValid) {
          setValidationErrors((prev) => ({
            ...prev,
            text: "This field is required.",
          }));
        } else {
          setValidationErrors((prev) => ({
            ...prev,
            text: null,
          }));
        }
        break;

      case "long-text":
        value = value || textValue;
        isValid = value.trim().length >= 10;
        if (!isValid) {
          setValidationErrors((prev) => ({
            ...prev,
            longText: value.trim()
              ? "Please enter at least 10 characters."
              : "This field is required.",
          }));
        } else {
          setValidationErrors((prev) => ({
            ...prev,
            longText: null,
          }));
        }
        break;
      case "email":
        value = value || emailValue;
        isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        if (!isValid) {
          setValidationErrors((prev) => ({
            ...prev,
            email: "Please enter a valid email address.",
          }));
        } else {
          setValidationErrors((prev) => ({
            ...prev,
            email: null,
          }));
        }
        break;
    }

    if (!isValid) {
      // Show validation error
      return;
    }

    // Update form responses
    const updatedResponses = {
      ...formResponses,
      [currentQuestion.order]: value,
    };
    setFormResponses(updatedResponses);

    // Add user message
    let displayValue = value;
    if (Array.isArray(value)) {
      displayValue = value.join(", ");
    } else if (value instanceof Date) {
      displayValue = format(value, "PPP");
    }

    // Add user message with their answer
    const userMessage: any = {
      role: "user",
      content: String(displayValue),
    };

    // Get current question index
    const currentIndex = formQuestions.findIndex((q) => {
      if (currentQuestion?.order && q?.order) {
        return q.order === currentQuestion.order;
      } else if (currentQuestion?.number && q?.number) {
        return q.number === currentQuestion.number;
      }
      return false;
    });

    if (currentIndex < formQuestions.length - 1) {
      // There's a next question
      const nextQuestion = formQuestions[currentIndex + 1];

      // Add the user's answer and then the next question from the assistant
      append(userMessage);

      // Wait a moment before showing the next question to ensure user message renders
      // setTimeout(() => {
      //   append({
      //     role: "assistant",
      //     content: `Thank you! ${nextQuestion.title}`,
      //   });

      //   // Set the next question as current
      setCurrentQuestion(nextQuestion);
      // }, 100);
    } else {
      // This was the last question
      append(userMessage);

      // Wait a moment before showing the completion message
      setTimeout(() => {
        append({
          role: "assistant",
          content:
            "Thank you for completing all the questions! Your responses have been recorded.",
        });
        setCurrentQuestion(null);
        setTimeout(() => {
          setIsFormComplete(true);
        }, 5000);
      }, 500);
    }

    // Reset input values
    setSingleSelectValue("");
    setMultiSelectValue([]);
    setNumberValue([5]);
    setDateValue(undefined);
    setTextValue("");
    setEmailValue("");

    // Update progress
    const nextProgress = ((currentIndex + 2) / formQuestions.length) * 100;
    setProgress(nextProgress);
  };

  // Render the appropriate input component based on question type
  const renderQuestionInput = () => {
    if (!currentQuestion) return null;

    switch (currentQuestion.type) {
      case "single-select":
        return (
          <>
            <RadioGroup
              value={singleSelectValue}
              onValueChange={setSingleSelectValue}
              className="space-y-2 mt-4"
            >
              {currentQuestion.options?.map((option: any) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={option} />
                  <Label htmlFor={option}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
            {validationErrors.singleSelect && (
              <p className="text-red-500 text-sm mt-2">
                {validationErrors.singleSelect}
              </p>
            )}
          </>
        );

      case "dropdown":
        return (
          <>
            <Select
              value={singleSelectValue}
              onValueChange={setSingleSelectValue}
            >
              <SelectTrigger className="w-full mt-4">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {currentQuestion.options?.map((option: any) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {validationErrors.dropdown && (
              <p className="text-red-500 text-sm mt-2">
                {validationErrors.dropdown}
              </p>
            )}
          </>
        );
      case "multi-select":
        return (
          <div className="space-y-2 mt-4">
            {currentQuestion.options?.map((option: any) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={option}
                  checked={multiSelectValue.includes(option)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setMultiSelectValue([...multiSelectValue, option]);
                    } else {
                      setMultiSelectValue(
                        multiSelectValue.filter((id) => id !== option)
                      );
                    }
                  }}
                />
                <Label htmlFor={option}>{option}</Label>
              </div>
            ))}
            {validationErrors.multiSelect && (
              <p className="text-red-500 text-sm mt-2">
                {validationErrors.multiSelect}
              </p>
            )}
          </div>
          //   <div className="space-y-2 mt-4">
          //     {currentQuestion.options?.map((option) => (
          //       <div key={option.id} className="flex items-center space-x-2">
          //         <Checkbox
          //           id={option.id}
          //           checked={multiSelectValue.includes(option.id)}
          //           onCheckedChange={(checked) => {
          //             if (checked) {
          //               setMultiSelectValue([...multiSelectValue, option.id]);
          //             } else {
          //               setMultiSelectValue(
          //                 multiSelectValue.filter((id) => id !== option.id)
          //               );
          //             }
          //           }}
          //         />
          //         <Label htmlFor={option.id}>{option.label}</Label>
          //       </div>
          //     ))}
          //     {validationErrors.multiSelect && (
          //       <p className="text-red-500 text-sm mt-2">
          //         {validationErrors.multiSelect}
          //       </p>
          //     )}
          //   </div>
        );

      case "number-range":
        return (
          <div className="space-y-4 mt-4">
            <Slider
              value={numberValue}
              min={currentQuestion?.scale?.min || 1}
              max={currentQuestion?.scale?.max || 10}
              step={1}
              onValueChange={setNumberValue}
            />
            <div className="flex justify-between">
              <span>{currentQuestion?.scale?.min || 1}</span>
              <span className="font-bold">{numberValue[0]}</span>
              <span>{currentQuestion?.scale?.max || 10}</span>
            </div>
          </div>
        );

      case "date":
        return (
          <div className="mt-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateValue && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateValue ? format(dateValue, "PPP") : "Select a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateValue}
                  onSelect={setDateValue}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {validationErrors.date && (
              <p className="text-red-500 text-sm mt-2">
                {validationErrors.date}
              </p>
            )}
          </div>
        );

      case "text":
        return (
          <>
            <Input
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              className="mt-4"
              placeholder="Type your answer..."
            />
            {validationErrors.text && (
              <p className="text-red-500 text-sm mt-2">
                {validationErrors.text}
              </p>
            )}
          </>
        );

      case "long-text":
        return (
          <>
            <Textarea
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              className="mt-4"
              placeholder="Type your answer..."
              rows={4}
            />
            {validationErrors.longText && (
              <p className="text-red-500 text-sm mt-2">
                {validationErrors.longText}
              </p>
            )}
          </>
        );

      case "email":
        return (
          <>
            <Input
              type="email"
              value={emailValue}
              onChange={(e) => setEmailValue(e.target.value)}
              className="mt-4"
              placeholder="your@email.com"
            />
            {validationErrors.email && (
              <p className="text-red-500 text-sm mt-2">
                {validationErrors.email}
              </p>
            )}
          </>
        );
    }
  };

  // Splash screen component
  const SplashScreen = () => (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center p-6 z-50">
      <div className="w-full max-w-md text-center">
        <div className="relative h-40 mb-8">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-20 bg-yellow-300 rotate-12 transform-gpu z-10"></div>
          <div className="absolute top-6 right-1/3 w-24 h-16 bg-purple-200 -rotate-6 transform-gpu z-20"></div>
          <div className="absolute top-16 left-1/3 w-28 h-16 bg-green-200 rotate-3 transform-gpu z-30"></div>
        </div>

        <h1 className="text-4xl font-bold mb-6 text-gray-900">
          {/* Good afternoon! */}
          {survey?.title}
        </h1>

        <p className="text-gray-600 mb-12 text-lg max-w-md mx-auto">
          {/* Welcome! We're curious about your experience with AI tools for survey
          creation. Your insights will help us improve these tools. Let's get
          started! */}
          {survey?.description}
        </p>

        {/* Email input if collectEmailByDefault is true */}
        {survey?.settings?.defaults?.collectEmailByDefault && (
          <div className="mb-6">
            <Input
              type="email"
              className="mt-2"
              placeholder="Enter your email"
              value={emailValue}
              onChange={(e) => setEmailValue(e.target.value)}
              autoFocus
            />
            {validationErrors.email && (
              <p className="text-red-500 text-sm mt-2">
                {validationErrors.email}
              </p>
            )}
          </div>
        )}

        <Button
          size="lg"
          className="px-8 py-6 rounded-full bg-black hover:bg-gray-800 text-white"
          onClick={onGetStartedButton}
        >
          Get Started <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );

  const onGetStartedButton = () => {
    if (!survey) {
      setErrorPage(true);
      return;
    }
    const requiresEmail = survey?.settings?.defaults?.collectEmailByDefault;

    if (requiresEmail) {
      if (!emailValue || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
        setValidationErrors((prev) => ({
          ...prev,
          email: "Please enter a valid email address.",
        }));
        return;
      }

      setValidationErrors((prev) => ({ ...prev, email: null }));
    }

    setShowSplash(false);
  };

  const checkIfDisabled = () => {
    if (
      isLoading ||
      isFormComplete ||
      currentQuestion === null ||
      currentQuestion?.type === "date" ||
      currentQuestion?.type === "multi-select" ||
      currentQuestion?.type === "single-select" ||
      currentQuestion?.type === "number-range" ||
      currentQuestion?.type === "dropdown"
    ) {
      return true;
    }

    return false;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Show splash screen if showSplash is true */}
      {showSplash && !errorPage && <SplashScreen />}
      {errorPage && <SurveyNotFound />}
      {/* Progress bar */}
      {!showSplash && !errorPage && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
          <div
            className="h-full bg-purple-500 transition-all duration-500 ease-in-out"
            style={{ width: `${progress}%` }}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            role="progressbar"
          ></div>
        </div>
      )}

      <div className="flex-1 max-w-2xl mx-auto w-full pb-16 p-4">
        <div className="space-y-4 mb-4">
          {messages
            .filter((m) => m.role !== "system")
            .map((message) => {
              // Remove any markers from the displayed message
              const displayContent = message.content
                .replace(/QUESTION_DATA:[^:]+:[^:]+/g, "")
                .replace(/FORM_COMPLETE/g, "")
                .trim();

              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div className="flex items-start gap-3 max-w-[80%]">
                    {message.role !== "user" && (
                      <Avatar>
                        <AvatarFallback>AI</AvatarFallback>
                        <AvatarImage src="/placeholder.svg?height=40&width=40" />
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        "rounded-lg px-4 py-2",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-white shadow-sm"
                      )}
                    >
                      {displayContent}
                    </div>
                    {message.role === "user" && (
                      <Avatar>
                        <AvatarFallback>U</AvatarFallback>
                        <AvatarImage src="/placeholder.svg?height=40&width=40" />
                      </Avatar>
                    )}
                  </div>
                </div>
              );
            })}
          <div ref={messagesEndRef} />
        </div>

        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>AI</AvatarFallback>
                <AvatarImage src="/placeholder.svg?height=40&width=40" />
              </Avatar>
              <div className="bg-white shadow-sm rounded-lg px-4 py-2">
                <div className="flex space-x-2">
                  <div
                    className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {isFormComplete ? (
          <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 z-50 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md text-center">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mx-auto mb-6">
                <svg
                  className="h-10 w-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <h2 className="text-3xl font-bold mb-4 text-gray-900">
                Form Completed!
              </h2>
              <p className="text-gray-600 mb-8">
                Thank you for submitting your information. Your application has
                been received and will be processed shortly.
              </p>

              <Button
                size="lg"
                className="w-full mb-8"
                onClick={() => window.location.reload()}
              >
                Start New Form
              </Button>

              <p className="text-sm text-gray-500 mt-auto">
                Powered by FormGenius
              </p>
            </div>
          </div>
        ) : currentQuestion ? (
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-medium mb-2">{currentQuestion.title}</h3>
            {renderQuestionInput()}
            <Button className="mt-4 w-full" onClick={() => submitFormInput()}>
              Submit Answer
            </Button>
          </div>
        ) : (
          <></>
        )}
      </div>
      {!showSplash && (
        <div className="fixed bottom-0 left-0 right-0 backdrop-blur-sm p-4 border-t border-gray-200 shadow-md">
          <div className="max-w-2xl mx-auto w-full">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                customHandleSubmit(e);
              }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder="Type your message..."
                disabled={checkIfDisabled()}
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={checkIfDisabled() || !input.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
``;
