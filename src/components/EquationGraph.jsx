import React, { useEffect, useRef, useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  useTheme, 
  IconButton, 
  Tooltip,
  ButtonGroup,
  Button
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RestoreIcon from '@mui/icons-material/Restore';
import GridOnIcon from '@mui/icons-material/GridOn';
import StraightIcon from '@mui/icons-material/Straight';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot';
import ImageIcon from '@mui/icons-material/Image';
import * as d3 from 'd3';
import useMediaQuery from '@mui/material/useMediaQuery';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

const EquationGraph = ({ equation, solutions, onAddToHistory }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Estados
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [showAxis, setShowAxis] = useState(true);
  const [showPoints, setShowPoints] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 400, height: 400 });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Efecto para manejar el tamaño responsivo
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const newWidth = Math.min(containerWidth - 40, 600); // 40px para padding
        setDimensions({
          width: newWidth,
          height: isMobile ? newWidth * 0.8 : newWidth // Proporción diferente en móvil
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [isMobile]);

  // Componente de controles mejorado para móvil
  const Controls = () => (
    <>
      {isMobile && (
        <Box sx={{ 
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
          zIndex: 1000,
          p: 2,
          display: mobileMenuOpen ? 'block' : 'none',
          maxHeight: '60vh',
          overflowY: 'auto',
          boxShadow: '0px -2px 10px rgba(0,0,0,0.1)'
        }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: 2 
          }}>
            {/* Cabecera con título y botón cerrar */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 1 
            }}>
              <Typography variant="h6">
                Controles
              </Typography>
              <IconButton 
                onClick={() => setMobileMenuOpen(false)}
                size="small"
              >
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Grupo de Zoom */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Zoom</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                <Button
                  fullWidth
                  startIcon={<ZoomInIcon />}
                  onClick={() => handleZoom('in')}
                  variant="outlined"
                >
                  Aumentar
                </Button>
                <Button
                  fullWidth
                  startIcon={<ZoomOutIcon />}
                  onClick={() => handleZoom('out')}
                  variant="outlined"
                >
                  Reducir
                </Button>
                <Button
                  fullWidth
                  startIcon={<RestoreIcon />}
                  onClick={() => handleZoom('reset')}
                  variant="outlined"
                >
                  Reset
                </Button>
              </Box>
            </Box>

            {/* Grupo de Visualización */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Visualización</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                <Button
                  fullWidth
                  startIcon={<GridOnIcon />}
                  onClick={() => setShowGrid(!showGrid)}
                  variant={showGrid ? "contained" : "outlined"}
                >
                  Grid
                </Button>
                <Button
                  fullWidth
                  startIcon={<StraightIcon />}
                  onClick={() => setShowAxis(!showAxis)}
                  variant={showAxis ? "contained" : "outlined"}
                >
                  Ejes
                </Button>
                <Button
                  fullWidth
                  startIcon={<ScatterPlotIcon />}
                  onClick={() => setShowPoints(!showPoints)}
                  variant={showPoints ? "contained" : "outlined"}
                >
                  Puntos
                </Button>
              </Box>
            </Box>

            {/* Grupo de Exportar */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Exportar</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                <Button
                  fullWidth
                  startIcon={<DownloadIcon />}
                  onClick={handleDownload}
                  variant="outlined"
                >
                  SVG
                </Button>
                <Button
                  fullWidth
                  startIcon={<ImageIcon />}
                  onClick={handleDownloadPNG}
                  variant="outlined"
                >
                  PNG
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </>
  );

  const parseEquation = (eq) => {
    // Manejar sistemas de ecuaciones
    if (eq.includes(';')) {
      return eq.split(';').map(e => ({
        type: 'system',
        equation: e.trim(),
        original: e.trim()
      }));
    }

    // Para ecuaciones simples, convertirlas a forma estándar (todo a la izquierda)
    const sides = eq.split('=');
    return [{
      type: 'single',
      equation: `${sides[0]}-${sides[1]}`,
      original: eq
    }];
  };

  const evaluateEquation = (x, expr) => {
    // Convertir la expresión a forma estándar ax + b = 0
    const terms = expr.match(/[+-]?\d*x|[+-]?\d+/g) || [];
    let a = 0, b = 0;
    
    terms.forEach(term => {
      if (term.includes('x')) {
        const coef = term.replace('x', '') || '1';
        a += parseFloat(coef);
      } else {
        b += parseFloat(term);
      }
    });

    // Retornar el valor de y para cada x
    return -b/a;
  };

  const parseSystemEquation = (eq) => {
    const sides = eq.split('=');
    const left = sides[0].trim();
    const right = parseFloat(sides[1].trim());
    
    let a = 0, b = 0;
    left.split(/([+-])/).forEach((term, i, arr) => {
      if (term.includes('x')) {
        const coef = term.replace('x', '') || '1';
        a = parseFloat(arr[i-1] === '-' ? `-${coef}` : coef);
      } else if (term.includes('y')) {
        const coef = term.replace('y', '') || '1';
        b = parseFloat(arr[i-1] === '-' ? `-${coef}` : coef);
      }
    });
    
    return { a, b, c: right };
  };

  const generatePoints = (equations) => {
    const { width, height } = dimensions; // Obtener dimensiones del estado
    const points = {};
    const xMin = -10 * zoom;
    const xMax = 10 * zoom;
    const step = (xMax - xMin) / width; // Usar width para calcular el paso

    equations.forEach((eq, index) => {
      points[index] = [];
      
      if (eq.type === 'system') {
        // Para sistemas de ecuaciones
        for (let x = xMin; x <= xMax; x += step) {
          const y = evaluateEquation(x, eq.equation);
          if (!isNaN(y) && isFinite(y) && Math.abs(y) <= 10 * zoom) {
            points[index].push([x, y]);
          }
        }
      } else {
        // Para ecuaciones simples
        for (let x = xMin; x <= xMax; x += step) {
          const y = evaluateEquation(x, eq.equation);
          if (!isNaN(y) && isFinite(y) && Math.abs(y) <= 10 * zoom) {
            points[index].push([x, y]);
          }
        }
      }
    });
    return points;
  };

  const handleZoom = (action) => {
    switch(action) {
      case 'in':
        setZoom(prev => Math.min(prev * 1.2, 5));
        break;
      case 'out':
        setZoom(prev => Math.max(prev / 1.2, 0.5));
        break;
      case 'reset':
        setZoom(1);
        break;
      default:
        break;
    }
  };

  const handleDownload = () => {
    const svgData = svgRef.current.outerHTML;
    const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = 'grafico_ecuacion.svg';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handleDownloadPNG = () => {
    if (!svgRef.current) return;
    
    const { width, height } = dimensions; // Obtener dimensiones del estado
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const img = new Image();

    // Configurar canvas
    canvas.width = width * 2; // Usar width del estado
    canvas.height = height * 2; // Usar height del estado
    context.scale(2, 2);
    
    // Crear Blob del SVG
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      // Fondo blanco para PNG
      context.fillStyle = theme.palette.background.default;
      context.fillRect(0, 0, width, height); // Usar dimensiones del estado
      
      // Dibujar SVG en canvas
      context.drawImage(img, 0, 0, width, height); // Usar dimensiones del estado
      
      // Descargar PNG
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = 'grafico.png';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Limpiar
      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  useEffect(() => {
    if (!svgRef.current || !equation) return;

    // Obtener dimensiones del estado
    const { width, height } = dimensions;

    d3.select(svgRef.current).selectAll('*').remove();
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Contenedor principal con clip-path
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Definir clip-path para contener el zoom
    svg.append('defs')
      .append('clipPath')
      .attr('id', 'zoom-clip')
      .append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight);

    // Grupo principal con transformación
    const mainGroup = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Grupo para elementos zoomables
    const zoomGroup = mainGroup.append('g')
      .attr('clip-path', 'url(#zoom-clip)');

    const equations = parseEquation(equation);
    const allPoints = generatePoints(equations);

    if (Object.values(allPoints).every(points => points.length === 0)) {
      mainGroup.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight / 2)
        .attr('text-anchor', 'middle')
        .style('fill', theme.palette.text.primary)
        .text('No se puede graficar esta ecuación');
      return;
    }

    const xDomain = [-10 * zoom, 10 * zoom];
    const yDomain = [-10 * zoom, 10 * zoom];

    const xScale = d3.scaleLinear()
      .domain(xDomain)
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain(yDomain)
      .range([innerHeight, 0]);

    // Función mejorada para dibujar grid y ejes
    const drawGridAndAxes = (transform) => {
      const scaledX = transform ? transform.rescaleX(xScale) : xScale;
      const scaledY = transform ? transform.rescaleY(yScale) : yScale;

      // Limpiar grid y ejes existentes
      mainGroup.selectAll('.grid, .axis').remove();

      if (showGrid) {
        // Grid
        const xGrid = d3.axisBottom(scaledX)
          .tickSize(-innerHeight)
          .tickFormat('')
          .ticks(20);

        const yGrid = d3.axisLeft(scaledY)
          .tickSize(-innerWidth)
          .tickFormat('')
          .ticks(20);

        zoomGroup.append('g')
          .attr('class', 'grid x-grid')
          .attr('transform', `translate(0,${innerHeight})`)
          .call(xGrid)
          .style('stroke', theme.palette.divider)
          .style('stroke-opacity', 0.1);

        zoomGroup.append('g')
          .attr('class', 'grid y-grid')
          .call(yGrid)
          .style('stroke', theme.palette.divider)
          .style('stroke-opacity', 0.1);
      }

      if (showAxis) {
        // Ejes
        mainGroup.append('g')
          .attr('class', 'axis x-axis')
          .attr('transform', `translate(0,${innerHeight/2})`)
          .call(d3.axisBottom(scaledX))
          .style('color', theme.palette.text.primary);

        mainGroup.append('g')
          .attr('class', 'axis y-axis')
          .attr('transform', `translate(${innerWidth/2},0)`)
          .call(d3.axisLeft(scaledY))
          .style('color', theme.palette.text.primary);

        // Etiquetas
        mainGroup.append('text')
          .attr('class', 'axis-label')
          .attr('x', innerWidth)
          .attr('y', innerHeight/2 - 10)
          .attr('text-anchor', 'end')
          .text('x')
          .style('fill', theme.palette.text.primary);

        mainGroup.append('text')
          .attr('class', 'axis-label')
          .attr('x', innerWidth/2 + 10)
          .attr('y', 10)
          .attr('text-anchor', 'start')
          .text('y')
          .style('fill', theme.palette.text.primary);
      }
    };

    // Zoom behavior mejorado para táctil
    const zoomBehavior = d3.zoom()
      .scaleExtent([0.5, 5])
      .translateExtent([[0, 0], [width, height]])
      .extent([[0, 0], [width, height]])
      .touchable(true)
      .on('zoom', (event) => {
        const transform = event.transform;
        zoomGroup.attr('transform', transform);
        drawGridAndAxes(transform);
        zoomGroup.selectAll('.equation-line, .solution-point')
          .attr('transform', transform);
      });

    if (isMobile) {
      zoomBehavior
        .filter(event => {
          // Mejorar detección de gestos táctiles
          if (event.type === 'touchstart' || event.type === 'touchmove') {
            return event.touches.length === 1;
          }
          return !event.button && !event.ctrlKey;
        })
        .wheelDelta(event => {
          return -event.deltaY * (event.deltaMode === 1 ? 0.05 : event.deltaMode ? 1 : 0.002);
        });
    }

    // Aplicar zoom
    svg.call(zoomBehavior);

    // Dibujar grid y ejes iniciales
    drawGridAndAxes();

    // Dibujar ecuaciones
    Object.values(allPoints).forEach((points, index) => {
      const line = d3.line()
        .x(d => xScale(d[0]))
        .y(d => yScale(d[1]))
        .curve(d3.curveMonotoneX);

      zoomGroup.append('path')
        .datum(points)
        .attr('class', 'equation-line')
        .attr('fill', 'none')
        .attr('stroke', index === 0 ? theme.palette.primary.main : theme.palette.secondary.main)
        .attr('stroke-width', 2)
        .attr('d', line);
    });

    // Puntos de solución
    if (showPoints && solutions) {
      solutions.forEach(sol => {
        if (sol.type === 'real' || sol.type === 'system') {
          const x = parseFloat(sol.x);
          const y = sol.y ? parseFloat(sol.y) : 0;

          const point = zoomGroup.append('g')
            .attr('class', 'solution-point');

          point.append('circle')
            .attr('cx', xScale(x))
            .attr('cy', yScale(y))
            .attr('r', 5)
            .attr('fill', theme.palette.secondary.main)
            .attr('stroke', theme.palette.background.paper)
            .attr('stroke-width', 2);

          // Tooltip mejorado
          const tooltip = point.append('g')
            .attr('class', 'tooltip')
            .style('opacity', 0)
            .attr('pointer-events', 'none');

          tooltip.append('rect')
            .attr('x', xScale(x) + 10)
            .attr('y', yScale(y) - 30)
            .attr('width', 100)
            .attr('height', 25)
            .attr('fill', theme.palette.background.paper)
            .attr('stroke', theme.palette.divider)
            .attr('rx', 4);

          tooltip.append('text')
            .attr('x', xScale(x) + 15)
            .attr('y', yScale(y) - 12)
            .text(`(${x.toFixed(2)}, ${y.toFixed(2)})`)
            .style('fill', theme.palette.text.primary);

          point
            .on('mouseover', () => {
              tooltip.transition()
                .duration(200)
                .style('opacity', 1);
            })
            .on('mouseout', () => {
              tooltip.transition()
                .duration(200)
                .style('opacity', 0);
            });
        }
      });
    }

    // Agregar la ecuación al historial
    if (onAddToHistory) {
      onAddToHistory({
        operation: equation,
        type: 'graph',
        timestamp: new Date(),
        isFavorite: false
      });
    }

  }, [equation, solutions, theme, zoom, showGrid, showAxis, showPoints, dimensions, isMobile, onAddToHistory]);

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 2,
        mt: 2, 
        backgroundColor: 'background.paper',
        position: 'relative',
        height: isMobile ? '85vh' : 'auto',
        overflow: 'hidden'
      }}
      ref={containerRef}
    >
      {/* Controles de escritorio */}
      {!isMobile && (
        <Box sx={{ 
          display: 'flex', 
          gap: 1, 
          mb: 2,
          alignItems: 'center'
        }}>
          <Typography variant="h6">
            Representación gráfica
          </Typography>

          <Box sx={{ 
            display: 'flex', 
            gap: 1,
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
            flex: 1
          }}>
            <ButtonGroup size={isMobile ? "medium" : "small"} 
                        orientation={isMobile ? "horizontal" : "horizontal"}>
              <Tooltip title="Aumentar zoom">
                <IconButton onClick={() => handleZoom('in')}>
                  <ZoomInIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Reducir zoom">
                <IconButton onClick={() => handleZoom('out')}>
                  <ZoomOutIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Restaurar zoom">
                <IconButton onClick={() => handleZoom('reset')}>
                  <RestoreIcon />
                </IconButton>
              </Tooltip>
            </ButtonGroup>

            <ButtonGroup size={isMobile ? "medium" : "small"}>
              <Tooltip title="Mostrar/Ocultar cuadrícula">
                <IconButton onClick={() => setShowGrid(!showGrid)}>
                  <GridOnIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Mostrar/Ocultar ejes">
                <IconButton onClick={() => setShowAxis(!showAxis)}>
                  <StraightIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Mostrar/Ocultar puntos">
                <IconButton onClick={() => setShowPoints(!showPoints)}>
                  <ScatterPlotIcon />
                </IconButton>
              </Tooltip>
            </ButtonGroup>

            <ButtonGroup size={isMobile ? "medium" : "small"}>
              <Tooltip title="Descargar SVG">
                <IconButton onClick={handleDownload}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Descargar PNG">
                <IconButton onClick={handleDownloadPNG}>
                  <ImageIcon />
                </IconButton>
              </Tooltip>
            </ButtonGroup>
          </Box>
        </Box>
      )}

      {/* Contenedor del gráfico */}
      <Box sx={{ 
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        position: 'relative',
        touchAction: 'none',
        height: '100%',
        '& svg': {
          maxWidth: '100%',
          height: '100%',
          cursor: 'grab',
          '&:active': {
            cursor: 'grabbing'
          }
        }
      }}>
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          style={{
            backgroundColor: theme.palette.background.default
          }}
        />
      </Box>

      {/* Solo el botón móvil */}
      {isMobile && (
        <IconButton
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            width: 48,
            height: 48,
            bgcolor: theme.palette.primary.main,
            color: 'white',
            '&:hover': { bgcolor: theme.palette.primary.dark },
            zIndex: theme.zIndex.drawer + 1,
            boxShadow: theme.shadows[4]
          }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <MenuIcon />
        </IconButton>
      )}

      {/* Solo los controles móviles */}
      <Controls />
    </Paper>
  );
};

export default EquationGraph;