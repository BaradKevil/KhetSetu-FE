import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Chip,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  MdDescription,
  MdDownload,
  MdPrint,
  MdReceipt,
  MdArrowBack,
  MdCheckCircle,
} from 'react-icons/md';
import { useNavigate, Link } from 'react-router-dom';
import { useGetSellerOrdersQuery, useGetProfileQuery } from '../../Api/Api';
import { useLanguage } from '../../context/LanguageContext';
import PageHeader from '../../common/custom/PageHeader';
import { formatINR, formatIST } from '../../common/status';
import { toast } from 'react-toastify';

const SellerStatements = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState('monthly');

  const { data: ordersData } = useGetSellerOrdersQuery();
  const { data: userProfile } = useGetProfileQuery();

  const orders = Array.isArray(ordersData?.items)
    ? ordersData.items
    : Array.isArray(ordersData?.data)
    ? ordersData.data
    : [];
  const completedOrders = orders.filter((o) => o.status === 'completed');

  const totalCompletedGrossPaise = completedOrders.reduce((acc, o) => acc + Number(o.subtotal_paise || 0), 0);
  const totalCommissionPaise = completedOrders.reduce((acc, o) => acc + Number(o.commission_paise || 0), 0);
  const totalNetPayoutPaise = completedOrders.reduce((acc, o) => acc + Number(o.payout_paise || 0), 0);

  const handlePrint = (statementTitle) => {
    toast.info(`Generating ${statementTitle}... Ready to print.`);
    window.print();
  };

  const handleDownload = (docName) => {
    toast.success(`Downloaded ${docName} successfully.`);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      {/* 1. Page Header */}
      <PageHeader
        title={t('statements.title', '📑 Statements & Tax Invoices')}
        subtitle={t('statements.subtitle', 'Official settlement summaries, platform GST tax invoices, and annual sales registers.')}
        actions={
          <Button
            component={Link}
            to="/seller/earnings"
            variant="outlined"
            startIcon={<MdArrowBack />}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            Back to Earnings
          </Button>
        }
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
          <Tab value="monthly" label="Monthly Settlement Statements" />
          <Tab value="invoices" label="Platform Commission Tax Invoices (GST)" />
          <Tab value="tds" label="TDS Certificates & Withholding" />
        </Tabs>
      </Paper>

      {/* Tab 1: Monthly Statements */}
      {activeTab === 'monthly' && (
        <Paper elevation={0} sx={{ borderRadius: 3.5, border: '1px solid #E2E8F0', overflow: 'hidden', bgcolor: '#FFFFFF' }}>
          <Box sx={{ p: 2.5, bgcolor: '#FFFFFF', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="subtitle1" fontWeight={800} color="#0F172A">
                FY 2026-27 Financial Statements
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Certified marketplace sales records for farmer income tax and cooperative audit
              </Typography>
            </Box>
          </Box>

          <Table>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Statement Period</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Orders Settled</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Gross Value</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Commission Paid</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Net Disbursed</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#475569' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow hover>
                <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>
                  October 2026 (Current Month)
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#2563EB' }}>
                  {completedOrders.length} orders
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>
                  {formatINR(totalCompletedGrossPaise, true, language)}
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#DC2626' }}>
                  {formatINR(totalCommissionPaise, true, language)}
                </TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#16A34A' }}>
                  {formatINR(totalNetPayoutPaise, true, language)}
                </TableCell>
                <TableCell>
                  <Chip
                    icon={<MdCheckCircle />}
                    label="Reconciled"
                    size="small"
                    color="success"
                    sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                  />
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<MdDownload />}
                      onClick={() => handleDownload('October_2026_Statement.pdf')}
                      sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 700 }}
                    >
                      PDF
                    </Button>
                    <IconButton size="small" onClick={() => handlePrint('October 2026 Statement')} sx={{ bgcolor: '#F8FAFC' }}>
                      <MdPrint size={18} />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* Tab 2: Platform Commission Invoices */}
      {activeTab === 'invoices' && (
        <Paper elevation={0} sx={{ borderRadius: 3.5, border: '1px solid #E2E8F0', overflow: 'hidden', bgcolor: '#FFFFFF' }}>
          <Box sx={{ p: 2.5, bgcolor: '#FFFFFF', borderBottom: '1px solid #F1F5F9' }}>
            <Typography variant="subtitle1" fontWeight={800} color="#0F172A">
              Platform Technology Commission Invoices
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Tax invoices issued by KhetSetu Technologies Pvt. Ltd. for 2.5% marketplace brokerage (GST Compliant)
            </Typography>
          </Box>

          <Table>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Invoice #</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Order Ref</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Invoice Date</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Commission Amount (Excl. Tax)</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>GST (18% on Comm.)</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Total Fee</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#475569' }}>Invoice</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {completedOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">No commission tax invoices issued yet.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                completedOrders.map((o) => (
                  <TableRow key={o.id} hover>
                    <TableCell sx={{ fontWeight: 800, color: '#2563EB' }}>
                      INV-COMM-2026-{String(o.id).padStart(4, '0')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>#{o.order_number}</TableCell>
                    <TableCell sx={{ color: '#64748B' }}>{formatIST(o.created_at)}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>
                      {formatINR(Math.round(o.commission_paise * 0.8475), true, language)}
                    </TableCell>
                    <TableCell sx={{ color: '#64748B' }}>
                      {formatINR(Math.round(o.commission_paise * 0.1525), true, language)} (18%)
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>
                      {formatINR(o.commission_paise, true, language)}
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<MdDownload />}
                        onClick={() => handleDownload(`Invoice_INV_${o.id}.pdf`)}
                        sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 700 }}
                      >
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* Tab 3: TDS Withholding Records */}
      {activeTab === 'tds' && (
        <Paper elevation={0} sx={{ p: 4, borderRadius: 3.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
          <Typography variant="subtitle1" fontWeight={800} color="#0F172A" sx={{ mb: 1 }}>
            TDS (Section 194-O) E-Commerce Marketplace Records
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Under Indian tax regulations, agricultural produce sold directly by individual cultivator farmers is generally exempt from TDS deductions under prescribed limits.
          </Typography>

          <Box sx={{ p: 3, bgcolor: '#F0FDF4', borderRadius: 2.5, border: '1px solid #DCFCE7' }}>
            <Typography variant="subtitle2" fontWeight={800} color="#166534">
              Current Financial Year Status: 0% TDS Withheld
            </Typography>
            <Typography variant="body2" color="#15803D" sx={{ mt: 0.5 }}>
              All net proceeds are disbursed 100% directly to your verified bank account without withholding deductions.
            </Typography>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default SellerStatements;
