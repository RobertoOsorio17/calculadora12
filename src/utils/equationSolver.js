const solveEquation = (equation) => {
  try {
    equation = validateEquation(equation);
    equation = equation.replace(/\s+/g, '').toLowerCase();
    
    // Normalizar notación
    equation = equation
      .replace(/\^2/g, '²')
      .replace(/\^3/g, '³')
      .replace(/sqrt/g, '√');
    
    if (equation.includes('y')) {
      if (equation.includes(';')) {
        return solveSystemOfEquations(equation);
      }
      throw new Error(
        'Una ecuación con dos variables (x,y) necesita un sistema de ecuaciones.\n' +
        'Ejemplo: 2x+3y=5; 4x-y=1'
      );
    } else if (equation.includes('x³') || equation.includes('x^3')) {
      return solveCubic(equation);
    } else if (equation.includes('x²') || equation.includes('x^2')) {
      return solveQuadratic(equation);
    } else if (equation.includes('|x|') || equation.includes('abs(x)')) {
      return solveAbsolute(equation);
    } else if (equation.includes('√') || equation.includes('sqrt')) {
      return solveSquareRoot(equation);
    } else if (equation.includes('x')) {
      return solveLinear(equation);
    }
    
    throw new Error('Formato de ecuación no reconocido');
  } catch (error) {
    throw new Error(error.message);
  }
};

const solveSystemOfEquations = (equations) => {
  try {
    // Separamos las ecuaciones
    const [eq1, eq2] = equations.split(';');
    if (!eq1 || !eq2) {
      throw new Error('Se necesitan dos ecuaciones separadas por punto y coma (;)');
    }
    
    // Extraemos coeficientes (ax + by = c)
    const coef1 = extractCoefficients(eq1);
    const coef2 = extractCoefficients(eq2);
    
    // Método de Cramer
    const determinant = coef1.a * coef2.b - coef1.b * coef2.a;
    
    if (Math.abs(determinant) < 1e-10) {
      throw new Error('El sistema no tiene solución única');
    }
    
    const x = (coef1.c * coef2.b - coef1.b * coef2.c) / determinant;
    const y = (coef1.a * coef2.c - coef1.c * coef2.a) / determinant;
    
    return [{
      x: roundToDecimals(x, 4),
      y: roundToDecimals(y, 4),
      type: 'system',
      steps: [
        'Sistema de ecuaciones:',
        `${formatEquation(coef1)} = ${coef1.c}`,
        `${formatEquation(coef2)} = ${coef2.c}`,
        'Resolviendo por método de Cramer:',
        `Determinante = ${roundToDecimals(determinant, 4)}`,
        `x = ${roundToDecimals(x, 4)}`,
        `y = ${roundToDecimals(y, 4)}`
      ]
    }];
  } catch (error) {
    throw new Error(`Error al resolver el sistema: ${error.message}`);
  }
};

const extractCoefficients = (equation) => {
  try {
    const sides = equation.split('=');
    if (sides.length !== 2) {
      throw new Error('La ecuación debe tener un signo =');
    }
    
    const left = sides[0];
    const right = sides[1];
    
    let a = 0, b = 0, c = parseFloat(right) || 0;
    
    const terms = left.match(/[+-]?\d*x|[+-]?\d*y|[+-]?\d+/g) || [];
    
    terms.forEach(term => {
      if (term.includes('x')) {
        a += term === 'x' ? 1 : term === '-x' ? -1 : parseFloat(term.replace('x', ''));
      } else if (term.includes('y')) {
        b += term === 'y' ? 1 : term === '-y' ? -1 : parseFloat(term.replace('y', ''));
      } else {
        c -= parseFloat(term);
      }
    });
    
    return { a, b, c };
  } catch (error) {
    throw new Error(`Error al extraer coeficientes: ${error.message}`);
  }
};

const roundToDecimals = (num, decimals) => {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
};

const formatEquation = (coef) => {
  const formatTerm = (coefficient, variable) => {
    if (coefficient === 0) return '';
    if (coefficient === 1) return `+${variable}`;
    if (coefficient === -1) return `-${variable}`;
    return `${coefficient > 0 ? '+' : ''}${coefficient}${variable}`;
  };

  let equation = formatTerm(coef.a, 'x');
  equation += formatTerm(coef.b, 'y');
  
  // Eliminar el + inicial si existe
  return equation.startsWith('+') ? equation.substring(1) : equation;
};

const solveLinear = (equation) => {
  try {
    let sides = equation.split('=');
    if (sides.length !== 2) throw new Error('La ecuación debe tener un signo =');
    
    let left = sides[0];
    let right = sides[1];
    
    // Mover todos los términos al lado izquierdo
    let normalizedEquation = `${left}-${right}`;
    
    // Coeficientes
    let a = 0; // coeficiente de x
    let b = 0; // término independiente
    
    // Procesamos términos
    let terms = normalizedEquation.match(/[+-]?\d*x|[+-]?\d+/g);
    if (!terms) throw new Error('Formato de ecuación inválido');
    
    terms.forEach(term => {
      if (term.includes('x')) {
        // Manejar casos como +x, -x, x
        if (term === 'x') a += 1;
        else if (term === '-x') a -= 1;
        else a += parseFloat(term.replace('x', ''));
      } else {
        b += parseFloat(term);
      }
    });
    
    if (Math.abs(a) < 1e-10) throw new Error('No es una ecuación lineal válida (coeficiente de x es 0)');
    
    const x = -b / a;
    return [{
      x: roundToDecimals(x, 4),
      type: 'real',
      steps: [
        'Ecuación lineal:',
        `${a}x + ${b} = 0`,
        `${a}x = ${-b}`,
        `x = ${roundToDecimals(x, 4)}`
      ]
    }];
  } catch (error) {
    throw new Error(`Error en ecuación lineal: ${error.message}`);
  }
};

const solveQuadratic = (equation) => {
  try {
    let a = 0, b = 0, c = 0;
    
    let sides = equation.split('=');
    if (sides.length !== 2) throw new Error('La ecuación debe tener un signo =');
    
    let left = sides[0];
    let right = sides[1];
    
    let terms = (left + '-' + right).match(/[+-]?\d*x²|[+-]?\d*x|[+-]?\d+/g);
    if (!terms) throw new Error('Formato de ecuación inválido');
    
    terms.forEach(term => {
      if (term.includes('x²')) {
        a += term === 'x²' ? 1 : term === '-x²' ? -1 : parseFloat(term.replace('x²', ''));
      } else if (term.includes('x')) {
        b += term === 'x' ? 1 : term === '-x' ? -1 : parseFloat(term.replace('x', ''));
      } else {
        c += parseFloat(term);
      }
    });
    
    if (a === 0) throw new Error('No es una ecuación cuadrática válida (coeficiente de x² es 0)');
    
    const discriminant = b * b - 4 * a * c;
    const steps = [
      'Ecuación cuadrática:',
      `${a}x² + ${b}x + ${c} = 0`,
      `Discriminante = ${discriminant}`
    ];
    
    if (discriminant > 0) {
      const x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
      const x2 = (-b - Math.sqrt(discriminant)) / (2 * a);
      steps.push(`x₁ = ${roundToDecimals(x1, 4)}`, `x₂ = ${roundToDecimals(x2, 4)}`);
      return [
        { x: roundToDecimals(x1, 4), type: 'real', steps },
        { x: roundToDecimals(x2, 4), type: 'real', steps }
      ];
    } else if (discriminant === 0) {
      const x = -b / (2 * a);
      steps.push(`x = ${roundToDecimals(x, 4)}`);
      return [{ x: roundToDecimals(x, 4), type: 'real', steps }];
    } else {
      const realPart = -b / (2 * a);
      const imagPart = Math.sqrt(-discriminant) / (2 * a);
      steps.push(
        `x₁ = ${roundToDecimals(realPart, 4)} + ${roundToDecimals(imagPart, 4)}i`,
        `x₂ = ${roundToDecimals(realPart, 4)} - ${roundToDecimals(imagPart, 4)}i`
      );
      return [
        { x: `${roundToDecimals(realPart, 4)} + ${roundToDecimals(imagPart, 4)}i`, type: 'complex', steps },
        { x: `${roundToDecimals(realPart, 4)} - ${roundToDecimals(imagPart, 4)}i`, type: 'complex', steps }
      ];
    }
  } catch (error) {
    throw new Error(`Error en ecuación cuadrática: ${error.message}`);
  }
};

// Función para resolver ecuaciones con valor absoluto
const solveAbsolute = (equation) => {
  // Normalizar la ecuación
  equation = equation.replace(/\|/g, 'abs').replace(/abs\(x\)/g, '|x|');
  const sides = equation.split('=');
  if (sides.length !== 2) throw new Error('La ecuación debe tener un signo =');
  
  // Resolver las dos posibilidades: x y -x
  const positive = equation.replace(/\|x\|/g, 'x');
  const negative = equation.replace(/\|x\|/g, '(-x)');
  
  const solutions = [
    ...solveLinear(positive),
    ...solveLinear(negative)
  ];
  
  return solutions.filter((sol, index, self) => 
    index === self.findIndex(s => Math.abs(s.x - sol.x) < 1e-10)
  );
};

// Función para resolver ecuaciones con raíz cuadrada
const solveSquareRoot = (equation) => {
  equation = equation.replace(/√/g, 'sqrt');
  const sides = equation.split('=');
  if (sides.length !== 2) throw new Error('La ecuación debe tener un signo =');
  
  // Elevar al cuadrado ambos lados
  const squared = `${sides[0]}^2=${sides[1]}^2`;
  const solutions = solveQuadratic(squared);
  
  // Verificar soluciones (pueden aparecer soluciones falsas al elevar al cuadrado)
  return solutions.filter(sol => {
    const original = equation
      .replace(/x/g, `(${sol.x})`)
      .replace(/sqrt/g, 'Math.sqrt');
    try {
      return Math.abs(eval(sides[0]) - eval(sides[1])) < 1e-10;
    } catch {
      return false;
    }
  });
};

// Función para resolver ecuaciones cúbicas
const solveCubic = (equation) => {
  try {
    equation = equation.replace(/x\^3/g, 'x³');
    const sides = equation.split('=');
    if (sides.length !== 2) throw new Error('La ecuación debe tener un signo =');
    
    let a = 0, b = 0, c = 0, d = 0;
    const terms = (sides[0] + '-' + sides[1]).match(/[+-]?\d*x³|[+-]?\d*x²|[+-]?\d*x|[+-]?\d+/g);
    
    terms.forEach(term => {
      if (term.includes('x³')) {
        a += term === 'x³' ? 1 : term === '-x³' ? -1 : parseFloat(term.replace('x³', ''));
      } else if (term.includes('x²')) {
        b += term === 'x²' ? 1 : term === '-x²' ? -1 : parseFloat(term.replace('x²', ''));
      } else if (term.includes('x')) {
        c += term === 'x' ? 1 : term === '-x' ? -1 : parseFloat(term.replace('x', ''));
      } else {
        d += parseFloat(term);
      }
    });

    if (Math.abs(a) < 1e-10) throw new Error('No es una ecuación cúbica válida (coeficiente de x³ es 0)');

    // Método de Cardano
    const p = (3 * a * c - b * b) / (3 * a * a);
    const q = (2 * b * b * b - 9 * a * b * c + 27 * a * a * d) / (27 * a * a * a);
    const D = (q * q / 4) + (p * p * p / 27);

    const steps = [
      'Ecuación cúbica:',
      `${a}x³ + ${b}x² + ${c}x + ${d} = 0`,
      'Aplicando método de Cardano:',
      `p = ${roundToDecimals(p, 4)}`,
      `q = ${roundToDecimals(q, 4)}`,
      `Discriminante = ${roundToDecimals(D, 4)}`
    ];

    let solutions = [];
    
    if (Math.abs(D) < 1e-10) {
      // Una raíz real triple o una real simple y una doble
      if (Math.abs(p) < 1e-10) {
        // Raíz triple
        const x = -b / (3 * a);
        solutions = [
          { x: roundToDecimals(x, 4), type: 'real', multiplicity: 3 }
        ];
        steps.push('Caso: Raíz triple real', `x = ${roundToDecimals(x, 4)}`);
      } else {
        // Una raíz simple y una doble
        const x1 = (3 * q) / (2 * p);
        const x2 = -x1 / 2;
        solutions = [
          { x: roundToDecimals(x1, 4), type: 'real', multiplicity: 1 },
          { x: roundToDecimals(x2, 4), type: 'real', multiplicity: 2 }
        ];
        steps.push(
          'Caso: Una raíz simple y una doble',
          `x₁ = ${roundToDecimals(x1, 4)} (multiplicidad 1)`,
          `x₂ = ${roundToDecimals(x2, 4)} (multiplicidad 2)`
        );
      }
    } else if (D > 0) {
      // Una raíz real y dos complejas conjugadas
      const u = Math.cbrt(-q/2 + Math.sqrt(D));
      const v = Math.cbrt(-q/2 - Math.sqrt(D));
      const x1 = u + v - b/(3*a);
      const realPart = -(u + v)/2 - b/(3*a);
      const imagPart = (Math.sqrt(3)/2) * (u - v);
      
      solutions = [
        { x: roundToDecimals(x1, 4), type: 'real' },
        { x: `${roundToDecimals(realPart, 4)} + ${roundToDecimals(imagPart, 4)}i`, type: 'complex' },
        { x: `${roundToDecimals(realPart, 4)} - ${roundToDecimals(imagPart, 4)}i`, type: 'complex' }
      ];
      steps.push(
        'Caso: Una raíz real y dos complejas conjugadas',
        `x₁ = ${roundToDecimals(x1, 4)}`,
        `x₂ = ${solutions[1].x}`,
        `x₃ = ${solutions[2].x}`
      );
    } else {
      // Tres raíces reales distintas
      const phi = Math.acos(-q/(2*Math.sqrt(-Math.pow(p/3, 3))));
      const r = 2 * Math.sqrt(-p/3);
      const x1 = r * Math.cos(phi/3) - b/(3*a);
      const x2 = r * Math.cos((phi + 2*Math.PI)/3) - b/(3*a);
      const x3 = r * Math.cos((phi + 4*Math.PI)/3) - b/(3*a);
      
      solutions = [
        { x: roundToDecimals(x1, 4), type: 'real' },
        { x: roundToDecimals(x2, 4), type: 'real' },
        { x: roundToDecimals(x3, 4), type: 'real' }
      ];
      steps.push(
        'Caso: Tres raíces reales distintas',
        `x₁ = ${roundToDecimals(x1, 4)}`,
        `x₂ = ${roundToDecimals(x2, 4)}`,
        `x₃ = ${roundToDecimals(x3, 4)}`
      );
    }

    solutions.forEach(sol => sol.steps = steps);
    return solutions;
  } catch (error) {
    throw new Error(`Error en ecuación cúbica: ${error.message}`);
  }
};

const validateEquation = (equation) => {
  if (!equation || typeof equation !== 'string') {
    throw new Error('La ecuación debe ser una cadena de texto válida');
  }
  
  equation = equation.trim();
  if (!equation.includes('=')) {
    throw new Error('La ecuación debe contener un signo =');
  }
  
  // Expresión regular corregida
  const validChars = /^[-+0-9x-z*/()=;,.\s√|²³^]+$/;
  if (!validChars.test(equation)) {
    throw new Error('La ecuación contiene caracteres no válidos');
  }
  
  return equation;
};

export default solveEquation; 