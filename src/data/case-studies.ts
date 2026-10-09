export interface CaseStudyArticle {
  headline: string;
  standfirst: string;
  sections: { title: string; text: string }[];
  flow: string[];
  signals: { value: string; label: string; note: string }[];
  impact: {
    unit: string;
    manualMinutes: number;
    assistedMinutes: number;
    monthlyVolume: number;
    boundary: string;
  };
}

// Public editorial summaries. Impact defaults are illustrative assumptions,
// not customer telemetry, benchmarks or measured savings.
export const CASE_STUDY_ARTICLES: Record<string, CaseStudyArticle> = {
  nest: {
    headline: 'Keeping the manufacturing handoff connected',
    standfirst: 'A panel layout is only useful if the people cutting, packing and receiving it can follow the same information.',
    sections: [
      { title: 'The starting problem', text: 'Panel information began in design exports and passed through several manual handoffs before reaching production. Layout decisions, quantities and packaging information could drift apart. The challenge was to bring that process into a tool that preserved the identity of each item from design to delivery.' },
      { title: 'Analysis before automation', text: 'I separated data-quality problems from physical constraints and handoff requirements. A valid dimension was not enough: quantities, material compatibility and downstream grouping also had to remain coherent. This changed the scope from drawing an efficient layout to maintaining one consistent production record.' },
      { title: 'How the system was shaped', text: 'The system was organised around distinct responsibilities: input validation, layout evaluation, production sequencing and output generation. This made it possible to refine the planning logic without changing how operators reviewed inputs or how suppliers received the result.' },
      { title: 'What happens in use', text: 'An operator imports a design export, reviews exceptions and generates candidate sheet layouts. The selected plan carries item references into cutting drawings, packing summaries and visual checks. Those outputs describe the same plan from different operational perspectives.' },
      { title: 'The solution and its limits', text: 'The value is a repeatable handoff with less reconstruction between departments. Material use and preparation effort are useful measures to track, but a tighter digital layout is not automatically a better shop-floor plan. Manufacturing and handling constraints remain part of the review.' },
    ],
    flow: ['Design export', 'Validated items', 'Layout review', 'Production handoff'],
    signals: [
      { value: '2D', label: 'Layout model', note: 'Rectangular panels arranged on sheets.' },
      { value: '3D', label: 'Visual checks', note: 'Packing views complement cutting layouts.' },
      { value: '4', label: 'Output families', note: 'Workbooks, drawings, images and 3D views.' },
    ],
    impact: { unit: 'planning batches', manualMinutes: 120, assistedMinutes: 45, monthlyVolume: 12, boundary: 'Preparation and review of one panel-planning batch. Excludes machine time, material savings and supplier lead time.' },
  },
  cargo: {
    headline: 'Making freight assumptions visible before an order is final',
    standfirst: 'Commercial teams need a transport estimate while the physical shipment is still taking shape.',
    sections: [
      { title: 'The starting problem', text: 'At quotation stage, product quantities existed but a final packing list did not. Freight estimates depended on experience and rough volume assumptions. That left the reasoning behind a transport allowance difficult to inspect or repeat when an offer changed.' },
      { title: 'Analysis before automation', text: 'I mapped the gap between commercial quantities and physical shipping units. Packaging assumptions and loading constraints had different roles and needed to be evaluated separately. The key question became: what plausible shipment does this offer imply, and where is that estimate uncertain?' },
      { title: 'How the system was shaped', text: 'A Python service separates the translation of order data into shipping units from the loading evaluation. A web interface exposes the inputs and results in a form usable during an offer review. The separation keeps scenario changes understandable rather than burying them inside one calculation.' },
      { title: 'What happens in use', text: 'Users enter product quantities, inspect the resulting crate scenario and compare container options. The output shows a loading estimate, fill indicators and items that cannot be placed. Changing the offer produces a comparable scenario instead of another disconnected spreadsheet.' },
      { title: 'The solution and its limits', text: 'The tool gives freight discussions a consistent starting point and makes assumptions visible early. Its output remains an estimate: final dimensions and shipment conditions can differ. The operational packing-list companion closes that gap once the real crates are known.' },
    ],
    flow: ['Offer quantities', 'Crate scenario', 'Loading evaluation', 'Freight review'],
    signals: [
      { value: '3D', label: 'Spatial model', note: 'Loading considers physical dimensions.' },
      { value: '2', label: 'Decision layers', note: 'Packaging assumptions and loading evaluation.' },
      { value: 'Web', label: 'Review interface', note: 'A browser surface for commercial scenarios.' },
    ],
    impact: { unit: 'offer scenarios', manualMinutes: 60, assistedMinutes: 20, monthlyVolume: 24, boundary: 'Preparation and review of a freight scenario. Excludes transport cost reductions and final shipment validation.' },
  },
  load: {
    headline: 'Turning a confirmed packing list into a shipment check',
    standfirst: 'Once real crates exist, the question changes from estimating freight to checking a load that can actually be dispatched.',
    sections: [
      { title: 'The starting problem', text: 'A confirmed packing list contained the shipment data, but logistics still needed to interpret dimensions, quantities and loading compatibility. A total-volume figure could hide an item that did not fit or a layout that was difficult to execute.' },
      { title: 'Analysis before automation', text: 'I distinguished commercial estimates from operational evidence. This tool needed to start from actual shipping units and make placement exceptions visible. The review had to connect the numeric result to a layout that a logistics operator could inspect.' },
      { title: 'How the system was shaped', text: 'The loading model was adapted to confirmed crate data, with validation and visual reporting around it. The interface prioritises the load plan and unresolved items. Keeping inputs and outputs aligned supports recalculation when the packing list changes.' },
      { title: 'What happens in use', text: 'An operator supplies the final crate list and reviews the generated positions and orientations. Fill indicators explain how the available space is used, while unplaced items remain visible. The result supports a transport booking and a conversation about exceptions.' },
      { title: 'The solution and its limits', text: 'The system provides a common reference for shipment validation and reduces repeated manual layout work. A digital fit does not replace physical loading checks, securing requirements or carrier constraints. Those remain part of the dispatch decision.' },
    ],
    flow: ['Confirmed crates', 'Input checks', 'Load layout', 'Dispatch review'],
    signals: [
      { value: '3D', label: 'Load representation', note: 'Positions and orientations are made visible.' },
      { value: '2', label: 'Review outputs', note: 'A spatial view and numeric load indicators.' },
      { value: 'Final', label: 'Input stage', note: 'Confirmed packing-list data rather than forecasts.' },
    ],
    impact: { unit: 'shipment checks', manualMinutes: 75, assistedMinutes: 30, monthlyVolume: 16, boundary: 'Digital load planning and review. Excludes physical loading, securing, freight rates and carrier booking time.' },
  },
  door: {
    headline: 'Making specialist packing knowledge usable',
    standfirst: 'A product description carries engineering information; packing decisions need that information in a consistent form.',
    sections: [
      { title: 'The starting problem', text: 'Planning crates for engineered door assemblies depended on interpreting technical descriptions and combining several handling constraints. Manual work mixed product interpretation, weight assumptions and packing choices, making revisions slow and difficult to compare.' },
      { title: 'Analysis before automation', text: 'I separated the interpretation of a product from the decision about how it should travel. Product attributes, estimated physical properties and packaging limits became distinct parts of the analysis. This made missing information and conflicting constraints easier to identify.' },
      { title: 'How the system was shaped', text: 'The Python desktop tool connects structured product interpretation to a constrained planning model and a review interface. Product knowledge and planning responsibilities are kept separate so the system can be maintained without exposing internal product conventions to users.' },
      { title: 'What happens in use', text: 'An operator loads a product list, reviews its interpreted attributes and compares crate or pallet configurations. The output summarises weights, dimensions and grouped components in a form that can be checked and passed into logistics reporting.' },
      { title: 'The solution and its limits', text: 'The tool makes specialist judgement repeatable and provides a clearer basis for packing decisions. Weight estimates and digital arrangements still depend on valid product data. Physical stability and handling suitability require operational confirmation.' },
    ],
    flow: ['Product list', 'Structured attributes', 'Constraint review', 'Packing proposal'],
    signals: [
      { value: '3', label: 'Review dimensions', note: 'Weight, space and handling constraints.' },
      { value: '2', label: 'Packing formats', note: 'Crate and pallet proposals.' },
      { value: 'Desktop', label: 'Operator surface', note: 'A focused interface for specialist planning.' },
    ],
    impact: { unit: 'packing plans', manualMinutes: 90, assistedMinutes: 35, monthlyVolume: 10, boundary: 'Interpretation and preparation of one packing proposal. Excludes fabrication, physical testing and materials procurement.' },
  },
  gantt: {
    headline: 'Making production replanning a repeatable decision',
    standfirst: 'A useful schedule must explain the effect of changing priorities, not just display dates.',
    sections: [
      { title: 'The starting problem', text: 'Production planning relied on manual spreadsheets and knowledge held by individual operators. Changes to order scope or priority could require rebuilding part of the schedule by hand. The resulting plan was hard to inspect for overloaded resources.' },
      { title: 'Analysis before automation', text: 'I mapped the relationship between order demand, work types, resource availability and expected processing effort. The useful model was the one planners could understand and update, with assumptions visible enough to explain why work appeared on a particular day.' },
      { title: 'How the system was shaped', text: 'Excel and VBA provided an interface close to the existing workflow. Inputs, scheduling logic and the Gantt view were separated within the workbook. The emphasis was on recalculation and review rather than introducing a new planning environment.' },
      { title: 'What happens in use', text: 'A planner updates demand, capacity or priorities and generates a daily schedule across resources. The visual output helps identify congestion and compare a revised plan with the previous one. The tool makes a planning discussion easier to conduct around explicit assumptions.' },
      { title: 'The solution and its limits', text: 'The workbook reduces repetitive schedule construction and supports faster responses to change. Average processing times remain estimates, and real shop-floor conditions can invalidate them. A plan is therefore a reviewable decision aid, not a guarantee of delivery.' },
    ],
    flow: ['Orders + capacity', 'Planning assumptions', 'Daily schedule', 'Replanning review'],
    signals: [
      { value: 'Daily', label: 'Planning resolution', note: 'A schedule organised by working day.' },
      { value: '2', label: 'Input perspectives', note: 'Work demand and available capacity.' },
      { value: 'Excel', label: 'Adoption surface', note: 'Built around an existing planning workflow.' },
    ],
    impact: { unit: 'replanning cycles', manualMinutes: 150, assistedMinutes: 60, monthlyVolume: 8, boundary: 'Preparing and reviewing a revised schedule. Excludes production throughput and delivery performance.' },
  },
  db: {
    headline: 'Moving a contact archive into daily use',
    standfirst: 'A large archive becomes useful when people can trust the records they retrieve and add.',
    sections: [
      { title: 'The starting problem', text: 'A large business contact archive contained inconsistent fields, duplicate records and incomplete information. It held commercial value, but the effort needed to check and reuse a contact limited how useful it was during everyday work.' },
      { title: 'Analysis before automation', text: 'I examined how records entered the archive, how duplication appeared and what information people needed to act. Cleaning historical records and controlling new input were different problems. Both had to be addressed to avoid recreating the same inconsistencies.' },
      { title: 'How the system was shaped', text: 'An Excel and VBA layer introduced guided entry, validation and a clearer boundary between incoming data and consolidated records. The interface was designed around the familiar working environment, making data governance part of normal use rather than a separate cleanup exercise.' },
      { title: 'What happens in use', text: 'Users review contact information, resolve likely duplicates and add new records through controlled forms. Consolidated data can then support segmentation and commercial communication, including a reviewed email draft from a selected contact.' },
      { title: 'The solution and its limits', text: 'The archive becomes a working information layer with fewer ambiguous records. Validation can identify suspicious formats and possible duplicates, but it cannot prove that a person or address is current. Ambiguous matches still need a human decision.' },
    ],
    flow: ['Incoming records', 'Quality review', 'Consolidated contacts', 'Commercial action'],
    signals: [
      { value: 'Large', label: 'Archive scale', note: 'Exact customer record counts are withheld.' },
      { value: '2', label: 'Data states', note: 'Incoming and consolidated information.' },
      { value: 'Review', label: 'Duplicate handling', note: 'Potential matches support a human decision.' },
    ],
    impact: { unit: 'review batches', manualMinutes: 45, assistedMinutes: 20, monthlyVolume: 30, boundary: 'Preparing and reviewing a contact-data batch. Excludes commercial conversion, contact verification and sales outcomes.' },
  },
  rag: {
    headline: 'Exploring private retrieval that shows its evidence',
    standfirst: 'The research question was whether scattered technical documents could become useful answers without losing control of the source material.',
    sections: [
      { title: 'The starting problem', text: 'Technical knowledge existed across manuals, specifications and project documents. Finding a relevant passage was slow, and a fluent generated answer alone would not be sufficient evidence for technical work. Document control and source visibility mattered from the start.' },
      { title: 'Analysis before experimentation', text: 'I separated document readability, retrieval quality and answer quality. A failed answer might originate in a poor extraction or an irrelevant passage rather than the language model. That distinction shaped experiments around the entire information path.' },
      { title: 'How the system was shaped', text: 'The research combined local inference with document preparation and retrieval experiments. Source links and constrained answer behaviour were treated as part of the user experience. The purpose was to understand the conditions for reliable use, not simply demonstrate conversational output.' },
      { title: 'What happens in use', text: 'A query retrieves candidate passages from a controlled document collection. The user can inspect the evidence supporting an answer and recognise when the available material is insufficient. Experiments compare document preparation and retrieval choices at a methodological level.' },
      { title: 'The solution and its limits', text: 'Developed through experimentation, the retrieval tool is used in real working contexts with source inspection and human verification. Retrieval speed, citation quality and answer correctness remain separate evaluation questions. Operational use does not by itself establish an accuracy benchmark, and a time-saving scenario is not evidence of correctness.' },
    ],
    flow: ['Controlled documents', 'Content preparation', 'Evidence retrieval', 'Answer inspection'],
    signals: [
      { value: 'Local', label: 'Inference approach', note: 'Experiments use a controlled local environment.' },
      { value: '3', label: 'Evaluation layers', note: 'Readability, retrieval and answer quality.' },
      { value: 'In use', label: 'Operational status', note: 'Real-context use; no public accuracy benchmark is claimed.' },
    ],
    impact: { unit: 'research queries', manualMinutes: 20, assistedMinutes: 10, monthlyVolume: 80, boundary: 'Finding and inspecting technical evidence, including human verification. Excludes correctness claims and production ROI.' },
  },
  micro: {
    headline: 'Finding the small automations worth building',
    standfirst: 'Recurring data preparation can consume attention even when no single task justifies a large application.',
    sections: [
      { title: 'The starting problem', text: 'Small reporting and data-cleaning tasks were repeated across operational work. Exports needed rearranging, comparisons needed rebuilding and charts needed updating. The same preparation steps returned often enough to create friction and opportunities for manual error.' },
      { title: 'Analysis before automation', text: 'I looked for stable, repeatable transformations with a clear consumer. The analysis focused on the input, the decision the output supported and the exceptions that would need review. Tasks with unclear requirements were kept out of automatic processing.' },
      { title: 'How the tools were shaped', text: 'Small Python utilities separate data preparation from analysis and presentation. Each tool stays close to one recurring need, with a readable output rather than an oversized interface. This keeps maintenance proportional to the problem being solved.' },
      { title: 'What happens in use', text: 'An operator supplies an export, reviews any input exceptions and generates a report or comparison. The output can support production monitoring, supplier discussions or internal analysis. Repeated runs apply the same transformation to a new period of data.' },
      { title: 'The solution and its limits', text: 'The collection reduces repeated preparation work and makes outputs more consistent across reporting periods. Each utility has its own scope and cannot correct a misleading source dataset. Source changes and unusual records still require review.' },
    ],
    flow: ['Operational export', 'Input checks', 'Repeatable analysis', 'Decision-ready report'],
    signals: [
      { value: 'ETL', label: 'Common pattern', note: 'Prepare, transform and present operational data.' },
      { value: 'Batch', label: 'Execution style', note: 'Repeat a defined transformation on fresh inputs.' },
      { value: 'Focused', label: 'Tool scope', note: 'Each utility serves a specific recurring task.' },
    ],
    impact: { unit: 'report runs', manualMinutes: 60, assistedMinutes: 20, monthlyVolume: 20, boundary: 'Data preparation and report review for one recurring run. Excludes decisions made from the report.' },
  },
  cerbrain: {
    headline: 'From company memory to an AI operating intelligence platform',
    standfirst: 'An indexed archive of tens of thousands of documents, an AI-connected operational CRM/ERP layer and one shared tool hub. Company knowledge becomes usable context for decisions and governed execution.',
    sections: [
      { title: 'The starting problem', text: 'A renewable-energy business held its operational history across documents, emails, business records and specialist spreadsheets. Understanding a project required reconstructing the links by hand. Management reports repeated that effort, while calculations and AI tools worked with separate fragments of context.' },
      { title: 'Analysis before AI', text: 'I mapped the entities, information flows and decisions that made up daily work. The central requirement was continuity: a document, a project update and an analysis needed to refer to the same business context. Reliable records and clear ownership had to support every later automation.' },
      { title: 'The memory stays connected to daily work', text: 'The platform synchronises with SharePoint files and company email instead of relying on a one-off manual upload. New documents, revisions and messages enter the shared knowledge layer through background updates. The team keeps using its existing tools while search, project history and downstream workflows receive the updated evidence. Source references and document versions preserve the connection to the original information. Keeping the memory maintained is as important as making it searchable; synchronisation is a background process, not a promise that every change is visible instantly.' },
      { title: 'Find the evidence, not the folder', text: 'The team can search tens of thousands of company documents without opening each file manually. A persistent hybrid index combines semantic embeddings, exact-term search and contextual filtering to retrieve relevant passages and their source references. Embeddings represent meaning, so useful evidence can be found even when the question uses different words from the document. New and revised sources update the index. The model receives selected evidence rather than rereading the whole archive for every question. The public account describes archive scale and retrieval behaviour, not a measured response-time guarantee.' },
      { title: 'How the system was shaped', text: 'I conceived and developed three cooperating layers: a system of record, a system of work and a system of intelligence. Document processing and linked business entities preserve memory; project workflows maintain the state of work; retrieval, deterministic engines and specialised agents use that shared context. A control plane makes source freshness, failures, costs and action history inspectable. The complexity lies in keeping those responsibilities coherent as the platform evolves.' },
      { title: 'Business records and tools share the same context', text: 'A lightweight operational CRM/ERP layer links clients, projects, contracts, assets, tasks and approvals to their evidence. It is not a general-purpose accounting suite. Search, maps, calculations, reports and automation become one tool hub over those shared records, avoiding repeated handoffs between disconnected files and applications. Compatible AI assistants can use scoped MCP tools to access the same knowledge and capabilities. The differentiator is the maintained company context and operational integration, not a claim that embeddings are universally superior to coding assistants.' },
      { title: 'What happens in use', text: 'An incoming email, energy document or market signal updates the relevant business context instead of remaining an isolated file. That context supports project history, sourced answers, feasibility calculations, management visibility and the next operational action. Specialised agents work within capability-specific autonomy: observe, propose or act with a reversible trail. Consequential external actions require review. This connects sensing, understanding and execution without delegating explicit calculation rules to a language model.' },
      { title: 'The solution and its limits', text: 'The completed product scope brings knowledge, analysis and execution into a shared workspace, including management visibility and controlled client access. The important outcome is continuity of context. AI assists interpretation; explicit rules govern calculations, and consequential or uncertain actions remain subject to review.' },
    ],
    flow: ['Company evidence', 'Connected records', 'Work + analysis', 'Reviewed action'],
    signals: [
      { value: '3', label: 'Connected layers', note: 'Records, workflows and intelligence.' },
      { value: '2', label: 'Reasoning modes', note: 'AI interpretation and deterministic calculation.' },
      { value: 'Audit', label: 'Action visibility', note: 'Sources, permissions and execution history.' },
    ],
    impact: { unit: 'project briefings', manualMinutes: 90, assistedMinutes: 35, monthlyVolume: 24, boundary: 'Gathering evidence and reviewing a project briefing. Excludes the combined ROI of other platform functions.' },
  },
};
