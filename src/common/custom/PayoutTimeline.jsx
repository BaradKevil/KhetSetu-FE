import { Box, Typography, Paper, Chip } from '@mui/material';
import {
  MdLock,
  MdCheckCircle,
  MdLocalShipping,
  MdDoneAll,
  MdAccountBalance,
  MdHourglassEmpty,
} from 'react-icons/md';
import { useLanguage } from '../../context/LanguageContext';
import { formatIST } from '../status';

const PayoutTimeline = ({ order, sx = {} }) => {
  const { t } = useLanguage();
  const status = order?.status || 'escrow_held';
  const timeline = order?.timeline || [];

  const getEventDate = (statusKey) => {
    const item = timeline.find((e) => e.status === statusKey);
    return item ? formatIST(item.timestamp) : null;
  };

  const steps = [
    {
      key: 'escrow_held',
      label: t('timeline.escrowHeld', 'Escrow Payment Secured'),
      desc: t('timeline.escrowHeldDesc', 'Buyer payment locked in safe vault'),
      icon: <MdLock />,
      date: getEventDate('escrow_held') || formatIST(order?.created_at),
      active: true,
      done: ['accepted', 'dispatched', 'delivered', 'completed'].includes(status),
    },
    {
      key: 'accepted',
      label: t('timeline.accepted', 'Farmer Confirmed'),
      desc: t('timeline.acceptedDesc', 'Harvest packing & batch preparation'),
      icon: <MdCheckCircle />,
      date: getEventDate('accepted'),
      active: ['accepted', 'dispatched', 'delivered', 'completed'].includes(status),
      done: ['dispatched', 'delivered', 'completed'].includes(status),
    },
    {
      key: 'dispatched',
      label: t('timeline.dispatched', 'Dispatched / In Transit'),
      desc: order?.dispatch_details?.vehicle_number
        ? `Vehicle: ${order.dispatch_details.vehicle_number}`
        : t('timeline.dispatchedDesc', 'Shipped via transport vehicle'),
      icon: <MdLocalShipping />,
      date: getEventDate('dispatched'),
      active: ['dispatched', 'delivered', 'completed'].includes(status),
      done: ['delivered', 'completed'].includes(status),
    },
    {
      key: 'delivered',
      label: t('timeline.delivered', 'Delivered to Buyer'),
      desc: t('timeline.deliveredDesc', 'Quality inspection & weighment confirmation'),
      icon: <MdDoneAll />,
      date: getEventDate('delivered'),
      active: ['delivered', 'completed'].includes(status),
      done: status === 'completed',
    },
    {
      key: 'completed',
      label: t('timeline.payout', 'Bank Payout Settled'),
      desc:
        status === 'completed'
          ? `UTR: KS-UTR-${(order?.id || 101) * 9876} (Settled)`
          : t('timeline.payoutPending', 'Direct transfer upon acceptance'),
      icon: <MdAccountBalance />,
      date: getEventDate('completed'),
      active: status === 'completed',
      done: status === 'completed',
    },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: '1px solid #E2E8F0',
        bgcolor: '#FFFFFF',
        ...sx,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
        <Typography variant="subtitle2" fontWeight={800} color="#0F172A">
          {t('timeline.title', 'Order & Payout Progress')}
        </Typography>
        <Chip
          icon={status === 'completed' ? <MdCheckCircle /> : <MdHourglassEmpty />}
          label={status === 'completed' ? 'Paid to Bank' : 'In Progress'}
          size="small"
          color={status === 'completed' ? 'success' : 'info'}
          sx={{ fontWeight: 700, fontSize: '0.72rem', borderRadius: 1.5 }}
        />
      </Box>

      <Box sx={{ position: 'relative', pl: 1 }}>
        {steps.map((step, idx) => {
          const isCurrent = step.active && !step.done;
          const isDone = step.done;
          const isPending = !step.active;

          return (
            <Box
              key={step.key}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                position: 'relative',
                pb: idx === steps.length - 1 ? 0 : 2.5,
              }}
            >
              {/* Connecting line */}
              {idx !== steps.length - 1 && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 26,
                    left: 14,
                    width: 2,
                    bottom: 0,
                    bgcolor: isDone ? '#16A34A' : '#E2E8F0',
                  }}
                />
              )}

              {/* Step Icon circle */}
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: isDone ? '#DCFCE7' : isCurrent ? '#EFF6FF' : '#F1F5F9',
                  color: isDone ? '#16A34A' : isCurrent ? '#2563EB' : '#94A3B8',
                  border: `2px solid ${isDone ? '#16A34A' : isCurrent ? '#2563EB' : '#CBD5E1'}`,
                  zIndex: 2,
                  mr: 2,
                  flexShrink: 0,
                }}
              >
                {step.icon}
              </Box>

              {/* Step info */}
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography
                    variant="body2"
                    fontWeight={isDone || isCurrent ? 700 : 500}
                    color={isDone ? '#0F172A' : isCurrent ? '#2563EB' : '#94A3B8'}
                  >
                    {step.label}
                  </Typography>
                  {step.date && (
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      {step.date}
                    </Typography>
                  )}
                </Box>
                <Typography variant="caption" color={isCurrent ? '#475569' : '#64748B'}>
                  {step.desc}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
};

export default PayoutTimeline;
