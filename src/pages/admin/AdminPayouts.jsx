import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
} from '@mui/material';
import { useGetPayoutsQuery } from '../../Api/Api';
import { useLanguage } from '../../context/LanguageContext';

const AdminPayouts = () => {
  const { t, formatCurrency } = useLanguage();
  const { data: payoutsData, isLoading } = useGetPayoutsQuery();
  const payouts = payoutsData?.items || [];

  return (
    <Box>
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h4" fontWeight={800} color="#0F172A">
          {t('admin.payoutQueueTitle', '💳 Farmer Payout Queue & Bank Settlements')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('admin.payoutQueueSubtitle', 'Overview of direct bank payouts released from escrow to farmer bank accounts.')}
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ borderRadius: 3.5, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#F8FAF9' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>{t('admin.payoutId', 'Payout ID')}</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>{t('admin.farmerBeneficiary', 'Farmer Beneficiary')}</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>{t('admin.bankRefUtr', 'Bank Reference / UTR')}</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>{t('admin.amountReleased', 'Amount Released (₹)')}</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>{t('common.status', 'Status')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  {t('admin.loadingPayouts', 'Loading payouts...')}
                </TableCell>
              </TableRow>
            ) : payouts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">{t('admin.noPayouts', 'No bank payouts in queue.')}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              payouts.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                    {p.payout_number}
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {p.seller?.seller_profile?.full_name || t('navigation.farmerSeller', 'Farmer')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {p.seller?.seller_profile?.bank_name} ({p.seller?.seller_profile?.masked_account})
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                    {p.utr_number || p.bank_reference || 'Processing...'}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#2E7D32' }}>
                    {formatCurrency(p.amount_paise, true)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={p.status.toUpperCase()}
                      size="small"
                      color={p.status === 'completed' || p.status === 'approved' ? 'success' : 'default'}
                      sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                    />
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

export default AdminPayouts;
