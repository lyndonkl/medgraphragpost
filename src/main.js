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
  
  const width = 1000
  const height = 600
  
  // Create main container
  const mainContainer = container.append('div')
    .style('width', width + 'px')
    .style('height', height + 'px')
    .style('position', 'relative')
    .style('background', 'white')
    .style('border-radius', '8px')
    .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)')
  
  // Create SVG for the entire visualization
  const svg = mainContainer.append('svg')
    .attr('width', width)
    .attr('height', height)
    .style('background', 'white')
    .style('border-radius', '8px')
  
  const g = svg.append('g')
    .attr('transform', 'translate(20, 20)')
  
  // Document area (left side)
  const documentArea = g.append('g')
    .attr('class', 'document-area')
    .attr('transform', 'translate(0, 0)')
  
  // Vector space area (right side)
  const vectorArea = g.append('g')
    .attr('class', 'vector-area')
    .attr('transform', `translate(${width - 400}, 0)`)
  
  // Document data with positions for chunks
  const documentData = {
    title: "Understanding Diabetes",
    chunks: [
      {
        id: "chunk1",
        text: "Diabetes is a chronic condition that affects how your body processes glucose. When you have diabetes, your pancreas either doesn't produce enough insulin or your cells don't respond properly to insulin.",
        category: "definition",
        // Document positions (left side)
        docX: 50,
        docY: 80,
        docWidth: 300,
        docHeight: 100,
        // Vector space positions (right side)
        vecX: 0.2,
        vecY: 0.3
      },
      {
        id: "chunk2", 
        text: "The most common symptoms of diabetes include increased thirst, frequent urination, and unexplained weight loss. Some people also experience fatigue, blurred vision, and slow-healing wounds.",
        category: "symptoms",
        docX: 50,
        docY: 200,
        docWidth: 300,
        docHeight: 100,
        vecX: 0.25,
        vecY: 0.35
      },
      {
        id: "chunk3",
        text: "Treatment for diabetes typically involves lifestyle changes such as diet modification and regular exercise. Many patients also require medication like insulin injections or oral medications.",
        category: "treatment", 
        docX: 50,
        docY: 320,
        docWidth: 300,
        docHeight: 100,
        vecX: 0.3,
        vecY: 0.4
      }
    ],
    query: {
      text: "What are the symptoms of diabetes?",
      category: "query",
      docX: 50,
      docY: 440,
      docWidth: 300,
      docHeight: 40,
      vecX: 0.24,
      vecY: 0.34
    }
  }
  
  // Color scheme
  const categoryColors = {
    definition: '#d32f2f',
    symptoms: '#1976d2',
    treatment: '#388e3c',
    query: '#ff9800'
  }
  
  // Function to wrap text for SVG
  const wrapText = (text, width, lineHeight = 16) => {
    const words = text.split(' ')
    const lines = []
    let currentLine = words[0]
    
    for (let i = 1; i < words.length; i++) {
      const word = words[i]
      const testLine = currentLine + ' ' + word
      // More accurate character width estimation (average 6.5px per character for 12px font)
      const testWidth = testLine.length * 6.5
      
      if (testWidth > width - 20) { // 20px padding
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    }
    lines.push(currentLine)
    
    return lines
  }
  
  // Scales for vector space
  const xScale = d3.scaleLinear()
    .domain([0, 1])
    .range([0, 350])
  
  const yScale = d3.scaleLinear()
    .domain([0, 1])
    .range([350, 0])
  
  // Step 1: Show document with title
  const title = documentArea.append('text')
    .attr('x', 0)
    .attr('y', 30)
    .style('font-size', '18px')
    .style('font-weight', '600')
    .style('fill', '#333')
    .style('opacity', 0)
    .text(documentData.title)
  
  // Step 2: Show document chunks with dashed rounded boxes
  const chunkGroups = documentArea.selectAll('.chunk-group')
    .data(documentData.chunks)
    .enter()
    .append('g')
    .attr('class', 'chunk-group')
    .attr('transform', d => `translate(${d.docX}, ${d.docY})`)
    .style('opacity', 0)
  
  // Add dashed rounded rectangles around chunks
  chunkGroups.append('rect')
    .attr('width', d => d.docWidth)
    .attr('height', d => d.docHeight)
    .attr('rx', 8)
    .attr('ry', 8)
    .attr('fill', 'none')
    .attr('stroke', d => categoryColors[d.category])
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', '5,5')
    .attr('opacity', 0.8)
  
  // Add chunk text
  // Add wrapped text lines
  chunkGroups.each(function(d) {
    const lines = wrapText(d.text, d.docWidth)
    const textGroup = d3.select(this)
    
    lines.forEach((line, i) => {
      textGroup.append('text')
        .attr('x', 10)
        .attr('y', 20 + (i * 16))
        .style('font-size', '12px')
        .style('fill', '#555')
        .style('pointer-events', 'none')
        .text(line)
    })
  })
  
  // Add chunk labels
  chunkGroups.append('text')
    .attr('x', d => d.docWidth - 10)
    .attr('y', 15)
    .attr('text-anchor', 'end')
    .style('font-size', '10px')
    .style('font-weight', '600')
    .style('fill', d => categoryColors[d.category])
    .style('pointer-events', 'none')
    .text(d => d.category.toUpperCase())
  
  // Step 3: Show query with dashed box
  const queryGroup = documentArea.append('g')
    .attr('class', 'query-group')
    .attr('transform', `translate(${documentData.query.docX}, ${documentData.query.docY})`)
    .style('opacity', 0)
  
  queryGroup.append('rect')
    .attr('width', documentData.query.docWidth)
    .attr('height', documentData.query.docHeight)
    .attr('rx', 8)
    .attr('ry', 8)
    .attr('fill', 'none')
    .attr('stroke', categoryColors.query)
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', '5,5')
    .attr('opacity', 0.8)
  
  queryGroup.append('text')
    .attr('x', 10)
    .attr('y', 25)
    .style('font-size', '12px')
    .style('fill', '#555')
    .style('pointer-events', 'none')
    .text(documentData.query.text)
  
  queryGroup.append('text')
    .attr('x', documentData.query.docWidth - 10)
    .attr('y', 15)
    .attr('text-anchor', 'end')
    .style('font-size', '10px')
    .style('font-weight', '600')
    .style('fill', categoryColors.query)
    .style('pointer-events', 'none')
    .text('QUERY')
  
  // Step 4: Create vector space background
  const vectorBackground = vectorArea.append('rect')
    .attr('width', 350)
    .attr('height', 350)
    .attr('fill', '#f8f9fa')
    .attr('stroke', '#e9ecef')
    .attr('stroke-width', 2)
    .attr('rx', 8)
    .attr('ry', 8)
  
  // Add vector space title
  vectorArea.append('text')
    .attr('x', 175)
    .attr('y', 25)
    .attr('text-anchor', 'middle')
    .style('font-size', '14px')
    .style('font-weight', '600')
    .style('fill', '#333')
    .text('Vector Space')
  
  // Add axes
  const xAxis = d3.axisBottom(xScale).ticks(5)
  const yAxis = d3.axisLeft(yScale).ticks(5)
  
  vectorArea.append('g')
    .attr('class', 'x-axis')
    .attr('transform', 'translate(0, 350)')
    .call(xAxis)
  
  vectorArea.append('g')
    .attr('class', 'y-axis')
    .call(yAxis)
  
  // Step 5: Create vector space circles (initially hidden)
  const vectorCircles = vectorArea.selectAll('.vector-circle')
    .data(documentData.chunks)
    .enter()
    .append('g')
    .attr('class', 'vector-circle')
    .style('opacity', 0)
  
  vectorCircles.append('circle')
    .attr('cx', d => xScale(d.vecX))
    .attr('cy', d => yScale(d.vecY))
    .attr('r', 8)
    .attr('fill', d => categoryColors[d.category])
    .attr('stroke', '#333')
    .attr('stroke-width', 2)
  
  vectorCircles.append('text')
    .attr('x', d => xScale(d.vecX) + 15)
    .attr('y', d => yScale(d.vecY))
    .attr('dy', '0.35em')
    .style('font-size', '10px')
    .style('font-weight', '500')
    .style('fill', '#333')
    .style('pointer-events', 'none')
    .text(d => d.category)
  
  // Step 6: Create query vector (initially hidden)
  const queryVector = vectorArea.append('g')
    .attr('class', 'query-vector')
    .style('opacity', 0)
  
  // Star shape for query
  const starPoints = "0,8 2,2 8,2 3,-2 5,-8 0,-4 -5,-8 -3,-2 -8,2 -2,2"
  
  queryVector.append('polygon')
    .attr('points', starPoints)
    .attr('fill', categoryColors.query)
    .attr('stroke', '#333')
    .attr('stroke-width', 2)
    .attr('transform', `translate(${xScale(documentData.query.vecX)}, ${yScale(documentData.query.vecY)})`)
  
  queryVector.append('text')
    .attr('x', xScale(documentData.query.vecX) + 20)
    .attr('y', yScale(documentData.query.vecY))
    .attr('dy', '0.35em')
    .style('font-size', '10px')
    .style('font-weight', '500')
    .style('fill', '#333')
    .style('pointer-events', 'none')
    .text('Query')
  
  // Step 7: Create retrieval line (initially hidden)
  const retrievalLine = vectorArea.append('line')
    .attr('class', 'retrieval-line')
    .attr('x1', xScale(documentData.query.vecX))
    .attr('y1', yScale(documentData.query.vecY))
    .attr('x2', xScale(documentData.chunks[1].vecX)) // Connect to symptoms chunk
    .attr('y2', yScale(documentData.chunks[1].vecY))
    .attr('stroke', '#ff5722')
    .attr('stroke-width', 3)
    .attr('stroke-dasharray', '5,5')
    .style('opacity', 0)
  
  // Animation sequence
  let currentStep = 0
  const totalSteps = 6
  let isPaused = false
  let animationTimeout = null
  
  const animateStep = () => {
    if (isPaused) return
    
    switch(currentStep) {
      case 0:
        // Show document title and chunks
        title.transition().duration(500).style('opacity', 1)
        chunkGroups.transition().duration(500).style('opacity', 1)
        break
        
      case 1:
        // Show query
        queryGroup.transition().duration(500).style('opacity', 1)
        break
        
      case 2:
        // Animate chunks moving to vector space
        chunkGroups.transition()
          .duration(1500)
          .ease(d3.easeCubicOut)
          .attr('transform', d => `translate(${width - 400 + xScale(d.vecX)}, ${yScale(d.vecY)}) scale(0.3)`)
          .style('opacity', 0.2)
        
        // Show vector circles
        vectorCircles.transition()
          .duration(1000)
          .delay(1500)
          .ease(d3.easeBackOut)
          .style('opacity', 1)
          .attr('transform', 'scale(0)')
          .transition()
          .duration(300)
          .attr('transform', 'scale(1)')
        break
        
      case 3:
        // Animate query moving to vector space
        queryGroup.transition()
          .duration(1500)
          .ease(d3.easeCubicOut)
          .attr('transform', `translate(${width - 400 + xScale(documentData.query.vecX)}, ${yScale(documentData.query.vecY)}) scale(0.3)`)
          .style('opacity', 0.2)
        
        // Show query vector
        queryVector.transition()
          .duration(1000)
          .delay(1500)
          .ease(d3.easeBackOut)
          .style('opacity', 1)
          .attr('transform', 'scale(0)')
          .transition()
          .duration(300)
          .attr('transform', 'scale(1)')
        break
        
      case 4:
        // Show retrieval line
        retrievalLine.transition()
          .duration(1000)
          .style('opacity', 1)
        break
        
      case 5:
        // Highlight the retrieved chunk
        vectorCircles.select('circle')
          .transition()
          .duration(500)
          .attr('r', 12)
          .attr('stroke-width', 4)
        break
    }
  }
  
  // Auto-advance animation
  const autoAdvance = () => {
    if (isPaused) return
    
    if (currentStep < totalSteps - 1) {
      currentStep++
      animateStep()
      animationTimeout = setTimeout(autoAdvance, 2500) // Wait 2.5 seconds between steps
    }
  }
  
  // Start animation sequence
  setTimeout(() => {
    animateStep()
    animationTimeout = setTimeout(autoAdvance, 1500)
  }, 1000)
  
  // Add pause/resume button
  const pauseResumeButton = mainContainer.append('button')
    .style('position', 'absolute')
    .style('bottom', '20px')
    .style('left', '20px')
    .style('padding', '8px 16px')
    .style('background', '#ff9800')
    .style('color', 'white')
    .style('border', 'none')
    .style('border-radius', '4px')
    .style('cursor', 'pointer')
    .style('font-size', '12px')
    .text('Pause')
    .on('click', () => {
      if (isPaused) {
        // Resume animation
        isPaused = false
        pauseResumeButton
          .style('background', '#ff9800')
          .text('Pause')
        
        // Continue from where we left off
        if (currentStep < totalSteps - 1) {
          animationTimeout = setTimeout(autoAdvance, 1000)
        }
      } else {
        // Pause animation
        isPaused = true
        pauseResumeButton
          .style('background', '#4caf50')
          .text('Resume')
        
        // Clear the timeout
        if (animationTimeout) {
          clearTimeout(animationTimeout)
          animationTimeout = null
        }
      }
    })
  
  // Add restart button
  const restartButton = mainContainer.append('button')
    .style('position', 'absolute')
    .style('bottom', '20px')
    .style('right', '20px')
    .style('padding', '8px 16px')
    .style('background', '#1976d2')
    .style('color', 'white')
    .style('border', 'none')
    .style('border-radius', '4px')
    .style('cursor', 'pointer')
    .style('font-size', '12px')
    .text('Restart Animation')
    .on('click', () => {
      // Reset all elements
      currentStep = 0
      isPaused = false
      
      // Clear any existing timeout
      if (animationTimeout) {
        clearTimeout(animationTimeout)
        animationTimeout = null
      }
      
      // Reset pause/resume button
      pauseResumeButton
        .style('background', '#ff9800')
        .text('Pause')
      
      // Reset document elements
      title.style('opacity', 0)
      chunkGroups.style('opacity', 0)
        .attr('transform', d => `translate(${d.docX}, ${d.docY})`)
      
      // Reset query
      queryGroup.style('opacity', 0)
        .attr('transform', `translate(${documentData.query.docX}, ${documentData.query.docY})`)
      
      // Reset vector elements
      vectorCircles.style('opacity', 0)
      queryVector.style('opacity', 0)
      retrievalLine.style('opacity', 0)
      
      // Reset circle sizes
      vectorCircles.select('circle')
        .attr('r', 8)
        .attr('stroke-width', 2)
      
      // Restart animation
      setTimeout(() => {
        animateStep()
        animationTimeout = setTimeout(autoAdvance, 1500)
      }, 1000)
    })
  
  // Add tooltips for vector circles
  vectorCircles.on('mouseover', function(event, d) {
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
      <strong>${d.category.toUpperCase()}</strong><br>
      ${d.text.substring(0, 100)}...
    `)
    
    tooltip
      .style('left', (event.pageX + 10) + 'px')
      .style('top', (event.pageY - 10) + 'px')
  })
  .on('mouseout', () => {
    d3.selectAll('.tooltip').remove()
  })
}

// Knowledge Graph Data
const knowledgeGraphData = {
  nodes: [
    { 
      id: 'diabetes', 
      name: 'Diabetes', 
      acronym: 'DM',
      type: 'disease', 
      x: 400, y: 200,
      properties: {
        'ICD-10': 'E11.9',
        'Prevalence': '9.3% of US population',
        'Type': 'Type 2 Diabetes Mellitus',
        'Risk Factors': 'Obesity, Family History, Age'
      }
    },
    { 
      id: 'metformin', 
      name: 'Metformin', 
      acronym: 'MET',
      type: 'drug', 
      x: 200, y: 150,
      properties: {
        'Generic Name': 'Metformin Hydrochloride',
        'Drug Class': 'Biguanide',
        'FDA Approval': '1994',
        'Mechanism': 'Reduces hepatic glucose production'
      }
    },
    { 
      id: 'insulin', 
      name: 'Insulin', 
      acronym: 'INS',
      type: 'drug', 
      x: 200, y: 250,
      properties: {
        'Generic Name': 'Human Insulin',
        'Drug Class': 'Hormone',
        'Administration': 'Subcutaneous injection',
        'Types': 'Rapid-acting, Long-acting, Mixed'
      }
    },
    { 
      id: 'glucose', 
      name: 'High Glucose', 
      acronym: 'HG',
      type: 'symptom', 
      x: 600, y: 150,
      properties: {
        'Normal Range': '70-140 mg/dL',
        'Diagnostic': '>200 mg/dL fasting',
        'Symptoms': 'Frequent urination, Thirst, Fatigue',
        'Measurement': 'Blood glucose test'
      }
    },
    { 
      id: 'kidney', 
      name: 'Kidney Disease', 
      acronym: 'CKD',
      type: 'disease', 
      x: 600, y: 250,
      properties: {
        'ICD-10': 'N18.9',
        'Stages': '1-5 (5 being end-stage)',
        'eGFR Threshold': '<60 mL/min/1.73m²',
        'Complications': 'Anemia, Bone disease, CVD'
      }
    },
    { 
      id: 'gastro', 
      name: 'GI Upset', 
      acronym: 'GI',
      type: 'symptom', 
      x: 100, y: 100,
      properties: {
        'Common Symptoms': 'Nausea, Diarrhea, Abdominal pain',
        'Onset': 'Usually within 1-2 weeks',
        'Management': 'Take with food, Gradual titration',
        'Frequency': 'Up to 30% of patients'
      }
    },
    { 
      id: 'monitoring', 
      name: 'Blood Tests', 
      acronym: 'BT',
      type: 'procedure', 
      x: 300, y: 350,
      properties: {
        'Test Type': 'HbA1c, Fasting glucose',
        'Frequency': 'Every 3-6 months',
        'Target HbA1c': '<7%',
        'Cost': '$20-50 per test'
      }
    },
    { 
      id: 'lifestyle', 
      name: 'Lifestyle Changes', 
      acronym: 'LC',
      type: 'treatment', 
      x: 500, y: 350,
      properties: {
        'Components': 'Diet, Exercise, Weight loss',
        'Efficacy': 'Can reduce HbA1c by 1-2%',
        'Recommendations': '150 min/week exercise',
        'Diet': 'Low-carb, Mediterranean'
      }
    }
  ],
  links: [
    { 
      source: 'metformin', 
      target: 'diabetes', 
      label: 'treats', 
      acronym: 'TRT',
      strength: 0.9,
      properties: {
        'Evidence Level': 'A (Strong)',
        'Dosage': '500-2550 mg daily',
        'Efficacy': 'Reduces HbA1c by 1-2%',
        'First Line': 'Yes, recommended first-line therapy'
      }
    },
    { 
      source: 'insulin', 
      target: 'diabetes', 
      label: 'treats', 
      acronym: 'TRT',
      strength: 0.9,
      properties: {
        'Evidence Level': 'A (Strong)',
        'Indication': 'When oral agents insufficient',
        'Dosage': 'Variable based on blood glucose',
        'Administration': 'Subcutaneous injection'
      }
    },
    { 
      source: 'diabetes', 
      target: 'glucose', 
      label: 'causes', 
      acronym: 'CAU',
      strength: 0.8,
      properties: {
        'Mechanism': 'Insulin resistance and deficiency',
        'Time Course': 'Chronic, progressive',
        'Reversibility': 'Partial with treatment',
        'Monitoring': 'Regular blood glucose checks'
      }
    },
    { 
      source: 'metformin', 
      target: 'gastro', 
      label: 'side effect', 
      acronym: 'SE',
      strength: 0.7,
      properties: {
        'Frequency': 'Up to 30% of patients',
        'Onset': 'Usually within 1-2 weeks',
        'Severity': 'Mild to moderate',
        'Management': 'Take with food, gradual titration'
      }
    },
    { 
      source: 'metformin', 
      target: 'kidney', 
      label: 'contraindicated in', 
      acronym: 'CI',
      strength: 0.6,
      properties: {
        'Threshold': 'eGFR <30 mL/min/1.73m²',
        'Risk': 'Lactic acidosis',
        'Alternative': 'Insulin or other agents',
        'Monitoring': 'Regular kidney function tests'
      }
    },
    { 
      source: 'diabetes', 
      target: 'kidney', 
      label: 'complicates', 
      acronym: 'CMP',
      strength: 0.8,
      properties: {
        'Mechanism': 'Hyperglycemia damages kidney vessels',
        'Prevalence': '20-40% of diabetic patients',
        'Prevention': 'Good glycemic control',
        'Screening': 'Annual urine albumin test'
      }
    },
    { 
      source: 'diabetes', 
      target: 'monitoring', 
      label: 'requires', 
      acronym: 'REQ',
      strength: 0.9,
      properties: {
        'Frequency': 'Every 3-6 months',
        'Tests': 'HbA1c, Fasting glucose, Kidney function',
        'Targets': 'HbA1c <7%, BP <140/90',
        'Cost': '$200-500 annually'
      }
    },
    { 
      source: 'lifestyle', 
      target: 'diabetes', 
      label: 'manages', 
      acronym: 'MNG',
      strength: 0.7,
      properties: {
        'Efficacy': 'Can reduce HbA1c by 1-2%',
        'Components': 'Diet, Exercise, Weight loss',
        'Sustainability': 'Long-term lifestyle changes',
        'Support': 'Diabetes education programs'
      }
    },
    { 
      source: 'monitoring', 
      target: 'glucose', 
      label: 'measures', 
      acronym: 'MSR',
      strength: 0.8,
      properties: {
        'Test Type': 'Blood glucose, HbA1c',
        'Accuracy': 'Laboratory standard',
        'Frequency': 'As needed for control',
        'Interpretation': 'Compare to target ranges'
      }
    }
  ]
}

// Node type colors
const nodeTypeColors = {
  disease: '#d32f2f',
  drug: '#1976d2',
  symptom: '#f57c00',
  procedure: '#7b1fa2',
  treatment: '#388e3c'
}

// Relationship type colors
const relationshipColors = {
  treats: '#388e3c',
  causes: '#d32f2f',
  'side effect': '#f57c00',
  'contraindicated in': '#d32f2f',
  complicates: '#d32f2f',
  requires: '#1976d2',
  manages: '#388e3c',
  measures: '#7b1fa2'
}

// Knowledge Graph Visualization
const createKnowledgeGraph = () => {
  const container = d3.select('#knowledge-graph-viz')
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
    .domain([0, 800])
    .range([0, width])
  
  const yScale = d3.scaleLinear()
    .domain([0, 500])
    .range([height, 0])
  
  // Create force simulation
  const simulation = d3.forceSimulation(knowledgeGraphData.nodes)
    .force('link', d3.forceLink(knowledgeGraphData.links).id(d => d.id).distance(100))
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(30))
  
  // Create arrow marker for links
  svg.append('defs').selectAll('marker')
    .data(['arrow'])
    .enter().append('marker')
    .attr('id', 'arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 25)
    .attr('refY', 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', '#666')
  
  // Create links
  const links = g.append('g')
    .selectAll('g')
    .data(knowledgeGraphData.links)
    .enter().append('g')
    .attr('class', 'link')
  
  // Add link lines
  links.append('line')
    .attr('stroke', d => relationshipColors[d.label] || '#666')
    .attr('stroke-width', d => d.strength * 3)
    .attr('stroke-opacity', 0.6)
    .attr('marker-end', 'url(#arrow)')
    .on('mouseover', function(event, d) {
      // Highlight link
      d3.select(this)
        .attr('stroke-width', d.strength * 5)
        .attr('stroke-opacity', 1)
      
      // Show link tooltip
      showLinkTooltip(event, d)
    })
    .on('mouseout', function(event, d) {
      // Reset link
      d3.select(this)
        .attr('stroke-width', d.strength * 3)
        .attr('stroke-opacity', 0.6)
      
      hideLinkTooltip()
    })
  
  // Add link labels (acronyms by default)
  links.append('text')
    .attr('dy', -5)
    .style('font-size', '10px')
    .style('font-weight', '500')
    .style('fill', '#333')
    .style('text-anchor', 'middle')
    .style('pointer-events', 'none')
    .text(d => d.acronym)
  
  // Create nodes
  const nodes = g.append('g')
    .selectAll('g')
    .data(knowledgeGraphData.nodes)
    .enter().append('g')
    .attr('class', 'node')
    .style('cursor', 'pointer')
    .call(d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended))
  
  // Add node circles
  nodes.append('circle')
    .attr('r', 20)
    .attr('fill', d => nodeTypeColors[d.type])
    .attr('stroke', '#333')
    .attr('stroke-width', 2)
    .attr('opacity', 0.8)
    .on('mouseover', function(event, d) {
      // Highlight node
      d3.select(this)
        .attr('stroke-width', 4)
        .attr('opacity', 1)
      
      // Highlight connected links
      g.selectAll('.link line')
        .attr('stroke-opacity', link => 
          link.source.id === d.id || link.target.id === d.id ? 1 : 0.2
        )
      
      // Hide acronyms on hover
      g.selectAll('.link text')
        .style('opacity', 0.3)
      
      // Show node tooltip
      showGraphTooltip(event, d)
    })
    .on('mouseout', function() {
      // Reset node
      d3.select(this)
        .attr('stroke-width', 2)
        .attr('opacity', 0.8)
      
      // Reset links
      g.selectAll('.link line')
        .attr('stroke-opacity', 0.6)
      
      // Show acronyms again
      g.selectAll('.link text')
        .style('opacity', 1)
      
      hideGraphTooltip()
    })
  
  // Add node acronym labels
  nodes.append('text')
    .attr('dy', '0.35em')
    .style('font-size', '11px')
    .style('font-weight', '600')
    .style('fill', 'white')
    .style('text-anchor', 'middle')
    .style('pointer-events', 'none')
    .text(d => d.acronym)
  
  // Update positions on simulation tick
  simulation.on('tick', () => {
    links.select('line')
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y)
    
    links.select('text')
      .attr('x', d => (d.source.x + d.target.x) / 2)
      .attr('y', d => (d.source.y + d.target.y) / 2)
    
    nodes.attr('transform', d => `translate(${d.x},${d.y})`)
  })
  
  // Drag functions
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart()
    d.fx = d.x
    d.fy = d.y
  }
  
  function dragged(event, d) {
    d.fx = event.x
    d.fy = event.y
  }
  
  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0)
    d.fx = null
    d.fy = null
  }
  
  // Tooltip functions
  function showGraphTooltip(event, d) {
    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
    
    tooltip.transition()
      .duration(200)
      .style('opacity', 1)
    
    // Create properties HTML
    const propertiesHtml = Object.entries(d.properties)
      .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
      .join('<br/>')
    
    tooltip.html(`
      <strong>${d.name}</strong> (${d.acronym})<br/>
      Type: ${d.type}<br/>
      Connections: ${knowledgeGraphData.links.filter(l => 
        l.source.id === d.id || l.target.id === d.id
      ).length}<br/><br/>
      <strong>Properties:</strong><br/>
      ${propertiesHtml}
    `)
      .style('left', (event.pageX + 10) + 'px')
      .style('top', (event.pageY - 10) + 'px')
  }
  
  function showLinkTooltip(event, d) {
    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
    
    tooltip.transition()
      .duration(200)
      .style('opacity', 1)
    
    // Create properties HTML
    const propertiesHtml = Object.entries(d.properties)
      .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
      .join('<br/>')
    
    tooltip.html(`
      <strong>${d.label}</strong> (${d.acronym})<br/>
      From: ${d.source.name} → To: ${d.target.name}<br/>
      Strength: ${d.strength}<br/><br/>
      <strong>Properties:</strong><br/>
      ${propertiesHtml}
    `)
      .style('left', (event.pageX + 10) + 'px')
      .style('top', (event.pageY - 10) + 'px')
  }
  
  function hideGraphTooltip() {
    d3.selectAll('.tooltip').remove()
  }
  
  function hideLinkTooltip() {
    d3.selectAll('.tooltip').remove()
  }
  
  // Add legend
  const legend = svg.append('g')
    .attr('transform', `translate(${width - 150}, 20)`)
  
  // Node type legend
  const nodeTypes = Object.keys(nodeTypeColors)
  nodeTypes.forEach((type, i) => {
    const legendItem = legend.append('g')
      .attr('transform', `translate(0, ${i * 25})`)
    
    legendItem.append('circle')
      .attr('r', 8)
      .attr('fill', nodeTypeColors[type])
      .attr('stroke', '#333')
      .attr('stroke-width', 1)
    
    legendItem.append('text')
      .attr('x', 15)
      .attr('dy', '0.35em')
      .style('font-size', '10px')
      .style('fill', '#333')
      .text(type)
  })
  
  // Add title
  g.append('text')
    .attr('class', 'title')
    .attr('text-anchor', 'middle')
    .attr('x', width / 2)
    .attr('y', -10)
    .style('font-size', '16px')
    .style('font-weight', '600')
    .text('Medical Knowledge Graph')
}

// Slide navigation functionality
const slideStates = {
  'embeddings': 0,
  'smarter-chunking': 0,
  'advanced-retrieval': 0,
  'contextual-refinements': 0,
  'external-tools': 0,
  'knowledge-graphs-intro': 0,
  'graphrag-approaches': 0,
  'graphrag-advantages': 0,
  'medgraphrag-intro': 0,
  'graph-construction': 0
}

const slideCounts = {
  'embeddings': 3,
  'smarter-chunking': 4,
  'advanced-retrieval': 3,
  'contextual-refinements': 4,
  'external-tools': 5,
  'knowledge-graphs-intro': 4,
  'graphrag-approaches': 4,
  'graphrag-advantages': 4,
  'medgraphrag-intro': 3,
  'graph-construction': 3
}

// Update slideCounts for graph-construction to 3
slideCounts['graph-construction'] = 3;

// Add slideCounts for graph-tagging (removed - not needed for single section)

// Patch changeSlide to transition to overall-graph-structure after last graph-construction slide
const originalChangeSlideFn = changeSlide;
window.changeSlide = function(sectionName, direction) {
  // If we're on the last graph-construction slide and click next, go to overall-graph-structure
  if (sectionName === 'graph-construction') {
    const currentSlide = slideStates[sectionName];
    const totalSlides = slideCounts[sectionName];
    if (currentSlide === totalSlides - 1 && direction === 1) {
      // Hide all graph-construction slides
      for (let i = 0; i < totalSlides; i++) {
        const slideElement = document.getElementById(`${sectionName}-${i + 1}`);
        if (slideElement) slideElement.style.display = 'none';
      }
      // Show the overall graph structure section
      showSection('overall-graph-structure');
      return;
    }
  }
  
  // Note: graph-tagging is now a scrolly section, not slide-based
  
  // Otherwise, normal behavior
  originalChangeSlideFn(sectionName, direction);
}

// Patch updateProgressDots to only show 3 dots for graph-construction
const originalUpdateProgressDots = updateProgressDots;
window.updateProgressDots = function(sectionName, currentSlide) {
  if (sectionName === 'graph-construction') {
    // Only show 3 dots
    const slideElement = document.getElementById(`${sectionName}-${currentSlide + 1}`);
    if (!slideElement) return;
    const dots = slideElement.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
      if (index < 3) {
        dot.style.display = '';
        dot.classList.toggle('active', index === currentSlide);
      } else {
        dot.style.display = 'none';
      }
    });
    return;
  }
  originalUpdateProgressDots(sectionName, currentSlide);
}

// Patch updateNavigationButtons to disable next on last slide for graph-construction
const originalUpdateNavigationButtons = updateNavigationButtons;
window.updateNavigationButtons = function(sectionName, currentSlide, totalSlides) {
  if (sectionName === 'graph-construction') {
    const slideElement = document.getElementById(`${sectionName}-${currentSlide + 1}`);
    if (!slideElement) return;
    const prevBtn = slideElement.querySelector('.prev-btn');
    const nextBtn = slideElement.querySelector('.next-btn');
    if (prevBtn) prevBtn.disabled = currentSlide === 0;
    if (nextBtn) nextBtn.disabled = currentSlide === totalSlides - 1;
    return;
  }
  originalUpdateNavigationButtons(sectionName, currentSlide, totalSlides);
}

function changeSlide(sectionName, direction) {
  const currentSlide = slideStates[sectionName]
  const totalSlides = slideCounts[sectionName]
  
  let newSlide = currentSlide + direction
  
  // Handle boundaries
  if (newSlide < 0) newSlide = 0
  if (newSlide >= totalSlides) newSlide = totalSlides - 1
  
  // Update state
  slideStates[sectionName] = newSlide
  
  // Hide all slides for this section
  for (let i = 0; i < totalSlides; i++) {
    const slideElement = document.getElementById(`${sectionName}-${i + 1}`)
    if (slideElement) {
      slideElement.style.display = 'none'
    }
  }
  
  // Show the new slide
  const newSlideElement = document.getElementById(`${sectionName}-${newSlide + 1}`)
  if (newSlideElement) {
    newSlideElement.style.display = 'flex'
  }
  
  // Update progress dots
  updateProgressDots(sectionName, newSlide)
  
  // Update navigation buttons
  updateNavigationButtons(sectionName, newSlide, totalSlides)
}

function updateProgressDots(sectionName, currentSlide) {
  const slideElement = document.getElementById(`${sectionName}-${currentSlide + 1}`)
  if (!slideElement) return
  
  const dots = slideElement.querySelectorAll('.dot')
  dots.forEach((dot, index) => {
    if (index === currentSlide) {
      dot.classList.add('active')
    } else {
      dot.classList.remove('active')
    }
  })
}

function updateNavigationButtons(sectionName, currentSlide, totalSlides) {
  const slideElement = document.getElementById(`${sectionName}-${currentSlide + 1}`)
  if (!slideElement) return
  
  const prevBtn = slideElement.querySelector('.prev-btn')
  const nextBtn = slideElement.querySelector('.next-btn')
  
  if (prevBtn) {
    prevBtn.disabled = currentSlide === 0
  }
  
  if (nextBtn) {
    nextBtn.disabled = currentSlide === totalSlides - 1
  }
}

// === Entity Extraction Animation for Graph Construction Slide ===

const entityExtractionData = {
  nodes: [
    // Chunk A
    { id: 'covid19', label: 'Covid-19', acronym: 'CoV', type: 'disease', chunk: 'A', context: 'Covid-19 is a respiratory disease that can cause severe illness in some patients.' },
    { id: 'remdesivir', label: 'Remdesivir', acronym: 'Rem', type: 'drug', chunk: 'A', context: 'Remdesivir is an antiviral drug used to treat Covid-19 and has shown some effectiveness.' },
    { id: 'respiratory', label: 'Respiratory diseases', acronym: 'Res', type: 'disease', chunk: 'A', context: 'Respiratory diseases like Covid-19 may require antiviral and anti-inflammatory treatments.' },
    // Chunk B
    { id: 'glucocorticoids', label: 'Glucocorticoids', acronym: 'Glu', type: 'hormone', chunk: 'B', context: 'Glucocorticoids are hormones that help reduce inflammation in the body.' },
    { id: 'dexamethasone', label: 'Dexamethasone', acronym: 'Dex', type: 'drug', chunk: 'B', context: 'Dexamethasone is a pharmacologic substance classified as a glucocorticoid.' }
  ],
  links: [
    { source: 'remdesivir', target: 'covid19', label: 'treats' },
    { source: 'covid19', target: 'respiratory', label: 'is a' },
    { source: 'dexamethasone', target: 'glucocorticoids', label: 'is a' }
  ]
};

// Question Answering Data
const questionAnsweringData = {
  question: {
    text: "What are the treatment options for Covid-19?",
    extractedTags: [
      { type: 'DISEASE', value: 'Covid-19', description: 'The disease being asked about' },
      { type: 'TREATMENT_TYPE', value: 'Options', description: 'Looking for treatment alternatives' },
      { type: 'QUERY_TYPE', value: 'Treatment', description: 'Question is about therapeutic approaches' }
    ]
  },
  searchPath: [
    { level: 'level2', nodeId: 'meta3', reason: 'Medical Therapeutics covers treatment approaches' },
    { level: 'level1', nodeId: 'meta1', reason: 'Infectious Disease Management includes Covid-19 treatments' },
    { level: 'chunks', nodeId: 'chunkA', reason: 'Infectious Disease & Treatment chunk contains Covid-19 treatment info' }
  ],
  result: {
    chunkId: 'chunkA',
    relevantTags: [
      { type: 'MEDICATION', value: 'Remdesivir', description: 'Antiviral drug for Covid-19 treatment' },
      { type: 'TREATMENT_TYPE', value: 'Antiviral therapy', description: 'Medication targeting viral replication' }
    ],
    answer: "Based on the retrieved information, treatment options for Covid-19 include antiviral therapy with medications like Remdesivir, which has shown effectiveness in treating the disease."
  },
  // Enhanced answer refinement data
  answerRefinement: {
    chunkLevel: {
      answer: "Treatment options for Covid-19 include Remdesivir (antiviral drug) and respiratory disease management approaches.",
      graphNodes: ['covid19', 'remdesivir', 'respiratory'],
      graphLinks: [
        { source: 'remdesivir', target: 'covid19', label: 'treats' },
        { source: 'covid19', target: 'respiratory', label: 'is a' }
      ]
    },
    level1: {
      answer: "Infectious disease management approaches include antiviral therapy and respiratory medicine treatments.",
      metaTags: ['DISEASE_CATEGORY', 'TREATMENT_APPROACH', 'CLINICAL_FOCUS']
    },
    level2: {
      answer: "Clinical therapeutics for disease management involve treatment optimization and patient care approaches.",
      metaTags: ['MEDICAL_DOMAIN', 'PATIENT_CARE', 'HEALTHCARE_FOCUS']
    }
  }
};

// Graph Tagging Data
const graphTaggingData = {
  chunks: {
    chunkA: {
      id: 'chunkA',
      name: 'Infectious Disease & Treatment',
      color: '#ff6b6b',
      tags: [
        { type: 'DISEASE', value: 'Covid-19', description: 'Respiratory disease causing severe illness' },
        { type: 'MEDICATION', value: 'Remdesivir', description: 'Antiviral drug for Covid-19 treatment' },
        { type: 'SYMPTOM', value: 'Respiratory distress', description: 'Difficulty breathing and lung complications' },
        { type: 'TREATMENT_TYPE', value: 'Antiviral therapy', description: 'Medication targeting viral replication' },
        { type: 'BODY_SYSTEM', value: 'Respiratory system', description: 'Lungs and breathing apparatus' }
      ]
    },
    chunkB: {
      id: 'chunkB', 
      name: 'Hormones & Pharmacology',
      color: '#4ecdc4',
      tags: [
        { type: 'MEDICATION_CLASS', value: 'Glucocorticoids', description: 'Hormones that reduce inflammation' },
        { type: 'MEDICATION', value: 'Dexamethasone', description: 'Specific glucocorticoid medication' },
        { type: 'BODY_FUNCTION', value: 'Inflammation regulation', description: 'Control of inflammatory responses' },
        { type: 'PHARMACOLOGY', value: 'Anti-inflammatory', description: 'Medication mechanism of action' },
        { type: 'HORMONE_TYPE', value: 'Steroid hormones', description: 'Class of hormone medications' }
      ]
    }
  },
  metaTags: {
    level1: [
      {
        id: 'meta1',
        name: 'Infectious Disease Management',
        color: '#ff6b6b',
        children: ['chunkA'],
        tags: [
          { type: 'DISEASE_CATEGORY', value: 'Infectious diseases', description: 'Diseases caused by pathogens' },
          { type: 'TREATMENT_APPROACH', value: 'Antiviral therapy', description: 'Targeted treatment for viral infections' },
          { type: 'CLINICAL_FOCUS', value: 'Respiratory medicine', description: 'Specialized care for breathing disorders' }
        ]
      },
      {
        id: 'meta2',
        name: 'Endocrinology & Pharmacology',
        color: '#4ecdc4',
        children: ['chunkB'],
        tags: [
          { type: 'MEDICAL_SPECIALTY', value: 'Endocrinology', description: 'Study of hormones and metabolism' },
          { type: 'DRUG_CLASS', value: 'Steroid medications', description: 'Hormone-based pharmaceutical agents' },
          { type: 'THERAPEUTIC_GOAL', value: 'Inflammation control', description: 'Managing inflammatory responses' }
        ]
      }
    ],
    level2: [
      {
        id: 'meta3',
        name: 'Medical Therapeutics',
        color: '#45b7d1',
        children: ['meta1', 'meta2'],
        tags: [
          { type: 'MEDICAL_DOMAIN', value: 'Clinical therapeutics', description: 'Application of medical treatments' },
          { type: 'PATIENT_CARE', value: 'Disease management', description: 'Comprehensive treatment approaches' },
          { type: 'HEALTHCARE_FOCUS', value: 'Treatment optimization', description: 'Improving patient outcomes' }
        ]
      }
    ]
  }
};

const entityNodeTypeColors = {
  disease: '#1976d2',
  drug: '#d32f2f',
  hormone: '#7b1fa2'
};

let entityAnimationState = {
  playing: false,
  paused: false,
  currentStep: 0,
  nodeTransitions: [],
  linkTransitions: []
};

function setupEntityGraphControls() {
  console.log('setupEntityGraphControls called');
  const controls = d3.select('#entity-graph-controls');
  controls.html('');
  
  const playBtn = controls.append('button')
    .attr('id', 'entity-play-btn')
    .text('Play')
    .style('padding', '8px 18px')
    .style('background', '#1976d2')
    .style('color', 'white')
    .style('border', 'none')
    .style('border-radius', '4px')
    .style('font-size', '14px')
    .style('cursor', 'pointer')
    .on('click', () => {
      if (!entityAnimationState.playing) {
        animateEntityExtraction();
      } else if (entityAnimationState.paused) {
        resumeEntityExtraction();
      }
    });

  const pauseBtn = controls.append('button')
    .attr('id', 'entity-pause-btn')
    .text('Pause')
    .style('padding', '8px 18px')
    .style('background', '#888')
    .style('color', 'white')
    .style('border', 'none')
    .style('border-radius', '4px')
    .style('font-size', '14px')
    .style('cursor', 'pointer')
    .on('click', () => {
      pauseEntityExtraction();
    });

  const restartBtn = controls.append('button')
    .attr('id', 'entity-restart-btn')
    .text('Restart')
    .style('padding', '8px 18px')
    .style('background', '#43a047')
    .style('color', 'white')
    .style('border', 'none')
    .style('border-radius', '4px')
    .style('font-size', '14px')
    .style('cursor', 'pointer')
    .on('click', () => {
      animateEntityExtraction();
    });
}

function animateEntityExtraction() {
  console.log('animateEntityExtraction called');
  entityAnimationState.playing = true;
  entityAnimationState.paused = false;
  entityAnimationState.currentStep = 0;
  entityAnimationState.nodeTransitions = [];
  entityAnimationState.linkTransitions = [];

  const svg = d3.select('#entity-graph-svg');
  console.log('SVG selection:', svg.node());
  svg.selectAll('*').remove();

  const width = +svg.attr('width');
  const height = +svg.attr('height');
  console.log('SVG width/height:', width, height);

  // Layout positions for nodes (centered)
  const nodePositions = {
    covid19: { x: 120, y: 120 },
    remdesivir: { x: 240, y: 80 },
    respiratory: { x: 240, y: 180 },
    glucocorticoids: { x: 120, y: 300 },
    dexamethasone: { x: 240, y: 320 }
  };

  // Initial X for animation (off to the left)
  const startX = -80;

  // Animate nodes flying in from the left
  const nodes = svg.selectAll('.entity-node')
    .data(entityExtractionData.nodes)
    .enter()
    .append('g')
    .attr('class', 'entity-node')
    .attr('transform', d => `translate(${startX},${nodePositions[d.id].y})`)
    .attr('opacity', 0)
    .on('mouseover', function(event, d) {
      showNodeTooltip(event, d);
    })
    .on('mouseout', function() {
      hideTooltip();
    });

  nodes.append('circle')
    .attr('r', 26)
    .attr('fill', d => entityNodeTypeColors[d.type] || '#aaa')
    .attr('stroke', '#333')
    .attr('stroke-width', 2);

  // Show only acronym as main label
  nodes.append('text')
    .attr('text-anchor', 'middle')
    .attr('y', 6)
    .attr('fill', '#fff')
    .attr('font-size', 18)
    .attr('font-weight', 700)
    .text(d => d.acronym);

  // Animate in sequence
  let finishedNodes = 0;
  nodes.each(function(d, i) {
    const node = d3.select(this);
    const t = node.transition()
      .delay(i * 300)
      .duration(700)
      .attr('transform', `translate(${nodePositions[d.id].x},${nodePositions[d.id].y})`)
      .attr('opacity', 1)
      .on('end', () => {
        finishedNodes++;
        if (finishedNodes === entityExtractionData.nodes.length) {
          drawLinks();
        }
      });
    entityAnimationState.nodeTransitions.push(t);
  });

  // Draw links (edges) after nodes appear
  function drawLinks() {
    const links = svg.selectAll('.link')
      .data(entityExtractionData.links)
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('x1', d => nodePositions[d.source].x)
      .attr('y1', d => nodePositions[d.source].y)
      .attr('x2', d => nodePositions[d.target].x)
      .attr('y2', d => nodePositions[d.target].y)
      .attr('stroke', '#888')
      .attr('stroke-width', 2)
      .attr('opacity', 0)
      .on('mouseover', function(event, d) {
        showEdgeTooltip(event, d);
      })
      .on('mouseout', function() {
        hideTooltip();
      });

    links.transition()
      .delay((d, i) => 800 + i * 200)
      .duration(400)
      .attr('opacity', 1);

    // Add edge labels (smaller, neat font)
    const labels = svg.selectAll('.link-label')
      .data(entityExtractionData.links)
      .enter()
      .append('text')
      .attr('class', 'link-label')
      .attr('x', d => (nodePositions[d.source].x + nodePositions[d.target].x) / 2)
      .attr('y', d => (nodePositions[d.source].y + nodePositions[d.target].y) / 2 - 10)
      .attr('text-anchor', 'middle')
      .attr('fill', '#555')
      .attr('font-size', 13)
      .attr('font-weight', 500)
      .attr('opacity', 0)
      .text(d => d.label)
      .on('mouseover', function(event, d) {
        showEdgeTooltip(event, d);
      })
      .on('mouseout', function() {
        hideTooltip();
      });

    labels.transition()
      .delay((d, i) => 1000 + i * 200)
      .duration(400)
      .attr('opacity', 1);
  }
}

// Tooltip helpers
function showNodeTooltip(event, d) {
  hideTooltip();
  const tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('position', 'absolute')
    .style('background', 'rgba(0,0,0,0.92)')
    .style('color', 'white')
    .style('padding', '10px 16px')
    .style('border-radius', '6px')
    .style('font-size', '14px')
    .style('pointer-events', 'none')
    .style('z-index', 1000)
    .style('box-shadow', '0 2px 8px rgba(0,0,0,0.3)');
  tooltip.html(`
    <div><strong>Name:</strong> ${d.label}</div>
    <div><strong>Type:</strong> ${d.type.charAt(0).toUpperCase() + d.type.slice(1)}</div>
    <div style="margin-top: 6px;"><strong>Context:</strong><br/><span style="font-style: italic; color: #b3e5fc;">"${d.context}"</span></div>
  `)
    .style('left', (event.pageX + 12) + 'px')
    .style('top', (event.pageY - 10) + 'px');
}

function showEdgeTooltip(event, link, src, tgt) {
  hideTooltip();
  const tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('position', 'absolute')
    .style('background', 'rgba(0,0,0,0.92)')
    .style('color', 'white')
    .style('padding', '10px 16px')
    .style('border-radius', '6px')
    .style('font-size', '14px')
    .style('pointer-events', 'none')
    .style('z-index', 1000)
    .style('box-shadow', '0 2px 8px rgba(0,0,0,0.3)');
  tooltip.html(`
    <div><strong>Relationship:</strong> ${link.label || ''}</div>
    <div><strong>Source:</strong> ${(src && (src.name || src.label)) || ''}</div>
    <div><strong>Target:</strong> ${(tgt && (tgt.name || tgt.label)) || ''}</div>
  `)
    .style('left', (event.pageX + 12) + 'px')
    .style('top', (event.pageY - 10) + 'px');
}

function hideTooltip() {
  d3.selectAll('.tooltip').remove();
}

// Hook into slide navigation to set up controls (but do not auto-play)
const originalChangeSlide = changeSlide;
window.changeSlide = function(sectionName, direction) {
  console.log('window.changeSlide called', sectionName, direction, slideStates[sectionName]);
  originalChangeSlide(sectionName, direction);
  if (sectionName === 'graph-construction' && slideStates[sectionName] === 2) {
    setupEntityGraphControls();
  }
};

// Add a MutationObserver to watch for the entity extraction slide becoming visible
const entitySlide = document.getElementById('graph-construction-3');
if (entitySlide) {
  const observer = new MutationObserver(() => {
    const style = window.getComputedStyle(entitySlide);
    if (style.display !== 'none') {
      setupEntityGraphControls();
    }
  });
  observer.observe(entitySlide, { attributes: true, attributeFilter: ['style'] });
}

// Initialize slide navigation
function initSlideNavigation() {
  // Add click handlers to all progress dots
  document.querySelectorAll('.dot').forEach(dot => {
    dot.addEventListener('click', function() {
      const slideIndex = parseInt(this.getAttribute('data-slide'))
      const sectionName = this.closest('.slide-section').id.replace(/-[0-9]+$/, '')
      
      // Update state
      slideStates[sectionName] = slideIndex
      
      // Hide all slides for this section
      const totalSlides = slideCounts[sectionName]
      for (let i = 0; i < totalSlides; i++) {
        const slideElement = document.getElementById(`${sectionName}-${i + 1}`)
        if (slideElement) {
          slideElement.style.display = 'none'
        }
      }
      
      // Show the selected slide
      const selectedSlideElement = document.getElementById(`${sectionName}-${slideIndex + 1}`)
      if (selectedSlideElement) {
        selectedSlideElement.style.display = 'flex'
      }
      
      // Update progress dots
      updateProgressDots(sectionName, slideIndex)
      
      // Update navigation buttons
      updateNavigationButtons(sectionName, slideIndex, totalSlides)
    })
  })
  
  // Initialize all slides to show first slide only
  Object.keys(slideCounts).forEach(sectionName => {
    const totalSlides = slideCounts[sectionName]
    for (let i = 0; i < totalSlides; i++) {
      const slideElement = document.getElementById(`${sectionName}-${i + 1}`)
      if (slideElement) {
        slideElement.style.display = i === 0 ? 'flex' : 'none'
      }
    }
  })
}

const initVisualizations = () => {
  createVectorPlot()
  createRAGViz()
  createKnowledgeGraph()
  
  // Setup entity extraction controls when the slide becomes visible
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
        const target = mutation.target;
        if (target.id === 'graph-construction-3' && target.style.display !== 'none') {
          console.log('Graph construction slide 3 is now visible, setting up controls');
          setupEntityGraphControls();
          animateEntityExtraction();
        }
        // Note: graph-tagging is now handled by Scrollama onStepEnter
      }
    });
  });
  
  // Start observing the graph construction slide
  const graphConstructionSlide = document.getElementById('graph-construction-3');
  if (graphConstructionSlide) {
    observer.observe(graphConstructionSlide, { attributes: true });
  }
  
  // Note: graph-tagging is now handled by Scrollama onStepEnter
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
    // Render overall graph structure if this section is entered
    if (element.id === 'overall-graph-structure') {
      renderOverallGraphStructure();
    }
    // Render graph tagging visualization if this section is entered
    if (element.id === 'graph-tagging') {
      createGraphTaggingViz();
      setupGraphTaggingControls();
    }
    // Render question answering visualization if this section is entered
    if (element.id === 'question-answering') {
      createQuestionAnsweringViz();
      setupQuestionAnsweringControls();
    }
    console.log(`Step ${index} entered`)
  })
  .onStepExit(response => {
    const { element, index, direction } = response
    console.log(`Step ${index} exited`)
  })

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initVisualizations()
  initSlideNavigation() // Initialize slide navigation
  
  // Handle window resize
  window.addEventListener('resize', scroller.resize)
}) 

// === Overall Graph Structure Visualization ===

const overallGraphData = {
  layers: [
    {
      id: 'ehr',
      label: 'EHR Data',
      color: '#ff7043',
      y: 120,
      patients: [
        {
          id: 'Patient-001',
          nodes: [
            { id: 'p1', label: 'Patient-001', type: 'patient', age: 58, sex: 'F' },
            { id: 'p1-diabetes', label: 'Type 2 Diabetes', type: 'diagnosis' },
            { id: 'p1-hypertension', label: 'Hypertension', type: 'diagnosis' },
            { id: 'p1-metformin', label: 'Metformin', type: 'medication' },
            { id: 'p1-lisinopril', label: 'Lisinopril', type: 'medication' },
            { id: 'p1-hba1c', label: 'HbA1c: 8.2%', type: 'lab' },
            { id: 'p1-creatinine', label: 'Creatinine: 1.1', type: 'lab' },
            { id: 'p1-admission', label: 'Admission 2024-05-01', type: 'encounter', date: '2024-05-01' }
          ],
          links: [
            { source: 'p1', target: 'p1-diabetes', label: 'has diagnosis' },
            { source: 'p1', target: 'p1-hypertension', label: 'has diagnosis' },
            { source: 'p1', target: 'p1-metformin', label: 'prescribed' },
            { source: 'p1', target: 'p1-lisinopril', label: 'prescribed' },
            { source: 'p1', target: 'p1-hba1c', label: 'lab result' },
            { source: 'p1', target: 'p1-creatinine', label: 'lab result' },
            { source: 'p1', target: 'p1-admission', label: 'had encounter' }
          ]
        },
        {
          id: 'Patient-002',
          nodes: [
            { id: 'p2', label: 'Patient-002', type: 'patient', age: 67, sex: 'M' },
            { id: 'p2-chf', label: 'Congestive Heart Failure', type: 'diagnosis' },
            { id: 'p2-afib', label: 'Atrial Fibrillation', type: 'diagnosis' },
            { id: 'p2-warfarin', label: 'Warfarin', type: 'medication' },
            { id: 'p2-furosemide', label: 'Furosemide', type: 'medication' },
            { id: 'p2-inr', label: 'INR: 2.5', type: 'lab' },
            { id: 'p2-bnp', label: 'BNP: 350', type: 'lab' },
            { id: 'p2-followup', label: 'Follow-up 2024-06-10', type: 'encounter', date: '2024-06-10' }
          ],
          links: [
            { source: 'p2', target: 'p2-chf', label: 'has diagnosis' },
            { source: 'p2', target: 'p2-afib', label: 'has diagnosis' },
            { source: 'p2', target: 'p2-warfarin', label: 'prescribed' },
            { source: 'p2', target: 'p2-furosemide', label: 'prescribed' },
            { source: 'p2', target: 'p2-inr', label: 'lab result' },
            { source: 'p2', target: 'p2-bnp', label: 'lab result' },
            { source: 'p2', target: 'p2-followup', label: 'had encounter' }
          ]
        },
        {
          id: 'Patient-003',
          nodes: [
            { id: 'p3', label: 'Patient-003', type: 'patient', age: 45, sex: 'F' },
            { id: 'p3-asthma', label: 'Asthma', type: 'diagnosis' },
            { id: 'p3-obesity', label: 'Obesity', type: 'diagnosis' },
            { id: 'p3-albuterol', label: 'Albuterol', type: 'medication' },
            { id: 'p3-fluticasone', label: 'Fluticasone', type: 'medication' },
            { id: 'p3-fev1', label: 'FEV1: 1.8L', type: 'lab' },
            { id: 'p3-bmi', label: 'BMI: 34', type: 'lab' },
            { id: 'p3-er', label: 'ER Visit 2024-04-15', type: 'encounter', date: '2024-04-15' }
          ],
          links: [
            { source: 'p3', target: 'p3-asthma', label: 'has diagnosis' },
            { source: 'p3', target: 'p3-obesity', label: 'has diagnosis' },
            { source: 'p3', target: 'p3-albuterol', label: 'prescribed' },
            { source: 'p3', target: 'p3-fluticasone', label: 'prescribed' },
            { source: 'p3', target: 'p3-fev1', label: 'lab result' },
            { source: 'p3', target: 'p3-bmi', label: 'lab result' },
            { source: 'p3', target: 'p3-er', label: 'had encounter' }
          ]
        }
      ]
    },
    {
      id: 'papers',
      label: 'Med Books & Papers',
      color: '#42a5f5',
      y: 300,
      papers: [
        {
          id: 'Paper-001',
          nodes: [
            { id: 'paper1', label: 'Metformin for Type 2 Diabetes', type: 'paper', context: 'A randomized controlled trial evaluating the efficacy of metformin in glycemic control for adults with type 2 diabetes.' },
            { id: 'paper1-diabetes', label: 'Type 2 Diabetes', type: 'topic', context: 'Primary disease focus of the study.' },
            { id: 'paper1-metformin', label: 'Metformin', type: 'intervention', context: 'Drug intervention studied.' },
            { id: 'paper1-hba1c', label: 'HbA1c', type: 'outcome', context: 'Primary outcome measure: change in HbA1c.' }
          ],
          links: [
            { source: 'paper1', target: 'paper1-diabetes', label: 'studies' },
            { source: 'paper1', target: 'paper1-metformin', label: 'intervention' },
            { source: 'paper1', target: 'paper1-hba1c', label: 'measures' }
          ]
        },
        {
          id: 'Paper-002',
          nodes: [
            { id: 'paper2', label: 'Heart Failure Management Guidelines', type: 'guideline', context: '2022 clinical practice guideline for the diagnosis and management of heart failure.' },
            { id: 'paper2-chf', label: 'Congestive Heart Failure', type: 'topic', context: 'Main disease addressed.' },
            { id: 'paper2-bnp', label: 'BNP', type: 'biomarker', context: 'BNP as a diagnostic and prognostic biomarker.' },
            { id: 'paper2-furosemide', label: 'Furosemide', type: 'treatment', context: 'Loop diuretic recommended for symptom relief.' }
          ],
          links: [
            { source: 'paper2', target: 'paper2-chf', label: 'addresses' },
            { source: 'paper2', target: 'paper2-bnp', label: 'discusses' },
            { source: 'paper2', target: 'paper2-furosemide', label: 'recommends' }
          ]
        },
        {
          id: 'Paper-003',
          nodes: [
            { id: 'paper3', label: 'Asthma and Obesity: A Review', type: 'review', context: 'A systematic review of the relationship between obesity and asthma severity in adults.' },
            { id: 'paper3-asthma', label: 'Asthma', type: 'topic', context: 'Primary disease focus.' },
            { id: 'paper3-obesity', label: 'Obesity', type: 'risk factor', context: 'Risk factor for increased asthma severity.' },
            { id: 'paper3-fev1', label: 'FEV1', type: 'outcome', context: 'Lung function outcome.' }
          ],
          links: [
            { source: 'paper3', target: 'paper3-asthma', label: 'reviews' },
            { source: 'paper3', target: 'paper3-obesity', label: 'analyzes' },
            { source: 'paper3', target: 'paper3-fev1', label: 'measures' }
          ]
        }
      ]
    },
    {
      id: 'dict',
      label: 'Med Vocabularies',
      color: '#66bb6a',
      y: 480,
      entries: [
        {
          id: 'umls-metformin',
          name: 'Metformin',
          type: 'drug',
          context: 'A biguanide oral antihyperglycemic agent used for the management of type 2 diabetes mellitus.'
        },
        {
          id: 'umls-bnp',
          name: 'BNP',
          type: 'biomarker',
          context: 'B-type natriuretic peptide, a cardiac neurohormone used as a biomarker for heart failure.'
        },
        {
          id: 'umls-fev1',
          name: 'FEV1',
          type: 'measurement',
          context: 'Forced expiratory volume in 1 second, a measure of lung function.'
        },
        {
          id: 'umls-furosemide',
          name: 'Furosemide',
          type: 'drug',
          context: 'A loop diuretic used to treat fluid build-up due to heart failure, liver scarring, or kidney disease.'
        },
        {
          id: 'umls-hba1c',
          name: 'HbA1c',
          type: 'lab',
          context: 'Glycated hemoglobin, a measure of average blood glucose over the past 2-3 months.'
        },
        {
          id: 'umls-asthma',
          name: 'Asthma',
          type: 'disease',
          context: 'A chronic inflammatory disease of the airways characterized by variable and recurring symptoms.'
        },
        {
          id: 'umls-obesity',
          name: 'Obesity',
          type: 'disease',
          context: 'A condition characterized by excessive body fat that increases the risk of health problems.'
        }
      ]
    }
  ],
  edges: [
    // EHR to Papers
    { source: 'p1-diabetes', target: 'paper1-diabetes' },
    { source: 'p1-metformin', target: 'paper1-metformin' },
    { source: 'p1-hba1c', target: 'paper1-hba1c' },
    { source: 'p2-chf', target: 'paper2-chf' },
    { source: 'p2-bnp', target: 'paper2-bnp' },
    { source: 'p2-furosemide', target: 'paper2-furosemide' },
    { source: 'p3-asthma', target: 'paper3-asthma' },
    { source: 'p3-obesity', target: 'paper3-obesity' },
    { source: 'p3-fev1', target: 'paper3-fev1' },
    // Papers to Dictionary
    { source: 'paper1-metformin', target: 'umls-metformin' },
    { source: 'paper1-hba1c', target: 'umls-hba1c' },
    { source: 'paper2-bnp', target: 'umls-bnp' },
    { source: 'paper2-furosemide', target: 'umls-furosemide' },
    { source: 'paper3-fev1', target: 'umls-fev1' },
    { source: 'paper3-asthma', target: 'umls-asthma' },
    { source: 'paper3-obesity', target: 'umls-obesity' }
  ]
};

let overallGraphState = {
  view: 'overview', // or layer id
  zoomedLayer: null
};

function renderOverallGraphStructure() {
  const svg = d3.select('#overall-graph-svg');
  svg.selectAll('*').remove();

  // Draw planes and add interactivity
  overallGraphData.layers.forEach((layer, layerIdx) => {
    // Increase height of bounding box for more space
    const plane = svg.append('rect')
      .attr('x', 60)
      .attr('y', layer.y - 60)
      .attr('width', 680)
      .attr('height', 120)
      .attr('rx', 28)
      .attr('fill', layer.color)
      .attr('fill-opacity', 0.13)
      .attr('stroke', layer.color)
      .attr('stroke-width', 2)
      .attr('class', 'layer-plane')
      .attr('cursor', 'pointer')
      .on('mouseover', function() {
        // Dim other layers' planes, nodes, and labels
        svg.selectAll('.layer-plane').attr('fill-opacity', (d, i) => i === layerIdx ? 0.18 : 0.05)
          .attr('stroke-opacity', (d, i) => i === layerIdx ? 1 : 0.15);
        svg.selectAll('.layer-group').attr('opacity', (d, i) => i === layerIdx ? 1 : 0.18);
        svg.selectAll('.layer-label').attr('opacity', (d, i) => i === layerIdx ? 1 : 0.18);
      })
      .on('mouseout', function() {
        // Restore all layers
        svg.selectAll('.layer-plane').attr('fill-opacity', 0.13).attr('stroke-opacity', 1);
        svg.selectAll('.layer-group').attr('opacity', 1);
        svg.selectAll('.layer-label').attr('opacity', 1);
      })
      .on('click', () => zoomToLayer(layer.id));

    svg.append('text')
      .attr('x', 400)
      .attr('y', layer.y - 80)
      .attr('text-anchor', 'middle')
      .attr('font-size', 22)
      .attr('font-weight', 700)
      .attr('fill', layer.color)
      .attr('class', 'layer-label')
      .text(layer.label)
      .attr('pointer-events', 'none');
  });

  // --- Render EHR patient subgraphs (small, no labels, circles) ---
  const ehrLayer = overallGraphData.layers[0];
  const ehrGroup = svg.append('g').attr('class', 'layer-group');
  ehrLayer.patients.forEach((patient, i) => {
    const xOffset = 180 + i * 220;
    const layoutRadius = 28;
    const nodeRadius = 10;
    patient.nodes.forEach((node, j) => {
      const angle = (j / patient.nodes.length) * 2 * Math.PI;
      const cx = xOffset + Math.cos(angle) * layoutRadius;
      const cy = ehrLayer.y + Math.sin(angle) * layoutRadius;
      ehrGroup.append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', nodeRadius)
        .attr('fill', ehrLayer.color)
        .attr('fill-opacity', 0.85)
        .attr('stroke', '#333')
        .attr('stroke-width', 1.5)
        .attr('cursor', 'pointer')
        .on('mouseover', (event) => showLayerNodeTooltip(event, node))
        .on('mouseout', hideTooltip);
      // No label in overview
    });
    // Draw patient subgraph edges (thin, faint)
    patient.links.forEach(link => {
      const src = patient.nodes.find(n => n.id === link.source);
      const tgt = patient.nodes.find(n => n.id === link.target);
      if (src && tgt) {
        const srcIdx = patient.nodes.indexOf(src);
        const tgtIdx = patient.nodes.indexOf(tgt);
        const srcAngle = (srcIdx / patient.nodes.length) * 2 * Math.PI;
        const tgtAngle = (tgtIdx / patient.nodes.length) * 2 * Math.PI;
        const srcX = xOffset + Math.cos(srcAngle) * layoutRadius;
        const srcY = ehrLayer.y + Math.sin(srcAngle) * layoutRadius;
        const tgtX = xOffset + Math.cos(tgtAngle) * layoutRadius;
        const tgtY = ehrLayer.y + Math.sin(tgtAngle) * layoutRadius;
        ehrGroup.insert('line', ':first-child')
          .attr('x1', srcX)
          .attr('y1', srcY)
          .attr('x2', tgtX)
          .attr('y2', tgtY)
          .attr('stroke', '#888')
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '2 2')
          .attr('opacity', 0.5);
      }
    });
  });

  // --- Render Papers subgraphs (small, no labels, circles) ---
  const papersLayer = overallGraphData.layers[1];
  const papersGroup = svg.append('g').attr('class', 'layer-group');
  papersLayer.papers.forEach((paper, i) => {
    const xOffset = 180 + i * 220;
    const layoutRadius = 28;
    const nodeRadius = 10;
    paper.nodes.forEach((node, j) => {
      const angle = (j / paper.nodes.length) * 2 * Math.PI;
      const cx = xOffset + Math.cos(angle) * layoutRadius;
      const cy = papersLayer.y + Math.sin(angle) * layoutRadius;
      papersGroup.append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', nodeRadius)
        .attr('fill', papersLayer.color)
        .attr('fill-opacity', 0.85)
        .attr('stroke', '#333')
        .attr('stroke-width', 1.5)
        .attr('cursor', 'pointer')
        .on('mouseover', (event) => showLayerNodeTooltip(event, node))
        .on('mouseout', hideTooltip);
      // No label in overview
    });
    // Draw paper subgraph edges (thin, faint)
    paper.links.forEach(link => {
      const src = paper.nodes.find(n => n.id === link.source);
      const tgt = paper.nodes.find(n => n.id === link.target);
      if (src && tgt) {
        const srcIdx = paper.nodes.indexOf(src);
        const tgtIdx = paper.nodes.indexOf(tgt);
        const srcAngle = (srcIdx / paper.nodes.length) * 2 * Math.PI;
        const tgtAngle = (tgtIdx / paper.nodes.length) * 2 * Math.PI;
        const srcX = xOffset + Math.cos(srcAngle) * layoutRadius;
        const srcY = papersLayer.y + Math.sin(srcAngle) * layoutRadius;
        const tgtX = xOffset + Math.cos(tgtAngle) * layoutRadius;
        const tgtY = papersLayer.y + Math.sin(tgtAngle) * layoutRadius;
        papersGroup.insert('line', ':first-child')
          .attr('x1', srcX)
          .attr('y1', srcY)
          .attr('x2', tgtX)
          .attr('y2', tgtY)
          .attr('stroke', '#888')
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '2 2')
          .attr('opacity', 0.5);
      }
    });
  });

  // --- Render Dictionary entries (small, no labels, circles) ---
  const dictLayer = overallGraphData.layers[2];
  const dictGroup = svg.append('g').attr('class', 'layer-group');
  dictLayer.entries.forEach((entry, i) => {
    const x = 120 + i * 90;
    const y = dictLayer.y;
    dictGroup.append('circle')
      .attr('cx', x)
      .attr('cy', y)
      .attr('r', 10)
      .attr('fill', dictLayer.color)
      .attr('fill-opacity', 0.85)
      .attr('stroke', '#333')
      .attr('stroke-width', 1.5)
      .attr('cursor', 'pointer')
      .on('mouseover', (event) => showLayerNodeTooltip(event, entry))
      .on('mouseout', hideTooltip);
    // No label in overview
  });

  // --- Draw inter-layer edges ---
  overallGraphData.edges.forEach(edge => {
    let srcX, srcY, tgtX, tgtY;
    ehrLayer.patients.forEach((patient, i) => {
      const xOffset = 180 + i * 220;
      patient.nodes.forEach((node, j) => {
        if (node.id === edge.source) {
          const angle = (j / patient.nodes.length) * 2 * Math.PI;
          srcX = xOffset + Math.cos(angle) * 28;
          srcY = ehrLayer.y + Math.sin(angle) * 28;
        }
      });
    });
    papersLayer.papers.forEach((paper, i) => {
      const xOffset = 180 + i * 220;
      paper.nodes.forEach((node, j) => {
        if (node.id === edge.target) {
          const angle = (j / paper.nodes.length) * 2 * Math.PI;
          tgtX = xOffset + Math.cos(angle) * 28;
          tgtY = papersLayer.y + Math.sin(angle) * 28;
        }
        if (node.id === edge.source) {
          const angle = (j / paper.nodes.length) * 2 * Math.PI;
          srcX = xOffset + Math.cos(angle) * 28;
          srcY = papersLayer.y + Math.sin(angle) * 28;
        }
      });
    });
    dictLayer.entries.forEach((entry, i) => {
      const x = 120 + i * 90;
      const y = dictLayer.y;
      if (entry.id === edge.target) {
        tgtX = x;
        tgtY = y;
      }
      if (entry.id === edge.source) {
        srcX = x;
        srcY = y;
      }
    });
    if (srcX !== undefined && srcY !== undefined && tgtX !== undefined && tgtY !== undefined) {
      svg.insert('line', ':first-child')
        .attr('x1', srcX)
        .attr('y1', srcY)
        .attr('x2', tgtX)
        .attr('y2', tgtY)
        .attr('stroke', '#1976d2')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '4 3');
    }
  });

  // Hide back button
  document.getElementById('overall-graph-back').style.display = 'none';
  overallGraphState.view = 'overview';
  overallGraphState.zoomedLayer = null;
}

function zoomToLayer(layerId) {
  overallGraphState.view = layerId;
  overallGraphState.zoomedLayer = layerId;
  renderLayerSubgraph(layerId);
  document.getElementById('overall-graph-back').style.display = 'block';
  
  // Add click event handler for back button
  document.getElementById('overall-graph-back').onclick = function() {
    renderOverallGraphStructure();
    document.getElementById('overall-graph-back').style.display = 'none';
  };
}

function renderLayerSubgraph(layerId) {
  const svg = d3.select('#overall-graph-svg');
  svg.selectAll('*').remove();
  const layer = overallGraphData.layers.find(l => l.id === layerId);
  if (!layer) return;

  // Draw plane
  svg.append('rect')
    .attr('x', 60)
    .attr('y', 180)
    .attr('width', 680)
    .attr('height', 240)
    .attr('rx', 38)
    .attr('fill', layer.color)
    .attr('fill-opacity', 0.18)
    .attr('stroke', layer.color)
    .attr('stroke-width', 2);

  // Label
  svg.append('text')
    .attr('x', 400)
    .attr('y', 170)
    .attr('text-anchor', 'middle')
    .attr('font-size', 28)
    .attr('font-weight', 700)
    .attr('fill', layer.color)
    .text(layer.label);

  if (layerId === 'ehr') {
    layer.patients.forEach((patient, i) => {
      const xOffset = 220 + i * 220;
      const layoutRadius = 48;
      const nodeRadius = 16;
      patient.nodes.forEach((node, j) => {
        const angle = (j / patient.nodes.length) * 2 * Math.PI;
        const cx = xOffset + Math.cos(angle) * layoutRadius;
        const cy = 300 + Math.sin(angle) * layoutRadius;
        svg.append('circle')
          .attr('cx', cx)
          .attr('cy', cy)
          .attr('r', nodeRadius)
          .attr('fill', layer.color)
          .attr('fill-opacity', 0.92)
          .attr('stroke', '#333')
          .attr('stroke-width', 2)
          .attr('cursor', 'pointer')
          .on('mouseover', (event) => showLayerNodeTooltip(event, node))
          .on('mouseout', hideTooltip);
        // Acronym label
        svg.append('text')
          .attr('x', cx)
          .attr('y', cy + 6)
          .attr('text-anchor', 'middle')
          .attr('font-size', 14)
          .attr('font-weight', 700)
          .attr('fill', '#fff')
          .text(getAcronym(node))
          .attr('pointer-events', 'none');
      });
      patient.links.forEach(link => {
        const src = patient.nodes.find(n => n.id === link.source);
        const tgt = patient.nodes.find(n => n.id === link.target);
        if (src && tgt) {
          const srcIdx = patient.nodes.indexOf(src);
          const tgtIdx = patient.nodes.indexOf(tgt);
          const srcAngle = (srcIdx / patient.nodes.length) * 2 * Math.PI;
          const tgtAngle = (tgtIdx / patient.nodes.length) * 2 * Math.PI;
          const srcX = xOffset + Math.cos(srcAngle) * layoutRadius;
          const srcY = 300 + Math.sin(srcAngle) * layoutRadius;
          const tgtX = xOffset + Math.cos(tgtAngle) * layoutRadius;
          const tgtY = 300 + Math.sin(tgtAngle) * layoutRadius;
          svg.append('line')
            .attr('x1', srcX)
            .attr('y1', srcY)
            .attr('x2', tgtX)
            .attr('y2', tgtY)
            .attr('stroke', '#888')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '3 2')
            .on('mouseover', (event) => showEdgeTooltip(event, link, src, tgt))
            .on('mouseout', hideTooltip);
        }
      });
    });
  } else if (layerId === 'papers') {
    layer.papers.forEach((paper, i) => {
      const xOffset = 220 + i * 220;
      const layoutRadius = 48;
      const nodeRadius = 16;
      paper.nodes.forEach((node, j) => {
        const angle = (j / paper.nodes.length) * 2 * Math.PI;
        const cx = xOffset + Math.cos(angle) * layoutRadius;
        const cy = 300 + Math.sin(angle) * layoutRadius;
        svg.append('circle')
          .attr('cx', cx)
          .attr('cy', cy)
          .attr('r', nodeRadius)
          .attr('fill', layer.color)
          .attr('fill-opacity', 0.92)
          .attr('stroke', '#333')
          .attr('stroke-width', 2)
          .attr('cursor', 'pointer')
          .on('mouseover', (event) => showLayerNodeTooltip(event, node))
          .on('mouseout', hideTooltip);
        // Acronym label
        svg.append('text')
          .attr('x', cx)
          .attr('y', cy + 6)
          .attr('text-anchor', 'middle')
          .attr('font-size', 14)
          .attr('font-weight', 700)
          .attr('fill', '#fff')
          .text(getAcronym(node))
          .attr('pointer-events', 'none');
      });
      paper.links.forEach(link => {
        const src = paper.nodes.find(n => n.id === link.source);
        const tgt = paper.nodes.find(n => n.id === link.target);
        if (src && tgt) {
          const srcIdx = paper.nodes.indexOf(src);
          const tgtIdx = paper.nodes.indexOf(tgt);
          const srcAngle = (srcIdx / paper.nodes.length) * 2 * Math.PI;
          const tgtAngle = (tgtIdx / paper.nodes.length) * 2 * Math.PI;
          const srcX = xOffset + Math.cos(srcAngle) * layoutRadius;
          const srcY = 300 + Math.sin(srcAngle) * layoutRadius;
          const tgtX = xOffset + Math.cos(tgtAngle) * layoutRadius;
          const tgtY = 300 + Math.sin(tgtAngle) * layoutRadius;
          svg.append('line')
            .attr('x1', srcX)
            .attr('y1', srcY)
            .attr('x2', tgtX)
            .attr('y2', tgtY)
            .attr('stroke', '#888')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '3 2')
            .on('mouseover', (event) => showEdgeTooltip(event, link, src, tgt))
            .on('mouseout', hideTooltip);
        }
      });
    });
  } else if (layerId === 'dict') {
    layer.entries.forEach((entry, i) => {
      const x = 180 + i * 90;
      const y = 300;
      svg.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', 14)
        .attr('fill', layer.color)
        .attr('fill-opacity', 0.92)
        .attr('stroke', '#333')
        .attr('stroke-width', 2)
        .attr('cursor', 'pointer')
        .on('mouseover', (event) => showLayerNodeTooltip(event, entry))
        .on('mouseout', hideTooltip);
      // Acronym label
      svg.append('text')
        .attr('x', x)
        .attr('y', y + 6)
        .attr('text-anchor', 'middle')
        .attr('font-size', 14)
        .attr('font-weight', 700)
        .attr('fill', '#fff')
        .text(getAcronym(entry))
        .attr('pointer-events', 'none');
    });
  }
}

function showLayerNodeTooltip(event, node) {
  hideTooltip();
  let name = node.name || node.label;
  let type = node.type;
  let context = node.context || (node.meta && node.meta.definition) || '';
  const tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('position', 'absolute')
    .style('background', 'rgba(0,0,0,0.92)')
    .style('color', 'white')
    .style('padding', '10px 16px')
    .style('border-radius', '6px')
    .style('font-size', '14px')
    .style('pointer-events', 'none')
    .style('z-index', 1000)
    .style('box-shadow', '0 2px 8px rgba(0,0,0,0.3)');
  tooltip.html(`
    <div><strong>Name:</strong> ${name}</div>
    <div><strong>Type:</strong> ${type}</div>
    <div style="margin-top: 6px;"><strong>Context:</strong><br/><span style="font-style: italic; color: #b3e5fc;">${context}</span></div>
  `)
    .style('left', (event.pageX + 12) + 'px')
    .style('top', (event.pageY - 10) + 'px');
}

// === Section Navigation Integration for Overall Graph Structure ===

function showSection(sectionId) {
  // Hide all step sections
  document.querySelectorAll('.step').forEach(sec => sec.style.display = 'none');
  // Show the requested section
  const section = document.getElementById(sectionId);
  if (section) {
    section.style.display = '';
    // If it's the overall graph structure, render the graph
    if (sectionId === 'overall-graph-structure') {
      renderOverallGraphStructure();
    }
    // Note: graph-tagging is now handled by Scrollama onStepEnter
  }
}

// Example: Hook up to navigation (replace with your actual navigation logic)
// showSection('overall-graph-structure'); // Uncomment to test directly

function getAcronym(node) {
  if (node.acronym) return node.acronym;
  const label = node.name || node.label || '';
  // Use first 3-4 uppercase letters or first letters of words
  const words = label.split(/\s+/);
  if (words.length === 1) {
    return label.slice(0, 4).toUpperCase();
  }
  return words.map(w => w[0]).join('').toUpperCase().slice(0, 4);
}

// Graph Tagging Visualization
let graphTaggingState = {
  currentLevel: 'chunks', // 'chunks', 'level1', 'level2'
  currentSlide: 0
};

function createGraphTaggingViz() {
  const svg = d3.select('#tag-graph-svg');
  svg.selectAll('*').remove();
  
  const width = 420;
  const height = 480;
  const margin = { top: 20, right: 20, bottom: 20, left: 20 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  
  // Create chart group
  const g = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);
  
  // Add title
  g.append('text')
    .attr('x', chartWidth / 2)
    .attr('y', 0)
    .attr('text-anchor', 'middle')
    .style('font-size', '16px')
    .style('font-weight', '600')
    .style('fill', '#333')
    .text('Graph Tagging Hierarchy');
  
  // Render the full hierarchical tree
  renderFullHierarchy(g, chartWidth, chartHeight);
}

function renderChunkTags(g, width, height) {
  const chunks = Object.values(graphTaggingData.chunks);
  const nodeRadius = 25;
  const spacing = 80;
  
  chunks.forEach((chunk, i) => {
    const x = width / 2;
    const y = 60 + i * spacing;
    
    // Draw chunk node
    g.append('circle')
      .attr('cx', x)
      .attr('cy', y)
      .attr('r', nodeRadius)
      .attr('fill', chunk.color)
      .attr('fill-opacity', 0.8)
      .attr('stroke', '#333')
      .attr('stroke-width', 2)
      .attr('cursor', 'pointer')
      .on('mouseover', (event) => showChunkTooltip(event, chunk))
      .on('mouseout', hideTooltip);
    
    // Add chunk name
    g.append('text')
      .attr('x', x)
      .attr('y', y + 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', '600')
      .style('fill', '#fff')
      .text(chunk.name.split(' ')[0])
      .attr('pointer-events', 'none');
    
    // Add tag count
    g.append('text')
      .attr('x', x)
      .attr('y', y + 20)
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('fill', '#fff')
      .text(`${chunk.tags.length} tags`)
      .attr('pointer-events', 'none');
  });
  
  // Add instruction text
  g.append('text')
    .attr('x', width / 2)
    .attr('y', height - 20)
    .attr('text-anchor', 'middle')
    .style('font-size', '14px')
    .style('fill', '#666')
    .text('Hover over nodes to see extracted tags');
}

function renderMetaTags(g, width, height, level) {
  const metaTags = graphTaggingData.metaTags[level];
  const nodeRadius = 30;
  const spacing = 100;
  
  metaTags.forEach((meta, i) => {
    const x = width / 2;
    const y = 60 + i * spacing;
    
    // Draw meta tag node
    g.append('circle')
      .attr('cx', x)
      .attr('cy', y)
      .attr('r', nodeRadius)
      .attr('fill', meta.color)
      .attr('fill-opacity', 0.8)
      .attr('stroke', '#333')
      .attr('stroke-width', 2)
      .attr('cursor', 'pointer')
      .on('mouseover', (event) => showMetaTooltip(event, meta))
      .on('mouseout', hideTooltip);
    
    // Add meta tag name
    g.append('text')
      .attr('x', x)
      .attr('y', y + 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '11px')
      .style('font-weight', '600')
      .style('fill', '#fff')
      .text(meta.name.split(' ')[0])
      .attr('pointer-events', 'none');
    
    // Add tag count
    g.append('text')
      .attr('x', x)
      .attr('y', y + 18)
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('fill', '#fff')
      .text(`${meta.tags.length} tags`)
      .attr('pointer-events', 'none');
    
    // Add children count
    g.append('text')
      .attr('x', x)
      .attr('y', y + 30)
      .attr('text-anchor', 'middle')
      .style('font-size', '9px')
      .style('fill', '#fff')
      .text(`${meta.children.length} children`)
      .attr('pointer-events', 'none');
  });
  
  // Add level indicator
  g.append('text')
    .attr('x', width / 2)
    .attr('y', height - 20)
    .attr('text-anchor', 'middle')
    .style('font-size', '14px')
    .style('fill', '#666')
    .text(`Meta Tags Level ${level === 'level1' ? '1' : '2'}`);
}

function showChunkTooltip(event, chunk) {
  hideTooltip();
  const tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('position', 'absolute')
    .style('background', 'rgba(0,0,0,0.92)')
    .style('color', 'white')
    .style('padding', '12px 16px')
    .style('border-radius', '6px')
    .style('font-size', '13px')
    .style('pointer-events', 'none')
    .style('z-index', 1000)
    .style('box-shadow', '0 2px 8px rgba(0,0,0,0.3)')
    .style('max-width', '300px');
  
  let tooltipContent = `<div style="margin-bottom: 8px;"><strong>${chunk.name}</strong></div>`;
  tooltipContent += '<div style="margin-bottom: 6px;"><strong>Extracted Tags:</strong></div>';
  
  chunk.tags.forEach(tag => {
    tooltipContent += `<div style="margin: 2px 0; padding: 2px 0; border-bottom: 1px solid #444;">`;
    tooltipContent += `<span style="color: #90caf9;">${tag.type}:</span> ${tag.value}`;
    tooltipContent += `<div style="font-size: 11px; color: #b3e5fc; font-style: italic; margin-top: 2px;">${tag.description}</div>`;
    tooltipContent += `</div>`;
  });
  
  tooltip.html(tooltipContent)
    .style('left', (event.pageX + 12) + 'px')
    .style('top', (event.pageY - 10) + 'px');
}

function showMetaTooltip(event, meta) {
  hideTooltip();
  const tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('position', 'absolute')
    .style('background', 'rgba(0,0,0,0.92)')
    .style('color', 'white')
    .style('padding', '12px 16px')
    .style('border-radius', '6px')
    .style('font-size', '13px')
    .style('pointer-events', 'none')
    .style('z-index', 1000)
    .style('box-shadow', '0 2px 8px rgba(0,0,0,0.3)')
    .style('max-width', '300px');
  
  let tooltipContent = `<div style="margin-bottom: 8px;"><strong>${meta.name}</strong></div>`;
  tooltipContent += `<div style="margin-bottom: 4px; color: #90caf9;">Meta Tags (${meta.tags.length})</div>`;
  
  meta.tags.forEach(tag => {
    tooltipContent += `<div style="margin: 2px 0; padding: 2px 0; border-bottom: 1px solid #444;">`;
    tooltipContent += `<span style="color: #90caf9;">${tag.type}:</span> ${tag.value}`;
    tooltipContent += `<div style="font-size: 11px; color: #b3e5fc; font-style: italic; margin-top: 2px;">${tag.description}</div>`;
    tooltipContent += `</div>`;
  });
  
  tooltipContent += `<div style="margin-top: 8px; color: #f48fb1;">Children: ${meta.children.join(', ')}</div>`;
  
  tooltip.html(tooltipContent)
    .style('left', (event.pageX + 12) + 'px')
    .style('top', (event.pageY - 10) + 'px');
}

function renderFullHierarchy(g, width, height) {
  const nodeRadius = 20;
  const levelSpacing = 80;
  const nodeSpacing = 120;
  
  // Level 2 (Top) - Medical Therapeutics
  const level2Meta = graphTaggingData.metaTags.level2[0];
  const level2X = width / 2;
  const level2Y = 60;
  
  // Draw level 2 node
  g.append('circle')
    .attr('cx', level2X)
    .attr('cy', level2Y)
    .attr('r', nodeRadius)
    .attr('fill', level2Meta.color)
    .attr('fill-opacity', 0.8)
    .attr('stroke', '#333')
    .attr('stroke-width', 2)
    .attr('cursor', 'pointer')
    .on('mouseover', (event) => showMetaTooltip(event, level2Meta))
    .on('mouseout', hideTooltip);
  
  // Add level 2 label (acronym)
  g.append('text')
    .attr('x', level2X)
    .attr('y', level2Y + 5)
    .attr('text-anchor', 'middle')
    .style('font-size', '12px')
    .style('font-weight', '600')
    .style('fill', '#fff')
    .text('MT')
    .attr('pointer-events', 'none');
  
  // Level 1 (Middle) - Meta tags
  const level1Metas = graphTaggingData.metaTags.level1;
  level1Metas.forEach((meta, i) => {
    const level1X = width / 2 + (i === 0 ? -nodeSpacing/2 : nodeSpacing/2);
    const level1Y = level2Y + levelSpacing;
    
    // Draw level 1 node
    g.append('circle')
      .attr('cx', level1X)
      .attr('cy', level1Y)
      .attr('r', nodeRadius)
      .attr('fill', meta.color)
      .attr('fill-opacity', 0.8)
      .attr('stroke', '#333')
      .attr('stroke-width', 2)
      .attr('cursor', 'pointer')
      .on('mouseover', (event) => showMetaTooltip(event, meta))
      .on('mouseout', hideTooltip);
    
    // Add level 1 label (acronym)
    g.append('text')
      .attr('x', level1X)
      .attr('y', level1Y + 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', '600')
      .style('fill', '#fff')
      .text(getAcronym(meta))
      .attr('pointer-events', 'none');
    
    // Draw connection line from level 2 to level 1
    g.append('line')
      .attr('x1', level2X)
      .attr('y1', level2Y + nodeRadius)
      .attr('x2', level1X)
      .attr('y2', level1Y - nodeRadius)
      .attr('stroke', '#666')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '3 2');
  });
  
  // Level 0 (Bottom) - Chunks
  const chunks = Object.values(graphTaggingData.chunks);
  chunks.forEach((chunk, i) => {
    const chunkX = width / 2 + (i === 0 ? -nodeSpacing/2 : nodeSpacing/2);
    const chunkY = level2Y + 2 * levelSpacing;
    
    // Draw chunk node
    g.append('circle')
      .attr('cx', chunkX)
      .attr('cy', chunkY)
      .attr('r', nodeRadius)
      .attr('fill', chunk.color)
      .attr('fill-opacity', 0.8)
      .attr('stroke', '#333')
      .attr('stroke-width', 2)
      .attr('cursor', 'pointer')
      .on('mouseover', (event) => showChunkTooltip(event, chunk))
      .on('mouseout', hideTooltip);
    
    // Add chunk label (acronym)
    g.append('text')
      .attr('x', chunkX)
      .attr('y', chunkY + 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', '600')
      .style('fill', '#fff')
      .text(getAcronym(chunk))
      .attr('pointer-events', 'none');
    
    // Draw connection line from level 1 to chunk
    const parentMeta = level1Metas[i];
    const parentX = width / 2 + (i === 0 ? -nodeSpacing/2 : nodeSpacing/2);
    const parentY = level2Y + levelSpacing;
    
    g.append('line')
      .attr('x1', parentX)
      .attr('y1', parentY + nodeRadius)
      .attr('x2', chunkX)
      .attr('y2', chunkY - nodeRadius)
      .attr('stroke', '#666')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '3 2');
  });
  
  // Add level labels
  g.append('text')
    .attr('x', 10)
    .attr('y', level2Y)
    .style('font-size', '12px')
    .style('font-weight', '600')
    .style('fill', '#666')
    .text('Level 2:');
  
  g.append('text')
    .attr('x', 10)
    .attr('y', level2Y + levelSpacing)
    .style('font-size', '12px')
    .style('font-weight', '600')
    .style('fill', '#666')
    .text('Level 1:');
  
  g.append('text')
    .attr('x', 10)
    .attr('y', level2Y + 2 * levelSpacing)
    .style('font-size', '12px')
    .style('font-weight', '600')
    .style('fill', '#666')
    .text('Chunks:');
  
  // Add instruction text
  g.append('text')
    .attr('x', width / 2)
    .attr('y', height - 10)
    .attr('text-anchor', 'middle')
    .style('font-size', '12px')
    .style('fill', '#666')
    .text('Hover over nodes to see extracted tags');
}

function setupGraphTaggingControls() {
  // No controls needed for full hierarchy view
  const controls = d3.select('#tag-graph-controls');
  controls.html('');
}

// Question Answering Visualization
let questionAnsweringState = {
  currentStep: 0,
  searchPath: [],
  animationPhase: 'search', // 'search', 'graph', 'refinement'
  currentRefinementLevel: null // 'chunkLevel', 'level1', 'level2'
};

function createQuestionAnsweringViz() {
  const svg = d3.select('#qa-graph-svg');
  svg.selectAll('*').remove();
  
  const width = 420;
  const height = 480;
  const margin = { top: 20, right: 20, bottom: 20, left: 20 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  
  // Add arrowhead marker definition
  svg.append('defs').append('marker')
    .attr('id', 'arrowhead')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 8)
    .attr('refY', 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', '#666');
  
  // Create chart group
  const g = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);
  
  // Add title based on animation phase
  let titleText = 'Tag Tree Search Process';
  if (questionAnsweringState.animationPhase === 'graph') {
    titleText = 'Chunk Graph Analysis';
  } else if (questionAnsweringState.animationPhase === 'refinement') {
    titleText = 'Answer Refinement Process';
  }
  
  g.append('text')
    .attr('x', chartWidth / 2)
    .attr('y', 0)
    .attr('text-anchor', 'middle')
    .style('font-size', '16px')
    .style('font-weight', '600')
    .style('fill', '#333')
    .text(titleText);
  
  // Render based on animation phase
  if (questionAnsweringState.animationPhase === 'search') {
    renderSearchProcess(g, chartWidth, chartHeight);
  } else if (questionAnsweringState.animationPhase === 'graph') {
    renderChunkGraph(g, chartWidth, chartHeight);
  } else if (questionAnsweringState.animationPhase === 'refinement') {
    renderAnswerRefinement(g, chartWidth, chartHeight);
  }
}

function renderSearchProcess(g, width, height) {
  const nodeRadius = 20;
  const levelSpacing = 80;
  const nodeSpacing = 120;
  
  // Level 2 (Top) - Medical Therapeutics
  const level2Meta = graphTaggingData.metaTags.level2[0];
  const level2X = width / 2;
  const level2Y = 60;
  
  // Draw level 2 node with search highlighting
  const isLevel2Matched = questionAnsweringState.searchPath.some(p => p.level === 'level2' && p.nodeId === level2Meta.id);
  g.append('circle')
    .attr('cx', level2X)
    .attr('cy', level2Y)
    .attr('r', nodeRadius)
    .attr('fill', isLevel2Matched ? '#ffc107' : level2Meta.color)
    .attr('fill-opacity', 0.8)
    .attr('stroke', isLevel2Matched ? '#ff6f00' : '#333')
    .attr('stroke-width', isLevel2Matched ? 3 : 2)
    .attr('cursor', 'pointer')
    .on('mouseover', (event) => showSearchTooltip(event, level2Meta, isLevel2Matched))
    .on('mouseout', hideTooltip);
  
  // Add level 2 label
  g.append('text')
    .attr('x', level2X)
    .attr('y', level2Y + 5)
    .attr('text-anchor', 'middle')
    .style('font-size', '12px')
    .style('font-weight', '600')
    .style('fill', '#fff')
    .text('MT')
    .attr('pointer-events', 'none');
  
  // Level 1 (Middle) - Meta tags
  const level1Metas = graphTaggingData.metaTags.level1;
  level1Metas.forEach((meta, i) => {
    const level1X = width / 2 + (i === 0 ? -nodeSpacing/2 : nodeSpacing/2);
    const level1Y = level2Y + levelSpacing;
    
    const isLevel1Matched = questionAnsweringState.searchPath.some(p => p.level === 'level1' && p.nodeId === meta.id);
    
    // Draw level 1 node
    g.append('circle')
      .attr('cx', level1X)
      .attr('cy', level1Y)
      .attr('r', nodeRadius)
      .attr('fill', isLevel1Matched ? '#ffc107' : meta.color)
      .attr('fill-opacity', 0.8)
      .attr('stroke', isLevel1Matched ? '#ff6f00' : '#333')
      .attr('stroke-width', isLevel1Matched ? 3 : 2)
      .attr('cursor', 'pointer')
      .on('mouseover', (event) => showSearchTooltip(event, meta, isLevel1Matched))
      .on('mouseout', hideTooltip);
    
    // Add level 1 label
    g.append('text')
      .attr('x', level1X)
      .attr('y', level1Y + 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', '600')
      .style('fill', '#fff')
      .text(getAcronym(meta))
      .attr('pointer-events', 'none');
    
    // Draw connection line from level 2 to level 1
    const lineColor = (isLevel2Matched && isLevel1Matched) ? '#ff6f00' : '#666';
    const lineWidth = (isLevel2Matched && isLevel1Matched) ? 3 : 2;
    g.append('line')
      .attr('x1', level2X)
      .attr('y1', level2Y + nodeRadius)
      .attr('x2', level1X)
      .attr('y2', level1Y - nodeRadius)
      .attr('stroke', lineColor)
      .attr('stroke-width', lineWidth)
      .attr('stroke-dasharray', '3 2');
  });
  
  // Level 0 (Bottom) - Chunks
  const chunks = Object.values(graphTaggingData.chunks);
  chunks.forEach((chunk, i) => {
    const chunkX = width / 2 + (i === 0 ? -nodeSpacing/2 : nodeSpacing/2);
    const chunkY = level2Y + 2 * levelSpacing;
    
    const isChunkMatched = questionAnsweringState.searchPath.some(p => p.level === 'chunks' && p.nodeId === chunk.id);
    
    // Draw chunk node
    g.append('circle')
      .attr('cx', chunkX)
      .attr('cy', chunkY)
      .attr('r', nodeRadius)
      .attr('fill', isChunkMatched ? '#ffc107' : chunk.color)
      .attr('fill-opacity', 0.8)
      .attr('stroke', isChunkMatched ? '#ff6f00' : '#333')
      .attr('stroke-width', isChunkMatched ? 3 : 2)
      .attr('cursor', 'pointer')
      .on('mouseover', (event) => showSearchTooltip(event, chunk, isChunkMatched))
      .on('mouseout', hideTooltip);
    
    // Add chunk label
    g.append('text')
      .attr('x', chunkX)
      .attr('y', chunkY + 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', '600')
      .style('fill', '#fff')
      .text(getAcronym(chunk))
      .attr('pointer-events', 'none');
    
    // Draw connection line from level 1 to chunk
    const parentMeta = level1Metas[i];
    const parentX = width / 2 + (i === 0 ? -nodeSpacing/2 : nodeSpacing/2);
    const parentY = level2Y + levelSpacing;
    const isParentMatched = questionAnsweringState.searchPath.some(p => p.level === 'level1' && p.nodeId === parentMeta.id);
    
    const lineColor = (isParentMatched && isChunkMatched) ? '#ff6f00' : '#666';
    const lineWidth = (isParentMatched && isChunkMatched) ? 3 : 2;
    g.append('line')
      .attr('x1', parentX)
      .attr('y1', parentY + nodeRadius)
      .attr('x2', chunkX)
      .attr('y2', chunkY - nodeRadius)
      .attr('stroke', lineColor)
      .attr('stroke-width', lineWidth)
      .attr('stroke-dasharray', '3 2');
  });
  
  // Add search result info - only show when we've reached a chunk
  const hasReachedChunk = questionAnsweringState.searchPath.some(p => p.level === 'chunks');
  if (hasReachedChunk) {
    g.append('text')
      .attr('x', width / 2)
      .attr('y', height - 30)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', '600')
      .style('fill', '#28a745')
      .text('✓ Found relevant chunk: Infectious Disease & Treatment');
    
    g.append('text')
      .attr('x', width / 2)
      .attr('y', height - 15)
      .attr('text-anchor', 'middle')
      .style('font-size', '11px')
      .style('fill', '#666')
      .text('Contains: Remdesivir, Antiviral therapy');
  }
}

function renderChunkGraph(g, width, height) {
  // Get the chunk graph data from entityExtractionData
  const chunkANodes = entityExtractionData.nodes.filter(n => n.chunk === 'A');
  const chunkALinks = entityExtractionData.links.filter(l => 
    chunkANodes.some(n => n.id === l.source) && chunkANodes.some(n => n.id === l.target)
  );
  
  // Layout positions for the graph
  const nodePositions = {
    covid19: { x: width / 2, y: height / 2 - 60 },
    remdesivir: { x: width / 2 - 80, y: height / 2 },
    respiratory: { x: width / 2 + 80, y: height / 2 }
  };
  
  const nodeRadius = 25;
  
  // Draw links first
  chunkALinks.forEach(link => {
    const sourcePos = nodePositions[link.source];
    const targetPos = nodePositions[link.target];
    
    g.append('line')
      .attr('x1', sourcePos.x)
      .attr('y1', sourcePos.y)
      .attr('x2', targetPos.x)
      .attr('y2', targetPos.y)
      .attr('stroke', '#666')
      .attr('stroke-width', 3)
      .attr('marker-end', 'url(#arrowhead)');
    
    // Add link label
    const midX = (sourcePos.x + targetPos.x) / 2;
    const midY = (sourcePos.y + targetPos.y) / 2;
    
    g.append('text')
      .attr('x', midX)
      .attr('y', midY - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('fill', '#666')
      .style('font-weight', '600')
      .text(link.label);
  });
  
  // Draw nodes
  chunkANodes.forEach(node => {
    const pos = nodePositions[node.id];
    const nodeColor = entityNodeTypeColors[node.type] || '#666';
    
    g.append('circle')
      .attr('cx', pos.x)
      .attr('cy', pos.y)
      .attr('r', nodeRadius)
      .attr('fill', nodeColor)
      .attr('fill-opacity', 0.8)
      .attr('stroke', '#333')
      .attr('stroke-width', 2)
      .attr('cursor', 'pointer')
      .on('mouseover', (event) => showChunkGraphTooltip(event, node))
      .on('mouseout', hideTooltip);
    
    // Add node label
    g.append('text')
      .attr('x', pos.x)
      .attr('y', pos.y + 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '11px')
      .style('font-weight', '600')
      .style('fill', '#fff')
      .text(node.acronym)
      .attr('pointer-events', 'none');
  });
  
  // Add answer text
  g.append('text')
    .attr('x', width / 2)
    .attr('y', height - 60)
    .attr('text-anchor', 'middle')
    .style('font-size', '12px')
    .style('font-weight', '600')
    .style('fill', '#28a745')
    .text('Generated Answer:');
  
  // Wrap the answer text
  const wrapText = (text, width, lineHeight = 14) => {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];
    
    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine + ' ' + word;
      // Estimate character width (average 6.5px per character for 11px font)
      const testWidth = testLine.length * 6.5;
      
      if (testWidth > width - 20) { // 20px padding
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);
    
    return lines;
  };
  
  const wrappedLines = wrapText(questionAnsweringData.answerRefinement.chunkLevel.answer, width - 40);
  const lineHeight = 14;
  
  // Draw each line of the wrapped text
  wrappedLines.forEach((line, i) => {
    g.append('text')
      .attr('x', width / 2)
      .attr('y', height - 40 + (i * lineHeight))
      .attr('text-anchor', 'middle')
      .style('font-size', '11px')
      .style('fill', '#333')
      .text(line);
  });
}

function renderAnswerRefinement(g, width, height) {
  const nodeRadius = 20;
  const levelSpacing = 80;
  const nodeSpacing = 120;
  
  // Level 2 (Top) - Medical Therapeutics
  const level2Meta = graphTaggingData.metaTags.level2[0];
  const level2X = width / 2;
  const level2Y = 60;
  
  const isLevel2Refined = questionAnsweringState.currentRefinementLevel === 'level2';
  
  // Draw level 2 node
  g.append('circle')
    .attr('cx', level2X)
    .attr('cy', level2Y)
    .attr('r', nodeRadius)
    .attr('fill', isLevel2Refined ? '#ff9800' : level2Meta.color)
    .attr('fill-opacity', 0.8)
    .attr('stroke', isLevel2Refined ? '#e65100' : '#333')
    .attr('stroke-width', isLevel2Refined ? 3 : 2)
    .attr('cursor', 'pointer')
    .on('mouseover', (event) => showRefinementTooltip(event, level2Meta, 'level2'))
    .on('mouseout', hideTooltip);
  
  // Add level 2 label
  g.append('text')
    .attr('x', level2X)
    .attr('y', level2Y + 5)
    .attr('text-anchor', 'middle')
    .style('font-size', '12px')
    .style('font-weight', '600')
    .style('fill', '#fff')
    .text('MT')
    .attr('pointer-events', 'none');
  
  // Level 1 (Middle) - Meta tags
  const level1Metas = graphTaggingData.metaTags.level1;
  level1Metas.forEach((meta, i) => {
    const level1X = width / 2 + (i === 0 ? -nodeSpacing/2 : nodeSpacing/2);
    const level1Y = level2Y + levelSpacing;
    
    const isLevel1Refined = questionAnsweringState.currentRefinementLevel === 'level1';
    
    // Draw level 1 node
    g.append('circle')
      .attr('cx', level1X)
      .attr('cy', level1Y)
      .attr('r', nodeRadius)
      .attr('fill', isLevel1Refined ? '#ff9800' : meta.color)
      .attr('fill-opacity', 0.8)
      .attr('stroke', isLevel1Refined ? '#e65100' : '#333')
      .attr('stroke-width', isLevel1Refined ? 3 : 2)
      .attr('cursor', 'pointer')
      .on('mouseover', (event) => showRefinementTooltip(event, meta, 'level1'))
      .on('mouseout', hideTooltip);
    
    // Add level 1 label
    g.append('text')
      .attr('x', level1X)
      .attr('y', level1Y + 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', '600')
      .style('fill', '#fff')
      .text(getAcronym(meta))
      .attr('pointer-events', 'none');
    
    // Draw connection line
    g.append('line')
      .attr('x1', level2X)
      .attr('y1', level2Y + nodeRadius)
      .attr('x2', level1X)
      .attr('y2', level1Y - nodeRadius)
      .attr('stroke', '#666')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '3 2');
  });
  
  // Level 0 (Bottom) - Chunks
  const chunks = Object.values(graphTaggingData.chunks);
  chunks.forEach((chunk, i) => {
    const chunkX = width / 2 + (i === 0 ? -nodeSpacing/2 : nodeSpacing/2);
    const chunkY = level2Y + 2 * levelSpacing;
    
    const isChunkRefined = questionAnsweringState.currentRefinementLevel === 'chunkLevel';
    
    // Draw chunk node
    g.append('circle')
      .attr('cx', chunkX)
      .attr('cy', chunkY)
      .attr('r', nodeRadius)
      .attr('fill', isChunkRefined ? '#ff9800' : chunk.color)
      .attr('fill-opacity', 0.8)
      .attr('stroke', isChunkRefined ? '#e65100' : '#333')
      .attr('stroke-width', isChunkRefined ? 3 : 2)
      .attr('cursor', 'pointer')
      .on('mouseover', (event) => showRefinementTooltip(event, chunk, 'chunkLevel'))
      .on('mouseout', hideTooltip);
    
    // Add chunk label
    g.append('text')
      .attr('x', chunkX)
      .attr('y', chunkY + 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', '600')
      .style('fill', '#fff')
      .text(getAcronym(chunk))
      .attr('pointer-events', 'none');
    
    // Draw connection line
    const parentMeta = level1Metas[i];
    const parentX = width / 2 + (i === 0 ? -nodeSpacing/2 : nodeSpacing/2);
    const parentY = level2Y + levelSpacing;
    
    g.append('line')
      .attr('x1', parentX)
      .attr('y1', parentY + nodeRadius)
      .attr('x2', chunkX)
      .attr('y2', chunkY - nodeRadius)
      .attr('stroke', '#666')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '3 2');
  });
  
  // Add refined answer text
  if (questionAnsweringState.currentRefinementLevel) {
    const refinementData = questionAnsweringData.answerRefinement[questionAnsweringState.currentRefinementLevel];
    
    g.append('text')
      .attr('x', width / 2)
      .attr('y', height - 60)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', '600')
      .style('fill', '#ff9800')
      .text('Refined Answer:');
    
    // Wrap the answer text
    const wrapText = (text, width, lineHeight = 14) => {
      const words = text.split(' ');
      const lines = [];
      let currentLine = words[0];
      
      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const testLine = currentLine + ' ' + word;
        // Estimate character width (average 6.5px per character for 11px font)
        const testWidth = testLine.length * 6.5;
        
        if (testWidth > width - 20) { // 20px padding
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      lines.push(currentLine);
      
      return lines;
    };
    
    const wrappedLines = wrapText(refinementData.answer, width - 40);
    const lineHeight = 14;
    const totalHeight = wrappedLines.length * lineHeight;
    
    // Draw each line of the wrapped text
    wrappedLines.forEach((line, i) => {
      g.append('text')
        .attr('x', width / 2)
        .attr('y', height - 40 + (i * lineHeight))
        .attr('text-anchor', 'middle')
        .style('font-size', '11px')
        .style('fill', '#333')
        .text(line);
    });
  }
}

function showSearchTooltip(event, node, isMatched) {
  hideTooltip();
  const tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('position', 'absolute')
    .style('background', 'rgba(0,0,0,0.92)')
    .style('color', 'white')
    .style('padding', '12px 16px')
    .style('border-radius', '6px')
    .style('font-size', '13px')
    .style('pointer-events', 'none')
    .style('z-index', 1000)
    .style('box-shadow', '0 2px 8px rgba(0,0,0,0.3)')
    .style('max-width', '300px');
  
  let tooltipContent = `<div style="margin-bottom: 8px;"><strong>${node.name || node.label}</strong></div>`;
  
  if (isMatched) {
    const searchStep = questionAnsweringState.searchPath.find(p => 
      (p.level === 'chunks' && p.nodeId === node.id) ||
      (p.level === 'level1' && p.nodeId === node.id) ||
      (p.level === 'level2' && p.nodeId === node.id)
    );
    
    tooltipContent += `<div style="margin-bottom: 6px; color: #ffc107;"><strong>✓ Search Match</strong></div>`;
    tooltipContent += `<div style="margin-bottom: 4px; color: #90caf9;">Reason: ${searchStep.reason}</div>`;
  }
  
  if (node.tags) {
    tooltipContent += `<div style="margin-bottom: 4px; color: #90caf9;">Tags (${node.tags.length})</div>`;
    node.tags.forEach(tag => {
      tooltipContent += `<div style="margin: 2px 0; padding: 2px 0; border-bottom: 1px solid #444;">`;
      tooltipContent += `<span style="color: #90caf9;">${tag.type}:</span> ${tag.value}`;
      tooltipContent += `<div style="font-size: 11px; color: #b3e5fc; font-style: italic; margin-top: 2px;">${tag.description}</div>`;
      tooltipContent += `</div>`;
    });
  }
  
  tooltip.html(tooltipContent)
    .style('left', (event.pageX + 12) + 'px')
    .style('top', (event.pageY - 10) + 'px');
}

function showChunkGraphTooltip(event, node) {
  hideTooltip();
  const tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('position', 'absolute')
    .style('background', 'rgba(0,0,0,0.92)')
    .style('color', 'white')
    .style('padding', '12px 16px')
    .style('border-radius', '6px')
    .style('font-size', '13px')
    .style('pointer-events', 'none')
    .style('z-index', 1000)
    .style('box-shadow', '0 2px 8px rgba(0,0,0,0.3)')
    .style('max-width', '300px');
  
  let tooltipContent = `<div style="margin-bottom: 8px;"><strong>${node.label}</strong></div>`;
  tooltipContent += `<div style="margin-bottom: 4px; color: #90caf9;">Type: ${node.type}</div>`;
  tooltipContent += `<div style="margin-bottom: 4px; color: #90caf9;">Chunk: ${node.chunk}</div>`;
  tooltipContent += `<div style="margin-bottom: 4px; color: #b3e5fc; font-style: italic;">${node.context}</div>`;
  
  tooltip.html(tooltipContent)
    .style('left', (event.pageX + 12) + 'px')
    .style('top', (event.pageY - 10) + 'px');
}

function showRefinementTooltip(event, node, level) {
  hideTooltip();
  const tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('position', 'absolute')
    .style('background', 'rgba(0,0,0,0.92)')
    .style('color', 'white')
    .style('padding', '12px 16px')
    .style('border-radius', '6px')
    .style('font-size', '13px')
    .style('pointer-events', 'none')
    .style('z-index', 1000)
    .style('box-shadow', '0 2px 8px rgba(0,0,0,0.3)')
    .style('max-width', '300px');
  
  let tooltipContent = `<div style="margin-bottom: 8px;"><strong>${node.name || node.label}</strong></div>`;
  tooltipContent += `<div style="margin-bottom: 6px; color: #ff9800;"><strong>Answer Refinement Level</strong></div>`;
  
  const refinementData = questionAnsweringData.answerRefinement[level];
  if (refinementData) {
    tooltipContent += `<div style="margin-bottom: 4px; color: #90caf9;">Refined Answer:</div>`;
    tooltipContent += `<div style="margin-bottom: 4px; color: #b3e5fc; font-style: italic;">${refinementData.answer}</div>`;
    
    if (refinementData.metaTags) {
      tooltipContent += `<div style="margin-bottom: 4px; color: #90caf9;">Meta Tags Used:</div>`;
      refinementData.metaTags.forEach(tag => {
        tooltipContent += `<div style="margin: 2px 0; color: #b3e5fc;">• ${tag}</div>`;
      });
    }
  }
  
  tooltip.html(tooltipContent)
    .style('left', (event.pageX + 12) + 'px')
    .style('top', (event.pageY - 10) + 'px');
}

function setupQuestionAnsweringControls() {
  const controls = d3.select('#qa-controls');
  controls.html('');
  
  const searchBtn = controls.append('button')
    .text('Start Search')
    .style('padding', '8px 16px')
    .style('background', '#007bff')
    .style('color', 'white')
    .style('border', 'none')
    .style('border-radius', '4px')
    .style('font-size', '14px')
    .style('cursor', 'pointer')
    .on('click', () => {
      animateSearchProcess();
    });
  
  const resetBtn = controls.append('button')
    .text('Reset')
    .style('padding', '8px 16px')
    .style('background', '#6c757d')
    .style('color', 'white')
    .style('border', 'none')
    .style('border-radius', '4px')
    .style('font-size', '14px')
    .style('cursor', 'pointer')
    .style('margin-left', '8px')
    .on('click', () => {
      questionAnsweringState.searchPath = [];
      questionAnsweringState.animationPhase = 'search';
      questionAnsweringState.currentRefinementLevel = null;
      createQuestionAnsweringViz();
    });
}

function animateSearchProcess() {
  // Reset the state
  questionAnsweringState.searchPath = [];
  questionAnsweringState.animationPhase = 'search';
  questionAnsweringState.currentRefinementLevel = null;
  
  // Get the search path from the data
  const searchPath = questionAnsweringData.searchPath;
  let currentStep = 0;
  
  const highlightNext = () => {
    if (currentStep < searchPath.length) {
      const step = searchPath[currentStep];
      // Add the current step to the search path
      questionAnsweringState.searchPath.push(step);
      
      // Update the visualization to highlight the current step
      createQuestionAnsweringViz();
      currentStep++;
      setTimeout(highlightNext, 1500);
    } else {
      // Search complete, move to graph phase
      setTimeout(() => {
        questionAnsweringState.animationPhase = 'graph';
        createQuestionAnsweringViz();
        
        // After showing graph, move to refinement phase
        setTimeout(() => {
          questionAnsweringState.animationPhase = 'refinement';
          animateAnswerRefinement();
        }, 3000);
      }, 1000);
    }
  };
  
  // Start the animation
  highlightNext();
}

function animateAnswerRefinement() {
  // Start from chunk level and work up
  const refinementLevels = ['chunkLevel', 'level1', 'level2'];
  let currentLevelIndex = 0;
  
  const refineNext = () => {
    if (currentLevelIndex < refinementLevels.length) {
      questionAnsweringState.currentRefinementLevel = refinementLevels[currentLevelIndex];
      createQuestionAnsweringViz();
      currentLevelIndex++;
      setTimeout(refineNext, 2000);
    }
  };
  
  refineNext();
}