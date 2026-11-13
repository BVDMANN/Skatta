"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';
import type { Map as LeafletMap } from 'leaflet';
import {
  MapPin, Search, Bell, User, MessageSquare, TrendingUp, ArrowRight,
  List, Pencil, Filter, Flame, Heart, ChevronDown, RotateCcw, Briefcase, CalendarDays
} from 'lucide-react';
import { PremiumButton } from '@/components/shared/PremiumButton';
import { Categories } from '@/components/features/jobs/Categories';
import { HowItWorks } from '@/components/features/jobs/HowItWorks';
import { Footer } from '@/components/shared/Footer';
import { Job, Employer } from '@/types';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SITE_IMAGES } from '@/lib/mock-data';
import { getJobMarkerIcon, type LeafletModule } from '@/components/features/jobs/job-marker-icon';

const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

const FAV_KEY = 'skatta-favoris';

type SortKey = 'recent' | 'price-desc' | 'price-asc';

/** Libellé de date de publication (« Aujourd'hui », « Hier », « Il y a X j »). */
const postedLabel = (iso: string) => {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return "Aujourd'hui";
  if (days === 1) return 'Hier';
  return `Il y a ${days} j`;
};

const formatPrice = (price: number) => `${price.toLocaleString()} FCFA/JOUR`;

const getSectorColor = (sector: string) => {
  switch (sector.toLowerCase()) {
    case 'bâtiment': return 'bg-green-100 text-green-800';
    case 'transport': return 'bg-amber-100 text-amber-800';
    case 'entretien': return 'bg-blue-100 text-blue-800';
    case 'sécurité': return 'bg-violet-100 text-violet-800';
    case 'logistique': return 'bg-teal-100 text-teal-800';
    default: return 'bg-slate-100 text-slate-700';
  }
};

const scrollToId = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};

export const Dashboard = ({
  jobs,
  employers,
  user,
}: {
  /** Offres publiées lues depuis la base (props serveur). */
  jobs: Job[];
  employers: Record<string, Employer>;
  user: { id: string; email: string; role: 'candidat' | 'employeur' } | null;
}) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'list' | 'map'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [sectors, setSectors] = useState<string[]>([]);
  const [neighborhood, setNeighborhood] = useState('Tous');
  const [minSalary, setMinSalary] = useState(0);
  const [contract, setContract] = useState('Tous');
  const [showUrgent, setShowUrgent] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>('recent');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [hoveredJobId, setHoveredJobId] = useState<string | null>(null);
  const [leaflet, setLeaflet] = useState<LeafletModule | null>(null);
  const [mapRef, setMapRef] = useState<LeafletMap | null>(null);
  const zoomControlAddedRef = useRef(false);

  // Favoris persistés dans le navigateur
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(FAV_KEY) ?? '[]');
      if (Array.isArray(saved)) setFavorites(saved);
    } catch { /* stockage indisponible : on ignore */ }
  }, []);

  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
      try { localStorage.setItem(FAV_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };

  useEffect(() => {
    import('leaflet').then(setLeaflet);
  }, []);

  useEffect(() => {
    if (!leaflet || !mapRef || zoomControlAddedRef.current) return;
    leaflet.control.zoom({ position: 'topright' }).addTo(mapRef);
    zoomControlAddedRef.current = true;
  }, [leaflet, mapRef]);

  const allSectors = useMemo(
    () => Array.from(new Set(jobs.map((j) => j.category))),
    [jobs]
  );
  const allNeighborhoods = useMemo(
    () => Array.from(new Set(jobs.map((j) => j.location.neighborhood))).sort(),
    [jobs]
  );
  const allContracts = useMemo(
    () => Array.from(new Set(jobs.map((j) => j.contractType ?? 'Journalier'))),
    [jobs]
  );
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    jobs.forEach((j) => {
      counts[j.category] = (counts[j.category] ?? 0) + 1;
    });
    return counts;
  }, [jobs]);

  const hasActiveFilters =
    searchQuery.trim() !== '' || sectors.length > 0 || neighborhood !== 'Tous' ||
    minSalary > 0 || contract !== 'Tous' || showUrgent || showFavoritesOnly;

  const filteredJobs = useMemo(() => {
    let results = [...jobs];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      results = results.filter((job) => {
        const employer = employers[job.employerId]?.name ?? '';
        return (
          job.title.toLowerCase().includes(q) ||
          job.description.toLowerCase().includes(q) ||
          job.category.toLowerCase().includes(q) ||
          job.location.neighborhood.toLowerCase().includes(q) ||
          employer.toLowerCase().includes(q)
        );
      });
    }
    if (sectors.length > 0) results = results.filter((job) => sectors.includes(job.category));
    if (neighborhood !== 'Tous') results = results.filter((job) => job.location.neighborhood === neighborhood);
    if (minSalary > 0) results = results.filter((job) => job.price >= minSalary);
    if (contract !== 'Tous') results = results.filter((job) => (job.contractType ?? 'Journalier') === contract);
    if (showUrgent) results = results.filter((job) => job.urgency === 'high');
    if (showFavoritesOnly) results = results.filter((job) => favorites.includes(job.id));

    switch (sort) {
      case 'price-desc': results.sort((a, b) => b.price - a.price); break;
      case 'price-asc': results.sort((a, b) => a.price - b.price); break;
      default: results.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    }
    return results;
  }, [jobs, employers, searchQuery, sectors, neighborhood, minSalary, contract, showUrgent, showFavoritesOnly, sort, favorites]);

  const toggleSector = (sector: string) => {
    setSectors((prev) =>
      prev.includes(sector) ? prev.filter((s) => s !== sector) : [...prev, sector]
    );
  };

  const clearFilters = () => {
    setSectors([]);
    setNeighborhood('Tous');
    setMinSalary(0);
    setContract('Tous');
    setShowUrgent(false);
    setShowFavoritesOnly(false);
    setSearchQuery('');
    setSort('recent');
  };

  const handleSelectCategory = (sector: string) => {
    setSectors((prev) => (prev.includes(sector) ? prev : [sector]));
    setShowFavoritesOnly(false);
    scrollToId('offres-liste');
  };

  const goToFavorites = () => {
    setShowFavoritesOnly(true);
    scrollToId('offres-liste');
  };

  const handleJobClick = (jobId: string) => router.push(`/offres/${jobId}`);

  const liveCount = jobs.filter((job) => job.status === 'open').length;
  const urgentCount = jobs.filter((job) => job.urgency === 'high').length;
  const neighborhoodCount = new Set(jobs.map((job) => job.location.neighborhood)).size;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Barre tricolore Gabon */}
      <div className="h-1 w-full flex">
        <div className="flex-1 bg-skatta-green" />
        <div className="flex-1 bg-skatta-yellow" />
        <div className="flex-1 bg-skatta-blue" />
      </div>

      {/* En-tête fixe — navigation visible dès l'arrivée */}
      <header className="glass-dark fixed inset-x-0 top-0 z-40 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-3">
          <button onClick={() => scrollToId('top')} className="flex items-center gap-2.5 shrink-0" aria-label="Skatta — Accueil">
            <span className="w-10 h-10 rounded-xl bg-skatta-green flex items-center justify-center text-white font-black text-lg shadow-md">S</span>
            <span className="text-xl font-black text-skatta-blue tracking-tight">Skatta</span>
          </button>

          <nav className="hidden md:flex items-center gap-1 text-sm font-bold" aria-label="Navigation principale">
            <button onClick={() => scrollToId('top')} className="px-4 py-2 rounded-full text-slate-700 hover:bg-slate-100 transition-colors">Accueil</button>
            <button onClick={() => scrollToId('offres-liste')} className="px-4 py-2 rounded-full text-slate-700 hover:bg-slate-100 transition-colors">Offres</button>
            <button onClick={() => scrollToId('comment-ca-marche')} className="px-4 py-2 rounded-full text-slate-700 hover:bg-slate-100 transition-colors">Comment ça marche</button>
            <button
              onClick={goToFavorites}
              className={cn(
                "px-4 py-2 rounded-full inline-flex items-center gap-1.5 transition-colors",
                showFavoritesOnly ? "bg-red-50 text-red-600" : "text-slate-700 hover:bg-slate-100"
              )}
            >
              <Heart size={16} className={showFavoritesOnly ? "fill-red-500 text-red-500" : ""} />
              Favoris
              {favorites.length > 0 && (
                <span className="min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[11px] font-black inline-flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={goToFavorites}
              className="md:hidden relative p-2.5 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              aria-label="Mes favoris"
            >
              <Heart size={20} className={showFavoritesOnly ? "fill-red-500 text-red-500" : ""} />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[11px] font-black inline-flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </button>
            {user?.role === 'employeur' && (
              <Link
                href="/tableau-de-bord/publier"
                className="hidden md:inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-skatta-green text-white text-sm font-bold shadow-md shadow-skatta-green/20 hover:bg-skatta-green/90 transition-colors"
              >
                + Publier une offre
              </Link>
            )}
            <Link
              href="/mes-candidatures"
              className="p-2.5 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              aria-label="Mes candidatures"
            >
              <Bell size={20} />
            </Link>
            <Link
              href="/compte"
              className="p-2.5 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              aria-label="Mon compte"
            >
              <User size={20} />
            </Link>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="px-4 sm:px-8 pt-24 space-y-14 max-w-7xl mx-auto pb-24">
        {/* Bannière « Trouvez votre prochaine mission » — claire */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white px-6 py-12 space-y-8 text-center shadow-lg shadow-slate-900/5"
        >
          <img
            src={SITE_IMAGES.heroCity}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/80 to-white" />
          <div className="relative">
            <h1 className="text-4xl font-black text-skatta-blue mb-4">
              Trouvez votre prochaine mission<br />
              <span className="block text-skatta-green text-3xl">au Gabon</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Des milliers d&apos;opportunités vérifiées, des salaires justes, et une communauté de professionnels engagés.
            </p>

            <ul className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-8">
              <li className="flex flex-col items-center gap-1.5 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm min-w-28">
                <TrendingUp size={26} className="text-skatta-green" />
                <div className="text-skatta-blue font-black text-2xl">{liveCount}</div>
                <p className="text-[11px] text-slate-500 uppercase tracking-widest font-bold">Offres en ligne</p>
              </li>
              <li className="flex flex-col items-center gap-1.5 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm min-w-28">
                <Flame size={26} className="text-red-500" />
                <div className="text-skatta-blue font-black text-2xl">{urgentCount}</div>
                <p className="text-[11px] text-slate-500 uppercase tracking-widest font-bold">Urgentes</p>
              </li>
              <li className="flex flex-col items-center gap-1.5 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm min-w-28">
                <MapPin size={26} className="text-skatta-blue" />
                <div className="text-skatta-blue font-black text-2xl">{neighborhoodCount}</div>
                <p className="text-[11px] text-slate-500 uppercase tracking-widest font-bold">Quartiers couverts</p>
              </li>
              <li className="flex flex-col items-center gap-1.5 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm min-w-28">
                <Heart size={26} className="text-red-500" />
                <div className="text-skatta-blue font-black text-2xl">{favorites.length}</div>
                <p className="text-[11px] text-slate-500 uppercase tracking-widest font-bold">Favoris</p>
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Catégories avec images — cliquer filtre les offres */}
        <Categories onSelect={handleSelectCategory} counts={categoryCounts} />

        {/* Recherche + filtres */}
        <section id="offres-liste" className="space-y-5 scroll-mt-24">
          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un métier, un employeur, un quartier…"
              aria-label="Rechercher une offre"
              className="w-full pl-11 pr-11 py-4 bg-white border border-slate-300 rounded-2xl focus:border-skatta-green focus:ring-2 focus:ring-skatta-green/20 text-slate-900 placeholder:text-slate-400 transition-all duration-300 shadow-sm text-base"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full text-slate-400 hover:bg-slate-100"
                aria-label="Effacer la recherche"
              >
                ✕
              </button>
            )}
          </div>

          {/* Bouton filtres (mobile) + tri */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setFiltersOpen((v) => !v)}
              className={cn(
                "md:hidden inline-flex items-center gap-2 px-5 py-3 rounded-full font-bold text-sm border transition-colors min-h-12",
                hasActiveFilters
                  ? "bg-skatta-green text-white border-skatta-green"
                  : "bg-white text-slate-700 border-slate-300"
              )}
              aria-expanded={filtersOpen}
            >
              <Filter size={16} /> Filtres
              {hasActiveFilters && (
                <span className="min-w-5 h-5 px-1 rounded-full bg-white text-skatta-green text-[11px] font-black inline-flex items-center justify-center">•</span>
              )}
              <ChevronDown size={16} className={cn("transition-transform", filtersOpen && "rotate-180")} />
            </button>

            <div className="flex items-center gap-2 ml-auto">
              <label htmlFor="tri-offres" className="text-sm font-bold text-slate-500 hidden sm:block">Trier par</label>
              <select
                id="tri-offres"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="px-4 py-3 rounded-full bg-white border border-slate-300 text-sm font-bold text-slate-700 shadow-sm focus:border-skatta-green focus:outline-none min-h-12"
              >
                <option value="recent">Plus récentes</option>
                <option value="price-desc">Salaire : le plus élevé</option>
                <option value="price-asc">Salaire : le plus bas</option>
              </select>
            </div>
          </div>

          {/* Panneau de filtres — repliable sur mobile, toujours visible sur ordinateur */}
          <div className={cn(
            "bg-white border border-slate-200 rounded-3xl shadow-sm p-5 sm:p-6 space-y-5",
            !filtersOpen && "hidden md:block"
          )}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Secteur */}
              <div className="space-y-2.5">
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">Secteur</p>
                <div className="flex flex-wrap gap-2">
                  {allSectors.map((sector) => {
                    const active = sectors.includes(sector);
                    return (
                      <button
                        key={sector}
                        onClick={() => toggleSector(sector)}
                        aria-pressed={active}
                        className={cn(
                          'px-3.5 py-2 rounded-full text-xs font-bold border transition-all min-h-9',
                          active
                            ? 'bg-skatta-green text-white border-skatta-green shadow-md shadow-skatta-green/20'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-skatta-green/50'
                        )}
                      >
                        {sector}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quartier */}
              <div className="space-y-2.5">
                <label htmlFor="filtre-quartier" className="block text-xs font-black uppercase tracking-widest text-slate-500">Quartier</label>
                <select
                  id="filtre-quartier"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 focus:border-skatta-green focus:outline-none min-h-12"
                >
                  <option value="Tous">Tous les quartiers</option>
                  {allNeighborhoods.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              {/* Salaire minimum */}
              <div className="space-y-2.5">
                <label htmlFor="filtre-salaire" className="block text-xs font-black uppercase tracking-widest text-slate-500">Salaire minimum</label>
                <select
                  id="filtre-salaire"
                  value={minSalary}
                  onChange={(e) => setMinSalary(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 focus:border-skatta-green focus:outline-none min-h-12"
                >
                  <option value={0}>Tous les salaires</option>
                  <option value={10000}>10 000 FCFA / jour et +</option>
                  <option value={12000}>12 000 FCFA / jour et +</option>
                  <option value={15000}>15 000 FCFA / jour et +</option>
                </select>
              </div>

              {/* Type de contrat */}
              <div className="space-y-2.5">
                <label htmlFor="filtre-contrat" className="block text-xs font-black uppercase tracking-widest text-slate-500">Type de contrat</label>
                <select
                  id="filtre-contrat"
                  value={contract}
                  onChange={(e) => setContract(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 focus:border-skatta-green focus:outline-none min-h-12"
                >
                  <option value="Tous">Tous les contrats</option>
                  {allContracts.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => setShowUrgent((v) => !v)}
                aria-pressed={showUrgent}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold border transition-colors min-h-11",
                  showUrgent
                    ? "bg-red-50 text-red-600 border-red-200"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:border-red-300"
                )}
              >
                <Flame size={16} /> Urgentes seulement
              </button>
              <button
                onClick={() => setShowFavoritesOnly((v) => !v)}
                aria-pressed={showFavoritesOnly}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold border transition-colors min-h-11",
                  showFavoritesOnly
                    ? "bg-red-50 text-red-600 border-red-200"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:border-red-300"
                )}
              >
                <Heart size={16} className={showFavoritesOnly ? "fill-red-500 text-red-500" : ""} />
                Mes favoris ({favorites.length})
              </button>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold bg-slate-900 text-white hover:bg-slate-700 transition-colors min-h-11"
                >
                  <RotateCcw size={16} /> Réinitialiser les filtres
                </button>
              )}
            </div>
          </div>

          {/* Compteur de résultats */}
          <p className="text-sm font-bold text-slate-500" role="status">
            {showFavoritesOnly
              ? `${filteredJobs.length} offre${filteredJobs.length > 1 ? 's' : ''} dans tes favoris`
              : `${filteredJobs.length} offre${filteredJobs.length > 1 ? 's' : ''} trouvée${filteredJobs.length > 1 ? 's' : ''}`}
            {hasActiveFilters && ' avec tes critères'}
          </p>

          {/* Liste / Carte */}
          <div className="flex bg-white p-1.5 rounded-full w-fit border border-slate-200 shadow-sm">
            <button
              onClick={() => setActiveTab('list')}
              className={cn(
                "px-5 sm:px-6 py-3 rounded-full text-sm font-bold transition-all min-h-11 inline-flex items-center gap-2",
                activeTab === 'list' ? "bg-skatta-green text-white shadow-md" : "text-slate-500 hover:text-skatta-green"
              )}
            >
              <List size={16} /> Liste des offres
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={cn(
                "px-5 sm:px-6 py-3 rounded-full text-sm font-bold transition-all min-h-11 inline-flex items-center gap-2",
                activeTab === 'map' ? "bg-skatta-green text-white shadow-md" : "text-slate-500 hover:text-skatta-green"
              )}
            >
              <MapPin size={16} /> Vue carte
            </button>
          </div>

          {/* Contenu : liste ou carte */}
          <div className="mt-2">
            {activeTab === 'list' ? (
              <div className="space-y-6">
                {filteredJobs.length > 0 ? (
                  <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
                  >
                    {filteredJobs.map((job, index) => {
                      const isFav = favorites.includes(job.id);
                      return (
                        <motion.article
                          key={job.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: Math.min(index * 0.05, 0.3), type: 'spring', stiffness: 300, damping: 20 }}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => handleJobClick(job.id)}
                          onMouseEnter={() => setHoveredJobId(job.id)}
                          onMouseLeave={() => setHoveredJobId(null)}
                          className="group cursor-pointer relative overflow-hidden bg-white rounded-3xl border border-slate-200 shadow-lg shadow-slate-900/5 hover:border-skatta-green/50 hover:shadow-xl transition-all duration-300"
                        >
                          <div className="relative h-48">
                            <img
                              src={job.imageUrl}
                              alt={job.title}
                              loading="lazy"
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute top-3 left-3 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full border border-slate-200 shadow-sm">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-skatta-green opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-skatta-green" />
                              </span>
                              <span className="text-[9px] font-black text-skatta-blue uppercase tracking-tighter">Skatta LIVE</span>
                            </div>
                            {job.urgency === 'high' && (
                              <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-lg">
                                Urgent
                              </div>
                            )}
                            <button
                              onClick={(e) => toggleFavorite(job.id, e)}
                              aria-label={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                              aria-pressed={isFav}
                              className={cn(
                                "absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all",
                                isFav
                                  ? "bg-red-500 text-white"
                                  : "bg-white/90 text-slate-400 hover:text-red-500"
                              )}
                            >
                              <Heart size={19} className={isFav ? "fill-white" : ""} />
                            </button>
                          </div>

                          <div className="p-5 sm:p-6 space-y-3.5">
                            <div className="flex justify-between items-start gap-3">
                              <div className="space-y-2 min-w-0">
                                <span className={cn("badge-sector", getSectorColor(job.category))}>
                                  {job.category}
                                </span>
                                <h3 className="text-lg font-black text-slate-900 leading-snug line-clamp-2 group-hover:text-skatta-green transition-colors">
                                  {job.title.split(' — ')[0]}
                                </h3>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="block font-black text-skatta-green text-lg leading-none">
                                  {job.price.toLocaleString()} FCFA
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">/ jour</span>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-slate-500 text-xs font-semibold">
                              <span className="flex items-center gap-1.5">
                                <MapPin size={14} className="text-skatta-green" />
                                {job.location.neighborhood}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Briefcase size={14} className="text-skatta-green" />
                                {job.contractType ?? 'Journalier'}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <CalendarDays size={14} className="text-skatta-green" />
                                {postedLabel(job.createdAt)}
                              </span>
                            </div>

                            <p className="text-slate-500 text-sm line-clamp-2">
                              {job.description}
                            </p>

                            <div className="pt-3 border-t border-slate-100">
                              <PremiumButton
                                variant="outline"
                                size="md"
                                className="w-full justify-between"
                              >
                                <span>Postuler maintenant</span>
                                <ArrowRight size={18} />
                              </PremiumButton>
                            </div>
                          </div>
                        </motion.article>
                      );
                    })}
                  </motion.div>
                ) : (
                  <div className="text-center py-14 px-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
                    <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-4">
                      <Search size={28} className="text-slate-400" />
                    </div>
                    <h3 className="font-black text-slate-900 text-xl">
                      {showFavoritesOnly
                        ? 'Aucun favori pour le moment'
                        : jobs.length === 0
                          ? 'Aucune offre en ligne pour le moment'
                          : 'Aucune offre ne correspond à tes critères'}
                    </h3>
                    <p className="text-slate-500 max-w-md mx-auto mt-2 text-sm">
                      {showFavoritesOnly
                        ? 'Touche le cœur sur une offre pour la retrouver ici, même après avoir fermé le site.'
                        : jobs.length === 0
                          ? 'Les premières offres arrivent bientôt. Employeur ? Publie la première offre de Skatta.'
                          : 'Essaie d’élargir ta recherche ou de modifier tes filtres pour découvrir davantage d’opportunités.'}
                    </p>
                    <button
                      onClick={clearFilters}
                      className="mt-6 inline-flex items-center gap-2 px-6 py-3.5 bg-skatta-green text-white font-bold rounded-full hover:bg-skatta-green/90 transition-colors min-h-12"
                    >
                      <RotateCcw size={16} />
                      {showFavoritesOnly ? 'Voir toutes les offres' : 'Réinitialiser les filtres'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative z-0 rounded-3xl border border-slate-200 overflow-hidden bg-white shadow-lg shadow-slate-900/5">
                <div className="relative h-[70vh]">
                  {leaflet ? (
                    <MapContainer
                      center={[0.4167, 9.4498]}
                      zoom={12}
                      scrollWheelZoom={true}
                      doubleClickZoom={true}
                      boxZoom={true}
                      keyboard={true}
                      zoomControl={false}
                      className="w-full h-full"
                      ref={setMapRef}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      {filteredJobs.map((job) => (
                        <Marker
                          key={job.id}
                          position={[job.location.lat, job.location.lng]}
                          icon={getJobMarkerIcon(job.urgency, leaflet)}
                          eventHandlers={{
                            mouseover: () => setHoveredJobId(job.id),
                            mouseout: () => { if (hoveredJobId === job.id) setHoveredJobId(null); }
                          }}
                        >
                          <Popup>
                            <div className="p-3 min-w-[200px]">
                              <h4 className="font-black text-slate-900">{job.title}</h4>
                              <p className="text-sm text-slate-600 font-bold">{formatPrice(job.price)}</p>
                              <p className="text-xs text-slate-500 mt-1">
                                {job.category} · {job.location.neighborhood}
                              </p>
                              {job.urgency === 'high' && (
                                <p className="text-xs text-red-500 font-bold mt-1">Urgent !</p>
                              )}
                              <button
                                onClick={() => router.push(`/offres/${job.id}`)}
                                className="mt-3 w-full px-3 py-2.5 bg-skatta-green text-white font-bold rounded-full text-sm hover:bg-skatta-green/90 transition-colors"
                              >
                                Voir les détails
                              </button>
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                    </MapContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center bg-slate-100 text-slate-500">
                      Chargement de la carte…
                    </div>
                  )}

                  <div className="absolute top-4 left-4 flex gap-2 z-10">
                    <button
                      onClick={() => { if (mapRef) mapRef.flyTo([0.4167, 9.4498], 12); }}
                      className="p-2.5 rounded-full bg-white text-skatta-blue shadow-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                      aria-label="Recentrer la carte"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => {
                        if (leaflet && mapRef && filteredJobs.length > 0) {
                          const bounds = leaflet.latLngBounds(
                            filteredJobs.map(job => [job.location.lat, job.location.lng] as [number, number])
                          );
                          mapRef.fitBounds(bounds.pad(0.2));
                        }
                      }}
                      className="p-2.5 rounded-full bg-white text-skatta-blue shadow-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                      aria-label="Voir toutes les offres sur la carte"
                    >
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>

                <div className="px-4 py-3 bg-slate-50 border-t border-slate-200">
                  <div className="flex flex-wrap justify-between gap-2 text-sm font-semibold text-slate-600">
                    <span>{filteredJobs.length} offre{filteredJobs.length > 1 ? 's' : ''} affichée{filteredJobs.length > 1 ? 's' : ''} sur la carte</span>
                    <span>
                      {sectors.length > 0 ? `Filtre : ${sectors.join(', ')}` : 'Aucun filtre de secteur'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Comment ça marche + pied de page complet */}
        <div className="px-0 sm:px-0 max-w-7xl mx-auto space-y-14 pb-8">
          <HowItWorks />
          <Footer />
        </div>
        <div className="h-20" />

        {/* Navigation mobile fixe */}
        <nav className="fixed bottom-0 left-0 right-0 glass-dark px-6 py-3 flex justify-between items-center z-50 md:hidden">
          <button
            onClick={() => scrollToId('top')}
            className="flex flex-col items-center gap-1 text-skatta-green min-w-16 py-1"
          >
            <TrendingUp size={24} />
            <span className="text-[10px] font-black uppercase tracking-widest">Accueil</span>
          </button>
          <button
            onClick={() => scrollToId('offres-liste')}
            className="flex flex-col items-center gap-1 text-slate-500 hover:text-skatta-green transition-colors min-w-16 py-1"
          >
            <Briefcase size={24} />
            <span className="text-[10px] font-black uppercase tracking-widest">Offres</span>
          </button>
          <button
            onClick={goToFavorites}
            className="flex flex-col items-center gap-1 text-slate-500 hover:text-red-500 transition-colors min-w-16 py-1 relative"
          >
            <Heart size={24} className={showFavoritesOnly ? "fill-red-500 text-red-500" : ""} />
            <span className="text-[10px] font-black uppercase tracking-widest">Favoris</span>
            {favorites.length > 0 && (
              <span className="absolute top-0 right-2 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[11px] font-black inline-flex items-center justify-center">
                {favorites.length}
              </span>
            )}
          </button>
          <button
            onClick={() => router.push('/mes-candidatures')}
            className="flex flex-col items-center gap-1 text-slate-500 hover:text-skatta-blue transition-colors min-w-16 py-1"
          >
            <MessageSquare size={24} />
            <span className="text-[10px] font-black uppercase tracking-widest">Candidatures</span>
          </button>
        </nav>
      </main>
    </div>
  );
};
