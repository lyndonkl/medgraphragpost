# MedGraphRAG Scrollytelling Experience

A scrollytelling narrative that explains the motivation, architecture, and retrieval process behind **MedGraphRAG** — a multi-layered GraphRAG system built for complex medical question answering. This project combines interactive storytelling using Scrollama with data-driven visuals built in D3.js, following strong visual communication principles inspired by *The Functional Art*.

---

## Project Goal

The aim of this project is to educate and engage readers through an interactive, visually compelling experience that:

* Builds intuition around vector embeddings, traditional RAG, and its limitations.
* Shows how **MedGraphRAG** leverages a three-tiered knowledge graph to overcome these limitations.
* Offers scroll-triggered visual breakdowns of how graph construction, tagging, and retrieval work under the hood.

---

## Tools and Technologies

| Tool             | Purpose                               |
| ---------------- | ------------------------------------- |
| Scrollama        | Scroll-based storytelling interaction |
| D3.js            | Custom interactive visualizations     |
| HTML/CSS         | Content scaffolding and styling       |
| MedGraph visuals | Reference and overlays from research  |

---

## Storyboard and Thought Process

Each section of the experience builds progressively from basic concepts to more complex systems.

### 1. Introduction to Vector Embeddings

* Explain vector embeddings and their semantic properties.
* Visualization: A 2D PCA/UMAP projection of clustered medical terms. Hover to show similar terms.

### 2. What is RAG (Retrieval-Augmented Generation)?

* Explain the basic RAG architecture: retrieval followed by generation.
* Visualization: Flow diagram showing query > retrieval > LLM generation with example outputs.

### 3. Limitations of Traditional RAG

* Address issues like:

  * Complex query understanding
  * Fragmented knowledge across documents
  * LLM context window limits
  * Inefficiencies in vector search
* Visualization: Interactive demos showing missed retrievals, context trimming, and disjoint document fragments.

### 4. What Are Knowledge Graphs?

* Define nodes, edges, and semantics.
* Visualization: Interactive graph with hoverable nodes and labeled relationships (e.g., Drug > Treats > Disease).

### 5. Enter GraphRAG

* Show benefits of using knowledge graphs for retrieval:

  * Better reasoning
  * Context-aware traversal
  * Improved grounding
* Compare approaches:

  * Knowledge Graph RAG
  * Graph Index over traditional RAG
  * Hybrid systems
* Visualization: Toggle between configurations using the same query.

---

## MedGraphRAG: Construction Walkthrough

An interactive section that walks through the 6-step MedGraphRAG construction pipeline.

### Step 1: Doc Chunking

* Use sentence splitting + semantic similarity to merge into coherent chunks.
* Visualization: Compare naive sentence splits with semantically grouped chunks.

### Step 2: Entity Extraction

* Extract nodes and relationships from each chunk.
* Each node includes: Name, Type, Context.
* Visualization: Dynamic tooltip popups showing extracted triplets per chunk.

### Step 3: Triple Linking

* Use semantic similarity to link:

  * Domain graph
  * Medical literature graph
  * UMLS dictionary
* Visualization: Hoverable terms showing linked definitions across layers.

### Step 4: Relationship Linking

* Identify semantic relationship types and label edges.
* Visualization: Color-coded relationship edges (e.g., "Used In Treatment", "Recommended For").

### Step 5: Tagging the Graph

* Extract tags from chunks.
* Store tags as hyperedges linked to subgraphs.
* Use embeddings to build a tag hierarchy.
* Visualization: Tree-based tag hierarchy builder with merge suggestions.

### Step 6: Retrieval via Tag Hierarchy

* Convert query into tags.
* Navigate from top-level tag down to leaf.
* Use leaf-associated subgraph to find 3-hop neighborhood.
* Generate first-level response.
* Refine with top-down pass using tag context.
* Visualization: Dual animation showing bottom-up and top-down reasoning paths.

---

## For Developers

### Local Setup

```bash
npm install
npm run dev
```

### Folder Structure

```
/src
  /components       # Scrollama steps and modular elements
  /data             # Embedding, graph, and tag hierarchy data
  /visualizations   # D3 modules and graph render logic
  index.html        # Page structure and scroll triggers
  main.js           # Scrollama logic
```

---

## Design Principles

Inspired by Alberto Cairo's *The Functional Art*, the following principles guide the visual storytelling:

* Clarity: Reduce noise and avoid unnecessary complexity
* Layering: Present information progressively
* Relevance: Every visual element must serve the narrative
* Engagement: Use motion and interactivity for better retention

---

## Roadmap

* Finalize D3 prototypes for each visual module
* Integrate Scrollama triggers and narration sync
* Connect graph, tag, and embedding data sources
* Add visual polish and accessibility refinements

---

## Contributors

* Project Lead: \[Your Name]
* Architecture: Based on the MedGraph and GraphRAG literature
* Tools: D3.js, Scrollama, MedGraph corpus
