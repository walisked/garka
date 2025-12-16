import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  LinearProgress,
} from '@mui/material';
import { Add, Delete, CloudUpload, LocationOn, AttachMoney } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { Formik, Form, Field, FieldArray } from 'formik';
import * as Yup from 'yup';
import { agentsAPI } from '../../../../api/agents';
import { useAuth } from '../../../../contexts/AuthContext';
import toast from 'react-hot-toast';

const propertyTypes = ['RESIDENTIAL','COMMERCIAL','INDUSTRIAL','AGRICULTURAL','MIXED_USE'];

const validationSchema = Yup.object({
  title: Yup.string().required('Title is required'),
  description: Yup.string().required('Description is required'),
  propertyType: Yup.string().required('Property type is required'),
  price: Yup.number().required('Price is required').min(0,'Price must be positive'),
  landSize: Yup.string().required('Land size is required'),
  location: Yup.object({ state: Yup.string().required('State is required'), city: Yup.string().required('City is required'), address: Yup.string().required('Address is required') }),
});

const PropertyForm = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [images, setImages] = useState([]);
  const [documents, setDocuments] = useState([]);
  const { token } = useAuth();

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    onDrop: (acceptedFiles) => setImages(prev => [...prev, ...acceptedFiles])
  });

  const initialValues = { title: '', description: '', propertyType: '', price: '', landSize: '', location: { state: '', city: '', address: '' }, features: [] };

  const handleSubmit = async (values, { resetForm }) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('description', values.description);
      formData.append('propertyType', values.propertyType);
      formData.append('price', values.price);
      formData.append('landSize', values.landSize);
      formData.append('location[state]', values.location.state);
      formData.append('location[city]', values.location.city);
      formData.append('location[address]', values.location.address);
      values.features.forEach((f, i) => formData.append(`features[${i}]`, f));
      images.forEach((img) => formData.append('images', img));
      documents.forEach((d) => formData.append('documents', d));

      const progressInterval = setInterval(() => setUploadProgress(p => (p >= 90 ? p : p + 10)), 200);
      const res = await agentsAPI.createProperty(formData, token);
      clearInterval(progressInterval);
      setUploadProgress(100);
      if (res.success) {
        toast.success('Property listed successfully!');
        resetForm(); setImages([]); setDocuments([]); setUploadProgress(0);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create property');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">List New Property</Typography>

      {uploading && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="body2" gutterBottom>Uploading property... {uploadProgress}%</Typography>
          <LinearProgress variant="determinate" value={uploadProgress} />
        </Paper>
      )}

      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
        {({ values, errors, touched, handleChange }) => (
          <Form>
            <Grid container spacing={3}>
              <Grid item xs={12}><Paper sx={{ p: 3 }}><Typography variant="h6" gutterBottom>Basic Information</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}><Field as={TextField} fullWidth name="title" label="Property Title" error={touched.title && !!errors.title} helperText={touched.title && errors.title} /></Grid>
                  <Grid item xs={12}><Field as={TextField} fullWidth multiline rows={4} name="description" label="Description" error={touched.description && !!errors.description} helperText={touched.description && errors.description} /></Grid>
                  <Grid item xs={12} md={6}><FormControl fullWidth error={touched.propertyType && !!errors.propertyType}><InputLabel>Property Type</InputLabel>
                    <Select name="propertyType" value={values.propertyType} onChange={handleChange} label="Property Type">{propertyTypes.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}</Select></FormControl></Grid>
                  <Grid item xs={12} md={6}><Field as={TextField} fullWidth name="landSize" label="Land Size (e.g., 500 sqm)" error={touched.landSize && !!errors.landSize} helperText={touched.landSize && errors.landSize} /></Grid>
                </Grid></Paper></Grid>

              <Grid item xs={12}><Paper sx={{ p: 3 }}><Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}><LocationOn sx={{ mr: 1 }} />Location Details</Typography>
                <Grid container spacing={2}><Grid item xs={12} md={4}><Field as={TextField} fullWidth name="location.state" label="State" error={touched.location?.state && !!errors.location?.state} helperText={touched.location?.state && errors.location?.state} /></Grid>
                  <Grid item xs={12} md={4}><Field as={TextField} fullWidth name="location.city" label="City" error={touched.location?.city && !!errors.location?.city} helperText={touched.location?.city && errors.location?.city} /></Grid>
                  <Grid item xs={12} md={4}><Field as={TextField} fullWidth name="location.address" label="Address" error={touched.location?.address && !!errors.location?.address} helperText={touched.location?.address && errors.location?.address} /></Grid></Grid></Paper></Grid>

              <Grid item xs={12}><Paper sx={{ p: 3 }}><Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}><AttachMoney sx={{ mr: 1 }} />Pricing Information</Typography>
                <Grid container spacing={2}><Grid item xs={12} md={6}><Field as={TextField} fullWidth type="number" name="price" label="Price (₦)" error={touched.price && !!errors.price} helperText={touched.price && errors.price} /></Grid></Grid></Paper></Grid>

              <Grid item xs={12}><Paper sx={{ p: 3 }}><Typography variant="h6" gutterBottom>Property Features</Typography>
                <FieldArray name="features">{({ push, remove }) => (
                  <Box>
                    <Grid container spacing={2}>{values.features.map((feature, index) => (<Grid item key={index}><Chip label={feature} onDelete={() => remove(index)} sx={{ mr: 1, mb: 1 }} /></Grid>))}</Grid>
                    <Box sx={{ mt: 2 }}><Button startIcon={<Add />} onClick={() => { const newFeature = prompt('Enter feature:'); if (newFeature) push(newFeature); }}>Add Feature</Button></Box>
                  </Box>
                )}</FieldArray></Paper></Grid>

              <Grid item xs={12} md={6}><Paper sx={{ p: 3 }}><Typography variant="h6" gutterBottom>Property Images</Typography>
                <Box {...getRootProps()} sx={{ border: '2px dashed', borderColor: 'divider', borderRadius: 2, p: 4, textAlign: 'center', cursor: 'pointer' }}>
                  <input {...getInputProps()} />
                  <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography>Drag & drop images here, or click to select</Typography>
                  <Typography variant="caption" color="text.secondary">Upload up to 10 images (JPEG, PNG, WEBP)</Typography>
                </Box>
                {images.length > 0 && (<Box sx={{ mt: 2 }}><Typography variant="body2" gutterBottom>Selected images ({images.length}):</Typography><Grid container spacing={1}>{images.map((image, index) => (<Grid item key={index}><Paper sx={{ position: 'relative', width: 80, height: 80, overflow: 'hidden' }}><img src={URL.createObjectURL(image)} alt={`Property ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /><IconButton size="small" sx={{ position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.5)', color: 'white' }} onClick={() => setImages(prev => prev.filter((_, i) => i !== index))}><Delete fontSize="small" /></IconButton></Paper></Grid>))}</Grid></Box>)}</Paper></Grid>

              <Grid item xs={12} md={6}><Paper sx={{ p: 3 }}><Typography variant="h6" gutterBottom>Legal Documents</Typography>
                <Button variant="outlined" fullWidth startIcon={<CloudUpload />} onClick={() => document.getElementById('doc-upload')?.click()} sx={{ mb: 2 }}>Upload Documents</Button>
                <input id="doc-upload" type="file" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={(e) => setDocuments(prev => [...prev, ...Array.from(e.target.files)])} />
                {documents.length > 0 && (<Box><Typography variant="body2" gutterBottom>Uploaded documents:</Typography>{documents.map((doc, index) => (<Paper key={index} sx={{ p: 1, mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><Typography variant="body2">{doc.name}</Typography><IconButton size="small" onClick={() => setDocuments(prev => prev.filter((_, i) => i !== index))}><Delete fontSize="small" /></IconButton></Paper>))}</Box>)}</Paper></Grid>

              <Grid item xs={12}><Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}><Button variant="outlined" onClick={() => window.history.back()}>Cancel</Button><Button type="submit" variant="contained" disabled={uploading}>{uploading ? 'Uploading...' : 'List Property'}</Button></Box></Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default PropertyForm;
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  LinearProgress,
} from '@mui/material';
import { Add, Delete, CloudUpload, LocationOn, AttachMoney } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { Formik, Form, Field, FieldArray } from 'formik';
import * as Yup from 'yup';
import { agentsAPI } from '../../../../api/agents';
import { useAuth } from '../../../../contexts/AuthContext';
import toast from 'react-hot-toast';

const propertyTypes = ['RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'AGRICULTURAL', 'MIXED_USE'];

const validationSchema = Yup.object({
  title: Yup.string().required('Title is required'),
  description: Yup.string().required('Description is required'),
  propertyType: Yup.string().required('Property type is required'),
  price: Yup.number().required('Price is required').min(0, 'Price must be positive'),
  landSize: Yup.string().required('Land size is required'),
  location: Yup.object({ state: Yup.string().required('State is required'), city: Yup.string().required('City is required'), address: Yup.string().required('Address is required') }),
  features: Yup.array().of(Yup.string()),
});

const PropertyForm = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [images, setImages] = useState([]);
  const [documents, setDocuments] = useState([]);
  const { token } = useAuth();

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    onDrop: (acceptedFiles) => setImages((prev) => [...prev, ...acceptedFiles])
  });

  const handleSubmit = async (values, { resetForm }) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('description', values.description);
      formData.append('propertyType', values.propertyType);
      formData.append('price', values.price);
      formData.append('landSize', values.landSize);
      formData.append('location[state]', values.location.state);
      formData.append('location[city]', values.location.city);
      formData.append('location[address]', values.location.address);
      values.features.forEach((feature, index) => formData.append(`features[${index}]`, feature));
      images.forEach((image) => formData.append('images', image));
      documents.forEach((doc) => formData.append('documents', doc));

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await agentsAPI.createProperty(formData, token);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.success) {
        toast.success('Property listed successfully!');
        resetForm();
        setImages([]);
        setDocuments([]);
        setUploadProgress(0);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create property');
    } finally {
      setUploading(false);
    }
  };

  const initialValues = { title: '', description: '', propertyType: '', price: '', landSize: '', location: { state: '', city: '', address: '' }, features: [] };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">List New Property</Typography>

      {uploading && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="body2" gutterBottom>Uploading property... {uploadProgress}%</Typography>
          <LinearProgress variant="determinate" value={uploadProgress} />
        </Paper>
      )}

      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
        {({ values, errors, touched, handleChange }) => (
          <Form>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>Basic Information</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Field as={TextField} fullWidth name="title" label="Property Title" error={touched.title && !!errors.title} helperText={touched.title && errors.title} />
                    </Grid>
                    <Grid item xs={12}>
                      <Field as={TextField} fullWidth multiline rows={4} name="description" label="Description" error={touched.description && !!errors.description} helperText={touched.description && errors.description} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth error={touched.propertyType && !!errors.propertyType}>
                        <InputLabel>Property Type</InputLabel>
                        <Select name="propertyType" value={values.propertyType} onChange={handleChange} label="Property Type">
                          {propertyTypes.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Field as={TextField} fullWidth name="landSize" label="Land Size (e.g., 500 sqm)" error={touched.landSize && !!errors.landSize} helperText={touched.landSize && errors.landSize} />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}><LocationOn sx={{ mr: 1 }} />Location Details</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}><Field as={TextField} fullWidth name="location.state" label="State" error={touched.location?.state && !!errors.location?.state} helperText={touched.location?.state && errors.location?.state} /></Grid>
                    <Grid item xs={12} md={4}><Field as={TextField} fullWidth name="location.city" label="City" error={touched.location?.city && !!errors.location?.city} helperText={touched.location?.city && errors.location?.city} /></Grid>
                    <Grid item xs={12} md={4}><Field as={TextField} fullWidth name="location.address" label="Address" error={touched.location?.address && !!errors.location?.address} helperText={touched.location?.address && errors.location?.address} /></Grid>
                  </Grid>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}><AttachMoney sx={{ mr: 1 }} />Pricing Information</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}><Field as={TextField} fullWidth type="number" name="price" label="Price (₦)" InputProps={{ startAdornment: <Typography>₦</Typography> }} error={touched.price && !!errors.price} helperText={touched.price && errors.price} /></Grid>
                  </Grid>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>Property Features</Typography>
                  <FieldArray name="features">{({ push, remove }) => (
                    <Box>
                      <Grid container spacing={2}>{values.features.map((feature, index) => (
                        <Grid item key={index}><Chip label={feature} onDelete={() => remove(index)} sx={{ mr: 1, mb: 1 }} /></Grid>
                      ))}</Grid>
                      <Box sx={{ mt: 2 }}>
                        <Button startIcon={<Add />} onClick={() => { const newFeature = prompt('Enter feature:'); if (newFeature) push(newFeature); }}>Add Feature</Button>
                      </Box>
                    </Box>
                  )}</FieldArray>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>Property Images</Typography>
                  <Box {...getRootProps()} sx={{ border: '2px dashed', borderColor: 'divider', borderRadius: 2, p: 4, textAlign: 'center', cursor: 'pointer', '&:hover': { borderColor: 'primary.main', backgroundColor: 'action.hover' } }}>
                    <input {...getInputProps()} />
                    <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                    <Typography>Drag & drop images here, or click to select</Typography>
                    <Typography variant="caption" color="text.secondary">Upload up to 10 images (JPEG, PNG, WEBP)</Typography>
                  </Box>
                  {images.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" gutterBottom>Selected images ({images.length}):</Typography>
                      <Grid container spacing={1}>{images.map((image, index) => (
                        <Grid item key={index}><Paper sx={{ position: 'relative', width: 80, height: 80, overflow: 'hidden' }}><img src={URL.createObjectURL(image)} alt={`Property ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /><IconButton size="small" sx={{ position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' } }} onClick={() => setImages(prev => prev.filter((_, i) => i !== index))}><Delete fontSize="small" /></IconButton></Paper></Grid>
                      ))}</Grid>
                    </Box>
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>Legal Documents</Typography>
                  <Button variant="outlined" fullWidth startIcon={<CloudUpload />} onClick={() => document.getElementById('doc-upload').click()} sx={{ mb: 2 }}>Upload Documents</Button>
                  <input id="doc-upload" type="file" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={(e) => setDocuments(prev => [...prev, ...Array.from(e.target.files)])} />
                  {documents.length > 0 && (<Box><Typography variant="body2" gutterBottom>Uploaded documents:</Typography>{documents.map((doc, index) => (<Paper key={index} sx={{ p: 1, mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><Typography variant="body2">{doc.name}</Typography><IconButton size="small" onClick={() => setDocuments(prev => prev.filter((_, i) => i !== index))}><Delete fontSize="small" /></IconButton></Paper>))}</Box>)}
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button variant="outlined" onClick={() => window.history.back()}>Cancel</Button>
                  <Button type="submit" variant="contained" disabled={uploading}>{uploading ? 'Uploading...' : 'List Property'}</Button>
                </Box>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default PropertyForm;
