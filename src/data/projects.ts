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
  capabilities?: { title: string; description: string }[];
  example?: string;
}

export const PROJECTS: Project[] = [
  {
    id: 'nest',
    number: '01',
    cat: 'Optimization · Manufacturing · Process Integration',
    title: 'Æ-Nest',
    shortDesc:
      'Python pipeline that internalises panel nesting for healthcare modules: Revit exports become validated panel lists, CNC layouts, packaging logic and multi-format outputs for suppliers.',
    body: 'Æ-Nest was built to bring a previously external, hard-to-control nesting process inside a structured digital pipeline. Starting from semi-manual Revit/BIM Excel exports, it validates inconsistent headers and numeric formats, expands quantities into physical panels, then runs rectpack-based heuristics for 2D cutting stock on standard sheets with kerf and rotation rules. The value is not only material optimisation: the system preserves the link between design, CNC sequence, room-based packaging and logistics, producing Excel workbooks, DXF files, 3D GLB/IFC checks and PNG layouts that can be shared with external suppliers.',
    stack: ['Python', 'Tkinter', 'rectpack', 'Revit·BIM', 'DXF·CNC', 'Excel', 'GLB·IFC', 'NP-Hard Heuristics'],
    pills: [
      { label: 'Python', hi: true },
      { label: 'NP-Hard Heuristics' },
      { label: 'Manufacturing' },
    ],
    demo: 'https://ae-nest-demo.streamlit.app',
  },
  {
    id: 'cargo',
    number: '02',
    cat: 'Logistics · Commercial Estimation · Decision Support',
    title: 'CargoCast',
    shortDesc:
      'Container loading estimator for the offer phase. Product codes and quantities become crate scenarios, loading simulations, saturation values and logistics cost-control signals.',
    body: 'CargoCast supports the commercial phase when the real packing list does not exist yet. It takes product codes and forecast quantities, applies deterministic packaging rules by family - panels, profiles, doors and accessories - and turns abstract order data into physical crates. A FastAPI backend and web interface run packing heuristics to estimate required containers, fill levels and non-allocated items, giving the sales team a repeatable basis for freight assumptions instead of subjective sizing.',
    stack: ['Python', 'FastAPI', 'HTML·CSS·JS', '3D Bin Packing', 'Skyline Algorithm', 'Grid-Based Packing'],
    pills: [
      { label: 'Python · JS', hi: true },
      { label: '3D Packing' },
      { label: 'Commercial' },
    ],
    demo: 'https://cargocast.onrender.com',
  },
  {
    id: 'load',
    number: '03',
    cat: 'Logistics · Visualization · Operational',
    title: 'LoadScan',
    shortDesc:
      'Operational companion to CargoCast: confirmed packing-list data becomes accurate load layouts, saturation values and transport-ready checks for logistics.',
    body: 'LoadScan applies the same container-loading model to definitive packing lists. Instead of forecast SKU data, it receives actual crate codes, dimensions and quantities, then recalculates final crates, positions and orientations with rotation and compatibility constraints. The output is a visual and numeric load plan used to validate shipments, support carrier booking and keep the operational plan coherent with the earlier commercial estimate.',
    stack: ['Python', 'JavaScript', '3D Packing', 'Matplotlib', 'Web UI', 'Logistics Planning'],
    pills: [
      { label: 'Python · JS', hi: true },
      { label: '3D Visualization' },
      { label: 'Logistics' },
    ],
    demo: 'https://loadscan-demo.streamlit.app',
  },
  {
    id: 'door',
    number: '04',
    cat: 'Engineering · Multi-Constraint Packing · Decision Support',
    title: 'Door Pack Optimizer',
    shortDesc:
      'Decision-support tool for technical hospital doors. Parses product strings, models weights and generates crate or pallet configurations under real logistics constraints.',
    body: 'Door Pack Optimizer formalises a process that was previously dependent on expert interpretation of door codes and manual Excel work. It decodes technical strings for hermetic, lead-lined, glazed and acoustic doors into structured attributes - type, dimensions, shielding, vision panels and structural elements - then estimates weights with material-based rules. A multi-start heuristic with local search groups doors, frames and beams into crates or pallets while respecting weight, depth and stability constraints, producing measurable outputs for volume, crate count and Excel/dashboard reporting.',
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
      'Excel/VBA planner that turns order data, capacities and average times into an automatic Gantt schedule for production resources and project changes.',
    body: 'Gantt PM was designed for engineer-to-order production where planning depended on manual spreadsheets and implicit shop-floor knowledge. The workbook reads order codes, quantities, work types, resource capacities, average processing times and assignment rules, then generates a daily Gantt plan across departments and machines. When priorities or project scope change, the schedule can be recalculated quickly, making the planning process explicit, repeatable and easier to inspect for bottlenecks or overloads.',
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
      'Excel/VBA data-governance layer for a large international B2B contact base: validation, deduplication, guided input and Outlook-ready commercial workflows.',
    body: 'ContactBase XL turns an 85,000+ record contact archive for hospitals, clinics, distributors, suppliers and professionals into an operating data layer. Built in Excel/VBA where adoption was fastest, it standardises fields, validates email and geographic formats, detects duplicates through logical keys, separates raw input from consolidated records and maps incomplete information into cleaner structures. It also connects data to action: selecting an email can generate an Outlook draft with predefined subject, message and variables, making the database useful for segmentation, analysis and commercial communication.',
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
      'Exploration of local LLM and RAG architectures for fragmented technical documentation, focused on privacy, source-linked answers and the future ÆMed path.',
    body: 'RAG Experiments came from a concrete knowledge-management problem: manuals, product sheets, technical specs and project documents existed, but retrieving the right information was still slow and manual. The work tests local LLM inference and Retrieval-Augmented Generation so documents can be preprocessed, indexed and queried without sending company data outside the environment. The main focus is methodological - document quality, OCR, heterogeneous formats, vector retrieval, prompt constraints, hallucination control and verifiable outputs - and it directly feeds the privacy-first, modular ÆMed vision.',
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
      'A collection of lightweight analytics and automation tools that clean exports, build reports and convert scattered operational data into decision-support information.',
    body: 'Micro Tools & Analytics groups the smaller but valuable automations created around daily operations: report generators, ERP/export cleaning scripts, production trend analysis, supplier and offer comparisons, email/archive utilities and data-transformation helpers. The pattern is consistent with the thesis methodology: observe a repetitive manual step, structure the data, automate the low-value work and return an output that can support a decision. These tools are intentionally lightweight, built to fit real constraints and make fragmented information reusable without heavy infrastructure.',
    stack: ['Python', 'Pandas', 'Matplotlib', 'ERP Export Processing', 'PDF Generation', 'Statistical Reporting', 'ETL'],
    pills: [
      { label: 'Python', hi: true },
      { label: 'Automation' },
      { label: 'Analytics' },
    ],
  },
  {
    id: 'cerbrain',
    number: '09',
    cat: 'Operational Intelligence · Energy · AI Systems',
    title: 'AI Company Second Brain',
    shortDesc:
      'An AI second brain for a renewable-energy business: connects documents, emails, clients and projects to explain what changed, what matters and what needs to happen next.',
    body: 'AI Company Second Brain gives a renewable-energy business a shared memory and a practical way to act on it. Documents, emails and business records are connected to clients, projects, contracts, energy assets and their history. People can find an answer with its sources, understand the current state of a project, run reproducible feasibility calculations and produce reports from the same connected information. AI reads, extracts, summarises and proposes; versioned calculation engines handle energy and economic rules. Scheduled workflows and specialised agents keep information current, surface opportunities and move routine work forward with permissions, approvals and an audit trail.',
    stack: ['Python', 'FastAPI', 'PostgreSQL · pgvector', 'Microsoft Graph', 'OCR · Document Parsing', 'Hybrid Retrieval · RAG', 'Energy & Economic Models', 'AI Agents · MCP', 'Docker · Azure'],
    pills: [
      { label: 'Python · PostgreSQL', hi: true },
      { label: 'Company Knowledge' },
      { label: 'AI · Automation' },
    ],
    capabilities: [
      {
        title: 'A connected company memory',
        description: 'Ingests documents, spreadsheets, scanned files and email, extracts their content and links it to clients, contacts, projects, contracts and energy assets. Source references, document versions and change history keep each fact in context.',
      },
      {
        title: 'Answers you can inspect',
        description: 'Combines keyword, vector and structured-data search to answer questions in the context of a client or project. AI supports extraction, summaries and drafting, with citations back to the evidence and review when information is uncertain.',
      },
      {
        title: 'Projects that carry their own history',
        description: 'Brings together project timelines, status, tasks, owners, deadlines, dependencies and approvals. Weekly management reports and dashboards use the same records to show progress, overdue actions, bottlenecks and portfolio risks.',
      },
      {
        title: 'Energy analysis built on explicit rules',
        description: 'Reads electricity bills and consumption data, models production and shared energy, and compares renewable-energy community scenarios. Versioned formulas calculate incentives and economic distributions, producing reproducible feasibility studies and technical reports.',
      },
      {
        title: 'Automation with a visible trail',
        description: 'Scheduled jobs and specialised agents monitor incoming information, propose or apply routine project updates, track regulatory changes and identify market opportunities. Scoped tools, approvals, reversible actions and execution history make the work inspectable.',
      },
      {
        title: 'One workspace for the team',
        description: 'A web workspace brings search, business records, maps, analysis tools and management views together. Controlled client access, document generation and MCP tools extend the same information to customers and AI assistants; a control room tracks freshness, failures and AI costs.',
      },
    ],
    example: 'A new email and an electricity bill arrive for a project. The system links them to the client and energy supply point, extracts the relevant data and records the update. The team can then review the consumption profile, compare a feasibility scenario and prepare a sourced report. The project timeline, next actions and management view all reflect the same information.',
  },
];
