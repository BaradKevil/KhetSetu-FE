import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
} from '@mui/material';
import {
  MdSupportAgent,
  MdPhoneInTalk,
  MdHelpOutline,
  MdExpandMore,
  MdCheckCircle,
  MdSend,
  MdShield,
} from 'react-icons/md';
import { useLanguage } from '../../context/LanguageContext';
import PageHeader from '../../common/custom/PageHeader';
import { toast } from 'react-toastify';

export default function SellerSupport() {
  const { t } = useLanguage();

  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('payout');
  const [ticketMessage, setTicketMessage] = useState('');
  const [callbackPhone, setCallbackPhone] = useState('');
  const [submittedTicketId, setSubmittedTicketId] = useState(null);

  const handleSubmitTicket = (e) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) {
      toast.warning(t('farmer.fillSupportFields', 'Please enter a subject and explanation.'));
      return;
    }
    const fakeId = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
    setSubmittedTicketId(fakeId);
    toast.success(t('farmer.ticketCreatedToast', `Support ticket #${fakeId} opened! A representative will call you.`));
    setTicketSubject('');
    setTicketMessage('');
  };

  const handleRequestCallback = () => {
    if (!callbackPhone.trim() || callbackPhone.trim().length < 10) {
      toast.warning(t('farmer.validPhoneNeeded', 'Please enter a valid 10-digit mobile number.'));
      return;
    }
    toast.success(
      t('farmer.callbackScheduledToast', 'Call back requested! Our Gujarati/Hindi desk officer will call you within 15 minutes.')
    );
    setCallbackPhone('');
  };

  const faqs = [
    {
      q: t('farmer.faq1Q', 'When is my crop payment released to my bank account?'),
      a: t(
        'farmer.faq1A',
        'Buyer funds are 100% held in licensed bank escrow before you pack or dispatch. Once the buyer confirms delivery and weighment, or within 48 hours of verified transit delivery proof, your net payment (with transparent 2.5% fee deduction) is directly credited via NEFT/RTGS with automated UTR confirmation.'
      ),
    },
    {
      q: t('farmer.faq2Q', 'What happens if a buyer raises a dispute on crop quality or weight?'),
      a: t(
        'farmer.faq2A',
        'Buyer cannot arbitrarily cancel payments. You have 48 hours to upload your APMC electronic weighment slip or dispatch photos in the Disputes Center. An impartial KhetSetu arbitration officer will inspect the evidence before any settlement.'
      ),
    },
    {
      q: t('farmer.faq3Q', 'Can I update my registered bank account or land records after KYC is verified?'),
      a: t(
        'farmer.faq3A',
        'Yes. To prevent unauthorized financial tampering, verified accounts are locked. Go to "Farm Profile & KYC" and click "Request Details Change from Admin". An administrative officer will review your request within 24 hours.'
      ),
    },
    {
      q: t('farmer.faq4Q', 'How do I restock my garlic or groundnut lots when I harvest a new batch?'),
      a: t(
        'farmer.faq4A',
        'Go to "My Crop Listings" and click the green "+ Restock Batch" button on the sold-out listing. Enter your new harvest quantity and confirm to instantly reactivate it on the buyer mandi.'
      ),
    },
  ];

  return (
    <Box sx={{ maxWidth: '1100px', mx: 'auto', p: { xs: 2, sm: 3 } }}>
      <PageHeader
        title={t('farmer.supportTitle', '🎧 Kisan Support & Escrow Helpdesk')}
        subtitle={t(
          'farmer.supportSubtitle',
          'Get fast assistance for payments, delivery weighment questions, KYC unlocks, and disputes in your preferred language.'
        )}
        showBack={true}
      />

      {/* Emergency Helpline Banner */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3.5,
          border: '1px solid #BFDBFE',
          bgcolor: '#EFF6FF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 3,
              bgcolor: '#2563EB',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MdPhoneInTalk size={28} />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={800} color="#1E3A8A">
              {t('farmer.helplineHeading', 'Toll-Free Kisan Escrow Helpline')}
            </Typography>
            <Typography variant="h5" fontWeight={900} color="#2563EB">
              1800-889-KHET (5438)
            </Typography>
            <Typography variant="caption" color="#475569">
              {t('farmer.helplineHours', 'Open Daily 7:00 AM – 9:00 PM IST • Gujarati, Hindi & English')}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder={t('farmer.mobilePlaceholder', 'Enter 10-digit mobile...')}
            value={callbackPhone}
            onChange={(e) => setCallbackPhone(e.target.value)}
            sx={{ bgcolor: '#fff', borderRadius: 2 }}
          />
          <Button
            variant="contained"
            onClick={handleRequestCallback}
            sx={{
              bgcolor: '#2563EB',
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 2,
              px: 2.5,
              whiteSpace: 'nowrap',
              '&:hover': { bgcolor: '#1D4ED8' },
            }}
          >
            {t('farmer.requestCallbackBtn', 'Request Call Back')}
          </Button>
        </Box>
      </Paper>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.2fr 1fr' }, gap: 3.5, mb: 4 }}>
        {/* Support Ticket Submission Form */}
        <Paper
          elevation={0}
          component="form"
          onSubmit={handleSubmitTicket}
          sx={{
            p: 3.5,
            borderRadius: 3.5,
            border: '1px solid #E2E8F0',
            bgcolor: '#fff',
          }}
        >
          <Typography variant="h6" fontWeight={800} color="#1E293B" sx={{ mb: 0.5 }}>
            {t('farmer.openTicketTitle', 'Submit a Support Request')}
          </Typography>
          <Typography variant="body2" color="#64748B" sx={{ mb: 2.5 }}>
            {t('farmer.openTicketDesc', 'Our regional agricultural desk will respond within 4 hours.')}
          </Typography>

          {submittedTicketId && (
            <Alert severity="success" icon={<MdCheckCircle size={22} />} sx={{ mb: 2.5, borderRadius: 2 }}>
              <strong>{t('farmer.ticketRaisedHeader', 'Ticket Submitted!')}</strong> ID: #{submittedTicketId}.{' '}
              {t('farmer.ticketRaisedNotice', 'We have logged your query and dispatched it to support.')}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              select
              label={t('farmer.issueCategory', 'Issue Category')}
              fullWidth
              value={ticketCategory}
              onChange={(e) => setTicketCategory(e.target.value)}
            >
              <MenuItem value="payout">{t('farmer.catPayout', 'Bank Payout / UTR Status')}</MenuItem>
              <MenuItem value="weighment">{t('farmer.catWeighment', 'Weighment & Loading Dispute')}</MenuItem>
              <MenuItem value="kyc_unlock">{t('farmer.catKyc', 'KYC & Bank Account Update Request')}</MenuItem>
              <MenuItem value="listing">{t('farmer.catListing', 'Crop Listing / Pricing Issue')}</MenuItem>
              <MenuItem value="general">{t('farmer.catGeneral', 'General Question')}</MenuItem>
            </TextField>

            <TextField
              label={t('farmer.ticketSubject', 'Brief Summary / Subject')}
              fullWidth
              required
              value={ticketSubject}
              onChange={(e) => setTicketSubject(e.target.value)}
              placeholder="e.g. UTR number not showing in SMS for Order #ORD-71932"
            />

            <TextField
              label={t('farmer.ticketDetails', 'Detailed Explanation')}
              multiline
              rows={4}
              fullWidth
              required
              value={ticketMessage}
              onChange={(e) => setTicketMessage(e.target.value)}
              placeholder="Please provide order number, batch details, or transporter vehicle details if applicable..."
            />

            <Button
              type="submit"
              variant="contained"
              startIcon={<MdSend />}
              sx={{
                bgcolor: '#2563EB',
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: 2,
                py: 1.2,
                mt: 1,
                '&:hover': { bgcolor: '#1D4ED8' },
              }}
            >
              {t('farmer.submitTicketBtn', 'Submit Ticket to Desk')}
            </Button>
          </Box>
        </Paper>

        {/* Guarantees and Direct Assistance */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: '1px solid #BBF7D0',
              bgcolor: '#F0FDF4',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <MdShield size={24} color="#16A34A" />
              <Typography variant="subtitle1" fontWeight={800} color="#166534">
                {t('farmer.kisanGuarantee', '100% Escrow Protection Guarantee')}
              </Typography>
            </Box>
            <Typography variant="body2" color="#14532D" sx={{ lineHeight: 1.6 }}>
              {t(
                'farmer.kisanGuaranteeDesc',
                'KhetSetu operates under strict RBI-compliant escrow guidelines. Produce is never dispatched without prior buyer funding, eliminating non-payment risks.'
              )}
            </Typography>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: '1px solid #E2E8F0',
              bgcolor: '#fff',
            }}
          >
            <Typography variant="subtitle2" fontWeight={800} color="#1E293B" sx={{ mb: 1 }}>
              {t('farmer.regionalCentersTitle', 'Regional Gujarat Field Offices')}
            </Typography>
            <Typography variant="body2" color="#64748B" sx={{ mb: 1.5, fontSize: '0.85rem' }}>
              • <strong>Rajkot Center:</strong> Near APMC Market Yard, Bedi Road, Rajkot
              <br />• <strong>Unjha Center:</strong> Spices Yard Main Gate, Unjha, Mehsana
              <br />• <strong>Gondal Center:</strong> Marketing Yard Complex, Gondal
            </Typography>
            <Typography variant="caption" color="#94A3B8">
              {t('farmer.walkinHours', 'Officers available for physical moisture & electronic weighment verification.')}
            </Typography>
          </Paper>
        </Box>
      </Box>

      {/* Frequently Asked Questions */}
      <Typography variant="h6" fontWeight={800} color="#1E293B" sx={{ mb: 2 }}>
        {t('farmer.faqTitle', 'Frequently Asked Questions (FAQ)')}
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {faqs.map((f, i) => (
          <Accordion
            key={i}
            elevation={0}
            sx={{
              borderRadius: '12px !important',
              border: '1px solid #E2E8F0',
              '&:before': { display: 'none' },
              bgcolor: '#fff',
            }}
          >
            <AccordionSummary expandIcon={<MdExpandMore />}>
              <Typography variant="subtitle2" fontWeight={700} color="#1E293B">
                {f.q}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0, pb: 2.5 }}>
              <Typography variant="body2" color="#475569" sx={{ lineHeight: 1.6 }}>
                {f.a}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Box>
  );
}
