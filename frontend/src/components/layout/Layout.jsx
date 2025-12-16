import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { Container } from '@mui/material';

const Layout = ({ children }) => (
  <>
    <Header />
    <Container sx={{ mt: 4, minHeight: '60vh' }}>{children}</Container>
    <Footer />
  </>
);

export default Layout;
