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
  Mic
} from "lucide-react";
import { Customer, Invoice, CallLog } from "../types";

interface VoiceAgentProps {
  customers: Customer[];
  invoices: Invoice[];
  callLogs: CallLog[];
  onTriggerCall: (customerId: string, invoiceId: string, customScript?: string) => void;
  isLoading: boolean;
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
  isLoading
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
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6" id="voice_agent_panel">
      
      {/* COLUMN 1: CLIENT SELECTOR & NEW HUMANIZER TUNING CONTROLS */}
      <div className="space-y-6">
        <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between h-full" id="recipient_voice_settings">
          <div className="space-y-5">
            <div>
              <h2 className="text-md font-bold font-display text-white flex items-center gap-2">
                <User className="w-5 h-5 text-blue-400" />
                Customer & Voice Options
              </h2>
              <p className="text-xs text-gray-400">Select customer ledger and configure speech engine</p>
            </div>

            <div className="space-y-4">
              {/* Customer ledger picker */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400 flex items-center gap-1">
                  Target Customer
                </label>
                <select 
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.status})</option>
                  ))}
                </select>
              </div>

              {/* Invoice linker details */}
              {selectedCustomerId && (
                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-blue-400" /> Outstanding Invoice Balance
                  </label>
                  <select 
                    value={selectedInvoiceId}
                    onChange={(e) => setSelectedInvoiceId(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">-- No Linked Invoice (General Call) --</option>
                    {customerUnpaidInvoices.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.invoiceNumber} - ₹{inv.amount.toLocaleString('en-IN')} ({inv.status})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* ADVANCED HUMAN-LIKE SPEECH CONTROLS */}
              <div className="border-t border-white/5 pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-indigo-400 font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Human-Like Tuning
                  </span>
                  <div className="text-[10px] px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-full font-mono border border-indigo-500/20">
                    Humanizer Engine v2.0
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Real-time split speaking toggle */}
                  <div className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/5">
                    <div>
                      <p className="text-xs font-semibold text-white">Natural Breath Gaps</p>
                      <p className="text-[10px] text-gray-400">Inserts breath pauses at punctuation</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={isHumanCadenceEnabled}
                        onChange={() => setIsHumanCadenceEnabled(!isHumanCadenceEnabled)}
                        className="sr-only peer" 
                      />
                      <div className="w-8 h-4 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                  </div>

                  {/* Micro inflection scale toggle */}
                  <div className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/5">
                    <div>
                      <p className="text-xs font-semibold text-white">Financial Vocal Inflection</p>
                      <p className="text-[10px] text-gray-400">Slowing cadence when speaking figures</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={isVocalInflectionEnabled}
                        onChange={() => setIsVocalInflectionEnabled(!isVocalInflectionEnabled)}
                        className="sr-only peer" 
                      />
                      <div className="w-8 h-4 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                  </div>

                  {/* Telephony loop toggle */}
                  <div className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/5">
                    <div>
                      <p className="text-xs font-semibold text-white">Telephony Comfort Noise</p>
                      <p className="text-[10px] text-gray-400">Synthesizes telephone-grade white hum</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={isComfortHumEnabled}
                        onChange={() => setIsComfortHumEnabled(!isComfortHumEnabled)}
                        className="sr-only peer" 
                      />
                      <div className="w-8 h-4 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                  </div>
                </div>

                {isSpeechEnabled && (
                  <div className="space-y-3 pt-3 border-t border-white/5">
                    {/* TTS Voice Select */}
                    <div className="space-y-1">
                      <span className="text-[10px] text-gray-500 font-mono">Current Synthesized voice</span>
                      <select 
                        value={selectedVoiceName}
                        onChange={(e) => setSelectedVoiceName(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                      >
                        {availableVoices.length === 0 ? (
                          <option value="">System Default Voice</option>
                        ) : (
                          availableVoices.map((voice) => (
                            <option key={voice.name} value={voice.name} className="bg-zinc-950 text-white text-[11px]">
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
                          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
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
                          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
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
      <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between" id="script_customizer_console">
        <div className="space-y-5 flex-1 flex flex-col">
          <div>
            <h2 className="text-md font-bold font-display text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-400" />
              Regional Languages & Scripts
            </h2>
            <p className="text-xs text-gray-400">Configure Indian local dialects and campaign triggers</p>
          </div>

          {/* Regional Languages Indian Matrix */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400 flex items-center gap-1">
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
                      ? "bg-emerald-600/10 border-emerald-500 text-white"
                      : "bg-black/30 border-white/5 hover:border-white/15 text-gray-300"
                  }`}
                >
                  <span className="text-base shrink-0">{lang.flag}</span>
                  <div className="truncate">
                    <p className="text-[11px] font-bold font-display truncate">{lang.native}</p>
                    <p className="text-[9px] text-gray-500 truncate">{lang.name}</p>
                  </div>
                  {selectedLanguageId === lang.code && (
                    <Check className="w-3.5 h-3.5 text-emerald-400 ml-auto shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Behavioral Template selector */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400">
              Vocal Cadence Tone
            </span>
            <div className="flex gap-2">
              {(LOCALIZED_TEMPLATES[selectedLanguageId] || LOCALIZED_TEMPLATES["hi"]).map((tpl, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedTemplateIndex(idx)}
                  className={`flex-1 p-2 rounded-xl border text-center transition-all ${
                    selectedTemplateIndex === idx
                      ? "bg-indigo-600/10 border-indigo-500 text-white"
                      : "bg-black/30 border-white/5 hover:border-white/15 text-gray-300"
                  }`}
                >
                  <div className="text-[12px]">{tpl.icon}</div>
                  <div className="text-[10px] font-bold font-display mt-0.5">{tpl.name.split(" ")[0]}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Script Editor panel */}
          <div className="space-y-1.5 flex-1 flex flex-col pt-2 border-t border-white/5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400">
                Dialer Speech Script (Edit Libre)
              </label>
              <span className="text-[8px] font-mono text-zinc-500">Separators: '...' represent breaths</span>
            </div>
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Type regional prompt words here..."
              className="w-full flex-1 min-h-[120px] bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-gray-200 focus:outline-none focus:border-emerald-500 font-mono resize-none leading-relaxed"
            />
          </div>

          {/* Local translation visual rendering */}
          <div className="p-3 bg-zinc-900/60 border border-white/5 rounded-xl space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-[9px] uppercase font-mono tracking-widest text-emerald-400 font-bold block">
                Live Dialing Translation
              </span>
              <span className="text-[8px] bg-white/5 px-1.5 py-0.5 rounded text-gray-400 font-mono">
                {LANGUAGES.find(l => l.code === selectedLanguageId)?.name} dialect
              </span>
            </div>
            <p className="text-[11px] text-gray-300 leading-relaxed italic font-sans">
              "{finalScriptText}"
            </p>
          </div>
        </div>
      </div>

      {/* COLUMN 3: DIALER TELEMETRY, WAVEFORM & HISTORY LOGS */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between" id="voice_campaign_logs">
        <div className="space-y-5">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-md font-bold font-display text-white">Regional Call Desk</h3>
              <p className="text-xs text-gray-400">Active regional dialer with direct humanization</p>
            </div>
            <span className="text-[9px] uppercase tracking-widest bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold font-mono">
              SIP REGIONAL ACTIVE
            </span>
          </div>

          {/* TELEPHONE DISPLAY GATEWAY */}
          {activeCallStatus !== "idle" ? (
            <div className="p-5 rounded-2xl bg-zinc-950/45 border border-indigo-500/35 space-y-4 shadow-xl relative overflow-hidden animate-in fade-in zoom-in-95">
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
                <p className="text-sm font-bold font-display text-white">
                  {currentCustomer?.name || "Client Ledger"}
                </p>
                <p className="text-[10px] font-mono text-gray-400 mt-0.5">
                  {currentCustomer?.phone || "+91 90040 12345"}
                </p>
                <div className="inline-flex items-center gap-1 text-[9px] bg-white/5 border border-white/5 px-2 py-0.5 rounded-full mt-1.5 text-gray-400 font-mono">
                  <span>Dialect:</span>
                  <span className="text-emerald-400 font-semibold">{LANGUAGES.find(l => l.code === selectedLanguageId)?.name}</span>
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
              <div className="p-3 bg-black/60 rounded-xl max-h-[100px] overflow-y-auto text-center border border-white/5">
                {activeCallStatus === "connected" ? (
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-mono tracking-widest text-emerald-400 block font-bold">
                      Subtitles Dialect Feed (TTS)
                    </span>
                    <p className="text-xs text-emerald-300 font-mono leading-relaxed italic">
                      "{simulatedSubtitles}"
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-300 leading-normal font-mono">{activeCallLogText}</p>
                )}
              </div>
            </div>
          ) : (
            /* IDLE DIALER BLOCK */
            <div className="p-5 bg-zinc-900/40 rounded-xl border border-white/5 text-center py-7 space-y-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <PhoneCall className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-white">Outbound Campaign Dispatcher</p>
                <p className="text-[11px] text-gray-400 max-w-[240px] mx-auto">
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
            <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400">
              Active Regional Call History
            </span>
            <div className="space-y-3 max-h-[170px] overflow-y-auto pr-1">
              {callLogs.map((log) => (
                <div 
                  key={log.id} 
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white font-display">{log.customerName}</p>
                      <p className="text-[10px] text-gray-500 font-mono">{log.phone}</p>
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

                  <p className="text-[11px] text-gray-300 font-mono leading-relaxed bg-black/40 p-2 rounded border border-white/5">
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

        <div className="border-t border-white/5 pt-4 mt-4 flex items-center justify-between text-[11px] text-gray-400">
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <HeartHandshake className="w-3.5 h-3.5" />
            Indian Regional Dialects Synchronized
          </span>
          <span className="font-mono text-[9px] text-gray-500">v2.0.0</span>
        </div>
      </div>

    </div>
  );
}
