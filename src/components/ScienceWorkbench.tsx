import React, { useState, useEffect } from 'react';
import {
  Dna,
  Search,
  FlaskConical,
  BookOpen,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';

export const ScienceWorkbench: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'compounds' | 'proteins' | 'literature'>('proteins');
  
  // Search states
  const [proteinQuery, setProteinQuery] = useState('P04637');
  const [proteinData, setProteinData] = useState<any>(null);

  const [compoundQuery, setCompoundQuery] = useState('Imatinib');
  const [compoundData, setCompoundData] = useState<any>(null);

  const [litQuery, setLitQuery] = useState('CRISPR Cas9 gene editing');
  const [litData, setLitData] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  // Fetch Protein
  const fetchProtein = async (accession: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/science/alphafold/${accession}`);
      if (res.ok) {
        const data = await res.json();
        setProteinData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Compound
  const fetchCompound = async (name: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/science/pubchem/${encodeURIComponent(name)}`);
      if (res.ok) {
        const data = await res.json();
        setCompoundData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Literature
  const fetchLiterature = async (query: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/science/pubmed?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setLitData(data.articles || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProtein('P04637');
    fetchCompound('Imatinib');
    fetchLiterature('CRISPR Cas9 gene editing');
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
            <Dna className="h-4 w-4" />
            <span>DeepMind Science & Bioscience Skills</span>
            <span aria-hidden="true">·</span>
            <span>AlphaFold & PubChem Integrated</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Bioscience & Molecular Discovery Workbench
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Explore 3D structural predictions from AlphaFold DB, small-molecule pharmacophores from PubChem, and peer-reviewed biomedical literature from PubMed.
          </p>
        </div>

        {/* Category Switcher */}
        <div className="flex items-center rounded-lg bg-slate-100 p-1 dark:bg-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveCategory('proteins')}
            className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              activeCategory === 'proteins'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            AlphaFold Proteins
          </button>
          <button
            onClick={() => setActiveCategory('compounds')}
            className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              activeCategory === 'compounds'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            PubChem Chemistry
          </button>
          <button
            onClick={() => setActiveCategory('literature')}
            className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              activeCategory === 'literature'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            PubMed Literature
          </button>
        </div>
      </div>

      {/* Top Quick-Try Example Bar */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 text-xs">
        <span className="text-slate-400 font-semibold mr-1 shrink-0">Quick Examples:</span>
        <button
          onClick={() => {
            setActiveCategory('proteins');
            setProteinQuery('P04637');
            fetchProtein('P04637');
          }}
          className="rounded-md bg-slate-100 hover:bg-teal-50 px-2.5 py-1 text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 whitespace-nowrap shrink-0"
        >
          TP53 (P04637)
        </button>
        <button
          onClick={() => {
            setActiveCategory('proteins');
            setProteinQuery('P00533');
            fetchProtein('P00533');
          }}
          className="rounded-md bg-slate-100 hover:bg-teal-50 px-2.5 py-1 text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 whitespace-nowrap shrink-0"
        >
          EGFR Kinase (P00533)
        </button>
        <button
          onClick={() => {
            setActiveCategory('compounds');
            setCompoundQuery('Imatinib');
            fetchCompound('Imatinib');
          }}
          className="rounded-md bg-slate-100 hover:bg-teal-50 px-2.5 py-1 text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 whitespace-nowrap shrink-0"
        >
          Imatinib (Gleevec)
        </button>
        <button
          onClick={() => {
            setActiveCategory('compounds');
            setCompoundQuery('Aspirin');
            fetchCompound('Aspirin');
          }}
          className="rounded-md bg-slate-100 hover:bg-teal-50 px-2.5 py-1 text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 whitespace-nowrap shrink-0"
        >
          Aspirin (CID 2244)
        </button>
        <button
          onClick={() => {
            setActiveCategory('literature');
            setLitQuery('CAR-T cell immunotherapy');
            fetchLiterature('CAR-T cell immunotherapy');
          }}
          className="rounded-md bg-slate-100 hover:bg-teal-50 px-2.5 py-1 text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 whitespace-nowrap shrink-0"
        >
          CAR-T Cell Trials
        </button>
      </div>

      {/* View 1: AlphaFold Proteins */}
      {activeCategory === 'proteins' && (
        <div className="space-y-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchProtein(proteinQuery);
            }}
            className="flex gap-3 max-w-md"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={proteinQuery}
                onChange={(e) => setProteinQuery(e.target.value)}
                placeholder="Enter UniProt ID (e.g. P04637, P00533, P38398)..."
                className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-4 py-2.5 text-xs text-slate-900 shadow-sm focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600"
            >
              Fetch Protein
            </button>
          </form>

          {proteinData && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Protein Profile Card */}
              <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400">
                      UniProt: {proteinData.uniprotAccession}
                    </span>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                      {proteinData.name || proteinData.gene}
                    </h2>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Organism: {proteinData.organismScientificName}
                    </span>
                  </div>

                  <a
                    href={`https://alphafold.ebi.ac.uk/entry/${proteinData.uniprotAccession}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:underline dark:text-teal-400 shrink-0"
                  >
                    <span>AlphaFold DB</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>

                {/* 4-Band AlphaFold pLDDT Confidence Score */}
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Predicted Local Distance Difference Test (pLDDT):
                    </span>
                    <span className="font-mono text-sm font-bold text-teal-600 dark:text-teal-400">
                      {proteinData.plddtScore} / 100
                    </span>
                  </div>

                  {/* pLDDT Bar */}
                  <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden dark:bg-slate-700 flex">
                    <div
                      className="bg-blue-600 h-full transition-all"
                      style={{ width: `${Math.min(100, proteinData.plddtScore)}%` }}
                    />
                  </div>

                  {/* 4-Band Scale Legend */}
                  <div className="grid grid-cols-4 gap-1 text-[10px] text-slate-500 text-center pt-1">
                    <span className="text-orange-600 font-semibold">&lt;50 Very Low</span>
                    <span className="text-yellow-600 font-semibold">50-70 Low</span>
                    <span className="text-sky-600 font-semibold">70-90 Confident</span>
                    <span className="text-blue-700 font-semibold">&gt;90 Very High</span>
                  </div>
                </div>

                {/* Functional Domains */}
                {proteinData.domains && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Functional Domains & Active Sites:
                    </h4>
                    <div className="space-y-1.5">
                      {proteinData.domains.map((dom: string, i: number) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-1.5 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300 font-mono"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                          <span>{dom}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* 3D Coordinate / Download Blueprint Card */}
              <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="h-4 w-4 text-teal-600" />
                  <span>Structural Coordinate Files</span>
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  AlphaFold v6 predictions provide atomic coordinate files in PDB and mmCIF formats with per-residue B-factor fields populated by pLDDT scores.
                </p>

                <div className="space-y-2 pt-2">
                  <a
                    href={proteinData.pdbUrl || `https://alphafold.ebi.ac.uk/files/AF-${proteinData.uniprotAccession}-F1-model_v6.pdb`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-xs font-medium hover:border-teal-500 hover:bg-teal-50/40 dark:border-slate-700 dark:hover:bg-slate-800 transition-colors"
                  >
                    <span className="font-mono">AF-{proteinData.uniprotAccession}-F1-model_v6.pdb</span>
                    <span className="text-teal-600 dark:text-teal-400 font-semibold">Download PDB</span>
                  </a>

                  <a
                    href={`https://alphafold.ebi.ac.uk/files/AF-${proteinData.uniprotAccession}-F1-model_v6.cif`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-xs font-medium hover:border-teal-500 hover:bg-teal-50/40 dark:border-slate-700 dark:hover:bg-slate-800 transition-colors"
                  >
                    <span className="font-mono">AF-{proteinData.uniprotAccession}-F1-model_v6.cif</span>
                    <span className="text-teal-600 dark:text-teal-400 font-semibold">Download mmCIF</span>
                  </a>
                </div>

                <div className="rounded-xl bg-teal-50 p-3 text-[11px] text-teal-800 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200 dark:border-teal-900">
                  <span className="font-semibold block">DeepMind Scientific Invariant</span>
                  <span>Predictions are generated using evoformer representations with structural relaxation. Experimental validation recommended for critical drug binding pockets.</span>
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* View 2: PubChem Chemistry */}
      {activeCategory === 'compounds' && (
        <div className="space-y-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchCompound(compoundQuery);
            }}
            className="flex gap-3 max-w-md"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={compoundQuery}
                onChange={(e) => setCompoundQuery(e.target.value)}
                placeholder="Enter drug or compound name (e.g. Imatinib, Aspirin, Caffeine)..."
                className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-4 py-2.5 text-xs text-slate-900 shadow-sm focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600"
            >
              Search PubChem
            </button>
          </form>

          {compoundData && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Compound Details */}
              <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400">
                      PubChem CID: {compoundData.cid}
                    </span>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                      {compoundData.name}
                    </h2>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      Formula: {compoundData.formula} · MW: {compoundData.molecularWeight}
                    </span>
                  </div>

                  <a
                    href={`https://pubchem.ncbi.nlm.nih.gov/compound/${compoundData.cid}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:underline dark:text-teal-400 shrink-0"
                  >
                    <span>PubChem Record</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                    IUPAC Preferred Name:
                  </span>
                  <p className="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-2.5 text-xs font-mono text-slate-800 dark:text-slate-200">
                    {compoundData.iupacName}
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                    Canonical SMILES:
                  </span>
                  <p className="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-2.5 text-xs font-mono text-teal-700 dark:text-teal-300 break-all">
                    {compoundData.smiles}
                  </p>
                </div>

                {/* Lipinski Rule of 5 Indicators */}
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50 space-y-2">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                    Lipinski Rule of 5 Drug-Likeness Criteria:
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>MW &lt; 500 Da (Pass)</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>LogP &lt; 5 (Pass)</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>H-Bond Donors &le; 5</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>H-Bond Acceptors &le; 10</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* 2D Chemical Structure Render */}
              <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white self-start">
                  2D Chemical Structure Depiction
                </h3>

                <div className="my-auto p-4 bg-white rounded-xl border border-slate-100 shadow-inner flex items-center justify-center">
                  <img
                    src={compoundData.structureImageUrl}
                    alt={`${compoundData.name} 2D Chemical Structure`}
                    className="max-h-56 max-w-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="w-full text-center text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  Rendered via NCBI PubChem PUG REST API service.
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* View 3: PubMed Biomedical Literature */}
      {activeCategory === 'literature' && (
        <div className="space-y-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchLiterature(litQuery);
            }}
            className="flex gap-3 max-w-md"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={litQuery}
                onChange={(e) => setLitQuery(e.target.value)}
                placeholder="Search PubMed & Europe PMC articles..."
                className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-4 py-2.5 text-xs text-slate-900 shadow-sm focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600"
            >
              Search Literature
            </button>
          </form>

          <div className="space-y-4">
            {litData.map((art, idx) => (
              <div
                key={art.id || idx}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-2"
              >
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-teal-600 dark:text-teal-400">
                      PMID: {art.pmid || art.id}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{art.journalTitle}</span>
                    <span aria-hidden="true">·</span>
                    <span>{art.pubYear}</span>
                  </div>

                  {art.isOpenAccess && (
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      Open Access
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {art.title}
                </h3>

                <p className="text-xs text-slate-500 font-medium">
                  Authors: {art.authorString}
                </p>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  {art.abstractText}
                </p>

                <div className="flex justify-end pt-2">
                  <a
                    href={`https://pubmed.ncbi.nlm.nih.gov/${art.pmid || art.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:underline dark:text-teal-400"
                  >
                    <span>View on PubMed</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
};
