'use client';
import React from 'react';
import dynamic from 'next/dynamic';

const NewHomepage = dynamic(() => import('../components/new-homepage/NewHomepage'), {
  ssr: false,
});

export default function Home() {
  return <NewHomepage />;
}