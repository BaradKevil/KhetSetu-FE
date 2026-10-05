import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  IconButton,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { MdAddCircleOutline, MdVisibility } from 'react-icons/md';
import { useGetSellerProductsQuery } from '../../Api/Api';

const MyProducts = () => {
  const { data: productsData, isLoading } = useGetSellerProductsQuery();
  const products = productsData?.items || [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3.5 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="#0F172A">
            🌾 My Crop Listings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your crops listed on KhetSetu Mandi.
          </Typography>
        </Box>
        <Button
          component={Link}
          to="/seller/products/new"
          variant="contained"
          color="primary"
          startIcon={<MdAddCircleOutline />}
          sx={{ borderRadius: 2.5, fontWeight: 700 }}
        >
          Add Crop
        </Button>
      </Box>

      <Paper elevation={0} sx={{ borderRadius: 3.5, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#F8FAF9' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Crop & Variety</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Grade</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Available Stock</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Price</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  Loading crops...
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">No crops listed yet.</Typography>
                  <Button component={Link} to="/seller/products/new" sx={{ mt: 1 }} variant="outlined" size="small">
                    List Your First Crop
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              products.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {p.crop?.name} ({p.variety})
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {p.pickup_village}, {p.pickup_district}
                    </Typography>
                  </TableCell>
                  <TableCell>{p.grade}</TableCell>
                  <TableCell>
                    {p.available_quantity} {p.unit}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#2E7D32' }}>
                    ₹{(p.price_per_unit_paise / 100).toFixed(0)}/{p.unit}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={p.status.toUpperCase()}
                      size="small"
                      color={p.status === 'live' ? 'success' : 'default'}
                      variant={p.status === 'live' ? 'filled' : 'outlined'}
                      sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton component={Link} to={`/market/${p.id}`} size="small" color="primary">
                      <MdVisibility />
                    </IconButton>
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

export default MyProducts;
