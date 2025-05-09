import { FC } from 'react';
import Hero from '../../components/Hero/Hero';
import Catalog from '../../components/Catalog/Catalog';
import BestRatedProducts from '../../components/BestRatedProducts/BestRatedProducts';

const HomePage: FC = () => {
  return (
    <>
      <Hero />
      <Catalog />
      <BestRatedProducts />
    </>
  );
};

export default HomePage; 