import React, { useState, useEffect, useRef } from "react";
import { 
  Phone, 
  PhoneCall, 
  User, 
  Clock, 
  Activity, 
  AlertCircle, 
  FileText, 
  HeartHandshake, 
  Sparkles, 
  CheckCircle2,
  Volume2,
  VolumeX,
  Play,
  Square,
  Settings2,
  PhoneOff,
  Radio,
  Check,
  MessageSquare,
  Globe,
  Info,
  Mic,
  Bot,
  ArrowLeft,
  Send
} from "lucide-react";
import { Customer, Invoice, CallLog } from "../types";

interface VoiceAgentProps {
  customers: Customer[];
  invoices: Invoice[];
  callLogs: CallLog[];
  onTriggerCall: (customerId: string, invoiceId: string, customScript?: string) => void;
  isLoading: boolean;
  theme?: "light" | "dark";
}

const LANGUAGES = [
  { code: "hi", name: "Hindi", native: "हिंदी", region: "North/Central India", flag: "🇮🇳" },
  { code: "mr", name: "Marathi", native: "मराठी", region: "Maharashtra", flag: "🇮🇳" },
  { code: "en-IN", name: "English (India)", native: "English", region: "All India", flag: "🇮🇳" },
  { code: "bn", name: "Bengali", native: "বাংলা", region: "West Bengal / East", flag: "🇮🇳" },
  { code: "ta", name: "Tamil", native: "தமிழ்", region: "Tamil Nadu", flag: "🇮🇳" },
  { code: "te", name: "Telugu", native: "తెలుగు", region: "Andhra / Telangana", flag: "🇮🇳" },
  { code: "gu", name: "Gujarati", native: "ગુજરાતી", region: "Gujarat", flag: "🇮🇳" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ", region: "Karnataka", flag: "🇮🇳" },
  { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ", region: "Punjab", flag: "🇮🇳" },
  { code: "ml", name: "Malayalam", native: "മലയാളം", region: "Kerala", flag: "🇮🇳" }
];

const LOCALIZED_TEMPLATES: Record<string, { name: string; text: string; icon: string }[]> = {
  hi: [
    {
      name: "Urgent Payment Reminder",
      icon: "🚨",
      text: "नमस्ते {customer_name} जी, उम्मीद है आप ठीक होंगे। मैं {org_name} से बात कर रही हूँ। ... देखिए, एक बहुत ही जरूरी बात थी... आपका ₹{amount} का पिछला भुगतान अभी भी बाकी है। ... यह राशि तुरंत चुकाई जानी है। कृपया आज ही इसका भुगतान कर दें ताकि आपकी सेवाएं बिना किसी रुकावट के चालू रहें। बहुत-बहुत धन्यवाद!"
    },
    {
      name: "Friendly Billing Notice",
      icon: "🌸",
      text: "नमस्ते {customer_name} जी, आप कैसे हैं? मैं {org_name} से एक छोटा सा मित्रवत रिमाइंडर देने के लिए बोल रही हूँ। ... आपके इनवॉइस नंबर {invoice_number} का ₹{amount} का भुगतान अभी लंबित है। ... अगर भुगतान करने में कोई भी समस्या आ रही हो तो कृपया हमें बताएं। बहुत-बहुत शुक्रिया!"
    },
    {
      name: "Formal Accounting Follow-up",
      icon: "💼",
      text: "सादर प्रणाम। {org_name} के लेखा विभाग से बात कर रहे हैं। ... हमें {customer_name} के अधिकृत प्रतिनिधि से संपर्क करना था। ... कृपया ध्यान दें कि आपका बकाया इनवॉइस मूल्य ₹{amount} तत्काल देय है। ... हम इस राशि का तुरंत भुगतान सुनिश्चित करने का अनुरोध करते हैं। धन्यवाद।"
    }
  ],
  mr: [
    {
      name: "Urgent Payment Reminder",
      icon: "🚨",
      text: "नमस्कार {customer_name} साहेब, आशा आहे आपण मजेत असाल. मी {org_name} मधून बोलत आहे. ... बघा, एक अत्यंत महत्त्वाचा विषय होता... आपले ₹{amount} चे पेमेंट प्रलंबित आहे. ... ही रक्कम आजच्या आज भरणे खूप गरजेचे आहे जेणेकरून आपले खाते सुरळीत चालू राहील. कृपया लवकरात लवकर सहकार्य करा. खूप खूप धन्यवाद!"
    },
    {
      name: "Friendly Billing Notice",
      icon: "🌸",
      text: "नमस्कार {customer_name} जी, कसे आहात आपण? मी {org_name} मधून एक छोटासा गोड आठवण देण्यासाठी फोन केला होता. ... आपल्या बिल क्रमांक {invoice_number} चे ₹{amount} पेमेंट अजून शिल्लक आहे. ... कृपया आपल्या सवडीनुसार पेमेंट लवकरात लवकर पूर्ण करा. धन्यवाद!"
    },
    {
      name: "Formal Accounting Follow-up",
      icon: "💼",
      text: "नमस्कार. {org_name} कंपनीच्या फायनान्स विभागाकडून अधिकृत संपर्क साधण्यात येत आहे। ... {customer_name} यांच्या खात्यावरील एकूण ₹{amount} चे बिल थकीत आहे. ... हे बिल त्वरित भरणे अत्यंत बंधनकारक आहे. कृपया ऑनलाइन पेमेंट पोर्टलद्वारे त्वरित भरणा करावा. धन्यवाद."
    }
  ],
  "en-IN": [
    {
      name: "Urgent Payment Reminder",
      icon: "🚨",
      text: "Hello {customer_name}, I hope you are doing well today. This is the collection voice assistant calling from {org_name}. ... Actually, there is an urgent matter... your outstanding invoice balance of ₹{amount} is now due. ... This amount has to be paid immediately to ensure your account remains active and in good standing. Please complete this transfer today. Thank you so much."
    },
    {
      name: "Friendly Billing Notice",
      icon: "🌸",
      text: "Hi {customer_name}, hope you are doing great! This is a super quick friendly reminder from {org_name} regarding your pending invoice {invoice_number} of ₹{amount}. ... Just wanted to check if you received the portal link, or if you need any assistance in clearing it today. Thank you!"
    },
    {
      name: "Formal Accounting Follow-up",
      icon: "💼",
      text: "Greetings. This is an official automated invoice follow-up from the billing department of {org_name} for the accounts payable team at {customer_name}. ... Please note that outstanding invoice {invoice_number} for ₹{amount} remains unpaid. ... Immediate payment is highly requested. Thank you."
    }
  ],
  bn: [
    {
      name: "Urgent Payment Reminder",
      icon: "🚨",
      text: "নমস্কার {customer_name} বাবু, আশা করি ভালো আছেন। আমি {org_name} থেকে ফোন করছি। ... দেখুন, একটি অত্যন্ত জরুরি বিষয় ছিল... আপনার ₹{amount} পেমেন্ট এখনো বাকি আছে। ... এই টাকাটি আজই মিটিয়ে দেওয়ার অনুরোধ জানাচ্ছি যাতে আপনার অ্যাকাউন্ট সক্রিয় থাকে। অনেক ধন্যবাদ!"
    },
    {
      name: "Friendly Billing Notice",
      icon: "🌸",
      text: "হ্যালো {customer_name} বাবু, কেমন আছেন? {org_name} থেকে একটি বন্ধুত্বপূর্ণ অনুস্মারক। ... আপনার ইনভয়েস {invoice_number} এর জন্য ₹{amount} বকেয়া আছে। ... অনুগ্রহ করে সময় করে পেমেন্টটি সম্পূর্ণ করুন। ধন্যবাদ!"
    },
    {
      name: "Formal Accounting Follow-up",
      icon: "💼",
      text: "নমস্কার। {org_name} এর অর্থ বিভাগ থেকে জানানো হচ্ছে। ... {customer_name} এর হিসাবের অধীনে ₹{amount} বকেয়া রয়েছে। ... অবিলম্বে এই বকেয়া পরিশোধ করার জন্য অনুরোধ করা হচ্ছে। ধন্যবাদ।"
    }
  ],
  ta: [
    {
      name: "Urgent Payment Reminder",
      icon: "🚨",
      text: "வணக்கம் {customer_name} அவர்களே, நீங்கள் நலமாக இருக்கிறீர்களா? நான் {org_name}-லிருந்து பேசுகிறேன். ... ஒரு முக்கியமான விஷயம்... உங்களது ₹{amount} நிலுவைத் தொகை இன்னும் செலுத்தப்படவில்லை. ... இந்தத் தொகையை உடனடியாகச் செலுத்துமாறு கேட்டுக்கொள்கிறோம். தயவுசெய்து ஒத்துழைக்கவும். மிக்க நன்றி!"
    },
    {
      name: "Friendly Billing Notice",
      icon: "🌸",
      text: "ஹலோ {customer_name} அவர்களே, உங்களுக்கு ஒரு அன்பான நினைவூட்டல். {org_name}-லிருந்து பேசுகிறோம். ... உங்களது இன்வாய்ஸ் {invoice_number} க்கான ₹{amount} செலுத்த வேண்டியுள்ளது. ... இன்று இதை முடிக்க முடியுமா என்று பார்க்கவும். நன்றி!"
    },
    {
      name: "Formal Accounting Follow-up",
      icon: "💼",
      text: "வணக்கம். {org_name} நிறுவனத்தின் நிதித் துறையிலிருந்து அதிகாரப்பூர்வமாக அழைக்கிறோம். ... {customer_name} கணக்கில் உள்ள ₹{amount} தொகை நிலுவையில் உள்ளது. ... இதை உடனடியாக செலுத்தி கணக்கை புதுப்பிக்குமாறு கேட்டுக்கொள்கிறோம். நன்றி."
    }
  ],
  te: [
    {
      name: "Urgent Payment Reminder",
      icon: "🚨",
      text: "నమస్కారం {customer_name} గారు, బాగున్నారా? నేను {org_name} నుండి మాట్లాడుతున్నాను. ... ఒక ముఖ్యమైన విషయం అండి... మీ ₹{amount} పేమెంట్ ఇంకా రాలేదు. ... ఈ బ్యాలెన్స్ మొత్తాన్ని వెంటనే చెల్లించాలని కోరుతున్నాము. దయచేసి త్వరగా పూర్తి చేయండి. చాలా ధన్యవాదాలు!"
    },
    {
      name: "Friendly Billing Notice",
      icon: "🌸",
      text: "హలో {customer_name} గారు, ఒక చిన్న గుర్తుచేంపు అండి. {org_name} నుండి మాట్లాడుతున్నాము. ... మీ ఇన్వాయిస్ {invoice_number} బ్యాలెన్స్ ₹{amount} చెల్లించాల్సి ఉంది. ... వీలైనంత త్వరగా చెల్లించగలరని ఆశిస్తున్నాము. ధన్యవాదాలు!"
    },
    {
      name: "Formal Accounting Follow-up",
      icon: "💼",
      text: "నమస్కారం. {org_name} ఫైనాన్స్ విభాగం నుండి అధికారిక కాల్. ... {customer_name} ఖాతాలో ₹{amount} చెల్లింపు పెండింగ్‌లో ఉంది. ... దీనిని త్వరగా పూర్తి చేయవలసిందిగా అభ్యర్థిస్తున్నాము. ధన్యవాదాలు."
    }
  ],
  gu: [
    {
      name: "Urgent Payment Reminder",
      icon: "🚨",
      text: "નમસ્તે {customer_name} જી, આશા છે આપ કુશળ હશો. હું {org_name} માંથી વાત કરું છું. ... જુઓ, એક મહત્વની બાબત હતી... તમારું ₹{amount} નું પેમેન્ટ બાકી છે. ... આ રકમ તાત્કાલિક ચૂકવવા વિનંતી છે જેથી આપણું એકાઉન્ટ ચાલુ રહે. ખૂબ ખૂબ આભાર!"
    },
    {
      name: "Friendly Billing Notice",
      icon: "🌸",
      text: "નમસ્તે {customer_name} ભાઈ, કેમ છો? હું {org_name} તરફથી નાની નમ્ર યાદ આપવા બોલું છું. ... આપના બિલ {invoice_number} ના ₹{amount} બાકી છે. ... જો શક્ય હોય તો આજે જ પૂર્ણ કરવા વિનંતી. આભાર!"
    },
    {
      name: "Formal Accounting Follow-up",
      icon: "💼",
      text: "નમસ્કાર. {org_name} કંપનીના હિસાબ વિભાગ તરફથી સત્તાવાર ફોન. ... {customer_name} ના ખાતામાં ₹{amount} ની રકમ બાકી બોલે છે. ... કૃપા કરીને આ રકમની ચૂકવણી તાત્કાલિક પૂર્ણ કરો. ધન્યવાદ."
    }
  ],
  kn: [
    {
      name: "Urgent Payment Reminder",
      icon: "🚨",
      text: "ನಮಸ್ಕಾರ {customer_name} ಅವರೇ, ಆರಾಮಾಗಿದ್ದೀರಾ? ನಾನು {org_name} ಇಂದ ಮಾತನಾಡುತ್ತಿದ್ದೇನೆ. ... ನೋಡಿ, ಒಂದು ಪ್ರಮುಖ ವಿಷಯವಿತ್ತು... ನಿಮ್ಮ ₹{amount} ಪೇಮೆಂಟ್ ಇನ್ನು ಬಂದಿಲ್ಲ. ... ಈ ಹಣವನ್ನು ದಯವಿಟ್ಟು ಇಂದೇ ಪಾವತಿಸಬೇಕಾಗಿ ವಿನಂತಿ. ಸಹಕರಿಸಿದ್ದಕ್ಕೆ ಧನ್ಯವಾದಗಳು!"
    },
    {
      name: "Friendly Billing Notice",
      icon: "🌸",
      text: "ಹಲೋ {customer_name} ಅವರೇ, ಒಂದು ಸಣ್ಣ ನೆನಪೋಲೆ. {org_name} ಇಂದ ಕರೆ ಮಾಡುತ್ತಿದ್ದೇವೆ. ... ನಿಮ್ಮ ಇನ್‌ವಾಯ್ಸ್ {invoice_number} ರ ₹{amount} ಬಾಕಿ ಇದೆ. ... ದಯವಿಟ್ಟು ಬಿಡುವು ಮಾಡಿಕೊಂಡು ಪಾವತಿಸಿ. ಧನ್ಯವಾದಗಳು!"
    },
    {
      name: "Formal Accounting Follow-up",
      icon: "💼",
      text: "ನಮಸ್ಕಾರ. {org_name} ಹಣಕಾಸು ಇಲಾಖೆಯಿಂದ ಅಧಿಕೃತ ಕರೆ. ... {customer_name} ಖಾತೆಯಲ್ಲಿ ₹{amount} ಪಾವತಿ ಬಾಕಿ ಉಳಿದಿದೆ. ... ಇದನ್ನು ಕೂಡಲೇ ಪಾವತಿಸಲು ವินಂತಿಸಲಾಗಿದೆ. ಧನ್ಯವಾದಗಳು."
    }
  ],
  pa: [
    {
      name: "Urgent Payment Reminder",
      icon: "🚨",
      text: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ {customer_name} ਜੀ, ਕੀ ਹਾਲ ਚਾਲ ਹੈ? ਮੈਂ {org_name} ਤੋਂ ਗੱਲ ਕਰ ਰਹੀ ਹਾਂ। ... ਦੇਖੋ ਜੀ, ਇੱਕ ਬਹੁਤ ਜ਼ਰੂਰੀ ਗੱਲ ਸੀ... ਤੁਹਾਡਾ ₹{amount} ਦਾ ਭੁਗਤਾਨ ਅਜੇ ਬਾਕੀ ਹੈ। ... ਕਿਰਪา ਕਰਕੇ ਇਸ ਨੂੰ ਅੱਜ ਹੀ ਜਮ੍ਹਾਂ ਕਰਵਾ ਦਿਓ ਤਾਂ ਜੋ ਤੁਹਾਡਾ ਖਾਤਾ ਚੱਲਦਾ ਰਹੇ। ਬਹੁਤ-ਬਹੁਤ ਧੰਨਵਾਦ!"
    },
    {
      name: "Friendly Billing Notice",
      icon: "🌸",
      text: "ਹੈਲੋ {customer_name} ਜੀ, ਇੱਕ ਪਿਆਰਾ ਜਿਹਾ ਰੀਮਾਈਂਡਰ। {org_name} ਵੱਲੋਂ ਗੱล ਕਰ ਰਹੇ ਹਾਂ। ... ਤੁਹਾਡੇ ਬਿਲ {invoice_number} ਦੇ ₹{amount} ਬਾਕੀ ਹਨ। ... ਕਿਰਪਾ ਕਰਕੇ ਜਲਦ ਹੀ ਪੇਮੈਂਟ ਕਰ ਦੇਣਾ। ਧੰਨਵਾਦ!"
    },
    {
      name: "Formal Accounting Follow-up",
      icon: "💼",
      text: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ। {org_name} ਦੇ ਫਾਈਨਾਂਸ ਵਿਭਾਗ ਵੱਲੋਂ ਸਰਕਾਰੀ ਕਾਲ। ... {customer_name} ਦੇ ਖાਤੇ 'ਚ ₹{amount} ਦੀ ਰਕਮ ਬਕਾਇਆ ਹੈ। ... ਕਿਰਪਾ ਕਰਕੇ ਇਸ ਦਾ ਤੁਰੰਤ ਭੁਗਤਾਨ ਕੀਤਾ ਜਾਵੇ। ਧੰਨਵਾਦ।"
    }
  ],
  ml: [
    {
      name: "Urgent Payment Reminder",
      icon: "🚨",
      text: "നമസ്കാരം {customer_name} സുഖമാണെന്ന് കരുതുന്നു. ഞാൻ {org_name}-ൽ നിന്നാണ് വിളിക്കുന്നത്. ... ഒരു പ്രധാന കാര്യമുണ്ട്... നിങ്ങളുടെ ₹{amount} അടയ്ക്കാനുള്ള കാലാവധി കഴിഞ്ഞു. ... ഇത് ഉടൻ തന്നെ അടച്ചു തീർക്കണമെന്ന് അഭ്യർത്ഥിക്കുന്നു. സഹകരണത്തിന് നന്ദి!"
    },
    {
      name: "Friendly Billing Notice",
      icon: "🌸",
      text: "ഹലോ {customer_name}, ഒരു ചെറിയ ഓർമ്മപ്പെടുത്തൽ. {org_name}-ൽ നിന്നാണ്. ... നിങ്ങളുടെ ഇൻവോയ്സ് {invoice_number} ലെ ₹{amount} അടയ്ക്കാനുണ്ട്. ... ദയവായി ഇത് ഇന്ന് തന്നെ അടയ്ക്കാൻ ശ്രദ്ധിക്കുമല്ലോ. നന്ദി!"
    },
    {
      name: "Formal Accounting Follow-up",
      icon: "💼",
      text: "നമസ്കാരം. {org_name} ധനകാര്യ വിഭാഗത്തിൽ നിന്നുള്ള ഔദ്യോഗിക കോൾ. ... {customer_name} ന്റെ അക്കൗണ്ടിൽ ₹{amount} കുടിശ്ശികയുണ്ട്. ... ഇത് ഉടൻ പണമടച്ചു തീർക്കാൻ ആവശ്യപ്പെടുന്നു. നന്ദി."
    }
  ]
};

interface SpeechChunk {
  text: string;
  pauseAfter: number;
  rateModifier: number;
}

export default function VoiceAgent({
  customers,
  invoices,
  callLogs,
  onTriggerCall,
  isLoading,
  theme = "dark"
}: VoiceAgentProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
  const [selectedLanguageId, setSelectedLanguageId] = useState("hi");
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(0);
  
  // Available browser speech synthesis voices
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState("");
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const [pitch, setPitch] = useState(1.0);
  const [rate, setRate] = useState(0.85); // 0.85 rate sounds much more human-like, relaxed, less rushed

  // Custom Human-like parameters
  const [isHumanCadenceEnabled, setIsHumanCadenceEnabled] = useState(true);
  const [isVocalInflectionEnabled, setIsVocalInflectionEnabled] = useState(true);
  const [isComfortHumEnabled, setIsComfortHumEnabled] = useState(true);
  const [humanizerStatus, setHumanizerStatus] = useState("Idle - Waiting to connect");

  // Script customization
  const [customText, setCustomText] = useState("");

  // Local UI status tracking of simulated background call
  const [activeCallStatus, setActiveCallStatus] = useState<
    "idle" | "dialing" | "connected" | "analyzing" | "complete"
  >("idle");
  const [activeCallLogText, setActiveCallLogText] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [simulatedSubtitles, setSimulatedSubtitles] = useState("");

  // Refs for audio state
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ambientNodeRef = useRef<GainNode | null>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isSpeakingRef = useRef<boolean>(false);

  // Voice Hub Mode Selector
  const [voiceHubMode, setVoiceHubMode] = useState<"outbound" | "interactive">("interactive");

  // Interactive Voice Agent States
  const [interactiveLang, setInteractiveLang] = useState("hi-IN");
  const [isInteractiveListening, setIsInteractiveListening] = useState(false);
  const [interactiveTranscript, setInteractiveTranscript] = useState<Array<{ role: "user" | "assistant"; text: string; date: string }>>([
    {
      role: "assistant",
      text: "Hello! I am your Nova AI Voice Agent. Select your preferred language, click on the microphone orb, and start speaking to me in any language! I will talk back to you in the same language.",
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [currentRecognitionText, setCurrentRecognitionText] = useState("");
  const [voicePersona, setVoicePersona] = useState<"female" | "male">("female");
  const [voicePitch, setVoicePitch] = useState<number>(1.0);
  const [voiceRate, setVoiceRate] = useState<number>(0.95);
  const [typedQuestion, setTypedQuestion] = useState("");
  const [speechError, setSpeechError] = useState<string | null>(null);
  
  const recognitionInstanceRef = useRef<any>(null);
  const interactiveSpeechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const recognitionTranscriptRef = useRef<string>("");
  const continuousSessionRef = useRef<boolean>(true);
  const fallbackTimeoutRef = useRef<any>(null);
  const isStartingRef = useRef<boolean>(false);
  const isInteractiveListeningRef = useRef<boolean>(false);
  const restartTimeoutRef = useRef<any>(null);

  const isAiProcessingRef = useRef(false);
  const isAiSpeakingRef = useRef(false);
  useEffect(() => {
    isAiProcessingRef.current = isAiProcessing;
  }, [isAiProcessing]);
  useEffect(() => {
    isAiSpeakingRef.current = isAiSpeaking;
  }, [isAiSpeaking]);

  useEffect(() => {
    return () => {
      continuousSessionRef.current = false;
      if (fallbackTimeoutRef.current) clearTimeout(fallbackTimeoutRef.current);
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
      if (recognitionInstanceRef.current) {
        try {
          const oldRec = recognitionInstanceRef.current;
          oldRec.onstart = null;
          oldRec.onresult = null;
          oldRec.onerror = null;
          oldRec.onend = null;
          oldRec.abort();
        } catch (e) {}
      }
    };
  }, []);

  const INTERACTIVE_LANGUAGES = [
    { code: "hi-IN", name: "Hindi (हिंदी)", native: "हिंदी", flag: "🇮🇳" },
    { code: "en-US", name: "English (US)", native: "English", flag: "🇺🇸" },
    { code: "mr-IN", name: "Marathi (मराठी)", native: "मराठी", flag: "🇮🇳" },
    { code: "es-ES", name: "Spanish (Español)", native: "Español", flag: "🇪🇸" },
    { code: "fr-FR", name: "French (Français)", native: "Français", flag: "🇫🇷" },
    { code: "de-DE", name: "German (Deutsch)", native: "Deutsch", flag: "🇩🇪" },
    { code: "ja-JP", name: "Japanese (日本語)", native: "日本語", flag: "🇯🇵" },
    { code: "zh-CN", name: "Chinese (简体中文)", native: "简体中文", flag: "🇨🇳" },
    { code: "ar-SA", name: "Arabic (العربية)", native: "العربية", flag: "🇸🇦" },
    { code: "pt-BR", name: "Portuguese (Português)", native: "Português", flag: "🇧🇷" },
    { code: "bn-IN", name: "Bengali (বাংলা)", native: "বাংলা", flag: "🇮🇳" },
    { code: "ta-IN", name: "Tamil (தமிழ்)", native: "தமிழ்", flag: "🇮🇳" },
    { code: "te-IN", name: "Telugu (తెలుగు)", native: "తెలుగు", flag: "🇮🇳" }
  ];

  const getLocalizedGreeting = (langCode: string) => {
    const langPrefix = langCode.split("-")[0].toLowerCase();
    switch (langPrefix) {
      case "hi":
        return "नमस्ते! मैं आपकी क्या मदद कर सकती हूँ?";
      case "mr":
        return "नमस्कार! मी तुमची काय मदत करू शकते?";
      case "es":
        return "Hola, ¿cómo puedo ayudarte?";
      case "fr":
        return "Bonjour, comment puis-je vous aider ?";
      case "de":
        return "Hallo, wie kann ich Ihnen helfen?";
      case "ja":
        return "こんにちは、どのようなご用件でしょうか？";
      case "zh":
        return "您好，我能为您做些什么？";
      case "ar":
        return "مرحباً، كيف يمكنني مساعدتك؟";
      case "pt":
        return "Olá, como posso ajudar você?";
      case "bn":
        return "নমস্কার, আমি আপনাকে কীভাবে সাহায্য করতে পারি?";
      case "ta":
        return "வணக்கம், நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?";
      case "te":
        return "నమస్కారం, నేను మీకు ఎలా సహాయపడగలను?";
      default:
        return "Hello! How can I help you?";
    }
  };

  const findBestNaturalVoice = (langCode: string, persona: "female" | "male") => {
    if (typeof window === "undefined" || !window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    const langPrefix = langCode.split("-")[0].toLowerCase();

    const langVoices = voices.filter(v => v.lang.toLowerCase().startsWith(langPrefix) || v.lang.toLowerCase().includes(langPrefix));
    
    if (langVoices.length === 0) {
      const enVoices = voices.filter(v => v.lang.toLowerCase().startsWith("en") || v.lang.toLowerCase().includes("en"));
      if (enVoices.length > 0) {
        return findBestInList(enVoices, persona);
      }
      return voices[0] || null;
    }

    return findBestInList(langVoices, persona);
  };

  const findBestInList = (list: SpeechSynthesisVoice[], persona: "female" | "male") => {
    const naturalKeywords = ["natural", "neural", "google", "siri", "samantha", "daniel", "jenny", "guy", "aria", "premium"];
    const personaKeywords = persona === "female" 
      ? ["female", "samantha", "siri", "zira", "kalpana", "heera", "hazel", "jenny", "aria", "haruka", "karen"]
      : ["male", "david", "guy", "hemant", "george", "ravi", "mark", "daniel", "microsoft"];

    for (const pKeyword of personaKeywords) {
      for (const nKeyword of naturalKeywords) {
        const matched = list.find(v => {
          const nameLower = v.name.toLowerCase();
          return nameLower.includes(pKeyword) && nameLower.includes(nKeyword);
        });
        if (matched) return matched;
      }
    }

    for (const pKeyword of personaKeywords) {
      const matched = list.find(v => v.name.toLowerCase().includes(pKeyword));
      if (matched) return matched;
    }

    for (const nKeyword of naturalKeywords) {
      const matched = list.find(v => v.name.toLowerCase().includes(nKeyword));
      if (matched) return matched;
    }

    return list[0];
  };

  const scheduleRestart = (delay = 400) => {
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
    }
    restartTimeoutRef.current = setTimeout(() => {
      if (continuousSessionRef.current && !isAiProcessingRef.current && !isAiSpeakingRef.current) {
        startInteractiveListening();
      }
    }, delay);
  };

  const speakGreetingAndThenListen = () => {
    continuousSessionRef.current = true;
    setSpeechError(null);
    if (typeof window === "undefined" || !window.speechSynthesis) {
      startInteractiveListening();
      return;
    }

    if (fallbackTimeoutRef.current) {
      clearTimeout(fallbackTimeoutRef.current);
      fallbackTimeoutRef.current = null;
    }

    window.speechSynthesis.cancel();
    setIsAiSpeaking(false);
    isAiSpeakingRef.current = false;
    setIsInteractiveListening(false);
    isInteractiveListeningRef.current = false;
    recognitionTranscriptRef.current = "";

    const greetingText = getLocalizedGreeting(interactiveLang);

    const assistantMsg = {
      role: "assistant" as const,
      text: greetingText,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setInteractiveTranscript(prev => [...prev, assistantMsg]);

    const cleanText = greetingText.trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    interactiveSpeechUtteranceRef.current = utterance;

    // Prevent garbage collection
    if (!(window as any)._activeUtterances) {
      (window as any)._activeUtterances = [];
    }
    (window as any)._activeUtterances.push(utterance);

    const bestVoice = findBestNaturalVoice(interactiveLang, voicePersona);
    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    utterance.rate = voiceRate;
    utterance.pitch = voicePitch;

    const endGreeting = () => {
      if (fallbackTimeoutRef.current) {
        clearTimeout(fallbackTimeoutRef.current);
        fallbackTimeoutRef.current = null;
      }
      if ((window as any)._activeUtterances) {
        (window as any)._activeUtterances = (window as any)._activeUtterances.filter((u: any) => u !== utterance);
      }
      setIsAiSpeaking(false);
      isAiSpeakingRef.current = false;
      setTimeout(() => {
        if (continuousSessionRef.current && !isAiProcessingRef.current && !isAiSpeakingRef.current) {
          startInteractiveListening();
        }
      }, 150);
    };

    utterance.onstart = () => {
      setIsAiSpeaking(true);
      isAiSpeakingRef.current = true;
    };

    utterance.onend = () => {
      endGreeting();
    };

    utterance.onerror = () => {
      endGreeting();
    };

    // Robust greeting fallback in case TTS is blocked or gets stuck
    const estimatedDurationMs = Math.max((cleanText.length * 80) + 2000, 4000);
    fallbackTimeoutRef.current = setTimeout(() => {
      console.warn("Greeting speech fallback triggered.");
      endGreeting();
    }, estimatedDurationMs);

    window.speechSynthesis.speak(utterance);
  };

  const handleCoreNodeClick = () => {
    if (isInteractiveListening || isStartingRef.current) {
      continuousSessionRef.current = false;
      stopInteractiveListening();
    } else if (isAiSpeaking) {
      continuousSessionRef.current = false;
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsAiSpeaking(false);
      isAiSpeakingRef.current = false;
    } else {
      continuousSessionRef.current = true;
      // If we already have a conversation transcript, start listening directly without repeating greeting
      if (interactiveTranscript.length > 1) {
        startInteractiveListening();
      } else {
        speakGreetingAndThenListen();
      }
    }
  };

  const startInteractiveListening = () => {
    setSpeechError(null);
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsAiSpeaking(false);
      isAiSpeakingRef.current = false;
    }

    if (fallbackTimeoutRef.current) {
      clearTimeout(fallbackTimeoutRef.current);
      fallbackTimeoutRef.current = null;
    }
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    // Safely abort and unbind existing instance to prevent overlapping recursive cycles
    if (recognitionInstanceRef.current) {
      try {
        const oldRec = recognitionInstanceRef.current;
        oldRec.onstart = null;
        oldRec.onresult = null;
        oldRec.onerror = null;
        oldRec.onend = null;
        oldRec.abort();
      } catch (e) {}
      recognitionInstanceRef.current = null;
    }

    if (isStartingRef.current || isInteractiveListeningRef.current) {
      console.log("Recognition is already starting or running. Skipping duplicate request.");
      return;
    }

    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      alert("Voice input is not supported in this browser. Please use Google Chrome, Safari or Microsoft Edge.");
      return;
    }

    isStartingRef.current = true;

    try {
      const rec = new SpeechRecognitionClass();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = interactiveLang;

      rec.onstart = () => {
        isStartingRef.current = false;
        setIsInteractiveListening(true);
        isInteractiveListeningRef.current = true;
        setCurrentRecognitionText("");
        recognitionTranscriptRef.current = "";
        setSpeechError(null);
      };

      rec.onresult = (event: any) => {
        let interim = "";
        let final = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        const textValue = final || interim;
        setCurrentRecognitionText(textValue);
        recognitionTranscriptRef.current = textValue;
      };

      rec.onerror = (event: any) => {
        const errorType = event.error;
        console.error("Speech recognition error:", errorType, event);
        
        setIsInteractiveListening(false);
        isInteractiveListeningRef.current = false;
        isStartingRef.current = false;

        if (errorType === "not-allowed") {
          setSpeechError("Microphone access is blocked. Please click the key/lock icon in your browser URL bar and grant microphone permission.");
          continuousSessionRef.current = false;
        } else if (errorType === "audio-capture") {
          setSpeechError("Microphone hardware was not found or is already in use by another application.");
          continuousSessionRef.current = false;
        } else if (errorType === "service-not-allowed") {
          setSpeechError("Speech recognition service is not allowed by your browser.");
          continuousSessionRef.current = false;
        } else if (errorType === "language-not-supported") {
          setSpeechError(`The selected language (${interactiveLang}) is not supported by your browser's speech engine.`);
          continuousSessionRef.current = false;
        } else if (errorType === "network") {
          setSpeechError("Network error. Speech recognition requires an active internet connection.");
          if (continuousSessionRef.current) {
            scheduleRestart(2500);
          }
        } else if (errorType === "no-speech") {
          // Silent timeout - clear previous errors, let onend handle silent restart
          setSpeechError(null);
        } else if (errorType !== "aborted") {
          setSpeechError(`Speech recognition error: ${errorType}`);
        }
      };

      rec.onend = () => {
        setIsInteractiveListening(false);
        isInteractiveListeningRef.current = false;
        isStartingRef.current = false;
        recognitionInstanceRef.current = null;

        const finalSpokenText = recognitionTranscriptRef.current;
        if (finalSpokenText && finalSpokenText.trim()) {
          handleProcessUserSpeech(finalSpokenText);
        } else {
          // No input spoken. If still in continuous session and not speaking/processing, restart listening!
          if (continuousSessionRef.current && !isAiProcessingRef.current && !isAiSpeakingRef.current) {
            scheduleRestart(400);
          }
        }
        setCurrentRecognitionText("");
        recognitionTranscriptRef.current = "";
      };

      recognitionInstanceRef.current = rec;
      rec.start();
    } catch (e: any) {
      console.error("Failed to start speech recognition:", e);
      setSpeechError(e?.message || "Failed to start speech recognition. Please verify your microphone connection.");
      setIsInteractiveListening(false);
      isInteractiveListeningRef.current = false;
      isStartingRef.current = false;
      if (continuousSessionRef.current && !isAiProcessingRef.current && !isAiSpeakingRef.current) {
        scheduleRestart(1500);
      }
    }
  };

  const stopInteractiveListening = () => {
    isStartingRef.current = false;
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    if (recognitionInstanceRef.current) {
      try {
        const oldRec = recognitionInstanceRef.current;
        oldRec.onstart = null;
        oldRec.onresult = null;
        oldRec.onerror = null;
        oldRec.onend = null;
        oldRec.abort();
      } catch (e) {}
      recognitionInstanceRef.current = null;
    }
    setIsInteractiveListening(false);
    isInteractiveListeningRef.current = false;
  };

  const handleProcessUserSpeech = async (text: string) => {
    if (!text.trim()) return;

    const userMsg = {
      role: "user" as const,
      text: text,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setInteractiveTranscript(prev => [...prev, userMsg]);
    setIsAiProcessing(true);
    isAiProcessingRef.current = true;

    try {
      const response = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-org-id": "org-nexus"
        },
        body: JSON.stringify({
          message: text,
          chatHistory: interactiveTranscript.map(t => ({
            sender: t.role === "user" ? "user" : "assistant",
            text: t.text
          }))
        })
      });

      if (!response.ok) {
        throw new Error("Voice assistant API call failed");
      }

      const data = await response.json();
      const botReply = data.text || "I was unable to process a vocal response.";

      const assistantMsg = {
        role: "assistant" as const,
        text: botReply,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setInteractiveTranscript(prev => [...prev, assistantMsg]);
      setIsAiProcessing(false);
      isAiProcessingRef.current = false;

      speakInteractiveResponse(botReply);

    } catch (err) {
      console.error("Interactive voice handler error:", err);
      setIsAiProcessing(false);
      isAiProcessingRef.current = false;
      const errorMsg = "I am sorry, but there was a connection glitch speaking to the core. Please try again.";
      setInteractiveTranscript(prev => [
        ...prev,
        {
          role: "assistant",
          text: errorMsg,
          date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      speakInteractiveResponse(errorMsg);
    }
  };

  const handleSendTypedQuestion = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!typedQuestion.trim()) return;
    
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsAiSpeaking(false);
      isAiSpeakingRef.current = false;
    }
    
    const textToSend = typedQuestion;
    setTypedQuestion("");
    handleProcessUserSpeech(textToSend);
  };

  const speakInteractiveResponse = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    if (fallbackTimeoutRef.current) {
      clearTimeout(fallbackTimeoutRef.current);
      fallbackTimeoutRef.current = null;
    }

    const cleanText = text
      .replace(/\*\*?/g, "")
      .replace(/#/g, "")
      .replace(/`{1,3}[\s\S]*?`{1,3}/g, "")
      .replace(/\[([\s\S]*?)\]\([\s\S]*?\)/g, "$1")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    interactiveSpeechUtteranceRef.current = utterance;

    // Prevent garbage collection Chrome GC bug
    if (!(window as any)._activeUtterances) {
      (window as any)._activeUtterances = [];
    }
    (window as any)._activeUtterances.push(utterance);

    const bestVoice = findBestNaturalVoice(interactiveLang, voicePersona);
    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    utterance.rate = voiceRate;
    utterance.pitch = voicePitch;

    const transitionBackToListening = () => {
      if (fallbackTimeoutRef.current) {
        clearTimeout(fallbackTimeoutRef.current);
        fallbackTimeoutRef.current = null;
      }
      if ((window as any)._activeUtterances) {
        (window as any)._activeUtterances = (window as any)._activeUtterances.filter((u: any) => u !== utterance);
      }
      setIsAiSpeaking(false);
      isAiSpeakingRef.current = false;
      setIsAiProcessing(false);
      isAiProcessingRef.current = false;

      if (continuousSessionRef.current) {
        setTimeout(() => {
          if (continuousSessionRef.current && !isAiProcessingRef.current && !isAiSpeakingRef.current) {
            startInteractiveListening();
          }
        }, 150);
      }
    };

    utterance.onstart = () => {
      setIsAiSpeaking(true);
      isAiSpeakingRef.current = true;
    };

    utterance.onend = () => {
      transitionBackToListening();
    };

    utterance.onerror = () => {
      transitionBackToListening();
    };

    // Fallback safety trigger in case browser speech synthesis fails to fire onend (unconditional to avoid hanging)
    const estimatedDurationMs = Math.max((cleanText.length * 80) + 2000, 4000);
    fallbackTimeoutRef.current = setTimeout(() => {
      console.warn("SpeechSynthesis onend fallback triggered.");
      transitionBackToListening();
    }, estimatedDurationMs);

    window.speechSynthesis.speak(utterance);
  };

  const clearInteractiveTranscript = () => {
    continuousSessionRef.current = false;
    if (fallbackTimeoutRef.current) {
      clearTimeout(fallbackTimeoutRef.current);
      fallbackTimeoutRef.current = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsAiSpeaking(false);
    isAiSpeakingRef.current = false;
    setIsInteractiveListening(false);
    setInteractiveTranscript([
      {
        role: "assistant",
        text: "Transcript cleared. Speak to me whenever you are ready!",
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Load browser voices
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Auto-select best voice when language changes or voices load
  useEffect(() => {
    if (availableVoices.length === 0) return;
    
    let voiceToSet: SpeechSynthesisVoice | undefined;
    
    if (selectedLanguageId === "hi") {
      voiceToSet = availableVoices.find(v => v.lang.startsWith("hi-IN") || v.lang.includes("hi"));
    } else if (selectedLanguageId === "mr") {
      voiceToSet = availableVoices.find(v => v.lang.startsWith("mr-IN") || v.lang.includes("mr") || v.lang.startsWith("hi-IN"));
    } else if (selectedLanguageId === "ta") {
      voiceToSet = availableVoices.find(v => v.lang.startsWith("ta-IN") || v.lang.includes("ta"));
    } else if (selectedLanguageId === "te") {
      voiceToSet = availableVoices.find(v => v.lang.startsWith("te-IN") || v.lang.includes("te"));
    } else if (selectedLanguageId === "bn") {
      voiceToSet = availableVoices.find(v => v.lang.startsWith("bn-IN") || v.lang.includes("bn"));
    } else if (selectedLanguageId === "gu") {
      voiceToSet = availableVoices.find(v => v.lang.startsWith("gu-IN") || v.lang.includes("gu"));
    } else if (selectedLanguageId === "kn") {
      voiceToSet = availableVoices.find(v => v.lang.startsWith("kn-IN") || v.lang.includes("kn"));
    } else if (selectedLanguageId === "pa") {
      voiceToSet = availableVoices.find(v => v.lang.startsWith("pa-IN") || v.lang.includes("pa"));
    } else if (selectedLanguageId === "ml") {
      voiceToSet = availableVoices.find(v => v.lang.startsWith("ml-IN") || v.lang.includes("ml"));
    } else if (selectedLanguageId === "en-IN") {
      voiceToSet = availableVoices.find(v => v.lang.startsWith("en-IN") || v.lang.includes("en"));
    }

    // Fallback to any Indian voice or general english
    if (!voiceToSet) {
      voiceToSet = availableVoices.find(v => v.lang.includes("IN") || v.lang.includes("en-IN") || v.lang.includes("en"));
    }

    if (voiceToSet) {
      setSelectedVoiceName(voiceToSet.name);
    }
  }, [selectedLanguageId, availableVoices]);

  // Current active customer & invoice
  const currentCustomer = customers.find(c => c.id === selectedCustomerId);
  const orgName = currentCustomer?.orgId === "org-apex" ? "Varma Logistics" : "Sharma Electronics";

  // Filter invoices belonging to this customer and are unpaid
  const customerUnpaidInvoices = invoices.filter(
    i => i.customerName === currentCustomer?.name && i.status !== "paid"
  );

  // Auto-select outstanding invoice when customer changes
  useEffect(() => {
    if (customerUnpaidInvoices.length > 0) {
      setSelectedInvoiceId(customerUnpaidInvoices[0].id);
    } else {
      setSelectedInvoiceId("");
    }
  }, [selectedCustomerId]);

  const selectedInvoice = invoices.find(i => i.id === selectedInvoiceId);

  const getResolvedScript = (textToResolve: string) => {
    const custName = currentCustomer?.name || "Customer";
    const amt = selectedInvoice ? selectedInvoice.amount.toLocaleString('en-IN') : "8,900";
    const invNo = selectedInvoice ? selectedInvoice.invoiceNumber : "INV-2026-004";
    return textToResolve
      .replace(/{customer_name}/g, custName)
      .replace(/{amount}/g, amt)
      .replace(/{invoice_number}/g, invNo)
      .replace(/{org_name}/g, orgName);
  };

  // Pre-fill custom script box when language or template changes
  useEffect(() => {
    const templatesList = LOCALIZED_TEMPLATES[selectedLanguageId] || LOCALIZED_TEMPLATES["hi"];
    const currentTpl = templatesList[selectedTemplateIndex] || templatesList[0];
    setCustomText(currentTpl.text);
  }, [selectedLanguageId, selectedTemplateIndex]);

  const finalScriptText = getResolvedScript(customText || (LOCALIZED_TEMPLATES["hi"][0].text));

  // Synth Dial Ring Sound & Beep
  const playRingSound = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const audioCtx = audioCtxRef.current;
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }

      const playTone = (delay: number, duration: number) => {
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc1.frequency.value = 440;
        osc2.frequency.value = 480;
        
        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime + delay);
        gainNode.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + delay + 0.05);
        gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime + delay + duration - 0.05);
        gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + delay + duration);
        
        osc1.start(audioCtx.currentTime + delay);
        osc2.start(audioCtx.currentTime + delay);
        
        osc1.stop(audioCtx.currentTime + delay + duration);
        osc2.stop(audioCtx.currentTime + delay + duration);
      };

      playTone(0.2, 1.0);
      playTone(1.8, 1.0);
    } catch (e) {
      console.warn("AudioContext tone generation blocked", e);
    }
  };

  const playAnswerBeep = () => {
    try {
      if (!audioCtxRef.current) return;
      const audioCtx = audioCtxRef.current;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.frequency.value = 800;
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      gain.gain.setValueAtTime(0, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.02);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime + 0.15);
      gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.2);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.2);
    } catch (e) {}
  };

  // Web Audio simulated telephonic phone comfort line static
  const startAmbientNoise = () => {
    try {
      if (!isComfortHumEnabled) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const audioCtx = audioCtxRef.current;
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }

      // Create simulated connection static noise buffer
      const bufferSize = 2 * audioCtx.sampleRate;
      const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = audioCtx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const lpFilter = audioCtx.createBiquadFilter();
      lpFilter.type = "lowpass";
      lpFilter.frequency.value = 3200;

      const hpFilter = audioCtx.createBiquadFilter();
      hpFilter.type = "highpass";
      hpFilter.frequency.value = 350;

      const gainNode = audioCtx.createGain();
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.006, audioCtx.currentTime + 0.4);

      whiteNoise.connect(lpFilter);
      lpFilter.connect(hpFilter);
      hpFilter.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      whiteNoise.start();
      ambientNodeRef.current = gainNode;
    } catch (e) {
      console.warn("Could not start ambient sound generation:", e);
    }
  };

  const stopAmbientNoise = () => {
    try {
      if (ambientNodeRef.current && audioCtxRef.current) {
        const audioCtx = audioCtxRef.current;
        ambientNodeRef.current.gain.setValueAtTime(ambientNodeRef.current.gain.value, audioCtx.currentTime);
        ambientNodeRef.current.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.3);
      }
    } catch (e) {}
  };

  // Generate chunks separated by breathing breaks & humanizing parameters
  const getHumanizedChunks = (inputText: string): SpeechChunk[] => {
    if (!isHumanCadenceEnabled) {
      return [{ text: inputText, pauseAfter: 200, rateModifier: 1.0 }];
    }

    // Split text by '...' markers first
    const mainSplits = inputText.split(/\s?\.\.\.\s?/);
    const result: SpeechChunk[] = [];

    mainSplits.forEach((section, secIdx) => {
      if (!section.trim()) return;

      // Further split by commas, periods, or question marks
      const subClauses = section.split(/([,।.?!])/);
      let currentSentence = "";

      subClauses.forEach((sub) => {
        if (!sub) return;

        if (["#", ",", ".", "?", "।", "!"].includes(sub)) {
          currentSentence += sub;
          let pause = 350; // default comma pause
          if (["?", ".", "।"].includes(sub)) {
            pause = 650; // paragraph end breath pause
          }
          if (currentSentence.trim()) {
            result.push(createChunkObj(currentSentence, pause));
          }
          currentSentence = "";
        } else {
          currentSentence += sub;
        }
      });

      if (currentSentence.trim()) {
        result.push(createChunkObj(currentSentence, 500));
      }

      // Add a substantial breathing gap (600ms) between major '...' splits
      if (secIdx < mainSplits.length - 1) {
        result.push({ text: "", pauseAfter: 750, rateModifier: 1.0 });
      }
    });

    // Inject thoughtful human-like hesitations at strategic places
    if (result.length > 1) {
      const fillers: Record<string, string[]> = {
        hi: ["सुनिए... ", "देखिए... ", "अम्म... "],
        mr: ["बघा... ", "खरं तर... ", "अं... "],
        "en-IN": ["Uh... well, ", "Um, actually, ", "You know, "]
      };

      const selectedFillers = fillers[selectedLanguageId] || fillers["en-IN"];
      
      // Inject hesitation right before disclosing the billing news
      const newsIndex = result.findIndex(c => c.text.includes("₹") || c.text.includes("payment") || c.text.includes("भुगतान") || c.text.includes("पेमेंट"));
      if (newsIndex !== -1 && result[newsIndex]) {
        const randomFiller = selectedFillers[Math.floor(Math.random() * selectedFillers.length)];
        result[newsIndex].text = randomFiller + result[newsIndex].text;
      }
    }

    return result;
  };

  const createChunkObj = (rawText: string, defaultPause: number): SpeechChunk => {
    let rateMod = 1.0;
    const text = rawText.trim();
    
    // Slow down for financial monetary values so they sound thoughtful and human (not robotic run-on digits)
    if (isVocalInflectionEnabled) {
      if (text.includes("₹") || text.includes("रु") || text.includes("payment") || text.includes("रुपये") || text.includes("पेमेंट")) {
        rateMod = 0.82; // speak 18% slower to simulate human caution and billing transparency
      } else if (text.includes("thank you") || text.includes("धन्यवाद") || text.includes("आभार") || text.includes("शुक्रिया")) {
        rateMod = 1.05; // slightly faster & warmer tone for grateful signoffs
      }
    }
    
    return {
      text,
      pauseAfter: defaultPause,
      rateModifier: rateMod
    };
  };

  // Speak chunks sequentially with breaths and telemetry updates
  const speakSequentialChunks = (chunks: SpeechChunk[], index: number, onEndCallback: () => void) => {
    if (!isSpeakingRef.current || index >= chunks.length) {
      onEndCallback();
      return;
    }

    const currentChunk = chunks[index];

    // Handle breathing pause placeholder (empty text)
    if (!currentChunk.text.trim()) {
      setHumanizerStatus("💨 Taking organic deep breath pause...");
      setSimulatedSubtitles("... (Inhaling) ...");
      setTimeout(() => {
        speakSequentialChunks(chunks, index + 1, onEndCallback);
      }, currentChunk.pauseAfter);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(currentChunk.text);
    speechUtteranceRef.current = utterance;

    // Direct translation parameters
    if (selectedVoiceName) {
      const voiceObj = availableVoices.find(v => v.name === selectedVoiceName);
      if (voiceObj) utterance.voice = voiceObj;
    }

    // Speech parameters & micro-inflections
    const baseRate = rate;
    const rateMod = currentChunk.rateModifier;
    utterance.rate = baseRate * rateMod;
    utterance.pitch = pitch;
    utterance.volume = 1.0;

    // Display updates
    setSimulatedSubtitles(currentChunk.text);

    // Humanized Telemetry updates
    if (currentChunk.text.includes("देखिए") || currentChunk.text.includes("बघा") || currentChunk.text.includes("Um") || currentChunk.text.includes("Uh") || currentChunk.text.includes("अ")) {
      setHumanizerStatus("💬 Injecting organic conversational filler...");
    } else if (rateMod < 1.0) {
      setHumanizerStatus("📉 Modulation: Slowing down to emphasize payment figures...");
    } else if (rateMod > 1.0) {
      setHumanizerStatus("📈 Modulation: Transitioning to warm courteous signup...");
    } else {
      setHumanizerStatus("🎙️ Voice Active: Emitting clear regional dialect...");
    }

    utterance.onend = () => {
      if (!isSpeakingRef.current) return;

      // Small break before next chunk
      setHumanizerStatus(`⏳ Natural micro-breath gap (${currentChunk.pauseAfter}ms)...`);
      setTimeout(() => {
        speakSequentialChunks(chunks, index + 1, onEndCallback);
      }, currentChunk.pauseAfter);
    };

    utterance.onerror = (e) => {
      console.warn("UTTERANCE CHUNK ERROR", e);
      speakSequentialChunks(chunks, index + 1, onEndCallback);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Start outbound calling pipeline
  const handleLaunchCall = () => {
    if (!selectedCustomerId) return;
    
    // Parent webhook update
    onTriggerCall(selectedCustomerId, selectedInvoiceId, finalScriptText);
    
    // Reset flags
    isSpeakingRef.current = true;
    setActiveCallStatus("dialing");
    setHumanizerStatus("📞 Connecting SIP regional gateway trunk line...");
    setActiveCallLogText(`Initiating high-contrast localized trunk... Outbound dialing ${currentCustomer?.phone || '+91'}...`);
    playRingSound();

    // 1. Ring for 3 seconds, then connect call
    setTimeout(() => {
      if (!isSpeakingRef.current) return;
      setActiveCallStatus("connected");
      setActiveCallLogText(`Answered by customer. Launching multi-lingual voice synthesizer and speaking customized regional billing script...`);
      playAnswerBeep();
      startAmbientNoise();

      // Convert full final text to customized human breath clauses
      const voiceChunks = getHumanizedChunks(finalScriptText);
      setIsSpeaking(true);

      // 2. Sequential speaking
      speakSequentialChunks(voiceChunks, 0, () => {
        // Complete speech synthesis
        setIsSpeaking(false);
        stopAmbientNoise();
        
        if (!isSpeakingRef.current) return;
        
        setActiveCallStatus("analyzing");
        setHumanizerStatus("🧠 Gemini processing transcript, sentiment & paying commitment...");
        setActiveCallLogText("Call hung up. Fetching regional telephonic audio logs... Gemini analyzing client replies...");
        
        // 3. Final Webhook log entries saved
        setTimeout(() => {
          if (!isSpeakingRef.current) return;
          setActiveCallStatus("complete");
          setHumanizerStatus("✅ Call Synchronized to Salesforce CRM!");
          setActiveCallLogText("Outbound call finished. Multi-lingual telemetry completely synchronized. Log updated successfully.");
          
          setTimeout(() => {
            setActiveCallStatus("idle");
            setHumanizerStatus("Idle - Waiting to connect");
          }, 4000);
        }, 2500);
      });

    }, 3000);
  };

  const handleForceEndCall = () => {
    isSpeakingRef.current = false;
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    stopAmbientNoise();
    setIsSpeaking(false);
    setActiveCallStatus("idle");
    setHumanizerStatus("Idle - Terminated");
    setActiveCallLogText("Call terminated manually.");
  };

  // Cleanup synthesizer speech on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      try {
        if (ambientNodeRef.current) {
          ambientNodeRef.current.disconnect();
        }
      } catch (e) {}
    };
  }, []);

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "negative":
        return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
      default:
        return "bg-gray-500/10 text-gray-300 border border-white/5";
    }
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Voice Assistant / Dialer Header */}
      <div className={`p-5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
        theme === "dark" 
          ? "bg-zinc-950/80 border-zinc-800/80 text-zinc-200" 
          : "bg-white border-slate-200/80 text-slate-800 shadow-sm"
      }`}>
        <div className="space-y-1">
          <h1 className={`text-lg font-extrabold tracking-tight flex items-center gap-2 ${
            theme === "dark" ? "text-white" : "text-slate-900"
          }`}>
            {voiceHubMode === "interactive" ? (
              <>
                <Bot className="w-5 h-5 text-purple-400 animate-pulse" />
                Google Gemini Voice Assistant
              </>
            ) : (
              <>
                <Radio className="w-5 h-5 text-blue-400 animate-pulse" />
                Outbound Campaign Dialer
              </>
            )}
          </h1>
          <p className="text-xs text-slate-400 dark:text-zinc-500">
            {voiceHubMode === "interactive" 
              ? "Interact directly with Gemini Live / Google Assistant in local languages. Talk or type questions naturally."
              : "Configure regional dialects, cadence speeds, and launch automated calling campaigns to recover outstanding ledgers."
            }
          </p>
        </div>

        {/* Mode Selector Segmented Control */}
        <div className={`flex items-center p-1 rounded-xl border text-xs font-semibold ${
          theme === "dark" ? "bg-zinc-900/60 border-zinc-800 text-zinc-400" : "bg-slate-100 border-slate-200 text-slate-600"
        }`}>
          <button 
            onClick={() => {
              setVoiceHubMode("interactive");
              if (typeof window !== "undefined" && window.speechSynthesis) {
                window.speechSynthesis.cancel();
              }
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              voiceHubMode === "interactive" 
                ? (theme === "dark" ? "bg-zinc-800 text-white shadow-md border border-white/5" : "bg-white text-slate-950 shadow-xs border border-slate-200") 
                : "hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Gemini Voice</span>
          </button>
          <button 
            onClick={() => {
              setVoiceHubMode("outbound");
              if (typeof window !== "undefined" && window.speechSynthesis) {
                window.speechSynthesis.cancel();
              }
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              voiceHubMode === "outbound" 
                ? (theme === "dark" ? "bg-zinc-800 text-white shadow-md border border-white/5" : "bg-white text-slate-950 shadow-xs border border-slate-200") 
                : "hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Outbound Dialer</span>
          </button>
        </div>
      </div>

      {voiceHubMode === "interactive" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="interactive_voice_panel">
          {/* Interactive controls left column */}
          <div className="lg:col-span-5 space-y-6">
            <div className={`p-6 rounded-2xl border flex flex-col justify-between h-full min-h-[450px] transition-all ${
              theme === "dark" 
                ? "bg-zinc-950/80 border-zinc-800/80 text-zinc-200" 
                : "bg-white border-slate-200/80 text-slate-800 shadow-sm"
            }`}>
              <div className="space-y-5">
                <div>
                  <h2 className={`text-md font-bold font-display flex items-center gap-2 ${
                    theme === "dark" ? "text-white" : "text-slate-900"
                  }`}>
                    <Globe className="w-5 h-5 text-purple-400" />
                    Speech Configuration
                  </h2>
                  <p className={`text-xs ${theme === "dark" ? "text-zinc-400" : "text-slate-500"}`}>
                    Select any regional or international language to begin speaking
                  </p>
                </div>

                {/* Interactive Speech Language Picker */}
                <div className="space-y-3">
                  <span className={`text-[10px] uppercase font-mono tracking-wider flex items-center gap-1 ${
                    theme === "dark" ? "text-zinc-400" : "text-slate-500 font-bold"
                  }`}>
                    Your Spoken Language
                  </span>
                  <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
                    {INTERACTIVE_LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setInteractiveLang(lang.code);
                          if (isInteractiveListening) stopInteractiveListening();
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 ${
                          interactiveLang === lang.code
                            ? "bg-purple-500/15 border-purple-500 text-purple-400 font-bold"
                            : theme === "dark"
                            ? "bg-zinc-900/40 border-zinc-800/60 hover:border-zinc-700 text-zinc-300"
                            : "bg-slate-50/50 border-slate-200 hover:border-slate-300 text-slate-700"
                        }`}
                      >
                        <span className="text-base shrink-0">{lang.flag}</span>
                        <div className="truncate">
                          <p className={`text-[11px] font-bold font-display truncate ${theme === "dark" ? "text-white" : "text-slate-900"}`}>{lang.native}</p>
                          <p className={`text-[9px] truncate ${theme === "dark" ? "text-gray-500" : "text-slate-500"}`}>{lang.name}</p>
                        </div>
                        {interactiveLang === lang.code && (
                          <Check className="w-3.5 h-3.5 text-purple-500 ml-auto shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Voice Synthesis Stats Panel with sliders */}
                <div className={`p-4 rounded-xl border space-y-3.5 ${
                  theme === "dark" ? "bg-white/5 border-white/5 border-zinc-800" : "bg-slate-50 border-slate-200 shadow-xs"
                }`}>
                  <div className="flex items-center gap-2 text-xs font-mono text-purple-500 dark:text-purple-300 font-bold">
                    <Settings2 className="w-3.5 h-3.5" />
                    <span>HUMAN VOICING CONTROLS</span>
                  </div>

                  {/* Persona selector (Female vs Male) */}
                  <div className="space-y-1.5">
                    <label className={`text-[9px] uppercase font-mono tracking-wider ${theme === "dark" ? "text-zinc-400" : "text-slate-500 font-bold"}`}>
                      Voice Assistant Persona
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => setVoicePersona("female")}
                        className={`py-1.5 px-2.5 rounded-lg text-[10px] font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          voicePersona === "female"
                            ? "bg-purple-500/15 border-purple-500 text-purple-600 dark:text-purple-400 font-bold"
                            : theme === "dark"
                            ? "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 text-zinc-400"
                            : "bg-white border-slate-200 hover:border-slate-300 text-slate-500"
                        }`}
                      >
                        <User className="w-3 h-3 text-purple-500" />
                        Female Tone
                      </button>
                      <button
                        onClick={() => setVoicePersona("male")}
                        className={`py-1.5 px-2.5 rounded-lg text-[10px] font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          voicePersona === "male"
                            ? "bg-purple-500/15 border-purple-500 text-purple-600 dark:text-purple-400 font-bold"
                            : theme === "dark"
                            ? "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 text-zinc-400"
                            : "bg-white border-slate-200 hover:border-slate-300 text-slate-500"
                        }`}
                      >
                        <User className="w-3 h-3 text-purple-500" />
                        Male Tone
                      </button>
                    </div>
                  </div>

                  {/* Speed and Pitch sliders */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <div className={`flex justify-between text-[8px] uppercase font-mono ${theme === "dark" ? "text-zinc-400" : "text-slate-500 font-bold"}`}>
                        <span>Speed (Rate)</span>
                        <span className="text-purple-500 dark:text-purple-400 font-bold">{voiceRate}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.6"
                        max="1.4"
                        step="0.05"
                        value={voiceRate}
                        onChange={(e) => setVoiceRate(parseFloat(e.target.value))}
                        className="w-full accent-purple-500 h-1 bg-zinc-300 dark:bg-zinc-800 rounded-lg cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className={`flex justify-between text-[8px] uppercase font-mono ${theme === "dark" ? "text-zinc-400" : "text-slate-500 font-bold"}`}>
                        <span>Pitch (Tone)</span>
                        <span className="text-purple-500 dark:text-purple-400 font-bold">{voicePitch}</span>
                      </div>
                      <input
                        type="range"
                        min="0.7"
                        max="1.3"
                        step="0.05"
                        value={voicePitch}
                        onChange={(e) => setVoicePitch(parseFloat(e.target.value))}
                        className="w-full accent-purple-500 h-1 bg-zinc-300 dark:bg-zinc-800 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="text-[9px] pt-2 border-t border-slate-200 dark:border-white/5 flex flex-col gap-0.5 text-slate-500 dark:text-zinc-400">
                    <p className="flex items-center justify-between">
                      <span>Detected Engine:</span>
                      <span className="font-mono text-slate-400 dark:text-zinc-500">WebSpeech TTS (Native)</span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span>Active Voice Match:</span>
                      <span className="font-mono text-purple-600 dark:text-purple-400 font-bold truncate max-w-[160px]" title={findBestNaturalVoice(interactiveLang, voicePersona)?.name || "Default System"}>
                        {findBestNaturalVoice(interactiveLang, voicePersona)?.name || "Default System Voice"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Status footer inside card */}
              <div className="border-t border-white/5 pt-4 mt-4 flex items-center justify-between text-[11px] text-gray-400 font-mono">
                <span className="text-indigo-400">STATUS: READY TO TALK</span>
                <span>v2.1.0</span>
              </div>
            </div>
          </div>

          {/* Immersive Terminal & Orb and Conversation logs */}
          <div className="lg:col-span-7 space-y-6">
            <div className={`p-6 rounded-2xl border flex flex-col justify-between min-h-[450px] transition-all relative overflow-hidden ${
              theme === "dark" 
                ? "bg-zinc-950/80 border-zinc-800/80 text-zinc-200" 
                : "bg-white border-slate-200/80 text-slate-800 shadow-sm"
            }`}>
              
              {/* Voice Orb Section */}
              <div className="flex flex-col items-center justify-center py-6 text-center flex-1">
                <div className="relative flex items-center justify-center">
                  
                  {/* Outer breathing background circle */}
                  <div className={`absolute rounded-full blur-xl transition-all duration-1000 ${
                    isInteractiveListening 
                      ? "w-44 h-44 bg-rose-500/25 animate-ping" 
                      : isAiProcessing
                      ? "w-44 h-44 bg-amber-500/25 animate-pulse"
                      : isAiSpeaking
                      ? "w-44 h-44 bg-emerald-500/25 animate-pulse"
                      : "w-36 h-36 bg-purple-500/10"
                  }`}></div>

                  {/* The interactive animated AI core node */}
                  <button 
                    onClick={handleCoreNodeClick}
                    disabled={isAiProcessing}
                    className={`relative z-10 p-6 rounded-full border transition-all duration-300 flex items-center justify-center shadow-lg cursor-pointer ${
                      isInteractiveListening 
                        ? "bg-rose-950/80 border-rose-500 text-rose-400 shadow-rose-500/10 scale-105" 
                        : isAiSpeaking
                        ? "bg-emerald-950/80 border-emerald-500 text-emerald-400 shadow-emerald-500/10"
                        : "bg-zinc-900 hover:bg-zinc-800 border-purple-500/40 hover:border-purple-500 text-purple-400 shadow-purple-500/10 hover:shadow-purple-500/20"
                    }`}
                    title={isInteractiveListening ? "Click to stop speaking" : isAiSpeaking ? "Click to stop speaking" : "Click to speak to Nova Agent"}
                  >
                    {isInteractiveListening ? (
                      <Mic className="w-10 h-10 animate-pulse text-rose-400" />
                    ) : isAiProcessing ? (
                      <Bot className="w-10 h-10 animate-spin text-amber-400" />
                    ) : isAiSpeaking ? (
                      <Volume2 className="w-10 h-10 animate-bounce text-emerald-400" />
                    ) : (
                      <Mic className="w-10 h-10 text-purple-400" />
                    )}
                  </button>
                </div>

                <div className="mt-6 space-y-2">
                  <h3 className={`text-base font-extrabold tracking-tight flex items-center justify-center gap-2 ${
                    theme === "dark" ? "text-white" : "text-slate-900"
                  }`}>
                    {isInteractiveListening ? (
                      <span className="text-rose-400 flex items-center gap-1.5 animate-pulse">
                        <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
                        Listening - Speak now...
                      </span>
                    ) : isAiProcessing ? (
                      <span className="text-amber-400 animate-pulse">Nova AI is thinking...</span>
                    ) : isAiSpeaking ? (
                      <span className="text-emerald-400 flex items-center gap-1.5 animate-pulse">
                        <Volume2 className="w-4 h-4" />
                        Nova Voice Active...
                      </span>
                    ) : (
                      <span>Tap Core to Start Speaking</span>
                    )}
                  </h3>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 max-w-[320px] leading-relaxed mx-auto">
                    {isInteractiveListening 
                      ? "Speak clearly in your selected language. Tap the mic again or wait to finish."
                      : isAiProcessing
                      ? "Synthesizing conversational context with Gemini model..."
                      : isAiSpeaking
                      ? "Speaking response in matching localized voice profile."
                      : `Speak in ${INTERACTIVE_LANGUAGES.find(l => l.code === interactiveLang)?.name}. The AI understands and answers fluently.`
                    }
                  </p>
                </div>

                {/* Speech Error Feedback */}
                {speechError && (
                  <div className="mt-4 p-3 max-w-sm rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 text-xs font-sans text-center animate-in fade-in zoom-in-95">
                    <p className="font-bold uppercase tracking-wider text-[10px] text-rose-300 mb-1 flex items-center justify-center gap-1">
                      <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping"></span>
                      Voice Session Paused
                    </p>
                    <p className="text-zinc-300 leading-normal mb-2 text-[11px]">{speechError}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setSpeechError(null);
                        continuousSessionRef.current = true;
                        startInteractiveListening();
                      }}
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-sans text-[10px] rounded-lg font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      Retry Microphone
                    </button>
                  </div>
                )}

                {/* Subtitles / Realtime speech box */}
                {(isInteractiveListening || currentRecognitionText) && (
                  <div className="mt-4 p-3 max-w-sm rounded-xl border border-dashed border-purple-500/30 bg-purple-500/5 animate-in fade-in zoom-in-95">
                    <p className="text-[9px] font-mono tracking-widest text-purple-400 uppercase font-bold mb-1">Your Speech Input</p>
                    <p className="text-xs font-mono text-zinc-300 italic">
                      "{currentRecognitionText || "Listening for speech..."}"
                    </p>
                  </div>
                )}

                {/* Type / Text Input Option - Google Gemini style */}
                <div className={`mt-6 w-full max-w-md p-3.5 rounded-2xl border transition-all ${
                  theme === "dark" 
                    ? "bg-zinc-900/40 border-zinc-800/60" 
                    : "bg-slate-50 border-slate-200"
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></div>
                    <span className={`text-[9px] font-mono uppercase tracking-wider ${
                      theme === "dark" ? "text-zinc-400" : "text-slate-500 font-bold"
                    }`}>
                      Type question to Gemini Assistant
                    </span>
                  </div>
                  
                  <form onSubmit={handleSendTypedQuestion} className="flex items-center gap-2 relative">
                    <input
                      type="text"
                      value={typedQuestion}
                      onChange={(e) => setTypedQuestion(e.target.value)}
                      placeholder={`Ask anything in ${INTERACTIVE_LANGUAGES.find(l => l.code === interactiveLang)?.native}...`}
                      className={`w-full pr-10 pl-3.5 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-sans transition-all ${
                        theme === "dark" 
                          ? "bg-black/60 border-zinc-800 text-white placeholder-zinc-600" 
                          : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 shadow-xs"
                      }`}
                    />
                    <div className="absolute right-2.5 flex items-center gap-1">
                      {typedQuestion.trim() ? (
                        <button
                          type="submit"
                          className="p-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-all cursor-pointer active:scale-95"
                          title="Send Message"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={startInteractiveListening}
                          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                            theme === "dark" ? "hover:bg-zinc-800 text-purple-400" : "hover:bg-slate-100 text-purple-500"
                          }`}
                          title="Click to Speak"
                        >
                          <Mic className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>

              {/* Chat Transcript Timeline container */}
              <div className="space-y-3 mt-4 border-t border-white/5 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-purple-400 font-bold flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" /> Dialogue Transcription History
                  </span>
                  <button 
                    onClick={clearInteractiveTranscript}
                    className="text-[9px] font-mono text-zinc-500 hover:text-purple-400 transition-colors px-2 py-0.5 rounded border border-purple-500/10 bg-purple-500/5 cursor-pointer"
                  >
                    Clear History
                  </button>
                </div>

                {/* Chat items list */}
                <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
                  {interactiveTranscript.map((chat, idx) => (
                    <div 
                      key={idx} 
                      className={`flex flex-col ${chat.role === "user" ? "items-end" : "items-start"}`}
                    >
                      <div className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-[11px] leading-relaxed ${
                        chat.role === "user"
                          ? "bg-purple-600 text-white rounded-tr-xs"
                          : (theme === "dark"
                              ? "bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-tl-xs"
                              : "bg-slate-100 text-slate-800 rounded-tl-xs")
                      }`}>
                        {chat.text}
                      </div>
                      <span className="text-[8px] text-slate-500 font-mono px-1.5 mt-0.5">{chat.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {voiceHubMode === "outbound" && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6" id="voice_agent_panel">
          
          {/* COLUMN 1: CLIENT SELECTOR & NEW HUMANIZER TUNING CONTROLS */}
          <div className="space-y-6">
        <div className={`p-6 rounded-2xl border flex flex-col justify-between h-full transition-all ${
          theme === "dark" 
            ? "bg-zinc-950/80 border-zinc-800/80 text-zinc-200" 
            : "bg-white border-slate-200/80 text-slate-800 shadow-sm"
        }`} id="recipient_voice_settings">
          <div className="space-y-5">
            <div>
              <h2 className={`text-md font-bold font-display flex items-center gap-2 ${
                theme === "dark" ? "text-white" : "text-slate-900"
              }`}>
                <User className="w-5 h-5 text-blue-400" />
                Customer & Voice Options
              </h2>
              <p className={`text-xs ${theme === "dark" ? "text-zinc-400" : "text-slate-500"}`}>
                Select customer ledger and configure speech engine
              </p>
            </div>

            <div className="space-y-4">
              {/* Customer ledger picker */}
              <div className="space-y-1.5">
                <label className={`text-[10px] uppercase font-mono tracking-wider flex items-center gap-1 ${
                  theme === "dark" ? "text-zinc-400" : "text-slate-500 font-bold"
                }`}>
                  Target Customer
                </label>
                <select 
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className={`w-full border rounded-xl p-2.5 text-xs focus:outline-none focus:border-blue-500 ${
                    theme === "dark" 
                      ? "bg-zinc-900 border-zinc-800 text-white" 
                      : "bg-slate-50 border-slate-250 text-slate-800"
                  }`}
                >
                  <option value="" className={theme === "dark" ? "bg-zinc-950 text-zinc-400" : "bg-white text-slate-400"}>-- Choose Customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id} className={theme === "dark" ? "bg-zinc-950 text-white" : "bg-white text-slate-900"}>
                      {c.name} ({c.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Invoice linker details */}
              {selectedCustomerId && (
                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1">
                  <label className={`text-[10px] uppercase font-mono tracking-wider flex items-center gap-1 ${
                    theme === "dark" ? "text-zinc-400" : "text-slate-500 font-bold"
                  }`}>
                    <FileText className="w-3.5 h-3.5 text-blue-400" /> Outstanding Invoice Balance
                  </label>
                  <select 
                    value={selectedInvoiceId}
                    onChange={(e) => setSelectedInvoiceId(e.target.value)}
                    className={`w-full border rounded-xl p-2.5 text-xs focus:outline-none focus:border-blue-500 ${
                      theme === "dark" 
                        ? "bg-zinc-900 border-zinc-800 text-white" 
                        : "bg-slate-50 border-slate-250 text-slate-800"
                    }`}
                  >
                    <option value="" className={theme === "dark" ? "bg-zinc-950 text-zinc-400" : "bg-white text-slate-400"}>-- No Linked Invoice (General Call) --</option>
                    {customerUnpaidInvoices.map((inv) => (
                      <option key={inv.id} value={inv.id} className={theme === "dark" ? "bg-zinc-950 text-white" : "bg-white text-slate-900"}>
                        {inv.invoiceNumber} - ₹{inv.amount.toLocaleString('en-IN')} ({inv.status})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* ADVANCED HUMAN-LIKE SPEECH CONTROLS */}
              <div className={`border-t pt-4 space-y-4 ${theme === "dark" ? "border-zinc-800/60" : "border-slate-100"}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-indigo-400 font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Human-Like Tuning
                  </span>
                  <div className={`text-[10px] px-2 py-0.5 rounded-full font-mono border ${
                    theme === "dark" 
                      ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" 
                      : "bg-indigo-50 text-indigo-600 border-indigo-100 font-semibold"
                  }`}>
                    Humanizer Engine v2.0
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Real-time split speaking toggle */}
                  <div className={`flex items-center justify-between p-2.5 rounded-xl border ${
                    theme === "dark" ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-200"
                  }`}>
                    <div>
                      <p className={`text-xs font-semibold ${theme === "dark" ? "text-white" : "text-slate-800"}`}>Natural Breath Gaps</p>
                      <p className={`text-[10px] ${theme === "dark" ? "text-zinc-400" : "text-slate-500"}`}>Inserts breath pauses at punctuation</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={isHumanCadenceEnabled}
                        onChange={() => setIsHumanCadenceEnabled(!isHumanCadenceEnabled)}
                        className="sr-only peer" 
                      />
                      <div className={`w-8 h-4 rounded-full peer peer-focus:outline-none peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-500 ${
                        theme === "dark" ? "bg-zinc-800" : "bg-slate-250"
                      }`}></div>
                    </label>
                  </div>

                  {/* Micro inflection scale toggle */}
                  <div className={`flex items-center justify-between p-2.5 rounded-xl border ${
                    theme === "dark" ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-200"
                  }`}>
                    <div>
                      <p className={`text-xs font-semibold ${theme === "dark" ? "text-white" : "text-slate-800"}`}>Financial Vocal Inflection</p>
                      <p className={`text-[10px] ${theme === "dark" ? "text-zinc-400" : "text-slate-500"}`}>Slowing cadence when speaking figures</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={isVocalInflectionEnabled}
                        onChange={() => setIsVocalInflectionEnabled(!isVocalInflectionEnabled)}
                        className="sr-only peer" 
                      />
                      <div className={`w-8 h-4 rounded-full peer peer-focus:outline-none peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-500 ${
                        theme === "dark" ? "bg-zinc-800" : "bg-slate-250"
                      }`}></div>
                    </label>
                  </div>

                  {/* Telephony loop toggle */}
                  <div className={`flex items-center justify-between p-2.5 rounded-xl border ${
                    theme === "dark" ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-200"
                  }`}>
                    <div>
                      <p className={`text-xs font-semibold ${theme === "dark" ? "text-white" : "text-slate-800"}`}>Telephony Comfort Noise</p>
                      <p className={`text-[10px] ${theme === "dark" ? "text-zinc-400" : "text-slate-500"}`}>Synthesizes telephone-grade white hum</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={isComfortHumEnabled}
                        onChange={() => setIsComfortHumEnabled(!isComfortHumEnabled)}
                        className="sr-only peer" 
                      />
                      <div className={`w-8 h-4 rounded-full peer peer-focus:outline-none peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-500 ${
                        theme === "dark" ? "bg-zinc-800" : "bg-slate-250"
                      }`}></div>
                    </label>
                  </div>
                </div>

                {isSpeechEnabled && (
                  <div className={`space-y-3 pt-3 border-t ${theme === "dark" ? "border-zinc-800/60" : "border-slate-100"}`}>
                    {/* TTS Voice Select */}
                    <div className="space-y-1">
                      <span className="text-[10px] text-gray-500 font-mono">Current Synthesized voice</span>
                      <select 
                        value={selectedVoiceName}
                        onChange={(e) => setSelectedVoiceName(e.target.value)}
                        className={`w-full border rounded-xl p-2 text-xs font-mono focus:outline-none focus:border-blue-500 ${
                          theme === "dark" 
                            ? "bg-zinc-900 border-zinc-800 text-white" 
                            : "bg-slate-50 border-slate-200 text-slate-850"
                        }`}
                      >
                        {availableVoices.length === 0 ? (
                          <option value="" className={theme === "dark" ? "bg-zinc-950 text-white" : "bg-white text-slate-900"}>System Default Voice</option>
                        ) : (
                          availableVoices.map((voice) => (
                            <option key={voice.name} value={voice.name} className={theme === "dark" ? "bg-zinc-950 text-white" : "bg-white text-slate-900"}>
                              {voice.name} ({voice.lang})
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    {/* Speed Pitch sliders */}
                    <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                          <span>Base Pace</span>
                          <span>{rate}x</span>
                        </div>
                        <input 
                          type="range" 
                          min="0.5" 
                          max="1.5" 
                          step="0.05"
                          value={rate}
                          onChange={(e) => setRate(parseFloat(e.target.value))}
                          className={`w-full h-1 rounded-lg appearance-none cursor-pointer accent-blue-500 ${
                            theme === "dark" ? "bg-zinc-800" : "bg-slate-200"
                          }`}
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                          <span>Pitch Tone</span>
                          <span>{pitch}x</span>
                        </div>
                        <input 
                          type="range" 
                          min="0.5" 
                          max="1.5" 
                          step="0.05"
                          value={pitch}
                          onChange={(e) => setPitch(parseFloat(e.target.value))}
                          className={`w-full h-1 rounded-lg appearance-none cursor-pointer accent-blue-500 ${
                            theme === "dark" ? "bg-zinc-800" : "bg-slate-200"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* COLUMN 2: REGIONAL LANGUAGES & STYLE TEMPLATES */}
      <div className={`p-6 rounded-2xl border flex flex-col justify-between transition-all ${
        theme === "dark" 
          ? "bg-zinc-950/80 border-zinc-800/80 text-zinc-200" 
          : "bg-white border-slate-200/80 text-slate-800 shadow-sm"
      }`} id="script_customizer_console">
        <div className="space-y-5 flex-1 flex flex-col">
          <div>
            <h2 className={`text-md font-bold font-display flex items-center gap-2 ${
              theme === "dark" ? "text-white" : "text-slate-900"
            }`}>
              <Globe className="w-5 h-5 text-emerald-400" />
              Regional Languages & Scripts
            </h2>
            <p className={`text-xs ${theme === "dark" ? "text-zinc-400" : "text-slate-500"}`}>
              Configure Indian local dialects and campaign triggers
            </p>
          </div>

          {/* Regional Languages Indian Matrix */}
          <div className="space-y-2">
            <span className={`text-[10px] uppercase font-mono tracking-wider flex items-center gap-1 ${
              theme === "dark" ? "text-zinc-400" : "text-slate-500 font-bold"
            }`}>
              Select Regional Language
            </span>
            <div className="grid grid-cols-2 gap-1.5 max-h-[140px] overflow-y-auto pr-1">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setSelectedLanguageId(lang.code);
                    setSelectedTemplateIndex(0); // reset index to first style template
                  }}
                  className={`p-2 rounded-xl border text-left transition-all flex items-center gap-2 ${
                    selectedLanguageId === lang.code
                      ? "bg-emerald-500/15 border-emerald-500 text-emerald-600 font-bold"
                      : theme === "dark"
                      ? "bg-zinc-900/40 border-zinc-800/60 hover:border-zinc-700 text-zinc-300"
                      : "bg-slate-50/50 border-slate-200 hover:border-slate-300 text-slate-700"
                  }`}
                >
                  <span className="text-base shrink-0">{lang.flag}</span>
                  <div className="truncate">
                    <p className={`text-[11px] font-bold font-display truncate ${theme === "dark" ? "text-white" : "text-slate-900"}`}>{lang.native}</p>
                    <p className={`text-[9px] truncate ${theme === "dark" ? "text-gray-500" : "text-slate-500"}`}>{lang.name}</p>
                  </div>
                  {selectedLanguageId === lang.code && (
                    <Check className="w-3.5 h-3.5 text-emerald-500 ml-auto shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Behavioral Template selector */}
          <div className={`space-y-2 pt-2 border-t ${theme === "dark" ? "border-zinc-800/60" : "border-slate-100"}`}>
            <span className={`text-[10px] uppercase font-mono tracking-wider ${
              theme === "dark" ? "text-zinc-400" : "text-slate-500 font-bold"
            }`}>
              Vocal Cadence Tone
            </span>
            <div className="flex gap-2">
              {(LOCALIZED_TEMPLATES[selectedLanguageId] || LOCALIZED_TEMPLATES["hi"]).map((tpl, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedTemplateIndex(idx)}
                  className={`flex-1 p-2 rounded-xl border text-center transition-all ${
                    selectedTemplateIndex === idx
                      ? "bg-indigo-500/15 border-indigo-500 text-indigo-600 font-bold"
                      : theme === "dark"
                      ? "bg-zinc-900/40 border-zinc-800/60 hover:border-zinc-700 text-zinc-300"
                      : "bg-slate-50/50 border-slate-200 hover:border-slate-300 text-slate-700"
                  }`}
                >
                  <div className="text-[12px]">{tpl.icon}</div>
                  <div className="text-[10px] font-bold font-display mt-0.5">{tpl.name.split(" ")[0]}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Script Editor panel */}
          <div className={`space-y-1.5 flex-1 flex flex-col pt-2 border-t ${theme === "dark" ? "border-zinc-800/60" : "border-slate-100"}`}>
            <div className="flex items-center justify-between">
              <label className={`text-[10px] uppercase font-mono tracking-wider ${
                theme === "dark" ? "text-zinc-400" : "text-slate-500 font-bold"
              }`}>
                Dialer Speech Script (Edit Libre)
              </label>
              <span className="text-[8px] font-mono text-zinc-500">Separators: '...' represent breaths</span>
            </div>
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Type regional prompt words here..."
              className={`w-full flex-1 min-h-[120px] border rounded-xl p-3 text-xs focus:outline-none focus:border-emerald-500 font-mono resize-none leading-relaxed ${
                theme === "dark" 
                  ? "bg-black/40 border-zinc-800 text-gray-200 placeholder-zinc-700" 
                  : "bg-slate-50 border-slate-250 text-slate-800 placeholder-slate-400"
              }`}
            />
          </div>

          {/* Local translation visual rendering */}
          <div className={`p-3 border rounded-xl space-y-1.5 ${
            theme === "dark" ? "bg-zinc-900/60 border-zinc-800/60" : "bg-slate-50 border-slate-200"
          }`}>
            <div className="flex justify-between items-center">
              <span className="text-[9px] uppercase font-mono tracking-widest text-emerald-500 font-bold block">
                Live Dialing Translation
              </span>
              <span className={`text-[8px] px-1.5 py-0.5 rounded font-mono ${theme === "dark" ? "bg-white/5 text-gray-400" : "bg-white text-slate-500 border border-slate-200"}`}>
                {LANGUAGES.find(l => l.code === selectedLanguageId)?.name} dialect
              </span>
            </div>
            <p className={`text-[11px] leading-relaxed italic font-sans ${
              theme === "dark" ? "text-gray-300" : "text-slate-700 font-semibold"
            }`}>
              "{finalScriptText}"
            </p>
          </div>
        </div>
      </div>

      {/* COLUMN 3: DIALER TELEMETRY, WAVEFORM & HISTORY LOGS */}
      <div className={`p-6 rounded-2xl border flex flex-col justify-between transition-all ${
        theme === "dark" 
          ? "bg-zinc-950/80 border-zinc-800/80 text-zinc-200" 
          : "bg-white border-slate-200/80 text-slate-800 shadow-sm"
      }`} id="voice_campaign_logs">
        <div className="space-y-5">
          <div className="flex justify-between items-center">
            <div>
              <h3 className={`text-md font-bold font-display ${theme === "dark" ? "text-white" : "text-slate-900"}`}>Regional Call Desk</h3>
              <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-slate-500"}`}>Active regional dialer with direct humanization</p>
            </div>
            <span className="text-[9px] uppercase tracking-widest bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold font-mono">
              SIP REGIONAL ACTIVE
            </span>
          </div>

          {/* TELEPHONE DISPLAY GATEWAY */}
          {activeCallStatus !== "idle" ? (
            <div className={`p-5 rounded-2xl border space-y-4 shadow-xl relative overflow-hidden animate-in fade-in zoom-in-95 ${
              theme === "dark" ? "bg-zinc-950/45 border-indigo-500/35" : "bg-slate-50 border-indigo-200"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping"></span>
                  <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-indigo-400">
                    {activeCallStatus === "dialing" && "SIP Ringing..."}
                    {activeCallStatus === "connected" && "Line Engaged (Active)"}
                    {activeCallStatus === "analyzing" && "Analyzing commitment..."}
                    {activeCallStatus === "complete" && "Webhook finished..."}
                  </span>
                </div>
                <button 
                  onClick={handleForceEndCall}
                  className="p-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-lg transition-all text-[10px] font-mono flex items-center gap-1 border border-rose-500/20"
                >
                  <PhoneOff className="w-3 h-3" />
                  Terminate
                </button>
              </div>

              {/* Call target client info */}
              <div className="text-center py-1">
                <p className={`text-sm font-bold font-display ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                  {currentCustomer?.name || "Client Ledger"}
                </p>
                <p className={`text-[10px] font-mono mt-0.5 ${theme === "dark" ? "text-gray-400" : "text-slate-500"}`}>
                  {currentCustomer?.phone || "+91 90040 12345"}
                </p>
                <div className={`inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full mt-1.5 font-mono ${
                  theme === "dark" ? "bg-white/5 border border-white/5 text-gray-400" : "bg-white border border-slate-200 text-slate-500"
                }`}>
                  <span>Dialect:</span>
                  <span className="text-emerald-500 font-semibold">{LANGUAGES.find(l => l.code === selectedLanguageId)?.name}</span>
                </div>
              </div>

              {/* Animated Vocal Waveform block */}
              {activeCallStatus === "connected" && (
                <div className="flex justify-center items-center gap-1.5 h-10 py-1" id="vocal_waveform_visualizer">
                  {[...Array(12)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-1 bg-gradient-to-t from-indigo-500 to-emerald-400 rounded-full transition-all duration-150"
                      style={{ 
                        height: isSpeaking ? `${Math.floor(Math.random() * 32) + 6}px` : "4px",
                        animation: isSpeaking ? `pulse 1.1s ease-in-out infinite alternate` : "none",
                        animationDelay: `${i * 0.08}s`
                      }}
                    />
                  ))}
                </div>
              )}

              {/* LIVE HUMANIZER TELEMETRY INDICATOR */}
              <div className="p-2.5 bg-indigo-950/20 rounded-xl border border-indigo-500/10 flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse shrink-0" />
                <span className="text-[10px] font-mono text-indigo-300 truncate">
                  {humanizerStatus}
                </span>
              </div>

              {/* Telemetry scrolling subtitles */}
              <div className={`p-3 rounded-xl max-h-[100px] overflow-y-auto text-center border ${
                theme === "dark" ? "bg-black/60 border-white/5" : "bg-white border-slate-200"
              }`}>
                {activeCallStatus === "connected" ? (
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-mono tracking-widest text-emerald-500 block font-bold">
                      Subtitles Dialect Feed (TTS)
                    </span>
                    <p className={`text-xs font-mono leading-relaxed italic ${
                      theme === "dark" ? "text-emerald-300" : "text-emerald-600 font-semibold"
                    }`}>
                      "{simulatedSubtitles}"
                    </p>
                  </div>
                ) : (
                  <p className={`text-xs leading-normal font-mono ${theme === "dark" ? "text-gray-300" : "text-slate-600"}`}>{activeCallLogText}</p>
                )}
              </div>
            </div>
          ) : (
            /* IDLE DIALER BLOCK */
            <div className={`p-5 rounded-xl border text-center py-7 space-y-4 ${
              theme === "dark" ? "bg-zinc-900/40 border-white/5" : "bg-slate-50 border-slate-200"
            }`}>
              <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <PhoneCall className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <p className={`text-xs font-bold ${theme === "dark" ? "text-white" : "text-slate-800"}`}>Outbound Campaign Dispatcher</p>
                <p className={`text-[11px] max-w-[240px] mx-auto ${theme === "dark" ? "text-gray-400" : "text-slate-500"}`}>
                  Select a debtor and regional language to launch the natural voice campaign.
                </p>
              </div>
              <button 
                onClick={handleLaunchCall}
                disabled={!selectedCustomerId || activeCallStatus !== "idle"}
                className={`w-full max-w-[220px] flex items-center justify-center gap-2 font-display text-xs font-bold py-2.5 rounded-xl transition-all shadow-lg mx-auto ${
                  !selectedCustomerId || activeCallStatus !== "idle"
                    ? "bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed"
                    : "bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white hover:shadow-emerald-500/20 hover:scale-[1.01]"
                }`}
              >
                <Phone className="w-4 h-4" />
                Call Client Now
              </button>
            </div>
          )}

          {/* ACTIVE DISPATCH LOGS */}
          <div className="space-y-3">
            <span className={`text-[10px] uppercase font-mono tracking-wider ${
              theme === "dark" ? "text-gray-400" : "text-slate-500 font-bold"
            }`}>
              Active Regional Call History
            </span>
            <div className="space-y-3 max-h-[170px] overflow-y-auto pr-1">
              {callLogs.map((log) => (
                <div 
                  key={log.id} 
                  className={`p-3 rounded-xl border space-y-2 text-xs transition-all ${
                    theme === "dark" 
                      ? "bg-white/5 hover:bg-white/10 border-white/5" 
                      : "bg-slate-50 hover:bg-slate-100/80 border-slate-200 shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-bold font-display ${theme === "dark" ? "text-white" : "text-slate-850"}`}>{log.customerName}</p>
                      <p className={`text-[10px] font-mono ${theme === "dark" ? "text-gray-500" : "text-slate-500"}`}>{log.phone}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${getSentimentBadge(log.sentiment)}`}>
                        {log.sentiment}
                      </span>
                      <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                        log.status === "completed" 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10" 
                          : "bg-blue-500/10 text-blue-400 border border-blue-500/10 animate-pulse"
                      }`}>
                        {log.status}
                      </span>
                    </div>
                  </div>

                  <p className={`text-[11px] font-mono leading-relaxed p-2 rounded border ${
                    theme === "dark" 
                      ? "text-gray-300 bg-black/40 border-white/5" 
                      : "text-slate-700 bg-white border-slate-200"
                  }`}>
                    {log.summary}
                  </p>

                  <div className="flex items-center justify-between text-[9px] text-gray-500 pt-1">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-gray-500" /> {log.duration}
                    </span>
                    <span className="font-mono">{log.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={`border-t pt-4 mt-4 flex items-center justify-between text-[11px] ${
          theme === "dark" ? "border-white/5 text-gray-400" : "border-slate-200 text-slate-500"
        }`}>
          <span className="flex items-center gap-1 text-emerald-500 font-medium">
            <HeartHandshake className="w-3.5 h-3.5" />
            Indian Regional Dialects Synchronized
          </span>
          <span className="font-mono text-[9px] text-gray-500">v2.0.0</span>
        </div>
      </div>
    </div>
    )}
  </div>
);
}
