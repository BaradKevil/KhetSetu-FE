import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  InputBase,
  Button,
  Chip,
  Avatar,
  IconButton,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  MdSmartToy,
  MdSend,
  MdContentCopy,
  MdDeleteOutline,
  MdCheck,
  MdStorefront,
  MdArrowBack,
  MdSecurity,
  MdAttachMoney,
  MdVerified,
} from 'react-icons/md';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAskAIAdvisoryMutation } from '../../Api/Api';
import { toast } from 'react-toastify';

const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-3.8-flash';
const STORAGE_KEY = 'khetsetu_buyer_ai_advisory_chat_history_v1';

const SYSTEM_INSTRUCTION = `You are "KhetSetu Mandi & Buyer AI" (ખેતસેતુ મંડી અને ખરીદનાર AI / खेतसेतु मंडी एवं खरीदार AI), an expert agricultural commodity consultant, produce quality grading specialist, APMC mandi trading analyst, and bulk procurement advisor dedicated to produce buyers, traders, processors, retailers, and individual consumers purchasing directly from Indian farmers (especially in Gujarat and across India).

Your Core Mission & Domain Knowledge:
1. Produce Quality Grading & Verification:
   - Grade A, B, and C parameters for Garlic (Gujarat Garlic-4), Cumin (Jeera), Groundnut (GG-20), Cotton (Kapas), Wheat, Mustard, Castor, Onion.
   - Moisture limits: <8% for cured garlic and cumin, <7-8% for oilseeds. Explaining digital moisture meters and shade-drying tests.
   - Visual checks: Pod filling percentage, seed uniformity, foreign matter <1%, discoloration, and pest damage detection.
2. Mandi Price Discovery & Trading Cycles:
   - Seasonal arrival patterns across key APMC Mandis (Unjha, Gondal, Rajkot, Mehsana, Deesa, Surat).
   - Understanding modal rates, spread between minimum and maximum auction bids, and historical price seasonality.
3. KhetSetu 100% Escrow Protection:
   - Explaining how buyer payments are locked safely in escrow and never paid to the seller until delivery verification and weighment confirmation.
   - Quality inspection window and transparent dispute resolution mechanism.
4. Bulk Procurement & Contract RFQs:
   - Posting Request For Quotation (RFQ) directly to verified farmers.
   - Negotiating Minimum Order Quantities (MOQ), packaging standards (50kg gunny/jute bags vs HDPE), and transport logistics.
5. Agricultural Machinery & Farming Queries:
   - If buyers or farmers ask about tractor sizing, rotavators, solar pumps, or subsidies, answer authoritatively with correct engineering specs and PM-KUSUM / GGRC subsidy percentages.

Language Guidelines:
- If user writes in Gujarati or asks in Gujarati, reply in authentic, polite Gujarati (ગુજરાતી).
- If user writes in Hindi, reply in clear, respectful Hindi (हिन्दी).
- If user writes in English, reply in English.

Formatting Guidelines:
- Use clean Markdown with headers (###), bold text (**bold**), bullet points (*), and numbers.
- Use friendly emojis (🌾, 💰, 🛡️, 📦, 🚚, 🚜, 💡).
- Give practical, direct numbers (moisture %, price ranges, bag capacities, delivery timelines).`;

export default function BuyerAIAdvisory() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const askAIMutation = useAskAIAdvisoryMutation();

  const [activeLang, setActiveLang] = useState(language || 'en');

  useEffect(() => {
    if (language) setActiveLang(language);
  }, [language]);

  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }

    return [
      {
        id: 'msg-welcome-buyer',
        sender: 'ai',
        text:
          language === 'gu'
            ? `🙏 **નમસ્તે વેપારી અને ખરીદનાર મિત્ર!** હું છું તમારો **ખેતસેતુ મંડી અને ખરીદનાર AI સલાહકાર** (Powered by Google Gemini 3.8 Flash).

હું તમને નીચેની બાબતોમાં સીધી મદદ કરી શકું છું:
• 🔍 **પાકની ગુણવત્તા અને ગ્રેડિંગ**: લસણ, જીરું, મગફળી અને કપાસના Grade A પરિમાણો તથા ભેજની ટકાવારી (< 8%)
• 💰 **APMC મંડી બજાર ભાવ**: ઊંઝા, ગોંડલ, રાજકોટ સહિતની મંડીઓના સરેરાશ બજાર ભાવો અને મોસમી આવક
• 🛡️ **એસ્ક્રો પેમેન્ટ સુરક્ષા**: માલ મળ્યા અને ચકાસણી કર્યા પછી જ ચુકવણી કેવી રીતે સુરક્ષિત રહે છે
• 📋 **જથ્થાબંધ ખરીદી અને RFQ**: ખેડૂતો પાસેથી સીધા મોટા ઓર્ડર અને વ્યાજબી ભાવે સોદા કરવાની રીત
• 🚚 **પેકિંગ અને ટ્રાન્સપોર્ટ**: ૫૦ કિલો ગૂણી પેકિંગ અને સંગ્રહ દરમિયાન ગુણવત્તા જાળવણી

નીચે આપેલા સૂચવેલા પ્રશ્નોમાંથી પસંદ કરો અથવા તમારો પોતાનો પ્રશ્ન લખીને પૂછો!`
            : language === 'hi'
            ? `🙏 **नमस्ते व्यापारी व खरीदार साथी!** मैं हूँ आपका **खेतसेतु मंडी एवं खरीदार AI सलाहकार** (Powered by Google Gemini 3.8 Flash).

मैं आपकी कृषि उपज खरीद, गुणवत्ता जांच और व्यापार में पूर्ण सहायता कर सकता हूँ:
• 🔍 **उपज गुणवत्ता व ग्रेडिंग**: लहसुन, जीरा, मूंगफली और कपास के Grade A मानक व नमी परीक्षण (< 8%)
• 💰 **APMC मंडी भाव विश्लेषण**: ऊंझा, गोंडल, राजकोट आदि मंडियों के मॉडल भाव व आवक चक्र
• 🛡️ **एस्क्रो सुरक्षा**: माल प्राप्ति और वजन पर्ची सत्यापन तक 100% सुरक्षित भुगतान प्रणाली
• 📋 **थोक खरीद व RFQ**: बिना बिचौलियों के सीधे किसानों से कोटेशन प्राप्त करने की प्रक्रिया
• 🚚 **पैकिंग व परिवहन**: जूट बैग पैकिंग और वेयरहाउसिंग नमी प्रबंधन

नीचे दिए गए सुझावों में से चुनें या अपना सवाल टाइप करें!`
            : `🙏 **Welcome Buyer & Trader Partner!** I am your **KhetSetu Mandi & Buyer AI Advisory** assistant, powered live by **Google Gemini 3.8 Flash**.

I can assist you with all aspects of farm produce procurement and market intelligence:
• 🔍 **Crop Quality & Grade A Standards**: Moisture limits (<8%) & visual parameters for Cumin, Garlic, Groundnut, Cotton & Wheat
• 💰 **APMC Mandi Price Intelligence**: Modal rates, arrivals & seasonal trading windows across Gujarat Mandis
• 🛡️ **100% Escrow Protection**: How buyer funds remain safe until physical delivery and weighment slip verification
• 📋 **Bulk Procurement & RFQs**: Posting customized requirements and negotiating directly with verified farmers
• 🚚 **Packaging & Logistics**: 50kg gunny bag specs, storage conditions & freight optimization

Choose one of the starter questions below or type your query in any language!`,
        model: GEMINI_MODEL,
        time: new Date().toISOString(),
      },
    ];
  });

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // ignore
    }
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const callGeminiAI = async (userText, chatHistory) => {
    const recentHistory = chatHistory.slice(-8);

    try {
      const res = await askAIMutation.mutateAsync({
        message: userText,
        language: activeLang,
        systemInstruction: SYSTEM_INSTRUCTION,
        history: recentHistory.map((m) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }],
        })),
      });

      if (res?.answer || res?.data?.answer) {
        return {
          answer: res.answer || res.data.answer,
          model: res.model || GEMINI_MODEL,
        };
      }
    } catch (backendError) {
      console.warn('Buyer AI Advisory service error:', backendError?.message);
    }

    throw new Error('Unable to connect to the AI advisory service. Please try again.');
  };

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputQuery).trim();
    if (!text || isTyping) return;

    const userMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text,
      time: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setIsTyping(true);

    try {
      const result = await callGeminiAI(text, messages);

      const aiMessage = {
        id: `msg-${Date.now()}-ai`,
        sender: 'ai',
        text: result.answer,
        model: result.model || GEMINI_MODEL,
        time: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error('Buyer AI Generation Error:', err);
      const errorMessage = {
        id: `msg-${Date.now()}-ai-error`,
        sender: 'ai',
        text:
          activeLang === 'gu'
            ? `⚠️ **ક્ષમા કરશો, AI સાથે જોડાણ થઈ શક્યું નથી.**\n\nભૂલ: ${err?.message || 'ઇન્ટરનેટ જોડાણ તપાસો.'}\n\nકૃપા કરીને ફરીથી પ્રયાસ કરો.`
            : activeLang === 'hi'
            ? `⚠️ **क्षमा करें, AI सेवा से संपर्क नहीं हो पाया।**\n\nकारण: ${err?.message || 'कृपया इंटरनेट कनेक्शन जांचें।'}\n\nकृपया दोबारा प्रयास करें।`
            : `⚠️ **Unable to connect to Google Gemini AI service.**\n\nError: ${err?.message || 'Please check your internet connection.'}\n\nPlease try again in a few moments.`,
        model: 'connection-error',
        time: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      toast.error('AI connection issue. Please retry.');
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyText = (id, text) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    toast.success(t('farmer.copiedToast', 'Copied advice to clipboard!'));
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    const welcome = [
      {
        id: `msg-${Date.now()}-ai`,
        sender: 'ai',
        text:
          activeLang === 'gu'
            ? 'ચેટ રીસેટ થઈ ગઈ છે. પાક ગ્રેડિંગ, મંડી ભાવો કે એસ્ક્રો ચુકવણી અંગે નવો પ્રશ્ન પૂછો!'
            : activeLang === 'hi'
            ? 'चैट रीसेट हो गई है। फसल ग्रेडिंग, मंडी भाव या एस्क्रो सुरक्षा पर नया प्रश्न पूछें!'
            : 'Conversation reset. Ask any question about crop quality grading, APMC rates, or escrow payment!',
        model: GEMINI_MODEL,
        time: new Date().toISOString(),
      },
    ];
    setMessages(welcome);
    localStorage.removeItem(STORAGE_KEY);
    toast.info('Chat cleared.');
  };

  const starterQuestions = [
    {
      label:
        activeLang === 'gu'
          ? '🔍 જીરું અને લસણના Grade A પરિમાણો'
          : activeLang === 'hi'
          ? '🔍 जीरा व लहसुन के Grade A मानक'
          : '🔍 Grade A Quality Parameters for Cumin & Garlic',
      query:
        activeLang === 'gu'
          ? 'ગુજરાત જીરું (Jeera) અને લસણ (Garlic) ના Grade A ગુણવત્તા પરિમાણો, દાણાનું કદ અને ભેજની ટકાવારી (Moisture %) કેટલી હોવી જોઈએ?'
          : activeLang === 'hi'
          ? 'गुजरात जीरा (Jeera) और लहसुन (Garlic) के Grade A गुणवत्ता मानक, दाने का आकार और नमी प्रतिशत (Moisture %) क्या होना चाहिए?'
          : 'What are the Grade A quality parameters, seed uniformity, and moisture limits for Gujarat Cumin (Jeera) and Garlic?',
    },
    {
      label:
        activeLang === 'gu'
          ? '🛡️ ખેતસેતુ એસ્ક્રો પેમેન્ટ સુરક્ષા'
          : activeLang === 'hi'
          ? '🛡️ खेतसेतु एस्क्रो भुगतान सुरक्षा'
          : '🛡️ How KhetSetu Escrow Protects Buyers',
      query:
        activeLang === 'gu'
          ? 'ખેતસેતુ એસ્ક્રો સિસ્ટમ ખરીદનારના પૈસાની સુરક્ષા કેવી રીતે કરે છે અને ડિલિવરી ચકાસ્યા પછી જ રકમ કેવી રીતે રિલીઝ થાય છે?'
          : activeLang === 'hi'
          ? 'खेतसेतु एस्क्रो प्रणाली खरीदार के पैसे की सुरक्षा कैसे करती है और डिलीवरी सत्यापन के बाद ही भुगतान कैसे रिलीज होता है?'
          : 'How does KhetSetu Escrow guarantee 100% payment safety for buyers until physical delivery and weighment slip verification?',
    },
    {
      label:
        activeLang === 'gu'
          ? '💰 મગફળી અને કપાસના મંડી બજાર ભાવો'
          : activeLang === 'hi'
          ? '💰 मूंगफली व कपास के मंडी मॉडल भाव'
          : '💰 Peak Arrival & Pricing for Groundnut & Cotton',
      query:
        activeLang === 'gu'
          ? 'ગુજરાત મંડીઓમાં મગફળી (GG-20) અને કપાસ (Kapas) ની ખરીદી માટે શ્રેષ્ઠ મોસમ અને સરેરાશ બજાર ભાવો (Modal Rates) ની ગણતરી કેવી રીતે થાય?'
          : activeLang === 'hi'
          ? 'गुजरात मंडियों में मूंगफली (GG-20) और कपास (Kapas) खरीद के लिए सबसे अच्छा समय और मॉडल भाव (Modal Rates) का विश्लेषण बताएं?'
          : 'What are the seasonal peak arrival months, APMC modal price trends, and procurement strategies for Groundnut and Cotton in Gujarat?',
    },
    {
      label:
        activeLang === 'gu'
          ? '📋 જથ્થાબંધ ખરીદી અને RFQ પ્રક્રિયા'
          : activeLang === 'hi'
          ? '📋 थोक खरीद व RFQ प्रक्रिया'
          : '📋 How to Post Bulk RFQ to Farmers',
      query:
        activeLang === 'gu'
          ? 'ખરીદનાર તરીકે મોટી માત્રામાં પાક ખરીદવા માટે RFQ કેવી રીતે પોસ્ટ કરવી અને ખેડૂતો સાથે સીધો સોદો કેવી રીતે કરવો?'
          : activeLang === 'hi'
          ? 'खरीदार के रूप में थोक फसल खरीद के लिए RFQ कैसे पोस्ट करें और सीधे किसानों से कोटेशन कैसे प्राप्त करें?'
          : 'What is the step-by-step process for a buyer to post a bulk RFQ and negotiate competitive purchase quotes with verified farmers?',
    },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        bgcolor: '#FFFFFF',
        overflow: 'hidden',
      }}
    >
      {/* 1. Full-Width Chat Header Bar */}
      <Box
        sx={{
          px: { xs: 2, sm: 3 },
          py: 1.5,
          borderBottom: '1px solid #E2E8F0',
          bgcolor: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
          boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
          zIndex: 10,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton
            size="small"
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/buyer'))}
            sx={{
              color: '#64748B',
              border: '1px solid #E2E8F0',
              borderRadius: 2,
              p: 0.75,
              '&:hover': { bgcolor: '#F8FAFC' },
            }}
          >
            <MdArrowBack size={18} />
          </IconButton>

          <Box sx={{ position: 'relative' }}>
            <Avatar
              sx={{
                width: 42,
                height: 42,
                bgcolor: '#2563EB',
                color: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
              }}
            >
              <MdSmartToy size={24} />
            </Avatar>
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: '#16A34A',
                border: '2px solid #FFFFFF',
              }}
            />
          </Box>

          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle1" fontWeight={800} color="#0F172A">
                {activeLang === 'gu'
                  ? 'ખેતસેતુ મંડી અને ખરીદનાર AI સલાહકાર'
                  : activeLang === 'hi'
                  ? 'खेतसेतु मंडी एवं खरीदार AI सलाहकार'
                  : 'KhetSetu Mandi & Buyer AI Advisory'}
              </Typography>
              <Chip
                label="⚡ Gemini 3.8 Flash"
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  bgcolor: '#EFF6FF',
                  color: '#2563EB',
                  border: '1px solid #BFDBFE',
                }}
              />
            </Box>
            <Typography variant="caption" color="#64748B" fontWeight={500}>
              {activeLang === 'gu'
                ? '૨૪×૭ કૃષિ ઉપજ ગુણવત્તા ગ્રેડિંગ, મંડી ભાવો અને એસ્ક્રો ખરીદી સહાયક'
                : activeLang === 'hi'
                ? '24×7 कृषि उपज गुणवत्ता ग्रेडिंग, मंडी भाव व सुरक्षित खरीद सहायक'
                : '24×7 Produce Procurement, Crop Quality Grading & Mandi Price Intelligence'}
            </Typography>
          </Box>
        </Box>

        {/* Right side controls: Reset chat */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Reset Chat">
            <Button
              variant="outlined"
              size="small"
              startIcon={<MdDeleteOutline />}
              onClick={handleClearChat}
              sx={{
                borderRadius: 2,
                borderColor: '#E2E8F0',
                color: '#64748B',
                fontWeight: 600,
                fontSize: '0.78rem',
                textTransform: 'none',
                py: 0.5,
                '&:hover': { bgcolor: '#F8FAFC', borderColor: '#CBD5E1' },
              }}
            >
              Reset
            </Button>
          </Tooltip>
        </Box>
      </Box>

      {/* 2. Chat Messages Area (Full Height Scrollable Stream) */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          px: { xs: 2, sm: 3, md: 4 },
          py: 3,
          bgcolor: '#F8FAFC',
          display: 'flex',
          flexDirection: 'column',
          scrollbarWidth: 'thin',
          scrollbarColor: '#CBD5E1 transparent',
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
          '&::-webkit-scrollbar-thumb': { bgcolor: '#CBD5E1', borderRadius: '4px' },
        }}
      >
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <Box
                key={msg.id}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isUser ? 'flex-end' : 'flex-start',
                  width: '100%',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.5,
                    maxWidth: { xs: '96%', sm: '88%', md: '82%' },
                    flexDirection: isUser ? 'row-reverse' : 'row',
                  }}
                >
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: isUser ? '#0F172A' : '#2563EB',
                      color: '#FFFFFF',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      flexShrink: 0,
                      boxShadow: isUser
                        ? '0 2px 6px rgba(15,23,42,0.2)'
                        : '0 2px 6px rgba(37,99,235,0.25)',
                    }}
                  >
                    {isUser ? <MdStorefront size={18} /> : <MdSmartToy size={20} />}
                  </Avatar>

                  <Box
                    sx={{
                      position: 'relative',
                      p: { xs: 2, sm: 2.5 },
                      borderRadius: isUser ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                      bgcolor: isUser ? '#FFFFFF' : '#FFFFFF',
                      color: '#0F172A',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                      border: isUser ? '1.5px solid #2563EB' : '1px solid #E2E8F0',
                      wordBreak: 'break-word',
                      '&:hover .message-copy-btn': { opacity: 1 },
                    }}
                  >
                    <Box
                      sx={{
                        fontSize: '0.94rem',
                        lineHeight: 1.65,
                        color: '#0F172A',
                        '& p': { m: 0, mb: 1, '&:last-child': { mb: 0 } },
                        '& ul, & ol': { m: 0, pl: 2.5, mb: 1 },
                        '& li': { mb: 0.5 },
                        '& strong': { color: '#0F172A', fontWeight: 700 },
                        '& h3, & h4': {
                          fontSize: '1rem',
                          fontWeight: 750,
                          color: '#1E40AF',
                          m: 0,
                          mt: 1.5,
                          mb: 0.8,
                        },
                        '& code': {
                          bgcolor: '#F1F5F9',
                          px: 0.8,
                          py: 0.2,
                          borderRadius: 1,
                          fontSize: '0.88rem',
                          fontFamily: 'monospace',
                        },
                      }}
                    >
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </Box>

                    {/* Copy Advice Button */}
                    {!isUser && (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          mt: 1.5,
                          pt: 1,
                          borderTop: '1px solid #F1F5F9',
                          gap: 1,
                        }}
                      >
                        <Button
                          size="small"
                          onClick={() => handleCopyText(msg.id, msg.text)}
                          startIcon={
                            copiedId === msg.id ? (
                              <MdCheck size={14} color="#16A34A" />
                            ) : (
                              <MdContentCopy size={14} />
                            )
                          }
                          sx={{
                            color: copiedId === msg.id ? '#16A34A' : '#64748B',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            textTransform: 'none',
                            p: '2px 8px',
                            borderRadius: 1.5,
                            bgcolor: copiedId === msg.id ? '#F0FDF4' : 'transparent',
                            '&:hover': { bgcolor: '#F8FAFC' },
                          }}
                        >
                          {copiedId === msg.id ? 'Copied' : 'Copy'}
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            );
          })}

          {/* Starter Suggestions on clean canvas */}
          {messages.length <= 1 && (
            <Box sx={{ mt: 2, mb: 1 }}>
              <Typography
                variant="caption"
                fontWeight={700}
                color="#64748B"
                sx={{ display: 'block', mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}
              >
                💡 {activeLang === 'gu' ? 'વારંવાર પૂછાતા વેપારી પ્રશ્નો:' : activeLang === 'hi' ? 'अक्सर पूछे जाने वाले व्यापार प्रश्न:' : 'Common Procurement Inquiries:'}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.2 }}>
                {starterQuestions.map((q, idx) => (
                  <Chip
                    key={idx}
                    label={q.label}
                    onClick={() => handleSendMessage(q.query)}
                    sx={{
                      bgcolor: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      color: '#0F172A',
                      fontWeight: 600,
                      fontSize: '0.82rem',
                      py: 2.2,
                      px: 0.5,
                      borderRadius: 2.5,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: '#EFF6FF',
                        borderColor: '#2563EB',
                        color: '#2563EB',
                        boxShadow: '0 2px 8px rgba(37,99,235,0.12)',
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Typing Indicator */}
          {isTyping && (
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: '#2563EB',
                  color: '#FFFFFF',
                }}
              >
                <MdSmartToy size={20} />
              </Avatar>
              <Box
                sx={{
                  p: 2,
                  borderRadius: '4px 18px 18px 18px',
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <CircularProgress size={16} sx={{ color: '#2563EB' }} />
                <Typography variant="body2" sx={{ color: '#475569', fontWeight: 600 }}>
                  {activeLang === 'gu'
                    ? 'મંડી AI વિશ્લેષણ કરી રહ્યું છે...'
                    : activeLang === 'hi'
                    ? 'मंडी AI विश्लेषण कर रहा है...'
                    : 'Mandi AI is analyzing your procurement inquiry...'}
                </Typography>
              </Box>
            </Box>
          )}

          <div ref={chatBottomRef} />
        </Box>
      </Box>

      {/* 3. Bottom Full-Width Text Typing Bar */}
      <Box
        sx={{
          width: '100%',
          borderTop: '1px solid #E2E8F0',
          bgcolor: '#FFFFFF',
          px: { xs: 2, sm: 3, md: 4 },
          py: 1.5,
          zIndex: 10,
          boxShadow: '0 -2px 14px rgba(0,0,0,0.03)',
        }}
      >
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            bgcolor: '#F8FAFC',
            border: '1.5px solid #CBD5E1',
            borderRadius: 3.5,
            p: '8px 16px',
            transition: 'all 0.2s ease',
            '&:focus-within': {
              borderColor: '#2563EB',
              bgcolor: '#FFFFFF',
              boxShadow: '0 0 0 3px rgba(37,99,235,0.12)',
            },
          }}
        >
          <InputBase
            fullWidth
            multiline
            maxRows={4}
            placeholder={
              activeLang === 'gu'
                ? 'પાક ગુણવત્તા, ગ્રેડિંગ, મંડી ભાવો, એસ્ક્રો ચુકવણી કે જથ્થાબંધ ઓર્ડર અંગે પૂછો... (Enter દબાવો)'
                : activeLang === 'hi'
                ? 'फसल गुणवत्ता, ग्रेडिंग, मंडी भाव, एस्क्रो भुगतान या थोक खरीद पर पूछें... (Enter दबाएं)'
                : 'Ask about crop quality, grading, APMC mandi rates, escrow payment, or bulk procurement...'
            }
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isTyping}
            sx={{
              flex: 1,
              color: '#000000', // Pure black text
              fontWeight: 500,
              fontSize: '0.98rem',
              py: 0.5,
              border: 'none',
              outline: 'none',
              '& .MuiInputBase-input': {
                color: '#000000',
                fontWeight: 500,
                fontSize: '0.98rem',
                border: 'none',
                outline: 'none',
              },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={!inputQuery.trim() || isTyping}
            sx={{
              minWidth: 46,
              width: 46,
              height: 46,
              borderRadius: '50%',
              bgcolor: '#2563EB',
              p: 0,
              boxShadow: '0 3px 10px rgba(37,99,235,0.3)',
              '&:hover': { bgcolor: '#1D4ED8' },
              '&:disabled': { bgcolor: '#CBD5E1', color: '#FFFFFF' },
            }}
          >
            <MdSend size={20} />
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
