import React from 'react';
import { Metadata } from 'next';
import IngredientsClient from '@/app/components/IngredientsClient';
import ingredientsData from '@/data/ingredients.json';

export const metadata: Metadata = {
  title: 'Ingredients Glossary | Indévie Beauty',
  description: 'Meet the ingredients behind the science. Explore our comprehensive glossary of the active botanicals and clinically proven compounds.',
};

export default function IngredientsPage() {
  return (
    <main>
      <IngredientsClient ingredients={ingredientsData} />
    </main>
  );
}
