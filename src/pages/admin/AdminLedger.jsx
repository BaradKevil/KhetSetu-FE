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
  Alert,
} from '@mui/material';
import { MdAccountTree, MdLock } from 'react-icons/md';
import { useGetLedgerQuery } from '../../Api/Api';

const AdminLedger = () => {
  const { data: ledgerData, isLoading } = useGetLedgerQuery();
  const entries = ledgerData?.items || [];

  return (
    <Box>
      <Box sx={{ mb: 3.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <Typography variant="h4" fontWeight={800} color="#0F172A">
            📜 Double-Entry Escrow Ledger
          </Typography>
          <Chip icon={<MdLock />} label="Immutable Append-Only" color="default" size="small" sx={{ fontWeight: 700 }} />
        </Box>
        <Typography variant="body2" color="text.secondary">
          Audit-grade ledger recording every movement of platform funds between Gateway, Escrow Hold, Farmer Payable, and Platform Revenue.
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3, borderRadius: 2.5 }}>
        All ledger entries are permanent and digitally sequenced. Entries cannot be altered or deleted under financial accounting standards.
      </Alert>

      <Paper elevation={0} sx={{ borderRadius: 3.5, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#F8FAF9' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Entry Ref</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Timestamp</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Debit Account</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Credit Account</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Amount (Paise / ₹)</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  Loading ledger entries...
                </TableCell>
              </TableRow>
            ) : entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">No ledger transactions recorded yet.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              entries.map((e) => (
                <TableRow key={e.id} hover>
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                    {e.entry_ref}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                    {new Date(e.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Chip label={e.debit_account} size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: '0.72rem' }} />
                  </TableCell>
                  <TableCell>
                    <Chip label={e.credit_account} size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: '0.72rem' }} />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#2E7D32' }}>
                    ₹{(e.amount_paise / 100).toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={e.type.replace('_', ' ').toUpperCase()}
                      size="small"
                      color={
                        e.type === 'escrow_inflow'
                          ? 'primary'
                          : e.type === 'farmer_payout'
                          ? 'success'
                          : 'default'
                      }
                      sx={{ fontWeight: 700, fontSize: '0.7rem' }}
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

export default AdminLedger;
