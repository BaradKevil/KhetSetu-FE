import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  IconButton,
  Divider,
} from '@mui/material';
import {
  MdNotifications,
  MdShoppingCart,
  MdAccountBalance,
  MdVerified,
  MdCheck,
  MdDeleteOutline,
  MdArrowForward,
  MdDoneAll,
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { formatIST } from '../../common/status';
import PageHeader from '../../common/custom/PageHeader';
import { toast } from 'react-toastify';

export default function SellerNotifications() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([
    {
      id: 'NOTIF-01',
      type: 'order',
      title: t('farmer.notifNewOrderTitle', 'New Order Received: ₹97,500 in Escrow'),
      message: t(
        'farmer.notifNewOrderMsg',
        'Buyer submitted full payment for 10 Quintals of Groundnut (GG-20). Please confirm and accept order within 24 hours.'
      ),
      time: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      read: false,
      link: '/seller/orders',
      actionLabel: t('farmer.acceptOrderAction', 'Review Order'),
      badgeColor: '#2563EB',
    },
    {
      id: 'NOTIF-02',
      type: 'payout',
      title: t('farmer.notifPayoutTitle', 'Bank Payout Dispatched: UTR #HDFC0091823'),
      message: t(
        'farmer.notifPayoutMsg',
        'Net payout of ₹97,500 has been credited to your verified State Bank of India account. Commission ₹2,500 deducted with 0 hidden fees.'
      ),
      time: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      read: false,
      link: '/seller/earnings',
      actionLabel: t('farmer.viewPayoutAction', 'View Bank Statement'),
      badgeColor: '#16A34A',
    },
    {
      id: 'NOTIF-03',
      type: 'kyc',
      title: t('farmer.notifKycTitle', 'Govt Land Record (7/12) Authenticated'),
      message: t(
        'farmer.notifKycMsg',
        'District revenue verification officer approved your Satbara RoR. Your verified badge is live on buyer marketplaces.'
      ),
      time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      read: true,
      link: '/seller/profile',
      actionLabel: t('farmer.viewKycAction', 'View Farm Profile'),
      badgeColor: '#16A34A',
    },
    {
      id: 'NOTIF-04',
      type: 'rfq',
      title: t('farmer.notifRfqTitle', 'New Wholesale Requirement Posted in Saurashtra'),
      message: t(
        'farmer.notifRfqMsg',
        'Rajkot Agro Mill posted requirement for 150 Quintals of Shankar-6 Cotton. Submit your quote to secure contract.'
      ),
      time: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      read: true,
      link: '/seller/offers',
      actionLabel: t('farmer.quoteRfqAction', 'Submit Quote'),
      badgeColor: '#9333EA',
    },
  ]);

  const [activeFilter, setActiveFilter] = useState('all'); // all, unread

  const filtered = notifications.filter((n) => {
    if (activeFilter === 'unread') return !n.read;
    return true;
  });

  const handleMarkAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success(t('farmer.allMarkedRead', 'All notifications marked as read.'));
  };

  const handleDelete = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <Box sx={{ maxWidth: '1000px', mx: 'auto', p: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <PageHeader
          title={t('farmer.notificationsTitle', '🔔 Notification Center & Alerts')}
          subtitle={t(
            'farmer.notificationsSubtitle',
            'Real-time escrow updates, fulfillment dispatch reminders, and verified payout credits.'
          )}
          showBack={true}
        />

        <Button
          variant="outlined"
          startIcon={<MdDoneAll />}
          onClick={handleMarkAllRead}
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: 2,
            borderColor: '#CBD5E1',
            color: '#475569',
            '&:hover': { bgcolor: '#F8FAFC', borderColor: '#94A3B8' },
          }}
        >
          {t('farmer.markAllAsRead', 'Mark All Read')}
        </Button>
      </Box>

      {/* Filter Tabs */}
      <Box sx={{ display: 'flex', gap: 1, my: 3 }}>
        {[
          { id: 'all', label: t('common.all', 'All Alerts') },
          {
            id: 'unread',
            label: `${t('common.unread', 'Unread')} (${notifications.filter((n) => !n.read).length})`,
          },
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={activeFilter === tab.id ? 'contained' : 'outlined'}
            onClick={() => setActiveFilter(tab.id)}
            sx={{
              borderRadius: '20px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              px: 2.5,
              py: 0.75,
              bgcolor: activeFilter === tab.id ? '#2563EB' : 'transparent',
              borderColor: activeFilter === tab.id ? '#2563EB' : '#E2E8F0',
              color: activeFilter === tab.id ? '#fff' : '#64748B',
              '&:hover': { bgcolor: activeFilter === tab.id ? '#1D4ED8' : '#F1F5F9' },
            }}
          >
            {tab.label}
          </Button>
        ))}
      </Box>

      {/* Notifications List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {filtered.map((item) => (
          <Paper
            key={item.id}
            elevation={0}
            sx={{
              p: { xs: 2.5, sm: 3 },
              borderRadius: 3,
              border: '1px solid',
              borderColor: item.read ? '#E2E8F0' : '#BFDBFE',
              bgcolor: item.read ? '#fff' : '#F0F7FF',
              boxShadow: item.read ? 'none' : '0 2px 10px rgba(37,99,235,0.06)',
              position: 'relative',
              transition: 'all 0.2s ease',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2.5,
                  bgcolor: item.type === 'order' ? '#EFF6FF' : item.type === 'payout' ? '#F0FDF4' : '#FAF5FF',
                  color: item.badgeColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {item.type === 'order' ? (
                  <MdShoppingCart size={22} />
                ) : item.type === 'payout' ? (
                  <MdAccountBalance size={22} />
                ) : (
                  <MdVerified size={22} />
                )}
              </Box>

              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="subtitle1" fontWeight={800} color="#1E293B">
                    {item.title}
                  </Typography>
                  <Typography variant="caption" color="#94A3B8" fontWeight={500}>
                    {formatIST(item.time)}
                  </Typography>
                </Box>

                <Typography variant="body2" color="#475569" sx={{ mt: 0.5, lineHeight: 1.6 }}>
                  {item.message}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                  <Button
                    variant="contained"
                    size="small"
                    endIcon={<MdArrowForward />}
                    onClick={() => {
                      handleMarkAsRead(item.id);
                      navigate(item.link);
                    }}
                    sx={{
                      bgcolor: '#2563EB',
                      textTransform: 'none',
                      fontWeight: 700,
                      borderRadius: 2,
                      px: 2,
                      '&:hover': { bgcolor: '#1D4ED8' },
                    }}
                  >
                    {item.actionLabel}
                  </Button>

                  {!item.read && (
                    <Button
                      size="small"
                      startIcon={<MdCheck />}
                      onClick={() => handleMarkAsRead(item.id)}
                      sx={{ textTransform: 'none', color: '#64748B', fontWeight: 600 }}
                    >
                      {t('farmer.markRead', 'Mark as read')}
                    </Button>
                  )}

                  <IconButton
                    size="small"
                    onClick={() => handleDelete(item.id)}
                    sx={{ color: '#94A3B8', ml: 'auto' }}
                  >
                    <MdDeleteOutline size={18} />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}
