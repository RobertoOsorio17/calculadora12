import React, { useEffect, useRef, useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  useTheme, 
  IconButton, 
  Tooltip,
  ButtonGroup,
  Button,
  Slider,
  Divider,
  Grid
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

const EquationGraph = ({ 
  equation, 
  solutions, 
  onAddToHistory, 
  onMenuOpenChange,
  showCalculatorButtons = false 
}) => {
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
  const [showGuideLines, setShowGuideLines] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);

  // Agregar dimensiones del margen como constante
  const MARGIN = { top: 20, right: 20, bottom: 30, left: 40 };
  
  // Función auxiliar para calcular dimensiones internas
  const getInnerDimensions = (width, height) => ({
    innerWidth: width - MARGIN.left - MARGIN.right,
    innerHeight: height - MARGIN.top - MARGIN.bottom
  });

  // Efecto para manejar el tamaño responsivo
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight;
        
        // Ajustar dimensiones según el dispositivo
        const newWidth = Math.min(containerWidth - (isMobile ? 20 : 40), 600);
        const newHeight = isMobile 
          ? Math.min(containerHeight - 100, newWidth * 0.8) // Más compacto en móvil
          : Math.min(containerHeight - 40, newWidth);
        
        setDimensions({
          width: newWidth,
          height: newHeight
        });
      }
    };

    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, [isMobile]);

  const MobileControls = () => (
    <Box sx={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      bgcolor: 'background.paper',
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      boxShadow: 3,
      p: 2,
      zIndex: 1200,
      transform: mobileMenuOpen ? 'translateY(0)' : 'translateY(100%)',
      transition: 'transform 0.3s ease-in-out',
      maxHeight: '50vh',
      overflowY: 'auto',
      mb: showCalculatorButtons ? 8 : 0
    }}>
      <Grid container spacing={2}>
        {/* Botones de control */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            Controles
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={3}>
              <Button
                fullWidth
                variant={showGrid ? "contained" : "outlined"}
                onClick={() => setShowGrid(!showGrid)}
                size="small"
              >
                Grid
              </Button>
            </Grid>
            <Grid item xs={3}>
              <Button
                fullWidth
                variant={showAxis ? "contained" : "outlined"}
                onClick={() => setShowAxis(!showAxis)}
                size="small"
              >
                Ejes
              </Button>
            </Grid>
            <Grid item xs={3}>
              <Button
                fullWidth
                variant={showPoints ? "contained" : "outlined"}
                onClick={() => setShowPoints(!showPoints)}
                size="small"
              >
                Puntos
              </Button>
            </Grid>
            <Grid item xs={3}>
              <Button
                fullWidth
                variant={showGuideLines ? "contained" : "outlined"}
                onClick={() => setShowGuideLines(!showGuideLines)}
                size="small"
              >
                Guías
              </Button>
            </Grid>
          </Grid>
        </Grid>

        {/* Control de zoom */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            Zoom
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton size="small" onClick={() => setZoom(Math.max(zoom - 0.5, 0.5))}>
              <ZoomOutIcon />
            </IconButton>
            <Slider
              value={zoom}
              min={0.5}
              max={5}
              step={0.5}
              onChange={(_, value) => setZoom(value)}
              sx={{ flex: 1 }}
            />
            <IconButton size="small" onClick={() => setZoom(Math.min(zoom + 0.5, 5))}>
              <ZoomInIcon />
            </IconButton>
          </Box>
        </Grid>

        {/* Nuevo grupo de botones para descarga */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            Descargar
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => handleDownload('svg')}
                size="small"
              >
                SVG
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<ImageIcon />}
                onClick={() => handleDownload('png')}
                size="small"
              >
                PNG
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );

  const DesktopControls = () => (
    <Paper
      elevation={2}
      sx={{
        position: 'absolute',
        top: 16,
        right: 16,
        p: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        bgcolor: 'background.paper',
        borderRadius: 2,
        '& .MuiButtonGroup-root': {
          boxShadow: 'none'
        }
      }}
    >
      <ButtonGroup orientation="vertical" size="small">
        <Tooltip title="Zoom +" placement="left">
          <Button onClick={() => setZoom(Math.min(zoom + 0.5, 5))}>
            <ZoomInIcon />
          </Button>
        </Tooltip>
        <Tooltip title="Zoom -" placement="left">
          <Button onClick={() => setZoom(Math.max(zoom - 0.5, 0.5))}>
            <ZoomOutIcon />
          </Button>
        </Tooltip>
        <Tooltip title="Restablecer zoom" placement="left">
          <Button onClick={() => setZoom(1)}>
            <RestoreIcon />
          </Button>
        </Tooltip>
      </ButtonGroup>

      <Divider />

      <ButtonGroup orientation="vertical" size="small">
        <Tooltip title="Mostrar/ocultar cuadrícula" placement="left">
          <Button 
            onClick={() => setShowGrid(!showGrid)}
            variant={showGrid ? "contained" : "outlined"}
          >
            <GridOnIcon />
          </Button>
        </Tooltip>
        <Tooltip title="Mostrar/ocultar ejes" placement="left">
          <Button 
            onClick={() => setShowAxis(!showAxis)}
            variant={showAxis ? "contained" : "outlined"}
          >
            <StraightIcon />
          </Button>
        </Tooltip>
        <Tooltip title="Mostrar/ocultar puntos" placement="left">
          <Button 
            onClick={() => setShowPoints(!showPoints)}
            variant={showPoints ? "contained" : "outlined"}
          >
            <ScatterPlotIcon />
          </Button>
        </Tooltip>
        <Tooltip title="Mostrar/ocultar líneas guía" placement="left">
          <Button 
            onClick={() => setShowGuideLines(!showGuideLines)}
            variant={showGuideLines ? "contained" : "outlined"}
          >
            <GridOnIcon sx={{ transform: 'rotate(45deg)' }} />
          </Button>
        </Tooltip>
      </ButtonGroup>

      <Divider />

      <Tooltip title="Descargar SVG" placement="left">
        <Button 
          onClick={handleDownloadSVG}
          size="small"
          startIcon={<DownloadIcon />}
        >
          SVG
        </Button>
      </Tooltip>
    </Paper>
  );

  const parseEquation = (eq) => {
    if (!eq || typeof eq !== 'string') {
      return [{
        type: 'single',
        equation: '',
        original: ''
      }];
    }

    // Manejar sistemas de ecuaciones
    if (eq.includes(';')) {
      return eq.split(';').map(e => ({
        type: 'system',
        equation: e.trim(),
        original: e.trim()
      }));
    }

    // Para ecuaciones simples, convertirlas a forma estándar
    try {
      const sides = eq.split('=');
      if (sides.length !== 2) {
        throw new Error('Formato de ecuación inválido');
      }
      return [{
        type: 'single',
        equation: `${sides[0].trim()}-${sides[1].trim()}`,
        original: eq.trim()
      }];
    } catch (error) {
      console.error('Error al parsear ecuación:', error);
      return [{
        type: 'single',
        equation: '',
        original: eq
      }];
    }
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
    if (!equations || !Array.isArray(equations)) {
      return {};
    }

    return equations.reduce((acc, eq, index) => {
      try {
        const { width, height } = dimensions; // Obtener dimensiones del estado
        const points = {};
        const xMin = -10 * zoom;
        const xMax = 10 * zoom;
        const step = (xMax - xMin) / width; // Usar width para calcular el paso

        if (eq.type === 'system') {
          // Para sistemas de ecuaciones
          for (let x = xMin; x <= xMax; x += step) {
            const y = evaluateEquation(x, eq.equation);
            if (!isNaN(y) && isFinite(y) && Math.abs(y) <= 10 * zoom) {
              points[index] = [];
              points[index].push([x, y]);
            }
          }
        } else {
          // Para ecuaciones simples
          for (let x = xMin; x <= xMax; x += step) {
            const y = evaluateEquation(x, eq.equation);
            if (!isNaN(y) && isFinite(y) && Math.abs(y) <= 10 * zoom) {
              points[index] = [];
              points[index].push([x, y]);
            }
          }
        }

        return { ...acc, [index]: points };
      } catch (error) {
        console.error('Error generando puntos:', error);
        return { ...acc, [index]: [] };
      }
    }, {});
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

  const handleDownload = (format) => {
    const svg = svgRef.current;
    if (!svg) return;

    if (format === 'svg') {
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = svgUrl;
      downloadLink.download = 'grafico.svg';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(svgUrl);
    } else if (format === 'png') {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const svgData = new XMLSerializer().serializeToString(svg);
      const img = new Image();
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        canvas.width = svg.width.baseVal.value;
        canvas.height = svg.height.baseVal.value;
        context.fillStyle = theme.palette.background.default;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0);
        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = 'grafico.png';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
      };

      img.src = url;
    }
  };

  const handleDownloadSVG = () => {
    const svgData = svgRef.current.outerHTML;
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'grafico-ecuacion.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (!svgRef.current || !equation) {
      return;
    }

    try {
      const { width, height } = dimensions;
      const { innerWidth, innerHeight } = getInnerDimensions(width, height);
      
      // Limpiar SVG existente
      d3.select(svgRef.current).selectAll('*').remove();

      // Crear grupos principales
      const svg = d3.select(svgRef.current)
        .attr('width', width)
        .attr('height', height);

      const mainGroup = svg.append('g')
        .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

      const zoomGroup = mainGroup.append('g')
        .attr('clip-path', 'url(#zoom-clip)');

      // Definir clip path
      svg.append('defs')
        .append('clipPath')
        .attr('id', 'zoom-clip')
        .append('rect')
        .attr('width', innerWidth)
        .attr('height', innerHeight);

      const equations = parseEquation(equation);
      if (!equations || equations.length === 0) {
        console.error('No se pudo parsear la ecuación');
        return;
      }

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
            if (event.type === 'touchstart' || event.type === 'touchmove' || event.type === 'touchend') {
              return event.touches.length === 2; // Permitir zoom con dos dedos
            }
            return !event.button;
          })
          .touchable(true)
          .wheelDelta(event => {
            const delta = event.deltaY * -0.002;
            return Math.abs(delta) > 0.01 ? delta : 0; // Reducir sensibilidad
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
      if (onAddToHistory && typeof onAddToHistory === 'function') {
        try {
          const operationString = typeof equation === 'object' 
            ? JSON.stringify(equation)
            : equation.toString();
          
          onAddToHistory({
            operation: operationString,
            type: 'graph',
            timestamp: new Date().toISOString(),
            isFavorite: false
          });
        } catch (error) {
          console.error('Error al agregar al historial:', error);
        }
      }

      if (showGuideLines && selectedPoint) {
        const [x, y] = selectedPoint;
        
        // Línea vertical
        zoomGroup.append('line')
          .attr('class', 'guide-line')
          .attr('x1', xScale(x))
          .attr('y1', 0)
          .attr('x2', xScale(x))
          .attr('y2', innerHeight)
          .style('stroke', theme.palette.primary.main)
          .style('stroke-dasharray', '4,4')
          .style('stroke-width', 1)
          .style('opacity', 0.5);

        // Línea horizontal
        zoomGroup.append('line')
          .attr('class', 'guide-line')
          .attr('x1', 0)
          .attr('y1', yScale(y))
          .attr('x2', innerWidth)
          .attr('y2', yScale(y))
          .style('stroke', theme.palette.primary.main)
          .style('stroke-dasharray', '4,4')
          .style('stroke-width', 1)
          .style('opacity', 0.5);
      }

    } catch (error) {
      console.error('Error al procesar la ecuación:', error);
    }
  }, [equation, solutions, theme, zoom, showGrid, showAxis, showPoints, dimensions, isMobile, onAddToHistory]);

  useEffect(() => {
    if (onMenuOpenChange) {
      onMenuOpenChange(mobileMenuOpen);
    }
  }, [mobileMenuOpen, onMenuOpenChange]);

  return (
    <Paper 
      ref={containerRef}
      elevation={0}
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        pb: isMobile ? 12 : 0,
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: 'background.paper',
        '& svg': {
          touchAction: 'none',
          userSelect: 'none'
        }
      }}
    >
      {/* Área del gráfico */}
      <Box sx={{ 
        flex: 1,
        overflow: 'hidden',
        touchAction: 'none'
      }}>
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          style={{
            backgroundColor: theme.palette.background.default,
            maxWidth: '100%',
            height: '100%'
          }}
        />
      </Box>

      {/* Controles específicos para móvil/desktop */}
      {isMobile ? <MobileControls /> : <DesktopControls />}

      {/* Botón flotante para móvil */}
      {isMobile && (
        <IconButton
          sx={{
            position: 'absolute',
            bottom: showCalculatorButtons ? 80 : 16,
            right: 16,
            bgcolor: 'primary.main',
            color: 'white',
            '&:hover': {
              bgcolor: 'primary.dark'
            },
            zIndex: 1300
          }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </IconButton>
      )}
    </Paper>
  );
};

export default EquationGraph;