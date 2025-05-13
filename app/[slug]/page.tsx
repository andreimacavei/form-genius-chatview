"use client";

import { useState, useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, User, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useParams } from "next/navigation";
import { SurveyNotFound } from "@/components/survey-not-found";
import SplashScreen from "@/components/splash-screen";
import { useDumbChat } from "@/hooks/use-dumb-chat";
import {
  validateSingleSelect,
  validateDropdown,
  validateMultiSelect,
  validateNumberRange,
  validateDate,
  validateText,
  validateLongText,
  validateEmail,
} from "../../lib/validation";

import {
  SingleSelectInput,
  DropdownInput,
  MultiSelectInput,
  NumberRangeInput,
  DateInput,
  TextInput,
  LongTextInput,
  EmailInput,
} from "@/components/question-inputs";

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
  const [useConversationalAI, setUseConversationalAI] =
    useState<boolean>(false);
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
  const [isSurveyLoading, setIsSurveyLoading] = useState<boolean>(true);
  const [isThinking, setIsThinking] = useState<boolean>(false);

  const smartChat = useChat({
    api: "/api/chat",
    body: {
      questions: formQuestions,
      language: "english",
    },
    onFinish: (message) => {
      try {
      } catch (error) {
        console.error("Failed to process question data:", error);
      }
    },
  });

  const dumbChat = useDumbChat({ questions: formQuestions });

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    append,
    isLoading,
  } = useConversationalAI ? smartChat : dumbChat;

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
      setIsSurveyLoading(true);
      try {
        const response = await fetch(`/api/surveys/${slug}`);
        if (response.ok) {
          const data = await response.json();
          if (data.response) {
            setSurvey(data?.response);
            const useAI = data?.response?.settings?.presentation?.useAI;
            setUseConversationalAI(useAI);

            if (data.response.survey_questions.length > 0) {
              mapApiSurveysAsFormQuestions(data.response.survey_questions);
            }
          }
        } else {
          if (response.status === 404) {
            setSurvey(null);
            setErrorPage(true);
          }
        }
      } catch (error: any) {
        if (error?.status === 404) {
          setSurvey(null);
          setErrorPage(true);
        }
      } finally {
        setIsSurveyLoading(false);
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

    // Loading is complete
    setIsSurveyLoading(false);
  };

  const customHandleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submitFormInput(input);

    if (useConversationalAI) {
      handleSubmit(e);
    }
  };

  const submitFormInput = (inputValue?: string) => {
    console.log("Submitting form input...");
    if (!currentQuestion) return;

    // Validation function mapping
    const validationMap: Record<
      string,
      (value: any) => { isValid: boolean; error: string | null }
    > = {
      "single-select": validateSingleSelect,
      dropdown: validateDropdown,
      "multi-select": validateMultiSelect,
      "number-range": validateNumberRange,
      date: validateDate,
      text: validateText,
      "long-text": validateLongText,
      email: validateEmail,
    };

    // Get value based on question type
    let value: any = "";
    switch (currentQuestion.type) {
      case "single-select":
      case "dropdown":
        value = singleSelectValue;
        break;
      case "multi-select":
        value = multiSelectValue;
        break;
      case "number-range":
        value = numberValue[0];
        break;
      case "date":
        value = dateValue;
        break;
      case "text":
      case "long-text":
        value = value || textValue;
        break;
      case "email":
        value = value || emailValue;
        break;
      default:
        value = value;
    }

    // Validate using the mapped function
    const validateFn = validationMap[currentQuestion.type];
    const { isValid, error } = validateFn
      ? validateFn(value)
      : { isValid: true, error: null };

    // Set validation errors
    if (!isValid) {
      setValidationErrors((prev) => ({
        ...prev,
        [currentQuestion.type === "long-text"
          ? "longText"
          : currentQuestion.type.replace("-", "")]: error,
      }));
      return;
    } else {
      setValidationErrors((prev) => ({
        ...prev,
        [currentQuestion.type === "long-text"
          ? "longText"
          : currentQuestion.type.replace("-", "")]: null,
      }));
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

      // Add the user's answer
      append(userMessage);

      if (!useConversationalAI) {
        setIsThinking(true);
        setTimeout(() => {
          append({
            role: "assistant",
            content: nextQuestion.title,
          });
          setCurrentQuestion(nextQuestion);
          setIsThinking(false);
        }, 1000);
      } else {
        setCurrentQuestion(nextQuestion);
      }
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
          <SingleSelectInput
            value={singleSelectValue}
            onChange={setSingleSelectValue}
            options={(currentQuestion.options || []).map((o) =>
              typeof o === "string" ? o : o.label
            )}
            error={validationErrors.singleSelect}
          />
        );
      case "dropdown":
        return (
          <DropdownInput
            value={singleSelectValue}
            onChange={setSingleSelectValue}
            options={(currentQuestion.options || []).map((o) =>
              typeof o === "string" ? o : o.label
            )}
            error={validationErrors.dropdown}
          />
        );
      case "multi-select":
        return (
          <MultiSelectInput
            value={multiSelectValue}
            onChange={setMultiSelectValue}
            options={(currentQuestion.options || []).map((o) =>
              typeof o === "string" ? o : o.label
            )}
            error={validationErrors.multiSelect}
          />
        );
      case "number-range":
        return (
          <NumberRangeInput
            value={numberValue}
            onChange={setNumberValue}
            min={currentQuestion?.scale?.min || 1}
            max={currentQuestion?.scale?.max || 10}
          />
        );
      case "date":
        return (
          <DateInput
            value={dateValue}
            onChange={setDateValue}
            error={validationErrors.date}
          />
        );
      case "text":
        return (
          <TextInput
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            error={validationErrors.text}
            placeholder="Type your answer..."
          />
        );
      case "long-text":
        return (
          <LongTextInput
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            error={validationErrors.longText}
            placeholder="Type your answer..."
          />
        );
      case "email":
        return (
          <EmailInput
            value={emailValue}
            onChange={(e) => setEmailValue(e.target.value)}
            error={validationErrors.email}
            placeholder="your@email.com"
          />
        );
    }
  };

  const onGetStartedButton = () => {
    const requiresEmail = survey?.settings?.responses?.collectEmail;

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

    // First hide splash screen
    setShowSplash(false);

    // Then simulate loading for a more natural conversation experience
    setIsThinking(true);

    // Delay setting the first question to give time for the loading animation
    setTimeout(() => {
      if (formQuestions.length > 0) {
        setCurrentQuestion(formQuestions[0]);

        // Different welcome messages based on AI mode
        if (useConversationalAI) {
          append({
            role: "assistant",
            content: `👋 Welcome to our interactive form! I'll guide you through a series of questions. Let's start with the first one: ${formQuestions[0].title}`,
          });
        } else {
          append({
            role: "assistant",
            content: formQuestions[0].title,
          });
        }

        setProgress((1 / formQuestions.length) * 100);
      }
      setIsThinking(false);
    }, 2000);
  };

  const checkIfDisabled = () => {
    if (
      isLoading ||
      isThinking ||
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

  // Survey loading component
  const SurveyLoadingScreen = () => (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center p-6 z-50">
      <div className="w-full max-w-md text-center">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-purple-500 animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Loading Survey</h2>
          <p className="text-gray-500">
            Please wait while we prepare your form...
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Show loading screen if survey is loading */}
      {isSurveyLoading && <SurveyLoadingScreen />}
      {/* Show splash screen if showSplash is true */}
      {!isSurveyLoading && showSplash && !errorPage && (
        <SplashScreen
          buttonText="Get Started"
          onButtonClick={onGetStartedButton}
          title={survey?.title || "Survey Form"}
          description={
            survey?.description ||
            "Please complete this form to provide your feedback."
          }
          showEmailInput={survey?.settings?.responses?.collectEmail}
          emailValue={emailValue}
          onEmailChange={(e) => setEmailValue(e?.target?.value)}
          emailError={validationErrors?.email}
        />
      )}
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
                      <div className="flex items-center justify-center h-8 w-8 bg-primary rounded-full p-1.5">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
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
                      <div className="flex items-center justify-center h-8 w-8 bg-primary rounded-full p-1.5">
                        <User className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          <div ref={messagesEndRef} />
        </div>

        {(isLoading || isThinking) && (
          <div className="flex justify-start mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-8 w-8 bg-primary rounded-full p-1.5">
                <Bot className="h-5 w-5 text-white" />
              </div>
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
          <div
            className="bg-white rounded-lg shadow-md p-4 mb-9 mx-[2.8rem]"
            // style={{ marginLeft: "3.2rem", marginRight: "3.2rem" }}
          >
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
              className="relative"
            >
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder="Type your message..."
                disabled={checkIfDisabled()}
                className="w-full rounded-full h-12"
              />
              <Button
                type="submit"
                disabled={checkIfDisabled() || !input.trim()}
                className="absolute rounded-full right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
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
