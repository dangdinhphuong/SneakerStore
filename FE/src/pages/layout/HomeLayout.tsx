import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from '../../pages/layout/Client/Header'
import Footer from '../../pages/layout/Client/Footer'
import { CartProvider } from '@/contexts/CartContext';
type Props = object

const BaseLayout = (props: Props) => {
  return (
    <CartProvider>
      <Header />
      <main className='pt-[120px] md:pt-[84px]'>
        <Outlet />
      </main>
      <footer>
        <Footer />
      </footer>
    </CartProvider>



  )
}

export default BaseLayout