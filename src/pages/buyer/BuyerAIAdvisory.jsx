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
} from 'react-icons/md';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAskAIAdvisoryMutation } from '../../Api/Api';
import { toast } from 'react-toastify';

const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-3.8-flash';
const STORAGE_KEY_PREFIX = 'khetsetu_buyer_ai_advisory_chat_history_v2';

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
  const storageKey = `${STORAGE_KEY_PREFIX}_${language || 'en'}`;

  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}_${language || 'en'}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const cleaned = parsed.filter(
            (m) => m?.text && m.text !== 'connectionError' && m.model !== 'connection-error'
          );
          if (cleaned.length > 0) return cleaned;
        }
      }
    } catch {
      // ignore
    }

    return [
      {
        id: 'msg-welcome-buyer',
        sender: 'ai',
        text: t(
          'aiAdvisory.buyerWelcome',
          'Namaste! I am your **KhetSetu Mandi & Procurement AI Advisor**.\n\nI can assist you with:\n* **Produce Quality & Grading**: Grade A/B/C parameters, moisture limits, and testing methods.\n* **APMC Mandi Intelligence**: Prevailing modal rates, arrivals, and price cycles in Gujarat and across India.\n* **100% Escrow Protection**: Safe bulk buying, quality verification, and dispute resolution.\n* **Bulk RFQs & Logistics**: Minimum order quantities, packaging, and delivery tracking.\n\nHow can I help your procurement today?'
        ),
        model: GEMINI_MODEL,
        time: new Date().toISOString(),
      },
    ];
  });

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const chatBottomRef = useRef(null);
  const previousLanguageRef = useRef(language);

  // Switch chat language in real-time when global language changes
  useEffect(() => {
    if (previousLanguageRef.current !== language) {
      previousLanguageRef.current = language;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const cleaned = parsed.filter(
              (m) => m?.text && m.text !== 'connectionError' && m.model !== 'connection-error'
            );
            if (cleaned.length > 0) {
              setMessages(cleaned);
              return;
            }
          }
        } catch {
          // ignore
        }
      }
      setMessages([
        {
          id: `msg-welcome-buyer-${language}`,
          sender: 'ai',
          text: t(
            'aiAdvisory.buyerWelcome',
            'Namaste! I am your **KhetSetu Mandi & Procurement AI Advisor**.\n\nI can assist you with:\n* **Produce Quality & Grading**: Grade A/B/C parameters, moisture limits, and testing methods.\n* **APMC Mandi Intelligence**: Prevailing modal rates, arrivals, and price cycles in Gujarat and across India.\n* **100% Escrow Protection**: Safe bulk buying, quality verification, and dispute resolution.\n* **Bulk RFQs & Logistics**: Minimum order quantities, packaging, and delivery tracking.\n\nHow can I help your procurement today?'
          ),
          model: GEMINI_MODEL,
          time: new Date().toISOString(),
        },
      ]);
    }
  }, [language, storageKey, t]);

  // Persist conversation
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(messages));
      } catch {
        // ignore
      }
    }
  }, [messages, storageKey]);

  // Auto-scroll
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isTyping) return;

    const userMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text: query,
      time: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setIsTyping(true);

    try {
      const historyPayload = messages.slice(-10).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));

      const result = await askAIMutation.mutateAsync({
        message: query,
        prompt: query,
        context: 'buyer_procurement_and_mandi_quality',
        history: historyPayload,
        systemInstruction: SYSTEM_INSTRUCTION,
        language: language || 'en',
      });

      const responseText =
        result?.answer ||
        result?.data?.answer ||
        result?.text ||
        result?.message ||
        (typeof result === 'string' ? result : '');

      const aiMessage = {
        id: `msg-${Date.now()}-ai`,
        sender: 'ai',
        text:
          responseText ||
          t(
            'aiAdvisory.connectionError',
            '⚠️ Unable to connect to the AI advisory service at the moment. Please try again.'
          ),
        model: result?.model || GEMINI_MODEL,
        time: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error('Buyer AI Generation Error:', err);
      const errorMessage = {
        id: `msg-${Date.now()}-ai-error`,
        sender: 'ai',
        text: t(
          'aiAdvisory.connectionError',
          '⚠️ Unable to connect to the AI advisory service at the moment. Please check your connection and retry.'
        ),
        model: 'connection-error',
        time: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      toast.error(t('errors.SOMETHING_WENT_WRONG', 'AI connection issue. Please retry.'));
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
    toast.success(t('aiAdvisory.copiedAdvice', 'Copied advice to clipboard!'));
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    const welcome = [
      {
        id: `msg-${Date.now()}-ai`,
        sender: 'ai',
        text: t(
          'aiAdvisory.buyerResetWelcome',
          'Chat history cleared. How can I assist your produce procurement or mandi price research today?'
        ),
        model: GEMINI_MODEL,
        time: new Date().toISOString(),
      },
    ];
    setMessages(welcome);
    localStorage.removeItem(storageKey);
    toast.info(t('aiAdvisory.chatCleared', 'Chat cleared.'));
  };

  const starterQuestions = [
    {
      label: t('aiAdvisory.buyerPrompt1Label', 'Garlic Quality & Moisture Standards'),
      query: t(
        'aiAdvisory.buyerPrompt1Query',
        'What are the Grade A quality standards and safe moisture limits for Gujarat Garlic-4?'
      ),
    },
    {
      label: t('aiAdvisory.buyerPrompt2Label', 'Unjha Cumin (Jeera) APMC Rates'),
      query: t(
        'aiAdvisory.buyerPrompt2Query',
        'Explain the prevailing modal price trends and export quality grading for Cumin (Jeera) in Unjha Mandi.'
      ),
    },
    {
      label: t('aiAdvisory.buyerPrompt3Label', 'How KhetSetu Escrow Protects Buyers'),
      query: t(
        'aiAdvisory.buyerPrompt3Query',
        'How does KhetSetu Escrow guarantee my payment safety when ordering 50 Quintals of Groundnut directly from a farmer?'
      ),
    },
    {
      label: t('aiAdvisory.buyerPrompt4Label', 'Cotton (Kapas) Staple Length & Grading'),
      query: t(
        'aiAdvisory.buyerPrompt4Query',
        'What are the standard grading parameters for Shankar-6 Cotton including staple length, micronaire, and moisture percentage?'
      ),
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
                {t('aiAdvisory.buyerTitle', 'Mandi AI & Produce Procurement Advisor')}
              </Typography>
              <Chip
                label={t('aiAdvisory.model', '⚡ Gemini 3.8 Flash')}
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
              {t(
                'aiAdvisory.buyerSubtitle',
                '24×7 AI guidance for crop quality grading, APMC mandi rates & bulk escrow purchasing'
              )}
            </Typography>
          </Box>
        </Box>

        {/* Right side controls: Reset chat */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={t('aiAdvisory.resetChat', 'Reset Chat')}>
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
              {t('aiAdvisory.reset', 'Reset')}
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
                      bgcolor: '#FFFFFF',
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
                      }}
                    >
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </Box>

                    {/* Copy action for AI responses */}
                    {!isUser && (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          mt: 1.5,
                          pt: 1,
                          borderTop: '1px solid #F1F5F9',
                        }}
                      >
                        <Typography variant="caption" color="#94A3B8" fontWeight={500}>
                          {t('aiAdvisory.buyerAssistantName', '🤖 Mandi AI Advisor')}
                        </Typography>
                        <Tooltip title={copiedId === msg.id ? t('aiAdvisory.copiedAdvice', 'Copied!') : t('aiAdvisory.copyAdvice', 'Copy Advice')}>
                          <IconButton
                            size="small"
                            onClick={() => handleCopyText(msg.id, msg.text)}
                            sx={{ color: copiedId === msg.id ? '#16A34A' : '#94A3B8' }}
                          >
                            {copiedId === msg.id ? <MdCheck size={16} /> : <MdContentCopy size={16} />}
                          </IconButton>
                        </Tooltip>
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
                💡 {t('aiAdvisory.commonInquiries', 'Common Procurement Questions')}
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
                  {t(
                    'aiAdvisory.buyerAnalyzing',
                    'Mandi AI is analyzing commodity standards and market intelligence...'
                  )}
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
            placeholder={t(
              'aiAdvisory.buyerPlaceholder',
              'Ask about crop quality grading, moisture limits, mandi rates, or bulk escrow buying...'
            )}
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isTyping}
            sx={{
              flex: 1,
              color: '#000000',
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
