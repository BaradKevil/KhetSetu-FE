/**
 * ============================================================================
 *  KhetSetu Multilingual Locations Dictionary (English, Gujarati, Hindi)
 *  Supports 100% synchronized translations across Gujarat's States,
 *  Districts, Talukas / Cities, and Villages with phonetic Indic fallback.
 * ============================================================================
 */
import {
  LOCATIONS_DATA,
  getStates,
  getDistricts,
  getCities,
  getVillages,
} from './locationsData.js';

/**
 * 1. Supported States Translations
 */
export const STATES_I18N = {
  Gujarat: { gu: 'ગુજરાત', hi: 'गुजरात' },
};

/**
 * 2. All 33 Gujarat Districts Translations
 */
export const DISTRICTS_I18N = {
  'Gir Somnath': { gu: 'ગીર સોમનાથ', hi: 'गिर सोमनाथ' },
  'Mehsana': { gu: 'મહેસાણા', hi: 'मेहसाणा' },
  'Rajkot': { gu: 'રાજકોટ', hi: 'राजकोट' },
  'Junagadh': { gu: 'જૂનાગઢ', hi: 'जूनागढ़' },
  'Amreli': { gu: 'અમરેલી', hi: 'अमरेली' },
  'Bhavnagar': { gu: 'ભાવનગર', hi: 'भावनगर' },
  'Ahmedabad': { gu: 'અમદાવાદ', hi: 'अहमदाबाद' },
  'Surat': { gu: 'સુરત', hi: 'सूरत' },
  'Vadodara': { gu: 'વડોદરા', hi: 'वडोदरा' },
  'Anand': { gu: 'આણંદ', hi: 'आनंद' },
  'Kheda': { gu: 'ખેડા', hi: 'खेड़ा' },
  'Banaskantha': { gu: 'બનાસકાંઠા', hi: 'बनासकांठा' },
  'Patan': { gu: 'પાટણ', hi: 'पाटन' },
  'Sabarkantha': { gu: 'સાબરકાંઠા', hi: 'साबरकांठा' },
  'Kutch': { gu: 'કચ્છ', hi: 'कच्छ' },
  'Morbi': { gu: 'મોરબી', hi: 'मोरबी' },
  'Jamnagar': { gu: 'જામનગર', hi: 'जामनगर' },
  'Devbhumi Dwarka': { gu: 'દેવભૂમિ દ્વારકા', hi: 'देवभूमि द्वारका' },
  'Porbandar': { gu: 'પોરબંદર', hi: 'पोरबंदर' },
  'Surendranagar': { gu: 'સુરેન્દ્રનગર', hi: 'सुरेन्द्रनगर' },
  'Botad': { gu: 'બોટાદ', hi: 'बोटाद' },
  'Gandhinagar': { gu: 'ગાંધીનગર', hi: 'गांधीनगर' },
  'Navsari': { gu: 'નવસારી', hi: 'नवसारी' },
  'Valsad': { gu: 'વલસાડ', hi: 'वलसाड' },
  'Bharuch': { gu: 'ભરૂચ', hi: 'भरूच' },
  'Aravalli': { gu: 'અરવલ્લી', hi: 'अरवल्ली' },
  'Mahisagar': { gu: 'મહીસાગર', hi: 'महिसागर' },
  'Dahod': { gu: 'દાહોદ', hi: 'दाहोद' },
  'Panchmahal': { gu: 'પંચમહાલ', hi: 'पंचमहाल' },
  'Chhota Udepur': { gu: 'છોટા ઉદેપુર', hi: 'छोटा उदयपुर' },
  'Narmada': { gu: 'નર્મદા', hi: 'नर्मदा' },
  'Tapi': { gu: 'તાપી', hi: 'तापी' },
  'Dang': { gu: 'ડાંગ', hi: 'डांग' },
};

/**
 * 3. All 115 Talukas / Cities Translations
 */
export const CITIES_I18N = {
  // Gir Somnath
  'Kodinar': { gu: 'કોડીનાર', hi: 'कोडीनार' },
  'Veraval': { gu: 'વેરાવળ', hi: 'वेरावल' },
  'Talala': { gu: 'તાલાલા', hi: 'तालाला' },
  'Una': { gu: 'ઉના', hi: 'उना' },
  'Sutrapada': { gu: 'સુત્રાપાડા', hi: 'सुत्रापाड़ा' },
  'Gir Gadhada': { gu: 'ગીર ગઢડા', hi: 'गिर गढड़ा' },

  // Mehsana
  'Mehsana': { gu: 'મહેસાણા', hi: 'मेहसाणा' },
  'Unjha': { gu: 'ઊંઝા', hi: 'ऊंझा' },
  'Kadi': { gu: 'કડી', hi: 'कड़ी' },
  'Visnagar': { gu: 'વિસનગર', hi: 'विसनगर' },
  'Vadnagar': { gu: 'વડનગર', hi: 'वडनगर' },
  'Vijapur': { gu: 'વિજાપુર', hi: 'विजापुर' },

  // Rajkot
  'Rajkot': { gu: 'રાજકોટ', hi: 'राजकोट' },
  'Gondal': { gu: 'ગોંડલ', hi: 'गोंडल' },
  'Jetpur': { gu: 'જેતપુર', hi: 'जेतपुर' },
  'Dhoraji': { gu: 'ધોરાજી', hi: 'धोराजी' },
  'Jasdan': { gu: 'જસદણ', hi: 'जसदन' },

  // Junagadh
  'Junagadh': { gu: 'જૂનાગઢ', hi: 'जूनागढ़' },
  'Keshod': { gu: 'કેશોદ', hi: 'केशोद' },
  'Mangrol': { gu: 'માંગરોળ', hi: 'मांगरोल' },
  'Manavadar': { gu: 'માણાવદર', hi: 'माणावदर' },
  'Visavadar': { gu: 'વિસાવદર', hi: 'विसावदर' },

  // Amreli
  'Amreli': { gu: 'અમરેલી', hi: 'अमरेली' },
  'Dhari': { gu: 'ધારી', hi: 'धारी' },
  'Savarkundla': { gu: 'સાવરકુંડલા', hi: 'सावरकुंडला' },
  'Rajula': { gu: 'રાજુલા', hi: 'राजुला' },

  // Bhavnagar
  'Bhavnagar': { gu: 'ભાવનગર', hi: 'भावनगर' },
  'Mahuva': { gu: 'મહુવા', hi: 'महुवा' },
  'Talaja': { gu: 'તળાજા', hi: 'तलाजा' },
  'Palitana': { gu: 'પાલીતાણા', hi: 'पालीताना' },

  // Ahmedabad
  'Sanand': { gu: 'સાણંદ', hi: 'साणंद' },
  'Dholka': { gu: 'ધોળકા', hi: 'धोलका' },
  'Bavla': { gu: 'બાવળા', hi: 'बावला' },
  'Viramgam': { gu: 'વિરમગામ', hi: 'विरमगाम' },
  'Dhandhuka': { gu: 'ધંધુકા', hi: 'धंधुका' },

  // Surat
  'Bardoli': { gu: 'બારડોલી', hi: 'बारडोली' },
  'Mandvi': { gu: 'માંડવી', hi: 'मांडवी' },
  'Olpad': { gu: 'ઓલપાડ', hi: 'ओलपाड' },
  'Kamrej': { gu: 'કામરેજ', hi: 'कामरेज' },

  // Vadodara
  'Dabhoi': { gu: 'ડભોઈ', hi: 'डभोई' },
  'Karjan': { gu: 'કરજણ', hi: 'करजण' },
  'Padra': { gu: 'પાદરા', hi: 'पादरा' },
  'Savli': { gu: 'સાવલી', hi: 'सावली' },

  // Anand
  'Anand': { gu: 'આણંદ', hi: 'आनंद' },
  'Petlad': { gu: 'પેટલાદ', hi: 'पेटलाद' },
  'Borsad': { gu: 'બોરસદ', hi: 'बोरसद' },
  'Khambhat': { gu: 'ખંભાત', hi: 'खंभात' },

  // Kheda
  'Nadiad': { gu: 'નડિયાદ', hi: 'नडियाद' },
  'Kapadvanj': { gu: 'કપડવંજ', hi: 'कपड़वंज' },
  'Matar': { gu: 'માતર', hi: 'मातर' },

  // Banaskantha
  'Palanpur': { gu: 'પાલનપુર', hi: 'पालनपुर' },
  'Deesa': { gu: 'ડીસા', hi: 'डीसा' },
  'Tharad': { gu: 'થરાદ', hi: 'थराद' },
  'Dhanera': { gu: 'ધાનેરા', hi: 'धानेरा' },

  // Patan
  'Patan': { gu: 'પાટણ', hi: 'पाटन' },
  'Siddhpur': { gu: 'સિદ્ધપુર', hi: 'सिद्धपुर' },
  'Radhanpur': { gu: 'રાધનપુર', hi: 'राधनपुर' },

  // Sabarkantha
  'Himatnagar': { gu: 'હિંમતનગર', hi: 'हिम्मतनगर' },
  'Idar': { gu: 'ઇડર', hi: 'इडर' },
  'Prantij': { gu: 'પ્રાંતીજ', hi: 'प्रांतीज' },

  // Kutch
  'Bhuj': { gu: 'ભુજ', hi: 'भुज' },
  'Anjar': { gu: 'અંજાર', hi: 'अंजार' },
  'Nakhatrana': { gu: 'નખત્રાણા', hi: 'नखत्राणा' },

  // Morbi
  'Morbi': { gu: 'મોરબી', hi: 'मोरबी' },
  'Wankaner': { gu: 'વાંકાનેર', hi: 'वांकानेर' },
  'Halvad': { gu: 'હળવદ', hi: 'हलवद' },

  // Jamnagar
  'Jamnagar': { gu: 'જામનગર', hi: 'जामनगर' },
  'Kalavad': { gu: 'કાલાવડ', hi: 'कालावेड' },
  'Dhrol': { gu: 'ધ્રોલ', hi: 'ध्रोल' },

  // Devbhumi Dwarka
  'Khambhalia': { gu: 'ખંભાળિયા', hi: 'खंभालिया' },
  'Dwarka': { gu: 'દ્વારકા', hi: 'द्वारका' },
  'Kalyanpur': { gu: 'કલ્યાણપુર', hi: 'कल्याणपुर' },

  // Porbandar
  'Porbandar': { gu: 'પોરબંદર', hi: 'पोरबंदर' },
  'Ranavav': { gu: 'રાણાવાવ', hi: 'राणावाव' },
  'Kutiyana': { gu: 'કુતિયાણા', hi: 'कुतियाना' },

  // Surendranagar
  'Wadhwan': { gu: 'વઢવાણ', hi: 'वढवाण' },
  'Dhrangadhra': { gu: 'ધ્રાંગધ્રા', hi: 'ध्रांगध्रा' },
  'Limbdi': { gu: 'લીંબડી', hi: 'लींबड़ी' },

  // Botad
  'Botad': { gu: 'બોટાદ', hi: 'बोटाद' },
  'Gadhada': { gu: 'ગઢડા', hi: 'गढड़ा' },
  'Barwala': { gu: 'બરવાળા', hi: 'बरवाला' },

  // Gandhinagar
  'Gandhinagar': { gu: 'ગાંધીનગર', hi: 'गांधीनगर' },
  'Kalol': { gu: 'કલોલ', hi: 'कलोल' },
  'Mansa': { gu: 'માણસા', hi: 'माणसा' },

  // Navsari
  'Navsari': { gu: 'નવસારી', hi: 'नवसारी' },
  'Gandevi': { gu: 'ગણદેવી', hi: 'गणदेवी' },
  'Chikhli': { gu: 'ચીખલી', hi: 'चीखली' },

  // Valsad
  'Valsad': { gu: 'વલસાડ', hi: 'वलसाड' },
  'Vapi': { gu: 'વાપી', hi: 'वापी' },
  'Pardi': { gu: 'પારડી', hi: 'पारडी' },

  // Bharuch
  'Bharuch': { gu: 'ભરૂચ', hi: 'भरूच' },
  'Ankleshwar': { gu: 'અંકલેશ્વર', hi: 'अंकलेश्वर' },
  'Jambusar': { gu: 'જંબુસર', hi: 'जंबुसर' },

  // Aravalli
  'Modasa': { gu: 'મોડાસા', hi: 'मोडासा' },
  'Bhiloda': { gu: 'ભિલોડા', hi: 'भिलोड़ा' },
  'Bayad': { gu: 'બાયડ', hi: 'बायड' },

  // Mahisagar
  'Lunawada': { gu: 'લુણાવાડા', hi: 'लुणावाडा' },
  'Balasinor': { gu: 'બાલાસિનોર', hi: 'बालासिनोर' },
  'Santrampur': { gu: 'સંતરામપુર', hi: 'संतरामपुर' },

  // Dahod
  'Dahod': { gu: 'દાહોદ', hi: 'दाहोद' },
  'Jhalod': { gu: 'ઝાલોદ', hi: 'झालोद' },
  'Limkheda': { gu: 'લીમખેડા', hi: 'लीमखेड़ा' },

  // Panchmahal
  'Godhra': { gu: 'ગોધરા', hi: 'गोधरा' },
  'Halol': { gu: 'હાલોલ', hi: 'हालोल' },

  // Chhota Udepur
  'Chhota Udepur': { gu: 'છોટા ઉદેપુર', hi: 'छोटा उदयपुर' },
  'Bodeli': { gu: 'બોડેલી', hi: 'बोडेली' },
  'Sankheda': { gu: 'સંખેડા', hi: 'संखेड़ा' },

  // Narmada
  'Rajpipla': { gu: 'રાજપીપળા', hi: 'राजपीपला' },
  'Dediapada': { gu: 'ડેડિયાપાડા', hi: 'डेडियापाड़ा' },

  // Tapi
  'Vyara': { gu: 'વ્યારા', hi: 'व्यरा' },
  'Songadh': { gu: 'સોનગઢ', hi: 'सोनगढ़' },

  // Dang
  'Ahwa': { gu: 'આહવા', hi: 'आहवा' },
  'Waghai': { gu: 'વઘઈ', hi: 'वघई' },
};

/**
 * 4. Comprehensive Villages Translations
 */
export const VILLAGES_I18N = {
  // Kodinar (Gir Somnath)
  'Alidar': { gu: 'આલીદર', hi: 'आलीदर' },
  'Chhara': { gu: 'છારા', hi: 'छारा' },
  'Devli(Dedani)': { gu: 'દેવળી (દેદાણી)', hi: 'देवली (देदाणी)' },
  'Harmadiya': { gu: 'હરમડિયા', hi: 'हरमड़िया' },
  'Kadodara': { gu: 'કડોદરા', hi: 'कदोदरा' },
  'Malashram': { gu: 'માળશ્રામ', hi: 'मालश्राम' },
  'Mithapur': { gu: 'મીઠાપુર', hi: 'मीठापुर' },
  'Pedhavada': { gu: 'પેઢાવડા', hi: 'पेढ़ावड़ा' },
  'Ronaj': { gu: 'રોણાજ', hi: 'रोनाज' },
  'Velva': { gu: 'વેળવા', hi: 'वेलवा' },
  'Panch Pipalva': { gu: 'પાંચ પીપળવા', hi: 'पांच पीपलवा' },
  'Jantrakhakhba': { gu: 'જાંત્રાખાખબા', hi: 'जांत्राखाखबा' },
  'Gir Devli': { gu: 'ગીર દેવળી', hi: 'गिर देवली' },
  'Arnej': { gu: 'અરણેજ', hi: 'अरनेज' },
  'Mithivirdi': { gu: 'મીઠીવિરડી', hi: 'मीठीविरडी' },

  // Veraval
  'Ajotha': { gu: 'અજોથા', hi: 'अजोथा' },
  'Bhalpara': { gu: 'ભાલપરા', hi: 'भालपरा' },
  'Dari': { gu: 'દારી', hi: 'दारी' },
  'Inaj': { gu: 'ઇણાજ', hi: 'इणाज' },
  'Kajli': { gu: 'કાજલી', hi: 'काजली' },
  'Navapara': { gu: 'નવાપરા', hi: 'नवापरा' },
  'Prabhas Patan': { gu: 'પ્રભાસ પાટણ', hi: 'प्रभास पाटन' },
  'Somnath': { gu: 'સોમનાથ', hi: 'सोमनाथ' },
  'Supa': { gu: 'સુપા', hi: 'सुपा' },
  'Umrethi': { gu: 'ઉમરેઠી', hi: 'उमरेठी' },

  // Talala
  'Ankolvadi': { gu: 'અંકોલવાડી', hi: 'अंकोलवाड़ी' },
  'Borvav': { gu: 'બોરવાવ', hi: 'बोरवाव' },
  'Chitravad': { gu: 'ચિત્રાવડ', hi: 'चित्रावड' },
  'Ghadula': { gu: 'ઘડુલા', hi: 'घडुला' },
  'Gundaran': { gu: 'ગુંદરણ', hi: 'गुंदरण' },
  'Madhupur': { gu: 'મધુપુર', hi: 'मधुपुर' },
  'Rasulpara': { gu: 'રસુલપરા', hi: 'रसुलपरा' },
  'Sasan Gir': { gu: 'સાસણ ગીર', hi: 'सासन गिर' },
  'Surva': { gu: 'સુરવા', hi: 'सुरवा' },

  // Una
  'Delwada': { gu: 'દેલવાડા', hi: 'देलवाड़ा' },
  'Dhokadva': { gu: 'ધોકડવા', hi: 'धोकड़वा' },
  'Gangada': { gu: 'ગાંગડા', hi: 'गांगड़ा' },
  'Khapat': { gu: 'ખપાટ', hi: 'खपाट' },
  'Nawa Bandar': { gu: 'નવા બંદર', hi: 'नवा बंदर' },
  'Saiyad Rajpara': { gu: 'સૈયદ રાજપરા', hi: 'सैयद राजपरा' },
  'Samter': { gu: 'સામતેર', hi: 'सामतेर' },
  'Untwala': { gu: 'ઉંટવાળા', hi: 'उंटवाला' },
  'Vankiya': { gu: 'વાંકિયા', hi: 'वांकिया' },

  // Sutrapada
  'Dhamlej': { gu: 'ધામળેજ', hi: 'धामलेज' },
  'Gorakh Madhi': { gu: 'ગોરખ મઢી', hi: 'गोरख मढ़ी' },
  'Moradiya': { gu: 'મોરડિયા', hi: 'मोरडिया' },
  'Prasnavada': { gu: 'પ્રશ્નાવડા', hi: 'प्रश्नावड़ा' },
  'Solaj': { gu: 'સોલાજ', hi: 'सोलाज' },
  'Sutrapada Bunder': { gu: 'સુત્રાપાડા બંદર', hi: 'सुत्रापाड़ा बंदर' },
  'Vavdi': { gu: 'વાવડી', hi: 'वावड़ी' },

  // Gir Gadhada
  'Dharabandar': { gu: 'ધારાબંદર', hi: 'धाराबंदर' },
  'Fulsar': { gu: 'ફુલસર', hi: 'फुलसर' },
  'Jamwala': { gu: 'જામવાળા', hi: 'जामवाला' },
  'Nitli': { gu: 'નિતલી', hi: 'नितली' },
  'Pati': { gu: 'પાટી', hi: 'पाटी' },
  'Umedpara': { gu: 'ઉમેદપરા', hi: 'उमेदपरा' },

  // Mehsana
  'Alampur': { gu: 'આલમપુર', hi: 'आलमपुर' },
  'Ambaliyasan': { gu: 'આંબલીયાસણ', hi: 'आंबलीयासण' },
  'Bhasariya': { gu: 'ભાસરિયા', hi: 'भासरिया' },
  'Devrasan': { gu: 'દેવરાસણ', hi: 'देवरासण' },
  'Gozaria': { gu: 'ગોઝારિયા', hi: 'गोज़ारिया' },
  'Kherva': { gu: 'ખેરવા', hi: 'खैरवा' },
  'Nagalpur': { gu: 'નાગલપુર', hi: 'नागलपुर' },
  'Panchot': { gu: 'પાંચોટ', hi: 'पांचोट' },
  'Palavasna': { gu: 'પાલાવાસણા', hi: 'पालावासणा' },
  'Ramosana': { gu: 'રામોસણા', hi: 'रामोसणा' },

  // Unjha
  'Aithor': { gu: 'ઐઠોર', hi: 'ऐठोर' },
  'Brahmanwada': { gu: 'બ્રાહ્મણવાડા', hi: 'ब्राह्मणवाड़ा' },
  'Dasaj': { gu: 'દાસજ', hi: 'दासज' },
  'Kamli': { gu: 'કામલી', hi: 'कामली' },
  'Lindi': { gu: 'લીંડી', hi: 'लिंडी' },
  'Makakhad': { gu: 'મકાખડ', hi: 'मकाखड़' },
  'Suraj': { gu: 'સૂરજ', hi: 'सूरज' },
  'Tundav': { gu: 'ટુંડાવ', hi: 'टुंडाव' },
  'Upera': { gu: 'ઉપેરા', hi: 'उपेरा' },

  // Kadi
  'Budasan': { gu: 'બુડાસણ', hi: 'बुडासण' },
  'Chhatral': { gu: 'છત્રાલ', hi: 'छत्राल' },
  'Indrad': { gu: 'ઇન્દ્રડ', hi: 'इंद्रड' },
  'Kalyanpura': { gu: 'કલ્યાણપુરા', hi: 'कल्याणपुरा' },
  'Karan Nagar': { gu: 'કરણ નગર', hi: 'करण नगर' },
  'Nandasan': { gu: 'નંદાસણ', hi: 'नंदासण' },
  'Thol': { gu: 'થોળ', hi: 'थोल' },

  // Rajkot
  'Bedipara': { gu: 'બેડીપરા', hi: 'बेड़ीपरा' },
  'Kothariya': { gu: 'કોઠારિયા', hi: 'कोठारिया' },
  'Mavdi': { gu: 'માવડી', hi: 'मावड़ी' },
  'Madhapar': { gu: 'માધાપર', hi: 'माधापर' },
  'Ratanpar': { gu: 'રતનપર', hi: 'रतनपर' },
  'Vavdi (Rajkot)': { gu: 'વાવડી (રાજકોટ)', hi: 'वावड़ी (राजकोट)' },

  // Gondal
  'Bandhiya': { gu: 'બંધિયા', hi: 'बंधिया' },
  'Bhojpara': { gu: 'ભોજપરા', hi: 'भोजपरा' },
  'Charakhadi': { gu: 'ચરખડી', hi: 'चरखड़ी' },
  'Derdi': { gu: 'ડેરડી', hi: 'डेरडी' },
  'Gomta': { gu: 'ગોમટા', hi: 'गोमटा' },
  'Kolithad': { gu: 'કોલીથડ', hi: 'कोलीथड़' },
  'Moti Khilori': { gu: 'મોટી ખીલોરી', hi: 'मोटी खिलोड़ी' },
  'Ribda': { gu: 'રીબડા', hi: 'रिबड़ा' },
  'Semla': { gu: 'સેમળા', hi: 'सेमला' },
  'Shivrajgadh': { gu: 'શિવરાજગઢ', hi: 'शिवराजगढ़' },

  // Ahmedabad / Sanand
  'Changodar': { gu: 'ચાંગોદર', hi: 'चांगोदर' },
  'Chekhla': { gu: 'ચેખલા', hi: 'चेखला' },
  'Goraj': { gu: 'ગોરજ', hi: 'गोरज' },
  'Manipur': { gu: 'મણિપુર', hi: 'मणिपुर' },
  'Moraiya': { gu: 'મોરૈયા', hi: 'मोरैया' },
  'Nidhrad': { gu: 'નિધરાડ', hi: 'निधराड़' },
  'Shela': { gu: 'શેલા', hi: 'शेला' },
  'Telav': { gu: 'તેલાવ', hi: 'तेलाव' },
  'Virochannagar': { gu: 'વિરોચનનગર', hi: 'विरोचननगर' },

  // Anand
  'Bakrol': { gu: 'બાકરોલ', hi: 'बाकरोल' },
  'Chikhodra': { gu: 'ચીખોદરા', hi: 'चीखोदरा' },
  'Gamdi': { gu: 'ગામડી', hi: 'गामड़ी' },
  'Hadgood': { gu: 'હડગુડ', hi: 'हड़गुड़' },
  'Jitodia': { gu: 'જીતોડિયા', hi: 'जितोड़िया' },
  'Karamsad': { gu: 'કરમસદ', hi: 'करमसद' },
  'Mogri': { gu: 'મોગરી', hi: 'मोगरी' },
  'Samarkha': { gu: 'સમરખા', hi: 'समरखा' },
  'Vallabh Vidyanagar': { gu: 'વલ્લભ વિદ્યાનગર', hi: 'वल्लभ विद्यानगर' },
  'Vasad': { gu: 'વાસદ', hi: 'वासद' },

  // Surat / Bardoli
  'Afva': { gu: 'અફવા', hi: 'अफवा' },
  'Babla': { gu: 'બાબલા', hi: 'बाबला' },
  'Bamroli': { gu: 'બામરોલી', hi: 'बामरोली' },
  'Dhamdod': { gu: 'ધામદોડ', hi: 'धामदोड' },
  'Isroli': { gu: 'ઇસરોલી', hi: 'इसरोली' },
  'Kadod': { gu: 'કડોદ', hi: 'कड़ोद' },
  'Mahuva (Surat)': { gu: 'મહુવા (સુરત)', hi: 'महुवा (सूरत)' },
  'Sarbhon': { gu: 'સરભોણ', hi: 'सरभोण' },
  'Ten': { gu: 'તેન', hi: 'तेन' },
};

/**
 * Universal lookup cache combining States, Districts, Cities, and Villages
 */
export const ALL_LOCATIONS_MAP = {
  ...STATES_I18N,
  ...DISTRICTS_I18N,
  ...CITIES_I18N,
  ...VILLAGES_I18N,
};

/**
 * Reverse lookup cache: Localized name (Gu/Hi) -> English Canonical Name
 */
const REVERSE_LOOKUP_MAP = {};
Object.entries(ALL_LOCATIONS_MAP).forEach(([canonical, trans]) => {
  if (trans.gu) REVERSE_LOOKUP_MAP[trans.gu.trim().toLowerCase()] = canonical;
  if (trans.hi) REVERSE_LOOKUP_MAP[trans.hi.trim().toLowerCase()] = canonical;
});

/**
 * Converts a Devanagari (Hindi) character/string to Gujarati script via Unicode offset
 */
export function devanagariToGujarati(text) {
  if (!text) return '';
  let res = '';
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code >= 0x0901 && code <= 0x0970) {
      res += String.fromCharCode(code + 0x0180);
    } else {
      res += text[i];
    }
  }
  return res;
}

/**
 * Converts a Gujarati character/string to Devanagari (Hindi) script via Unicode offset
 */
export function gujaratiToDevanagari(text) {
  if (!text) return '';
  let res = '';
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code >= 0x0A81 && code <= 0x0AF0) {
      res += String.fromCharCode(code - 0x0180);
    } else {
      res += text[i];
    }
  }
  return res;
}

/**
 * Phonetic transliteration for any unmapped English village / place name to Gujarati
 */
const INITIAL_VOWELS = {
  aa: 'આ', a: 'અ', ee: 'ઈ', ii: 'ઈ', i: 'ઇ', oo: 'ઊ', uu: 'ઊ', u: 'ઉ',
  e: 'એ', ai: 'ઐ', o: 'ઓ', au: 'ઔ',
};
const MATRAS = {
  aa: 'ા', a: 'ા', ee: 'ી', ii: 'ી', i: 'િ', oo: 'ૂ', uu: 'ૂ', u: 'ુ',
  e: 'ે', ai: 'ૈ', o: 'ો', au: 'ૌ',
};
const CONSONANTS = {
  ksh: 'ક્ષ', chh: 'છ', kh: 'ખ', gh: 'ઘ', ch: 'ચ', jh: 'ઝ', th: 'થ', dh: 'ધ',
  ph: 'ફ', bh: 'ભ', sh: 'શ', gn: 'જ્ઞ',
  k: 'ક', g: 'ગ', j: 'જ', t: 'ત', d: 'દ', n: 'ન', p: 'પ', b: 'બ',
  m: 'મ', y: 'ય', r: 'ર', l: 'લ', v: 'વ', w: 'વ', s: 'સ', h: 'હ',
};

function transliteratePhonetic(rawToken) {
  if (!rawToken) return '';
  const token = rawToken.trim();
  const lower = token.toLowerCase();
  let result = '';
  let i = 0;
  let isStart = true;

  while (i < lower.length) {
    if (isStart) {
      let matchedVowel = false;
      for (const len of [2, 1]) {
        const sub = lower.substr(i, len);
        if (INITIAL_VOWELS[sub]) {
          result += INITIAL_VOWELS[sub];
          i += len;
          matchedVowel = true;
          isStart = false;
          break;
        }
      }
      if (matchedVowel) continue;
    }

    let matchedConsonant = false;
    for (const len of [3, 2, 1]) {
      const sub = lower.substr(i, len);
      if (CONSONANTS[sub]) {
        result += CONSONANTS[sub];
        i += len;
        matchedConsonant = true;
        isStart = false;

        let matchedMatra = false;
        for (const vLen of [2, 1]) {
          const vSub = lower.substr(i, vLen);
          if (MATRAS[vSub] !== undefined) {
            // Only add 'a' as matra if it's explicitly 'aa' or at the very end of word
            if (vSub === 'a' && i + vLen < lower.length) {
              // medial 'a' inherits inherent vowel in Indic script
            } else {
              result += MATRAS[vSub];
            }
            i += vLen;
            matchedMatra = true;
            break;
          }
        }
        break;
      }
    }

    if (!matchedConsonant) {
      result += token[i];
      i++;
    }
  }

  return result;
}

/**
 * Universal function to get the localized display label for a place name.
 * @param {string} name - English, Gujarati, or Hindi place name
 * @param {'en' | 'hi' | 'gu'} lang - Target language
 * @returns {string} - Correct localized display name
 */
export function getLocationLabel(name, lang = 'en') {
  if (!name || typeof name !== 'string') return '';
  const trimmed = name.trim();
  if (!trimmed) return '';

  // 1. Identify canonical English name (in case input is already Gu/Hi)
  const canonical = REVERSE_LOOKUP_MAP[trimmed.toLowerCase()] || trimmed;

  if (lang === 'en') {
    return canonical;
  }

  // 2. Direct dictionary hit
  if (ALL_LOCATIONS_MAP[canonical]) {
    const item = ALL_LOCATIONS_MAP[canonical];
    if (lang === 'gu' && item.gu) return item.gu;
    if (lang === 'hi' && item.hi) return item.hi;
  }

  // 3. If input is already in Gujarati or Devanagari script:
  const firstCharCode = trimmed.charCodeAt(0);
  if (firstCharCode >= 0x0A80 && firstCharCode <= 0x0AFF) {
    // Input is Gujarati
    return lang === 'hi' ? gujaratiToDevanagari(trimmed) : trimmed;
  }
  if (firstCharCode >= 0x0900 && firstCharCode <= 0x097F) {
    // Input is Devanagari (Hindi)
    return lang === 'gu' ? devanagariToGujarati(trimmed) : trimmed;
  }

  // 4. Phonetic transliteration for unmapped village / custom place
  const guTrans = transliteratePhonetic(canonical);
  if (lang === 'gu') return guTrans;
  if (lang === 'hi') return gujaratiToDevanagari(guTrans);

  return canonical;
}

/**
 * Converts any localized place name (Gujarati / Hindi) back to its canonical English name.
 * @param {string} name
 * @returns {string} English canonical name
 */
export function toCanonicalLocation(name) {
  if (!name || typeof name !== 'string') return '';
  const trimmed = name.trim();
  return REVERSE_LOOKUP_MAP[trimmed.toLowerCase()] || trimmed;
}

/**
 * Returns localized list of States
 * e.g. [{ value: 'Gujarat', label: 'ગુજરાત' }]
 */
export function getLocalizedStates(lang = 'en') {
  return getStates().map((st) => ({
    value: st,
    label: getLocationLabel(st, lang),
  }));
}

/**
 * Returns localized list of Districts for a State
 */
export function getLocalizedDistricts(stateName, lang = 'en') {
  const canonicalState = toCanonicalLocation(stateName);
  return getDistricts(canonicalState).map((dist) => ({
    value: dist,
    label: getLocationLabel(dist, lang),
  }));
}

/**
 * Returns localized list of Cities / Talukas for a District
 */
export function getLocalizedCities(stateName, districtName, lang = 'en') {
  const canonicalState = toCanonicalLocation(stateName);
  const canonicalDistrict = toCanonicalLocation(districtName);
  return getCities(canonicalState, canonicalDistrict).map((city) => ({
    value: city,
    label: getLocationLabel(city, lang),
  }));
}

/**
 * Returns localized list of Villages for a City
 */
export function getLocalizedVillages(stateName, districtName, cityName, lang = 'en') {
  const canonicalState = toCanonicalLocation(stateName);
  const canonicalDistrict = toCanonicalLocation(districtName);
  const canonicalCity = toCanonicalLocation(cityName);
  return getVillages(canonicalState, canonicalDistrict, canonicalCity).map((vil) => ({
    value: vil,
    label: getLocationLabel(vil, lang),
  }));
}

export default {
  getLocationLabel,
  toCanonicalLocation,
  getLocalizedStates,
  getLocalizedDistricts,
  getLocalizedCities,
  getLocalizedVillages,
};
