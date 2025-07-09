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
  'graph-construction': 4
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

function showEdgeTooltip(event, d) {
  hideTooltip();
  const src = entityExtractionData.nodes.find(n => n.id === d.source);
  const tgt = entityExtractionData.nodes.find(n => n.id === d.target);
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
    <strong>${d.label}</strong><br/>
    <span style='color:#90caf9'>${src ? src.label : d.source}</span> → <span style='color:#f48fb1'>${tgt ? tgt.label : d.target}</span>
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
  initSlideNavigation() // Initialize slide navigation
  
  // Handle window resize
  window.addEventListener('resize', scroller.resize)
}) 