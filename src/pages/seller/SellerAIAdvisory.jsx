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

const SYSTEM_INSTRUCTION = `You are "KhetSetu Kisan & Seller AI" (ખેતસેતુ કિસાન અને વિક્રેતા AI / खेतसेतु किसान एवं विक्रेता AI), an expert agronomy consultant, agricultural machinery specialist, and mandi trading & market intelligence assistant dedicated to Indian farmers and produce sellers (especially in Gujarat and across India).

Your Core Mission & Domain Knowledge:
1. Agricultural Equipment & Machinery (For Farmers):
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
4. Crop Selling, Quality Grading & Mandi Price Strategy (For Sellers):
   - Garlic (Gujarat Garlic-4), Cumin (Jeera), Groundnut (GG-20), Cotton (Kapas), Wheat, Mustard, Castor, Onion.
   - Grade A standards: Large uniform bulb/pod size, foreign matter <1%, moisture content <8% through shade curing (8–10 days for garlic).
   - Mandi Price Discovery: APMC arrivals, modal rates, optimal selling windows to prevent distress sales.
   - Escrow & Safe Trade: How KhetSetu escrow protects seller payments, transparent 2.5% platform fee, weighment slip verification, and fast bank payouts upon delivery.
   - Negotiating Buyer Quotes & RFQs: Responding to bulk buyer orders, setting realistic minimum order quantities (MOQ).
5. Government Subsidies & Portals:
   - i-Khedut portal Gujarat (ikhedut.gujarat.gov.in), SMAM mechanization subsidies, PM-KUSUM, Kisan Credit Card (KCC).

Language Guidelines:
- If user writes in Gujarati or asks in Gujarati, reply in authentic, polite Gujarati (ગુજરાતી).
- If user writes in Hindi, reply in clear, respectful Hindi (हिन्दी).
- If user writes in English, reply in English.

Formatting Guidelines:
- Use clean Markdown with headers (###), bold text (**bold**), bullet points (*), and numbers.
- Use friendly emojis (🚜, ☀️, 💧, 🌾, 🌿, 💡, 💰, 📦).
- Give practical, direct numbers (HP, subsidy %, spray dosage, seed rate, moisture %, price ranges).`;

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

    return [];
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

  // Live AI call through the protected backend advisory service.
  const callGeminiAI = async (userText, chatHistory) => {
    // 1. Prepare multi-turn conversation context
    const recentHistory = chatHistory.slice(-8);

    // 2. First attempt via Backend Service
    try {
      const res = await askAIMutation.mutateAsync({
        message: userText,
        language: activeLang,
        systemInstruction: SYSTEM_INSTRUCTION,
        maxOutputTokens: 4096,
        responseInstruction:
          'Return a complete, self-contained answer. Do not stop mid-sentence or mid-section. If the topic is broad, prioritize the most useful actionable points and finish with a concise summary.',
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
      console.warn('AI advisory service request failed:', backendError?.message);
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
      toast.error(err?.message || 'AI connection issue. Please retry.');
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
    setMessages([]);
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
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/seller'))}
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
                  ? 'ખેતસેતુ કિસાન અને વિક્રેતા AI સલાહકાર'
                  : activeLang === 'hi'
                  ? 'खेतसेतु किसान एवं विक्रेता AI सलाहकार'
                  : 'KhetSetu Kisan & Seller AI Advisory'}
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
                ? '૨૪×૭ ખેતી ઓજારો, પાક ઉત્પાદન, મંડી ભાવો અને વેચાણ સહાયક'
                : activeLang === 'hi'
                ? '24×7 कृषि उपकरण, फसल उत्पादन, मंडी भाव व व्यापार सहायक'
                : '24×7 Intelligent Agronomist, Farm Machinery & Mandi Trade Guidance'}
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
                        🌾 {activeLang === 'gu' ? 'તમે (ખેડૂત / વિક્રેતા)' : activeLang === 'hi' ? 'आप (किसान / विक्रेता)' : 'You (Farmer / Seller)'}
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
                ? 'પાક, ઓજારો, બિયારણ, ખાતર, સિંચાઈ, મંડી ભાવો, ગ્રેડિંગ કે વેચાણ અંગે પૂછો... (Enter દબાવો)'
                : activeLang === 'hi'
                ? 'फसल, कृषि यंत्र, बीज, खाद, सिंचाई, मंडी भाव, ग्रेडिंग या बिक्री पर पूछें... (Enter दबाएं)'
                : 'Ask about tractor sizing, solar pumps, drip irrigation, pest control, mandi rates, grading, or selling...'
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
