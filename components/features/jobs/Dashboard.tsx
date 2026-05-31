"use client";

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion, useAnimation } from 'framer-motion';
import type { Map as LeafletMap } from 'leaflet';
import {
  MapPin, Search, Bell, User, MessageSquare, Clock, TrendingUp, ArrowRight, ShieldCheck,
  List, Pencil, Filter, DollarSign, Flame, Moon
} from 'lucide-react';
import { PremiumButton } from '@/components/shared/PremiumButton';
import { Job } from '@/types';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { MOCK_JOBS } from '@/lib/mock-data';

const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

type LeafletModule = typeof import('leaflet');

// Custom icon for markers
const getJobMarkerIcon = (urgency: string, leaflet: LeafletModule) => {
  return new leaflet.Icon({
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    className: `leaflet-job-marker ${urgency === 'high' ? 'leaflet-job-marker-urgent' : ''}`
  });
};

// Types for filters
type FilterOptions = {
  sector: string[];
  salaryRange: [number, number];
  showUrgent: boolean;
};

export const Dashboard = ({
  isGuest = false,
  onActionRequired,
  onNavigate
}: {
  isGuest?: boolean,
  onActionRequired?: () => void,
  onNavigate?: (view: 'home' | 'messages' | 'profile') => void
}) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'list' | 'map'>('list');
  const [filters, setFilters] = useState<FilterOptions>({
    sector: [],
    salaryRange: [0, 50000],
    showUrgent: false,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredJobId, setHoveredJobId] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [leaflet, setLeaflet] = useState<LeafletModule | null>(null);
  const [mapRef, setMapRef] = useState<LeafletMap | null>(null);
  const zoomControlAddedRef = useRef(false);

  // Animation controls
  const statsAnimation = useAnimation();
  const cardAnimation = useAnimation();

  // Initialize filtered jobs
  useEffect(() => {
    applyFilters();
  }, [searchQuery, filters]);

  useEffect(() => {
    import('leaflet').then(setLeaflet);
  }, []);

  useEffect(() => {
    if (!leaflet || !mapRef || zoomControlAddedRef.current) return;

    leaflet.control.zoom({ position: 'topright' }).addTo(mapRef);
    zoomControlAddedRef.current = true;
  }, [leaflet, mapRef]);

  // Apply filters and search
  const applyFilters = () => {
    setIsLoading(true);

    // Simulate network delay for realism
    const timer = setTimeout(() => {
      let results = [...MOCK_JOBS];

      // Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        results = results.filter(job =>
          job.title.toLowerCase().includes(query) ||
          job.description.toLowerCase().includes(query) ||
          job.category.toLowerCase().includes(query) ||
          job.location.neighborhood.toLowerCase().includes(query)
        );
      }

      // Sector filter
      if (filters.sector.length > 0) {
        results = results.filter(job =>
          filters.sector.includes(job.category)
        );
      }

      // Salary range filter
      results = results.filter(job =>
        job.price >= filters.salaryRange[0] &&
        job.price <= filters.salaryRange[1]
      );

      // Urgent filter
      if (filters.showUrgent) {
        results = results.filter(job => job.urgency === 'high');
      }

      setFilteredJobs(results);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  };

  // Handle job card click
  const handleJobClick = (jobId: string) => {
    // Navigate to job detail page with /offres/[id] route
    router.push(`/offres/${jobId}`);
  };

  // Handle job marker click on map
  const handleMarkerClick = (jobId: string) => {
    setSelectedJobId(jobId);
    // Also update the hover state for visual feedback
    setHoveredJobId(jobId);
    // Optionally, you could open a popup or bottom sheet here
    // For now, we'll just highlight the job and let the user click to go to detail page
  };

  // Handle sector toggle
  const toggleSector = (sector: string) => {
    setFilters(prev => {
      const newSectors = [...prev.sector];
      const index = newSectors.indexOf(sector);
      if (index === -1) {
        newSectors.push(sector);
      } else {
        newSectors.splice(index, 1);
      }
      return { ...prev, sector: newSectors };
    });
  };

  // Handle urgent toggle
  const toggleUrgent = () => {
    setFilters(prev => ({ ...prev, showUrgent: !prev.showUrgent }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      sector: [],
      salaryRange: [0, 50000],
      showUrgent: false,
    });
    setSearchQuery('');
  };

  // Get sector color
  const getSectorColor = (sector: string) => {
    switch (sector.toLowerCase()) {
      case 'bâtiment':
        return 'bg-skatta-green/20 text-skatta-green';
      case 'transport':
        return 'bg-skatta-yellow/20 text-skatta-yellow';
      case 'entretien':
        return 'bg-skatta-blue/20 text-skatta-blue';
      default:
        return 'bg-skatta-blue/20 text-skatta-blue';
    }
  };

  // Format price with FCFA/JOUR
  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} FCFA/JOUR`;
  };

  return (
    <div className="min-h-screen bg-skatta-dark dark:bg-skatta-darker">
      {/* Dark mode toggle - for demo purposes */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => document.documentElement.classList.toggle('dark')}
          className="p-2 rounded-full bg-skatta-blue/20 text-skatta-blue hover:bg-skatta-blue/30 transition-colors"
        >
          <Moon size={20} />
        </button>
      </div>

      {/* Gabon Color Accent Bar */}
      <div className="h-1 w-full flex">
        <div className="flex-1 bg-skatta-green" />
        <div className="flex-1 bg-skatta-yellow" />
        <div className="flex-1 bg-skatta-blue" />
      </div>

      {/* Header */}
      <header className="glass-dark sticky top-0 z-40 border-b border-skatta-blue/10 backdrop-blur-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-skatta-green flex items-center justify-center text-white font-black text-sm shadow-md">
            {isGuest ? '?' : 'JN'}
          </div>
          <div className="hidden sm:flex flex-col">
            <h2 className="text-sm font-black text-skatta-blue leading-none tracking-tight">{isGuest ? 'Visiteur' : 'Jean Nguema'}</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Libreville, Gabon</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            className="p-2.5 rounded-full bg-skatta-blue/20 text-skatta-blue hover:bg-skatta-blue/30 transition-colors"
          >
            <Bell size={20} />
          </button>
          <button
            onClick={() => onNavigate?.('profile')}
            className="p-2.5 rounded-full bg-skatta-blue/20 text-skatta-blue hover:bg-skatta-blue/30 transition-colors"
          >
            <User size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 sm:px-8 pt-12 space-y-16 max-w-7xl mx-auto pb-24">
        {/* Hero Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-8 text-center"
        >
          <h1 className="text-4xl font-black text-skatta-yellow mb-4 drop-shadow-lg">
            Trouvez votre prochaine mission<br/>
            <span className="block text-skatta-green text-3xl">au Gabon</span>
          </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Des milliers d'opportunités vérifiées, des salaires justes, et une communauté de professionnels engagés.
            </p>

            {/* Stats Bar */}
            <motion.ul
              whileHover={{ y: -2 }}
              animate={statsAnimation}
              className="flex flex-wrap justify-center gap-6 mt-6"
            >
              <motion.li
                key="live-jobs"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col items-center gap-2 p-4 bg-skatta-darker/30 rounded-xl border border-skatta-green/20"
              >
                <TrendingUp size={28} className="text-skatta-green" />
                <div className="text-skatta-yellow font-black text-2xl">247</div>
                <p className="text-xs text-gray-400 uppercase tracking-widest">Offres Live</p>
              </motion.li>

              <motion.li
                key="urgent"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center gap-2 p-4 bg-skatta-darker/30 rounded-xl border border-skatta-red/20"
              >
                <Flame size={28} className="text-red-400" />
                <div className="text-skatta-yellow font-black text-2xl">18</div>
                <p className="text-xs text-gray-400 uppercase tracking-widest">Urgentes</p>
              </motion.li>

              <motion.li
                key="matches"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center gap-2 p-4 bg-skatta-darker/30 rounded-xl border border-skatta-blue/20"
              >
                <ShieldCheck size={28} className="text-skatta-blue" />
                <div className="text-skatta-yellow font-black text-2xl">89</div>
                <p className="text-xs text-gray-400 uppercase tracking-widest">Matches Parfaits</p>
              </motion.li>
            </motion.ul>
          </motion.div>

          {/* Search and Filters */}
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un métier, une compétence, une localité..."
                className="w-full pl-10 pr-4 py-4 bg-skatta-darker/40 border border-skatta-blue/30 rounded-xl focus:border-skatta-green focus:ring-2 focus:ring-skatta-green/20 text-white placeholder-text-gray-400 transition-all duration-300"
              />
            </div>

            {/* Filters Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Sector Filter */}
              <div className="space-y-3">
                <p className="text-sm font-black text-skatta-yellow">Secteur</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => toggleSector('Bâtiment')}
                    className={cn(
                      'px-3 py-2 rounded-full text-xs font-medium transition-all duration-300',
                      filters.sector.includes('Bâtiment')
                        ? 'bg-skatta-green/30 text-skatta-green border border-skatta-green/50'
                        : 'bg-skatta-darker/40 text-gray-400 border border-skatta-blue/30'
                    )}
                  >
                    Bâtiment
                  </button>
                  <button
                    onClick={() => toggleSector('Transport')}
                    className={cn(
                      'px-3 py-2 rounded-full text-xs font-medium transition-all duration-300',
                      filters.sector.includes('Transport')
                        ? 'bg-skatta-yellow/30 text-skatta-yellow border border-skatta-yellow/50'
                        : 'bg-skatta-darker/40 text-gray-400 border border-skatta-blue/30'
                    )}
                  >
                    Transport
                  </button>
                  <button
                    onClick={() => toggleSector('Entretien')}
                    className={cn(
                      'px-3 py-2 rounded-full text-xs font-medium transition-all duration-300',
                      filters.sector.includes('Entretien')
                        ? 'bg-skatta-blue/30 text-skatta-blue border border-skatta-blue/50'
                        : 'bg-skatta-darker/40 text-gray-400 border border-skatta-blue/30'
                    )}
                  >
                    Entretien
                  </button>
                </div>
              </div>

              {/* Salary Range */}
              <div className="space-y-3">
                <p className="text-sm font-black text-skatta-yellow">Salaire (FCFA/JOUR)</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>0</span>
                    <span>50,000+</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={50000}
                    value={filters.salaryRange[1]}
                    onChange={(e) =>
                      setFilters(prev => ({
                        ...prev,
                        salaryRange: [prev.salaryRange[0], Number(e.target.value)]
                      }))
                    }
                    className="w-full h-2 bg-skatta-blue/20 rounded-full"
                  />
                  <div className="flex justify-between text-sm font-black">
                    <span>Minimum: 0</span>
                    <span>Maximum: {filters.salaryRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Urgent Toggle */}
              <div className="space-y-3 flex flex-col justify-between">
                <p className="text-sm font-black text-skatta-yellow">Options</p>
                <div className="flex items-center gap-3">
                  <Flame size={16} className="text-red-400" />
                  <label className="flex items-center gap-2 text-sm font-black text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.showUrgent}
                      onChange={toggleUrgent}
                      className="h-4 w-4 text-skatta-green border-skatta-blue rounded"
                    />
                    Afficher uniquement les urgentes
                  </label>
                </div>
                <button
                  onClick={clearFilters}
                  className="mt-3 w-full px-4 py-2 bg-skatta-darker/40 text-sm font-black text-skatta-yellow border border-skatta-blue/30 rounded hover:bg-skatta-blue/20 transition-colors"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            </div>
          </div>

          {/* Liste/Carte Toggle */}
          <div className="flex bg-skatta-darker/40 p-2 rounded-xl w-fit mx-auto border border-skatta-blue/20 backdrop-blur-sm">
            <button
              onClick={() => setActiveTab('list')}
              className={cn(
                "px-6 py-3 rounded-xl text-sm font-black transition-all duration-300",
                activeTab === 'list'
                  ? "bg-skatta-green text-white shadow-lg shadow-skatta-green/30"
                  : "text-gray-400 hover:text-skatta-green"
              )}
            >
              Liste des Offres
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={cn(
                "px-6 py-3 rounded-xl text-sm font-black transition-all duration-300",
                activeTab === 'map'
                  ? "bg-skatta-green text-white shadow-lg shadow-skatta-green/30"
                  : "text-gray-400 hover:text-skatta-green"
              )}
            >
              Vue Carte
            </button>
          </div>

          {/* Job Listings or Map */}
          <div className="mt-8">
            {activeTab === 'list' ? (
              <div className="space-y-6">
                {/* Loading State */}
                {isLoading && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[0, 1, 2].map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden shadow-2xl shadow-black/20 animate-pulse"
                      >
                        <div className="h-48 bg-white/10" />
                        <div className="p-6 space-y-4">
                          <div className="h-4 w-24 rounded-full bg-skatta-green/20" />
                          <div className="h-6 w-4/5 rounded-full bg-white/10" />
                          <div className="h-4 w-2/3 rounded-full bg-white/10" />
                          <div className="h-12 w-full rounded-full bg-skatta-yellow/20" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Jobs Grid */}
                {!isLoading && filteredJobs.length > 0 && (
                  <motion.div
                    whileHover={{ y: -2 }}
                    animate={cardAnimation}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                  >
                    {filteredJobs.map((job, index) => (
                      <motion.div
                        key={job.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, type: 'spring', stiffness: 300, damping: 20 }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleJobClick(job.id)}
                        className={cn(
                          "group cursor-pointer relative overflow-hidden",
                          hoveredJobId === job.id
                            ? "scale-105 z-10"
                            : ""
                        )}
                      >
                        {/* Job Card Premium */}
                        <div className="bg-white/[0.04] backdrop-blur-2xl rounded-2xl border border-white/10 overflow-hidden transition-all duration-500 group-hover:border-skatta-green/40 hover:shadow-2xl hover:shadow-skatta-green/10">
                          {/* Image Container */}
                          <div className="relative h-48">
                            <img
                              src={job.imageUrl}
                              alt={job.title}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            {/* Live/Urgency Badges */}
                            <div className="absolute top-3 left-3 flex items-center gap-2 bg-skatta-darker/70 backdrop-blur-sm px-2 py-1 rounded-full border border-white/20">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-skatta-green opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-skatta-green animate-pulse-green"></span>
                              </span>
                              <span className="text-[9px] font-black text-skatta-blue uppercase tracking-tighter">Skatta LIVE</span>
                            </div>

                            {job.urgency === 'high' && (
                              <div className="absolute top-3 right-3 bg-red-500/90 text-white text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-tighter shadow-lg animate-bounce">
                                Urgent
                              </div>
                            )}
                          </div>

                          {/* Job Content */}
                          <div className="p-6 space-y-4">
                            {/* Header with Title and Price */}
                            <div className="flex justify-between items-start gap-4">
                              <div className="space-y-2">
                                {/* Sector Badge */}
                                <span className={cn(
                                  "badge-sector",
                                  getSectorColor(job.category)
                                )}>
                                  {job.category}
                                </span>

                                {/* Job Title */}
                                <h3 className="text-editorial-header text-xl line-clamp-2 group-hover:text-skatta-green transition-colors duration-300">
                                  {job.title}
                                </h3>
                              </div>

                              {/* Price */}
                              <div className="text-right space-y-2">
                                <span className="block font-black text-skatta-yellow text-xl leading-none">
                                  {formatPrice(job.price)}
                                </span>
                                <span className="text-editorial-label">/ JOUR</span>
                              </div>
                            </div>

                            {/* Details Row */}
                            <div className="flex items-center gap-4 text-gray-300 text-[11px] font-medium">
                              <span className="flex items-center gap-1.5">
                                <MapPin size={14} className="text-skatta-green" />
                                {job.location.neighborhood}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Clock size={14} className="text-skatta-green" />
                                {job.duration === 'day' ? 'Journalier' : 'Intérim'}
                              </span>
                            </div>

                            {/* Description Preview */}
                            {job.description.length > 100 && (
                              <p className="text-gray-400 text-sm line-clamp-2 mt-2">
                                {job.description.substring(0, 100)}...
                              </p>
                            )}

                            {/* Apply Button */}
                            <div className="mt-4 pt-4 border-t border-skatta-blue/10">
                              <PremiumButton
                                variant="outline"
                                size="md"
                                className="w-full text-left flex items-center justify-between"
                              >
                                <span>Postuler maintenant</span>
                                <ArrowRight size={18} />
                              </PremiumButton>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {/* Empty State */}
                {!isLoading && filteredJobs.length === 0 && (
                  <div className="text-center py-12">
                    <Pencil size={48} className="mx-auto text-skatta-blue/30 mb-4" />
                    <h3 className="font-black text-skatta-yellow text-xl">Aucune offre ne correspond à vos critères</h3>
                    <p className="text-gray-400 max-w-xl mx-auto">
                      Essayez d'élargir votre recherche ou de modifier vos filtres pour découvrir davantage d'opportunités.
                    </p>
                    <button
                      onClick={clearFilters}
                      className="mt-6 px-6 py-3 bg-skatta-green text-white font-medium rounded-lg hover:bg-skatta-green/90 transition-colors"
                    >
                      Réinitialiser les filtres
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Enhanced Map View with Leaflet.js */}
                <div className="rounded-2xl border border-skatta-blue/20 overflow-hidden">
                {/* Map Container */}
                <div className="relative h-[70vh]">
                  {leaflet ? (
                    <MapContainer
                      center={[0.4167, 9.4498]}  // Default to Glass area
                      zoom={12}
                      scrollWheelZoom={true}
                      doubleClickZoom={true}
                      boxZoom={true}
                      keyboard={true}
                      zoomControl={false}
                      className="w-full h-full"
                      ref={setMapRef}
                    >
                    {/* Tile Layer */}
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* Job Markers */}
                    {!isLoading && filteredJobs.map((job) => (
                      <Marker
                        key={job.id}
                        position={[job.location.lat, job.location.lng]}
                        icon={getJobMarkerIcon(job.urgency, leaflet)}
                        eventHandlers={{
                          click: () => handleMarkerClick(job.id),
                          mouseover: () => {
                            setHoveredJobId(job.id);
                            // Optionally popup on hover
                          },
                          mouseout: () => {
                            if (hoveredJobId === job.id) {
                              setHoveredJobId(null);
                            }
                          }
                        }}
                      >
                        <Popup>
                          <div className="p-4 min-w-[200px]">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-8 h-8 bg-skatta-green/20 rounded-full flex items-center justify-center">
                                <MapPin size={16} className="text-skatta-green" />
                              </div>
                              <div>
                                <h4 className="font-black text-skatta-yellow">{job.title}</h4>
                                <p className="text-sm text-gray-300">{formatPrice(job.price)}</p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <p className="text-xs text-gray-400">
                                <strong>Secteur:</strong> {job.category}
                              </p>
                              <p className="text-xs text-gray-400">
                                <strong>Quartier:</strong> {job.location.neighborhood}
                              </p>
                              {job.urgency === 'high' && (
                                <p className="text-xs text-red-400 font-medium">
                                  <strong>Urgente!</strong>
                                </p>
                              )}
                            </div>
                            <div className="mt-3 pt-3 border-t border-skatta-blue/20">
                              <button
                                onClick={() => {
                                  router.push(`/offres/${job.id}`);
                                  // Close popup after navigation? In a real app, this would be handled by navigation
                                }}
                                className={cn(
                                  "w-full px-3 py-2 bg-skatta-green text-white font-medium rounded text-sm",
                                  "hover:bg-skatta-green/90 transition-colors"
                                )}
                              >
                                Voir les détails
                              </button>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    ))}

                    {/* Selected Job Highlight (if any) */}
                    {selectedJobId && !isLoading && (
                      <>
                        {/* This would typically be handled by the popup or a custom overlay */}
                        {/* For now, we rely on the popup from the marker click */}
                      </>
                    )}
                    </MapContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center bg-skatta-darker/60 text-gray-300">
                      Chargement de la carte...
                    </div>
                  )}

                  {/* Map Controls */}
                  <div className="absolute top-4 left-4 flex space-x-3 z-10">
                    <button
                      onClick={() => {
                        if (mapRef) {
                          mapRef.flyTo([0.4167, 9.4498], 12); // Return to default view
                        }
                      }}
                      className="p-2 rounded-full bg-skatta-blue/20 text-skatta-blue hover:bg-skatta-blue/30 transition-colors"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => {
                        if (leaflet && mapRef && filteredJobs.length > 0) {
                          const bounds = leaflet.latLngBounds(
                            filteredJobs.map(job => [job.location.lat, job.location.lng])
                          );
                          mapRef.fitBounds(bounds.pad(0.2));
                        }
                      }}
                      className="p-2 rounded-full bg-skatta-blue/20 text-skatta-blue hover:bg-skatta-blue/30 transition-colors"
                    >
                      <ArrowRight size={18} />
                    </button>
                  </div>

                  {/* Attribution Control Alternative */}
                  <div className="absolute bottom-0 left-0 right-0 p-2 text-xs text-gray-400">
                    Données cartographiques &copy; OpenStreetMap contributeurs
                  </div>
                </div>

                {/* Map Footer with Stats */}
                <div className="px-4 pt-3 pb-2 bg-skatta-darker/40 border-t border-skatta-blue/20">
                  <div className="flex justify-between text-sm font-medium">
                    <span>
                      {filteredJobs.length} offres affichées sur la carte
                    </span>
                    <span>
                      {filters.sector.length > 0 ?
                        `Filtre: ${filters.sector.join(', ')}` :
                        `Aucun filtre de secteur`}
                    </span>
                  </div>
                </div>
                </div>
              </>
            )}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 glass-dark border-t border-skatta-blue/10 px-6 py-4 flex justify-between items-center z-50 backdrop-blur-sm">
          <button
            onClick={() => onNavigate?.('home')}
            className="flex flex-col items-center gap-1 text-skatta-green"
          >
            <TrendingUp size={24} />
            <span className="text-[10px] font-black uppercase tracking-widest">Accueil</span>
          </button>
          <button
            onClick={() => onNavigate?.('messages')}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-skatta-blue transition-colors"
          >
            <MessageSquare size={24} />
            <span className="text-[10px] font-black uppercase tracking-widest">Messages</span>
          </button>
          <button
            onClick={() => onNavigate?.('profile')}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-skatta-blue transition-colors"
          >
            <User size={24} />
            <span className="text-[10px] font-black uppercase tracking-widest">Profil</span>
          </button>
        </nav>
      </div>
    );
};
