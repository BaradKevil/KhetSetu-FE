import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  InputBase,
  Button,
  Chip,
  Avatar,
  IconButton,
  Divider,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  MdSmartToy,
  MdSend,
  MdContentCopy,
  MdDeleteOutline,
  MdCheck,
  MdAgriculture,
  MdAutoAwesome,
  MdArrowBack,
  MdRefresh,
} from 'react-icons/md';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAskAIAdvisoryMutation } from '../../Api/Api';
import { toast } from 'react-toastify';

const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-3.8-flash';
const STORAGE_KEY = 'khetsetu_ai_advisory_chat_history_v2';

const SYSTEM_INSTRUCTION = `You are "KhetSetu Kisan AI" (ખેતસેતુ કિસાન AI / खेतसेतु किसान AI), an expert agronomy consultant, agricultural machinery specialist, and farm advisory intelligence dedicated to Indian farmers (especially in Gujarat and across India).

Your Core Mission & Domain Knowledge:
1. Agricultural Equipment & Machinery:
   - Tractor horsepower sizing by acreage: 35–45 HP for 3–7 acres; 45–55 HP for >8 acres with heavy soil. PTO HP specs (540 RPM).
   - Rotavator selection: 36, 42, or 48 blades (5 to 6 ft). L-type blades for heavy/black soil; C-type for sandy loam. Trusted brands in Gujarat (Shaktiman, Fieldking).
   - Solar Water Pumps (PM-KUSUM Component B): 3 HP (water depth 50–120 ft), 5 HP (120–180 ft), 7.5 HP (180–250+ ft) DC submersible. 60% combined subsidy (30% Central + 30% State); farmer pays 10–15%.
   - Implements: Laser land levelers, disc harrows, drip fertigation systems, power sprayers, mini-tractors for orchards.
2. Modern Farming Techniques & Water Management:
   - Inline drip irrigation and sprinkler systems. GGRC (Gujarat Green Revolution Company) 70% subsidy workflow.
   - Soil fertility, organic carbon, zero tillage, mulching, farm ponds.
3. Pest, Weed & Crop Health:
   - Integrated Pest Management (IPM), bio-pesticides (Neem oil 10,000 PPM @ 3ml/L, Beauveria bassiana, Trichoderma viride seed treatment).
   - Pheromone traps and yellow/blue sticky traps for whiteflies, thrips, and bollworms.
4. Major Crops Cultivation & Post-Harvest Mandi Strategy:
   - Garlic (Gujarat Garlic-4), Cumin (Jeera), Groundnut (GG-20), Cotton (Kapas), Wheat, Mustard, Castor, Onion.
   - Harvest signs, shade curing (8–10 days for garlic), and sun-drying to <8% moisture to earn Grade A prices on KhetSetu without distress sales.
5. Government Subsidies & Portals:
   - i-Khedut portal Gujarat (ikhedut.gujarat.gov.in), SMAM mechanization subsidies, PM-KUSUM, Kisan Credit Card (KCC).

Language Guidelines:
- If user writes in Gujarati or asks in Gujarati, reply in authentic, polite Gujarati (ગુજરાતી).
- If user writes in Hindi, reply in clear, respectful Hindi (हिन्दी).
- If user writes in English, reply in English.

Formatting Guidelines:
- Use clean Markdown with headers (###), bold text (**bold**), bullet points (*), and numbers.
- Use friendly emojis (🚜, ☀️, 💧, 🌾, 🌿, 💡).
- Give practical, direct numbers (HP, subsidy %, spray dosage, seed rate).`;

export default function SellerAIAdvisory() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const askAIMutation = useAskAIAdvisoryMutation();

  const [activeLang, setActiveLang] = useState(language || 'en');

  // Keep activeLang in sync with system language changes
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
        id: 'msg-welcome',
        sender: 'ai',
        text:
          language === 'gu'
            ? `🙏 **નમસ્તે ખેડૂત મિત્ર!** હું છું તમારો **ખેતસેતુ કિસાન AI સલાહકાર** (Powered by Google Gemini 3.8 Flash).

હું તમને નીચેની બાબતોમાં સીધી મદદ કરી શકું છું:
• 🚜 **ટ્રેક્ટર અને રોટાવેટર**: તમારી જમીન મુજબ યોગ્ય HP અને બ્લેડ સાઇઝ
• ☀️ **PM-KUSUM સોલાર પંપ**: ૬૦% સબસિડી અને બોરવેલ મુજબ યોગ્ય ક્ષમતા (3HP / 5HP / 7.5HP)
• 💧 **ટપક સિંચાઈ (Drip Irrigation)**: GGRC ૭૦% સબસિડી અને ગોઠવણ
• 🌿 **ઓર્ગેનિક રોગ-જીવાત નિયંત્રણ**: લીંબોળી તેલ, ટ્રાઈકોડર્મા અને ફેરોમોન ટ્રેપ
• 🌾 **પાક લણણી અને બજાર ભાવ**: લસણ, જીરું, મગફળી અને કપાસના સારા ભાવ મેળવવાની પદ્ધતિ

નીચે આપેલા સૂચવેલા પ્રશ્નોમાંથી પસંદ કરો અથવા તમારો પોતાનો પ્રશ્ન લખીને પૂછો!`
            : language === 'hi'
            ? `🙏 **नमस्ते किसान साथी!** मैं हूँ आपका **खेतसेतु किसान AI सलाहकार** (Powered by Google Gemini 3.8 Flash).

मैं आपकी खेती और उपकरणों से जुड़े हर सवाल में सहायता कर सकता हूँ:
• 🚜 **ट्रैक्टर व रोटावेटर**: आपकी जमीन अनुसार सही HP और ब्लेड का चुनाव
• ☀️ **कुसुम सोलर पंप (PM-KUSUM)**: 60% सरकारी सब्सिडी और सही क्षमता
• 💧 **ड्रिप सिंचाई**: ड्रिप सब्सिडी और फसल अनुरूप योजना
• 🌿 **जैविक कीट व रोग नियंत्रण**: नीम तेल, ट्राइकोडर्मा और प्राकृतिक उपचार
• 🌾 **फसल कटाई व मंडी बिक्री**: लहसुन, जीरा, मूंगफली और कपास के उत्तम भाव

नीचे दिए गए सुझावों में से चुनें या अपना सवाल टाइप करें!`
            : `🙏 **Welcome Farmer Friend!** I am your **KhetSetu Kisan AI Advisory** assistant, powered live by **Google Gemini 3.8 Flash**.

Ask me anything about modern farming and machinery:
• 🚜 **Tractor & Rotavator Sizing**: Best HP and blade specs for your acreage & soil
• ☀️ **Solar Water Pumps (PM-KUSUM)**: 60% subsidy breakdown & HP selection
• 💧 **Drip Irrigation Setup**: Subsidies (GGRC) & water management
• 🌿 **Organic Pest Management**: Neem oil, Trichoderma & natural bio-controls
• 🌾 **Optimal Harvest Timing**: Maximize Grade A mandi prices for Garlic, Cumin, Groundnut & Cotton

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

  // Sync chat history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // ignore
    }
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Pure Live AI Call using Gemini with automatic fallback
  const callGeminiAI = async (userText, chatHistory) => {
    // 1. Prepare multi-turn conversation context
    const recentHistory = chatHistory.slice(-8);

    // 2. First attempt via Backend Service
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
      console.warn('Backend proxy unavailable, calling Gemini API directly:', backendError?.message);
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
      console.error('Kisan AI Generation Error:', err);
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
            ? 'ચેટ રીસેટ થઈ ગઈ છે. ખેતી સાધનો, સોલાર પંપ કે પાક રોગ-જીવાત અંગે નવો પ્રશ્ન પૂછો!'
            : activeLang === 'hi'
            ? 'चैट रीसेट हो गई है। उपकरण, सोलर पंप या फसल सलाह पर नया प्रश्न पूछें!'
            : 'Conversation reset. Ask any question about tractors, solar pumps, drip irrigation, or subsidies!',
        model: GEMINI_MODEL,
        time: new Date().toISOString(),
      },
    ];
    setMessages(welcome);
    localStorage.removeItem(STORAGE_KEY);
    toast.info('Chat cleared.');
  };

  const formatTime = (isoString) => {
    try {
      return new Date(isoString).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

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
            onClick={() => navigate('/seller')}
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
            {/* Green glowing online dot */}
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
                  ? 'ખેતસેતુ કિસાન AI સલાહકાર'
                  : activeLang === 'hi'
                  ? 'खेतसेतु किसान AI सलाहकार'
                  : 'KhetSetu Kisan AI Advisory'}
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
                ? '૨૪×૭ ખેતી ઓજારો, સિંચાઈ અને સબસિડી સહાયક'
                : activeLang === 'hi'
                ? '24×7 कृषि उपकरण, सिंचाई व सब्सिडी सहायक'
                : '24×7 Intelligent Agronomist & Machinery Guidance'}
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
                  justifyContent: isUser ? 'flex-end' : 'flex-start',
                  gap: 1.5,
                  alignItems: 'flex-start',
                  width: '100%',
                }}
              >
                {!isUser && (
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: '#2563EB',
                      color: '#FFFFFF',
                      boxShadow: '0 2px 6px rgba(37,99,235,0.25)',
                      flexShrink: 0,
                    }}
                  >
                    <MdSmartToy size={20} />
                  </Avatar>
                )}

                {/* Farmer Message Bubble (High Contrast Black Text) */}
                {isUser ? (
                  <Box
                    sx={{
                      maxWidth: { xs: '88%', sm: '78%', md: '68%' },
                      p: 2,
                      borderRadius: '18px 18px 4px 18px',
                      bgcolor: '#F1F5F9', // Crisp soft background
                      border: '1.5px solid #CBD5E1', // Visible border
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 800,
                          color: '#475569',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          fontSize: '0.68rem',
                        }}
                      >
                        🌾 {activeLang === 'gu' ? 'તમે (ખેડૂત)' : activeLang === 'hi' ? 'आप (किसान)' : 'You (Farmer)'}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body1"
                      sx={{
                        color: '#000000', // Deep black as explicitly requested!
                        fontWeight: 600,
                        fontSize: '0.98rem',
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {msg.text}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        mt: 0.75,
                        textAlign: 'right',
                        color: '#64748B',
                        fontSize: '0.7rem',
                      }}
                    >
                      {formatTime(msg.time)}
                    </Typography>
                  </Box>
                ) : (
                  /* AI Message Bubble (Structured Markdown & Formatting) */
                  <Box
                    sx={{
                      flex: 1,
                      maxWidth: { xs: '100%', sm: '94%', md: '92%' },
                      p: { xs: 2, sm: 2.5 },
                      borderRadius: '4px 18px 18px 18px',
                      bgcolor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 1.25,
                        pb: 1,
                        borderBottom: '1px solid #F1F5F9',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.75rem' }}>
                          🤖 KhetSetu Kisan AI
                        </Typography>
                        <Chip
                          label="⚡ Gemini 3.8 Flash"
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            bgcolor: '#EFF6FF',
                            color: '#2563EB',
                            border: '1px solid #BFDBFE',
                          }}
                        />
                      </Box>
                      <Tooltip title="Copy Advice">
                        <IconButton
                          size="small"
                          onClick={() => handleCopyText(msg.id, msg.text)}
                          sx={{ color: '#94A3B8', p: 0.5, '&:hover': { color: '#0F172A' } }}
                        >
                          {copiedId === msg.id ? <MdCheck size={16} color="#16A34A" /> : <MdContentCopy size={16} />}
                        </IconButton>
                      </Tooltip>
                    </Box>

                    {/* Markdown Formatted AI Advice */}
                    <Box
                      sx={{
                        color: '#0F172A',
                        fontSize: '0.95rem',
                        lineHeight: 1.7,
                        wordBreak: 'break-word',
                      }}
                    >
                      <ReactMarkdown
                        components={{
                          h1: ({ children }) => (
                            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mt: 1.5, mb: 0.75 }}>
                              {children}
                            </Typography>
                          ),
                          h2: ({ children }) => (
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight: 800,
                                color: '#1E293B',
                                mt: 1.5,
                                mb: 0.75,
                                borderBottom: '1px solid #F1F5F9',
                                pb: 0.4,
                              }}
                            >
                              {children}
                            </Typography>
                          ),
                          h3: ({ children }) => (
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 800, color: '#2563EB', mt: 1.25, mb: 0.5, fontSize: '0.98rem' }}
                            >
                              {children}
                            </Typography>
                          ),
                          p: ({ children }) => (
                            <Typography
                              variant="body2"
                              sx={{ color: '#1E293B', mb: 1, fontSize: '0.94rem', lineHeight: 1.7 }}
                            >
                              {children}
                            </Typography>
                          ),
                          ul: ({ children }) => (
                            <Box component="ul" sx={{ pl: 2.5, my: 0.75, '& li': { mb: 0.5, color: '#1E293B' } }}>
                              {children}
                            </Box>
                          ),
                          ol: ({ children }) => (
                            <Box component="ol" sx={{ pl: 2.5, my: 0.75, '& li': { mb: 0.5, color: '#1E293B' } }}>
                              {children}
                            </Box>
                          ),
                          li: ({ children }) => (
                            <Typography component="li" variant="body2" sx={{ color: '#1E293B', fontSize: '0.93rem', lineHeight: 1.65 }}>
                              {children}
                            </Typography>
                          ),
                          strong: ({ children }) => (
                            <Box component="strong" sx={{ fontWeight: 800, color: '#0F172A' }}>
                              {children}
                            </Box>
                          ),
                          hr: () => <Divider sx={{ my: 1.5, borderColor: '#E2E8F0' }} />,
                          table: ({ children }) => (
                            <Box sx={{ overflowX: 'auto', my: 1.5 }}>
                              <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.88rem' }}>{children}</table>
                            </Box>
                          ),
                          th: ({ children }) => (
                            <th style={{ border: '1px solid #CBD5E1', padding: '6px 12px', background: '#F1F5F9', fontWeight: 700 }}>
                              {children}
                            </th>
                          ),
                          td: ({ children }) => (
                            <td style={{ border: '1px solid #E2E8F0', padding: '6px 12px' }}>{children}</td>
                          ),
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    </Box>

                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        mt: 1.25,
                        textAlign: 'left',
                        color: '#94A3B8',
                        fontSize: '0.7rem',
                      }}
                    >
                      {formatTime(msg.time)}
                    </Typography>
                  </Box>
                )}
              </Box>
            );
          })}

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
                    ? 'કિસાન AI વિશ્લેષણ કરી રહ્યું છે...'
                    : activeLang === 'hi'
                    ? 'किसान AI विश्लेषण कर रहा है...'
                    : 'Kisan AI is analyzing your farm inquiry...'}
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
                ? 'પાક, ખાતર, બિયારણ, સિંચાઈ, રોગ-જીવાત કે સરકારી સહાય અંગે પૂછો... (Enter દબાવો)'
                : activeLang === 'hi'
                ? 'फसल, खाद, बीज, सिंचाई, कीट नियंत्रण या सरकारी योजना पर पूछें... (Enter दबाएं)'
                : 'Ask Kisan AI about tractor sizing, solar pumps, drip irrigation, pest control, or subsidies...'
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
