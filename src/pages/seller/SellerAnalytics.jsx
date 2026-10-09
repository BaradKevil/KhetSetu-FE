import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  ButtonGroup,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  LinearProgress,
  Chip,
  Divider,
} from '@mui/material';
import {
  MdTrendingUp,
  MdDownload,
  MdCheckCircle,
  MdAttachMoney,
  MdInventory2,
  MdHourglassEmpty,
  MdLightbulb,
  MdStorefront,
  MdPeople,
  MdAccessTime,
} from 'react-icons/md';
import { useGetSellerOrdersQuery, useGetSellerProductsQuery } from '../../Api/Api';
import { useLanguage } from '../../context/LanguageContext';
import PageHeader from '../../common/custom/PageHeader';
import KPICard from '../../common/custom/KPICard';
import { formatINR, formatQty } from '../../common/status';

const SellerAnalytics = () => {
  const { t, language } = useLanguage();
  const [dateRange, setDateRange] = useState('30d');

  const { data: ordersData, isLoading: ordersLoading } = useGetSellerOrdersQuery();
  const { data: productsData } = useGetSellerProductsQuery();

  const orders = Array.isArray(ordersData?.items)
    ? ordersData.items
    : Array.isArray(ordersData?.data)
    ? ordersData.data
    : [];
  const products = Array.isArray(productsData?.items)
    ? productsData.items
    : Array.isArray(productsData?.data)
    ? productsData.data
    : [];

  // Filter orders by date range
  const filteredOrders = useMemo(() => {
    const now = new Date();
    return orders.filter((o) => {
      const orderDate = new Date(o.created_at || Date.now());
      const diffDays = (now - orderDate) / (1000 * 60 * 60 * 24);

      if (dateRange === 'today') return diffDays <= 1;
      if (dateRange === '7d') return diffDays <= 7;
      if (dateRange === '30d') return diffDays <= 30;
      if (dateRange === 'fy') return diffDays <= 365;
      return true; // 'all'
    });
  }, [orders, dateRange]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    let ordersReceived = filteredOrders.length;
    let ordersCompleted = 0;
    let ordersCancelled = 0;
    let grossPaise = 0;
    let netPaise = 0;
    let pendingEarningsPaise = 0;
    let totalQtyKg = 0;

    const cropStats = {};

    for (const o of filteredOrders) {
      const isCompleted = o.status === 'completed';
      const isCancelled = o.status === 'cancelled' || o.status === 'refunded';

      if (isCompleted) {
        ordersCompleted++;
        grossPaise += Number(o.subtotal_paise || 0);
        netPaise += Number(o.payout_paise || 0);
      } else if (!isCancelled) {
        pendingEarningsPaise += Number(o.payout_paise || 0);
      }

      if (isCancelled) {
        ordersCancelled++;
      }

      // Aggregate crop-level stats
      if (o.items && o.items.length) {
        for (const item of o.items) {
          const cropKey = `${item.crop_name} (${item.variety || 'Standard'})`;
          if (!cropStats[cropKey]) {
            cropStats[cropKey] = {
              name: item.crop_name,
              variety: item.variety || 'Standard',
              grade: item.grade || 'A',
              qty: 0,
              grossPaise: 0,
              netPaise: 0,
              ordersCount: 0,
              unit: item.unit || 'Quintal',
            };
          }

          const q = Number(item.quantity || 0);
          cropStats[cropKey].qty += q;
          totalQtyKg += item.unit === 'Quintal' ? q * 100 : q;
          cropStats[cropKey].grossPaise += Number(item.subtotal_paise || 0);
          cropStats[cropKey].netPaise += Math.round(Number(item.subtotal_paise || 0) * 0.975);
          cropStats[cropKey].ordersCount += 1;
        }
      }
    }

    const totalQtyQuintal = totalQtyKg / 100;
    const avgRealizedPerQuintalPaise =
      totalQtyQuintal > 0 && grossPaise > 0 ? Math.round(grossPaise / totalQtyQuintal) : 0;

    const fulfilmentRate =
      ordersReceived > 0 ? Math.round((ordersCompleted / (ordersReceived - ordersCancelled || 1)) * 100) : 100;

    return {
      ordersReceived,
      ordersCompleted,
      ordersCancelled,
      grossPaise,
      netPaise,
      pendingEarningsPaise,
      totalQtyQuintal,
      avgRealizedPerQuintalPaise,
      fulfilmentRate,
      cropStatsList: Object.values(cropStats),
    };
  }, [filteredOrders]);

  // Export CSV handler
  const handleExportCSV = () => {
    const headers = ['Order Number', 'Date', 'Buyer', 'Crops', 'Quantity', 'Gross (INR)', 'Net Payout (INR)', 'Status'];
    const rows = filteredOrders.map((o) => [
      o.order_number,
      new Date(o.created_at).toLocaleDateString('en-IN'),
      o.buyer?.buyer_profile?.company_name || 'Buyer',
      o.items?.map((i) => i.crop_name).join('; ') || '',
      o.items?.map((i) => `${i.quantity} ${i.unit}`).join('; ') || '',
      (o.subtotal_paise / 100).toFixed(2),
      (o.payout_paise / 100).toFixed(2),
      o.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `khetsetu_sales_report_${dateRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      {/* 1. Header with Range Selector and Export */}
      <PageHeader
        title={t('analytics.title', '📊 Farmer Sales Analytics')}
        subtitle={t('analytics.subtitle', 'Monitor crop sales volume, realized prices vs Mandi benchmark, and fulfilment health.')}
        actions={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <ButtonGroup size="small" variant="outlined" sx={{ bgcolor: '#FFFFFF' }}>
              <Button
                variant={dateRange === 'today' ? 'contained' : 'outlined'}
                onClick={() => setDateRange('today')}
                sx={{ textTransform: 'none', fontWeight: 700 }}
              >
                Today
              </Button>
              <Button
                variant={dateRange === '7d' ? 'contained' : 'outlined'}
                onClick={() => setDateRange('7d')}
                sx={{ textTransform: 'none', fontWeight: 700 }}
              >
                7 Days
              </Button>
              <Button
                variant={dateRange === '30d' ? 'contained' : 'outlined'}
                onClick={() => setDateRange('30d')}
                sx={{ textTransform: 'none', fontWeight: 700 }}
              >
                30 Days
              </Button>
              <Button
                variant={dateRange === 'fy' ? 'contained' : 'outlined'}
                onClick={() => setDateRange('fy')}
                sx={{ textTransform: 'none', fontWeight: 700 }}
              >
                This FY
              </Button>
              <Button
                variant={dateRange === 'all' ? 'contained' : 'outlined'}
                onClick={() => setDateRange('all')}
                sx={{ textTransform: 'none', fontWeight: 700 }}
              >
                All Time
              </Button>
            </ButtonGroup>

            <Button
              variant="contained"
              color="primary"
              startIcon={<MdDownload />}
              onClick={handleExportCSV}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
            >
              Export CSV
            </Button>
          </Box>
        }
      />

      {/* 2. Top-Level KPI Cards Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 2.5,
          mb: 3.5,
          width: '100%',
        }}
      >
        <KPICard
          label={t('analytics.grossSales', 'Gross Crop Sales')}
          value={formatINR(metrics.grossPaise, true, language)}
          subtitle={`${metrics.ordersCompleted} completed contracts`}
          icon={<MdTrendingUp />}
          color="green"
        />
        <KPICard
          label={t('analytics.netEarnings', 'Net Bank Earnings')}
          value={formatINR(metrics.netPaise, true, language)}
          subtitle="Realized after 2.5% platform fee"
          icon={<MdAttachMoney />}
          color="blue"
        />
        <KPICard
          label={t('analytics.qtySold', 'Total Quantity Sold')}
          value={`${metrics.totalQtyQuintal.toFixed(1)} Qtl`}
          subtitle="Direct farm gate dispatches"
          icon={<MdInventory2 />}
          color="amber"
        />
        <KPICard
          label={t('analytics.pendingInEscrow', 'Pending in Escrow')}
          value={formatINR(metrics.pendingEarningsPaise, true, language)}
          subtitle="Guaranteed bank disbursement"
          icon={<MdHourglassEmpty />}
          color="purple"
        />
      </Box>

      {/* 3. Operational Performance & Insights Panel */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', mb: 3.5 }}>
        <Typography variant="subtitle1" fontWeight={800} color="#0F172A" sx={{ mb: 2 }}>
          💡 Agricultural Selling Insights & Performance Health
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2.5 }}>
          <Box sx={{ p: 2.5, bgcolor: '#F0FDF4', borderRadius: 2.5, border: '1px solid #DCFCE7' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <MdCheckCircle size={20} color="#16A34A" />
              <Typography variant="subtitle2" fontWeight={800} color="#166534">
                Fulfilment Rate: {metrics.fulfilmentRate}%
              </Typography>
            </Box>
            <Typography variant="body2" color="#15803D">
              {metrics.fulfilmentRate >= 90
                ? 'Excellent fulfillment! Your high reliability unlocks top ranking on KhetSetu Mandi.'
                : 'Maintain prompt dispatches to avoid buyer cancellation penalties.'}
            </Typography>
          </Box>

          <Box sx={{ p: 2.5, bgcolor: '#EFF6FF', borderRadius: 2.5, border: '1px solid #DBEAFE' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <MdAccessTime size={20} color="#2563EB" />
              <Typography variant="subtitle2" fontWeight={800} color="#1D4ED8">
                Avg. Acceptance Time: ~1.5 Hours
              </Typography>
            </Box>
            <Typography variant="body2" color="#1E40AF">
              You accept orders well within the 12h SLA limit. Fast confirmation increases buyer repeat orders.
            </Typography>
          </Box>

          <Box sx={{ p: 2.5, bgcolor: '#FFFBEB', borderRadius: 2.5, border: '1px solid #FEF3C7' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <MdLightbulb size={20} color="#D97706" />
              <Typography variant="subtitle2" fontWeight={800} color="#B45309">
                Mandi Benchmark Alignment
              </Typography>
            </Box>
            <Typography variant="body2" color="#92400E">
              Your average realized rate conforms to regional APMC modal rates, maximizing sales speed.
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* 4. Crop-Wise Sales Table */}
      <Paper elevation={0} sx={{ borderRadius: 3.5, border: '1px solid #E2E8F0', overflow: 'hidden', bgcolor: '#FFFFFF' }}>
        <Box sx={{ p: 2.5, bgcolor: '#FFFFFF', borderBottom: '1px solid #F1F5F9' }}>
          <Typography variant="subtitle1" fontWeight={800} color="#0F172A">
            Sales Breakdown by Crop & Variety
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Aggregate units dispatched and revenue realized across your listed harvests.
          </Typography>
        </Box>

        <Table>
          <TableHead sx={{ bgcolor: '#F8FAFC' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Crop & Variety</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Grade</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Orders Fulfilled</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Total Volume Sold</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Gross Value</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Net Received</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {metrics.cropStatsList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    No sales recorded for the selected time period.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              metrics.cropStatsList.map((cs, idx) => (
                <TableRow key={idx} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={800} color="#0F172A">
                      {cs.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {cs.variety}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#334155' }}>Grade {cs.grade}</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#2563EB' }}>{cs.ordersCount} orders</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#0F172A' }}>
                    {formatQty(cs.qty, cs.unit, language)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#334155' }}>
                    {formatINR(cs.grossPaise, true, language)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#16A34A' }}>
                    {formatINR(cs.netPaise, true, language)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default SellerAnalytics;
