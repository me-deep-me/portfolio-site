export interface Project {
  id: string;
  number: string;
  cat: string;
  title: string;
  shortDesc: string;
  body: string;
  stack: string[];
  pills: { label: string; hi?: boolean }[];
  demo?: string;
  github?: string;
}

export const PROJECTS: Project[] = [
  {
    id: 'nest',
    number: '01',
    cat: 'Optimization · Manufacturing · NP-Hard',
    title: 'Æ-Nest',
    shortDesc:
      'Automated 2D nesting optimizer for CNC panels. Processes Revit BIM exports, solves the NP-hard cut-stock problem with multi-strategy heuristics, outputs DXF, Excel, 3D GLB.',
    body: 'Æ-Nest is a Python pipeline for 2D nesting of rectangular panels on standard-size sheets — a cut-stock problem classified as NP-hard. Data flows from BIM Revit exports, through robust normalisation (flexible column mapping, numeric parsing for Italian/English formats, error diagnostics), into a multi-strategy heuristic engine (Best Short Side Fit + Best Area Fit via rectpack). The system manages kerf width, optional rotation, and a smart panel ordering logic that groups components by destination room — so the first crates produced are already logistically coherent. Outputs include Excel workbooks, DXF files for CNC machines, 3D GLB/IFC models, and PNG layouts.',
    stack: ['Python', 'Tkinter', 'rectpack', 'Revit·BIM', 'DXF·CNC', 'Excel', 'GLB·IFC', 'NP-Hard Heuristics'],
    pills: [
      { label: 'Python', hi: true },
      { label: 'NP-Hard Heuristics' },
      { label: 'Manufacturing' },
    ],
    demo: 'https://ae-nest-demo.streamlit.app',
    github: 'https://github.com/me-deep-me/ae-nest-demo',
  },
  {
    id: 'cargo',
    number: '02',
    cat: 'Logistics · Commercial · 3D Packing',
    title: 'CargoCast',
    shortDesc:
      'Pre-order container cost estimator. Converts SKU forecasts into physical crates via product-family rules, runs 3D bin packing, outputs container count and saturation levels.',
    body: 'Commercial teams need accurate shipping cost estimates long before the real packing list exists. CargoCast takes SKU codes and forecasted quantities, applies product-family rules to generate physical crates (panels by m², profiles by linear metre, doors by count), then runs a 3D bin packing simulation to output container count and saturation levels. Built with a Python/FastAPI backend and a web front-end with 2D load visualisation. The same model is reused in the operational phase on the real packing list, ensuring continuity between commercial estimate and actual dispatch.',
    stack: ['Python', 'FastAPI', 'HTML·CSS·JS', '3D Bin Packing', 'Skyline Algorithm', 'Grid-Based Packing'],
    pills: [
      { label: 'Python · JS', hi: true },
      { label: '3D Packing' },
      { label: 'Commercial' },
    ],
    demo: 'https://cargocast.onrender.com',
    github: 'https://github.com/me-deep-me/cargocast',
  },
  {
    id: 'load',
    number: '03',
    cat: 'Logistics · Visualization · Operational',
    title: 'LoadScan',
    shortDesc:
      'Operational logistics tool for real packing lists. Computes 2D footprint and 3D volume occupancy per container with stacking rules, weight constraints and graphical layout output.',
    body: 'LoadScan takes a confirmed packing list — crate codes, quantities, dimensions — and computes container utilisation in both 2D and 3D, applying stacking rules, fragility constraints, weight distribution limits and rotation options. Produces graphical load maps that logistics coordinators can share with carriers and validate before dispatch. Part of the same unified model as CargoCast: the only difference is data quality — estimated vs. confirmed.',
    stack: ['Python', 'JavaScript', '3D Packing', 'Matplotlib', 'Web UI', 'Logistics Planning'],
    pills: [
      { label: 'Python · JS', hi: true },
      { label: '3D Visualization' },
      { label: 'Logistics' },
    ],
    demo: 'https://loadscan-demo.streamlit.app',
    github: 'https://github.com/me-deep-me/loadscan-demo',
  },
  {
    id: 'door',
    number: '04',
    cat: 'Engineering · Multi-Constraint Packing · DSS',
    title: 'Door Pack Optimizer',
    shortDesc:
      'Automatically configures shipping crates for technical hospital doors — hermetic, lead-lined, acoustic — decoding product strings, estimating weight, and solving a multi-constraint bin packing problem.',
    body: 'Technical hospital doors — hermetic, lead-lined, acoustic, glazed — have high dimensional variability and strict fragility requirements that make manual crate design error-prone and non-scalable. This tool parses product technical strings automatically, extracting type, dimensions, lead shielding thickness, glazing specs and structural elements. It then estimates component weights through material-specific models and solves a multi-constraint bin packing problem (weight, depth, stability) using a multi-start heuristic with local search. The result: minimum crate count, full weight control, traceable output in Excel and interactive dashboard.',
    stack: ['Python', 'Tkinter', 'Multi-constraint Bin Packing', 'Product String Parsing', 'Excel Output', 'Decision Support'],
    pills: [
      { label: 'Python', hi: true },
      { label: 'Multi-constraint Packing' },
      { label: 'DSS' },
    ],
  },
  {
    id: 'gantt',
    number: '05',
    cat: 'Production Planning · Scheduling',
    title: 'Gantt PM',
    shortDesc:
      'Automatic production scheduling system. Transforms technical order data into a Gantt-based plan, allocating activities across resources and timelines with fast recalculation on change.',
    body: 'In engineer-to-order production environments, scheduling is typically slow, manual and dependent on individual expertise. This Excel/VBA system reads order data — item codes, quantities, operation types — together with resource capacities and mean times, and automatically generates a Gantt chart with daily allocation across machines and departments. When priorities or project scopes change, the plan recalculates in seconds. The tool bridges the gap between technical design and production execution, creating direct traceability between engineering outputs and shop floor scheduling.',
    stack: ['Excel', 'VBA', 'Gantt', 'Production Scheduling', 'Resource Allocation', 'Outlook Integration'],
    pills: [
      { label: 'Excel · VBA', hi: true },
      { label: 'Scheduling' },
      { label: 'Production' },
    ],
  },
  {
    id: 'db',
    number: '06',
    cat: 'Data Governance · CRM · Automation',
    title: 'ContactBase XL',
    shortDesc:
      'Data governance system for an 85,000+ record B2B contact database. Deduplication, normalisation, validation rules, structured CRUD forms and automated email drafting via Outlook integration.',
    body: 'A 85,000+ record B2B contact database covering hospitals, clinics, distributors and suppliers across international markets was managed without structured governance: duplicates, inconsistent formats, incomplete fields and no validation rules. This VBA system introduces data governance principles without requiring a CRM platform: standardised field definitions, automatic format validation (email, geographic fields, names), deduplication via logical key combinations, and a separation between raw input and the consolidated master database. A standout feature: selecting any email cell and triggering a macro auto-generates a pre-filled Outlook draft — name, company and context variables included — turning the database from a passive archive into an active commercial tool.',
    stack: ['Excel', 'VBA', 'UserForms', 'Data Quality', 'Deduplication', 'Outlook Automation', '85k Records'],
    pills: [
      { label: 'Excel · VBA', hi: true },
      { label: 'Data Quality' },
      { label: '85k Records' },
    ],
  },
  {
    id: 'rag',
    number: '07',
    cat: 'AI Research · LLM · RAG Architecture',
    title: 'RAG Experiments',
    shortDesc:
      'Exploratory work on local LLM inference and Retrieval-Augmented Generation architectures for querying technical documentation without leaking data externally.',
    body: 'Technical documentation in industrial companies — product specs, manuals, normative references, project records — is typically large, fragmented and hard to query efficiently. This exploratory project investigates local LLM inference and Retrieval-Augmented Generation (RAG) architectures as a way to make that knowledge accessible without sending data to external services. Key challenges addressed include document heterogeneity (PDF, Excel, technical formats), OCR pre-processing, vector indexing, hallucination mitigation through source-constrained generation, and verifiability of responses. The work is exploratory but informs the ÆMed vision — a privacy-first, modular health record intelligence system.',
    stack: ['Python', 'Local LLM', 'RAG', 'Vector DB', 'OCR', 'Prompt Engineering', 'ÆMed'],
    pills: [
      { label: 'Python', hi: true },
      { label: 'LLM · RAG' },
      { label: 'Local Inference' },
    ],
  },
  {
    id: 'micro',
    number: '08',
    cat: 'Automation · Analytics · ETL',
    title: 'Micro Tools & Analytics',
    shortDesc:
      'A set of focused utilities: MBOX-to-PDF batch converter, statistical production and supplier analysis scripts, and data pipeline helpers that turn raw ERP exports into structured decision-support outputs.',
    body: 'A collection of focused utilities developed to automate recurring operational tasks: a batch MBOX-to-PDF converter for archiving email threads into searchable documents; production analytics scripts that transform raw ERP exports into structured reports on output volumes, product type distribution and production load variability; supplier analysis tools for comparative cost and quality evaluation; and statistical reporting pipelines that move data from raw operational tables to decision-support outputs. Each tool follows the same lean digital engineering principle: observe the manual process, formalise it, automate the repetitive part.',
    stack: ['Python', 'Pandas', 'Matplotlib', 'ERP Export Processing', 'PDF Generation', 'Statistical Reporting', 'ETL'],
    pills: [
      { label: 'Python', hi: true },
      { label: 'Automation' },
      { label: 'Analytics' },
    ],
  },
];
