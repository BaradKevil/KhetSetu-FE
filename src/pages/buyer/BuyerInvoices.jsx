import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Chip,
} from '@mui/material';
import {
  MdReceipt,
  MdPrint,
  MdDownload,
  MdAccountBalanceWallet,
  MdVerified,
  MdCheckCircle,
} from 'react-icons/md';
import { useGetBuyerOrdersQuery } from '../../Api/Api';
import { useLanguage } from '../../context/LanguageContext';
import PageHeader from '../../common/custom/PageHeader';
import KPICard from '../../common/custom/KPICard';
import StatusBadge from '../../common/custom/StatusBadge';

const BuyerInvoices = () => {
  const { t, formatCurrency, formatDate } = useLanguage();
  const { data: ordersData, isLoading } = useGetBuyerOrdersQuery();

  const orders = ordersData?.items || [];
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Compute Invoice Stats
  const totalSpendPaise = orders.reduce((sum, o) => sum + Number(o.total_paise || 0), 0);
  const totalEscrowFeePaise = orders.reduce((sum, o) => sum + Number(o.buyer_fee_paise || 0), 0);
  const settledOrdersCount = orders.filter((o) => ['delivered', 'completed'].includes(o.status)).length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      {/* Page Header */}
      <PageHeader
        title={t('buyer.invoicesTitle', '📄 Invoices & Escrow Statements')}
        subtitle={t('buyer.invoicesSubtitle', 'Download official Mandi GST tax invoices and platform escrow transaction statements.')}
      />

      {/* Overview Cards (Uniform full-width grid) */}
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
          label="Total Invoiced Value"
          value={formatCurrency(totalSpendPaise, true)}
          subtitle={`Across ${orders.length} Mandi orders`}
          icon={<MdReceipt />}
          color="blue"
        />
        <KPICard
          label="Escrow Protection Fees (0.5%)"
          value={formatCurrency(totalEscrowFeePaise, true)}
          subtitle="Institutional vault protected"
          icon={<MdAccountBalanceWallet />}
          color="cyan"
        />
        <KPICard
          label="Verified GST Settlements"
          value={settledOrdersCount}
          subtitle="Ready for ITC filing"
          icon={<MdVerified />}
          color="green"
        />
      </Box>

      {/* Invoices Table */}
      <Paper elevation={0} sx={{ borderRadius: 3.5, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Invoice #</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Order Ref</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Farmer / Seller</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Billing Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Produce Total</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                    No invoices generated yet. Place orders on Explore Mandi to see billing statements.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => {
                  const invoiceNum = `INV-KS-${String(order.id).padStart(6, '0')}`;
                  const sellerName = order.seller?.seller_profile?.full_name || order.seller?.seller_profile?.farm_name || 'Farmer Seller';

                  return (
                    <TableRow key={order.id} hover>
                      <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {invoiceNum}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {order.order_number}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {sellerName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.seller?.seller_profile?.district}, {order.seller?.seller_profile?.state}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {formatDate(order.created_at)}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>
                        {formatCurrency(order.total_paise, true)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={order.status} />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<MdReceipt />}
                          sx={{ borderRadius: 2, fontWeight: 700 }}
                          onClick={() => setSelectedInvoice(order)}
                        >
                          View Invoice
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Invoice Modal */}
      {selectedInvoice && (
        <Dialog
          open={Boolean(selectedInvoice)}
          onClose={() => setSelectedInvoice(null)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3.5, p: 2 } }}
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
            <Box>
              <Typography variant="h5" fontWeight={800} color="#0F172A">
                Mandi Tax Invoice
              </Typography>
              <Typography variant="caption" color="text.secondary">
                GSTIN: 24AAACG1234F1Z5 • KhetSetu Digital Mandi Settlement
              </Typography>
            </Box>
            <Chip label="ORIGINAL FOR RECIPIENT" color="success" size="small" sx={{ fontWeight: 800 }} />
          </DialogTitle>

          <DialogContent dividers sx={{ my: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  ISSUED BY (FARMER / SELLER)
                </Typography>
                <Typography variant="subtitle1" fontWeight={800} color="#0F172A">
                  {selectedInvoice.seller?.seller_profile?.full_name || 'Rameshwar Patel'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedInvoice.seller?.seller_profile?.village || 'Alampur'}, {selectedInvoice.seller?.seller_profile?.district || 'Mehsana'}, {selectedInvoice.seller?.seller_profile?.state || 'Gujarat'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Contact: {selectedInvoice.seller?.phone || '+91 98765 43210'}
                </Typography>
              </Box>

              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  BILLED TO (BUYER)
                </Typography>
                <Typography variant="subtitle1" fontWeight={800} color="#0F172A">
                  {selectedInvoice.buyer?.buyer_profile?.company_name || 'Agro Commodity Trader'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedInvoice.buyer?.buyer_profile?.contact_person || 'Jayesh Shah'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  GSTIN: {selectedInvoice.buyer?.buyer_profile?.gstin || '24AAACG1234F1Z5'}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={3} size={3}>
                <Typography variant="caption" color="text.secondary">Invoice Number</Typography>
                <Typography variant="subtitle2" fontWeight={700}>INV-KS-{String(selectedInvoice.id).padStart(6, '0')}</Typography>
              </Grid>
              <Grid item xs={3} size={3}>
                <Typography variant="caption" color="text.secondary">Order Reference</Typography>
                <Typography variant="subtitle2" fontWeight={700}>{selectedInvoice.order_number}</Typography>
              </Grid>
              <Grid item xs={3} size={3}>
                <Typography variant="caption" color="text.secondary">Invoice Date</Typography>
                <Typography variant="subtitle2" fontWeight={700}>{formatDate(selectedInvoice.created_at)}</Typography>
              </Grid>
              <Grid item xs={3} size={3}>
                <Typography variant="caption" color="text.secondary">Payment Mechanism</Typography>
                <Typography variant="subtitle2" fontWeight={700}>Institutional Escrow Vault</Typography>
              </Grid>
            </Grid>

            {/* Items Breakdown */}
            <TableContainer sx={{ my: 2, border: '1px solid #E2E8F0', borderRadius: 2 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Quantity</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Rate</TableCell>
                    <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>
                        Agricultural Produce Lot
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Standard Mandi HSN 1001 / Grade A Harvest
                      </Typography>
                    </TableCell>
                    <TableCell>{selectedInvoice.items?.[0]?.quantity || 1} Units</TableCell>
                    <TableCell>{formatCurrency(selectedInvoice.items?.[0]?.price_per_unit_paise || selectedInvoice.subtotal_paise, true)}</TableCell>
                    <TableCell sx={{ textAlign: 'right', fontWeight: 700 }}>
                      {formatCurrency(selectedInvoice.subtotal_paise || (selectedInvoice.total_paise - selectedInvoice.buyer_fee_paise), true)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={3} sx={{ color: 'text.secondary' }}>
                      Buyer Escrow Security & Vault Fee (0.5%)
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right', fontWeight: 700 }}>
                      {formatCurrency(selectedInvoice.buyer_fee_paise, true)}
                    </TableCell>
                  </TableRow>
                  <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                    <TableCell colSpan={3} sx={{ fontWeight: 800 }}>
                      Total Landed Settlement
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right', fontWeight: 800, fontSize: '1.05rem', color: 'primary.main' }}>
                      {formatCurrency(selectedInvoice.total_paise, true)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ p: 2, bgcolor: '#ECFDF5', borderRadius: 2, border: '1px solid #A7F3D0', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <MdCheckCircle color="#059669" size={20} />
              <Typography variant="caption" color="#065F46" fontWeight={700}>
                This transaction was processed with 100% Escrow buyer protection. Produce released from farmgate upon verification.
              </Typography>
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 3, pt: 1, pb: 2 }}>
            <Button onClick={() => setSelectedInvoice(null)} variant="outlined">
              Close
            </Button>
            <Button variant="contained" color="primary" startIcon={<MdPrint />} onClick={handlePrint}>
              Print Invoice
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default BuyerInvoices;
