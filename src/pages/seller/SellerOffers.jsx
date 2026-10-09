import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import {
  MdLocalOffer,
  MdCheck,
  MdClose,
  MdReply,
  MdDescription,
  MdVerified,
  MdAccessTime,
} from 'react-icons/md';
import { useLanguage } from '../../context/LanguageContext';
import PageHeader from '../../common/custom/PageHeader';
import { formatINR } from '../../common/status';
import { toast } from 'react-toastify';

const mockOffers = [
  {
    id: 1,
    buyerName: 'Gujarat Agro Impex',
    buyerLocation: 'Ahmedabad, GJ',
    buyerRating: 4.8,
    crop: 'Garlic (GG-4)',
    quantity: '50 Quintal',
    listedPricePaise: 950000, // ₹9,500/Qtl
    offeredPricePaise: 910000, // ₹9,100/Qtl
    round: 1,
    expiresIn: '7h 20m',
    status: 'pending',
  },
];

const mockRFQs = [
  {
    id: 101,
    buyerName: 'Surat Grain Mills',
    buyerLocation: 'Surat, GJ',
    crop: 'Wheat (Sharbati)',
    gradeRequired: 'Grade A',
    requiredQuantity: '200 Quintal',
    targetBudgetPaise: 320000, // ₹3,200/Qtl
    deliveryLocation: 'Surat APMC Hub',
    postedOn: 'Today',
    status: 'open',
  },
  {
    id: 102,
    buyerName: 'Shree Ram Cotton Exports',
    buyerLocation: 'Rajkot, GJ',
    crop: 'Cotton (Shankar-6)',
    gradeRequired: 'Grade A',
    requiredQuantity: '150 Quintal',
    targetBudgetPaise: 740000, // ₹7,400/Qtl
    deliveryLocation: 'Gondal Yard',
    postedOn: 'Yesterday',
    status: 'open',
  },
];

const SellerOffers = () => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState('offers');

  const [counterModalOpen, setCounterModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [counterPrice, setCounterPrice] = useState('');

  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [selectedRFQ, setSelectedRFQ] = useState(null);
  const [quotePrice, setQuotePrice] = useState('');
  const [quoteQty, setQuoteQty] = useState('');

  const handleAcceptOffer = (offer) => {
    toast.success(`Accepted buyer offer of ${formatINR(offer.offeredPricePaise, true, language)}! Contract created.`);
  };

  const handleRejectOffer = (_offer) => {
    toast.info('Buyer offer declined.');
  };

  const handleOpenCounter = (offer) => {
    setSelectedOffer(offer);
    setCounterPrice(String(offer.offeredPricePaise / 100));
    setCounterModalOpen(true);
  };

  const handleConfirmCounter = () => {
    toast.success(`Counter offer of ₹${counterPrice}/Qtl submitted to buyer!`);
    setCounterModalOpen(false);
  };

  const handleOpenQuote = (rfq) => {
    setSelectedRFQ(rfq);
    setQuotePrice(String(rfq.targetBudgetPaise / 100));
    setQuoteQty('100');
    setQuoteModalOpen(true);
  };

  const handleConfirmQuote = () => {
    toast.success(`Sealed quote of ₹${quotePrice}/Qtl submitted to ${selectedRFQ?.buyerName}!`);
    setQuoteModalOpen(false);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      {/* 1. Header */}
      <PageHeader
        title={t('offers.title', '🤝 Buyer Offers & Matching RFQs')}
        subtitle={t('offers.subtitle', 'Negotiate wholesale prices directly with verified buyers and quote on matching crop requirements.')}
      />

      {/* 2. Tabs */}
      <Paper elevation={0} sx={{ p: 1.5, borderRadius: 3.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_e, val) => setActiveTab(val)}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              minHeight: 40,
            },
          }}
        >
          <Tab value="offers" label={`Offers on My Crops (${mockOffers.length})`} />
          <Tab value="rfq" label={`Matching Buyer RFQs (${mockRFQs.length})`} />
        </Tabs>
      </Paper>

      {/* Tab 1: Offers on My Listings */}
      {activeTab === 'offers' && (
        <Paper elevation={0} sx={{ borderRadius: 3.5, border: '1px solid #E2E8F0', overflow: 'hidden', bgcolor: '#FFFFFF' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Buyer Details</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Crop Lot</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Quantity</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Your Listed Price</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Buyer Offered Price</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Expires In</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#475569' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockOffers.map((o) => (
                <TableRow key={o.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <Typography variant="subtitle2" fontWeight={800} color="#0F172A">
                        {o.buyerName}
                      </Typography>
                      <MdVerified size={15} color="#16A34A" />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {o.buyerLocation} • Rating: {o.buyerRating} ★
                    </Typography>
                  </TableCell>

                  <TableCell sx={{ fontWeight: 700, color: '#0F172A' }}>{o.crop}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{o.quantity}</TableCell>

                  <TableCell sx={{ color: '#64748B' }}>
                    {formatINR(o.listedPricePaise, true, language)} / Qtl
                  </TableCell>

                  <TableCell sx={{ fontWeight: 800, color: '#2563EB' }}>
                    {formatINR(o.offeredPricePaise, true, language)} / Qtl
                  </TableCell>

                  <TableCell>
                    <Chip
                      icon={<MdAccessTime size={14} />}
                      label={o.expiresIn}
                      size="small"
                      sx={{ bgcolor: '#FEF3C7', color: '#B45309', fontWeight: 700, fontSize: '0.72rem' }}
                    />
                  </TableCell>

                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<MdCheck />}
                        onClick={() => handleAcceptOffer(o)}
                        sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 700 }}
                      >
                        Accept
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        startIcon={<MdReply />}
                        onClick={() => handleOpenCounter(o)}
                        sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 700 }}
                      >
                        Counter
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<MdClose />}
                        onClick={() => handleRejectOffer(o)}
                        sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 600 }}
                      >
                        Decline
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* Tab 2: Matching RFQs */}
      {activeTab === 'rfq' && (
        <Paper elevation={0} sx={{ borderRadius: 3.5, border: '1px solid #E2E8F0', overflow: 'hidden', bgcolor: '#FFFFFF' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Buyer Requirement</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Crop & Grade</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Required Quantity</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Target Budget</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Delivery Yard</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#475569' }}>Quote</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockRFQs.map((rfq) => (
                <TableRow key={rfq.id} hover>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={800} color="#0F172A">
                      {rfq.buyerName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {rfq.buyerLocation}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" fontWeight={700} color="#0F172A">
                      {rfq.crop}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {rfq.gradeRequired}
                    </Typography>
                  </TableCell>

                  <TableCell sx={{ fontWeight: 700, color: '#2563EB' }}>
                    {rfq.requiredQuantity}
                  </TableCell>

                  <TableCell sx={{ fontWeight: 700, color: '#16A34A' }}>
                    ~{formatINR(rfq.targetBudgetPaise, true, language)} / Qtl
                  </TableCell>

                  <TableCell sx={{ color: '#475569' }}>{rfq.deliveryLocation}</TableCell>

                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      onClick={() => handleOpenQuote(rfq)}
                      sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
                    >
                      Send Quote
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* Counter Offer Modal */}
      <Dialog open={counterModalOpen} onClose={() => setCounterModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Submit Counter Offer</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="#475569" sx={{ mb: 2 }}>
            Buyer {selectedOffer?.buyerName} offered {selectedOffer && formatINR(selectedOffer.offeredPricePaise, true, language)}/Qtl.
          </Typography>
          <TextField
            label="Your Counter Price (INR / Quintal) *"
            type="number"
            fullWidth
            size="small"
            value={counterPrice}
            onChange={(e) => setCounterPrice(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCounterModalOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleConfirmCounter} sx={{ fontWeight: 700 }}>
            Submit Counter Offer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Quote RFQ Modal */}
      <Dialog open={quoteModalOpen} onClose={() => setQuoteModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Submit Quote for RFQ #{selectedRFQ?.id}</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="#475569" sx={{ mb: 2 }}>
            Quoting on <strong>{selectedRFQ?.crop}</strong> for {selectedRFQ?.buyerName}.
          </Typography>
          <TextField
            label="Quoted Rate (INR / Quintal) *"
            type="number"
            fullWidth
            size="small"
            value={quotePrice}
            onChange={(e) => setQuotePrice(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            label="Available Quantity to Commit (Quintal) *"
            type="number"
            fullWidth
            size="small"
            value={quoteQty}
            onChange={(e) => setQuoteQty(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setQuoteModalOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleConfirmQuote} sx={{ fontWeight: 700 }}>
            Send Sealed Quote
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SellerOffers;
