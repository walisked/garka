import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Slider,
  InputAdornment,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Avatar,
  Rating,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Search,
  FilterList,
  LocationOn,
  FavoriteBorder,
  Share,
  VerifiedUser,
  Star,
  BusinessCenter,
  Map,
  List,
  GridView,
  Message,
  Close,
  Phone,
} from '@mui/icons-material';
import PaymentModal from '../../../components/verification/PaymentModal';
import { useAuth } from '../../../contexts/AuthContext';

console.log('Marketplace imports', { PaymentModal: !!PaymentModal, Box: !!Box, Grid: !!Grid, Card: !!Card });
import verificationAPI from '../../../api/verification.js';
import paymentsAPI from '../../../api/payments';

// Tab panel component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`marketplace-tabpanel-${index}`}
      aria-labelledby={`marketplace-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
    </div>
  );
}

const Marketplace = () => {
  console.log('Marketplace function executing');
  const { user, token } = useAuth();
  const [viewMode, setViewMode] = useState('grid');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentModalProperty, setPaymentModalProperty] = useState(null);
  const [filters, setFilters] = useState({
    propertyType: '',
    location: '',
    minPrice: 0,
    maxPrice: 500000000,
    titleType: '',
    verificationStatus: '',
  });

  // Properties will be fetched from the backend
  const [properties, setProperties] = useState([]);
  const [loadingProperties, setLoadingProperties] = useState(false);

  const fetchProperties = async () => {
    setLoadingProperties(true);
    try {
      const propertiesAPI = (await import('../../../api/properties.js')).default;
      const data = await propertiesAPI.list();
      const normalized = (data.properties || []).map(p => ({
        id: p._id,
        title: p.title,
        location: p.location?.address || `${p.location?.city || ''}, ${p.location?.state || ''}`,
        price: p.price,
        size: p.landSize || 'N/A',
        propertyType: (p.landUseType || 'residential').toLowerCase(),
        titleType: p.titleType || 'C-of-O',
        verificationStatus: p.status === 'reserved' ? 'reserved' : (p.status === 'under_verification' ? 'pending' : 'verified'),
        images: p.images || [],
        agent: p.agentId ? { name: p.agentId.user?.fullName || 'Agent', profileImage: p.agentId.profileImage } : { name: 'Agent' },
        dealInitiator: p.dealInitiator || null,
        coordinates: p.coordinates || null,
        features: p.features || [],
        datePosted: p.createdAt,
        views: p.views || 0,
        likes: p.likes || 0,
        reservedUntil: p.reservedUntil ? new Date(p.reservedUntil).getTime() : null,
        visibleOnMap: !!p.visibleOnMap
      }));

      setProperties(normalized);
    } catch (err) {
      console.error('Failed to fetch properties', err);
    } finally {
      setLoadingProperties(false);
    }
  };

  React.useEffect(() => {
    fetchProperties();
  }, []);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const formatPrice = (price) => {
    if (price >= 1000000) {
      return `₦${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `₦${(price / 1000).toFixed(1)}K`;
    }
    return `₦${price}`;
  };

  const getVerificationChip = (status) => {
    const config = {
      verified: { color: 'success', label: 'Verified', icon: <VerifiedUser /> },
      pending: { color: 'warning', label: 'Pending Verification', icon: <BusinessCenter /> },
      unverified: { color: 'error', label: 'Not Verified', icon: <Close /> },
    };
    
    const { color, label, icon } = config[status] || config.unverified;
    
    return (
      <Chip
        icon={icon}
        label={label}
        color={color}
        size="small"
        variant="filled"
      />
    );
  };

  // Handle payment success: mark property reserved and set expiry (12 hours)
  const handlePaymentSuccess = ({ propertyId, reservedUntil }) => {
    // Refresh properties to pick up backend state changes
    fetchProperties();
    setPaymentModalOpen(false);
    setSelectedProperty(null);
  };

  const renderCountdown = (reservedUntil) => {
    if (!reservedUntil) return null;
    const ms = reservedUntil - Date.now();
    if (ms <= 0) return 'Expired';
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const PropertyCard = ({ property }) => (
    <Card 
      sx={{ 
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: 6
        }
      }}
      onClick={() => setSelectedProperty(property)}
    >
      <Box sx={{ position: 'relative' }}>
        {/* Property Image */}
        <Box
          sx={{
            height: 200,
            background: `linear-gradient(45deg, #2E7D32, #4CAF50)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '14px'
          }}
        >
          📍 {property.location}
        </Box>

        {/* Verification Badge */}
        <Box sx={{ position: 'absolute', top: 10, left: 10 }}>
          {getVerificationChip(property.verificationStatus)}
        </Box>

        {/* Like Button */}
        <IconButton
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            backgroundColor: 'white',
            '&:hover': { backgroundColor: 'white' }
          }}
        >
          <FavoriteBorder />
        </IconButton>
      </Box>

      <CardContent>
        {/* Price */}
        <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>
          {formatPrice(property.price)}
        </Typography>

        {/* Title */}
        <Typography variant="h6" gutterBottom sx={{ height: 48, overflow: 'hidden' }}>
          {property.title}
        </Typography>

        {/* Location */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <LocationOn fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            {property.location}
          </Typography>
        </Box>

        {/* Property Details */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="body2">
            📏 {property.size}
          </Typography>
          <Typography variant="body2">
            🏷️ {property.titleType}
          </Typography>
        </Box>

        {/* Features */}
        <Box sx={{ mb: 2 }}>
          {property.features.slice(0, 2).map((feature, index) => (
            <Chip
              key={index}
              label={feature}
              size="small"
              variant="outlined"
              sx={{ mr: 0.5, mb: 0.5 }}
            />
          ))}
          {property.features.length > 2 && (
            <Chip
              label={`+${property.features.length - 2}`}
              size="small"
              variant="outlined"
            />
          )}
        </Box>

        {/* Reservation status */}
        {property.reservedUntil && property.reservedUntil > Date.now() && (
          <Box sx={{ mb: 1 }}>
            <Typography variant="body2" color="warning.main">
              Reserved • {renderCountdown(property.reservedUntil)} left
            </Typography>
          </Box>
        )}

        {/* Agent Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ width: 32, height: 32, mr: 1 }} src={property.agent.profileImage}>
              {property.agent.name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight="bold">
                {property.agent.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Star sx={{ fontSize: 16, color: '#FF9800', mr: 0.5 }} />
                <Typography variant="body2" color="text.secondary">
                  {property.agent.rating}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
              👁️ {property.views}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ❤️ {property.likes}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const PropertyDetailModal = ({ property, open, onClose }) => {
    if (!property) return null;

    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    return (
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth fullScreen={fullScreen}>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" fontWeight="bold">
              {property.title}
            </Typography>
            <IconButton onClick={onClose}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={3}>
            {/* Images and Map */}
            <Grid item xs={12} md={8}>
              <Box sx={{ mb: 3 }}>
                <Box
                  sx={{
                    height: { xs: 200, md: 400 },
                    background: `linear-gradient(45deg, #2E7D32, #4CAF50)`,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: { xs: '1rem', md: '1.125rem' },
                    mb: 2
                  }}
                >
                  Property Images Gallery
                </Box>
                
                {/* Map Preview */}
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Map sx={{ mr: 1 }} />
                    Location Map
                  </Typography>
                  <Box
                    sx={{
                      height: 200,
                      background: '#e0e0e0',
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#666'
                    }}
                  >
                    Interactive Map View
                  </Box>
                </Paper>
              </Box>
            </Grid>

            {/* Property Details */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
                <Typography variant="h4" color="primary" fontWeight="bold" gutterBottom>
                  {formatPrice(property.price)}
                </Typography>

                {getVerificationChip(property.verificationStatus)}

                {property.reservedUntil && property.reservedUntil > Date.now() && (
                  <Typography variant="body2" color="warning.main" sx={{ mb: 1 }}>
                    Reserved • {renderCountdown(property.reservedUntil)} left
                  </Typography>
                )}

                <Box sx={{ my: 3 }}>
                  <Typography variant="body1" gutterBottom>
                    📏 <strong>Size:</strong> {property.size}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    🏷️ <strong>Title Type:</strong> {property.titleType}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    📍 <strong>Location:</strong> {property.location}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    📅 <strong>Posted:</strong> {new Date(property.datePosted).toLocaleDateString()}
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Features:
                  </Typography>
                  <Grid container spacing={1}>
                    {property.features.map((feature, index) => (
                      <Grid item xs={6} key={index}>
                        <Chip label={feature} variant="outlined" size="small" />
                      </Grid>
                    ))}
                  </Grid>
                </Box>

                {/* Agent Card */}
                <Paper sx={{ p: 2, backgroundColor: '#f5f5f5', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ width: 50, height: 50, mr: 2 }} src={property.agent.profileImage}>
                      {property.agent.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">
                        {property.agent.name}
                        {property.agent.verified && (
                          <VerifiedUser sx={{ color: '#2E7D32', ml: 0.5, fontSize: 18 }} />
                        )}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Rating value={property.agent.rating} readOnly size="small" />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          ({property.agent.trustScore} Trust Score)
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button variant="outlined" fullWidth startIcon={<Message />}>
                      Message
                    </Button>
                    <Button variant="outlined" fullWidth startIcon={<Phone />}>
                      Call
                    </Button>
                  </Box>
                </Paper>

                <Paper sx={{ p: 2, backgroundColor: '#fff', mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Deal Initiator
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body1">{property.dealInitiator?.name}</Typography>
                    <Typography variant="body2">Phone: <a href={`tel:${property.dealInitiator?.phone}`}>{property.dealInitiator?.phone}</a></Typography>
                    <Typography variant="body2">Email: <a href={`mailto:${property.dealInitiator?.email}`}>{property.dealInitiator?.email}</a></Typography>
                    <Typography variant="body2">Rank: {property.dealInitiator?.rank}</Typography>
                  </Box>
                </Paper>

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  sx={{ mb: 1 }}
                  onClick={async () => {
                    if (user && user.isVerified === false) return;
                    try {
                      const fee = property.verificationFee || Math.max(5000, Math.round((property.price || 0) * 0.01));
                      const res = await verificationAPI.requestVerification({ propertyId: property.id, verificationFee: fee, termsAccepted: true }, token);
                      const verification = res.verification;

                      // attach verification id to the property shown in modal
                      setPaymentModalProperty({ ...property, verificationId: verification._id, verificationFee: verification.verificationFee || fee });
                      setPaymentModalOpen(true);
                    } catch (err) {
                      console.error(err);
                      alert('Failed to create verification. Please try again.');
                    }
                  }}
                  disabled={user && user.isVerified === false}
                >
                  {user && user.isVerified === false ? 'Verify account to Request' : 'Request Verification'}
                </Button>
                <Button variant="outlined" fullWidth startIcon={<Share />}>
                  Share Property
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    );
  };

  console.log('Marketplace render check', { PaymentModal: !!PaymentModal, PropertyCard: typeof PropertyCard, PropertyDetailModal: typeof PropertyDetailModal, Pagination: !!Pagination, Dialog: !!Dialog, DialogTitle: !!DialogTitle, DialogContent: !!DialogContent, IconButton: !!IconButton, Avatar: !!Avatar, Rating: !!Rating, Search: !!Search, FilterList: !!FilterList, LocationOn: !!LocationOn, FavoriteBorder: !!FavoriteBorder, Share: !!Share, VerifiedUser: !!VerifiedUser, Star: !!Star, BusinessCenter: !!BusinessCenter, MapIcon: !!Map, ListIcon: !!List, GridView: !!GridView, Message: !!Message, Close: !!Close, Phone: !!Phone });

  return (
    <Box sx={{ p: 3, backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom fontWeight="bold">
          Property Marketplace
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Discover verified properties with AGIS-backed documentation
        </Typography>
      </Box>

      {/* Search and Filter Bar */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search by location, property type, or title..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Property Type</InputLabel>
              <Select
                value={filters.propertyType}
                label="Property Type"
                onChange={(e) => handleFilterChange('propertyType', e.target.value)}
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="residential">Residential</MenuItem>
                <MenuItem value="commercial">Commercial</MenuItem>
                <MenuItem value="industrial">Industrial</MenuItem>
                <MenuItem value="agricultural">Agricultural</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Location</InputLabel>
              <Select
                value={filters.location}
                label="Location"
                onChange={(e) => handleFilterChange('location', e.target.value)}
              >
                <MenuItem value="">All Areas</MenuItem>
                <MenuItem value="maitama">Maitama</MenuItem>
                <MenuItem value="asokoro">Asokoro</MenuItem>
                <MenuItem value="gwarinpa">Gwarinpa</MenuItem>
                <MenuItem value="wuse">Wuse</MenuItem>
                <MenuItem value="kubwa">Kubwa</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Verification</InputLabel>
              <Select
                value={filters.verificationStatus}
                label="Verification"
                onChange={(e) => handleFilterChange('verificationStatus', e.target.value)}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="verified">Verified Only</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <Button variant="contained" fullWidth startIcon={<FilterList />}>
              More Filters
            </Button>
          </Grid>
        </Grid>

        {/* Price Range Slider */}
        <Box sx={{ mt: 2 }}>
          <Typography gutterBottom>
            Price Range: {formatPrice(filters.minPrice)} - {formatPrice(filters.maxPrice)}
          </Typography>
          <Slider
            value={[filters.minPrice, filters.maxPrice]}
            onChange={(e, newValue) => {
              handleFilterChange('minPrice', newValue[0]);
              handleFilterChange('maxPrice', newValue[1]);
            }}
            min={0}
            max={500000000}
            step={1000000}
            valueLabelDisplay="auto"
            valueLabelFormat={formatPrice}
          />
        </Box>
      </Paper>

      {/* Results Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          {properties.length} Properties Found
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton 
            color={viewMode === 'list' ? 'primary' : 'default'}
            onClick={() => setViewMode('list')}
          >
            <List />
          </IconButton>
          <IconButton 
            color={viewMode === 'grid' ? 'primary' : 'default'}
            onClick={() => setViewMode('grid')}
          >
            <GridView />
          </IconButton>
        </Box>
      </Box>

      {/* Properties Grid */}
      <Grid container spacing={3}>
        {properties.map((property) => (
          <Grid item xs={12} sm={6} lg={4} key={property.id}>
            <PropertyCard property={property} />
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Pagination count={10} color="primary" />
      </Box>

      {/* Property Detail Modal */}
      <PaymentModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        property={paymentModalProperty}
        agent={paymentModalProperty?.dealInitiator || paymentModalProperty?.agent}
        onSuccess={handlePaymentSuccess}
      />

      <PropertyDetailModal 
        property={selectedProperty}
        open={!!selectedProperty}
        onClose={() => setSelectedProperty(null)}
      />
    </Box>
  );
};

export default Marketplace;