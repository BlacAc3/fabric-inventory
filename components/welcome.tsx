"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import LoadingSpinner from "@/components/loading-spinner";
import AddFabricModal from "@/components/add-fabric-modal";
import type { Fabric } from "@/types/fabric";

export default function Welcome() {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcription, setTranscription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [manualInput, setManualInput] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);
  const [audioVisualization, setAudioVisualization] = useState<number[]>(
    Array(50).fill(3),
  );
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [showAddFabricModal, setShowAddFabricModal] = useState(false);
  const [fabricData, setFabricData] = useState<Partial<Fabric> | null>(null);
  const [isVoiceProcessed, setIsVoiceProcessed] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneStreamRef = useRef<MediaStream | null>(null);

  // Update the startRecording function to handle microphone access errors better
  const startRecording = async () => {
    try {
      setError(null);
      setAiResponse(null);
      setIsVoiceProcessed(false);

      // Check if MediaDevices API is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          "Your browser doesn't support audio recording. Please use the text input option instead.",
        );
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      microphoneStreamRef.current = stream;

      // Set up audio context for visualization
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;

      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      // Start visualization
      visualize();

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        setAudioBlob(audioBlob);
        processAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error("Error accessing microphone:", err);

      // Handle specific error types
      if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setError(
          "No microphone found. Please connect a microphone or use text input instead.",
        );
        setShowManualInput(true);
      } else if (
        err.name === "NotAllowedError" ||
        err.name === "PermissionDeniedError"
      ) {
        setError(
          "Microphone access denied. Please allow microphone access or use text input instead.",
        );
        setShowManualInput(true);
      } else {
        setError(
          `Could not access microphone: ${err.message}. Please use text input instead.`,
        );
        setShowManualInput(true);
      }
    }
  };

  // Update the component to check for browser support on mount
  useEffect(() => {
    // Check if running in a browser and if the MediaDevices API is supported
    const isBrowserSupported =
      typeof window !== "undefined" &&
      navigator &&
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia;

    if (!isBrowserSupported) {
      setError(
        "Your browser doesn't support audio recording. Please use the text input instead.",
      );
      setShowManualInput(true);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (microphoneStreamRef.current) {
        microphoneStreamRef.current
          .getTracks()
          .forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Stop visualization
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      // Stop microphone
      if (microphoneStreamRef.current) {
        microphoneStreamRef.current
          .getTracks()
          .forEach((track) => track.stop());
      }
    }
  };

  const visualize = () => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateVisualization = () => {
      if (!analyserRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArray);

      // Sample the frequency data to get visualization points
      const sampleSize = Math.floor(bufferLength / 50);
      const newVisualization = Array(50)
        .fill(0)
        .map((_, i) => {
          const startIndex = i * sampleSize;
          const endIndex = startIndex + sampleSize;
          const slice = dataArray.slice(startIndex, endIndex);
          const average = slice.reduce((a, b) => a + b, 0) / slice.length;
          // Scale to a reasonable range (3-30)
          return Math.max(3, Math.min(30, average / 8));
        });

      setAudioVisualization(newVisualization);
      animationFrameRef.current = requestAnimationFrame(updateVisualization);
    };

    updateVisualization();
  };

  const processAudio = async (blob: Blob) => {
    setIsProcessing(true);

    try {
      // Send the audio directly as binary data
      const response = await fetch(
        "https://n8n-service-sfwl.onrender.com/webhook/ccc75f32-25c6-4a20-8c5d-03af731baa4b",
        {
          method: "POST",
          body: blob, // Send the raw Blob directly
          headers: {
            "Content-Type": "audio/wav", // Set the correct content type
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      // Parse the response JSON
      const json = await response.json();
      const data = json.data.output;
      console.log(data);
      console.log(json.data.transcription);
      if (data && json.data.transcription) {
        setTranscription(json.data.transcription);

        // Parse fabric data from response
        if (data.name) {
          // The API returns data in this format, convert it to our Fabric format
          const newFabricData: Partial<Fabric> = {
            name: data.name || "Some Fabric",
            price: data.price ? parseFloat(data.price.toFixed(2)) : 15.99, // Convert cents to dollars
            stockLevel: data.stock || 10,
            minStockLevel: 5, // Default value
            color: data.color !== "None" ? data.color : "",
            supplier: data.supplier || "None",
            category: data.category || "",
            composition: data.material ? `100% ${data.material}` : "Mixed",
            width: data.width || null, // Default value
            lastUpdated: new Date().toISOString().split("T")[0],
          };

          // Set image based on category or material
          const imageType =
            data.material?.toLowerCase() ||
            data.category?.toLowerCase() ||
            "fabric";
          const validImageTypes = [
            "cotton",
            "silk",
            "wool",
            "linen",
            "polyester",
            "denim",
          ];
          const fabricType =
            validImageTypes.find((type) => imageType.includes(type)) ||
            "fabric";
          const imageNumber = Math.random() > 0.5 ? 1 : 2;
          newFabricData.imageUrl = `/images/fabrics/${fabricType}-${imageNumber}.png`;

          setFabricData(newFabricData);
          setIsVoiceProcessed(true);
          setShowAddFabricModal(true); // This ensures modal pops up
          setIsProcessing(false);

          setAiResponse(
            `I've identified fabric details from your voice input. Opening the add fabric form with the extracted information.`,
          );
        }
      } else {
        // Fallback if the response format is unexpected
        setTranscription(
          "I received your audio but couldn't understand what was said.",
        );
        setIsProcessing(false);
        setAiResponse(
          "I couldn't extract fabric details from your audio. Would you like to try again?",
        );
      }
    } catch (err: any) {
      console.error("Error processing audio:", err);
      setError(`Failed to process audio: ${err.message}`);
      setIsProcessing(false);
    }
  };

  // Return failure if we couldn't extract meaningful data

  const processTextInput = async () => {
    if (!manualInput.trim()) return;

    setIsProcessing(true);
    setTranscription(manualInput);

    // Mock processing for text input to show modal
    setTimeout(() => {
      // Create sample fabric data based on text input

      setIsVoiceProcessed(true);
      setShowAddFabricModal(true); // Show modal for text input too
      setIsProcessing(false);

      setAiResponse(
        `I've created a fabric entry based on your text input: "${manualInput}"`,
      );
    }, 1500);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleContinue = () => {
    router.push("/inventory");
  };

  const toggleInputMethod = () => {
    setShowManualInput(!showManualInput);
  };

  const resetConversation = () => {
    setTranscription("");
    setAiResponse(null);
    setManualInput("");
    setFabricData(null);
    setIsVoiceProcessed(false);
    setShowAddFabricModal(false);
  };

  const handleShowAddFabricModal = () => {
    // Create a default fabric if none exists
    if (!fabricData) {
      const defaultFabric: Partial<Fabric> = {
        name: "New Fabric",
        price: 15.99,
        stockLevel: 10,
        minStockLevel: 5,
        color: "",
        supplier: "Manual Entry",
        category: "Cotton",
        composition: "100% Cotton",
        width: 150,
        lastUpdated: new Date().toISOString().split("T")[0],
        imageUrl: "/images/fabrics/cotton-1.png",
      };
      setFabricData(defaultFabric);
    }
    setShowAddFabricModal(true);
  };

  const handleCloseAddFabricModal = () => {
    setShowAddFabricModal(false);
  };

  const handleSaveFabric = (fabric: Fabric) => {
    // In a real application, you would save this to your database or state management
    console.log("Saving fabric:", fabric);

    // Close the modal and reset states
    setShowAddFabricModal(false);
    setFabricData(null);
    setIsVoiceProcessed(false);

    // Show success message
    setAiResponse("Fabric has been successfully added to your inventory.");

    // Navigate to inventory after a short delay
    setTimeout(() => {
      router.push("/inventory");
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Header onAddNewClick={handleShowAddFabricModal} currentPage="voice" />

      {/* Modal for adding fabric - will show when showAddFabricModal is true */}
      {showAddFabricModal && (
        <AddFabricModal
          onClose={handleCloseAddFabricModal}
          onSave={handleSaveFabric}
          fabrics={[]}
          initialData={fabricData || undefined}
        />
      )}
      <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="max-w-3xl w-full animate-scale">
          <div className="card shadow-soft-lg overflow-hidden mb-6">
            <div className="relative bg-gradient-to-br from-primary-600 to-primary-700 text-white p-6">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/30 rounded-bl-full"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-800/20 rounded-tr-full"></div>
              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-2 tracking-tight">
                  Fabric Inventory Voice Assistant
                </h2>
                <p className="text-primary-100 max-w-xl text-sm md:text-base">
                  Speak or type your inventory commands. I can help you add
                  items, check stock levels, and more.
                </p>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-gradient-to-br from-neutral-50 to-white rounded-xl p-6 mb-6 shadow-inner border border-neutral-200/80">
                {!showManualInput ? (
                  <div className="text-center">
                    <div className="mb-4">
                      <div className="relative w-20 h-20 mx-auto mb-3">
                        <div
                          className={`absolute inset-0 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
                            isRecording
                              ? "bg-error-600 text-white"
                              : isProcessing
                                ? "bg-warning-100"
                                : error
                                  ? "bg-error-50"
                                  : "bg-primary-600 text-white"
                          }`}
                        >
                          {isRecording ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="w-8 h-8"
                            >
                              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                              <line x1="12" x2="12" y1="19" y2="22" />
                            </svg>
                          ) : isProcessing ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="w-8 h-8 text-warning-600 animate-spin-slow"
                            >
                              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                            </svg>
                          ) : error ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="w-8 h-8 text-error-600"
                            >
                              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                              <line x1="12" x2="12" y1="9" y2="13" />
                              <line x1="12" x2="12.01" y1="17" y2="17" />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="w-8 h-8"
                            >
                              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                              <line x1="12" x2="12" y1="19" y2="22" />
                            </svg>
                          )}
                        </div>

                        {/* Animated rings around microphone */}
                        {isRecording && (
                          <>
                            <div className="absolute inset-0 rounded-full bg-error-500 opacity-20 animate-ping"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-error-500 opacity-30 animate-pulse"></div>
                          </>
                        )}
                      </div>

                      {isRecording && (
                        <div className="text-error-600 font-medium mb-3 flex items-center justify-center">
                          <div className="w-2 h-2 bg-error-500 rounded-full animate-pulse mr-2"></div>
                          <span>Recording... {formatTime(recordingTime)}</span>
                        </div>
                      )}

                      {isProcessing && (
                        <div className="text-warning-700 font-medium mb-3 flex items-center justify-center">
                          <LoadingSpinner size="sm" />
                          <span className="ml-2">Processing...</span>
                        </div>
                      )}

                      {error && (
                        <div className="text-error-600 mb-3 p-3 bg-error-50 rounded-lg border border-error-100 text-left shadow-soft-sm">
                          <p className="font-medium mb-1 text-sm">{error}</p>
                        </div>
                      )}
                    </div>

                    {/* Audio visualization */}
                    {isRecording && (
                      <div className="h-16 mb-4 flex items-center justify-center">
                        <div className="flex items-center space-x-[2px]">
                          {audioVisualization.map((height, index) => (
                            <div
                              key={index}
                              className="w-1 bg-primary-500 rounded-full transition-all duration-100"
                              style={{ height: `${height}px` }}
                            ></div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-center space-x-3">
                      {!isRecording && !isProcessing && (
                        <button
                          onClick={startRecording}
                          className="btn btn-primary btn-md"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-4 h-4 mr-2"
                          >
                            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                            <line x1="12" x2="12" y1="19" y2="22" />
                          </svg>
                          Start Recording
                        </button>
                      )}

                      {isRecording && (
                        <button
                          onClick={stopRecording}
                          className="btn btn-md bg-error-600 text-white"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-4 h-4 mr-2"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <rect x="9" y="9" width="6" height="6" />
                          </svg>
                          Stop
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center mr-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-4 h-4 text-neutral-600"
                        >
                          <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                          <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
                          <path d="M9 9l1 0" />
                          <path d="M9 13l6 0" />
                          <path d="M9 17l6 0" />
                        </svg>
                      </div>
                      <h3 className="text-base font-medium text-neutral-800">
                        Text Input
                      </h3>
                    </div>
                    <div className="flex space-x-2">
                      <textarea
                        value={manualInput}
                        onChange={(e) => setManualInput(e.target.value)}
                        placeholder="Type your inventory command (e.g., 'Add 20 yards of blue cotton fabric from TextileMasters, priced at $15.50 per yard')"
                        className="w-full h-24 p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 shadow-inner text-sm"
                      ></textarea>
                      <button
                        onClick={processTextInput}
                        disabled={!manualInput.trim() || isProcessing}
                        className={`px-3 self-end rounded-lg text-sm font-medium h-10 transition-all duration-200 button-pop flex items-center justify-center ${
                          !manualInput.trim() || isProcessing
                            ? "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                            : "bg-primary-600 hover:bg-primary-700 text-white hover:shadow-md"
                        }`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-4 h-4"
                        >
                          <path d="m22 2-7 20-4-9-9-4Z" />
                          <path d="M22 2 11 13" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center">
                <div className="flex space-x-3 mb-3 sm:mb-0">
                  <button
                    onClick={toggleInputMethod}
                    className="text-primary-600 hover:text-primary-800 text-sm font-medium transition-colors duration-200 flex items-center"
                  >
                    {showManualInput ? (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-4 h-4 mr-2"
                        >
                          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                          <line x1="12" x2="12" y1="19" y2="22" />
                        </svg>
                        Switch to Voice
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-4 h-4 mr-2"
                        >
                          <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                          <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
                          <path d="M9 9l1 0" />
                          <path d="M9 13l6 0" />
                          <path d="M9 17l6 0" />
                        </svg>
                        Switch to Text
                      </>
                    )}
                  </button>

                  {(transcription || aiResponse) && (
                    <button
                      onClick={resetConversation}
                      className="text-neutral-600 hover:text-neutral-800 text-sm font-medium transition-colors duration-200 flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-4 h-4 mr-2"
                      >
                        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38" />
                      </svg>
                      Reset
                    </button>
                  )}
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleContinue}
                    className="btn btn-outline btn-md"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4 mr-2"
                    >
                      <path d="M20 6v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8.5a2 2 0 0 1 2-2h4.586a1 1 0 0 1 .707.293L15 8.5a1 1 0 0 1 .293.707V9h2a2 2 0 0 1 2 2v-5Z" />
                      <path d="M8 6V4a2 2 0 0 1 2-2h4.586a1 1 0 0 1 .707.293L17 4a1 1 0 0 1 .293.707V6" />
                    </svg>
                    View Inventory
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick command suggestions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <div
              onClick={() =>
                setManualInput(
                  "Add 30 yards of red silk fabric from LuxuryTextiles at $25 per yard",
                )
              }
              className="card p-3 hover:shadow-md transition-all duration-200 cursor-pointer hover:translate-y-[-2px] flex items-center"
            >
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 text-primary-600"
                >
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
              </div>
              <p className="text-neutral-700 text-sm">Add red silk fabric</p>
            </div>

            <div
              onClick={() =>
                setManualInput("Check stock levels for cotton fabrics")
              }
              className="card p-3 hover:shadow-md transition-all duration-200 cursor-pointer hover:translate-y-[-2px] flex items-center"
            >
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 text-primary-600"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </div>
              <p className="text-neutral-700 text-sm">
                Check cotton fabric stock
              </p>
            </div>

            <div
              onClick={() =>
                setManualInput("Update price of blue denim to $18.50 per yard")
              }
              className="card p-3 hover:shadow-md transition-all duration-200 cursor-pointer hover:translate-y-[-2px] flex items-center"
            >
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 text-primary-600"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
              </div>
              <p className="text-neutral-700 text-sm">Update denim price</p>
            </div>

            <div
              onClick={() =>
                setManualInput("Show me fabrics with critical stock levels")
              }
              className="card p-3 hover:shadow-md transition-all duration-200 cursor-pointer hover:translate-y-[-2px] flex items-center"
            >
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 text-primary-600"
                >
                  <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" x2="12" y1="9" y2="13" />
                  <line x1="12" x2="12.01" y1="17" y2="17" />
                </svg>
              </div>
              <p className="text-neutral-700 text-sm">
                Show critical stock items
              </p>
            </div>
          </div>

          <div className="text-center text-neutral-500 text-xs">
            <p>
              This AI assistant is in development. Future versions will support
              more advanced inventory management commands.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
