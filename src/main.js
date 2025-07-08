import scrollama from 'scrollama'
import * as d3 from 'd3'

// Initialize Scrollama
const scroller = scrollama()

// Clean 2D vector plot data
const vectorData = [
  // Diabetes cluster
  { term: 'Diabetes', category: 'diseases', x: 0.2, y: 0.3, similarity: 0.9 },
  { term: 'Insulin', category: 'treatments', x: 0.25, y: 0.35, similarity: 0.85 },
  { term: 'Blood Sugar', category: 'symptoms', x: 0.22, y: 0.32, similarity: 0.8 },
  { term: 'Glucose', category: 'biomarkers', x: 0.24, y: 0.34, similarity: 0.75 },
  { term: 'Pancreas', category: 'organs', x: 0.18, y: 0.28, similarity: 0.7 },
  
  // Heart disease cluster
  { term: 'Heart Disease', category: 'diseases', x: 0.8, y: 0.7, similarity: 0.9 },
  { term: 'Cholesterol', category: 'biomarkers', x: 0.75, y: 0.65, similarity: 0.85 },
  { term: 'Blood Pressure', category: 'symptoms', x: 0.82, y: 0.72, similarity: 0.8 },
  { term: 'Cardiovascular', category: 'systems', x: 0.78, y: 0.68, similarity: 0.75 },
  
  // Cancer cluster
  { term: 'Cancer', category: 'diseases', x: 0.3, y: 0.8, similarity: 0.9 },
  { term: 'Tumor', category: 'conditions', x: 0.35, y: 0.75, similarity: 0.85 },
  { term: 'Oncology', category: 'specialties', x: 0.32, y: 0.82, similarity: 0.8 },
  { term: 'Chemotherapy', category: 'treatments', x: 0.28, y: 0.78, similarity: 0.75 },
  
  // Respiratory cluster
  { term: 'Asthma', category: 'diseases', x: 0.7, y: 0.2, similarity: 0.9 },
  { term: 'Lungs', category: 'organs', x: 0.65, y: 0.25, similarity: 0.85 },
  { term: 'Breathing', category: 'symptoms', x: 0.72, y: 0.18, similarity: 0.8 },
  
  // Unrelated terms (far away)
  { term: 'Car Engine', category: 'mechanical', x: 0.9, y: 0.9, similarity: 0.1 },
  { term: 'Cooking', category: 'lifestyle', x: 0.1, y: 0.1, similarity: 0.05 }
]

// Functional color scheme
const categoryColors = {
  diseases: '#d32f2f',
  treatments: '#1976d2',
  symptoms: '#f57c00',
  biomarkers: '#7b1fa2',
  organs: '#388e3c',
  systems: '#455a64',
  conditions: '#e65100',
  specialties: '#6a1b9a',
  mechanical: '#757575',
  lifestyle: '#616161'
}

// Clean 2D Vector Plot visualization
const createVectorPlot = () => {
  const container = d3.select('#embeddings-viz')
  container.html('') // Clear existing content
  
  const margin = { top: 40, right: 40, bottom: 40, left: 40 }
  const width = 800 - margin.left - margin.right
  const height = 500 - margin.top - margin.bottom
  
  // Create SVG
  const svg = container.append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .style('background', 'white')
    .style('border-radius', '8px')
    .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)')
  
  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)
  
  // Create scales
  const xScale = d3.scaleLinear()
    .domain([0, 1])
    .range([0, width])
  
  const yScale = d3.scaleLinear()
    .domain([0, 1])
    .range([height, 0])
  
  const radiusScale = d3.scaleLinear()
    .domain([0, 1])
    .range([4, 12])
  
  // Add axes (without labels)
  const xAxis = d3.axisBottom(xScale)
    .ticks(5)
    .tickFormat(d3.format('.1f'))
  
  const yAxis = d3.axisLeft(yScale)
    .ticks(5)
    .tickFormat(d3.format('.1f'))
  
  g.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${height})`)
    .call(xAxis)
  
  g.append('g')
    .attr('class', 'y-axis')
    .call(yAxis)
  
  // Add title
  g.append('text')
    .attr('class', 'title')
    .attr('text-anchor', 'middle')
    .attr('x', width / 2)
    .attr('y', -10)
    .style('font-size', '16px')
    .style('font-weight', '600')
    .text('Medical Terms in Vector Space')
  
  // Create points
  const points = g.selectAll('.point')
    .data(vectorData)
    .enter()
    .append('g')
    .attr('class', 'point')
    .style('cursor', 'pointer')
  
  // Add circles
  points.append('circle')
    .attr('cx', d => xScale(d.x))
    .attr('cy', d => yScale(d.y))
    .attr('r', d => radiusScale(d.similarity))
    .attr('fill', d => categoryColors[d.category])
    .attr('stroke', '#333')
    .attr('stroke-width', 1)
    .attr('opacity', 0.8)
    .on('mouseover', function(event, d) {
      // Highlight point
      d3.select(this)
        .attr('stroke-width', 3)
        .attr('opacity', 1)
      
      // Show tooltip
      showTooltip(event, d)
    })
    .on('mouseout', function() {
      // Reset point
      d3.select(this)
        .attr('stroke-width', 1)
        .attr('opacity', 0.8)
      
      hideTooltip()
    })
  
  // Add labels
  points.append('text')
    .attr('x', d => xScale(d.x) + 15)
    .attr('y', d => yScale(d.y))
    .attr('dy', '0.35em')
    .style('font-size', '11px')
    .style('font-weight', '500')
    .style('fill', '#333')
    .style('pointer-events', 'none')
    .text(d => d.term)
  
  // Add cluster ellipses to show groupings
  const clusters = [
    { name: 'Diabetes', center: { x: 0.22, y: 0.32 }, points: vectorData.filter(d => 
      ['Diabetes', 'Insulin', 'Blood Sugar', 'Glucose', 'Pancreas'].includes(d.term)
    )},
    { name: 'Cardiovascular', center: { x: 0.79, y: 0.69 }, points: vectorData.filter(d => 
      ['Heart Disease', 'Cholesterol', 'Blood Pressure', 'Cardiovascular'].includes(d.term)
    )},
    { name: 'Oncology', center: { x: 0.31, y: 0.79 }, points: vectorData.filter(d => 
      ['Cancer', 'Tumor', 'Oncology', 'Chemotherapy'].includes(d.term)
    )},
    { name: 'Respiratory', center: { x: 0.69, y: 0.21 }, points: vectorData.filter(d => 
      ['Asthma', 'Lungs', 'Breathing'].includes(d.term)
    )}
  ]
  
  clusters.forEach(cluster => {
    if (cluster.points.length > 2) {
      // Calculate ellipse bounds
      const xCoords = cluster.points.map(d => d.x)
      const yCoords = cluster.points.map(d => d.y)
      const xRange = d3.max(xCoords) - d3.min(xCoords)
      const yRange = d3.max(yCoords) - d3.min(yCoords)
      
      g.append('ellipse')
        .attr('cx', xScale(cluster.center.x))
        .attr('cy', yScale(cluster.center.y))
        .attr('rx', xScale(xRange) * 0.8)
        .attr('ry', yScale(yRange) * 0.8)
        .attr('fill', 'none')
        .attr('stroke', '#ccc')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '5,5')
        .attr('opacity', 0.6)
      
      // Add cluster label
      g.append('text')
        .attr('x', xScale(cluster.center.x))
        .attr('y', yScale(cluster.center.y) - 20)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('font-weight', '600')
        .style('fill', '#666')
        .text(cluster.name)
    }
  })
  
  // Tooltip functions
  function showTooltip(event, d) {
    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('background', 'rgba(0,0,0,0.9)')
      .style('color', 'white')
      .style('padding', '8px 12px')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('z-index', 1000)
      .style('box-shadow', '0 2px 8px rgba(0,0,0,0.3)')
    
    tooltip.html(`
      <strong>${d.term}</strong><br>
      Category: ${d.category}<br>
      Position: (${d.x.toFixed(2)}, ${d.y.toFixed(2)})
    `)
    
    tooltip
      .style('left', (event.pageX + 10) + 'px')
      .style('top', (event.pageY - 10) + 'px')
  }
  
  function hideTooltip() {
    d3.selectAll('.tooltip').remove()
  }
}

// Sample data for visualizations
const sampleData = {
  embeddings: [
    { term: 'Diabetes', x: 0.2, y: 0.3, cluster: 'diseases' },
    { term: 'Insulin', x: 0.3, y: 0.4, cluster: 'treatments' },
    { term: 'Blood Sugar', x: 0.25, y: 0.35, cluster: 'symptoms' },
    { term: 'Heart Disease', x: 0.1, y: 0.2, cluster: 'diseases' },
    { term: 'Cholesterol', x: 0.15, y: 0.25, cluster: 'biomarkers' }
  ],
  ragFlow: [
    { step: 'Query', x: 0.1, y: 0.5 },
    { step: 'Retrieval', x: 0.3, y: 0.5 },
    { step: 'Generation', x: 0.5, y: 0.5 },
    { step: 'Response', x: 0.7, y: 0.5 }
  ],
  knowledgeGraph: [
    { id: 'diabetes', name: 'Diabetes', type: 'disease', x: 0.3, y: 0.3 },
    { id: 'insulin', name: 'Insulin', type: 'treatment', x: 0.5, y: 0.4 },
    { id: 'blood_sugar', name: 'Blood Sugar', type: 'symptom', x: 0.4, y: 0.6 },
    { id: 'pancreas', name: 'Pancreas', type: 'organ', x: 0.2, y: 0.5 }
  ],
  relationships: [
    { source: 'diabetes', target: 'insulin', type: 'treated_by' },
    { source: 'diabetes', target: 'blood_sugar', type: 'causes' },
    { source: 'diabetes', target: 'pancreas', type: 'affects' },
    { source: 'insulin', target: 'blood_sugar', type: 'regulates' }
  ]
}

// Visualization functions
const createEmbeddingsViz = () => {
  const svg = d3.select('#embeddings-viz')
    .append('svg')
    .attr('width', 600)
    .attr('height', 400)
    .style('border', '1px solid #ccc')

  const g = svg.append('g')
    .attr('transform', 'translate(50, 50)')

  // Create scales
  const xScale = d3.scaleLinear()
    .domain([0, 1])
    .range([0, 500])

  const yScale = d3.scaleLinear()
    .domain([0, 1])
    .range([300, 0])

  const colorScale = d3.scaleOrdinal()
    .domain(['diseases', 'treatments', 'symptoms', 'biomarkers'])
    .range(['#e74c3c', '#3498db', '#f39c12', '#9b59b6'])

  // Add points
  g.selectAll('circle')
    .data(sampleData.embeddings)
    .enter()
    .append('circle')
    .attr('cx', d => xScale(d.x))
    .attr('cy', d => yScale(d.y))
    .attr('r', 8)
    .attr('fill', d => colorScale(d.cluster))
    .attr('opacity', 0.7)

  // Add labels
  g.selectAll('text')
    .data(sampleData.embeddings)
    .enter()
    .append('text')
    .attr('x', d => xScale(d.x) + 12)
    .attr('y', d => yScale(d.y))
    .attr('dy', '0.35em')
    .text(d => d.term)
    .style('font-size', '12px')
    .style('fill', '#333')
}

// RAG visualization data
const ragDocument = {
  title: "Understanding Diabetes",
  paragraphs: [
    {
      text: "Diabetes is a chronic condition that affects how your body processes glucose. When you have diabetes, your pancreas either doesn't produce enough insulin or your cells don't respond properly to insulin. This causes blood sugar levels to rise, which can lead to serious health complications over time.",
      id: "p1",
      x: 0.2, y: 0.3,
      category: "definition"
    },
    {
      text: "The most common symptoms of diabetes include increased thirst, frequent urination, and unexplained weight loss. Some people also experience fatigue, blurred vision, and slow-healing wounds. Early detection and treatment are crucial for managing the condition effectively.",
      id: "p2", 
      x: 0.25, y: 0.35,
      category: "symptoms"
    },
    {
      text: "Treatment for diabetes typically involves lifestyle changes such as diet modification and regular exercise. Many patients also require medication like insulin injections or oral medications to control blood sugar levels. Regular monitoring and medical check-ups are essential for long-term health.",
      id: "p3",
      x: 0.3, y: 0.4,
      category: "treatment"
    }
  ],
  query: {
    text: "What are the symptoms of diabetes?",
    x: 0.24, y: 0.34,
    category: "query"
  }
}

// RAG visualization function
const createRAGViz = () => {
  const container = d3.select('#rag-viz')
  container.html('') // Clear existing content
  
  const width = 800
  const height = 600
  
  // Create main container
  const mainContainer = container.append('div')
    .style('width', width + 'px')
    .style('height', height + 'px')
    .style('position', 'relative')
    .style('background', 'white')
    .style('border-radius', '8px')
    .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)')
  
  // Step 1: Show complete document
  const documentView = mainContainer.append('div')
    .attr('class', 'document-view')
    .style('position', 'absolute')
    .style('top', '20px')
    .style('left', '20px')
    .style('right', '20px')
    .style('bottom', '20px')
    .style('padding', '20px')
    .style('background', '#f8f9fa')
    .style('border-radius', '8px')
    .style('border', '2px solid #e9ecef')
  
  // Add title
  documentView.append('h3')
    .style('margin', '0 0 20px 0')
    .style('color', '#333')
    .style('font-size', '18px')
    .style('font-weight', '600')
    .text(ragDocument.title)
  
  // Add paragraphs
  const paragraphsContainer = documentView.append('div')
    .attr('class', 'paragraphs')
  
  ragDocument.paragraphs.forEach((paragraph, index) => {
    const p = paragraphsContainer.append('p')
      .style('margin', '0 0 15px 0')
      .style('line-height', '1.6')
      .style('color', '#555')
      .style('font-size', '14px')
      .text(paragraph.text)
  })
  
  // Step 2: Create vector space (initially hidden)
  const vectorSpace = mainContainer.append('div')
    .attr('class', 'vector-space')
    .style('position', 'absolute')
    .style('top', '20px')
    .style('left', '20px')
    .style('right', '20px')
    .style('bottom', '20px')
    .style('opacity', '0')
    .style('pointer-events', 'none')
  
  // Create SVG for vector space
  const svg = vectorSpace.append('svg')
    .attr('width', width - 40)
    .attr('height', height - 40)
    .style('background', 'white')
    .style('border-radius', '8px')
    .style('border', '2px solid #e9ecef')
  
  const g = svg.append('g')
    .attr('transform', 'translate(40, 40)')
  
  // Create scales
  const xScale = d3.scaleLinear()
    .domain([0, 1])
    .range([0, width - 120])
  
  const yScale = d3.scaleLinear()
    .domain([0, 1])
    .range([height - 120, 0])
  
  // Add axes
  const xAxis = d3.axisBottom(xScale).ticks(5)
  const yAxis = d3.axisLeft(yScale).ticks(5)
  
  g.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${height - 120})`)
    .call(xAxis)
  
  g.append('g')
    .attr('class', 'y-axis')
    .call(yAxis)
  
  // Add title for vector space
  g.append('text')
    .attr('class', 'title')
    .attr('text-anchor', 'middle')
    .attr('x', (width - 120) / 2)
    .attr('y', -10)
    .style('font-size', '16px')
    .style('font-weight', '600')
    .text('Document Chunks in Vector Space')
  
  // Color scheme for categories
  const categoryColors = {
    definition: '#d32f2f',
    symptoms: '#1976d2', 
    treatment: '#388e3c',
    query: '#ff9800'
  }
  
  // Create document chunks (initially hidden)
  const chunks = g.selectAll('.chunk')
    .data(ragDocument.paragraphs)
    .enter()
    .append('g')
    .attr('class', 'chunk')
    .style('opacity', '0')
    .style('cursor', 'pointer')
  
  // Add circles for chunks
  chunks.append('circle')
    .attr('cx', d => xScale(d.x))
    .attr('cy', d => yScale(d.y))
    .attr('r', 8)
    .attr('fill', d => categoryColors[d.category])
    .attr('stroke', '#333')
    .attr('stroke-width', 2)
  
  // Add labels for chunks
  chunks.append('text')
    .attr('x', d => xScale(d.x) + 15)
    .attr('y', d => yScale(d.y))
    .attr('dy', '0.35em')
    .style('font-size', '11px')
    .style('font-weight', '500')
    .style('fill', '#333')
    .style('pointer-events', 'none')
    .text(d => `Chunk ${d.id}`)
  
  // Create query point (initially hidden)
  const queryGroup = g.append('g')
    .attr('class', 'query')
    .style('opacity', '0')
  
  // Add query marker (star shape)
  const starPoints = "0,8 2,2 8,2 3,-2 5,-8 0,-4 -5,-8 -3,-2 -8,2 -2,2"
  
  queryGroup.append('polygon')
    .attr('points', starPoints)
    .attr('fill', categoryColors.query)
    .attr('stroke', '#333')
    .attr('stroke-width', 2)
    .attr('transform', `translate(${xScale(ragDocument.query.x)}, ${yScale(ragDocument.query.y)})`)
  
  // Add query label
  queryGroup.append('text')
    .attr('x', xScale(ragDocument.query.x) + 20)
    .attr('y', yScale(ragDocument.query.y))
    .attr('dy', '0.35em')
    .style('font-size', '11px')
    .style('font-weight', '500')
    .style('fill', '#333')
    .style('pointer-events', 'none')
    .text('Query')
  
  // Add retrieval line (initially hidden)
  const retrievalLine = g.append('line')
    .attr('class', 'retrieval-line')
    .attr('x1', xScale(ragDocument.query.x))
    .attr('y1', yScale(ragDocument.query.y))
    .attr('x2', xScale(ragDocument.paragraphs[1].x)) // Connect to symptoms paragraph
    .attr('y2', yScale(ragDocument.paragraphs[1].y))
    .attr('stroke', '#ff5722')
    .attr('stroke-width', 3)
    .attr('stroke-dasharray', '5,5')
    .style('opacity', '0')
  
  // Animation sequence
  let currentStep = 0
  
  const animateStep = () => {
    switch(currentStep) {
      case 0:
        // Show document
        documentView.style('opacity', '1')
        break
        
      case 1:
        // Fade out document, show vector space
        documentView.style('opacity', '0')
        vectorSpace.style('opacity', '1')
        vectorSpace.style('pointer-events', 'auto')
        break
        
      case 2:
        // Show document chunks
        chunks.transition()
          .duration(1000)
          .style('opacity', '1')
        break
        
      case 3:
        // Show query
        queryGroup.transition()
          .duration(1000)
          .style('opacity', '1')
        break
        
      case 4:
        // Show retrieval line
        retrievalLine.transition()
          .duration(1000)
          .style('opacity', '1')
        
        // Highlight the retrieved chunk
        chunks.select('circle')
          .transition()
          .duration(500)
          .attr('r', 12)
          .attr('stroke-width', 4)
        break
    }
  }
  
  // Add step controls
  const controls = mainContainer.append('div')
    .style('position', 'absolute')
    .style('bottom', '20px')
    .style('left', '50%')
    .style('transform', 'translateX(-50%)')
    .style('display', 'flex')
    .style('gap', '10px')
  
  const stepLabels = [
    'Show Document',
    'Split into Chunks', 
    'Embed in Vector Space',
    'Add Query',
    'Show Retrieval'
  ]
  
  stepLabels.forEach((label, index) => {
    controls.append('button')
      .style('padding', '8px 16px')
      .style('background', index === currentStep ? '#1976d2' : '#e0e0e0')
      .style('color', index === currentStep ? 'white' : '#333')
      .style('border', 'none')
      .style('border-radius', '4px')
      .style('cursor', 'pointer')
      .style('font-size', '12px')
      .text(label)
      .on('click', () => {
        currentStep = index
        animateStep()
        
        // Update button styles
        controls.selectAll('button')
          .style('background', (d, i) => i === currentStep ? '#1976d2' : '#e0e0e0')
          .style('color', (d, i) => i === currentStep ? 'white' : '#333')
      })
  })
  
  // Add tooltips for chunks
  chunks.on('mouseover', function(event, d) {
    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('background', 'rgba(0,0,0,0.9)')
      .style('color', 'white')
      .style('padding', '8px 12px')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('z-index', 1000)
      .style('max-width', '300px')
    
    tooltip.html(`
      <strong>${d.id.toUpperCase()}</strong><br>
      Category: ${d.category}<br>
      ${d.text.substring(0, 100)}...
    `)
    
    tooltip
      .style('left', (event.pageX + 10) + 'px')
      .style('top', (event.pageY - 10) + 'px')
  })
  .on('mouseout', () => {
    d3.selectAll('.tooltip').remove()
  })
  
  // Initialize first step
  animateStep()
}

// Initialize visualizations when sections come into view
const initVisualizations = () => {
  createVectorPlot()
  createRAGViz()
}

// Scrollama setup
scroller
  .setup({
    step: '.step',
    offset: 0.5,
    debug: false
  })
  .onStepEnter(response => {
    const { element, index, direction } = response
    
    // Add active class to current step
    d3.selectAll('.step').classed('active', false)
    d3.select(element).classed('active', true)
    
    console.log(`Step ${index} entered`)
  })
  .onStepExit(response => {
    const { element, index, direction } = response
    console.log(`Step ${index} exited`)
  })

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initVisualizations()
  
  // Handle window resize
  window.addEventListener('resize', scroller.resize)
}) 