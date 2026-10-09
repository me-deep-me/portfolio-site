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
    title: 'Panel Nesting',
    shortDesc:
      'Panel-planning pipeline that connects design exports, cutting layouts, packaging checks and supplier-ready outputs in one consistent manufacturing handoff.',
    body: 'Panel Nesting brings design data, layout planning and manufacturing outputs into a consistent workflow. Operators review input exceptions, evaluate sheet arrangements and generate cutting, packing and visual outputs from the same plan. The system preserves item references through the handoff so production and logistics can review a common record.',
    stack: ['Python', 'Desktop UI', 'BIM Data', '2D Optimisation', 'CAD Outputs', 'Excel', '3D Visualisation'],
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
    body: 'CargoCast supports freight review before a final packing list exists. Forecast quantities become a physical shipment scenario, with loading views, fill indicators and visible exceptions. A Python service and web interface let the commercial team compare assumptions when an offer changes.',
    stack: ['Python', 'FastAPI', 'HTML·CSS·JS', '3D Packing', 'Scenario Analysis'],
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
      'Decision-support tool for engineered door assemblies. Turns product descriptions into reviewed crate or pallet proposals under physical handling constraints.',
    body: 'Door Pack Optimizer connects structured product interpretation to a packing proposal. A desktop interface helps operators review physical attributes, compare crate or pallet arrangements and export a clear logistics summary. The design makes specialist planning more repeatable while preserving human review of handling suitability.',
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
      'Excel/VBA data-governance layer for a large B2B contact archive: guided entry, quality checks, duplicate review and commercial workflows.',
    body: 'ContactBase XL turns a fragmented contact archive into a working information layer. Guided input, validation and duplicate review improve consistency, while incoming data stays distinct from consolidated records. Users can reuse the reviewed information for segmentation and commercial communication.',
    stack: ['Excel', 'VBA', 'UserForms', 'Data Quality', 'Deduplication', 'Email Integration'],
    pills: [
      { label: 'Excel · VBA', hi: true },
      { label: 'Data Quality' },
      { label: 'Large-scale Archive' },
    ],
  },
  {
    id: 'rag',
    number: '07',
    cat: 'Private Knowledge · LLM · RAG Architecture',
    title: 'RAG Experiments',
    shortDesc:
      'Private knowledge retrieval from scattered technical documents, with local inference, visible evidence and source-linked answers. Developed through experimentation and used in real working contexts.',
    body: 'RAG Experiments turns controlled technical documents into inspectable evidence for practical information retrieval. Developed through iterative experimentation and used in real working contexts, the system separates document readability, retrieval quality and answer support. Source references make verification part of the workflow rather than treating a fluent answer as proof.',
    stack: ['Python', 'Local LLM', 'RAG', 'Vector DB', 'Document Processing', 'Evaluation'],
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
      'An enterprise AI operating intelligence platform: connects company memory, projects, energy analysis and governed agents to understand events and move work forward.',
    body: 'AI Company Second Brain is a connected operating intelligence platform for a renewable-energy business, conceived and developed end to end by me. It goes beyond retrieving documents: a shared model connects company evidence, clients, projects, contracts, energy assets, relationships and the history of work. The team can understand incoming events, inspect sourced answers, run reproducible feasibility calculations and generate management reporting from the same context. AI interprets unstructured information; versioned engines execute explicit energy and economic rules. Scheduled workflows and specialised agents monitor change and move routine work forward through capability-specific permissions, approval boundaries, reversible actions and an audit trail. Its breadth comes from integrating memory, execution and intelligence into one operable system, not adding a conversational interface to a document folder.',
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
