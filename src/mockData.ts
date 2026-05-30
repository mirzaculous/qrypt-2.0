/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Event, Organization, Venue, User, UserRole, PromoCode } from './types.ts';

// Dynamic, life-like Pakistani Event Marketplace Data!
export const CITIES = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Multan',
  'Faisalabad',
  'Peshawar'
];

export const CATEGORIES = [
  { id: 'cat-concerts', name: 'Concerts', icon: 'Music' },
  { id: 'cat-comedy', name: 'Comedy', icon: 'Smile' },
  { id: 'cat-workshops', name: 'Workshops', icon: 'BookOpen' },
  { id: 'cat-conferences', name: 'Conferences', icon: 'Presentation' },
  { id: 'cat-food', name: 'Food Festivals', icon: 'Utensils' },
  { id: 'cat-sports', name: 'Sports', icon: 'Trophy' },
  { id: 'cat-networking', name: 'Networking', icon: 'Users' },
  { id: 'cat-exhibitions', name: 'Exhibitions', icon: 'Image' },
  { id: 'cat-startup', name: 'Startup Events', icon: 'Lightbulb' },
  { id: 'cat-uni', name: 'University Events', icon: 'GraduationCap' }
];

export const INITIAL_ORGANIZATIONS: Organization[] = [
  {
    id: 'org-salt-arts',
    name: 'Salt Arts',
    logoUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=150&auto=format&fit=crop&q=80',
    description: 'Pakistan’s premier curators of live music, concerts, and artistic expressions, creating immersive audio-visual environments.',
    ownerId: 'user-organizer-1',
    isVerified: true,
    city: 'Karachi',
    revenue: 450000
  },
  {
    id: 'org-laughter-nation',
    name: 'Laughter Nation',
    logoUrl: 'https://images.unsplash.com/photo-1585699324551-f6c309eed262?w=150&auto=format&fit=crop&q=80',
    description: 'Bringing clean comedy, stand-up specials, and improv showcases to the youth of Pakistan.',
    ownerId: 'user-organizer-2',
    isVerified: true,
    city: 'Karachi',
    revenue: 120000
  },
  {
    id: 'org-karachi-eat',
    name: 'Karachi Eat official',
    logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&auto=format&fit=crop&q=80',
    description: 'The iconic annual food assembly celebrating the flavors, visual artists, and culinary talent of Karachi.',
    ownerId: 'user-organizer-3',
    isVerified: true,
    city: 'Karachi',
    revenue: 850000
  },
  {
    id: 'org-techpak',
    name: 'Tech Pakistan Hub',
    logoUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=150&auto=format&fit=crop&q=80',
    description: 'Leading platform driving startup summits, pitch competitions, and developer hackathons across Faisalabad and Peshawar.',
    ownerId: 'user-organizer-1',
    isVerified: false,
    city: 'Lahore',
    revenue: 0
  }
];

export const INITIAL_VENUES: Venue[] = [
  {
    id: 'venue-frere-hall',
    name: 'Frere Hall',
    address: 'Fatima Jinnah Rd, Civil Lines, Karachi, Pakistan',
    coordinates: { lat: 24.8471, lng: 67.0326 },
    city: 'Karachi'
  },
  {
    id: 'venue-arts-council',
    name: 'Arts Council of Pakistan',
    address: 'M.R. Kiyani Rd, Saddar, Karachi, Pakistan',
    coordinates: { lat: 24.8569, lng: 67.0210 },
    city: 'Karachi'
  },
  {
    id: 'venue-alhamra',
    name: 'Alhamra Arts Council',
    address: 'Mall Road, Garhi Shahu, Lahore, Pakistan',
    coordinates: { lat: 31.5562, lng: 74.3265 },
    city: 'Lahore'
  },
  {
    id: 'venue-jinnah-convention',
    name: 'Jinnah Convention Centre',
    address: 'Club Road, Islamabad, Pakistan',
    coordinates: { lat: 33.7128, lng: 73.0977 },
    city: 'Islamabad'
  },
  {
    id: 'venue-clifton-park',
    name: 'Clifton Beach Festival Grounds',
    address: 'Block 4, Clifton, Karachi, Pakistan',
    coordinates: { lat: 24.8016, lng: 67.0234 },
    city: 'Karachi'
  }
];

export const INITIAL_EVENTS: Event[] = [
  {
    id: 'ev-sufi-night',
    title: 'Sufi Ecstasy: Live at Frere Hall',
    description: 'An enchanting open-air night celebrating the pure mysticism of Sufi music, featuring the world-renowned Fareed Ayaz & Abu Muhammad Qawwal. Experience high-fidelity acoustics beneath Karachi historic architecture, beautifully illuminated for one exclusive evening.',
    bannerUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&auto=format&fit=crop&q=80',
    categoryId: 'cat-concerts',
    organizerId: 'org-salt-arts',
    venueId: 'venue-frere-hall',
    date: '2026-06-15',
    time: '20:00',
    city: 'Karachi',
    isFeatured: true,
    isApproved: true,
    terms: [
      'Original CNIC or Passport matches ticket name.',
      'Refreshed Dynamic QR Pass must be presented on smartphone at the entrance.',
      'Screenshots of QR codes are invalid as active rotation changes security cycles.',
      'No professional cameras or recording gear permitted without organizer pass.'
    ],
    refundPolicy: 'Refunds are requested up to 48 hours prior to the event, subject to standard 10% platform cancellation charge.',
    faqs: [
      {
        question: 'Are printed tickets accepted?',
        answer: 'No, Qrypt utilizes securely rotating Dynamic Passes for anti-fraud. You must show the active, ticking QR code on your mobile phone dashboard.'
      },
      {
        question: 'What is the role of the 10-second timer?',
        answer: 'The QR Code refreshes every 10 seconds. Once scanned, it authenticates in real-time. This blocks secondary ticket brokers and screenshot copying.'
      },
      {
        question: 'Is there parking available?',
        answer: 'Yes, valet and self-parking are provided inside the Frere Hall secure perimeter gates.'
      }
    ],
    ticketTiers: [
      { id: 'tier-sufi-early', eventId: 'ev-sufi-night', name: 'Early Bird', price: 2500, capacity: 150, sold: 132, description: 'Limited initial batch at exclusive discount rate.' },
      { id: 'tier-sufi-gen', eventId: 'ev-sufi-night', name: 'General Admission', price: 3500, capacity: 500, sold: 340, description: 'Standard lawn entrance with gorgeous stage alignment.' },
      { id: 'tier-sufi-vip', eventId: 'ev-sufi-night', name: 'VIP Circle', price: 7500, capacity: 80, sold: 68, description: 'Reserved front-row sofa cushion seating with direct artists view & high-tea lounge.' }
    ]
  },
  {
    id: 'ev-standup-comedy',
    title: 'Karachi Comedy Special: Improv & Standup',
    description: 'Prepare for non-stop laughter as Pakistan’s award-winning comedians take the stage for a premium standup battle. Featuring interactive audience improv and original observations of Karachi daily life.',
    bannerUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd6a?w=800&auto=format&fit=crop&q=80',
    categoryId: 'cat-comedy',
    organizerId: 'org-laughter-nation',
    venueId: 'venue-arts-council',
    date: '2026-06-20',
    time: '19:30',
    city: 'Karachi',
    isFeatured: true,
    isApproved: true,
    terms: [
      'Show is strictly rated 16+ due to mature material.',
      'Seating is on a first-come, first-served basis.',
      'Active Dynamic QR pass must be loaded inside app.'
    ],
    refundPolicy: 'Tickets are non-refundable except in case of entire event cancellation.',
    faqs: [
      {
        question: 'Will food be available?',
        answer: 'Yes, popcorn, soda, and hot snacks counters are set up by the Arts Council cafe.'
      }
    ],
    ticketTiers: [
      { id: 'tier-comedy-student', eventId: 'ev-standup-comedy', name: 'Student Pass', price: 1000, capacity: 100, sold: 90, description: 'Must present valid university identification card.' },
      { id: 'tier-comedy-regular', eventId: 'ev-standup-comedy', name: 'Regular Admission', price: 2000, capacity: 300, sold: 180, description: 'Standard theater auditorium seating.' }
    ]
  },
  {
    id: 'ev-karachi-eat',
    title: 'Karachi Eat Food Assembly 2026',
    description: 'A culinary paradise gathering the city’s finest home-chefs, street-vendors, and high-end restaurants under one safe sky. With live music concerts, kids gaming arenas, and a massive array of flavors.',
    bannerUrl: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=800&auto=format&fit=crop&q=80',
    categoryId: 'cat-food',
    organizerId: 'org-karachi-eat',
    venueId: 'venue-clifton-park',
    date: '2026-07-02',
    time: '16:00',
    city: 'Karachi',
    isFeatured: false,
    isApproved: true,
    terms: [
      'Family-only event. Unaccompanied single men may be restricted entry.',
      'Re-entry with standard pass requires dynamic validation cycle.',
      'External food/beverages are not permitted.'
    ],
    refundPolicy: 'No refunds under any conditions.',
    faqs: [
      {
        question: 'Is the ticket valid for all 3 days?',
        answer: 'No, each pass is single-day admission. Select your attending date during checkout.'
      }
    ],
    ticketTiers: [
      { id: 'tier-eat-family', eventId: 'ev-karachi-eat', name: 'Family Combo (4 Tickets)', price: 1500, capacity: 1000, sold: 820, description: 'Admit up to 4 family members under one ticket pass.' },
      { id: 'tier-eat-single', eventId: 'ev-karachi-eat', name: 'Single Registration', price: 500, capacity: 5000, sold: 3450, description: 'General entry access for one guest.' }
    ]
  },
  {
    id: 'ev-lahore-fest',
    title: 'Lahore Spring Sufi Caravan',
    description: 'Experiencing Lahore spiritual core inside Alhamra’s classic halls with stunning visual arts exhibits, artisan merchandise and classical instrumental live performance.',
    bannerUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
    categoryId: 'cat-concerts',
    organizerId: 'org-salt-arts',
    venueId: 'venue-alhamra',
    date: '2026-06-28',
    time: '20:30',
    city: 'Lahore',
    isFeatured: true,
    isApproved: true,
    terms: [
      'Active rotating bar code dynamic pass presentation is mandatory.',
      'Strict security screening standard applicable at Alhamra gates.'
    ],
    refundPolicy: 'Refunds permitted if requested 7 days before.',
    faqs: [],
    ticketTiers: [
      { id: 'tier-lahore-standard', eventId: 'ev-lahore-fest', name: 'General Admission', price: 2000, capacity: 400, sold: 190, description: 'Standard lounge.' },
      { id: 'tier-lahore-vvip', eventId: 'ev-lahore-fest', name: 'VVIP Premium Table', price: 10000, capacity: 40, sold: 25, description: 'Premium table banquet.' }
    ]
  },
  {
    id: 'ev-islamabad-summit',
    title: 'Margalla Tech & Startup Summit',
    description: 'Connecting top ecosystem speakers, global funds, VC managers, and builders across Pakistan. Showcasing pitch contests, technology workshops, and recruitment mixers.',
    bannerUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80',
    categoryId: 'cat-startup',
    organizerId: 'org-techpak',
    venueId: 'venue-jinnah-convention',
    date: '2026-07-10',
    time: '09:00',
    city: 'Islamabad',
    isFeatured: false,
    isApproved: true,
    terms: [
      'Must present professional or university enrollment badge.',
      'Rotating Dynamic QR pass required to enter exhibition pavilion.'
    ],
    refundPolicy: 'Cancellations free within initial 48 hours of purchase.',
    faqs: [
      {
        question: 'Are certificates provided?',
        answer: 'Yes, PDF digital participation certificates are emailed automatically to validated attendees.'
      }
    ],
    ticketTiers: [
      { id: 'tier-tech-regular', eventId: 'ev-islamabad-summit', name: 'Regular Registration', price: 4000, capacity: 800, sold: 420, description: 'Keynotes, networking area & food coupon.' },
      { id: 'tier-tech-free', eventId: 'ev-islamabad-summit', name: 'Free Student Pass', price: 0, capacity: 200, sold: 195, description: 'Valid for students with dynamic QR verification.' }
    ]
  }
];

export const MOCK_USERS: User[] = [
  {
    id: 'user-buyer',
    email: 'buyer@qrypt.pk',
    name: 'Asim Siddiqui',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    role: UserRole.BUYER,
    createdAt: '2026-01-10T11:00:00Z'
  },
  {
    id: 'user-organizer-1',
    email: 'saltarts@qrypt.pk',
    name: 'Alina Khan (SaltArts)',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    role: UserRole.ORGANIZER,
    createdAt: '2026-01-12T09:30:00Z',
    balance: 185000
  },
  {
    id: 'user-admin',
    email: 'admin@qrypt.pk',
    name: 'Faisal Kamal (Qrypt Admin)',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    role: UserRole.ADMIN,
    createdAt: '2026-01-01T08:00:00Z'
  }
];

export const MOCK_PROMO_CODES: PromoCode[] = [
  { code: 'KARACHI10', discountType: 'PERCENTAGE', discountValue: 10, isActive: true, expiryDate: '2026-12-31', usesCount: 42 },
  { code: 'SUFIWELCOME', discountType: 'FIXED', discountValue: 500, isActive: true, expiryDate: '2026-08-30', usesCount: 19 },
  { code: 'EATFEST', discountType: 'PERCENTAGE', discountValue: 15, isActive: true, expiryDate: '2026-07-15', usesCount: 156 }
];
