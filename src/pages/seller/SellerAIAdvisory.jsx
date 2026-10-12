import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
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
  MdAgriculture,
  MdContentCopy,
  MdDeleteOutline,
  MdHelpOutline,
  MdLightbulb,
  MdArrowForward,
  MdCheck,
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import PageHeader from '../../common/custom/PageHeader';
import { useAskAIAdvisoryMutation } from '../../Api/Api';
import { toast } from 'react-toastify';

const STORAGE_KEY = 'khetsetu_ai_advisory_chat_history';

// Knowledge base queries and responses
const KNOWLEDGE_BASE = [
  {
    keywords: ['tractor', 'rotavator', 'machinery', 'hp', 'equipment', 'implement'],
    response: {
      en: `🚜 **Equipment Recommendation: Tractors & Soil Preparation Implements**

1. **Recommended Tractor Capacity**:
   • **Small/Medium Farms (3–7 Acres)**: 35 HP to 45 HP (e.g., Mahindra 275 DI, Swaraj 735 FE, Sonalika DI 35). Excellent fuel economy for rotavator and trolley haulage.
   • **Large Farms (> 8 Acres / Commercial)**: 45 HP to 55 HP with Dual Clutch & Power Steering for heavy 6-foot rotavator, disc harrow, and laser leveler.

2. **Rotavator Recommendation**:
   • 42-blade to 48-blade rotavator (5 to 6 feet width) matching 40+ HP tractor PTO speed (540 RPM).
   • Top trusted brands: Shaktiman, Fieldking, Swan Agro.
   • Ensures fine seedbed preparation in single pass, saving up to 35% diesel compared to traditional cultivators.

3. **Government Subsidy (SMAM & i-Khedut Gujarat)**:
   • 40% subsidy for General category (up to ₹45,000–₹50,000 on rotavators).
   • 50% subsidy for SC/ST and Small/Marginal farmers.
   • Apply online at **ikhedut.gujarat.gov.in** during seasonal approval windows.`,
      gu: `🚜 **ખેતી ઓજારો અને ટ્રેક્ટર ભલામણ (ટ્રેક્ટર અને રોટાવેટર)**

૧. **જમીન મુજબ યોગ્ય ટ્રેક્ટર (HP)**:
   • **૩ થી ૭ એકર માટે**: ૩૫ થી ૪૫ HP (દા.ત. મહિન્દ્રા ૨૭૫ DI, સ્વરાજ ૭૩૫, સોનાલીકા ૩૫). ડીઝલનો ઓછો વપરાશ અને ઉત્તમ પાવર.
   • **૮ એકરથી વધુ જમીન માટે**: ૪૫ થી ૫૫ HP (ડ્યુઅલ ક્લચ) મોટા ૬-ફૂટ રોટાવેટર અને લેસર લેવલર માટે.

૨. **રોટાવેટરની પસંદગી**:
   • ૪૨ થી ૪૮ બ્લેડ (૫ થી ૬ ફૂટ પહોળાઈ) રોટાવેટર.
   • મુખ્ય ભરોસાપાત્ર બ્રાન્ડ: શક્તિમાન (Shaktiman), ફિલ્ડકિંગ (Fieldking).
   • એક જ ફેરામાં ઉત્તમ ઢેફા ભાંગીને જમીન વાવણી લાયક બનાવે છે, ૩૫% ડીઝલ બચાવે છે.

૩. **સરકારી સહાય (i-ખેડૂત પોર્ટલ સબસિડી)**:
   • સામાન્ય ખેડૂતો માટે ૪૦% સબસિડી (રૂ. ૪૦,૦૦૦ થી ૪૫,૦૦૦ સુધી).
   • નાના, સીમાંત અને SC/ST ખેડૂતો માટે ૫૦% સબસિડી.
   • **ikhedut.gujarat.gov.in** પોર્ટલ પર અરજી કરી શકાય છે.`,
      hi: `🚜 **कृषि उपकरण अनुशंसा: ट्रैक्टर और रोटावेटर**

1. **ट्रैक्टर क्षमता (HP) का चुनाव**:
   • **3 से 7 एकड़ के लिए**: 35 HP से 45 HP (महिंद्रा 275 DI, स्वराज 735 FE, सोनालीका)। कम डीजल खपत और बढ़िया ताकत।
   • **8 एकड़ से अधिक के लिए**: 45 HP से 55 HP बड़े 6-फीट रोटावेटर और लेजर लेवलर हेतु।

2. **रोटावेटर अनुशंसा**:
   • 42 से 48 ब्लेड (5 से 6 फीट चौड़ाई)।
   • प्रमुख ब्रांड: शक्तिमान, फील्डकिंग।
   • एक ही बार में मिट्टी भुरभुरी बनाता है और 35% तक डीजल बचाता है।

3. **सरकारी सब्सिडी (SMAM योजना)**:
   • सामान्य वर्ग: 40% तक सब्सिडी।
   • छोटे, सीमांत और आरक्षित वर्ग: 50% तक सब्सिडी।`,
    },
  },
  {
    keywords: ['solar', 'pump', 'kusum', 'irrigation', 'water', 'borewell', 'electricity'],
    response: {
      en: `☀️ **Solar Water Pump Recommendation (PM-KUSUM Yojana)**

1. **Pump Size Sizing**:
   • **Water Table 50–120 ft**: 3 HP to 5 HP DC Submersible solar pump (covers 4 to 8 acres easily).
   • **Water Table 120–250 ft**: 7.5 HP Submersible solar pump with high-efficiency MPPT solar controller.

2. **Financial Breakdown & Subsidy**:
   • **Central Govt Subsidy**: 30% of benchmark cost.
   • **State Govt Subsidy (Gujarat / PM-KUSUM Component B)**: 30% to 35%.
   • **Farmer Share**: Only **10% to 15%** of capital cost (bank loans cover the remaining).
   • Eliminates high diesel generator costs and removes reliance on night-time agricultural power grids.

3. **Key Advice**:
   • Pair solar pumps directly with drip irrigation to double water efficiency.
   • Regular cleaning of solar panels once a week increases pump flow rate by 15–20%.`,
      gu: `☀️ **સોલાર વોટર પંપ ભલામણ (પીએમ-કુસુમ યોજના)**

૧. **પંપની સાઈઝ પસંદગી**:
   • **૫૦ થી ૧૨૦ ફૂટ ઊંડાઈ માટે**: ૩ થી ૫ HP સોલાર સબમર્સિબલ પંપ (૪ થી ૭ એકર માટે ઉત્તમ).
   • **૧૨૦ થી ૨૫૦ ફૂટ ઊંડાઈ માટે**: ૭.૫ HP સબમર્સિબલ પંપ.

૨. **સરકારી સબસિડી અને ખેડૂત ખર્ચ**:
   • કેન્દ્ર સરકાર સબસિડી: ૩૦%
   • રાજ્ય સરકાર (ગુજરાત ઊર્જા વિકાસ): ૩૦% થી ૩૫%
   • **ખેડૂતનો હિસ્સો**: ફક્ત ૧૦% થી ૧૫% રકમ ભરવાની રહે છે.
   • રાત્રે વીજળી આવવાની ઝંઝટ અને ડીઝલ એન્જિનના ખર્ચમાંથી સંપૂર્ણ મુક્તિ.

૩. **મહત્વની સલાહ**:
   • સોલાર પંપ સાથે ટપક પદ્ધતિ જોડવાથી પાણીનો બગાડ અટકે છે અને બમણી જમીન પીવડાવી શકાય છે.`,
      hi: `☀️ **सोलर वाटर पंप अनुशंसा (पीएम-कुसुम योजना)**

1. **पंप की क्षमता**:
   • **50–120 फीट गहराई**: 3 HP से 5 HP सोलर सबमर्सिबल पंप (4 से 8 एकड़ हेतु)।
   • **120–250 फीट गहराई**: 7.5 HP सोलर पंप।

2. **सब्सिडी विवरण**:
   • केंद्र व राज्य सरकार द्वारा 60% से 70% तक सब्सिडी।
   • किसान को मात्र **10% से 15%** लागत वहन करनी होती है।
   • दिन के समय बिना बिजली बिल या डीजल के मुफ्त सिंचाई।`,
    },
  },
  {
    keywords: ['drip', 'sprinkler', 'tapak', 'water saving', 'micro irrigation', 'glpc', 'gsdc'],
    response: {
      en: `💧 **Modern Farming Technique: Drip & Micro-Irrigation Setup**

1. **Suitable Crops in Gujarat**:
   • **Row Crops**: Cotton (કપાસ), Groundnut (મગફળી), Castor (દિવેલા) — 16mm inline lateral pipes with 40cm emitter spacing.
   • **Spices & Vegetables**: Cumin (જીરું), Garlic (લસણ), Chilli, Onion — 12mm or 16mm drip lines with 2.0 LPH discharge emitters.

2. **Yield & Resource Advantages**:
   • Saves **45% to 60% water** compared to traditional flood irrigation.
   • Reduces weed growth by 70% because only root zones receive moisture.
   • Enables **Fertigation** (soluble liquid fertilizer via venturi injector), improving fertilizer absorption by 40%.

3. **Gujarat Green Revolution Company (GGRC) Subsidy**:
   • Up to **70% to 85% financial assistance** for small & marginal farmers in Gujarat.
   • 50% assistance for general larger landholders.
   • Apply directly via GGRC or authorized dealers (Jain, Netafim, Captain Polyplast).`,
      gu: `💧 **આધુનિક ખેતી પદ્ધતિ: ટપક સિંચાઈ (Drip Irrigation)**

૧. **મુખ્ય પાકો માટે સેટઅપ**:
   • **કપાસ અને મગફળી**: ૧૬ mm ઈનલાઈન પાઇપ (૪૦ સેમી ડ્રીપર અંતર).
   • **જીરું અને લસણ**: ૧૨ mm અથવા ૧૬ mm માઈક્રો ડ્રીપ લાઈન (૨ લીટર પ્રતિ કલાક ડ્રિપર).

૨. **ખેડૂતને થતા મોટા ફાયદા**:
   • ૫૦% થી ૬૦% પાણીની સીધી બચત.
   • નીંદણ ૭૦% ઘટી જાય છે કારણ કે માત્ર મૂળિયા પાસે જ પાણી મળે છે.
   • **વેન્ચ્યુરી દ્વારા ખાતર (ફર્ટિગેશન)** આપવાથી ખાતરનો ૪૦% વધુ ઉપયોગ થાય છે.

૩. **GGRC (ગુજરાત ગ્રીન રિવોલ્યુશન કંપની) સબસિડી**:
   • નાના અને સીમાંત ખેડૂતોને **૭૦% થી ૮૫% સુધી સહાય**.
   • મોટા ખેડૂતોને ૫૦% સહાય. જૈન ઇરિગેશન કે નેટાફિમ ડીલર દ્વારા અરજી કરી શકાય.`,
      hi: `💧 **ड्रिप सिंचाई (टपक पद्धति) अनुशंसा**

1. **फायदे**:
   • 50% से 60% पानी की बचत।
   • उर्वरक को सीधे जड़ों तक पहुंचाने की सुविधा (फर्टिगेशन)।
   • कपास, मूंगफली, लहसुन और जीरे में 30% अधिक पैदावार।

2. **सब्सिडी सहायता**:
   • लघु व सीमांत किसानों को 70% से 80% तक सरकारी अनुदान।`,
    },
  },
  {
    keywords: ['pest', 'insect', 'organic', 'fungicide', 'whitefly', 'bollworm', 'yellow', 'disease', 'neem'],
    response: {
      en: `🌿 **Integrated Pest Management & Organic Plant Protection**

1. **Whitefly & Sucking Pests (Cotton & Groundnut)**:
   • **Natural Solution**: Neem Oil (Azadirachtin 10,000 PPM) @ 3 ml per Liter of water + 1 ml liquid soap.
   • **Sticky Traps**: Install 8 yellow and 8 blue sticky traps per acre at crop canopy level.
   • **Biological Control**: Spray *Verticillium lecanii* or *Beauveria bassiana* @ 5 grams/Liter in evening hours.

2. **Bollworm / Pod Borer Prevention**:
   • Install 4 pheromone traps per acre to monitor moth populations early.
   • Spray NPV (Nuclear Polyhedrosis Virus) or Bacillus thuringiensis (Bt) @ 2 ml/Liter during initial larval hatching.

3. **Soil Fungal Diseases (Wilt & Root Rot)**:
   • Treat seeds with **Trichoderma viride** (10 g/kg of seeds) before sowing.
   • Avoid excess flood irrigation during heavy vegetative stages.`,
      gu: `🌿 **રોગ-જીવાત નિયંત્રણ અને દેશી ઉપચાર (IPM પદ્ધતિ)**

૧. **ચૂસિયા પ્રકારની જીવાત (સફેદ માખી, થ્રીપ્સ, તડતડિયા)**:
   • **કુદરતી ઉપાય**: લીંબોળીનું તેલ (Neem Oil ૧૦,૦૦૦ PPM) ૧૫ લિટર પંપમાં ૪૫-૫૦ ml + સહેજ સાબુનું ફીણ.
   • **પીળા અને વાદળી ચીકણા ટ્રેપ**: એકરે ૮ પીળા અને ૮ વાદળી ટ્રેપ લગાવવાથી ૬૦% માખીઓ કુદરતી રીતે નાશ પામે છે.
   • **જૈવિક ફૂગ**: બ્યુવેરિયા બાસિયાના (Beauveria bassiana) ૫૦ ગ્રામ/પંપ સાંજના સમયે છંટકાવ કરવો.

૨. **ગુલાબી ઈયળ અને લશ્કરી ઈયળ નિયંત્રણ**:
   • એકરમાં ૪ ફેરોમોન ટ્રેપ લગાવવા.
   • ઈયળો નાની હોય ત્યારે લીમડાના અર્ક અથવા ટ્રાઈકોડર્માનો ઉપયોગ કરવો.

૩. **મૂળનો સડો અને સુકારો અટકાવવા**:
   • વાવણી પહેલા ટ્રાઈકોડર્મા વિરીડી (૧૦ ગ્રામ/કિલો બીજ) પટ આપવો.`,
      hi: `🌿 **प्राकृतिक कीट व रोग प्रबंधन**

1. **सफेद मक्खी और थ्रिप्स**:
   • नीम तेल (10,000 PPM) 3 ml प्रति लीटर पानी में मिलाकर छिड़काव करें।
   • प्रति एकड़ 8 पीले व नीले चिपचिपे ट्रैप लगाएं।

2. **उकठा व जड़ सड़न**:
   • बुवाई से पहले ट्राइकोडर्मा विरिडी से बीज उपचार करें।`,
    },
  },
  {
    keywords: ['garlic', 'cumin', 'cotton', 'groundnut', 'mandi', 'sell', 'price', 'timing', 'harvest'],
    response: {
      en: `📈 **Harvest Timing & Mandi Selling Strategy**

1. **Groundnut (Mungfali / GG-20)**:
   • **Harvest Signal**: 75–80% of inner pod shells turn blackish-brown.
   • **Post-Harvest Drying**: Sun-dry pods for 5–7 days until moisture is below 8%. Pods stored with < 8% moisture fetch premium Grade A prices on KhetSetu without mould deductions.

2. **Garlic (Gujarat Garlic-4)**:
   • **Harvest Timing**: When 60–70% of upper green foliage lodges (bends down) and dries.
   • **Curing**: Cure with leaves attached under shade for 8–10 days before trimming roots and stems.
   • **Price Tip**: Avoid flooding mandi in the first 2 weeks of peak harvest. Storing well-cured garlic for 45–60 days typically yields 25% to 40% higher modal rates.

3. **Cumin (Jeera)**:
   • Harvest in early morning to prevent seed shattering. Clean via grader to ensure zero dust (< 1% foreign matter) to qualify for export-grade bulk buyer tenders.`,
      gu: `📈 **લસણ, જીરું અને મગફળી પાક લણણી અને બજાર ભાવ વ્યૂહરચના**

૧. **મગફળી (GG-20)**:
   • કાપણી સમય: ૭૫-૮૦% ડોડવાના અંદરના ફોતરા કાળા-ભૂરા રંગના થાય ત્યારે જ કાઢવી.
   • સુકવણી: ડોડવામાં ૮% થી ઓછો ભેજ રહે ત્યાં સુધી ૫-૭ દિવસ તડકામાં સૂકવવી. ઓછા ભેજવાળી મગફળી પર ખેતસેતુ પર પ્રીમિયમ ભાવ મળે છે.

૨. **લસણ (GG-4)**:
   • છોડના ૬૦-૭૦% પાન પીળા પડીને ઢળી પડે ત્યારે કાઢવું.
   • ખેતરમાં જ ૮-૧૦ દિવસ છાંયડે પકવવું (Curing). મૂળિયા કાપી સાફ રાખવાથી બગાડ થતો નથી.
   • લણણી સમયે તરત વેચવાને બદલે ૪૫ થી ૬૦ દિવસ સંગ્રહ કરવાથી ૨૫% થી ૪૦% ઊંચો ભાવ મળે છે.

૩. **જીરું (Jeera)**:
   • વહેલી સવારે ઝાકળ હોય ત્યારે જ લણણી કરવી જેથી દાણા ખરે નહીં. ડસ્ટ વગરનું ગ્રેડિંગ કરેલું જીરું મોટા વેપારીઓ ઊંચા ભાવે ખરીદે છે.`,
      hi: `📈 **फसल कटाई व मंडी बिक्री रणनीति**

1. **लहसुन व जीरा**:
   • फसल पूरी पकने के बाद अच्छी तरह सुखाकर (8% से कम नमी) ही ग्रेडिंग करें।
   • पीक सीजन के तुरंत बाद बेचने पर 20% से 30% बेहतर भाव मिलते हैं।`,
    },
  },
];

export default function SellerAIAdvisory() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        id: 'msg-welcome',
        sender: 'ai',
        text:
          language === 'gu'
            ? 'નમસ્તે ખેડૂત મિત્ર! 🙏 હું છું તમારો ખેતસેતુ કિસાન AI સલાહકાર. ખેતીના સાધનો, ટ્રેક્ટર, સોલાર પંપ સબસિડી, ટપક પદ્ધતિ અથવા પાક રોગ-જીવાત અંગે કોઈ પણ પ્રશ્ન પૂછો!'
            : language === 'hi'
            ? 'नमस्ते किसान साथी! 🙏 मैं हूँ आपका खेतसेतु किसान AI सलाहकार। कृषि उपकरण, ट्रैक्टर, सोलर पंप सब्सिडी, टपक सिंचाई या फसल सुरक्षा पर कोई भी सवाल पूछें!'
            : 'Welcome Farmer Friend! 🙏 I am your KhetSetu Kisan AI Advisory Assistant. Ask me anything about farm machinery, tractor sizing, solar pumps, drip irrigation, pest remedies, or government subsidies!',
        time: new Date().toISOString(),
      },
    ];
  });

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const chatBottomRef = useRef(null);

  const askAIMutation = useAskAIAdvisoryMutation();
  const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-3.8-flash';

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // ignore
    }
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const promptStarters = [
    {
      title: t('farmer.promptTractor', 'Best Tractor & Rotavator for 5 Acres'),
      query: 'Which tractor HP and rotavator is best for a 5-acre farm in Gujarat?',
    },
    {
      title: t('farmer.promptSolar', 'Solar Pump PM-KUSUM Subsidy'),
      query: 'How to apply for solar water pump under PM-KUSUM yojana?',
    },
    {
      title: t('farmer.promptDrip', 'Drip Irrigation Setup for Groundnut'),
      query: 'What is the best drip irrigation setup and GGRC subsidy for Groundnut?',
    },
    {
      title: t('farmer.promptPest', 'Organic Pest Remedy for Cotton'),
      query: 'Natural organic remedy for whitefly and bollworm in cotton crop.',
    },
    {
      title: t('farmer.promptTiming', 'Garlic & Cumin Harvest Strategy'),
      query: 'When should I harvest and sell my Garlic and Cumin for best prices?',
    },
  ];

  const generateAnswer = (query) => {
    const qLower = query.toLowerCase();
    const currentLang = language === 'gu' ? 'gu' : language === 'hi' ? 'hi' : 'en';

    // Find best match in knowledge base
    let bestMatch = null;
    let highestScore = 0;

    for (const item of KNOWLEDGE_BASE) {
      let score = 0;
      for (const kw of item.keywords) {
        if (qLower.includes(kw)) score++;
      }
      if (score > highestScore) {
        highestScore = score;
        bestMatch = item;
      }
    }

    if (bestMatch && highestScore > 0) {
      return bestMatch.response[currentLang] || bestMatch.response.en;
    }

    // Default intelligent farming response
    if (currentLang === 'gu') {
      return `🌱 **કિસાન AI વિશ્લેષણ અને ભલામણ:**

આપના પ્રશ્ન **"${query}"** માટે નીચે મુજબ મહત્વપૂર્ણ સલાહ છે:

૧. **જમીન અને ભેજ ચકાસણી**: પાક વાવણી કે ઓજાર પસંદગી પહેલા જમીનમાં ઓર્ગેનિક કાર્બન અને ભેજનું પ્રમાણ તપાસવું હિતાવહ છે.
૨. **આધુનિક કૃષિ ઓજારો**: નાના અને મધ્યમ ખેતરો માટે ૩૫-૪૫ HP ટ્રેક્ટર સાથે ૫-ફૂટ રોટાવેટર સૌથી વધુ કિફાયતી રહે છે.
૩. **સરકારી સહાય (i-ખેડૂત)**: કોઈપણ યાંત્રિકીકરણ કે ટપક સિંચાઈ માટે ગુજરાત સરકારના i-khedut પોર્ટલ પર નોંધણી કરાવો જેથી ૪૦% થી ૫૦% સબસિડી મળી શકે.
૪. **બજાર સલાહ**: ખેતસેતુ મંડી રેટ્સ પેજ પરથી દૈનિક એપીએમસી ભાવ ચકાસીને પાકનું વેચાણ કરો.

વધુ માહિતી માટે નજીકના કૃષિ વિજ્ઞાન કેન્દ્ર (KVK) અથવા ખેતસેતુ હેલ્પલાઇન 1800-889-KHET પર સંપર્ક કરી શકો છો!`;
    }

    if (currentLang === 'hi') {
      return `🌱 **किसान AI विश्लेषण व अनुशंसा:**

आपके प्रश्न **"${query}"** पर मुख्य कृषि सलाह:

1. **उपकरण व तकनीक**: 5 से 8 एकड़ भूमि के लिए 40 HP ट्रैक्टर और रोटावेटर उत्तम संतुलन प्रदान करता है।
2. **जल प्रबंधन**: परंपरागत सिंचाई के स्थान पर ड्रिप पद्धति अपनाएं जिससे 50% पानी की बचत होगी।
3. **सरकारी योजनाएं**: कृषि यंत्रीकरण (SMAM) एवं कुसुम योजना के तहत 40% से 60% सब्सिडी उपलब्ध है।
4. **गुणवत्ता युक्त पैदावार**: फसल को 8% से कम नमी पर ग्रेडिंग करके ही बाजार में लाएं।`;
    }

    return `🌱 **Kisan AI Farm Analysis & Recommendation:**

Regarding your inquiry on **"${query}"**:

1. **Equipment & Machinery**: For small to medium farms (3–7 acres), a 35–45 HP tractor coupled with a 5-foot rotary tiller offers maximum fuel economy and low maintenance.
2. **Water & Soil Technique**: Implement inline drip irrigation with venturi injectors to save up to 55% water and improve root nutrient absorption.
3. **Government Subsidies**: Check the **SMAM** and **PM-KUSUM** portals where subsidies ranging from 40% to 70% are provided for registered farmers.
4. **Market Realization**: Ensure thorough shade curing and grading (< 8% moisture) to earn top Grade A pricing on KhetSetu without distress sales.`;
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
      // Prepare previous conversation context (last 6 messages)
      const historyContext = messages.slice(-6).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));

      let aiReplyText = '';
      let usedModel = GEMINI_MODEL;

      // Tier 1: Try backend AI advisory endpoint
      try {
        const res = await askAIMutation.mutateAsync({
          message: text,
          language,
          history: historyContext,
        });
        aiReplyText = res?.answer || res?.data?.answer;
        if (res?.model) usedModel = res.model;
      } catch (backendErr) {
        console.warn('Backend AI service call failed, using offline knowledge base...', backendErr);
      }

      // Curated offline agronomy knowledge base fallback
      if (!aiReplyText) {
        aiReplyText = generateAnswer(text);
        usedModel = 'kisan-knowledge-base';
      }

      const aiMessage = {
        id: `msg-${Date.now()}-ai`,
        sender: 'ai',
        text: aiReplyText,
        model: usedModel,
        time: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error('AI chat failed:', err);
      const fallbackText = generateAnswer(text);
      const aiMessage = {
        id: `msg-${Date.now()}-ai`,
        sender: 'ai',
        text: fallbackText,
        model: 'kisan-knowledge-base',
        time: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } finally {
      setIsTyping(false);
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
          language === 'gu'
            ? 'ચેટ રીસેટ થઈ ગઈ છે. ખેતી સાધનો, રોગ-જીવાત કે સરકારી સહાય અંગે નવો પ્રશ્ન પૂછો!'
            : 'Chat cleared. Ask me any new questions about farm machinery, crop protection, or subsidies!',
        time: new Date().toISOString(),
      },
    ];
    setMessages(welcome);
    localStorage.removeItem(STORAGE_KEY);
    toast.info(t('farmer.chatCleared', 'Conversation reset.'));
  };

  return (
    <Box sx={{ maxWidth: '1150px', mx: 'auto', p: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <PageHeader
          title={t('farmer.aiAdvisoryTitle', '🤖 Kisan AI Advisory & Machinery Guide')}
          subtitle={t(
            'farmer.aiAdvisorySubtitle',
            'Get instant smart recommendations on farm implements, solar pumps, drip irrigation, pest control, and government subsidies.'
          )}
          showBack={true}
        />

        <Button
          variant="outlined"
          color="inherit"
          startIcon={<MdDeleteOutline />}
          onClick={handleClearChat}
          sx={{
            textTransform: 'none',
            borderRadius: 2,
            borderColor: '#CBD5E1',
            color: '#64748B',
            fontWeight: 600,
            '&:hover': { bgcolor: '#F8FAFC', borderColor: '#94A3B8' },
          }}
        >
          {t('farmer.clearConversation', 'Reset Chat')}
        </Button>
      </Box>

      {/* Suggested Topics / Prompt Starters */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="caption" fontWeight={700} color="#64748B" sx={{ display: 'block', mb: 1, textTransform: 'uppercase' }}>
          💡 {t('farmer.quickAdvisoryQuestions', 'Recommended Questions & Common Inquiries')}:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {promptStarters.map((starter, i) => (
            <Chip
              key={i}
              label={starter.title}
              onClick={() => handleSendMessage(starter.query)}
              clickable
              sx={{
                bgcolor: '#EFF6FF',
                color: '#1D4ED8',
                border: '1px solid #BFDBFE',
                fontWeight: 600,
                fontSize: '0.8rem',
                py: 2,
                borderRadius: 2.5,
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: '#DBEAFE',
                  transform: 'translateY(-1px)',
                },
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Main Chat Box Container */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3.5,
          border: '1px solid #E2E8F0',
          bgcolor: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          height: { xs: '650px', sm: '700px' },
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          overflow: 'hidden',
        }}
      >
        {/* Chat Status Header */}
        <Box
          sx={{
            px: 2.5,
            py: 1.5,
            borderBottom: '1px solid #E2E8F0',
            bgcolor: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                bgcolor: '#16A34A',
                boxShadow: '0 0 0 3px rgba(22, 163, 74, 0.2)',
              }}
            />
            <Typography variant="body2" fontWeight={800} color="#0F172A">
              {t('farmer.aiAssistantName', 'KhetSetu Kisan AI Advisory')}
            </Typography>
            <Chip
              label="⚡ Gemini 3.8 Flash Online"
              size="small"
              sx={{
                height: 22,
                fontSize: '0.72rem',
                fontWeight: 800,
                bgcolor: '#EFF6FF',
                color: '#2563EB',
                border: '1px solid #BFDBFE',
              }}
            />
          </Box>

          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            {language === 'gu'
              ? 'ગુજરાતી / हिन्दी / English સપોર્ટ'
              : language === 'hi'
              ? 'गुजराती / हिन्दी / English सपोर्ट'
              : 'Gujarati / Hindi / English Support'}
          </Typography>
        </Box>

        {/* Chat Messages Area */}
        <Box
          sx={{
            flex: 1,
            p: { xs: 2, sm: 3 },
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
            bgcolor: '#F8FAFC',
          }}
        >
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
                }}
              >
                {!isUser && (
                  <Avatar
                    sx={{
                      width: 38,
                      height: 38,
                      bgcolor: '#2563EB',
                      color: '#fff',
                      boxShadow: '0 2px 6px rgba(37,99,235,0.25)',
                    }}
                  >
                    <MdSmartToy size={22} />
                  </Avatar>
                )}

                <Box
                  sx={{
                    maxWidth: { xs: '88%', sm: '78%' },
                    p: { xs: 2, sm: 2.5 },
                    borderRadius: 3,
                    bgcolor: isUser ? '#2563EB' : '#FFFFFF',
                    color: isUser ? '#FFFFFF' : '#1E293B',
                    border: isUser ? 'none' : '1px solid #E2E8F0',
                    boxShadow: isUser
                      ? '0 3px 12px rgba(37,99,235,0.25)'
                      : '0 2px 6px rgba(0,0,0,0.03)',
                  }}
                >
                  {!isUser && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Chip
                        label={
                          msg.model === 'gemini-3.8-flash'
                            ? '⚡ Gemini 3.8 Flash'
                            : '🌱 Kisan AI Agronomist'
                        }
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          bgcolor: msg.model === 'gemini-3.8-flash' ? '#EFF6FF' : '#DCFCE7',
                          color: msg.model === 'gemini-3.8-flash' ? '#1D4ED8' : '#166534',
                          border: msg.model === 'gemini-3.8-flash' ? '1px solid #BFDBFE' : 'none',
                        }}
                      />
                      <Tooltip title={t('common.copy', 'Copy text')}>
                        <IconButton
                          size="small"
                          onClick={() => handleCopyText(msg.id, msg.text)}
                          sx={{ color: '#94A3B8', p: 0.5 }}
                        >
                          {copiedId === msg.id ? <MdCheck size={16} color="#16A34A" /> : <MdContentCopy size={16} />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}

                  <Typography
                    variant="body2"
                    sx={{
                      lineHeight: 1.65,
                      whiteSpace: 'pre-wrap',
                      fontSize: '0.92rem',
                    }}
                  >
                    {msg.text}
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      mt: 1,
                      textAlign: isUser ? 'right' : 'left',
                      opacity: isUser ? 0.8 : 0.5,
                      fontSize: '0.7rem',
                    }}
                  >
                    {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Box>

                {isUser && (
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: '#16A34A',
                      color: '#fff',
                    }}
                  >
                    <MdAgriculture size={20} />
                  </Avatar>
                )}
              </Box>
            );
          })}

          {isTyping && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ width: 36, height: 36, bgcolor: '#2563EB', color: '#fff' }}>
                <MdSmartToy size={20} />
              </Avatar>
              <Paper
                elevation={0}
                sx={{
                  p: 1.8,
                  borderRadius: 3,
                  border: '1px solid #E2E8F0',
                  bgcolor: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <CircularProgress size={16} color="primary" />
                <Typography variant="body2" color="#64748B" fontWeight={500}>
                  {t('farmer.aiAnalyzingAdvice', 'Analyzing farm guidelines & equipment data...')}
                </Typography>
              </Paper>
            </Box>
          )}

          <div ref={chatBottomRef} />
        </Box>

        {/* Chat Input Bar */}
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          sx={{
            p: 2,
            borderTop: '1px solid #E2E8F0',
            bgcolor: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <TextField
            fullWidth
            size="medium"
            placeholder={
              language === 'gu'
                ? 'ટ્રેક્ટર, સોલાર પંપ, ટપક પદ્ધતિ કે પાક રોગ-જીવાત અંગે પૂછો...'
                : language === 'hi'
                ? 'ट्रैक्टर, सोलर पंप, ड्रिप सिंचाई या फसल सुरक्षा के बारे में पूछें...'
                : 'Ask about tractor sizing, solar pumps, drip irrigation, pest control, or subsidies...'
            }
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={isTyping}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                bgcolor: '#F8FAFC',
              },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={!inputQuery.trim() || isTyping}
            sx={{
              minWidth: 52,
              height: 52,
              borderRadius: 3,
              bgcolor: '#2563EB',
              boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
              '&:hover': { bgcolor: '#1D4ED8' },
            }}
          >
            <MdSend size={22} />
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
