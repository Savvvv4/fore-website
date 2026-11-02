import type { StaticImageData } from 'next/image';
import itishImg from '../imports/itish-arora.jpg';
import savdeepImg from '../imports/PFP.jpeg';

export type FounderSlug = 'savdeep' | 'itish';

export type Founder = {
  slug: FounderSlug;
  name: string;
  firstName: string;
  role: string;
  headline: string;
  intro: string;
  partnerNote: string; // shown on the other founder's page, in their voice
  photo: StaticImageData;
  photoClass?: string;
  whatsapp: string; // digits only, with country code
  email: string;
  story: string[];
};

export const founders: Record<FounderSlug, Founder> = {
  savdeep: {
    slug: 'savdeep',
    name: 'Savdeep Kadian',
    firstName: 'Savdeep',
    role: 'Founder, CPO',
    headline: "Golf started for me with a borrowed club and a coach who believed in me. I've been chasing that feeling ever since.",
    partnerNote: "Savdeep grew up on the junior circuit with a borrowed club and a lot of early mornings. He has seen golf from almost every side, and every part of FORE is shaped by those years on the course.",
    intro: 'Now I want to build something that makes that journey easier for the next golfer.',
    photo: savdeepImg,
    photoClass: 'founder-photo-img--savdeep',
    whatsapp: '918588901218',
    email: 'savdeep@foresports.in',
    story: [
      "I've been playing golf for more than ten years. I started with a club a coach lent me, spent my early years in junior training camps, and gradually worked my way through the national junior and amateur circuits.",
      "I've played at courses and facilities across the country, meeting juniors, amateurs, professionals, coaches, parents and people picking up a club for the first time. I've seen almost every side of the game.",
      "And everywhere I've gone, I've seen the same thing: there is a lot of golf out there, but very little connecting it. Most of the time, you find things because someone happens to tell you about them.",
      "A coach recommendation. A better facility. A junior program. A tournament. The right place to practise. You get lucky, or you don't.",
      "I've spent more than a decade finding my way through golf. Now I want to build something that makes that journey easier for the next golfer.",
    ],
  },
  itish: {
    slug: 'itish',
    name: 'Itish Arora',
    firstName: 'Itish',
    role: 'Founder & CEO',
    headline: "I fell in love with golf watching my son learn the game, one lesson and one tournament at a time.",
    partnerNote: "Itish came to golf through his son, standing at the edge of ranges and tournaments with every question a parent has. He brings that care, and years of building businesses, to everything we do.",
    intro: 'My journey into golf started as a parent trying to help my son navigate the game.',
    photo: itishImg,
    whatsapp: '919811029003',
    email: 'itish@foresports.in',
    story: [
      'My journey into golf started as a parent trying to help my son navigate the game.',
      'Like many parents, I found myself constantly searching for answers. Which coach was right? Which facilities offered the best opportunities? What tournaments should he play? How do you measure progress?',
      'The more involved I became, the more I realized how difficult it was to find reliable information. So much of the journey depended on who you knew, who you could ask, or whether someone happened to point you in the right direction.',
      'Golf already has talented coaches, great facilities and passionate people. What was missing was a way to connect them.',
      'My professional journey has been across sales, partnerships and operations, working with people and businesses to build, grow and run organisations. I saw an opportunity to bring that experience to a game I had become deeply invested in personally.',
    ],
  },
};
