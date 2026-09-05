import React from 'react';
import { Outlet } from 'react-router-dom';
import ClientHeader from './ClientHeader';
import Footer from './Footer';
import PageWrapper from './PageWrapper';

export function ClientLayout() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <ClientHeader />
      <PageWrapper>
        <Outlet />
      </PageWrapper>
      <Footer />
    </div>
  );
}

export default ClientLayout;
