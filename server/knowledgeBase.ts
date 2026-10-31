import { createRequire } from 'module';
const require = createRequire(import.meta.url);
// Safely load CommonJS pdf-parse module in ESM
let pdfParse: any;
try {
  pdfParse = require('pdf-parse');
} catch {
  pdfParse = null;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  source: string;
  page: number;
  text: string;
  startWord: number;
  endWord: number;
  vector?: number[];
  topics?: string[];
  x?: number;
  y?: number;
}

export interface DocumentPage {
  pageNumber: number;
  text: string;
  wordCount: number;
}

export interface AcademicDocument {
  id: string;
  title: string;
  code: string;
  description: string;
  filename: string;
  uploadDate: string;
  pageCount: number;
  chunkCount: number;
  topics: string[];
  pages: DocumentPage[];
  chunks: DocumentChunk[];
}

// Word-based sliding-window chunking mechanism as defined in CampusGPT notebook
export function chunkPages(
  documentId: string,
  sourceName: string,
  pages: DocumentPage[],
  chunkSize: number = 150,
  overlap: number = 30
): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  let chunkIndex = 0;

  for (const page of pages) {
    const words = page.text.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) continue;

    let start = 0;
    while (start < words.length) {
      const end = start + chunkSize;
      const chunkWords = words.slice(start, end);
      const chunkText = chunkWords.join(' ');

      // Extract high-level topic tags
      const topics = extractKeyTopics(chunkText);

      chunks.push({
        id: `${documentId}_c${chunkIndex}`,
        documentId,
        source: sourceName,
        page: page.pageNumber,
        text: chunkText,
        startWord: start,
        endWord: Math.min(end, words.length),
        topics,
      });

      chunkIndex++;
      if (end >= words.length) break;
      start = end - overlap;
    }
  }

  return chunks;
}

function extractKeyTopics(text: string): string[] {
  const candidateTopics = [
    'Supervised Learning', 'Unsupervised Learning', 'Reinforcement Learning',
    'Neural Networks', 'Deep Learning', 'Generative AI', 'Large Language Models',
    'RAG', 'Vector Embeddings', 'Cosine Similarity', 'FAISS',
    'Normalization', 'ACID Properties', 'B+ Tree', 'Concurrency', 'Transactions',
    'Deadlock', 'Banker Algorithm', 'Virtual Memory', 'Paging', 'Semaphores',
    'Dijkstra', 'Dynamic Programming', 'AVL Tree', 'Big-O Notation'
  ];

  return candidateTopics.filter(t => new RegExp(`\\b${t}\\b`, 'i').test(text)).slice(0, 3);
}

// In-memory persistent database of documents
let documentsDatabase: AcademicDocument[] = [];

// Seed high-quality academic documents
function initializeSeedDocuments(): void {
  // Document 1: Artificial Intelligence & Machine Learning (Directly from user's notebook AI_data.pdf)
  const aiPages: DocumentPage[] = [
    {
      pageNumber: 1,
      wordCount: 165,
      text: `Introduction to Artificial Intelligence
1. What is Artificial Intelligence?
Artificial Intelligence (AI) is a branch of computer science that focuses on creating machines and software capable of performing tasks that normally require human intelligence. These tasks include understanding language, recognizing images, making decisions, solving problems, learning from experience, and interacting with users. Common applications: virtual assistants, recommendation systems, healthcare diagnosis, fraud detection, autonomous vehicles, robotics, smart search, and personalized learning.

2. AI, Machine Learning and Deep Learning
Artificial Intelligence (AI) is the broad field of building intelligent systems. Machine Learning (ML) is a subset of AI in which systems learn patterns from data instead of relying only on explicitly written rules. Deep Learning is a subset of ML that uses neural networks with multiple layers to learn complex patterns from large amounts of data. AI → Machine Learning → Deep Learning.

3. Types of Machine Learning
Supervised Learning: The model learns from labeled examples. Examples include spam detection, house-price prediction, and student-placement prediction.
Unsupervised Learning: The model discovers patterns or groups in unlabeled data. Clustering customers into different groups is a common example.
Reinforcement Learning: An agent learns by interacting with an environment and receiving rewards or penalties. It is used in robotics, games, and decision-making systems.

4. Neural Networks
A neural network is a machine learning model inspired by biological neurons. It contains interconnected nodes organized into layers. During training, the network adjusts its parameters to reduce prediction errors. Deep neural networks contain many layers and can learn highly complex representations.`
    },
    {
      pageNumber: 2,
      wordCount: 180,
      text: `Generative AI and Modern AI Systems
5. What is Generative AI?
Generative AI is a class of AI systems that can create new content based on patterns learned from training data. It can generate text, images, audio, video, software code, summaries, and other forms of content. Examples: AI chatbots can generate text, image-generation models can create pictures from descriptions, coding assistants can generate programs, and speech models can generate or transform audio.

6. Large Language Models (LLMs)
Large Language Models (LLMs) are AI models trained on large collections of text and other data. They learn patterns in language and can perform tasks such as answering questions, summarizing documents, translating text, extracting information, and generating code. Examples of widely known LLM-based systems include GPT and Gemini. Users interact with these systems through prompts, which provide instructions or context for the desired output.

7. Retrieval-Augmented Generation (RAG)
Retrieval-Augmented Generation (RAG) combines information retrieval with text generation. Instead of answering purely from pre-trained memory, the system searches an external knowledge base or uploaded document repository for relevant context chunks, inserts them into the prompt, and instructs the LLM to ground its response strictly in the retrieved evidence with citations.`
    },
    {
      pageNumber: 3,
      wordCount: 172,
      text: `Embeddings, Vector Databases and Grounded Intelligence
8. Vector Embeddings
A text embedding is a numerical vector representation of words, sentences, or document passages in high-dimensional continuous space. Semantic similarity between two passages corresponds to vector proximity (e.g., inner product or cosine similarity). Embeddings enable semantic search that understands meaning rather than merely matching identical keywords.

9. Vector Indexes and FAISS
A Vector Database or Index (such as FAISS - Facebook AI Similarity Search) stores document chunk embeddings and performs ultra-fast nearest-neighbor (k-NN) queries against query vector representations. Normalizing vectors allows inner product calculation to equal cosine similarity directly.

10. Key Takeaway
AI is a broad field that includes Machine Learning and Deep Learning. Generative AI extends these capabilities by creating new content, while LLMs enable powerful language-based applications. Technologies such as embeddings, vector databases, and RAG make it possible to build AI systems that can work with private, domain-specific, and frequently changing information without hallucination.`
    }
  ];

  // Document 2: Database Management Systems (CS-303)
  const dbmsPages: DocumentPage[] = [
    {
      pageNumber: 1,
      wordCount: 185,
      text: `Relational Database Design and Normalization
1. Relational Data Model Fundamentals
A relational database stores data in relations (tables) composed of attributes (columns) and tuples (rows). Primary keys uniquely identify tuples, candidate keys are minimal superkeys, and foreign keys enforce referential integrity between parent and child relations.

2. Database Anomalies
Unnormalized databases suffer from three classical anomalies:
- Insertion Anomaly: Inability to record certain facts without adding unrelated attributes.
- Deletion Anomaly: Unintended loss of crucial information when deleting a tuple.
- Update/Modification Anomaly: Data inconsistency when an attribute is modified in some tuples but not all.

3. Functional Dependencies and Normal Forms
- First Normal Form (1NF): Eliminates repeating groups and ensures every attribute contains only atomic (indivisible) values.
- Second Normal Form (2NF): Satisfies 1NF and contains no partial functional dependencies; all non-prime attributes must depend fully on the complete candidate key.
- Third Normal Form (3NF): Satisfies 2NF and contains no transitive functional dependencies (X → Y and Y → Z where Z depends on non-key Y).
- Boyce-Codd Normal Form (BCNF): A stricter variant of 3NF where for every functional dependency X → Y, X must be a superkey.`
    },
    {
      pageNumber: 2,
      wordCount: 190,
      text: `Transactions and ACID Properties
4. What is a Database Transaction?
A transaction is a logical unit of database processing that includes one or more database access operations. Transactions must satisfy the ACID criteria:
- Atomicity: All operations in a transaction succeed completely, or the entire transaction is rolled back. No partial execution is committed.
- Consistency: A transaction must transition the database from one valid state satisfying all schema constraints to another valid state.
- Isolation: Concurrent transactions execute without mutual interference. Intermediate uncommitted modifications are invisible to other transactions.
- Durability: Once a transaction commits, its modifications are permanently recorded in non-volatile storage and survive system crashes.

5. Concurrency Control and Locking
To prevent dirty reads, non-repeatable reads, and phantom reads, DBMS implementations utilize concurrency protocols:
- Two-Phase Locking (2PL): Growing phase (acquires locks without releasing) and Shrinking phase (releases locks without acquiring new ones). Strict 2PL prevents cascading rollbacks.
- Write-Ahead Logging (WAL): Changes are recorded in a sequential append-only log before being flushed to database tables on disk.`
    },
    {
      pageNumber: 3,
      wordCount: 175,
      text: `Indexing Structures and Query Optimization
6. B-Trees and B+ Trees
Database indexes accelerate retrieval operations from O(N) linear scans to logarithmic O(log N) lookups.
A B+ Tree differs from a standard B-Tree because all key-data pairs are stored exclusively in leaf nodes. Internal nodes contain only routing keys and child pointers. Furthermore, leaf nodes are linked sequentially in a doubly linked list, enabling ultra-fast range scans.

7. Clustered vs Non-Clustered Indexes
- Clustered Index: Determines the physical ordering of records on disk. There can only be one clustered index per table (typically the primary key).
- Non-Clustered (Secondary) Index: Contains search keys and row pointers (RID or primary key) pointing to the actual data pages.

8. Query Optimization
The query optimizer generates execution plans, evaluates disk I/O costs, estimates cardinality using column histograms, and selects join algorithms (Nested Loop Join, Hash Join, Sort-Merge Join).`
    }
  ];

  // Document 3: Operating Systems Architecture (CS-301)
  const osPages: DocumentPage[] = [
    {
      pageNumber: 1,
      wordCount: 190,
      text: `Process Management and CPU Scheduling
1. Process vs Thread Lifecycle
A process is a program in execution with an address space containing Text (code), Data (globals), Heap (dynamic allocations), and Stack (activation records). A thread is a lightweight unit of CPU utilization sharing the address space, open files, and signals of its parent process while maintaining its own program counter, register set, and stack.

2. Process State Transitions
Processes transition between New, Ready, Running, Waiting (Blocked), and Terminated states. The OS Process Control Block (PCB) preserves registers and context during context switches.

3. CPU Scheduling Algorithms
- First-Come, First-Served (FCFS): Non-preemptive, suffers from the Convoy Effect where short CPU bursts wait behind long CPU-bound tasks.
- Shortest Job First (SJF) / Shortest Remaining Time First (SRTF): Mathematically optimal for minimizing average waiting time, but susceptible to starvation of long processes.
- Round Robin (RR): Preemptive scheduling with a defined time quantum (e.g. 10ms to 50ms). If the quantum is too large, it degenerates into FCFS; if too small, context-switch overhead dominates.
- Multi-Level Feedback Queue (MLFQ): Dynamically adjusts process priorities based on observed CPU burst history.`
    },
    {
      pageNumber: 2,
      wordCount: 185,
      text: `Concurrency, Synchronization and Deadlocks
4. Critical Section and Race Conditions
A race condition occurs when concurrent processes access and manipulate shared data, where the final result depends on execution order. The Critical Section problem requires:
- Mutual Exclusion: Only one process can execute in its critical section simultaneously.
- Progress: Selection of the next entering process cannot be postponed indefinitely.
- Bounded Waiting: A bound must exist on the number of times other processes enter their critical section before a request is granted.

5. Semaphores and Mutexes
- Mutex: A binary locking mechanism with ownership semantics.
- Counting Semaphore: An integer variable accessed via atomic wait() [P] and signal() [V] operations.

6. Deadlocks and Banker's Algorithm
A deadlock occurs when processes are blocked waiting for resources held by each other. Four Coffman conditions must hold concurrently: Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait.
Edsger Dijkstra's Banker's Algorithm prevents deadlocks by evaluating whether granting a resource request leaves the system in a Safe State, defined by the existence of a safe execution sequence where every process can acquire its maximum claim.`
    },
    {
      pageNumber: 3,
      wordCount: 180,
      text: `Virtual Memory and Paging
7. Virtual Memory Architecture
Virtual memory decouples logical address spaces from physical RAM, providing process isolation and enabling programs larger than physical memory.
Logical addresses are split into a Page Number (p) and an Offset (d). The Memory Management Unit (MMU) uses the Page Table to translate page numbers into physical Frame Numbers (f).

8. Translation Lookaside Buffer (TLB)
The TLB is a high-speed hardware associative cache that stores recently accessed page-to-frame mappings, reducing page table memory lookup penalties.

9. Page Faults, Page Replacement and Thrashing
When a process accesses a page marked invalid in the page table, a Page Fault exception triggers the OS trap handler to load the page from swap space into RAM.
Replacement algorithms include:
- FIFO: First-in, first-out (susceptible to Belady's Anomaly where allocating more frames increases page faults).
- Optimal (OPT): Replaces the page that will not be used for the longest time in the future.
- Least Recently Used (LRU): Replaces the page unaccessed for the longest duration.
Thrashing occurs when a system spends more time servicing page faults and swapping pages than executing instructions, caused by insufficient frames to hold working sets.`
    }
  ];

  // Document 4: Data Structures & Algorithms (CS-201)
  const dsaPages: DocumentPage[] = [
    {
      pageNumber: 1,
      wordCount: 180,
      text: `Asymptotic Complexity and Balanced Search Trees
1. Asymptotic Notations
- Big-O (O): Upper bound on growth rate, representing worst-case time complexity.
- Big-Omega (Ω): Lower bound on growth rate, representing best-case performance.
- Big-Theta (Θ): Tight asymptotic bound where upper and lower bounds coincide.

2. Balanced Binary Search Trees
Unbalanced BSTs degrade to O(N) linked lists during skewed insertions. Balanced variants guarantee O(log N) search, insertion, and deletion:
- AVL Trees: Strictly height-balanced where for every node, the height difference between left and right subtrees (Balance Factor) is at most 1. Rebalanced using Left-Left, Right-Right, Left-Right, and Right-Left rotations.
- Red-Black Trees: Relaxed height balance ensuring no path from root to leaf is more than twice as long as another. Governed by 5 properties: every node is red or black, root is black, all NIL leaves are black, red nodes have black children, and every path from a node to NIL leaves contains identical black heights.`
    },
    {
      pageNumber: 2,
      wordCount: 185,
      text: `Graph Algorithms and Shortest Path
3. Graph Representation
Graphs are represented via Adjacency Matrix (O(V^2) space, O(1) edge lookup) or Adjacency List (O(V + E) space, optimal for sparse graphs).

4. Traversal Techniques
- Breadth-First Search (BFS): Explores vertex neighbors level-by-level using a FIFO queue. Solves single-source shortest path in unweighted graphs in O(V + E).
- Depth-First Search (DFS): Explores branches recursively using a LIFO stack. Solves topological sorting, cycle detection, and strongly connected components (Kosaraju / Tarjan).

5. Dijkstra's Algorithm
Computes single-source shortest paths on graphs with non-negative edge weights. Using a min-priority heap, it runs in O((V + E) log V). It maintains tentative distance estimates and progressively relaxes edges of the vertex with minimal known distance. Negative edge weights require Bellman-Ford (O(V * E)) or Floyd-Warshall (O(V^3)).`
    },
    {
      pageNumber: 3,
      wordCount: 185,
      text: `Dynamic Programming and Optimization
6. Core Principles of Dynamic Programming
Dynamic Programming (DP) solves complex problems by breaking them into overlapping subproblems and optimal substructure. Techniques include:
- Top-Down with Memoization: Recursion augmented with lookup cache to prevent redundant evaluations.
- Bottom-Up Tabulation: Iterative state computation starting from base cases, eliminating call stack overhead.

7. Classical DP Archetypes
- 0/1 Knapsack Problem: Given weights and values of items, maximize value without exceeding capacity W. Recurrence: dp[i][w] = max(dp[i-1][w], dp[i-1][w - wt[i]] + val[i]). Time complexity: O(N * W).
- Longest Common Subsequence (LCS): Computes similarity between two sequences. Recurrence: if text1[i] == text2[j], dp[i][j] = 1 + dp[i-1][j-1]; else max(dp[i-1][j], dp[i][j-1]). Time complexity: O(M * N).`
    }
  ];

  const doc1Chunks = chunkPages('doc_ai_01', 'AI_data.pdf', aiPages);
  const doc2Chunks = chunkPages('doc_dbms_02', 'DBMS_Relational_Systems.pdf', dbmsPages);
  const doc3Chunks = chunkPages('doc_os_03', 'OS_Concurrency_Paging.pdf', osPages);
  const doc4Chunks = chunkPages('doc_dsa_04', 'DSA_Advanced_Algorithms.pdf', dsaPages);

  documentsDatabase = [
    {
      id: 'doc_ai_01',
      title: 'Artificial Intelligence & Machine Learning',
      code: 'CS-401',
      description: 'Core concepts of AI, Supervised/Unsupervised/RL learning, Deep Neural Networks, Generative AI, LLMs, and RAG.',
      filename: 'AI_data.pdf',
      uploadDate: '2026-10-30',
      pageCount: aiPages.length,
      chunkCount: doc1Chunks.length,
      topics: ['AI Foundations', 'Machine Learning', 'Deep Learning', 'Generative AI', 'LLMs', 'RAG & Vectors'],
      pages: aiPages,
      chunks: doc1Chunks,
    },
    {
      id: 'doc_dbms_02',
      title: 'Database Management Systems & Normalization',
      code: 'CS-303',
      description: 'Relational data model, functional dependencies, 1NF to BCNF, ACID transactions, 2PL concurrency, and B+ Tree indexes.',
      filename: 'DBMS_Relational_Systems.pdf',
      uploadDate: '2026-10-30',
      pageCount: dbmsPages.length,
      chunkCount: doc2Chunks.length,
      topics: ['Relational Model', 'Normalization', 'ACID Properties', 'Concurrency 2PL', 'B+ Tree Indexing'],
      pages: dbmsPages,
      chunks: doc2Chunks,
    },
    {
      id: 'doc_os_03',
      title: 'Operating Systems & Distributed Architecture',
      code: 'CS-301',
      description: 'Processes, CPU scheduling algorithms (FCFS, SJF, RR, MLFQ), Semaphores, Deadlocks & Banker Algorithm, Virtual Memory and Paging.',
      filename: 'OS_Concurrency_Paging.pdf',
      uploadDate: '2026-10-30',
      pageCount: osPages.length,
      chunkCount: doc3Chunks.length,
      topics: ['Process Management', 'CPU Scheduling', 'Critical Section', 'Banker Algorithm', 'Virtual Memory & TLB'],
      pages: osPages,
      chunks: doc3Chunks,
    },
    {
      id: 'doc_dsa_04',
      title: 'Data Structures, Balanced Trees & Algorithms',
      code: 'CS-201',
      description: 'Asymptotic complexity Big-O, Balanced BSTs (AVL, Red-Black Trees), Graph Shortest Path (Dijkstra), and Dynamic Programming.',
      filename: 'DSA_Advanced_Algorithms.pdf',
      uploadDate: '2026-10-30',
      pageCount: dsaPages.length,
      chunkCount: doc4Chunks.length,
      topics: ['Big-O Analysis', 'AVL & Red-Black Trees', 'Graph Traversal', 'Dijkstra Algorithm', 'Dynamic Programming'],
      pages: dsaPages,
      chunks: doc4Chunks,
    },
  ];
}

// Initialize on module load
initializeSeedDocuments();

export function getAllDocuments(): AcademicDocument[] {
  return documentsDatabase;
}

export function getDocumentById(id: string): AcademicDocument | undefined {
  return documentsDatabase.find(doc => doc.id === id);
}

export function getAllChunks(courseFilter?: string): DocumentChunk[] {
  if (courseFilter && courseFilter !== 'all') {
    const doc = documentsDatabase.find(d => d.id === courseFilter || d.code === courseFilter);
    return doc ? doc.chunks : [];
  }
  return documentsDatabase.flatMap(doc => doc.chunks);
}

export function deleteDocument(id: string): boolean {
  const initialLength = documentsDatabase.length;
  documentsDatabase = documentsDatabase.filter(d => d.id !== id);
  return documentsDatabase.length < initialLength;
}

export async function addUploadedDocument(params: {
  title: string;
  code: string;
  description: string;
  filename: string;
  fileBuffer?: Buffer;
  textContent?: string;
  chunkSize?: number;
  overlap?: number;
}): Promise<AcademicDocument> {
  const id = `doc_${Date.now()}`;
  let pages: DocumentPage[] = [];

  if (params.fileBuffer) {
    try {
      const data = await pdfParse(params.fileBuffer);
      // Split into pages if page markers exist, or chunk into reasonable pages
      const rawText = data.text || '';
      const pageSections = rawText.split(/\f|\n(?=Page \d+)/i);

      if (pageSections.length > 1) {
        pages = pageSections.filter((s: string) => s.trim().length > 0).map((sec: string, idx: number) => ({
          pageNumber: idx + 1,
          text: sec.trim(),
          wordCount: sec.trim().split(/\s+/).length,
        }));
      } else {
        // Break into pages of ~350 words
        const allWords = rawText.trim().split(/\s+/).filter(Boolean);
        const pageSize = 350;
        let pNum = 1;
        for (let i = 0; i < allWords.length; i += pageSize) {
          const slice = allWords.slice(i, i + pageSize).join(' ');
          pages.push({
            pageNumber: pNum++,
            text: slice,
            wordCount: slice.split(/\s+/).length,
          });
        }
      }
    } catch {
      // Fallback if PDF parsing has errors
      pages = [{
        pageNumber: 1,
        text: params.textContent || 'Uploaded document content',
        wordCount: (params.textContent || '').split(/\s+/).length,
      }];
    }
  } else if (params.textContent) {
    const sections = params.textContent.split(/\n\s*---\s*\n|\n(?=## Page \d+)/i);
    if (sections.length > 1) {
      pages = sections.map((sec, idx) => ({
        pageNumber: idx + 1,
        text: sec.trim(),
        wordCount: sec.trim().split(/\s+/).length,
      }));
    } else {
      const words = params.textContent.trim().split(/\s+/).filter(Boolean);
      const pageSize = 300;
      let pNum = 1;
      for (let i = 0; i < words.length; i += pageSize) {
        const slice = words.slice(i, i + pageSize).join(' ');
        pages.push({
          pageNumber: pNum++,
          text: slice,
          wordCount: slice.split(/\s+/).length,
        });
      }
    }
  }

  if (pages.length === 0) {
    pages.push({
      pageNumber: 1,
      text: 'Empty document',
      wordCount: 0,
    });
  }

  const chunkSize = params.chunkSize || 150;
  const overlap = params.overlap || 30;
  const chunks = chunkPages(id, params.filename, pages, chunkSize, overlap);

  const newDoc: AcademicDocument = {
    id,
    title: params.title || params.filename.replace(/\.[^/.]+$/, ''),
    code: params.code || 'USER-DOC',
    description: params.description || 'Custom uploaded student study document.',
    filename: params.filename,
    uploadDate: new Date().toISOString().split('T')[0],
    pageCount: pages.length,
    chunkCount: chunks.length,
    topics: chunks.flatMap(c => c.topics || []).slice(0, 5),
    pages,
    chunks,
  };

  documentsDatabase.push(newDoc);
  return newDoc;
}
