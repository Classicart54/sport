import { FC } from 'react';
import Hero from '../../components/Hero/Hero';
import Catalog from '../../components/Catalog/Catalog';

const HomePage: FC = () => {
  return (
    <>
      <Hero />
      <Catalog />
    </>
  );
};

export default HomePage; 