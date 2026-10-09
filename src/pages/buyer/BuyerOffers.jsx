import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import {
  MdLocalOffer,
  MdCheckCircle,
  MdCancel,
  MdHourglassEmpty,
  MdArrowForward,
  MdStorefront,
  MdSwapHoriz,
  MdHandshake,
} from 'react-icons/md';
import { useLanguage } from '../../context/LanguageContext';
import { toast } from 'react-toastify';
import PageHeader from '../../common/custom/PageHeader';
import KPICard from '../../common/custom/KPICard';

const INITIAL_OFFERS = [
  {
    id: 'OFF-82910',
    product_id: 30001,
    crop_name: 'Garlic (लहसुन)',
    variety: 'Gujarat Garlic-4 (GG-4)',
    farmer_name: 'Rameshwar Patel',
    farmer_location: 'Alampur, Mehsana, Gujarat',
    original_price: 120, // INR per kg
    offered_price: 110, // INR per kg
    quantity: 50,
    unit: 'Kg',
    status: 'accepted', // 'pending' | 'accepted' | 'countered' | 'rejected'
    farmer_counter_price: null,
    created_at: '2026-10-08T10:15:00Z',
    notes: 'Bulk purchase for retail godown stocking.',
  },
  {
    id: 'OFF-82914',
    product_id: 1002,
    crop_name: 'Basmati Rice',
    variety: 'Basmati 1121 Super',
    farmer_name: 'Gurpreet Singh',
    farmer_location: 'Karnal, Haryana',
    original_price: 3850, // INR per Quintal
    offered_price: 3600,
    quantity: 25,
    unit: 'Quintal',
    status: 'countered',
    farmer_counter_price: 3720,
    created_at: '2026-10-07T14:30:00Z',
    notes: 'Looking for prompt farmgate dispatch.',
  },
  {
    id: 'OFF-82920',
    product_id: 1005,
    crop_name: 'Wheat (गेहूं)',
    variety: 'Lokwan Golden',
    farmer_name: 'Dinesh Choudhary',
    farmer_location: 'Indore, Madhya Pradesh',
    original_price: 2750,
    offered_price: 2500,
    quantity: 100,
    unit: 'Quintal',
    status: 'pending',
    farmer_counter_price: null,
    created_at: '2026-10-08T08:00:00Z',
    notes: 'Annual mill flour requirement.',
  },
];

const INITIAL_RFQ_QUOTES = [
  {
    id: 'QUO-44120',
    rfq_id: 'RFQ-9921',
    rfq_crop: 'Mustard (सरसों)',
    variety: 'Pusa Bold Grade A',
    farmer_name: 'Bhagwan Das Sharma',
    farmer_phone: '+91 98290 XXXXX',
    location: 'Bharatpur, Rajasthan',
    quoted_rate: 5400, // per quintal
    quantity_offered: 200,
    unit: 'Quintal',
    dispatch_days: 2,
    moisture: '7.8%',
    status: 'received',
  },
  {
    id: 'QUO-44125',
    rfq_id: 'RFQ-9921',
    rfq_crop: 'Mustard (सरसों)',
    variety: 'Pusa Bold Grade A',
    farmer_name: 'Ramji Lal Meena',
    farmer_phone: '+91 94140 XXXXX',
    location: 'Alwar, Rajasthan',
    quoted_rate: 5350,
    quantity_offered: 150,
    unit: 'Quintal',
    dispatch_days: 3,
    moisture: '8.1%',
    status: 'received',
  },
];

const BuyerOffers = () => {
  const { t, formatCurrency, formatDate } = useLanguage();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(0); // 0: Listing Offers, 1: RFQ Quotes
  const [offers, setOffers] = useState(INITIAL_OFFERS);
  const [quotes, setQuotes] = useState(INITIAL_RFQ_QUOTES);

  // Counter acceptance modal
  const [selectedCounter, setSelectedCounter] = useState(null);

  const getStatusChip = (status) => {
    switch (status) {
      case 'accepted':
        return (
          <Chip
            icon={<MdCheckCircle size={16} />}
            label="ACCEPTED BY FARMER"
            color="success"
            size="small"
            sx={{ fontWeight: 800, fontSize: '0.72rem' }}
          />
        );
      case 'countered':
        return (
          <Chip
            icon={<MdSwapHoriz size={16} />}
            label="FARMER COUNTER OFFER"
            color="warning"
            size="small"
            sx={{ fontWeight: 800, fontSize: '0.72rem' }}
          />
        );
      case 'rejected':
        return (
          <Chip
            icon={<MdCancel size={16} />}
            label="OFFER DECLINED"
            color="error"
            size="small"
            sx={{ fontWeight: 800, fontSize: '0.72rem' }}
          />
        );
      default:
        return (
          <Chip
            icon={<MdHourglassEmpty size={16} />}
            label="PENDING FARMER REVIEW"
            size="small"
            sx={{ bgcolor: '#F1F5F9', color: '#475569', fontWeight: 800, fontSize: '0.72rem' }}
          />
        );
    }
  };

  const handleAcceptCounter = (offer) => {
    setOffers((prev) =>
      prev.map((o) => (o.id === offer.id ? { ...o, status: 'accepted', offered_price: o.farmer_counter_price } : o))
    );
    setSelectedCounter(null);
    toast.success('Counter offer agreed! You can now proceed to Escrow Checkout.');
  };

  const handleAcceptQuote = (quote) => {
    toast.success(`Accepted quote #${quote.id} from ${quote.farmer_name}. Escrow allocation reserved!`);
    navigate('/buyer/checkout');
  };

  const totalNegotiations = offers.length + quotes.length;
  const acceptedDeals =
    offers.filter((o) => o.status === 'accepted').length +
    quotes.filter((q) => q.status === 'accepted').length;
  const activeCounters = offers.filter((o) => o.status === 'countered' || o.status === 'pending').length;

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      {/* Page Header */}
      <PageHeader
        title={t('buyer.quotesOffersTitle', '💼 Quotes & Negotiations')}
        subtitle={t('buyer.quotesOffersSubtitle', 'Track direct price counter-offers on live harvest lots and bulk quotes from verified farmers.')}
      />

      {/* KPI Cards Row (Uniform full-width grid) */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          gap: 2.5,
          mb: 3.5,
          width: '100%',
        }}
      >
        <KPICard
          label="Total Negotiations"
          value={totalNegotiations}
          subtitle="Offers and RFQ bids"
          icon={<MdHandshake />}
          color="blue"
        />
        <KPICard
          label="Accepted Deals"
          value={acceptedDeals}
          subtitle="Agreed terms"
          icon={<MdCheckCircle />}
          color="green"
        />
        <KPICard
          label="Active Negotiations"
          value={activeCounters}
          subtitle="Awaiting response"
          icon={<MdSwapHoriz />}
          color="amber"
        />
      </Box>

      {/* Tabs */}
      <Paper elevation={0} sx={{ mb: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          indicatorColor="primary"
          textColor="primary"
          sx={{ px: 2 }}
        >
          <Tab
            label={`${t('buyer.listingOffersTab', 'Counter Offers on Lots')} (${offers.length})`}
            icon={<MdLocalOffer size={18} />}
            iconPosition="start"
            sx={{ fontWeight: 700 }}
          />
          <Tab
            label={`${t('buyer.rfqQuotesTab', 'Quotes Received on RFQs')} (${quotes.length})`}
            icon={<MdStorefront size={18} />}
            iconPosition="start"
            sx={{ fontWeight: 700 }}
          />
        </Tabs>
      </Paper>

      {/* TAB 0: Listing Counter Offers */}
      {activeTab === 0 && (
        <Grid container spacing={2.5}>
          {offers.map((offer) => {
            const totalPaise = offer.offered_price * offer.quantity * 100;
            const originalPaise = offer.original_price * offer.quantity * 100;

            return (
              <Grid item xs={12} md={6} size={{ xs: 12, md: 6 }} key={offer.id}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 3.5,
                    border: '1px solid #E2E8F0',
                    transition: 'all 0.2s ease',
                    '&:hover': { boxShadow: '0 8px 20px rgba(0,0,0,0.05)' },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={700}>
                          {offer.crop_name} • {offer.id}
                        </Typography>
                        <Typography variant="h6" fontWeight={800} color="#0F172A">
                          {offer.variety}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          🌾 {offer.farmer_name} • {offer.farmer_location}
                        </Typography>
                      </Box>
                      {getStatusChip(offer.status)}
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={4} size={4}>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          Lot Listed Rate
                        </Typography>
                        <Typography variant="body1" fontWeight={700} color="#64748B" sx={{ textDecoration: 'line-through' }}>
                          ₹{offer.original_price} / {offer.unit}
                        </Typography>
                      </Grid>
                      <Grid item xs={4} size={4}>
                        <Typography variant="caption" color="primary.main" fontWeight={700}>
                          Your Offer Rate
                        </Typography>
                        <Typography variant="h6" fontWeight={800} color="primary.main">
                          ₹{offer.offered_price} / {offer.unit}
                        </Typography>
                      </Grid>
                      <Grid item xs={4} size={4}>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          Total Volume
                        </Typography>
                        <Typography variant="body1" fontWeight={800}>
                          {offer.quantity} {offer.unit}
                        </Typography>
                      </Grid>
                    </Grid>

                    {offer.status === 'countered' && offer.farmer_counter_price && (
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          mb: 2,
                          bgcolor: '#FFFBEB',
                          border: '1px solid #FDE68A',
                          borderRadius: 2.5,
                        }}
                      >
                        <Typography variant="subtitle2" fontWeight={800} color="#92400E">
                          Farmer Counter-Proposed: ₹{offer.farmer_counter_price} / {offer.unit}
                        </Typography>
                        <Typography variant="caption" color="#B45309" sx={{ display: 'block', mb: 1.5 }}>
                          The farmer agreed to a discount of ₹{offer.original_price - offer.farmer_counter_price}/{offer.unit}.
                        </Typography>
                        <Button
                          variant="contained"
                          color="warning"
                          size="small"
                          sx={{ fontWeight: 700, borderRadius: 2 }}
                          onClick={() => handleAcceptCounter(offer)}
                        >
                          Accept ₹{offer.farmer_counter_price}/{offer.unit} Rate
                        </Button>
                      </Paper>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Escrow Landed Commitment:
                        </Typography>
                        <Typography variant="subtitle1" fontWeight={800} color="#0F172A">
                          {formatCurrency(totalPaise, true)}
                        </Typography>
                      </Box>

                      {offer.status === 'accepted' ? (
                        <Button
                          component={Link}
                          to="/buyer/checkout"
                          variant="contained"
                          color="success"
                          endIcon={<MdArrowForward />}
                          sx={{ borderRadius: 2.5, fontWeight: 700 }}
                        >
                          Proceed to Checkout
                        </Button>
                      ) : (
                        <Button
                          component={Link}
                          to={`/buyer/listings/${offer.product_id}`}
                          variant="outlined"
                          size="small"
                          sx={{ borderRadius: 2, fontWeight: 600 }}
                        >
                          View Original Lot
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* TAB 1: RFQ Farmer Quotes */}
      {activeTab === 1 && (
        <Grid container spacing={2.5}>
          {quotes.map((quote) => (
            <Grid item xs={12} md={6} size={{ xs: 12, md: 6 }} key={quote.id}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3.5,
                  border: '1px solid #E2E8F0',
                  transition: 'all 0.2s ease',
                  '&:hover': { boxShadow: '0 8px 20px rgba(0,0,0,0.05)' },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Box>
                      <Chip label={quote.rfq_id} size="small" sx={{ mb: 1, fontWeight: 700 }} />
                      <Typography variant="h6" fontWeight={800} color="#0F172A">
                        {quote.rfq_crop} • {quote.variety}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        👨‍🌾 {quote.farmer_name} • {quote.location}
                      </Typography>
                    </Box>
                    <Chip label="NEW QUOTE" size="small" color="primary" sx={{ fontWeight: 800 }} />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={4} size={4}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Quoted Price
                      </Typography>
                      <Typography variant="h6" fontWeight={800} color="#2E7D32">
                        ₹{quote.quoted_rate} / {quote.unit}
                      </Typography>
                    </Grid>
                    <Grid item xs={4} size={4}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Offered Volume
                      </Typography>
                      <Typography variant="body1" fontWeight={800}>
                        {quote.quantity_offered} {quote.unit}
                      </Typography>
                    </Grid>
                    <Grid item xs={4} size={4}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Farmgate Dispatch
                      </Typography>
                      <Typography variant="body1" fontWeight={700}>
                        Within {quote.dispatch_days} days
                      </Typography>
                    </Grid>
                  </Grid>

                  <Box sx={{ p: 1.5, bgcolor: '#F8FAF9', borderRadius: 2, mb: 2.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Moisture Certified: <strong>{quote.moisture}</strong> • Verified Farm Pickup
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      endIcon={<MdCheckCircle />}
                      sx={{ borderRadius: 2.5, fontWeight: 700 }}
                      onClick={() => handleAcceptQuote(quote)}
                    >
                      Accept Quote & Lock Escrow
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default BuyerOffers;
